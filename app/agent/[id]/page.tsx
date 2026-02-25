import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENTS, getAgentStatus, parseSessionState } from "@/lib/agents";
import { fetchCommits } from "@/lib/github";

export const revalidate = 120;


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
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      {/* Agent header */}
      <div className="flex items-center gap-4">
        <Link href="/agents" className="text-sm" style={{ color: "var(--muted-2)" }}>&larr; Back</Link>
        <span className="text-2xl">{agent.emoji}</span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{agent.name}</h1>
          <p className="text-sm" style={{ color: "var(--muted-2)" }}>{agent.role} · {agent.department}</p>
        </div>
        <span className="ml-auto rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: fields.status === "Active" ? "rgba(34,197,94,0.1)" : "var(--paper)",
            color: fields.status === "Active" ? "#22c55e" : "var(--muted-2)",
          }}>
          {fields.status || (status.sessionState ? "Connected" : "No data")}
        </span>
      </div>
        {/* Session State */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Session State</h2>
          {status.sessionState ? (
            <div className="rounded-xl p-5" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed" style={{ color: "var(--muted)" }}>
                {status.sessionState}
              </pre>
            </div>
          ) : (
            <div className="rounded-xl p-6 text-center" style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--muted-2)" }}>
              No session state available. This agent&apos;s workspace is not tracked in the main repo.
            </div>
          )}
        </section>

        {/* TODO Summary */}
        {status.todoSummary && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Task Summary</h2>
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl p-5 text-center" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
                <div className="text-3xl font-bold" style={{ color: "var(--gold)" }}>{status.todoSummary.pending}</div>
                <div className="mt-1 text-xs" style={{ color: "var(--muted-2)" }}>Pending</div>
              </div>
              <div className="flex-1 rounded-xl p-5 text-center" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
                <div className="text-3xl font-bold text-emerald-400">{status.todoSummary.completed}</div>
                <div className="mt-1 text-xs" style={{ color: "var(--muted-2)" }}>Completed</div>
              </div>
            </div>
          </section>
        )}

        {/* Key Details */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Details</h2>
          <div className="rounded-xl text-sm" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted-2)" }}>Agent ID</span>
              <code className="font-mono" style={{ color: "var(--muted)" }}>{agent.id}</code>
            </div>
            <div className="flex justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted-2)" }}>Model</span>
              <span style={{ color: "var(--muted)" }}>{agent.model}</span>
            </div>
            <div className="flex justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted-2)" }}>Department</span>
              <span style={{ color: "var(--muted)" }}>{agent.department}</span>
            </div>
            <div className="flex justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted-2)" }}>Reports To</span>
              <span style={{ color: "var(--muted)" }}>{agent.reportsTo ?? "—"}</span>
            </div>
            {agent.telegramBotName && (
              <div className="flex justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted-2)" }}>Telegram</span>
                <span style={{ color: "var(--muted)" }}>@{agent.telegramBotName}</span>
              </div>
            )}
            {fields.lastUpdated && (
              <div className="flex justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted-2)" }}>Last Updated</span>
                <span style={{ color: "var(--muted)" }}>{fields.lastUpdated}</span>
              </div>
            )}
            {fields.phase && (
              <div className="flex justify-between px-5 py-3">
                <span style={{ color: "var(--muted-2)" }}>Strategy Phase</span>
                <span style={{ color: "var(--muted)" }}>{fields.phase}</span>
              </div>
            )}
          </div>
        </section>

        {/* Related Commits */}
        <section>
          {/* Skills & Tools */}
          {(agent.keySkills.length > 0 || agent.tools.length > 0) && (
            <div className="flex gap-4">
              {agent.keySkills.length > 0 && (
                <div className="flex-1">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Skills ({agent.keySkills.length})</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.keySkills.map((s) => (
                      <span key={s} className="rounded-full px-3 py-1 text-xs" style={{ background: "var(--surface)", color: "var(--muted)" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {agent.tools.length > 0 && (
                <div className="flex-1">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>Tools ({agent.tools.length})</h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.tools.map((t) => (
                      <span key={t} className="rounded-full px-3 py-1 text-xs" style={{ background: "var(--surface)", color: "var(--muted)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>
            Related Commits ({agentCommits.length})
          </h2>
          <div className="rounded-xl" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
            {agentCommits.length === 0 && (
              <div className="p-6 text-center" style={{ color: "var(--muted-2)" }}>No commits found</div>
            )}
            {agentCommits.slice(0, 15).map((commit) => (
              <div key={commit.sha} className="flex items-start gap-4 px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <code className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-mono" style={{ background: "var(--surface)", color: "var(--muted)" }}>
                  {commit.sha}
                </code>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{commit.message}</div>
                  <div className="mt-0.5 text-xs" style={{ color: "var(--muted-2)" }}>
                    {new Date(commit.date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
    </div>
  );
}
