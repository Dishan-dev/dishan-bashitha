"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { compactQuery, reducedQuery, stackedQuery } from "@/lib/motion";
import { sceneGeometryFor } from "@/lib/portfolioScroll";

gsap.registerPlugin(ScrollTrigger);

type Phase = { start?: number; end?: number };
type PhaseOptions = Phase & {
  /** Compact screens animate each element as it enters instead; false keeps it still. */
  compact?: gsap.TweenVars | false;
};

export type SceneMotionApi = {
  scene: HTMLElement;
  stacked: boolean;
  select: <T extends HTMLElement = HTMLElement>(selector: string) => T[];
  /** Scrubbed from these values to the authored layout while the frame rises into view. */
  enter: (targets: gsap.TweenTarget, from: gsap.TweenVars, options?: PhaseOptions) => void;
  /** Scrubbed away from the authored layout while the next frame covers this one (desktop only). */
  exit: (targets: gsap.TweenTarget, to: gsap.TweenVars, options?: Phase) => void;
  /** A scrubbed range across the scene's own pinned sequence, between arrival and rest. */
  hold: (animation: gsap.core.Animation, options?: Phase) => ScrollTrigger | undefined;
};
export type Choreography = (api: SceneMotionApi) => void;

let refreshFrame = 0;
/** Many observers can report the same font or image change; refresh once per frame. */
export function scheduleRefresh() {
  cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
}

const toArray = (targets: gsap.TweenTarget) => gsap.utils.toArray<HTMLElement>(targets).filter(Boolean);

/** Perspective and origin are fixed properties of a move, never values to scrub between. */
function staticVars(targets: gsap.TweenTarget, { transformPerspective, transformOrigin, ...vars }: gsap.TweenVars) {
  if (transformPerspective !== undefined || transformOrigin !== undefined) {
    gsap.set(targets, { ...(transformPerspective !== undefined && { transformPerspective }), ...(transformOrigin !== undefined && { transformOrigin }) });
  }
  return vars;
}

/**
 * All scenes share one scroll document. On desktop each frame sticks while the next one
 * slides over it, so ranges are derived from layout offsets rather than stuck positions.
 */
