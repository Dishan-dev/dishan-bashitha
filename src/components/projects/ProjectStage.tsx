"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectViewer } from "@/components/projects/ProjectViewer";
import type { Project } from "@/data/projects";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";

type ProjectStageProps = { projects: readonly Project[] };

export function ProjectStage({ projects }: ProjectStageProps) {
  const { activeIndex, direction, nextProject, previousProject } = useProjectNavigation(projects.length);
  const reduceMotion = useReducedMotion();
  const horizontalDistance = useRef(0);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const project = projects[activeIndex];

  const openProject = useCallback(() => {
    setIsViewerOpen(true);
    window.history.pushState({ ...window.history.state, projectViewer: project.slug }, "", `#project-${project.slug}`);
  }, [project.slug]);

  const closeProject = useCallback(() => {
    if (window.history.state?.projectViewer === project.slug) window.history.back();
    else setIsViewerOpen(false);
  }, [project.slug]);

  useEffect(() => {
    const closeFromHistory = () => setIsViewerOpen(false);
    window.addEventListener("popstate", closeFromHistory);
    return () => window.removeEventListener("popstate", closeFromHistory);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isViewerOpen) return;
      if (event.key === "ArrowRight") { event.preventDefault(); nextProject(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); previousProject(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewerOpen, nextProject, previousProject]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isViewerOpen || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      horizontalDistance.current += event.deltaX;
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => { horizontalDistance.current = 0; }, 130);
      if (Math.abs(horizontalDistance.current) < 55) return;
      if (horizontalDistance.current > 0) nextProject(); else previousProject();
      horizontalDistance.current = 0;
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isViewerOpen, nextProject, previousProject]);

  return (
    <LayoutGroup id="project-portal">
      <section aria-label="Selected work project stage" className="relative flex min-h-0 flex-1 flex-col">
        <motion.div animate={{ opacity: isViewerOpen ? 0 : 1, y: isViewerOpen ? -8 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }} className="mb-[var(--space-2)] flex items-end justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
          <p>{String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p>
          <p>{project.year}</p>
        </motion.div>

        <div className="grid min-h-0 flex-1 gap-[var(--space-2)] lg:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.48fr)] lg:items-end">
          <motion.div
            layoutId={`project-preview-${project.id}`}
            role="button"
            tabIndex={0}
            aria-label={`Open ${project.title}`}
            drag={isViewerOpen ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.04}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openProject(); } }}
            onClick={openProject}
            onDragEnd={(_, info) => {
              if (info.offset.x < -52) nextProject();
              if (info.offset.x > 52) previousProject();
            }}
            className="relative h-[clamp(17rem,53svh,42rem)] cursor-grab overflow-hidden bg-[var(--foreground)] outline-none active:cursor-grabbing"
            transition={{ duration: reduceMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence initial={false} custom={direction} mode="sync">
              <motion.div key={project.id} custom={direction} initial={reduceMotion ? false : { clipPath: `inset(0 ${direction > 0 ? "100%" : "0"} 0 ${direction > 0 ? "0" : "100%"})`, scale: 1.03 }} animate={{ clipPath: "inset(0 0% 0 0%)", scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }} transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                <Image src={project.coverImage} alt={`Preview of ${project.title}`} fill priority={activeIndex === 0} sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div animate={{ opacity: isViewerOpen ? 0 : 1, y: isViewerOpen ? 12 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.36, delay: isViewerOpen ? 0 : 0.12 }} className="relative flex min-h-[13rem] flex-col justify-end pb-1 lg:pb-[5svh]">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div key={project.id} initial={reduceMotion ? false : { y: 18 }} animate={{ y: 0 }} exit={reduceMotion ? undefined : { y: -10 }} transition={{ duration: reduceMotion ? 0 : 0.48, delay: reduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}>
                <h1 id="work-title" className="max-w-lg text-[clamp(2.8rem,6.6vw,7.4rem)] font-medium leading-[0.84] tracking-[-0.075em]">{project.title}</h1>
                <p className="mt-[var(--space-2)] max-w-sm text-sm leading-relaxed text-[var(--muted)]">{project.description}</p>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.dl key={`${project.id}-metadata`} initial={reduceMotion ? false : { y: 10 }} animate={{ y: 0 }} exit={reduceMotion ? undefined : { y: -6 }} transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }} className="mt-[var(--space-3)] grid gap-2 border-t border-[var(--border)] pt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em]">
                <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Role</dt><dd>{project.role}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Tools</dt><dd className="text-right">{project.technologies.join(" / ")}</dd></div>
              </motion.dl>
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div animate={{ opacity: isViewerOpen ? 0 : 1 }} transition={{ duration: reduceMotion ? 0 : 0.25 }} className="mt-[var(--space-2)] flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em]">
          <button type="button" onClick={previousProject} className="text-[var(--muted)] hover:text-[var(--foreground)]" aria-label="Previous project">Previous</button>
          <p className="text-[var(--muted)]">Drag / Swipe / Open</p>
          <button type="button" onClick={nextProject} className="text-[var(--muted)] hover:text-[var(--foreground)]" aria-label="Next project">Next</button>
        </motion.div>
      </section>
      <AnimatePresence>{isViewerOpen && <ProjectViewer project={project} onClose={closeProject} />}</AnimatePresence>
    </LayoutGroup>
  );
}
