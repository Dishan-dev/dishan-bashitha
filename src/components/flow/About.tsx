"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { profile } from "@/data/profile";
import { skillGroups } from "@/data/skills";
import { reducedQuery } from "@/lib/motion";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import styles from "./Flow.module.css";

/** The badge drops in on its lanyard; the statement and skills reveal in reading order. */
const aboutMotion: FlowSetup = (about) => {
  gsap.from(one(about, "[data-lanyard-drop]"), { yPercent: -70, duration: 1.8, ease: "elastic.out(1, 0.55)",
    scrollTrigger: { trigger: about, start: "top 65%", toggleActions: "play none none reverse" } });
  gsap.from(all(about, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: about, start: "top 70%", toggleActions: "play none none reverse" } });
  gsap.from(all(about, "[data-about-reveal]"), { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08,
    scrollTrigger: { trigger: one(about, "[data-about-copy]"), start: "top 70%", toggleActions: "play none none reverse" } });
  all(about, "[data-skill]").forEach(row => gsap.from(row, { opacity: 0, y: 20, duration: 0.8, ease: "power3.out",
    scrollTrigger: { trigger: row, start: "top 92%", toggleActions: "play none none reverse" } }));
};

export function About() {
  const root = useRef<HTMLElement>(null);
  const swing = useRef<HTMLDivElement>(null);
  useFlowMotion(root, aboutMotion);
  // A damped pendulum hung from the top of the column. Dragging swings the badge toward the
  // pointer, release lets it settle, and scrolling gives it a small push. It only runs while
  // visible, and stays still for reduced motion.
  useEffect(() => {
    const element = swing.current;
    if (!element || window.matchMedia(reducedQuery).matches) return;
    let angle = 0, velocity = 0, frame = 0, visible = false, dragging = false, target = 0, lastScroll = window.scrollY;
    const render = () => { element.style.transform = `rotate(${angle}deg)`; };
    const step = () => {
      if (dragging) { velocity = (target - angle) * 0.35; angle += velocity; }
      else { velocity += -angle * 0.018 - velocity * 0.024; angle += velocity; }
      render();
      if (visible && (dragging || Math.abs(angle) > 0.02 || Math.abs(velocity) > 0.02)) frame = requestAnimationFrame(step);
      else frame = 0;
    };
    const wake = () => { if (visible && !frame) frame = requestAnimationFrame(step); };
    const pivot = () => { const bounds = element.getBoundingClientRect(); return { x: bounds.left + bounds.width / 2, y: element.parentElement!.getBoundingClientRect().top }; };
    const toward = (event: PointerEvent) => {
      const origin = pivot();
      target = Math.max(-38, Math.min(38, (Math.atan2(event.clientX - origin.x, event.clientY - origin.y) * -180) / Math.PI));
    };
    const down = (event: PointerEvent) => {
      if (!(event.target as Element).closest("[data-badge]")) return;
      dragging = true;
      element.setPointerCapture(event.pointerId);
      toward(event);
      wake();
    };
    const move = (event: PointerEvent) => { if (dragging) toward(event); };
    const up = () => { dragging = false; };
    const scroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      velocity = Math.max(-3, Math.min(3, velocity + delta * 0.012));
      wake();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { velocity += 1.6; wake(); } });
    observer.observe(element);
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      window.removeEventListener("scroll", scroll);
      element.style.transform = "";
    };
  }, []);

  return (
    <section ref={root} id="about" className={styles.about} aria-labelledby="about-title">
      <div className={styles.lanyardCol}>
        <div data-lanyard-drop className={styles.lanyardDrop}>
          <div ref={swing} className={styles.lanyard}>
            <span className={styles.strap} aria-hidden="true"><i>DISHAN · BUILD · SHIP · DISHAN · BUILD · SHIP</i></span>
            <span className={styles.clip} aria-hidden="true" />
            <figure data-badge className={styles.badge}>
              <span className={styles.badgeSlot} aria-hidden="true" />
              <div className={styles.badgeTop}><span>DB / ’26</span><span>Software Engineer</span></div>
              <div className={styles.badgePhoto}><Image src="/images/myphoto.png" alt="Dishan Bashitha" fill quality={90} sizes="(max-width: 900px) 900px, 800px" draggable={false} /></div>
              <figcaption>
                <strong>Dishan Bashitha</strong>
                <span>Full Stack Developer</span>
                <span className={styles.badgeMeta}><span>{profile.location}</span><span className={styles.barcode} aria-hidden="true" /></span>
              </figcaption>
            </figure>
          </div>
        </div>
        <p className={styles.lanyardHint} aria-hidden="true">Drag the badge</p>
      </div>

      <div data-about-copy className={styles.aboutCopy}>
        <p className={styles.eyebrow}>02 · About</p>
        <h2 id="about-title" className={styles.sectionTitle}>
          <span data-line className={styles.line}><span>Curious by default.</span></span>
          <span data-line className={`${styles.line} ${styles.dim}`}><span>Intentional by choice.</span></span>
        </h2>
        <div className={styles.aboutText}>
          <p data-about-reveal>Software Engineering undergraduate at the University of Moratuwa, with professional experience building full-stack applications.</p>
          <p data-about-reveal>I work with Java, Spring Boot, React, Next.js, Node.js, and PostgreSQL to build maintainable products, from REST APIs and authentication to real-time systems and cloud deployment.</p>
        </div>
        <div data-about-reveal className={styles.btns}>
          <a className={`${styles.btn} ${styles.paperSolid}`} href={profile.resume} download="DISHAN_BASHITHA.pdf">Download résumé ↗</a>
          <a className={`${styles.btn} ${styles.paperGhost}`} href={`mailto:${profile.email}`}>Get in touch</a>
        </div>
        <dl className={styles.skills} aria-label="Skills">
          {skillGroups.map(([group, tools]) => <div key={group} data-skill className={styles.skillRow}><dt>{group}</dt><dd>{tools}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}
