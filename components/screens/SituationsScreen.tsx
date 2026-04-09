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
  return (
    <div className="max-w-[640px] mx-auto">
      <h2 className="text-xl font-extrabold text-tax-text font-serif mb-1">
        What applies to your {TAX_DATA.year} tax year?
      </h2>
      <p className="text-tax-muted text-xs mb-3.5 font-sans">
        Select all that apply to ensure you don&apos;t miss deductions, credits, or
        requirements.
      </p>

      {Object.entries(CATEGORIES).map(([cat, label]) => (
        <div key={cat} className="mb-4">
          <h3 className="text-[10px] font-bold text-tax-muted uppercase tracking-wider mb-1.5 font-mono">
            {label}
          </h3>
          <div className="grid grid-cols-2 gap-[5px]">
            {LIFE_SITUATIONS.filter((s) => s.cat === cat).map((s) => (
              <Card
                key={s.id}
                onClick={() => onToggle(s.id)}
                selected={selected.includes(s.id)}
                className="!py-2 !px-2.5"
              >
                <span className="text-lg">{s.emoji}</span>
                <span
                  className={`text-xs text-tax-text flex-1 ${
                    selected.includes(s.id) ? "font-semibold" : "font-normal"
                  }`}
                >
                  {s.label}
                </span>
                {selected.includes(s.id) && (
                  <span className="text-tax-accent text-[13px]">&#x2713;</span>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={onContinue}
        disabled={selected.length === 0}
        className={`w-full mt-1.5 py-3 border-none rounded-lg text-[13px] font-bold font-sans transition-colors ${
          selected.length > 0
            ? "bg-tax-accent text-white cursor-pointer"
            : "bg-tax-border text-tax-dim cursor-default"
        }`}
      >
        Build My Tax Guide &rarr;
      </button>
    </div>
  );
}
