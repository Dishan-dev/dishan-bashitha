"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";
import { motionQuery } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export type FlowSetup = (root: HTMLElement) => void | (() => void);

/**
 * Runs a section's choreography only while motion is allowed. Everything it creates is
 * reverted together, so the settled layout underneath is always complete on its own.
 */
export function useFlowMotion(root: RefObject<HTMLElement | null>, setup: FlowSetup) {
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia(element);
    media.add(motionQuery, () => setup(element));
    return () => media.revert();
  }, [root, setup]);
}

/** Phones show the hero and contact frames edge to edge, so those frames only resize above this. */
export const framedQuery = "(min-width: 721px)";

/** Runs part of a choreography only while `query` matches; the returned function undoes it. */
export function whileMatching(query: string, setup: () => void) {
  const media = gsap.matchMedia();
  media.add(query, setup);
  return () => media.revert();
}

export const all = (root: Element, selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
export const one = (root: Element, selector: string) => root.querySelector<HTMLElement>(selector);
