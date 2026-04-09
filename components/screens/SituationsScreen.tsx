"use client";

import { TAX_DATA } from "@/lib/tax-data";
import { LIFE_SITUATIONS } from "@/lib/topics";
import { Card } from "@/components/ui/Card";

interface SituationsScreenProps {
  selected: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}

const CATEGORIES: Record<string, string> = {
  income: "Income Sources",
  life: "Life Events & Status",
  deductions: "Potential Deductions & Credits",
};

export function SituationsScreen({
  selected,
  onToggle,
  onContinue,
}: SituationsScreenProps) {
  let globalIndex = 0;

  return (
    <div className="max-w-[640px] mx-auto animate-screen">
      <h2 className="text-[22px] font-extrabold text-tax-text font-serif mb-1">
        What applies to your {TAX_DATA.year} tax year?
      </h2>
      <p className="text-tax-muted text-[13px] mb-1 font-sans">
        Select all that apply. The more we know, the more money we can try to save you.
      </p>
      <p className="text-tax-dim text-[11px] mb-4 font-sans italic">
        Don&apos;t worry if you miss something &mdash; the IRS will definitely remind you.
      </p>

      {Object.entries(CATEGORIES).map(([cat, label]) => (
        <div key={cat} className="mb-5">
          <h3 className="text-[11px] font-bold text-tax-muted uppercase tracking-wider mb-2 font-mono">
            {label}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {LIFE_SITUATIONS.filter((s) => s.cat === cat).map((s) => {
              const idx = globalIndex++;
              return (
                <div key={s.id} className={`animate-card delay-${Math.min(idx, 12)}`}>
                  <Card
                    onClick={() => onToggle(s.id)}
                    selected={selected.includes(s.id)}
                    className="btn-press !py-3 !px-3"
                  >
                    <span className="text-[20px]">{s.emoji}</span>
                    <span
                      className={`text-[12px] text-tax-text flex-1 leading-tight ${
                        selected.includes(s.id) ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {s.label}
                    </span>
                    {selected.includes(s.id) && (
                      <span className="text-tax-accent text-sm">&#x2713;</span>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={onContinue}
        disabled={selected.length === 0}
        className={`w-full mt-2 py-3.5 border-none rounded-xl text-[14px] font-bold font-sans transition-all btn-press ${
          selected.length > 0
            ? "bg-tax-accent text-white cursor-pointer animate-glow"
            : "bg-tax-border text-tax-dim cursor-default"
        }`}
      >
        Build My Tax Guide &rarr;
      </button>
    </div>
  );
}
