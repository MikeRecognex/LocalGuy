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
const rBase = scaleSqrt().domain([1, maxCount]).range([4, 24]);

// Gap between touching circles, and the smallest radius still worth drawing and
// clicking. Shared by the collide force and the density fit below, which have to
// agree or the fit under-counts the space each node really needs.
const COLLIDE_PAD = 4;
const R_FLOOR = 3;

// How far radii may be scaled down to fit more tags in. Shrinking is preferable
// to discarding, but only up to a point: at much below this the nodes stop
// reading as sized circles and the graph becomes an undifferentiated dot field.
const MIN_SCALE = 0.55;

// Fraction of the container the collision discs are allowed to cover. A force
// layout always expands to fill its box, so this — not the force strengths — is
// what decides whether the graph is readable. Circle packing jams at 0.907; the
// graph was previously running at 0.76, which is why nothing had room to move.
const TARGET_PACK = 0.25;

// Set per rebuild by fitDensity(). Shrinking the nodes rather than discarding
// them keeps the weight slider in charge of how much of the graph you see.
let radiusScale = 1;
const rScale = (count) => Math.max(R_FLOOR, rBase(count) * radiusScale);

// Area budget alone is not enough at the low end of the weight slider. The long
// tail of tags is almost all small nodes, so hundreds of them fit inside the
// budget while every one of their edges still gets drawn — the box fills with a
// grey hairball of dots. Cap the count too, at roughly one node per 4000px², and
// let the density fit size whatever survives.
const NODE_AREA_PER = 4000;

// Shrink radii until the node set fits the density budget, and only start
// dropping nodes once everything is already at the smallest size worth drawing.
function fitDensity(nodes, budget) {
  const totalAt = (k) => nodes.reduce((sum, n) => {
    const r = Math.max(R_FLOOR, rBase(n.count) * k) + COLLIDE_PAD;
    return sum + Math.PI * r * r;
  }, 0);

  if (totalAt(1) <= budget) return { k: 1, keep: null };

  if (totalAt(MIN_SCALE) <= budget) {
    // Monotonic in k, so bisect rather than trying to invert the floor and pad.
    let lo = MIN_SCALE, hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (totalAt(mid) <= budget) lo = mid; else hi = mid;
    }
    return { k: lo, keep: null };
  }

  // Even at the smallest size worth drawing the set overflows, so keep the
  // highest-count tags and drop the long tail. Filling the budget with dots is
  // not a better answer than showing fewer tags: past roughly a hundred and
  // fifty nodes in this box the graph reads as a grey hairball whatever the
  // packing figure says.
  let used = 0;
  const keep = new Set();
  for (const n of [...nodes].sort((a, b) => b.count - a.count)) {
    const r = Math.max(R_FLOOR, rBase(n.count) * MIN_SCALE) + COLLIDE_PAD;
    const disc = Math.PI * r * r;
    if (used + disc > budget && keep.size) break;
    used += disc;
    keep.add(n.id);
  }
  return { k: MIN_SCALE, keep };
}

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

// Label visibility. The count threshold alone was fine when the graph showed a
// few dozen nodes; at the low end of the weight slider it puts hundreds of 11px
// labels in the box and they pile up on each other. Labels do not shrink with
// the nodes — an unreadable label is worse than no label — so they get their own
// budget, roughly one per 8000px² of container, awarded to the biggest tags.
// Everything else still names itself on hover.
const LABEL_MIN_COUNT = 5;
const LABEL_AREA_PER = 8000;
// Ring of container kept clear of node centres so edge labels are not cut off.
const LABEL_INSET = 40;
// Clear space demanded around a label before it counts as non-colliding.
const LABEL_GAP = 2;
let labelledIds = new Set();

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
  return d.count >= LABEL_MIN_COUNT && labelledIds.has(d.id) ? 0.9 : 0;
}

// The area budget above is only an opening guess, made before anything is laid
// out. It cannot know that the biggest tags are also the best connected ones, so
// they end up bunched in the middle writing over each other while the rim stays
// anonymous. Once the simulation settles, walk the tags largest-first and keep
// every label that does not collide with one already kept. Dropped labels still
// appear on hover, so nothing becomes unreachable.
function declutterLabels() {
  if (!nodeSel) return;
  const placed = [];
  const keep = new Set();
  const entries = nodeSel.nodes()
    .map((el) => ({ el, d: select(el).datum() }))
    .filter(({ d }) => d.count >= LABEL_MIN_COUNT)
    .sort((a, b) => b.d.count - a.d.count);

  for (const { el, d } of entries) {
    const bb = el.querySelector("text").getBBox();
    const box = {
      x1: d.x + bb.x - LABEL_GAP,
      y1: d.y + bb.y - LABEL_GAP,
      x2: d.x + bb.x + bb.width + LABEL_GAP,
      y2: d.y + bb.y + bb.height + LABEL_GAP,
    };
    if (placed.some((p) => box.x1 < p.x2 && p.x1 < box.x2 && box.y1 < p.y2 && p.y1 < box.y2)) continue;
    placed.push(box);
    keep.add(d.id);
  }

  labelledIds = keep;
  nodeSel.select("text").attr("opacity", labelOpacity);
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
    for (const [tag] of ranked.filter(([, c]) => c >= minCount).slice(0, POST_TAG_LIMIT)) {
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

  // Size the nodes to the box before drawing anything. Both are functions of
  // container area, so the small homepage panel and the full-page graph each
  // show as much as they can hold without either needing to know which it is.
  const ranked = [...candidateNodes].sort((a, b) => b.count - a.count);
  const shortlist = ranked.slice(0, Math.max(8, Math.round((width * height) / NODE_AREA_PER)));
  const fit = fitDensity(shortlist, TARGET_PACK * width * height);
  radiusScale = fit.k;
  const keptIds = fit.keep || new Set(shortlist.map((n) => n.id));

  labelledIds = new Set(
    candidateNodes
      .filter((n) => keptIds.has(n.id))
      .sort((a, b) => b.count - a.count)
      .slice(0, Math.max(4, Math.round((width * height) / LABEL_AREA_PER)))
      .map((n) => n.id)
  );

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

  // The link distance and charge used to be constants tuned for a few dozen
  // nodes. Once the slider can put five hundred in the same box those constants
  // describe a layout far larger than the container, and the graph spills out of
  // frame no matter how small the nodes are drawn. Spreading n nodes evenly over
  // the box gives each one a cell of side sqrt(area / n), which is the distance
  // neighbours should sit apart — and at ~46 nodes in the homepage panel it comes
  // out at 81px, i.e. the 80 that was hand-tuned here originally.
  //
  // The cloud settles into a disc rather than filling the corners, so the area
  // to divide up is the box's inscribed circle, inset to leave the outermost
  // labels somewhere to sit.
  const cloudR = Math.max(40, Math.min(width, height) / 2 - LABEL_INSET);
  const spacing = Math.sqrt((Math.PI * cloudR * cloudR) / filteredNodes.length);
  const spacingRatio = Math.min(1, spacing / 80);

  // Force simulation
  simulation = forceSimulation(filteredNodes)
    .force("link", forceLink(edgeCopies).id(d => d.id).distance(spacing).strength(d => d.weight / maxWeight * 0.5))
    .force("charge", forceManyBody().strength(-150 * spacingRatio))
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
    })
    .on("end", declutterLabels);
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
