"use client";

import { KNOWLEDGE_LEVELS } from "@/lib/topics";
import { SCREEN_FLAVOR } from "@/lib/personality";
import { Card } from "@/components/ui/Card";

interface WelcomeScreenProps {
  onSelect: (level: string) => void;
}

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <div className="max-w-[600px] mx-auto animate-screen">
      <div className="text-center mb-8">
        <div className="text-[48px] mb-3 animate-emoji">&#x1F9FE;</div>
        <h1 className="text-[26px] font-extrabold text-tax-text font-serif m-0 leading-tight">
          Taxes, Explained<br />For Humans
        </h1>
        <p className="text-tax-muted text-[14px] mt-2 font-sans max-w-[420px] mx-auto leading-relaxed">
          We&apos;ll walk you through your taxes step by step, figure out if you&apos;re
          getting money back or if you owe, and explain everything in plain English.
        </p>
        <p className="text-tax-dim text-[12px] mt-2 font-sans italic max-w-[380px] mx-auto">
          {SCREEN_FLAVOR.welcome.tagline}
        </p>
        <div className="text-[10px] text-tax-dim font-mono mt-3">
          2025 Tax Year &bull; Filed in 2026
        </div>
      </div>

      <p className="text-[14px] font-semibold text-tax-text mb-3 font-sans">
        How much do you know about filing taxes?
      </p>

      <div className="flex flex-col gap-2">
        {KNOWLEDGE_LEVELS.map((k, i) => (
          <div key={k.id} className={`animate-card delay-${i}`}>
            <Card onClick={() => onSelect(k.id)} className="btn-press !py-4">
              <span className="text-[28px]">{k.emoji}</span>
              <div>
                <div className="text-[14px] font-semibold text-tax-text">{k.label}</div>
                <div className="text-[12px] text-tax-muted mt-0.5">{k.desc}</div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-tax-dim font-sans text-center mt-6 italic">
        {SCREEN_FLAVOR.welcome.footer}
      </p>
    </div>
  );
}
