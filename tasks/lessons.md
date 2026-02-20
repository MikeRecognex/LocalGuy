# Lessons Learned

## 2026-02-20: Retag script overwrote frontmatter fields beyond tags

**What happened:** Wrote a retag script that parsed frontmatter with a simple YAML parser and rebuilt it from scratch using `buildFrontmatter()`. This silently:
- Stripped quotes from `description` fields
- Changed `status: draft` to `status: published` (because it read working tree versions that had uncommitted status changes)
- Dropped `daily-digest` tags from posts where the working tree had already removed them
- Baked uncommitted working tree changes into the retag commit

**Root cause:** The script reconstructed the entire frontmatter instead of surgically replacing only the `tags:` block. Combined with reading working tree files (not committed versions), it mixed unrelated changes into the commit.

**Rule:** When modifying a specific field in structured files (YAML frontmatter, JSON, etc.), **only replace that field** — never parse and rebuild the entire structure. Use regex substitution on the targeted block. This preserves quoting, ordering, comments, and all other fields exactly as they were.

**Rule:** Before running a bulk file-modification script, check `git status` for uncommitted changes. If files are already dirty, either stash first or ensure the script cannot alter anything outside its scope.

**Rule:** After running a bulk script, always `git diff` a sample file to verify only the intended fields changed before committing.

## 2026-02-20: Ignored CLAUDE.md instruction to use codebase-index MCP tools

**What happened:** CLAUDE.md had an explicit instruction to prefer codebase-index MCP tools for codebase navigation. Used Glob/Grep/Read instead for the entire session, only calling `get_project_summary` once.

**Root cause:** The instruction used soft language ("Prefer") which was easy to rationalize away. Defaulted to familiar tools out of habit.

**Rule:** CLAUDE.md instructions with "prefer", "should", or "always" are **mandatory** — treat them as hard requirements, not suggestions. Updated CLAUDE.md to use stronger "MUST" language and added project-level reinforcement.