export function useSceneMotion(root: RefObject<HTMLElement | null>, choreography?: Choreography) {
  useLayoutEffect(() => {
    const scene = root.current;
    const frame = scene?.closest<HTMLElement>("[data-scene-frame]");
    if (!scene || !frame) return;
    const id = frame.dataset.sceneFrame ?? scene.id;
    const surface = frame.querySelector<HTMLElement>("[data-scene-surface]");
    const shade = frame.querySelector<HTMLElement>("[data-scene-shade]");
    const isLast = !frame.nextElementSibling;
    const media = gsap.matchMedia();

    media.add({ stacked: stackedQuery, compact: compactQuery, reduced: reducedQuery }, context => {
      if (context.conditions?.reduced) return;
      const stacked = Boolean(context.conditions?.stacked);
      const viewport = () => window.innerHeight;
      const geometry = () => sceneGeometryFor(id) ?? { top: 0, height: viewport(), rest: 0 };
      const between = (from: () => number, to: () => number, { start = 0, end = 1 }: Phase = {}) => ({
        start: () => from() + (to() - from()) * start,
        end: () => from() + (to() - from()) * end,
      });
      const enterRange = (phase?: Phase) => between(() => geometry().top - viewport(), () => geometry().top, phase);
      const exitRange = (phase?: Phase) => between(() => geometry().top + geometry().height - viewport(), () => geometry().top + geometry().height, phase);
      const scrub = stacked ? true : 0.5;

      const api: SceneMotionApi = {
        scene,
        stacked,
        select: selector => Array.from(scene.querySelectorAll(selector)),
        enter: (targets, from, options = {}) => {
          if (stacked) {
            if (geometry().top <= 0) return;
            const vars = staticVars(targets, from);
            gsap.from(targets, { ...vars, ease: vars.ease ?? "none", scrollTrigger: { ...enterRange(options), scrub, invalidateOnRefresh: true } });
            return;
          }
          const compactFrom = options.compact;
          if (compactFrom === false) return;
          toArray(targets).forEach(element => {
            const vars = staticVars(element, compactFrom ?? from);
            gsap.from(element, { ...vars, ease: "none", scrollTrigger: { trigger: element, start: "top 94%", end: "top 62%", scrub, invalidateOnRefresh: true } });
          });
        },
        exit: (targets, to, options) => {
          if (!stacked || isLast) return;
          const vars = staticVars(targets, to);
          gsap.to(targets, { ...vars, ease: vars.ease ?? "none", scrollTrigger: { ...exitRange(options), scrub, invalidateOnRefresh: true } });
        },
        hold: (animation, phase) => {
          if (!stacked) return undefined;
          return ScrollTrigger.create({
            animation, scrub, invalidateOnRefresh: true,
            ...between(() => geometry().top, () => geometry().rest, phase),
          });
        },
      };

      // Every frame recedes beneath its successor, so sections read as one continuous space.
      if (stacked && surface) gsap.set(surface, { transformPerspective: 2200, transformOrigin: "50% 0%" });
      if (stacked && surface && !isLast) {
        gsap.to(surface, { scale: 0.9, yPercent: -2.5, ease: "none", scrollTrigger: { ...exitRange(), scrub, invalidateOnRefresh: true } });
        if (shade) gsap.fromTo(shade, { opacity: 0 }, { opacity: 0.62, ease: "none", scrollTrigger: { ...exitRange(), scrub, invalidateOnRefresh: true } });
      }
      // ...and arrives on a shallow tilt that flattens just as it settles.
      if (stacked && surface && geometry().top > 0) {
        gsap.from(surface, { rotationX: 5, ease: "none", scrollTrigger: { ...enterRange({ start: 0.15 }), scrub, invalidateOnRefresh: true } });
      }

      scene.querySelectorAll<HTMLElement>("[data-scroll-depth]").forEach(element => {
        const distance = Number(element.dataset.scrollDepth) || 30;
        const range = stacked
          ? between(() => geometry().top - viewport(), () => geometry().top + geometry().height)
          : { trigger: element, start: "clamp(top bottom)", end: "bottom top" };
        gsap.fromTo(element, { y: distance * (stacked ? 1 : 0.25) }, { y: -distance * (stacked ? 1 : 0.25), ease: "none", scrollTrigger: { ...range, scrub, invalidateOnRefresh: true } });
      });
      // Compact screens let the project camera settle as it scrolls in; desktop composes it in place.
      if (!stacked) scene.querySelectorAll<HTMLElement>("[data-scroll-camera]").forEach(element => {
        gsap.fromTo(element, { scale: 0.94, rotationX: 5 }, {
          scale: 1, rotationX: 0, ease: "none", transformPerspective: 1400,
          scrollTrigger: { trigger: element, start: "clamp(top 95%)", end: "top 30%", scrub: 0.5 },
        });
      });

      choreography?.(api);

      const cleanups: Array<() => void> = [];
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        // Magnetic pull uses the independent CSS translate property, leaving transforms to scroll.
        scene.querySelectorAll<HTMLElement>("[data-magnetic]").forEach(element => {
          gsap.set(element, { "--magnet-x": "0px", "--magnet-y": "0px" });
          const x = gsap.quickTo(element, "--magnet-x", { duration: 0.4, ease: "power3.out" });
          const y = gsap.quickTo(element, "--magnet-y", { duration: 0.4, ease: "power3.out" });
          let bounds: DOMRect;
          const enter = () => { bounds = element.getBoundingClientRect(); };
          const move = (event: PointerEvent) => {
            if (!bounds || event.pointerType !== "mouse") return;
            x(Math.max(-5, Math.min(5, (event.clientX - bounds.left - bounds.width / 2) * 0.08)));
            y(Math.max(-4, Math.min(4, (event.clientY - bounds.top - bounds.height / 2) * 0.1)));
          };
          const reset = () => { x(0); y(0); };
          element.addEventListener("pointerenter", enter);
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", reset);
          element.addEventListener("blur", reset);
          cleanups.push(() => {
            element.removeEventListener("pointerenter", enter);
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", reset);
            element.removeEventListener("blur", reset);
          });
        });
      }
      // Font loading, filter changes, and responsive content can change frame heights.
      const observer = new ResizeObserver(scheduleRefresh);
      observer.observe(frame);
      return () => { observer.disconnect(); cleanups.forEach(cleanup => cleanup()); };
    }, scene);
    return () => media.revert();
  }, [root, choreography]);
}
