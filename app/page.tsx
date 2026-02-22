import Link from "next/link";
import { getAllAgentStatuses, parseSessionState } from "@/lib/agents";
import { fetchCommits } from "@/lib/github";

export const revalidate = 120;

export default async function DashboardPage() {
  const [statuses, commits] = await Promise.all([
    getAllAgentStatuses(),
    fetchCommits(10),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Mission Control</h1>
            <p className="text-sm text-gray-500">LeadsPanther AI Organization</p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-300 hover:text-white">Overview</Link>
            <Link href="/tasks" className="text-gray-500 hover:text-white">Tasks</Link>
            <Link href="/activity" className="text-gray-500 hover:text-white">Activity</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Agent Grid */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-300">Agents</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statuses.map(({ agent, sessionState, todoSummary }) => {
              const fields = sessionState ? parseSessionState(sessionState) : {};
              return (
                <Link
                  key={agent.id}
                  href={`/agent/${agent.id}`}
                  className="group rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-600 hover:bg-gray-800/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{agent.emoji}</span>
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.role}</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        fields.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-gray-700 text-gray-400"
                      }`}>
                        {fields.status || (sessionState ? "Connected" : "No data")}
                      </span>
                    </div>
                    {fields.lastUpdated && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Updated</span>
                        <span className="text-gray-400">{fields.lastUpdated}</span>
                      </div>
                    )}
                    {todoSummary && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tasks</span>
                        <span className="text-gray-400">{todoSummary.pending} pending · {todoSummary.completed} done</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-300">Recent Activity</h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            {commits.length === 0 && (
              <div className="p-6 text-center text-gray-500">No recent activity</div>
            )}
            {commits.map((commit) => (
              <div key={commit.sha} className="flex items-start gap-4 px-5 py-3">
                <code className="mt-0.5 shrink-0 rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400 font-mono">
                  {commit.sha}
                </code>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{commit.message}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {commit.author} · {new Date(commit.date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
