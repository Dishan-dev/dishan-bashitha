import type { ReactNode } from "react";

export function SectionTitle({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return <h1 id={id} className={`max-w-6xl text-[clamp(3.5rem,9.5vw,10.5rem)] font-medium leading-[0.84] tracking-[-0.075em] ${className}`}>{children}</h1>;
}
