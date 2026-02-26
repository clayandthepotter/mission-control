import { fetchFile } from "./github";

export type TaskStage = "backlog" | "queued" | "in-progress" | "review" | "done";

export const STAGES: { id: TaskStage; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#64748b" },
  { id: "queued", label: "Queued", color: "#f59e0b" },
  { id: "in-progress", label: "In Progress", color: "#3b82f6" },
  { id: "review", label: "Review", color: "#a855f7" },
  { id: "done", label: "Done", color: "#22c55e" },
];

export interface CronJob {
  id: string;
  name: string;
  agentId: string;
  enabled: boolean;
  schedule: string;
  timezone: string;
  description: string;
  skillRef: string | null;
  stage: TaskStage;
  lastStatus: "ok" | "skipped" | "error" | null;
  lastRunAt: string | null;
  lastRunAtMs: number | null;
  lastError: string | null;
  lastDurationMs: number | null;
  nextRunAtMs: number | null;
}

interface RawJob {
  id: string;
  name: string;
  agentId: string;
  enabled: boolean;
  stage?: string;
  schedule: { expr: string; tz: string };
  payload: { text: string };
  state?: {
    lastRunStatus?: string;
    lastStatus?: string;
    lastRunAtMs?: number;
    lastError?: string;
    lastDurationMs?: number;
    nextRunAtMs?: number;
  };
}

export async function getCronJobs(): Promise<CronJob[]> {
  const raw = await fetchFile("cron/jobs.json");
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as { jobs: RawJob[] };
    return data.jobs.map((j) => ({
      id: j.id,
      name: j.name,
      agentId: j.agentId,
      enabled: j.enabled,
      schedule: j.schedule.expr,
      timezone: j.schedule.tz,
      description: extractDescription(j.payload.text),
      skillRef: extractSkillRef(j.payload.text),
      stage: normalizeStage(j.stage, j.enabled),
      lastStatus: normalizeStatus(j.state?.lastStatus ?? j.state?.lastRunStatus ?? null),
      lastRunAt: j.state?.lastRunAtMs
        ? new Date(j.state.lastRunAtMs).toISOString()
        : null,
      lastRunAtMs: j.state?.lastRunAtMs ?? null,
      lastError: j.state?.lastError ?? null,
      lastDurationMs: j.state?.lastDurationMs ?? null,
      nextRunAtMs: j.state?.nextRunAtMs ?? null,
    }));
  } catch {
    return [];
  }
}

/** Get cron jobs for a specific agent */
export async function getCronJobsByAgent(agentId: string): Promise<CronJob[]> {
  const all = await getCronJobs();
  return all.filter((j) => j.agentId === agentId);
}

function extractDescription(payloadText: string): string {
  const match = payloadText.match(/^[A-Z ]+—\s*(.+?)(?:\.\s|\.\(|$)/);
  if (match) return match[1].trim();
  return payloadText.slice(0, 120).trim();
}

function extractSkillRef(payloadText: string): string | null {
  const match = payloadText.match(/Run the (\S+) skill/);
  return match ? match[1] : null;
}

function normalizeStage(raw: string | undefined, enabled: boolean): TaskStage {
  const valid: TaskStage[] = ["backlog", "queued", "in-progress", "review", "done"];
  if (raw && valid.includes(raw as TaskStage)) return raw as TaskStage;
  return enabled ? "queued" : "backlog";
}

function normalizeStatus(raw: string | null): CronJob["lastStatus"] {
  if (!raw) return null;
  if (raw === "ok") return "ok";
  if (raw === "skipped") return "skipped";
  return "error";
}

/** Relative time string e.g. "3h ago" */
export function relativeTime(ms: number | null): string {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

/** Human-readable cron schedule */
export function humanSchedule(expr: string): string {
  const parts = expr.split(" ");
  if (parts.length !== 5) return expr;
  const [min, hour, , , dow] = parts;
  const time = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  if (dow === "*") return `Daily ${time}`;
  if (dow === "1-5") return `Weekdays ${time}`;
  if (dow === "0") return `Sundays ${time}`;
  const days: Record<string, string> = { "1": "Mon", "2": "Tue", "3": "Wed", "4": "Thu", "5": "Fri", "6": "Sat", "0": "Sun" };
  return `${days[dow] ?? dow} ${time}`;
}

/** Map agent IDs to display names */
export const AGENT_NAMES: Record<string, string> = {
  orchestrator: "Alfred",
  delivery_ops: "Devin",
  revenue: "Rick",
  rnd: "Rene",
  design: "Daniel",
  finance: "Friedrich",
  legal: "Laura",
  people: "Persephany",
};

export const AGENT_EMOJIS: Record<string, string> = {
  orchestrator: "🎯",
  delivery_ops: "🔧",
  revenue: "💰",
  rnd: "🔬",
  design: "🎨",
  finance: "📊",
  legal: "⚖️",
  people: "👥",
};
