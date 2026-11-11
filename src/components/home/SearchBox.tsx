import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Search } from "lucide-react";

import { MAX_QUESTION_CHARS } from "../../services/api";

type Props = {
  onSearch: (query: string) => void;
  loading?: boolean;
  initialValue?: string;
};

export default function SearchBox({ onSearch, loading = false, initialValue = "" }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const trimmed = query.trim();
  const tooLong = trimmed.length > MAX_QUESTION_CHARS;
  const problem =
    touched && !trimmed
      ? "Type a question first."
      : tooLong
        ? `Questions can be at most ${MAX_QUESTION_CHARS} characters (yours has ${trimmed.length}).`
        : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (loading || !trimmed || tooLong) return;
    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <div
        className={`
        h-[82px] rounded-[28px] border bg-white/[0.03] backdrop-blur-xl
        transition-all duration-300
        focus-within:bg-white/[0.045] focus-within:shadow-[0_0_60px_rgba(59,130,246,0.12)]
        flex items-center px-7
        ${problem ? "border-red-500/40" : "border-white/8 focus-within:border-blue-500/40"}
        `}
      >
        <Search size={24} className="text-zinc-500" aria-hidden />

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setTouched(false);
          }}
          aria-label="Your question"
          aria-invalid={problem ? true : undefined}
          aria-describedby={problem ? "question-problem" : undefined}
          placeholder="Ask anything about your organization..."
          className="flex-1 min-w-0 bg-transparent px-5 text-[19px] text-white placeholder:text-zinc-500 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="
          h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500
          transition-all duration-200
          flex items-center gap-3 font-medium whitespace-nowrap
          disabled:cursor-wait disabled:opacity-70
          "
        >
          {loading ? "Thinking..." : "Ask AI"}
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>

      {problem && (
        <p id="question-problem" role="alert" className="mt-3 px-3 text-[14px] text-red-300">
          {problem}
        </p>
      )}
    </form>
  );
}
