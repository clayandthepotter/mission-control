import Link from "next/link";
import { getSkills, AGENT_NAMES } from "@/lib/skills";
import { AGENT_EMOJIS } from "@/lib/crons";

export const revalidate = 300;

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Skills Inventory
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        {skills.length} skills globally available via <code className="text-xs font-mono px-1 py-0.5 rounded"
          style={{ background: "var(--surface)" }}>nativeSkills: &quot;auto&quot;</code>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Link
            key={skill.name}
            href={`/skills/${skill.name}`}
            className="rounded-xl border px-5 py-4 lp-card-hover block"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="font-medium text-sm">{skill.name}</div>
            {skill.description && (
              <p className="mt-1.5 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
                {skill.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {skill.agentIds.length > 0 && (
                <span className="text-xs" style={{ color: "var(--muted-2)" }}>
                  {skill.agentIds.map((id) => `${AGENT_EMOJIS[id] ?? ""} ${AGENT_NAMES[id] ?? id}`).join(", ")}
                </span>
              )}
              {skill.cronRefs.length > 0 && (
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--paper)", color: "var(--muted-2)" }}>
                  {skill.cronRefs.length} cron{skill.cronRefs.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="rounded-xl border p-8 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
          No skills found. Check GitHub API access.
        </div>
      )}
    </div>
  );
}
