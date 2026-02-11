const signedOut = document.getElementById('bookmarks-signed-out')
const signedIn = document.getElementById('bookmarks-signed-in')
const username = document.getElementById('bookmarks-username')
const loading = document.getElementById('bookmarks-loading')
const error = document.getElementById('bookmarks-error')
const empty = document.getElementById('bookmarks-empty')
const list = document.getElementById('bookmarks-list')
const liveRegion = document.getElementById('bookmarks-live')

const CACHE_KEY = 'lg_bookmarks'
const CACHE_TTL = 5 * 60 * 1000

const REACTION_EMOJI = {
  THUMBS_UP: '\u{1F44D}',
  THUMBS_DOWN: '\u{1F44E}',
  LAUGH: '\u{1F604}',
  HOORAY: '\u{1F389}',
  CONFUSED: '\u{1F615}',
  HEART: '\u{2764}\u{FE0F}',
  ROCKET: '\u{1F680}',
  EYES: '\u{1F440}'
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return cached.data
  } catch {
    return null
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* ignore quota errors */ }
}

function renderBookmarks(bookmarks) {
  if (bookmarks.length === 0) {
    empty.hidden = false
    liveRegion.textContent = 'No bookmarks found.'
    return
  }

  list.innerHTML = bookmarks.map(b => {
    const reactions = b.reactions
      .map(r => REACTION_EMOJI[r] || escapeHtml(r))
      .join(' ')
    return `<li>
      <a href="${escapeHtml(b.url)}">${escapeHtml(b.title)}</a>
      <span class="bookmark-reactions">${reactions}</span>
    </li>`
  }).join('')

  list.hidden = false
  liveRegion.textContent = `${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'} loaded.`
}

async function init() {
  const user = getCookie('gh_user')

  if (!user) {
    signedOut.hidden = false
    return
  }

  signedIn.hidden = false
  username.textContent = user

  // Check cache first
  const cached = getCached()
  if (cached) {
    renderBookmarks(cached)
    return
  }

  loading.hidden = false

  try {
    const res = await fetch('/api/auth/bookmarks', { credentials: 'same-origin' })

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired — show signed-out state
        loading.hidden = true
        signedIn.hidden = true
        signedOut.hidden = false
        return
      }
      throw new Error('Failed to load bookmarks')
    }

    const data = await res.json()
    loading.hidden = true
    setCache(data.bookmarks)
    renderBookmarks(data.bookmarks)
  } catch (err) {
    loading.hidden = true
    error.textContent = err.message
    error.hidden = false
  }
}

init()
