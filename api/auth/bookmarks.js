import { parseCookies } from './_utils.js'

const GRAPHQL_URL = 'https://api.github.com/graphql'

const DISCUSSIONS_QUERY = `
query($owner: String!, $name: String!, $categoryId: ID!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    discussions(first: 100, after: $cursor, categoryId: $categoryId) {
      pageInfo { hasNextPage endCursor }
      nodes {
        title
        url
        createdAt
        reactions(first: 100) {
          nodes { user { login } content }
        }
      }
    }
  }
}`

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies.gh_token

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    // Get authenticated user
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'LocalGuy-Bookmarks' }
    })

    if (!userRes.ok) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    const userData = await userRes.json()
    const login = userData.login

    const [owner, name] = process.env.GISCUS_REPO.split('/')
    const categoryId = process.env.GISCUS_CATEGORY_ID

    // Fetch up to 2 pages of discussions
    let allNodes = []
    let cursor = null

    for (let page = 0; page < 2; page++) {
      const graphqlRes = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'LocalGuy-Bookmarks'
        },
        body: JSON.stringify({
          query: DISCUSSIONS_QUERY,
          variables: { owner, name, categoryId, cursor }
        })
      })

      const graphqlData = await graphqlRes.json()

      if (graphqlData.errors) {
        res.status(500).json({ error: 'GraphQL error', details: graphqlData.errors })
        return
      }

      const discussions = graphqlData.data.repository.discussions
      allNodes = allNodes.concat(discussions.nodes)

      if (!discussions.pageInfo.hasNextPage) break
      cursor = discussions.pageInfo.endCursor
    }

    // Filter discussions where user has reacted
    const bookmarks = allNodes
      .filter(d => d.reactions.nodes.some(r => r.user && r.user.login === login))
      .map(d => ({
        title: d.title,
        url: d.title,
        discussionUrl: d.url,
        createdAt: d.createdAt,
        reactions: d.reactions.nodes
          .filter(r => r.user && r.user.login === login)
          .map(r => r.content)
      }))

    res.status(200).json({ user: login, bookmarks })
  } catch (err) {
    console.error('Bookmarks API error:', err)
    res.status(500).json({ error: 'Failed to fetch bookmarks' })
  }
}
