Minimal Execution Prompt (EN) — Build todo.md from design.md and implement ALL tasks

Role: You are an execution-focused engineer who completes ALL implementation tasks.

Input: `instruction/design.md` (treat as the single source of truth).

Do:
1) Read `instruction/design.md` first using the Read tool.
2) Check if `instruction/todo.md` exists. If yes, read it first. Update it based on `design.md`. If no, create it.
   - In `instruction/todo.md`, include sections:
     - `# Project TODO`
     - `## Tasks` (ordered by priority)
       - Task line format: `- [ ] P0 | <Task Name> — criteria: <...> — deps: <...> — patch: <TBD>`
     - `## Open Questions` (only if needed)
     - `## Assumptions` (only if needed)
     - `## Change Log`

3) **CONTINUOUSLY IMPLEMENT ALL TASKS** in priority order (P0 first, then P1, P2, P3):
   - For each ready task (no unmet dependencies):
     a) Use TodoWrite to mark task as "in_progress"
     b) **CRITICAL**: Actually modify/create real code files using Edit/Write/MultiEdit tools
     c) Run verification commands (lint, typecheck, build, etc.)
     d) Update todo.md: mark as `[x]`, set patch number, add to Change Log
     e) Use TodoWrite to mark task as "completed"
     f) **IMMEDIATELY CONTINUE** to the next task without waiting

4) Implementation guidelines for each task type:
   - Database migrations: Run `npm run migrator:create -- <Name>` then `npm run migrator:up`
   - Backend files: Create in `apps/backend/src/` with proper module structure
   - Frontend files: Create in `apps/frontend/lib/` following feature structure
   - DTOs: Create in proper dto folders with validation decorators
   - Always follow existing code patterns and conventions

5) Verification commands to run after EACH task:
   - Backend changes: `npm run backend:build`
   - Frontend changes: `npm run frontend:generate` (if models/providers changed)
   - Database changes: `npm run migrator:up`
   - Always: `npm run lint` and `npm run typecheck`

6) Continue implementing until:
   - ALL tasks marked with [x] in todo.md
   - ALL patches documented in Change Log
   - ALL code verified and passing tests

**DO NOT STOP** after one task. Keep implementing until everything is complete.

Output Summary:
1) Confirm that `instruction/todo.md` has been created/updated with the Write/Edit tools
2) List ALL actual files created/modified with their full paths:
   - Files created: [list with full paths]
   - Files modified: [list with full paths]
3) Confirm any code generation commands run and their results
4) Provide a summary of changes made (can include unified diff format for documentation):
```diff
<!-- file: patches/0001-<slug>.patch -->
#patch-0001
diff --git a/src/example.py b/src/example.py
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/src/example.py
@@
+def hello():
+    return "world"
```
Rules:
- Keep Markdown valid and concise.
- No explanations outside the code fences.
- Prefer minimal, working stubs when full context is missing.
