import { useState } from "react";

import HomeHero from "../components/home/HomeHero";
import ResultsView from "../components/results/ResultsView";

import { askQuestion } from "../services/api";
import type { Source } from "../services/api";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [confidence, setConfidence] = useState(0);
  const [latency, setLatency] = useState(0);

  const [loading, setLoading] = useState(false);

  const [sources, setSources] = useState<Source[]>([]);
  const [retrievedChunks, setRetrievedChunks] = useState(0);
  const [citations, setCitations] = useState(0);
  const [model, setModel] = useState("");

  async function handleSearch(question: string) {
    console.log("4. App received:", question);

    try {
      setLoading(true);
      setQuestion(question);

      console.log("5. Calling API");

      const response = await askQuestion(question);

      console.log("6. API response:", response);

      setAnswer(response.answer);
      setConfidence(response.confidence);
      setLatency(response.latency_ms);

      setSources(response.sources);
      setRetrievedChunks(response.retrieved_chunks);
      setCitations(response.citations);
      setModel(response.model);

    } catch (err) {
      console.error("App error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

    return (
      <>
        {!answer ? (
          <HomeHero
            onSearch={handleSearch}
            loading={loading}
          />
        ) : (
          <ResultsView
            question={question}
            answer={answer}
            confidence={confidence}
            latency={latency}
            loading={loading}
            sources={sources}
            retrievedChunks={retrievedChunks}
            citations={citations}
            model={model}
            onSearch={handleSearch}
          />
        )}
      </>
    )};