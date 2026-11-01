"use client";

import { useEffect, useRef } from "react";
import styles from "./Flow.module.css";

const lines: Record<string, string> = {
  home: "Hi, I’m Bit, Dishan’s guide. Scroll to explore!",
  about: "That’s Dishan. Try swinging the badge!",
  experience: "Keep scrolling to flip through the journey.",
  education: "Always learning: three chapters so far.",
  projects: "Click a project to open its case study.",
  contact: "Got an idea? Let’s build it together!",
};
const waving = new Set(["home", "contact"]);

/**
 * A small guide that travels with the reader. It hops and speaks when a new section arrives,
 * its eyes follow the pointer, and clicking it moves on to the next section.
 */
export function Companion({ active, hidden, onNext }: { active: string; hidden: boolean; onNext: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const look = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = element.getBoundingClientRect();
        const dx = event.clientX - (bounds.right - 40);
        const dy = event.clientY - (bounds.bottom - 50);
        const length = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, length / 240) * 3;
        element.style.setProperty("--look-x", `${(dx / length) * reach}px`);
        element.style.setProperty("--look-y", `${(dy / length) * reach}px`);
      });
    };
    window.addEventListener("pointermove", look, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", look); };
  }, []);

  return (
    <div ref={root} className={styles.companion} data-hidden={hidden ? "true" : undefined} data-waving={waving.has(active) ? "true" : undefined}>
      <p key={`line-${active}`} className={styles.bubble} aria-hidden="true">{lines[active] ?? lines.home}</p>
      <button type="button" className={styles.bot} onClick={onNext} aria-label={active === "contact" ? "Back to the top" : "Go to the next section"}>
        <span key={active} className={styles.botHop}>
          <svg viewBox="0 0 80 100" aria-hidden="true">
            <defs>
              <linearGradient id="bit-shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a58bff" /><stop offset="1" stopColor="#5b2be0" /></linearGradient>
              <radialGradient id="bit-glow"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#cbbcff" stopOpacity="0" /></radialGradient>
            </defs>
            <ellipse className={styles.botShadow} cx="40" cy="96" rx="20" ry="3.5" />
            <line x1="40" y1="16" x2="40" y2="6" stroke="#cbbcff" strokeWidth="2.5" strokeLinecap="round" />
            <circle className={styles.botTip} cx="40" cy="5" r="4.5" fill="url(#bit-glow)" />
            <g className={styles.botArmLeft}><rect x="12" y="66" width="8" height="20" rx="4" fill="#6b3cf2" /></g>
            <g className={styles.botArmRight}><rect x="60" y="66" width="8" height="20" rx="4" fill="#6b3cf2" /></g>
            <rect x="22" y="62" width="36" height="28" rx="11" fill="url(#bit-shell)" />
            <circle cx="40" cy="75" r="4" fill="#e9dcff" opacity=".85" />
            <rect x="9" y="16" width="62" height="48" rx="19" fill="url(#bit-shell)" />
            <rect x="16" y="24" width="48" height="32" rx="13" fill="#140a3a" />
            <g className={styles.botEyes}>
              <ellipse cx="31" cy="39" rx="5" ry="6.5" fill="#cbbcff" />
              <ellipse cx="49" cy="39" rx="5" ry="6.5" fill="#cbbcff" />
              <circle cx="32.5" cy="37" r="1.6" fill="#fff" />
              <circle cx="50.5" cy="37" r="1.6" fill="#fff" />
            </g>
            <path d="M34 49c3.5 3 8.5 3 12 0" fill="none" stroke="#cbbcff" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="22" cy="47" r="2.6" fill="#ff8fd0" opacity=".55" />
            <circle cx="58" cy="47" r="2.6" fill="#ff8fd0" opacity=".55" />
          </svg>
        </span>
      </button>
    </div>
  );
}
