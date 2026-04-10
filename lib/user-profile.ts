// User profile built from the onboarding flow — drives personalization throughout the app
export interface UserProfile {
  ageGroup: string | null;
  isStudent: boolean;
  isFirstTimeFiler: boolean;
  employmentType: string | null;
  state: string | null;
  persona: string;
}

export function emptyUserProfile(): UserProfile {
  return {
    ageGroup: null,
    isStudent: false,
    isFirstTimeFiler: false,
    employmentType: null,
    state: null,
    persona: "general",
  };
}

export const AGE_GROUPS = [
  { id: "under18", label: "Under 18", emoji: "\uD83C\uDFEB", desc: "High school student or younger" },
  { id: "18-24", label: "18–24", emoji: "\uD83C\uDF93", desc: "College age or just starting out" },
  { id: "25-34", label: "25–34", emoji: "\uD83D\uDCBC", desc: "Early career" },
  { id: "35-49", label: "35–49", emoji: "\uD83C\uDFE0", desc: "Building a career and family" },
  { id: "50-64", label: "50–64", emoji: "\uD83D\uDCCA", desc: "Peak earning years" },
  { id: "65plus", label: "65+", emoji: "\uD83C\uDFD6\uFE0F", desc: "Retirement age" },
];

export const EMPLOYMENT_TYPES = [
  { id: "w2_only", label: "Regular job (W-2)", emoji: "\uD83D\uDCBC", desc: "Employer takes taxes out of my paycheck" },
  { id: "self_employed", label: "Self-employed / Freelance", emoji: "\uD83C\uDFD7\uFE0F", desc: "I work for myself or do contract work" },
  { id: "both", label: "Both — job + side income", emoji: "\uD83D\uDD00", desc: "W-2 job plus freelance or gig work" },
  { id: "gig_only", label: "Gig work only", emoji: "\uD83D\uDE97", desc: "DoorDash, Uber, Instacart, etc." },
  { id: "not_working", label: "Not currently working", emoji: "\uD83D\uDCCB", desc: "Unemployed, between jobs, or stay-at-home" },
  { id: "retired", label: "Retired", emoji: "\uD83C\uDFD6\uFE0F", desc: "Living on retirement income" },
];

// States with no income tax
export const NO_INCOME_TAX_STATES = [
  "AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY",
];

export const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

// Derive persona from profile answers
export function derivePersona(profile: UserProfile, knowledgeLevel: string): string {
  const age = profile.ageGroup;
  const emp = profile.employmentType;

  if (age === "under18") return "teen_worker";
  if (age === "18-24" && profile.isStudent) return "college_student";
  if (age === "18-24" && profile.isFirstTimeFiler) return "young_first_timer";
  if (age === "18-24") return "young_worker";
  if (age === "65plus" || emp === "retired") return "retiree";
  if (emp === "self_employed" || emp === "gig_only") return "freelancer";
  if (emp === "both") return "side_hustler";
  if (age === "50-64") return "pre_retirement";
  if (age === "35-49") return "mid_career";
  if (age === "25-34" && (emp === "self_employed" || emp === "both")) return "freelancer";
  if (age === "25-34") return "young_professional";
  return "general";
}

