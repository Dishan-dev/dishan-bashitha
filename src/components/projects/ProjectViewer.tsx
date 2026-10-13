"use client";

import { motion, useMotionValue } from "framer-motion";
import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, Code2, FileText, Layers3, Maximize2, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Project } from "@/data/projects";
import { portfolioMotion } from "@/lib/motion";
import { ThemeToggle } from "@/components/portfolio/ThemeToggle";
import styles from "./ProjectViewer.module.css";

type ProjectViewerProps = { project: Project; onClose: () => void; entranceDelay?: number };
const projectAccents: Record<string, { light: string; dark: string }> = {
  learnix: { light: "#6841b9", dark: "#bea4ff" },
  "primecore-bank": { light: "#275ea4", dark: "#8dbbff" },
  "hotel-management-system": { light: "#216b50", dark: "#8bd9ba" },
  planitnow: { light: "#8a491c", dark: "#edbb8f" },
};
const chapterIcons = { Overview: Sparkles, Features: Layers3, Engineering: Code2, Source: FileText };

export function ProjectViewer({ project, onClose, entranceDelay = 0 }: ProjectViewerProps) {
  const dialog = useRef<HTMLElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const instance = useId();
  const [activeChapter, setActiveChapter] = useState(0);
  const readingProgress = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const chapters = project.chapters;
  const accent = projectAccents[project.slug] ?? projectAccents.learnix;

  const goToChapter = useCallback((index: number) => {
    const container = scrollArea.current;
    const section = sections.current[index];
    if (!container || !section) return;
    const top = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 28;
    container.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "instant" : "smooth" });
  }, [reduceMotion]);

  useEffect(() => {
    const element = dialog.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.focus({ preventScroll: true });
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !element) return;
      const focusable = element.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex='0']");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === element)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === element)) {
        event.preventDefault(); first?.focus();
      }
    };
    element?.addEventListener("keydown", trapFocus);
    return () => {
      element?.removeEventListener("keydown", trapFocus);
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, []);

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
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("a, button, input, textarea, select")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        goToChapter(Math.min(chapters.length - 1, Math.max(0, activeChapter + (event.key === "ArrowRight" ? 1 : -1))));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToChapter, activeChapter, chapters.length]);

  useEffect(() => {
    const container = scrollArea.current;
    if (!container) return;
    let frame = 0;
    const updatePosition = () => {
      const edge = container.getBoundingClientRect().top + Math.min(200, container.clientHeight * 0.3);
      let current = 0;
      sections.current.forEach((section, index) => { if (section && section.getBoundingClientRect().top <= edge) current = index; });
      const distance = container.scrollHeight - container.clientHeight;
      if (distance > 0 && container.scrollTop >= distance - 2) current = chapters.length - 1;
      setActiveChapter(current);
      readingProgress.set(distance > 0 ? Math.min(1, container.scrollTop / distance) : 1);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(updatePosition); };
    container.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    if (container.firstElementChild) observer.observe(container.firstElementChild);
    schedule();
    return () => { container.removeEventListener("scroll", schedule); observer.disconnect(); cancelAnimationFrame(frame); };
  }, [chapters.length, readingProgress]);

  return (
    <motion.section ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${instance}-title`} tabIndex={-1}
      initial={reduceMotion ? false : { opacity: 0, y: entranceDelay ? 0 : 24 }}
      animate={{ opacity: 1, y: 0, transition: { delay: reduceMotion ? 0 : entranceDelay, duration: reduceMotion ? 0 : 0.5 } }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : 18, transition: { duration: reduceMotion ? 0 : 0.3 } }}
      className={styles.viewer} style={{ "--case-accent-light": accent.light, "--case-accent-dark": accent.dark } as CSSProperties}>
      <header className={styles.topbar}>
        <button type="button" onClick={onClose} className={styles.back}><ArrowLeft size={17} aria-hidden="true" /><span>All projects</span></button>
        <p>Selected work <span>/</span> {project.id} <span>/</span> {project.shortTitle}</p>
        <div className={styles.topActions}><ThemeToggle /><button type="button" onClick={onClose} className={styles.close} aria-label="Close project details"><span>Esc</span><X size={18} aria-hidden="true" /></button></div>
        <motion.span aria-hidden="true" className={styles.progress} style={{ scaleX: readingProgress }} />
      </header>

      <aside className={styles.sidebar}>
        <div className={styles.sideIdentity}><span className={styles.sideNumber}>{project.id}<span> / CASE STUDY</span></span><h2>{project.shortTitle}</h2><p>{project.marker}</p></div>
        <nav aria-label="Project chapters" className={styles.chapterNav}>
          {chapters.map((chapter, index) => {
            const Icon = chapterIcons[chapter as keyof typeof chapterIcons] ?? FileText;
            return <button key={chapter} type="button" onClick={() => goToChapter(index)} aria-current={index === activeChapter ? "location" : undefined} aria-controls={`${instance}-${index}`}>
              <Icon size={16} aria-hidden="true" /><span>{chapter}</span><small>{String(index + 1).padStart(2, "0")}</small>
            </button>;
          })}
        </nav>
        <div className={styles.sideFooter}><span className={styles.statusDot} /> From idea to implementation<p>{project.year} · {project.marker}</p></div>
      </aside>

      <div ref={scrollArea} className={styles.scrollArea} tabIndex={0} aria-label={`${project.title} case study`}>
        <div className={styles.document}>
          {chapters.map((chapter, index) => <section key={chapter} ref={(element) => { sections.current[index] = element; }} id={`${instance}-${index}`} aria-labelledby={`${instance}-${chapter}-heading`} className={styles.chapter}>
            {chapter === "Overview" && <>
              <div className={styles.hero}>
                <p className={styles.eyebrow}><span /> {project.marker} <span className={styles.heroYear}>{project.year}</span></p>
                <h1 id={`${instance}-title`}>{project.title}<span>.</span></h1>
                <div className={styles.heroBottom}><p>{project.description}</p><div className={styles.heroActions}>
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">View source<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live site<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
                </div></div>
              </div>
              <motion.figure className={styles.preview} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : entranceDelay + 0.15, ease: portfolioMotion.ease }}>
                <div className={styles.previewBar}><span><i /><i /><i /></span><p>{project.shortTitle} / Project showcase</p><a href={project.coverImage} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} full-size image in a new tab`}><Maximize2 size={14} /></a></div>
                <div className={styles.imageFrame}><Image src={project.coverImage} alt={`${project.title} project presentation and interface previews`} fill sizes="(max-width: 760px) 100vw, (max-width: 1200px) 75vw, 1100px" loading="eager" className={styles.coverImage} /></div>
                <figcaption><span>{project.role}</span><span>{project.year}</span></figcaption>
              </motion.figure>
              <div className={styles.overview}>
                <div><p className={styles.eyebrow}>01 / The idea</p><h2 id={`${instance}-Overview-heading`}>A closer look<span>.</span></h2></div>
                <div><p className={styles.overviewText}>{project.overview}</p><ul className={styles.capabilities} aria-label="Project capabilities">{project.capabilities.map(item => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul></div>
              </div>
              <div className={styles.facts}><div><span>Project focus</span><p>{project.role}</p></div><div><span>Year</span><p>{project.year}</p></div>{project.technologies.length > 0 && <div><span>Built with</span><p>{project.technologies.length} technologies</p></div>}</div>
            </>}

            {chapter === "Features" && <>
              <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{String(index + 1).padStart(2, "0")} / The experience</p><h2 id={`${instance}-Features-heading`}>Built for real use<span>.</span></h2></div><p>The workflows that bring the product to life.</p></div>
              <div className={styles.features}>{project.features.map((feature, featureIndex) => <motion.article key={feature.title} className={styles.featureCard}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ root: scrollArea, once: true, amount: 0.15 }} transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : featureIndex * 0.06 }}>
                <div className={styles.cardTop}><span>{String(featureIndex + 1).padStart(2, "0")}</span><Layers3 size={20} strokeWidth={1.3} aria-hidden="true" /></div><h3>{feature.title}</h3><p>{feature.description}</p>
              </motion.article>)}</div>
            </>}

            {chapter === "Engineering" && <>
              <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{String(index + 1).padStart(2, "0")} / Under the surface</p><h2 id={`${instance}-Engineering-heading`}>How it comes together<span>.</span></h2></div><Code2 size={36} strokeWidth={1.1} aria-hidden="true" /></div>
              <div className={styles.engineering}><div className={styles.stackPanel}><div className={styles.stackIcon}><Code2 size={26} aria-hidden="true" /></div><h3>The toolkit</h3><p>Technologies behind the experience.</p><ul aria-label="Technology stack">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul></div>
                <ol className={styles.engineeringSteps}>{project.engineering.map((detail, detailIndex) => <li key={detail.title}><span className={styles.stepNumber}>{String(detailIndex + 1).padStart(2, "0")}</span><div><h3>{detail.title}</h3><p>{detail.description}</p></div></li>)}</ol>
              </div>
            </>}

            {chapter === "Source" && <>
              <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{String(index + 1).padStart(2, "0")} / Explore further</p><h2 id={`${instance}-Source-heading`}>Inside the build<span>.</span></h2></div><p>Explore the code, implementation, and supporting details.</p></div>
              <div className={styles.sources}>{project.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"><span className={styles.sourceIcon}>{source.url.endsWith(".pdf") ? <FileText size={22} /> : <Code2 size={22} />}</span><span><strong>{source.label}</strong><small>{source.url.endsWith(".pdf") ? "PDF document" : "Explore on GitHub"}<span className="sr-only"> (opens in a new tab)</span></small></span><ArrowUpRight size={20} aria-hidden="true" /></a>)}</div>
            </>}
          </section>)}
          <footer className={styles.endCard}><div><p className={styles.eyebrow}>There’s more to explore</p><h2>Another idea.<br /><span>Another possibility.</span></h2></div><button type="button" onClick={onClose}>Back to projects<ArrowUpRight size={22} aria-hidden="true" /></button></footer>
          <div className={styles.colophon}><span>Dishan Bashitha / Selected work</span><button type="button" onClick={() => goToChapter(0)}>Back to top<ArrowDown size={14} aria-hidden="true" /></button></div>
        </div>
      </div>
    </motion.section>
  );
}
