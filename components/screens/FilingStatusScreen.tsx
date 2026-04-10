"use client";

import { TAX_DATA } from "@/lib/tax-data";
import { FILING_STATUSES } from "@/lib/topics";
import { Card } from "@/components/ui/Card";

interface FilingStatusScreenProps {
  selected: string | null;
  onSelect: (status: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function FilingStatusScreen({
  selected,
  onSelect,
  onContinue,
  onBack,
}: FilingStatusScreenProps) {
  return (
    <div className="max-w-[600px] mx-auto animate-screen">
      <button
        onClick={onBack}
        className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
      >
        &larr; Back
      </button>
      <h2 className="text-[22px] font-extrabold text-tax-text font-serif mb-1">
        Filing Status
      </h2>
      <p className="text-tax-muted text-[13px] mb-1 font-sans">
        This determines brackets, deductions & credit eligibility as of Dec 31,{" "}
        {TAX_DATA.year}.
      </p>
      <p className="text-tax-dim text-[11px] mb-4 font-sans italic">
        The IRS cares a lot about your relationship status. More than your ex does, honestly.
      </p>

      <div className="flex flex-col gap-2">
        {FILING_STATUSES.map((s, i) => (
          <div key={s.id} className={`animate-card delay-${i}`}>
            <Card
              onClick={() => onSelect(s.id)}
              selected={selected === s.id}
              className="btn-press !py-4"
            >
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-tax-text">{s.label}</div>
                <div className="text-[12px] text-tax-muted mt-0.5">{s.desc}</div>
              </div>
              {selected === s.id && (
                <span className="ml-auto text-tax-accent text-lg">&#x2713;</span>
              )}
            </Card>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={!selected}
        className={`w-full mt-4 py-3.5 border-none rounded-xl text-[14px] font-bold font-sans transition-all btn-press ${
          selected
            ? "bg-tax-accent text-white cursor-pointer animate-glow"
            : "bg-tax-border text-tax-dim cursor-default"
        }`}
      >
        Continue &rarr;
      </button>
    </div>
  );
}
