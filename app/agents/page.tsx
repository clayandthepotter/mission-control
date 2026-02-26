import Link from "next/link";
import { getAgents, formatModelCascade } from "@/lib/agents";

export default async function AgentsPage() {
  const AGENTS = await getAgents();
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Agent Organization
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        8 agents across 7 departments - all report to Alfred {"→"} Clayton
      </p>

      {/* Clayton at top */}
      <div className="flex justify-center mb-6">
        <div className="rounded-xl border px-6 py-4 text-center lp-card-hover"
          style={{ background: "var(--surface)", borderColor: "var(--accent)" }}>
          <div className="text-2xl mb-1">👤</div>
          <div className="font-semibold">Clayton</div>
          <div className="text-xs" style={{ color: "var(--muted-2)" }}>CEO / Founder</div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="w-px h-8" style={{ background: "var(--border-strong)" }} />
      </div>

      {/* Alfred */}
      {AGENTS.filter(a => a.id === "orchestrator").map(agent => (
        <div key={agent.id} className="flex justify-center mb-6">
          <Link href={`/agent/${agent.id}`}
            className="rounded-xl border px-6 py-4 text-center lp-card-hover w-64"
            style={{ background: "var(--surface)", borderColor: "var(--accent-gold)" }}>
            <div className="text-2xl mb-1">{agent.emoji}</div>
            <div className="font-semibold">{agent.name}</div>
            <div className="text-xs" style={{ color: "var(--muted-2)" }}>{agent.role}</div>
            <div className="mt-2 text-xs" style={{ color: "var(--accent-gold)" }}>
              {agent.skillCount} skills · {agent.tools.length} tools
            </div>
          </Link>
        </div>
      ))}

      <div className="flex justify-center mb-6">
        <div className="w-px h-8" style={{ background: "var(--border-strong)" }} />
      </div>

      {/* Department grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {AGENTS.filter(a => a.id !== "orchestrator").map(agent => (
          <Link
            key={agent.id}
            href={`/agent/${agent.id}`}
            className="rounded-xl border p-5 lp-card-hover"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <div className="font-semibold">{agent.name}</div>
                <div className="text-xs" style={{ color: "var(--muted-2)" }}>{agent.role}</div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--muted-2)" }}>Department</span>
                <span style={{ color: "var(--muted)" }}>{agent.department}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted-2)" }}>Model</span>
                <span className="font-mono text-xs truncate max-w-[120px]" style={{ color: "var(--muted)" }}>
                  {formatModelCascade(agent.model)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted-2)" }}>Skills</span>
                <span style={{ color: "var(--accent-gold)" }}>{agent.skillCount}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted-2)" }}>Tools</span>
                <span style={{ color: "var(--muted)" }}>{agent.tools.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--muted-2)" }}>Reports to</span>
                <span style={{ color: "var(--muted)" }}>{agent.reportsTo}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
