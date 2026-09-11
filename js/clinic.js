const form = document.getElementById('clinic-form')
const textarea = document.getElementById('clinic-question')
const charCount = document.getElementById('clinic-char-count')
const submitBtn = document.getElementById('clinic-submit')
const loadingEl = document.getElementById('clinic-loading')
const errorEl = document.getElementById('clinic-error')
const resultEl = document.getElementById('clinic-result')
const answerEl = document.getElementById('clinic-answer')
const sourceList = document.getElementById('clinic-source-list')
const remainingEl = document.getElementById('clinic-remaining')
const remainingCount = document.getElementById('clinic-remaining-count')
const ratingEl = document.getElementById('clinic-rating')
const ratingThanks = document.getElementById('clinic-rating-thanks')
const ratingBtns = document.querySelectorAll('.clinic-rating-btn')

// Id of the answer currently on screen. Null until one is rendered, and cleared
// on each new question so a rating can never be filed against a stale answer.
let currentAnswerId = null

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function formatAnswer(text) {
  // Escape HTML first, then apply formatting
  let safe = escapeHtml(text)
  // Bold reference markers [1], [2], etc.
  safe = safe.replace(/\[(\d+)\]/g, '<strong class="clinic-ref">[$1]</strong>')
  // Convert newlines to paragraphs
  safe = safe.split(/\n{2,}/).map(p => `<p>${p.trim()}</p>`).join('')
  // Single newlines to <br>
  safe = safe.replace(/\n/g, '<br>')
  return safe
}

// Character counter
textarea.addEventListener('input', () => {
  charCount.textContent = `${textarea.value.length} / 500`
})

function resetRating() {
  currentAnswerId = null
  ratingEl.hidden = true
  ratingThanks.hidden = true
  ratingBtns.forEach((b) => {
    b.disabled = false
    b.classList.remove('is-chosen')
  })
}

ratingBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!currentAnswerId) return
    const rating = Number(btn.dataset.rating)

    // Acknowledge immediately and settle the control. The vote is advisory, so
    // the reply is not worth making anyone wait for.
    ratingBtns.forEach((b) => { b.disabled = true })
    btn.classList.add('is-chosen')
    ratingThanks.hidden = false

    // Deliberately silent on failure: a rating that did not record is not worth
    // showing an error for, and an error here would read as a problem with the
    // answer itself.
    fetch('/api/clinic/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentAnswerId, rating })
    }).catch(() => {})
  })
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const question = textarea.value.trim()
  if (!question || question.length < 5) return

  // Reset UI state
  errorEl.hidden = true
  resultEl.hidden = true
  loadingEl.hidden = false
  submitBtn.disabled = true
  resetRating()

  try {
    const res = await fetch('/api/clinic/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })

    // Update remaining count
    const remaining = res.headers.get('X-RateLimit-Remaining')
    if (remaining !== null) {
      remainingCount.textContent = remaining
      remainingEl.hidden = false
    }

    // Error responses aren't always JSON (platform-level failures return
    // plain text), so parse defensively rather than throwing into the
    // catch block below, which would misreport a server error as a network one
    let data = null
    try {
      data = await res.json()
    } catch {}

    if (!res.ok) {
      errorEl.textContent = data?.error || `Server error (${res.status}). Please try again.`
      errorEl.hidden = false
      return
    }

    if (!data) {
      errorEl.textContent = 'Unexpected response from server. Please try again.'
      errorEl.hidden = false
      return
    }

    // Render answer
    answerEl.innerHTML = formatAnswer(data.answer)

    // Render sources
    sourceList.innerHTML = ''
    if (data.sources && data.sources.length > 0) {
      data.sources.forEach(src => {
        // Only allow safe URL schemes (relative paths or https)
        if (!src.url?.match(/^(\/[^/]|https:\/\/)/)) return
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.href = src.url
        a.textContent = src.title
        li.appendChild(a)
        sourceList.appendChild(li)
      })
    }

    // Only offer a rating when there is an id to file it against. An older
    // deployment, or a logging outage, returns none.
    currentAnswerId = typeof data.id === 'string' ? data.id : null
    ratingEl.hidden = currentAnswerId === null

    resultEl.hidden = false
  } catch (err) {
    errorEl.textContent = 'Network error. Please check your connection and try again.'
    errorEl.hidden = false
  } finally {
    loadingEl.hidden = true
    submitBtn.disabled = false
  }
})
