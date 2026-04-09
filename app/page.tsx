"use client";

import { useState, useCallback, useRef } from "react";
import { buildTopics, KNOWLEDGE_LEVELS } from "@/lib/topics";
import { useStreaming } from "@/lib/use-streaming";
import type { Topic } from "@/lib/types";

import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { FilingStatusScreen } from "@/components/screens/FilingStatusScreen";
import { SituationsScreen } from "@/components/screens/SituationsScreen";
import { TopicsScreen } from "@/components/screens/TopicsScreen";
import { DetailScreen } from "@/components/screens/DetailScreen";

type Screen = "welcome" | "filing" | "situations" | "topics" | "detail";

export default function TaxGuide() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [level, setLevel] = useState<string | null>(null);
  const [filingStatus, setFilingStatus] = useState<string | null>(null);
  const [situations, setSituations] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // AI streaming for main explanations
  const mainStream = useStreaming();
  // AI streaming for follow-up questions
  const followUpStream = useStreaming();

  const [followUpInput, setFollowUpInput] = useState("");

  // Cache for completed AI explanations
  const aiCacheRef = useRef<Record<string, string>>({});

  const getSystemPrompt = useCallback(
    (topicTitle?: string) => {
      const levelLabel = KNOWLEDGE_LEVELS.find((k) => k.id === level)?.label || level;
      if (topicTitle) {
        return `Tax educator. Filing: ${filingStatus}. Level: ${level}. Topic: ${topicTitle}. 2024 IRS data only. Markdown.`;
      }
      return `You are a tax educator for US individual taxpayers. User level: "${levelLabel}". Use 2024 IRS tax year data ONLY. Cite IRS sources. Markdown format. Be accurate.`;
    },
    [level, filingStatus]
  );

  const handleSelectTopic = useCallback(
    (id: string) => {
      setActiveTopic(id);
      setFollowUpInput("");
      followUpStream.reset();
      setScreen("detail");

      const topic = topics.find((t) => t.id === id);
      if (!topic) return;

      // Use cached content if available
      if (aiCacheRef.current[id]) {
        // Content already cached, mainStream won't be used
        return;
      }

      mainStream.fetchStream(getSystemPrompt(), topic.aiPrompt).then(() => {
        // Cache the result when streaming completes
        // We'll read from mainStream.content in the render
      });
    },
    [topics, getSystemPrompt, mainStream, followUpStream]
  );

  const handleAskFollowUp = useCallback(() => {
    if (!followUpInput.trim() || !activeTopic) return;
    const topic = topics.find((t) => t.id === activeTopic);
    if (!topic) return;

    const context = aiCacheRef.current[activeTopic] || mainStream.content;
    followUpStream.fetchStream(
      getSystemPrompt(topic.title),
      `Context:\n${context}\n\nQuestion: ${followUpInput}`
    );
    setFollowUpInput("");
  }, [followUpInput, activeTopic, topics, getSystemPrompt, mainStream.content, followUpStream]);

  const handleBack = useCallback(() => {
    // Cache current content before navigating away
    if (activeTopic && mainStream.content) {
      aiCacheRef.current[activeTopic] = mainStream.content;
    }
    mainStream.reset();
    followUpStream.reset();
    setActiveTopic(null);
    setScreen("topics");
  }, [activeTopic, mainStream, followUpStream]);

  const handleDone = useCallback(() => {
    if (activeTopic) {
      // Cache the content
      if (mainStream.content) {
        aiCacheRef.current[activeTopic] = mainStream.content;
      }
      if (!completed.includes(activeTopic)) {
        setCompleted((prev) => [...prev, activeTopic]);
      }
    }
    mainStream.reset();
    followUpStream.reset();
    setActiveTopic(null);
    setScreen("topics");
  }, [activeTopic, completed, mainStream, followUpStream]);

  const currentTopic = topics.find((t) => t.id === activeTopic);
  const displayContent = activeTopic
    ? aiCacheRef.current[activeTopic] || mainStream.content
    : "";

  return (
    <div className="min-h-screen bg-tax-bg text-tax-text font-sans px-4 py-6 pb-12 sm:px-6">
      {screen === "welcome" && (
        <WelcomeScreen
          onSelect={(l) => {
            setLevel(l);
            setScreen("filing");
          }}
        />
      )}

      {screen === "filing" && (
        <FilingStatusScreen
          selected={filingStatus}
          onSelect={setFilingStatus}
          onContinue={() => setScreen("situations")}
        />
      )}

      {screen === "situations" && (
        <SituationsScreen
          selected={situations}
          onToggle={(id) =>
            setSituations((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          onContinue={() => {
            setTopics(buildTopics(level!, filingStatus!, situations));
            setScreen("topics");
          }}
        />
      )}

      {screen === "topics" && (
        <TopicsScreen
          topics={topics}
          completed={completed}
          filingStatus={filingStatus}
          onSelect={handleSelectTopic}
        />
      )}

      {screen === "detail" && activeTopic && currentTopic && (
        <DetailScreen
          topic={currentTopic}
          aiContent={displayContent}
          aiLoading={mainStream.loading}
          onBack={handleBack}
          onAsk={handleAskFollowUp}
          followUp={followUpInput}
          setFollowUp={setFollowUpInput}
          followUpAnswer={followUpStream.content}
          followUpLoading={followUpStream.loading}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
