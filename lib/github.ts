const OWNER = "clayandthepotter";
const REPO = "openclaw-org";
const BRANCH = "master";

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "mission-control",
  };
  if (process.env.GITHUB_PAT) {
    h.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
  }
  return h;
}

/** Fetch raw file content from GitHub */
export async function fetchFile(path: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: headers(),
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

/** Fetch recent commits (proxy for agent activity) */
export async function fetchCommits(
  limit = 20,
): Promise<
  { sha: string; message: string; date: string; author: string }[]
> {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/commits?sha=${BRANCH}&per_page=${limit}`;
    const res = await fetch(url, {
      headers: { ...headers(), Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => ({
      sha: (c.sha as string).slice(0, 7),
      message: (c.commit as Record<string, unknown> & { message: string }).message.split("\n")[0],
      date: ((c.commit as Record<string, unknown> & { author: Record<string, string> }).author).date,
      author: ((c.commit as Record<string, unknown> & { author: Record<string, string> }).author).name,
    }));
  } catch {
    return [];
  }
}
