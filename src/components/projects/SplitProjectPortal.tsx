"use client";

import { AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Code2, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { createPortal } from "react-dom";
import { ProjectViewer } from "@/components/projects/ProjectViewer";
import { SceneLabel } from "@/components/ui/SceneLabel";
import { ProjectOrbitDeck } from "@/components/projects/ProjectOrbitDeck";
import type { Project } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { portfolioMotion, stackedQuery } from "@/lib/motion";
import { sceneGeometryFor } from "@/lib/portfolioScroll";
import styles from "./ProjectShowcase.module.css";

gsap.registerPlugin(ScrollTrigger);

const projectColors = ["#a88aef", "#8baae8", "#79bca5", "#d7a576"];

/**
 * Art-directed starting composition, as fractions of the scene: one featured card near the
 * front, the rest scattered further back at different scales, tilts, and depths.
 */
const featuredPose = { cx: 0.5, cy: 0.62, width: 0.3, z: 40, rotationX: 5, rotationY: -8, rotationZ: 0 };
const scatteredPoses = [
  { cx: 0.14, cy: 0.3, width: 0.14, z: -260, rotationX: 0, rotationY: 18, rotationZ: -4 },
  { cx: 0.85, cy: 0.38, width: 0.17, z: -140, rotationX: 0, rotationY: -16, rotationZ: 3 },
  { cx: 0.21, cy: 0.79, width: 0.12, z: -380, rotationX: 0, rotationY: 14, rotationZ: 2 },
  { cx: 0.8, cy: 0.83, width: 0.1, z: -460, rotationX: 0, rotationY: -12, rotationZ: -2 },
];

type Box = { x: number; y: number; width: number; height: number };

/** Layout offsets ignore the frame's scroll transforms, so measurements are stable mid-scroll. */
function offsetWithin(element: HTMLElement, ancestor: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const parent = node.offsetParent as HTMLElement | null;
    if (parent && parent !== ancestor) { x += parent.clientLeft; y += parent.clientTop; }
    node = parent;
  }
  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

const subscribeNever = () => () => undefined;

export function SplitProjectPortal({ projects }: { projects: readonly Project[] }) {
  const root = useRef<HTMLElement>(null);
  const floatStage = useRef<HTMLDivElement>(null);
  const depthStage = useRef<HTMLDivElement>(null);
  const tilt = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc; lift: gsap.QuickToFunc } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const wheelLock = useRef(0);
  const direction = useRef(1);
  const shownProject = useRef<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const reduceMotion = useReducedMotion();
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);
  const skills = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach(item => new Set(item.technologies).forEach(skill => counts.set(skill, (counts.get(skill) ?? 0) + 1)));
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [projects]);
  const filteredProjects = useMemo(() => activeSkill ? projects.filter(item => item.technologies.includes(activeSkill)) : projects, [projects, activeSkill]);
  const project = filteredProjects[activeIndex];
  const originalIndex = projects.findIndex(item => item.id === project.id);
  const visibleSkills = showAllSkills ? skills : skills.filter((skill, index) => index < 4 || skill.name === activeSkill);
  const canNavigate = filteredProjects.length > 1;
  const displayedTechnologies = activeSkill ? [activeSkill, ...project.technologies.filter(skill => skill !== activeSkill)] : project.technologies;
  const filteredKey = filteredProjects.map(item => item.id).join();

  const selectSkill = (skill: string | null) => {
    const nextProjects = skill ? projects.filter(item => item.technologies.includes(skill)) : projects;
    // Keep the current project if it matches; otherwise spotlight the first result.
    setActiveIndex(Math.max(0, nextProjects.findIndex(item => item.id === project.id)));
    setActiveSkill(skill);
    direction.current = 1;
    wheelLock.current = 0;
  };

  const revealPreview = useCallback(() => {
    if (!window.matchMedia("(max-width: 1023px), (max-height: 600px)").matches) return;
    root.current?.querySelector("#project-spotlight")?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
  }, [reduceMotion]);

  const selectProject = useCallback((index: number) => {
    direction.current = index >= activeIndex ? 1 : -1;
    setActiveIndex(index);
    revealPreview();
  }, [activeIndex, revealPreview]);

  const stepProject = useCallback((step: number) => {
    if (filteredProjects.length < 2) return;
    direction.current = step;
    setActiveIndex((index) => (index + step + filteredProjects.length) % filteredProjects.length);
  }, [filteredProjects.length]);

  const open = () => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpenProject(project);
    window.history.pushState({ ...window.history.state, projectViewer: project.slug }, "", `#project-${project.slug}`);
  };

  const close = useCallback(() => {
    if (openProject && window.history.state?.projectViewer === openProject.slug) window.history.back();
    else { window.history.replaceState(window.history.state, "", "#projects"); setOpenProject(null); }
  }, [openProject]);

  useEffect(() => {
    const restoreProject = () => {
      const selected = projects.find(item => `#project-${item.slug}` === window.location.hash);
      setOpenProject(selected ?? null);
      if (selected) { setActiveSkill(null); setActiveIndex(projects.indexOf(selected)); }
    };
    const frame = requestAnimationFrame(restoreProject);
    window.addEventListener("popstate", restoreProject);
    window.addEventListener("hashchange", restoreProject);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("popstate", restoreProject); window.removeEventListener("hashchange", restoreProject); };
  }, [projects]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (openProject || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true'], [inert], [data-project-filters]")) return;
      if (root.current?.closest("[inert]")) return;
      // Arrow keys belong to the gallery only while it is the scene in view.
      const bounds = root.current?.getBoundingClientRect();
      if (!bounds || bounds.bottom < window.innerHeight * 0.4 || bounds.top > window.innerHeight * 0.6) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        stepProject(event.key === "ArrowRight" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openProject, stepProject]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("[data-project-filters]")) return;
      if (openProject || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (Math.abs(event.deltaX) < 16 || performance.now() < wheelLock.current) return;
      wheelLock.current = performance.now() + 650;
      stepProject(event.deltaX > 0 ? 1 : -1);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [openProject, stepProject]);

  // Switching projects re-sets the description in sequence; the first render is composed by scroll.
  useLayoutEffect(() => {
    const previous = shownProject.current;
    shownProject.current = project.id;
    if (!previous || previous === project.id || reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo("[data-project-copy]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.62, delay: 0.1, stagger: 0.055, ease: portfolioMotion.gsapEase });
      gsap.fromTo("[data-project-progress]", { scaleX: 0 }, { scaleX: 1, duration: 0.85, ease: portfolioMotion.gsapEase });
    }, root);
    return () => context.revert();
  }, [project.id, reduceMotion]);

  /**
   * Floating sequence. While the Projects frame rises, its covers drift at different depths;
   * once it arrives they converge onto the real gallery (the featured card onto the spotlight,
   * the rest into their index thumbnails) and hand over to the interactive layout.
   */
  useLayoutEffect(() => {
    const showcase = root.current;
    const stage = floatStage.current;
    const scene = showcase?.parentElement;
    if (!showcase || !stage || !scene) return;
    const media = gsap.matchMedia();
    media.add(stackedQuery, () => {
      const floaters = Array.from(stage.querySelectorAll<HTMLElement>("[data-floater]"));
      const heading = showcase.querySelector<HTMLElement>("[data-gallery-heading]");
      if (!heading) return;
      type Layout = { heading: { x: number; y: number }; floaters: Array<Box & { x: number; y: number; scale: number; lag: number; pose: typeof featuredPose; settles: boolean }> };
      let layout: Layout;
      const measure = () => {
        const width = scene.clientWidth;
        const height = scene.clientHeight;
        const headingBox = offsetWithin(heading, scene);
        let scattered = 0;
        layout = {
          heading: { x: width / 2 - (headingBox.x + headingBox.width / 2), y: height * 0.3 - (headingBox.y + headingBox.height / 2) },
          floaters: floaters.map(floater => {
            const id = floater.dataset.floater;
            const featured = id === project.id;
            const pose = featured ? featuredPose : scatteredPoses[scattered++ % scatteredPoses.length];
            const target = featured
              ? showcase.querySelector<HTMLElement>("[data-project-media][data-active-media]")
              : showcase.querySelector<HTMLElement>(`[data-project-thumb="${id}"]`);
            // A filtered-out project has nowhere to settle; it drifts back and fades instead.
            const box = target ? offsetWithin(target, scene) : { x: pose.cx * width - 60, y: pose.cy * height - 40, width: 120, height: 80 };
            gsap.set(floater, { left: box.x, top: box.y, width: box.width, height: box.height });
            return {
              ...box, pose, settles: Boolean(target),
              x: pose.cx * width - (box.x + box.width / 2),
              y: pose.cy * height - (box.y + box.height / 2),
              scale: (pose.width * width) / box.width,
              lag: (pose.z / -460) * height * 0.22,
            };
          }),
        };
      };
      measure();
      ScrollTrigger.addEventListener("refreshInit", measure);

      const timeline = gsap.timeline({ defaults: { ease: "none" } });
      // 0–1: the frame rises and deeper cards trail behind; 1–2: the composition organises itself.
      floaters.forEach((floater, index) => {
        const item = () => layout.floaters[index];
        timeline.fromTo(floater, {
          x: () => item().x, y: () => item().y - item().lag, z: () => item().pose.z, scale: () => item().scale,
          rotationX: () => item().pose.rotationX, rotationY: () => item().pose.rotationY, rotationZ: () => item().pose.rotationZ, opacity: 1,
        }, { y: () => item().y, duration: 1 }, 0);
        timeline.to(floater, {
          x: () => item().settles ? 0 : item().x * 1.15, y: () => item().settles ? 0 : item().y * 1.15, z: () => item().settles ? 0 : -700,
          scale: () => item().settles ? 1 : item().scale * 0.8, rotationX: 0, rotationY: 0, rotationZ: 0,
          duration: 0.74, ease: "power2.inOut",
        }, 1.12 + index * 0.035);
        timeline.to(floater, { opacity: 0, duration: 0.06 }, layout.floaters[index].settles ? 1.93 : 1.5);
      });
      gsap.set(heading, { transformOrigin: "50% 50%" });
      timeline.fromTo(heading, { x: () => layout.heading.x, y: () => layout.heading.y, scale: 1.8 }, { x: 0, y: 0, scale: 1, duration: 0.72, ease: "power2.inOut" }, 1.1);
      // Explicit sets at 0 keep staggered start states intact across refreshes and reverse scrolling.
      const settle = showcase.querySelectorAll("[data-settle]");
      const settleItems = showcase.querySelectorAll("[data-settle-item]");
      timeline.set(settle, { opacity: 0, y: 26 }, 0).set(settleItems, { opacity: 0, y: 18 }, 0).set(depthStage.current, { opacity: 0, scale: 0.97 }, 0);
      timeline.fromTo(stage.querySelectorAll("[data-floater-label]"), { opacity: 1 }, { opacity: 0, duration: 0.12 }, 1.12);
      timeline.to(settle, { opacity: 1, y: 0, duration: 0.24, stagger: 0.05, ease: "power2.out" }, 1.55);
      timeline.to(settleItems, { opacity: 1, y: 0, duration: 0.18, stagger: 0.04, ease: "power2.out" }, 1.72);
      timeline.to(depthStage.current, { opacity: 1, scale: 1, duration: 0.12 }, 1.84);

      const geometry = () => sceneGeometryFor("work") ?? { top: 0, rest: 0 };
      ScrollTrigger.create({
        animation: timeline, scrub: true, invalidateOnRefresh: true,
        start: () => geometry().top - window.innerHeight,
        end: () => geometry().rest,
        // Controls stay inert until the composition has handed over to them.
        onUpdate: self => { showcase.dataset.composing = String(self.progress < 0.97); },
        onRefresh: self => { showcase.dataset.composing = String(self.progress < 0.97); },
      });
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", measure);
        delete showcase.dataset.composing;
      };
    });
    return () => media.revert();
  }, [project.id, filteredKey]);

  useEffect(() => {
    const element = depthStage.current;
    if (!element || reduceMotion) return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const configure = () => {
      tilt.current = null;
      if (!media.matches || openProject) return;
      // One smoothed input drives all depth planes; no React renders on mousemove.
      gsap.set(element, { "--pointer-x": 0, "--pointer-y": 0, "--lift": 0 });
      tilt.current = {
        x: gsap.quickTo(element, "--pointer-x", { duration: 0.48, ease: "power3.out" }),
        y: gsap.quickTo(element, "--pointer-y", { duration: 0.48, ease: "power3.out" }),
        lift: gsap.quickTo(element, "--lift", { duration: 0.45, ease: "power3.out" }),
      };
    };
    configure();
    media.addEventListener("change", configure);
    const settle = () => { tilt.current?.x(0); tilt.current?.y(0); tilt.current?.lift(0); };
    window.addEventListener("blur", settle);
    return () => {
      media.removeEventListener("change", configure);
      window.removeEventListener("blur", settle);
      tilt.current = null;
    };
  }, [reduceMotion, openProject]);

  const resetTilt = () => { tilt.current?.x(0); tilt.current?.y(0); tilt.current?.lift(0); };
  const movePreview = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !tilt.current) return;
    // Measure the stationary frame, never the rotating card (which causes feedback jitter).
    const bounds = event.currentTarget.getBoundingClientRect();
    tilt.current.x(Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)));
    tilt.current.y(Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)));
    tilt.current.lift(1);
  };

  return (
    <>
      <div ref={floatStage} aria-hidden="true" className={styles.floatStage}>
        {projects.map(item => <div key={item.id} data-floater={item.id} data-featured={item.id === project.id || undefined} className={styles.floater}>
          <Image src={item.coverImage} alt="" fill sizes="(min-width: 1024px) 34vw, 1px" className={styles.floaterImage} />
          <span data-floater-label className={styles.floaterLabel}><strong>{item.title}</strong><span>{item.marker} · {item.year}</span></span>
        </div>)}
      </div>
      <section ref={root} inert={Boolean(openProject)} aria-label="Project showcase" className={styles.showcase} style={{ "--project-color": projectColors[originalIndex % projectColors.length] } as CSSProperties}>
        <header className={styles.heading}>
          <div data-gallery-heading className={styles.galleryHeading}>
            <SceneLabel sceneId="work" />
            <h1 id="work-title">Selected <span>work.</span><sup>({String(projects.length).padStart(2, "0")})</sup></h1>
          </div>
          <p data-settle className={styles.headingNote}>A few things I&apos;ve built.<br />Thoughtful interfaces. Real-world systems.<ArrowDownRight size={22} aria-hidden="true" /></p>
        </header>
        <div data-settle data-project-filters className={styles.filters} role="group" aria-labelledby="project-filter-label">
          <div className={styles.filterHeading}>
            <p id="project-filter-label"><SlidersHorizontal size={14} aria-hidden="true" /> Filter by tech skill</p>
            <p className={styles.filterCount}>{filteredProjects.length} of {projects.length} projects</p>
          </div>
          <div id="project-skill-options" className={styles.filterOptions}>
            <button type="button" onClick={() => selectSkill(null)} aria-pressed={activeSkill === null} aria-controls="project-results" className={styles.filterChip}>All projects<span>{projects.length}</span></button>
            {visibleSkills.map(skill => <button key={skill.name} type="button" onClick={() => selectSkill(skill.name)} aria-pressed={activeSkill === skill.name} aria-controls="project-results" className={styles.filterChip}>{skill.name}<span>{skill.count}</span></button>)}
            {skills.length > 4 && <button type="button" className={styles.moreSkills} onClick={() => setShowAllSkills(value => !value)} aria-expanded={showAllSkills} aria-controls="project-skill-options">{showAllSkills ? "Fewer skills" : "All skills"}<ChevronDown size={14} aria-hidden="true" /></button>}
            <select className={styles.skillSelect} aria-label="Filter by any technology" value={activeSkill ?? ""} onChange={event => selectSkill(event.target.value || null)}>
              <option value="">All technologies</option>
              {skills.map(skill => <option key={skill.name} value={skill.name}>{skill.name} ({skill.count})</option>)}
            </select>
          </div>
        </div>
        <div id="project-results" className={styles.gallery}>

          <div id="project-spotlight" className={styles.spotlight}>
            <div ref={depthStage} data-scroll-camera className={styles.previewFrame} onPointerMove={movePreview} onPointerLeave={resetTilt} onPointerCancel={resetTilt} onBlur={resetTilt}>
              <div className={styles.previewTopline}><span><i /> Project spotlight</span><span>{project.year} <ArrowUpRight size={13} aria-hidden="true" /></span></div>
              <div className={styles.previewPerspective}>
                <ProjectOrbitDeck projects={filteredProjects} activeIndex={activeIndex} direction={direction} onSelect={selectProject} onStep={stepProject} onOpen={open} />
              </div>
              <div className={styles.previewBottomline}><span className={styles.depthHint}>Move your mouse to explore</span><span className={styles.touchHint}>{project.marker}</span><div className={styles.navigation}><span className={styles.navigationHint}>{canNavigate ? "Swipe or use arrow keys" : "One matching project"}</span><button type="button" disabled={!canNavigate} onClick={() => { stepProject(-1); }} aria-label="Previous project"><ArrowLeft size={18} aria-hidden="true" /></button><span className={styles.counter}>{String(activeIndex + 1).padStart(2, "0")}<span> / {String(filteredProjects.length).padStart(2, "0")}</span></span><button type="button" disabled={!canNavigate} onClick={() => { stepProject(1); }} aria-label="Next project"><ArrowRight size={18} aria-hidden="true" /></button></div></div>
            </div>
            <div data-settle className={styles.projectDetails}>
              <div className={styles.projectDescription}>
                <div data-project-copy className={styles.titleRow}><h2>{project.title}</h2><span>{project.year}</span></div>
                <p data-project-copy>{project.description}</p>
                {project.technologies.length > 0 && <ul data-project-copy className={styles.technologies} aria-label="Key technologies">{displayedTechnologies.slice(0, 4).map(technology => <li key={technology} data-selected={technology === activeSkill}>{technology}</li>)}{project.technologies.length > 4 && <li>+{project.technologies.length - 4} more</li>}</ul>}
              </div>
              <div data-project-copy className={styles.projectActions}>
                <button type="button" onClick={open} className={styles.caseStudy}>View case study<ArrowUpRight size={18} aria-hidden="true" /></button>
                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className={styles.sourceLink}><Code2 size={15} aria-hidden="true" /> Source code <span className="sr-only">(opens in a new tab)</span></a>}
              </div>
            </div>
          </div>
          <aside className={styles.index}>
            <div className={styles.indexLabel}><span>Project index</span><span>{projects[projects.length - 1].year} — {projects[0].year}</span></div>
            <nav aria-label="Choose a project" className={styles.projectList}>
              {filteredProjects.map((item, index) => (
                <button data-settle-item key={item.id} type="button" onClick={() => selectProject(index)} aria-pressed={index === activeIndex} aria-controls="project-spotlight" className={styles.projectItem}>
                  <span className={styles.itemNumber}>{item.id}</span>
                  <span data-project-thumb={item.id} className={styles.thumbnail}><Image src={item.coverImage} alt="" fill sizes="72px" className={styles.thumbnailImage} /></span>
                  <span className={styles.itemText}><strong>{item.shortTitle}</strong><span>{item.marker}</span></span>
                  <ArrowUpRight size={18} aria-hidden="true" className={styles.itemArrow} />
                  {index === activeIndex && <span data-project-progress className={styles.itemProgress} />}
                </button>
              ))}
            </nav>
          </aside>
        </div>
        <footer className={styles.footer}>
          <p><span className={styles.footerDot} /> Built with curiosity. Crafted with care.</p>
        </footer>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{filteredProjects.length} {activeSkill ? `${activeSkill} ` : ""}{filteredProjects.length === 1 ? "project" : "projects"}. Showing {activeIndex + 1} of {filteredProjects.length}: {project.title}.</p>
      </section>
      {/* Portalled: transformed scene frames would otherwise contain the fixed viewer. */}
      {isClient && createPortal(
        <AnimatePresence onExitComplete={() => returnFocus.current?.focus({ preventScroll: true })}>{openProject && <ProjectViewer key={openProject.id} project={openProject} onClose={close} />}</AnimatePresence>,
        document.body,
      )}
    </>
  );
}
