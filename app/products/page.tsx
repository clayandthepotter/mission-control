import Link from "next/link";
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
  Low: "bg-gray-700 text-gray-400",
  Unknown: "bg-gray-700 text-gray-500",
};

export default async function ProductsPage() {
  const content = await fetchFile("workspace/knowledge/areas/product-demand.md");
  const categories = content ? parseProductDemand(content) : [];
  const ranking = content ? parseRanking(content) : [];

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
            <Link href="/products" className="text-gray-300 hover:text-white">Products</Link>
            <Link href="/costs" className="text-gray-500 hover:text-white">Costs</Link>
            <Link href="/tasks" className="text-gray-500 hover:text-white">Tasks</Link>
            <Link href="/activity" className="text-gray-500 hover:text-white">Activity</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-300">Product Demand Ranking</h2>
          <p className="mb-6 text-sm text-gray-500">
            Products ranked by delivery count, revenue, and market demand signals.
          </p>

          {/* Ranking Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {ranking.slice(0, 4).map((name, i) => {
              const cat = categories.find((c) => c.name === name);
              return (
                <div
                  key={name}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold text-gray-300">
                      {i + 1}
                    </span>
                    <div className="font-semibold">{name}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deliveries</span>
                      <span className="text-gray-300">{cat?.deliveries ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Revenue</span>
                      <span className="text-gray-300">{cat?.revenue ?? "$0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Demand</span>
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
          <h3 className="mb-3 text-base font-semibold text-gray-300">All Categories</h3>
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-medium text-gray-500 border-b border-gray-800">
              <div>Category</div>
              <div className="text-center">Deliveries</div>
              <div className="text-center">Revenue</div>
              <div className="text-center">Satisfaction</div>
              <div className="text-center">Demand</div>
            </div>
            {categories.map((cat) => (
              <div key={cat.name} className="grid grid-cols-5 gap-4 px-5 py-3 text-sm border-b border-gray-800 last:border-0">
                <div className="font-medium">{cat.name}</div>
                <div className="text-center text-gray-400">{cat.deliveries}</div>
                <div className="text-center text-gray-400">{cat.revenue}</div>
                <div className="text-center text-gray-400">{cat.satisfaction}</div>
                <div className="text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${demandColors[cat.demandLevel]}`}>
                    {cat.demandLevel}
                  </span>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No product data available. Push product-demand.md to the repo.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
