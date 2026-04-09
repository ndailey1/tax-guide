export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface QuarterlyDate {
  q: string;
  period: string;
  due: string;
}

export interface Section {
  type: "table" | "table3" | "info" | "warning" | "checklist" | "source";
  title?: string;
  text?: string;
  rows?: string[][];
  headers?: string[];
  items?: string[];
}

export interface Topic {
  id: string;
  icon: string;
  title: string;
  sections: Section[];
  aiPrompt: string;
}

export interface KnowledgeLevel {
  id: string;
  label: string;
  emoji: string;
  desc: string;
}

export interface FilingStatus {
  id: string;
  label: string;
  desc: string;
}

export interface LifeSituation {
  id: string;
  label: string;
  emoji: string;
  cat: "income" | "life" | "deductions";
}
