"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap } from "lucide-react";
import { useRef } from "react";
import { education } from "@/data/experience";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import styles from "./Flow.module.css";

const tones = [styles.c1, styles.c4, styles.c3];

/**
 * A rail draws down beside the qualifications while each card tilts up into place. Once the
 * section is fully on screen it holds for a while (like the pinned sections), so it can be read
 * before the next section slides over it; the rail finishes filling during that hold.
 */
const educationMotion: FlowSetup = (section) => {
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  const list = one(section, "[data-edu-list]");
  // Held from the moment its bottom reaches the screen's bottom (on phones, where it is taller
  // than the screen, that is after its last card has scrolled into view).
  const hold = ScrollTrigger.create({ trigger: section, start: "bottom bottom", end: () => `+=${Math.round(window.innerHeight * 0.6)}`, pin: true, invalidateOnRefresh: true });
  gsap.fromTo(one(section, "[data-edu-progress]"), { scaleY: 0 }, { scaleY: 1, ease: "none",
    scrollTrigger: { trigger: list, start: "top 70%", end: () => hold.end, scrub: true, invalidateOnRefresh: true } });
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
          <span data-line className={styles.line}><span>Where I</span></span>
          <span data-line className={`${styles.line} ${styles.dim}`}><span>studied.</span></span>
        </h2>
        <p className={styles.eduIntro}>Degrees and a diploma in software engineering and IT management.</p>
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
