# Portfolio

React + TypeScript portfolio boilerplate built with Vite.

## Features

- Responsive single-page layout
- Hero, about, projects, skills, and contact sections
- Editable project/skill arrays in `src/App.tsx`
- Lightweight CSS, no UI framework lock-in

## Start

```bash
npm install
npm run dev
```

## Customize

1. Replace `Your Name`, email, GitHub, LinkedIn, and location placeholders in `src/App.tsx`. DONE
2. Update `projects` and `skills` arrays.
3. Add screenshots/assets under `src/assets/` or `public/`.
4. Tune colors and spacing in `src/App.css` and `src/index.css`.

## Scripts

- `npm run dev` - local dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint with Oxlint
- `npm run validate` - lint + production build
- `npm run ai:qwen -- "task"` - legacy one-shot Qwen child agent, then validate
- `npm run ai:qwen-review -- "task"` - legacy Qwen child agent + validation + read-only Qwen reviewer

## AI workflow

Preferred: Pi subagents via `SUBAGENTS.md`.

```bash
cd D:\Development\portfolio
pi
```

Then ask Pi parent:

```text
Use qwen-implementer to make the change. Then use qwen-reviewer to validate and review it.
```

Legacy script details remain in `AI_WORKFLOW.md`.
