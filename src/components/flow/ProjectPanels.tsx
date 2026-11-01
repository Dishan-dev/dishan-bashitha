"use client";

import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { projects } from "@/data/projects";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import { tintFor } from "./projectTints";
import styles from "./Flow.module.css";


/** Pinned horizontal travel; each window drifts against it and its copy settles in. */
const panelsMotion: FlowSetup = (section) => {
  const track = one(section, "[data-track]");
  if (!track) return;
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const travel = gsap.to(track, { x: () => -distance(), ease: "none",
    scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true } });
  all(section, "[data-panel]").forEach(panel => {
    gsap.fromTo(one(panel, "[data-window]"), { xPercent: 10, rotationY: -22 }, { xPercent: -6, rotationY: -4, ease: "none",
      scrollTrigger: { trigger: panel, containerAnimation: travel, start: "left right", end: "right left", scrub: true } });
    gsap.from(all(panel, "[data-panel-type]"), { yPercent: 40, opacity: 0, stagger: 0.04, ease: "none",
      scrollTrigger: { trigger: panel, containerAnimation: travel, start: "left 85%", end: "left 35%", scrub: true } });
  });
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
      <div data-track className={styles.track}>
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
