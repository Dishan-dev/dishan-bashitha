import { gsap } from "gsap";

const order = ["intro", "about", "work", "skills", "experience", "contact"];
const connections = ["portrait", "portrait", "gallery", "fold", "thread", "orbit"] as const;

/** A connection has the same geometry in either direction, including direct jumps. */
export function sceneConnection(from: string, to: string) {
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  return { reverse: fromIndex > toIndex, effect: connections[Math.max(0, fromIndex, toIndex)] };
}

type ConnectionOptions = {
  lower: HTMLElement;
  upper: HTMLElement;
  ornament: HTMLElement;
  effect: ReturnType<typeof sceneConnection>["effect"];
  compact: boolean;
};

/** Build a forward story once. Back navigation plays this exact timeline backwards. */
export function createSceneConnection({ lower, upper, ornament, effect, compact }: ConnectionOptions) {
  const lowerSurface = lower.querySelector<HTMLElement>("[data-frame-surface]")!;
  const upperSurface = upper.querySelector<HTMLElement>("[data-frame-surface]")!;
  const rings = ornament.querySelectorAll("[data-connection-ring]");
  const line = ornament.querySelector("[data-connection-line]");
  const star = ornament.querySelector("[data-connection-star]");
  const depth = compact ? 0.35 : 1;
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });
  gsap.set(lower, { zIndex: 1 });
  gsap.set(upper, { zIndex: 2 });
  gsap.set(ornament, { opacity: 0 });
  gsap.set([rings, line, star], { opacity: 0 });

  if (effect === "portrait") {
    // The portrait's circular motif becomes the opening into the biography.
    const portrait = lower.querySelector('img[alt="Dishan Bashitha"]');
    const bounds = portrait?.getBoundingClientRect();
    const frame = lower.getBoundingClientRect();
    const x = bounds ? gsap.utils.clamp(25, 80, (bounds.x + bounds.width / 2 - frame.x) / frame.width * 100) : 72;
    const y = 52;
    gsap.set(ornament, { left: `${x}%`, top: `${y}%` });
    gsap.set(rings, { opacity: 1 });
    tl.fromTo(upper, { clipPath: `circle(0% at ${x}% ${y}%)` }, { clipPath: `circle(145% at ${x}% ${y}%)`, duration: 1 }, 0.08)
      .fromTo(upperSurface, { scale: 1.22, rotation: -5 * depth }, { scale: 1, rotation: 0, duration: 1.2 }, 0)
      .fromTo(lowerSurface, { scale: 1, rotation: 0 }, { scale: 0.82, rotation: 5 * depth, duration: 1.1 }, 0)
      .fromTo(rings, { scale: 0.1, rotationX: 55 }, { scale: 14, rotationX: 0, stagger: 0.055, duration: 0.95 }, 0.08);
  } else if (effect === "gallery") {
    // A floating project-sized card turns towards the camera and becomes the page.
    gsap.set(ornament, { left: "50%", top: "50%" });
    gsap.set(star, { opacity: 1 });
    tl.fromTo(upper, { clipPath: "inset(29% 27% 29% 27% round 36px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.85 }, 0.35)
      .fromTo(upperSurface, { scale: 0.62, rotationY: -42 * depth, rotationZ: -9 * depth, xPercent: 18 }, { scale: 1, rotationY: 0, rotationZ: 0, xPercent: 0, duration: 1.2 }, 0)
      .fromTo(upperSurface, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power1.out" }, 0)
      .fromTo(lowerSurface, { scale: 1, xPercent: 0, rotationY: 0, opacity: 1 }, { scale: 0.8, xPercent: -14, rotationY: 24 * depth, opacity: 0.25, duration: 1 }, 0)
      .fromTo(star, { scale: 0.3, rotation: -60 }, { scale: 2.4, rotation: 90, duration: 1.05 }, 0);
  } else if (effect === "fold") {
    // Products open like a cover to expose the technology stack behind them.
    gsap.set(lowerSurface, { transformOrigin: "0% 50%" });
    gsap.set(upperSurface, { transformOrigin: "100% 50%" });
    gsap.set(ornament, { left: "50%", top: "50%" });
    gsap.set(line, { opacity: 1, height: "100vh" });
    tl.fromTo(lowerSurface, { rotationY: 0, scale: 1, xPercent: 0, opacity: 1 }, { rotationY: -65 * depth, scale: 0.88, xPercent: -26, opacity: 0, duration: 1.15 }, 0)
      .fromTo(upper, { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.05 }, 0.15)
      .fromTo(upperSurface, { rotationY: 65 * depth, scale: 0.88, xPercent: 24 }, { rotationY: 0, scale: 1, xPercent: 0, duration: 1.2 }, 0)
      .fromTo(line, { x: window.innerWidth / 2, scaleY: 0.2, rotation: 12 }, { x: -window.innerWidth / 2, scaleY: 1.2, rotation: 0, duration: 1.1 }, 0.05);
  } else if (effect === "thread") {
    // A skill-column rule grows into the spine of the experience timeline.
    gsap.set(ornament, { left: "32%", top: "50%" });
    gsap.set(line, { opacity: 1, height: "100vh" });
    gsap.set(star, { opacity: 1 });
    tl.fromTo(lowerSurface, { scale: 1, rotationX: 0, opacity: 1 }, { scale: 0.87, rotationX: 12 * depth, opacity: 0.2, duration: 1.1 }, 0)
      .fromTo(upper, { clipPath: "inset(50% 68% 50% 32% round 4px)" }, { clipPath: "inset(8% 67.9% 8% 32% round 4px)", duration: 0.38 }, 0)
      .to(upper, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.82 }, 0.38)
      .fromTo(upperSurface, { scale: 1.13, xPercent: -4 }, { scale: 1, xPercent: 0, duration: 1.2 }, 0)
      .fromTo(line, { scaleY: 0, scaleX: 1 }, { scaleY: 0.84, scaleX: 1, duration: 0.38 }, 0)
      .to(line, { scaleY: 1, opacity: 0, duration: 0.55 }, 0.38)
      .fromTo(star, { scale: 0, rotation: 0 }, { scale: 0.55, rotation: 180, duration: 0.85 }, 0);
  } else {
    // The timeline's orbit becomes a tunnel into the invitation to connect.
    gsap.set(ornament, { left: "68%", top: "54%" });
    gsap.set(rings, { opacity: 1 });
    gsap.set(star, { opacity: 1 });
    tl.fromTo(lowerSurface, { scale: 1, rotationZ: 0, opacity: 1 }, { scale: 1.24, rotationZ: -7 * depth, opacity: 0.25, duration: 1.2 }, 0)
      .fromTo(upper, { clipPath: "ellipse(0% 0% at 68% 54%)" }, { clipPath: "ellipse(110% 140% at 68% 54%)", duration: 0.98 }, 0.22)
      .fromTo(upperSurface, { scale: 0.76, rotationZ: 10 * depth }, { scale: 1, rotationZ: 0, duration: 1.2 }, 0)
      .fromTo(rings, { scale: 0.2, rotationX: 68, rotationZ: -35 }, { scale: 13, rotationX: 0, rotationZ: 40, stagger: 0.06, duration: 0.95 }, 0.05)
      .fromTo(star, { scale: 0, rotation: 0 }, { scale: 2, rotation: 150, duration: 1.1 }, 0);
  }

  tl.fromTo(ornament, { opacity: 0 }, { opacity: 0.8, duration: 0.15, ease: "power1.out" }, 0.06)
    .to(ornament, { opacity: 0, duration: 0.28, ease: "power2.out" }, 0.85);
  return tl;
}
