"use client";

import { KNOWLEDGE_LEVELS } from "@/lib/topics";
import { Card } from "@/components/ui/Card";

interface WelcomeScreenProps {
  onSelect: (level: string) => void;
}

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <div className="max-w-[600px] mx-auto">
      <div className="text-center mb-8">
        <div className="text-[40px] mb-2">&#x1F9FE;</div>
        <h1 className="text-2xl font-extrabold text-tax-text font-serif m-0">
          Taxes, Explained For Humans
        </h1>
        <p className="text-tax-muted text-[13px] mt-1.5 font-sans max-w-[420px] mx-auto">
          We&apos;ll walk you through your taxes step by step, figure out if you&apos;re
          getting money back or if you owe, and explain everything in plain English.
        </p>
        <div className="text-[10px] text-tax-dim font-mono mt-1.5">
          2025 Tax Year &bull; Filed in 2026
        </div>
      </div>

      <p className="text-[13px] font-semibold text-tax-text mb-2.5 font-sans">
        How much do you know about filing taxes?
      </p>

      <div className="flex flex-col gap-[7px]">
        {KNOWLEDGE_LEVELS.map((k) => (
          <Card key={k.id} onClick={() => onSelect(k.id)}>
            <span className="text-2xl">{k.emoji}</span>
            <div>
              <div className="text-[13px] font-semibold text-tax-text">{k.label}</div>
              <div className="text-[11px] text-tax-muted mt-0.5">{k.desc}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
