import Link from "next/link";
import { getKnowledgeTree, type KnowledgeEntry } from "@/lib/knowledge";

export const revalidate = 300;

export default async function DocsIndexPage() {
  const tree = await getKnowledgeTree();

  // Count total files
  function countFiles(entries: KnowledgeEntry[]): number {
    let count = 0;
    for (const e of entries) {
      if (e.type === "file") count++;
      if (e.children) count += countFiles(e.children);
    }
    return count;
  }
  const totalFiles = countFiles(tree);

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Knowledge Base
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        {totalFiles} documents in the organization knowledge repository
      </p>

      <div className="space-y-4">
        {tree.map((entry) => (
          <div key={entry.path}>
            {entry.type === "dir" ? (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-2)" }}>
                  {entry.name}/
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {entry.children?.map((child) => (
                    <Link
                      key={child.path}
                      href={`/docs/${child.path}`}
                      className="rounded-xl border px-4 py-3 lp-card-hover block"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <div className="text-sm font-medium">{child.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href={`/docs/${entry.path}`}
                className="rounded-xl border px-4 py-3 lp-card-hover block"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="text-sm font-medium">{entry.name}</div>
              </Link>
            )}
          </div>
        ))}

        {tree.length === 0 && (
          <div className="rounded-xl border p-8 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
            No knowledge files found. Check GitHub API access.
          </div>
        )}
      </div>
    </div>
  );
}
