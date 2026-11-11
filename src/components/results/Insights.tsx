import { formatSeconds } from "../../lib/format";
import type { AskResponse } from "../../services/api";
import { SectionLabel } from "../ui/controls";

function Metric({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div
      className="
      rounded-[24px] border border-white/6 bg-white/[0.025] px-7 py-7
      transition-all duration-200 hover:border-blue-500/15
      "
    >
      <p className="text-[30px] font-semibold tracking-[-0.04em] text-white break-words">{value}</p>
      <p className="mt-2 text-[13px] text-zinc-500">{label}</p>
      {note && <p className="mt-2 text-[12px] leading-5 text-zinc-600">{note}</p>}
    </div>
  );
}

export default function Insights({ result }: { result: AskResponse }) {
  const { confidence, latency_ms, retrieved_chunks, citations, verified_citations, model } = result;

  return (
    <section aria-labelledby="insights-heading">
      <SectionLabel>
        <span id="insights-heading">Insights</span>
      </SectionLabel>

      <div className="mt-7 grid grid-cols-2 gap-5">
        {!result.no_evidence && (
          <Metric
            value={confidence !== null ? `${Math.round(confidence * 100)}%` : "–"}
            label="Confidence indicator"
            note="Half from how relevant the sources are, half from the share of citations that passed the check. A rough signal, not the probability that the answer is correct."
          />
        )}

        <Metric value={formatSeconds(latency_ms)} label="Response time" />

        <Metric value={retrieved_chunks.toString()} label="Source passages used" />

        {!result.no_evidence && (
          <Metric
            value={citations > 0 ? `${verified_citations} of ${citations}` : "None"}
            label="Citations that passed the check"
            note={citations === 0 ? "The answer contains no citation markers to check." : undefined}
          />
        )}

        {model && <Metric value={model} label="Model" />}
      </div>
    </section>
  );
}
