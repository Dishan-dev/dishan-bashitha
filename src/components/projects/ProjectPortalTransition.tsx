"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type PortalBounds = { left: number; top: number; width: number; height: number };
export const PROJECT_PORTAL_REVEAL_DELAY = 0;

/**
 * Animate the actual selected screenshot's geometry into a case-study canvas.
 * The same image remains visible while the viewer mounts underneath it;
 * no fullscreen wipe, star curtain, or unrelated decorative flash.
 */
export function ProjectPortalTransition({
  origin, image, title,
}: {
  origin: PortalBounds;
  image: string;
  title: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion) {
      const frame = requestAnimationFrame(() => setFinished(true));
      return () => cancelAnimationFrame(frame);
    }
    const el = root.current;
    if (!el) return;
    const margin = Math.min(72, window.innerWidth * 0.055);
    const target = {
      left: margin,
      top: Math.max(82, window.innerHeight * 0.11),
      width: window.innerWidth - margin * 2,
      height: Math.min(window.innerHeight * 0.74, (window.innerWidth - margin * 2) * 0.7),
    };
    const timeline = gsap.timeline({ onComplete: () => setFinished(true) });
    gsap.set(el, { left: origin.left, top: origin.top, width: origin.width,
      height: origin.height, borderRadius: 12, transformOrigin: "center" });
    timeline.to(el, { ...target, borderRadius: 18, duration: 0.85,
      ease: "power3.inOut" })
      .to(el, { autoAlpha: 0, scale: 1.025, duration: 0.26, ease: "power2.out" }, 0.74);
    return () => timeline.kill();
  }, [origin, reduceMotion]);

  if (finished || reduceMotion) return null;
  return createPortal(
    <div ref={root} aria-hidden="true" style={{
      position: "fixed", zIndex: 800, overflow: "hidden", pointerEvents: "none",
      background: "var(--surface)", border: "1px solid var(--border)",
      boxShadow: "0 35px 110px #130b2444",
    }}>
      <Image src={image} alt={title} fill sizes="100vw" unoptimized
        style={{ objectFit: "contain" }} />
    </div>,
    document.body,
  );
}
