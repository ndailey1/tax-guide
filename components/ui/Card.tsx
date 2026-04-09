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
        flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl
        border-[1.5px] text-left font-sans transition-all duration-200
        ${selected
          ? "border-tax-accent bg-tax-accent-dim scale-[1.01]"
          : "border-tax-border bg-tax-surface active:scale-[0.98] active:bg-tax-surface-alt"
        }
        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
