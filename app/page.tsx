import Link from "next/link";
import { getAgents, getAllAgentStatuses, parseSessionState } from "@/lib/agents";
import { fetchCommits } from "@/lib/github";
import { getPipelineMetrics } from "@/lib/supabase";
import { getCronJobs } from "@/lib/crons";
import { getSkills } from "@/lib/skills";

export const revalidate = 120;

export default async function DashboardPage() {
  const [statuses, commits, pipeline, crons, skills] = await Promise.all([
    getAllAgentStatuses(),
    fetchCommits(8),
    getPipelineMetrics(),
    getCronJobs(),
    getSkills(),
  ]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Overview
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        LeadsPanther AI Organization — {statuses.length} agents, {crons.length} crons, {skills.length} skills
      </p>

      {/* Pipeline summary cards */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-2)" }}>
          Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Leads" value={pipeline.total} />
          <StatCard label="Ready for Outreach" value={pipeline.readyForOutreach} color="var(--accent-gold)" />
          <StatCard label="Ready for HubSpot" value={pipeline.readyForHubspot} color="var(--accent)" />
          <StatCard label="HubSpot Synced" value={pipeline.hubspotSynced} color="#22c55e" />
        </div>
      </section>

      {/* Agent Grid */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-2)" }}>
          Agents
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statuses.map(({ agent, sessionState, todoSummary }) => {
            const fields = sessionState ? parseSessionState(sessionState) : {};
            return (
              <Link
                key={agent.id}
                href={`/agent/${agent.id}`}
                className="rounded-xl border p-4 lp-card-hover"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm">{agent.name}</div>
                    <div className="text-xs" style={{ color: "var(--muted-2)" }}>{agent.role}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--muted-2)" }}>Status</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background: fields.status === "Active" ? "rgba(34,197,94,0.1)" : "var(--paper)",
                        color: fields.status === "Active" ? "#22c55e" : "var(--muted-2)",
                      }}>
                      {fields.status || (sessionState ? "Connected" : "No data")}
                    </span>
                  </div>
                  {todoSummary && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--muted-2)" }}>Tasks</span>
                      <span style={{ color: "var(--muted)" }}>{todoSummary.pending} pending</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* System health */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-2)" }}>
          System Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Cron Jobs" value={crons.length} />
          <StatCard label="Crons Enabled" value={crons.filter(c => c.enabled).length} color="#22c55e" />
          <StatCard label="Skills" value={skills.length} color="var(--accent-gold)" />
          <StatCard label="Last Commit" value={commits[0]?.sha ?? "—"} isText />
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-2)" }}>
          Recent Activity
        </h2>
        <div className="rounded-xl border divide-y"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {commits.length === 0 && (
            <div className="p-6 text-center" style={{ color: "var(--muted-2)" }}>No recent activity</div>
          )}
          {commits.map((commit) => (
            <div key={commit.sha} className="flex items-start gap-4 px-5 py-3"
              style={{ borderColor: "var(--border)" }}>
              <code className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-mono"
                style={{ background: "var(--paper)", color: "var(--muted)" }}>
                {commit.sha}
              </code>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{commit.message}</div>
                <div className="mt-0.5 text-xs" style={{ color: "var(--muted-2)" }}>
                  {commit.author} · {new Date(commit.date).toLocaleDateString("en-US", {
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

function StatCard({ label, value, color, isText }: {
  label: string; value: number | string; color?: string; isText?: boolean;
}) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="text-xs mb-1" style={{ color: "var(--muted-2)" }}>{label}</div>
      <div className={isText ? "text-sm font-mono" : "text-2xl font-bold"}
        style={{ color: color ?? "var(--foreground)" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
