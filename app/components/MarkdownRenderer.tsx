"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-3 mt-6" style={{ color: "var(--foreground)" }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2 mt-5" style={{ color: "var(--foreground)" }}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-2 mt-4" style={{ color: "var(--foreground)" }}>{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted)" }}>{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-sm mb-3 space-y-1" style={{ color: "var(--muted)" }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-sm mb-3 space-y-1" style={{ color: "var(--muted)" }}>{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong style={{ color: "var(--foreground)" }}>{children}</strong>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code
                className="block rounded-lg p-4 text-xs font-mono overflow-x-auto mb-3"
                style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className="rounded px-1.5 py-0.5 text-xs font-mono"
              style={{ background: "var(--surface)", color: "var(--gold)" }}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <div className="mb-3">{children}</div>,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm" style={{ color: "var(--muted)" }}>{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ borderBottom: "1px solid var(--border)" }}>{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-2)" }}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-sm" style={{ borderBottom: "1px solid var(--border)" }}>{children}</td>
        ),
        hr: () => <hr className="my-4" style={{ borderColor: "var(--border)" }} />,
        a: ({ href, children }) => (
          <a href={href} className="underline" style={{ color: "var(--gold)" }} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="pl-4 my-3 text-sm italic"
            style={{ borderLeft: "3px solid var(--gold)", color: "var(--muted)" }}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
