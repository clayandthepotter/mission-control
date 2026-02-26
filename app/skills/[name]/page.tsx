import Link from "next/link";
import { notFound } from "next/navigation";
import { getSkillDetail, AGENT_NAMES, CATEGORY_CONFIG } from "@/lib/skills";
import { AGENT_EMOJIS } from "@/lib/crons";

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const skill = await getSkillDetail(name);
  if (!skill) notFound();

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/skills" className="text-sm" style={{ color: "var(--muted-2)" }}>
          &larr; Skills
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {skill.name}
          </h1>
          {skill.description && (
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{skill.description}</p>
          )}
        </div>
      </div>

      {/* Cross-references */}
      {(skill.agentIds.length > 0 || skill.cronRefs.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {skill.agentIds.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-2)" }}>
                Used by
              </h3>
              <div className="flex flex-wrap gap-2">
                {skill.agentIds.map((id) => (
                  <Link
                    key={id}
                    href={`/agent/${id}`}
                    className="rounded-full px-3 py-1 text-xs"
                    style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    {AGENT_EMOJIS[id] ?? ""} {AGENT_NAMES[id] ?? id}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {skill.cronRefs.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-2)" }}>
                Cron Jobs
              </h3>
              <div className="flex flex-wrap gap-2">
                {skill.cronRefs.map((ref) => (
                  <Link
                    key={ref.id}
                    href="/tasks"
                    className="rounded-full px-3 py-1 text-xs"
                    style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    {ref.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {skill.sections.map((sec, idx) => (
          <section key={idx}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-2)" }}>
              {sec.heading}
            </h2>
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--paper)", border: "1px solid var(--border)" }}
            >
              <pre
                className="whitespace-pre-wrap text-sm leading-relaxed font-mono"
                style={{ color: "var(--muted)" }}
              >
                {sec.body}
              </pre>
            </div>
          </section>
        ))}
      </div>

      {/* Raw source */}
      <details>
        <summary className="text-xs cursor-pointer" style={{ color: "var(--muted-2)" }}>
          View raw SKILL.md
        </summary>
        <div
          className="mt-2 rounded-xl p-5 overflow-auto"
          style={{ background: "var(--paper)", border: "1px solid var(--border)" }}
        >
          <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: "var(--muted)" }}>
            {skill.content}
          </pre>
        </div>
      </details>
    </div>
  );
}
