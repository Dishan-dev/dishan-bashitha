"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Scene } from "@/components/portfolio/Scene";
import { SceneLabel } from "@/components/ui/SceneLabel";

const skillGroups = [
  ["Languages", "Java / C# / JavaScript / TypeScript / PHP / Python / SQL"],
  ["Frontend", "React / Next.js / Tailwind CSS / Bootstrap / Windows Forms"],
  ["Backend", "Spring Boot / Node.js / Express.js / Laravel / .NET / REST APIs"],
  ["Databases", "PostgreSQL / MySQL / SQL Server / Prisma / ADO.NET"],
  ["Cloud & DevOps", "Docker / Git / GitHub / DigitalOcean / Render / Vercel"],
  ["AI & Real-Time", "LangChain / Codex API / Socket.IO"],
  ["Development & Design", "Postman / Swagger / Figma / Adobe Creative Tools"],
] as const;

export function SkillsScene() {
  const reduceMotion = useReducedMotion();

  return (
    <Scene id="skills" eyebrow="" className="skills-scene relative flex flex-col">
      <div aria-hidden="true" data-scroll-depth="65" className="absolute -right-[14vw] top-[10svh] h-[min(46vw,43rem)] w-[min(46vw,43rem)] rounded-full bg-[var(--accent-soft)]" />
      <div className="skills-content relative z-10">
        <div className="max-w-4xl shrink-0">
          <SceneLabel sceneId="skills" />
          <motion.h1 id="skills-title" initial={reduceMotion ? false : { y: 48, clipPath: "inset(0 0 100% 0)" }} animate={{ y: 0, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: reduceMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }} className="mt-5 text-[clamp(3.2rem,5.5vw,6rem)] font-semibold leading-[0.82] tracking-[-0.09em]">Built across<br /><span className="text-[var(--accent)]">the stack.</span></motion.h1>
        </div>
        <div className="skills-grid">
          {skillGroups.map(([title, tools], index) => <motion.section key={title} initial={reduceMotion ? false : { y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: reduceMotion ? 0 : 0.52, delay: reduceMotion ? 0 : 0.25 + index * 0.09, ease: [0.22, 1, 0.36, 1] }} className="skill-group"><h2 className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">{title}</h2><p className="mt-2 text-[clamp(1rem,1.35vw,1.3rem)] leading-snug tracking-[-0.03em]">{tools}</p></motion.section>)}
        </div>
      </div>
    </Scene>
  );
}
