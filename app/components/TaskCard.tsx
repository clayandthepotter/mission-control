"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TaskCardProps {
  id: string;
  name: string;
  agentEmoji: string;
  agentName: string;
  schedule: string;
  skillRef: string | null;
  lastStatus: string | null;
  lastRunLabel: string;
  lastError: string | null;
  stage: string;
  prevStage: string | null;
  nextStage: string | null;
  prevLabel: string | null;
  nextLabel: string | null;
}

export function TaskCard({
  id, name, agentEmoji, agentName, schedule, skillRef,
  lastStatus, lastRunLabel, lastError, stage,
  prevStage, nextStage, prevLabel, nextLabel,
}: TaskCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function moveStage(newStage: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, stage: newStage }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-xl border p-4 lp-card-hover"
      style={{ background: "var(--surface)", borderColor: "var(--border)", opacity: loading ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm">{name}</div>
        <StatusDot status={lastStatus} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
        <span>{agentEmoji} {agentName}</span>
        <span style={{ color: "var(--muted-2)" }}>·</span>
        <span>{schedule}</span>
      </div>
      {skillRef && (
        <div className="mt-1.5">
          <Link href={`/skills/${skillRef}`} className="text-xs underline" style={{ color: "var(--accent)" }}>
            {skillRef}
          </Link>
        </div>
      )}
      <div className="mt-2 text-xs" style={{ color: "var(--muted-2)" }}>
        {lastRunLabel}
        {lastError && lastStatus !== "ok" && (
          <span className="ml-2 text-red-400" title={lastError}>
            ⚠ {lastError.slice(0, 35)}
          </span>
        )}
      </div>

      {/* Stage transition buttons */}
      <div className="mt-3 flex items-center gap-2">
        {prevStage && (
          <button
            onClick={() => moveStage(prevStage)}
            disabled={loading}
            className="rounded px-2 py-1 text-xs transition-colors"
            style={{ background: "var(--paper)", color: "var(--muted)", border: "1px solid var(--border)" }}
            title={`Move to ${prevLabel}`}
          >
            ← {prevLabel}
          </button>
        )}
        <span className="flex-1" />
        {nextStage && (
          <button
            onClick={() => moveStage(nextStage)}
            disabled={loading}
            className="rounded px-2 py-1 text-xs transition-colors"
            style={{ background: "var(--accent)", color: "var(--background)" }}
            title={`Move to ${nextLabel}`}
          >
            {nextLabel} →
          </button>
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string | null }) {
  if (status === "ok")
    return <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shrink-0" title="Success" />;
  if (status === "skipped")
    return <span className="inline-block h-2 w-2 rounded-full bg-amber-400 shrink-0" title="Skipped" />;
  if (status === "error")
    return <span className="inline-block h-2 w-2 rounded-full bg-red-400 shrink-0" title="Error" />;
  return <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: "var(--muted-2)" }} title="No data" />;
}
