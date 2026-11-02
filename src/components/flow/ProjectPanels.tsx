"use client";

import { gsap } from "gsap";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { projects } from "@/data/projects";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import { tintFor } from "./projectTints";
import { sideways } from "./sideways";
import styles from "./Flow.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Pinned horizontal travel that settles on each project; swipes and the arrows step through
 * them too. Each window drifts against the travel and its copy settles in.
 */
const panelsMotion: FlowSetup = (section) => {
  const track = one(section, "[data-track]");
  if (!track) return;
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  const last = projects.length - 1;
  const counter = one(section, "[data-project-current]");
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  let sync = () => {};
  const travel = gsap.to(track, { x: () => -distance(), ease: "none",
    scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true,
      snap: { snapTo: 1 / last, inertia: false, duration: { min: 0.2, max: 0.5 }, delay: 0.1, ease: "power2.inOut" },
      onUpdate: self => { if (counter) counter.textContent = pad(Math.round(self.progress * last) + 1); sync(); } } });
  all(section, "[data-panel]").forEach(panel => {
    gsap.fromTo(one(panel, "[data-window]"), { xPercent: 10, rotationY: -22 }, { xPercent: -6, rotationY: -4, ease: "none",
      scrollTrigger: { trigger: panel, containerAnimation: travel, start: "left right", end: "right left", scrub: true } });
    gsap.from(all(panel, "[data-panel-type]"), { yPercent: 40, opacity: 0, stagger: 0.04, ease: "none",
      scrollTrigger: { trigger: panel, containerAnimation: travel, start: "left 85%", end: "left 35%", scrub: true } });
  });
  if (!travel.scrollTrigger) return;
  const steps = sideways(section, track, travel.scrollTrigger, last);
  sync = steps.sync;
  return steps.kill;
};

export function ProjectPanels({ onOpen }: { onOpen: (slug: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useFlowMotion(root, panelsMotion);

  return (
    <section ref={root} id="projects" className={styles.projects} aria-labelledby="projects-title">
      <header className={styles.projectsHeading}>
        <p className={styles.eyebrow}>05 · Projects</p>
        <h2 id="projects-title" className={styles.sectionTitle}><span data-line className={styles.line}><span>All projects.</span></span></h2>
      </header>
      <div className={styles.stepper}>
        <button type="button" data-step="-1" aria-label="Show previous project"><ChevronLeft size={18} /></button>
        <span aria-hidden="true"><span data-project-current>01</span> / {pad(projects.length)}</span>
        <button type="button" data-step="1" aria-label="Show next project"><ChevronRight size={18} /></button>
      </div>
      <div data-track data-lenis-prevent-touch className={styles.track}>
        {projects.map(project => (
          <article key={project.slug} data-panel className={styles.panel} style={{ "--tint": tintFor(project.slug) } as CSSProperties}>
            <div className={styles.panelCopy}>
              <p data-panel-type className={styles.meta}><span>{project.id}</span><span>{project.year}</span><span>{project.marker}</span></p>
              <h3 data-panel-type className={styles.panelTitle}>{project.title}</h3>
              <p data-panel-type className={styles.panelDesc}>{project.description}</p>
              {project.technologies.length > 0 && <ul data-panel-type className={styles.chips}>{project.technologies.slice(0, 4).map(tech => <li key={tech}>{tech}</li>)}</ul>}
              <span data-panel-type className={styles.panelCta} aria-hidden="true">Case study <ArrowUpRight size={15} /></span>
            </div>
            <figure data-window className={styles.panelWindow}>
              <div className={styles.windowBar} aria-hidden="true"><span><i /><i /><i /></span>{project.shortTitle}</div>
              <div data-project-media={project.slug} data-active-media className={styles.windowShot}>
                <Image src={project.coverImage} alt="" fill sizes="(max-width: 720px) 90vw, 620px" />
              </div>
            </figure>
            <button type="button" className={styles.panelOpen} onClick={() => onOpen(project.slug)} aria-label={`Open the ${project.title} case study`} />
          </article>
        ))}
      </div>
    </section>
  );
}
