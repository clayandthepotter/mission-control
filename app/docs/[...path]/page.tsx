import Link from "next/link";
import { getKnowledgeTree, getKnowledgeFile, type KnowledgeEntry } from "@/lib/knowledge";

export const revalidate = 300;

export default async function DocsPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: segments } = await params;
  const filePath = segments.join("/");
  const [tree, content] = await Promise.all([
    getKnowledgeTree(),
    getKnowledgeFile(filePath),
  ]);

  return (
    <div className="flex gap-0 min-h-[calc(100vh-4rem)]">
      {/* Sidebar tree */}
      <aside
        className="w-56 shrink-0 border-r overflow-y-auto px-3 py-6"
        style={{ borderColor: "var(--border)", background: "var(--paper)" }}
      >
        <Link href="/docs" className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: "var(--muted-2)" }}>
          Knowledge Base
        </Link>
        <TreeNode entries={tree} current={filePath} depth={0} />
      </aside>

      {/* Content */}
      <main className="flex-1 px-8 py-6 overflow-auto">
        <div className="max-w-3xl">
          <div className="mb-4 text-xs font-mono" style={{ color: "var(--muted-2)" }}>
            knowledge/{filePath}
          </div>
          {content ? (
            <div
              className="rounded-xl p-6"
              style={{ background: "var(--paper)", border: "1px solid var(--border)" }}
            >
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono" style={{ color: "var(--muted)" }}>
                {content}
              </pre>
            </div>
          ) : (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--muted-2)" }}
            >
              File not found: knowledge/{filePath}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TreeNode({ entries, current, depth }: { entries: KnowledgeEntry[]; current: string; depth: number }) {
  // Sort: dirs first, then files
  const sorted = [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <ul className="space-y-0.5" style={{ paddingLeft: depth > 0 ? "12px" : "0" }}>
      {sorted.map((entry) => {
        const isActive = entry.path === current;
        if (entry.type === "dir") {
          return (
            <li key={entry.path}>
              <div className="text-xs font-medium py-1 px-2" style={{ color: "var(--muted-2)" }}>
                {entry.name}/
              </div>
              {entry.children && entry.children.length > 0 && (
                <TreeNode entries={entry.children} current={current} depth={depth + 1} />
              )}
            </li>
          );
        }
        return (
          <li key={entry.path}>
            <Link
              href={`/docs/${entry.path}`}
              className="block rounded px-2 py-1 text-xs truncate transition-colors"
              style={{
                background: isActive ? "var(--surface)" : "transparent",
                color: isActive ? "var(--foreground)" : "var(--muted)",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              {entry.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
