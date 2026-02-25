import { getPipelineMetrics, getRecentLeads, getSourceBreakdown } from "@/lib/supabase";

export const revalidate = 120;

export default async function PipelinePage() {
  const [metrics, leads, sources] = await Promise.all([
    getPipelineMetrics(),
    getRecentLeads(15),
    getSourceBreakdown(),
  ]);

  const funnel = [
    { label: "Total Leads", value: metrics.total, color: "var(--foreground)" },
    { label: "Has Website", value: metrics.withWebsite, color: "var(--muted)" },
    { label: "Has Email", value: metrics.withEmail, color: "var(--accent-gold)" },
    { label: "Crustdata Enriched", value: metrics.enrichedCrustdata, color: "var(--accent-gold)" },
    { label: "Ready for Outreach", value: metrics.readyForOutreach, color: "var(--accent)" },
    { label: "Ready for HubSpot", value: metrics.readyForHubspot, color: "var(--accent)" },
    { label: "HubSpot Synced", value: metrics.hubspotSynced, color: "#22c55e" },
  ];

  const noData = metrics.total === 0;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Lead Pipeline
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        Real-time pipeline data from Supabase
      </p>

      {noData && (
        <div className="rounded-xl border p-8 text-center mb-8"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
          No pipeline data available. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel to connect.
        </div>
      )}

      {/* Funnel */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-2)" }}>
          Pipeline Funnel
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {funnel.map((stage) => (
            <div key={stage.label} className="rounded-xl border p-4 text-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-2xl font-bold" style={{ color: stage.color }}>
                {stage.value.toLocaleString()}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-2)" }}>{stage.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Source breakdown */}
      {sources.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-2)" }}>
            Source Breakdown
          </h2>
          <div className="flex gap-4">
            {sources.map((s) => (
              <div key={s.source} className="rounded-xl border px-5 py-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
                  {s.count.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: "var(--muted-2)" }}>{s.source}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent leads table */}
      {leads.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-2)" }}>
            Recent Leads
          </h2>
          <div className="rounded-xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="grid grid-cols-6 gap-4 px-5 py-3 text-xs font-medium border-b"
              style={{ color: "var(--muted-2)", borderColor: "var(--border)" }}>
              <div>Company</div>
              <div>Source</div>
              <div>Website</div>
              <div>Email</div>
              <div className="text-center">Outreach</div>
              <div className="text-center">HubSpot</div>
            </div>
            {leads.map((lead) => (
              <div key={lead.id} className="grid grid-cols-6 gap-4 px-5 py-2.5 text-sm border-b last:border-0"
                style={{ borderColor: "var(--border)" }}>
                <div className="font-medium truncate">{lead.company_name || "—"}</div>
                <div className="text-xs" style={{ color: "var(--muted-2)" }}>
                  {lead.source?.replace("google_maps_serper", "GMaps").replace("google_places", "GPlaces") || "—"}
                </div>
                <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
                  {lead.website || "—"}
                </div>
                <div className="truncate text-xs" style={{ color: "var(--muted)" }}>
                  {lead.email || "—"}
                </div>
                <div className="text-center">
                  <StatusBadge ok={lead.ready_for_outreach} />
                </div>
                <div className="text-center">
                  <StatusBadge ok={lead.ready_for_hubspot} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean | null }) {
  if (ok) {
    return <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>✓</span>;
  }
  return <span className="inline-block rounded-full px-2 py-0.5 text-xs"
    style={{ color: "var(--muted-2)" }}>—</span>;
}
