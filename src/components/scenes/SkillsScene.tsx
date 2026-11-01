"use client";

import { Scene } from "@/components/portfolio/Scene";
import { SceneLabel } from "@/components/ui/SceneLabel";
import type { Choreography } from "@/hooks/useSceneMotion";

const skillGroups = [
  ["Languages", "Java / C# / JavaScript / TypeScript / PHP / Python / SQL"],
  ["Frontend", "React / Next.js / Tailwind CSS / Bootstrap / Windows Forms"],
  ["Backend", "Spring Boot / Node.js / Express.js / Laravel / .NET / REST APIs"],
  ["Databases", "PostgreSQL / MySQL / SQL Server / Prisma / ADO.NET"],
  ["Cloud & DevOps", "Docker / Git / GitHub / DigitalOcean / Render / Vercel"],
  ["AI & Real-Time", "LangChain / Codex API / Socket.IO"],
  ["Development & Design", "Postman / Swagger / Figma / Adobe Creative Tools"],
] as const;

/**
 * The matrix assembles row by row: each rule draws across, its text rises inside the cell,
 * and the two columns start slightly apart before locking onto one grid.
 */
const skillsChoreography: Choreography = ({ enter, select }) => {
  enter(".skills-heading-line > span", { yPercent: 108, stagger: 0.14 }, { start: 0.2, end: 0.75 });
  const groups = select(".skill-group");
  groups.forEach((group, index) => {
    const row = Math.floor(index / 2);
    const phase = { start: 0.28 + row * 0.12, end: 0.62 + row * 0.1 };
    enter(group.querySelector(".skill-rule"), { scaleX: 0, transformOrigin: index % 2 ? "100% 50%" : "0% 50%" }, { ...phase, compact: { scaleX: 0, transformOrigin: "0% 50%" } });
    enter(group.querySelectorAll("h2, p"), { yPercent: 70, opacity: 0, stagger: 0.12 }, { ...phase, compact: { y: 18, opacity: 0 } });
    enter(group, { y: index % 2 ? 46 : 18 }, { ...phase, compact: false });
  });
};

export function SkillsScene() {
  return (
    <Scene id="skills" eyebrow="" className="skills-scene relative flex flex-col" choreography={skillsChoreography}>
      <div aria-hidden="true" data-scroll-depth="65" className="absolute -right-[14vw] top-[10svh] h-[min(46vw,43rem)] w-[min(46vw,43rem)] rounded-full bg-[var(--accent-soft)]" />
      <div className="skills-content relative z-10">
        <div className="max-w-4xl shrink-0">
          <SceneLabel sceneId="skills" />
          <h1 id="skills-title" className="mt-5 text-[clamp(3.2rem,5.5vw,6rem)] font-semibold leading-[0.82] tracking-[-0.09em]">
            <span className="skills-heading-line block overflow-hidden pb-[0.08em] -mb-[0.08em]"><span className="block">Built across</span></span>
            <span className="skills-heading-line block overflow-hidden pb-[0.08em] -mb-[0.08em]"><span className="block text-[var(--accent)]">the stack.</span></span>
          </h1>
        </div>
        <div className="skills-grid">
          {skillGroups.map(([title, tools]) => <section key={title} className="skill-group"><i aria-hidden="true" className="skill-rule" /><div className="overflow-hidden"><h2 className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">{title}</h2></div><div className="overflow-hidden"><p className="mt-2 text-[clamp(1rem,1.35vw,1.3rem)] leading-snug tracking-[-0.03em]">{tools}</p></div></section>)}
        </div>
      </div>
    </Scene>
  );
}
