"use client";

import { useRef, type PointerEventHandler, type ReactNode } from "react";
import { useSceneMotion } from "@/hooks/useSceneMotion";
type SceneProps = {
  id: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
  onPointerMove?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
};

export function Scene({ id, eyebrow, children, className = "", onPointerMove, onPointerLeave }: SceneProps) {
  const root = useRef<HTMLElement>(null);
  useSceneMotion(root);
  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={`portfolio-scene h-full overflow-hidden px-[var(--space-2)] pb-[var(--space-3)] pt-[clamp(6rem,12vh,9rem)] sm:px-[var(--space-4)] ${className}`}>
      {eyebrow && <p className="mb-[var(--space-3)] font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{eyebrow}</p>}
      {children}
    </section>
  );
}
