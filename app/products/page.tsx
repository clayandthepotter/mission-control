import { fetchFile } from "@/lib/github";

export const revalidate = 120;

interface ProductCategory {
  name: string;
  deliveries: number;
  revenue: string;
  satisfaction: string;
  demandSignal: string;
  demandLevel: "High" | "Medium" | "Low" | "Unknown";
}

function parseProductDemand(content: string): ProductCategory[] {
  const categories: ProductCategory[] = [];
  const tableRegex = /\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(\$[\d,]+)\s*\|\s*([^\|]+)\s*\|\s*(.+?)\s*\|/g;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const name = match[1].trim();
    if (name === "Category" || name.startsWith("-")) continue;
    const demandText = match[5].trim();
    let demandLevel: ProductCategory["demandLevel"] = "Unknown";
    if (demandText.startsWith("High")) demandLevel = "High";
    else if (demandText.startsWith("Medium")) demandLevel = "Medium";
    else if (demandText.startsWith("Low")) demandLevel = "Low";

    categories.push({
      name,
      deliveries: parseInt(match[2], 10),
      revenue: match[3].trim(),
      satisfaction: match[4].trim(),
      demandSignal: demandText,
      demandLevel,
    });
  }

  return categories;
}

function parseRanking(content: string): string[] {
  const ranking: string[] = [];
  const rankRegex = /^\d+\.\s+\*\*(.+?)\*\*/gm;
  let match;
  while ((match = rankRegex.exec(content)) !== null) {
    ranking.push(match[1]);
  }
  return ranking;
}

const demandColors: Record<string, string> = {
  High: "bg-emerald-500/10 text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-white/5 text-neutral-400",
  Unknown: "bg-white/5 text-neutral-500",
};

export default async function ProductsPage() {
  const content = await fetchFile("workspace/knowledge/areas/product-demand.md");
  const categories = content ? parseProductDemand(content) : [];
  const ranking = content ? parseRanking(content) : [];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>Products</h1>
        <p className="text-sm" style={{ color: "var(--muted-2)" }}>Products ranked by delivery count, revenue, and market demand signals.</p>
      </div>

        <section>

          {/* Ranking Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {ranking.slice(0, 4).map((name, i) => {
              const cat = categories.find((c) => c.name === name);
              return (
                <div
                  key={name}
                  className="lp-card-hover rounded-xl p-5" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ background: "var(--surface)", color: "var(--muted)" }}>
                      {i + 1}
                    </span>
                    <div className="font-semibold">{name}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-2)" }}>Deliveries</span>
                      <span style={{ color: "var(--muted)" }}>{cat?.deliveries ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-2)" }}>Revenue</span>
                      <span style={{ color: "var(--muted)" }}>{cat?.revenue ?? "$0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-2)" }}>Demand</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${demandColors[cat?.demandLevel ?? "Unknown"]}`}>
                        {cat?.demandLevel ?? "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Table */}
          <h3 className="mb-3 text-base font-semibold" style={{ color: "var(--muted)" }}>All Categories</h3>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
            <div className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-medium" style={{ color: "var(--muted-2)", borderBottom: "1px solid var(--border)" }}>
              <div>Category</div>
              <div className="text-center">Deliveries</div>
              <div className="text-center">Revenue</div>
              <div className="text-center">Satisfaction</div>
              <div className="text-center">Demand</div>
            </div>
            {categories.map((cat) => (
              <div key={cat.name} className="grid grid-cols-5 gap-4 px-5 py-3 text-sm last:border-0" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="font-medium">{cat.name}</div>
                <div className="text-center" style={{ color: "var(--muted)" }}>{cat.deliveries}</div>
                <div className="text-center" style={{ color: "var(--muted)" }}>{cat.revenue}</div>
                <div className="text-center" style={{ color: "var(--muted)" }}>{cat.satisfaction}</div>
                <div className="text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${demandColors[cat.demandLevel]}`}>
                    {cat.demandLevel}
                  </span>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-6 text-center" style={{ color: "var(--muted-2)" }}>
                No product data available. Push product-demand.md to the repo.
              </div>
            )}
          </div>
        </section>
    </div>
  );
}
