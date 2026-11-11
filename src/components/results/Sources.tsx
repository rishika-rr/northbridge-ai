import type { Source } from "../../services/api";
import { SectionLabel } from "../ui/controls";
import SourceItem from "./SourceItem";

export default function Sources({ sources }: { sources: Source[] }) {
  return (
    <section aria-labelledby="sources-heading">
      <SectionLabel>
        <span id="sources-heading">Sources</span>
      </SectionLabel>

      <p className="mt-3 text-[14px] text-zinc-500">
        Passages retrieved from your documents. These are quoted from the originals, not written by
        the AI.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {sources.length === 0 ? (
          <p className="text-zinc-500">No supporting documents found.</p>
        ) : (
          sources.map((source, index) => (
            <SourceItem key={`${source.doc_id ?? source.title}-${index}`} source={source} />
          ))
        )}
      </div>
    </section>
  );
}
