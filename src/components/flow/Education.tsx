"use client";

import { gsap } from "gsap";
import { GraduationCap } from "lucide-react";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { education } from "@/data/experience";
import { brakeTo, isTravelling } from "@/lib/portfolioScroll";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import styles from "./Flow.module.css";

const tones = [styles.c1, styles.c4, styles.c3];

/**
 * A rail draws down beside the qualifications while each card tilts up into place. A hurried
 * scroll is caught as it reaches the section so the qualifications are not flown past.
 */
const educationMotion: FlowSetup = (section) => {
  const catchAt = (self: ScrollTrigger, y: number) => { if (!isTravelling() && Math.abs(self.getVelocity()) > 1600) brakeTo(y); };
  ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom bottom",
    onEnter: self => catchAt(self, self.start), onEnterBack: self => catchAt(self, self.end) });
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  const list = one(section, "[data-edu-list]");
  gsap.fromTo(one(section, "[data-edu-progress]"), { scaleY: 0 }, { scaleY: 1, ease: "none",
    scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 60%", scrub: true } });
  all(section, "[data-edu-item]").forEach(item => {
    // Played (not scrubbed) as soon as the card enters, so a quick scroll never passes a half-faded card.
    gsap.from(item, { rotationX: 14, y: 60, opacity: 0, transformPerspective: 1200, transformOrigin: "50% 100%", duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: item, start: "top 92%", toggleActions: "play none none reverse" } });
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
