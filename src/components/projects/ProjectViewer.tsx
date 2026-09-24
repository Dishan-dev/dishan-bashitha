"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Project } from "@/data/projects";
import { useSwipe } from "@/hooks/useSwipe";

const chapters = ["Concept", "Experience", "Build", "Outcome"] as const;
type Chapter = (typeof chapters)[number];

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
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

function ConceptChapter({ project }: { project: Project }) {
  return <div className="flex h-full max-w-6xl flex-col justify-center"><p className="mb-[var(--space-2)] font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">The premise</p><h2 className="max-w-[10ch] text-[clamp(3.5rem,7.5vw,8.5rem)] font-medium leading-[0.86] tracking-[-0.08em]">Make the useful<br />feel inevitable.</h2><p className="mt-[var(--space-3)] max-w-md text-sm leading-relaxed text-[var(--inverse-text)]/70">{project.description} The idea was to meet a real need without making the system feel louder than the people using it.</p></div>;
}

function ExperienceChapter({ project }: { project: Project }) {
  return <div className="relative h-full min-h-[25rem]"><p className="absolute left-0 top-[8%] z-10 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">The interface, in fragments</p><div className="absolute left-[2%] top-[20%] h-[43%] w-[48%] overflow-hidden border border-[var(--inverse-text)]/30"><Image src={project.coverImage} alt="" fill sizes="50vw" className="object-cover object-left" /></div><div className="absolute right-[4%] top-[9%] h-[55%] w-[39%] overflow-hidden border border-[var(--inverse-text)]/30"><Image src={project.coverImage} alt="" fill sizes="40vw" className="object-cover object-center" /></div><div className="absolute bottom-[5%] left-[26%] h-[38%] w-[44%] overflow-hidden border border-[var(--inverse-text)]/30"><Image src={project.coverImage} alt="" fill sizes="45vw" className="object-cover object-right" /></div><p className="absolute bottom-[7%] right-0 max-w-[15rem] text-right text-sm leading-relaxed text-[var(--inverse-text)]/70">A considered system of pace, hierarchy, and invitations to explore.</p></div>;
}

function BuildChapter({ project }: { project: Project }) {
  const decisions = [
    ["Architecture", "Composable App Router surface"],
    ["Interface", "Responsive modules with shared foundations"],
    ["Performance", "Optimized media and deliberate motion"],
  ] as const;
  return <div className="flex h-full flex-col justify-center"><div className="grid gap-[var(--space-3)] lg:grid-cols-[0.75fr_1.25fr]"><div><p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">Engineering decisions</p><h2 className="mt-4 text-[clamp(3.5rem,7.5vw,8rem)] font-medium leading-[0.82] tracking-[-0.08em]">Built to<br />hold up.</h2></div><dl className="self-end border-t border-[var(--inverse-text)]/30 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em]">{decisions.map(([term, description]) => <div key={term} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-[var(--inverse-text)]/30 py-4"><dt className="text-[var(--inverse-text)]/50">{term}</dt><dd>{description}</dd></div>)}<div className="grid grid-cols-[7rem_1fr] gap-4 py-4"><dt className="text-[var(--inverse-text)]/50">Stack</dt><dd>{project.technologies.join(" / ")}</dd></div></dl></div></div>;
}

function OutcomeChapter({ project }: { project: Project }) {
  return <div className="grid h-full items-center gap-[var(--space-3)] lg:grid-cols-[0.85fr_1.15fr]"><div><p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">The release</p><h2 className="mt-4 text-[clamp(3.5rem,7vw,7.5rem)] font-medium leading-[0.82] tracking-[-0.08em]">A finished<br />presence.</h2><p className="mt-[var(--space-2)] max-w-sm text-sm leading-relaxed text-[var(--inverse-text)]/70">A polished, adaptable output prepared for real use and continued evolution.</p><div className="mt-[var(--space-3)] flex gap-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em]">{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="border-b border-[var(--inverse-text)]/60 pb-1 hover:border-[var(--accent)] hover:text-[var(--accent)]">Live project</a>}{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="border-b border-[var(--inverse-text)]/60 pb-1 hover:border-[var(--accent)] hover:text-[var(--accent)]">GitHub</a>}</div></div><div className="relative aspect-[4/3] overflow-hidden border border-[var(--inverse-text)]/30"><Image src={project.coverImage} alt={`Final output for ${project.title}`} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" /></div></div>;
}

function ChapterContent({ chapter, project }: { chapter: Chapter; project: Project }) {
  if (chapter === "Concept") return <ConceptChapter project={project} />;
  if (chapter === "Experience") return <ExperienceChapter project={project} />;
  if (chapter === "Build") return <BuildChapter project={project} />;
  return <OutcomeChapter project={project} />;
}

export function ProjectViewer({ project, onClose }: ProjectViewerProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const reduceMotion = useReducedMotion();
  const previousChapter = () => setActiveChapter((chapter) => Math.max(0, chapter - 1));
  const nextChapter = () => setActiveChapter((chapter) => Math.min(chapters.length - 1, chapter + 1));
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
  }, [onClose]);

  return (
    <motion.section onTouchStart={(event) => { event.stopPropagation(); swipeHandlers.onTouchStart(event); }} onTouchEnd={(event) => { event.stopPropagation(); swipeHandlers.onTouchEnd(event); }} layoutId={`project-preview-${project.id}`} aria-label={`${project.title} project viewer`} className="project-viewer fixed inset-0 z-[400] overflow-hidden inverse-surface bg-[var(--inverse-surface)] text-[var(--inverse-text)]" transition={{ duration: reduceMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }}>
      <div aria-hidden="true" className="absolute -right-[12vw] -top-[20vw] h-[min(55vw,50rem)] w-[min(55vw,50rem)] rounded-full border border-[var(--inverse-text)]/5" />
      <div className="relative z-10 flex h-full flex-col px-[var(--space-2)] pb-[var(--space-3)] pt-[var(--space-2)] sm:px-[var(--space-4)] sm:pt-[var(--space-3)]">
        <header className="flex items-start justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em]"><div><p>{project.shortTitle}</p><p className="mt-1 text-[var(--inverse-text)]/55">{project.year} / {project.role}</p></div><button type="button" onClick={onClose} className="border-b border-[var(--inverse-text)]/60 pb-1 hover:border-[var(--accent)] hover:text-[var(--accent)]">Close</button></header>
        <nav aria-label="Project chapters" className="mt-[var(--space-3)] flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em]">{chapters.map((chapter, index) => <button key={chapter} type="button" onClick={() => setActiveChapter(index)} aria-current={index === activeChapter ? "step" : undefined} className={index === activeChapter ? "text-[var(--inverse-text)]" : "text-[var(--inverse-text)]/45 hover:text-[var(--inverse-text)]"}>{String(index + 1).padStart(2, "0")} {chapter}</button>)}</nav>
        <div className="relative min-h-0 flex-1"><AnimatePresence initial={false} mode="wait"><ChapterMotion chapter={activeLabel}><ChapterContent chapter={activeLabel} project={project} /></ChapterMotion></AnimatePresence></div>
        <footer className="flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em]"><button type="button" onClick={previousChapter} disabled={activeChapter === 0} className="text-[var(--inverse-text)]/60 hover:text-[var(--inverse-text)] disabled:opacity-25">Previous</button><p className="text-[var(--inverse-text)]/45">Swipe / Arrow keys</p><button type="button" onClick={nextChapter} disabled={activeChapter === chapters.length - 1} className="text-[var(--inverse-text)]/60 hover:text-[var(--inverse-text)] disabled:opacity-25">Next</button></footer>
      </div>
    </motion.section>
  );
}
