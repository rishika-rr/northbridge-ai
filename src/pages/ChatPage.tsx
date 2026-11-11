import { useRef, useState } from "react";

import HomeHero from "../components/home/HomeHero";
import ResultsView from "../components/results/ResultsView";
import { askQuestion } from "../services/api";
import type { AskResponse } from "../services/api";
import { ApiError, describeError } from "../services/http";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only the latest question may update the screen.
  const latest = useRef(0);

  async function handleSearch(text: string) {
    const id = ++latest.current;
    setQuestion(text);
    setLoading(true);
    setError(null);

    try {
      const response = await askQuestion(text);
      if (id !== latest.current) return;
      setResult(response);
    } catch (err) {
      if (id !== latest.current) return;
      // An ended session is handled by the sign-in screen, not shown here.
      if (!(err instanceof ApiError && err.status === 401)) {
        setError(describeError(err));
      }
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }

  if (!result && !error && !loading) {
    return <HomeHero onSearch={handleSearch} loading={loading} />;
  }

  return (
    <ResultsView
      question={question}
      result={result}
      loading={loading}
      error={error}
      onSearch={handleSearch}
    />
  );
}
