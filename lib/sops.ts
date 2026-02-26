import { fetchFile } from "./github";

const OWNER = "clayandthepotter";
const REPO = "openclaw-org";
const BRANCH = "master";

export interface SopInfo {
  name: string;
  title: string;
  tag: string | null;
  owner: string | null;
  timeline: string | null;
}

export interface SopDetail extends SopInfo {
  content: string;
  sections: { heading: string; body: string }[];
}

/** Fetch SOP directory listing from GitHub API */
export async function getSops(): Promise<SopInfo[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/docs/sops?ref=${BRANCH}`;
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
    const sopFiles = entries
      .filter((e) => e.type === "file" && e.name.endsWith(".md"))
      .map((e) => e.name.replace(/\.md$/, ""))
      .sort();

    // Fetch metadata in parallel
    return Promise.all(sopFiles.map((name) => fetchSopMeta(name)));
  } catch {
    return [];
  }
}

/** Fetch a single SOP's full detail */
export async function getSopDetail(name: string): Promise<SopDetail | null> {
  const content = await fetchFile(`docs/sops/${name}.md`);
  if (!content) return null;

  const meta = parseSopMeta(name, content);

  return {
    ...meta,
    content,
    sections: parseSections(content),
  };
}

async function fetchSopMeta(name: string): Promise<SopInfo> {
  const content = await fetchFile(`docs/sops/${name}.md`);
  if (!content) return { name, title: formatTitle(name), tag: null, owner: null, timeline: null };
  return parseSopMeta(name, content);
}

function parseSopMeta(name: string, md: string): SopInfo {
  // Extract H1 title
  const titleMatch = md.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1].replace(/^SOP\s*[—–-]\s*/, "") : formatTitle(name);

  // Extract tag line
  const tagMatch = md.match(/\*\*Tag\*\*:\s*(.+)/);
  const tag = tagMatch ? tagMatch[1].trim() : null;

  // Extract owner
  const ownerMatch = md.match(/\*\*Owner\*\*:\s*(.+)/);
  const owner = ownerMatch ? ownerMatch[1].trim() : null;

  // Extract timeline
  const timelineMatch = md.match(/\*\*Timeline\*\*:\s*(.+)/);
  const timeline = timelineMatch ? timelineMatch[1].trim() : null;

  return { name, title, tag, owner, timeline };
}

function formatTitle(name: string): string {
  return name
    .replace(/^sop-/, "")
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Parse markdown into sections */
function parseSections(md: string): { heading: string; body: string }[] {
  const lines = md.split("\n");
  const sections: { heading: string; body: string }[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      if (current) sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });
      current = { heading: headingMatch[2], lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });

  return sections.filter((s) => s.body.length > 0);
}
