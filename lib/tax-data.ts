// 2025 Tax Year Data — sourced from IRS Rev. Proc. 2024-40
// Filed in 2026. All values verified against irs.gov/filing/federal-income-tax-rates-and-brackets
export const TAX_DATA = {
  year: 2025,
  filingYear: 2026,
  filingDeadline: "April 15, 2026",
  extensionDeadline: "October 15, 2026",
  brackets: {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 },
    ],
    married_jointly: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: Infinity, rate: 0.37 },
    ],
    married_separately: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 375800, rate: 0.35 },
      { min: 375800, max: Infinity, rate: 0.37 },
    ],
    head_of_household: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17000, max: 64850, rate: 0.12 },
      { min: 64850, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250500, rate: 0.32 },
      { min: 250500, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 },
    ],
    // Qualifying Surviving Spouse uses same brackets as Married Filing Jointly
    widow: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: Infinity, rate: 0.37 },
    ],
  },
  standardDeduction: {
    single: 15000,
    married_jointly: 30000,
    married_separately: 15000,
    head_of_household: 22500,
    widow: 30000,
    additional_65_single: 2000,
    additional_65_married: 1600,
  },
  capitalGains: {
    single: [
      { min: 0, max: 48350, rate: 0 },
      { min: 48350, max: 533400, rate: 0.15 },
      { min: 533400, max: Infinity, rate: 0.20 },
    ],
    married_jointly: [
      { min: 0, max: 96700, rate: 0 },
      { min: 96700, max: 600050, rate: 0.15 },
      { min: 600050, max: Infinity, rate: 0.20 },
    ],
    married_separately: [
      { min: 0, max: 48350, rate: 0 },
      { min: 48350, max: 300000, rate: 0.15 },
      { min: 300000, max: Infinity, rate: 0.20 },
    ],
    head_of_household: [
      { min: 0, max: 64750, rate: 0 },
      { min: 64750, max: 566700, rate: 0.15 },
      { min: 566700, max: Infinity, rate: 0.20 },
    ],
    // Qualifying Surviving Spouse uses same rates as Married Filing Jointly
    widow: [
      { min: 0, max: 96700, rate: 0 },
      { min: 96700, max: 600050, rate: 0.15 },
      { min: 600050, max: Infinity, rate: 0.20 },
    ],
  },
  selfEmployment: {
    ssTaxRate: 0.124,
    medicareTaxRate: 0.029,
    totalSERate: 0.153,
    ssWageBase: 176100,
    additionalMedicareThresholdSingle: 200000,
    additionalMedicareThresholdJoint: 250000,
    additionalMedicareRate: 0.009,
    qbiDeductionRate: 0.20,
    qbiPhaseoutSingle: 197300,
    qbiPhaseoutJoint: 394600,
  },
  estimatedTax: {
    threshold: 1000,
    quarterlyDates: [
      { q: "Q1", period: "Jan 1 \u2013 Mar 31", due: "April 15, 2026" },
      { q: "Q2", period: "Apr 1 \u2013 May 31", due: "June 15, 2026" },
      { q: "Q3", period: "Jun 1 \u2013 Aug 31", due: "September 15, 2026" },
      { q: "Q4", period: "Sep 1 \u2013 Dec 31", due: "January 15, 2027" },
    ],
    safeHarborHighIncome: 150000,
  },
  credits: {
    childTaxCredit: {
      max: 2000,
      refundable: 1700,
      ageLimit: 17,
      phaseoutSingle: 200000,
      phaseoutJoint: 400000,
    },
    eitc: {
      noChildren: { max: 649, agiSingle: 19104, agiJoint: 26214 },
      oneChild: { max: 4328, agiSingle: 50434, agiJoint: 57554 },
      twoChildren: { max: 7152, agiSingle: 57310, agiJoint: 64430 },
      threeOrMore: { max: 8046, agiSingle: 61555, agiJoint: 68675 },
      investmentIncomeLimit: 11950,
    },
    americanOpportunity: { max: 2500, refundable: 1000, yearsAvailable: 4 },
    lifetimeLearning: { max: 2000 },
    childCare: { maxExpenses1: 3000, maxExpenses2: 6000, maxPercent: 35 },
    saversCredit: { maxContribution: 2000, agiSingle: 39500, agiJoint: 79000 },
    evCredit: { maxNew: 7500, maxUsed: 4000 },
    otherDependents: { max: 500 },
  },
  deductions: {
    saltCap: 10000,
    mortgageDebtLimit: 750000,
    medicalAGIThreshold: 0.075,
    charitableCashAGILimit: 0.60,
    studentLoanMax: 2500,
    hsaSelf: 4300,
    hsaFamily: 8550,
    hsaCatchUp55: 1000,
    fsaLimit: 3300,
    fsaCarryover: 660,
    iraMax: 7000,
    iraCatchUp50: 1000,
    k401Limit: 23500,
    k401CatchUp50: 7500,
    mileageRate: 0.70,
    homeOfficeSafe: 5,
    homeOfficeMax: 1500,
  },
  filingThresholds: {
    single_under65: 15000,
    single_65plus: 17000,
    married_jointly_both_under65: 30000,
    married_jointly_one_65plus: 31600,
    married_jointly_both_65plus: 33200,
    married_separately: 5,
    head_of_household_under65: 22500,
    head_of_household_65plus: 24500,
    selfEmployment: 400,
  },
} as const;

export const fmt = (n: number) =>
  n >= 1e15 ? "and above" : "$" + n.toLocaleString();

export const fmtD = (n: number) => "$" + n.toLocaleString();

export const pct = (r: number) => (r * 100).toFixed(1) + "%";
