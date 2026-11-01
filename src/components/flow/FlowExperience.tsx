"use client";

import { AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ThemeToggle } from "@/components/portfolio/ThemeToggle";
import { projects } from "@/data/projects";
import { motionQuery, reducedQuery } from "@/lib/motion";
import { lockScroll, scrollToY, startSmoothScroll, stopSmoothScroll } from "@/lib/portfolioScroll";
import { About } from "./About";
import { Companion } from "./Companion";
import { Contact } from "./Contact";
import { Education } from "./Education";
import { ExperienceCarousel } from "./ExperienceCarousel";
import { Hero } from "./Hero";
import { Loader } from "./Loader";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectPanels } from "./ProjectPanels";
import styles from "./Flow.module.css";

const navLinks = [["home", "Home"], ["about", "About"], ["experience", "Experience"], ["education", "Education"], ["projects", "Projects"]] as const;
const sectionLabels: Record<string, string> = { ...Object.fromEntries(navLinks), contact: "Contact" };
const sectionIds = ["home", "about", "experience", "education", "projects", "contact"];
// Sections whose top edge sits on the paper background; the glass switches to dark text there.
const paperSections = new Set(["about", "experience", "education"]);
const projectFromHash = () => projects.find(project => window.location.hash === `#project-${project.slug}`)?.slug ?? null;

/**
 * Where a link to a section lands: the start of a pinned sequence, otherwise the top of its
 * stack layer. Layers stick, so their offsets are summed rather than measured on screen.
 */
function sectionOffset(id: string) {
  const section = document.getElementById(id);
  if (!section) return null;
  const pin = ScrollTrigger.getAll().find(trigger => trigger.pin === section);
  if (pin) return pin.start;
  let top = 0;
  for (let layer = section.closest("[data-stack]")?.previousElementSibling; layer; layer = layer.previousElementSibling) {
    if (layer instanceof HTMLElement && layer.matches("[data-stack]")) top += layer.offsetHeight;
  }
  return top;
}

/** One layer of the stack: it sticks once fully read while the next layer slides over it. */
function Stack({ children }: { children: ReactNode }) {
  return <div data-stack className={styles.stack}>{children}<span data-stack-shade className={styles.stackShade} aria-hidden="true" /></div>;
}

function goToSection(id: string, immediate = false) {
  const top = sectionOffset(id);
  if (top === null) return false;
  scrollToY(top, { immediate });
  return true;
}

