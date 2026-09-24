"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Image from "next/image";
import { Scene } from "@/components/portfolio/Scene";

const editorialEase = [0.22, 1, 0.36, 1] as const;

export function AboutScene() {
  const reduceMotion = useReducedMotion();

  return (
    <Scene id="about" eyebrow="" className="relative isolate overflow-hidden p-0">
      <div aria-hidden="true" className="absolute left-[11%] top-[18%] h-[min(31vw,28rem)] w-[min(31vw,28rem)] rounded-full bg-[var(--accent-soft)]" />
      <div aria-hidden="true" className="absolute bottom-[9%] right-[8%] h-[min(18vw,15rem)] w-[min(18vw,15rem)] rounded-full border border-[var(--accent)]/15" />

      <motion.aside
        initial={reduceMotion ? false : { y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.8, ease: editorialEase, delay: reduceMotion ? 0 : 0.12 }}
        className="absolute left-[clamp(2rem,14vw,15rem)] top-1/2 z-10 hidden h-[min(42svh,30rem)] w-[min(22vw,24rem)] min-w-[15rem] -translate-y-1/2 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-4 shadow-[0_20px_50px_rgba(49,36,77,0.08)] md:block"
      >
        <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">DB / ’26</span>
        <div aria-hidden="true" className="absolute inset-x-[12%] bottom-0 top-[18%] rounded-t-[8rem] bg-[var(--accent-soft)]" />
        <div aria-hidden="true" className="absolute inset-x-[16%] bottom-[18%] top-[25%] rounded-full border border-[var(--accent)]/30" />
        <Image src="/images/myphoto.png" alt="Dishan Bashitha" width={6000} height={3375} sizes="(min-width: 768px) 60rem, 100vw" quality={100} className="absolute bottom-[-2%] left-1/2 z-10 h-[118%] w-auto max-w-none -translate-x-1/2" priority />
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]"><span>Dishan Bashitha</span><span>Full-stack</span></div>
      </motion.aside>

      <motion.main
        initial={reduceMotion ? false : { y: 42, clipPath: "inset(0 0 100% 0)" }}
        animate={{ y: 0, clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduceMotion ? 0 : 0.9, ease: editorialEase, delay: reduceMotion ? 0 : 0.18 }}
        className="absolute left-[clamp(2rem,6vw,4rem)] right-[clamp(2rem,6vw,4rem)] top-1/2 z-20 -translate-y-1/2 md:left-[clamp(2rem,48vw,57rem)] md:right-[clamp(2rem,12vw,14rem)]"
      >
        <div className="mb-7 flex items-center gap-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          <span className="text-[var(--foreground)]">(01)</span><span>About</span><span className="h-px w-8 bg-[var(--border)]" /><span>Moratuwa, Sri Lanka</span>
        </div>
        <h1 id="about-title" className="max-w-[12ch] text-[clamp(3.1rem,5vw,6.2rem)] font-semibold leading-[0.91] tracking-[-0.075em] text-[var(--foreground)]">
          Curious by default. <span className="text-[var(--accent)]">Intentional by choice.</span>
        </h1>
        <div className="mt-7 max-w-[43rem] space-y-4 text-[clamp(0.95rem,1.12vw,1.1rem)] leading-[1.58] text-[var(--muted)]">
          <p>Full-stack software engineer focused on building scalable systems and polished digital experiences.</p>
          <p>I combine backend engineering, modern frontend development, AI integrations, and thoughtful design to turn ideas into reliable products.</p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="mailto:dshnz029@gmail.com?subject=Resume%20request" className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--accent)]">Request resume ↗</a>
          <a href="mailto:hello@dishanbashitha.com" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">Get in touch</a>
        </div>
      </motion.main>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.65, ease: editorialEase, delay: reduceMotion ? 0 : 0.58 }}
        className="absolute bottom-[clamp(4.8rem,10svh,7.5rem)] left-[clamp(2rem,6vw,4rem)] right-[clamp(2rem,6vw,4rem)] z-20 flex flex-wrap gap-x-8 gap-y-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] md:left-[clamp(2rem,14vw,15rem)] md:right-[clamp(2rem,12vw,14rem)]"
      >
        <span>Software Engineer</span><span>Full Stack Development</span><span>AI / Product / Creative Technology</span>
      </motion.div>
    </Scene>
  );
}
