import Link from "next/link";
import { getDailyNotes } from "@/lib/knowledge";

export const revalidate = 300;

export default async function NotesPage() {
  const notes = await getDailyNotes();

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Daily Notes
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-2)" }}>
        {notes.length} notes - daily operational logs from the knowledge repository
      </p>

      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => {
            const date = new Date(note.date + "T12:00:00Z");
            const formatted = date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <Link
                key={note.date}
                href={`/docs/${note.path}`}
                className="flex items-center justify-between rounded-xl border px-5 py-3 lp-card-hover"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div>
                  <div className="text-sm font-medium">{formatted}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted-2)" }}>{note.date}</div>
                </div>
                <span className="text-xs" style={{ color: "var(--muted-2)" }}>&rarr;</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border p-8 text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-2)" }}>
          No daily notes found. Notes are expected in <code className="text-xs font-mono">knowledge/notes/YYYY-MM-DD.md</code>
        </div>
      )}
    </div>
  );
}
