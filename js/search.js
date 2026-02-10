const overlay = document.getElementById("search-overlay");
const input = document.getElementById("search-input");
const resultsList = document.getElementById("search-results");
const liveRegion = document.getElementById("search-live");
const searchBtn = document.getElementById("search-btn");

let pagefind = null;
let selectedIndex = -1;
let debounceTimer = null;

// --- Overlay open / close ---

function openSearch() {
  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  input.value = "";
  resultsList.innerHTML = "";
  liveRegion.textContent = "";
  selectedIndex = -1;
  requestAnimationFrame(() => input.focus());
}

function closeSearch() {
  overlay.hidden = true;
  overlay.setAttribute("aria-hidden", "true");
  searchBtn.focus();
}

// --- Pagefind lazy load ---

async function loadPagefind() {
  if (pagefind) return pagefind;
  pagefind = await import("/pagefind/pagefind.js");
  await pagefind.init();
  return pagefind;
}

// --- Search ---

function debouncedSearch(query) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runSearch(query), 150);
}

async function runSearch(query) {
  if (!query.trim()) {
    resultsList.innerHTML = "";
    liveRegion.textContent = "";
    selectedIndex = -1;
    return;
  }

  const pf = await loadPagefind();
  const search = await pf.search(query);
  const results = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));

  selectedIndex = -1;
  resultsList.innerHTML = "";

  if (results.length === 0) {
    liveRegion.textContent = "No results found.";
    return;
  }

  results.forEach((result, i) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.id = `search-result-${i}`;
    li.innerHTML = `<a href="${result.url}" tabindex="-1">
      <span class="search-result-title">${result.meta.title || result.url}</span>
      <span class="search-result-excerpt">${result.excerpt || ""}</span>
    </a>`;
    resultsList.appendChild(li);
  });

  liveRegion.textContent = `${results.length} result${results.length === 1 ? "" : "s"} found.`;
}

// --- Keyboard navigation ---

function updateSelection() {
  const items = resultsList.querySelectorAll("li");
  items.forEach((item, i) => {
    if (i === selectedIndex) {
      item.classList.add("selected");
      item.scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", item.id);
    } else {
      item.classList.remove("selected");
    }
  });
  if (selectedIndex === -1) {
    input.removeAttribute("aria-activedescendant");
  }
}

// --- Event listeners ---

searchBtn.addEventListener("click", openSearch);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeSearch();
});

input.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});

input.addEventListener("keydown", (e) => {
  const items = resultsList.querySelectorAll("li");
  const count = items.length;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = count === 0 ? -1 : (selectedIndex + 1) % count;
    updateSelection();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = count === 0 ? -1 : (selectedIndex - 1 + count) % count;
    updateSelection();
  } else if (e.key === "Enter" && selectedIndex >= 0) {
    e.preventDefault();
    const link = items[selectedIndex].querySelector("a");
    if (link) window.location.href = link.href;
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeSearch();
  }
});

// Global Cmd/Ctrl+K shortcut
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    if (overlay.hidden) {
      openSearch();
    } else {
      closeSearch();
    }
  }
});
