"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

type Frame = { key: string; children: ReactNode };
type FrameTransitionProps = { frameKey: string; children: ReactNode };

/** A short dissolve keeps navigation calm while each scene supplies its own motion. */
export function FrameTransition({ frameKey, children }: FrameTransitionProps) {
  const [current, setCurrent] = useState<Frame>({ key: frameKey, children });
  const [previous, setPrevious] = useState<Frame | null>(null);

  if (frameKey === current.key && current.children !== children) setCurrent({ key: frameKey, children });
  if (frameKey !== current.key && previous?.key !== current.key) {
    setPrevious(current);
    setCurrent({ key: frameKey, children });
  }

  useLayoutEffect(() => {
    const surface = document.querySelector<HTMLElement>(`[data-frame-surface="${current.key}"]`);
    if (surface) surface.scrollTop = 0;
  }, [current.key]);

  useLayoutEffect(() => {
    if (!previous) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setPrevious(null));
      return () => window.cancelAnimationFrame(frame);
    }
    const incoming = document.querySelector<HTMLElement>(`[data-frame="${current.key}"]`);
    const incomingSurface = document.querySelector<HTMLElement>(`[data-frame-surface="${current.key}"]`);
    const outgoing = document.querySelector<HTMLElement>(`[data-frame="${previous.key}"]`);
    if (!incoming || !incomingSurface || !outgoing) return;

    const context = gsap.context(() => {
      gsap.set(incoming, { opacity: 0, zIndex: 2 });
      gsap.set(incomingSurface, { scale: 0.995, transformOrigin: "50% 50%" });
      gsap.set(outgoing, { zIndex: 1, pointerEvents: "none" });
      gsap.timeline({ onComplete: () => setPrevious(null) })
        .to(incoming, { opacity: 1, duration: 0.36, ease: "power2.out" }, 0)
        .to(incomingSurface, { scale: 1, duration: 0.42, ease: "power2.out" }, 0);
    });
    return () => context.revert();
  }, [current.key, previous]);

  return (
    <>
      {previous && (
        <div inert aria-hidden="true" data-frame={previous.key} className="absolute inset-0 overflow-hidden bg-[var(--canvas)] p-[clamp(0.45rem,1.2vw,1.1rem)]">
          <div data-frame-surface={previous.key} className="h-full w-full overflow-hidden rounded-[clamp(1.25rem,2.1vw,2rem)] border border-[var(--border)] bg-[var(--background)] shadow-[0_1.5rem_4rem_rgba(32,22,48,0.22)]">
            {previous.children}
          </div>
        </div>
      )}
      <div data-frame={current.key} className="absolute inset-0 overflow-hidden bg-[var(--canvas)] p-[clamp(0.45rem,1.2vw,1.1rem)]">
        <div data-frame-surface={current.key} className="h-full w-full overflow-hidden rounded-[clamp(1.25rem,2.1vw,2rem)] border border-[var(--border)] bg-[var(--background)] shadow-[0_1.5rem_4rem_rgba(32,22,48,0.22)]">
          {current.children}
        </div>
      </div>
    </>
  );
}
