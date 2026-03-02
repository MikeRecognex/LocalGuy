// Topic co-occurrence graph — force-directed d3 visualization
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide }
  from "https://esm.sh/d3-force@3";
import { select, selectAll } from "https://esm.sh/d3-selection@3";
import { zoom, zoomIdentity } from "https://esm.sh/d3-zoom@3";
import { drag } from "https://esm.sh/d3-drag@3";
import { scaleSqrt } from "https://esm.sh/d3-scale@4";

const raw = document.getElementById("graph-data");
if (!raw) throw new Error("Missing #graph-data script element");

const graphData = JSON.parse(raw.textContent);
let { nodes, edges } = graphData;

// Deep-copy originals for re-filtering
const allNodes = nodes.map(n => ({ ...n }));
const allEdges = edges.map(e => ({ ...e }));

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
  const filteredNodes = allNodes
    .filter(n => connectedIds.has(n.id) && !hiddenCategories.has(n.category))
    .map(n => ({ ...n }));

  // Deep-copy edges with string IDs (d3 replaces with object refs)
  const edgeCopies = filteredEdges.map(e => ({
    source: e.source,
    target: e.target,
    weight: e.weight,
  }));

  // Clear existing
  g.selectAll("*").remove();
  if (simulation) simulation.stop();

  if (!filteredNodes.length) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Max edge weight for opacity scaling
  const maxWeight = Math.max(...edgeCopies.map(e => e.weight), 1);

  // Links
  const link = g.append("g")
    .attr("class", "graph-links")
    .selectAll("line")
    .data(edgeCopies)
    .join("line")
    .attr("stroke", "var(--color-muted)")
    .attr("stroke-opacity", d => 0.2 + 0.6 * (d.weight / maxWeight))
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
    });

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
    .attr("opacity", d => d.count >= LABEL_MIN_COUNT ? 0.9 : 0);

  // Show labels on hover for small nodes
  node.on("mouseover.label", function(event, d) {
    if (d.count < LABEL_MIN_COUNT) {
      select(this).select("text").attr("opacity", 0.9);
    }
  }).on("mouseout.label", function(event, d) {
    if (d.count < LABEL_MIN_COUNT) {
      select(this).select("text").attr("opacity", 0);
    }
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

  // Force simulation
  simulation = forceSimulation(filteredNodes)
    .force("link", forceLink(edgeCopies).id(d => d.id).distance(80).strength(d => d.weight / maxWeight * 0.5))
    .force("charge", forceManyBody().strength(-150))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide().radius(d => rScale(d.count) + 4))
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
