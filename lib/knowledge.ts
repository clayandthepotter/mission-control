import { fetchFile } from "./github";

const OWNER = "clayandthepotter";
const REPO = "openclaw-org";
const BRANCH = "master";

export interface KnowledgeEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: KnowledgeEntry[];
}

/** Fetch tree listing of knowledge/ directory */
export async function getKnowledgeTree(): Promise<KnowledgeEntry[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
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
    const data = (await res.json()) as {
      tree: { path: string; type: string }[];
    };

    // Filter to knowledge/ paths only
    const knowledgePaths = data.tree
      .filter((e) => e.path.startsWith("knowledge/"))
      .map((e) => ({
        fullPath: e.path,
        relativePath: e.path.replace("knowledge/", ""),
        type: e.type === "tree" ? ("dir" as const) : ("file" as const),
      }))
      .filter((e) => e.relativePath.length > 0);

    // Build nested tree
    return buildTree(knowledgePaths);
  } catch {
    return [];
  }
}

function buildTree(
  paths: { fullPath: string; relativePath: string; type: "file" | "dir" }[],
): KnowledgeEntry[] {
  const root: KnowledgeEntry[] = [];

  // Sort: dirs first, then files alphabetically
  const sorted = [...paths].sort((a, b) => {
    const aDepth = a.relativePath.split("/").length;
    const bDepth = b.relativePath.split("/").length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.relativePath.localeCompare(b.relativePath);
  });

  const dirMap = new Map<string, KnowledgeEntry>();

  for (const item of sorted) {
    const parts = item.relativePath.split("/");
    const name = parts[parts.length - 1];
    const entry: KnowledgeEntry = {
      name,
      path: item.relativePath,
      type: item.type,
    };

    if (item.type === "dir") {
      entry.children = [];
      dirMap.set(item.relativePath, entry);
    }

    if (parts.length === 1) {
      root.push(entry);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = dirMap.get(parentPath);
      if (parent?.children) {
        parent.children.push(entry);
      }
    }
  }

  return root;
}

/** Fetch a single knowledge file's content */
export async function getKnowledgeFile(relativePath: string): Promise<string | null> {
  return fetchFile(`knowledge/${relativePath}`);
}

/** Get daily notes (files in knowledge/notes/ matching YYYY-MM-DD pattern) */
export async function getDailyNotes(): Promise<{ date: string; path: string }[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/knowledge/notes?ref=${BRANCH}`;
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
    return entries
      .filter((e) => e.type === "file" && /^\d{4}-\d{2}-\d{2}\.md$/.test(e.name))
      .map((e) => ({
        date: e.name.replace(".md", ""),
        path: `notes/${e.name}`,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}
