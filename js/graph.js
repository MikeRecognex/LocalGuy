// Topic co-occurrence graph — force-directed d3 visualization
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY }
  from "https://esm.sh/d3-force@3";
import { select, selectAll } from "https://esm.sh/d3-selection@3";
import { zoom, zoomIdentity } from "https://esm.sh/d3-zoom@3";
import { drag } from "https://esm.sh/d3-drag@3";
import { scaleSqrt } from "https://esm.sh/d3-scale@4";

const graphData = await fetch("/graph-data.json").then(r => r.json());

// Deep-copy originals for re-filtering
const allNodes = graphData.nodes.map(n => ({ ...n }));
const allEdges = graphData.edges.map(e => ({ ...e }));

// Category colors (reuse CSS vars from trends page)
const catConfig = {
  companies: { color: "var(--trend-cat-company)", label: "Company" },
  models:    { color: "var(--trend-cat-model)",   label: "Model" },
  tools:     { color: "var(--trend-cat-tool)",    label: "Tool" },
  topics:    { color: "var(--trend-cat-topic)",   label: "Topic" },
  semantic:  { color: "var(--trend-cat-topic)",    label: "Topic" },
};

// Resolve CSS variable to actual color for SVG (CSS vars don't work in all SVG contexts)
function resolveColor(cssVar) {
  const temp = document.createElement("div");
  temp.style.color = cssVar;
  document.body.appendChild(temp);
  const resolved = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  return resolved;
}

const catColors = {};
for (const [cat, conf] of Object.entries(catConfig)) {
  catColors[cat] = resolveColor(conf.color);
}

function getColor(category) {
  return catColors[category] || catColors.semantic;
}

// --- Legend ---
const hiddenCategories = new Set();
function renderLegend() {
  const container = document.getElementById("graph-legend");
  // Deduplicate by label so "topics" and "semantic" both show as one "Topic" chip
  const seen = new Set();
  const legendItems = [];
  for (const c of [...new Set(allNodes.map(n => n.category))]) {
    const conf = catConfig[c] || catConfig.semantic;
    if (seen.has(conf.label)) continue;
    seen.add(conf.label);
    // Collect all category keys that share this label
    const cats = Object.entries(catConfig).filter(([, v]) => v.label === conf.label).map(([k]) => k);
    legendItems.push({ cats, label: conf.label, color: catColors[c] });
  }
  container.innerHTML = legendItems.map(item => {
    const active = !item.cats.every(c => hiddenCategories.has(c));
    return `<button class="graph-legend-chip${active ? "" : " graph-legend-chip--off"}" data-cats="${item.cats.join(",")}">
      <span class="graph-legend-dot" style="background:${item.color}"></span>${item.label}
    </button>`;
  }).join("");

  container.querySelectorAll(".graph-legend-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const cats = btn.dataset.cats.split(",");
      const allHidden = cats.every(c => hiddenCategories.has(c));
      for (const c of cats) {
        if (allHidden) hiddenCategories.delete(c);
        else hiddenCategories.add(c);
      }
      renderLegend();
      rebuildGraph();
    });
  });
}

// --- SVG Setup ---
const container = document.getElementById("graph-container");
const svg = select("#graph-svg");
const g = svg.append("g");

let simulation;

// Node size scale
const maxCount = Math.max(...allNodes.map(n => n.count), 1);
const rScale = scaleSqrt().domain([1, maxCount]).range([4, 24]);

// Gap between touching circles. Shared by the collide force and the density
// budget in rebuildGraph, which must agree or the budget under-counts.
const COLLIDE_PAD = 4;

// Tooltip
const tooltip = document.getElementById("graph-tooltip");
function showTooltip(event, d) {
  const conf = catConfig[d.category] || catConfig.semantic;
  tooltip.innerHTML = `<strong>${d.id}</strong><br>${d.count} articles<br><span style="color:${catColors[d.category]}">${conf.label}</span>`;
  tooltip.style.opacity = 1;
  tooltip.style.left = event.pageX + 12 + "px";
  tooltip.style.top = event.pageY - 12 + "px";
}
function hideTooltip() {
  tooltip.style.opacity = 0;
}

// Label visibility threshold
const LABEL_MIN_COUNT = 5;

// --- Search highlight state ---
// Highlighting dims rather than removes: a co-occurrence graph is only
// meaningful with its context intact.
let highlightQuery = "";
let matchedIds = new Set();   // nodes whose name contains the query
let inFocusIds = new Set();   // matches plus their direct neighbours

// Current render state, needed to re-apply highlighting without a re-simulation
let nodeSel = null;
let linkSel = null;
let currentEdges = [];
let currentMaxWeight = 1;

const endId = (x) => (typeof x === "object" && x !== null ? x.id : x);

function labelOpacity(d) {
  if (highlightQuery) return inFocusIds.has(d.id) ? 0.9 : 0;
  return d.count >= LABEL_MIN_COUNT ? 0.9 : 0;
}

