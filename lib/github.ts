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

/** Fetch file SHA (needed for updates) */
export async function fetchFileSha(path: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: { ...headers(), Accept: "application/vnd.github.v3+json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data as { sha: string }).sha;
  } catch {
    return null;
  }
}

/** Update a file on GitHub via commit */
export async function updateFileOnGitHub(
  path: string,
  content: string,
  message: string,
): Promise<boolean> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) return false;

  const sha = await fetchFileSha(path);
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

  // btoa doesn't exist in Node — use Buffer
  const encoded = Buffer.from(content, "utf-8").toString("base64");

  const body: Record<string, unknown> = {
    message,
    content: encoded,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        ...headers(),
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
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
