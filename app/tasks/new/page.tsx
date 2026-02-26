"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { STAGES } from "@/lib/crons";

const AGENTS = [
  { id: "orchestrator", name: "Alfred", emoji: "🎯" },
  { id: "delivery_ops", name: "Devin", emoji: "🔧" },
  { id: "revenue", name: "Rick", emoji: "💰" },
  { id: "rnd", name: "Rene", emoji: "🔬" },
  { id: "design", name: "Daniel", emoji: "🎨" },
  { id: "finance", name: "Friedrich", emoji: "📊" },
  { id: "legal", name: "Laura", emoji: "⚖️" },
  { id: "people", name: "Persephany", emoji: "👥" },
];

const SCHEDULE_PRESETS = [
  { label: "Daily 6 AM", value: "0 6 * * *" },
  { label: "Daily 9 AM", value: "0 9 * * *" },
  { label: "Daily 6 PM", value: "0 18 * * *" },
  { label: "Weekdays 9 AM", value: "0 9 * * 1-5" },
  { label: "Sunday midnight", value: "0 0 * * 0" },
  { label: "Custom", value: "custom" },
];

export default function NewTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("orchestrator");
  const [schedulePreset, setSchedulePreset] = useState("0 6 * * *");
  const [customSchedule, setCustomSchedule] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [stage, setStage] = useState("backlog");
  const [payload, setPayload] = useState("");
  const [enabled, setEnabled] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const schedule = schedulePreset === "custom" ? customSchedule : schedulePreset;
    if (!name.trim()) return setError("Name is required");
    if (!schedule.trim()) return setError("Schedule is required");
    if (!payload.trim()) return setError("Task instructions are required");

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, agentId, schedule, timezone, stage, payload, enabled }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      router.push("/tasks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tasks" className="text-sm" style={{ color: "var(--muted-2)" }}>
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          New Task
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Task Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Weekly Model Audit"
            className="w-full rounded-lg px-4 py-2.5 text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>

        {/* Agent */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Assigned Agent</label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
            ))}
          </select>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Schedule</label>
          <select
            value={schedulePreset}
            onChange={(e) => setSchedulePreset(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm mb-2"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            {SCHEDULE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label} {p.value !== "custom" ? `(${p.value})` : ""}</option>
            ))}
          </select>
          {schedulePreset === "custom" && (
            <input
              type="text"
              value={customSchedule}
              onChange={(e) => setCustomSchedule(e.target.value)}
              placeholder="0 9 * * 1-5"
              className="w-full rounded-lg px-4 py-2.5 text-sm font-mono"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          )}
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Timezone</label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Initial Stage</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStage(s.id)}
                className="rounded-full px-3 py-1 text-xs transition-colors"
                style={{
                  background: stage === s.id ? `${s.color}30` : "var(--surface)",
                  color: stage === s.id ? s.color : "var(--muted)",
                  border: stage === s.id ? `1px solid ${s.color}` : "1px solid var(--border)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enabled */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="enabled" className="text-sm">Enable this job immediately</label>
        </div>

        {/* Payload */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Task Instructions</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="e.g. Run the model-audit skill. Check AI leaderboards and suggest model updates..."
            rows={6}
            className="w-full rounded-lg px-4 py-2.5 text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)", resize: "vertical" }}
          />
          <p className="mt-1 text-xs" style={{ color: "var(--muted-2)" }}>
            To reference a skill, use: &quot;Run the [skill-name] skill&quot;
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
            style={{ background: "var(--accent)", color: "var(--background)", opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Creating…" : "Create Task"}
          </button>
          <Link
            href="/tasks"
            className="rounded-lg px-4 py-2.5 text-sm transition-colors"
            style={{ color: "var(--muted)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
