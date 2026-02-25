import { getSkills } from "@/lib/skills";

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {skills.map((skill) => (
          <div key={skill.name} className="rounded-xl border px-4 py-3 lp-card-hover"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="font-medium text-sm truncate">{skill.name}</div>
          </div>
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
