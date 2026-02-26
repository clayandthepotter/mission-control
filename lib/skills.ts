import { fetchFile } from "./github";
import { getCronJobs, AGENT_NAMES, type CronJob } from "./crons";

const OWNER = "clayandthepotter";
const REPO = "openclaw-org";
const BRANCH = "master";

export interface SkillInfo {
  name: string;
  description: string | null;
  /** Cron jobs that reference this skill */
  cronRefs: { id: string; name: string; agentId: string }[];
  /** Unique agent IDs that use this skill (via crons) */
  agentIds: string[];
}

export interface SkillDetail extends SkillInfo {
  /** Raw SKILL.md content */
  content: string;
  /** Sections parsed from SKILL.md */
  sections: { heading: string; body: string }[];
}

/** Fetch skill directory listing from GitHub API */
export async function getSkills(): Promise<SkillInfo[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/skills?ref=${BRANCH}`;
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "mission-control",
  };
  if (process.env.GITHUB_PAT) {
    h.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
  }

  try {
    const res = await fetch(url, { headers: h, cache: "no-store" });
    if (!res.ok) return [];
    const entries = (await res.json()) as { name: string; type: string }[];
    const skillNames = entries
      .filter((e) => e.type === "dir" && !e.name.startsWith("."))
      .map((e) => e.name)
      .sort();

    // Cross-reference with cron jobs
    const jobs = await getCronJobs();
    const cronBySkill = buildCronMap(jobs);

    // Fetch descriptions in parallel
    const skills = await Promise.all(
      skillNames.map(async (name) => {
        const desc = await fetchSkillDescription(name);
        const refs = cronBySkill.get(name) ?? [];
        return {
          name,
          description: desc,
          cronRefs: refs.map((j) => ({ id: j.id, name: j.name, agentId: j.agentId })),
          agentIds: [...new Set(refs.map((j) => j.agentId))],
        };
      }),
    );

    return skills;
  } catch {
    return [];
  }
}

/** Fetch a single skill's full detail */
export async function getSkillDetail(name: string): Promise<SkillDetail | null> {
  const content = await fetchFile(`skills/${name}/SKILL.md`);
  if (!content) return null;

  const jobs = await getCronJobs();
  const cronBySkill = buildCronMap(jobs);
  const refs = cronBySkill.get(name) ?? [];

  return {
    name,
    description: extractPurpose(content),
    content,
    sections: parseSections(content),
    cronRefs: refs.map((j) => ({ id: j.id, name: j.name, agentId: j.agentId })),
    agentIds: [...new Set(refs.map((j) => j.agentId))],
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

/** Fetch just the purpose line from SKILL.md */
async function fetchSkillDescription(name: string): Promise<string | null> {
  const content = await fetchFile(`skills/${name}/SKILL.md`);
  if (!content) return null;
  return extractPurpose(content);
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

  // Filter out the H1 title (already shown in page header) and empty sections
  return sections.filter((s) => s.body.length > 0);
}

export { AGENT_NAMES };
