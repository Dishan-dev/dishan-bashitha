"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { portfolioMotion } from "@/lib/motion";
import { createSceneConnection, sceneConnection } from "@/lib/sceneTransitions";
import styles from "./FrameTransition.module.css";

type Frame = { key: string; children: ReactNode; direction: 1 | -1 };
type Props = { frameKey: string; children: ReactNode; direction?: 1 | -1 };

/** Each chapter connection has its own reversible choreography. */
export function FrameTransition({ frameKey, children, direction = 1 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState<Frame>({ key: frameKey, children, direction });
  const [previous, setPrevious] = useState<Frame | null>(null);

  if (frameKey === current.key && current.children !== children) setCurrent({ ...current, children });
  if (frameKey !== current.key) {
    setPrevious(current);
    setCurrent({ key: frameKey, children, direction });
  }

  useLayoutEffect(() => {
    const surface = root.current?.querySelector<HTMLElement>(`[data-frame-surface="${current.key}"]`);
    if (surface) surface.scrollTop = 0;
  }, [current.key]);

  useLayoutEffect(() => {
    if (!previous) return;
    if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setPrevious(null));
      return () => cancelAnimationFrame(frame);
    }
    const incoming = root.current?.querySelector<HTMLElement>(`[data-frame="${current.key}"]`);
    const outgoing = root.current?.querySelector<HTMLElement>(`[data-frame="${previous.key}"]`);
    const ornament = root.current?.querySelector<HTMLElement>("[data-connection-ornament]");
    if (!incoming || !outgoing || !ornament) return;

    const context = gsap.context(() => {
      const compact = window.matchMedia("(max-width: 1023px), (max-height: 600px)").matches;
      const { reverse, effect } = sceneConnection(previous.key, current.key);
      gsap.set(outgoing, { pointerEvents: "none" });
      const timeline = createSceneConnection({ lower: reverse ? incoming : outgoing, upper: reverse ? outgoing : incoming, ornament, effect, compact });
      timeline.duration(portfolioMotion.scene);
      timeline.eventCallback(reverse ? "onReverseComplete" : "onComplete", () => setPrevious(null));
      if (reverse) timeline.reverse(0);
      else timeline.play(0);
    }, root);
    return () => context.revert();
  }, [current.key, current.direction, previous, reduceMotion]);

  // Stable keys preserve the departing scene's selected project/role while it moves.
  return <div ref={root} className={styles.stage} data-transition-direction={current.direction} data-transition-effect={previous ? sceneConnection(previous.key, current.key).effect : undefined}>
    {[...(previous ? [previous] : []), current].map(frame => <div key={frame.key} inert={frame.key !== current.key} aria-hidden={frame.key !== current.key || undefined} data-frame={frame.key} className={styles.frame}>
      <div data-frame-surface={frame.key} className={styles.surface}>{frame.children}</div>
    </div>)}
    {previous && <div data-connection-ornament aria-hidden="true" className={styles.ornament}>
      <svg data-connection-ring className={styles.ring} viewBox="0 0 160 160"><circle cx="80" cy="80" r="79" vectorEffect="non-scaling-stroke" /></svg>
      <svg data-connection-ring className={styles.ring} viewBox="0 0 160 160"><circle cx="80" cy="80" r="79" vectorEffect="non-scaling-stroke" /></svg>
      <span data-connection-line className={styles.line} />
      <svg data-connection-star className={styles.star} viewBox="0 0 100 100"><path d="M50 0C55 30 70 45 100 50C70 55 55 70 50 100C45 70 30 55 0 50C30 45 45 30 50 0Z" /></svg>
    </div>}
  </div>;
}
