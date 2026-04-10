import { TAX_DATA } from "./tax-data";
import {
  calculateTax,
  type FinancialProfile,
  type TaxCalculation,
} from "./financial-profile";

export interface SavingsOpportunity {
  id: string;
  category: "retirement" | "healthcare" | "filing" | "credits" | "deductions" | "paycheck";
  icon: string;
  title: string;
  description: string;
  actionAmount: number;
  actionLabel: string;
  annualSavings: number;
  monthlyImpact: number;
  confidence: "exact" | "estimate";
  priority: number;
  whatIf: string;
  steps?: string[];
  caveat?: string;
}

export interface SavingsResult {
  opportunities: SavingsOpportunity[];
  totalPotentialSavings: number;
}

const v = (n: number | null) => n ?? 0;

function diffTax(
  original: TaxCalculation,
  modified: FinancialProfile,
  filingStatus: string
): number {
  const newCalc = calculateTax(modified, filingStatus);
  return original.taxAfterCredits - newCalc.taxAfterCredits;
}

function cloneProfile(p: FinancialProfile): FinancialProfile {
  return { ...p };
}

export function findSavings(
  profile: FinancialProfile,
  filingStatus: string,
  situations: string[],
  calc: TaxCalculation
): SavingsResult {
  const s = new Set(situations);
  const d = TAX_DATA.deductions;
  const c = TAX_DATA.credits;
  const opportunities: SavingsOpportunity[] = [];

  // ============================================
  // 1. TRADITIONAL IRA
  // ============================================
  const currentIRA = v(profile.contributionIRA);
  if (currentIRA < d.iraMax) {
    const additional = d.iraMax - currentIRA;
    const mod = cloneProfile(profile);
    mod.contributionIRA = d.iraMax;
    const savings = diffTax(calc, mod, filingStatus);
    if (savings > 0) {
      opportunities.push({
        id: "ira",
        category: "retirement",
        icon: "\uD83C\uDFE6",
        title: "Open or Max Out a Traditional IRA",
        description: `A Traditional IRA lets you deduct contributions from your taxable income. You can contribute up to $${d.iraMax.toLocaleString()} per year (or $${(d.iraMax + d.iraCatchUp50).toLocaleString()} if you're 50+). At your ${(calc.marginalRate * 100).toFixed(0)}% marginal rate, every dollar you contribute saves you ${(calc.marginalRate * 100).toFixed(0)} cents in taxes.`,
        actionAmount: additional,
        actionLabel: "contribute to a Traditional IRA",
        annualSavings: savings,
        monthlyImpact: Math.round(savings / 12),
        confidence: "exact",
        priority: 8,
        whatIf: `Contributing $${additional.toLocaleString()} to a Traditional IRA would save you $${savings.toLocaleString()} in taxes this year.`,
        steps: [
          "Open a Traditional IRA at any brokerage (Fidelity, Vanguard, and Schwab all have no-fee IRAs)",
          `Contribute up to $${additional.toLocaleString()} before April 15, ${TAX_DATA.filingYear}`,
          "You can still make contributions for the ${TAX_DATA.year} tax year until the filing deadline",
          "The tax deduction happens automatically when you file",
        ],
        caveat: currentIRA > 0
          ? undefined
          : "IRA deductibility may be limited if you have a workplace retirement plan and your income is above certain thresholds.",
      });
    }
  }

  // ============================================
  // 2. HSA
  // ============================================
  if (s.has("hsa")) {
    const hsaMax = filingStatus === "married_jointly" ? d.hsaFamily : d.hsaSelf;
    const currentHSA = v(profile.contributionHSA);
    if (currentHSA < hsaMax) {
      const additional = hsaMax - currentHSA;
      const mod = cloneProfile(profile);
      mod.contributionHSA = hsaMax;
      const savings = diffTax(calc, mod, filingStatus);
      if (savings > 0) {
        opportunities.push({
          id: "hsa",
          category: "healthcare",
          icon: "\uD83D\uDC8A",
          title: "Max Out Your HSA",
          description: `An HSA is the only account with a TRIPLE tax advantage: contributions are tax-deductible, the money grows tax-free, and withdrawals for medical expenses are tax-free. Your limit is $${hsaMax.toLocaleString()}/year. Even if you don't need medical care now, this money rolls over forever — many people use it as a stealth retirement account.`,
          actionAmount: additional,
          actionLabel: "contribute to your HSA",
          annualSavings: savings,
          monthlyImpact: Math.round(savings / 12),
          confidence: "exact",
          priority: 8,
          whatIf: `Contributing $${additional.toLocaleString()} more to your HSA would save you $${savings.toLocaleString()} in taxes.`,
          steps: [
            "Check with your employer or HSA provider (HealthEquity, Fidelity, Optum)",
            `Contribute up to $${additional.toLocaleString()} more this year`,
            "You need a high-deductible health plan (HDHP) to contribute",
            "Money rolls over year to year — you never lose it",
          ],
        });
      }
    }
  }

  // ============================================
  // 3. FILING STATUS OPTIMIZATION
  // ============================================
  if (
    filingStatus === "single" &&
    (v(profile.childrenUnder17) > 0 || v(profile.otherDependents) > 0)
  ) {
    const hohCalc = calculateTax(profile, "head_of_household");
    const savings = calc.taxAfterCredits - hohCalc.taxAfterCredits;
    if (savings > 0) {
      opportunities.push({
        id: "filing_status",
        category: "filing",
        icon: "\uD83D\uDCCB",
        title: "Switch to Head of Household",
        description: `You're filing as Single, but if you pay more than half the cost of keeping up a home for a qualifying dependent, you may qualify for Head of Household. This gives you a higher standard deduction ($${TAX_DATA.standardDeduction.head_of_household.toLocaleString()} vs $${TAX_DATA.standardDeduction.single.toLocaleString()}) and wider tax brackets. This is one of the most commonly missed filing optimizations.`,
        actionAmount: 0,
        actionLabel: "file as Head of Household",
        annualSavings: savings,
        monthlyImpact: Math.round(savings / 12),
        confidence: "exact",
        priority: 10,
        whatIf: `Filing as Head of Household instead of Single would save you $${savings.toLocaleString()}.`,
        steps: [
          "When filing your return, select \"Head of Household\" as your filing status",
          "You must pay more than half the cost of keeping up your home",
          "You must have a qualifying dependent (child, parent, or other relative)",
          "This costs you nothing — it's just a different checkbox on your return",
        ],
        caveat: "You must meet specific IRS requirements: pay >50% of household costs and have a qualifying person living with you for more than half the year.",
      });
    }
  }

  // ============================================
  // 4. EITC CHECK
  // ============================================
  const numChildren = v(profile.childrenUnder17);
  const eitcLimits = c.eitc;
  const eitcBracket =
    numChildren >= 3
      ? eitcLimits.threeOrMore
      : numChildren === 2
        ? eitcLimits.twoChildren
        : numChildren === 1
          ? eitcLimits.oneChild
          : eitcLimits.noChildren;
  const eitcAgiLimit =
    filingStatus === "married_jointly"
      ? eitcBracket.agiJoint
      : eitcBracket.agiSingle;
  const hasEarnedIncome = calc.w2Wages > 0 || calc.selfEmploymentNet > 0;
  const investmentIncomeForEitc =
    v(profile.investmentIncomeLTCG) +
    v(profile.investmentIncomeSTCG) +
    v(profile.dividendIncome) +
    v(profile.interestIncome);

  if (
    hasEarnedIncome &&
    calc.agi <= eitcAgiLimit &&
    investmentIncomeForEitc <= eitcLimits.investmentIncomeLimit
  ) {
    opportunities.push({
      id: "eitc",
      category: "credits",
      icon: "\uD83D\uDCB0",
      title: "Earned Income Tax Credit (EITC)",
      description: `The EITC is a refundable credit — meaning you get cash back even if you owe $0 in taxes. About 1 in 5 eligible taxpayers miss this credit. Based on your income and ${numChildren > 0 ? `${numChildren} ${numChildren === 1 ? "child" : "children"}` : "filing status"}, you may qualify for up to $${eitcBracket.max.toLocaleString()}.`,
      actionAmount: 0,
      actionLabel: "claim the EITC when filing",
      annualSavings: eitcBracket.max,
      monthlyImpact: Math.round(eitcBracket.max / 12),
      confidence: "estimate",
      priority: 9,
      whatIf: `You may qualify for up to $${eitcBracket.max.toLocaleString()} from the Earned Income Tax Credit.`,
      steps: [
        "Use the IRS EITC Assistant tool to check your exact eligibility",
        "Most tax software (TurboTax, FreeTaxUSA, etc.) checks this automatically",
        "You must have earned income (wages or self-employment)",
        "The credit phases in and out — the exact amount depends on your income",
      ],
      caveat: `This is the maximum amount. Your actual credit depends on your exact income level. The IRS EITC Assistant can give you a precise number.`,
    });
  }

  // ============================================
  // 5. EDUCATION CREDITS
  // ============================================
  if (s.has("student")) {
    opportunities.push({
      id: "education",
      category: "credits",
      icon: "\uD83C\uDF93",
      title: "Education Tax Credits",
      description: `If you're paying tuition, you may qualify for the American Opportunity Tax Credit (up to $${c.americanOpportunity.max.toLocaleString()}/year, $${c.americanOpportunity.refundable.toLocaleString()} refundable) for the first 4 years of college, or the Lifetime Learning Credit (up to $${c.lifetimeLearning.max.toLocaleString()}/year) for any higher education. These directly reduce your tax bill.`,
      actionAmount: 0,
      actionLabel: "claim education credits when filing",
      annualSavings: c.americanOpportunity.max,
      monthlyImpact: Math.round(c.americanOpportunity.max / 12),
      confidence: "estimate",
      priority: 7,
      whatIf: `Education credits could save you up to $${c.americanOpportunity.max.toLocaleString()} if you're paying tuition.`,
      steps: [
        "Get Form 1098-T from your school (shows tuition paid)",
        "The American Opportunity Credit covers tuition + required books/supplies",
        "You can claim it for the first 4 years of a degree",
        "If you've already used 4 years of AOTC, the Lifetime Learning Credit still applies",
      ],
      caveat: "These credits phase out at higher incomes. You cannot claim both for the same student in the same year.",
    });
  }

  // ============================================
  // 6. CHILDCARE CREDIT
  // ============================================
  if (s.has("childcare") && numChildren > 0) {
    const maxExpenses = numChildren >= 2 ? c.childCare.maxExpenses2 : c.childCare.maxExpenses1;
    // Rate ranges from 35% to 20% depending on AGI
    const rate = calc.agi <= 15000 ? 0.35 : Math.max(0.20, 0.35 - Math.floor((calc.agi - 15000) / 2000) * 0.01);
    const maxCredit = Math.round(maxExpenses * rate);

    opportunities.push({
      id: "childcare",
      category: "credits",
      icon: "\uD83E\uDDD2",
      title: "Child and Dependent Care Credit",
      description: `If you pay for childcare so you can work, you can claim a credit of ${(rate * 100).toFixed(0)}% of up to $${maxExpenses.toLocaleString()} in care expenses. That's a credit of up to $${maxCredit.toLocaleString()} — directly off your tax bill, not just a deduction.`,
      actionAmount: 0,
      actionLabel: "claim the childcare credit when filing",
      annualSavings: maxCredit,
      monthlyImpact: Math.round(maxCredit / 12),
      confidence: "estimate",
      priority: 6,
      whatIf: `The childcare credit could save you up to $${maxCredit.toLocaleString()} if you're paying for daycare or after-school care.`,
      steps: [
        "Get your childcare provider's name, address, and tax ID number",
        "Track total childcare expenses for the year",
        "Both parents must have earned income (or be students)",
        "Enter the information when your tax software asks about dependent care",
      ],
    });
  }

  // ============================================
  // 7. SAVER'S CREDIT
  // ============================================
  const saversAgiLimit =
    filingStatus === "married_jointly"
      ? c.saversCredit.agiJoint
      : c.saversCredit.agiSingle;
  const totalRetirementContribs = v(profile.contribution401k) + v(profile.contributionIRA);

  if (calc.agi <= saversAgiLimit && totalRetirementContribs > 0) {
    // Rate depends on AGI: 50%, 20%, or 10%
    let saversRate: number;
    if (filingStatus === "married_jointly") {
      saversRate = calc.agi <= 46000 ? 0.50 : calc.agi <= 50000 ? 0.20 : 0.10;
    } else {
      saversRate = calc.agi <= 23000 ? 0.50 : calc.agi <= 25000 ? 0.20 : 0.10;
    }
    const eligibleContribs = Math.min(totalRetirementContribs, c.saversCredit.maxContribution);
    const credit = Math.round(eligibleContribs * saversRate);

    if (credit > 0) {
      opportunities.push({
        id: "savers_credit",
        category: "credits",
        icon: "\uD83C\uDFF7\uFE0F",
        title: "Saver's Credit",
        description: `Because your income is under $${saversAgiLimit.toLocaleString()} and you contribute to a retirement account, you may qualify for the Saver's Credit. This is a bonus credit on TOP of the tax deduction you already get for retirement contributions. It's a ${(saversRate * 100).toFixed(0)}% credit on up to $${c.saversCredit.maxContribution.toLocaleString()} in contributions.`,
        actionAmount: 0,
        actionLabel: "claim the Saver's Credit when filing",
        annualSavings: credit,
        monthlyImpact: Math.round(credit / 12),
        confidence: "estimate",
        priority: 7,
        whatIf: `The Saver's Credit could save you an additional $${credit.toLocaleString()} on top of your retirement deduction.`,
        steps: [
          "This credit is claimed automatically when you report retirement contributions",
          "Make sure your tax software asks about the Saver's Credit (Form 8880)",
          "The credit is non-refundable — it can reduce your tax to $0 but won't generate a refund",
        ],
        caveat: "Must be 18+, not a full-time student, and not claimed as a dependent on someone else's return.",
      });
    }
  }

  // ============================================
  // 8. W-4 PAYCHECK OPTIMIZATION
  // ============================================
  if (calc.totalWithholding > 0 && calc.estimatedRefundOrOwed > 1200) {
    const monthlyExtra = Math.round(calc.estimatedRefundOrOwed / 12);
    opportunities.push({
      id: "w4_adjustment",
      category: "paycheck",
      icon: "\uD83D\uDCB5",
      title: "Get More Money Each Paycheck",
      description: `You're getting a $${calc.estimatedRefundOrOwed.toLocaleString()} refund, which means your employer is sending $${monthlyExtra.toLocaleString()}/month more to the IRS than necessary. That's YOUR money sitting in a government account earning 0% interest. By updating your W-4, you can put that money back in your pocket every payday instead of waiting for a lump sum next spring.`,
      actionAmount: 0,
      actionLabel: "update your W-4 with your employer",
      annualSavings: calc.estimatedRefundOrOwed,
      monthlyImpact: monthlyExtra,
      confidence: "exact",
      priority: 5,
      whatIf: `Adjusting your W-4 would put an extra $${monthlyExtra.toLocaleString()}/month in your paycheck.`,
      steps: [
        "Use the IRS Withholding Estimator at irs.gov/W4App",
        "Print the recommended W-4 or note the settings",
        "Give the updated W-4 to your employer's HR or payroll department",
        "Changes usually take effect within 1-2 pay periods",
      ],
      caveat: "This doesn't change your total tax — it changes WHEN you get the money. Some people prefer the forced savings of a big refund.",
    });
  }

  // ============================================
  // 9. TAX-LOSS HARVESTING
  // ============================================
  const totalGains =
    v(profile.investmentIncomeLTCG) + v(profile.investmentIncomeSTCG);
  if (totalGains > 0 && s.has("investor")) {
    const harvestAmount = Math.min(totalGains, 3000);
    const mod = cloneProfile(profile);
    // Offset short-term gains first (taxed at higher ordinary rates)
    const stcgReduction = Math.min(v(profile.investmentIncomeSTCG), harvestAmount);
    mod.investmentIncomeSTCG = v(profile.investmentIncomeSTCG) - stcgReduction;
    const ltcgReduction = harvestAmount - stcgReduction;
    if (ltcgReduction > 0) {
      mod.investmentIncomeLTCG = v(profile.investmentIncomeLTCG) - ltcgReduction;
    }
    const savings = diffTax(calc, mod, filingStatus);
    if (savings > 0) {
      opportunities.push({
        id: "tax_loss_harvest",
        category: "deductions",
        icon: "\uD83D\uDCC9",
        title: "Tax-Loss Harvesting",
        description: `If you have investments that are currently worth less than you paid, you can sell them to "harvest" the loss. These losses offset your $${totalGains.toLocaleString()} in gains, reducing your tax bill. You can also deduct up to $3,000 in net losses against your ordinary income each year, and carry forward any excess to future years.`,
        actionAmount: harvestAmount,
        actionLabel: "in investment losses to offset your gains",
        annualSavings: savings,
        monthlyImpact: Math.round(savings / 12),
        confidence: "estimate",
        priority: 6,
        whatIf: `Harvesting $${harvestAmount.toLocaleString()} in losses would save you $${savings.toLocaleString()} in taxes.`,
        steps: [
          "Review your portfolio for positions currently at a loss",
          "Sell the losing positions before December 31",
          "Wait at least 31 days before buying the same security back (wash sale rule)",
          "You can immediately buy a similar (but not identical) investment to stay invested",
        ],
        caveat: "You must have actual unrealized losses in your portfolio. The wash sale rule prevents you from buying back the same investment within 30 days.",
      });
    }
  }

  // ============================================
  // 10. ITEMIZED DEDUCTION GAP + BUNCHING
  // ============================================
  if (!calc.useItemized && calc.itemizedTotal > 0) {
    const gap = calc.standardDeduction - calc.itemizedTotal;
    const gapPercent = calc.itemizedTotal / calc.standardDeduction;

    // Only show if they're within striking distance (>40% of standard deduction)
    if (gapPercent > 0.4) {
      const charitableAmount = v(profile.charitableDonations);

      if (charitableAmount > 0 && gap < charitableAmount * 2) {
        // Bunching strategy: donate 2 years of gifts in one year
        const bunchedAmount = charitableAmount * 2;
        const bunchedItemized = calc.itemizedTotal + charitableAmount; // double the charitable
        if (bunchedItemized > calc.standardDeduction) {
          const mod = cloneProfile(profile);
          mod.charitableDonations = bunchedAmount;
          const bunchedCalc = calculateTax(mod, filingStatus);
          const bunchedSavings = calc.taxAfterCredits - bunchedCalc.taxAfterCredits;
          // Annualize: you do this every other year
          if (bunchedSavings > 0) {
            opportunities.push({
              id: "bunching",
              category: "deductions",
              icon: "\uD83D\uDCE6",
              title: "Bunch Your Charitable Donations",
              description: `You're $${gap.toLocaleString()} short of itemizing. But here's a trick: instead of donating $${charitableAmount.toLocaleString()} every year, donate two years' worth ($${bunchedAmount.toLocaleString()}) in one year. This pushes you over the standard deduction threshold, and you itemize that year. The next year, you take the standard deduction. Over 2 years, you come out ahead.`,
              actionAmount: charitableAmount,
              actionLabel: "in extra charitable donations this year",
              annualSavings: Math.round(bunchedSavings / 2),
              monthlyImpact: Math.round(bunchedSavings / 24),
              confidence: "exact",
              priority: gap < 2000 ? 7 : 4,
              whatIf: `Bunching 2 years of donations into this year would save you ~$${Math.round(bunchedSavings / 2).toLocaleString()}/year on average.`,
              steps: [
                "Make your normal charitable donations PLUS next year's planned donations before Dec 31",
                "Consider using a Donor-Advised Fund (DAF) to bunch the tax deduction while spreading actual gifts over time",
                "Next year, take the standard deduction and make no charitable donations (or donate from your DAF)",
                "Repeat this every-other-year pattern",
              ],
            });
          }
        }
      } else {
        opportunities.push({
          id: "itemize_gap",
          category: "deductions",
          icon: "\u2702\uFE0F",
          title: "You're Close to Itemizing",
          description: `Your itemized deductions total $${Math.round(calc.itemizedTotal).toLocaleString()}, which is $${gap.toLocaleString()} less than the standard deduction ($${calc.standardDeduction.toLocaleString()}). If you can increase your deductible expenses by $${gap.toLocaleString()}, you'd switch to itemizing and save on every additional dollar.`,
          actionAmount: gap,
          actionLabel: "in additional deductible expenses to start itemizing",
          annualSavings: Math.round(gap * calc.marginalRate * 0.3),
          monthlyImpact: Math.round((gap * calc.marginalRate * 0.3) / 12),
          confidence: "estimate",
          priority: gap < 3000 ? 6 : 3,
          whatIf: `Increasing deductible expenses by $${gap.toLocaleString()} would let you itemize and potentially save more.`,
          steps: [
            "Look for deductible expenses you may have missed: state/local taxes, medical expenses, charitable donations",
            "Consider prepaying next year's property taxes or making extra charitable donations before Dec 31",
            "Keep detailed records of all potentially deductible expenses",
          ],
        });
      }
    }
  }

  // ============================================
  // 11. QUARTERLY ESTIMATED TAXES (avoid penalty)
  // ============================================
  if (
    (s.has("self_employed") || s.has("side_hustle")) &&
    calc.selfEmploymentTax > 0 &&
    calc.totalWithholding === 0
  ) {
    const quarterlyAmount = Math.round(calc.taxAfterCredits / 4);
    opportunities.push({
      id: "quarterly",
      category: "filing",
      icon: "\uD83D\uDCC5",
      title: "Set Up Quarterly Estimated Taxes",
      description: `As a self-employed person with no employer withholding, the IRS expects you to pay taxes four times a year. If you owe more than $1,000 at filing time and haven't made quarterly payments, you'll face an underpayment penalty on top of what you owe. Setting up quarterly payments avoids this.`,
      actionAmount: quarterlyAmount,
      actionLabel: "per quarter to the IRS",
      annualSavings: 0,
      monthlyImpact: 0,
      confidence: "exact",
      priority: 8,
      whatIf: `Paying $${quarterlyAmount.toLocaleString()} per quarter avoids underpayment penalties and spreads your tax bill over the year.`,
      steps: [
        "Go to irs.gov/payments and set up quarterly payments",
        `Pay approximately $${quarterlyAmount.toLocaleString()} each quarter`,
        "Due dates: April 15, June 15, September 15, January 15",
        "You can also set up automatic payments through EFTPS.gov",
      ],
      caveat: "This doesn't reduce your taxes — it avoids penalties and makes tax time less painful by spreading payments across the year.",
    });
  }

  // Sort by priority (descending), then by savings (descending)
  opportunities.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.annualSavings - a.annualSavings;
  });

  // Calculate combined total by running a fully optimized profile
  const optimized = cloneProfile(profile);
  if (opportunities.find((o) => o.id === "ira")) {
    optimized.contributionIRA = d.iraMax;
  }
  if (opportunities.find((o) => o.id === "hsa")) {
    const hsaMax = filingStatus === "married_jointly" ? d.hsaFamily : d.hsaSelf;
    optimized.contributionHSA = hsaMax;
  }
  const optimizedFs = opportunities.find((o) => o.id === "filing_status")
    ? "head_of_household"
    : filingStatus;
  const optimizedCalc = calculateTax(optimized, optimizedFs);
  const totalPotentialSavings = Math.max(
    0,
    calc.taxAfterCredits - optimizedCalc.taxAfterCredits
  );

  return {
    opportunities,
    totalPotentialSavings:
      totalPotentialSavings > 0
        ? totalPotentialSavings
        : opportunities.reduce((sum, o) => sum + o.annualSavings, 0),
  };
}
