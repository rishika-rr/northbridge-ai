import { motion } from "framer-motion";

import SearchBox from "../home/SearchBox";
import Answer from "./Answer";
import Sources from "./Sources";
import Insights from "./Insights";

type Source = {
  title: string;
  score: number | null;
};

type Props = {
  question: string;

  answer: string;

  confidence: number;
  latency: number;

  loading: boolean;

  sources: Source[];

  retrievedChunks: number;
  citations: number;

  model: string;

  onSearch: (query: string) => Promise<void>;
};

export default function ResultsView({
  question,
  answer,
  confidence,
  latency,
  loading,
  sources,
  retrievedChunks,
  citations,
  model,
  onSearch,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="
      w-full
      max-w-[960px]
      mx-auto
      pt-10
      pb-24
      "
    >
      {/* Search */}

      <SearchBox
        initialValue={question}
        loading={loading}
        onSearch={onSearch}
      />

      {/* Answer */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.12,
          duration: 0.35,
        }}
        className="mt-16"
      >
        <Answer answer={answer} />
      </motion.div>

      {/* Sources */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.20,
          duration: 0.35,
        }}
        className="mt-16"
      >
        <Sources sources={sources} />
      </motion.div>

      {/* Insights */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.28,
          duration: 0.35,
        }}
        className="mt-16"
      >
        <Insights
          confidence={confidence}
          latency={latency}
          documents={retrievedChunks}
          citations={citations}
          model={model}
        />
      </motion.div>
    </motion.section>
  );
}