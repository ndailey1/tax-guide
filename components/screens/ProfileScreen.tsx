"use client";

import { useState } from "react";
import {
  AGE_GROUPS,
  EMPLOYMENT_TYPES,
  US_STATES,
  NO_INCOME_TAX_STATES,
  type UserProfile,
} from "@/lib/user-profile";
import { Card } from "@/components/ui/Card";

interface ProfileScreenProps {
  profile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

type Phase = "age" | "student_first" | "work" | "state";

export function ProfileScreen({ profile, onComplete }: ProfileScreenProps) {
  const [phase, setPhase] = useState<Phase>("age");
  const [ageGroup, setAgeGroup] = useState<string | null>(profile.ageGroup);
  const [isStudent, setIsStudent] = useState(profile.isStudent);
  const [isFirstTime, setIsFirstTime] = useState(profile.isFirstTimeFiler);
  const [employment, setEmployment] = useState<string | null>(profile.employmentType);
  const [state, setState] = useState<string | null>(profile.state);
  const [stateSearch, setStateSearch] = useState("");

  const isYoung = ageGroup === "under18" || ageGroup === "18-24";
  const isRetirementAge = ageGroup === "65plus";

  const filteredStates = stateSearch
    ? US_STATES.filter(
        (s) =>
          s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
          s.code.toLowerCase().includes(stateSearch.toLowerCase())
      )
    : US_STATES;

  const finalize = (finalState: string | null) => {
    onComplete({
      ageGroup,
      isStudent,
      isFirstTimeFiler: isFirstTime,
      employmentType: employment,
      state: finalState,
      persona: "", // derived later in page.tsx
    });
  };

  return (
    <div className="max-w-[600px] mx-auto animate-screen">
      {/* ===== AGE ===== */}
      {phase === "age" && (
        <div className="animate-screen" key="age">
          <div className="text-center mb-6">
            <div className="text-[48px] mb-2 animate-emoji">&#x1F44B;</div>
            <h1 className="text-[26px] font-extrabold text-tax-text font-serif mb-2">
              Let&apos;s Personalize This For You
            </h1>
            <p className="text-[13px] text-tax-muted font-sans max-w-[440px] mx-auto leading-relaxed">
              A few quick questions so we can tailor everything — the examples, the language,
              and the advice — to your specific situation.
            </p>
          </div>

          <p className="text-[14px] font-semibold text-tax-text mb-3 font-sans">
            What&apos;s your age group?
          </p>
          <div className="flex flex-col gap-2">
            {AGE_GROUPS.map((ag, i) => (
              <div key={ag.id} className={`animate-card delay-${i}`}>
                <Card
                  onClick={() => {
                    setAgeGroup(ag.id);
                    // Auto-advance after selection with slight delay
                    setTimeout(() => {
                      if (ag.id === "under18" || ag.id === "18-24") {
                        setPhase("student_first");
                      } else if (ag.id === "65plus") {
                        setEmployment("retired");
                        setPhase("state");
                      } else {
                        setPhase("work");
                      }
                    }, 200);
                  }}
                  selected={ageGroup === ag.id}
                  className="btn-press !py-3.5"
                >
                  <span className="text-[24px]">{ag.emoji}</span>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-tax-text">{ag.label}</div>
                    <div className="text-[12px] text-tax-muted mt-0.5">{ag.desc}</div>
                  </div>
                  {ageGroup === ag.id && (
                    <span className="text-tax-accent text-lg">&#x2713;</span>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STUDENT / FIRST-TIME (for young users) ===== */}
      {phase === "student_first" && (
        <div className="animate-screen" key="student_first">
          <button
            onClick={() => setPhase("age")}
            className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
          >
            &larr; Back
          </button>

          <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-1">
            Tell Us a Bit More
          </h2>
          <p className="text-[13px] text-tax-muted font-sans mb-5">
            This helps us pick the right examples and flag things that matter for your age group.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            {/* Student question */}
            <div className="bg-tax-surface border border-tax-border rounded-xl p-4">
              <p className="text-[14px] font-semibold text-tax-text font-sans mb-3">
                Are you a full-time student?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsStudent(true)}
                  className={`flex-1 py-3 rounded-lg border text-[13px] font-semibold font-sans cursor-pointer btn-press transition-all ${
                    isStudent
                      ? "border-tax-accent bg-tax-accent-dim text-tax-accent"
                      : "border-tax-border bg-transparent text-tax-muted hover:border-tax-border-light"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsStudent(false)}
                  className={`flex-1 py-3 rounded-lg border text-[13px] font-semibold font-sans cursor-pointer btn-press transition-all ${
                    !isStudent
                      ? "border-tax-accent bg-tax-accent-dim text-tax-accent"
                      : "border-tax-border bg-transparent text-tax-muted hover:border-tax-border-light"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* First-time filer question */}
            <div className="bg-tax-surface border border-tax-border rounded-xl p-4">
              <p className="text-[14px] font-semibold text-tax-text font-sans mb-3">
                Is this your first time filing taxes?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFirstTime(true)}
                  className={`flex-1 py-3 rounded-lg border text-[13px] font-semibold font-sans cursor-pointer btn-press transition-all ${
                    isFirstTime
                      ? "border-tax-accent bg-tax-accent-dim text-tax-accent"
                      : "border-tax-border bg-transparent text-tax-muted hover:border-tax-border-light"
                  }`}
                >
                  Yes, first time
                </button>
                <button
                  onClick={() => setIsFirstTime(false)}
                  className={`flex-1 py-3 rounded-lg border text-[13px] font-semibold font-sans cursor-pointer btn-press transition-all ${
                    !isFirstTime
                      ? "border-tax-accent bg-tax-accent-dim text-tax-accent"
                      : "border-tax-border bg-transparent text-tax-muted hover:border-tax-border-light"
                  }`}
                >
                  I&apos;ve filed before
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPhase("work")}
            className="w-full py-3.5 rounded-xl border-none bg-tax-accent text-white text-[14px] font-bold font-sans cursor-pointer btn-press animate-glow"
          >
            Continue &rarr;
          </button>
        </div>
      )}

      {/* ===== EMPLOYMENT TYPE ===== */}
      {phase === "work" && (
        <div className="animate-screen" key="work">
          <button
            onClick={() => setPhase(isYoung ? "student_first" : "age")}
            className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
          >
            &larr; Back
          </button>

          <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-1">
            How Do You Earn Money?
          </h2>
          <p className="text-[13px] text-tax-muted font-sans mb-4">
            This determines which tax forms and deductions are relevant to you.
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {EMPLOYMENT_TYPES.filter((e) => {
              // Hide "retired" for young users
              if (isYoung && e.id === "retired") return false;
              // Hide "not working" student option — they'll select student situations later
              return true;
            }).map((e, i) => (
              <div key={e.id} className={`animate-card delay-${i}`}>
                <Card
                  onClick={() => {
                    setEmployment(e.id);
                    setTimeout(() => setPhase("state"), 200);
                  }}
                  selected={employment === e.id}
                  className="btn-press !py-3.5"
                >
                  <span className="text-[24px]">{e.emoji}</span>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-tax-text">{e.label}</div>
                    <div className="text-[12px] text-tax-muted mt-0.5">{e.desc}</div>
                  </div>
                  {employment === e.id && (
                    <span className="text-tax-accent text-lg">&#x2713;</span>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STATE ===== */}
      {phase === "state" && (
        <div className="animate-screen" key="state">
          <button
            onClick={() => setPhase(isRetirementAge ? "age" : "work")}
            className="bg-transparent border-none text-tax-accent cursor-pointer text-xs font-sans p-0 mb-3"
          >
            &larr; Back
          </button>

          <h2 className="text-[20px] font-extrabold text-tax-text font-serif mb-1">
            What State Do You Live In?
          </h2>
          <p className="text-[13px] text-tax-muted font-sans mb-4">
            Some states have no income tax, which affects your filing. This also helps us give you state-specific advice.
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="Search states..."
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            className="w-full py-3 px-4 rounded-lg border border-tax-border bg-tax-surface text-tax-text text-sm font-sans outline-none focus:border-tax-accent transition-colors mb-3"
          />

          {/* State grid */}
          <div className="grid grid-cols-3 gap-1.5 mb-4 max-h-[280px] overflow-y-auto">
            {filteredStates.map((s) => {
              const noTax = NO_INCOME_TAX_STATES.includes(s.code);
              return (
                <button
                  key={s.code}
                  onClick={() => setState(s.code)}
                  className={`py-2.5 px-2 rounded-lg border text-left text-[12px] font-sans cursor-pointer btn-press transition-all ${
                    state === s.code
                      ? "border-tax-accent bg-tax-accent-dim text-tax-accent font-semibold"
                      : "border-tax-border bg-tax-surface text-tax-text hover:border-tax-border-light"
                  }`}
                >
                  <div className="font-semibold">{s.code}</div>
                  <div className="text-[10px] text-tax-muted truncate">{s.name}</div>
                  {noTax && (
                    <div className="text-[9px] text-tax-green font-mono mt-0.5">No income tax</div>
                  )}
                </button>
              );
            })}
          </div>

          {state && NO_INCOME_TAX_STATES.includes(state) && (
            <div className="bg-tax-green-dim border border-tax-green/20 rounded-lg px-3.5 py-2.5 mb-4 animate-screen">
              <p className="text-[12px] text-tax-text font-sans">
                <strong className="text-tax-green">&#x2713; No state income tax!</strong>{" "}
                {state === "NH" ? "New Hampshire taxes interest and dividends only." : `${US_STATES.find((s) => s.code === state)?.name} has no state income tax. You only need to file a federal return.`}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => finalize(null)}
              className="flex-1 py-3.5 rounded-xl border border-tax-border bg-transparent text-tax-muted text-[14px] font-semibold font-sans cursor-pointer btn-press hover:border-tax-border-light transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => finalize(state)}
              disabled={!state}
              className={`flex-1 py-3.5 rounded-xl border-none text-[14px] font-bold font-sans transition-all btn-press ${
                state
                  ? "bg-tax-accent text-white cursor-pointer animate-glow"
                  : "bg-tax-border text-tax-dim cursor-default"
              }`}
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
