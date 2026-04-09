import { TAX_DATA, fmt, fmtD, pct } from "./tax-data";
import type { KnowledgeLevel, FilingStatus, LifeSituation, Topic, Section } from "./types";

export const KNOWLEDGE_LEVELS: KnowledgeLevel[] = [
  { id: "expert", label: "I normally do my taxes myself", emoji: "\uD83E\uDDEE", desc: "Comfortable with forms, deductions, and filing." },
  { id: "informed", label: "I use a CPA/service and understand the process", emoji: "\uD83E\uDD1D", desc: "Someone else files, but you follow along." },
  { id: "passive", label: "I use a CPA/service but don't understand it", emoji: "\uD83E\uDD37", desc: "You hand over documents and hope for the best." },
  { id: "beginner", label: "I know almost nothing about taxes", emoji: "\uD83C\uDF31", desc: "Taxes feel like a foreign language." },
];

export const FILING_STATUSES: FilingStatus[] = [
  { id: "single", label: "Single", desc: "Unmarried or legally separated on Dec 31" },
  { id: "married_jointly", label: "Married Filing Jointly", desc: "Married, combining income on one return" },
  { id: "married_separately", label: "Married Filing Separately", desc: "Married but filing individual returns" },
  { id: "head_of_household", label: "Head of Household", desc: "Unmarried, pay >50% home costs for qualifying dependent" },
  { id: "widow", label: "Qualifying Surviving Spouse", desc: "Spouse died in 2023/2024, have dependent child" },
];

