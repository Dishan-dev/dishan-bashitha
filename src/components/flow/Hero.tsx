"use client";

import { gsap } from "gsap";
import { Box, Code2, GraduationCap, Sparkles, UserRound } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { projects } from "@/data/projects";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import { isLoading, loadedEvent } from "./Loader";
import styles from "./Flow.module.css";

const featured = projects[0];
const capabilities = [
  { label: ["Clean", "Architecture"], icon: Box },
  { label: ["Scalable", "Solutions"], icon: Code2 },
  { label: ["User", "Focused"], icon: UserRound },
  { label: ["Always", "Learning"], icon: GraduationCap },
];

/**
 * The cover's layers arrive in order, the portrait follows the pointer, and on scroll the
 * frame recedes while headline, portrait and glass panel part at different depths.
 */
const heroMotion: FlowSetup = (hero) => {
  const tilt = one(hero, "[data-hero-tilt]");
  // The entrance is held (already in its start state) until the loader lifts.
  const intro = gsap.timeline({ paused: true })
    .from(all(hero, "[data-line] > span"), { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.09 }, 0.1)
    .from(one(hero, "[data-hero-portrait]"), { y: 60, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.2)
    .from(one(hero, "[data-hero-panel]"), { yPercent: 18, opacity: 0, duration: 1.2, ease: "expo.out" }, 0.3)
    .from(all(hero, "[data-hero-fade]"), { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.45)
    .from(one(hero, "[data-hero-spark]"), { scale: 0, rotation: -90, duration: 0.9, ease: "back.out(2)" }, 0.6);
  const play = () => intro.play();
  if (isLoading()) window.addEventListener(loadedEvent, play, { once: true });
  else play();

  const range = () => ({ trigger: hero, start: "top top", end: "bottom top", scrub: true });
  gsap.to(one(hero, "[data-hero-frame]"), { scale: 0.92, borderRadius: 44, ease: "none", scrollTrigger: range() });
  gsap.to(one(hero, "[data-hero-heading]"), { yPercent: -24, opacity: 0.4, ease: "none", scrollTrigger: range() });
  gsap.to(one(hero, "[data-hero-impact]"), { yPercent: -36, ease: "none", scrollTrigger: range() });
  gsap.to(one(hero, "[data-hero-portrait]"), { yPercent: -6, scale: 1.05, ease: "none", scrollTrigger: range() });
  gsap.to(one(hero, "[data-hero-panel]"), { yPercent: 14, ease: "none", scrollTrigger: range() });
  gsap.to(one(hero, "[data-hero-orbits]"), { scale: 1.18, rotation: 8, ease: "none", scrollTrigger: range() });

  if (!tilt || !window.matchMedia("(pointer: fine)").matches) return () => window.removeEventListener(loadedEvent, play);
  const rotateX = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3" });
  const rotateY = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3" });
  // The background answers the pointer: a glow trails it, dots light up beneath it, and the
  // orbit rings drift the opposite way at different depths.
  const glow = one(hero, "[data-hero-glow]");
  const grid = one(hero, "[data-hero-grid]");
  const glowX = gsap.quickTo(glow, "x", { duration: 1.6, ease: "power3" });
  const glowY = gsap.quickTo(glow, "y", { duration: 1.6, ease: "power3" });
  const spot = { x: 50, y: 42 };
  const paint = () => { grid?.style.setProperty("--spot-x", `${spot.x}%`); grid?.style.setProperty("--spot-y", `${spot.y}%`); };
  const spotX = gsap.quickTo(spot, "x", { duration: 0.5, ease: "power2", onUpdate: paint });
  const spotY = gsap.quickTo(spot, "y", { duration: 0.5, ease: "power2", onUpdate: paint });
  const rings = all(hero, "[data-hero-orbits] > *").map((ring, index) => ({
    depth: (index + 1) * 18,
    x: gsap.quickTo(ring, "x", { duration: 1.2, ease: "power3" }),
    y: gsap.quickTo(ring, "y", { duration: 1.2, ease: "power3" }),
  }));
  const move = (event: PointerEvent) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    rotateY((x - 0.5) * 10);
    rotateX(-(y - 0.5) * 6);
    glowX((x - 0.5) * bounds.width * 0.7);
    glowY((y - 0.45) * bounds.height * 0.7);
    spotX(x * 100);
    spotY(y * 100);
    rings.forEach(ring => { ring.x(-(x - 0.5) * ring.depth * 2); ring.y(-(y - 0.5) * ring.depth); });
  };
  const leave = () => {
    rotateX(0); rotateY(0); glowX(0); glowY(0); spotX(50); spotY(42);
    rings.forEach(ring => { ring.x(0); ring.y(0); });
  };
  hero.addEventListener("pointermove", move);
  hero.addEventListener("pointerleave", leave);
  return () => { window.removeEventListener(loadedEvent, play); hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave); };
};

