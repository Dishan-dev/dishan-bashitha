/** Shared timing for the portfolio's camera moves and editorial reveals. */
export const portfolioMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  reveal: 0.8,
  scene: 1.2,
  stagger: 0.07,
  scrub: 0.65,
  /** GSAP equivalents of the editorial curve: arrivals decelerate, camera moves ease both ways. */
  gsapEase: "expo.out",
  gsapCamera: "power3.inOut",
  /** Shared-element expansion into and out of a case study. */
  expand: 0.95,
};

/** Desktop frames stack and scroll-link only where the composed viewport layouts apply. */
export const desktopQuery = "(min-width: 1024px) and (min-height: 601px)";
export const compactQuery = "(max-width: 1023px), (max-height: 600px)";
export const reducedQuery = "(prefers-reduced-motion: reduce)";
export const motionQuery = "(prefers-reduced-motion: no-preference)";
export const stackedQuery = `${desktopQuery} and (prefers-reduced-motion: no-preference)`;
