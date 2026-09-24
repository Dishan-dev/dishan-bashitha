"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Scene } from "@/components/portfolio/Scene";

const skillGroups = [
  ["Frontend", "React / Next.js / TypeScript / Tailwind"],
  ["Backend", "Spring Boot / Node.js / REST APIs / PostgreSQL"],
  ["AI & Realtime", "Gemini API / Prisma / Socket.IO"],
  ["Creative", "Figma / UI systems / Motion"],
] as const;

export function SkillsScene() {
  const reduceMotion = useReducedMotion();

  return (
    <Scene id="skills" eyebrow="" className="relative flex flex-col overflow-hidden">
      <div aria-hidden="true" className="absolute -right-[14vw] top-[10svh] h-[min(46vw,43rem)] w-[min(46vw,43rem)] rounded-full bg-[var(--accent-soft)]" />
      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <div className="max-w-4xl">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Capabilities / selected tools</p>
          <motion.h1 id="skills-title" initial={reduceMotion ? false : { y: 48, clipPath: "inset(0 0 100% 0)" }} animate={{ y: 0, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: reduceMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }} className="mt-5 text-[clamp(4rem,9vw,10rem)] font-semibold leading-[0.82] tracking-[-0.09em]">Built across<br /><span className="text-[var(--accent)]">the stack.</span></motion.h1>
        </div>
        <div className="mb-[clamp(6.5rem,13svh,9rem)] ml-auto grid w-full max-w-4xl gap-x-[clamp(2rem,7vw,8rem)] gap-y-5 border-t border-[var(--border)] pt-5 md:grid-cols-2">
          {skillGroups.map(([title, tools], index) => <motion.section key={title} initial={reduceMotion ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.52, delay: reduceMotion ? 0 : 0.25 + index * 0.09, ease: [0.22, 1, 0.36, 1] }} className="border-b border-[var(--border)] pb-5"><h2 className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">{title}</h2><p className="mt-2 text-[clamp(1rem,1.35vw,1.3rem)] leading-snug tracking-[-0.03em]">{tools}</p></motion.section>)}
        </div>
      </div>
    </Scene>
  );
}
