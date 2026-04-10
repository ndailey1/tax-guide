"use client";

import { useMemo, useState } from "react";
import type { FinancialProfile } from "@/lib/financial-profile";
import { calculateTax } from "@/lib/financial-profile";
import { TAX_DATA, fmtD } from "@/lib/tax-data";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";

interface ActionPlanScreenProps {
  profile: FinancialProfile;
  filingStatus: string;
  situations: string[];
  level: string;
  onLearnMore: () => void;
  onBack: () => void;
}

interface Step {
  question: string;
  title: string;
  why: string;
  instructions: string[];
  links?: { label: string; url: string }[];
  tip?: string;
  warning?: string;
}

function buildSteps(
  profile: FinancialProfile,
  filingStatus: string,
  situations: string[],
  level: string,
): Step[] {
  const calc = calculateTax(profile, filingStatus);
  const s = new Set(situations);
  const d = TAX_DATA.deductions;
  const steps: Step[] = [];

  // =====================
  // STEP 1: GATHER DOCUMENTS
  // =====================
  const docs: string[] = [];
  docs.push("Your Social Security Number (SSN) \u2014 the 9-digit number on your Social Security card");
  docs.push("A government-issued photo ID (driver's license or passport)");
  docs.push("Your bank account number and routing number \u2014 for direct deposit of your refund (check your banking app or the bottom of a check)");
  if (s.has("employed_w2")) {
    docs.push("W-2 form(s) from every employer \u2014 your employer mails or emails this to you by January 31. Check your payroll portal (ADP, Gusto, Workday) if you can't find it");
  }
  if (s.has("self_employed") || s.has("side_hustle")) {
    docs.push("1099-NEC or 1099-K forms from clients and gig platforms \u2014 check each app's tax documents section");
    docs.push("Records of all business expenses \u2014 bank/credit card statements showing business purchases");
  }
  if (s.has("investor")) {
    docs.push("1099-B, 1099-DIV, and 1099-INT from your brokerage \u2014 check the Tax Documents section of your investment app (Robinhood, Fidelity, Coinbase, etc.)");
  }
  if (s.has("homeowner")) {
    docs.push("Form 1098 from your mortgage company \u2014 shows mortgage interest paid. Check your lender's website under Tax Documents");
  }
  if (s.has("student") || s.has("student_loans")) {
    docs.push("Form 1098-T (tuition) and/or 1098-E (student loan interest) \u2014 check your school's student portal and your loan servicer's website");
  }
  if (s.has("retirement_income")) {
    docs.push("SSA-1099 (Social Security) and/or 1099-R (retirement withdrawals) \u2014 check ssa.gov and your retirement account portal");
  }
  if (s.has("unemployed")) {
    docs.push("Form 1099-G from your state unemployment agency \u2014 log into the same unemployment website where you filed your claim");
  }
  if (s.has("charity")) {
    docs.push("Receipts or acknowledgment letters from charities you donated to");
  }
  if (s.has("medical")) {
    docs.push("Records of medical expenses \u2014 check your health insurance portal for a claims summary");
  }
  if (s.has("childcare")) {
    docs.push("Childcare provider's name, address, and tax ID, plus total amount you paid");
  }

  steps.push({
    question: "Did you gather all your tax documents?",
    title: "Gather your documents",
    why: "Before you can do anything, you need the paperwork. Most of these are sent to you automatically \u2014 check your email, mail, and the apps/websites listed below.",
    instructions: docs,
    tip: "Create a folder (physical or digital) and put everything in one place as you collect it. You'll need all of this whether you file yourself or use a professional.",
  });

  // =====================
  // STEP 2: DECIDE HOW TO FILE
  // =====================
  const isComplex = s.has("self_employed") || s.has("side_hustle") || s.has("rental_income") || (s.has("investor") && (profile.investmentIncomeLTCG ?? 0) + (profile.investmentIncomeSTCG ?? 0) > 5000);

  const filingInstructions: string[] = [];
  const filingLinks: { label: string; url: string }[] = [];

  if (isComplex) {
    filingInstructions.push(
      "Your situation is more complex (self-employment, investments, or rental income). A tax professional can help you maximize deductions and avoid mistakes",
      "Find a CPA or Enrolled Agent near you \u2014 ask friends/family for recommendations, or search online. Expect to pay $200\u2013$500 for a return like yours",
      "If you prefer to do it yourself, use tax software like TurboTax, H&R Block, or FreeTaxUSA \u2014 they walk you through everything with interview-style questions",
      "Whichever you choose, bring ALL the documents from Step 1",
    );
    filingLinks.push(
      { label: "Find a CPA near you", url: "https://www.aicpa-cima.com/resources/find-a-cpa" },
      { label: "FreeTaxUSA (cheapest DIY for complex returns)", url: "https://www.freetaxusa.com" },
    );
  } else {
    filingInstructions.push(
      "Your situation is straightforward \u2014 you can file for FREE without paying anyone",
      "Go to IRS Free File \u2014 it's the IRS's official program with free tax software. If your income is under $84,000, you qualify",
      "Another good free option: Cash App Taxes (formerly Credit Karma Tax) is always free regardless of income",
      "These programs ask you simple questions and fill out the forms for you. It's like a guided interview \u2014 no tax knowledge needed",
      "Have your documents from Step 1 ready. The software will tell you exactly which numbers to enter from each form",
    );
    filingLinks.push(
      { label: "IRS Free File \u2014 Official free filing", url: "https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free" },
      { label: "Cash App Taxes \u2014 Always free", url: "https://cash.app/taxes" },
    );
  }

  steps.push({
    question: "Did you decide how you're going to file?",
    title: "Choose how you'll file",
    why: isComplex
      ? "With self-employment or investment income, a professional or good software will catch deductions you'd miss on your own. They often pay for themselves."
      : "You don't need to pay anyone. Free software walks you through the whole process step by step.",
    instructions: filingInstructions,
    links: filingLinks,
  });

  // =====================
  // STEP 3: FILE YOUR FEDERAL RETURN
  // =====================
  const federalInstructions: string[] = [
    "Open the filing tool you chose in Step 2 and create an account (or sign in)",
    "Enter your personal info: name, SSN, date of birth, address",
  ];
  if (s.has("employed_w2")) {
    federalInstructions.push("Enter the numbers from your W-2(s) \u2014 the software will tell you exactly which boxes to enter (Box 1 for wages, Box 2 for taxes withheld, etc.)");
  }
  if (s.has("self_employed") || s.has("side_hustle")) {
    federalInstructions.push("Enter your self-employment income from your 1099 forms and your business expenses");
  }
  if (s.has("investor")) {
    federalInstructions.push("Enter your investment info from 1099-B/DIV/INT forms \u2014 many brokerages let you import this automatically");
  }

  // Deduction guidance
  if (calc.useItemized) {
    federalInstructions.push(
      `When asked about deductions, choose "itemize" \u2014 your deductions (${fmtD(Math.round(calc.itemizedTotal))}) save you more than the standard deduction (${fmtD(calc.standardDeduction)})`
    );
  } else {
    federalInstructions.push(
      `When asked about deductions, choose the "standard deduction" (${fmtD(calc.standardDeduction)}) \u2014 it's the bigger savings for you. The software usually recommends this automatically`
    );
  }

  if ((profile.childrenUnder17 ?? 0) > 0 || (profile.otherDependents ?? 0) > 0) {
    federalInstructions.push("Enter your dependents' info (name, SSN, date of birth, relationship) \u2014 the software will calculate your credits automatically");
  }

  federalInstructions.push(
    "Enter your bank account info for direct deposit \u2014 this is the fastest way to get your refund (usually 2\u20133 weeks)",
    "Review everything carefully, then e-file (submit electronically). You'll get a confirmation email"
  );

  const refundNote = calc.totalWithholding > 0
    ? calc.estimatedRefundOrOwed >= 0
      ? `Based on what you entered, you should get approximately ${fmtD(Math.round(calc.estimatedRefundOrOwed))} back. This is because your employer sent ${fmtD(Math.round(calc.totalWithholding))} to the IRS, but you only owe about ${fmtD(Math.round(calc.taxAfterCredits))}.`
      : `Based on what you entered, you may owe about ${fmtD(Math.abs(Math.round(calc.estimatedRefundOrOwed)))}. The software will tell you how to pay (usually online at irs.gov/payments or by bank transfer).`
    : undefined;

  steps.push({
    question: "Did you file your federal tax return?",
    title: "File your federal tax return",
    why: "This is the main event. The software walks you through it \u2014 you're basically answering questions and typing numbers from your documents.",
    instructions: federalInstructions,
    tip: refundNote,
    links: [
      { label: "IRS Where's My Refund \u2014 Track your refund status", url: "https://www.irs.gov/refunds" },
    ],
  });

  // =====================
  // STEP 4: FILE STATE RETURN
  // =====================
  steps.push({
    question: "Did you file your state tax return?",
    title: "File your state tax return",
    why: "Most states require a separate tax return in addition to the federal one. The good news: most of the info carries over from your federal return.",
    instructions: [
      "Check if your state has income tax \u2014 these states do NOT: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, Wyoming. If you live in one of these, skip this step",
      "Many free filing tools (IRS Free File partners, Cash App Taxes) include free state filing too",
      "If not, check your state's tax agency website \u2014 search \"[your state] file taxes free\" for free state filing options",
      "Your state return uses most of the same info as your federal return, so it's much faster to do",
    ],
    tip: "File your federal return first \u2014 your state return pulls info from it.",
  });

  // =====================
  // STEP 5: SPECIFIC MONEY-SAVING CHECKS
  // =====================
  const moneySavers: string[] = [];
  const moneyLinks: { label: string; url: string }[] = [];

  // EITC check
  const eitcLimits = TAX_DATA.credits.eitc;
  const numChildren = profile.childrenUnder17 ?? 0;
  const eitcBracket = numChildren >= 3 ? eitcLimits.threeOrMore : numChildren === 2 ? eitcLimits.twoChildren : numChildren === 1 ? eitcLimits.oneChild : eitcLimits.noChildren;
  const eitcAgiLimit = filingStatus === "married_jointly" ? eitcBracket.agiJoint : eitcBracket.agiSingle;
  if (calc.agi <= eitcAgiLimit) {
    moneySavers.push(
      `Check if you qualify for the Earned Income Tax Credit (EITC) \u2014 this is a cash-back credit worth up to ${fmtD(eitcBracket.max)} that about 20% of eligible people miss. Use the IRS tool below to check`
    );
    moneyLinks.push({ label: "IRS EITC Assistant \u2014 Check if you qualify", url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/use-the-eitc-assistant" });
  }

  if (s.has("student_loans") && (profile.studentLoanInterest ?? 0) > 0) {
    moneySavers.push(
      `Make sure your student loan interest deduction (${fmtD(Math.min(profile.studentLoanInterest ?? 0, d.studentLoanMax))}) is included \u2014 the filing software should pick this up from your 1098-E form`
    );
  }

  if (calc.childTaxCredit > 0) {
    moneySavers.push(
      `Verify your Child Tax Credit (${fmtD(calc.childTaxCredit)}) is included \u2014 the software calculates this automatically when you enter your children's info`
    );
  }

  // W-4 adjustment
  if (calc.totalWithholding > 0 && calc.estimatedRefundOrOwed > 1500) {
    moneySavers.push(
      `After you file: Ask your employer's HR to update your W-4 form. You're getting a large refund, which means too much money is taken from each paycheck. Adjusting this puts more money in your pocket every payday instead of waiting for a refund. Use the IRS calculator below`
    );
    moneyLinks.push({ label: "IRS Withholding Estimator \u2014 Get your W-4 right", url: "https://www.irs.gov/individuals/tax-withholding-estimator" });
  } else if (calc.totalWithholding > 0 && calc.estimatedRefundOrOwed < -500) {
    moneySavers.push(
      `After you file: Ask your employer's HR to update your W-4 form so more tax is taken from each paycheck. This way you won't owe a lump sum next year. Use the IRS calculator below`
    );
    moneyLinks.push({ label: "IRS Withholding Estimator \u2014 Get your W-4 right", url: "https://www.irs.gov/individuals/tax-withholding-estimator" });
  }

  // Retirement
  if (!s.has("retirement_contrib") && calc.grossIncome > 25000) {
    moneySavers.push(
      `Start putting money into a 401(k) or IRA to lower next year's taxes. At your tax rate, every $1,000 you contribute saves you about ${fmtD(Math.round(1000 * calc.marginalRate))} in taxes AND builds your retirement. If your employer matches 401(k) contributions, contribute at least enough to get the full match \u2014 it's free money`
    );
  }

  if (s.has("self_employed") || s.has("side_hustle")) {
    moneySavers.push(
      "Set up quarterly estimated tax payments so you don't owe a big lump sum next year. Pay online at irs.gov/payments four times a year (April, June, September, January)"
    );
    moneyLinks.push({ label: "IRS Online Payments \u2014 Pay estimated taxes", url: "https://www.irs.gov/payments" });
  }

  if (moneySavers.length > 0) {
    steps.push({
      question: "Did you check for extra savings and credits?",
      title: "Don't leave money on the table",
      why: "These are specific things that could save you money \u2014 either on this year's return or next year's.",
      instructions: moneySavers,
      links: moneyLinks.length > 0 ? moneyLinks : undefined,
    });
  }

  // =====================
  // STEP 6: KEEP RECORDS
  // =====================
  steps.push({
    question: "Did you save copies of everything?",
    title: "Save everything for 3 years",
    why: "The IRS can audit you for up to 3 years (6 years if something is way off). Keep your records in case they ask questions.",
    instructions: [
      "Save a copy of your filed return (the software lets you download a PDF)",
      "Keep all your tax documents (W-2s, 1099s, receipts) in a folder",
      "Store digital copies in the cloud (Google Drive, iCloud, Dropbox) so you don't lose them",
      "Don't throw anything away for at least 3 years after filing",
    ],
  });

  return steps;
}

export function ActionPlanScreen({
  profile,
  filingStatus,
  situations,
  level,
  onLearnMore,
  onBack,
}: ActionPlanScreenProps) {
  const steps = useMemo(
    () => buildSteps(profile, filingStatus, situations, level),
    [profile, filingStatus, situations, level]
  );

  const calc = useMemo(
    () => calculateTax(profile, filingStatus),
    [profile, filingStatus]
  );

  const isRefund = calc.totalWithholding > 0 && calc.estimatedRefundOrOwed >= 0;

  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0])); // first one open by default

  const toggleCheck = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
        // Auto-expand the next unchecked step
        const nextStep = steps.findIndex((_, idx) => idx > i && !next.has(idx));
        if (nextStep !== -1) {
          setExpanded((prev) => {
            const e = new Set(prev);
            e.add(nextStep);
            return e;
          });
        }
      }
      return next;
    });
  };

  const toggleExpand = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const allDone = checked.size === steps.length;

  return (
    <div className="max-w-[640px] mx-auto animate-screen-up">
      <button
        onClick={onBack}
        className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
      >
        &larr; Back to Tax Estimate
      </button>
      <Confetti active={allDone} />

      {/* Header */}
      <div className="text-center mb-5">
        <div className="text-[48px] mb-2 animate-emoji">&#x1F3AF;</div>
        <h1 className="text-[26px] font-extrabold text-tax-text font-serif mb-2">
          Your Tax Checklist
        </h1>
        <p className="text-[14px] text-tax-muted font-sans max-w-[480px] mx-auto leading-relaxed">
          Check off each step as you complete it. Tap any item to see exactly what to do.
        </p>
        <p className="text-[12px] text-tax-dim font-sans italic mt-1">
          Here&apos;s the part where we actually tell you what to do (instead of just scaring you with numbers).
        </p>
      </div>

      {/* Progress */}
      <ProgressBar current={checked.size} total={steps.length} />

      {/* Deadline callout */}
      <div className="bg-tax-orange-dim border border-tax-orange/20 rounded-xl p-4 mb-5 animate-reveal">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">&#x23F0;</span>
          <span className="text-[14px] font-bold text-tax-orange font-sans">
            Deadline: {TAX_DATA.filingDeadline}
          </span>
        </div>
        <p className="text-[13px] text-tax-text font-sans leading-relaxed">
          {isRefund
            ? "File as early as possible to get your refund faster. Most people get their refund in 2\u20133 weeks when filing electronically with direct deposit."
            : `This is the last day to file and pay. If you need more time to file (not pay), you can request a free extension \u2014 but it's better to just file now while you have momentum.`
          }
        </p>
      </div>

      {/* Checklist steps */}
      {steps.map((step, i) => {
        const isDone = checked.has(i);
        const isOpen = expanded.has(i);

        return (
          <div
            key={i}
            className={`mb-3 animate-card delay-${Math.min(i, 12)} transition-all duration-300`}
          >
            {/* Checkable header */}
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer btn-press ${
                isDone
                  ? "bg-tax-green-dim border-tax-green/30"
                  : "bg-tax-surface border-tax-border"
              }`}
              onClick={() => toggleExpand(i)}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheck(i);
                }}
                className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  isDone
                    ? "bg-tax-green border-tax-green"
                    : "border-tax-border-light bg-transparent hover:border-tax-accent"
                }`}
              >
                {isDone && (
                  <span className="text-white text-sm font-bold">&#x2713;</span>
                )}
              </button>

              {/* Question */}
              <div className="flex-1">
                <p className={`text-[14px] font-semibold font-sans transition-all ${
                  isDone ? "text-tax-green line-through" : "text-tax-text"
                }`}>
                  {step.question}
                </p>
                {!isOpen && !isDone && (
                  <p className="text-[11px] text-tax-muted font-sans mt-0.5">
                    Tap to see how
                  </p>
                )}
              </div>

              {/* Expand indicator */}
              <span
                className={`text-tax-muted text-sm transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
              >
                &#x25B6;
              </span>
            </div>

            {/* Expandable detail */}
            {isOpen && (
              <div className="ml-4 mr-1 mt-2 animate-screen">
                {/* Step title and explanation */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tax-accent flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white font-mono">{i + 1}</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-tax-accent font-sans">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[12px] text-tax-muted font-sans leading-relaxed mb-3 ml-8">
                  {step.why}
                </p>

                {/* Instructions */}
                <div className="ml-4 bg-tax-surface-alt border border-tax-border rounded-xl p-4">
                  <div className="flex flex-col gap-2.5">
                    {step.instructions.map((instruction, j) => (
                      <div key={j} className="flex gap-2.5 items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] border-tax-border flex items-center justify-center mt-0.5">
                          <span className="text-[9px] text-tax-muted font-mono">{j + 1}</span>
                        </div>
                        <p className="text-[13px] text-tax-text font-sans leading-relaxed">
                          {instruction}
                        </p>
                      </div>
                    ))}
                  </div>

                  {step.tip && (
                    <div className="mt-3 pt-3 border-t border-tax-border">
                      <p className="text-[12px] text-tax-green font-sans leading-relaxed">
                        <strong>&#x1F4A1; Tip:</strong> {step.tip}
                      </p>
                    </div>
                  )}

                  {step.warning && (
                    <div className="mt-3 pt-3 border-t border-tax-border">
                      <p className="text-[12px] text-tax-orange font-sans leading-relaxed">
                        <strong>&#x26A0;&#xFE0F; Heads up:</strong> {step.warning}
                      </p>
                    </div>
                  )}

                  {step.links && step.links.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-tax-border flex flex-col gap-2">
                      {step.links.map((link, k) => (
                        <a
                          key={k}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 py-2.5 px-3 bg-tax-accent-dim border border-tax-accent/20 rounded-lg text-[13px] text-tax-accent font-sans font-semibold no-underline hover:bg-tax-accent/20 transition-colors btn-press"
                        >
                          <span className="text-sm">&#x1F517;</span>
                          {link.label}
                          <span className="ml-auto text-tax-muted text-xs">&rarr;</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mark done button inside expanded */}
                {!isDone && (
                  <button
                    onClick={() => toggleCheck(i)}
                    className="w-full mt-3 py-3 rounded-xl border border-tax-green/30 bg-tax-green-dim text-tax-green text-[13px] font-bold cursor-pointer font-sans btn-press hover:bg-tax-green/20 transition-colors"
                  >
                    &#x2713; Done &mdash; I did this
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* All done celebration */}
      {allDone && (
        <div className="text-center mt-6 mb-4 animate-screen-up">
          <div className="text-[48px] mb-2">&#x1F389;</div>
          <h2 className="text-[20px] font-extrabold text-tax-green font-serif mb-2">
            You did it!
          </h2>
          <p className="text-[14px] text-tax-text font-sans">
            That&apos;s it. Seriously. You&apos;re going to be fine.
          </p>
          <p className="text-[12px] text-tax-dim font-sans italic mt-1">
            You now know more about your taxes than most adults. Go you.
          </p>
        </div>
      )}

      {/* Learn more option */}
      <div className="mt-6 mb-4">
        <div className="text-center mb-3">
          <p className="text-[13px] text-tax-muted font-sans">
            Want to understand how taxes work in more detail?
          </p>
        </div>
        <button
          onClick={onLearnMore}
          className="w-full py-4 rounded-xl border border-tax-border bg-tax-surface text-tax-text text-[14px] font-semibold font-sans cursor-pointer hover:bg-tax-surface-alt transition-colors btn-press"
        >
          &#x1F4DA; Learn More About Each Topic
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-tax-surface border border-tax-border rounded-xl p-5 mt-4">
        <div className="text-[10px] font-bold text-tax-muted uppercase tracking-wider mb-2 font-mono">
          Important Disclaimer
        </div>
        <p className="text-[12px] text-tax-muted font-sans leading-relaxed mb-2">
          <strong className="text-tax-text">This is not financial, tax, or legal advice.</strong> This
          tool provides educational estimates based on the information you entered and general IRS
          guidelines for the {TAX_DATA.year} tax year. Your actual tax situation may differ based on
          factors not captured here, including state taxes, alternative minimum tax, phaseouts,
          and other provisions.
        </p>
        <p className="text-[12px] text-tax-muted font-sans leading-relaxed mb-2">
          All tax data is sourced from official IRS publications. However, tax law is complex and
          changes frequently. We make every effort to be accurate, but this tool is not a substitute
          for professional tax preparation.
        </p>
        <p className="text-[12px] text-tax-muted font-sans leading-relaxed">
          <strong className="text-tax-text">For important financial decisions, consult a qualified
          tax professional</strong> (CPA, Enrolled Agent, or tax attorney) who can review your
          complete situation.
        </p>
      </div>

      <div className="text-center mt-4 mb-2">
        <p className="text-[10px] text-tax-dim font-mono">
          Built with IRS data &bull; {TAX_DATA.year} Tax Year &bull; Filed in {TAX_DATA.filingYear}
        </p>
      </div>
    </div>
  );
}
