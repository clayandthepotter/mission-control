import Link from "next/link";
import { getSkills, AGENT_NAMES, CATEGORY_CONFIG } from "@/lib/skills";
import { AGENT_EMOJIS } from "@/lib/crons";

export default async function SkillsPage() {
  const skills = await getSkills();

  // Group by category
  const categories = [...new Set(skills.map((s) => s.category))].sort();

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Skills Inventory
      </h1>
      <p className="text-sm mb-2" style={{ color: "var(--muted-2)" }}>
        {skills.length} skills across {categories.length} categories
      </p>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG.uncategorized;
          const count = skills.filter((s) => s.category === cat).length;
          return (
            <span key={cat} className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: `${cfg.color}18`, color: cfg.color }}>
              {cfg.label} ({count})
            </span>
          );
        })}
      </div>

      {/* Grouped skill cards */}
      {categories.map((cat) => {
        const cfg = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG.uncategorized;
        const catSkills = skills.filter((s) => s.category === cat);
        return (
          <section key={cat} className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: cfg.color }}>
              {cfg.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catSkills.map((skill) => (
                <Link
                  key={skill.name}
                  href={`/skills/${skill.name}`}
                  className="rounded-xl border px-5 py-4 lp-card-hover block"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{skill.name}</span>
                    {skill.deps.length > 0 && (
                      <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: "rgba(239,68,68,0.1)", color: "var(--accent)" }}>⚠ deps</span>
                    )}
                  </div>
                  {skill.description && (
                    <p className="mt-1.5 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
                      {skill.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {skill.agentIds.length > 0 && skill.agentIds[0] !== "shared" && (
                      <span className="text-xs" style={{ color: "var(--muted-2)" }}>
                        {skill.agentIds.map((id) => `${AGENT_EMOJIS[id] ?? ""} ${AGENT_NAMES[id] ?? id}`).join(", ")}
                      </span>
                    )}
                    {skill.agentIds[0] === "shared" && (
                      <span className="text-xs" style={{ color: "var(--muted-2)" }}>🔗 All agents</span>
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
          </section>
        );
      })}

      {skills.length === 0 && (
        <div className="rounded-xl border p-8 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
          No skills found. Check GitHub API access.
        </div>
      )}
    </div>
  );
}
