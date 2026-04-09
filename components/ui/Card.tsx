"use client";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function Card({ children, onClick, selected, className = "" }: CardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3.5 w-full px-4 py-3.5 rounded-[10px]
        border-[1.5px] text-left font-sans transition-all duration-150
        ${selected
          ? "border-tax-accent bg-tax-accent-dim"
          : "border-tax-border bg-tax-surface hover:border-tax-border-light hover:bg-tax-surface-alt"
        }
        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
