"use client";

import { useState, useCallback, useRef } from "react";

export function useStreaming() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchStream = useCallback(async (system: string, prompt: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setContent("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, prompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setContent("Could not load explanation. Review the IRS data tables above.");
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  accumulated += data.text;
                  setContent(accumulated);
                }
                if (data.error) {
                  accumulated += "\n\nError: " + data.error;
                  setContent(accumulated);
                }
              } catch {
                // skip malformed JSON chunks
              }
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setContent("Could not load explanation. Review the IRS data tables above.");
    }

    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setContent("");
    setLoading(false);
  }, []);

  return { content, loading, fetchStream, reset };
}
