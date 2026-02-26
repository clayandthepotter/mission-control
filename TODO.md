# Mission Control — TODO

## Pending

### Deploy to Vercel
**Description:** Deploy the dashboard to Vercel and configure custom domain `dashboard.leadspanther.com`
**Priority:** High
**Complexity:** Low

### Add multi-repo support
**Description:** Extend GitHub data layer to pull from multiple repos (leadspanther-site, mission-control) in addition to openclaw-org
**Priority:** Medium
**Complexity:** Medium

### Real-time agent heartbeats
**Description:** Add WebSocket or polling-based live status updates instead of relying solely on ISR
**Priority:** Low
**Complexity:** High

### Drag-and-drop task board
**Description:** Add drag-and-drop functionality to the kanban board so tasks can be moved between columns by dragging
**Priority:** Medium
**Complexity:** Medium

### Markdown rendering in knowledge browser
**Description:** Render markdown files with proper formatting (headings, lists, links, code blocks) instead of raw pre-formatted text
**Priority:** Medium
**Complexity:** Low

## Completed

### BMHQ-inspired Mission Control overhaul
**Description:** 5-column kanban task board, create task form, task stage API, enhanced cron page, rich skills page + detail, knowledge browser, daily notes, agent assigned jobs section
**Priority:** High
**Complexity:** High

### Weekly model audit skill + cron
**Description:** Created model-audit skill with 3-tier stack philosophy and weekly cron job. Approval chain: Rene suggests → Alfred relays → Clayton approves → Alfred applies
**Priority:** High
**Complexity:** Medium

### Refactor cron payloads to skill references
**Description:** Created 7 skill files and refactored all 24 cron job payloads from inline text to skill references
**Priority:** High
**Complexity:** Medium

### Scaffold Next.js app
**Description:** Initialize mission-control project with Next.js 16, Tailwind CSS 4, and TypeScript
**Priority:** High
**Complexity:** Low

### Build GitHub data layer
**Description:** Create lib/github.ts and lib/agents.ts for fetching workspace files and commits from the org repo
**Priority:** High
**Complexity:** Medium

### Build overview dashboard page
**Description:** 4-column agent card grid with status badges, task counts, and recent commit activity feed
**Priority:** High
**Complexity:** Medium

### Build agent detail page
**Description:** Per-agent view showing session state, TODO summary, metadata, and related commits
**Priority:** High
**Complexity:** Medium

### Build task board
**Description:** Kanban-style two-column board parsing TODO.md from the repo into pending/completed cards
**Priority:** High
**Complexity:** Medium

### Build activity feed
**Description:** Full commit history page grouped by day with author and timestamp
**Priority:** Medium
**Complexity:** Low
