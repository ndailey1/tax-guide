"use client";

import { useMemo } from "react";
import type { FinancialProfile } from "@/lib/financial-profile";
import { calculateTax, type TaxCalculation } from "@/lib/financial-profile";
import { TAX_DATA, fmtD } from "@/lib/tax-data";

interface ActionPlanScreenProps {
  profile: FinancialProfile;
  filingStatus: string;
  situations: string[];
  level: string;
}

interface Action {
  emoji: string;
  title: string;
  detail: string;
  priority: "now" | "soon" | "next_year";
  category: "file" | "save" | "plan" | "protect";
}

function buildActions(
  calc: TaxCalculation,
  profile: FinancialProfile,
  filingStatus: string,
  situations: string[],
): Action[] {
  const actions: Action[] = [];
  const s = new Set(situations);
  const d = TAX_DATA.deductions;

  // ============================================
  // FILING ACTIONS (do now)
  // ============================================

  // Standard vs itemized recommendation
  if (calc.useItemized) {
    actions.push({
      emoji: "\uD83D\uDCCB",
      title: "Itemize your deductions",
      detail: `Your itemized deductions (${fmtD(Math.round(calc.itemizedTotal))}) beat the standard deduction (${fmtD(calc.standardDeduction)}) by ${fmtD(Math.round(calc.itemizedTotal - calc.standardDeduction))}. Make sure you have receipts and documentation for all deductions you're claiming.`,
      priority: "now",
      category: "file",
    });
  } else {
    actions.push({
      emoji: "\u2705",
      title: "Take the standard deduction",
      detail: `The standard deduction (${fmtD(calc.standardDeduction)}) saves you more than itemizing${calc.itemizedTotal > 0 ? ` (your itemized total is only ${fmtD(Math.round(calc.itemizedTotal))})` : ""}. You don't need to track individual deduction receipts for your federal return.`,
      priority: "now",
      category: "file",
    });
  }

  // Refund or owed
  if (calc.totalWithholding > 0) {
    if (calc.estimatedRefundOrOwed >= 0) {
      actions.push({
        emoji: "\uD83D\uDCB0",
        title: `File your return to claim your ~${fmtD(Math.round(calc.estimatedRefundOrOwed))} refund`,
        detail: `Your employer sent ${fmtD(Math.round(calc.totalWithholding))} to the IRS, but you only owe ~${fmtD(Math.round(calc.taxAfterCredits))}. File your return to get the difference back. The sooner you file, the sooner you get paid. Choose direct deposit for the fastest refund (usually 2-3 weeks with e-filing).`,
        priority: "now",
        category: "file",
      });
    } else {
      actions.push({
        emoji: "\u26A0\uFE0F",
        title: `You may owe ~${fmtD(Math.abs(Math.round(calc.estimatedRefundOrOwed)))} — file by ${TAX_DATA.filingDeadline}`,
        detail: `Your withholding of ${fmtD(Math.round(calc.totalWithholding))} didn't fully cover your ~${fmtD(Math.round(calc.taxAfterCredits))} tax bill. File and pay by ${TAX_DATA.filingDeadline} to avoid penalties. If you can't pay in full, file anyway — the failure-to-file penalty (5%/month) is 10x worse than failure-to-pay (0.5%/month). The IRS offers payment plans.`,
        priority: "now",
        category: "file",
      });
    }
  }

  // Filing deadline
  actions.push({
    emoji: "\uD83D\uDCC5",
    title: `File by ${TAX_DATA.filingDeadline}`,
    detail: `This is the deadline to file your ${TAX_DATA.year} federal return. If you need more time, you can file for a free automatic extension by this date — but that only extends the time to file, NOT the time to pay. Any tax owed is still due ${TAX_DATA.filingDeadline}.`,
    priority: "now",
    category: "file",
  });

  // How to file
  const beg = s.has("self_employed") || s.has("side_hustle") || s.has("rental_income") || s.has("investor");
  actions.push({
    emoji: "\uD83D\uDCBB",
    title: beg ? "Consider using a CPA or tax professional" : "File for free using IRS Free File or similar",
    detail: beg
      ? `With self-employment, investment, or rental income, a tax professional can help you maximize deductions and avoid mistakes. Expect to pay $200-$500 for a basic return. The deductions they find often pay for themselves.`
      : `If your income is under $84,000, you can use IRS Free File (irs.gov/freefile) for free federal filing. Free options also include Cash App Taxes (always free) and many states offer free filing through their tax websites. TurboTax and H&R Block also have free tiers for simple returns.`,
    priority: "now",
    category: "file",
  });

  // ============================================
  // MONEY-SAVING ACTIONS (things they may be missing)
  // ============================================

  // Credits they qualify for
  if (calc.childTaxCredit > 0) {
    actions.push({
      emoji: "\uD83D\uDC76",
      title: `Claim ${fmtD(calc.childTaxCredit)} in Child Tax Credits`,
      detail: `You qualify for ${fmtD(calc.childTaxCredit)} in Child Tax Credits (${fmtD(TAX_DATA.credits.childTaxCredit.max)} per child under ${TAX_DATA.credits.childTaxCredit.ageLimit}). Up to ${fmtD(TAX_DATA.credits.childTaxCredit.refundable)} per child is refundable — meaning you get it even if you don't owe any tax. Make sure each child's Social Security number is correct on your return.`,
      priority: "now",
      category: "save",
    });
  }

  // EITC check
  const eitcLimits = TAX_DATA.credits.eitc;
  const numChildren = profile.childrenUnder17 ?? 0;
  const eitcBracket = numChildren >= 3 ? eitcLimits.threeOrMore : numChildren === 2 ? eitcLimits.twoChildren : numChildren === 1 ? eitcLimits.oneChild : eitcLimits.noChildren;
  const eitcAgiLimit = filingStatus === "married_jointly" ? eitcBracket.agiJoint : eitcBracket.agiSingle;
  if (calc.agi <= eitcAgiLimit) {
    actions.push({
      emoji: "\uD83C\uDF1F",
      title: `Check if you qualify for up to ${fmtD(eitcBracket.max)} from the Earned Income Tax Credit`,
      detail: `Based on your income, you may qualify for the EITC — one of the most valuable credits available. It's fully refundable, meaning you get cash back even if you owe $0 in tax. About 20% of eligible people don't claim this. Use the IRS EITC Assistant tool at irs.gov to check your eligibility.`,
      priority: "now",
      category: "save",
    });
  }

  // Student loan interest
  if (s.has("student_loans") && (profile.studentLoanInterest ?? 0) > 0) {
    actions.push({
      emoji: "\uD83C\uDF93",
      title: `Deduct your ${fmtD(Math.min(profile.studentLoanInterest ?? 0, d.studentLoanMax))} in student loan interest`,
      detail: `You can deduct up to ${fmtD(d.studentLoanMax)} in student loan interest — and you get this even if you take the standard deduction. Make sure you have your Form 1098-E from your loan servicer.`,
      priority: "now",
      category: "save",
    });
  }

  // SE quarterly payments
  if ((s.has("self_employed") || s.has("side_hustle")) && calc.selfEmploymentTax > 0) {
    actions.push({
      emoji: "\uD83D\uDCC6",
      title: "Set up quarterly estimated tax payments for next year",
      detail: `As a self-employed person, your taxes aren't automatically withheld. You need to pay estimated taxes quarterly to avoid penalties. Based on this year's numbers, plan to send roughly ${fmtD(Math.round(calc.taxAfterCredits / 4))} per quarter. Use IRS Form 1040-ES or pay online at irs.gov/payments.`,
      priority: "soon",
      category: "plan",
    });
  }

  // ============================================
  // NEXT YEAR PLANNING
  // ============================================

  // W-4 adjustment
  if (calc.totalWithholding > 0) {
    if (calc.estimatedRefundOrOwed > 1500) {
      actions.push({
        emoji: "\uD83D\uDD27",
        title: "Adjust your W-4 to get more money in each paycheck",
        detail: `You're getting a large refund, which means too much tax is being taken from each paycheck. That's YOUR money sitting with the IRS interest-free all year. Ask your employer's HR/payroll department for a new W-4 form and claim more allowances. Use the IRS Tax Withholding Estimator (irs.gov/w4app) to get the right amount.`,
        priority: "soon",
        category: "plan",
      });
    } else if (calc.estimatedRefundOrOwed < -500) {
      actions.push({
        emoji: "\uD83D\uDD27",
        title: "Adjust your W-4 so you don't owe next year",
        detail: `You owed money this year because not enough tax was taken from your paychecks. Update your W-4 with your employer to increase withholding. Use the IRS Tax Withholding Estimator (irs.gov/w4app) to find the right setting. This is especially important if you have multiple income sources.`,
        priority: "soon",
        category: "plan",
      });
    }
  }

  // Retirement savings
  if (!s.has("retirement_contrib") && calc.grossIncome > 25000) {
    actions.push({
      emoji: "\uD83C\uDFE6",
      title: "Start contributing to a 401(k) or IRA to lower next year's taxes",
      detail: `Every dollar you put into a traditional 401(k) or IRA reduces your taxable income. At your ${(calc.marginalRate * 100).toFixed(0)}% tax bracket, contributing ${fmtD(5000)} would save you ~${fmtD(Math.round(5000 * calc.marginalRate))} in taxes AND build your retirement savings. If your employer offers a 401(k) match, contribute at least enough to get the full match — it's literally free money.`,
      priority: "next_year",
      category: "plan",
    });
  } else if (s.has("retirement_contrib")) {
    const current401k = profile.contribution401k ?? 0;
    if (current401k > 0 && current401k < d.k401Limit) {
      actions.push({
        emoji: "\u2B06\uFE0F",
        title: "Increase your 401(k) contributions to save more on taxes",
        detail: `You contributed ${fmtD(current401k)} this year — you could contribute up to ${fmtD(d.k401Limit)}. Every additional dollar saves you ${(calc.marginalRate * 100).toFixed(0)} cents in taxes. Even increasing by ${fmtD(1000)} would save ~${fmtD(Math.round(1000 * calc.marginalRate))} on next year's tax bill.`,
        priority: "next_year",
        category: "plan",
      });
    }
  }

  // HSA recommendation
  if (!s.has("hsa") && calc.grossIncome > 20000) {
    actions.push({
      emoji: "\uD83D\uDC8A",
      title: "Look into opening an HSA if you have a high-deductible health plan",
      detail: `An HSA is one of the best tax deals available. Money goes in tax-free, grows tax-free, and comes out tax-free for medical expenses. You can contribute up to ${fmtD(d.hsaSelf)} (individual) or ${fmtD(d.hsaFamily)} (family). Check if your health insurance plan qualifies as a "high-deductible health plan" (HDHP).`,
      priority: "next_year",
      category: "plan",
    });
  }

  // Record keeping
  if (s.has("self_employed") || s.has("side_hustle")) {
    actions.push({
      emoji: "\uD83D\uDCC2",
      title: "Keep better records of business expenses throughout the year",
      detail: `Track every business expense as it happens — don't wait until tax time. Use a free app like Wave or a spreadsheet. Save receipts for anything over $75. Track mileage with a free app like Stride or MileIQ. Good records can save you thousands and protect you in an audit.`,
      priority: "next_year",
      category: "protect",
    });
  }

  // State filing reminder
  actions.push({
    emoji: "\uD83C\uDFDB\uFE0F",
    title: "Don't forget your state tax return",
    detail: `Most states require a separate state tax return in addition to your federal return. Check your state's tax agency website for filing requirements, deadlines, and free filing options. If you moved states during the year, you may need to file in both states.`,
    priority: "now",
    category: "file",
  });

  // Document retention
  actions.push({
    emoji: "\uD83D\uDDC4\uFE0F",
    title: "Keep copies of everything for at least 3 years",
    detail: `Save a copy of your filed return plus all supporting documents (W-2s, 1099s, receipts) for at least 3 years — that's how long the IRS has to audit most returns. If you reported income substantially wrong, they have 6 years. Store digital copies in the cloud so you don't lose them.`,
    priority: "soon",
    category: "protect",
  });

  return actions;
}

