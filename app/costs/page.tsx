import { fetchFile } from "@/lib/github";

export const revalidate = 120;

interface CostRow {
  service: string;
  tier: string;
  monthlyCost: string;
  notes: string;
}

interface PhaseRow {
  phase: string;
  monthly: string;
  services: string;
}

function parseCostTable(content: string): CostRow[] {
  const rows: CostRow[] = [];
  const section = content.split("## Monthly Cost Summary")[1]?.split("##")[0] || "";
  const lines = section.split("\n").filter((l) => l.startsWith("|") && !l.startsWith("|-") && !l.includes("Service"));
  for (const line of lines) {
    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 4) {
      rows.push({
        service: cols[0],
        tier: cols[1],
        monthlyCost: cols[2],
        notes: cols[3],
      });
    }
  }
  return rows;
}

function parsePhaseTable(content: string): PhaseRow[] {
  const rows: PhaseRow[] = [];
  const section = content.split("## Projected Costs by Phase")[1]?.split("##")[0] || "";
  const lines = section.split("\n").filter((l) => l.startsWith("|") && !l.startsWith("|-") && !l.includes("Phase"));
  for (const line of lines) {
    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 3) {
      rows.push({
        phase: cols[0],
        monthly: cols[1],
        services: cols[2],
      });
    }
  }
  return rows;
}

function parseCostPerLead(content: string): string | null {
  const match = content.match(/Total cost per fully enriched lead:\s*~?\$?([\d.]+)/);
  return match ? `$${match[1]}` : null;
}

function parseMarginTarget(content: string): string | null {
  const match = content.match(/Net margin target:\s*(.+)/);
  return match ? match[1].trim() : null;
}

export default async function CostsPage() {
  const content = await fetchFile("knowledge/areas/operational-costs.md");
  const costs = content ? parseCostTable(content) : [];
  const phases = content ? parsePhaseTable(content) : [];
  const costPerLead = content ? parseCostPerLead(content) : null;
  const marginTarget = content ? parseMarginTarget(content) : null;

  const totalMonthlyCost = costs.reduce((sum, c) => {
    const match = c.monthlyCost.match(/~?\$?([\d.]+)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>Costs</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>Operational cost tracking</p>
        {/* Summary Cards */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--muted)" }}>Cost Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl p-5" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
              <div className="text-sm" style={{ color: "var(--muted-2)" }}>Current Monthly</div>
              <div className="mt-1 text-2xl font-bold text-emerald-400">
                ~${totalMonthlyCost.toFixed(0)}
              </div>
            </div>
            <div className="rounded-xl p-5" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
              <div className="text-sm" style={{ color: "var(--muted-2)" }}>Cost Per Lead</div>
              <div className="mt-1 text-2xl font-bold text-blue-400">
                {costPerLead ?? "-"}
              </div>
            </div>
            <div className="rounded-xl p-5" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
              <div className="text-sm" style={{ color: "var(--muted-2)" }}>Margin Target</div>
              <div className="mt-1 text-2xl font-bold text-amber-400">
                {marginTarget ?? "-"}
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Costs Table */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--muted)" }}>Monthly Services</h2>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
            <div className="grid grid-cols-4 gap-4 px-5 py-3 text-xs font-medium" style={{ color: "var(--muted-2)", borderBottom: "1px solid var(--border)" }}>
              <div>Service</div>
              <div>Tier</div>
              <div className="text-right">Monthly Cost</div>
              <div>Notes</div>
            </div>
            {costs.map((c) => (
              <div key={c.service} className="grid grid-cols-4 gap-4 px-5 py-3 text-sm last:border-0" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="font-medium">{c.service}</div>
                <div style={{ color: "var(--muted)" }}>{c.tier}</div>
                <div className="text-right" style={{ color: "var(--muted)" }}>{c.monthlyCost}</div>
                <div className="text-xs" style={{ color: "var(--muted-2)" }}>{c.notes}</div>
              </div>
            ))}
            {costs.length === 0 && (
              <div className="p-6 text-center" style={{ color: "var(--muted-2)" }}>
                No cost data available. Push operational-costs.md to the repo.
              </div>
            )}
          </div>
        </section>

        {/* Phase Projections */}
        <section>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--muted)" }}>Cost Projections by Phase</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((p, i) => (
              <div
                key={p.phase}
                className="rounded-xl border p-5"
                style={{
                  background: i === 0 ? "rgba(16,185,129,0.05)" : "var(--paper)",
                  borderColor: i === 0 ? "rgba(16,185,129,0.3)" : "var(--border)",
                }}
              >
                <div className="text-sm" style={{ color: "var(--muted-2)" }}>{p.phase}</div>
                <div className="mt-1 text-xl font-bold">{p.monthly}</div>
                <div className="mt-2 text-xs" style={{ color: "var(--muted-2)" }}>{p.services}</div>
              </div>
            ))}
          </div>
        </section>
    </div>
  );
}
