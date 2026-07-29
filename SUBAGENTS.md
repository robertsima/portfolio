# Subagents

This repo delegates work to Pi subagents via the `@tintinweb/pi-subagents`
extension. There is no custom orchestration code — the previous
`scripts/agent-pair.ps1` and the external `agent-orchestrator` pipelines are no
longer used.

## Agents

Defined in `.pi/agents/`:

| agent | model | role |
| --- | --- | --- |
| `qwen-implementer` | `qwen` (local llama.cpp, `127.0.0.1:8086`) | writes a scoped change, then runs `npm run validate` |
| `qwen-reviewer` | `qwen` | read-only verification, reports `PASS` / `FAIL` |

Both pin `extensions: pi-llama-switch` and `skills: none`. This is deliberate:

- `pi-llama-switch` is what registers the local `qwen` model. Without it the
  agent cannot resolve its own model.
- Pinning excludes every other global extension. In particular `pi-caveman`
  rewrites output into a terse style, which previously corrupted agent
  handoffs — a planning agent returned `"Read all 3. No file changed."` and the
  downstream agents inherited that as their plan.

The extension already withholds `~/.pi/agent/APPEND_SYSTEM.md` and `AGENTS.md`
from subagents, so no operator-level instructions leak in.

## Running

From an interactive `pi` session in this repo:

```
Use the qwen-implementer agent to add src/hooks/useReveal.ts ...
```

Both agents declare `run_in_background: true`, so they run detached and stream
into the fleet view rather than blocking the session.

## Watching them work

- The **fleet view** lists every running agent with live status and tool activity.
- `/agents` opens the agent menu — inspect, steer, or kill a running agent.
- Every run is also written to a session file under
  `~/.pi/agent/sessions/--D--Development-portfolio--/`, replayable with `pi -r`.

## Verification

A green build proves nothing about scope. Agents have reported success while
silently writing to a different path than requested, or skipping a requirement
entirely. Always confirm independently:

```bash
git status --short
git diff
npm run validate
```

`npm run validate` = `oxlint`, then `tsc -b && vite build`.

## Constraints given to agents

- No new npm dependencies.
- Strict TypeScript.
- Never start a dev server.
- Use the exact file paths and signatures requested.
