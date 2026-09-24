"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Image from "next/image";
import { useState } from "react";
import { experiments, type Experiment } from "@/data/experiments";
import { useSwipe } from "@/hooks/useSwipe";

const placements: Record<Experiment["id"], string> = {
  signal: "left-[4%] top-[8%] h-[26%] w-[31%]",
  tide: "right-[8%] top-[4%] h-[19%] w-[18%]",
  index: "bottom-[12%] left-[25%] h-[31%] w-[26%]",
  interval: "right-[3%] top-[39%] h-[24%] w-[20%]",
  echo: "bottom-[5%] left-[5%] h-[17%] w-[16%]",
};

function ExperimentFragment({ experiment }: { experiment: Experiment }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-label={`${experiment.title}, ${experiment.category}, ${experiment.year}`}
      whileHover={reduceMotion ? undefined : { scale: 1.035 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className={`group absolute overflow-hidden border border-[var(--border)] bg-[var(--foreground)] text-left focus-visible:z-20 ${placements[experiment.id]}`}
    >
      <Image src={experiment.previewImage} alt="" fill sizes="32vw" className="object-cover opacity-65 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-[var(--foreground)]/20 transition-colors duration-300 group-hover:bg-transparent" />
      <div className="absolute bottom-0 left-0 right-0 translate-y-full border-t border-[var(--background)]/25 bg-[var(--foreground)] px-3 py-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--background)] transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
        <p>{experiment.title}</p><p className="mt-1 text-[var(--background)]/55">{experiment.category} / {experiment.year}</p>
      </div>
    </motion.button>
  );
}

export function ExperimentCanvas() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const previous = () => setActiveIndex((index) => (index - 1 + experiments.length) % experiments.length);
  const next = () => setActiveIndex((index) => (index + 1) % experiments.length);
  const swipeHandlers = useSwipe({ onSwipeLeft: next, onSwipeRight: previous, threshold: 48 });
  const experiment = experiments[activeIndex];

  return (
    <>
      <div aria-label="Experiment canvas" className="relative hidden flex-1 md:block">{experiments.map((experiment) => <ExperimentFragment key={experiment.id} experiment={experiment} />)}</div>
      <div {...swipeHandlers} className="relative flex flex-1 flex-col md:hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div key={experiment.id} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.05} onDragEnd={(_, info) => { if (info.offset.x < -48) next(); if (info.offset.x > 48) previous(); }} initial={reduceMotion ? false : { x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? undefined : { x: -12, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }} className="relative mt-auto aspect-[4/3] overflow-hidden border border-[var(--border)] bg-[var(--foreground)]">
            <Image src={experiment.previewImage} alt={`Preview for ${experiment.title}`} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-[var(--foreground)]/20" />
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 flex items-end justify-between gap-4"><div><h2 className="text-3xl font-medium tracking-[-0.055em]">{experiment.title}</h2><p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.13em] text-[var(--muted)]">{experiment.category} / {experiment.year}</p></div><p className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">{String(activeIndex + 1).padStart(2, "0")} / {String(experiments.length).padStart(2, "0")}</p></div>
      </div>
    </>
  );
}
