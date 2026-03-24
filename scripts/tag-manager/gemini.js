/**
 * gemini.js — Gemini 2.5 Flash API wrapper for tag merge suggestions.
 * Uses Node 20 built-in fetch, no extra dependencies.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

/**
 * Send top tags to Gemini and get merge group suggestions.
 * @param {Array<{tag: string, count: number}>} tags - Tags sorted by frequency
 * @returns {Promise<Array<{tags: string[], canonical: string, reason: string}>>}
 */
async function suggestMerges(tags) {
  const tagList = tags.map((t) => `${t.tag} (${t.count})`).join("\n");

  const prompt = `You are a tag taxonomy expert for a blog about local/on-device AI, LLMs, and self-hosted inference.

Below is a list of tags with their post counts. Identify groups of tags that are semantically duplicates or near-duplicates and should be merged.

Rules:
- Only group tags that truly mean the same thing
- Pick the most descriptive and commonly-used tag as the canonical name
- Prefer shorter, hyphenated slugs (e.g., "local-deployment" over "local-llm-deployment-guide")
- Don't merge tags that are related but meaningfully different (e.g., "ollama" and "llama-cpp" are different tools)
- Return ONLY groups where merging makes sense. Skip tags that are already unique.

Tags:
${tagList}

Return a JSON array of merge groups. Each group has:
- "tags": array of tag names that should be merged (include the canonical one too)
- "canonical": the tag name to keep
- "reason": brief explanation why these should be merged`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text);
}

module.exports = { suggestMerges };
