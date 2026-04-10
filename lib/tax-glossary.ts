export interface GlossaryTerm {
  id: string;
  term: string;
  emoji: string;
  short: string;
  explanation: string;
  example: string;
  category: "basics" | "income" | "deductions" | "filing";
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  yesText: string;
  noText: string;
  explanation: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Basics
  {
    id: "taxes",
    term: "Taxes",
    emoji: "\uD83C\uDFDB\uFE0F",
    short: "Money you pay the government",
    category: "basics",
    explanation: "Taxes are money that everyone who earns income pays to the government. The government uses this money to pay for things we all share: roads, schools, the military, Social Security, Medicare, and thousands of other services. Think of it like a membership fee for living in the country.",
    example: "If you earned $30,000 this year, you might owe about $2,000-$3,000 in federal taxes (not 30% of everything — we'll explain why later).",
  },
  {
    id: "income_tax",
    term: "Income Tax",
    emoji: "\uD83D\uDCB0",
    short: "Tax on money you earned",
    category: "basics",
    explanation: "Income tax is a tax specifically on the money you earned — from a job, freelancing, or other sources. The more you earn, the higher percentage you pay, but only on the money ABOVE certain levels (these are called 'brackets'). Not all of your income is taxed — there's a chunk that's completely tax-free (the 'standard deduction').",
    example: "You earned $30,000 but the first $15,000 is tax-free. So you only pay tax on $15,000.",
  },
  {
    id: "w2",
    term: "W-2",
    emoji: "\uD83D\uDCC4",
    short: "A form your employer gives you",
    category: "income",
    explanation: "A W-2 is a piece of paper (or PDF) your employer sends you every January. It shows two important numbers: (1) how much they paid you total, and (2) how much tax they already sent to the IRS for you during the year. You need this to file your taxes. If you worked at a regular job where taxes were taken out of your paycheck, you'll get a W-2.",
    example: "You worked at Target. In January, they send you a W-2 showing you earned $25,000 and they sent $2,800 to the IRS for you.",
  },
  {
    id: "withholding",
    term: "Withholding",
    emoji: "\u2702\uFE0F",
    short: "Tax taken from each paycheck",
    category: "basics",
    explanation: "Withholding is the tax money your employer takes out of every paycheck and sends directly to the IRS. You never see this money — it goes straight from your employer to the government. When you file your taxes, you're checking whether your employer sent the RIGHT amount. Too much? You get a refund. Too little? You owe the difference.",
    example: "Your paycheck is $1,000 but you only receive $820. The $180 that 'disappeared' is withholding — your employer sent it to the IRS for you.",
  },
  {
    id: "refund",
    term: "Tax Refund",
    emoji: "\uD83D\uDCB5",
    short: "Money the IRS gives back to you",
    category: "basics",
    explanation: "A tax refund is NOT a gift from the government — it's YOUR money being returned. Throughout the year, your employer sends part of each paycheck to the IRS. If they sent more than you actually owe, the IRS gives the extra back. That's your refund. It's like overpaying for dinner and getting change back.",
    example: "Your employer sent $3,000 to the IRS but you only owed $2,200. The IRS sends you back $800. That was always your money.",
  },
  {
    id: "owe",
    term: "Owing Taxes",
    emoji: "\uD83D\uDCB8",
    short: "When you owe the IRS money",
    category: "basics",
    explanation: "If your employer didn't send ENOUGH tax to the IRS during the year, you owe the difference when you file. This is more common if you have multiple jobs, do freelance work, or claimed fewer withholdings. It doesn't mean you did anything wrong — it just means the math didn't quite work out during the year.",
    example: "Your employer sent $2,000 to the IRS but you actually owe $2,500. You pay the $500 difference when you file.",
  },
  {
    id: "filing",
    term: "Filing Your Taxes",
    emoji: "\uD83D\uDCE8",
    short: "Sending your tax info to the IRS",
    category: "filing",
    explanation: "Filing your taxes means submitting a report (called a 'tax return') to the IRS that shows how much you earned, how much tax you owe, and how much was already paid. Most people do this using software (like TurboTax or IRS Free File) that asks you questions and fills out the forms for you. The deadline is April 15th each year.",
    example: "In February, you sit down with your W-2, answer questions in a tax app, and hit 'submit.' That's filing.",
  },
  {
    id: "tax_return",
    term: "Tax Return",
    emoji: "\uD83D\uDCCB",
    short: "The form you send to the IRS",
    category: "filing",
    explanation: "A 'tax return' is the actual document you file with the IRS (Form 1040). Confusingly, people often say 'tax return' when they mean 'tax refund.' They're different things: the RETURN is the paperwork you send IN. The REFUND is money you get BACK. Tax software fills out the return for you — you just answer questions.",
    example: "You file your tax return (paperwork) and receive a tax refund (money back). The return is the form, the refund is the cash.",
  },
  {
    id: "deduction",
    term: "Deduction",
    emoji: "\u2702\uFE0F",
    short: "Lowers the income you're taxed on",
    category: "deductions",
    explanation: "A deduction is an amount subtracted from your income BEFORE tax is calculated. It reduces the amount of income that gets taxed — not the tax itself. Everyone gets a 'standard deduction' automatically ($15,000 if single in 2025). This means if you earned $30,000, you only pay tax on $15,000. Deductions basically make part of your income invisible to the IRS.",
    example: "Income: $30,000. Standard deduction: $15,000. Taxable income: $15,000. You only pay tax on $15,000.",
  },
  {
    id: "credit",
    term: "Tax Credit",
    emoji: "\uD83C\uDF81",
    short: "Directly reduces your tax bill",
    category: "deductions",
    explanation: "A tax credit is way better than a deduction. While a deduction reduces the income you're taxed on, a credit reduces your actual tax bill dollar-for-dollar. A $1,000 credit means you pay $1,000 less in taxes. Some credits are even 'refundable,' meaning if the credit is bigger than your tax bill, the IRS sends you the difference as cash.",
    example: "You owe $2,000 in taxes. A $1,000 credit brings it to $1,000. A $1,000 deduction might only save you $120-$220 depending on your rate.",
  },
  {
    id: "dependent",
    term: "Dependent",
    emoji: "\uD83D\uDC76",
    short: "Someone who relies on you financially",
    category: "filing",
    explanation: "A dependent is a person (usually a child or elderly parent) who relies on you for financial support. Claiming dependents on your taxes can save you a LOT of money through credits. Important: if your PARENTS still support you (you live at home, they pay your bills), THEY claim you as their dependent, and you can't claim yourself. This affects your taxes.",
    example: "A parent with 2 kids under 17 can get $4,000 in Child Tax Credits ($2,000 per child). That's $4,000 directly off their tax bill.",
  },
  {
    id: "filing_status",
    term: "Filing Status",
    emoji: "\uD83D\uDC64",
    short: "How you classify yourself to the IRS",
    category: "filing",
    explanation: "Your filing status tells the IRS whether you're single, married, or a single parent supporting a family. It matters because different statuses get different standard deductions and tax brackets. Most young people file as 'Single.' If you're a single parent, 'Head of Household' saves you more money. The IRS determines your status based on your situation on December 31st of the tax year.",
    example: "Single: $15,000 standard deduction. Head of Household: $22,500. That's $7,500 more income that's tax-free.",
  },
  {
    id: "bracket",
    term: "Tax Bracket",
    emoji: "\uD83D\uDCCA",
    short: "The rate you pay at different income levels",
    category: "basics",
    explanation: "Tax brackets are ranges of income taxed at different rates. Here's the key thing everyone gets wrong: if you're 'in the 22% bracket,' you DON'T pay 22% on everything. You pay 10% on the first chunk, 12% on the next chunk, and 22% only on the amount above the 12% bracket. It's like climbing stairs — each step has its own rate, not the whole staircase.",
    example: "On $40,000 (single): First $15,000 = tax-free. Taxable: $25,000. First $11,925 at 10% = $1,193. Next $13,075 at 12% = $1,569. Total tax: $2,762 (about 6.9% effective rate — not 12%).",
  },
  {
    id: "agi",
    term: "AGI",
    emoji: "\uD83E\uDDEE",
    short: "Adjusted Gross Income — your income after certain subtractions",
    category: "income",
    explanation: "AGI (Adjusted Gross Income) is your total income minus certain allowed subtractions (like student loan interest or retirement contributions). It's an important number because many tax benefits have AGI limits — if your AGI is too high, you lose access to certain credits. You don't calculate this yourself — the tax software does it. But understanding it helps you know why some deductions matter.",
    example: "Gross income: $35,000. Student loan interest: $1,200. AGI: $33,800. This lower AGI might qualify you for credits you'd otherwise miss.",
  },
  {
    id: "standard_deduction",
    term: "Standard Deduction",
    emoji: "\uD83D\uDEE1\uFE0F",
    short: "A guaranteed tax-free amount everyone gets",
    category: "deductions",
    explanation: "The standard deduction is a set amount of income that's automatically tax-free for everyone. For 2025, it's $15,000 if you're single. You don't have to do anything to get it — it's automatic. The only reason you'd skip it is if your 'itemized deductions' (mortgage interest, huge medical bills, etc.) add up to more than $15,000, which is rare for young people.",
    example: "You earned $25,000. The $15,000 standard deduction means you only pay tax on $10,000. The first $15,000 is yours, tax-free.",
  },
  {
    id: "irs",
    term: "IRS",
    emoji: "\uD83C\uDFDB\uFE0F",
    short: "Internal Revenue Service — the tax agency",
    category: "basics",
    explanation: "The IRS is the government agency that collects taxes and enforces tax law. They process your tax return, send your refund, and (rarely) audit people. They're not as scary as people think — for most people, interactions with the IRS are just filing your return and getting a refund. They also have a surprisingly helpful website (irs.gov) and free filing tools.",
    example: "You file your tax return → the IRS processes it → they send your refund in 2-3 weeks via direct deposit.",
  },
  // --- Additional terms ---
  {
    id: "marginal_rate",
    term: "Marginal Tax Rate",
    emoji: "\uD83D\uDCCA",
    short: "The rate on your NEXT dollar of income",
    category: "basics",
    explanation: "Your marginal rate is the tax rate applied to your LAST (highest) dollar of income. It's NOT what you pay on all your income — just the top slice. This is important because when people say 'I'm in the 22% bracket,' they mean their marginal rate is 22%. Their actual overall rate (called the 'effective rate') is much lower because the first chunks of income are taxed at 10% and 12%.",
    example: "You earn $50,000. Your marginal rate is 12% (the bracket your top dollar falls in). But your effective rate is only about 7% because most of your income was taxed at lower rates.",
  },
  {
    id: "effective_rate",
    term: "Effective Tax Rate",
    emoji: "\uD83C\uDFAF",
    short: "What you actually pay overall (lower than your bracket)",
    category: "basics",
    explanation: "Your effective tax rate is the REAL percentage of your total income that goes to taxes. It's always lower than your marginal rate because of how brackets work. When someone in the '22% bracket' actually does the math, they find they're paying closer to 10-13% overall. This is the number that actually matters for your wallet.",
    example: "Income: $60,000. You're in the '22% bracket' but your effective rate is about 10.5%. You pay ~$6,300 in taxes, not $13,200 (which is what 22% of $60,000 would be).",
  },
  {
    id: "1099",
    term: "1099 Forms",
    emoji: "\uD83D\uDCE4",
    short: "Forms showing income that wasn't from a regular job",
    category: "income",
    explanation: "A 1099 is a family of forms that report income OTHER than W-2 wages. The most common: 1099-NEC (freelance/contract work, $600+), 1099-K (payment apps like PayPal/Venmo for business, $5,000+), 1099-INT (bank interest), 1099-DIV (stock dividends), 1099-B (stock/crypto sales). If you get one, the IRS got a copy too — so you MUST report it.",
    example: "You drove for DoorDash and earned $3,000. DoorDash sends you a 1099-NEC showing $3,000. They also sent a copy to the IRS. If you don't report it, the IRS will send you a letter.",
  },
  {
    id: "gross_income",
    term: "Gross Income",
    emoji: "\uD83D\uDCB0",
    short: "Your total income before any deductions",
    category: "income",
    explanation: "Gross income is ALL the money you received in a year before anything is subtracted. It includes your W-2 wages, freelance income, investment gains, rental income, and other sources. This is the starting point for your tax calculation — from here, deductions and adjustments reduce it to your 'taxable income,' which is the amount you actually pay tax on.",
    example: "W-2 job: $40,000 + freelance work: $5,000 + bank interest: $200 = Gross income of $45,200.",
  },
  {
    id: "taxable_income",
    term: "Taxable Income",
    emoji: "\uD83D\uDCB2",
    short: "The amount you actually pay tax on (always less than gross)",
    category: "income",
    explanation: "Taxable income is your gross income AFTER subtracting deductions and adjustments. This is the number the IRS actually applies tax rates to. For most people, taxable income is significantly less than their total earnings because of the standard deduction and other adjustments. If you earned $50,000 and take the standard deduction of $15,000, your taxable income is $35,000.",
    example: "Gross income: $50,000 – Standard deduction: $15,000 = Taxable income: $35,000. Tax is calculated on $35,000, not $50,000.",
  },
  {
    id: "above_the_line",
    term: "Above-the-Line Deduction",
    emoji: "\u2B06\uFE0F",
    short: "Special deductions you get ON TOP of the standard deduction",
    category: "deductions",
    explanation: "Most deductions are 'below the line' — you either take them OR the standard deduction (whichever is bigger). But above-the-line deductions are special: you get them IN ADDITION to the standard deduction. This includes student loan interest, HSA contributions, IRA contributions, and half of self-employment tax. These reduce your AGI, which can also help you qualify for other benefits.",
    example: "You take the $15,000 standard deduction AND deduct $1,200 in student loan interest above the line. Total tax-free income: $16,200.",
  },
  {
    id: "itemized",
    term: "Itemized Deductions",
    emoji: "\uD83D\uDCDD",
    short: "Adding up individual deductions instead of taking the standard amount",
    category: "deductions",
    explanation: "Instead of taking the flat standard deduction ($15,000 for single), you can 'itemize' — meaning you add up all your specific deductible expenses (mortgage interest, state taxes, charity, medical bills) and deduct that total instead. You only itemize if your total exceeds the standard deduction. Most people under 30 don't itemize because they don't have big deductions like mortgage interest.",
    example: "Your itemized deductions: $8,000 mortgage interest + $4,000 state taxes + $2,000 charity = $14,000. Since $14,000 < $15,000 standard deduction, you're better off taking the standard.",
  },
  {
    id: "capital_gains",
    term: "Capital Gains",
    emoji: "\uD83D\uDCC8",
    short: "Profit from selling investments (stocks, crypto, etc.)",
    category: "income",
    explanation: "When you sell a stock, crypto, or other investment for MORE than you paid, the profit is a 'capital gain.' If you held the investment for over 1 year, it's a 'long-term' gain and taxed at lower rates (0%, 15%, or 20%). If under 1 year, it's 'short-term' and taxed at your regular income rate. You only owe tax when you SELL — just holding an investment that went up doesn't trigger tax.",
    example: "You bought $1,000 of stock and sold it for $1,500. Your capital gain is $500. If you held it over a year, you might owe $0-$75 in tax. If under a year, you'd owe $60-$110.",
  },
  {
    id: "w4",
    term: "W-4 Form",
    emoji: "\u270D\uFE0F",
    short: "The form that tells your employer how much tax to take out",
    category: "filing",
    explanation: "A W-4 is a form you fill out when you start a new job (and can update anytime). It tells your employer how much federal tax to withhold from each paycheck. If you fill it out wrong, your employer might take out too much (big refund but smaller paychecks) or too little (you'll owe at tax time). Getting a big refund? Update your W-4 to take home more per paycheck.",
    example: "You got a $2,400 refund. That means $200/month was taken unnecessarily from your paychecks. Updating your W-4 could put that $200 back in each paycheck.",
  },
  {
    id: "self_employment_tax",
    term: "Self-Employment Tax",
    emoji: "\uD83C\uDFD7\uFE0F",
    short: "The extra 15.3% tax freelancers pay (Social Security + Medicare)",
    category: "income",
    explanation: "When you're a regular W-2 employee, you pay 7.65% for Social Security and Medicare, and your employer pays the other 7.65%. But when you're self-employed, you're BOTH the employee and employer — so you pay the full 15.3%. This is ON TOP of your regular income tax. The good news: you can deduct half of it from your income.",
    example: "You made $10,000 freelancing. Self-employment tax: $10,000 × 15.3% = $1,530. Plus you owe income tax on the $10,000. But you can deduct $765 (half the SE tax) from your income.",
  },
  {
    id: "eitc",
    term: "EITC (Earned Income Tax Credit)",
    emoji: "\uD83D\uDCB0",
    short: "A big cash-back credit for lower-income workers",
    category: "deductions",
    explanation: "The EITC is one of the most valuable tax credits — it can give you thousands of dollars back even if you owe $0 in taxes. It's based on your income and number of children. About 20% of people who qualify don't claim it because they don't know about it. If you work and earn less than about $60,000, you should check if you qualify.",
    example: "A single parent with one child earning $25,000 could get about $3,500 from the EITC — that's real cash deposited into your bank account.",
  },
];

