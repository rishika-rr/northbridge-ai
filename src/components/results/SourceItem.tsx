import { sourceElementId } from "../../lib/citations";
import type { Source } from "../../services/api";

export default function SourceItem({ source }: { source: Source }) {
  const { title, score, citation, page, snippet } = source;

  return (
    <article
      id={citation !== null ? sourceElementId(citation) : undefined}
      tabIndex={-1}
      className="
      scroll-mt-8 rounded-2xl border border-white/6 bg-white/[0.025] px-6 py-5
      transition-all duration-200
      hover:border-blue-500/20 hover:bg-white/[0.04]
      focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20
      "
    >
      <div className="flex items-start gap-4">
        <div
          className="
          mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
          bg-blue-500/10 text-[14px] font-semibold text-blue-300
          "
          aria-label={citation !== null ? `Source ${citation}` : "Source"}
        >
          {citation ?? "–"}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium text-white break-words">{title}</h3>

          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-zinc-500">
            {page !== null && (
              <span>
                Page <span className="text-zinc-300">{page}</span>
              </span>
            )}
            <span>
              Relevance{" "}
              <span className="text-zinc-300">
                {score !== null ? `${Math.round(score * 100)}%` : "not scored"}
              </span>
            </span>
          </p>

          {snippet && (
            <blockquote className="mt-4 border-l-2 border-white/10 pl-4 text-[14px] leading-7 text-zinc-400 whitespace-pre-line break-words">
              {snippet}
              {snippet.length >= 300 ? "…" : ""}
            </blockquote>
          )}
        </div>
      </div>
    </article>
  );
}
