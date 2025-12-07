Review the current changes in "plan mode".  
You must consider the entire existing codebase context, not just the modified lines, to ensure compatibility and avoid hidden risks.

Objectives:
1) Identify and explain any potential bugs (including trigger conditions, impact scope, and risk level).  
2) For each issue, provide clear reasoning and concrete fix or improvement suggestions.  
3) Beyond bugs, also check for code smells, logical inconsistencies, performance concerns, maintainability/readability problems, and security issues.  
4) Evaluate consistency with the existing codebase, module interfaces, project conventions (naming, error handling, logging, abstraction layers).  

Cross-file / Contextual Requirements:
- Trace call chains and data flows to check upstream/downstream effects, including tasks, async jobs, DB/cache/API/message bus interactions.  
- Compare with existing implementations in other files to avoid divergence in style or duplicated logic.  
- Verify that shared types/interfaces/constants remain consistent (e.g., DTOs, type aliases, schemas).  
- Check test coverage (unit/integration/e2e) for changed logic and related modules.  

Quality & Safety Checklist:
- Logic: branching, early returns, null/exception handling, loops, edge cases.  
- Performance: redundant computation, N+1 queries, blocking I/O, memory/resource usage.  
- Concurrency: race conditions, deadlocks, shared state visibility, retry/idempotency.  
- API/Protocol: input validation, consistent error codes, retry/timeout strategy, backward compatibility.  
- Security: input sanitization, authorization checks, sensitive logging, resource cleanup.  
- Maintainability: abstraction boundaries, function length, naming consistency, circular dependencies.  
- i18n/L10n: string handling, timezone/encoding/sorting correctness.  
- Tooling: lint/typecheck compliance (fixable without changing business logic).  

Output Format (structured and explicit):
1. **Summary Table**  
   - Change overview (one sentence)  
   - Risk level (High/Medium/Low) + short rationale  
   - Impacted modules/files  

2. **Issue List (per item)**  
   - Title  
   - Risk level: High/Medium/Low  
   - Description: clear explanation of the problem and its potential impact  
   - Trigger/reproduction conditions (if applicable)  
   - Location: file + line number(s)  
   - Reasoning: why this is an issue (including comparison with existing code)  
   - Suggested fix: specific steps or alternatives  
   - Test coverage impact: which tests to add/update (unit/integration/e2e)  

3. **Cross-file Consistency & Compatibility**  
   - Interfaces/types/constants consistency  
   - Alignment with existing project style and conventions  
   - Backward compatibility and rollout/rollback considerations (e.g., feature flags)  

4. **Follow-ups & Risk Mitigation**  
   - Required next actions (short-term / mid-term)  
   - Monitoring/alerting suggestions (metrics, logs, traces)  

Notes:
- Perform review and provide suggestions only.  
- Do **not** output a rewritten version of the full code unless providing minimal illustrative snippets.  
- If conclusions are uncertain, explicitly state assumptions and missing context (e.g., env configs, dependency versions).  
- Write the response in Tradition Chinese