const PRIORITY_CONFIG = {
  now: { label: "DO NOW", color: "text-tax-red", bg: "bg-tax-red/10", border: "border-tax-red/20" },
  soon: { label: "DO SOON", color: "text-tax-orange", bg: "bg-tax-orange-dim", border: "border-tax-orange/20" },
  next_year: { label: "FOR NEXT YEAR", color: "text-tax-accent", bg: "bg-tax-accent-dim", border: "border-tax-accent/20" },
};

export function ActionPlanScreen({
  profile,
  filingStatus,
  situations,
}: ActionPlanScreenProps) {
  const calc = useMemo(
    () => calculateTax(profile, filingStatus),
    [profile, filingStatus]
  );

  const actions = useMemo(
    () => buildActions(calc, profile, filingStatus, situations),
    [calc, profile, filingStatus, situations]
  );

  const groupedActions = useMemo(() => {
    const groups: Record<string, Action[]> = { now: [], soon: [], next_year: [] };
    actions.forEach((a) => groups[a.priority].push(a));
    return groups;
  }, [actions]);

  return (
    <div className="max-w-[640px] mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-[40px] mb-2">&#x1F3AF;</div>
        <h1 className="text-2xl font-extrabold text-tax-text font-serif mb-2">
          What You Should Do
        </h1>
        <p className="text-sm text-tax-muted font-sans max-w-[480px] mx-auto">
          Your personalized action plan based on everything you told us.
          These are the specific steps to file correctly and keep as much of your money as possible.
        </p>
      </div>

      {/* Action groups */}
      {(["now", "soon", "next_year"] as const).map((priority) => {
        const group = groupedActions[priority];
        if (group.length === 0) return null;
        const config = PRIORITY_CONFIG[priority];

        return (
          <div key={priority} className="mb-6">
            <div className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono mb-3 ${config.color} ${config.bg} border ${config.border}`}>
              {config.label}
            </div>
            <div className="flex flex-col gap-2.5">
              {group.map((action, i) => (
                <div
                  key={i}
                  className="bg-tax-surface border border-tax-border rounded-[10px] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{action.emoji}</span>
                    <div>
                      <h3 className="text-[14px] font-bold text-tax-text font-sans mb-1.5">
                        {action.title}
                      </h3>
                      <p className="text-[13px] text-tax-muted font-sans leading-relaxed">
                        {action.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <div className="bg-tax-surface border border-tax-border rounded-[10px] p-5 mt-6">
        <div className="text-[10px] font-bold text-tax-muted uppercase tracking-wider mb-2 font-mono">
          Important Disclaimer
        </div>
        <p className="text-[12px] text-tax-muted font-sans leading-relaxed mb-2">
          <strong className="text-tax-text">This is not financial, tax, or legal advice.</strong> This
          tool provides educational estimates based on the information you entered and general IRS
          guidelines for the {TAX_DATA.year} tax year. Your actual tax situation may differ based on
          factors not captured here, including state taxes, alternative minimum tax (AMT), phaseouts,
          and other provisions.
        </p>
        <p className="text-[12px] text-tax-muted font-sans leading-relaxed mb-2">
          All tax data is sourced from official IRS publications. However, tax law is complex and
          changes frequently. We make every effort to be accurate, but this tool is not a substitute
          for professional tax preparation.
        </p>
        <p className="text-[12px] text-tax-muted font-sans leading-relaxed">
          <strong className="text-tax-text">For important financial decisions, consult a qualified
          tax professional (CPA, Enrolled Agent, or tax attorney)</strong> who can review your
          complete situation and provide personalized advice.
        </p>
      </div>

      {/* Source attribution */}
      <div className="text-center mt-4 mb-2">
        <p className="text-[10px] text-tax-dim font-mono">
          Built with IRS data &bull; {TAX_DATA.year} Tax Year &bull; Filed in {TAX_DATA.filingYear}
        </p>
      </div>
    </div>
  );
}
