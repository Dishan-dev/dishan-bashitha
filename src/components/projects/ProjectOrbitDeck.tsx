"use client";

import { animate, createTimeline } from "animejs";
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
export function ProjectOrbitDeck({ projects, activeIndex, direction, onSelect, onStep, onOpen }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const lastPositions = useRef(new Map<string, number>());
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const reduceMotion = useReducedMotion();
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia(compactQuery).matches, () => false);

  useLayoutEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>("[data-orbit-card]");
    if (!elements) return;
    const reduced = reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animations: Array<ReturnType<typeof animate> | ReturnType<typeof createTimeline>> = [];
    for (const id of lastPositions.current.keys()) {
      if (!projects.some(project => project.id === id)) lastPositions.current.delete(id);
    }
    elements.forEach((element, index) => {
      const project = projects[index];
      const position = getPosition(index, activeIndex, projects.length);
      const distance = Math.abs(position);
      const side = Math.sign(position);
      const previous = lastPositions.current.get(project.id);
      const pose = {
        x: `${side * (distance === 1 ? (compact ? 68 : 60) : 95)}%`,
        y: distance === 0 ? 0 : distance === 1 ? 12 : 30,
        z: distance === 0 ? 0 : distance === 1 ? (compact ? -150 : -220) : -480,
        rotateY: side * (distance === 1 ? (compact ? -38 : -58) : -100),
        rotateZ: side * (distance === 1 ? 2 : 5),
        scale: distance === 0 ? 1 : distance === 1 ? 0.9 : 0.7,
        opacity: distance < 2 ? 1 : 0,
      };
      if (compact || reduced) Object.assign(pose, { x: "0%", y: 0, z: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: distance === 0 ? 1 : 0 });
      const wrapped = previous !== undefined && Math.abs(position - previous) > projects.length / 2;
      if (wrapped && !reduced && !compact) {
        // A wrapping card takes the rear route; it never flashes across the front.
        animations.push(createTimeline()
          .add(element, { opacity: 0, z: -450, duration: 180, ease: "in(3)" }, 0)
          .set(element, { ...pose, opacity: 0 }, 180)
          .add(element, { opacity: pose.opacity, duration: 450, ease: "out(3)" }, 330));
      } else {
        animations.push(animate(element, {
          ...pose,
          ...(previous === undefined && !reduced && !compact ? {
            rotateY: [pose.rotateY + direction.current * 55, pose.rotateY],
            z: [pose.z - 220, pose.z],
            opacity: [0, pose.opacity],
          } : {}),
          duration: reduced ? 0 : compact ? 300 : 1000,
          ease: "inOut(3)",
        }));
      }
      lastPositions.current.set(project.id, position);
    });
    // Cancel keeps the current pose so rapid navigation continues without snapping.
    return () => animations.forEach(animation => animation.cancel());
  }, [activeIndex, projects, reduceMotion, direction, compact]);

  return <div ref={root} className={styles.orbitDeck}>
    {projects.map((project, index) => {
      const position = getPosition(index, activeIndex, projects.length);
      const active = index === activeIndex;
      const hidden = compact || reduceMotion ? !active : Math.abs(position) > 1;
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
          <span className={styles.previewImage}><Image src={project.coverImage} alt={`${project.title} project presentation`} fill loading={Math.abs(position) <= 1 ? "eager" : "lazy"} sizes="(min-width: 1440px) 820px, (min-width: 1024px) 60vw, 85vw" /></span>
          <span aria-hidden="true" className={styles.depthSheen} />
          <span className={styles.previewCta}>{active ? "Explore project" : project.shortTitle}<ArrowUpRight size={18} aria-hidden="true" /></span>
        </button>
      </div>;
    })}
  </div>;
}
