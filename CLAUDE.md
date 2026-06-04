# ExpireSnap — Claude Code Instructions

## Agent Delegation

| Task type | Agent |
|---|---|
| Scaffold, npm installs, mkdir | `Bash` / `general-purpose` |
| Single new component file | `cavecrew-builder` |
| 1-2 file config edit | `cavecrew-builder` |
| InventoryContext, API service module (multi-concern) | `general-purpose` |
| "Where is X defined / what calls Y" | `cavecrew-investigator` |
| End-of-phase diff review | `cavecrew-reviewer` |
| Phase 5 security audit (.env, keys) | `security-review` skill |
| UI verification after build | `verify` skill + `run` skill |
| Post-phase cleanup | `simplify` skill |

## Parallelization (Workflow)

- Phase 5 provider implementations (OpenAI / Gemini / Claude) — independent files, use `pipeline()`
- Phase 2 leaf components (StatCard / InventoryItem / Navbar) — no cross-deps, fan out concurrently

## Review Gates

- After Phase 2: `cavecrew-reviewer` on all components
- After Phase 4: `verify` — full scan → review → fridge flow
- After Phase 5: `security-review` — API keys, env vars, notification permissions

## Mock-First Development Rule

Never connect real AI APIs (Gemini, OpenAI, Anthropic) during UI/visual development.
Use `mockScanReceipt` (Phase 3) for all development through Phase 4.
Wire real providers only in Phase 5 — only after all UI and flow tests pass with mock data.
Reason: real API calls during dev burn RPM quota (Gemini free tier = 15 RPM) and slow iteration.

## Per-Task Verification (MANDATORY)

After **every single task** is implemented — no exceptions:

1. Run the relevant test(s) from `TESTS.md` for that task: `npx jest <matching-test-file>`
2. All tests for that task must pass before moving to the next task.
3. If a test fails: fix the implementation (not the test) and re-run.
4. Mark the task `[x]` in `PLAN.md` only after its tests are green.

Do not batch multiple tasks then verify at the end. One task → one verify → mark done → next task.

## Rule of Thumb

- Single file → `cavecrew-builder`
- Cross-file or judgment call → `general-purpose`
- 3+ parallel independent files → `Workflow`

## Shared Test Helpers (MANDATORY)

Never redefine `daysFromNow`, `Wrapper`, `mockItem`, or `today` inline in any test file. Always import from `@testHelpers`:

```js
import { daysFromNow, Wrapper, mockItem } from '@testHelpers';
```

`@testHelpers` maps to `__tests__/helpers/index.js` via `moduleNameMapper` in jest config.

Navigation mock (`mockNavigate` + `jest.mock('@react-navigation/native', ...)`) cannot be imported — `jest.mock()` is hoisted by babel-jest. Copy the boilerplate block from the helpers file comment into each screen test.
