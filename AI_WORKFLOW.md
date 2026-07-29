# AI Agent Workflow

Preferred workflow now uses Pi subagents from `@tintinweb/pi-subagents`. See `SUBAGENTS.md`.

Legacy scripts below still work, but custom maintenance should stay minimal.

## Legacy Qwen implementer

```bash
npm run ai:qwen -- "make the hero feel more premium"
```

What happens:

1. Spawns a child Pi agent with `--model qwen`.
2. Gives it edit tools scoped by instruction to this project.
3. Runs `npm run validate` after the child agent exits.

## Legacy Qwen implementer + Qwen reviewer

```bash
npm run ai:qwen-review -- "add a projects filter UI"
```

What happens:

1. Qwen implementer edits.
2. `npm run validate` runs `lint` + `build`.
3. Separate read-only Qwen reviewer inspects files and reports `PASS` or `FAIL`.

## Direct PowerShell usage

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-pair.ps1 `
  -ImplementModel qwen `
  -ReviewModel qwen `
  -Task "add smooth section reveal animations"
```

Useful flags:

- `-SkipValidate` skips `npm run validate`.
- `-SkipReview` disables reviewer even if `-ReviewModel` is set.
- `-DryRun` prints child-agent command without running it.

## Validation gate

```bash
npm run validate
```

Runs:

- `npm run lint`
- `npm run build`