export const LIFE_SITUATIONS: LifeSituation[] = [
  { id: "employed_w2", label: "W-2 Employee", emoji: "\uD83D\uDCBC", cat: "income" },
  { id: "self_employed", label: "Self-Employed / 1099", emoji: "\uD83C\uDFD7\uFE0F", cat: "income" },
  { id: "side_hustle", label: "Side Hustle / Gig Work", emoji: "\uD83D\uDE97", cat: "income" },
  { id: "unemployed", label: "Received Unemployment", emoji: "\uD83D\uDCCB", cat: "income" },
  { id: "tip_income", label: "Tip Income", emoji: "\uD83D\uDCB5", cat: "income" },
  { id: "investor", label: "Stocks / Crypto / Investments", emoji: "\uD83D\uDCC8", cat: "income" },
  { id: "rental_income", label: "Rental Property Income", emoji: "\uD83D\uDD11", cat: "income" },
  { id: "retirement_income", label: "Social Security / Pension", emoji: "\uD83C\uDFD6\uFE0F", cat: "income" },
  { id: "alimony", label: "Paying or Receiving Alimony", emoji: "\u2696\uFE0F", cat: "income" },
  { id: "foreign_income", label: "Earned Income Abroad", emoji: "\uD83C\uDF0D", cat: "income" },
  { id: "gambling", label: "Gambling Winnings", emoji: "\uD83C\uDFB0", cat: "income" },
  { id: "homeowner", label: "Homeowner (with mortgage)", emoji: "\uD83C\uDFE0", cat: "life" },
  { id: "sold_home", label: "Sold a Home This Year", emoji: "\uD83C\uDFE1", cat: "life" },
  { id: "parent", label: "Parent / Child Under 17", emoji: "\uD83D\uDC76", cat: "life" },
  { id: "older_dependent", label: "Supporting Other Dependents", emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", cat: "life" },
  { id: "married_event", label: "Got Married This Year", emoji: "\uD83D\uDC8D", cat: "life" },
  { id: "divorced", label: "Got Divorced This Year", emoji: "\uD83D\uDCDD", cat: "life" },
  { id: "student", label: "Student / Paying Tuition", emoji: "\uD83C\uDF93", cat: "life" },
  { id: "student_loans", label: "Paying Student Loans", emoji: "\uD83C\uDF92", cat: "life" },
  { id: "moved_states", label: "Moved to a Different State", emoji: "\uD83D\uDE9A", cat: "life" },
  { id: "charity", label: "Charitable Donations", emoji: "\u2764\uFE0F", cat: "deductions" },
  { id: "medical", label: "Large Medical/Dental Expenses", emoji: "\uD83C\uDFE5", cat: "deductions" },
  { id: "hsa", label: "HSA / FSA Accounts", emoji: "\uD83D\uDC8A", cat: "deductions" },
  { id: "retirement_contrib", label: "Contributing to 401k/IRA", emoji: "\uD83C\uDFE6", cat: "deductions" },
  { id: "ev_purchase", label: "Bought Electric Vehicle", emoji: "\uD83D\uDD0B", cat: "deductions" },
  { id: "childcare", label: "Paid for Childcare", emoji: "\uD83E\uDDD2", cat: "deductions" },
  { id: "home_office", label: "Home Office (Self-Employed)", emoji: "\uD83D\uDCBB", cat: "deductions" },
  { id: "energy_home", label: "Home Energy Improvements", emoji: "\u2600\uFE0F", cat: "deductions" },
];

type BracketKey = keyof typeof TAX_DATA.brackets;
type DeductionKey = keyof typeof TAX_DATA.standardDeduction;
type CapGainsKey = keyof typeof TAX_DATA.capitalGains;

export function buildTopics(level: string, fs: string, situations: string[]): Topic[] {
  const topics: Topic[] = [];
  const s = new Set(situations);
  const beg = level === "beginner" || level === "passive";
  const sd = TAX_DATA.standardDeduction[fs as DeductionKey] || TAX_DATA.standardDeduction.single;
  const brackets = TAX_DATA.brackets[fs as BracketKey] || TAX_DATA.brackets.single;
  const d = TAX_DATA.deductions;
  const c = TAX_DATA.credits;

  // Fundamentals (beginners only)
  if (beg) {
    topics.push({
      id: "fundamentals",
      icon: "\uD83D\uDCD6",
      title: "How Taxes Actually Work",
      sections: [
        {
          type: "info",
          title: "Key Concept",
          text: `Your taxable income is NOT your total pay. It's your income MINUS deductions. The standard deduction for ${fs.replace(/_/g, " ")} is ${fmtD(sd)} \u2014 that much of your income isn't taxed at all.`,
        },
        { type: "source", text: "Source: IRS Topic 551 \u2014 Standard Deduction (irs.gov)" },
      ],
      aiPrompt: `Explain federal income taxes to a complete beginner. What taxes are, why we file returns, refund vs owing, withholding, taxable income, and how brackets work progressively. Use analogies. Filing status: ${fs}. Standard deduction: ${fmtD(sd)}.`,
    });
  }

  // Filing requirements
  const threshRows: string[][] = [
    ["Single, under 65", fmtD(TAX_DATA.filingThresholds.single_under65)],
    ["Single, 65+", fmtD(TAX_DATA.filingThresholds.single_65plus)],
    ["Married Jointly, both under 65", fmtD(TAX_DATA.filingThresholds.married_jointly_both_under65)],
    ["Married Jointly, one 65+", fmtD(TAX_DATA.filingThresholds.married_jointly_one_65plus)],
    ["Married Separately", fmtD(TAX_DATA.filingThresholds.married_separately)],
    ["Head of Household, under 65", fmtD(TAX_DATA.filingThresholds.head_of_household_under65)],
    ["Head of Household, 65+", fmtD(TAX_DATA.filingThresholds.head_of_household_65plus)],
  ];
  const filingSections: Section[] = [
    { type: "table", title: "2025 Filing Thresholds (Gross Income)", rows: threshRows },
  ];
  if (s.has("self_employed") || s.has("side_hustle")) {
    filingSections.push({
      type: "warning",
      text: `Self-employment: Must file if net SE income \u2265 ${fmtD(TAX_DATA.filingThresholds.selfEmployment)}, even if total income is below thresholds above.`,
    });
  }
  filingSections.push({ type: "source", text: "Source: IRS Publication 501 (irs.gov/publications/p501)" });
  topics.push({
    id: "filing",
    icon: "\uD83D\uDCCB",
    title: "Filing Status & Requirements",
    sections: filingSections,
    aiPrompt: `Filing status: ${fs}. Situations: ${situations.join(", ")}. ${beg ? "Explain simply" : "Cover concisely"}: whether they must file, why filing status matters, and trade-offs (especially married joint vs separate). Level: ${level}.`,
  });

  // Income
  const docs: string[][] = [];
  if (s.has("employed_w2")) docs.push(["W-2", "Wages, salary, tips", "From employer by Jan 31"]);
  if (s.has("self_employed") || s.has("side_hustle")) docs.push(["1099-NEC", "Non-employee compensation ($600+)", "From clients by Jan 31"]);
  if (s.has("side_hustle")) docs.push(["1099-K", "Payment platform income ($5,000+)", "From platform by Jan 31"]);
  if (s.has("investor")) {
    docs.push(["1099-B", "Stock/crypto sales", "From broker by Feb 15"]);
    docs.push(["1099-DIV", "Dividends", "By Jan 31"]);
    docs.push(["1099-INT", "Interest ($10+)", "By Jan 31"]);
  }
  if (s.has("rental_income")) docs.push(["Schedule E", "Rental income/expenses", "You track"]);
  if (s.has("retirement_income")) {
    docs.push(["SSA-1099", "Social Security", "By Jan 31"]);
    docs.push(["1099-R", "Retirement distributions", "By Jan 31"]);
  }
  if (s.has("unemployed")) docs.push(["1099-G", "Unemployment", "From state by Jan 31"]);
  if (s.has("gambling")) docs.push(["W-2G", "Gambling winnings", "From operator"]);

  const incSections: Section[] = [];
  if (docs.length) {
    incSections.push({
      type: "table3",
      title: "Tax Documents You Should Receive",
      rows: docs,
      headers: ["Form", "Reports", "When"],
    });
  }
  incSections.push({
    type: "warning",
    text: "The IRS receives copies of ALL your tax documents. Unreported income will trigger notices.",
  });
  if (s.has("tip_income")) {
    incSections.push({
      type: "info",
      title: "Tips",
      text: "All tips are taxable including cash. Report $20+/month in tips to your employer.",
    });
  }
  incSections.push({ type: "source", text: "Source: IRS.gov \u2014 Understanding Your Tax Forms" });
  topics.push({
    id: "income",
    icon: "\uD83D\uDCB0",
    title: "Your Income \u2014 What the IRS Counts",
    sections: incSections,
    aiPrompt: `Situations: ${situations.join(", ")}. ${beg ? "Explain simply" : "Summarize"}: what counts as taxable income, which forms they'll get, and why the IRS already knows. Only cover relevant types.`,
  });

  // Brackets
  const bracketRows = brackets.map((b) => [
    `${fmt(b.min)} \u2013 ${b.max >= 1e15 ? "above" : fmt(b.max)}`,
    pct(b.rate),
  ]);
  topics.push({
    id: "brackets",
    icon: "\uD83D\uDCCA",
    title: "Tax Brackets \u2014 What You Actually Owe",
    sections: [
      {
        type: "table",
        title: `2025 Federal Brackets \u2014 ${fs.replace(/_/g, " ")}`,
        rows: bracketRows,
        headers: ["Taxable Income", "Rate"],
      },
      {
        type: "info",
        title: "Progressive System",
        text: `You DON'T pay ${pct(brackets[brackets.length - 1].rate)} on everything. Each bracket only applies to income in that range. At $55,000 single: 10% on first $11,600 + 12% on next $35,550 + 22% on remaining $7,850 = ~$6,768 total (effective rate ~12.3%).`,
      },
      { type: "source", text: "Source: IRS Revenue Procedure 2023-34" },
    ],
    aiPrompt: `Filing status: ${fs}. Walk through progressive brackets. ${beg ? 'Use $55,000 example, dispel "higher bracket = all income taxed higher" myth.' : "Show marginal vs effective rate."}`,
  });

  // Deductions
  const sdTable: string[][] = [
    ["Single", fmtD(TAX_DATA.standardDeduction.single)],
    ["Married Jointly", fmtD(TAX_DATA.standardDeduction.married_jointly)],
    ["Married Separately", fmtD(TAX_DATA.standardDeduction.married_separately)],
    ["Head of Household", fmtD(TAX_DATA.standardDeduction.head_of_household)],
    ["Additional if 65+ (single)", `+${fmtD(TAX_DATA.standardDeduction.additional_65_single)}`],
    ["Additional if 65+ (married/spouse)", `+${fmtD(TAX_DATA.standardDeduction.additional_65_married)}`],
  ];
  const dedSections: Section[] = [{ type: "table", title: "2025 Standard Deduction", rows: sdTable }];
  const itemized: string[][] = [];
  if (s.has("homeowner")) itemized.push(["Mortgage Interest", `On up to ${fmtD(d.mortgageDebtLimit)} of debt`]);
  itemized.push(["State & Local Taxes (SALT)", `Capped at ${fmtD(d.saltCap)}`]);
  if (s.has("medical")) itemized.push(["Medical Expenses", `Only amounts > ${pct(d.medicalAGIThreshold)} of AGI`]);
  if (s.has("charity")) itemized.push(["Charitable (cash)", `Up to ${pct(d.charitableCashAGILimit)} of AGI`]);
  if (itemized.length) {
    dedSections.push({ type: "table", title: "Itemized Deductions Relevant to You", rows: itemized });
    dedSections.push({
      type: "info",
      title: "Standard vs Itemized",
      text: `Choose whichever is HIGHER. Your standard deduction is ${fmtD(sd)}. Only itemize if your total itemized deductions exceed that.`,
    });
  }
  const aboveLine: string[][] = [];
  if (s.has("student_loans")) aboveLine.push(["Student Loan Interest", `Up to ${fmtD(d.studentLoanMax)}`]);
  if (s.has("hsa")) {
    aboveLine.push(["HSA (self-only)", fmtD(d.hsaSelf)]);
    aboveLine.push(["HSA (family)", fmtD(d.hsaFamily)]);
    aboveLine.push(["FSA", `${fmtD(d.fsaLimit)} limit`]);
  }
  if (s.has("retirement_contrib")) {
    aboveLine.push(["401(k)", `${fmtD(d.k401Limit)} (+${fmtD(d.k401CatchUp50)} if 50+)`]);
    aboveLine.push(["Traditional IRA", `${fmtD(d.iraMax)} (+${fmtD(d.iraCatchUp50)} if 50+)`]);
  }
  if (s.has("self_employed") || s.has("side_hustle")) {
    aboveLine.push(["\u00BD Self-Employment Tax", "Deducted from gross income"]);
    aboveLine.push(["SE Health Insurance", "100% of premiums"]);
  }
  if (aboveLine.length) {
    dedSections.push({
      type: "table",
      title: "Above-the-Line Deductions (you get these WITH the standard deduction)",
      rows: aboveLine,
    });
  }
  dedSections.push({ type: "source", text: "Source: IRS Rev. Proc. 2023-34, IRS Publication 501" });
  topics.push({
    id: "deductions",
    icon: "\u2702\uFE0F",
    title: "Deductions \u2014 Reducing What You Owe",
    sections: dedSections,
    aiPrompt: `Filing status: ${fs}. Situations: ${situations.join(", ")}. ${beg ? "Explain what a deduction IS, then" : ""} cover standard vs itemized and which deductions apply to them. SALT cap $10K. Be practical about record-keeping.`,
  });

  // Credits
  const credRows: string[][] = [];
  if (s.has("parent")) {
    credRows.push(["Child Tax Credit", `${fmtD(c.childTaxCredit.max)}/child under ${c.childTaxCredit.ageLimit}`, `${fmtD(c.childTaxCredit.refundable)} refundable`]);
  }
  credRows.push(["EITC (no children)", `Up to ${fmtD(c.eitc.noChildren.max)}`, "Refundable"]);
  if (s.has("parent")) {
    credRows.push(["EITC (1 child)", `Up to ${fmtD(c.eitc.oneChild.max)}`, "Refundable"]);
    credRows.push(["EITC (2 children)", `Up to ${fmtD(c.eitc.twoChildren.max)}`, "Refundable"]);
    credRows.push(["EITC (3+ children)", `Up to ${fmtD(c.eitc.threeOrMore.max)}`, "Refundable"]);
  }
  if (s.has("student")) {
    credRows.push(["American Opportunity", `Up to ${fmtD(c.americanOpportunity.max)}/yr`, `${fmtD(c.americanOpportunity.refundable)} refundable`]);
    credRows.push(["Lifetime Learning", `Up to ${fmtD(c.lifetimeLearning.max)}`, "Non-refundable"]);
  }
  if (s.has("childcare")) credRows.push(["Child & Dependent Care", `${c.childCare.maxPercent}% of up to ${fmtD(c.childCare.maxExpenses2)}`, "Non-refundable"]);
  if (s.has("ev_purchase")) {
    credRows.push(["EV Credit (new)", `Up to ${fmtD(c.evCredit.maxNew)}`, "Non-refundable"]);
    credRows.push(["EV Credit (used)", `Up to ${fmtD(c.evCredit.maxUsed)}`, "Non-refundable"]);
  }
  if (s.has("retirement_contrib")) credRows.push(["Saver's Credit", `Up to ${fmtD(c.saversCredit.maxContribution)}`, "Non-refundable"]);
  if (s.has("older_dependent")) credRows.push(["Other Dependents", `${fmtD(c.otherDependents.max)}/dependent`, "Non-refundable"]);
  topics.push({
    id: "credits",
    icon: "\uD83C\uDF81",
    title: "Tax Credits \u2014 Direct Money Back",
    sections: [
      { type: "table3", title: "Credits You May Qualify For", rows: credRows, headers: ["Credit", "Amount", "Type"] },
      {
        type: "info",
        title: "Credit vs Deduction",
        text: "A $1,000 CREDIT saves $1,000. A $1,000 DEDUCTION saves $1,000 \u00D7 your rate (e.g. $220 at 22%). Credits are far more valuable.",
      },
      {
        type: "info",
        title: "Refundable = Cash Back",
        text: "Refundable credits pay you even if you owe $0. Non-refundable can only reduce your bill to $0.",
      },
      {
        type: "warning",
        text: "~20% of eligible taxpayers don't claim the EITC. Even workers without children may qualify. Don't leave money on the table.",
      },
      { type: "source", text: "Source: IRS.gov \u2014 Credits & Deductions, IRS EITC Tables" },
    ],
    aiPrompt: `Situations: ${situations.join(", ")}. ${beg ? "Explain credit vs deduction with dollar example. Explain refundable vs non-refundable. Then" : ""} cover each credit relevant to them with eligibility details and income limits.`,
  });

  // Self-employment
  if (s.has("self_employed") || s.has("side_hustle") || s.has("home_office")) {
    const se = TAX_DATA.selfEmployment;
    const est = TAX_DATA.estimatedTax;
    topics.push({
      id: "self_employment",
      icon: "\uD83C\uDFD7\uFE0F",
      title: "Self-Employment & Freelance Taxes",
      sections: [
        {
          type: "table",
          title: "Self-Employment Tax (2025)",
          rows: [
            ["Social Security", `${pct(se.ssTaxRate)} on first ${fmtD(se.ssWageBase)}`],
            ["Medicare", `${pct(se.medicareTaxRate)} on all net earnings`],
            ["Total SE Tax", pct(se.totalSERate)],
            ["Additional Medicare", `+${pct(se.additionalMedicareRate)} above ${fmtD(se.additionalMedicareThresholdSingle)} (single)`],
          ],
        },
        {
          type: "warning",
          text: "W-2 employees split FICA 50/50 with employer. Self-employed pay BOTH halves = 15.3% on top of income tax.",
        },
        {
          type: "table",
          title: "Quarterly Estimated Tax Due Dates",
          rows: est.quarterlyDates.map((q) => [q.q, q.period, q.due]),
        },
        {
          type: "info",
          title: "Safe Harbor",
          text: `Pay \u226590% of this year's tax OR 100% of last year's (110% if AGI > ${fmtD(est.safeHarborHighIncome)}) to avoid penalties.`,
        },
        {
          type: "table",
          title: "Key SE Deductions",
          rows: [
            ["QBI Deduction", `${pct(se.qbiDeductionRate)} of qualified income`],
            ["Home Office (simplified)", `$${d.homeOfficeSafe}/sqft, max ${fmtD(d.homeOfficeMax)}`],
            ["Business Mileage", `$${d.mileageRate}/mile`],
            ["Health Insurance", "100% of premiums deductible"],
            ["\u00BD SE Tax", "Above-the-line deduction"],
          ],
        },
        { type: "source", text: "Source: IRS Self-Employed Tax Center (irs.gov), IRS Form 1040-ES" },
      ],
      aiPrompt: `User is self-employed. ${beg ? "Explain simply" : "Cover"}: SE tax, quarterly payments, Schedule C, business deductions (home office, mileage, meals 50%, equipment, software), QBI deduction. Records to keep. Common mistakes.`,
    });
  }

  // Investments
  if (s.has("investor") || s.has("gambling")) {
    const cg = TAX_DATA.capitalGains[fs as CapGainsKey] || TAX_DATA.capitalGains.single;
    topics.push({
      id: "investments",
      icon: "\uD83D\uDCC8",
      title: "Investment & Capital Gains Taxes",
      sections: [
        {
          type: "table",
          title: `Long-Term Capital Gains Rates (${fs.replace(/_/g, " ")})`,
          rows: cg.map((b) => [`${fmt(b.min)} \u2013 ${b.max >= 1e15 ? "above" : fmt(b.max)}`, pct(b.rate)]),
          headers: ["Taxable Income", "Rate"],
        },
        {
          type: "info",
          title: "Short vs Long Term",
          text: "Held \u22641 year = short-term = taxed at your ordinary rate. Held >1 year = long-term = lower rates above. This difference can save thousands.",
        },
        {
          type: "warning",
          text: "Crypto is taxed as property. Every sale, swap, or purchase is taxable. The IRS asks about crypto on page 1 of Form 1040.",
        },
        ...(s.has("gambling")
          ? [{ type: "info" as const, title: "Gambling", text: "Winnings are taxable income. Losses only deductible up to winnings, and only if you itemize." }]
          : []),
        { type: "source", text: "Source: IRS Topic 409 \u2014 Capital Gains, IRS Rev. Proc. 2023-34" },
      ],
      aiPrompt: `User has investments. ${beg ? "Explain simply" : "Cover"}: capital gains, short vs long term, 0/15/20% rates, tax-loss harvesting, wash sale rule, crypto, dividends. ${s.has("gambling") ? "And gambling tax rules." : ""}`,
    });
  }

  // Retirement
  if (s.has("retirement_contrib") || s.has("retirement_income")) {
    topics.push({
      id: "retirement",
      icon: "\uD83C\uDFE6",
      title: "Retirement Accounts & Taxes",
      sections: [
        {
          type: "table",
          title: "2025 Contribution Limits",
          rows: [
            ["401(k)/403(b)", `${fmtD(d.k401Limit)} (+${fmtD(d.k401CatchUp50)} if 50+)`],
            ["Traditional/Roth IRA", `${fmtD(d.iraMax)} (+${fmtD(d.iraCatchUp50)} if 50+)`],
            ["HSA (self)", fmtD(d.hsaSelf)],
            ["HSA (family)", fmtD(d.hsaFamily)],
          ],
        },
        {
          type: "info",
          title: "Traditional vs Roth",
          text: "Traditional: deduct now, pay tax in retirement. Roth: no deduction now, withdraw tax-FREE later. If you expect higher income later, Roth may save more.",
        },
        ...(s.has("retirement_income")
          ? [{ type: "warning" as const, text: "Up to 85% of Social Security may be taxable if combined income > $34,000 (single) or $44,000 (joint)." }]
          : []),
        { type: "source", text: "Source: IRS Rev. Proc. 2023-34, IRS Publication 590-A" },
      ],
      aiPrompt: `Situations: ${situations.join(", ")}. ${beg ? "Explain simply" : "Cover"}: Traditional vs Roth, contribution limits, employer matches, ${s.has("retirement_income") ? "RMDs, SS taxation, early withdrawal penalties" : "tax savings of contributing now"}.`,
    });
  }

  // Homeowner
  if (s.has("homeowner") || s.has("sold_home")) {
    topics.push({
      id: "homeowner",
      icon: "\uD83C\uDFE0",
      title: "Homeowner Tax Benefits",
      sections: [
        {
          type: "table",
          title: "Homeowner Deductions",
          rows: [
            ["Mortgage Interest", `On up to ${fmtD(d.mortgageDebtLimit)} of debt`],
            ["Property Taxes", `Deductible (within ${fmtD(d.saltCap)} SALT cap)`],
          ],
        },
        ...(s.has("sold_home")
          ? [{ type: "info" as const, title: "Home Sale Exclusion", text: "Exclude up to $250K (single) or $500K (joint) of gain if you owned & lived there 2 of last 5 years." }]
          : []),
        { type: "source", text: "Source: IRS Publication 936, IRS Topic 701" },
      ],
      aiPrompt: `User is a homeowner${s.has("sold_home") ? " who sold a home" : ""}. Cover mortgage interest deduction, property taxes, SALT cap, ${s.has("sold_home") ? "home sale exclusion rules and how to calculate gain" : ""}. ${s.has("energy_home") ? "Also energy credits." : ""}`,
    });
  }

  // Mistakes
  const warnings: Section[] = [
    {
      type: "warning",
      text: "Not filing when required: Failure-to-file penalty is 5%/month (up to 25%). Failure-to-pay is only 0.5%/month. ALWAYS file, even if you can't pay.",
    },
  ];
  if (s.has("self_employed") || s.has("side_hustle")) {
    warnings.push({
      type: "warning",
      text: "Not paying quarterly estimated taxes: Owe $1,000+ at filing? You'll face underpayment penalty even if you pay in full.",
    });
  }
  if (s.has("parent")) {
    warnings.push({
      type: "warning",
      text: "Wrong filing status: Many single parents file 'Single' when 'Head of Household' gives a $21,900 standard deduction vs $14,600 and better brackets.",
    });
  }
  warnings.push({
    type: "warning",
    text: "Missing the EITC: ~20% of eligible taxpayers don't claim it. Even childless workers may get up to $632 back.",
  });
  if (s.has("investor")) {
    warnings.push({
      type: "warning",
      text: "Not reporting ALL sales: IRS gets 1099-Bs from brokers. Even small crypto swaps must be reported. Losses offset gains + $3,000 of ordinary income.",
    });
  }
  if (s.has("moved_states")) {
    warnings.push({
      type: "warning",
      text: "Multi-state filing: You likely need returns in BOTH states as a part-year resident.",
    });
  }
  warnings.push({ type: "source", text: "Source: IRS.gov \u2014 Common Filing Mistakes" });
  topics.push({
    id: "mistakes",
    icon: "\u26A0\uFE0F",
    title: "Costly Mistakes & Red Flags",
    sections: warnings,
    aiPrompt: `Situations: ${situations.join(", ")}. Cover the most common/costly mistakes for their situation. Be specific. Level: ${level}.`,
  });

  // Action plan
  const docsList: string[] = ["Photo ID", "SSN cards", `${TAX_DATA.year - 1} tax return`];
  if (s.has("employed_w2")) docsList.push("W-2(s)");
  if (s.has("self_employed") || s.has("side_hustle")) docsList.push("1099-NEC/K forms", "Business expense records", "Mileage log");
  if (s.has("investor")) docsList.push("1099-B, 1099-DIV, 1099-INT");
  if (s.has("homeowner")) docsList.push("Form 1098 (mortgage interest)", "Property tax statements");
  if (s.has("student") || s.has("student_loans")) docsList.push("1098-T (tuition)", "1098-E (loan interest)");
  if (s.has("childcare")) docsList.push("Childcare provider info & amounts");
  if (s.has("medical")) docsList.push("Medical expense records");
  if (s.has("charity")) docsList.push("Donation receipts (written for $250+)");
  if (s.has("retirement_income")) docsList.push("SSA-1099, 1099-R");

  const deadlines: string[][] = [
    ["Filing Deadline", TAX_DATA.filingDeadline],
    ["Extension Deadline", TAX_DATA.extensionDeadline],
    ["\u26A0\uFE0F Extension Note", "Extensions give time to FILE, not to PAY"],
  ];
  if (s.has("self_employed") || s.has("side_hustle")) {
    TAX_DATA.estimatedTax.quarterlyDates.forEach((q) => deadlines.push([`Est. Tax ${q.q}`, q.due]));
  }

  topics.push({
    id: "action_plan",
    icon: "\uD83D\uDDFA\uFE0F",
    title: "Your Action Plan & Checklist",
    sections: [
      { type: "checklist", title: "Documents to Gather", items: docsList },
      { type: "table", title: "Key Deadlines", rows: deadlines },
      { type: "source", text: "Source: IRS Publication 509 \u2014 Tax Calendars" },
    ],
    aiPrompt: `Situations: ${situations.join(", ")}. Filing: ${fs}. Give action plan: documents needed, deadlines, DIY vs CPA guidance, steps to reduce NEXT year's taxes, red flags needing professional help. Be specific.`,
  });

  return topics;
}
