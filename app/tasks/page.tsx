import Link from "next/link";
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
  return "text-gray-400";
}

export default async function TasksPage() {
  const todoMd = await fetchFile("TODO.md");

  const pending = todoMd ? parseTodoSection(todoMd, "## Pending") : [];
  const completed = todoMd ? parseTodoSection(todoMd, "## Completed") : [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Task Board</h1>
            <p className="text-sm text-gray-500">Organization TODOs</p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-white">Overview</Link>
            <Link href="/tasks" className="text-gray-300 hover:text-white">Tasks</Link>
            <Link href="/activity" className="text-gray-500 hover:text-white">Activity</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!todoMd && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
            No TODO.md found in the repository.
          </div>
        )}

        {todoMd && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pending Column */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Pending ({pending.length})
                </h2>
              </div>
              <div className="space-y-3">
                {pending.length === 0 && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center text-sm text-gray-500">
                    All clear!
                  </div>
                )}
                {pending.map((item, i) => (
                  <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                    <div className="font-medium text-sm">{item.title}</div>
                    {item.description && (
                      <div className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</div>
                    )}
                    <div className="mt-3 flex gap-3 text-xs">
                      <span className={priorityColor(item.priority)}>{item.priority}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-500">{item.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Completed ({completed.length})
                </h2>
              </div>
              <div className="space-y-3">
                {completed.length === 0 && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center text-sm text-gray-500">
                    Nothing completed yet.
                  </div>
                )}
                {completed.map((item, i) => (
                  <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 opacity-70">
                    <div className="font-medium text-sm line-through">{item.title}</div>
                    {item.description && (
                      <div className="mt-1 text-xs text-gray-600 line-clamp-2">{item.description}</div>
                    )}
                    <div className="mt-3 flex gap-3 text-xs">
                      <span className="text-gray-600">{item.priority}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-gray-600">{item.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
