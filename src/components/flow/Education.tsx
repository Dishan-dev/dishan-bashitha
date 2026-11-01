"use client";

import { gsap } from "gsap";
import { GraduationCap } from "lucide-react";
import { useRef } from "react";
import { education } from "@/data/experience";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import styles from "./Flow.module.css";

const tones = [styles.c1, styles.c4, styles.c3];

/** A rail draws down beside the qualifications while each card tilts up into place. */
const educationMotion: FlowSetup = (section) => {
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  const list = one(section, "[data-edu-list]");
  gsap.fromTo(one(section, "[data-edu-progress]"), { scaleY: 0 }, { scaleY: 1, ease: "none",
    scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 60%", scrub: true } });
  all(section, "[data-edu-item]").forEach(item => {
    gsap.from(item, { rotationX: 18, y: 90, opacity: 0, transformPerspective: 1200, transformOrigin: "50% 100%", ease: "power2.out",
      scrollTrigger: { trigger: item, start: "top 95%", end: "top 60%", scrub: true } });
  });
};

export function Education() {
  const root = useRef<HTMLElement>(null);
  useFlowMotion(root, educationMotion);

  return (
    <section ref={root} id="education" className={styles.edu} aria-labelledby="education-title">
      <header className={styles.eduHeading}>
        <p className={styles.eyebrow}>04 · Education</p>
        <h2 id="education-title" className={styles.sectionTitle}>
          <span data-line className={styles.line}><span>Always</span></span>
          <span data-line className={`${styles.line} ${styles.dim}`}><span>learning.</span></span>
        </h2>
        <p className={styles.eduIntro}>Three chapters of study in software engineering, information technology and management.</p>
      </header>
      <ol data-edu-list className={styles.eduList}>
        <span className={styles.eduRail} aria-hidden="true"><i data-edu-progress /></span>
        {education.map((entry, index) => (
          <li key={entry.organization} data-edu-item className={`${styles.eduCard} ${tones[index % tones.length]}`}>
            <div className={styles.cardTop}>
              <span className={styles.tag}>{entry.period}</span>
              <GraduationCap aria-hidden="true" size={22} strokeWidth={1.4} />
            </div>
            <div>
              <p className={styles.org}>{entry.organization}</p>
              <h3>{entry.role}</h3>
              <p>{entry.description}</p>
            </div>
            <span className={styles.eduIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
