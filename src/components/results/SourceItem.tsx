import { FileText } from "lucide-react";

type Props = {
  title: string;
  score: number | null;
};

export default function SourceItem({
  title,
  score,
}: Props) {
  return (
    <div
      className="
      rounded-2xl

      border
      border-white/6

      bg-white/[0.025]

      px-6
      py-5

      transition-all
      duration-200

      hover:border-blue-500/20
      hover:bg-white/[0.04]
      "
    >
      <div className="flex items-start gap-4">

        <div
          className="
          mt-0.5

          flex
          h-10
          w-10

          items-center
          justify-center

          rounded-xl

          bg-blue-500/10

          text-blue-400
          "
        >
          <FileText size={18} />
        </div>

        <div className="flex-1">

          <h3
            className="
            text-[15px]

            font-medium

            text-white

            break-all
            "
          >
            {title}
          </h3>

          <p
            className="
            mt-2

            text-[13px]

            text-zinc-500
            "
          >
            Similarity{" "}
            <span className="text-zinc-300">
              {score !== null
                ? score.toFixed(2)
                : "--"}
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}