function nodeOpacity(d) {
  if (!highlightQuery) return 1;
  if (matchedIds.has(d.id)) return 1;
  return inFocusIds.has(d.id) ? 0.75 : 0.12;
}

function linkOpacity(d) {
  const base = 0.2 + 0.6 * (d.weight / currentMaxWeight);
  if (!highlightQuery) return base;
  const s = endId(d.source);
  const t = endId(d.target);
  // Keep only edges that actually touch a match
  return matchedIds.has(s) || matchedIds.has(t) ? base : base * 0.08;
}

// Cap on how many post-derived tags a single query may highlight
const POST_TAG_LIMIT = 15;

// Post text index, fetched on first search so the landing page doesn't pay for it
let postIndex = null;
let postIndexPending = false;

function loadPostIndex() {
  if (postIndex || postIndexPending) return;
  postIndexPending = true;
  fetch("/graph-posts.json")
    .then(r => r.json())
    .then(data => {
      postIndex = data;
      // The query may have changed while this was in flight
      computeHighlight();
      applyHighlight();
    })
    .catch(() => { /* tag-name matching still works */ })
    .finally(() => { postIndexPending = false; });
}

function computeHighlight() {
  matchedIds = new Set();
  inFocusIds = new Set();
  if (!highlightQuery) return;

  // Tags whose own name matches — always an exact expression of intent
  for (const n of allNodes) {
    if (n.id.toLowerCase().includes(highlightQuery)) matchedIds.add(n.id);
  }

  // Tags belonging to posts whose title/description mentions the query.
  // Ranked by how many matching posts carry them: a broad term like "apple"
  // otherwise touches a third of the graph, which highlights nothing useful.
  if (postIndex) {
    const counts = new Map();
    for (const [text, tagIdxs] of postIndex.posts) {
      if (!text.includes(highlightQuery)) continue;
      for (const i of tagIdxs) {
        const tag = postIndex.tags[i];
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    // Drop one-off co-occurrences unless that would leave nothing
    const minCount = ranked.some(([, c]) => c >= 2) ? 2 : 1;
    for (const [tag, c] of ranked.filter(([, c]) => c >= minCount).slice(0, POST_TAG_LIMIT)) {
      matchedIds.add(tag);
    }
  }

  for (const id of matchedIds) inFocusIds.add(id);
  for (const e of currentEdges) {
    const s = endId(e.source);
    const t = endId(e.target);
    if (matchedIds.has(s)) inFocusIds.add(t);
    if (matchedIds.has(t)) inFocusIds.add(s);
  }
}

function applyHighlight() {
  if (!nodeSel || !linkSel) return;
  nodeSel.attr("opacity", nodeOpacity);
  nodeSel.select("text").attr("opacity", labelOpacity);
  linkSel.attr("stroke-opacity", linkOpacity);

  const status = document.getElementById("graph-search-status");
  if (!status) return;
  if (!highlightQuery) {
    status.textContent = "";
    return;
  }
  // Count only what is actually on screen at the current threshold
  const visible = new Set(nodeSel.data().map(n => n.id));
  const shown = [...matchedIds].filter(id => visible.has(id)).length;
  if (shown) {
    status.textContent = `${shown} topic${shown === 1 ? "" : "s"}`;
  } else if (matchedIds.size) {
    status.textContent = "no match at this threshold";
  } else {
    status.textContent = "no match";
  }
}

function rebuildGraph() {
  const minWeight = parseInt(document.getElementById("weight-slider").value, 10);

  // Filter edges by weight threshold and hidden categories
  const filteredEdges = allEdges.filter(e => {
    if (e.weight < minWeight) return false;
    const sNode = allNodes.find(n => n.id === e.source);
    const tNode = allNodes.find(n => n.id === e.target);
    if (!sNode || !tNode) return false;
    if (hiddenCategories.has(sNode.category) || hiddenCategories.has(tNode.category)) return false;
    return true;
  });

  // Only include connected nodes
  const connectedIds = new Set();
  for (const e of filteredEdges) {
    connectedIds.add(e.source);
    connectedIds.add(e.target);
  }
  const candidateNodes = allNodes
    .filter(n => connectedIds.has(n.id) && !hiddenCategories.has(n.category))
    .map(n => ({ ...n }));

  const width = container.clientWidth;
  const height = container.clientHeight;

  // A force layout always spreads to fill its box, so the thing that decides
  // whether the graph is readable is not the forces but how much of the box the
  // nodes themselves occupy. Unfiltered, the collision discs covered 76% of the
  // container — past the jamming point for circle packing (0.907), so nodes had
  // literally nowhere to go and the labels sat on top of each other. Keep the
  // highest-count tags until the discs use a quarter of the box and drop the
  // long tail. This is deliberately a function of container area, so the small
  // homepage panel shows fewer tags than the full-page graph without either one
  // needing to know which it is.
  const TARGET_PACK = 0.25;
  const budget = TARGET_PACK * width * height;
  const discArea = n => Math.PI * Math.pow(rScale(n.count) + COLLIDE_PAD, 2);
  const ranked = [...candidateNodes].sort((a, b) => b.count - a.count);
  const keptIds = new Set();
  let used = 0;
  for (const n of ranked) {
    const a = discArea(n);
    if (used + a > budget && keptIds.size) break;
    used += a;
    keptIds.add(n.id);
  }

  // Re-derive edges against the kept set, then drop anything the pruning left
  // stranded — an isolated node in a co-occurrence graph carries no information.
  const keptEdges = filteredEdges.filter(e => keptIds.has(e.source) && keptIds.has(e.target));
  const stillConnected = new Set();
  for (const e of keptEdges) {
    stillConnected.add(e.source);
    stillConnected.add(e.target);
  }
  const filteredNodes = candidateNodes.filter(n => stillConnected.has(n.id));

  // Deep-copy edges with string IDs (d3 replaces with object refs)
  const edgeCopies = keptEdges.map(e => ({
    source: e.source,
    target: e.target,
    weight: e.weight,
  }));

  // Clear existing
  g.selectAll("*").remove();
  if (simulation) simulation.stop();

  if (!filteredNodes.length) {
    nodeSel = null;
    linkSel = null;
    currentEdges = [];
    return;
  }

  // Max edge weight for opacity scaling
  const maxWeight = Math.max(...edgeCopies.map(e => e.weight), 1);
  currentEdges = edgeCopies;
  currentMaxWeight = maxWeight;
  computeHighlight();

  // Links
  const link = g.append("g")
    .attr("class", "graph-links")
    .selectAll("line")
    .data(edgeCopies)
    .join("line")
    .attr("stroke", "var(--color-muted)")
    .attr("stroke-opacity", linkOpacity)
    .attr("stroke-width", d => 0.5 + 2 * (d.weight / maxWeight));

  // Node groups
  const node = g.append("g")
    .attr("class", "graph-nodes")
    .selectAll("g")
    .data(filteredNodes)
    .join("g")
    .attr("cursor", "pointer")
    .on("mouseover", (event, d) => showTooltip(event, d))
    .on("mouseout", hideTooltip)
    .on("click", (event, d) => {
      window.location.href = `/tags/${d.id}/`;
    })
    .attr("opacity", nodeOpacity);

  // Circles
  node.append("circle")
    .attr("r", d => rScale(d.count))
    .attr("fill", d => getColor(d.category))
    .attr("stroke", "var(--color-bg)")
    .attr("stroke-width", 1.5);

  // Labels (always visible for large nodes)
  node.append("text")
    .text(d => d.id)
    .attr("dy", d => rScale(d.count) + 12)
    .attr("text-anchor", "middle")
    .attr("fill", "var(--color-text)")
    .attr("font-size", "11px")
    .attr("pointer-events", "none")
    .attr("opacity", labelOpacity);

  // Show labels on hover for any node whose label is currently hidden
  node.on("mouseover.label", function(event, d) {
    select(this).select("text").attr("opacity", 0.9);
  }).on("mouseout.label", function(event, d) {
    select(this).select("text").attr("opacity", labelOpacity(d));
  });

  // Drag behavior
  const dragBehavior = drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  node.call(dragBehavior);

  nodeSel = node;
  linkSel = link;
  applyHighlight();

  // Force simulation
  simulation = forceSimulation(filteredNodes)
    .force("link", forceLink(edgeCopies).id(d => d.id).distance(80).strength(d => d.weight / maxWeight * 0.5))
    .force("charge", forceManyBody().strength(-150))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide().radius(d => rScale(d.count) + COLLIDE_PAD))
    // forceCenter only shifts the centre of mass; it does nothing to stop the
    // cloud drifting past the edges, which clipped the outer labels. These pull
    // each node individually toward the middle. Weak on purpose: with the density
    // budget above doing the real work there is room to spare, so this only has
    // to stop outliers wandering out of frame, not compress the layout.
    .force("x", forceX(width / 2).strength(0.08))
    .force("y", forceY(height / 2).strength(0.08))
    .on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
}

// --- Zoom ---
const zoomBehavior = zoom()
  .scaleExtent([0.3, 4])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });
svg.call(zoomBehavior);

// --- Weight slider ---
const slider = document.getElementById("weight-slider");
const weightLabel = document.getElementById("weight-value");
slider.addEventListener("input", () => {
  weightLabel.textContent = slider.value;
  rebuildGraph();
});

// --- Search (highlight, not filter) ---
const searchInput = document.getElementById("graph-search");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    highlightQuery = searchInput.value.trim().toLowerCase();
    if (highlightQuery) loadPostIndex();
    computeHighlight();
    applyHighlight();
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      highlightQuery = "";
      computeHighlight();
      applyHighlight();
    }
  });
}

// --- Init ---
renderLegend();
rebuildGraph();

// Re-resolve colors on scheme change (dark mode toggle)
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    for (const [cat, conf] of Object.entries(catConfig)) {
      catColors[cat] = resolveColor(conf.color);
    }
    rebuildGraph();
  });
}
