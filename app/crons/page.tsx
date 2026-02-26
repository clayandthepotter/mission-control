import Link from "next/link";
import { getCronJobs, AGENT_NAMES, AGENT_EMOJIS, humanSchedule, relativeTime } from "@/lib/crons";

export const revalidate = 120;

export default async function CronsPage() {
  const jobs = await getCronJobs();

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Cron Jobs
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        {jobs.length} scheduled jobs - schedules, ownership, skill references, and execution status
      </p>

      <div className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="grid grid-cols-8 gap-4 px-5 py-3 text-xs font-medium border-b"
          style={{ color: "var(--muted-2)", borderColor: "var(--border)" }}>
          <div className="col-span-2">Job</div>
          <div>Agent</div>
          <div>Schedule</div>
          <div>Skill</div>
          <div className="text-center">Enabled</div>
          <div className="text-center">Status</div>
          <div className="text-center">Last Run</div>
        </div>

        {jobs.map((job) => (
          <div key={job.id} className="grid grid-cols-8 gap-4 px-5 py-3 text-sm border-b last:border-0"
            style={{ borderColor: "var(--border)" }}>
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
                <span style={{ color: "var(--muted-2)" }}>-</span>
              )}
            </div>
            <div className="text-center">
              {job.enabled ? (
                <span className="inline-block rounded-full px-2 py-0.5 text-xs"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>on</span>
              ) : (
                <span className="inline-block rounded-full px-2 py-0.5 text-xs"
                  style={{ background: "rgba(148,163,184,0.12)", color: "var(--muted-2)" }}>off</span>
              )}
            </div>
            <div className="text-center flex items-center justify-center gap-1">
              {job.lastStatus === "ok" && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
              {job.lastStatus === "skipped" && <span className="h-2 w-2 rounded-full bg-amber-400" />}
              {job.lastStatus === "error" && <span className="h-2 w-2 rounded-full bg-red-400" />}
              <span className="text-xs" style={{ color: "var(--muted-2)" }}>{job.lastStatus ?? "-"}</span>
            </div>
            <div className="text-center text-xs" style={{ color: "var(--muted-2)" }}>
              {relativeTime(job.lastRunAtMs)}
              {job.lastError && job.lastStatus !== "ok" && (
                <div className="text-red-400 truncate" title={job.lastError}>
                  {job.lastError.slice(0, 30)}
                </div>
              )}
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="p-8 text-center" style={{ color: "var(--muted-2)" }}>
            No cron jobs found.
          </div>
        )}
      </div>
    </div>
  );
}
