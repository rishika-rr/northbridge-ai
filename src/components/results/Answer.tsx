import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";

import { citationNumber, linkCitations, sourceElementId } from "../../lib/citations";
import type { Source } from "../../services/api";
import { SectionLabel } from "../ui/controls";

type Props = {
  answer: string;
  sources: Source[];
};

function CitationChip({ number, source }: { number: number; source: Source | undefined }) {
  const label = source
    ? `Source ${number}: ${source.title}${source.page ? `, page ${source.page}` : ""}`
    : `Citation ${number} does not match any source`;

  function jump() {
    const element = document.getElementById(sourceElementId(number));
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={jump}
      disabled={!source}
      title={label}
      aria-label={label}
      className={`
      mx-0.5 inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-md px-1.5
      align-[2px] text-[11px] font-semibold leading-none transition
      ${
        source
          ? "bg-blue-500/15 text-blue-300 hover:bg-blue-500/30 cursor-pointer"
          : "bg-amber-500/15 text-amber-300 cursor-help"
      }
      `}
    >
      {number}
    </button>
  );
}

export default function Answer({ answer, sources }: Props) {
  const byNumber = new Map(sources.map((s) => [s.citation, s]));

  return (
    <section aria-labelledby="answer-heading">
      <div className="flex items-center justify-between gap-4">
        <SectionLabel>
          <span id="answer-heading">Answer</span>
        </SectionLabel>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-xs text-zinc-400">
          <Sparkles size={13} aria-hidden />
          AI-generated
        </span>
      </div>

      <div className="mt-7 rounded-[28px] border border-white/6 bg-white/[0.025] p-10">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h2 className="text-3xl font-bold mb-6 text-white">{children}</h2>
            ),
            h2: ({ children }) => (
              <h3 className="text-2xl font-semibold mt-8 mb-4 text-white first:mt-0">{children}</h3>
            ),
            h3: ({ children }) => (
              <h4 className="text-xl font-semibold mt-6 mb-3 text-white first:mt-0">{children}</h4>
            ),
            p: ({ children }) => (
              <p className="text-zinc-200 leading-8 mb-5 last:mb-0">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-3 mb-5 text-zinc-200">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 space-y-3 mb-5 text-zinc-200">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-8">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold text-white">{children}</strong>
            ),
            a: ({ href, children }) => {
              const number = citationNumber(href);
              if (number !== null) {
                return <CitationChip number={number} source={byNumber.get(number)} />;
              }
              // Links written by the model are shown as text, never navigated
              // to: they come from document content and are not vetted.
              return <span className="text-zinc-100 underline decoration-zinc-600">{children}</span>;
            },
            table: ({ children }) => (
              <div className="mb-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-[14px] text-zinc-200">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border-b border-white/10 px-3 py-2 font-semibold text-white">{children}</th>
            ),
            td: ({ children }) => (
              <td className="border-b border-white/5 px-3 py-2 align-top">{children}</td>
            ),
            code: ({ children }) => (
              <code className="rounded-md bg-zinc-900 px-1.5 py-1 text-blue-300 text-sm">{children}</code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-5 italic text-zinc-300 my-5">
                {children}
              </blockquote>
            ),
          }}
        >
          {linkCitations(answer)}
        </ReactMarkdown>

        <p className="mt-8 border-t border-white/5 pt-5 text-[13px] leading-6 text-zinc-500">
          This text was written by an AI model from the sources below and may be incomplete or
          wrong. Numbered markers point to the source passage for each statement; check the source
          before relying on it.
        </p>
      </div>
    </section>
  );
}
