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

## Completed

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
