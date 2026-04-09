"use client";

import { TAX_DATA } from "@/lib/tax-data";
import { FILING_STATUSES } from "@/lib/topics";
import { Card } from "@/components/ui/Card";

interface FilingStatusScreenProps {
  selected: string | null;
  onSelect: (status: string) => void;
  onContinue: () => void;
}

export function FilingStatusScreen({
  selected,
  onSelect,
  onContinue,
}: FilingStatusScreenProps) {
  return (
    <div className="max-w-[600px] mx-auto">
      <h2 className="text-xl font-extrabold text-tax-text font-serif mb-1">
        Filing Status
      </h2>
      <p className="text-tax-muted text-xs mb-3.5 font-sans">
        This determines brackets, deductions & credit eligibility as of Dec 31,{" "}
        {TAX_DATA.year}.
      </p>

      <div className="flex flex-col gap-[7px]">
        {FILING_STATUSES.map((s) => (
          <Card
            key={s.id}
            onClick={() => onSelect(s.id)}
            selected={selected === s.id}
          >
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-tax-text">{s.label}</div>
              <div className="text-[11px] text-tax-muted mt-0.5">{s.desc}</div>
            </div>
            {selected === s.id && (
              <span className="ml-auto text-tax-accent">&#x2713;</span>
            )}
          </Card>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={!selected}
        className={`w-full mt-3.5 py-3 border-none rounded-lg text-[13px] font-bold font-sans transition-colors ${
          selected
            ? "bg-tax-accent text-white cursor-pointer"
            : "bg-tax-border text-tax-dim cursor-default"
        }`}
      >
        Continue &rarr;
      </button>
    </div>
  );
}
