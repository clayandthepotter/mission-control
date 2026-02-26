import Link from "next/link";
import { getSops } from "@/lib/sops";

export default async function SopsPage() {
  const sops = await getSops();

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Standard Operating Procedures
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        {sops.length} SOPs defining deterministic agent workflows — step-by-step procedures with MUST/SHOULD/MAY constraints
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sops.map((sop) => (
          <Link
            key={sop.name}
            href={`/sops/${sop.name}`}
            className="rounded-xl border px-5 py-4 lp-card-hover block"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="font-medium text-sm">{sop.title}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {sop.tag && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                  {sop.tag}
                </span>
              )}
              {sop.timeline && (
                <span className="rounded-full px-2 py-0.5 text-[10px]"
                  style={{ background: "var(--paper)", color: "var(--muted-2)" }}>
                  ⏱ {sop.timeline}
                </span>
              )}
            </div>
            {sop.owner && (
              <p className="mt-2 text-xs" style={{ color: "var(--muted-2)" }}>
                {sop.owner}
              </p>
            )}
          </Link>
        ))}
      </div>

      {sops.length === 0 && (
        <div className="rounded-xl border p-8 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
          No SOPs found. Check GitHub API access.
        </div>
      )}
    </div>
  );
}
