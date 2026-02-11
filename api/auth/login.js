import crypto from 'node:crypto'

export default function handler(req, res) {
  const state = crypto.randomUUID()
  const clientId = process.env.GITHUB_CLIENT_ID
  const siteUrl = process.env.SITE_URL

  res.setHeader('Set-Cookie', `gh_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600`)
  res.writeHead(307, {
    Location: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(siteUrl + '/api/auth/callback')}&scope=public_repo&state=${state}`
  })
  res.end()
}
