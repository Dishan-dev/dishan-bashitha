"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type PortfolioLoaderProps = { isLeaving: boolean };

export function PortfolioLoader({ isLeaving }: PortfolioLoaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-label="Loading portfolio"
      initial={{ opacity: 1 }}
      animate={isLeaving ? { clipPath: reduceMotion ? "inset(0 0 100% 0)" : "circle(0% at 50% 50%)", opacity: reduceMotion ? 0 : 1 } : { clipPath: "circle(150% at 50% 50%)", opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.22 : 0.72, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden inverse-surface bg-[var(--inverse-surface)] text-[var(--inverse-text)]"
    >
      <motion.div aria-hidden="true" initial={reduceMotion ? false : { scale: 0.2, opacity: 0 }} animate={{ scale: isLeaving ? 18 : 1, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : isLeaving ? 0.7 : 0.58, delay: reduceMotion ? 0 : isLeaving ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }} className="absolute h-[clamp(4rem,8vw,8rem)] w-[clamp(4rem,8vw,8rem)] rounded-full bg-[var(--accent)]" />
      <motion.div initial={reduceMotion ? false : { y: 24, opacity: 0 }} animate={{ y: isLeaving ? -16 : 0, opacity: isLeaving ? 0 : 1 }} transition={{ duration: reduceMotion ? 0 : 0.48, delay: reduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 text-center">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--inverse-text)]/60">Independent practice / Sri Lanka</p>
        <p className="mt-3 text-[clamp(2.5rem,6vw,6rem)] font-semibold leading-none tracking-[-0.08em]">DISHAN<br />BASHITHA</p>
      </motion.div>
    </motion.div>
  );
}
