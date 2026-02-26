# Mission Control — WARP Changelog

## v0.3.0 — BMHQ-Inspired Overhaul (2025-02-26)

### New Features
- **Kanban Task Board** (`/tasks`) — 5-column board (Backlog/Queued/In Progress/Review/Done), agent filter bar, kanban/table view toggle, stage transition buttons on cards
- **Create Task** (`/tasks/new`) — form to create new cron jobs with agent assignment, schedule presets, stage selection, and skill references; commits directly to GitHub
- **Task Stage API** (`/api/tasks`) — PATCH to move tasks between stages, POST to create new tasks; both commit to `jobs.json` via GitHub API
- **Rich Skills Page** (`/skills`) — cards with descriptions extracted from SKILL.md, agent cross-references, and cron usage counts
- **Skill Detail** (`/skills/[name]`) — full SKILL.md rendering with parsed sections, agent/cron cross-references, raw source toggle
- **Knowledge Browser** (`/docs`, `/docs/[...path]`) — tree sidebar navigation of `knowledge/` directory, markdown content viewer
- **Daily Notes** (`/notes`) — lists `knowledge/notes/YYYY-MM-DD.md` files with formatted dates
- **Agent Assigned Jobs** — `/agent/[id]` now shows all cron jobs assigned to that agent with stage badges, schedule, skill links, and run status
- **Enhanced Crons Page** (`/crons`) — 8-column table with agent emojis, human-readable schedules, skill links, status dots, and relative time

### Skills & Model Audit
- Created 7 skill files: `model-audit`, `morning-ops`, `evening-ops`, `lead-research`, `outreach-ops`, `content-production`, `pipeline-review`
- Refactored all 24 cron job payloads from inline text to skill references
- Weekly model audit cron (Sundays midnight) — 3-tier stack philosophy: best-in-class default, budget runner-up, free failsafe
- Approval chain: Rene researches → Alfred relays → Clayton approves → Alfred applies

### Data Layer
- `lib/crons.ts` — task stages, humanSchedule(), relativeTime(), agent name/emoji maps, getCronJobsByAgent()
- `lib/skills.ts` — SKILL.md content fetching, description extraction, cron cross-references
- `lib/knowledge.ts` — recursive tree fetching from GitHub, daily notes listing
- `lib/github.ts` — added fetchFileSha() and updateFileOnGitHub() for write operations
- `jobs.json` — all 24 jobs now have `stage` field for kanban tracking

### UI
- Sidebar expanded: added Knowledge and Notes nav items
- TaskCard client component with loading states and stage transition buttons

## v0.1.0 — Initial Build (2025-02-22)

### Features
- **Overview Dashboard** (`/`) — 4-column agent grid with live status badges, task counts, and recent commit feed
- **Agent Detail** (`/agent/[id]`) — per-agent view with session state, TODO summary, metadata, and related commits
- **Activity Feed** (`/activity`) — commit history grouped by day, pulled from GitHub API

### Stack
- Next.js 16 + Tailwind CSS 4 + TypeScript
- Server Components with ISR (120s revalidation)
- Dark theme (gray-950 base)
