"use client";

import type { Section } from "@/lib/types";

interface SectionRendererProps {
  sections: Section[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((sec, i) => {
        if (sec.type === "table" || sec.type === "table3") {
          return (
            <div key={i} className="my-3.5 overflow-auto">
              {sec.title && (
                <h4 className="text-[13px] font-bold text-tax-accent mb-1.5 font-sans">
                  {sec.title}
                </h4>
              )}
              <table className="w-full border-collapse text-[12.5px] font-sans">
                {sec.headers && (
                  <thead>
                    <tr>
                      {sec.headers.map((h, j) => (
                        <th
                          key={j}
                          className="text-left py-[7px] px-2 border-b border-tax-border text-tax-muted font-semibold text-[10px] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {sec.rows?.map((row, ri) => (
                    <tr key={ri} className="border-b border-tax-border/10">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`py-[7px] px-2 text-[12.5px] ${
                            ci === 0
                              ? "text-tax-text font-sans"
                              : "text-tax-accent font-mono"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (sec.type === "info") {
          return (
            <div
              key={i}
              className="my-2.5 px-3.5 py-2.5 bg-tax-accent-dim border border-tax-accent/20 rounded-lg"
            >
              {sec.title && (
                <div className="text-[11px] font-bold text-tax-accent mb-0.5 font-sans">
                  {sec.title}
                </div>
              )}
              <div className="text-[13px] text-tax-text leading-relaxed font-sans">
                {sec.text}
              </div>
            </div>
          );
        }

        if (sec.type === "warning") {
          return (
            <div
              key={i}
              className="my-2.5 px-3.5 py-2.5 bg-tax-orange-dim border border-tax-orange/20 rounded-lg"
            >
              <div className="text-[13px] text-tax-text leading-relaxed font-sans">
                {sec.text}
              </div>
            </div>
          );
        }

        if (sec.type === "checklist") {
          return (
            <div key={i} className="my-3.5">
              {sec.title && (
                <h4 className="text-[13px] font-bold text-tax-accent mb-1.5 font-sans">
                  {sec.title}
                </h4>
              )}
              {sec.items?.map((item, j) => (
                <div key={j} className="flex items-center gap-2 py-1">
                  <span className="w-4 h-4 rounded-sm border-[1.5px] border-tax-border flex-shrink-0" />
                  <span className="text-[13px] text-tax-text font-sans">{item}</span>
                </div>
              ))}
            </div>
          );
        }

        if (sec.type === "source") {
          return (
            <div
              key={i}
              className="mt-2.5 mb-0.5 text-[10px] text-tax-dim font-mono italic"
            >
              {sec.text}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
