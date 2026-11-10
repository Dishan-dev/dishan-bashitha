"use client";

import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { experience } from "@/data/experience";
import { scrollToY } from "@/lib/portfolioScroll";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import { sideways } from "./sideways";
import styles from "./Flow.module.css";

const tones = [styles.c1, styles.c2, styles.c3, styles.c4];
const pad = (value: number) => String(value).padStart(2, "0");

/** A pinned 3D carousel: scrolling, swiping or the arrows turn each role to the front. */
const experienceMotion: FlowSetup = (section) => {
  const cards = all(section, "[data-xcard]");
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
    if (counter) counter.textContent = pad(Math.round(position) + 1);
  };
  render(0);
  // The cards follow the scroll through a short ease, so turning between roles glides instead of
  // jumping with every wheel tick.
  const shown = { position: 0 };
  const glide = gsap.quickTo(shown, "position", { duration: 0.55, ease: "power3.out", onUpdate: () => render(shown.position) });
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  gsap.from(one(section, "[data-stage]"), { yPercent: 30, opacity: 0, ease: "none",
    scrollTrigger: { trigger: section, start: "top bottom", end: "top 30%", scrub: true } });
  let sync = () => {};
  // A full screen of scrolling per role. Scrolling is never paused or redirected mid-gesture.
  const pin = ScrollTrigger.create({
    trigger: section, start: "top top", end: () => `+=${window.innerHeight * last}`,
    pin: true, scrub: true, invalidateOnRefresh: true,
    onUpdate: self => { glide(self.progress * last); sync(); },
  });
  // Once scrolling has completely stopped (and no finger is on the screen), finish the turn so a
  // card never rests half-turned: a small move towards the next role carries on to it, only a
  // tiny nudge eases back. It runs through the same smooth scroller as everything else.
  let touching = false;
  let rested = 0;
  const down = () => { touching = true; };
  const up = () => { touching = false; };
  const rest = () => {
    if (touching || !pin.isActive) return;
    const position = pin.progress * last, nearest = Math.round(position);
    if (Math.abs(position - nearest) < 0.01) { rested = nearest; return; }
    const drift = position - rested;
    const target = Math.abs(drift) < 0.12 ? rested : drift > 0 ? Math.ceil(position) : Math.floor(position);
    rested = Math.min(last, Math.max(0, target));
    scrollToY(pin.start + ((pin.end - pin.start) * rested) / last);
  };
  window.addEventListener("touchstart", down, { passive: true });
  window.addEventListener("touchend", up, { passive: true });
  window.addEventListener("touchcancel", up, { passive: true });
  ScrollTrigger.addEventListener("scrollEnd", rest);
  const steps = sideways(section, one(section, "[data-stage]") ?? section, pin, last);
  sync = steps.sync;
  return () => {
    ScrollTrigger.removeEventListener("scrollEnd", rest);
    window.removeEventListener("touchstart", down);
    window.removeEventListener("touchend", up);
    window.removeEventListener("touchcancel", up);
    steps.kill();
  };
};

export function ExperienceCarousel() {
  const root = useRef<HTMLElement>(null);
  useFlowMotion(root, experienceMotion);

  return (
    <section ref={root} id="experience" className={styles.exp} aria-labelledby="experience-title">
      <div className={styles.expHeading}>
        <p className={styles.eyebrow}>03 · Experience</p>
        <h2 id="experience-title" className={styles.sectionTitle}><span data-line className={styles.line}><span>Where I’ve worked.</span></span></h2>
      </div>
      <div className={`${styles.stepper} ${styles.paperStepper}`}>
        <button type="button" data-step="-1" aria-label="Show previous role"><ChevronLeft size={18} /></button>
        <span aria-hidden="true"><span data-exp-current>01</span> / {pad(experience.length)}</span>
        <button type="button" data-step="1" aria-label="Show next role"><ChevronRight size={18} /></button>
      </div>
      <ol data-stage data-lenis-prevent-touch className={styles.stage}>
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
