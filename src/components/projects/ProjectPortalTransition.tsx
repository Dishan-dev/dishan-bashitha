"use client";

import { createScope, createTimeline } from "animejs";
import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ProjectShowcase.module.css";

export const PROJECT_PORTAL_REVEAL_DELAY = 0.88;

export function ProjectPortalTransition({ origin }: { origin: { x: number; y: number } }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [finished, setFinished] = useState(false);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (finished) return;
    if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setFinished(true));
      return () => cancelAnimationFrame(frame);
    }
    const element = root.current;
    if (!element) return;
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    const size = Math.min(520, window.innerWidth * 0.75);
    if (surface && context) {
      const resolution = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = size * resolution;
      surface.height = size * resolution;
      context.scale(resolution, resolution);
    }
    const particles = window.innerWidth < 768 ? 600 : 1400;
    const time = { value: 0 };
    const draw = () => {
      if (!context) return;
      context.clearRect(0, 0, size, size);
      const phase = time.value * 2.4;
      for (let i = 0; i < particles; i++) {
        const angle = i * 2.399963 + phase * 0.25;
        const band = Math.sin(i * 127.1) * 0.5 + 0.5;
        const ripple = Math.sin(angle * 5 + phase) * 0.025 + Math.sin(angle * 9 - phase * 1.4) * 0.013;
        const radius = size * (0.29 + band * 0.07 + ripple);
        const x = size / 2 + Math.cos(angle) * radius;
        const y = size / 2 + Math.sin(angle) * radius * (0.92 + Math.sin(phase) * 0.04);
        const glow = 0.25 + band * 0.65;
        context.fillStyle = `hsla(${265 + band * 25}, 85%, ${58 + band * 30}%, ${glow})`;
        context.beginPath();
        context.arc(x, y, 0.4 + band * 1.1, 0, Math.PI * 2);
        context.fill();
      }
    };
    draw();
    const coverScale = Math.hypot(window.innerWidth, window.innerHeight) / 160 * 5;
    const scope = createScope({ root }).add(() => {
      createTimeline({ onComplete: () => setFinished(true) })
        .add("[data-portal-curtain]", { scale: [0, coverScale], rotate: [0, 90], duration: 780, ease: "inOut(4)" }, 0)
        .add("[data-portal-orb]", { scale: [0.2, 1], opacity: [0, 1], duration: 600, ease: "out(3)" }, 170)
        .add(time, { value: [0, 1], duration: 1250, ease: "linear", onUpdate: draw }, 0)
        .add("[data-portal-orb]", { scale: 2.5, opacity: 0, duration: 440, ease: "in(3)" }, 740)
        .add(element, { opacity: [1, 0], duration: 340, ease: "out(3)" }, 930);
    });
    return () => scope.revert();
  }, [finished, reduceMotion, origin.x, origin.y]);

  if (finished || reduceMotion) return null;
  return createPortal(
    <div ref={root} aria-hidden="true" className={styles.portalTransition} style={{ "--portal-x": `${origin.x}%`, "--portal-y": `${origin.y}%` } as CSSProperties}>
      <svg data-portal-curtain className={styles.portalCurtain} viewBox="0 0 100 100"><path d="M50 0C55 30 70 45 100 50C70 55 55 70 50 100C45 70 30 55 0 50C30 45 45 30 50 0Z" fill="var(--background)" /></svg>
      <div data-portal-orb className={styles.portalOrb}>
        <canvas ref={canvas} className={styles.portalParticles} />
        <svg className={styles.portalStar} viewBox="0 0 100 100"><path d="M50 0C55 30 70 45 100 50C70 55 55 70 50 100C45 70 30 55 0 50C30 45 45 30 50 0Z" fill="currentColor" /></svg>
      </div>
    </div>, document.body,
  );
}
