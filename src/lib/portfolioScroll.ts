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
// Wheel input is scaled by this; pinned sequences make scrolling a touch heavier while they run.
let wheelWeight = 1;
export const setScrollWeight = (weight: number) => { wheelWeight = weight; };
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
  lenis = new Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false,
    virtualScroll: data => { data.deltaY *= wheelWeight; data.deltaX *= wheelWeight; return true; } });
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

// True while a scripted journey (nav link, arrows, Bit's tour) is under way; scroll brakes stand aside.
let travelling = false;
let travelTimer = 0;
export const isTravelling = () => travelling;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutQuint = (t: number) => t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;

export function scrollToY(top: number, { immediate = false, onComplete: done }: { immediate?: boolean; onComplete?: () => void } = {}) {
  const distance = Math.abs(top - window.scrollY);
  travelling = true;
  window.clearTimeout(travelTimer);
  // A fallback in case a journey is interrupted and never reports completion.
  travelTimer = window.setTimeout(() => { travelling = false; }, 2400);
  const onComplete = () => { travelling = false; window.clearTimeout(travelTimer); done?.(); };
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

/**
 * Stops a hurried scroll at a resting point: input pauses while the page eases there, then a
 * short beat absorbs the rest of the flick before scrolling resumes.
 */
export function brakeTo(top: number) {
  if (!lenis) { window.scrollTo({ top, behavior: "smooth" }); return; }
  const smooth = lenis;
  travelling = true;
  window.clearTimeout(travelTimer);
  smooth.stop();
  smooth.scrollTo(top, { duration: 0.75, easing: easeOutCubic, force: true, onComplete: () => {
    travelTimer = window.setTimeout(() => {
      travelling = false;
      if (!document.documentElement.classList.contains("scroll-locked")) smooth.start();
    }, 220);
  } });
}

export function scrollToScene(id: string, options?: Parameters<typeof scrollToY>[1]) {
  const scene = sceneGeometryFor(id);
  if (scene) scrollToY(scene.rest, options);
  else options?.onComplete?.();
}