export const COMPREHENSION_QUESTIONS: ComprehensionQuestion[] = [
  {
    id: "paycheck_taxes",
    question: "Do you know why your paycheck is less than what your hourly rate or salary suggests?",
    yesText: "Yes, I know taxes and other things are taken out",
    noText: "Not really — I'm not sure where the money goes",
    explanation: "Your employer automatically takes money from each paycheck for: (1) Federal income tax, (2) Social Security tax (6.2%), (3) Medicare tax (1.45%), and sometimes (4) State income tax. This is called 'withholding.' The tax return you file in April checks whether the right amount was taken out during the year.",
  },
  {
    id: "refund_vs_owe",
    question: "Do you know why some people get money back (a refund) and others owe more?",
    yesText: "Yes, it depends on whether too much or too little was withheld",
    noText: "No, I thought a refund meant you paid less tax",
    explanation: "A refund means your employer sent MORE tax to the IRS than you actually owed — so the IRS gives the extra back. Owing means your employer didn't send ENOUGH — so you pay the difference. The total tax you owe is the same either way. A big refund isn't a bonus — it means you gave the government an interest-free loan all year.",
  },
  {
    id: "need_to_file",
    question: "Do you know whether you're actually REQUIRED to file a tax return this year?",
    yesText: "Yes, I know the filing requirements",
    noText: "I'm not sure — I thought everyone has to file",
    explanation: "You're required to file if your gross income exceeds certain thresholds ($15,000 for single filers in 2025). BUT — even if you earned less, you should STILL file if your employer withheld taxes, because filing is the only way to get that money back as a refund. Many young people skip filing and leave hundreds of dollars on the table.",
  },
  {
    id: "documents_needed",
    question: "Do you know what documents you need to file your taxes?",
    yesText: "Yes — W-2, maybe some 1099s",
    noText: "No idea what I need",
    explanation: "For most young people, you just need: (1) Your W-2 from your employer (they send it by January 31), (2) Your Social Security number, (3) Your bank account info for direct deposit of your refund. That's it! If you did freelance work, you might also get a 1099-NEC. The tax software tells you exactly which numbers to enter from each form.",
  },
  {
    id: "free_filing",
    question: "Do you know that you can file your taxes completely free?",
    yesText: "Yes, I know about free filing options",
    noText: "Wait, really? I thought you had to pay for TurboTax",
    explanation: "You do NOT need to pay for TurboTax or H&R Block. The IRS offers FREE filing through IRS Free File (if income is under $84,000) and IRS Direct File (available in many states). Cash App Taxes is also always free. These are just as good as paid software — they ask you the same questions and fill out the same forms. Don't pay $50-$80 for something you can do for $0.",
  },
  {
    id: "parents_claim",
    question: "Do you know if your parents can still claim you as a dependent on their taxes?",
    yesText: "Yes, I know the dependency rules",
    noText: "I'm not sure how that works",
    explanation: "If you're under 19 (or under 24 and a full-time student), and your parents provide more than half your financial support, they can claim you as a dependent. This means: (1) You can still file your own return to get YOUR refund, (2) But you check the box that says 'someone can claim me as a dependent,' (3) You can't claim your own personal exemption. Talk to your parents about who's claiming what — it matters for both of your taxes.",
  },
];

// Determine which terms to show based on knowledge level
export function getTermsForLevel(level: string): GlossaryTerm[] {
  if (level === "beginner") {
    return GLOSSARY_TERMS; // Show all terms
  }
  if (level === "passive") {
    // Skip the most basic ones
    return GLOSSARY_TERMS.filter(
      (t) => !["taxes", "irs", "income_tax"].includes(t.id)
    );
  }
  // Informed/expert — don't show this screen at all
  return [];
}

export function getQuestionsForLevel(level: string): ComprehensionQuestion[] {
  if (level === "beginner") {
    return COMPREHENSION_QUESTIONS;
  }
  if (level === "passive") {
    return COMPREHENSION_QUESTIONS.filter(
      (q) => !["paycheck_taxes"].includes(q.id)
    );
  }
  return [];
}
