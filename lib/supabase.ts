/**
 * Server-side Supabase client using PostgREST API.
 * Env vars needed on Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function supabaseHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function query<T>(table: string, params: string = ""): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? `?${params}` : ""}`;
  try {
    const res = await fetch(url, {
      headers: supabaseHeaders(),
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Pipeline stage counts */
export interface PipelineMetrics {
  total: number;
  withWebsite: number;
  withEmail: number;
  enrichedCrustdata: number;
  readyForOutreach: number;
  readyForHubspot: number;
  hubspotSynced: number;
}

export async function getPipelineMetrics(): Promise<PipelineMetrics> {
  const defaults: PipelineMetrics = {
    total: 0, withWebsite: 0, withEmail: 0, enrichedCrustdata: 0,
    readyForOutreach: 0, readyForHubspot: 0, hubspotSynced: 0,
  };
  if (!SUPABASE_URL || !SUPABASE_KEY) return defaults;

  try {
    // Use HEAD with Prefer: count=exact for each filter
    const counts = await Promise.all([
      countRows("leads", ""),
      countRows("leads", "website=not.is.null"),
      countRows("leads", "email=not.is.null"),
      countRows("leads", "crustdata_enriched_at=not.is.null"),
      countRows("leads", "ready_for_outreach=eq.true"),
      countRows("leads", "ready_for_hubspot=eq.true"),
      countRows("leads", "hubspot_company_id=not.is.null"),
    ]);

    return {
      total: counts[0],
      withWebsite: counts[1],
      withEmail: counts[2],
      enrichedCrustdata: counts[3],
      readyForOutreach: counts[4],
      readyForHubspot: counts[5],
      hubspotSynced: counts[6],
    };
  } catch {
    return defaults;
  }
}

async function countRows(table: string, filter: string): Promise<number> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=id&${filter}&limit=0`;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        ...supabaseHeaders(),
        Prefer: "count=exact",
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(10_000),
    });
    const range = res.headers.get("content-range");
    if (range) {
      const total = range.split("/")[1];
      return total && total !== "*" ? parseInt(total, 10) : 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/** Recent leads */
export interface RecentLead {
  id: string;
  company_name: string | null;
  source: string | null;
  website: string | null;
  email: string | null;
  ready_for_outreach: boolean | null;
  ready_for_hubspot: boolean | null;
  created_at: string | null;
}

export async function getRecentLeads(limit = 20): Promise<RecentLead[]> {
  return query<RecentLead>(
    "leads",
    `select=id,company_name,source,website,email,ready_for_outreach,ready_for_hubspot,created_at&order=created_at.desc&limit=${limit}`
  );
}

/** Source breakdown */
export interface SourceCount {
  source: string;
  count: number;
}

export async function getSourceBreakdown(): Promise<SourceCount[]> {
  // Supabase PostgREST doesn't have GROUP BY — we'll fetch via RPC or approximate
  // For now, count the two known sources
  const [gmaps, gplaces] = await Promise.all([
    countRows("leads", "source=eq.google_maps_serper"),
    countRows("leads", "source=eq.google_places"),
  ]);
  const results: SourceCount[] = [];
  if (gmaps > 0) results.push({ source: "Google Maps", count: gmaps });
  if (gplaces > 0) results.push({ source: "Google Places", count: gplaces });
  return results;
}

/** Financial transactions */
export interface FinancialTransaction {
  id: number;
  date: string;
  type: string;
  category: string;
  account_code: string | null;
  vendor_client: string;
  description: string | null;
  amount: number;
  currency: string;
  status: string;
  invoice_ref: string | null;
  due_date: string | null;
}

export async function getFinancialTransactions(limit = 50): Promise<FinancialTransaction[]> {
  return query<FinancialTransaction>(
    "financial_transactions",
    `select=*&order=date.desc&limit=${limit}`
  );
}

export interface FinancialSummary {
  totalPayables: number;
  totalReceivables: number;
  paidOut: number;
  paidIn: number;
  pendingPayables: number;
  pendingReceivables: number;
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const txns = await getFinancialTransactions(500);
  const summary: FinancialSummary = {
    totalPayables: 0, totalReceivables: 0,
    paidOut: 0, paidIn: 0,
    pendingPayables: 0, pendingReceivables: 0,
  };

  for (const t of txns) {
    const amt = Number(t.amount) || 0;
    if (t.type === "payable") {
      summary.totalPayables += amt;
      if (t.status === "paid") summary.paidOut += amt;
      else if (t.status === "pending" || t.status === "overdue") summary.pendingPayables += amt;
    } else if (t.type === "receivable") {
      summary.totalReceivables += amt;
      if (t.status === "paid") summary.paidIn += amt;
      else if (t.status === "pending" || t.status === "overdue") summary.pendingReceivables += amt;
    }
  }

  return summary;
}
