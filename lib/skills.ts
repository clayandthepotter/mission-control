import { fetchFile } from "./github";
import { getCronJobs, AGENT_NAMES, type CronJob } from "./crons";

export interface SkillInfo {
  name: string;
  description: string | null;
  category: string;
  /** Agent IDs from registry */
  agentIds: string[];
  /** External dependencies */
  deps: string[];
  /** Cron jobs that reference this skill */
  cronRefs: { id: string; name: string; agentId: string }[];
}

export interface SkillDetail extends SkillInfo {
  /** Raw SKILL.md content */
  content: string;
  /** Sections parsed from SKILL.md */
  sections: { heading: string; body: string }[];
}

interface RegistryEntry {
  name: string;
  description: string;
  category: string;
  agentIds: string[];
  deps: string[];
  source?: string;
}

/** Fetch all skills from REGISTRY.json */
export async function getSkills(): Promise<SkillInfo[]> {
  const raw = await fetchFile("skills/REGISTRY.json");
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as { skills: RegistryEntry[] };
    const jobs = await getCronJobs();
    const cronBySkill = buildCronMap(jobs);

    return data.skills.map((s) => {
      const refs = cronBySkill.get(s.name) ?? [];
      return {
        name: s.name,
        description: s.description,
        category: s.category,
        agentIds: s.agentIds,
        deps: s.deps,
        cronRefs: refs.map((j) => ({ id: j.id, name: j.name, agentId: j.agentId })),
      };
    });
  } catch {
    return [];
  }
}

/** Fetch a single skill's full detail */
export async function getSkillDetail(name: string): Promise<SkillDetail | null> {
  // First get registry info
  const regRaw = await fetchFile("skills/REGISTRY.json");
  const regEntry = regRaw
    ? (JSON.parse(regRaw) as { skills: RegistryEntry[] }).skills.find((s) => s.name === name)
    : null;

  // Try workspace skills first, then check if it has a SKILL.md at all
  const content = await fetchFile(`skills/${name}/SKILL.md`);
  if (!content && !regEntry) return null;

  const jobs = await getCronJobs();
  const cronBySkill = buildCronMap(jobs);
  const refs = cronBySkill.get(name) ?? [];

  return {
    name,
    description: regEntry?.description ?? (content ? extractPurpose(content) : null),
    category: regEntry?.category ?? "uncategorized",
    agentIds: regEntry?.agentIds ?? [],
    deps: regEntry?.deps ?? [],
    content: content ?? "",
    sections: content ? parseSections(content) : [],
    cronRefs: refs.map((j) => ({ id: j.id, name: j.name, agentId: j.agentId })),
  };
}

/** Build map from skill name → cron jobs that reference it */
function buildCronMap(jobs: CronJob[]): Map<string, CronJob[]> {
  const map = new Map<string, CronJob[]>();
  for (const job of jobs) {
    if (job.skillRef) {
      const arr = map.get(job.skillRef) ?? [];
      arr.push(job);
      map.set(job.skillRef, arr);
    }
  }
  return map;
}

/** Extract the Purpose section's first line */
function extractPurpose(md: string): string | null {
  const match = md.match(/## Purpose\s*\n([^\n]+)/);
  return match ? match[1].trim() : null;
}

/** Parse markdown into sections */
function parseSections(md: string): { heading: string; body: string }[] {
  const lines = md.split("\n");
  const sections: { heading: string; body: string }[] = [];
  let current: { heading: string; level: number; lines: string[] } | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      if (current) sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });
      current = { heading: headingMatch[2], level: headingMatch[1].length, lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });

  return sections.filter((s) => s.body.length > 0);
}

/** Category display config */
export const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  ops: { label: "Ops", color: "#3b82f6" },
  sales: { label: "Sales", color: "#22c55e" },
  content: { label: "Content", color: "#a855f7" },
  marketing: { label: "Marketing", color: "#f59e0b" },
  engineering: { label: "Engineering", color: "#06b6d4" },
  research: { label: "Research", color: "#ec4899" },
  finance: { label: "Finance", color: "#84cc16" },
  legal: { label: "Legal", color: "#64748b" },
  reference: { label: "Reference", color: "#94a3b8" },
  uncategorized: { label: "Other", color: "#6b7280" },
};

export { AGENT_NAMES };
