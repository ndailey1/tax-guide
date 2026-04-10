"use client";

import { useMemo, useState } from "react";
import type { FinancialProfile } from "@/lib/financial-profile";
import { calculateTax } from "@/lib/financial-profile";
import { findSavings, type SavingsOpportunity } from "@/lib/savings-finder";
import { buildStrategies, type TaxStrategy } from "@/lib/tax-strategies";
import { fmtD } from "@/lib/tax-data";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface SavingsScreenProps {
  profile: FinancialProfile;
  filingStatus: string;
  situations: string[];
  onContinue: () => void;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  retirement: { bg: "bg-tax-accent-dim", border: "border-tax-accent/20", text: "text-tax-accent" },
  healthcare: { bg: "bg-tax-green-dim", border: "border-tax-green/30", text: "text-tax-green" },
  filing: { bg: "bg-tax-orange-dim", border: "border-tax-orange/20", text: "text-tax-orange" },
  credits: { bg: "bg-tax-green-dim", border: "border-tax-green/30", text: "text-tax-green" },
  deductions: { bg: "bg-tax-accent-dim", border: "border-tax-accent/20", text: "text-tax-accent" },
  paycheck: { bg: "bg-tax-orange-dim", border: "border-tax-orange/20", text: "text-tax-orange" },
};

const CATEGORY_LABELS: Record<string, string> = {
  retirement: "Retirement",
  healthcare: "Healthcare",
  filing: "Filing",
  credits: "Tax Credit",
  deductions: "Deduction",
  paycheck: "Cash Flow",
};

