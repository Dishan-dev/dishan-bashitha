"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedQuery, stackedQuery } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/** Layout position of one scene frame, unaffected by sticky stacking. */
export type SceneGeometry = {
  id: string;
  /** Document offset where the frame's layout box begins. */
  top: number;
  height: number;
  /** Scroll offset at which the scene is settled and fully readable. */
  rest: number;
};

let lenis: Lenis | null = null;
const tick = (time: number) => lenis?.raf(time * 1000);

export const isStacked = () => window.matchMedia(stackedQuery).matches;

/**
 * Sticky frames report their stuck position from getBoundingClientRect, so offsets are
 * accumulated from the non-sticky track instead. Taller frames (Projects) hold a pinned
 * sequence; their rest point is where that sequence finishes.
 */
export function sceneGeometry(): SceneGeometry[] {
  const track = document.querySelector<HTMLElement>("[data-scene-track]");
  if (!track) return [];
  const stacked = isStacked();
  const viewport = window.innerHeight;
  let top = track.getBoundingClientRect().top + window.scrollY;
  return Array.from(track.children as HTMLCollectionOf<HTMLElement>, frame => {
    const height = frame.offsetHeight;
    const geometry = { id: frame.dataset.sceneFrame ?? "", top, height, rest: stacked ? top + Math.max(0, height - viewport) : top };
    top += height;
    return geometry;
  });
}

export const sceneGeometryFor = (id: string) => sceneGeometry().find(scene => scene.id === id);

/** One Lenis instance, advanced by GSAP's ticker so ScrollTrigger and smoothing share a frame. */
export function startSmoothScroll() {
  if (lenis) return lenis;
  lenis = new Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopSmoothScroll() {
  gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  gsap.ticker.lagSmoothing(500, 33);
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle("scroll-locked", locked);
}

const easeInOutQuint = (t: number) => t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;

export function scrollToY(top: number, { immediate = false, onComplete }: { immediate?: boolean; onComplete?: () => void } = {}) {
  const distance = Math.abs(top - window.scrollY);
  if (lenis) {
    // Longer journeys take slightly longer, but never become an artificial wait.
    const duration = Math.min(1.9, 0.85 + (distance / window.innerHeight) * 0.16);
    lenis.scrollTo(top, { immediate, duration, easing: easeInOutQuint, force: true, onComplete: () => onComplete?.() });
    if (immediate) onComplete?.();
    return;
  }
  const instant = immediate || window.matchMedia(reducedQuery).matches || distance < 2;
  window.scrollTo({ top, behavior: instant ? "instant" : "smooth" });
  if (instant) onComplete?.();
  else window.addEventListener("scrollend", () => onComplete?.(), { once: true });
}

export function scrollToScene(id: string, options?: Parameters<typeof scrollToY>[1]) {
  const scene = sceneGeometryFor(id);
  if (scene) scrollToY(scene.rest, options);
  else options?.onComplete?.();
}
