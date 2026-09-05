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

// Gap between touching circles.
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

const LABEL_MIN_COUNT = 5;
// Labels are held at a constant size on screen and counter-scaled against the
// zoom, so these are screen pixels, not layout units.
const LABEL_PX = 11;
const LABEL_OFFSET_PX = 12;
// Clear space demanded around a label before it counts as non-colliding.
const LABEL_GAP = 2;
let labelledIds = new Set();
// Last applied zoom transform, needed to test labels against the viewport edge.
let viewTransform = zoomIdentity;

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

// Hold labels at a constant size on screen whatever the zoom. dy is a layout
// distance but the gap below the circle should be a screen distance, hence the
// division: at zoom k the label lands rScale(count)*k + LABEL_OFFSET_PX from the
// node centre on screen, regardless of k.
function applyLabelScale(k) {
  if (!nodeSel) return;
  nodeSel.select("text")
    .attr("font-size", `${LABEL_PX / k}px`)
    .attr("dy", d => rScale(d.count) + LABEL_OFFSET_PX / k);
}

// Which labels are legible depends on the zoom, not on the tag's rank: at a wide
// view only the big well-separated tags have room, and zooming in should reveal
// the rest rather than leaving them permanently hidden. So decide by collision
// at the current scale — walk the tags largest-first and keep every label that
// does not overlap one already kept. Because every label is scaled by the same
// factor, testing overlap in layout units gives the same answer as testing it in
// screen pixels. Dropped labels still appear on hover, so nothing is unreachable.
function declutterLabels() {
  if (!nodeSel) return;
  const placed = [];
  const keep = new Set();
  const entries = nodeSel.nodes()
    .map((el) => ({ el, d: select(el).datum() }))
    .filter(({ d }) => d.count >= LABEL_MIN_COUNT)
    .sort((a, b) => b.d.count - a.d.count);

  const width = container.clientWidth;
  const height = container.clientHeight;
  const { k, x: tx, y: ty } = viewTransform;

  for (const { el, d } of entries) {
    const bb = el.querySelector("text").getBBox();
    const box = {
      x1: d.x + bb.x - LABEL_GAP,
      y1: d.y + bb.y - LABEL_GAP,
      x2: d.x + bb.x + bb.width + LABEL_GAP,
      y2: d.y + bb.y + bb.height + LABEL_GAP,
    };
    // A label the viewport cuts in half is worse than no label, and once the
    // opening zoom hits its floor the frame no longer guarantees they all fit.
    if (box.x1 * k + tx < 0 || box.x2 * k + tx > width) continue;
    if (box.y1 * k + ty < 0 || box.y2 * k + ty > height) continue;
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

// Set by rebuildGraph, consumed once by the simulation's "end" handler.
let pendingFit = false;

function rebuildGraph() {
  pendingFit = true;
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
  const filteredNodes = allNodes
    .filter(n => connectedIds.has(n.id) && !hiddenCategories.has(n.category))
    .map(n => ({ ...n }));

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Deep-copy edges with string IDs (d3 replaces with object refs)
  const edgeCopies = filteredEdges.map(e => ({
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

  // The layout runs at a fixed, comfortable scale — 80px between linked nodes,
  // full-size circles — however many nodes there are, and the view is then zoomed
  // to fit in fitToView(). Previously the layout was squeezed into container
  // coordinates instead, which meant more nodes could only be bought by making
  // every node smaller. That was the wrong trade: the graph pans and zooms, so
  // the container is a viewport onto the layout, not a box the layout must fit.
  simulation = forceSimulation(filteredNodes)
    .force("link", forceLink(edgeCopies).id(d => d.id).distance(80).strength(d => d.weight / maxWeight * 0.5))
    .force("charge", forceManyBody().strength(-150))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide().radius(d => rScale(d.count) + COLLIDE_PAD))
    // A weak tether so disconnected components do not drift apart indefinitely
    // under charge alone, which would shrink the fit until everything is a dot.
    // Too weak to pull the clusters together.
    .force("x", forceX(width / 2).strength(0.02))
    .force("y", forceY(height / 2).strength(0.02))
    .on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    })
    // Dragging a node also reheats the simulation, and re-framing the view every
    // time someone lets go of a node — undoing whatever they had zoomed to — is
    // worse than leaving it be. Only the rebuild that armed the flag gets a fit.
    .on("end", () => {
      if (!pendingFit) return;
      pendingFit = false;
      fitToView();
    });
}

// --- Zoom ---

// Frame the settled layout in the container. This is what lets the layout run at
// its natural size: the weight slider changes how many nodes there are, and the
// view scales to suit rather than the nodes being shrunk to fit a fixed box.
const FIT_PAD = 8;
// Fraction of nodes allowed to fall outside the opening frame at each edge, and
// the scale that frame may not go below.
const FIT_QUANTILE = 0.04;
const FIT_MIN_SCALE = 0.3;

function quantile(sorted, q) {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

// Frame where the nodes actually are, not their absolute extremes. A force
// layout flings a handful of weakly-connected tags a long way out, and fitting
// to those shrinks the dense middle — the part worth looking at — into an
// illegible speck while the labels that win the declutter are the outliers,
// because they are the only ones with room. Trimming a few per cent from each
// edge frames the mass instead; the strays are still there to pan to.
function fitBounds(includeLabels) {
  const data = nodeSel.data();
  const xs = data.map(d => d.x).sort((a, b) => a - b);
  const ys = data.map(d => d.y).sort((a, b) => a - b);
  const pad = rScale(maxCount) + FIT_PAD;
  let x0 = quantile(xs, FIT_QUANTILE) - pad;
  let x1 = quantile(xs, 1 - FIT_QUANTILE) + pad;
  let y0 = quantile(ys, FIT_QUANTILE) - pad;
  let y1 = quantile(ys, 1 - FIT_QUANTILE) + pad;

  if (includeLabels) {
    const [lx0, ly0, lx1, ly1] = [x0, y0, x1, y1];
    nodeSel.each(function (d) {
      // Only labels inside the frame get to widen it, or a stray tag's label
      // would undo the trimming above.
      if (d.x < lx0 || d.x > lx1 || d.y < ly0 || d.y > ly1) return;
      const t = this.querySelector("text");
      if (+t.getAttribute("opacity") < 0.05) return;
      const bb = t.getBBox();
      x0 = Math.min(x0, d.x + bb.x);
      y0 = Math.min(y0, d.y + bb.y);
      x1 = Math.max(x1, d.x + bb.x + bb.width);
      y1 = Math.max(y1, d.y + bb.y + bb.height);
    });
  }
  return { x0, y0, x1, y1 };
}

function applyFit(b) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  // Never zoom past 1:1 — a handful of nodes should sit at their design size in
  // the middle of the panel, not be blown up to fill it — and never open below
  // FIT_MIN_SCALE, where nodes stop being distinguishable. Past that point the
  // opening view shows part of the graph and you pan or zoom out for the rest,
  // which is the point of having pan and zoom.
  const k = Math.max(
    FIT_MIN_SCALE,
    Math.min(1, width / (b.x1 - b.x0), height / (b.y1 - b.y0))
  );
  svg.call(
    zoomBehavior.transform,
    zoomIdentity
      .translate((width - k * (b.x0 + b.x1)) / 2, (height - k * (b.y0 + b.y1)) / 2)
      .scale(k)
  );
  return k;
}

function fitToView() {
  if (!nodeSel || !nodeSel.size()) return;
  // Two passes, because a label's size in layout units depends on the very zoom
  // being solved for. Frame the circles first to pin down the scale, resolve
  // which labels are shown at it, then widen the frame to take in the labels
  // that survived — otherwise the outermost ones are cut off by the edge.
  applyLabelScale(applyFit(fitBounds(false)));
  declutterLabels();
  applyFit(fitBounds(true));
}

// Lower bound has to clear the fit scale of the densest view (~0.2 for the full
// tag set in the homepage panel) or fitToView's transform would be clamped.
const zoomBehavior = zoom()
  .scaleExtent([0.1, 8])
  .on("zoom", (event) => {
    viewTransform = event.transform;
    g.attr("transform", event.transform);
    applyLabelScale(event.transform.k);
    scheduleDeclutter();
  });
svg.call(zoomBehavior);

// Decluttering is O(n²) in visible labels, so it must not run on every frame of
// a pinch or wheel gesture. Labels keep their previous visibility during the
// gesture — they are already at the right screen size — and resolve on the next
// idle frame.
let declutterHandle = 0;
function scheduleDeclutter() {
  cancelAnimationFrame(declutterHandle);
  declutterHandle = requestAnimationFrame(declutterLabels);
}

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
