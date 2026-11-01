"use client";

import { motion, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Image from "next/image";
import { profile } from "@/data/profile";
import { Scene } from "@/components/portfolio/Scene";
import { SceneLabel } from "@/components/ui/SceneLabel";
import type { Choreography } from "@/hooks/useSceneMotion";

/**
 * The portrait that receded on the cover reopens here through a narrow window, then the
 * headline rises through line masks and a drawn underline completes the composition.
 */
const aboutChoreography: Choreography = ({ enter }) => {
  enter(".about-halo", { scale: 0.55, opacity: 0 }, { end: 0.8, compact: false });
  enter(".about-frame", { clipPath: "inset(24% 20% 24% 20% round 1.5rem)" }, { end: 0.85, compact: false });
  enter(".about-photo", { scale: 1.32, transformOrigin: "50% 80%" }, { end: 0.9, compact: false });
  enter(".about-line > span", { yPercent: 108, stagger: 0.12 }, { start: 0.3, end: 0.92 });
  enter(".about-copy p, .about-actions > *", { y: 34, opacity: 0, stagger: 0.06 }, { start: 0.5, end: 1, compact: { y: 18, opacity: 0 } });
  enter(".about-underline path", { strokeDashoffset: 1 }, { start: 0.72, end: 1 });
  enter(".about-footer > *", { x: -24, opacity: 0, stagger: 0.08 }, { start: 0.6, end: 1, compact: false });
};

export function AboutScene() {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 110, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 110, damping: 22 });
  const resetTilt = () => { rotateX.set(0); rotateY.set(0); };

  return (
    <Scene id="about" eyebrow="" className="about-scene relative isolate p-0" choreography={aboutChoreography}>
      <div aria-hidden="true" className="about-halo absolute left-[11%] top-[18%] h-[min(31vw,28rem)] w-[min(31vw,28rem)] rounded-full bg-[var(--accent-soft)]" />
      <div aria-hidden="true" className="absolute bottom-[9%] right-[8%] h-[min(18vw,15rem)] w-[min(18vw,15rem)] rounded-full border border-[var(--accent)]/15" />

      <motion.aside
        style={{ rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY, transformPerspective: 1000 }}
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== "mouse") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          rotateX.set((0.5 - (event.clientY - bounds.top) / bounds.height) * 8);
          rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
        }}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
        className="about-frame absolute left-[clamp(2rem,14vw,15rem)] top-1/2 z-10 hidden h-[min(42svh,30rem)] w-[min(22vw,24rem)] min-w-[15rem] -translate-y-1/2 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-4 shadow-[0_20px_50px_rgba(49,36,77,0.08)] md:block"
      >
        <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">DB / ’26</span>
        <div aria-hidden="true" className="absolute inset-x-[12%] bottom-0 top-[18%] rounded-t-[8rem] bg-[var(--accent-soft)]" />
        <div aria-hidden="true" className="portrait-orbit absolute inset-x-[16%] bottom-[18%] top-[25%] rounded-full border border-[var(--accent)]/30">
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_16px_var(--accent)]" />
        </div>
        <div data-scroll-depth="24" className="absolute inset-0 z-10">
          <div className="about-photo absolute inset-0">
            <Image src="/images/myphoto.png" alt="Dishan Bashitha" width={6000} height={3375} sizes="(min-width: 768px) 60rem, 100vw" quality={100} className="absolute bottom-[-2%] left-1/2 h-[118%] w-auto max-w-none -translate-x-1/2" priority />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]"><span>Dishan Bashitha</span><span>Full-stack</span></div>
      </motion.aside>

      <div className="about-copy absolute left-[clamp(2rem,6vw,4rem)] right-[clamp(2rem,6vw,4rem)] top-1/2 z-20 -translate-y-1/2 md:left-[clamp(2rem,48vw,57rem)] md:right-[clamp(2rem,12vw,14rem)]">
        <SceneLabel sceneId="about" className="mb-7" />
        <h1 id="about-title" className="max-w-[12ch] text-[clamp(3.1rem,5vw,6.2rem)] font-semibold leading-[0.91] tracking-[-0.075em] text-[var(--foreground)]">
          <span className="about-line block overflow-hidden pb-[0.06em] -mb-[0.06em]"><span className="block">Curious by default.</span></span>
          <span className="about-line block overflow-hidden pb-[0.06em] -mb-[0.06em]"><span className="block text-[var(--accent)]">Intentional by choice.</span></span>
        </h1>
        <svg aria-hidden="true" className="about-underline" viewBox="0 0 240 22" fill="none" preserveAspectRatio="none">
          <path d="M3 15C46 7 96 4 141 6c33 1.6 62 4.3 95 1.6M18 19c52-5 118-7 176-3" pathLength={1} stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div className="about-text mt-7 max-w-[43rem] space-y-4 text-[clamp(0.95rem,1.12vw,1.1rem)] leading-[1.58] text-[var(--muted)]">
          <p>Software Engineering undergraduate at the University of Moratuwa, with professional experience building full-stack applications.</p>
          <p>I work with Java, Spring Boot, React, Next.js, Node.js, and PostgreSQL to build maintainable products, from REST APIs and authentication to real-time systems and cloud deployment.</p>
        </div>
        <div className="about-actions mt-8 flex flex-wrap items-center gap-3">
          <a data-magnetic href={profile.resume} download="DISHAN_BASHITHA.pdf" className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--accent)]">Download résumé ↗</a>
          <a href={`mailto:${profile.email}`} className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">Get in touch</a>
        </div>
      </div>

      <div className="about-footer absolute bottom-[clamp(4.8rem,10svh,7.5rem)] left-[clamp(2rem,6vw,4rem)] right-[clamp(2rem,6vw,4rem)] z-20 flex flex-wrap gap-x-8 gap-y-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] md:left-[clamp(2rem,14vw,15rem)] md:right-[clamp(2rem,12vw,14rem)]">
        <span>Software Engineer</span><span>Full Stack Development</span><span>AI / Product / Creative Technology</span>
      </div>
    </Scene>
  );
}
