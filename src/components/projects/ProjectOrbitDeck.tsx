"use client";

import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import type { Project } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ProjectShowcase.module.css";

type Props = {
  projects: readonly Project[];
  activeIndex: number;
  direction: RefObject<number>;
  progress: number;
  onSelect: (index: number) => void;
  onStep: (step: number) => void;
  onOpen: () => void;
};

const compactQuery = "(max-width: 600px)";
const subscribeCompact = (listener: () => void) => {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};

function getPosition(index: number, activeIndex: number, length: number) {
  const offset = (index - activeIndex + length) % length;
  return offset > length / 2 ? offset - length : offset;
}

/** The same physical cards move around the stage instead of remounting as slides. */
export function ProjectOrbitDeck({ projects, activeIndex, direction, progress, onSelect, onStep, onOpen }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const hasPositioned = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const reduceMotion = useReducedMotion();
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia(compactQuery).matches, () => false);

  // Wheel progress changes actual card positions, not just an overlay's opacity.
  // At 0 cards are a spatial collage; at 1 they compose the original orbit layout.
  useLayoutEffect(() => {
    const cards = root.current?.querySelectorAll<HTMLElement>("[data-orbit-card]");
    if (!cards) return;
    const reduced = reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px) and (min-height: 601px)").matches;
    const assembly = reduced || !desktop ? 1 : Math.max(0, Math.min(1, progress));
    const eased = assembly * assembly * (3 - 2 * assembly);
    const collage = [
      { x: -53, y: -28, z: -170, rotateY: -23, rotateZ: -11, scale: 0.83 },
      { x: 47, y: -24, z: -80, rotateY: 21, rotateZ: 8, scale: 0.88 },
      { x: -39, y: 35, z: 40, rotateY: -14, rotateZ: 7, scale: 0.76 },
      { x: 52, y: 31, z: -230, rotateY: 25, rotateZ: -9, scale: 0.81 },
    ];
    cards.forEach((element, index) => {
      const position = getPosition(index, activeIndex, projects.length);
      const distance = Math.abs(position);
      const side = Math.sign(position);
      const orbit = {
        x: side * (distance === 1 ? (compact ? 68 : 60) : 95),
        y: distance === 0 ? 0 : distance === 1 ? 12 : 30,
        z: distance === 0 ? 0 : distance === 1 ? (compact ? -150 : -220) : -480,
        rotateY: side * (distance === 1 ? (compact ? -38 : -58) : -100),
        rotateZ: side * (distance === 1 ? 2 : 5),
        scale: distance === 0 ? 1 : distance === 1 ? 0.9 : 0.7,
        opacity: distance < 2 ? 1 : 0,
      };
      const start = collage[index % collage.length];
      const interpolate = (a: number, b: number) => a + (b - a) * eased;
      const pose = {
        xPercent: interpolate(start.x, orbit.x),
        yPercent: interpolate(start.y, orbit.y),
        z: interpolate(start.z, orbit.z),
        rotationY: interpolate(start.rotateY, orbit.rotateY),
        rotationZ: interpolate(start.rotateZ, orbit.rotateZ),
        scale: interpolate(start.scale, orbit.scale),
        opacity: interpolate(1, orbit.opacity),
        transformPerspective: 1600,
        transformOrigin: "50% 50%",
      };
      if (compact || reduced) Object.assign(pose, {
        xPercent: 0, yPercent: 0, z: 0, rotationY: 0, rotationZ: 0,
        scale: 1, opacity: distance === 0 ? 1 : 0,
      });
      if (!hasPositioned.current || reduced) gsap.set(element, pose);
      else gsap.to(element, { ...pose, duration: compact ? 0.25 : 0.52,
        ease: "power3.out", overwrite: "auto" });
    });
    hasPositioned.current = true;
  }, [projects, activeIndex, progress, direction, reduceMotion, compact]);

  useLayoutEffect(() => {
    const element = root.current;
    return () => { if (element) gsap.killTweensOf(element.querySelectorAll("[data-orbit-card]")); };
  }, []);

  return <div ref={root} className={styles.orbitDeck}>
    {projects.map((project, index) => {
      const position = getPosition(index, activeIndex, projects.length);
      const active = index === activeIndex;
      const hidden = compact || reduceMotion ? !active : progress >= 0.85 && Math.abs(position) > 1;
      return <div key={project.id} data-orbit-card data-active={active} className={styles.orbitCard} inert={hidden} aria-hidden={hidden || undefined}>
        <button type="button" className={styles.preview} aria-label={active ? `Open ${project.title} case study` : `Show ${project.title}`} aria-current={active ? "true" : undefined}
          onClick={() => { if (swiped.current) { swiped.current = false; return; } if (active) onOpen(); else onSelect(index); }}
          onPointerDown={() => { swiped.current = false; }}
          onTouchStart={event => { event.stopPropagation(); touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
          onTouchEnd={event => {
            event.stopPropagation();
            if (!touch.current) return;
            const dx = event.changedTouches[0].clientX - touch.current.x;
            const dy = event.changedTouches[0].clientY - touch.current.y;
            touch.current = null;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { swiped.current = true; onStep(dx < 0 ? 1 : -1); }
          }} onTouchCancel={() => { touch.current = null; }}>
          <span aria-hidden="true" className={styles.cardEdge} />
          <span className={styles.previewImage} data-project-anchor={active ? project.id : undefined}><Image src={project.coverImage} alt={`${project.title} project presentation`} fill loading={Math.abs(position) <= 1 ? "eager" : "lazy"} sizes="(min-width: 1440px) 820px, (min-width: 1024px) 60vw, 85vw" /></span>
          <span aria-hidden="true" className={styles.depthSheen} />
          <span className={styles.previewCta}>{active ? "Explore project" : project.shortTitle}<ArrowUpRight size={18} aria-hidden="true" /></span>
        </button>
      </div>;
    })}
  </div>;
}
