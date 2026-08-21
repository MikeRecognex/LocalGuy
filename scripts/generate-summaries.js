#!/usr/bin/env node

/**
 * Generate AI summaries for the posts accordion.
 * Reads all published posts, groups by date and week (Monday-keyed),
 * then calls Groq to produce daily highlights and weekly summaries.
 *
 * Usage:
 *   node scripts/generate-summaries.js                    # incremental (skip existing)
 *   node scripts/generate-summaries.js --force            # regenerate all
 *   node scripts/generate-summaries.js --dry-run          # preview only
 *   node scripts/generate-summaries.js --date 2026-02-23  # regenerate a specific date
 *   node scripts/generate-summaries.js --week 2026-02-17  # regenerate a specific week (Monday key)
 *   node scripts/generate-summaries.js --since 2026-02-20 # regenerate from a date forward
 *
 * Flags can be combined: --since 2026-02-20 --dry-run
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

require("dotenv").config();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";
const SUMMARIES_PATH = path.join(__dirname, "..", "_data", "summaries.json");
const POSTS_DIR = path.join(__dirname, "..", "content", "posts");
const DELAY_MS = 200;

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

function getArgValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

const targetDate = getArgValue("--date");
const targetWeek = getArgValue("--week") ? getMonday(getArgValue("--week")) : null;
const sinceDate = getArgValue("--since");

function getMonday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callGroq(messages, temperature) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is required");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function collectPosts() {
  const posts = [];
  const dateDirs = fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const dir of dateDirs) {
    const dirPath = path.join(POSTS_DIR, dir.name);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dirPath, file), "utf8");
      const { data } = matter(raw);
      if (data.status !== "published" && data.status !== "draft") continue;
      const dateKey =
        typeof data.date === "string"
          ? data.date.slice(0, 10)
          : new Date(data.date).toISOString().slice(0, 10);
      posts.push({
        title: data.title || file.replace(".md", ""),
        description: data.description || "",
        dateKey,
      });
    }
  }

  return posts;
}

function groupByDate(posts) {
  const groups = {};
  for (const post of posts) {
    if (!groups[post.dateKey]) groups[post.dateKey] = [];
    groups[post.dateKey].push(post);
  }
  return groups;
}

function groupByWeek(dateGroups) {
  const weeks = {};
  for (const dateKey of Object.keys(dateGroups)) {
    const mondayKey = getMonday(dateKey);
    if (!weeks[mondayKey]) weeks[mondayKey] = {};
    weeks[mondayKey][dateKey] = dateGroups[dateKey];
  }
  return weeks;
}

async function main() {
  const mode = [
    dryRun && "DRY RUN",
    force && "FORCE",
    targetDate && `date=${targetDate}`,
    targetWeek && `week=${targetWeek}`,
    sinceDate && `since=${sinceDate}`,
  ].filter(Boolean).join(", ") || "incremental";
  console.log(`[summaries] Mode: ${mode}`);

  const summaries = JSON.parse(fs.readFileSync(SUMMARIES_PATH, "utf8"));
  const posts = collectPosts();
  const dateGroups = groupByDate(posts);
  const weekGroups = groupByWeek(dateGroups);

  let dailyGenerated = 0;
  let weeklyGenerated = 0;
  let dailySkipped = 0;
  let weeklySkipped = 0;

  // Generate daily highlights
  const dateKeys = Object.keys(dateGroups).sort();
  for (const dateKey of dateKeys) {
    // Retrospective filters: skip dates outside the targeted scope
    if (targetDate && dateKey !== targetDate) { dailySkipped++; continue; }
    if (targetWeek && getMonday(dateKey) !== targetWeek) { dailySkipped++; continue; }
    if (sinceDate && dateKey < sinceDate) { dailySkipped++; continue; }
    const dayPosts = dateGroups[dateKey];
    // In incremental mode: skip if summary exists and post count hasn't changed
    const existing = summaries.daily[dateKey];
    if (!force && !targetDate && !sinceDate && existing && existing.postCount === dayPosts.length) {
      dailySkipped++;
      continue;
    }
    const listing = dayPosts
      .map((p) => `- "${p.title}": ${p.description}`)
      .join("\n");

    if (dryRun) {
      console.log(`  [daily] Would generate: ${dateKey} (${dayPosts.length} posts)`);
      dailyGenerated++;
      continue;
    }

    console.log(`  [daily] Generating: ${dateKey} (${dayPosts.length} posts)`);
    const content = await callGroq(
      [
        {
          role: "system",
          content:
            "You write punchy daily highlights for a local AI news site. Rules:\n- Output ONE sentence, max 18 words\n- Name at least one specific model, tool, company, or technique from the posts\n- Never use generic phrases like \"advancements dominate\" or \"drive innovation\"\n- Be concrete: what specifically happened or was covered?\n- No quotes, no markdown, no preamble",
        },
        {
          role: "user",
          content: `Posts published on ${dateKey}:\n${listing}\n\nWrite a specific, distinctive one-sentence highlight referencing actual post topics.`,
        },
      ],
      0.3
    );
    summaries.daily[dateKey] = { text: content.trim(), postCount: dayPosts.length };
    dailyGenerated++;
    await sleep(DELAY_MS);
  }

  // Generate weekly summaries
  const weekKeys = Object.keys(weekGroups).sort();
  for (const weekKey of weekKeys) {
    // Retrospective filters
    if (targetDate) {
      // --date: only regenerate the week containing that date
      if (weekKey !== getMonday(targetDate)) { weeklySkipped++; continue; }
    }
    if (targetWeek && weekKey !== targetWeek) { weeklySkipped++; continue; }
    if (sinceDate && weekKey < getMonday(sinceDate)) { weeklySkipped++; continue; }

    const weekDates = weekGroups[weekKey];
    const allPosts = Object.values(weekDates).flat();
    // In incremental mode: skip if summary exists and post count hasn't changed
    const existingWeek = summaries.weekly[weekKey];
    if (!force && !targetDate && !targetWeek && !sinceDate && existingWeek && existingWeek.postCount === allPosts.length) {
      weeklySkipped++;
      continue;
    }
    const listing = allPosts
      .map((p) => `- "${p.title}": ${p.description}`)
      .join("\n");

    if (dryRun) {
      console.log(
        `  [weekly] Would generate: week of ${weekKey} (${allPosts.length} posts)`
      );
      weeklyGenerated++;
      continue;
    }

    console.log(
      `  [weekly] Generating: week of ${weekKey} (${allPosts.length} posts)`
    );
    const content = await callGroq(
      [
        {
          role: "system",
          content:
            "You write weekly summaries for a local AI news site. Rules:\n- Output exactly two HTML paragraphs (<p> tags)\n- First paragraph: 1-2 sentences naming the week's biggest specific stories (models, tools, benchmarks, companies)\n- Second paragraph: 1-2 sentences calling out 2-3 standout posts by name that readers shouldn't miss\n- 60 words max total\n- Be specific — name real models, tools, and numbers from the posts\n- Never use filler like \"notable developments\" or \"latest trends\"\n- No markdown, just HTML <p> tags",
        },
        {
          role: "user",
          content: `Posts from the week of ${weekKey}:\n${listing}\n\nWrite a two-paragraph HTML summary that names specific posts and topics.`,
        },
      ],
      0.4
    );
    summaries.weekly[weekKey] = { text: content.trim(), postCount: allPosts.length };
    weeklyGenerated++;
    await sleep(DELAY_MS);
  }

  if (!dryRun) {
    fs.writeFileSync(SUMMARIES_PATH, JSON.stringify(summaries, null, 2) + "\n");
  }

  // Flip any remaining draft posts to published
  if (!dryRun) {
    const glob = require("glob");
    const allFiles = glob.sync("**/*.md", { cwd: POSTS_DIR, absolute: true });
    let published = 0;
    for (const file of allFiles) {
      const raw = fs.readFileSync(file, "utf8");
      if (/^status: draft$/m.test(raw)) {
        fs.writeFileSync(file, raw.replace(/^status: draft$/m, "status: published"), "utf8");
        published++;
      }
    }
    if (published) console.log(`[summaries] Published ${published} draft posts.`);
  }

  console.log(
    `[summaries] Done. Daily: ${dailyGenerated} generated, ${dailySkipped} skipped. Weekly: ${weeklyGenerated} generated, ${weeklySkipped} skipped.`
  );
}

main().catch((err) => {
  console.error("[summaries] Fatal:", err.message);
  process.exit(1);
});
