import { fetchFile } from "./github";

export interface CronJob {
  id: string;
  name: string;
  agentId: string;
  enabled: boolean;
  schedule: string;
  timezone: string;
  description: string;
  lastStatus: string | null;
  lastRunAt: string | null;
}

interface RawJob {
  id: string;
  name: string;
  agentId: string;
  enabled: boolean;
  schedule: { expr: string; tz: string };
  payload: { text: string };
  state?: {
    lastRunStatus?: string;
    lastStatus?: string;
    lastRunAtMs?: number;
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
      lastStatus: j.state?.lastStatus ?? j.state?.lastRunStatus ?? null,
      lastRunAt: j.state?.lastRunAtMs
        ? new Date(j.state.lastRunAtMs).toISOString()
        : null,
    }));
  } catch {
    return [];
  }
}

function extractDescription(payloadText: string): string {
  // Take the first sentence after the "— " header
  const match = payloadText.match(/^[A-Z ]+—\s*(.+?)(?:\.\s|\.\(|$)/);
  if (match) return match[1].trim();
  // Fallback: first 120 chars
  return payloadText.slice(0, 120).trim();
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
