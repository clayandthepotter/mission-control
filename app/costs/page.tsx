import Link from "next/link";
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Mission Control</h1>
            <p className="text-sm text-gray-500">LeadsPanther AI Organization</p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-white">Overview</Link>
            <Link href="/products" className="text-gray-500 hover:text-white">Products</Link>
            <Link href="/costs" className="text-gray-300 hover:text-white">Costs</Link>
            <Link href="/tasks" className="text-gray-500 hover:text-white">Tasks</Link>
            <Link href="/activity" className="text-gray-500 hover:text-white">Activity</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary Cards */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-300">Cost Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="text-sm text-gray-500">Current Monthly</div>
              <div className="mt-1 text-2xl font-bold text-emerald-400">
                ~${totalMonthlyCost.toFixed(0)}
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="text-sm text-gray-500">Cost Per Lead</div>
              <div className="mt-1 text-2xl font-bold text-blue-400">
                {costPerLead ?? "—"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="text-sm text-gray-500">Margin Target</div>
              <div className="mt-1 text-2xl font-bold text-amber-400">
                {marginTarget ?? "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Costs Table */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-300">Monthly Services</h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 text-xs font-medium text-gray-500 border-b border-gray-800">
              <div>Service</div>
              <div>Tier</div>
              <div className="text-right">Monthly Cost</div>
              <div>Notes</div>
            </div>
            {costs.map((c) => (
              <div key={c.service} className="grid grid-cols-4 gap-4 px-5 py-3 text-sm border-b border-gray-800 last:border-0">
                <div className="font-medium">{c.service}</div>
                <div className="text-gray-400">{c.tier}</div>
                <div className="text-right text-gray-300">{c.monthlyCost}</div>
                <div className="text-gray-500 text-xs">{c.notes}</div>
              </div>
            ))}
            {costs.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No cost data available. Push operational-costs.md to the repo.
              </div>
            )}
          </div>
        </section>

        {/* Phase Projections */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-300">Cost Projections by Phase</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((p, i) => (
              <div
                key={p.phase}
                className={`rounded-xl border p-5 ${
                  i === 0
                    ? "border-emerald-800 bg-emerald-900/10"
                    : "border-gray-800 bg-gray-900"
                }`}
              >
                <div className="text-sm text-gray-500">{p.phase}</div>
                <div className="mt-1 text-xl font-bold text-gray-200">{p.monthly}</div>
                <div className="mt-2 text-xs text-gray-500">{p.services}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
