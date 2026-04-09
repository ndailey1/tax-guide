"use client";

import { TAX_DATA } from "@/lib/tax-data";
import type { Topic } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface TopicsScreenProps {
  topics: Topic[];
  completed: string[];
  filingStatus: string | null;
  onSelect: (id: string) => void;
  onViewActionPlan: () => void;
}

export function TopicsScreen({
  topics,
  completed,
  filingStatus,
  onSelect,
  onViewActionPlan,
}: TopicsScreenProps) {
  return (
    <div className="max-w-[600px] mx-auto animate-screen">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-extrabold text-tax-text font-serif m-0">
          Your Tax Guide
        </h2>
        <span className="font-mono text-[10px] text-tax-muted">
          {completed.length}/{topics.length}
        </span>
      </div>
      <div className="text-[11px] text-tax-muted font-mono mb-2.5">
        {filingStatus?.replace(/_/g, " ")} &bull; {TAX_DATA.year} Tax Year &bull;
        IRS-sourced data
      </div>

      <ProgressBar current={completed.length} total={topics.length} />

      <div className="flex flex-col gap-1.5">
        {topics.map((t, i) => {
          const done = completed.includes(t.id);
          return (
            <div key={t.id} className={`animate-card delay-${Math.min(i, 12)}`}>
            <Card
              onClick={() => onSelect(t.id)}
              className={
                done
                  ? "!border-tax-green !bg-tax-green-dim"
                  : ""
              }
            >
              <span className="text-[22px]">{t.icon}</span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-tax-text">
                  {t.title}
                </div>
                <div className="text-[10px] text-tax-muted mt-0.5">
                  {t.sections.filter((s) => s.type === "table" || s.type === "table3").length}{" "}
                  tables
                  {t.sections.filter((s) => s.type === "warning").length > 0
                    ? ` \u2022 ${t.sections.filter((s) => s.type === "warning").length} alerts`
                    : ""}
                </div>
              </div>
              {done ? (
                <span className="text-tax-green text-xs font-semibold">&#x2713;</span>
              ) : (
                <span className="text-tax-accent text-base">&rarr;</span>
              )}
            </Card>
            </div>
          );
        })}
      </div>

      {/* Action Plan Button */}
      <button
        onClick={onViewActionPlan}
        className="w-full mt-5 py-5 rounded-xl border-2 border-tax-accent bg-tax-accent-dim text-white text-[15px] font-bold font-sans cursor-pointer hover:bg-tax-accent/20 transition-all btn-press animate-glow"
      >
        <span className="text-xl mr-2">&#x1F3AF;</span>
        What You Should Do &mdash; Your Action Plan
      </button>
    </div>
  );
}
