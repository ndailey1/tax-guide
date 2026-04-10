"use client";

import { useState, useMemo } from "react";
import {
  getTermsForLevel,
  getQuestionsForLevel,
  type GlossaryTerm,
  type ComprehensionQuestion,
} from "@/lib/tax-glossary";
import { TAX_DATA } from "@/lib/tax-data";

interface TaxBasicsScreenProps {
  level: string;
  onContinue: (unknownTerms: string[]) => void;
  onBack: () => void;
}

type Phase = "intro" | "terms" | "learn" | "questions" | "done";

function TermCard({
  term,
  isSelected,
  onToggle,
  index,
}: {
  term: GlossaryTerm;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className={`animate-card delay-${Math.min(index, 12)}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all btn-press ${
          isSelected
            ? "border-tax-accent bg-tax-accent-dim"
            : "border-tax-border bg-tax-surface hover:border-tax-border-light"
        }`}
      >
        <span className="text-[20px] flex-shrink-0">{term.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-semibold font-sans ${isSelected ? "text-tax-accent" : "text-tax-text"}`}>
            {term.term}
          </div>
          <div className="text-[11px] text-tax-muted font-sans">{term.short}</div>
        </div>
        {isSelected ? (
          <span className="text-tax-accent text-xs font-bold flex-shrink-0">&#x2753;</span>
        ) : (
          <span className="text-tax-green text-xs font-bold flex-shrink-0">&#x2713;</span>
        )}
      </button>
    </div>
  );
}

function TermExplanation({
  term,
  index,
}: {
  term: GlossaryTerm;
  index: number;
}) {
  return (
    <div className={`mb-4 animate-card delay-${Math.min(index, 12)}`}>
      <div className="bg-tax-surface border border-tax-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
          <span className="text-[24px]">{term.emoji}</span>
          <h3 className="text-[16px] font-extrabold text-tax-text font-sans">
            {term.term}
          </h3>
        </div>
        <div className="px-4 pb-3">
          <p className="text-[13px] text-tax-text font-sans leading-relaxed">
            {term.explanation}
          </p>
        </div>
        <div className="px-4 pb-4">
          <div className="bg-tax-accent-dim border border-tax-accent/20 rounded-lg px-3.5 py-2.5">
            <div className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-1 font-mono">
              Example
            </div>
            <p className="text-[13px] text-tax-text font-sans leading-relaxed">
              {term.example}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  answer,
  onAnswer,
  index,
}: {
  question: ComprehensionQuestion;
  answer: boolean | null;
  onAnswer: (knew: boolean) => void;
  index: number;
}) {
  return (
    <div className={`mb-4 animate-card delay-${Math.min(index, 12)}`}>
      <div className="bg-tax-surface border border-tax-border rounded-xl p-4">
        <p className="text-[14px] font-semibold text-tax-text font-sans mb-3">
          {question.question}
        </p>

        {answer === null ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onAnswer(true)}
              className="w-full py-3 rounded-lg border border-tax-green/30 bg-tax-green-dim text-tax-green text-[13px] font-semibold font-sans cursor-pointer btn-press hover:bg-tax-green/20 transition-colors text-left px-4"
            >
              &#x1F44D; {question.yesText}
            </button>
            <button
              onClick={() => onAnswer(false)}
              className="w-full py-3 rounded-lg border border-tax-accent/30 bg-tax-accent-dim text-tax-accent text-[13px] font-semibold font-sans cursor-pointer btn-press hover:bg-tax-accent/20 transition-colors text-left px-4"
            >
              &#x1F937; {question.noText}
            </button>
          </div>
        ) : answer ? (
          <div className="bg-tax-green-dim border border-tax-green/20 rounded-lg px-3.5 py-2.5">
            <p className="text-[12px] text-tax-green font-sans font-semibold">
              &#x2713; Nice, you already know this!
            </p>
          </div>
        ) : (
          <div className="bg-tax-accent-dim border border-tax-accent/20 rounded-lg px-3.5 py-3">
            <p className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-1.5 font-mono">
              Here&apos;s how it works
            </p>
            <p className="text-[13px] text-tax-text font-sans leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function TaxBasicsScreen({
  level,
  onContinue,
  onBack,
}: TaxBasicsScreenProps) {
  const terms = useMemo(() => getTermsForLevel(level), [level]);
  const questions = useMemo(() => getQuestionsForLevel(level), [level]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [unknownTerms, setUnknownTerms] = useState<Set<string>>(new Set());
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, boolean>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const toggleTerm = (id: string) => {
    setUnknownTerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const termsToLearn = terms.filter((t) => unknownTerms.has(t.id));

  const handleAnswerQuestion = (knew: boolean) => {
    const q = questions[currentQuestion];
    setQuestionAnswers((prev) => ({ ...prev, [q.id]: knew }));
  };

  const canAdvanceQuestion =
    currentQuestion < questions.length &&
    questionAnswers[questions[currentQuestion]?.id] !== undefined;

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setPhase("done");
    }
  };

  const questionsAnswered = Object.keys(questionAnswers).length;
  const questionsKnew = Object.values(questionAnswers).filter(Boolean).length;

  const isBeginner = level === "beginner";

  return (
    <div className="max-w-[600px] mx-auto animate-screen">
      <button
        onClick={onBack}
        className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
      >
        &larr; Back
      </button>

      {/* ========== PHASE: INTRO ========== */}
      {phase === "intro" && (
        <div className="animate-screen">
          <div className="text-center mb-6">
            <div className="text-[48px] mb-2 animate-emoji">&#x1F4DA;</div>
            <h1 className="text-[26px] font-extrabold text-tax-text font-serif mb-2">
              {isBeginner ? "Let\u2019s Start With the Basics" : "Quick Refresher"}
            </h1>
            <p className="text-[13px] text-tax-muted font-sans max-w-[460px] mx-auto leading-relaxed">
              {isBeginner
                ? "Before we dive in, let\u2019s make sure we\u2019re on the same page. No judgment \u2014 everyone has to learn this stuff for the first time."
                : "Let\u2019s make sure we\u2019re speaking the same language before we look at your numbers."}
            </p>
          </div>

          {/* Why we pay taxes */}
          <div className="bg-tax-surface border border-tax-border rounded-xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">&#x1F3DB;&#xFE0F;</span>
              <h2 className="text-[15px] font-extrabold text-tax-text font-sans">
                Why Do We Even Pay Taxes?
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[13px] text-tax-text font-sans leading-relaxed">
                Every year, if you earn money, you owe a portion of it to the federal government (and usually your state too). This money pays for everything we all share: roads, schools, the military, Social Security, Medicare, fire departments, national parks, and thousands of other services.
              </p>
              <p className="text-[13px] text-tax-text font-sans leading-relaxed">
                Here&apos;s the basic process:
              </p>
              <div className="flex flex-col gap-2 ml-1">
                {[
                  { num: "1", text: "You earn money throughout the year (from a job, freelancing, etc.)" },
                  { num: "2", text: "If you have a regular job, your employer automatically sends some of your pay to the IRS every paycheck \u2014 this is called \"withholding\"" },
                  { num: "3", text: `By April 15, ${TAX_DATA.filingYear}, you file a \"tax return\" \u2014 a report that tells the IRS exactly how much you earned and calculates what you actually owe` },
                  { num: "4", text: "The IRS compares what you owe vs. what was already paid. If too much was paid \u2192 you get money back (refund). If not enough \u2192 you pay the difference" },
                ].map((step) => (
                  <div key={step.num} className="flex gap-2.5 items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-tax-accent flex items-center justify-center mt-0.5">
                      <span className="text-[10px] font-bold text-white font-mono">{step.num}</span>
                    </div>
                    <p className="text-[13px] text-tax-text font-sans leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
              <div className="bg-tax-green-dim border border-tax-green/20 rounded-lg px-3.5 py-2.5 mt-1">
                <p className="text-[12px] text-tax-text font-sans leading-relaxed">
                  <strong className="text-tax-green">The good news:</strong> You don&apos;t need to know tax law. Software asks you simple questions, you type in numbers from your W-2, and it does all the math. We&apos;re going to walk you through every step.
                </p>
              </div>
            </div>
          </div>

          {/* First-time filer tips */}
          {isBeginner && (
            <div className="bg-tax-orange-dim border border-tax-orange/20 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">&#x1F4A1;</span>
                <h3 className="text-[13px] font-bold text-tax-orange font-sans">First Time Filing?</h3>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-tax-text font-sans leading-relaxed">
                  <strong>You can file for FREE.</strong> Don&apos;t pay for TurboTax. Use IRS Free File or Cash App Taxes \u2014 they&apos;re just as good and cost $0.
                </p>
                <p className="text-[12px] text-tax-text font-sans leading-relaxed">
                  <strong>If your parents support you,</strong> talk to them before filing. They may claim you as a dependent, which affects both your taxes and theirs.
                </p>
                <p className="text-[12px] text-tax-text font-sans leading-relaxed">
                  <strong>Even if you earned very little,</strong> file anyway. If your employer withheld taxes from your paychecks, you probably get that money back.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setPhase("terms")}
            className="w-full py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow"
          >
            Got It \u2014 Let&apos;s Learn the Terms &rarr;
          </button>
        </div>
      )}

      {/* ========== PHASE: TERM SELECTION ========== */}
      {phase === "terms" && (
        <div className="animate-screen">
          <div className="text-center mb-5">
            <div className="text-[32px] mb-1">&#x1F4AC;</div>
            <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-2">
              Which of These Terms Are New to You?
            </h2>
            <p className="text-[13px] text-tax-muted font-sans max-w-[440px] mx-auto">
              Tap any term you don&apos;t fully understand. We&apos;ll break each one down before moving on. No shame \u2014 tax jargon is deliberately confusing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {terms.map((term, i) => (
              <TermCard
                key={term.id}
                term={term}
                isSelected={unknownTerms.has(term.id)}
                onToggle={() => toggleTerm(term.id)}
                index={i}
              />
            ))}
          </div>

          <div className="text-center mb-3">
            <p className="text-[11px] text-tax-dim font-sans italic">
              {unknownTerms.size === 0
                ? "Know them all? Impressive. Hit continue."
                : `${unknownTerms.size} term${unknownTerms.size === 1 ? "" : "s"} selected \u2014 we\u2019ll explain ${unknownTerms.size === 1 ? "it" : "each one"}`}
            </p>
          </div>

          <button
            onClick={() => {
              if (unknownTerms.size > 0) {
                setPhase("learn");
              } else {
                setPhase("questions");
              }
            }}
            className="w-full py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow"
          >
            {unknownTerms.size > 0 ? `Explain These ${unknownTerms.size} Terms` : "I Know These \u2014 Continue"} &rarr;
          </button>
        </div>
      )}

      {/* ========== PHASE: LEARN TERMS ========== */}
      {phase === "learn" && (
        <div className="animate-screen">
          <div className="text-center mb-5">
            <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-1">
              Here&apos;s What These Mean
            </h2>
            <p className="text-[13px] text-tax-muted font-sans">
              Plain English. No jargon. Real examples.
            </p>
          </div>

          {termsToLearn.map((term, i) => (
            <TermExplanation key={term.id} term={term} index={i} />
          ))}

          <div className="bg-tax-green-dim border border-tax-green/20 rounded-xl p-4 mb-4">
            <p className="text-[13px] text-tax-text font-sans leading-relaxed">
              <strong className="text-tax-green">&#x2713; Nice!</strong> You now know the key tax terms.
              We&apos;ll use these throughout the app, and you can always come back here if you forget.
              {termsToLearn.length >= 5 && " Seriously — you just learned more about taxes in 2 minutes than most people learn in a year."}
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentQuestion(0);
              setPhase("questions");
            }}
            className="w-full py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow"
          >
            Got It &rarr;
          </button>
        </div>
      )}

      {/* ========== PHASE: COMPREHENSION QUESTIONS ========== */}
      {phase === "questions" && (
        <div className="animate-screen">
          <div className="text-center mb-5">
            <div className="text-[32px] mb-1">&#x1F9E0;</div>
            <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-1">
              Quick Knowledge Check
            </h2>
            <p className="text-[13px] text-tax-muted font-sans max-w-[440px] mx-auto">
              This helps us tailor everything to what you already know. Be honest \u2014 there are no wrong answers.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-[5px] bg-tax-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${((currentQuestion + (canAdvanceQuestion ? 1 : 0)) / questions.length) * 100}%`,
                  background: "linear-gradient(90deg, #4C9AFF, #36B37E)",
                }}
              />
            </div>
            <span className="font-mono text-[11px] text-tax-muted">
              {Math.min(currentQuestion + 1, questions.length)}/{questions.length}
            </span>
          </div>

          {currentQuestion < questions.length && (
            <QuestionCard
              key={questions[currentQuestion].id}
              question={questions[currentQuestion]}
              answer={questionAnswers[questions[currentQuestion].id] ?? null}
              onAnswer={handleAnswerQuestion}
              index={0}
            />
          )}

          {canAdvanceQuestion && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow animate-screen"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "Finish"} &rarr;
            </button>
          )}
        </div>
      )}

      {/* ========== PHASE: DONE ========== */}
      {phase === "done" && (
        <div className="animate-screen-up">
          <div className="text-center mb-6">
            <div className="text-[48px] mb-2 animate-emoji">&#x1F389;</div>
            <h2 className="text-[22px] font-extrabold text-tax-text font-serif mb-2">
              {questionsKnew >= questionsAnswered * 0.7
                ? "You Know More Than You Think!"
                : questionsKnew >= questionsAnswered * 0.4
                  ? "Great Start \u2014 We\u2019ll Fill in the Gaps"
                  : "No Worries \u2014 That\u2019s Why We\u2019re Here"}
            </h2>
            <p className="text-[13px] text-tax-muted font-sans max-w-[460px] mx-auto leading-relaxed">
              {questionsKnew >= questionsAnswered * 0.7
                ? "You've got a solid foundation. We'll build on what you know and make sure you're getting every dollar you deserve."
                : questionsKnew >= questionsAnswered * 0.4
                  ? "You know some of the basics, and we'll explain everything else along the way. Every screen will have help available."
                  : "Taxes are confusing on purpose. We're going to walk you through every single step in plain English. You literally cannot mess this up."}
            </p>
          </div>

          {/* Summary of what they know / don't know */}
          <div className="bg-tax-surface border border-tax-border rounded-xl p-4 mb-4">
            <div className="text-[10px] font-bold text-tax-accent uppercase tracking-wider mb-2 font-mono">
              Your personalized plan
            </div>
            <div className="flex flex-col gap-2">
              {questionsKnew < questionsAnswered && (
                <div className="flex items-start gap-2">
                  <span className="text-tax-accent text-sm mt-0.5">&#x2192;</span>
                  <p className="text-[13px] text-tax-text font-sans">
                    We&apos;ll explain everything in the simplest possible language with real examples
                  </p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-tax-accent text-sm mt-0.5">&#x2192;</span>
                <p className="text-[13px] text-tax-text font-sans">
                  Every question has a &quot;help&quot; button that tells you exactly where to find each number
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-tax-accent text-sm mt-0.5">&#x2192;</span>
                <p className="text-[13px] text-tax-text font-sans">
                  We&apos;ll tell you if you&apos;re leaving money on the table (most people do)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-tax-accent text-sm mt-0.5">&#x2192;</span>
                <p className="text-[13px] text-tax-text font-sans">
                  At the end, you&apos;ll get a step-by-step plan telling you exactly what to do
                </p>
              </div>
            </div>
          </div>

          {isBeginner && !questionAnswers["free_filing"] && (
            <div className="bg-tax-green-dim border border-tax-green/20 rounded-xl p-4 mb-4">
              <p className="text-[13px] text-tax-text font-sans leading-relaxed">
                <strong className="text-tax-green">&#x1F4B0; Remember:</strong> You can file your taxes for FREE.
                We&apos;ll show you exactly how at the end. Don&apos;t let anyone charge you for something you can do yourself in 20 minutes.
              </p>
            </div>
          )}

          <button
            onClick={() => onContinue(Array.from(unknownTerms))}
            className="w-full py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow"
          >
            Let&apos;s Do This &rarr;
          </button>

          <p className="text-[10px] text-tax-dim font-sans text-center mt-3 italic">
            Everything from here on is tailored to your knowledge level.
          </p>
        </div>
      )}
    </div>
  );
}
