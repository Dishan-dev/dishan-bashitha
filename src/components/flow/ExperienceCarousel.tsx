"use client";

import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Fragment, useRef } from "react";
import { experience } from "@/data/experience";
import { brakeTo, isTravelling, scrollToY, setScrollWeight } from "@/lib/portfolioScroll";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import { sideways } from "./sideways";
import styles from "./Flow.module.css";

const tones = [styles.c1, styles.c2, styles.c3, styles.c4];
const themes = ["Building software", "Leading teams", "Always learning"];
const pad = (value: number) => String(value).padStart(2, "0");

/** A pinned 3D carousel: scrolling, swiping or the arrows turn each role to the front over a drifting marquee. */
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
    gsap.set(track, { xPercent: -(position / last) * 30 });
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
  // The role the reader last rested on. A single flick may only turn one role from it, so no
  // role is skipped in a hurry.
  let settled = 0;
  const roleY = (self: ScrollTrigger, index: number) => self.start + ((self.end - self.start) * index) / last;
  // A fast scroll arriving at the carousel is caught at its first (or, coming back up, last) role.
  const arrive = (self: ScrollTrigger, at: number) => {
    settled = at;
    if (!isTravelling() && Math.abs(self.getVelocity()) > 1600) brakeTo(roleY(self, at));
  };
  // Leaving in a hurry before the end role was shown: hold on that role first.
  const leave = (self: ScrollTrigger, at: number) => {
    if (isTravelling() || settled === at) return;
    settled = at;
    brakeTo(roleY(self, at));
  };
  const pin = ScrollTrigger.create({
    trigger: section, start: "top top", end: () => `+=${window.innerHeight * last * 0.85}`,
    pin: true, scrub: true, invalidateOnRefresh: true,
    onEnter: self => arrive(self, 0),
    onEnterBack: self => arrive(self, last),
    onLeave: self => leave(self, last),
    onLeaveBack: self => leave(self, 0),
    // Scrolling is slightly heavier while the carousel holds the screen, so a hurried flick turns
    // fewer roles; settling (below) does the rest.
    onToggle: self => setScrollWeight(self.isActive ? 0.6 : 1),
    onUpdate: self => {
      const position = self.progress * last;
      glide(position);
      sync();
      // Only a very hard flick is held, at the next role, before it can skip past it.
      if (!isTravelling() && Math.abs(position - settled) > 1.5) {
        settled += Math.sign(position - settled);
        brakeTo(roleY(self, settled));
      }
    },
  });
  // Settling runs through the smooth scroller once it has fully come to rest (GSAP's own snap
  // fights Lenis's easing and can loop). Any deliberate nudge carries on to the next role in that
  // direction; a tiny one eases back. Never more than one role from the last.
  const rest = () => {
    if (!pin.isActive || isTravelling()) return;
    const position = pin.progress * last, nearest = Math.round(position);
    // Already on a role (a settle, the arrows, a swipe or Bit put it there).
    if (Math.abs(position - nearest) < 0.01) { settled = nearest; return; }
    const drift = position - settled;
    settled = Math.min(last, Math.max(0, Math.abs(drift) < 0.05 ? settled : settled + Math.sign(drift)));
    scrollToY(roleY(pin, settled));
  };
  ScrollTrigger.addEventListener("scrollEnd", rest);
  const steps = sideways(section, one(section, "[data-stage]") ?? section, pin, last);
  sync = steps.sync;
  return () => { setScrollWeight(1); ScrollTrigger.removeEventListener("scrollEnd", rest); steps.kill(); };
};

export function ExperienceCarousel() {
  const root = useRef<HTMLElement>(null);
  useFlowMotion(root, experienceMotion);
  // Repeated so the band always spans the screen as it drifts.
  const marquee = [...themes, ...themes, ...themes, ...themes];

  return (
    <section ref={root} id="experience" className={styles.exp} aria-labelledby="experience-title">
      <div className={styles.expHeading}>
        <p className={styles.eyebrow}>03 · Experience</p>
        <h2 id="experience-title" className={styles.sectionTitle}><span data-line className={styles.line}><span>A journey in motion.</span></span></h2>
      </div>
      <div className={`${styles.stepper} ${styles.paperStepper}`}>
        <button type="button" data-step="-1" aria-label="Show previous role"><ChevronLeft size={18} /></button>
        <span aria-hidden="true"><span data-exp-current>01</span> / {pad(experience.length)}</span>
        <button type="button" data-step="1" aria-label="Show next role"><ChevronRight size={18} /></button>
      </div>
      <div className={styles.marquee} aria-hidden="true">
        <div data-marquee className={styles.marqueeTrack}>
          {marquee.map((theme, index) => <Fragment key={index}>{index > 0 && <span className={styles.ring} />}<span>{theme}</span></Fragment>)}
        </div>
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
