"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type PortfolioLoaderProps = { isLeaving: boolean };
const ease = [0.22, 1, 0.36, 1] as const;

export function PortfolioLoader({ isLeaving }: PortfolioLoaderProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div role="status" aria-label="Opening Dishan Bashitha's portfolio" initial={{ opacity: 1 }} animate={{ opacity: isLeaving ? 0 : 1 }} transition={{ duration: reduceMotion ? 0.15 : 0.65, ease }} className="pointer-events-none fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <motion.div aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: isLeaving ? 0 : 0.65, scale: isLeaving ? 1.12 : 1 }} transition={{ duration: reduceMotion ? 0 : 1, ease }} className="absolute size-[min(85vw,36rem)] rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_68%)]" />
      <motion.div aria-hidden="true" animate={{ opacity: isLeaving ? 0 : 1, y: isLeaving && !reduceMotion ? -12 : 0, scale: isLeaving && !reduceMotion ? 0.98 : 1 }} transition={{ duration: reduceMotion ? 0.15 : 0.5, ease }} className="relative flex flex-col items-center">
        <div className="relative grid size-44 place-items-center">
          <motion.svg viewBox="0 0 180 180" className="absolute inset-0 size-full text-[var(--accent)]" initial={{ rotate: -30 }} animate={{ rotate: reduceMotion ? -30 : 35 }} transition={{ duration: 1.6, ease }}>
            <circle cx="90" cy="90" r="78" fill="none" stroke="currentColor" strokeOpacity="0.12" />
            <motion.path d="M90 12 A78 78 0 0 1 168 90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduceMotion ? 0 : 0.9, ease }} />
            <circle cx="168" cy="90" r="3" fill="currentColor" />
          </motion.svg>
          <svg viewBox="0 0 100 70" className="h-16 w-24 overflow-visible" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M12 55V15H25C50 15 50 55 25 55H12" stroke="var(--foreground)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.85, ease }} />
            <motion.path d="M57 55V15H72C91 15 91 35 72 35H57M72 35C94 35 94 55 72 55H57" stroke="var(--accent)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.85, delay: reduceMotion ? 0 : 0.12, ease }} />
          </svg>
        </div>
        <div className="mt-5 overflow-hidden">
          <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.18, ease }} className="text-xl font-medium tracking-[-0.04em]">Dishan Bashitha<span className="text-[var(--accent)]">.</span></motion.p>
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.35 }} className="mt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">From ideas to interfaces</motion.p>
      </motion.div>
    </motion.div>
  );
}
