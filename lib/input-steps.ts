export interface HelpContent {
  what: string;
  where: string;
  howToGet: string;
  dontHave: string;
}

export interface InputField {
  key: string;
  label: string;
  placeholder: string;
  type?: "dollar" | "number";
}

export interface InputStep {
  id: string;
  question: string;
  subtext: string;
  emoji: string;
  help: HelpContent;
  fields: InputField[];
  showWhen: (situations: string[]) => boolean;
}

export const INPUT_STEPS: InputStep[] = [
  // --- W-2 Income ---
  {
    id: "w2_income",
    question: "How much did you earn from your job(s) this year?",
    subtext: "This is the total pay from all employers before any taxes were taken out.",
    emoji: "\uD83D\uDCBC",
    help: {
      what: "This is your gross wages, salary, and tips from all jobs. It's the total amount your employer(s) paid you before taxes, insurance, or retirement contributions were taken out.",
      where: "Look at your W-2 form, Box 1 (\"Wages, tips, other compensation\"). If you had multiple jobs, add up Box 1 from each W-2.",
      howToGet: "Your employer is required to send you a W-2 by January 31st. Check your email (many are sent electronically), your employer's payroll portal (like ADP, Gusto, or Workday), or your physical mailbox.",
      dontHave: "Check your last pay stub of the year \u2014 look for \"YTD Gross Pay\" or \"Year-to-Date.\" This will be close to your W-2 amount. You can also log into your payroll portal.",
    },
    fields: [
      { key: "w2Income", label: "Total wages from all jobs", placeholder: "65,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("employed_w2"),
  },
  {
    id: "w2_withholding",
    question: "How much federal tax was already taken out of your paychecks?",
    subtext: "Your employer withholds (takes out) taxes from each paycheck throughout the year. This is the total they sent to the IRS on your behalf.",
    emoji: "\uD83C\uDFE6",
    help: {
      what: "Every paycheck, your employer takes out a portion for federal income tax and sends it to the IRS. At tax time, you're checking whether they took out too much (you get a refund) or too little (you owe more).",
      where: "Look at your W-2 form, Box 2 (\"Federal income tax withheld\"). Add up Box 2 from all your W-2s if you had multiple jobs.",
      howToGet: "This comes on the same W-2 form from your employer. Same places to check: email, payroll portal, or mailbox.",
      dontHave: "Check your last pay stub \u2014 look for \"YTD Federal Tax\" or \"Federal Withholding YTD.\" Your payroll portal will also show this under tax summaries.",
    },
    fields: [
      { key: "w2Withholding", label: "Federal tax withheld", placeholder: "8,500", type: "dollar" },
    ],
    showWhen: (s) => s.includes("employed_w2"),
  },

  // --- Self-employment ---
  {
    id: "se_income",
    question: "How much did you earn from self-employment or freelance work?",
    subtext: "This is the total amount clients or customers paid you before you subtract any business expenses.",
    emoji: "\uD83C\uDFD7\uFE0F",
    help: {
      what: "This is the total money you received for freelance, contract, or self-employment work. It includes cash, checks, direct deposits, and payments through apps like Venmo or PayPal for business services.",
      where: "Each client who paid you $600+ should send a 1099-NEC form. Add up the amounts from all your 1099-NEC forms. Also include any income under $600 per client \u2014 it's still taxable even without a form.",
      howToGet: "Clients must send 1099-NEC forms by January 31st. Check your email and mailbox. If a client paid you through a platform (Upwork, Fiverr, etc.), you may get a 1099-K from the platform instead.",
      dontHave: "Add up all payments you received for work. Check your bank statements, PayPal/Venmo business transactions, and invoicing records. You must report this income even if you never received a 1099.",
    },
    fields: [
      { key: "selfEmploymentIncome", label: "Self-employment income", placeholder: "45,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("self_employed"),
  },
  {
    id: "side_hustle_income",
    question: "How much did you earn from your side hustle or gig work?",
    subtext: "Rideshare driving, deliveries, selling online, tutoring \u2014 any extra income outside a regular job.",
    emoji: "\uD83D\uDE97",
    help: {
      what: "Any money you earned from gig platforms (Uber, DoorDash, Etsy, etc.), freelance side projects, or selling goods/services on the side. This is the total before expenses.",
      where: "Gig platforms send a 1099-K if you earned $5,000+. Check each app's tax documents section (usually under Settings or Account). Also add any cash or direct payments.",
      howToGet: "Log into each gig platform and look for \"Tax Documents\" or \"1099\" in your account settings. Most platforms make these available by January 31st.",
      dontHave: "Check each app's earnings dashboard for your annual total. Add up bank deposits from side work. Remember: ALL income is taxable, even if no 1099 was sent.",
    },
    fields: [
      { key: "sideHustleIncome", label: "Side hustle / gig income", placeholder: "8,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("side_hustle"),
  },
  {
    id: "business_expenses",
    question: "How much did you spend on your business this year?",
    subtext: "Business expenses reduce your taxable self-employment income. Only include expenses that were necessary for your work.",
    emoji: "\uD83D\uDCDD",
    help: {
      what: "These are costs you paid to run your business or do your gig work: supplies, software, advertising, professional services, phone/internet (business portion), equipment, etc. This does NOT include personal expenses.",
      where: "Review your bank/credit card statements for business purchases. If you use accounting software (QuickBooks, Wave), run an expense report. Keep receipts for purchases over $75.",
      howToGet: "You track these yourself. Go through your bank statements month by month and flag business purchases. Common categories: supplies, software, advertising, professional fees, phone/internet (business %), insurance.",
      dontHave: "Start with your bank statements. Look for recurring subscriptions, supply purchases, and anything you bought specifically for work. Even rough estimates are better than claiming nothing.",
    },
    fields: [
      { key: "businessExpenses", label: "Total business expenses", placeholder: "5,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("self_employed") || s.includes("side_hustle"),
  },
  {
    id: "business_mileage",
    question: "How many miles did you drive for business this year?",
    subtext: "If you drove for work (client visits, deliveries, NOT commuting), each mile is worth a $0.67 deduction.",
    emoji: "\uD83D\uDE99",
    help: {
      what: "Business miles include driving to client sites, making deliveries, going to the office supply store, or any driving required for your self-employment. Commuting from home to a regular office does NOT count. But if you work from home, drives to client meetings DO count.",
      where: "Check your mileage tracking app (Everlance, MileIQ, Stride). If you drive for Uber/Lyft/DoorDash, the app tracks business miles for you \u2014 check your annual tax summary.",
      howToGet: "If you don't have a mileage tracker, you can reconstruct from your calendar (appointments with locations) and Google Maps timeline. Going forward, start using a free mileage app.",
      dontHave: "Estimate based on your calendar. Count work-related trips and multiply by round-trip distance. The IRS accepts reasonable estimates if you can explain your methodology.",
    },
    fields: [
      { key: "businessMiles", label: "Business miles driven", placeholder: "12,000", type: "number" },
    ],
    showWhen: (s) => s.includes("self_employed") || s.includes("side_hustle"),
  },

  // --- Investments ---
  {
    id: "investment_income",
    question: "How much did you make (or lose) from investments?",
    subtext: "This includes stocks, crypto, mutual funds \u2014 only count what you actually sold, not what's still in your account.",
    emoji: "\uD83D\uDCC8",
    help: {
      what: "When you sell a stock, crypto, or other investment for more than you paid, that profit is a \"capital gain.\" If you sold for less, it's a \"capital loss.\" You only owe tax when you sell \u2014 just holding an investment that went up doesn't count.",
      where: "Your brokerage (Fidelity, Schwab, Robinhood, Coinbase, etc.) sends a 1099-B form showing all sales. Look for \"Total long-term gain/loss\" and \"Total short-term gain/loss\" in your tax documents.",
      howToGet: "Log into your brokerage account and look for \"Tax Documents\" or \"Tax Center.\" 1099-B forms are usually available by mid-February. Crypto exchanges also provide these.",
      dontHave: "Check your brokerage app's \"Activity\" or \"History\" section. Look for realized gains/losses for the year. If you used multiple platforms, check each one.",
    },
    fields: [
      { key: "investmentIncomeLTCG", label: "Long-term gains (held over 1 year)", placeholder: "3,000", type: "dollar" },
      { key: "investmentIncomeSTCG", label: "Short-term gains (held under 1 year)", placeholder: "1,500", type: "dollar" },
      { key: "dividendIncome", label: "Dividends received", placeholder: "500", type: "dollar" },
      { key: "interestIncome", label: "Interest earned (savings, bonds)", placeholder: "200", type: "dollar" },
    ],
    showWhen: (s) => s.includes("investor"),
  },

  // --- Rental ---
  {
    id: "rental_income",
    question: "What was your net rental income this year?",
    subtext: "Total rent collected minus expenses like mortgage, repairs, property management, and insurance on the rental.",
    emoji: "\uD83D\uDD11",
    help: {
      what: "Net rental income is the rent you collected minus allowable expenses: mortgage interest on the rental, property taxes, repairs, insurance, management fees, and depreciation. If expenses exceeded rent, you may have a rental loss.",
      where: "You track this yourself using rental records. If you use a property manager, they should provide an annual statement. Key expenses: mortgage interest (Form 1098), property tax bills, repair receipts.",
      howToGet: "Gather: total rent collected (bank deposits from tenants), mortgage statements for the rental, property tax bills, repair/maintenance receipts, insurance premiums, and property management invoices.",
      dontHave: "Add up rent deposits in your bank account, then subtract your rental mortgage payments, insurance, and any repairs. A rough net number is fine for estimating.",
    },
    fields: [
      { key: "rentalIncome", label: "Net rental income (after expenses)", placeholder: "12,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("rental_income"),
  },

  // --- Retirement income ---
  {
    id: "retirement_income",
    question: "How much retirement income did you receive?",
    subtext: "Social Security benefits, pension payments, or withdrawals from retirement accounts like 401(k) or IRA.",
    emoji: "\uD83C\uDFD6\uFE0F",
    help: {
      what: "This includes Social Security benefits, pension payments, and any money you withdrew from retirement accounts (401k, IRA, 403b). Note: up to 85% of Social Security may be taxable depending on your total income.",
      where: "Social Security: SSA-1099 (mailed or at ssa.gov). Pensions/401k/IRA withdrawals: 1099-R from each plan administrator. Box 1 shows the gross distribution.",
      howToGet: "SSA-1099 is available at my Social Security (ssa.gov) by February. 1099-R comes from your former employer's plan administrator or your IRA custodian by January 31st.",
      dontHave: "For Social Security, log into ssa.gov. For retirement account withdrawals, log into the account where you took the distribution and check for tax forms.",
    },
    fields: [
      { key: "retirementIncome", label: "Total retirement income received", placeholder: "24,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("retirement_income"),
  },

  // --- Unemployment ---
  {
    id: "unemployment_income",
    question: "How much did you receive in unemployment benefits?",
    subtext: "Unemployment benefits are taxable income. Many people don't realize this and get surprised at tax time.",
    emoji: "\uD83D\uDCCB",
    help: {
      what: "Unemployment compensation is fully taxable by the federal government. This includes regular state unemployment, federal extended benefits, and pandemic unemployment. You may have opted to have tax withheld from payments.",
      where: "Your state unemployment agency sends Form 1099-G. Box 1 shows total unemployment paid, Box 4 shows any federal tax withheld.",
      howToGet: "Log into your state's unemployment website \u2014 the 1099-G is usually available for download in January. It may also be mailed to you. Search \"[your state] unemployment 1099-G\" for the specific portal.",
      dontHave: "Log into the unemployment portal where you filed your claim. Your payment history will show the total received. If you can't access it, contact your state unemployment office.",
    },
    fields: [
      { key: "unemploymentIncome", label: "Unemployment benefits received", placeholder: "9,600", type: "dollar" },
    ],
    showWhen: (s) => s.includes("unemployed"),
  },

  // --- Gambling ---
  {
    id: "gambling_income",
    question: "How much did you win from gambling this year?",
    subtext: "All gambling winnings are taxable \u2014 casinos, sports betting, lottery, poker. Losses can offset wins but only if you itemize.",
    emoji: "\uD83C\uDFB0",
    help: {
      what: "Any money won gambling is taxable: casino games, sports bets, lottery tickets, poker tournaments, fantasy sports, bingo, raffles. This means the total amount won, not just the net profit.",
      where: "Large wins generate a W-2G form: $1,200+ from slots/bingo, $1,500+ from keno, $5,000+ from poker tournaments, $600+ from other gambling if the payout is 300x+ the wager.",
      howToGet: "Casinos and gambling platforms issue W-2G forms for qualifying wins. For sports betting apps (DraftKings, FanDuel, etc.), check your account's tax documents section.",
      dontHave: "Check your gambling app accounts for annual win/loss statements. Most platforms provide these. For casino visits, request a win/loss statement from the casino's player's club.",
    },
    fields: [
      { key: "gamblingIncome", label: "Total gambling winnings", placeholder: "2,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("gambling"),
  },

  // --- Dependents ---
  {
    id: "dependents",
    question: "How many dependents do you support?",
    subtext: "Dependents can qualify you for valuable tax credits worth thousands of dollars.",
    emoji: "\uD83D\uDC76",
    help: {
      what: "A dependent is someone who relies on you for financial support. Children under 17 qualify for the Child Tax Credit ($2,000 each). Other dependents (older children, elderly parents, etc.) qualify for a smaller $500 credit.",
      where: "You'll need each dependent's name, date of birth, Social Security number, and relationship to you. No special form \u2014 this comes from your own family records.",
      howToGet: "You should have this information already. If you need a dependent's SSN, check their Social Security card, prior tax returns, or request a replacement at ssa.gov.",
      dontHave: "Count your qualifying dependents: children under 17 who live with you, full-time students under 24, or relatives you provide more than half the support for. When in doubt, include them and a tax professional can verify.",
    },
    fields: [
      { key: "childrenUnder17", label: "Children under age 17", placeholder: "2", type: "number" },
      { key: "otherDependents", label: "Other dependents (students, elderly parents, etc.)", placeholder: "0", type: "number" },
    ],
    showWhen: (s) => s.includes("parent") || s.includes("older_dependent"),
  },

  // --- Homeowner deductions ---
  {
    id: "homeowner_deductions",
    question: "How much did you pay in mortgage interest and property taxes?",
    subtext: "These are two of the biggest potential tax deductions for homeowners.",
    emoji: "\uD83C\uDFE0",
    help: {
      what: "Mortgage interest is what the bank charges you to borrow money for your home. Property taxes are what your county/city charges based on your home's value. Both are deductible, but only if you itemize (and the total beats your standard deduction).",
      where: "Mortgage interest: Form 1098 from your lender, Box 1. Property taxes: Form 1098 Box 10, or your county tax assessor's annual statement. Some lenders pay property taxes from escrow and include it on the 1098.",
      howToGet: "Your mortgage company sends Form 1098 by January 31st. Check your lender's website or app under \"Tax Documents.\" For property taxes, check your county assessor's website or look at escrow statements.",
      dontHave: "Log into your mortgage servicer's website \u2014 your annual interest and escrow details are usually available online. For property taxes, search \"[your county] property tax lookup\" and enter your address.",
    },
    fields: [
      { key: "mortgageInterest", label: "Mortgage interest paid", placeholder: "12,000", type: "dollar" },
      { key: "propertyTaxes", label: "Property taxes paid", placeholder: "4,500", type: "dollar" },
    ],
    showWhen: (s) => s.includes("homeowner"),
  },

  // --- State/local taxes ---
  {
    id: "state_taxes",
    question: "How much did you pay in state and local income taxes?",
    subtext: "If you live in a state with income tax, what you paid can be deducted (along with property taxes, up to $10,000 total).",
    emoji: "\uD83C\uDFDB\uFE0F",
    help: {
      what: "State income tax is what your state charges on your earnings (some states have none). Combined with property taxes, you can deduct up to $10,000 total (the \"SALT cap\"). This is a big deal if you live in a high-tax state.",
      where: "W-2, Box 17 shows state income tax withheld. If you made estimated state tax payments, add those too. Your prior year's state tax return may also show a payment you made.",
      howToGet: "Your W-2 has state tax withheld. If you paid estimated state taxes, check your bank records for those payments. Prior year state refunds may need to be added to income.",
      dontHave: "Check your last pay stub for \"YTD State Tax.\" If you live in a state with no income tax (TX, FL, WA, NV, TN, WY, SD, AK, NH), enter $0 here.",
    },
    fields: [
      { key: "stateLocalTaxesPaid", label: "State/local income taxes paid", placeholder: "3,200", type: "dollar" },
    ],
    showWhen: (s) => s.includes("homeowner") || s.includes("employed_w2"),
  },

  // --- Charitable ---
  {
    id: "charitable",
    question: "How much did you donate to charity?",
    subtext: "Cash donations to qualified nonprofits can be deducted if you itemize.",
    emoji: "\u2764\uFE0F",
    help: {
      what: "Deductible donations include cash, checks, or credit card gifts to qualified 501(c)(3) organizations. This includes churches, nonprofits, and charitable foundations. Political donations and GoFundMe contributions are NOT deductible.",
      where: "Check your email/mail for donation receipts and thank-you letters from charities. For donations of $250+, you MUST have a written acknowledgment from the organization.",
      howToGet: "Contact charities you donated to and request a receipt or year-end giving statement. Many organizations email annual giving summaries in January.",
      dontHave: "Check your bank/credit card statements for donations. Add up anything to recognized charities. For cash donations without receipts, you can deduct up to $250 per organization without written proof, but written records are always better.",
    },
    fields: [
      { key: "charitableDonations", label: "Total charitable donations", placeholder: "1,500", type: "dollar" },
    ],
    showWhen: (s) => s.includes("charity"),
  },

  // --- Medical ---
  {
    id: "medical",
    question: "How much did you spend on medical and dental expenses?",
    subtext: "Only the amount that exceeds 7.5% of your income is deductible, so this helps most when expenses are very large.",
    emoji: "\uD83C\uDFE5",
    help: {
      what: "Deductible medical expenses include health insurance premiums (if not pre-tax), copays, prescriptions, dental work, vision care, surgeries, and medical equipment. Cosmetic procedures generally don't count.",
      where: "Your health insurance company may send an annual summary. Otherwise, gather: insurance premium statements, pharmacy receipts, doctor/dentist bills, hospital bills, and receipts for glasses/contacts.",
      howToGet: "Log into your health insurance portal for claims summaries. Check your pharmacy (CVS, Walgreens) for annual prescription spending. Gather bills from any major procedures or dental work.",
      dontHave: "Estimate from your insurance portal's claims summary plus any out-of-pocket payments. Only pursue this deduction if your total medical costs seem to exceed 7.5% of your income (e.g., $4,875 if you earn $65,000).",
    },
    fields: [
      { key: "medicalExpenses", label: "Total medical/dental expenses", placeholder: "8,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("medical"),
  },

  // --- Student loans ---
  {
    id: "student_loans",
    question: "How much student loan interest did you pay this year?",
    subtext: "You can deduct up to $2,500 in student loan interest \u2014 and you don't need to itemize to claim this.",
    emoji: "\uD83C\uDF92",
    help: {
      what: "The interest portion (not principal) of your student loan payments is deductible up to $2,500. This is an \"above-the-line\" deduction, meaning you get it even if you take the standard deduction. This is a common one people miss.",
      where: "Your loan servicer sends Form 1098-E. Box 1 shows total interest paid. If you have multiple servicers, add up Box 1 from each.",
      howToGet: "Log into your student loan servicer's website (Nelnet, MOHELA, Navient, etc.) and check for tax forms or a 1098-E. Most are available by January 31st in the tax documents section.",
      dontHave: "Log into your loan servicer's portal and look for an interest summary or tax documents section. Your monthly statements also show interest paid \u2014 add up the interest portion from each payment.",
    },
    fields: [
      { key: "studentLoanInterest", label: "Student loan interest paid", placeholder: "1,800", type: "dollar" },
    ],
    showWhen: (s) => s.includes("student_loans"),
  },

  // --- Retirement contributions ---
  {
    id: "retirement_contributions",
    question: "How much did you contribute to retirement accounts?",
    subtext: "401(k) and traditional IRA contributions reduce your taxable income. This is one of the best ways to lower your tax bill.",
    emoji: "\uD83C\uDFE6",
    help: {
      what: "Pre-tax retirement contributions directly reduce your taxable income. 401(k) contributions come out of your paycheck before taxes. Traditional IRA contributions are deducted on your return. Roth contributions do NOT reduce your current taxes (they're tax-free later instead).",
      where: "401(k)/403(b): Your W-2, Box 12, Code D (or E for 403b). Traditional IRA: Your IRA custodian's annual contribution statement. HSA: Form 5498-SA or your HSA provider's dashboard.",
      howToGet: "401(k) contributions are on your W-2 automatically. For IRA contributions, check with your brokerage (Fidelity, Vanguard, Schwab). For HSA, check your HSA provider's portal.",
      dontHave: "For 401(k), check your last pay stub for \"YTD 401k\" or your benefits portal. For IRA, log into your investment account to see contributions for the tax year. Remember you can make IRA contributions until April 15th.",
    },
    fields: [
      { key: "contribution401k", label: "401(k) or 403(b) contributions", placeholder: "10,000", type: "dollar" },
      { key: "contributionIRA", label: "Traditional IRA contributions", placeholder: "3,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("retirement_contrib"),
  },

  // --- HSA ---
  {
    id: "hsa",
    question: "How much did you contribute to your HSA or FSA?",
    subtext: "Health Savings Accounts are triple tax-advantaged: tax-free going in, growing, and coming out for medical expenses.",
    emoji: "\uD83D\uDC8A",
    help: {
      what: "HSA (Health Savings Account) contributions reduce your taxable income if you have a high-deductible health plan. FSA (Flexible Spending Account) contributions are usually taken pre-tax from your paycheck and already excluded from your W-2 wages.",
      where: "HSA: Form 5498-SA from your HSA provider, or check your HSA portal. FSA: Usually already excluded from W-2 Box 1. Check your benefits portal to confirm your election amount.",
      howToGet: "Log into your HSA provider (HealthEquity, Fidelity, Optum, etc.) for contribution details. FSA contributions are typically handled through your employer's benefits system.",
      dontHave: "Check your HSA provider's app or website for your annual contribution total. For FSA, check with your HR department or benefits portal. Note: FSA deductions from your paycheck are already pre-tax and may not need separate reporting.",
    },
    fields: [
      { key: "contributionHSA", label: "HSA contributions (your own, not employer's)", placeholder: "2,000", type: "dollar" },
    ],
    showWhen: (s) => s.includes("hsa"),
  },

  // --- Home office ---
  {
    id: "home_office",
    question: "How large is your home office?",
    subtext: "If you're self-employed and use part of your home exclusively for business, you can deduct $5 per square foot (up to 300 sq ft).",
    emoji: "\uD83D\uDCBB",
    help: {
      what: "The home office deduction is for self-employed people who use a dedicated space in their home regularly and exclusively for business. W-2 employees do NOT qualify. The space must be used only for work \u2014 a kitchen table doesn't count, but a spare bedroom used as an office does.",
      where: "Measure your dedicated office space. The simplified method is $5 per square foot, up to 300 square feet ($1,500 max). You don't need receipts for this method.",
      howToGet: "Measure the room or area you use exclusively for work. Length \u00D7 width = square feet. A typical spare bedroom is 100-150 sq ft. A large dedicated office might be 200-300 sq ft.",
      dontHave: "Estimate the size of your workspace. A small desk area might be 50 sq ft. A bedroom office is typically 100-150 sq ft. A larger room could be 200+ sq ft. Round to a reasonable number.",
    },
    fields: [
      { key: "homeOfficeSquareFeet", label: "Square feet of home office", placeholder: "150", type: "number" },
    ],
    showWhen: (s) => s.includes("home_office"),
  },
];
