import { parseCookies } from './_utils.js'

export default async function handler(req, res) {
  try {
    const { code, state } = req.query
    const cookies = parseCookies(req.headers.cookie)

    if (!state || state !== cookies.gh_oauth_state) {
      res.status(403).send('Invalid state parameter')
      return
    }

    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    })

    const tokenData = await tokenRes.json()
    if (tokenData.error) {
      res.setHeader('Content-Type', 'text/plain')
      res.status(403).send('OAuth error: ' + tokenData.error_description)
      return
    }

    const token = tokenData.access_token

    // Fetch username
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'LocalGuy-Bookmarks' }
    })

    if (!userRes.ok) {
      res.status(502).send('Failed to fetch user profile from GitHub')
      return
    }

    const userData = await userRes.json()

    // Set cookies and redirect
    res.setHeader('Set-Cookie', [
      `gh_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
      `gh_user=${userData.login}; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
      `gh_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0`
    ])
    res.writeHead(302, { Location: '/bookmarks/' })
    res.end()
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.status(500).send('Authentication failed. Please try again.')
  }
}
