export default function handler(req, res) {
  res.setHeader('Set-Cookie', [
    'gh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    'gh_user=; Secure; SameSite=Lax; Path=/; Max-Age=0'
  ])
  res.writeHead(302, { Location: '/bookmarks/' })
  res.end()
}
