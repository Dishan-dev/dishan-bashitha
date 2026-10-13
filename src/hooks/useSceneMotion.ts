"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { portfolioMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/** Native scrolling is the only scroll controller. These timelines just observe it. */
export function useSceneMotion(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const scene = root.current;
    if (!scene) return;
    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 1024px) and (min-height: 601px)",
      compact: "(max-width: 1023px), (max-height: 600px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, context => {
      if (context.conditions?.reduced) return;
      const compact = context.conditions?.compact;
      const scroller = compact ? scene.closest<HTMLElement>("[data-frame-surface]") : scene;
      if (!scroller) return;
      scene.querySelectorAll<HTMLElement>("[data-scroll-depth]").forEach(element => {
        const distance = Number(element.dataset.scrollDepth) || 30;
        gsap.fromTo(element, { y: distance * (compact ? 0.25 : 1) }, {
          y: -distance * (compact ? 0.25 : 1), ease: "none",
          scrollTrigger: { trigger: element, scroller, start: "clamp(top bottom)", end: "bottom top", scrub: portfolioMotion.scrub },
        });
      });
      scene.querySelectorAll<HTMLElement>("[data-scroll-line]").forEach(element => {
        gsap.fromTo(element, { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top",
          scrollTrigger: { trigger: element.parentElement, scroller, start: "top 80%", end: "bottom 60%", scrub: true },
        });
      });
      // Details stay readable; only the visual's outer camera responds to scroll.
      scene.querySelectorAll<HTMLElement>("[data-scroll-camera]").forEach(element => {
        if (!compact) return;
        gsap.fromTo(element, { scale: compact ? 1 : 0.94, rotationX: compact ? 0 : 5 }, {
          scale: 1, rotationX: 0, ease: "none", transformPerspective: 1400,
          scrollTrigger: { trigger: element, scroller, start: "clamp(top 95%)", end: "top 20%", scrub: portfolioMotion.scrub },
        });
      });
      const cleanups: Array<() => void> = [];
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        scene.querySelectorAll<HTMLElement>("[data-magnetic]").forEach(element => {
          const x = gsap.quickTo(element, "x", { duration: 0.4, ease: "power3.out" });
          const y = gsap.quickTo(element, "y", { duration: 0.4, ease: "power3.out" });
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
      // Font loading, filter expansion, and responsive content can change the scene height.
      let refreshFrame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      Array.from(scene.children).forEach(child => observer.observe(child));
      return () => { observer.disconnect(); cancelAnimationFrame(refreshFrame); cleanups.forEach(cleanup => cleanup()); };
    }, scene);
    return () => media.revert();
  }, [root]);
}
