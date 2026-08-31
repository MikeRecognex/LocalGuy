## Codebase Navigation — MANDATORY (TWO PRIOR VIOLATIONS LOGGED)

**You MUST use codebase-index MCP tools FIRST when exploring or navigating the codebase.** This is not optional. This rule has been violated twice already (2026-02-20, 2026-02-23). See `tasks/lessons.md`.

### Decision gate — run this BEFORE every Glob/Grep/Read call:
1. Am I looking for code, symbols, functions, files, or structure? → **Use codebase-index** (`list_files`, `find_symbol`, `search_codebase`, `get_function_source`, etc.)
2. Am I reading non-code content (markdown body, config values, frontmatter, .env)? → Glob/Grep/Read is OK.
3. Am I unsure? → **Default to codebase-index.**

### Available codebase-index tools (use these FIRST):
`get_project_summary`, `list_files`, `find_symbol`, `get_function_source`, `get_class_source`, `get_structure_summary`, `get_dependencies`, `get_dependents`, `get_change_impact`, `get_call_chain`, `search_codebase`, `get_functions`, `get_classes`, `get_imports`, `get_file_dependencies`, `get_file_dependents`

### Enforcement:
- Violation of this rule must be logged in `tasks/lessons.md` immediately
- Acknowledging a violation verbally ("fair point") without changing the NEXT tool call is itself a violation
- If you started with Glob/Grep by mistake, STOP and switch to codebase-index before continuing
