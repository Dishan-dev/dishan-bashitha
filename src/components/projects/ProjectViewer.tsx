"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCallback, useEffect, useState } from "react";
import type { Project, ProjectDetail } from "@/data/projects";
import { useSwipe } from "@/hooks/useSwipe";

type Chapter = string;

type ProjectViewerProps = { project: Project; onClose: () => void };

function ChapterMotion({ chapter, children }: { chapter: Chapter; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      key={chapter}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function DetailList({ items }: { items: readonly ProjectDetail[] }) {
  return <div className="case-study-details">{items.map((item, index) => <article key={item.title}>
    <span aria-hidden="true" className="case-study-number">{String(index + 1).padStart(2, "0")}</span>
    <div><h3>{item.title}</h3><p>{item.description}</p></div>
  </article>)}</div>;
}

function ChapterContent({ chapter, project }: { chapter: Chapter; project: Project }) {
  return <div className="case-study-content">
    <p className="case-study-eyebrow">{project.marker} / {chapter}</p>
    <h2>{chapter === "Overview" ? project.title : chapter === "Features" ? "What it does." : chapter === "Engineering" ? "How it works." : "Explore the code."}</h2>
    {chapter === "Overview" && <>
      <p className="case-study-intro">{project.overview}</p>
      <ul className="case-study-tags" aria-label="Project capabilities">{project.capabilities.map(item => <li key={item}>{item}</li>)}</ul>
      {project.technologies.length > 0 && <div className="case-study-stack"><h3>Technology stack</h3><p>{project.technologies.join(" / ")}</p></div>}
    </>}
    {chapter === "Features" && <DetailList items={project.features} />}
    {chapter === "Engineering" && <DetailList items={project.engineering} />}
    {chapter === "Source" && <>
      <p className="case-study-intro">Browse the implementation, architecture, and project documentation on GitHub.</p>
      <div className="case-study-sources">{project.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.label}</span><span aria-hidden="true">&#8599;</span></a>)}</div>
    </>}
  </div>;
}

export function ProjectViewer({ project, onClose }: ProjectViewerProps) {
  const chapters = project.chapters;
  const [activeChapter, setActiveChapter] = useState(0);
  const reduceMotion = useReducedMotion();
  const previousChapter = useCallback(() => setActiveChapter((chapter) => Math.max(0, chapter - 1)), []);
  const nextChapter = useCallback(() => setActiveChapter((chapter) => Math.min(chapters.length - 1, chapter + 1)), [chapters.length]);
  const activeLabel = chapters[activeChapter];
  const swipeHandlers = useSwipe({ onSwipeLeft: nextChapter, onSwipeRight: previousChapter, threshold: 56 });

  useEffect(() => {
    document.body.dataset.projectViewer = "open";
    window.dispatchEvent(new CustomEvent("portfolio:project-viewer", { detail: true }));
    return () => {
      delete document.body.dataset.projectViewer;
      window.dispatchEvent(new CustomEvent("portfolio:project-viewer", { detail: false }));
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); previousChapter(); }
      if (event.key === "ArrowRight") { event.preventDefault(); nextChapter(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, nextChapter, previousChapter]);

  return (
    <motion.section onTouchStart={(event) => { event.stopPropagation(); swipeHandlers.onTouchStart(event); }} onTouchEnd={(event) => { event.stopPropagation(); swipeHandlers.onTouchEnd(event); }} layoutId={`project-preview-${project.id}`} aria-label={`${project.title} project viewer`} className="project-viewer fixed inset-0 z-[400] overflow-hidden inverse-surface bg-[var(--inverse-surface)] text-[var(--inverse-text)]" transition={{ duration: reduceMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }}>
      <div aria-hidden="true" className="absolute -right-[12vw] -top-[20vw] h-[min(55vw,50rem)] w-[min(55vw,50rem)] rounded-full border border-[var(--inverse-text)]/5" />
      <div className="relative z-10 flex h-full flex-col px-[var(--space-2)] pb-[var(--space-3)] pt-[var(--space-2)] sm:px-[var(--space-4)] sm:pt-[var(--space-3)]">
        <header className="flex items-start justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em]"><div><p>{project.shortTitle}</p><p className="mt-1 text-[var(--inverse-text)]/55">{project.year} / {project.role}</p></div><button type="button" onClick={onClose} className="border-b border-[var(--inverse-text)]/60 pb-1 hover:border-[var(--accent)] hover:text-[var(--accent)]">Close</button></header>
        <nav aria-label="Project chapters" className="mt-[var(--space-3)] flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em]">{chapters.map((chapter, index) => <button key={chapter} type="button" onClick={() => setActiveChapter(index)} aria-current={index === activeChapter ? "step" : undefined} className={index === activeChapter ? "text-[var(--inverse-text)]" : "text-[var(--inverse-text)]/45 hover:text-[var(--inverse-text)]"}>{String(index + 1).padStart(2, "0")} {chapter}</button>)}</nav>
        <div key={activeLabel} className="project-chapter-scroll relative min-h-0 flex-1 overflow-y-auto"><AnimatePresence initial={false} mode="wait"><ChapterMotion key={activeLabel} chapter={activeLabel}><ChapterContent chapter={activeLabel} project={project} /></ChapterMotion></AnimatePresence></div>
        <footer className="flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em]"><button type="button" onClick={previousChapter} disabled={activeChapter === 0} className="text-[var(--inverse-text)]/60 hover:text-[var(--inverse-text)] disabled:opacity-25">Previous</button><p className="text-[var(--inverse-text)]/45">Swipe / Arrow keys</p><button type="button" onClick={nextChapter} disabled={activeChapter === chapters.length - 1} className="text-[var(--inverse-text)]/60 hover:text-[var(--inverse-text)] disabled:opacity-25">Next</button></footer>
      </div>
    </motion.section>
  );
}
