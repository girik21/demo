"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [joke, setJoke] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchJoke() {
    setLoading(true);
    try {
      const res = await fetch("/api/agent");
      const data = await res.json();
      console.log("Data", data)
      setJoke(data.final_joke ?? "No joke generated.");
    } catch (err) {
      setJoke("Error fetching joke.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <main className="mx-auto text-center mt-10">
      <h1 className="text-3xl font-bold">Agentic Gemini Joke</h1>
      <p className="mt-4 whitespace-pre-line">{joke}</p>
      <button
        onClick={fetchJoke}
        className="mt-6 bg-white px-5 py-2 rounded-2xl text-black hover:bg-gray-200 font-semibold border"
        disabled={loading}
      >
        {loading ? "Thinking..." : "Retry Joke"}
      </button>
    </main>
  );
}
