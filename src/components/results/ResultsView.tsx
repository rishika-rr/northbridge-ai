import { motion } from "framer-motion";
import { SearchX } from "lucide-react";

import type { AskResponse } from "../../services/api";
import SearchBox from "../home/SearchBox";
import Notice from "../ui/Notice";
import { SectionLabel } from "../ui/controls";
import Answer from "./Answer";
import CitationChecks from "./CitationChecks";
import Insights from "./Insights";
import Sources from "./Sources";

type Props = {
  question: string;
  result: AskResponse | null;
  loading: boolean;
  error: string | null;
  onSearch: (query: string) => void;
};

export default function ResultsView({ question, result, loading, error, onSearch }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-[960px] mx-auto pt-10 pb-24"
    >
      <SearchBox key={question} initialValue={question} loading={loading} onSearch={onSearch} />

      {/* Request status */}
      <div className="mt-6 space-y-4" aria-live="polite">
        {loading && (
          <p role="status" className="flex items-center gap-3 px-3 text-[14px] text-zinc-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" aria-hidden />
            Searching your documents and writing an answer. This can take a few seconds…
          </p>
        )}
        {error && !loading && (
          <Notice>
            <p className="font-medium">We couldn't answer that question.</p>
            <p className="mt-1">{error}</p>
          </Notice>
        )}
      </div>

      {result && (
        // The previous answer stays readable, dimmed, while a new one loads.
        <div className={`transition-opacity ${loading ? "opacity-40" : "opacity-100"}`}>
          {result.no_evidence ? (
            <NoEvidence message={result.answer} />
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.35 }}
                className="mt-12"
              >
                <Answer answer={result.answer} sources={result.sources} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="mt-16"
              >
                <Sources sources={result.sources} />
              </motion.div>

              {result.citation_details.length > 0 && (
                <div className="mt-16">
                  <CitationChecks checks={result.citation_details} />
                </div>
              )}
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
            className="mt-16"
          >
            <Insights result={result} />
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}

function NoEvidence({ message }: { message: string }) {
  return (
    <section className="mt-12">
      <SectionLabel>No answer found</SectionLabel>
      <div className="mt-7 flex items-start gap-5 rounded-[28px] border border-white/6 bg-white/[0.025] p-10">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
          <SearchX size={20} aria-hidden />
        </div>
        <div>
          <p className="text-[17px] leading-8 text-zinc-100">{message}</p>
          <p className="mt-3 text-[14px] leading-7 text-zinc-500">
            Nothing in the documents you can access was relevant enough, so no answer was generated.
            Try different wording, or check the Knowledge Base to see which documents are available
            to you.
          </p>
        </div>
      </div>
    </section>
  );
}
