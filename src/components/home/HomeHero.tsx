import { motion } from "framer-motion";

import HeroTitle from "./HeroTitle";
import SearchBox from "./SearchBox";
import SuggestionChips from "./SuggestionChips";
type Props = {
  onSearch: (question: string) => Promise<void>;
  loading : boolean;
};

export default function HomeHero({ onSearch, loading }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .55 }}
      className="
      flex
      flex-col
      items-center

      pt-24
      "
    >
      <HeroTitle />

      <div className="mt-12 w-full max-w-[840px]">

        <SearchBox onSearch={onSearch} loading={loading} />

      </div>

      <div className="mt-8">

        <SuggestionChips />

      </div>

      <p
        className="
        mt-5

        text-sm

        text-zinc-500
        "
      >
        Press Enter to search
      </p>

    </motion.section>
  );
}