const OWNER = "clayandthepotter";
const REPO = "openclaw-org";
const BRANCH = "master";

export interface SkillInfo {
  name: string;
  description: string | null;
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
    const res = await fetch(url, { headers: h, next: { revalidate: 300 } });
    if (!res.ok) return [];
    const entries = (await res.json()) as { name: string; type: string }[];
    return entries
      .filter((e) => e.type === "dir" && !e.name.startsWith("."))
      .map((e) => ({ name: e.name, description: null }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
