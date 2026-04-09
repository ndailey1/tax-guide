import { useState, useRef, useEffect, useCallback } from "react";

const TAX_DATA = {
  year: 2024, filingYear: 2025, filingDeadline: "April 15, 2025", extensionDeadline: "October 15, 2025",
  brackets: {
    single: [
      { min: 0, max: 11600, rate: 0.10 }, { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 }, { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 }, { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 },
    ],
    married_jointly: [
      { min: 0, max: 23200, rate: 0.10 }, { min: 23200, max: 94300, rate: 0.12 },
      { min: 94300, max: 201050, rate: 0.22 }, { min: 201050, max: 383900, rate: 0.24 },
      { min: 383900, max: 487450, rate: 0.32 }, { min: 487450, max: 731200, rate: 0.35 },
      { min: 731200, max: Infinity, rate: 0.37 },
    ],
    married_separately: [
      { min: 0, max: 11600, rate: 0.10 }, { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 }, { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 }, { min: 243725, max: 365600, rate: 0.35 },
      { min: 365600, max: Infinity, rate: 0.37 },
    ],
    head_of_household: [
      { min: 0, max: 16550, rate: 0.10 }, { min: 16550, max: 63100, rate: 0.12 },
      { min: 63100, max: 100500, rate: 0.22 }, { min: 100500, max: 191950, rate: 0.24 },
      { min: 191950, max: 243700, rate: 0.32 }, { min: 243700, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 },
    ],
  },
  standardDeduction: { single: 14600, married_jointly: 29200, married_separately: 14600, head_of_household: 21900, widow: 29200, additional_65_single: 1950, additional_65_married: 1550 },
  capitalGains: {
    single: [ { min: 0, max: 47025, rate: 0 }, { min: 47025, max: 518900, rate: 0.15 }, { min: 518900, max: Infinity, rate: 0.20 } ],
    married_jointly: [ { min: 0, max: 94050, rate: 0 }, { min: 94050, max: 583750, rate: 0.15 }, { min: 583750, max: Infinity, rate: 0.20 } ],
  },
  selfEmployment: { ssTaxRate: 0.124, medicareTaxRate: 0.029, totalSERate: 0.153, ssWageBase: 168600, additionalMedicareThresholdSingle: 200000, additionalMedicareThresholdJoint: 250000, additionalMedicareRate: 0.009, qbiDeductionRate: 0.20, qbiPhaseoutSingle: 191950, qbiPhaseoutJoint: 383900 },
  estimatedTax: {
    threshold: 1000,
    quarterlyDates: [
      { q: "Q1", period: "Jan 1 – Mar 31", due: "April 15, 2025" },
      { q: "Q2", period: "Apr 1 – May 31", due: "June 16, 2025" },
      { q: "Q3", period: "Jun 1 – Aug 31", due: "September 15, 2025" },
      { q: "Q4", period: "Sep 1 – Dec 31", due: "January 15, 2026" },
    ],
    safeHarborHighIncome: 150000,
  },
  credits: {
    childTaxCredit: { max: 2000, refundable: 1700, ageLimit: 17, phaseoutSingle: 200000, phaseoutJoint: 400000 },
    eitc: {
      noChildren: { max: 632, agiSingle: 18591, agiJoint: 25511 },
      oneChild: { max: 4213, agiSingle: 49084, agiJoint: 56004 },
      twoChildren: { max: 6960, agiSingle: 55768, agiJoint: 62688 },
      threeOrMore: { max: 7830, agiSingle: 59899, agiJoint: 66819 },
      investmentIncomeLimit: 11600,
    },
    americanOpportunity: { max: 2500, refundable: 1000, yearsAvailable: 4 },
    lifetimeLearning: { max: 2000 },
    childCare: { maxExpenses1: 3000, maxExpenses2: 6000, maxPercent: 35 },
    saversCredit: { maxContribution: 2000, agiSingle: 38250, agiJoint: 76500 },
    evCredit: { maxNew: 7500, maxUsed: 4000 },
    otherDependents: { max: 500 },
  },
  deductions: {
    saltCap: 10000, mortgageDebtLimit: 750000, medicalAGIThreshold: 0.075, charitableCashAGILimit: 0.60,
    studentLoanMax: 2500, hsaSelf: 4150, hsaFamily: 8300, hsaCatchUp55: 1000,
    fsaLimit: 3200, fsaCarryover: 640, iraMax: 7000, iraCatchUp50: 1000,
    k401Limit: 23000, k401CatchUp50: 7500, mileageRate: 0.67, homeOfficeSafe: 5, homeOfficeMax: 1500,
  },
  filingThresholds: {
    single_under65: 14600, single_65plus: 16550, married_jointly_both_under65: 29200,
    married_jointly_one_65plus: 30750, married_jointly_both_65plus: 32300,
    married_separately: 5, head_of_household_under65: 21900, head_of_household_65plus: 23850, selfEmployment: 400,
  },
};

const fmt = (n) => n >= 1e15 ? "and above" : "$" + n.toLocaleString();
const fmtD = (n) => "$" + n.toLocaleString();
const pct = (r) => (r * 100).toFixed(1) + "%";

const KNOWLEDGE_LEVELS = [
  { id: "expert", label: "I normally do my taxes myself", emoji: "🧮", desc: "Comfortable with forms, deductions, and filing." },
  { id: "informed", label: "I use a CPA/service and understand the process", emoji: "🤝", desc: "Someone else files, but you follow along." },
  { id: "passive", label: "I use a CPA/service but don't understand it", emoji: "🤷", desc: "You hand over documents and hope for the best." },
  { id: "beginner", label: "I know almost nothing about taxes", emoji: "🌱", desc: "Taxes feel like a foreign language." },
];

const FILING_STATUSES = [
  { id: "single", label: "Single", desc: "Unmarried or legally separated on Dec 31" },
  { id: "married_jointly", label: "Married Filing Jointly", desc: "Married, combining income on one return" },
  { id: "married_separately", label: "Married Filing Separately", desc: "Married but filing individual returns" },
  { id: "head_of_household", label: "Head of Household", desc: "Unmarried, pay >50% home costs for qualifying dependent" },
  { id: "widow", label: "Qualifying Surviving Spouse", desc: "Spouse died in 2022/2023, have dependent child" },
];

