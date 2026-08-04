#!/usr/bin/env python3
"""
smart-retag.py — Semantic tagging for LocalFTW blog posts using langextract + Gemini.

Reads posts → langextract/Gemini 2.5 Flash → writes semantic tags + mentions into frontmatter.
Existing tags are never removed (additive only). Mentions are fully replaced.
"""

import argparse
import hashlib
import json
import os
import re
import sys
import textwrap
import time
from pathlib import Path

import langextract as lx
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

POSTS_DIR = Path(__file__).resolve().parent.parent / "content" / "posts"
CACHE_FILE = Path(__file__).resolve().parent.parent / ".smart-retag-cache.json"

# Tags that the regex taxonomy already handles — do NOT extract these as orgs
TAXONOMY_ORGS = {
    "nvidia", "amd", "intel", "qualcomm", "apple", "microsoft", "google",
    "meta", "anthropic", "openai", "mistral", "alibaba", "deepseek",
    "hugging-face", "stability-ai", "groq", "cerebras", "samsung",
    "bytedance", "cohere", "minimax", "zhipu", "cloudflare", "asus",
    "arm", "taalas", "mozilla", "nomic",
}

# Tags that are too generic or noisy to keep
SUPPRESS_TAGS = {
    "inference",  # matches nearly every post on a local LLM blog
    # Syndication sources. These describe where a story was found, not what it is about.
    # Belt-and-braces alongside the role-based publisher check in map_extractions().
    "hacker-news", "hackernews", "reddit", "github", "arxiv",
}

# ---------------------------------------------------------------------------
# Extraction prompt & examples
# ---------------------------------------------------------------------------

PROMPT = textwrap.dedent("""\
You are tagging blog posts for "Local FTW", a local/on-device AI news site.
Posts are 200-500 word editorial summaries.

Extract these categories as tags. You are NOT limited to the examples below — generate
whatever slug best describes the content. Use lowercase-kebab-case for all slugs.

SEMANTIC TAGS (written to frontmatter tags:)
- content-type (exactly 1): e.g. news, tutorial, analysis, release, showcase, benchmark-report, opinion, comparison
- technical-depth (exactly 1): e.g. beginner-friendly, intermediate, advanced
- topic (1-5): The core subjects of the post. Be specific — e.g. iterative-reasoning, memory-bandwidth, inference-speed, model-compression, voice-synthesis, rag-pipeline, agent-orchestration, deployment-guide, security-audit. Capture what makes this post distinct.
- audience (exactly 1): e.g. hobbyist, developer, enterprise, researcher
- sentiment (exactly 1): e.g. bullish, cautious, neutral
- hardware-tier (0-2, only if hardware explicitly discussed): e.g. consumer-gpu, datacenter-gpu, apple-silicon, cpu-only, edge-device, custom-asic

PRODUCT (written to frontmatter tags:)
- product (0-3): The named project, tool, model, app, or hardware that the post is ABOUT.
  This is the most important extraction: if the post names a specific thing, capture it.
  Attributes: name (as written), slug (lowercase-kebab-case), kind (project|model|tool|hardware|app)

NAMED ENTITIES (written to frontmatter mentions:)
- person: Named individuals mentioned. Attributes: name, role (if clear), handle (Twitter/X handle if well-known or found in text)
- organisation: Named companies/orgs beyond those already tagged by regex. Attributes: name, role (e.g. "investor", "publisher", "partner"), handle (if known), url (if in text)

Rules:
1. Every post MUST have exactly 1 content-type, 1 technical-depth, 1 audience, 1 sentiment
2. Use extraction_text to quote the phrase that justifies each tag
3. Slugs MUST be lowercase-kebab-case (e.g. "iterative-reasoning" not "Iterative Reasoning")
4. For topic tags: be specific and descriptive. Prefer "iterative-reasoning" over generic "reasoning". Prefer "cost-saving" over "cost". Capture the actual subject matter.
5. For person/organisation/product: only extract if explicitly named in the text
6. For handles: only include if the handle appears in the text OR is widely known (e.g. @ID_AA_Carmack for John Carmack)
7. Do NOT extract company names already covered by the site's regex taxonomy (nvidia, amd, intel, qualcomm, apple, microsoft, google, meta, anthropic, openai, mistral, alibaba, deepseek, hugging-face, stability-ai, groq, cerebras, samsung, bytedance, cohere, minimax, zhipu, cloudflare, asus, arm, taalas, mozilla, nomic)
8. If the post's title names a specific project, model, tool or device, that name MUST appear as a
   product extraction. A post about "Bubo" must yield product Bubo; a post about "reCamera Pro" must
   yield product reCamera Pro. Do not skip it because it is unfamiliar or newly released.
9. News aggregators and publications (Hacker News, Reddit, GitHub, Tom's Hardware, VentureBeat,
   How-To Geek, ...) are organisations with role "publisher". They are NEVER products — the site
   they were syndicated from is not what the post is about.
10. Keep product slugs to the product name only. Strip vendor prefixes and marketing suffixes:
    "PrismML's Bonsai 27B" -> slug "bonsai-27b"; "Seeed Studio reCamera Pro" -> slug "recamera-pro".
""")

