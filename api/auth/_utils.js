export function parseCookies(header) {
  if (!header) return {}
  return Object.fromEntries(header.split(';').map(c => {
    const [key, ...val] = c.trim().split('=')
    return [key, val.join('=')]
  }))
}
