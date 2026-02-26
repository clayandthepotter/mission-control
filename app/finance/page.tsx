import { getFinancialSummary, getFinancialTransactions } from "@/lib/supabase";

export default async function FinancePage() {
  const [summary, txns] = await Promise.all([
    getFinancialSummary(),
    getFinancialTransactions(30),
  ]);

  const noData = txns.length === 0;
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Finance
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        IFRS-aligned AP/AR overview from <code className="text-xs font-mono px-1 py-0.5 rounded"
          style={{ background: "var(--surface)" }}>financial_transactions</code>
      </p>

      {noData && (
        <div className="rounded-xl border p-8 text-center mb-8"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
          No financial data yet. Add transactions via Friedrich&apos;s financial-reporting skill.
        </div>
      )}

      {/* Summary cards */}
      <section className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label="Cash In (Paid)" value={fmt(summary.paidIn)} color="#22c55e" />
          <SummaryCard label="Cash Out (Paid)" value={fmt(summary.paidOut)} color="var(--accent)" />
          <SummaryCard label="Net Cash" value={fmt(summary.paidIn - summary.paidOut)}
            color={summary.paidIn >= summary.paidOut ? "#22c55e" : "var(--accent)"} />
          <SummaryCard label="Pending AR" value={fmt(summary.pendingReceivables)} color="var(--accent-gold)" />
          <SummaryCard label="Pending AP" value={fmt(summary.pendingPayables)} color="var(--muted)" />
          <SummaryCard label="Total Transactions" value={String(txns.length)} color="var(--foreground)" />
        </div>
      </section>

      {/* Transactions table */}
      {txns.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-2)" }}>
            Recent Transactions
          </h2>
          <div className="rounded-xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="grid grid-cols-7 gap-4 px-5 py-3 text-xs font-medium border-b"
              style={{ color: "var(--muted-2)", borderColor: "var(--border)" }}>
              <div>Date</div>
              <div>Type</div>
              <div>Category</div>
              <div>Vendor/Client</div>
              <div className="text-right">Amount</div>
              <div className="text-center">Status</div>
              <div>Description</div>
            </div>
            {txns.map((t) => (
              <div key={t.id} className="grid grid-cols-7 gap-4 px-5 py-2.5 text-sm border-b last:border-0"
                style={{ borderColor: "var(--border)" }}>
                <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>{t.date}</div>
                <div>
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs"
                    style={{
                      background: t.type === "receivable" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                      color: t.type === "receivable" ? "#22c55e" : "var(--accent)",
                    }}>
                    {t.type === "receivable" ? "AR" : "AP"}
                  </span>
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{t.category}</div>
                <div className="font-medium text-sm truncate">{t.vendor_client}</div>
                <div className="text-right font-mono text-sm"
                  style={{ color: t.type === "receivable" ? "#22c55e" : "var(--foreground)" }}>
                  {fmt(Number(t.amount))}
                </div>
                <div className="text-center">
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs"
                    style={{
                      background: t.status === "paid" ? "rgba(34,197,94,0.1)"
                        : t.status === "overdue" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                      color: t.status === "paid" ? "#22c55e"
                        : t.status === "overdue" ? "var(--accent)" : "var(--accent-gold)",
                    }}>
                    {t.status}
                  </span>
                </div>
                <div className="text-xs truncate" style={{ color: "var(--muted-2)" }}>
                  {t.description || "-"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="text-xs mb-1" style={{ color: "var(--muted-2)" }}>{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
