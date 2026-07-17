import { motion } from "framer-motion";

type Props = {
  confidence: number;
  latency: number;

  documents: number;

  citations: number;

  model: string;
};

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      className="
      rounded-[24px]

      border
      border-white/6

      bg-white/[0.025]

      px-7
      py-7

      transition-all
      duration-200

      hover:border-blue-500/15
      "
    >
      <h3
        className="
        text-[30px]

        font-semibold

        tracking-[-0.04em]

        text-white

        break-words
        "
      >
        {value}
      </h3>

      <p
        className="
        mt-2

        text-[13px]

        text-zinc-500
        "
      >
        {label}
      </p>

    </div>
  );
}

export default function Insights({
  confidence,
  latency,
  documents,
  citations,
  model,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
    >

      <p
        className="
        text-[11px]

        uppercase

        tracking-[0.28em]

        text-blue-400

        font-medium
        "
      >
        Insights
      </p>

      <div
        className="
        mt-7

        grid

        grid-cols-2

        gap-5
        "
      >

        <Metric
          value={`${Math.round(confidence * 100)}%`}
          label="Confidence"
        />

        <Metric
          value={`${(latency / 1000).toFixed(2)} s`}
          label="Latency"
        />

        <Metric
          value={documents.toString()}
          label="Retrieved Chunks"
        />

        <Metric
          value={citations.toString()}
          label="Verified Citations"
        />

        <Metric
          value={model}
          label="Model"
        />

      </div>

    </motion.section>
  );
}