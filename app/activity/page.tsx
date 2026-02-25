import { fetchCommits } from "@/lib/github";

export const revalidate = 120;

export default async function ActivityPage() {
  const commits = await fetchCommits(50);

  // Group commits by date
  const grouped: Record<string, typeof commits> = {};
  for (const c of commits) {
    const day = new Date(c.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(c);
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>Activity Feed</h1>
        <p className="text-sm" style={{ color: "var(--muted-2)" }}>Recent commits across the organization</p>
      </div>
        {commits.length === 0 && (
          <div className="rounded-xl p-8 text-center" style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--muted-2)" }}>
            No activity found.
          </div>
        )}

        {Object.entries(grouped).map(([day, dayCommits]) => (
          <section key={day}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--muted-2)" }}>{day}</h2>
            <div className="rounded-xl" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
              {dayCommits.map((commit) => (
                <div key={commit.sha} className="flex items-start gap-4 px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <code className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-mono" style={{ background: "var(--surface)", color: "var(--muted)" }}>
                    {commit.sha}
                  </code>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{commit.message}</div>
                    <div className="mt-0.5 text-xs" style={{ color: "var(--muted-2)" }}>
                      {commit.author} · {new Date(commit.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
