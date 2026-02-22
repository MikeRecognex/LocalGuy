# Landing Page Redesign Plan

## Primary Change: Move Space Invader Grid to Left Sidebar

### Current State
- Space Invader pixel art grid (8×11 CSS grid) sits as a full-width hero at the top of the landing page
- Takes up prime vertical real estate above the fold
- Pushes actual content (recent posts, tag cloud) below the fold
- Layout is single-column, max-width 42rem

### Target State
- Space Invader grid moves to a sticky vertical sidebar on the left
- Main content area shifts right, giving users immediate access to posts
- Sidebar persists as user scrolls (sticky positioning)
- On mobile, sidebar collapses to a compact horizontal treatment

---

## Implementation Checklist

### Phase 1: Sidebar Layout (Core Change)
- [ ] Modify `content/pages/index.md` — wrap landing page in a two-column layout container
- [ ] Update `css/style.css` — add sidebar layout styles (CSS Grid or Flexbox, two-column)
- [ ] Restructure `.hero-invader` as a vertical sidebar element
- [ ] Rotate/reflow the invader grid to work in a narrow vertical column
- [ ] Make sidebar `position: sticky; top: 1rem` so it follows scroll
- [ ] Ensure "LOCAL FTW" title and tagline fit the sidebar width
- [ ] Responsive breakpoint: collapse sidebar to compact horizontal header on screens < 768px

### Phase 2: Usability Enhancements
- [ ] Move tag cloud (Trending Topics) into the sidebar below the invader grid
- [ ] Surface more recent posts (5-7 instead of 3 days' worth) in main content
- [ ] Add a "Latest Guide" featured card on the landing page
- [ ] Add a visible search input/prompt on the landing page (not just nav icon)

### Phase 3: Polish & Verification
- [ ] Test light mode and dark mode
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Verify Pagefind search still works correctly
- [ ] Check accessibility (ARIA labels, keyboard nav, screen readers)
- [ ] Visual review — does it still feel cohesive with the retro aesthetic?
- [ ] Performance check — no layout shift or reflow issues

---

## Technical Details

### Files to Modify
| File | Changes |
|------|---------|
| `content/pages/index.md` | Restructure HTML into sidebar + main content layout |
| `css/style.css` | Add two-column layout, sidebar styles, responsive breakpoints |

### Layout Structure (Target)
```
┌──────────────────────────────────────────────────┐
│ Header (Navigation)                              │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  SIDEBAR   │  MAIN CONTENT                      │
│  (sticky)  │                                     │
│            │  🔍 Search posts...                 │
│  Invader   │                                     │
│  Grid      │  Recent Posts (5-7 posts)           │
│  (vertical)│  - Title, Date, Description         │
│            │  - Title, Date, Description         │
│  LOCAL FTW │  - ...                              │
│            │                                     │
│  Trending  │  [All Posts →]                      │
│  Topics    │                                     │
│  (tags)    │  Featured Guide                     │
│            │  - Latest guide card                │
│            │                                     │
├────────────┴─────────────────────────────────────┤
│ Footer                                           │
└──────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────┐
│ Header (Navigation)     │
├─────────────────────────┤
│ Compact Invader + Title │
├─────────────────────────┤
│ 🔍 Search posts...     │
├─────────────────────────┤
│ Recent Posts            │
├─────────────────────────┤
│ Featured Guide          │
├─────────────────────────┤
│ Trending Topics         │
├─────────────────────────┤
│ Footer                  │
└─────────────────────────┘
```

### CSS Approach
- Use CSS Grid on the landing page: `grid-template-columns: 200px 1fr`
- Sidebar: `position: sticky; top: 1rem; align-self: start`
- Media query at 768px to switch to single-column stack
- Max-width on body may need to increase from 42rem to ~56rem for the landing page only

---

## Design Principles
- **Simplicity First** — No JS frameworks, pure CSS layout
- **Minimal Impact** — Only touch landing page; post/guide pages unchanged
- **Retro Aesthetic** — Keep the pixel art feel, mono fonts, green accent
- **Performance** — No additional dependencies or assets
