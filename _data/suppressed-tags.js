/**
 * Tags that exist in post frontmatter but must never be rendered or given a page.
 *
 * Removing a pattern from tag-taxonomy.js only stops NEW matches. Roughly 1,900 posts
 * already carry these words in their frontmatter `tags:` and the computed-tags function
 * unions frontmatter in, so they need suppressing explicitly.
 *
 * The test applied here: does the tag narrow the corpus? A tag carried by a quarter or
 * more of every post on the site describes the site, not the post, and no reader can use
 * it to find anything. Measured over 1,909 posts.
 */

// Forced-choice classifier axes from scripts/smart-retag.py. The prompt demanded
// "exactly 1" of each per post, so the model supplied one whether or not the text
// justified it and defaulted to the same value nearly every time: bullish 70%,
// developer 70%, intermediate 67%. The prompt no longer emits these; this clears
// the ones already written to disk.
const DEGENERATE_AXES = [
  // sentiment
  "bullish", "cautious", "neutral",
  // audience
  "developer", "enterprise", "hobbyist", "researcher", "business",
  // technical-depth
  "beginner-friendly", "intermediate", "advanced",
];

// Restatements of the site's premise. Every post here is about running models locally,
// so "runs locally" cannot distinguish one post from another. Kept as separate entries
// rather than canonicalised because the destination tag would be suppressed anyway.
const SITE_PREMISE = [
  "open-source", "open-weights", "open-source-ai",
  "edge-device", "edge-inference", "edge-deployment", "edge-computing", "edge-ai",
  "local-deployment", "local-inference", "local-llm-deployment", "local-llms",
  "on-device", "on-device-ai", "on-device-inference", "on-device-deployment",
  "offline-deployment", "offline-inference", "offline-ai",
  "self-hosted", "self-hosting", "self-hosted-ai",
  "privacy", "data-privacy", "privacy-compliance", "privacy-preserving-ai",
];

// Too vague to act as a destination, and each above the 25% line.
const NON_DISCRIMINATING = [
  "hardware",     // 26% — every hardware post also carries a specific chip or tier tag
  "inference",    // ubiquitous on a local-inference site
  "daily-digest", // 71% — provenance of the ingest run, not a subject
];

// Syndication provenance. The tagger records the outlet a story came from as an
// organisation with role "publisher" and already refuses to promote those to tags
// (PUBLISHER_ROLES in scripts/smart-retag.py), but that guard postdates these posts
// and the retagger is additive-only — it never removes a tag already on disk. So 536
// post-tags naming the outlet survive here and need suppressing explicitly, exactly
// as DEGENERATE_AXES above do.
//
// Detected by comparing each post's tags against its own frontmatter source.name
// rather than by a hand-kept list, so the set is reproducible against the corpus.
//
// The cut is independent use: how often a tag appears on posts NOT from that outlet.
// ollama (181), llama-cpp (177), vllm (68) and amd (41) publish under their own names
// and are also real subjects, so they are kept. Every remaining candidate drops to 10
// or fewer independent uses — a clean gap, and all of them sit at or below the
// MIN_POSTS_FOR_TAG_PAGE threshold anyway, so suppressing them removes no live page.
const SYNDICATION_SOURCES = [
  "9to5mac", "abc-money", "adafruit", "analytics-india-magazine",
  "analytics-insight", "android-authority", "appleinsider", "ascendants",
  "aws", "biggo-finance", "binance", "btc-times", "business-insider",
  "business-wire", "chosunbiz", "cnx-software", "crypto-briefing",
  "cybernews", "cybersecuritynews", "dataconomy", "decrypt",
  "digital-reviews-network", "digital-today", "editorialge", "ein-news",
  "eqs-news", "fathom-journal", "fortune", "fortune-india", "gadgets-360",
  "gamegpu", "gbhackers", "geeky-gadgets", "ghacks", "gigazine",
  "gizmochina", "google-news", "hackernoon", "help-net-security",
  "hostinger", "hothardware", "how-to-geek", "ibm-research",
  "ieee-spectrum", "igeekphone", "indiablooms", "iphone-islam", "itpro",
  "journalarta", "kdnuggets", "knocksense", "latestly", "linuxiac",
  "macrumors", "makeuseof", "marktechpost", "medium", "memeburn", "mshale",
  "msn", "neowin", "newser", "notebookcheck", "officechai",
  "open-source-for-you", "openpr", "ox-security", "pandaily", "phonearena",
  "phoronix", "piunikaweb", "pocket-lint", "pr-newswire", "quasa",
  "sammobile", "samsung", "sci-tech-today", "security-boulevard",
  "semiconductor-engineering", "seoul-economic-daily", "siliconangle",
  "sitepoint", "sk-hynix", "smartprix", "smbtech", "sportskeeda-tech",
  "startup-fortune", "streetinsider", "tech-critter", "tech-in-asia",
  "tech-insider", "tech-times", "techcrunch", "techgenyz", "techgig",
  "techi", "techloy", "technetbook", "technobezz", "techradar",
  "testingcatalog", "the-ai-journal", "the-cryptonomist", "the-decoder",
  "the-economic-times", "the-hacker-news", "the-indian-express",
  "the-investor", "the-mac-observer", "the-manila-times",
  "the-national-law-review", "the-new-stack", "the-verge", "tipranks",
  "towards-data-science", "tradingkey", "tradingview", "trend-hunter",
  "venturebeat", "virtualization-review", "wccftech", "whalesbook",
  "winbuzzer", "xda", "xda-developers", "yahoo-finance",
  "yahoo-finance-singapore", "yahoo-tech", "yourstory", "ytechb", "zdnet",
];

module.exports = new Set([
  ...DEGENERATE_AXES,
  ...SITE_PREMISE,
  ...NON_DISCRIMINATING,
  ...SYNDICATION_SOURCES,
]);
