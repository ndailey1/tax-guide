"use client";

import { useRef, useEffect } from "react";
import type { Topic } from "@/lib/types";
import { TAX_DATA } from "@/lib/tax-data";
import { SectionRenderer } from "@/components/ui/SectionRenderer";
import { MdRender } from "@/components/ui/MdRender";

interface DetailScreenProps {
  topic: Topic;
  aiContent: string;
  aiLoading: boolean;
  onBack: () => void;
  onAsk: () => void;
  followUp: string;
  setFollowUp: (value: string) => void;
  followUpAnswer: string;
  followUpLoading: boolean;
  onDone: () => void;
}

export function DetailScreen({
  topic,
  aiContent,
  aiLoading,
  onBack,
  onAsk,
  followUp,
  setFollowUp,
  followUpAnswer,
  followUpLoading,
  onDone,
}: DetailScreenProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiContent, followUpAnswer]);

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
      >
        &larr; Back to Guide
      </button>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-[28px]">{topic.icon}</span>
        <h2 className="text-lg font-extrabold text-tax-text font-serif m-0">
          {topic.title}
        </h2>
      </div>

      {/* IRS Data Section */}
      <div className="bg-tax-surface border border-tax-border rounded-[10px] p-4 mb-3.5">
        <div className="text-[10px] font-bold text-tax-green uppercase tracking-wider mb-2 font-mono">
          &#x1F4CA; Official IRS Data &mdash; {TAX_DATA.year}
        </div>
        <SectionRenderer sections={topic.sections} />
      </div>

      {/* AI Explanation Section */}
      <div className="bg-tax-surface-alt border border-tax-border rounded-[10px] p-4">
        <div className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-2 font-mono">
          &#x1F4A1; Plain-Language Explanation
        </div>
        {aiLoading && !aiContent ? (
          <div className="py-6 text-center">
            <div className="text-[22px] animate-pulse">&#x1F50D;</div>
            <p className="text-tax-muted text-xs font-sans">
              Writing your explanation...
            </p>
          </div>
        ) : aiContent ? (
          <MdRender text={aiContent} />
        ) : null}
      </div>

      {/* Follow-up and completion */}
      {(aiContent || !aiLoading) && aiContent && (
        <>
          {/* Follow-up answer */}
          {followUpAnswer && (
            <div className="mt-3 bg-tax-surface border border-tax-orange/20 rounded-[10px] px-4 py-3.5">
              <div className="text-[10px] font-bold text-tax-orange mb-1 font-mono">
                FOLLOW-UP
              </div>
              <MdRender text={followUpAnswer} />
            </div>
          )}

          {/* Follow-up input */}
          <div className="flex gap-[7px] mt-3">
            <input
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && followUp.trim()) onAsk();
              }}
              className="flex-1 py-2.5 px-3 rounded-lg border border-tax-border bg-tax-surface text-tax-text text-xs font-sans outline-none focus:border-tax-accent transition-colors"
            />
            <button
              onClick={onAsk}
              disabled={!followUp.trim() || followUpLoading}
              className={`py-2.5 px-4 rounded-lg border-none bg-tax-accent text-white text-xs font-bold font-sans transition-opacity ${
                followUp.trim()
                  ? "cursor-pointer opacity-100"
                  : "cursor-default opacity-40"
              }`}
            >
              {followUpLoading ? "..." : "Ask"}
            </button>
          </div>

          {/* Complete button */}
          <button
            onClick={onDone}
            className="w-full mt-3 py-2.5 border border-tax-green/30 rounded-lg bg-tax-green-dim text-tax-green text-xs font-bold cursor-pointer font-sans hover:bg-tax-green/20 transition-colors"
          >
            &#x2713; Complete & Return
          </button>
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
