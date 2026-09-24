"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectViewer } from "@/components/projects/ProjectViewer";
import type { Project } from "@/data/projects";

type SplitProjectPortalProps = { projects: readonly Project[] };

export function SplitProjectPortal({ projects }: SplitProjectPortalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [isProjectTransitioning, setIsProjectTransitioning] = useState(false);
  const didDrag = useRef(false);
  const transitionTimer = useRef<number | null>(null);
  const [transitionOriginIndex, setTransitionOriginIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const previousIndex = (activeIndex - 1 + projects.length) % projects.length;
  const nextIndex = (activeIndex + 1) % projects.length;

  const selectProject = useCallback((index: number) => {
    if (index === activeIndex || isProjectTransitioning) return;
    setTransitionOriginIndex(activeIndex);
    setIsProjectTransitioning(true);
    setActiveIndex(index);
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      setTransitionOriginIndex(null);
      setIsProjectTransitioning(false);
    }, reduceMotion ? 0 : 820);
  }, [activeIndex, isProjectTransitioning, reduceMotion]);
  const previousProject = useCallback(() => selectProject(previousIndex), [previousIndex, selectProject]);
  const nextProject = useCallback(() => selectProject(nextIndex), [nextIndex, selectProject]);
  const open = useCallback((project: Project) => {
    setOpenProject(project);
    window.history.pushState({ ...window.history.state, projectViewer: project.slug }, "", `#project-${project.slug}`);
  }, []);
  const close = useCallback(() => {
    if (window.history.state?.projectViewer === openProject?.slug) window.history.back();
    else setOpenProject(null);
  }, [openProject?.slug]);

  useEffect(() => {
    const closeFromHistory = () => setOpenProject(null);
    window.addEventListener("popstate", closeFromHistory);
    return () => window.removeEventListener("popstate", closeFromHistory);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (openProject || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); previousProject(); }
      if (event.key === "ArrowRight") { event.preventDefault(); nextProject(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextProject, openProject, previousProject]);

  useEffect(() => () => { if (transitionTimer.current) window.clearTimeout(transitionTimer.current); }, []);

  return (
    <LayoutGroup id="project-card-stage">
      <section
        aria-label="Selected projects"
        onWheel={(event) => {
          if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 24) return;
          event.preventDefault();
          if (isProjectTransitioning) return;
          if (event.deltaX > 0) nextProject(); else previousProject();
        }}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <header className="relative z-20 flex items-start justify-between font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
          <p>Selected projects</p>
          <nav aria-label="Choose a project" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-[clamp(0.72rem,0.82vw,0.9rem)] lg:flex">
            {projects.map((project, index) => <button key={project.id} type="button" onClick={() => selectProject(index)} aria-current={index === activeIndex ? "page" : undefined} className={index === activeIndex ? "text-[var(--accent)]" : "transition-colors hover:text-[var(--foreground)]"}>{project.id} {project.shortTitle}</button>)}
          </nav>
          <p className="project-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p><p className="project-list-count">{String(projects.length).padStart(2, "0")} projects</p>
        </header>

        <p aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(5rem,16vw,17rem)] font-semibold tracking-[-0.1em] text-[var(--foreground)]/[0.045]">PROJECTS</p>

        <div className="project-carousel relative flex min-h-0 flex-1 items-center justify-center [perspective:1600px] [transform-style:preserve-3d]">
          {projects.map((project, index) => {
            const rawPosition = (activeIndex - index + projects.length) % projects.length;
            const position = rawPosition > projects.length / 2 ? rawPosition - projects.length : rawPosition;
            const isActive = index === activeIndex;
            const halfWheelPose = ({
              "-2": { x: -760, y: 130, scale: 0.68, rotateY: 48, rotateZ: -7, opacity: 0, zIndex: 10 },
              "-1": { x: -470, y: 62, scale: 0.8, rotateY: 34, rotateZ: -4, opacity: 0.58, zIndex: 40 },
              "0": { x: 0, y: 0, scale: 1, rotateY: 0, rotateZ: 0, opacity: 1, zIndex: 80 },
              "1": { x: 470, y: 62, scale: 0.8, rotateY: -34, rotateZ: 4, opacity: 0.58, zIndex: 40 },
              "2": { x: 760, y: 130, scale: 0.68, rotateY: -48, rotateZ: 7, opacity: 0, zIndex: 10 },
            }[String(position)] ?? { x: position * 760, y: 130, scale: 0.68, rotateY: position < 0 ? 48 : -48, rotateZ: position < 0 ? -7 : 7, opacity: 0, zIndex: 10 });
            const originIndex = transitionOriginIndex;
            const previousRawPosition = originIndex === null ? rawPosition : (originIndex - index + projects.length) % projects.length;
            const previousPosition = previousRawPosition > projects.length / 2 ? previousRawPosition - projects.length : previousRawPosition;
            const previousPose = ({
              "-2": { x: -760, y: 130, scale: 0.68, rotateY: 48, rotateZ: -7, opacity: 0 },
              "-1": { x: -470, y: 62, scale: 0.8, rotateY: 34, rotateZ: -4, opacity: 0.58 },
              "0": { x: 0, y: 0, scale: 1, rotateY: 0, rotateZ: 0, opacity: 1 },
              "1": { x: 470, y: 62, scale: 0.8, rotateY: -34, rotateZ: 4, opacity: 0.58 },
              "2": { x: 760, y: 130, scale: 0.68, rotateY: -48, rotateZ: 7, opacity: 0 },
            }[String(previousPosition)] ?? { x: previousPosition * 760, y: 130, scale: 0.68, rotateY: previousPosition < 0 ? 48 : -48, rotateZ: previousPosition < 0 ? -7 : 7, opacity: 0 });
            const entersFromLeft = previousPosition > 1 && position < 0;
            const leavesThroughBottom = Math.abs(previousPosition) === 1 && Math.abs(position) > 1;
            const usesWrapPath = entersFromLeft || leavesThroughBottom;
            const cardAnimation = entersFromLeft
              ? { ...halfWheelPose, x: [-760, -600, halfWheelPose.x], y: [260, 150, halfWheelPose.y], rotateY: [48, 42, halfWheelPose.rotateY], rotateZ: [-7, -6, halfWheelPose.rotateZ], opacity: [0, 0.18, halfWheelPose.opacity] }
              : leavesThroughBottom
                ? { ...halfWheelPose, x: [previousPose.x, previousPose.x * 1.12, halfWheelPose.x], y: [previousPose.y, 360, halfWheelPose.y], rotateY: [previousPose.rotateY, previousPose.rotateY, halfWheelPose.rotateY], rotateZ: [previousPose.rotateZ, previousPose.rotateZ, halfWheelPose.rotateZ], opacity: [previousPose.opacity, 0.08, 0] }
                : halfWheelPose;

            return (
              <motion.article
                key={project.id}
                layoutId={`project-preview-${project.id}`}
                onClick={() => {
                  if (didDrag.current) { didDrag.current = false; return; }
                  if (isActive || window.matchMedia("(max-width: 1023px), (max-height: 600px)").matches) open(project); else selectProject(index);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  if (isActive || window.matchMedia("(max-width: 1023px), (max-height: 600px)").matches) open(project); else selectProject(index);
                }}
                tabIndex={0}
                role="button"
                aria-current={isActive ? "true" : undefined}
                aria-label={`Open ${project.title} case study`}
                drag={isActive && !reduceMotion ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragStart={() => { didDrag.current = false; }}
                onDragEnd={(_, info) => { didDrag.current = Math.abs(info.offset.x) > 8; if (info.offset.x < -70) nextProject(); if (info.offset.x > 70) previousProject(); }}
                initial={false}
                animate={reduceMotion ? undefined : cardAnimation}
                transition={reduceMotion ? { duration: 0 } : usesWrapPath ? { duration: 0.82, ease: [0.22, 1, 0.36, 1], times: [0, 0.58, 1] } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "50% 120%", zIndex: halfWheelPose.zIndex }}
                className={`absolute aspect-[16/10] w-[min(76vw,38rem)] overflow-hidden rounded-[clamp(1.5rem,2.5vw,2.25rem)] bg-[#111226] text-left shadow-[0_2rem_4rem_rgba(36,25,59,0.22)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:w-[min(46vw,38rem)] ${isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} ${Math.abs(position) > 1 ? "pointer-events-none" : ""}`}
              >
                <div className="absolute inset-0 bg-[#111226]">
                  <Image src={project.coverImage} alt="" fill priority={isActive} sizes="(min-width: 768px) 38rem, 76vw" className="object-contain" />
                </div>
                <div className={`absolute bottom-4 left-4 max-w-[min(84%,28rem)] rounded-2xl border border-white/10 bg-[#101428]/90 px-4 py-3 text-[var(--inverse-text)] shadow-xl backdrop-blur-md transition-opacity duration-300 sm:bottom-5 sm:left-5 sm:px-5 sm:py-4 ${isActive ? "opacity-100" : "opacity-65"}`}>
                  <p className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.15em] text-[var(--accent-soft)]">{project.marker}</p>
                  <h1 id={isActive ? "work-title" : undefined} className="mt-2 text-[clamp(1.55rem,2.4vw,2.7rem)] font-semibold leading-[0.9] tracking-[-0.06em]">{project.title}</h1>
                  <p className="mt-2 max-w-[24rem] text-xs leading-relaxed text-white/70">{project.description}</p>
                </div>
                <p className={`absolute right-4 top-4 rounded-full bg-[#101428]/90 px-3 py-2 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--inverse-text)]/85 shadow-lg backdrop-blur-sm transition-opacity sm:right-5 sm:top-5 ${isActive ? "opacity-100" : "opacity-0"}`}>Open case study ↗</p>
              </motion.article>
            );
          })}
        </div>
        <motion.button type="button" onClick={(event) => { event.stopPropagation(); previousProject(); }} aria-label={`Show ${projects[previousIndex].title}`} whileHover={reduceMotion ? undefined : { x: -4, scale: 1.04 }} whileTap={{ scale: 0.96 }} className="absolute left-5 top-[25%] z-[300] grid size-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)]/95 text-[var(--foreground)] shadow-lg backdrop-blur-md transition-opacity hover:border-[var(--accent)] sm:left-8 sm:size-12">
          <ArrowLeft aria-hidden="true" size={19} strokeWidth={1.7} />
        </motion.button>
        <motion.button type="button" onClick={(event) => { event.stopPropagation(); nextProject(); }} aria-label={`Show ${projects[nextIndex].title}`} whileHover={reduceMotion ? undefined : { x: 4, scale: 1.04 }} whileTap={{ scale: 0.96 }} className="absolute right-5 top-[25%] z-[300] grid size-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)]/95 text-[var(--foreground)] shadow-lg backdrop-blur-md transition-opacity hover:border-[var(--accent)] sm:right-8 sm:size-12">
          <ArrowRight aria-hidden="true" size={19} strokeWidth={1.7} />
        </motion.button>

      </section>
      <AnimatePresence>{openProject && <ProjectViewer project={openProject} onClose={close} />}</AnimatePresence>
    </LayoutGroup>
  );
}
