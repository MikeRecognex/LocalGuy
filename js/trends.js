// Trends page — renders recent arrivals, trending tags, and all-time leaderboard
const raw = document.getElementById("trend-data");
if (!raw) throw new Error("Missing #trend-data script element");

const data = JSON.parse(raw.textContent);
const { trending, recentArrivals, allTime } = data;

// Category colors (matches tag taxonomy buckets)
const catColors = {
  companies: { bar: "var(--trend-cat-company)", label: "Company" },
  models:    { bar: "var(--trend-cat-model)",   label: "Model" },
  tools:     { bar: "var(--trend-cat-tool)",    label: "Tool" },
  topics:    { bar: "var(--trend-cat-topic)",    label: "Topic" },
  semantic:  { bar: "var(--trend-cat-semantic)", label: "Topic" },
};

function getCatColor(cat) {
  return (catColors[cat] || catColors.semantic).bar;
}

// --- Recent Arrivals ---

function renderRecentArrivals() {
  const container = document.getElementById("recent-arrivals");
  if (!container) return;

  if (!recentArrivals || !recentArrivals.length) {
    container.innerHTML = `<p class="trends-empty">No new tags in the last 10 days.</p>`;
    return;
  }

  const html = recentArrivals.map((t, i) => {
    const color = getCatColor(t.category);
    const delay = i * 50;
    const catLabel = (catColors[t.category] || catColors.semantic).label;

    return `
      <a href="/tags/${t.tag}/" class="arrival-chip" style="animation-delay:${delay}ms;border-color:${color}">
        <span class="arrival-name">${t.tag}</span>
        <span class="arrival-meta">
          <span class="arrival-count">${t.count} articles</span>
          <span class="arrival-date">since ${t.firstSeen}</span>
        </span>
        <span class="arrival-cat" style="background:${color}">${catLabel}</span>
      </a>`;
  }).join("");

  container.innerHTML = html;
}

// --- Trending This Month ---

function buildSparkline(weeks, color) {
  const max = Math.max(...weeks, 1);
  const barW = 6;
  const gap = 2;
  const h = 24;
  const w = weeks.length * (barW + gap) - gap;

  let bars = "";
  weeks.forEach((v, i) => {
    const barH = Math.max(1, (v / max) * h);
    const x = i * (barW + gap);
    const y = h - barH;
    const opacity = i < 2 ? 0.35 : 0.85;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="1" fill="${color}" opacity="${opacity}"/>`;
  });

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${bars}</svg>`;
}

function velocityArrow(velocity) {
  if (velocity >= 2) return `<span class="trend-arrow trend-arrow--hot" title="Surging">&#9650;&#9650;</span>`;
  if (velocity >= 1) return `<span class="trend-arrow trend-arrow--up" title="Rising">&#9650;</span>`;
  if (velocity >= 0.5) return `<span class="trend-arrow trend-arrow--stable" title="Steady">&#9654;</span>`;
  return `<span class="trend-arrow trend-arrow--down" title="Cooling">&#9660;</span>`;
}

function renderTrending() {
  const container = document.getElementById("trending-list");
  if (!container || !trending.length) return;

  const maxScore = trending[0].score;

  const html = trending.map((t, i) => {
    const barWidth = Math.max(4, (t.score / maxScore) * 100);
    const color = getCatColor(t.category);
    const arrow = velocityArrow(t.velocity);
    const spark = buildSparkline(t.weeks, color);
    const delay = i * 40;

    return `
      <a href="/tags/${t.tag}/" class="trend-card" style="animation-delay:${delay}ms">
        <span class="trend-rank">${i + 1}</span>
        <div class="trend-bar" style="width:${barWidth}%;background:${color}"></div>
        <div class="trend-body">
          <span class="trend-tag">${t.tag}</span>
          <span class="trend-stats">
            <span class="trend-count">${t.count} this month</span>
            <span class="trend-total">${t.total} all time</span>
          </span>
        </div>
        <div class="trend-viz">
          ${spark}
          ${arrow}
        </div>
      </a>`;
  }).join("");

  container.innerHTML = html;
}

// --- All-Time Leaderboard ---

function renderAllTime() {
  const container = document.getElementById("alltime-chart");
  if (!container || !allTime.length) return;

  const maxCount = allTime[0].count;

  // Build legend from categories present
  const cats = [...new Set(allTime.map(t => t.category))];
  const legendHtml = cats.map(c => {
    const info = catColors[c] || catColors.semantic;
    return `<span class="alltime-legend-item"><span class="alltime-legend-dot" style="background:${info.bar}"></span>${info.label}</span>`;
  }).join("");

  const barsHtml = allTime.map((t, i) => {
    const barWidth = Math.max(3, (t.count / maxCount) * 100);
    const color = getCatColor(t.category);
    const delay = i * 25;

    return `
      <a href="/tags/${t.tag}/" class="alltime-row" style="animation-delay:${delay}ms">
        <span class="alltime-tag">${t.tag}</span>
        <div class="alltime-bar-track">
          <div class="alltime-bar" style="width:${barWidth}%;background:${color}"></div>
        </div>
        <span class="alltime-count">${t.count}</span>
      </a>`;
  }).join("");

  container.innerHTML = `
    <div class="alltime-legend">${legendHtml}</div>
    <div class="alltime-bars">${barsHtml}</div>
  `;
}

// --- Init ---
renderRecentArrivals();
renderTrending();
renderAllTime();
