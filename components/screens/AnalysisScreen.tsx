"use client";

import { useMemo, useState, useEffect } from "react";
import type { FinancialProfile } from "@/lib/financial-profile";
import { calculateTax, type TaxCalculation } from "@/lib/financial-profile";
import { fmtD, pct } from "@/lib/tax-data";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Confetti } from "@/components/ui/Confetti";

interface AnalysisScreenProps {
  profile: FinancialProfile;
  filingStatus: string;
  onContinueToGuide: () => void;
}

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-tax-surface border border-tax-border rounded-[10px] p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{emoji}</span>
        <h3 className="text-sm font-bold text-tax-text font-sans">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  indent,
  bold,
  sub,
}: {
  label: string;
  value: string;
  highlight?: "accent" | "green" | "orange" | "red" | "muted";
  indent?: boolean;
  bold?: boolean;
  sub?: boolean;
}) {
  const colorClass = {
    accent: "text-tax-accent",
    green: "text-tax-green",
    orange: "text-tax-orange",
    red: "text-tax-red",
    muted: "text-tax-muted",
  }[highlight || "accent"];

  return (
    <div
      className={`flex justify-between items-baseline py-1.5 ${
        indent ? "pl-4" : ""
      } ${bold ? "border-t border-tax-border mt-1 pt-2" : ""}`}
    >
      <span
        className={`font-sans ${
          sub ? "text-[11px] text-tax-muted" : "text-[13px] text-tax-text"
        } ${bold ? "font-bold" : ""}`}
      >
        {label}
      </span>
      <span
        className={`font-mono text-[13px] ${bold ? "font-bold" : ""} ${colorClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function BracketBar({
  calc,
}: {
  calc: TaxCalculation;
}) {
  const total = calc.taxableOrdinaryIncome;
  if (total <= 0) return null;

  const colors = [
    "#36B37E", "#4C9AFF", "#9B6DFF", "#FFAB00", "#FF8B00", "#FF5630", "#FF0055",
  ];

  return (
    <div className="mt-2 mb-1">
      <div className="flex rounded-md overflow-hidden h-6 mb-2">
        {calc.bracketBreakdown.map((b, i) => {
          const widthPct = (b.income / total) * 100;
          if (widthPct < 0.5) return null;
          return (
            <div
              key={i}
              className="relative group cursor-default"
              style={{
                width: `${widthPct}%`,
                backgroundColor: colors[i % colors.length],
              }}
              title={`${pct(b.rate)}: ${fmtD(Math.round(b.income))} taxed = ${fmtD(Math.round(b.tax))}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {calc.bracketBreakdown.map((b, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-[10px] text-tax-muted font-mono">
              {pct(b.rate)}: {fmtD(Math.round(b.tax))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalysisScreen({
  profile,
  filingStatus,
  onContinueToGuide,
}: AnalysisScreenProps) {
  const calc = useMemo(
    () => calculateTax(profile, filingStatus),
    [profile, filingStatus]
  );

  const isRefund = calc.estimatedRefundOrOwed >= 0;
  const hasWithholding = calc.totalWithholding > 0;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (hasWithholding && isRefund && calc.estimatedRefundOrOwed > 0) {
      const timer = setTimeout(() => setShowConfetti(true), 800);
      return () => clearTimeout(timer);
    }
  }, [hasWithholding, isRefund, calc.estimatedRefundOrOwed]);

  return (
    <div className="max-w-[600px] mx-auto animate-screen-up">
      <Confetti active={showConfetti} />

      {/* Hero result */}
      <div className="text-center mb-6">
        <div className="text-[48px] mb-2 animate-emoji">
          {hasWithholding ? (isRefund ? "\uD83C\uDF89" : "\uD83D\uDCB8") : "\uD83D\uDCCA"}
        </div>
        <h1 className="text-[26px] font-extrabold text-tax-text font-serif mb-3">
          Your Tax Estimate
        </h1>
        {hasWithholding ? (
          <>
            <div className="animate-number">
              <AnimatedNumber
                value={Math.abs(Math.round(calc.estimatedRefundOrOwed))}
                prefix={isRefund ? "+" : "-"}
                className={`text-[42px] font-extrabold font-mono ${
                  isRefund ? "text-tax-green" : "text-tax-red"
                }`}
                duration={1500}
              />
            </div>
            <p className="text-sm text-tax-muted font-sans">
              {isRefund
                ? "Estimated refund \u2014 your employer sent more tax to the IRS than you actually owe, so you get the difference back"
                : "Estimated amount owed \u2014 your employer didn't send quite enough tax to the IRS, so you owe the difference"}
            </p>
          </>
        ) : (
          <>
            <div className="animate-number">
              <AnimatedNumber
                value={Math.round(calc.taxAfterCredits)}
                className="text-[42px] font-extrabold font-mono text-tax-accent"
                duration={1500}
              />
            </div>
            <p className="text-sm text-tax-muted font-sans">
              Estimated total federal tax
            </p>
          </>
        )}
      </div>

      {/* Effective rate callout */}
      <div className="bg-tax-accent-dim border border-tax-accent/20 rounded-[10px] p-4 mb-3 text-center animate-reveal" style={{ animationDelay: "0.3s" }}>
        <div className="text-[11px] font-bold text-tax-accent uppercase tracking-wider mb-1 font-mono">
          Your effective tax rate
        </div>
        <div className="text-2xl font-extrabold text-tax-accent font-mono">
          {(calc.effectiveRate * 100).toFixed(1)}%
        </div>
        <p className="text-xs text-tax-muted font-sans mt-1">
          You&apos;re in the {pct(calc.marginalRate)} marginal bracket, but you actually pay{" "}
          {(calc.effectiveRate * 100).toFixed(1)}% overall because of how brackets work
        </p>
      </div>

      {/* Income breakdown */}
      <Section title="Your Income" emoji="&#x1F4B0;">
        {calc.w2Wages > 0 && <Row label="W-2 wages" value={fmtD(Math.round(calc.w2Wages))} />}
        {calc.selfEmploymentNet > 0 && (
          <Row label="Self-employment (net)" value={fmtD(Math.round(calc.selfEmploymentNet))} />
        )}
        {calc.investmentIncome > 0 && (
          <Row label="Investment income" value={fmtD(Math.round(calc.investmentIncome))} />
        )}
        {calc.otherIncome > 0 && (
          <Row label="Other income" value={fmtD(Math.round(calc.otherIncome))} />
        )}
        <Row
          label="Gross income"
          value={fmtD(Math.round(calc.grossIncome))}
          bold
          highlight="accent"
        />
      </Section>

      {/* Adjustments */}
      {calc.totalAdjustments > 0 && (
        <Section title="Extra Reductions You Automatically Get" emoji="&#x2B06;">
          <p className="text-xs text-tax-muted font-sans mb-2">
            These reduce your income before anything else. You get these automatically \u2014 no special filing needed.
          </p>
          {calc.halfSETax > 0 && (
            <Row label="Half of self-employment tax" value={`-${fmtD(Math.round(calc.halfSETax))}`} indent highlight="green" />
          )}
          {calc.studentLoanDeduction > 0 && (
            <Row label="Student loan interest" value={`-${fmtD(Math.round(calc.studentLoanDeduction))}`} indent highlight="green" />
          )}
          {calc.hsaDeduction > 0 && (
            <Row label="HSA contributions" value={`-${fmtD(Math.round(calc.hsaDeduction))}`} indent highlight="green" />
          )}
          {calc.iraDeduction > 0 && (
            <Row label="IRA contributions" value={`-${fmtD(Math.round(calc.iraDeduction))}`} indent highlight="green" />
          )}
          <Row
            label="Your income after reductions"
            value={fmtD(Math.round(calc.agi))}
            bold
            highlight="accent"
          />
        </Section>
      )}

      {/* Deductions */}
      <Section title="Your Tax-Free Amount" emoji="&#x2702;&#xFE0F;">
        <div className="bg-tax-surface-alt border border-tax-border rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-tax-text font-sans">Standard deduction</span>
            <span
              className={`font-mono text-sm font-bold ${
                !calc.useItemized ? "text-tax-green" : "text-tax-muted"
              }`}
            >
              {fmtD(calc.standardDeduction)}
              {!calc.useItemized && " \u2713"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-tax-text font-sans">Your itemized deductions</span>
            <span
              className={`font-mono text-sm font-bold ${
                calc.useItemized ? "text-tax-green" : "text-tax-muted"
              }`}
            >
              {fmtD(Math.round(calc.itemizedTotal))}
              {calc.useItemized && " \u2713"}
            </span>
          </div>
        </div>
        <div className="bg-tax-accent-dim border border-tax-accent/20 rounded-lg p-3">
          <p className="text-[13px] text-tax-text font-sans">
            {calc.useItemized
              ? `Itemizing saves you ${fmtD(Math.round(calc.itemizedTotal - calc.standardDeduction))} more than the standard deduction.`
              : calc.itemizedTotal > 0
                ? `The standard deduction saves you ${fmtD(Math.round(calc.standardDeduction - calc.itemizedTotal))} more than itemizing. Take the standard deduction.`
                : "The standard deduction is the best choice for you."}
          </p>
        </div>
        <Row
          label="Taxable income"
          value={fmtD(Math.round(calc.taxableOrdinaryIncome))}
          bold
          highlight="accent"
        />
      </Section>

      {/* Tax calculation */}
      <Section title="How Your Tax Is Calculated" emoji="&#x1F4CA;">
        <p className="text-xs text-tax-muted font-sans mb-2">
          Your income is taxed in layers, not all at one rate. The first chunk is taxed at 10%, the next chunk at 12%, and so on. Only the money in each range gets that rate.
        </p>
        <BracketBar calc={calc} />
        {calc.bracketBreakdown.map((b, i) => (
          <Row
            key={i}
            label={`${pct(b.rate)} on ${fmtD(Math.round(b.income))}`}
            value={fmtD(Math.round(b.tax))}
            indent
            sub
          />
        ))}
        <Row label="Income tax" value={fmtD(Math.round(calc.ordinaryTax))} bold />
        {calc.ltcgTax > 0 && (
          <Row label="Capital gains tax" value={`+${fmtD(Math.round(calc.ltcgTax))}`} highlight="orange" />
        )}
        {calc.selfEmploymentTax > 0 && (
          <Row label="Self-employment tax" value={`+${fmtD(Math.round(calc.selfEmploymentTax))}`} highlight="orange" />
        )}
        <Row label="Total tax before credits" value={fmtD(Math.round(calc.totalTax))} bold />
      </Section>

      {/* Credits */}
      {calc.totalCredits > 0 && (
        <Section title="Tax Credits" emoji="&#x1F381;">
          <p className="text-xs text-tax-muted font-sans mb-2">
            Credits directly reduce your tax bill dollar-for-dollar.
          </p>
          {calc.childTaxCredit > 0 && (
            <Row label="Child Tax Credit" value={`-${fmtD(calc.childTaxCredit)}`} highlight="green" />
          )}
          {calc.otherDependentCredit > 0 && (
            <Row label="Other Dependent Credit" value={`-${fmtD(calc.otherDependentCredit)}`} highlight="green" />
          )}
          <Row
            label="Tax after credits"
            value={fmtD(Math.round(calc.taxAfterCredits))}
            bold
            highlight="accent"
          />
        </Section>
      )}

      {/* Final result */}
      {hasWithholding && (
        <Section title="Refund or Amount Owed" emoji={isRefund ? "\u2705" : "\u26A0\uFE0F"}>
          <Row label="Total tax owed" value={fmtD(Math.round(calc.taxAfterCredits))} />
          <Row label="Already paid (withholding)" value={`-${fmtD(Math.round(calc.totalWithholding))}`} highlight="green" />
          <Row
            label={isRefund ? "Estimated refund" : "Estimated amount owed"}
            value={`${isRefund ? "+" : ""}${fmtD(Math.round(Math.abs(calc.estimatedRefundOrOwed)))}`}
            bold
            highlight={isRefund ? "green" : "red"}
          />
        </Section>
      )}

      {/* Disclaimer */}
      <div className="bg-tax-orange-dim border border-tax-orange/20 rounded-[10px] p-4 mb-4">
        <p className="text-xs text-tax-text font-sans leading-relaxed">
          <strong className="text-tax-orange">This is an estimate.</strong> Actual amounts
          may differ based on state taxes, additional credits, phaseouts, and other factors.
          This guide is for educational purposes \u2014 consult a tax professional for filing decisions.
        </p>
      </div>

      {/* Continue */}
      <button
        onClick={onContinueToGuide}
        className="w-full py-3.5 rounded-lg border-none bg-tax-accent text-white text-sm font-bold font-sans cursor-pointer"
      >
        Show Me Exactly What To Do &rarr;
      </button>
    </div>
  );
}
