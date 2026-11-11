import { CheckCircle2, CircleAlert } from "lucide-react";

import type { CitationDetail } from "../../services/api";
import { SectionLabel } from "../ui/controls";

/** Per-statement result of the automated citation check. */
export default function CitationChecks({ checks }: { checks: CitationDetail[] }) {
  const supported = checks.filter((c) => c.supported).length;

  return (
    <section aria-labelledby="checks-heading">
      <SectionLabel>
        <span id="checks-heading">Citation checks</span>
      </SectionLabel>

      <p className="mt-3 text-[14px] leading-6 text-zinc-500">
        A second AI pass compared each cited statement with its source passage: {supported} of{" "}
        {checks.length} were found to be supported. This is an automated check, not a guarantee.
      </p>

      <details className="group mt-5 rounded-2xl border border-white/6 bg-white/[0.025]">
        <summary className="cursor-pointer select-none px-6 py-4 text-[14px] font-medium text-zinc-200 hover:text-white">
          Show each statement
        </summary>

        <ul className="divide-y divide-white/5 border-t border-white/5">
          {checks.map((check, index) => (
            <li key={index} className="flex items-start gap-4 px-6 py-4">
              {check.supported ? (
                <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-400" aria-hidden />
              ) : (
                <CircleAlert size={18} className="mt-1 shrink-0 text-amber-300" aria-hidden />
              )}
              <div className="min-w-0">
                <p className="text-[14px] leading-6 text-zinc-200 break-words">{check.claim}</p>
                <p className="mt-1 text-[13px] leading-6 text-zinc-500">
                  <span className={check.supported ? "text-emerald-400" : "text-amber-300"}>
                    {check.supported ? "Supported" : "Not confirmed"}
                  </span>{" "}
                  by source {check.citation}
                  {check.reason ? ` · ${check.reason}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
