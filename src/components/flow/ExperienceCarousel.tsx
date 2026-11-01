"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fragment, useRef } from "react";
import { experience } from "@/data/experience";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import styles from "./Flow.module.css";

const tones = [styles.c1, styles.c2, styles.c3, styles.c4];
const themes = ["Building software", "Leading teams", "Always learning"];
const pad = (value: number) => String(value).padStart(2, "0");

/** A pinned 3D carousel: scrolling turns each role to the front over a drifting marquee. */
const experienceMotion: FlowSetup = (section) => {
  const cards = all(section, "[data-xcard]");
  const track = one(section, "[data-marquee]");
  const counter = one(section, "[data-exp-current]");
  const last = cards.length - 1;
  const render = (position: number) => {
    cards.forEach((card, index) => {
      const offset = index - position;
      const distance = Math.abs(offset);
      // Neighbours turn only partway and sit well clear of the front card so they stay legible.
      const near = Math.min(distance, 1);
      gsap.set(card, {
        xPercent: offset * 66,
        rotationY: -Math.sign(offset) * near * 34,
        z: -near * 110 - Math.max(distance - 1, 0) * 160,
        scale: 1 - near * 0.06,
        opacity: distance > 2.2 ? 0 : 1 - Math.max(distance - 1.4, 0) * 1.25,
        zIndex: 100 - Math.round(distance * 10),
      });
    });
    gsap.set(track, { xPercent: -(position / last) * 45 });
    if (counter) counter.textContent = pad(Math.round(position) + 1);
  };
  render(0);
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  gsap.from(one(section, "[data-stage]"), { yPercent: 30, opacity: 0, ease: "none",
    scrollTrigger: { trigger: section, start: "top bottom", end: "top 30%", scrub: true } });
  ScrollTrigger.create({
    trigger: section, start: "top top", end: () => `+=${window.innerHeight * last * 0.5}`,
    pin: true, scrub: true, invalidateOnRefresh: true,
    snap: { snapTo: 1 / last, duration: { min: 0.2, max: 0.5 }, ease: "power2.inOut" },
    onUpdate: self => render(self.progress * last),
  });
};

export function ExperienceCarousel() {
  const root = useRef<HTMLElement>(null);
  useFlowMotion(root, experienceMotion);
  const marquee = [...themes, ...themes];

  return (
    <section ref={root} id="experience" className={styles.exp} aria-labelledby="experience-title">
      <div className={styles.expHeading}>
        <p className={styles.eyebrow}>03 · Experience</p>
        <h2 id="experience-title" className={styles.sectionTitle}><span data-line className={styles.line}><span>A journey in motion.</span></span></h2>
      </div>
      <p className={styles.expCount} aria-hidden="true"><span data-exp-current>01</span> / {pad(experience.length)}</p>
      <div className={styles.marquee} aria-hidden="true">
        <div data-marquee className={styles.marqueeTrack}>
          {marquee.map((theme, index) => <Fragment key={index}>{index > 0 && <span className={styles.ring} />}<span>{theme}</span></Fragment>)}
        </div>
      </div>
      <ol data-stage className={styles.stage}>
        {experience.map((entry, index) => (
          <li key={`${entry.organization}-${entry.role}`} data-xcard className={`${styles.xcard} ${tones[index % tones.length]}`}>
            <div className={styles.cardTop}><span className={styles.tag}>{entry.period}</span>{entry.category !== entry.period && <span>{entry.category}</span>}</div>
            <div>
              <h3>{entry.role}</h3>
              <p className={styles.org}>{entry.organization}</p>
              <p>{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <a className={`${styles.btn} ${styles.expCta}`} href="#projects">See the work</a>
    </section>
  );
}
