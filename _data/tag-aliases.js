// Canonical spelling for tags, applied wherever tags are computed.
//
// Two producers disagreed on spelling: the regex taxonomy emitted British
// `-isation`, the LLM classifier emitted American `-ization`. That split the same
// concept across two pages — /tags/quantisation/ held 654 posts and
// /tags/quantization/ another 214. American wins because it is what the source
// material and the wider ML ecosystem use, and because it was already dominant
// here (inference-optimization 324 posts vs inference-optimisation 1).
//
// The rule is deliberately scoped to the two stems that actually occur rather
// than a general s -> z rewrite. A blanket rule would corrupt real tags:
// `supervised-fine-tuning-dataset` and `audio-denoising` both contain an
// innocent "is" and must survive untouched.
const SPELLING = /(optimi|quanti)s/g;

// Distinct concepts that arrived under more than one name.
const EXPLICIT = {
  benchmark: "benchmarks",
};

function canonicalTag(tag) {
  if (typeof tag !== "string") return tag;
  const normalised = tag.replace(SPELLING, "$1z");
  return EXPLICIT[normalised] || normalised;
}

module.exports = { canonicalTag };