function OpportunityCard({
  opportunity,
  isExpanded,
  onToggle,
  index,
}: {
  opportunity: SavingsOpportunity;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const colors = CATEGORY_COLORS[opportunity.category] || CATEGORY_COLORS.deductions;
  const isEstimate = opportunity.confidence === "estimate";
  const isPaycheck = opportunity.category === "paycheck";

  return (
    <div className={`mb-3 animate-card delay-${Math.min(index, 12)}`}>
      {/* Header */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 p-4 rounded-xl border border-tax-border bg-tax-surface cursor-pointer btn-press hover:border-tax-border-light transition-all"
      >
        <span className="text-[24px] flex-shrink-0">{opportunity.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[14px] font-bold text-tax-text font-sans truncate">
              {opportunity.title}
            </h3>
          </div>
          <p className="text-[12px] text-tax-muted font-sans leading-snug line-clamp-2">
            {opportunity.whatIf}
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 ml-2">
          <span className="text-[16px] font-extrabold text-tax-green font-mono">
            {isPaycheck ? `+${fmtD(opportunity.monthlyImpact)}/mo` : `${fmtD(opportunity.annualSavings)}`}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {CATEGORY_LABELS[opportunity.category]}
            </span>
          </div>
        </div>
        <span
          className={`text-tax-muted text-sm transition-transform duration-200 ml-1 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          &#x25B6;
        </span>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="ml-4 mr-1 mt-2 animate-screen">
          {/* Description */}
          <div className="bg-tax-surface-alt border border-tax-border rounded-xl p-4 mb-3">
            <p className="text-[13px] text-tax-text font-sans leading-relaxed">
              {opportunity.description}
            </p>

            {/* What-if callout */}
            <div className={`mt-3 px-3.5 py-2.5 rounded-lg ${colors.bg} border ${colors.border}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">&#x1F4A1;</span>
                <span className={`text-[13px] font-bold font-sans ${colors.text}`}>
                  {opportunity.whatIf}
                </span>
              </div>
              {opportunity.monthlyImpact > 0 && !isPaycheck && (
                <p className="text-[12px] text-tax-muted font-sans mt-1 ml-7">
                  That&apos;s about {fmtD(opportunity.monthlyImpact)}/month
                </p>
              )}
            </div>

            {/* Confidence badge */}
            {isEstimate && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] text-tax-muted font-mono bg-tax-border/30 px-2 py-0.5 rounded">
                  &#x2139;&#xFE0F; ESTIMATE &mdash; actual amount depends on details not entered
                </span>
              </div>
            )}
          </div>

          {/* Steps */}
          {opportunity.steps && opportunity.steps.length > 0 && (
            <div className="bg-tax-surface border border-tax-border rounded-xl p-4 mb-3">
              <div className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-2.5 font-mono">
                How to do this
              </div>
              <div className="flex flex-col gap-2.5">
                {opportunity.steps.map((step, j) => (
                  <div key={j} className="flex gap-2.5 items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] border-tax-border flex items-center justify-center mt-0.5">
                      <span className="text-[9px] text-tax-muted font-mono">{j + 1}</span>
                    </div>
                    <p className="text-[13px] text-tax-text font-sans leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caveat */}
          {opportunity.caveat && (
            <div className="bg-tax-orange-dim border border-tax-orange/20 rounded-lg px-3.5 py-2.5 mb-3">
              <p className="text-[12px] text-tax-text font-sans leading-relaxed">
                <strong className="text-tax-orange">&#x26A0;&#xFE0F; Note:</strong> {opportunity.caveat}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StrategyCard({
  strategy,
  isExpanded,
  onToggle,
  index,
}: {
  strategy: TaxStrategy;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className={`mb-3 animate-card delay-${Math.min(index, 12)}`}>
      {/* Header */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 p-4 rounded-xl border border-purple-500/20 bg-tax-surface cursor-pointer btn-press hover:border-purple-500/40 transition-all"
      >
        <span className="text-[24px] flex-shrink-0">{strategy.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-tax-text font-sans">
            {strategy.title}
          </h3>
          <p className="text-[12px] text-tax-muted font-sans leading-snug mt-0.5 line-clamp-2">
            {strategy.tagline}
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 ml-2">
          <span className="text-[9px] font-bold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
            Pro Strategy
          </span>
        </div>
        <span
          className={`text-tax-muted text-sm transition-transform duration-200 ml-1 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          &#x25B6;
        </span>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="ml-4 mr-1 mt-2 animate-screen">
          {/* How it works */}
          <div className="bg-tax-surface-alt border border-tax-border rounded-xl p-4 mb-3">
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2 font-mono">
              How it works
            </div>
            <p className="text-[13px] text-tax-text font-sans leading-relaxed">
              {strategy.howItWorks}
            </p>

            {/* Example callout */}
            <div className="mt-3 px-3.5 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1 font-mono">
                Example with your numbers
              </div>
              <p className="text-[13px] text-tax-text font-sans leading-relaxed">
                {strategy.example}
              </p>
            </div>

            {/* Savings range */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-bold text-tax-green font-mono bg-tax-green-dim px-2 py-1 rounded">
                Potential savings: {strategy.savingsRange}
              </span>
            </div>
          </div>

          {/* Who qualifies */}
          <div className="bg-tax-accent-dim border border-tax-accent/20 rounded-lg px-3.5 py-2.5 mb-3">
            <div className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-1 font-mono">
              Who qualifies
            </div>
            <p className="text-[12px] text-tax-text font-sans leading-relaxed">
              {strategy.whoQualifies}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-tax-surface border border-tax-border rounded-xl p-4 mb-3">
            <div className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-2.5 font-mono">
              How to do this
            </div>
            <div className="flex flex-col gap-2.5">
              {strategy.steps.map((step, j) => (
                <div key={j} className="flex gap-2.5 items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] border-tax-border flex items-center justify-center mt-0.5">
                    <span className="text-[9px] text-tax-muted font-mono">{j + 1}</span>
                  </div>
                  <p className="text-[13px] text-tax-text font-sans leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tip */}
          {strategy.proTip && (
            <div className="bg-tax-green-dim border border-tax-green/20 rounded-lg px-3.5 py-2.5 mb-3">
              <p className="text-[12px] text-tax-text font-sans leading-relaxed">
                <strong className="text-tax-green">&#x1F4A1; Pro tip:</strong> {strategy.proTip}
              </p>
            </div>
          )}

          {/* Warning */}
          {strategy.warning && (
            <div className="bg-tax-orange-dim border border-tax-orange/20 rounded-lg px-3.5 py-2.5 mb-3">
              <p className="text-[12px] text-tax-text font-sans leading-relaxed">
                <strong className="text-tax-orange">&#x26A0;&#xFE0F; Watch out:</strong> {strategy.warning}
              </p>
            </div>
          )}

          {/* IRS source */}
          <div className="text-[10px] text-tax-dim font-mono italic mb-2">
            {strategy.irsRule}
          </div>
        </div>
      )}
    </div>
  );
}

export function SavingsScreen({
  profile,
  filingStatus,
  situations,
  onContinue,
  onBack,
}: SavingsScreenProps) {
  const calc = useMemo(
    () => calculateTax(profile, filingStatus),
    [profile, filingStatus]
  );

  const result = useMemo(
    () => findSavings(profile, filingStatus, situations, calc),
    [profile, filingStatus, situations, calc]
  );

  const strategies = useMemo(
    () => buildStrategies(profile, filingStatus, situations, calc),
    [profile, filingStatus, situations, calc]
  );

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(result.opportunities.length > 0 ? [result.opportunities[0].id] : [])
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exactSavings = result.opportunities.filter(
    (o) => o.confidence === "exact" && o.category !== "paycheck" && o.annualSavings > 0
  );
  const estimateSavings = result.opportunities.filter(
    (o) => o.confidence === "estimate" && o.annualSavings > 0
  );
  const paycheckOps = result.opportunities.filter(
    (o) => o.category === "paycheck"
  );
  const penaltyOps = result.opportunities.filter(
    (o) => o.annualSavings === 0
  );

  const hasOpportunities = result.opportunities.length > 0;

  return (
    <div className="max-w-[640px] mx-auto animate-screen-up">
      <button
        onClick={onBack}
        className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
      >
        &larr; Back to Tax Estimate
      </button>

      {/* Hero */}
      <div className="text-center mb-6">
        <div className="text-[48px] mb-2 animate-emoji">
          {hasOpportunities ? "\uD83D\uDD0D" : "\u2705"}
        </div>
        <h1 className="text-[26px] font-extrabold text-tax-text font-serif mb-2">
          {hasOpportunities ? "Money You Might Be Missing" : "You're Already Optimized"}
        </h1>

        {hasOpportunities && result.totalPotentialSavings > 0 ? (
          <>
            <p className="text-[13px] text-tax-muted font-sans mb-3">
              Based on your numbers, we found potential savings of:
            </p>
            <div className="animate-number">
              <AnimatedNumber
                value={result.totalPotentialSavings}
                prefix="up to $"
                className="text-[38px] font-extrabold font-mono text-tax-green"
                duration={1200}
              />
            </div>
            <p className="text-[12px] text-tax-dim font-sans italic mt-2">
              These are things TurboTax won&apos;t tell you. We just did.
            </p>
          </>
        ) : !hasOpportunities ? (
          <p className="text-[14px] text-tax-muted font-sans max-w-[460px] mx-auto">
            We analyzed your situation and didn&apos;t find obvious savings you&apos;re missing.
            You&apos;re in good shape!
          </p>
        ) : null}
      </div>

      {/* Tax savings section */}
      {exactSavings.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold text-tax-green uppercase tracking-wider mb-2 font-mono">
            &#x1F4B0; Calculated savings based on your numbers
          </h2>
          {exactSavings.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isExpanded={expanded.has(opp.id)}
              onToggle={() => toggleExpand(opp.id)}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Credits you may qualify for */}
      {estimateSavings.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold text-tax-accent uppercase tracking-wider mb-2 font-mono">
            &#x1F381; Credits &amp; savings you may qualify for
          </h2>
          {estimateSavings.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isExpanded={expanded.has(opp.id)}
              onToggle={() => toggleExpand(opp.id)}
              index={exactSavings.length + i}
            />
          ))}
        </div>
      )}

      {/* Cash flow optimization */}
      {paycheckOps.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold text-tax-orange uppercase tracking-wider mb-2 font-mono">
            &#x1F4B5; Get more money in your paycheck
          </h2>
          {paycheckOps.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isExpanded={expanded.has(opp.id)}
              onToggle={() => toggleExpand(opp.id)}
              index={exactSavings.length + estimateSavings.length + i}
            />
          ))}
        </div>
      )}

      {/* Penalty avoidance */}
      {penaltyOps.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold text-tax-muted uppercase tracking-wider mb-2 font-mono">
            &#x1F6E1;&#xFE0F; Avoid penalties
          </h2>
          {penaltyOps.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isExpanded={expanded.has(opp.id)}
              onToggle={() => toggleExpand(opp.id)}
              index={exactSavings.length + estimateSavings.length + paycheckOps.length + i}
            />
          ))}
        </div>
      )}

      {/* Pro Tax Strategies */}
      {strategies.length > 0 && (
        <div className="mb-5">
          <div className="border-t border-tax-border pt-6 mt-2 mb-4">
            <div className="text-center mb-4">
              <div className="text-[32px] mb-1">&#x1F9E0;</div>
              <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-1">
                Pro Tax Strategies
              </h2>
              <p className="text-[13px] text-tax-muted font-sans max-w-[480px] mx-auto">
                Aggressive but completely legal moves personalized to your situation.
                These are the strategies wealthy people use — now you know them too.
              </p>
            </div>
          </div>
          {strategies.map((strategy, i) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isExpanded={expanded.has(strategy.id)}
              onToggle={() => toggleExpand(strategy.id)}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-tax-surface border border-tax-border rounded-xl p-4 mb-4">
        <p className="text-[12px] text-tax-muted font-sans leading-relaxed">
          <strong className="text-tax-text">These are estimates, not guarantees.</strong> Exact
          savings depend on your complete financial picture, eligibility requirements, and
          income phase-outs not fully captured here. Consult a tax professional before making
          major financial decisions. All strategies listed are legal under current IRS rules.
        </p>
      </div>

      {/* Continue */}
      <button
        onClick={onContinue}
        className="w-full py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow"
      >
        Show Me Exactly What To Do &rarr;
      </button>
    </div>
  );
}
