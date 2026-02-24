import Link from "next/link";
import { fetchCommits } from "@/lib/github";

export const revalidate = 120;

export default async function ActivityPage() {
  const commits = await fetchCommits(50);

  // Group commits by date
  const grouped: Record<string, typeof commits> = {};
  for (const c of commits) {
    const day = new Date(c.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(c);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Activity Feed</h1>
            <p className="text-sm text-gray-500">Recent commits across the organization</p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-white">Overview</Link>
            <Link href="/products" className="text-gray-500 hover:text-white">Products</Link>
            <Link href="/costs" className="text-gray-500 hover:text-white">Costs</Link>
            <Link href="/tasks" className="text-gray-500 hover:text-white">Tasks</Link>
            <Link href="/activity" className="text-gray-300 hover:text-white">Activity</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {commits.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
            No activity found.
          </div>
        )}

        {Object.entries(grouped).map(([day, dayCommits]) => (
          <section key={day}>
            <h2 className="mb-3 text-sm font-semibold text-gray-500">{day}</h2>
            <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
              {dayCommits.map((commit) => (
                <div key={commit.sha} className="flex items-start gap-4 px-5 py-3">
                  <code className="mt-0.5 shrink-0 rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400 font-mono">
                    {commit.sha}
                  </code>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{commit.message}</div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {commit.author} · {new Date(commit.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
