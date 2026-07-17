import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

type Props = {
  onSearch: (query: string) => Promise<void>;

  loading?: boolean;

  initialValue?: string;
};

export default function SearchBox({ onSearch, loading: loadingProp, initialValue }: Props) {
  const [query, setQuery] = useState(initialValue || "");
  const [loading, setLoading] = useState(loadingProp || false);

    async function handleSubmit() {
  console.log("1. Button clicked");

  if (!query.trim()) return;

  try {
    setLoading(true);

    console.log("2. Calling onSearch");

    await onSearch(query);

    console.log("3. onSearch finished");
  } catch (err) {
    console.error("SearchBox error:", err);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="w-full">

      <div
        className="
        h-[82px]

        rounded-[28px]

        border
        border-white/8

        bg-white/[0.03]

        backdrop-blur-xl

        transition-all
        duration-300

        focus-within:border-blue-500/40
        focus-within:bg-white/[0.045]
        focus-within:shadow-[0_0_60px_rgba(59,130,246,0.12)]

        flex
        items-center

        px-7
        "
      >

        <Search
          size={24}
          className="text-zinc-500"
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          placeholder="Ask anything about your organization..."
          className="
          flex-1

          bg-transparent

          px-5

          text-[19px]

          text-white

          placeholder:text-zinc-500

          outline-none
          "
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
          h-14

          px-8

          rounded-2xl

          bg-blue-600

          hover:bg-blue-500

          transition-all
          duration-200

          flex
          items-center
          gap-3

          font-medium
          "
        >
          {loading ? "Thinking..." : "Ask AI"}

          <ArrowRight size={18} />
        </button>

      </div>

    </div>
  );
}