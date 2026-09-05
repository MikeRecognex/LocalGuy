#!/usr/bin/env node
/**
 * Backfill `source:` frontmatter onto archived posts.
 *
 * New posts get this from the n8n Format Obsidian Markdown node, which has the
 * feed URL verbatim. Archived posts predate that, but the same URL is already in
 * the body footer (`*Source: [Name](url) · Relevance: N/10*`), so it can be
 * recovered without re-running anything.
 *
 * The archive contains two known URL-quality faults (see the pipeline notes):
 * a batch of publisher-homepage links from the old Google News parser, and ~30
 * hostnames the LLM invented before URLs were passed through verbatim. The
 * second group does not resolve. Since this field becomes schema.org
 * `isBasedOn` — a machine-readable provenance claim — a host that fails DNS is
 * skipped rather than asserted.
 *
 *   node scripts/backfill-source.js            # dry run, writes nothing
 *   node scripts/backfill-source.js --write
 */

const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;

const WRITE = process.argv.includes("--write");
const ROOT = path.join(__dirname, "..", "content", "posts");

const SOURCE_LINE = /^\*Source: \[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/m;
const HAS_SOURCE = /^source:\s*$/m;
const STATUS_LINE = /^status:/m;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith(".md") ? [p] : [];
  });
}

function splitFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return null;
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return { fm: raw.slice(4, end + 1), body: raw.slice(end + 5) };
}

// YAML double-quoted scalar: backslash and double-quote are the only escapes needed.
const yamlStr = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const hostCache = new Map();
async function hostResolves(host) {
  if (hostCache.has(host)) return hostCache.get(host);
  const p = dns
    .lookup(host)
    .then(() => true)
    .catch(() => false);
  hostCache.set(host, p);
  return p;
}

async function main() {
  const files = walk(ROOT);
  const stats = { total: files.length, already: 0, noLine: 0, badHost: 0, malformed: 0, updated: 0 };
  const badHosts = new Map();

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const split = splitFrontmatter(raw);
    if (!split) {
      stats.malformed++;
      continue;
    }
    if (HAS_SOURCE.test(split.fm)) {
      stats.already++;
      continue;
    }

    const m = raw.match(SOURCE_LINE);
    if (!m) {
      stats.noLine++;
      continue;
    }

    const [, name, url] = m;
    const host = url.replace(/^https?:\/\//, "").split(/[/:?#]/)[0];
    if (!(await hostResolves(host))) {
      stats.badHost++;
      badHosts.set(host, (badHosts.get(host) || 0) + 1);
      continue;
    }

    const block = `source:\n  name: ${yamlStr(name)}\n  url: ${yamlStr(url)}\n`;
    // Sit above `status:` so the provenance keys stay grouped with the content
    // keys, matching where smart-retag.py inserts its mentions block.
    const fm = STATUS_LINE.test(split.fm)
      ? split.fm.replace(STATUS_LINE, block + "status:")
      : split.fm + block;

    stats.updated++;
    if (WRITE) fs.writeFileSync(file, `---\n${fm}---\n${split.body}`);
  }

  console.log(WRITE ? "WROTE" : "DRY RUN (pass --write to apply)");
  console.table(stats);
  if (badHosts.size) {
    console.log("Skipped — hostname does not resolve:");
    for (const [h, n] of [...badHosts].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(4)}  ${h}`);
    }
  }
}

main();
