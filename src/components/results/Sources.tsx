import SourceItem from "./SourceItem";

type Source = {
  title: string;
  score: number | null;
};

type Props = {
  sources: Source[];
};

export default function Sources({
  sources,
}: Props) {
  return (
    <section>

      <p
        className="
        text-[11px]

        uppercase

        tracking-[0.28em]

        text-blue-400

        font-medium
        "
      >
        Sources
      </p>

      <div
        className="
        mt-7

        flex
        flex-col

        gap-4
        "
      >
        {sources.length === 0 ? (

          <p className="text-zinc-500">
            No supporting documents found.
          </p>

        ) : (

          sources.map((source, index) => (

            <SourceItem
              key={`${source.title}-${index}`}
              title={source.title}
              score={source.score}
            />

          ))

        )}
      </div>

    </section>
  );
}