# Mission Control — WARP Changelog

## v0.1.0 — Initial Build (2025-02-22)

### Features
- **Overview Dashboard** (`/`) — 4-column agent grid with live status badges, task counts, and recent commit feed
- **Agent Detail** (`/agent/[id]`) — per-agent view with session state, TODO summary, metadata, and related commits
- **Task Board** (`/tasks`) — kanban-style pending/completed columns parsed from `TODO.md` in the org repo
- **Activity Feed** (`/activity`) — commit history grouped by day, pulled from GitHub API

### Data Layer
- `lib/github.ts` — fetches raw files and commits from `clayandthepotter/openclaw-org` via GitHub API with 2-min ISR cache
- `lib/agents.ts` — 8-agent config (Alfred, Devin, Rick, Rene, Daniel, Friedrich, Laura, Persephany), status fetching from SESSION-STATE.md, TODO parsing

### Stack
- Next.js 16 + Tailwind CSS 4 + TypeScript
- Server Components with ISR (120s revalidation)
- Dark theme (gray-950 base)