// Get persona-appropriate example context for AI prompts
export function getPersonaContext(persona: string, state: string | null): string {
  const stateNote = state
    ? NO_INCOME_TAX_STATES.includes(state)
      ? ` They live in a state with no income tax (${state}).`
      : ` They live in ${state}.`
    : "";

  const personas: Record<string, string> = {
    teen_worker: `This is a teenager with a part-time job (fast food, retail, etc.). Use examples about hourly wages, summer jobs, and small paychecks. They likely live with parents who claim them as a dependent.${stateNote}`,
    college_student: `This is a college student, likely working part-time or over summers. Use examples about campus jobs, tutoring, barista work. They may have student loans and their parents may still claim them. They may receive financial aid (not taxable) and scholarships (sometimes taxable).${stateNote}`,
    young_first_timer: `This is an 18-24 year old filing taxes for the first time. They're likely nervous and don't know where to start. Use simple, encouraging language. Examples should involve first jobs, W-2s from retail or food service, and small incomes.${stateNote}`,
    young_worker: `This is a young adult (18-24) with some work experience. They may have had a few jobs. Use examples about starting salaries, apartment renting, and building financial habits.${stateNote}`,
    young_professional: `This is a 25-34 year old professional. Use examples about salary negotiations, 401(k) decisions, and first-time homebuying. They're building their career and may be thinking about retirement savings.${stateNote}`,
    freelancer: `This is a self-employed person or freelancer. Use examples about client invoices, business expenses, quarterly taxes, and Schedule C. They need to understand self-employment tax and business deductions.${stateNote}`,
    side_hustler: `This person has a regular W-2 job plus side income (gig work, freelancing, selling online). Use examples about managing two income types, when side income triggers extra tax obligations, and tracking business expenses.${stateNote}`,
    mid_career: `This is a 35-49 year old, likely with a family. Use examples about mortgage interest, child tax credits, 529 plans, childcare costs, and maximizing retirement contributions. They're in their peak earning years.${stateNote}`,
    pre_retirement: `This is a 50-64 year old planning for retirement. Use examples about catch-up contributions, Roth conversions, Social Security planning, and healthcare costs. They may have complex investment portfolios.${stateNote}`,
    retiree: `This person is 65+ and retired or semi-retired. Use examples about Social Security taxation, Required Minimum Distributions, pension income, Medicare premiums, and the additional standard deduction for seniors.${stateNote}`,
    general: `Use general tax examples appropriate for a working adult.${stateNote}`,
  };

  return personas[persona] || personas.general;
}

// Pre-select situations based on profile
export function suggestSituations(profile: UserProfile): string[] {
  const suggestions: string[] = [];
  const age = profile.ageGroup;
  const emp = profile.employmentType;

  if (emp === "w2_only" || emp === "both") suggestions.push("employed_w2");
  if (emp === "self_employed" || emp === "both") suggestions.push("self_employed");
  if (emp === "gig_only" || emp === "both") suggestions.push("side_hustle");
  if (emp === "not_working") suggestions.push("unemployed");
  if (emp === "retired") suggestions.push("retirement_income");
  if (profile.isStudent) suggestions.push("student");

  return suggestions;
}

// Filter situations to show relevant ones prominently based on persona
export function getSituationRelevance(situationId: string, persona: string): "high" | "medium" | "low" {
  const highRelevance: Record<string, string[]> = {
    teen_worker: ["employed_w2"],
    college_student: ["employed_w2", "student", "student_loans"],
    young_first_timer: ["employed_w2", "side_hustle", "tip_income"],
    young_worker: ["employed_w2", "side_hustle", "investor", "retirement_contrib"],
    young_professional: ["employed_w2", "investor", "retirement_contrib", "hsa", "student_loans"],
    freelancer: ["self_employed", "side_hustle", "home_office", "investor", "hsa", "retirement_contrib"],
    side_hustler: ["employed_w2", "self_employed", "side_hustle", "home_office"],
    mid_career: ["employed_w2", "homeowner", "parent", "childcare", "retirement_contrib", "hsa", "investor", "charity"],
    pre_retirement: ["employed_w2", "investor", "retirement_contrib", "homeowner", "charity", "hsa"],
    retiree: ["retirement_income", "investor", "homeowner", "medical", "charity"],
  };

  const lowRelevance: Record<string, string[]> = {
    teen_worker: ["rental_income", "retirement_income", "homeowner", "sold_home", "alimony", "foreign_income"],
    college_student: ["rental_income", "retirement_income", "homeowner", "sold_home", "alimony", "foreign_income", "gambling"],
    young_first_timer: ["rental_income", "retirement_income", "homeowner", "sold_home", "alimony", "foreign_income"],
    retiree: ["student", "student_loans", "side_hustle", "childcare"],
  };

  if (highRelevance[persona]?.includes(situationId)) return "high";
  if (lowRelevance[persona]?.includes(situationId)) return "low";
  return "medium";
}
