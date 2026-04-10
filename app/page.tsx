"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { buildTopics, KNOWLEDGE_LEVELS } from "@/lib/topics";
import { useStreaming } from "@/lib/use-streaming";
import { emptyProfile, calculateTax, type FinancialProfile } from "@/lib/financial-profile";
import { fmtD } from "@/lib/tax-data";
import type { Topic } from "@/lib/types";

import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { FilingStatusScreen } from "@/components/screens/FilingStatusScreen";
import { SituationsScreen } from "@/components/screens/SituationsScreen";
import { FinancialDetailsScreen } from "@/components/screens/FinancialDetailsScreen";
import { AnalysisScreen } from "@/components/screens/AnalysisScreen";
import { TopicsScreen } from "@/components/screens/TopicsScreen";
import { DetailScreen } from "@/components/screens/DetailScreen";
import { ActionPlanScreen } from "@/components/screens/ActionPlanScreen";

type Screen =
  | "welcome"
  | "filing"
  | "situations"
  | "financial"
  | "analysis"
  | "topics"
  | "detail"
  | "action_plan";

export default function TaxGuide() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [level, setLevel] = useState<string | null>(null);
  const [filingStatus, setFilingStatus] = useState<string | null>(null);
  const [situations, setSituations] = useState<string[]>([]);
  const [profile, setProfile] = useState<FinancialProfile>(emptyProfile());
  const [topics, setTopics] = useState<Topic[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // AI streaming
  const mainStream = useStreaming();
  const followUpStream = useStreaming();
  const [followUpInput, setFollowUpInput] = useState("");
  const aiCacheRef = useRef<Record<string, string>>({});

  // Tax calculation (memoized)
  const taxCalc = useMemo(
    () => (filingStatus ? calculateTax(profile, filingStatus) : null),
    [profile, filingStatus]
  );

  const handleUpdateProfile = useCallback((key: string, value: number | null) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Build a financial context string for AI prompts
  const financialContext = useMemo(() => {
    if (!taxCalc) return "";
    const parts: string[] = [];
    parts.push(`User's actual financial data:`);
    parts.push(`- Gross income: ${fmtD(Math.round(taxCalc.grossIncome))}`);
    if (taxCalc.w2Wages > 0) parts.push(`- W-2 wages: ${fmtD(Math.round(taxCalc.w2Wages))}`);
    if (taxCalc.selfEmploymentNet > 0) parts.push(`- Self-employment net: ${fmtD(Math.round(taxCalc.selfEmploymentNet))}`);
    if (taxCalc.investmentIncome > 0) parts.push(`- Investment income: ${fmtD(Math.round(taxCalc.investmentIncome))}`);
    parts.push(`- AGI: ${fmtD(Math.round(taxCalc.agi))}`);
    parts.push(`- Deduction: ${taxCalc.useItemized ? "Itemized" : "Standard"} (${fmtD(Math.round(taxCalc.deductionUsed))})`);
    parts.push(`- Taxable income: ${fmtD(Math.round(taxCalc.taxableOrdinaryIncome))}`);
    parts.push(`- Effective rate: ${(taxCalc.effectiveRate * 100).toFixed(1)}%`);
    parts.push(`- Marginal bracket: ${(taxCalc.marginalRate * 100).toFixed(0)}%`);
    parts.push(`- Estimated tax: ${fmtD(Math.round(taxCalc.taxAfterCredits))}`);
    if (taxCalc.totalCredits > 0) parts.push(`- Credits: ${fmtD(Math.round(taxCalc.totalCredits))}`);
    if (taxCalc.totalWithholding > 0) {
      parts.push(`- Withholding: ${fmtD(Math.round(taxCalc.totalWithholding))}`);
      parts.push(`- Estimated ${taxCalc.estimatedRefundOrOwed >= 0 ? "refund" : "owed"}: ${fmtD(Math.abs(Math.round(taxCalc.estimatedRefundOrOwed)))}`);
    }
    return parts.join("\n");
  }, [taxCalc]);

  const getSystemPrompt = useCallback(
    (topicTitle?: string) => {
      const levelLabel = KNOWLEDGE_LEVELS.find((k) => k.id === level)?.label || level;
      const base = topicTitle
        ? `Tax educator. Filing: ${filingStatus}. Level: ${level}. Topic: ${topicTitle}. 2025 IRS tax year data only. Markdown.`
        : `You are a tax educator for US individual taxpayers. User level: "${levelLabel}". Use 2025 IRS tax year data ONLY. Cite IRS sources. Markdown format. Be accurate.`;

      if (financialContext) {
        return `${base}\n\nIMPORTANT: Reference the user's specific financial numbers when explaining concepts. Use their actual income, deductions, and tax amounts to make explanations concrete and personal.\n\n${financialContext}`;
      }
      return base;
    },
    [level, filingStatus, financialContext]
  );

  const handleSelectTopic = useCallback(
    (id: string) => {
      setActiveTopic(id);
      setFollowUpInput("");
      followUpStream.reset();
      setScreen("detail");

      const topic = topics.find((t) => t.id === id);
      if (!topic) return;

      if (aiCacheRef.current[id]) return;

      mainStream.fetchStream(getSystemPrompt(), topic.aiPrompt);
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
          onBack={() => setScreen("welcome")}
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
          onContinue={() => setScreen("financial")}
          onBack={() => setScreen("filing")}
        />
      )}

      {screen === "financial" && (
        <FinancialDetailsScreen
          situations={situations}
          profile={profile}
          onUpdate={handleUpdateProfile}
          onComplete={() => setScreen("analysis")}
          onBack={() => setScreen("situations")}
        />
      )}

      {screen === "analysis" && filingStatus && (
        <AnalysisScreen
          profile={profile}
          filingStatus={filingStatus}
          onContinueToGuide={() => setScreen("action_plan")}
          onBack={() => setScreen("financial")}
        />
      )}

      {screen === "action_plan" && filingStatus && level && (
        <ActionPlanScreen
          profile={profile}
          filingStatus={filingStatus}
          situations={situations}
          level={level}
          onLearnMore={() => {
            if (topics.length === 0) {
              setTopics(buildTopics(level!, filingStatus!, situations));
            }
            setScreen("topics");
          }}
          onBack={() => setScreen("analysis")}
        />
      )}

      {screen === "topics" && (
        <TopicsScreen
          topics={topics}
          completed={completed}
          filingStatus={filingStatus}
          onSelect={handleSelectTopic}
          onBack={() => setScreen("action_plan")}
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