const LIFE_SITUATIONS = [
  { id: "employed_w2", label: "W-2 Employee", emoji: "💼", cat: "income" },
  { id: "self_employed", label: "Self-Employed / 1099", emoji: "🏗️", cat: "income" },
  { id: "side_hustle", label: "Side Hustle / Gig Work", emoji: "🚗", cat: "income" },
  { id: "unemployed", label: "Received Unemployment", emoji: "📋", cat: "income" },
  { id: "tip_income", label: "Tip Income", emoji: "💵", cat: "income" },
  { id: "investor", label: "Stocks / Crypto / Investments", emoji: "📈", cat: "income" },
  { id: "rental_income", label: "Rental Property Income", emoji: "🔑", cat: "income" },
  { id: "retirement_income", label: "Social Security / Pension", emoji: "🏖️", cat: "income" },
  { id: "alimony", label: "Paying or Receiving Alimony", emoji: "⚖️", cat: "income" },
  { id: "foreign_income", label: "Earned Income Abroad", emoji: "🌍", cat: "income" },
  { id: "gambling", label: "Gambling Winnings", emoji: "🎰", cat: "income" },
  { id: "homeowner", label: "Homeowner (with mortgage)", emoji: "🏠", cat: "life" },
  { id: "sold_home", label: "Sold a Home This Year", emoji: "🏡", cat: "life" },
  { id: "parent", label: "Parent / Child Under 17", emoji: "👶", cat: "life" },
  { id: "older_dependent", label: "Supporting Other Dependents", emoji: "👨‍👩‍👧", cat: "life" },
  { id: "married_event", label: "Got Married This Year", emoji: "💍", cat: "life" },
  { id: "divorced", label: "Got Divorced This Year", emoji: "📝", cat: "life" },
  { id: "student", label: "Student / Paying Tuition", emoji: "🎓", cat: "life" },
  { id: "student_loans", label: "Paying Student Loans", emoji: "🎒", cat: "life" },
  { id: "moved_states", label: "Moved to a Different State", emoji: "🚚", cat: "life" },
  { id: "charity", label: "Charitable Donations", emoji: "❤️", cat: "deductions" },
  { id: "medical", label: "Large Medical/Dental Expenses", emoji: "🏥", cat: "deductions" },
  { id: "hsa", label: "HSA / FSA Accounts", emoji: "💊", cat: "deductions" },
  { id: "retirement_contrib", label: "Contributing to 401k/IRA", emoji: "🏦", cat: "deductions" },
  { id: "ev_purchase", label: "Bought Electric Vehicle", emoji: "🔋", cat: "deductions" },
  { id: "childcare", label: "Paid for Childcare", emoji: "🧒", cat: "deductions" },
  { id: "home_office", label: "Home Office (Self-Employed)", emoji: "💻", cat: "deductions" },
  { id: "energy_home", label: "Home Energy Improvements", emoji: "☀️", cat: "deductions" },
];