export function FlowExperience() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openRef = useRef<string | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const switching = useRef(false);
  const shell = useRef<HTMLElement>(null);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pill = useRef<HTMLDivElement>(null);
  const liquid = useRef<HTMLSpanElement>(null);
  const openProject = projects.find(project => project.slug === openSlug);

  // The section under the nav is the one whose layout box has reached the top of the viewport.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      let current = "home";
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        const box = section?.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
        if (box && box.getBoundingClientRect().top <= 40) current = id;
      }
      setActive(current);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);

  // A glass droplet slides under the current link; it fades out when that link is hidden.
  useLayoutEffect(() => {
    const place = () => {
      const link = pill.current?.querySelector<HTMLElement>(`a[href="#${active}"]`);
      const drop = liquid.current;
      if (!drop) return;
      const visible = Boolean(link && link.offsetWidth);
      drop.style.opacity = visible ? "1" : "0";
      if (link && visible) { drop.style.width = `${link.offsetWidth}px`; drop.style.transform = `translateX(${link.offsetLeft}px)`; }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, openSlug]);

  useEffect(() => { openRef.current = openSlug; }, [openSlug]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Each layer sticks at the point where its bottom meets the viewport, so taller sections are
  // read in full first. Sticking is lifted while ScrollTrigger measures, keeping its offsets true.
  useEffect(() => {
    const main = shell.current;
    if (!main) return;
    const layers = Array.from(main.querySelectorAll<HTMLElement>("[data-stack]"));
    const measure = () => layers.forEach(layer => layer.style.setProperty("--stick", `${Math.min(0, window.innerHeight - layer.offsetHeight)}px`));
    const lift = () => main.classList.add(styles.measuring);
    const settle = () => { main.classList.remove(styles.measuring); measure(); };
    const observer = new ResizeObserver(measure);
    layers.forEach(layer => observer.observe(layer));
    ScrollTrigger.addEventListener("refreshInit", lift);
    ScrollTrigger.addEventListener("refresh", settle);
    // The covered layer dims as the next one slides over it.
    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      layers.slice(1).forEach((layer, index) => gsap.fromTo(layers[index].querySelector("[data-stack-shade]"), { opacity: 0 }, { opacity: 0.55, ease: "none",
        scrollTrigger: { trigger: layer, start: "top bottom", end: "top top", scrub: true } }));
    });
    measure();
    ScrollTrigger.refresh();
    return () => {
      observer.disconnect();
      media.revert();
      ScrollTrigger.removeEventListener("refreshInit", lift);
      ScrollTrigger.removeEventListener("refresh", settle);
    };
  }, []);

  // One Lenis instance on GSAP's ticker; reduced motion keeps native scrolling.
  useEffect(() => {
    const media = window.matchMedia(reducedQuery);
    const configure = () => {
      if (media.matches) stopSmoothScroll(); else startSmoothScroll();
      // The page stays still behind the loader.
      if (document.documentElement.hasAttribute("data-flow-loading")) lockScroll(true);
      ScrollTrigger.refresh();
    };
    ScrollTrigger.config({ ignoreMobileResize: true });
    configure();
    media.addEventListener("change", configure);
    return () => { media.removeEventListener("change", configure); stopSmoothScroll(); };
  }, []);

  // Direct links land on their section once the pinned sequences have measured themselves.
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    const restore = () => {
      ScrollTrigger.refresh();
      const slug = projectFromHash();
      // A case-study link opens over Projects, so closing it lands among the panels.
      if (slug) { goToSection("projects", true); setOpenSlug(slug); }
      else if (window.location.hash) goToSection(window.location.hash.slice(1), true);
    };
    const frame = requestAnimationFrame(restore);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("load", refresh); };
  }, []);

  // History drives the viewer; closing it returns to the page exactly where it was.
  useEffect(() => {
    const onHistory = () => {
      const slug = projectFromHash();
      if (slug || openRef.current) { setOpenSlug(slug); return; }
      if (window.location.hash) goToSection(window.location.hash.slice(1));
      else scrollToY(0);
    };
    window.addEventListener("popstate", onHistory);
    return () => window.removeEventListener("popstate", onHistory);
  }, []);

  useEffect(() => {
    const onViewer = (event: Event) => lockScroll(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("portfolio:project-viewer", onViewer);
    return () => window.removeEventListener("portfolio:project-viewer", onViewer);
  }, []);

  const open = useCallback((slug: string) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpenSlug(slug);
    window.history.pushState({ ...window.history.state, projectViewer: slug }, "", `#project-${slug}`);
  }, []);

  const close = useCallback(() => {
    if (openRef.current && window.history.state?.projectViewer === openRef.current) window.history.back();
    else { window.history.replaceState(window.history.state, "", "#projects"); setOpenSlug(null); }
  }, []);

  const loaded = useCallback(() => {
    setLoading(false);
    if (document.body.dataset.projectViewer !== "open") lockScroll(false);
  }, []);

  // "Next project" swaps the case study in place, without flying back to the panel first.
  const showNext = useCallback((slug: string) => {
    switching.current = true;
    setOpenSlug(slug);
    window.history.replaceState({ ...window.history.state, projectViewer: slug }, "", `#project-${slug}`);
  }, []);

  // The companion walks the reader forward one section at a time, then back to the top.
  const next = () => {
    const id = sectionIds[(sectionIds.indexOf(active) + 1) % sectionIds.length];
    if (goToSection(id)) window.history.pushState(window.history.state, "", `#${id}`);
  };

  // Every in-page link travels smoothly and leaves a history entry, like a native anchor.
  const onLinkClick = (event: MouseEvent<HTMLElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href^='#']");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute("href") ?? "";
    if (!goToSection(hash.slice(1))) return;
    event.preventDefault();
    if (window.location.hash !== hash) window.history.pushState(window.history.state, "", hash);
  };

  return (
    <main ref={shell} data-flow className={styles.flow} onClick={onLinkClick}>
      {loading && <Loader onDone={loaded} />}
      {!openProject && (
        <nav className={styles.nav} aria-label="Sections" data-surface={paperSections.has(active) ? "paper" : "dark"}>
          <div ref={pill} className={`${styles.pill} ${styles.desktopPill}`}>
            <span ref={liquid} className={styles.liquid} aria-hidden="true" />
            {navLinks.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>{label}</a>)}
            <ThemeToggle className={styles.theme} />
            <a className={styles.navCta} href="#contact" aria-current={active === "contact" ? "true" : undefined}>Contact me</a>
          </div>
          {/* Phones and tablets: brand, the current section, and a menu sheet. */}
          <div className={`${styles.pill} ${styles.mobileBar}`}>
            <a className={styles.brand} href="#home" aria-label="Home" onClick={() => setMenuOpen(false)}>DB</a>
            <span key={active} className={styles.current} aria-hidden="true">{sectionLabels[active]}</span>
            <button type="button" className={styles.menuButton} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="flow-menu" onClick={() => setMenuOpen(open => !open)}>
              <span data-open={menuOpen ? "true" : undefined} /><span data-open={menuOpen ? "true" : undefined} />
            </button>
          </div>
          {menuOpen && (
            <div id="flow-menu" className={`${styles.pill} ${styles.menu}`} onClick={event => { if ((event.target as Element).closest("a")) setMenuOpen(false); }}>
              {navLinks.map(([id, label], index) => <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}><small>{String(index + 1).padStart(2, "0")}</small>{label}</a>)}
              <div className={styles.menuFoot}>
                <ThemeToggle className={styles.theme} />
                <a className={styles.navCta} href="#contact">Contact me</a>
              </div>
            </div>
          )}
        </nav>
      )}
      <Stack><Hero onOpen={open} /></Stack>
      <Stack><About /></Stack>
      <Stack><ExperienceCarousel /></Stack>
      <Stack><Education /></Stack>
      <Stack><ProjectPanels onOpen={open} /></Stack>
      <Stack><Contact /></Stack>
      <Companion active={active} hidden={loading || Boolean(openProject)} onNext={next} />
      <AnimatePresence mode="wait" onExitComplete={() => { switching.current = false; if (!openRef.current) returnFocus.current?.focus({ preventScroll: true }); }}>
        {openProject && <ProjectDetail key={openProject.slug} project={openProject} onClose={close} onNext={showNext} switchingRef={switching} />}
      </AnimatePresence>
    </main>
  );
}
