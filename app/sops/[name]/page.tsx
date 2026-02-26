import Link from "next/link";
import { notFound } from "next/navigation";
import { getSopDetail } from "@/lib/sops";

export default async function SopDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const sop = await getSopDetail(name);
  if (!sop) notFound();

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/sops" className="text-sm" style={{ color: "var(--muted-2)" }}>
          &larr; SOPs
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2" style={{ fontFamily: "var(--font-display)" }}>
          {sop.title}
        </h1>
        <div className="flex flex-wrap gap-3 mt-2">
          {sop.tag && (
            <span className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
              {sop.tag}
            </span>
          )}
          {sop.timeline && (
            <span className="rounded-full px-3 py-1 text-xs"
              style={{ background: "var(--surface)", color: "var(--muted)" }}>
              ⏱ {sop.timeline}
            </span>
          )}
          {sop.owner && (
            <span className="rounded-full px-3 py-1 text-xs"
              style={{ background: "var(--surface)", color: "var(--muted)" }}>
              👤 {sop.owner}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sop.sections.map((sec, idx) => (
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
          View raw source
        </summary>
        <div
          className="mt-2 rounded-xl p-5 overflow-auto"
          style={{ background: "var(--paper)", border: "1px solid var(--border)" }}
        >
          <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: "var(--muted)" }}>
            {sop.content}
          </pre>
        </div>
      </details>
    </div>
  );
}
