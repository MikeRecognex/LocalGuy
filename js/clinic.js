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

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const question = textarea.value.trim()
  if (!question || question.length < 5) return

  // Reset UI state
  errorEl.hidden = true
  resultEl.hidden = true
  loadingEl.hidden = false
  submitBtn.disabled = true

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

    resultEl.hidden = false
  } catch (err) {
    errorEl.textContent = 'Network error. Please check your connection and try again.'
    errorEl.hidden = false
  } finally {
    loadingEl.hidden = true
    submitBtn.disabled = false
  }
})