EXAMPLES = [
    lx.data.ExampleData(
        text=(
            "Taalas has released a free API endpoint running Llama 3.1 8B on custom ASICs, "
            "achieving 16,000 tokens/second. The announcement by CEO Janne Saarikko highlights "
            "viable pathways for cost-effective inference."
        ),
        extractions=[
            lx.data.Extraction(extraction_class="content-type", extraction_text="released a free API endpoint", attributes={"slug": "release"}),
            lx.data.Extraction(extraction_class="technical-depth", extraction_text="16,000 tokens/second", attributes={"slug": "intermediate"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="cost-effective inference", attributes={"slug": "cost-saving"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="16,000 tokens/second", attributes={"slug": "inference-speed"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="custom ASICs", attributes={"slug": "asic-inference"}),
            lx.data.Extraction(extraction_class="audience", extraction_text="viable pathways", attributes={"slug": "developer"}),
            lx.data.Extraction(extraction_class="sentiment", extraction_text="viable pathways for cost-effective inference", attributes={"slug": "bullish"}),
            lx.data.Extraction(extraction_class="hardware-tier", extraction_text="custom ASICs", attributes={"slug": "custom-asic"}),
            lx.data.Extraction(extraction_class="product", extraction_text="Llama 3.1 8B", attributes={"name": "Llama 3.1 8B", "slug": "llama-3.1-8b", "kind": "model"}),
            lx.data.Extraction(extraction_class="person", extraction_text="CEO Janne Saarikko", attributes={"name": "Janne Saarikko", "role": "CEO"}),
        ],
    ),
    lx.data.ExampleData(
        text=(
            "Production-ready deployment guidance for Ollama using Docker Compose. "
            "This guide from DigitalOcean addresses transitioning to scalable deployments. "
            "For organizations concerned about data privacy and cloud costs."
        ),
        extractions=[
            lx.data.Extraction(extraction_class="content-type", extraction_text="deployment guidance", attributes={"slug": "tutorial"}),
            lx.data.Extraction(extraction_class="technical-depth", extraction_text="production-ready deployment", attributes={"slug": "intermediate"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="data privacy", attributes={"slug": "privacy-compliance"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="scalable deployments", attributes={"slug": "production-deployment"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="Docker Compose", attributes={"slug": "docker-deployment"}),
            lx.data.Extraction(extraction_class="audience", extraction_text="organizations concerned about", attributes={"slug": "enterprise"}),
            lx.data.Extraction(extraction_class="sentiment", extraction_text="production-ready deployment guidance", attributes={"slug": "bullish"}),
            lx.data.Extraction(extraction_class="product", extraction_text="Ollama", attributes={"name": "Ollama", "slug": "ollama", "kind": "tool"}),
            lx.data.Extraction(extraction_class="product", extraction_text="Docker Compose", attributes={"name": "Docker Compose", "slug": "docker-compose", "kind": "tool"}),
            lx.data.Extraction(extraction_class="organisation", extraction_text="DigitalOcean", attributes={"name": "DigitalOcean", "role": "publisher"}),
        ],
    ),
    lx.data.ExampleData(
        text=(
            "Understanding where local LLMs fail provides crucial guidance for deployment. "
            "This analysis examines specific failure modes in iterative reasoning — tasks "
            "requiring multiple steps of thought refinement, feedback integration, or correction cycles."
        ),
        extractions=[
            lx.data.Extraction(extraction_class="content-type", extraction_text="This analysis examines", attributes={"slug": "analysis"}),
            lx.data.Extraction(extraction_class="technical-depth", extraction_text="iterative reasoning", attributes={"slug": "advanced"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="failure modes in iterative reasoning", attributes={"slug": "iterative-reasoning"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="where local LLMs fail", attributes={"slug": "model-failure-modes"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="deployment", attributes={"slug": "deployment-strategy"}),
            lx.data.Extraction(extraction_class="audience", extraction_text="crucial guidance for deployment", attributes={"slug": "developer"}),
            lx.data.Extraction(extraction_class="sentiment", extraction_text="crucial guidance", attributes={"slug": "neutral"}),
        ],
    ),
    lx.data.ExampleData(
        text=(
            "John Carmack has proposed using long fiber optic lines as L2 cache for "
            "streaming AI data. This could address memory bandwidth limitations that constrain "
            "model size on consumer hardware. Read more on Tom's Hardware."
        ),
        extractions=[
            lx.data.Extraction(extraction_class="content-type", extraction_text="has proposed", attributes={"slug": "analysis"}),
            lx.data.Extraction(extraction_class="technical-depth", extraction_text="memory bandwidth limitations", attributes={"slug": "advanced"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="fiber optic lines as L2 cache", attributes={"slug": "memory-bandwidth"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="consumer hardware", attributes={"slug": "cost-saving"}),
            lx.data.Extraction(extraction_class="audience", extraction_text="memory bandwidth limitations that constrain model size", attributes={"slug": "developer"}),
            lx.data.Extraction(extraction_class="sentiment", extraction_text="could address memory bandwidth limitations", attributes={"slug": "bullish"}),
            lx.data.Extraction(extraction_class="hardware-tier", extraction_text="consumer hardware", attributes={"slug": "consumer-gpu"}),
            lx.data.Extraction(extraction_class="person", extraction_text="John Carmack", attributes={"name": "John Carmack", "role": "programmer", "handle": "@ID_AA_Carmack"}),
            lx.data.Extraction(extraction_class="organisation", extraction_text="Tom's Hardware", attributes={"name": "Tom's Hardware", "role": "publisher"}),
        ],
    ),
    # The dominant template on this site: an open-source project syndicated from an aggregator.
    # The project is the subject; the aggregator is only the publisher.
    lx.data.ExampleData(
        text=(
            "Sidekick is an open-source desktop app that runs local models behind a native macOS "
            "interface. The project wraps llama.cpp and adds document indexing so users get "
            "on-device retrieval without a cloud round-trip. "
            "Read the full article on Hacker News."
        ),
        extractions=[
            lx.data.Extraction(extraction_class="content-type", extraction_text="open-source desktop app", attributes={"slug": "showcase"}),
            lx.data.Extraction(extraction_class="technical-depth", extraction_text="native macOS interface", attributes={"slug": "beginner-friendly"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="document indexing", attributes={"slug": "rag-pipeline"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="native macOS interface", attributes={"slug": "desktop-app"}),
            lx.data.Extraction(extraction_class="audience", extraction_text="users get on-device retrieval", attributes={"slug": "hobbyist"}),
            lx.data.Extraction(extraction_class="sentiment", extraction_text="without a cloud round-trip", attributes={"slug": "bullish"}),
            lx.data.Extraction(extraction_class="hardware-tier", extraction_text="native macOS interface", attributes={"slug": "apple-silicon"}),
            lx.data.Extraction(extraction_class="product", extraction_text="Sidekick", attributes={"name": "Sidekick", "slug": "sidekick", "kind": "project"}),
            lx.data.Extraction(extraction_class="product", extraction_text="llama.cpp", attributes={"name": "llama.cpp", "slug": "llama.cpp", "kind": "tool"}),
            lx.data.Extraction(extraction_class="organisation", extraction_text="Hacker News", attributes={"name": "Hacker News", "role": "publisher"}),
        ],
    ),
]

# ---------------------------------------------------------------------------
# Frontmatter helpers
# ---------------------------------------------------------------------------

FM_PATTERN = re.compile(r"^---\n(.*?\n)---\n", re.DOTALL)
TAGS_PATTERN = re.compile(r"^tags:\n(?:\s+-\s+.+\n?)*", re.MULTILINE)
MENTIONS_PATTERN = re.compile(r"^mentions:\n(?:\s+-.+\n(?:\s+\w.+\n)*)*", re.MULTILINE)


def parse_frontmatter(content: str) -> tuple[str, str, str]:
    """Split file into (before-fm, frontmatter, after-fm). Frontmatter includes --- delimiters."""
    m = FM_PATTERN.match(content)
    if not m:
        raise ValueError("No frontmatter found")
    fm = m.group(1)
    after = content[m.end():]
    return "---\n", fm, "---\n" + after


def get_existing_tags(fm: str) -> list[str]:
    """Extract existing tag list from frontmatter string."""
    m = TAGS_PATTERN.search(fm)
    if not m:
        return []
    block = m.group(0)
    return [line.strip().lstrip("- ") for line in block.split("\n")[1:] if line.strip()]


def build_tags_block(tags: list[str]) -> str:
    """Build a YAML tags block from sorted tag list."""
    lines = ["tags:"] + [f"  - {t}" for t in sorted(tags)]
    return "\n".join(lines) + "\n"


def build_mentions_block(mentions: list[dict]) -> str:
    """Build a YAML mentions block from list of mention dicts."""
    if not mentions:
        return ""
    lines = ["mentions:"]
    for m in mentions:
        lines.append(f"  - name: {m['name']}")
        if m.get("role"):
            lines.append(f"    role: {m['role']}")
        if m.get("handle"):
            lines.append(f'    handle: "{m["handle"]}"')
        if m.get("url"):
            lines.append(f"    url: {m['url']}")
    return "\n".join(lines) + "\n"


def update_frontmatter(content: str, new_tags: list[str], mentions: list[dict]) -> str:
    """Surgically update tags and mentions in frontmatter."""
    m = FM_PATTERN.match(content)
    if not m:
        return content

    fm = m.group(1)

    # Replace tags block (normalize all to lowercase-kebab-case).
    # Additive except for SUPPRESS_TAGS, which are stripped from existing posts on re-run.
    existing = get_existing_tags(fm)
    kept = {s for s in (slugify(t) for t in existing) if s and s not in SUPPRESS_TAGS}
    merged = sorted(kept | set(new_tags))
    new_tags_block = build_tags_block(merged)
    fm = TAGS_PATTERN.sub(new_tags_block, fm)

    # Handle mentions block
    mentions_block = build_mentions_block(mentions)
    if MENTIONS_PATTERN.search(fm):
        if mentions_block:
            fm = MENTIONS_PATTERN.sub(mentions_block, fm)
        else:
            fm = MENTIONS_PATTERN.sub("", fm)
    elif mentions_block:
        # Insert before status: line
        status_match = re.search(r"^status:", fm, re.MULTILINE)
        if status_match:
            fm = fm[:status_match.start()] + mentions_block + fm[status_match.start():]
        else:
            fm += mentions_block

    return "---\n" + fm + "---\n" + content[m.end():]


# ---------------------------------------------------------------------------
# Extraction → tags/mentions mapping
# ---------------------------------------------------------------------------

TAG_CLASSES = {
    "content-type", "technical-depth", "topic",
    "audience", "sentiment", "hardware-tier",
}

ENTITY_CLASSES = {"person", "organisation", "product"}

# Roles whose orgs are recorded as mentions but never promoted to tags — the outlet that
# syndicated a story is not what the story is about.
PUBLISHER_ROLES = {"publisher", "aggregator", "source", "news-aggregator"}


def slugify(text: str) -> str:
    """Convert text to lowercase-kebab-case slug.

    Dots and slashes become separators so product names survive intact:
    "llama.cpp" -> "llama-cpp" (matching the regex taxonomy), "Gainz.fast" -> "gainz-fast".
    """
    s = text.lower().strip()
    s = re.sub(r"[.\s_/]+", "-", s)
    s = re.sub(r"[^a-z0-9-]", "", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")


def map_extractions(extractions: list) -> tuple[list[str], list[dict]]:
    """Map langextract results to (semantic_tags, mentions)."""
    tags = []
    mentions = []

    for ext in extractions:
        cls = ext.extraction_class
        attrs = ext.attributes or {}

        if cls in TAG_CLASSES:
            slug = attrs.get("slug", "")
            if slug:
                slug = slugify(slug)
            if slug and slug not in SUPPRESS_TAGS:
                tags.append(slug)

        elif cls == "person":
            mention = {"name": attrs.get("name", ext.extraction_text)}
            if attrs.get("role"):
                mention["role"] = attrs["role"]
            if attrs.get("handle"):
                mention["handle"] = attrs["handle"]
            mentions.append(mention)

        elif cls == "organisation":
            name = attrs.get("name", ext.extraction_text)
            # Skip orgs already in regex taxonomy
            if slugify(name) in TAXONOMY_ORGS:
                continue
            role = attrs.get("role", "")
            mention = {"name": name}
            if role:
                mention["role"] = role
            if attrs.get("handle"):
                mention["handle"] = attrs["handle"]
            if attrs.get("url"):
                mention["url"] = attrs["url"]
            mentions.append(mention)
            # Add as a tag so companies appear in tag cloud/filters — but not publishers,
            # which would otherwise bury the corpus under `hacker-news`.
            org_slug = slugify(name)
            if role.lower() in PUBLISHER_ROLES:
                continue
            if org_slug and org_slug not in SUPPRESS_TAGS:
                tags.append(org_slug)

        elif cls == "product":
            # The named thing the post is about — the single most useful tag on the page.
            slug = slugify(attrs.get("slug") or attrs.get("name") or ext.extraction_text)
            if slug and slug not in SUPPRESS_TAGS:
                tags.append(slug)

    return tags, mentions


# ---------------------------------------------------------------------------
# Cache
# ---------------------------------------------------------------------------

def load_cache(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text())
    return {}


def save_cache(path: Path, cache: dict):
    path.write_text(json.dumps(cache, indent=2) + "\n")


def file_hash(content: str) -> str:
    return hashlib.md5(content.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def collect_posts(drafts_only: bool) -> list[Path]:
    """Collect markdown posts, optionally filtering to drafts only."""
    posts = sorted(POSTS_DIR.rglob("*.md"))
    if drafts_only:
        posts = [p for p in posts if "status: draft" in p.read_text()[:2000]]
    return posts


def main():
    parser = argparse.ArgumentParser(description="Smart semantic tagging for LocalFTW posts")
    parser.add_argument("--drafts-only", action="store_true", help="Only process draft posts")
    parser.add_argument("--no-cache", action="store_true", help="Force reprocessing of all posts")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without writing files")
    parser.add_argument("--batch-size", type=int, default=10, help="Posts per langextract batch")
    parser.add_argument("--max-workers", type=int, default=2, help="Concurrent Gemini requests (keep low to avoid rate limits)")
    parser.add_argument("--model", default="gemini-3.5-flash", help="Gemini model ID")
    args = parser.parse_args()

    # Load environment
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env", file=sys.stderr)
        sys.exit(1)

    # Collect posts
    posts = collect_posts(args.drafts_only)
    if not posts:
        print("No posts found to process.")
        return

    # Load cache
    cache = {} if args.no_cache else load_cache(CACHE_FILE)

    # Filter to uncached posts
    to_process = []
    for post_path in posts:
        content = post_path.read_text()
        h = file_hash(content)
        if h in cache and not args.no_cache:
            continue
        to_process.append((post_path, content, h))

    if not to_process:
        print("All posts are cached. Use --no-cache to force reprocessing.")
        return

    print(f"Processing {len(to_process)} posts ({len(posts) - len(to_process)} cached)...")

    # Process in batches
    for batch_start in range(0, len(to_process), args.batch_size):
        batch = to_process[batch_start:batch_start + args.batch_size]
        documents = []
        for post_path, content, h in batch:
            # Strip frontmatter for extraction — send only body text
            fm_match = FM_PATTERN.match(content)
            body = content[fm_match.end():] if fm_match else content
            # Also include title and description from frontmatter for context
            fm_text = fm_match.group(1) if fm_match else ""
            title_match = re.search(r'^title:\s*"?(.+?)"?\s*$', fm_text, re.MULTILINE)
            desc_match = re.search(r'^description:\s*"?(.+?)"?\s*$', fm_text, re.MULTILINE)
            title = title_match.group(1) if title_match else ""
            desc = desc_match.group(1) if desc_match else ""
            full_text = f"Title: {title}\nDescription: {desc}\n\n{body}" if title else body

            documents.append(lx.data.Document(
                text=full_text,
                document_id=str(post_path),
            ))

        batch_num = batch_start // args.batch_size + 1
        print(f"  Batch {batch_num}: {len(documents)} posts...")

        # Retry on transient API errors (SSL, network, rate limits)
        results = None
        for attempt in range(3):
            try:
                results = lx.extract(
                    text_or_documents=documents,
                    prompt_description=PROMPT,
                    examples=EXAMPLES,
                    model_id=args.model,
                    max_workers=args.max_workers,
                    max_char_buffer=4000,  # posts are 200-500 words; avoid chunk-splitting each post
                )
                break
            except Exception as e:
                if attempt < 2:
                    wait = 15 * (attempt + 1)
                    print(f"    ⚠ Batch {batch_num} failed ({e.__class__.__name__}: {e}), retrying in {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"    ✗ Batch {batch_num} failed after 3 attempts: {e}", file=sys.stderr)
                    continue

        if results is None:
            print(f"    Skipping batch {batch_num}")
            continue

        # Handle single result vs list
        if not isinstance(results, list):
            results = [results]

        for (post_path, content, h), result in zip(batch, results):
            tags, mentions = map_extractions(result.extractions)

            existing = get_existing_tags(FM_PATTERN.match(content).group(1))
            new_tags = sorted(set(tags) - set(existing))

            if args.dry_run:
                print(f"\n  {post_path.relative_to(POSTS_DIR)}")
                if new_tags:
                    print(f"    + tags: {', '.join(new_tags)}")
                if mentions:
                    for m in mentions:
                        print(f"    + mention: {m['name']}" + (f" ({m.get('role', '')})" if m.get('role') else ""))
                if not new_tags and not mentions:
                    print("    (no changes)")
            else:
                updated = update_frontmatter(content, tags, mentions)
                post_path.write_text(updated)
                if new_tags or mentions:
                    print(f"  {post_path.relative_to(POSTS_DIR)}")
                    if new_tags:
                        print(f"    + tags: {', '.join(new_tags)}")
                    if mentions:
                        for m in mentions:
                            print(f"    + mention: {m['name']}")

            # Update cache
            cache[h] = {"tags": tags, "mentions": mentions}

        # Save cache after each batch (crash-safe)
        if not args.dry_run:
            save_cache(CACHE_FILE, cache)

    # Save cache
    if not args.dry_run:
        save_cache(CACHE_FILE, cache)
        print(f"\nDone. Cache saved to {CACHE_FILE.name}")
    else:
        print(f"\nDry run complete. No files modified.")


if __name__ == "__main__":
    main()
