import { TAX_DATA } from "./tax-data";

export interface FinancialProfile {
  // Income
  w2Income: number | null;
  w2Withholding: number | null;
  selfEmploymentIncome: number | null;
  sideHustleIncome: number | null;
  investmentIncomeLTCG: number | null;
  investmentIncomeSTCG: number | null;
  dividendIncome: number | null;
  interestIncome: number | null;
  rentalIncome: number | null;
  retirementIncome: number | null;
  unemploymentIncome: number | null;
  gamblingIncome: number | null;
  otherIncome: number | null;

  // Dependents
  childrenUnder17: number | null;
  otherDependents: number | null;

  // Deductions
  mortgageInterest: number | null;
  propertyTaxes: number | null;
  stateLocalTaxesPaid: number | null;
  charitableDonations: number | null;
  medicalExpenses: number | null;
  studentLoanInterest: number | null;

  // Retirement & savings
  contribution401k: number | null;
  contributionIRA: number | null;
  contributionHSA: number | null;

  // Self-employment specifics
  businessExpenses: number | null;
  homeOfficeSquareFeet: number | null;
  businessMiles: number | null;
}

export function emptyProfile(): FinancialProfile {
  return {
    w2Income: null,
    w2Withholding: null,
    selfEmploymentIncome: null,
    sideHustleIncome: null,
    investmentIncomeLTCG: null,
    investmentIncomeSTCG: null,
    dividendIncome: null,
    interestIncome: null,
    rentalIncome: null,
    retirementIncome: null,
    unemploymentIncome: null,
    gamblingIncome: null,
    otherIncome: null,
    childrenUnder17: null,
    otherDependents: null,
    mortgageInterest: null,
    propertyTaxes: null,
    stateLocalTaxesPaid: null,
    charitableDonations: null,
    medicalExpenses: null,
    studentLoanInterest: null,
    contribution401k: null,
    contributionIRA: null,
    contributionHSA: null,
    businessExpenses: null,
    homeOfficeSquareFeet: null,
    businessMiles: null,
  };
}

export interface TaxCalculation {
  // Income
  grossIncome: number;
  w2Wages: number;
  selfEmploymentNet: number;
  investmentIncome: number;
  otherIncome: number;

  // Adjustments (above-the-line)
  halfSETax: number;
  studentLoanDeduction: number;
  hsaDeduction: number;
  iraDeduction: number;
  totalAdjustments: number;
  agi: number;

  // Deductions
  standardDeduction: number;
  itemizedTotal: number;
  saltDeduction: number;
  useItemized: boolean;
  deductionUsed: number;
  taxableOrdinaryIncome: number;

  // Tax
  ordinaryTax: number;
  ltcgTax: number;
  selfEmploymentTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;

  // Credits
  childTaxCredit: number;
  otherDependentCredit: number;
  totalCredits: number;

  // Final
  taxAfterCredits: number;
  totalWithholding: number;
  estimatedRefundOrOwed: number; // positive = refund, negative = owed

  // Bracket breakdown
  bracketBreakdown: { rate: number; income: number; tax: number }[];
}

const v = (n: number | null) => n ?? 0;

