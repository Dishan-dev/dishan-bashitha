"use client";

import { usePresence } from "framer-motion";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Code2, FileText, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
import { projects, type Project } from "@/data/projects";
import { portfolioMotion, reducedQuery } from "@/lib/motion";
import { createFlight, flightBox, imageFit, isOnScreen, type FlightBox } from "@/lib/sharedElement";
import { ParticleField } from "./ParticleField";
import { tintFor } from "./projectTints";
import styles from "./ProjectDetail.module.css";

type ProjectDetailProps = { project: Project; onClose: () => void; onNext: (slug: string) => void; switchingRef: RefObject<boolean> };
const boxVars = ({ left, top, width, height, borderRadius }: FlightBox) => ({ left, top, width, height, borderRadius });
const panelShot = (slug: string) => document.querySelector<HTMLElement>(`[data-project-media="${slug}"][data-active-media]`);
const pad = (value: number) => String(value).padStart(2, "0");

/**
 * A full-screen case study in the stage's own language: a particle sphere in the project's
 * colour behind an oversized title, the cover flying in from its panel, then the overview,
 * features, engineering and sources as chapters below.
 */
export function ProjectDetail({ project, onClose, onNext, switchingRef }: ProjectDetailProps) {
  const dialog = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const shot = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const progress = useRef(0.32);
  const opening = useRef<gsap.core.Timeline | null>(null);
  const [isPresent, safeToRemove] = usePresence();
  const instance = useId();
  const tint = tintFor(project.slug);
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const chapters = [
    "Overview",
    ...(project.features.length ? ["Features"] : []),
    ...(project.engineering.length ? ["Engineering"] : []),
    ...(project.sources.length ? ["Source"] : []),
  ];
  const number = (chapter: string) => pad(chapters.indexOf(chapter) + 1);

  // The panel's screen expands into the hero; the title and copy settle once it lands.
  useLayoutEffect(() => {
    const element = dialog.current;
    const target = shot.current;
    if (!element || !target || window.matchMedia(reducedQuery).matches) return;
    const source = panelShot(project.slug);
    const shared = isOnScreen(source);
    const timeline = gsap.timeline({ defaults: { ease: portfolioMotion.gsapEase } });
    opening.current = timeline;
    timeline.fromTo(element, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
    if (shared) {
      const flight = createFlight(source, flightBox(source));
      gsap.set([source, target], { visibility: "hidden" });
      timeline.to(flight, { ...boxVars(flightBox(target)), duration: portfolioMotion.expand, ease: "expo.inOut" }, 0)
        .add(() => { gsap.set([source, target], { clearProps: "visibility" }); flight.remove(); });
    } else {
      timeline.from(target, { clipPath: "inset(14% 10% 14% 10% round 16px)", scale: 1.06, duration: 1.1 }, 0.1);
    }
    const settled = shared ? portfolioMotion.expand - 0.35 : 0.2;
    timeline.from(element.querySelectorAll("[data-title] > span > span"), { yPercent: 105, duration: 1.1 }, settled);
    timeline.from(element.querySelectorAll("[data-hero-reveal]"), { y: 24, opacity: 0, duration: 0.8, stagger: 0.06 }, settled + 0.1);
    return () => { timeline.progress(1, false).kill(); opening.current = null; };
  }, [project.slug]);

  // Closing reverses the flight into the panel when both ends are visible.
  useEffect(() => {
    if (isPresent) return;
    const element = dialog.current;
    const target = shot.current;
    opening.current?.progress(1, false).kill();
    const source = panelShot(project.slug);
    if (!element || !target || window.matchMedia(reducedQuery).matches) { safeToRemove(); return; }
    const timeline = gsap.timeline({ onComplete: safeToRemove });
    if (switchingRef.current) {
      timeline.to(element, { opacity: 0, duration: 0.3, ease: "power2.in" });
    } else if (isOnScreen(source) && isOnScreen(target)) {
      const flight = createFlight(target, flightBox(target), imageFit(source));
      gsap.set([source, target], { visibility: "hidden" });
      timeline.to(element, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, 0.1)
        .to(flight, { ...boxVars(flightBox(source)), duration: portfolioMotion.expand * 0.85, ease: "expo.inOut" }, 0.05)
        .add(() => { gsap.set(source, { clearProps: "visibility" }); flight.remove(); });
    } else {
      timeline.to(element, { opacity: 0, y: 16, duration: 0.32, ease: "power2.in" });
    }
    return () => { timeline.progress(1, false).kill(); };
  }, [isPresent, safeToRemove, project.slug, switchingRef]);

  // Focus moves into the dialog, stays trapped there, and returns when it closes.
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !element) return;
      const focusable = element.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex='0']");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === element)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    element?.addEventListener("keydown", onKey);
    return () => { element?.removeEventListener("keydown", onKey); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [onClose]);

  // The page behind stays still while the case study is open.
  useEffect(() => {
    document.body.dataset.projectViewer = "open";
    window.dispatchEvent(new CustomEvent("portfolio:project-viewer", { detail: true }));
    return () => {
      delete document.body.dataset.projectViewer;
      window.dispatchEvent(new CustomEvent("portfolio:project-viewer", { detail: false }));
    };
  }, []);

  // Reading progress drives the top bar and disperses the sphere as the hero scrolls away;
  // chapter content rises in as it enters view.
  useEffect(() => {
    const area = scroller.current;
    if (!area) return;
    let frame = 0;
    const update = () => {
      const distance = area.scrollHeight - area.clientHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${distance > 0 ? area.scrollTop / distance : 1})`;
      progress.current = 0.32 + Math.min(1, area.scrollTop / area.clientHeight) * 0.68;
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.setAttribute("data-shown", "");
      reveal.unobserve(entry.target);
    }), { root: area, rootMargin: "0px 0px -10% 0px" });
    area.querySelectorAll("[data-reveal]").forEach(item => reveal.observe(item));
    area.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { cancelAnimationFrame(frame); reveal.disconnect(); area.removeEventListener("scroll", onScroll); };
  }, [project.slug]);

  return (
    <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${instance}-title`} tabIndex={-1} data-lenis-prevent
      className={styles.detail} style={{ "--tint": tint } as CSSProperties}>
      <span ref={bar} className={styles.progress} aria-hidden="true" />
      <header className={styles.bar}>
        <button type="button" className={styles.glass} onClick={onClose}><ArrowLeft size={16} aria-hidden="true" />All projects</button>
        <p className={`${styles.glass} ${styles.crumb}`}>05 · Projects <span>/</span> {project.id} {project.shortTitle}</p>
        <button type="button" className={styles.glass} onClick={onClose} aria-label="Close project details"><span className={styles.key}>Esc</span><X size={16} aria-hidden="true" /></button>
      </header>

      <div ref={scroller} className={styles.scroller}>
        <div className={styles.hero}>
          <ParticleField tint={tint} progress={progress} className={styles.particles} />
          <div className={styles.glow} aria-hidden="true" />
          <p data-hero-reveal className={styles.eyebrow}>{project.id} · {project.marker} · {project.year}</p>
          <h1 id={`${instance}-title`} data-title className={styles.title}><span><span>{project.title}</span></span></h1>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p data-hero-reveal className={styles.lede}>{project.description}</p>
              <div data-hero-reveal className={styles.actions}>
                {project.githubUrl && <a className={styles.solid} href={project.githubUrl} target="_blank" rel="noopener noreferrer">View source<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
                {project.liveUrl && <a className={styles.outline} href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live site<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
                <button type="button" className={styles.outline} onClick={() => scroller.current?.scrollTo({ top: scroller.current.clientHeight, behavior: "smooth" })}>Read more</button>
              </div>
              <dl data-hero-reveal className={styles.facts}>
                <div><dt>Focus</dt><dd>{project.role}</dd></div>
                <div><dt>Year</dt><dd>{project.year}</dd></div>
                {project.technologies.length > 0 && <div><dt>Stack</dt><dd>{project.technologies.length} technologies</dd></div>}
              </dl>
            </div>
            <figure className={styles.window}>
              <div className={styles.windowBar} aria-hidden="true"><span><i /><i /><i /></span>{project.shortTitle}</div>
              <div ref={shot} className={styles.shot}>
                <Image src={project.coverImage} alt={`${project.title} interface previews`} fill priority sizes="(max-width: 900px) 92vw, 760px" />
              </div>
            </figure>
          </div>
        </div>

        <section className={styles.chapter} aria-labelledby={`${instance}-overview`}>
          <div className={styles.chapterHead}>
            <div data-reveal><p className={styles.eyebrow}>{number("Overview")} · Overview</p><h2 id={`${instance}-overview`} className={styles.sectionTitle}>A closer <span>look.</span></h2></div>
            <div data-reveal>
              <p className={styles.overview}>{project.overview}</p>
              <ul className={styles.chips} aria-label="Capabilities">{project.capabilities.map(item => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul>
            </div>
          </div>
        </section>

        {project.features.length > 0 && <section className={styles.chapter} aria-labelledby={`${instance}-features`}>
          <div data-reveal><p className={styles.eyebrow}>{number("Features")} · Features</p><h2 id={`${instance}-features`} className={styles.sectionTitle}>Built for <span>real use.</span></h2></div>
          <div className={styles.cards}>
            {project.features.map((feature, index) => <article key={feature.title} data-reveal className={styles.card} style={{ transitionDelay: `${index * 80}ms` }}>
              <span>{pad(index + 1)}</span><h3>{feature.title}</h3><p>{feature.description}</p>
            </article>)}
          </div>
        </section>}

        {project.engineering.length > 0 && <section className={styles.chapter} aria-labelledby={`${instance}-engineering`}>
          <div data-reveal><p className={styles.eyebrow}>{number("Engineering")} · Engineering</p><h2 id={`${instance}-engineering`} className={styles.sectionTitle}>How it <span>comes together.</span></h2></div>
          <div className={styles.engineering}>
            <div data-reveal className={styles.toolkit}>
              <Code2 size={24} aria-hidden="true" />
              <h3>The toolkit</h3>
              <ul className={styles.chips} aria-label="Technology stack">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
            </div>
            <ol className={styles.steps}>
              {project.engineering.map((detail, index) => <li key={detail.title} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
                <span>{pad(index + 1)}</span><div><h3>{detail.title}</h3><p>{detail.description}</p></div>
              </li>)}
            </ol>
          </div>
        </section>}

        {project.sources.length > 0 && <section className={styles.chapter} aria-labelledby={`${instance}-source`}>
          <div data-reveal><p className={styles.eyebrow}>{number("Source")} · Source</p><h2 id={`${instance}-source`} className={styles.sectionTitle}>Inside <span>the build.</span></h2></div>
          <div className={styles.sources}>
            {project.sources.map(source => <a key={source.url} data-reveal href={source.url} target="_blank" rel="noopener noreferrer">
              {source.url.endsWith(".pdf") ? <FileText size={20} aria-hidden="true" /> : <Code2 size={20} aria-hidden="true" />}
              <span><strong>{source.label}</strong><small>{source.url.endsWith(".pdf") ? "PDF document" : "GitHub"}<span className="sr-only"> (opens in a new tab)</span></small></span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>)}
          </div>
        </section>}

        <footer className={styles.next} style={{ "--next-tint": tintFor(next.slug) } as CSSProperties}>
          <button type="button" data-reveal className={styles.nextButton} onClick={() => onNext(next.slug)}>
            <small>Next project · {next.id}</small>
            <strong>{next.title}<ArrowRight aria-hidden="true" /></strong>
            <span>{next.description}</span>
          </button>
          <button type="button" className={styles.back} onClick={onClose}><ArrowLeft size={16} aria-hidden="true" />Back to all projects</button>
        </footer>
      </div>
    </section>
  );
}