function buildTopics(level, fs, situations) {
  const topics = [];
  const s = new Set(situations);
  const beg = level === "beginner" || level === "passive";
  const sd = TAX_DATA.standardDeduction[fs] || TAX_DATA.standardDeduction.single;
  const brackets = TAX_DATA.brackets[fs] || TAX_DATA.brackets.single;

  if (beg) {
    topics.push({ id: "fundamentals", icon: "📖", title: "How Taxes Actually Work",
      sections: [
        { type: "info", title: "Key Concept", text: `Your taxable income is NOT your total pay. It's your income MINUS deductions. The standard deduction for ${fs.replace(/_/g," ")} is ${fmtD(sd)} — that much of your income isn't taxed at all.` },
        { type: "source", text: "Source: IRS Topic 551 — Standard Deduction (irs.gov)" },
      ],
      aiPrompt: `Explain federal income taxes to a complete beginner. What taxes are, why we file returns, refund vs owing, withholding, taxable income, and how brackets work progressively. Use analogies. Filing status: ${fs}. Standard deduction: ${fmtD(sd)}.`,
    });
  }

  // Filing requirements
  const threshRows = [
    ["Single, under 65", fmtD(TAX_DATA.filingThresholds.single_under65)],
    ["Single, 65+", fmtD(TAX_DATA.filingThresholds.single_65plus)],
    ["Married Jointly, both under 65", fmtD(TAX_DATA.filingThresholds.married_jointly_both_under65)],
    ["Married Jointly, one 65+", fmtD(TAX_DATA.filingThresholds.married_jointly_one_65plus)],
    ["Married Separately", fmtD(TAX_DATA.filingThresholds.married_separately)],
    ["Head of Household, under 65", fmtD(TAX_DATA.filingThresholds.head_of_household_under65)],
    ["Head of Household, 65+", fmtD(TAX_DATA.filingThresholds.head_of_household_65plus)],
  ];
  const filingSections = [{ type: "table", title: "2024 Filing Thresholds (Gross Income)", rows: threshRows }];
  if (s.has("self_employed") || s.has("side_hustle")) filingSections.push({ type: "warning", text: `Self-employment: Must file if net SE income ≥ ${fmtD(TAX_DATA.filingThresholds.selfEmployment)}, even if total income is below thresholds above.` });
  filingSections.push({ type: "source", text: "Source: IRS Publication 501 (irs.gov/publications/p501)" });
  topics.push({ id: "filing", icon: "📋", title: "Filing Status & Requirements", sections: filingSections,
    aiPrompt: `Filing status: ${fs}. Situations: ${situations.join(", ")}. ${beg ? "Explain simply" : "Cover concisely"}: whether they must file, why filing status matters, and trade-offs (especially married joint vs separate). Level: ${level}.`,
  });

  // Income
  const docs = [];
  if (s.has("employed_w2")) docs.push(["W-2", "Wages, salary, tips", "From employer by Jan 31"]);
  if (s.has("self_employed") || s.has("side_hustle")) docs.push(["1099-NEC", "Non-employee compensation ($600+)", "From clients by Jan 31"]);
  if (s.has("side_hustle")) docs.push(["1099-K", "Payment platform income ($5,000+)", "From platform by Jan 31"]);
  if (s.has("investor")) { docs.push(["1099-B", "Stock/crypto sales", "From broker by Feb 15"]); docs.push(["1099-DIV", "Dividends", "By Jan 31"]); docs.push(["1099-INT", "Interest ($10+)", "By Jan 31"]); }
  if (s.has("rental_income")) docs.push(["Schedule E", "Rental income/expenses", "You track"]);
  if (s.has("retirement_income")) { docs.push(["SSA-1099", "Social Security", "By Jan 31"]); docs.push(["1099-R", "Retirement distributions", "By Jan 31"]); }
  if (s.has("unemployed")) docs.push(["1099-G", "Unemployment", "From state by Jan 31"]);
  if (s.has("gambling")) docs.push(["W-2G", "Gambling winnings", "From operator"]);
  const incSections = [];
  if (docs.length) incSections.push({ type: "table3", title: "Tax Documents You Should Receive", rows: docs, headers: ["Form", "Reports", "When"] });
  incSections.push({ type: "warning", text: "The IRS receives copies of ALL your tax documents. Unreported income will trigger notices." });
  if (s.has("tip_income")) incSections.push({ type: "info", title: "Tips", text: "All tips are taxable including cash. Report $20+/month in tips to your employer." });
  incSections.push({ type: "source", text: "Source: IRS.gov — Understanding Your Tax Forms" });
  topics.push({ id: "income", icon: "💰", title: "Your Income — What the IRS Counts", sections: incSections,
    aiPrompt: `Situations: ${situations.join(", ")}. ${beg ? "Explain simply" : "Summarize"}: what counts as taxable income, which forms they'll get, and why the IRS already knows. Only cover relevant types.`,
  });

  // Brackets
  const bracketRows = brackets.map(b => [`${fmt(b.min)} – ${b.max >= 1e15 ? "above" : fmt(b.max)}`, pct(b.rate)]);
  topics.push({ id: "brackets", icon: "📊", title: "Tax Brackets — What You Actually Owe", sections: [
    { type: "table", title: `2024 Federal Brackets — ${fs.replace(/_/g," ")}`, rows: bracketRows, headers: ["Taxable Income", "Rate"] },
    { type: "info", title: "Progressive System", text: `You DON'T pay ${pct(brackets[brackets.length-1].rate)} on everything. Each bracket only applies to income in that range. At $55,000 single: 10% on first $11,600 + 12% on next $35,550 + 22% on remaining $7,850 = ~$6,768 total (effective rate ~12.3%).` },
    { type: "source", text: "Source: IRS Revenue Procedure 2023-34" },
  ],
    aiPrompt: `Filing status: ${fs}. Walk through progressive brackets. ${beg ? "Use $55,000 example, dispel 'higher bracket = all income taxed higher' myth." : "Show marginal vs effective rate."}`
  });

  // Deductions
  const d = TAX_DATA.deductions;
  const sdTable = [
    ["Single", fmtD(TAX_DATA.standardDeduction.single)], ["Married Jointly", fmtD(TAX_DATA.standardDeduction.married_jointly)],
    ["Married Separately", fmtD(TAX_DATA.standardDeduction.married_separately)], ["Head of Household", fmtD(TAX_DATA.standardDeduction.head_of_household)],
    ["Additional if 65+ (single)", `+${fmtD(TAX_DATA.standardDeduction.additional_65_single)}`],
    ["Additional if 65+ (married/spouse)", `+${fmtD(TAX_DATA.standardDeduction.additional_65_married)}`],
  ];
  const dedSections = [{ type: "table", title: "2024 Standard Deduction", rows: sdTable }];
  const itemized = [];
  if (s.has("homeowner")) itemized.push(["Mortgage Interest", `On up to ${fmtD(d.mortgageDebtLimit)} of debt`]);
  itemized.push(["State & Local Taxes (SALT)", `Capped at ${fmtD(d.saltCap)}`]);
  if (s.has("medical")) itemized.push(["Medical Expenses", `Only amounts > ${pct(d.medicalAGIThreshold)} of AGI`]);
  if (s.has("charity")) itemized.push(["Charitable (cash)", `Up to ${pct(d.charitableCashAGILimit)} of AGI`]);
  if (itemized.length) { dedSections.push({ type: "table", title: "Itemized Deductions Relevant to You", rows: itemized }); dedSections.push({ type: "info", title: "Standard vs Itemized", text: `Choose whichever is HIGHER. Your standard deduction is ${fmtD(sd)}. Only itemize if your total itemized deductions exceed that.` }); }
  const aboveLine = [];
  if (s.has("student_loans")) aboveLine.push(["Student Loan Interest", `Up to ${fmtD(d.studentLoanMax)}`]);
  if (s.has("hsa")) { aboveLine.push(["HSA (self-only)", fmtD(d.hsaSelf)]); aboveLine.push(["HSA (family)", fmtD(d.hsaFamily)]); aboveLine.push(["FSA", `${fmtD(d.fsaLimit)} limit`]); }
  if (s.has("retirement_contrib")) { aboveLine.push(["401(k)", `${fmtD(d.k401Limit)} (+${fmtD(d.k401CatchUp50)} if 50+)`]); aboveLine.push(["Traditional IRA", `${fmtD(d.iraMax)} (+${fmtD(d.iraCatchUp50)} if 50+)`]); }
  if (s.has("self_employed") || s.has("side_hustle")) { aboveLine.push(["½ Self-Employment Tax", "Deducted from gross income"]); aboveLine.push(["SE Health Insurance", "100% of premiums"]); }
  if (aboveLine.length) dedSections.push({ type: "table", title: "Above-the-Line Deductions (you get these WITH the standard deduction)", rows: aboveLine });
  dedSections.push({ type: "source", text: "Source: IRS Rev. Proc. 2023-34, IRS Publication 501" });
  topics.push({ id: "deductions", icon: "✂️", title: "Deductions — Reducing What You Owe", sections: dedSections,
    aiPrompt: `Filing status: ${fs}. Situations: ${situations.join(", ")}. ${beg ? "Explain what a deduction IS, then" : ""} cover standard vs itemized and which deductions apply to them. SALT cap $10K. Be practical about record-keeping.`,
  });

  // Credits
  const c = TAX_DATA.credits;
  const credRows = [];
  if (s.has("parent")) { credRows.push(["Child Tax Credit", `${fmtD(c.childTaxCredit.max)}/child under ${c.childTaxCredit.ageLimit}`, `${fmtD(c.childTaxCredit.refundable)} refundable`]); }
  credRows.push(["EITC (no children)", `Up to ${fmtD(c.eitc.noChildren.max)}`, "Refundable"]);
  if (s.has("parent")) { credRows.push(["EITC (1 child)", `Up to ${fmtD(c.eitc.oneChild.max)}`, "Refundable"]); credRows.push(["EITC (2 children)", `Up to ${fmtD(c.eitc.twoChildren.max)}`, "Refundable"]); credRows.push(["EITC (3+ children)", `Up to ${fmtD(c.eitc.threeOrMore.max)}`, "Refundable"]); }
  if (s.has("student")) { credRows.push(["American Opportunity", `Up to ${fmtD(c.americanOpportunity.max)}/yr`, `${fmtD(c.americanOpportunity.refundable)} refundable`]); credRows.push(["Lifetime Learning", `Up to ${fmtD(c.lifetimeLearning.max)}`, "Non-refundable"]); }
  if (s.has("childcare")) credRows.push(["Child & Dependent Care", `${c.childCare.maxPercent}% of up to ${fmtD(c.childCare.maxExpenses2)}`, "Non-refundable"]);
  if (s.has("ev_purchase")) { credRows.push(["EV Credit (new)", `Up to ${fmtD(c.evCredit.maxNew)}`, "Non-refundable"]); credRows.push(["EV Credit (used)", `Up to ${fmtD(c.evCredit.maxUsed)}`, "Non-refundable"]); }
  if (s.has("retirement_contrib")) credRows.push(["Saver's Credit", `Up to ${fmtD(c.saversCredit.maxContribution)}`, "Non-refundable"]);
  if (s.has("older_dependent")) credRows.push(["Other Dependents", `${fmtD(c.otherDependents.max)}/dependent`, "Non-refundable"]);
  topics.push({ id: "credits", icon: "🎁", title: "Tax Credits — Direct Money Back", sections: [
    { type: "table3", title: "Credits You May Qualify For", rows: credRows, headers: ["Credit", "Amount", "Type"] },
    { type: "info", title: "Credit vs Deduction", text: "A $1,000 CREDIT saves $1,000. A $1,000 DEDUCTION saves $1,000 × your rate (e.g. $220 at 22%). Credits are far more valuable." },
    { type: "info", title: "Refundable = Cash Back", text: "Refundable credits pay you even if you owe $0. Non-refundable can only reduce your bill to $0." },
    { type: "warning", text: "~20% of eligible taxpayers don't claim the EITC. Even workers without children may qualify. Don't leave money on the table." },
    { type: "source", text: "Source: IRS.gov — Credits & Deductions, IRS EITC Tables" },
  ],
    aiPrompt: `Situations: ${situations.join(", ")}. ${beg ? "Explain credit vs deduction with dollar example. Explain refundable vs non-refundable. Then" : ""} cover each credit relevant to them with eligibility details and income limits.`,
  });

  // Self-employment
  if (s.has("self_employed") || s.has("side_hustle") || s.has("home_office")) {
    const se = TAX_DATA.selfEmployment;
    const est = TAX_DATA.estimatedTax;
    topics.push({ id: "self_employment", icon: "🏗️", title: "Self-Employment & Freelance Taxes", sections: [
      { type: "table", title: "Self-Employment Tax (2024)", rows: [
        ["Social Security", `${pct(se.ssTaxRate)} on first ${fmtD(se.ssWageBase)}`],
        ["Medicare", `${pct(se.medicareTaxRate)} on all net earnings`],
        ["Total SE Tax", pct(se.totalSERate)],
        ["Additional Medicare", `+${pct(se.additionalMedicareRate)} above ${fmtD(se.additionalMedicareThresholdSingle)} (single)`],
      ]},
      { type: "warning", text: "W-2 employees split FICA 50/50 with employer. Self-employed pay BOTH halves = 15.3% on top of income tax." },
      { type: "table", title: "Quarterly Estimated Tax Due Dates", rows: est.quarterlyDates.map(q => [q.q, q.period, q.due]) },
      { type: "info", title: "Safe Harbor", text: `Pay ≥90% of this year's tax OR 100% of last year's (110% if AGI > ${fmtD(est.safeHarborHighIncome)}) to avoid penalties.` },
      { type: "table", title: "Key SE Deductions", rows: [
        ["QBI Deduction", `${pct(se.qbiDeductionRate)} of qualified income`],
        ["Home Office (simplified)", `$${d.homeOfficeSafe}/sqft, max ${fmtD(d.homeOfficeMax)}`],
        ["Business Mileage", `$${d.mileageRate}/mile`],
        ["Health Insurance", "100% of premiums deductible"],
        ["½ SE Tax", "Above-the-line deduction"],
      ]},
      { type: "source", text: "Source: IRS Self-Employed Tax Center (irs.gov), IRS Form 1040-ES" },
    ],
      aiPrompt: `User is self-employed. ${beg ? "Explain simply" : "Cover"}: SE tax, quarterly payments, Schedule C, business deductions (home office, mileage, meals 50%, equipment, software), QBI deduction. Records to keep. Common mistakes.`,
    });
  }

  // Investments
  if (s.has("investor") || s.has("gambling")) {
    const cg = TAX_DATA.capitalGains[fs] || TAX_DATA.capitalGains.single;
    topics.push({ id: "investments", icon: "📈", title: "Investment & Capital Gains Taxes", sections: [
      { type: "table", title: `Long-Term Capital Gains Rates (${fs.replace(/_/g," ")})`, rows: cg.map(b => [`${fmt(b.min)} – ${b.max >= 1e15 ? "above" : fmt(b.max)}`, pct(b.rate)]), headers: ["Taxable Income", "Rate"] },
      { type: "info", title: "Short vs Long Term", text: "Held ≤1 year = short-term = taxed at your ordinary rate. Held >1 year = long-term = lower rates above. This difference can save thousands." },
      { type: "warning", text: "Crypto is taxed as property. Every sale, swap, or purchase is taxable. The IRS asks about crypto on page 1 of Form 1040." },
      ...(s.has("gambling") ? [{ type: "info", title: "Gambling", text: "Winnings are taxable income. Losses only deductible up to winnings, and only if you itemize." }] : []),
      { type: "source", text: "Source: IRS Topic 409 — Capital Gains, IRS Rev. Proc. 2023-34" },
    ],
      aiPrompt: `User has investments. ${beg ? "Explain simply" : "Cover"}: capital gains, short vs long term, 0/15/20% rates, tax-loss harvesting, wash sale rule, crypto, dividends. ${s.has("gambling") ? "And gambling tax rules." : ""}`,
    });
  }

  // Retirement
  if (s.has("retirement_contrib") || s.has("retirement_income")) {
    topics.push({ id: "retirement", icon: "🏦", title: "Retirement Accounts & Taxes", sections: [
      { type: "table", title: "2024 Contribution Limits", rows: [
        ["401(k)/403(b)", `${fmtD(d.k401Limit)} (+${fmtD(d.k401CatchUp50)} if 50+)`],
        ["Traditional/Roth IRA", `${fmtD(d.iraMax)} (+${fmtD(d.iraCatchUp50)} if 50+)`],
        ["HSA (self)", fmtD(d.hsaSelf)], ["HSA (family)", fmtD(d.hsaFamily)],
      ]},
      { type: "info", title: "Traditional vs Roth", text: "Traditional: deduct now, pay tax in retirement. Roth: no deduction now, withdraw tax-FREE later. If you expect higher income later, Roth may save more." },
      ...(s.has("retirement_income") ? [{ type: "warning", text: "Up to 85% of Social Security may be taxable if combined income > $34,000 (single) or $44,000 (joint)." }] : []),
      { type: "source", text: "Source: IRS Rev. Proc. 2023-34, IRS Publication 590-A" },
    ],
      aiPrompt: `Situations: ${situations.join(", ")}. ${beg ? "Explain simply" : "Cover"}: Traditional vs Roth, contribution limits, employer matches, ${s.has("retirement_income") ? "RMDs, SS taxation, early withdrawal penalties" : "tax savings of contributing now"}.`,
    });
  }

  // Homeowner
  if (s.has("homeowner") || s.has("sold_home")) {
    topics.push({ id: "homeowner", icon: "🏠", title: "Homeowner Tax Benefits", sections: [
      { type: "table", title: "Homeowner Deductions", rows: [
        ["Mortgage Interest", `On up to ${fmtD(d.mortgageDebtLimit)} of debt`],
        ["Property Taxes", `Deductible (within ${fmtD(d.saltCap)} SALT cap)`],
      ]},
      ...(s.has("sold_home") ? [{ type: "info", title: "Home Sale Exclusion", text: "Exclude up to $250K (single) or $500K (joint) of gain if you owned & lived there 2 of last 5 years." }] : []),
      { type: "source", text: "Source: IRS Publication 936, IRS Topic 701" },
    ],
      aiPrompt: `User is a homeowner${s.has("sold_home") ? " who sold a home" : ""}. Cover mortgage interest deduction, property taxes, SALT cap, ${s.has("sold_home") ? "home sale exclusion rules and how to calculate gain" : ""}. ${s.has("energy_home") ? "Also energy credits." : ""}`,
    });
  }

  // Mistakes
  const warnings = [{ type: "warning", text: "Not filing when required: Failure-to-file penalty is 5%/month (up to 25%). Failure-to-pay is only 0.5%/month. ALWAYS file, even if you can't pay." }];
  if (s.has("self_employed") || s.has("side_hustle")) warnings.push({ type: "warning", text: "Not paying quarterly estimated taxes: Owe $1,000+ at filing? You'll face underpayment penalty even if you pay in full." });
  if (s.has("parent")) warnings.push({ type: "warning", text: "Wrong filing status: Many single parents file 'Single' when 'Head of Household' gives a $21,900 standard deduction vs $14,600 and better brackets." });
  warnings.push({ type: "warning", text: "Missing the EITC: ~20% of eligible taxpayers don't claim it. Even childless workers may get up to $632 back." });
  if (s.has("investor")) warnings.push({ type: "warning", text: "Not reporting ALL sales: IRS gets 1099-Bs from brokers. Even small crypto swaps must be reported. Losses offset gains + $3,000 of ordinary income." });
  if (s.has("moved_states")) warnings.push({ type: "warning", text: "Multi-state filing: You likely need returns in BOTH states as a part-year resident." });
  warnings.push({ type: "source", text: "Source: IRS.gov — Common Filing Mistakes" });
  topics.push({ id: "mistakes", icon: "⚠️", title: "Costly Mistakes & Red Flags", sections: warnings,
    aiPrompt: `Situations: ${situations.join(", ")}. Cover the most common/costly mistakes for their situation. Be specific. Level: ${level}.`,
  });

  // Action plan
  const docsList = ["Photo ID", "SSN cards", `${TAX_DATA.year - 1} tax return`];
  if (s.has("employed_w2")) docsList.push("W-2(s)");
  if (s.has("self_employed") || s.has("side_hustle")) docsList.push("1099-NEC/K forms", "Business expense records", "Mileage log");
  if (s.has("investor")) docsList.push("1099-B, 1099-DIV, 1099-INT");
  if (s.has("homeowner")) docsList.push("Form 1098 (mortgage interest)", "Property tax statements");
  if (s.has("student") || s.has("student_loans")) docsList.push("1098-T (tuition)", "1098-E (loan interest)");
  if (s.has("childcare")) docsList.push("Childcare provider info & amounts");
  if (s.has("medical")) docsList.push("Medical expense records");
  if (s.has("charity")) docsList.push("Donation receipts (written for $250+)");
  if (s.has("retirement_income")) docsList.push("SSA-1099, 1099-R");
  const deadlines = [["Filing Deadline", TAX_DATA.filingDeadline], ["Extension Deadline", TAX_DATA.extensionDeadline], ["⚠️ Extension Note", "Extensions give time to FILE, not to PAY"]];
  if (s.has("self_employed") || s.has("side_hustle")) TAX_DATA.estimatedTax.quarterlyDates.forEach(q => deadlines.push([`Est. Tax ${q.q}`, q.due]));
  topics.push({ id: "action_plan", icon: "🗺️", title: "Your Action Plan & Checklist", sections: [
    { type: "checklist", title: "Documents to Gather", items: docsList },
    { type: "table", title: "Key Deadlines", rows: deadlines },
    { type: "source", text: "Source: IRS Publication 509 — Tax Calendars" },
  ],
    aiPrompt: `Situations: ${situations.join(", ")}. Filing: ${fs}. Give action plan: documents needed, deadlines, DIY vs CPA guidance, steps to reduce NEXT year's taxes, red flags needing professional help. Be specific.`,
  });

  return topics;
}

