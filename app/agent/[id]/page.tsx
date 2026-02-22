import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENTS, getAgentStatus, parseSessionState } from "@/lib/agents";
import { fetchCommits } from "@/lib/github";

export const revalidate = 120;

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }));
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = AGENTS.find((a) => a.id === id);
  if (!agent) notFound();

  const [status, commits] = await Promise.all([
    getAgentStatus(agent),
    fetchCommits(30),
  ]);

  const fields = status.sessionState ? parseSessionState(status.sessionState) : {};

  // Filter commits by agent name (rough heuristic: commit message mentions agent name)
  const agentCommits = agent.id === "orchestrator"
    ? commits // Alfred manages most commits
    : commits.filter((c) => c.message.toLowerCase().includes(agent.name.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">&larr; Back</Link>
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-sm text-gray-500">{agent.role}</p>
          </div>
          <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            fields.status === "Active"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-gray-700 text-gray-400"
          }`}>
            {fields.status || (status.sessionState ? "Connected" : "No data")}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Session State */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Session State</h2>
          {status.sessionState ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
                {status.sessionState}
              </pre>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-500">
              No session state available. This agent&apos;s workspace is not tracked in the main repo.
            </div>
          )}
        </section>

        {/* TODO Summary */}
        {status.todoSummary && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Task Summary</h2>
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl border border-gray-800 bg-gray-900 p-5 text-center">
                <div className="text-3xl font-bold text-amber-400">{status.todoSummary.pending}</div>
                <div className="mt-1 text-xs text-gray-500">Pending</div>
              </div>
              <div className="flex-1 rounded-xl border border-gray-800 bg-gray-900 p-5 text-center">
                <div className="text-3xl font-bold text-emerald-400">{status.todoSummary.completed}</div>
                <div className="mt-1 text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </section>
        )}

        {/* Key Details */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Details</h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800 text-sm">
            <div className="flex justify-between px-5 py-3">
              <span className="text-gray-500">Agent ID</span>
              <code className="text-gray-400 font-mono">{agent.id}</code>
            </div>
            {fields.lastUpdated && (
              <div className="flex justify-between px-5 py-3">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-300">{fields.lastUpdated}</span>
              </div>
            )}
            {fields.phase && (
              <div className="flex justify-between px-5 py-3">
                <span className="text-gray-500">Strategy Phase</span>
                <span className="text-gray-300">{fields.phase}</span>
              </div>
            )}
          </div>
        </section>

        {/* Related Commits */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Related Commits ({agentCommits.length})
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            {agentCommits.length === 0 && (
              <div className="p-6 text-center text-gray-500">No commits found</div>
            )}
            {agentCommits.slice(0, 15).map((commit) => (
              <div key={commit.sha} className="flex items-start gap-4 px-5 py-3">
                <code className="mt-0.5 shrink-0 rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400 font-mono">
                  {commit.sha}
                </code>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{commit.message}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {new Date(commit.date).toLocaleDateString("en-US", {
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
