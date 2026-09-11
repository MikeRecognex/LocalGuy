const suppressed = require("../../_data/suppressed-tags.js");
const { canonicalTag } = require("../../_data/tag-aliases.js");

// Guides previously bypassed the alias map entirely, because only content/posts/
// had a directory data file. A guide tagged `multimodal` or `qwen3-8-27b` landed
// on its own page instead of the canonical one, and since a guide is a single
// document it fell below MIN_POSTS_FOR_TAG_PAGE and rendered nowhere at all. The
// guide was, in effect, untagged. Two of the nine were in this state.
//
// Deliberately NOT mirrored from posts.11tydata.js: the taxonomy body-text scan.
// Posts are short, ingested, and need tags inferred. Guides are long-form and
// hand-tagged, and running several thousand words past every taxonomy pattern
// would bury the handful of tags the author chose under dozens of incidental
// matches — a guide that mentions Ollama once in a comparison table is not an
// Ollama guide. Frontmatter stays authoritative here.
module.exports = {
  eleventyComputed: {
    tags: (data) => {
      const canonical = new Set((data.tags || []).map(canonicalTag));
      for (const tag of suppressed) canonical.delete(tag);
      return [...canonical].sort();
    },
  },
};
