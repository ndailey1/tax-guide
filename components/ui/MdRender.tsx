"use client";

import React from "react";

function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let k = 0;
  const rx = /\*\*(.+?)\*\*/g;
  let m: RegExpExecArray | null;
  let last = 0;

  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    }
    parts.push(
      <strong key={k++} className="text-tax-accent font-bold">
        {m[1]}
      </strong>
    );
    last = rx.lastIndex;
  }
  if (last < text.length) {
    parts.push(<span key={k++}>{text.slice(last)}</span>);
  }
  return parts.length ? parts : [text];
}

interface MdRenderProps {
  text: string | null | undefined;
}

export function MdRender({ text }: MdRenderProps) {
  if (!text) return null;

  const lines = text.split("\n");
  const els: React.ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const l = lines[i];

    if (l.startsWith("### ")) {
      els.push(
        <h3 key={k++} className="text-sm font-bold text-tax-accent mt-4 mb-1 font-sans">
          {l.slice(4)}
        </h3>
      );
    } else if (l.startsWith("## ")) {
      els.push(
        <h2 key={k++} className="text-base font-bold text-tax-text mt-5 mb-1.5 font-sans">
          {l.slice(3)}
        </h2>
      );
    } else if (l.startsWith("# ")) {
      els.push(
        <h1 key={k++} className="text-lg font-extrabold text-tax-text mt-5 mb-2 font-sans">
          {l.slice(2)}
        </h1>
      );
    } else if (l.startsWith("- ") || l.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      els.push(
        <ul key={k++} className="my-1 pl-4">
          {items.map((t, j) => (
            <li key={j} className="text-[13px] text-tax-text leading-relaxed mb-0.5 font-sans">
              {inlineFormat(t)}
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      els.push(
        <ol key={k++} className="my-1 pl-4">
          {items.map((t, j) => (
            <li key={j} className="text-[13px] text-tax-text leading-relaxed mb-0.5 font-sans">
              {inlineFormat(t)}
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (l.trim() === "") {
      els.push(<div key={k++} className="h-1" />);
    } else {
      els.push(
        <p key={k++} className="text-[13px] text-tax-text leading-relaxed my-1 font-sans">
          {inlineFormat(l)}
        </p>
      );
    }
    i++;
  }

  return <div>{els}</div>;
}