/** Hovering the portrait opens a lens onto the illustrated version underneath. */
function moveLens(event: React.PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--lens-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
  event.currentTarget.style.setProperty("--lens-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
}

export function Hero({ onOpen }: { onOpen: (slug: string) => void }) {
  const root = useRef<HTMLElement>(null);
  useFlowMotion(root, heroMotion);

  return (
    <section ref={root} id="home" className={styles.hero} aria-labelledby="home-title">
      <div data-hero-frame className={styles.heroFrame}>
        <div data-hero-glow className={styles.heroGlow} aria-hidden="true"><span /></div>
        <div data-hero-grid className={styles.heroGrid} aria-hidden="true" />
        <div data-hero-orbits className={styles.heroOrbits} aria-hidden="true"><span /><span /><i /></div>
        <div data-hero-panel className={styles.heroPanel} aria-hidden="true" />

        <div data-hero-heading className={styles.heroHeading}>
          <p data-hero-fade className={styles.eyebrow}>01 · Software Engineer</p>
          <h1 id="home-title" className={styles.heroTitle}>
            <span data-line className={styles.line}><span>Dishan</span></span>
            <span data-line className={`${styles.line} ${styles.dim}`}><span>Bashitha</span></span>
          </h1>
          <Sparkles data-hero-spark className={styles.heroSpark} aria-hidden="true" size={44} strokeWidth={1.25} />
        </div>

        <div data-hero-impact className={styles.heroImpact}>
          <p data-hero-fade className={styles.impactLine}>I build digital experiences <span>that make an impact.</span></p>
          <p data-hero-fade>Software Engineer skilled in building scalable web applications and delivering intuitive user experiences.</p>
        </div>

        <div data-hero-portrait className={styles.heroPortrait}>
          <div data-hero-tilt className={styles.heroTilt} onPointerMove={moveLens}>
            <Image src="/images/DishanBashitha.png" alt="Dishan Bashitha" fill priority quality={90} sizes="(max-width: 900px) 100vh, 160vh" />
            <Image src="/images/DishanBashitha-anime-hoodie-aligned.png" alt="" fill sizes="(max-width: 900px) 100vh, 160vh" className={styles.heroLens} />
          </div>
        </div>

        <div className={styles.heroBio}>
          <p data-hero-fade className={styles.eyebrow}>Based in Sri Lanka</p>
          <h2 data-hero-fade>Full Stack Developer</h2>
          <p data-hero-fade>Passionate about clean code, modern web technologies and solving real-world problems.</p>
          <div data-hero-fade className={styles.btns}>
            <a className={`${styles.btn} ${styles.solid}`} href="#projects">Explore my work →</a>
            <a className={`${styles.btn} ${styles.ghost}`} href="#contact">Let’s talk</a>
          </div>
        </div>

        <div className={styles.heroFeatured}>
          <ul data-hero-fade className={styles.capabilities}>
            {capabilities.map(({ label, icon: Icon }) => <li key={label[0]}><Icon aria-hidden="true" size={22} strokeWidth={1.35} />{label[0]}<br />{label[1]}</li>)}
          </ul>
          <p data-hero-fade className={styles.eyebrow}>Featured project</p>
          <button data-hero-fade type="button" className={styles.featuredCard} onClick={() => onOpen(featured.slug)}>
            <span className={styles.featuredThumb}><Image src={featured.coverImage} alt="" fill sizes="112px" /></span>
            <span><strong>{featured.title}</strong><small>{featured.description}</small><em>View project →</em></span>
          </button>
        </div>
      </div>
    </section>
  );
}
