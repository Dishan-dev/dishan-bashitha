"use client";

import { Scene } from "@/components/portfolio/Scene";
import { SceneLabel } from "@/components/ui/SceneLabel";
import { motion } from "framer-motion";
import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, GraduationCap, Users } from "lucide-react";
import { portfolioMotion } from "@/lib/motion";
import styles from "./ExperienceScene.module.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Choreography } from "@/hooks/useSceneMotion";

const experienceGroups = [
  {
    id: "professional",
    label: "Industry / Professional",
    description: "Paid roles and professional software engineering work.",
    experiences: [{
      period: "2025 — 2026",
      role: "Software Engineer",
      organization: "NIOLLA (PVT) LTD",
      description: "Developed enterprise web applications, REST APIs, and responsive interfaces. Designed and optimized PostgreSQL and MySQL databases, integrated third-party services, and collaborated in Agile workflows.",
      focus: "Spring Boot / Node.js / React / Next.js / PostgreSQL / MySQL",
    }],
  },
  {
    id: "volunteer",
    label: "Volunteer",
    description: "Leadership, community, and mission-driven contributions.",
    experiences: [
      {
        period: "2025",
        role: "Software Engineer",
        organization: "AIESEC IN SRI LANKA",
        description: "Contributed technical solutions within a national organizational environment, working closely with people, systems, and evolving needs.",
        focus: "Technical Solutions / Collaboration / Systems",
      },
      {
        period: "Leadership",
        role: "Local Committee Vice President — Public Relations & Information Management",
        organization: "AIESEC IN UNIVERSITY OF MORATUWA",
        description: "Local Committee Vice President for Public Relations & Information Management.",
        focus: "Leadership / Communication / Coordination",
      },
      {
        period: "2026",
        role: "Event Manager — IDEALIZE 2026",
        organization: "AIESEC IN COLOMBO SOUTH",
        description: "Event Manager for IDEALIZE 2026.",
        focus: "Event Management / Leadership",
      },
      {
        period: "Activities",
        role: "Organizing Committee Member — Robotics Day",
        organization: "IEEE STUDENT BRANCH, UNIVERSITY OF MORATUWA",
        description: "Organizing Committee Member for Robotics Day.",
        focus: "Robotics Day / Community",
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    description: "Academic qualifications and ongoing study.",
    experiences: [
      {
        period: "2024 — 2028",
        role: "BSc (Hons) Information Technology & Management",
        organization: "UNIVERSITY OF MORATUWA",
        description: "Undergraduate study in Katubedda, Sri Lanka. Ongoing GPA: 3.54 / 4.00.",
        focus: "Information Technology / Management",
      },
      {
        period: "2022 — 2025",
        role: "BEng (Hons) Software Engineering",
        organization: "LONDON METROPOLITAN UNIVERSITY",
        description: "Bachelor of Engineering (Hons) in Software Engineering, awarded First Class Honours.",
        focus: "Software Engineering / First Class Honours",
      },
      {
        period: "Higher National Diploma",
        role: "Software Engineering",
        organization: "ESOFT METRO CAMPUS",
        description: "Higher National Diploma in Software Engineering, Kurunegala, Sri Lanka.",
        focus: "Software Engineering",
      },
    ],
  },
] as const;

// Dated roles run newest first; undated activities keep their original labels.
const timelines = [
  {
    id: "work",
    label: "Work",
    entries: [
      { ...experienceGroups[0].experiences[0], category: "Professional" },
      { ...experienceGroups[1].experiences[0], category: "Volunteer" },
    ],
  },
  {
    id: "leadership",
    label: "Leadership",
    entries: [
      { ...experienceGroups[1].experiences[2], category: "Volunteer" },
      { ...experienceGroups[1].experiences[1], category: "Volunteer" },
      { ...experienceGroups[1].experiences[3], category: "Volunteer" },
    ],
  },
  {
    id: "education",
    label: "Education",
    entries: experienceGroups[2].experiences.map((entry) => ({ ...entry, category: "Education" })),
  },
];

const categoryIcons = [BriefcaseBusiness, Users, GraduationCap];

/**
 * The detail panel arrives tilted and set back in depth, overlapping the timeline, with two
 * ghost layers fanned out behind it. Everything collapses flat as the frame settles.
 */
const experienceChoreography: Choreography = ({ enter, select }) => {
  enter(".experience-heading-line", { yPercent: 108 }, { start: 0.2, end: 0.7 });
  enter("[data-experience-intro]", { y: 24, opacity: 0 }, { start: 0.4, end: 0.85 });
  enter("[data-experience-categories]", { y: 20, opacity: 0 }, { start: 0.3, end: 0.75 });
  enter("[data-experience-panel]", { rotationY: -16, rotationX: 6, xPercent: -14, z: -180, transformPerspective: 1600, transformOrigin: "0% 50%" }, { start: 0.08, end: 0.96, compact: { y: 40, opacity: 0 } });
  select("[data-experience-ghost]").forEach((ghost, index) => enter(ghost, {
    xPercent: -12 - index * 13, yPercent: 4 + index * 5, rotationY: -20 - index * 6, z: -120 - index * 130, opacity: 0.9 - index * 0.25,
    transformPerspective: 1600, transformOrigin: "0% 50%",
  }, { start: 0.05, end: 0.92, compact: false }));
  enter("[data-experience-index] li", { x: -44, z: -90, opacity: 0, stagger: 0.08, transformPerspective: 1200 }, { start: 0.3, end: 0.9, compact: { x: -20, opacity: 0 } });
};

export function ExperienceScene() {
  const reduceMotion = useReducedMotion();
  const instance = useId();
  const detail = useRef<HTMLDivElement>(null);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [entryIndex, setEntryIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timeline = timelines[categoryIndex];
  const entry = timeline.entries[entryIndex];
  const Icon = categoryIcons[categoryIndex];
  const year = entry.period.match(/\d{4}/)?.[0];
  const selectCategory = (index: number) => {
    setDirection(index >= categoryIndex ? 1 : -1);
    setCategoryIndex(index);
    setEntryIndex(0);
  };
  const selectEntry = (index: number) => {
    setDirection(index >= entryIndex ? 1 : -1);
    setEntryIndex(index);
    if (window.matchMedia("(max-width: 1023px), (max-height: 600px)").matches) {
      detail.current?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
    }
  };

  return <Scene id="experience" eyebrow="" className={`experience-scene ${styles.scene}`} choreography={experienceChoreography}>
    <div className={styles.content}>
      <header className={styles.heading}>
        <div>
          <SceneLabel sceneId="experience" />
          <h1 id="experience-title"><span className={styles.headingMask}><span className="experience-heading-line block">A journey in <span className={styles.accentWord}>motion.</span></span></span></h1>
        </div>
        <p data-experience-intro className={styles.intro}>Building software. Leading teams.{" "}<br />Always learning.</p>
      </header>
      <div className={styles.body}>
        <aside data-experience-index className={styles.index}>
          <nav data-experience-categories aria-label="Experience categories" className={styles.categories}>
            {timelines.map((item, index) => <button key={item.id} type="button" aria-pressed={categoryIndex === index} aria-controls={`${instance}-entries`} onClick={() => selectCategory(index)}>
              {item.label}<span>{String(item.entries.length).padStart(2, "0")}</span>
              {categoryIndex === index && <motion.i aria-hidden="true" layoutId={`${instance}-category`} transition={{ duration: reduceMotion ? 0 : 0.35, ease: portfolioMotion.ease }} />}
            </button>)}
          </nav>
          <ol id={`${instance}-entries`} className={styles.entries} aria-label={`${timeline.label} timeline`}>
            {timeline.entries.map((item, index) => <li key={item.organization}>
              <button type="button" aria-pressed={entryIndex === index} aria-controls={`${instance}-detail`} onClick={() => selectEntry(index)} className={styles.entry}>
                <span className={styles.node} aria-hidden="true"><span /></span>
                <span className={styles.entryText}><span className={styles.period}>{item.period}</span><strong>{item.organization}</strong></span>
                <ArrowUpRight aria-hidden="true" size={17} className={styles.entryArrow} />
                {entryIndex === index && <motion.span aria-hidden="true" className={styles.activeEntry} layoutId={`${instance}-entry`} transition={{ duration: reduceMotion ? 0 : 0.4, ease: portfolioMotion.ease }} />}
              </button>
            </li>)}
          </ol>
          <div className={styles.indexFooter}>
            <span>{String(entryIndex + 1).padStart(2, "0")}<i> / {String(timeline.entries.length).padStart(2, "0")}</i></span>
            <div><button type="button" aria-label="Previous experience" disabled={entryIndex === 0} onClick={() => selectEntry(entryIndex - 1)}><ArrowLeft size={17} /></button><button type="button" aria-label="Next experience" disabled={entryIndex === timeline.entries.length - 1} onClick={() => selectEntry(entryIndex + 1)}><ArrowRight size={17} /></button></div>
          </div>
        </aside>
        <div ref={detail} data-experience-panel id={`${instance}-detail`} className={styles.detail} aria-labelledby={`${instance}-role`}>
          <span aria-hidden="true" data-experience-ghost className={styles.ghost} />
          <span aria-hidden="true" data-experience-ghost className={styles.ghost} />
          <span aria-hidden="true" className={styles.year}>{year ?? String(entryIndex + 1).padStart(2, "0")}</span>
          <span aria-hidden="true" className={styles.orbit} />
          <motion.article key={`${timeline.id}-${entryIndex}`} className={styles.article}
            initial={reduceMotion ? false : { opacity: 0, x: direction * 22, rotateY: direction * -9 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} style={{ transformPerspective: 1200 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: portfolioMotion.ease }}>
            <div className={styles.meta}><span className={styles.icon}><Icon size={22} strokeWidth={1.4} /></span><span>{entry.category}</span><span className={styles.detailPeriod}>{entry.period}</span></div>
            <h2 id={`${instance}-role`}>{entry.role}</h2>
            <p className={styles.organization}>{entry.organization}</p>
            {timeline.id !== "leadership" && <p className={styles.description}>{entry.description}</p>}
            <div className={styles.focus}><span>Areas of focus</span><ul>{entry.focus.split(" / ").map(tool => <li key={tool}>{tool}</li>)}</ul></div>
          </motion.article>
          <div aria-hidden="true" className={styles.detailRule}><span /><i>CHAPTER {String(categoryIndex + 1).padStart(2, "0")} / {timeline.label.toUpperCase()}</i></div>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{timeline.label}. {entryIndex + 1} of {timeline.entries.length}: {entry.role}, {entry.organization}.</p>
    </div>
  </Scene>;
}
