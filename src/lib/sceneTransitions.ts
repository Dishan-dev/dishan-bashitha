import { gsap } from "gsap";

const order = ["intro", "about", "work", "skills", "experience", "contact"] as const;
type Effect = "portrait" | "gallery" | "editorial" | "thread" | "closing";
const adjacent: Effect[] = ["portrait", "gallery", "editorial", "thread", "closing"];

export function sceneConnection(from: string, to: string) {
  const fromIndex = order.indexOf(from as (typeof order)[number]);
  const toIndex = order.indexOf(to as (typeof order)[number]);
  const reverse = fromIndex > toIndex;
  const adjacentScenes = fromIndex >= 0 && toIndex >= 0 && Math.abs(fromIndex - toIndex) === 1;
  const effect: Effect = adjacentScenes ? adjacent[Math.min(fromIndex, toIndex)] : "editorial";
  return { reverse, effect };
}

type ConnectionOptions = {
  lower: HTMLElement;
  upper: HTMLElement;
  ornament: HTMLElement;
  effect: Effect;
  compact: boolean;
};

export function createSceneConnection({ lower, upper, ornament, effect, compact }: ConnectionOptions) {
  const lowerSurface = lower.querySelector<HTMLElement>("[data-frame-surface]")!;
  const upperSurface = upper.querySelector<HTMLElement>("[data-frame-surface]")!;
  const depth = compact ? 0.4 : 1;
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  gsap.set(lower, { zIndex: 1 });
  gsap.set(upper, { zIndex: 2 });
  gsap.set(ornament, { autoAlpha: 0 });
  const offsets: Record<Effect, { x: number; y: number; scale: number }> = {
    portrait: { x: 0, y: 18, scale: 1.035 },
    gallery: { x: 26, y: 0, scale: 1.05 },
    editorial: { x: 20, y: 0, scale: 1.025 },
    thread: { x: 0, y: 16, scale: 1.025 },
    closing: { x: 0, y: 22, scale: 1.04 },
  };
  const { x, y, scale } = offsets[effect];
  tl.fromTo(upperSurface,
    { x: x * depth, y: y * depth, scale, opacity: 0.72 },
    { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.9, clearProps: "transform,opacity" }, 0)
    .fromTo(lowerSurface,
      { x: 0, y: 0, scale: 1, opacity: 1 },
      { x: -x * depth * 0.45, y: -y * depth * 0.5, scale: 0.985, opacity: 0.25, duration: 0.9 }, 0);
  return tl;
}
