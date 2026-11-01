"use client";

import { animate, createAnimatable, createScope, spring, stagger } from "animejs";
import { AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Code2, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { ProjectViewer } from "@/components/projects/ProjectViewer";
import { SceneLabel } from "@/components/ui/SceneLabel";
import { ProjectOrbitDeck } from "@/components/projects/ProjectOrbitDeck";
import { ProjectPortalTransition, PROJECT_PORTAL_REVEAL_DELAY, type PortalBounds } from "@/components/projects/ProjectPortalTransition";
import type { Project } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ProjectShowcase.module.css";

const projectColors = ["#a88aef", "#8baae8", "#79bca5", "#d7a576"];

export function SplitProjectPortal({ projects, progress = 1 }: { projects: readonly Project[]; progress?: number }) {
  const root = useRef<HTMLElement>(null);
  const depthStage = useRef<HTMLDivElement>(null);
  const tilt = useRef<ReturnType<typeof createAnimatable> | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const wheelLock = useRef(0);
  const direction = useRef(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [portalOrigin, setPortalOrigin] = useState<PortalBounds | null>(null);
  const reduceMotion = useReducedMotion();
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
    const anchor = depthStage.current?.querySelector<HTMLElement>(`[data-project-anchor="${project.id}"]`);
    const bounds = (anchor ?? depthStage.current)?.getBoundingClientRect();
    setPortalOrigin(bounds ? {
      left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height,
    } : null);
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

  // Scopes clean up animations on unmount, Strict Mode, and interrupted transitions.
  useLayoutEffect(() => {
    if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scope = createScope({ root }).add(() => {
      animate("[data-gallery-enter]", {
        opacity: [0, 1], y: [24, 0], delay: stagger(65), duration: 800, ease: "out(4)",
      });
    });
    return () => scope.revert();
  }, [reduceMotion]);

  useLayoutEffect(() => {
    if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scope = createScope({ root }).add(() => {
      animate("[data-project-copy]", {
        opacity: [0, 1], y: [18, 0], delay: stagger(55, { start: 100 }), duration: 620, ease: "out(4)",
      });
      animate("[data-project-progress]", { scaleX: [0, 1], duration: 850, ease: "out(4)" });
    });
    return () => scope.revert();
  }, [project.id, reduceMotion]);

  useEffect(() => {
    const element = depthStage.current;
    if (!element || reduceMotion) return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let scope: ReturnType<typeof createScope> | undefined;
    const configure = () => {
      tilt.current = null;
      scope?.revert();
      scope = undefined;
      if (!media.matches || openProject) return;
      scope = createScope({ root }).add(() => {
        // One smoothed input drives all depth planes; no React renders on mousemove.
        tilt.current = createAnimatable(element, {
          "--pointer-x": 480, "--pointer-y": 480, "--lift": 650, ease: "out(3)",
        });
      });
    };
    configure();
    media.addEventListener("change", configure);
    const settle = () => {
      const ease = spring({ duration: 950, bounce: 0.28 }).ease;
      tilt.current?.["--pointer-x"](0, 950, ease);
      tilt.current?.["--pointer-y"](0, 950, ease);
      tilt.current?.["--lift"](0, 700);
    };
    window.addEventListener("blur", settle);
    return () => {
      media.removeEventListener("change", configure);
      window.removeEventListener("blur", settle);
      tilt.current = null;
      scope?.revert();
    };
  }, [reduceMotion, openProject]);

  const resetTilt = () => {
    const ease = spring({ duration: 950, bounce: 0.28 }).ease;
    tilt.current?.["--pointer-x"](0, 950, ease);
    tilt.current?.["--pointer-y"](0, 950, ease);
    tilt.current?.["--lift"](0, 700);
  };
  const movePreview = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !tilt.current) return;
    // Measure the stationary frame, never the rotating card (which causes feedback jitter).
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    tilt.current["--pointer-x"](x, 480, "out(3)");
    tilt.current["--pointer-y"](y, 480, "out(3)");
    tilt.current["--lift"](1, 450, "out(3)");
  };

  return (
    <>
      <section ref={root} inert={Boolean(openProject)} aria-label="Project showcase" className={styles.showcase} style={{ "--project-color": projectColors[originalIndex % projectColors.length] } as CSSProperties}>
        <header className={styles.heading}>
          <div data-gallery-enter>
            <SceneLabel sceneId="work" />
            <h1 id="work-title">Selected <span>work.</span><sup>({String(projects.length).padStart(2, "0")})</sup></h1>
          </div>
          <p data-gallery-enter className={styles.headingNote}>A few things I&apos;ve built.<br />Thoughtful interfaces. Real-world systems.<ArrowDownRight size={22} aria-hidden="true" /></p>
        </header>
        <div data-gallery-enter data-project-filters className={styles.filters} role="group" aria-labelledby="project-filter-label">
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
                <ProjectOrbitDeck projects={filteredProjects} activeIndex={activeIndex} direction={direction} progress={progress} onSelect={selectProject} onStep={stepProject} onOpen={open} />
              </div>
              <div className={styles.previewBottomline}><span className={styles.depthHint}>Move your mouse to explore</span><span className={styles.touchHint}>{project.marker}</span><div className={styles.navigation}><span className={styles.navigationHint}>{canNavigate ? "Swipe or use arrow keys" : "One matching project"}</span><button type="button" disabled={!canNavigate} onClick={() => { stepProject(-1); }} aria-label="Previous project"><ArrowLeft size={18} aria-hidden="true" /></button><span className={styles.counter}>{String(activeIndex + 1).padStart(2, "0")}<span> / {String(filteredProjects.length).padStart(2, "0")}</span></span><button type="button" disabled={!canNavigate} onClick={() => { stepProject(1); }} aria-label="Next project"><ArrowRight size={18} aria-hidden="true" /></button></div></div>
            </div>
            <div className={styles.projectDetails}>
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
            <div data-gallery-enter className={styles.indexLabel}><span>Project index</span><span>{projects[projects.length - 1].year} — {projects[0].year}</span></div>
            <nav aria-label="Choose a project" className={styles.projectList}>
              {filteredProjects.map((item, index) => (
                <button data-gallery-enter key={item.id} type="button" onClick={() => selectProject(index)} aria-pressed={index === activeIndex} aria-controls="project-spotlight" className={styles.projectItem}>
                  <span className={styles.itemNumber}>{item.id}</span>
                  <span className={styles.thumbnail}><Image src={item.coverImage} alt="" fill sizes="72px" className={styles.thumbnailImage} /></span>
                  <span className={styles.itemText}><strong>{item.shortTitle}</strong><span>{item.marker}</span></span>
                  <ArrowUpRight size={18} aria-hidden="true" className={styles.itemArrow} />
                  {index === activeIndex && <span data-project-progress className={styles.itemProgress} />}
                </button>
              ))}
            </nav>
          </aside>
        </div>
        <footer data-gallery-enter className={styles.footer}>
          <p><span className={styles.footerDot} /> Built with curiosity. Crafted with care.</p>

        </footer>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{filteredProjects.length} {activeSkill ? `${activeSkill} ` : ""}{filteredProjects.length === 1 ? "project" : "projects"}. Showing {activeIndex + 1} of {filteredProjects.length}: {project.title}.</p>
      </section>
      <AnimatePresence onExitComplete={() => returnFocus.current?.focus()}>{openProject && <ProjectViewer key={openProject.id} project={openProject} onClose={close} entranceDelay={PROJECT_PORTAL_REVEAL_DELAY} />}</AnimatePresence>
      {openProject && portalOrigin && <ProjectPortalTransition key={openProject.id} origin={portalOrigin} image={openProject.coverImage} title={openProject.title} />}
    </>
  );
}
