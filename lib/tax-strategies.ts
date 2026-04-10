import { TAX_DATA, fmtD } from "./tax-data";
import type { FinancialProfile } from "./financial-profile";
import type { TaxCalculation } from "./financial-profile";

export interface TaxStrategy {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  howItWorks: string;
  example: string;
  whoQualifies: string;
  savingsRange: string;
  steps: string[];
  proTip?: string;
  warning?: string;
  irsRule: string;
}

const v = (n: number | null) => n ?? 0;

export function buildStrategies(
  profile: FinancialProfile,
  filingStatus: string,
  situations: string[],
  calc: TaxCalculation
): TaxStrategy[] {
  const s = new Set(situations);
  const d = TAX_DATA.deductions;
  const strategies: TaxStrategy[] = [];
  const isSE = s.has("self_employed") || s.has("side_hustle");
  const marginalPct = `${(calc.marginalRate * 100).toFixed(0)}%`;

  // ============================================
  // SELF-EMPLOYED STRATEGIES
  // ============================================

  if (isSE && s.has("home_office")) {
    const currentSqft = v(profile.homeOfficeSquareFeet);
    const simplifiedMax = Math.min(currentSqft * d.homeOfficeSafe, d.homeOfficeMax);

    strategies.push({
      id: "home_office_actual",
      icon: "\uD83C\uDFE0",
      title: "Home Office: Switch to Actual Expense Method",
      tagline: `The simplified method caps at $${d.homeOfficeMax.toLocaleString()}. The actual method often saves 2-5x more.`,
      howItWorks: `The IRS gives you two ways to calculate your home office deduction. The simplified method is easy ($${d.homeOfficeSafe}/sqft, max $${d.homeOfficeMax.toLocaleString()}), but the actual expense method lets you deduct a percentage of your rent/mortgage, utilities, insurance, repairs, and depreciation based on the square footage your office uses relative to your whole home. If your office is 15% of your home, you deduct 15% of ALL those costs.`,
      example: `Say your home is 1,200 sqft and your office is 180 sqft (15%). Your annual housing costs: $18,000 rent + $2,400 utilities + $1,200 insurance + $600 repairs = $22,200. Your deduction: 15% × $22,200 = $3,330 — more than double the $900 simplified method.`,
      whoQualifies: "Self-employed people with a dedicated home office space used regularly and exclusively for business.",
      savingsRange: `$${Math.round(simplifiedMax * 0.5).toLocaleString()} – $${Math.round(simplifiedMax * 4).toLocaleString()} more than simplified method`,
      steps: [
        "Measure your office as a percentage of your home's total square footage",
        "Add up annual costs: rent or mortgage interest, property taxes, utilities, insurance, repairs, depreciation",
        "Multiply total costs by your office percentage",
        "Compare to the simplified method and use whichever is higher",
        "Keep records of all housing expenses — the IRS may ask for proof",
      ],
      proTip: "You can switch between simplified and actual methods each year. Calculate both and pick the winner. Many people leave thousands on the table by defaulting to simplified because it's easier.",
      irsRule: "IRS Publication 587 — Business Use of Your Home",
    });
  }

  if (isSE) {
    const seNet = calc.selfEmploymentNet;
    const currentMiles = v(profile.businessMiles);
    const mileageDeduction = currentMiles * d.mileageRate;

    if (currentMiles > 0 || seNet > 10000) {
      strategies.push({
        id: "vehicle_optimization",
        icon: "\uD83D\uDE97",
        title: "Vehicle Deduction: Compare Both Methods",
        tagline: `At $${d.mileageRate}/mile, 15,000 business miles = $${(15000 * d.mileageRate).toLocaleString()} deduction. But actual expenses might beat that.`,
        howItWorks: `You have two options: (1) Standard mileage rate ($${d.mileageRate}/mile in ${TAX_DATA.year}), or (2) Actual expenses — gas, insurance, repairs, depreciation, registration, loan interest — multiplied by your business-use percentage. If you drive an expensive car or have high maintenance costs, actual expenses often win. If you drive a cheap, fuel-efficient car, mileage rate usually wins.`,
        example: `15,000 business miles out of 20,000 total (75% business use). Standard mileage: 15,000 × $${d.mileageRate} = $${(15000 * d.mileageRate).toLocaleString()}. Actual expenses: $4,000 gas + $2,000 insurance + $1,500 maintenance + $4,000 depreciation = $11,500 × 75% = $8,625. In this case, actual expenses save almost $1,600 more.`,
        whoQualifies: "Self-employed people who use a vehicle for business. Must choose one method for the year.",
        savingsRange: "$500 – $5,000+ depending on vehicle and usage",
        steps: [
          "Track every business mile with a mileage app (Everlance, MileIQ, Stride — all free)",
          "Also keep records of all vehicle expenses throughout the year",
          "At tax time, calculate both methods and use whichever gives you a larger deduction",
          "If you use standard mileage the first year, you can switch to actual later. But if you start with actual, you're locked in for that vehicle",
        ],
        proTip: "Commuting from home to a regular office doesn't count. But if you work from home (even some days), ALL drives to client meetings, the post office, or Office Depot count as business miles.",
        warning: "You must have a mileage log. Without records, the IRS can disallow the entire deduction. Start tracking NOW — retroactive logs are a red flag.",
        irsRule: "IRS Publication 463 — Travel, Gift, and Car Expenses",
      });
    }

    // SEP-IRA / Solo 401(k)
    if (seNet > 20000) {
      const sepMax = Math.round(Math.min(seNet * 0.25, 69000));
      const solo401kEmployeeMax = Math.min(23000, seNet);
      const solo401kEmployerMax = Math.round(Math.min(seNet * 0.25, 69000 - solo401kEmployeeMax));
      const solo401kTotal = Math.min(solo401kEmployeeMax + solo401kEmployerMax, 69000);
      const sepSavings = Math.round(sepMax * calc.marginalRate);
      const solo401kSavings = Math.round(solo401kTotal * calc.marginalRate);

      strategies.push({
        id: "sep_ira_solo_401k",
        icon: "\uD83C\uDFF0",
        title: "SEP-IRA or Solo 401(k) — Shelter Way More Than a Regular IRA",
        tagline: `A regular IRA caps at $${d.iraMax.toLocaleString()}. A SEP-IRA lets you shelter up to ${fmtD(sepMax)}. A Solo 401(k) up to ${fmtD(solo401kTotal)}.`,
        howItWorks: `As a self-employed person, you can open retirement accounts with MUCH higher limits than a regular IRA. A SEP-IRA lets you contribute up to 25% of net self-employment earnings (max $69,000). A Solo 401(k) lets you contribute as both "employee" ($23,000) AND "employer" (25% of earnings), often allowing even more. Both are fully tax-deductible — they directly reduce your taxable income.`,
        example: `With ${fmtD(Math.round(seNet))} in self-employment income at a ${marginalPct} marginal rate: a SEP-IRA contribution of ${fmtD(sepMax)} saves you ~${fmtD(sepSavings)} in taxes. A Solo 401(k) contribution of ${fmtD(solo401kTotal)} saves ~${fmtD(solo401kSavings)}. Compare that to a regular IRA's max of ${fmtD(d.iraMax)}.`,
        whoQualifies: "Anyone with self-employment income (freelancers, gig workers, side hustlers). You can have these IN ADDITION to a workplace 401(k).",
        savingsRange: `${fmtD(Math.round(sepMax * 0.1))} – ${fmtD(solo401kSavings)} in tax savings`,
        steps: [
          "Choose between SEP-IRA (simpler, good if it's just you) and Solo 401(k) (more complex, allows higher contributions + Roth option)",
          "Open the account at any major brokerage (Fidelity, Vanguard, Schwab) — it's free and takes 15 minutes",
          "SEP-IRA: contribute up to 25% of net SE earnings (after the SE tax deduction)",
          "Solo 401(k): must be set up by Dec 31, but contributions can be made until your tax filing deadline",
          "Contribute as much as you can afford — every dollar saves you taxes now and grows tax-free until retirement",
        ],
        proTip: "A Solo 401(k) also has a Roth option, letting you contribute after-tax money that grows and comes out completely tax-free. If you expect higher income in the future, this is incredibly powerful.",
        irsRule: "IRS — Retirement Plans for Self-Employed People",
      });
    }

    // Hire your kids
    if (s.has("parent") && v(profile.childrenUnder17) > 0 && seNet > 15000) {
      const kidIncome = Math.min(TAX_DATA.standardDeduction.single, Math.round(seNet * 0.15));
      const kidSavings = Math.round(kidIncome * (calc.marginalRate + TAX_DATA.selfEmployment.totalSERate));

      strategies.push({
        id: "hire_kids",
        icon: "\uD83D\uDC67",
        title: "Hire Your Kids — Shift Income to a 0% Tax Bracket",
        tagline: `Pay your child up to ${fmtD(TAX_DATA.standardDeduction.single)} and they pay $0 in taxes. You deduct it as a business expense.`,
        howItWorks: `If you're self-employed, you can hire your children to do legitimate work for your business. Their wages are a deductible business expense for YOU, reducing both your income tax AND self-employment tax. Meanwhile, your child can earn up to ${fmtD(TAX_DATA.standardDeduction.single)} (the standard deduction) and pay ZERO federal income tax. If your child is under 18 and you're a sole proprietor, their wages are also exempt from Social Security and Medicare taxes.`,
        example: `You pay your 14-year-old ${fmtD(kidIncome)} to help with filing, cleaning the office, managing social media, or assisting with inventory. Your tax savings: the ${fmtD(kidIncome)} deduction saves you ~${fmtD(kidSavings)} in income tax + SE tax. Your child owes $0 in tax. The money can go into a Roth IRA for them — tax-free growth for 50+ years.`,
        whoQualifies: "Self-employed parents (sole proprietor or single-member LLC) with children who can perform legitimate work. The work must be real, age-appropriate, and paid at a reasonable rate.",
        savingsRange: `${fmtD(Math.round(kidSavings * 0.5))} – ${fmtD(kidSavings)} per child per year`,
        steps: [
          "Identify real tasks your child can do: filing, organizing, data entry, cleaning, social media, packaging, deliveries",
          "Pay a reasonable wage for the work (check what other businesses pay for similar tasks)",
          "Keep time sheets and records of work performed — treat it like a real job",
          "Pay by check or transfer (not cash) so there's a paper trail",
          "If under 18 and you're a sole proprietor, no payroll taxes apply (no need for payroll software)",
          "Consider having your child contribute their earnings to a Roth IRA for compound growth",
        ],
        proTip: "Put the child's earnings into a Roth IRA. A 14-year-old who contributes $6,000/year for 4 years and never adds another penny will have ~$400,000+ by age 65 (at 8% returns). That's generational wealth from a tax deduction.",
        warning: "The work must be legitimate and age-appropriate. Paying your toddler $14,000 for 'consulting' will not fly. The IRS requires reasonable compensation for actual work performed.",
        irsRule: "IRS Publication 929 — Tax Rules for Children and Dependents",
      });
    }

    // Section 179 / Bonus Depreciation
    if (seNet > 10000) {
      strategies.push({
        id: "section_179",
        icon: "\uD83D\uDCBB",
        title: "Section 179: Deduct Equipment in Full This Year",
        tagline: "Buy a laptop, camera, tools, or equipment for your business? Deduct the full cost immediately instead of spreading it over years.",
        howItWorks: `Normally, expensive business purchases must be "depreciated" over several years. Section 179 lets you deduct the FULL cost of qualifying equipment in the year you buy it, up to $1,220,000. This includes computers, phones, cameras, furniture, software, tools, vehicles (with limits), and most tangible business property. Bonus depreciation (currently 60% for 2025) handles the rest.`,
        example: `You buy a $2,000 laptop and a $500 desk for your business. Without Section 179, you'd deduct ~$500/year over 5 years. With Section 179, you deduct the full $2,500 THIS year, saving you ${fmtD(Math.round(2500 * calc.marginalRate))} in taxes immediately at your ${marginalPct} rate.`,
        whoQualifies: "Any self-employed person who buys equipment, tools, technology, or furniture for business use.",
        savingsRange: `Varies — ${marginalPct} of the purchase price (your marginal rate)`,
        steps: [
          "Keep receipts for all business equipment purchases",
          "At tax time, elect Section 179 on Form 4562",
          "If the item is also used personally, only deduct the business-use percentage",
          "Consider timing large purchases: buying in December deducts the full amount this year",
        ],
        proTip: "Need a new computer or phone? Buy it before December 31 to deduct it on this year's return. The tax savings effectively give you a discount equal to your marginal rate.",
        irsRule: "IRS Section 179 Deduction, IRS Publication 946 — How to Depreciate Property",
      });
    }

    // Health insurance deduction
    strategies.push({
      id: "se_health_insurance",
      icon: "\uD83C\uDFE5",
      title: "Deduct Your Health Insurance Premiums",
      tagline: "Self-employed? Your health, dental, and vision premiums are 100% deductible — even with the standard deduction.",
      howItWorks: `If you're self-employed and pay for your own health insurance, you can deduct 100% of your premiums as an above-the-line deduction. This means you get the tax break EVEN IF you take the standard deduction (unlike most medical expenses which require itemizing). This includes health, dental, and vision insurance for you, your spouse, and your dependents under age 27.`,
      example: `You pay $500/month ($6,000/year) for health insurance. The full $6,000 is deductible above the line. At your ${marginalPct} rate, this saves you ${fmtD(Math.round(6000 * calc.marginalRate))} in income tax, plus it reduces your self-employment tax base too.`,
      whoQualifies: "Self-employed individuals who aren't eligible for employer-sponsored coverage through their own or a spouse's job.",
      savingsRange: `${fmtD(Math.round(3000 * calc.marginalRate))} – ${fmtD(Math.round(12000 * calc.marginalRate))}+ depending on premium costs`,
      steps: [
        "Total up all health, dental, and vision premiums you paid this year",
        "If you bought insurance through the marketplace (healthcare.gov), use Form 1095-A",
        "Deduct on Schedule 1, Line 17 — it reduces your AGI directly",
        "If your spouse has employer coverage available to you, you can't use this deduction",
      ],
      proTip: "This deduction reduces your AGI, which can help you qualify for other tax breaks that phase out at higher incomes (like the EITC, education credits, and IRA deductions).",
      irsRule: "IRS Publication 535 — Business Expenses (Chapter 6)",
    });

    // Business meals
    strategies.push({
      id: "business_meals",
      icon: "\uD83C\uDF7D\uFE0F",
      title: "Deduct Business Meals at 50%",
      tagline: "Lunch with a client, coffee meeting, or meals while traveling for work — 50% is deductible.",
      howItWorks: `When you eat a meal with a client, potential client, or business associate where business is discussed, 50% of the cost is tax-deductible. Meals while traveling overnight for business are also 50% deductible. This applies to restaurants, takeout, delivery — anywhere you buy food in a business context. Entertainment (concerts, sports) is NOT deductible, but the meal portion of an entertainment event IS.`,
      example: `You spend $200/month on business lunches and coffee meetings ($2,400/year). 50% = $1,200 deduction, saving you ${fmtD(Math.round(1200 * calc.marginalRate))} at your ${marginalPct} rate. If you travel for work, add hotel meals too.`,
      whoQualifies: "Self-employed people who buy meals in connection with business activities.",
      savingsRange: `${fmtD(Math.round(500 * calc.marginalRate))} – ${fmtD(Math.round(3000 * calc.marginalRate))}+ per year`,
      steps: [
        "Keep receipts for all business meals (photo them into an app like Expensify or just your camera roll)",
        "Write the business purpose and who attended on each receipt (or log it in a spreadsheet)",
        "Deduct 50% of the meal cost on Schedule C",
        "Track these separately from other business expenses",
      ],
      proTip: "Get in the habit of snapping a photo of every receipt and noting who you met with and what you discussed. A quick note in your phone takes 10 seconds and can save you hundreds at tax time.",
      warning: "Lavish or extravagant meals may be scrutinized. The IRS expects reasonable amounts — a $30 lunch is fine, a $300 dinner for two raises eyebrows.",
      irsRule: "IRS Publication 463 — Travel, Gift, and Car Expenses",
    });
  }

  // ============================================
  // INVESTOR STRATEGIES
  // ============================================

  if (s.has("investor") && s.has("charity") && v(profile.investmentIncomeLTCG) > 0) {
    const ltcg = v(profile.investmentIncomeLTCG);
    const donations = v(profile.charitableDonations);
    if (donations > 0) {
      strategies.push({
        id: "donate_stock",
        icon: "\uD83C\uDF81",
        title: "Donate Appreciated Stock Instead of Cash",
        tagline: "Give the same amount to charity but skip the capital gains tax entirely.",
        howItWorks: `When you donate appreciated stock (stock that has gone up in value) directly to a charity, two things happen: (1) You get a tax deduction for the FULL market value, and (2) You pay ZERO capital gains tax on the appreciation. If you donated cash instead, you'd get the same deduction but still owe capital gains tax when you eventually sell the stock. This is like getting a bonus deduction for free.`,
        example: `You want to donate $5,000 to charity. Option A: Sell stock, pay ~$750 in capital gains tax (15%), donate $5,000 cash = costs you $5,750. Option B: Donate $5,000 of stock directly = costs you $5,000 and the charity gets the same amount. You save $750 and get the same deduction.`,
        whoQualifies: "Anyone who owns stock/investments that have appreciated in value AND makes charitable donations. The stock must have been held for over 1 year.",
        savingsRange: "15-20% of the donated stock's gain (the capital gains tax you skip)",
        steps: [
          "Identify stocks in your portfolio with the largest unrealized gains (held over 1 year)",
          "Contact the charity and ask for their brokerage account info for stock donations (most large charities have this)",
          "Transfer the shares directly — do NOT sell first and donate the cash",
          "You get a deduction for the full market value on the transfer date",
          "Use the cash you would have donated to buy the same stock back at the new cost basis",
        ],
        proTip: "Buy the same stock back immediately after donating. You now own the same position but with a stepped-up cost basis, meaning less taxable gain in the future. This is sometimes called a 'supercharged donation.'",
        irsRule: "IRS Publication 526 — Charitable Contributions",
      });
    }
  }

  if (s.has("investor")) {
    const stcg = v(profile.investmentIncomeSTCG);
    if (stcg > 0) {
      strategies.push({
        id: "hold_longer",
        icon: "\u23F3",
        title: "Hold Investments for 1 Year to Cut Your Tax Rate in Half",
        tagline: `Short-term gains are taxed at ${marginalPct}. Long-term gains could be taxed at 0% or 15%.`,
        howItWorks: `You reported ${fmtD(stcg)} in short-term capital gains, which are taxed at your full ordinary income rate of ${marginalPct}. If you had held those investments for just over 1 year, they would be taxed as long-term capital gains — at 0%, 15%, or 20% depending on your income. For most people, this cuts the tax rate roughly in half.`,
        example: `${fmtD(stcg)} taxed at ${marginalPct} (short-term) = ${fmtD(Math.round(stcg * calc.marginalRate))} in tax. The same gain taxed at 15% (long-term) = ${fmtD(Math.round(stcg * 0.15))}. Difference: ${fmtD(Math.round(stcg * (calc.marginalRate - 0.15)))} saved by waiting.`,
        whoQualifies: "Anyone who sells investments. Applies to stocks, crypto, real estate, and most other assets.",
        savingsRange: `${fmtD(Math.round(stcg * 0.05))} – ${fmtD(Math.round(stcg * 0.22))} on this year's gains alone`,
        steps: [
          "Before selling any investment, check when you bought it",
          "If it's been less than 1 year, consider waiting until the 1-year anniversary",
          "Set calendar reminders for when positions cross the 1-year threshold",
          "If you need the money now, the tax difference may not be worth waiting — but at least you're making an informed decision",
        ],
        proTip: "For crypto, the same rules apply. Every trade (including crypto-to-crypto swaps) is a taxable event. Holding for 1 year before selling saves significant taxes.",
        irsRule: "IRS Topic 409 — Capital Gains and Losses",
      });
    }
  }

  // ============================================
  // GENERAL STRATEGIES
  // ============================================

  // Timing: accelerate deductions
  if (calc.taxableOrdinaryIncome > 30000) {
    strategies.push({
      id: "timing",
      icon: "\uD83D\uDCC5",
      title: "Year-End Tax Timing: Pull Deductions Forward",
      tagline: "A dollar deducted this year is worth more than the same dollar deducted next year.",
      howItWorks: `Before December 31, look for ways to pull next year's deductible expenses into this year. Prepay January's mortgage (extra month of interest), make January's state tax payment early, buy business supplies in December, max out retirement contributions, or make next year's charitable donations now. This concentrates deductions in one year, which can push you over the itemizing threshold or into a lower bracket.`,
      example: `At your ${marginalPct} marginal rate, prepaying $5,000 in deductible expenses before Dec 31 (instead of in January) saves you ${fmtD(Math.round(5000 * calc.marginalRate))} in taxes a year earlier. If you expect lower income next year, this is especially powerful — the deduction is worth more at a higher rate.`,
      whoQualifies: "Everyone — but especially powerful if you're close to the itemizing threshold, expecting a high-income year, or self-employed.",
      savingsRange: `Varies — ${marginalPct} of whatever you accelerate`,
      steps: [
        "Before Dec 31: prepay January's mortgage payment (counts as this year's interest)",
        "Make your January state estimated tax payment before Dec 31 (within the $10K SALT cap)",
        "Buy any planned business equipment or supplies before year-end",
        "Make charitable donations — consider bunching two years' worth into one year",
        "Max out retirement contributions (IRA contributions can be made until April 15)",
      ],
      proTip: "Flip this strategy if you expect HIGHER income next year — defer deductions to next year when they'll save more at a higher rate. Tax planning is about matching deductions to your highest-income years.",
      irsRule: "General tax planning principle — IRS Publication 17, Chapter 1",
    });
  }

  // Roth conversion ladder
  if (s.has("retirement_contrib") && calc.marginalRate <= 0.22) {
    strategies.push({
      id: "roth_conversion",
      icon: "\uD83D\uDD04",
      title: "Roth Conversion: Pay Low Taxes Now, Never Pay Again",
      tagline: `You're in the ${marginalPct} bracket — a historically low rate. Lock it in by converting Traditional to Roth.`,
      howItWorks: `If you have money in a Traditional IRA or old 401(k), you can convert some to a Roth IRA. You'll pay income tax on the converted amount NOW at your current ${marginalPct} rate, but then it grows and comes out 100% tax-free forever. If you expect your tax rate to be higher in the future (which most people do), you're essentially prepaying taxes at a discount.`,
      example: `Converting $10,000 from Traditional to Roth at ${marginalPct} costs you ${fmtD(Math.round(10000 * calc.marginalRate))} in taxes now. But if that money grows to $40,000 by retirement and you're in the 24% bracket then, you'll have saved $${(40000 * 0.24 - 10000 * calc.marginalRate).toLocaleString()} in taxes. The earlier you convert, the more tax-free growth you get.`,
      whoQualifies: "Anyone with Traditional IRA or old 401(k) funds, especially if currently in a lower tax bracket than they expect in retirement.",
      savingsRange: "Potentially tens of thousands over a lifetime — depends on amount converted, growth, and future tax rates",
      steps: [
        "Check your current Traditional IRA or old 401(k) balance",
        "Calculate how much you can convert without pushing into the next tax bracket",
        "Contact your brokerage to initiate a Roth conversion (it's usually a few clicks online)",
        "Set aside money to pay the tax bill (don't pay it from the converted amount — that reduces your growth)",
        "Consider converting gradually over several years to stay in lower brackets",
      ],
      proTip: "The 'sweet spot' is converting just enough to fill up your current bracket without spilling into the next one. Convert in low-income years (between jobs, early career, semi-retirement) for maximum benefit.",
      irsRule: "IRS — Roth Conversions, IRS Publication 590-A",
    });
  }

  // Qualified Business Income deduction
  if (isSE && calc.selfEmploymentNet > 5000) {
    const qbiDeduction = Math.round(calc.selfEmploymentNet * TAX_DATA.selfEmployment.qbiDeductionRate);
    const qbiSavings = Math.round(qbiDeduction * calc.marginalRate);

    strategies.push({
      id: "qbi",
      icon: "\uD83D\uDCC4",
      title: "QBI Deduction: Free 20% Off Your Business Income",
      tagline: `Deduct 20% of your qualified business income — that's ${fmtD(qbiDeduction)} you can deduct just for being self-employed.`,
      howItWorks: `Section 199A gives self-employed people (and other pass-through business owners) a deduction equal to 20% of their qualified business income (QBI). This is a "below the line" deduction that reduces your taxable income AFTER your AGI is calculated. You get this ON TOP of all your other business deductions. At your ${marginalPct} rate, a ${fmtD(qbiDeduction)} QBI deduction saves you ~${fmtD(qbiSavings)}.`,
      example: `Net SE income: ${fmtD(Math.round(calc.selfEmploymentNet))}. QBI deduction: 20% = ${fmtD(qbiDeduction)}. Tax savings at ${marginalPct}: ~${fmtD(qbiSavings)}. This happens automatically when you file — but make sure your tax software catches it.`,
      whoQualifies: `Self-employed individuals and pass-through business owners with taxable income below ${fmtD(TAX_DATA.selfEmployment.qbiPhaseoutSingle)} (single) or ${fmtD(TAX_DATA.selfEmployment.qbiPhaseoutJoint)} (joint). Above these thresholds, the deduction phases out for certain service businesses.`,
      savingsRange: `${fmtD(Math.round(qbiSavings * 0.8))} – ${fmtD(qbiSavings)}`,
      steps: [
        "This should be calculated automatically by tax software — but VERIFY it's there",
        "Look for the Section 199A or QBI deduction on your return",
        "If using a CPA, ask specifically about your QBI deduction",
        "If your income is above the phaseout, discuss with a tax professional whether your business type qualifies",
      ],
      proTip: "Some self-employed people miss this entirely when doing taxes manually. It's literally free money — 20% off your business profits for no extra effort. If your tax software doesn't show it, switch software.",
      irsRule: "IRS Section 199A — Qualified Business Income Deduction",
    });
  }

  // Medical expense bunching
  if (s.has("medical") && v(profile.medicalExpenses) > 0) {
    const threshold = Math.round(calc.agi * 0.075);
    const currentMedical = v(profile.medicalExpenses);
    const gap = threshold - currentMedical;

    if (gap > 0 && gap < 5000) {
      strategies.push({
        id: "medical_bunching",
        icon: "\uD83E\uDE7A",
        title: "Bunch Medical Expenses Into One Year",
        tagline: `You're only ${fmtD(gap)} away from the 7.5% AGI threshold. Schedule elective procedures before Dec 31.`,
        howItWorks: `Medical expenses are only deductible when they exceed 7.5% of your AGI (${fmtD(threshold)}). You've spent ${fmtD(currentMedical)} — just ${fmtD(gap)} short. By scheduling planned medical work (dental, vision, elective procedures) before December 31, you can cross the threshold and deduct everything above it. If you spread these expenses across two years, neither year crosses the threshold and you deduct nothing.`,
        example: `You schedule a $${(gap + 1000).toLocaleString()} dental procedure in December instead of January. Now your medical total crosses the threshold, and you can deduct $${(currentMedical + gap + 1000 - threshold).toLocaleString()} — saving you ${fmtD(Math.round((currentMedical + gap + 1000 - threshold) * calc.marginalRate))} in taxes.`,
        whoQualifies: "Anyone with significant medical expenses who is close to the 7.5% AGI threshold and who itemizes deductions.",
        savingsRange: `${fmtD(Math.round(2000 * calc.marginalRate))} – ${fmtD(Math.round(10000 * calc.marginalRate))}+ depending on expenses`,
        steps: [
          "Add up all medical expenses for the year (insurance premiums if not pre-tax, copays, prescriptions, dental, vision, surgeries)",
          "Calculate your threshold: AGI × 7.5% = " + fmtD(threshold),
          "If you're close, schedule any planned medical/dental work before December 31",
          "Prepay January prescriptions in December if your pharmacy allows it",
          "Stock up on glasses, contacts, or medical supplies before year-end",
        ],
        proTip: "This also applies to orthodontia, LASIK, hearing aids, and other big-ticket medical expenses. If you're considering any of these, timing them into a year where you're close to the threshold maximizes the tax benefit.",
        irsRule: "IRS Publication 502 — Medical and Dental Expenses",
      });
    }
  }

  return strategies;
}