/* ═══ STYLES ═══ */
const P = { bg:"#0C1018",surface:"#141B27",surfaceAlt:"#1A2332",border:"#273040",borderLight:"#3A4660",accent:"#4C9AFF",accentDim:"#1A2F4F",green:"#36B37E",greenDim:"#132E22",orange:"#FFAB00",orangeDim:"#3D2E0A",red:"#FF5630",text:"#E3E8F0",textMuted:"#8899AA",textDim:"#4A5568" };
const FN = "'Literata','Georgia',serif";
const FM = "'IBM Plex Mono',monospace";
const FS = "'IBM Plex Sans',sans-serif";

function Card({ children, onClick, selected, style: st }) {
  return <button onClick={onClick} style={{ display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 16px",border:`1.5px solid ${selected?P.accent:P.border}`,borderRadius:10,background:selected?P.accentDim:P.surface,cursor:onClick?"pointer":"default",textAlign:"left",transition:"all .15s",fontFamily:FS,...st }}
    onMouseEnter={e=>{if(onClick&&!selected){e.currentTarget.style.borderColor=P.borderLight;e.currentTarget.style.background=P.surfaceAlt}}}
    onMouseLeave={e=>{if(onClick&&!selected){e.currentTarget.style.borderColor=P.border;e.currentTarget.style.background=P.surface}}}>{children}</button>;
}

function ProgressBar({current,total}){const p=total>0?(current/total)*100:0;return<div style={{display:"flex",alignItems:"center",gap:12,margin:"0 0 18px"}}><div style={{flex:1,height:5,background:P.border,borderRadius:3,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:`linear-gradient(90deg,${P.accent},${P.green})`,borderRadius:3,transition:"width .6s"}}/></div><span style={{fontFamily:FM,fontSize:11,color:P.textMuted}}>{Math.round(p)}%</span></div>}

function SectionRenderer({sections}){return sections.map((sec,i)=>{
  if(sec.type==="table"||sec.type==="table3")return<div key={i} style={{margin:"14px 0",overflow:"auto"}}>{sec.title&&<h4 style={{fontSize:13,fontWeight:700,color:P.accent,marginBottom:6,fontFamily:FS}}>{sec.title}</h4>}<table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5,fontFamily:FS}}>{sec.headers&&<thead><tr>{sec.headers.map((h,j)=><th key={j} style={{textAlign:"left",padding:"7px 8px",borderBottom:`1px solid ${P.border}`,color:P.textMuted,fontWeight:600,fontSize:10,textTransform:"uppercase",letterSpacing:.5}}>{h}</th>)}</tr></thead>}<tbody>{sec.rows.map((row,ri)=><tr key={ri} style={{borderBottom:`1px solid ${P.border}15`}}>{row.map((cell,ci)=><td key={ci} style={{padding:"7px 8px",color:ci===0?P.text:P.accent,fontFamily:ci>0?FM:FS,fontSize:12.5}}>{cell}</td>)}</tr>)}</tbody></table></div>;
  if(sec.type==="info")return<div key={i} style={{margin:"10px 0",padding:"10px 14px",background:P.accentDim,border:`1px solid ${P.accent}33`,borderRadius:8}}>{sec.title&&<div style={{fontSize:11,fontWeight:700,color:P.accent,marginBottom:3,fontFamily:FS}}>{sec.title}</div>}<div style={{fontSize:13,color:P.text,lineHeight:1.6,fontFamily:FS}}>{sec.text}</div></div>;
  if(sec.type==="warning")return<div key={i} style={{margin:"10px 0",padding:"10px 14px",background:P.orangeDim,border:`1px solid ${P.orange}33`,borderRadius:8}}><div style={{fontSize:13,color:P.text,lineHeight:1.6,fontFamily:FS}}>⚠️ {sec.text}</div></div>;
  if(sec.type==="checklist")return<div key={i} style={{margin:"14px 0"}}>{sec.title&&<h4 style={{fontSize:13,fontWeight:700,color:P.accent,marginBottom:6,fontFamily:FS}}>{sec.title}</h4>}{sec.items.map((it,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}><span style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${P.border}`,flexShrink:0}}/><span style={{fontSize:13,color:P.text,fontFamily:FS}}>{it}</span></div>)}</div>;
  if(sec.type==="source")return<div key={i} style={{margin:"10px 0 2px",fontSize:10,color:P.textDim,fontFamily:FM,fontStyle:"italic"}}>{sec.text}</div>;
  return null;
})}

function MdRender({text}){if(!text)return null;const lines=text.split("\n"),els=[];let i=0,k=0;while(i<lines.length){const l=lines[i];if(l.startsWith("### "))els.push(<h3 key={k++} style={{fontSize:14,fontWeight:700,color:P.accent,margin:"16px 0 5px",fontFamily:FS}}>{l.slice(4)}</h3>);else if(l.startsWith("## "))els.push(<h2 key={k++} style={{fontSize:16,fontWeight:700,color:P.text,margin:"20px 0 6px",fontFamily:FS}}>{l.slice(3)}</h2>);else if(l.startsWith("# "))els.push(<h1 key={k++} style={{fontSize:18,fontWeight:800,color:P.text,margin:"22px 0 8px",fontFamily:FS}}>{l.slice(2)}</h1>);else if(l.startsWith("- ")||l.startsWith("* ")){const items=[];while(i<lines.length&&(lines[i].startsWith("- ")||lines[i].startsWith("* "))){items.push(lines[i].slice(2));i++}els.push(<ul key={k++} style={{margin:"5px 0",paddingLeft:18}}>{items.map((t,j)=><li key={j} style={{fontSize:13,color:P.text,lineHeight:1.65,marginBottom:2,fontFamily:FS}}>{inl(t)}</li>)}</ul>);continue}else if(/^\d+\.\s/.test(l)){const items=[];while(i<lines.length&&/^\d+\.\s/.test(lines[i])){items.push(lines[i].replace(/^\d+\.\s/,""));i++}els.push(<ol key={k++} style={{margin:"5px 0",paddingLeft:18}}>{items.map((t,j)=><li key={j} style={{fontSize:13,color:P.text,lineHeight:1.65,marginBottom:2,fontFamily:FS}}>{inl(t)}</li>)}</ol>);continue}else if(l.trim()==="")els.push(<div key={k++} style={{height:5}}/>);else els.push(<p key={k++} style={{fontSize:13,color:P.text,lineHeight:1.65,margin:"4px 0",fontFamily:FS}}>{inl(l)}</p>);i++}return<div>{els}</div>}
function inl(t){const p=[];let k=0;const rx=/\*\*(.+?)\*\*/g;let m,last=0;while((m=rx.exec(t))!==null){if(m.index>last)p.push(<span key={k++}>{t.slice(last,m.index)}</span>);p.push(<strong key={k++} style={{color:P.accent,fontWeight:700}}>{m[1]}</strong>);last=rx.lastIndex}if(last<t.length)p.push(<span key={k++}>{t.slice(last)}</span>);return p.length?p:t}

/* ═══ SCREENS ═══ */

function WelcomeScreen({onSelect}){return<div style={{maxWidth:600,margin:"0 auto"}}><div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:40,marginBottom:8}}>🧾</div><h1 style={{fontSize:24,fontWeight:800,color:P.text,fontFamily:FN,margin:0}}>Taxes, Explained For Humans</h1><p style={{color:P.textMuted,fontSize:13,marginTop:6,fontFamily:FS,maxWidth:420,margin:"6px auto 0"}}>Personalized, legally accurate guidance built from official IRS data.</p><div style={{fontSize:10,color:P.textDim,fontFamily:FM,marginTop:6}}>2024 Tax Year • IRS Rev. Proc. 2023-34 • Filed in 2025</div></div><p style={{fontSize:13,fontWeight:600,color:P.text,marginBottom:10,fontFamily:FS}}>How much do you know about filing taxes?</p><div style={{display:"flex",flexDirection:"column",gap:7}}>{KNOWLEDGE_LEVELS.map(k=><Card key={k.id} onClick={()=>onSelect(k.id)}><span style={{fontSize:24}}>{k.emoji}</span><div><div style={{fontSize:13,fontWeight:600,color:P.text}}>{k.label}</div><div style={{fontSize:11,color:P.textMuted,marginTop:1}}>{k.desc}</div></div></Card>)}</div></div>}

function FilingStatusScreen({selected,onSelect,onContinue}){return<div style={{maxWidth:600,margin:"0 auto"}}><h2 style={{fontSize:20,fontWeight:800,color:P.text,fontFamily:FN,margin:"0 0 4px"}}>Filing Status</h2><p style={{color:P.textMuted,fontSize:12,marginBottom:14,fontFamily:FS}}>This determines brackets, deductions & credit eligibility as of Dec 31, {TAX_DATA.year}.</p><div style={{display:"flex",flexDirection:"column",gap:7}}>{FILING_STATUSES.map(s=><Card key={s.id} onClick={()=>onSelect(s.id)} selected={selected===s.id}><div><div style={{fontSize:13,fontWeight:600,color:P.text}}>{s.label}</div><div style={{fontSize:11,color:P.textMuted,marginTop:1}}>{s.desc}</div></div>{selected===s.id&&<span style={{marginLeft:"auto",color:P.accent}}>✓</span>}</Card>)}</div><button onClick={onContinue} disabled={!selected} style={{width:"100%",marginTop:14,padding:"12px 0",border:"none",borderRadius:8,background:selected?P.accent:P.border,color:selected?"#fff":P.textDim,fontSize:13,fontWeight:700,cursor:selected?"pointer":"default",fontFamily:FS}}>Continue →</button></div>}

function SituationsScreen({selected,onToggle,onContinue}){const cats={income:"Income Sources",life:"Life Events & Status",deductions:"Potential Deductions & Credits"};return<div style={{maxWidth:640,margin:"0 auto"}}><h2 style={{fontSize:20,fontWeight:800,color:P.text,fontFamily:FN,margin:"0 0 4px"}}>What applies to your {TAX_DATA.year} tax year?</h2><p style={{color:P.textMuted,fontSize:12,marginBottom:14,fontFamily:FS}}>Select all that apply to ensure you don't miss deductions, credits, or requirements.</p>{Object.entries(cats).map(([cat,label])=><div key={cat} style={{marginBottom:16}}><h3 style={{fontSize:10,fontWeight:700,color:P.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontFamily:FM}}>{label}</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{LIFE_SITUATIONS.filter(s=>s.cat===cat).map(s=><Card key={s.id} onClick={()=>onToggle(s.id)} selected={selected.includes(s.id)} style={{padding:"9px 11px"}}><span style={{fontSize:18}}>{s.emoji}</span><span style={{fontSize:12,fontWeight:selected.includes(s.id)?600:400,color:P.text,flex:1}}>{s.label}</span>{selected.includes(s.id)&&<span style={{color:P.accent,fontSize:13}}>✓</span>}</Card>)}</div></div>)}<button onClick={onContinue} disabled={selected.length===0} style={{width:"100%",marginTop:6,padding:"12px 0",border:"none",borderRadius:8,background:selected.length>0?P.accent:P.border,color:selected.length>0?"#fff":P.textDim,fontSize:13,fontWeight:700,cursor:selected.length>0?"pointer":"default",fontFamily:FS}}>Build My Tax Guide →</button></div>}

function TopicsScreen({topics,completed,onSelect,filingStatus}){return<div style={{maxWidth:600,margin:"0 auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><h2 style={{fontSize:20,fontWeight:800,color:P.text,fontFamily:FN,margin:0}}>Your Tax Guide</h2><span style={{fontFamily:FM,fontSize:10,color:P.textMuted}}>{completed.length}/{topics.length}</span></div><div style={{fontSize:11,color:P.textMuted,fontFamily:FM,marginBottom:10}}>{filingStatus?.replace(/_/g," ")} • {TAX_DATA.year} Tax Year • IRS-sourced data</div><ProgressBar current={completed.length} total={topics.length}/><div style={{display:"flex",flexDirection:"column",gap:6}}>{topics.map(t=>{const done=completed.includes(t.id);return<Card key={t.id} onClick={()=>onSelect(t.id)} style={{borderColor:done?P.green:P.border,background:done?P.greenDim:P.surface}}><span style={{fontSize:22}}>{t.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:P.text}}>{t.title}</div><div style={{fontSize:10,color:P.textMuted,marginTop:1}}>{t.sections.filter(s=>s.type==="table"||s.type==="table3").length} tables{t.sections.filter(s=>s.type==="warning").length>0?` • ${t.sections.filter(s=>s.type==="warning").length} alerts`:""}</div></div>{done?<span style={{color:P.green,fontSize:12,fontWeight:600}}>✓</span>:<span style={{color:P.accent,fontSize:16}}>→</span>}</Card>})}</div></div>}

function DetailScreen({topic,aiContent,aiLoading,onBack,onAsk,followUp,setFollowUp,followUpAnswer,followUpLoading,onDone}){const ref=useRef(null);useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[aiContent,followUpAnswer]);return<div style={{maxWidth:680,margin:"0 auto"}}><button onClick={onBack} style={{background:"none",border:"none",color:P.accent,cursor:"pointer",fontSize:12,fontFamily:FS,padding:0,marginBottom:12}}>← Back to Guide</button><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><span style={{fontSize:28}}>{topic.icon}</span><h2 style={{fontSize:18,fontWeight:800,color:P.text,fontFamily:FN,margin:0}}>{topic.title}</h2></div><div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:"18px 20px",marginBottom:14}}><div style={{fontSize:10,fontWeight:700,color:P.green,textTransform:"uppercase",letterSpacing:.8,marginBottom:8,fontFamily:FM}}>📊 Official IRS Data — {TAX_DATA.year}</div><SectionRenderer sections={topic.sections}/></div><div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"18px 20px"}}><div style={{fontSize:10,fontWeight:700,color:P.accent,textTransform:"uppercase",letterSpacing:.8,marginBottom:8,fontFamily:FM}}>💡 Plain-Language Explanation</div>{aiLoading&&!aiContent?<div style={{padding:24,textAlign:"center"}}><div style={{fontSize:22,animation:"pulse 1.5s ease infinite"}}>🔍</div><p style={{color:P.textMuted,fontSize:12,fontFamily:FS}}>Writing your explanation...</p><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style></div>:aiContent?<MdRender text={aiContent}/>:null}</div>{aiContent&&<>{followUpAnswer&&<div style={{marginTop:12,background:P.surface,border:`1px solid ${P.orange}33`,borderRadius:10,padding:"14px 18px"}}><div style={{fontSize:10,fontWeight:700,color:P.orange,marginBottom:4,fontFamily:FM}}>FOLLOW-UP</div><MdRender text={followUpAnswer}/></div>}<div style={{display:"flex",gap:7,marginTop:12}}><input value={followUp} onChange={e=>setFollowUp(e.target.value)} placeholder="Ask a follow-up..." onKeyDown={e=>{if(e.key==="Enter"&&followUp.trim())onAsk()}} style={{flex:1,padding:"10px 12px",borderRadius:8,border:`1px solid ${P.border}`,background:P.surface,color:P.text,fontSize:12,fontFamily:FS,outline:"none"}}/><button onClick={onAsk} disabled={!followUp.trim()||followUpLoading} style={{padding:"10px 16px",borderRadius:8,border:"none",background:P.accent,color:"#fff",fontSize:12,fontWeight:700,cursor:followUp.trim()?"pointer":"default",fontFamily:FS,opacity:followUp.trim()?1:.4}}>{followUpLoading?"...":"Ask"}</button></div><button onClick={onDone} style={{width:"100%",marginTop:12,padding:"11px 0",border:`1px solid ${P.green}55`,borderRadius:8,background:P.greenDim,color:P.green,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FS}}>✓ Complete & Return</button></>}<div ref={ref}/></div>}

/* ═══ MAIN APP ═══ */

export default function TaxGuide(){
  const[screen,setScreen]=useState("welcome");
  const[level,setLevel]=useState(null);
  const[fs,setFs]=useState(null);
  const[sits,setSits]=useState([]);
  const[topics,setTopics]=useState([]);
  const[completed,setCompleted]=useState([]);
  const[active,setActive]=useState(null);
  const[aiCache,setAiCache]=useState({});
  const[aiLoading,setAiLoading]=useState(false);
  const[followUp,setFollowUp]=useState("");
  const[fuAnswer,setFuAnswer]=useState("");
  const[fuLoading,setFuLoading]=useState(false);

  const fetchAI=async(id,prompt)=>{if(aiCache[id])return;setAiLoading(true);try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`You are a tax educator for US individual taxpayers. User level: "${KNOWLEDGE_LEVELS.find(k=>k.id===level)?.label}". Use 2024 IRS tax year data ONLY. Cite IRS sources. Markdown format. Be accurate.`,messages:[{role:"user",content:prompt}]})});const d=await r.json();setAiCache(p=>({...p,[id]:d.content?.map(c=>c.text||"").join("\n")||"Explanation unavailable."}));}catch{setAiCache(p=>({...p,[id]:"Could not load. Review the IRS data tables above."}));}setAiLoading(false);};

  const askFollowUp=async()=>{if(!followUp.trim())return;setFuLoading(true);const t=topics.find(t=>t.id===active);try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`Tax educator. Filing: ${fs}. Level: ${level}. Topic: ${t?.title}. 2024 IRS data only. Markdown.`,messages:[{role:"user",content:`Context:\n${aiCache[active]||""}\n\nQuestion: ${followUp}`}]})});const d=await r.json();setFuAnswer(d.content?.map(c=>c.text||"").join("\n")||"Sorry, couldn't answer.");}catch{setFuAnswer("Error. Try again.");}setFollowUp("");setFuLoading(false);};

  return<div style={{minHeight:"100vh",background:P.bg,color:P.text,fontFamily:FS,padding:"24px 16px 50px"}}>
    <link href="https://fonts.googleapis.com/css2?family=Literata:wght@400;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet"/>
    {screen==="welcome"&&<WelcomeScreen onSelect={l=>{setLevel(l);setScreen("filing")}}/>}
    {screen==="filing"&&<FilingStatusScreen selected={fs} onSelect={setFs} onContinue={()=>setScreen("situations")}/>}
    {screen==="situations"&&<SituationsScreen selected={sits} onToggle={id=>setSits(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])} onContinue={()=>{setTopics(buildTopics(level,fs,sits));setScreen("topics")}}/>}
    {screen==="topics"&&<TopicsScreen topics={topics} completed={completed} filingStatus={fs} onSelect={id=>{setActive(id);setFollowUp("");setFuAnswer("");setScreen("detail");const t=topics.find(x=>x.id===id);if(t)fetchAI(id,t.aiPrompt)}}/>}
    {screen==="detail"&&active&&<DetailScreen topic={topics.find(t=>t.id===active)} aiContent={aiCache[active]} aiLoading={aiLoading} onBack={()=>{setActive(null);setFuAnswer("");setScreen("topics")}} onAsk={askFollowUp} followUp={followUp} setFollowUp={setFollowUp} followUpAnswer={fuAnswer} followUpLoading={fuLoading} onDone={()=>{if(active&&!completed.includes(active))setCompleted(p=>[...p,active]);setActive(null);setFuAnswer("");setScreen("topics")}}/>}
  </div>;
}
