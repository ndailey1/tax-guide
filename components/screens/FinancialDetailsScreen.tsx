"use client";

import { useState, useMemo } from "react";
import { INPUT_STEPS } from "@/lib/input-steps";
import { ENCOURAGEMENT, SCREEN_FLAVOR } from "@/lib/personality";
import type { FinancialProfile } from "@/lib/financial-profile";

interface FinancialDetailsScreenProps {
  situations: string[];
  profile: FinancialProfile;
  onUpdate: (key: string, value: number | null) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function FinancialDetailsScreen({
  situations,
  profile,
  onUpdate,
  onComplete,
  onBack: onBackToSituations,
}: FinancialDetailsScreenProps) {
  const steps = useMemo(
    () => INPUT_STEPS.filter((step) => step.showWhen(situations)),
    [situations]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [expandedHelp, setExpandedHelp] = useState(false);

  const step = steps[currentStep];
  if (!step) {
    // No applicable questions — go straight to analysis
    if (steps.length === 0) {
      return (
        <div className="max-w-[560px] mx-auto animate-screen text-center py-12">
          <div className="text-[48px] mb-3">&#x2705;</div>
          <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-2">
            No Financial Questions Needed
          </h2>
          <p className="text-[13px] text-tax-muted font-sans mb-6">
            Based on your selected situations, we don&apos;t need additional financial details.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onBackToSituations}
              className="flex-1 py-3.5 rounded-xl border border-tax-border bg-transparent text-tax-muted text-[14px] font-semibold font-sans cursor-pointer btn-press"
            >
              &larr; Change Situations
            </button>
            <button
              onClick={onComplete}
              className="flex-1 py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press"
            >
              See My Tax Analysis &rarr;
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setExpandedHelp(false);
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setExpandedHelp(false);
      setCurrentStep((prev) => prev - 1);
    } else {
      onBackToSituations();
    }
  };

  const handleSkip = () => {
    step.fields.forEach((f) => onUpdate(f.key, null));
    handleNext();
  };

  const parseInput = (raw: string): number | null => {
    const cleaned = raw.replace(/[,$\s]/g, "");
    if (cleaned === "" || cleaned === "-") return null;
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  };

  const formatDisplay = (key: string, type?: string): string => {
    const val = profile[key as keyof FinancialProfile];
    if (val === null || val === undefined) return "";
    if (type === "number") return String(val);
    return val.toLocaleString();
  };

  return (
    <div className="max-w-[560px] mx-auto animate-screen" key={step.id}>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-[5px] bg-tax-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #4C9AFF, #36B37E)",
            }}
          />
        </div>
        <span className="font-mono text-[11px] text-tax-muted">
          {currentStep + 1}/{steps.length}
        </span>
      </div>

      {/* Encouragement message */}
      {currentStep > 0 && (
        <p className="text-[11px] text-tax-dim font-sans italic text-center mb-4 animate-screen">
          {ENCOURAGEMENT[currentStep % ENCOURAGEMENT.length]}
        </p>
      )}
      {currentStep === 0 && (
        <p className="text-[12px] text-tax-muted font-sans text-center mb-4 animate-screen">
          {SCREEN_FLAVOR.financial.intro}
        </p>
      )}

      {/* Back button */}
      <button
        onClick={handleBack}
        className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-4"
      >
        &larr; Back
      </button>

      {/* Question */}
      <div className="mb-6">
        <div className="text-[32px] mb-2">{step.emoji}</div>
        <h2 className="text-xl font-extrabold text-tax-text font-serif mb-2">
          {step.question}
        </h2>
        <p className="text-sm text-tax-muted font-sans leading-relaxed">
          {step.subtext}
        </p>
      </div>

      {/* Input fields */}
      <div className="flex flex-col gap-3 mb-4">
        {step.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs text-tax-muted font-sans mb-1.5 font-medium">
              {field.label}
            </label>
            <div className="relative">
              {field.type !== "number" && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tax-muted text-sm">
                  $
                </span>
              )}
              <input
                type="text"
                inputMode="numeric"
                placeholder={field.placeholder}
                value={formatDisplay(field.key, field.type)}
                onChange={(e) => {
                  onUpdate(field.key, parseInput(e.target.value));
                }}
                className={`w-full py-3 rounded-lg border border-tax-border bg-tax-surface text-tax-text text-lg font-mono outline-none focus:border-tax-accent transition-colors ${
                  field.type !== "number" ? "pl-8 pr-4" : "px-4"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Help section */}
      <div className="mb-6">
        {/* Quick answer - always visible */}
        <div className="bg-tax-accent-dim border border-tax-accent/20 rounded-lg px-3.5 py-2.5 mb-2">
          <span className="text-[11px] font-bold text-tax-accent font-mono">QUICK ANSWER: </span>
          <span className="text-[12px] text-tax-text font-sans">{step.help.quickAnswer}</span>
        </div>

        {/* Expandable detailed help */}
        <button
          onClick={() => setExpandedHelp(!expandedHelp)}
          className="flex items-center gap-2 bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 font-semibold"
        >
          <span
            className="transition-transform duration-200"
            style={{ display: "inline-block", transform: expandedHelp ? "rotate(90deg)" : "rotate(0)" }}
          >
            &#x25B6;
          </span>
          {expandedHelp ? "Hide details" : "Still confused? Learn more"}
        </button>

        {expandedHelp && (
          <div className="mt-3 bg-tax-surface border border-tax-border rounded-[10px] overflow-hidden">
            <div className="p-4 border-b border-tax-border">
              <div className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-1.5 font-mono">
                What is this?
              </div>
              <p className="text-[13px] text-tax-text leading-relaxed font-sans">
                {step.help.what}
              </p>
            </div>
            <div className="p-4 border-b border-tax-border">
              <div className="text-[10px] font-bold text-tax-green uppercase tracking-wider mb-1.5 font-mono">
                Where to find it
              </div>
              <p className="text-[13px] text-tax-text leading-relaxed font-sans">
                {step.help.where}
              </p>
            </div>
            <div className="p-4 border-b border-tax-border">
              <div className="text-[10px] font-bold text-tax-orange uppercase tracking-wider mb-1.5 font-mono">
                How to get the document
              </div>
              <p className="text-[13px] text-tax-text leading-relaxed font-sans">
                {step.help.howToGet}
              </p>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-bold text-tax-muted uppercase tracking-wider mb-1.5 font-mono">
                Don&apos;t have it yet?
              </div>
              <p className="text-[13px] text-tax-text leading-relaxed font-sans">
                {step.help.dontHave}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-4 rounded-xl border border-tax-border bg-transparent text-tax-muted text-[14px] font-semibold font-sans cursor-pointer hover:border-tax-border-light transition-colors btn-press"
        >
          I&apos;m not sure yet
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-4 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow"
        >
          {isLast ? "See My Tax Analysis \u2192" : "Next \u2192"}
        </button>
      </div>
    </div>
  );
}
