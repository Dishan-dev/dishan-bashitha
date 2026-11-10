"use client";

import { gsap } from "gsap";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { projects } from "@/data/projects";
import { scrollToY } from "@/lib/portfolioScroll";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import { tintFor } from "./projectTints";
import { sideways } from "./sideways";
import { openInPlace, projectHref } from "./projectLink";
import { techIcons } from "./techIcons";
import styles from "./Flow.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

// Every technology used across the projects, most used first (ties keep their first appearance).
const techs = (() => {
  const counts = new Map<string, number>();
  projects.forEach(project => project.technologies.forEach(tech => counts.set(tech, (counts.get(tech) ?? 0) + 1)));
  return [...counts].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
})();

/**
 * Pinned horizontal travel that settles on each project; swipes and the arrows step through
 * them too. Each window drifts against the travel and its copy settles in. The pin holds for a
 * while before the travel starts and after it ends, so the first and last projects stay on screen
 * instead of being swept past, and a progress bar shows the way through.
 */
const panelsMotion = (section: HTMLElement, count: number) => {
  const track = one(section, "[data-track]");
  if (!track) return;
  gsap.from(all(section, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" } });
  const last = count - 1;
  const counter = one(section, "[data-project-current]");
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  // Scroll held on the first project before the travel, and on the last one after it (a little
  // longer, as the eased travel finishes slightly behind the scroll).
  const lead = () => Math.round(window.innerHeight * 0.6);
  const tail = () => Math.round(window.innerHeight * 0.8);
  const fill = one(section, "[data-projects-fill]");
  const dots = all(section, "[data-projects-dot]");
  // Each dot sits where its project comes to rest along the whole pinned stretch.
  const placeDots = () => {
    const total = lead() + distance() + tail();
    dots.forEach((dot, index) => { dot.style.left = `${((lead() + (last > 0 ? (distance() * index) / last : 0)) / total) * 100}%`; });
  };
  const hold = ScrollTrigger.create({
    trigger: section, start: "top top", end: () => `+=${lead() + distance() + tail()}`, pin: true, invalidateOnRefresh: true,
    onRefresh: placeDots,
    onUpdate: self => {
      if (fill) fill.style.transform = `scaleX(${self.progress})`;
      dots.forEach(dot => dot.toggleAttribute("data-reached", self.progress * 100 >= parseFloat(dot.style.left) - 0.5));
    },
  });
  placeDots();
  let sync = () => {};
  // The travel runs between the two holds; the hold above does the pinning. Its range is given
  // as scroll positions from the hold, since a trigger on the pinned section itself would be
  // measured as starting after the whole pinned stretch.
  const travel = gsap.to(track, { x: () => -distance(), ease: "none",
    scrollTrigger: { trigger: section, start: () => hold.start + lead(), end: () => hold.start + lead() + Math.max(1, distance()), scrub: 1, invalidateOnRefresh: true,
      ...(last > 0 ? { snap: { snapTo: 1 / last, inertia: false, duration: { min: 0.2, max: 0.5 }, delay: 0.1, ease: "power2.inOut" } } : {}),
      onUpdate: self => { if (counter) counter.textContent = pad(Math.round(self.progress * last) + 1); sync(); } } });
  // With nowhere to travel (a single matching project), panels simply show as they are.
  if (distance() > 0) all(section, "[data-panel]").forEach(panel => {
    gsap.fromTo(one(panel, "[data-window]"), { xPercent: 10, rotationY: -22 }, { xPercent: -6, rotationY: -4, ease: "none",
      scrollTrigger: { trigger: panel, containerAnimation: travel, start: "left right", end: "right left", scrub: true } });
    gsap.from(all(panel, "[data-panel-type]"), { yPercent: 40, opacity: 0, stagger: 0.04, ease: "none",
      scrollTrigger: { trigger: panel, containerAnimation: travel, start: "left 85%", end: "left 35%", scrub: true } });
  });
  const resetBar = () => { if (fill) fill.style.removeProperty("transform"); dots.forEach(dot => { dot.removeAttribute("data-reached"); dot.style.removeProperty("left"); }); };
  if (!travel.scrollTrigger) return () => { hold.kill(); resetBar(); };
  // A single matching project: nothing to step through.
  if (last < 1) {
    const buttons = all(section, "[data-step]") as HTMLButtonElement[];
    buttons.forEach(button => { button.disabled = true; });
    return () => { buttons.forEach(button => { button.disabled = false; }); resetBar(); };
  }
  const steps = sideways(section, track, travel.scrollTrigger, last);
  sync = steps.sync;
  return () => { steps.kill(); resetBar(); };
};

export function ProjectPanels({ onOpen }: { onOpen: (slug: string) => void }) {
  const root = useRef<HTMLElement>(null);
  // The technology the projects are filtered by; null shows every project.
  const [tech, setTech] = useState<string | null>(null);
  const visible = tech ? projects.filter(project => project.technologies.includes(tech)) : projects;
  // The pinned travel is rebuilt for the number of panels shown.
  const setup = useCallback<FlowSetup>(section => panelsMotion(section, visible.length), [visible.length]);
  useFlowMotion(root, setup);

  // After filtering, re-measure the page (the section's travel changed length) and return to the
  // first matching project.
  // Compared with the last filter seen, so it runs only when the filter actually changes (not on
  // first load, nor when React re-runs effects in development).
  const shownTech = useRef(tech);
  useEffect(() => {
    if (shownTech.current === tech) return;
    shownTech.current = tech;
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const pin = ScrollTrigger.getAll().find(trigger => trigger.pin === root.current);
      if (pin) scrollToY(pin.start);
      // Re-pinning moves the section in the page, which resets the chip row; bring the chosen chip back into view.
      const row = root.current?.querySelector<HTMLElement>("[data-filters]");
      const chip = row?.querySelector<HTMLElement>("[aria-pressed='true']");
      if (row && chip) row.scrollLeft = chip.offsetLeft - row.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [tech]);

  return (
    <section ref={root} id="projects" className={styles.projects} aria-labelledby="projects-title">
      <header className={styles.projectsHeading}>
        <p className={styles.eyebrow}>05 · Projects</p>
        <h2 id="projects-title" className={styles.sectionTitle}><span data-line className={styles.line}><span>All projects.</span></span></h2>
        <div data-filters className={styles.filters} role="group" aria-label="Filter projects by technology">
          <button type="button" aria-pressed={tech === null} onClick={() => setTech(null)}>All <small>{projects.length}</small></button>
          {techs.map(({ name, count }) => {
            const Icon = techIcons[name];
            return (
              <button key={name} type="button" aria-pressed={tech === name} onClick={() => setTech(current => current === name ? null : name)}>
                {Icon && <Icon aria-hidden="true" />}{name} <small>{count}</small>
              </button>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">{tech ? `${visible.length} ${visible.length === 1 ? "project" : "projects"} built with ${tech}` : ""}</p>
      </header>
      <div className={`${styles.stepper} ${styles.paperStepper}`}>
        <button type="button" data-step="-1" aria-label="Show previous project"><ChevronLeft size={18} /></button>
        <span aria-hidden="true"><span data-project-current>01</span> / {pad(visible.length)}</span>
        <button type="button" data-step="1" aria-label="Show next project"><ChevronRight size={18} /></button>
      </div>
      <div className={styles.projectsProgress} aria-hidden="true">
        <span data-projects-fill />
        {visible.map(project => <i key={project.slug} data-projects-dot />)}
      </div>
      <div data-track data-lenis-prevent-touch className={styles.track}>
        {visible.map(project => (
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
                <Image src={project.coverImage} alt={`${project.title} ${project.headline.toLowerCase()} interface`} fill sizes="(max-width: 720px) 90vw, 620px" />
              </div>
            </figure>
            <a href={projectHref(project.slug)} className={styles.panelOpen} onClick={openInPlace(() => onOpen(project.slug))} aria-label={`Open the ${project.title} case study`} />
          </article>
        ))}
      </div>
    </section>
  );
}
