# Portfolio subagents

This repo uses Pi's `@tintinweb/pi-subagents` extension instead of custom orchestration code.

## Installed once

```bash
pi install npm:@tintinweb/pi-subagents
```

## Project agents

Agent definitions live here:

- `.pi/agents/qwen-implementer.md` — local Qwen coding agent with edit tools
- `.pi/agents/qwen-reviewer.md` — local Qwen read-only reviewer/validator

Pi discovers `.pi/agents/*.md` when started in this repo.

## Use

Start Pi in repo:

```bash
cd D:\Development\portfolio
pi
```

Then ask parent agent to spawn subagents, for example:

```text
Use qwen-implementer to improve project card styling. Then use qwen-reviewer to validate and review the result.
```

The subagents run through the extension UI, with live status, logs/transcripts, and controls.

## Validation

Reviewer should run:

```bash
npm run validate
```