export function calculateTax(
  profile: FinancialProfile,
  filingStatus: string
): TaxCalculation {
  const d = TAX_DATA.deductions;
  const fs = filingStatus as keyof typeof TAX_DATA.brackets;

  // --- Income ---
  const w2Wages = v(profile.w2Income);
  const seGross = v(profile.selfEmploymentIncome) + v(profile.sideHustleIncome);
  const businessDeductions =
    v(profile.businessExpenses) +
    Math.min(v(profile.homeOfficeSquareFeet) * d.homeOfficeSafe, d.homeOfficeMax) +
    v(profile.businessMiles) * d.mileageRate;
  const selfEmploymentNet = Math.max(0, seGross - businessDeductions);

  const ltcg = v(profile.investmentIncomeLTCG);
  const stcg = v(profile.investmentIncomeSTCG);
  const dividends = v(profile.dividendIncome);
  const interest = v(profile.interestIncome);
  const investmentIncome = ltcg + stcg + dividends + interest;

  const rental = v(profile.rentalIncome);
  const retirement = v(profile.retirementIncome);
  const unemployment = v(profile.unemploymentIncome);
  const gambling = v(profile.gamblingIncome);
  const other = v(profile.otherIncome);
  const otherIncomeTotal = rental + retirement + unemployment + gambling + other;

  const grossIncome = w2Wages + selfEmploymentNet + investmentIncome + otherIncomeTotal;

  // --- Self-employment tax ---
  const seEarnings = selfEmploymentNet * 0.9235; // 92.35% of net
  const ssTax = Math.min(seEarnings, TAX_DATA.selfEmployment.ssWageBase) * TAX_DATA.selfEmployment.ssTaxRate;
  const medicareTax = seEarnings * TAX_DATA.selfEmployment.medicareTaxRate;
  const selfEmploymentTax = selfEmploymentNet > 0 ? ssTax + medicareTax : 0;
  const halfSETax = selfEmploymentTax / 2;

  // --- Adjustments (above-the-line) ---
  const studentLoanDeduction = Math.min(v(profile.studentLoanInterest), d.studentLoanMax);
  const hsaDeduction = v(profile.contributionHSA);
  const iraDeduction = Math.min(v(profile.contributionIRA), d.iraMax);
  // Note: W-2 employee 401(k) contributions are already excluded from Box 1 wages,
  // so we don't deduct them again here. Only IRA is an above-the-line adjustment.
  const totalAdjustments = halfSETax + studentLoanDeduction + hsaDeduction + iraDeduction;

  const agi = Math.max(0, grossIncome - totalAdjustments);

  // --- Deductions ---
  const fsKey = filingStatus as keyof typeof TAX_DATA.standardDeduction;
  const standardDeduction = TAX_DATA.standardDeduction[fsKey] ?? TAX_DATA.standardDeduction.single;

  // SALT cap
  const saltTotal = v(profile.propertyTaxes) + v(profile.stateLocalTaxesPaid);
  const saltDeduction = Math.min(saltTotal, d.saltCap);

  // Medical (only amount exceeding 7.5% AGI)
  const medicalDeduction = Math.max(0, v(profile.medicalExpenses) - agi * d.medicalAGIThreshold);

  // Charitable (capped at 60% AGI for cash)
  const charitableDeduction = Math.min(v(profile.charitableDonations), agi * d.charitableCashAGILimit);

  const mortgageDeduction = v(profile.mortgageInterest);

  const itemizedTotal = saltDeduction + medicalDeduction + charitableDeduction + mortgageDeduction;
  const useItemized = itemizedTotal > standardDeduction;
  const deductionUsed = useItemized ? itemizedTotal : standardDeduction;

  // --- Taxable income ---
  // Separate LTCG from ordinary income for different rate treatment
  const ordinaryIncome = grossIncome - ltcg - totalAdjustments;
  const taxableOrdinaryIncome = Math.max(0, ordinaryIncome - deductionUsed);
  const taxableLTCG = Math.max(0, ltcg); // LTCG taxed at preferential rates

  // --- Ordinary income tax (bracket calculation) ---
  const brackets = TAX_DATA.brackets[fs] ?? TAX_DATA.brackets.single;
  const bracketBreakdown: { rate: number; income: number; tax: number }[] = [];
  let remainingIncome = taxableOrdinaryIncome;
  let ordinaryTax = 0;
  let marginalRate: number = brackets[0].rate;

  for (const bracket of brackets) {
    const bracketWidth = bracket.max === Infinity ? Infinity : bracket.max - bracket.min;
    const incomeInBracket = Math.min(remainingIncome, bracketWidth);
    if (incomeInBracket <= 0) break;

    const taxInBracket = incomeInBracket * bracket.rate;
    bracketBreakdown.push({
      rate: bracket.rate,
      income: incomeInBracket,
      tax: taxInBracket,
    });
    ordinaryTax += taxInBracket;
    marginalRate = bracket.rate;
    remainingIncome -= incomeInBracket;
  }

  // --- LTCG tax ---
  const cgBrackets =
    TAX_DATA.capitalGains[fs as keyof typeof TAX_DATA.capitalGains] ??
    TAX_DATA.capitalGains.single;
  let ltcgTax = 0;
  let remainingLTCG = taxableLTCG;
  // LTCG brackets are based on total taxable income
  const totalTaxableForCG = taxableOrdinaryIncome + taxableLTCG;
  let cgFloor = 0;
  for (const bracket of cgBrackets) {
    if (remainingLTCG <= 0) break;
    const bracketTop = bracket.max === Infinity ? Infinity : bracket.max;
    // How much room is left in this bracket after ordinary income
    const roomInBracket = Math.max(0, bracketTop - Math.max(taxableOrdinaryIncome, cgFloor));
    const cgInBracket = Math.min(remainingLTCG, roomInBracket);
    if (cgInBracket > 0) {
      ltcgTax += cgInBracket * bracket.rate;
      remainingLTCG -= cgInBracket;
    }
    cgFloor = bracketTop;
  }

  // --- Credits ---
  const ctc = TAX_DATA.credits.childTaxCredit;
  const numChildren = v(profile.childrenUnder17);
  let childTaxCredit = numChildren * ctc.max;
  // Phaseout
  const ctcPhaseout =
    filingStatus === "married_jointly" ? ctc.phaseoutJoint : ctc.phaseoutSingle;
  if (agi > ctcPhaseout) {
    const reduction = Math.ceil((agi - ctcPhaseout) / 1000) * 50;
    childTaxCredit = Math.max(0, childTaxCredit - reduction);
  }

  const otherDependentCredit = v(profile.otherDependents) * TAX_DATA.credits.otherDependents.max;
  const totalCredits = childTaxCredit + otherDependentCredit;

  // --- Final ---
  const totalTax = ordinaryTax + ltcgTax + selfEmploymentTax;
  const taxAfterCredits = Math.max(0, totalTax - totalCredits);
  const effectiveRate = grossIncome > 0 ? taxAfterCredits / grossIncome : 0;

  const totalWithholding = v(profile.w2Withholding);
  const estimatedRefundOrOwed = totalWithholding - taxAfterCredits;

  return {
    grossIncome,
    w2Wages,
    selfEmploymentNet,
    investmentIncome,
    otherIncome: otherIncomeTotal,
    halfSETax,
    studentLoanDeduction,
    hsaDeduction,
    iraDeduction,
    totalAdjustments,
    agi,
    standardDeduction,
    itemizedTotal,
    saltDeduction,
    useItemized,
    deductionUsed,
    taxableOrdinaryIncome,
    ordinaryTax,
    ltcgTax,
    selfEmploymentTax,
    totalTax,
    effectiveRate,
    marginalRate,
    childTaxCredit,
    otherDependentCredit,
    totalCredits,
    taxAfterCredits,
    totalWithholding,
    estimatedRefundOrOwed,
    bracketBreakdown,
  };
}
