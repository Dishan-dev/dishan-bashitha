"use client";

import { ThemeToggle } from "./ThemeToggle";

type PortfolioHeaderProps = {
  activeIndex: number;
  onNavigate: (index: number) => void;
};

const navItems = [
  { label: "Home", index: 0 },
  { label: "About", index: 1 },
  { label: "Projects", index: 2 },
  { label: "Skills", index: 3 },
  { label: "Experience", index: 4 },
  { label: "Contact", index: 5 },
];

export function PortfolioHeader({ activeIndex, onNavigate }: PortfolioHeaderProps) {
  return (
    <header className={`portfolio-header fixed inset-x-[clamp(1.5rem,4.2vw,4rem)] top-[clamp(1.35rem,3vw,2.8rem)] z-50 flex items-center justify-between transition-colors duration-200 text-[var(--foreground)]`}>
      <button type="button" onClick={() => onNavigate(0)} className="text-left text-[clamp(0.9rem,1.2vw,1.25rem)] font-semibold uppercase leading-none tracking-[-0.04em]">
        Dishan Bashitha
        <span className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[10px] font-normal normal-case tracking-normal text-[var(--accent)]"><i className="h-2 w-2 rounded-full bg-[var(--accent)]" />Software Engineer</span>
      </button>
      <nav aria-label="Portfolio sections" className="hidden items-center gap-[clamp(1rem,2vw,2.5rem)] lg:flex">
        {navItems.map((item) => <button key={item.label} type="button" aria-current={activeIndex === item.index ? "page" : undefined} onClick={() => onNavigate(item.index)} className={`relative py-1 text-[0.95rem] font-medium transition-colors hover:text-[var(--accent)] ${activeIndex === item.index ? "text-[var(--accent)]" : ""}`}><span>{item.label}</span>{activeIndex === item.index && <span aria-hidden="true" className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--accent)]" />}</button>)}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
      <ThemeToggle />
      <button type="button" onClick={() => onNavigate(5)} className="hidden sm:block rounded-full bg-[var(--accent-fill)] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]">Let&apos;s Connect <span aria-hidden="true" className="ml-2">↗</span></button>
      </div>
    </header>
  );
}
