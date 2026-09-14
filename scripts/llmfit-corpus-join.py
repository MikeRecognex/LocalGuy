#!/usr/bin/env python3
"""
Prototype: join the llmfit model catalogue to the LocalGuy corpus.

Answers one question — if a reader arrives from an llmfit recommendation, how
often can this site say anything measured about the model they were given?

Reads only. Writes nothing to the repo.

Data: llmfit-core/data/hf_models.json, MIT licensed, Copyright (c) 2026 Alex Jones
      https://github.com/AlexsJones/llmfit
"""
import json, re, glob, collections, os, sys

# Not vendored: 11MB, MIT licensed, refreshed weekly upstream. Fetch it to a
# temp path before running:
#   curl -sL -o /tmp/hf_models.json \
#     https://raw.githubusercontent.com/AlexsJones/llmfit/main/llmfit-core/data/hf_models.json
CATALOG = os.environ.get('LLMFIT_CATALOG', '/tmp/hf_models.json')
REPO = '/Users/michaeldoyle/Scratch/LocalGuy'

# ---------------------------------------------------------------- corpus side
def norm(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def load_corpus():
    posts = []
    for f in glob.glob(os.path.join(REPO, 'content/posts/**/*.md'), recursive=True):
        s = open(f, encoding='utf8').read()
        m = re.match(r'^---\n(.*?\n)---\n(.*)$', s, re.S)
        if not m:
            continue
        fm, body = m.group(1), m.group(2)
        if not re.search(r'^status:\s*published', fm, re.M):
            continue
        title = (re.search(r'^title:\s*"?(.*?)"?\s*$', fm, re.M) or [None, ''])[1]
        tags = []
        tm = re.search(r'^tags:\n((?:[ \t]+-[ \t]+.*\n)+)', fm, re.M)
        if tm:
            tags = [norm(l.strip().lstrip('- ').strip('"\''))
                    for l in tm.group(1).strip().split('\n')]
        posts.append({
            'path': os.path.relpath(f, REPO),
            'title': title,
            'tags': set(tags),
            'text': (title + ' ' + body).lower(),
        })
    return posts

# --------------------------------------------------------------- llmfit side
# Strip packaging noise so "Qwen/Qwen3-8-27B-Instruct-GGUF" and the corpus tag
# "qwen3-8-27b" can meet. Order matters: longest suffixes first.
SUFFIXES = re.compile(
    r'-(gguf|awq|gptq|autoround|mlx|safetensors|exl2|'
    r'instruct|chat|it|base|preview|thinking|turbo|distill|distil|'
    r'fp8|fp16|bf16|int4|int8|q\d[a-z0-9_]*)$'
)

def base_slug(name):
    s = norm(name.split('/')[-1])
    prev = None
    while prev != s:                      # strip stacked suffixes
        prev = s
        s = SUFFIXES.sub('', s)
    return s

def family_of(slug):
    """Leading alphabetic run plus an attached major version: qwen3, llama, gemma."""
    m = re.match(r'^([a-z]+\d*)', slug)
    return m.group(1) if m else slug

def load_catalog():
    models = json.load(open(CATALOG))
    for m in models:
        m['_slug'] = base_slug(m['name'])
        m['_family'] = family_of(m['_slug'])
    return models

# --------------------------------------------------------------------- match
# A bare family tag is worse than no match. Llama-3.2-1B-Instruct resolves to the
# tag `llama` and returns 70 posts, none of which mention 3.2 or 1B — the reader
# is handed confident-looking noise, which is the failure this join exists to
# avoid. Above this many posts a match is treated as too generic to show.
GENERIC_TAG_POSTS = 25

def match_posts(model, posts, corpus_tags):
    """
    Longest-prefix match against real corpus tags.

    `gpt-oss-20b` must be allowed to find the tag `gpt-oss`; taking only the
    leading alphanumeric run yields `gpt`, which matches nothing. So walk the
    slug's hyphen prefixes from most to least specific and take the first that
    exists, rejecting any whose post count shows it is a whole family rather
    than the model asked about.
    """
    parts = model['_slug'].split('-')
    for i in range(len(parts), 0, -1):
        cand = '-'.join(parts[:i])
        hits = corpus_tags.get(cand)
        if not hits:
            continue
        if len(hits) > GENERIC_TAG_POSTS:
            return [], f'too-generic:{cand}'
        return hits, ('exact-tag' if i == len(parts) else f'prefix-{i}')
    return [], 'none'

def main():
    posts = load_corpus()
    models = load_catalog()
    corpus_tags = collections.defaultdict(list)
    for p in posts:
        for t in p['tags']:
            corpus_tags[t].append(p)

    print(f"corpus: {len(posts)} published posts, {len(corpus_tags)} distinct tags")
    print(f"llmfit: {len(models)} models, {len(set(m['_family'] for m in models))} families\n")

    # Weighting by downloads is the honest lens: coverage of the whole 12.9k
    # catalogue is not the question, coverage of what people actually run is.
    ranked = sorted((m for m in models if m.get('hf_downloads')),
                    key=lambda m: -m['hf_downloads'])

    for label, subset in [
        ('top 50 by downloads',  ranked[:50]),
        ('top 250 by downloads', ranked[:250]),
        ('top 1000 by downloads', ranked[:1000]),
        ('entire catalogue',     models),
    ]:
        tiers = collections.Counter()
        for m in subset:
            _, how = match_posts(m, posts, corpus_tags)
            tiers[how] += 1
        covered = len(subset) - tiers['none']
        pct = 100 * covered / len(subset)
        print(f"{label:<24} covered {covered:>5}/{len(subset):<5} ({pct:5.1f}%)   "
              f"exact={tiers['exact-tag']:<5} family-tag={tiers['family-tag']:<5} "
              f"title={tiers['family-title']:<5}")

    # The actual product surface: "what fits my card, and what do you know?"
    print("\nBy VRAM tier — models that fit, and how many have corpus coverage:")
    for cap in (8, 12, 16, 24, 48):
        fits = [m for m in ranked if (m.get('min_vram_gb') or 999) <= cap]
        cov = sum(1 for m in fits[:200] if match_posts(m, posts, corpus_tags)[1] != 'none')
        n = min(200, len(fits))
        print(f"  {cap:>2}GB: {len(fits):>5} models fit; of the top {n} by downloads, "
              f"{cov} have posts ({100*cov/n:.0f}%)")

    # Capability routing — the STT case that vector search missed.
    print("\nCapability routing (what embeddings handled badly):")
    for tag, label in [('automatic-speech-recognition', 'speech-to-text'),
                       ('text-to-speech', 'text-to-speech'),
                       ('image-text-to-text', 'vision')]:
        ms = [m for m in models if m.get('pipeline_tag') == tag]
        reach = set()
        for m in ms:
            for p in match_posts(m, posts, corpus_tags)[0]:
                reach.add(p['path'])
        print(f"  {label:<16} {len(ms):>5} models -> {len(reach):>4} distinct corpus posts")

    # Where it breaks: popular models the map cannot reach.
    print("\nTop 15 popular models with NO corpus coverage (the gap to curate):")
    shown = 0
    for m in ranked:
        if shown >= 15:
            break
        if match_posts(m, posts, corpus_tags)[1] != 'none':
            continue
        print(f"  {m['name'][:46]:<48} dl={m['hf_downloads']:<10} family='{m['_family']}'")
        shown += 1

if __name__ == '__main__':
    main()
