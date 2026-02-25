import { fetchFile } from "@/lib/github";

export const revalidate = 120;

interface TodoItem {
  title: string;
  description: string;
  priority: string;
  complexity: string;
}

function parseTodoSection(md: string, sectionHeader: string): TodoItem[] {
  const items: TodoItem[] = [];
  const sectionIdx = md.indexOf(sectionHeader);
  if (sectionIdx === -1) return items;

  // Get the content after the section header until the next ## header
  const afterSection = md.slice(sectionIdx + sectionHeader.length);
  const nextSection = afterSection.search(/^## /m);
  const block = nextSection > -1 ? afterSection.slice(0, nextSection) : afterSection;

  // Each task starts with ### 
  const taskBlocks = block.split(/^### /m).filter(Boolean);

  for (const tb of taskBlocks) {
    const lines = tb.trim().split("\n");
    const title = lines[0]?.trim() || "Untitled";
    const descMatch = tb.match(/\*\*Description:\*\*\s*(.+)/);
    const prioMatch = tb.match(/\*\*Priority:\*\*\s*(.+)/);
    const compMatch = tb.match(/\*\*Complexity:\*\*\s*(.+)/);

    items.push({
      title,
      description: descMatch?.[1]?.trim() || "",
      priority: prioMatch?.[1]?.trim() || "—",
      complexity: compMatch?.[1]?.trim() || "—",
    });
  }

  return items;
}

function priorityColor(p: string): string {
  const low = p.toLowerCase();
  if (low.includes("critical") || low.includes("high")) return "text-red-400";
  if (low.includes("medium")) return "text-amber-400";
  if (low.includes("low")) return "text-blue-400";
  return "text-neutral-400";
}

export default async function TasksPage() {
  const todoMd = await fetchFile("TODO.md");

  const pending = todoMd ? parseTodoSection(todoMd, "## Pending") : [];
  const completed = todoMd ? parseTodoSection(todoMd, "## Completed") : [];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>Task Board</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>Organization TODOs</p>
        {!todoMd && (
          <div className="rounded-xl p-8 text-center" style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--muted-2)" }}>
            No TODO.md found in the repository.
          </div>
        )}

        {todoMd && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pending Column */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Pending ({pending.length})
                </h2>
              </div>
              <div className="space-y-3">
                {pending.length === 0 && (
                  <div className="rounded-xl border p-4 text-center text-sm" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
                    All clear!
                  </div>
                )}
                {pending.map((item, i) => (
                  <div key={i} className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <div className="font-medium text-sm">{item.title}</div>
                    {item.description && (
                      <div className="mt-1 text-xs line-clamp-2" style={{ color: "var(--muted-2)" }}>{item.description}</div>
                    )}
                    <div className="mt-3 flex gap-3 text-xs">
                      <span className={priorityColor(item.priority)}>{item.priority}</span>
                      <span style={{ color: "var(--muted-2)" }}>·</span>
                      <span style={{ color: "var(--muted-2)" }}>{item.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Completed ({completed.length})
                </h2>
              </div>
              <div className="space-y-3">
                {completed.length === 0 && (
                  <div className="rounded-xl p-4 text-center text-sm" style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--muted-2)" }}>
                    Nothing completed yet.
                  </div>
                )}
                {completed.map((item, i) => (
                  <div key={i} className="rounded-xl p-4 opacity-70" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
                    <div className="font-medium text-sm line-through">{item.title}</div>
                    {item.description && (
                      <div className="mt-1 text-xs line-clamp-2" style={{ color: "var(--muted-2)" }}>{item.description}</div>
                    )}
                    <div className="mt-3 flex gap-3 text-xs">
                      <span style={{ color: "var(--muted-2)" }}>{item.priority}</span>
                      <span style={{ color: "var(--muted-2)" }}>·</span>
                      <span style={{ color: "var(--muted-2)" }}>{item.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
