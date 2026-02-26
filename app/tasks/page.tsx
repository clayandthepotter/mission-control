import Link from "next/link";
import { getCronJobs, AGENT_NAMES, AGENT_EMOJIS, STAGES, humanSchedule, relativeTime } from "@/lib/crons";
import { TaskCard } from "@/app/components/TaskCard";

export const revalidate = 60;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string; view?: string }>;
}) {
  const params = await searchParams;
  const jobs = await getCronJobs();
  const viewMode = params.view === "table" ? "table" : "kanban";
  const agentFilter = params.agent || "all";

  const filtered = agentFilter === "all"
    ? jobs
    : jobs.filter((j) => j.agentId === agentFilter);

  const agentIds = [...new Set(jobs.map((j) => j.agentId))].sort();

  return (
    <div className="px-6 py-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Task Board
        </h1>
        <Link
          href="/tasks/new"
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: "var(--accent)", color: "var(--background)" }}
        >
          + New Task
        </Link>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted-2)" }}>
        {filtered.length} jobs — drag tasks through stages
      </p>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--muted-2)" }}>Agent:</span>
          <div className="flex flex-wrap gap-1">
            <Link
              href={`/tasks?view=${viewMode}`}
              className="rounded-full px-3 py-1 text-xs transition-colors"
              style={{
                background: agentFilter === "all" ? "var(--accent)" : "var(--surface)",
                color: agentFilter === "all" ? "var(--background)" : "var(--muted)",
              }}
            >
              All
            </Link>
            {agentIds.map((aid) => (
              <Link
                key={aid}
                href={`/tasks?agent=${aid}&view=${viewMode}`}
                className="rounded-full px-3 py-1 text-xs transition-colors"
                style={{
                  background: agentFilter === aid ? "var(--accent)" : "var(--surface)",
                  color: agentFilter === aid ? "var(--background)" : "var(--muted)",
                }}
              >
                {AGENT_EMOJIS[aid] ?? ""} {AGENT_NAMES[aid] ?? aid}
              </Link>
            ))}
          </div>
        </div>
        <div className="ml-auto flex gap-1">
          <Link
            href={`/tasks?agent=${agentFilter}&view=kanban`}
            className="rounded-lg px-3 py-1 text-xs"
            style={{
              background: viewMode === "kanban" ? "var(--surface)" : "transparent",
              color: viewMode === "kanban" ? "var(--foreground)" : "var(--muted-2)",
            }}
          >
            Kanban
          </Link>
          <Link
            href={`/tasks?agent=${agentFilter}&view=table`}
            className="rounded-lg px-3 py-1 text-xs"
            style={{
              background: viewMode === "table" ? "var(--surface)" : "transparent",
              color: viewMode === "table" ? "var(--foreground)" : "var(--muted-2)",
            }}
          >
            Table
          </Link>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {STAGES.map((stg, idx) => {
            const col = filtered.filter((j) => j.stage === stg.id);
            const prevStg = idx > 0 ? STAGES[idx - 1] : null;
            const nextStg = idx < STAGES.length - 1 ? STAGES[idx + 1] : null;

            return (
              <div key={stg.id}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: stg.color }} />
                  <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    {stg.label} ({col.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {col.length === 0 && (
                    <div
                      className="rounded-xl border p-4 text-center text-xs"
                      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}
                    >
                      Empty
                    </div>
                  )}
                  {col.map((job) => (
                    <TaskCard
                      key={job.id}
                      id={job.id}
                      name={job.name}
                      agentEmoji={AGENT_EMOJIS[job.agentId] ?? ""}
                      agentName={AGENT_NAMES[job.agentId] ?? job.agentId}
                      schedule={humanSchedule(job.schedule)}
                      skillRef={job.skillRef}
                      lastStatus={job.lastStatus}
                      lastRunLabel={job.lastRunAtMs ? `Last: ${relativeTime(job.lastRunAtMs)}` : "Never run"}
                      lastError={job.lastError}
                      stage={stg.id}
                      prevStage={prevStg?.id ?? null}
                      nextStage={nextStg?.id ?? null}
                      prevLabel={prevStg?.label ?? null}
                      nextLabel={nextStg?.label ?? null}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="grid grid-cols-8 gap-4 px-5 py-3 text-xs font-medium border-b"
            style={{ color: "var(--muted-2)", borderColor: "var(--border)" }}
          >
            <div className="col-span-2">Job</div>
            <div>Agent</div>
            <div>Schedule</div>
            <div>Skill</div>
            <div className="text-center">Stage</div>
            <div className="text-center">Status</div>
            <div className="text-center">Last Run</div>
          </div>
          {filtered.map((job) => {
            const stg = STAGES.find((s) => s.id === job.stage);
            return (
              <div
                key={job.id}
                className="grid grid-cols-8 gap-4 px-5 py-3 text-sm border-b last:border-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="col-span-2">
                  <div className="font-medium">{job.name}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted-2)" }}>{job.id}</div>
                </div>
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  {AGENT_EMOJIS[job.agentId] ?? ""} {AGENT_NAMES[job.agentId] ?? job.agentId}
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{humanSchedule(job.schedule)}</div>
                <div className="text-xs">
                  {job.skillRef ? (
                    <Link href={`/skills/${job.skillRef}`} className="underline" style={{ color: "var(--accent)" }}>
                      {job.skillRef}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--muted-2)" }}>—</span>
                  )}
                </div>
                <div className="text-center">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs"
                    style={{ background: `${stg?.color ?? "#64748b"}20`, color: stg?.color ?? "var(--muted-2)" }}
                  >
                    {stg?.label ?? job.stage}
                  </span>
                </div>
                <div className="text-center text-xs" style={{ color: "var(--muted-2)" }}>
                  {job.lastStatus ?? "—"}
                </div>
                <div className="text-center text-xs" style={{ color: "var(--muted-2)" }}>
                  {relativeTime(job.lastRunAtMs)}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--muted-2)" }}>No jobs found.</div>
          )}
        </div>
      )}
    </div>
  );
}
