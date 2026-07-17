const BASE_URL = import.meta.env.VITE_API_URL;

export interface Source {
  title: string;
  score: number | null;
}

export interface AskResponse {
  answer: string;

  confidence: number;

  model: string;

  latency_ms: number;

  retrieved_chunks: number;

  citations: number;

  sources: Source[];
}
export async function askQuestion(question: string) {
  const response = await fetch(`${BASE_URL}/v1/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json() as Promise<AskResponse>;
}