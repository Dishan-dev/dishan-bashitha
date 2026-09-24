"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect } from "react";

type TransitionShapeProps = {
  isExpanding?: boolean;
};

/** The recurring, pointer-responsive geometric signature used between scenes. */
export function TransitionShape({ isExpanding = false }: TransitionShapeProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 110, damping: 22, mass: 0.4 });
  const y = useSpring(pointerY, { stiffness: 110, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (reduceMotion) return;
    const moveShape = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 10);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 10);
    };
    window.addEventListener("pointermove", moveShape, { passive: true });
    return () => window.removeEventListener("pointermove", moveShape);
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <motion.div
      aria-hidden="true"
      className={`fixed right-[-5rem] top-[18svh] z-10 h-[clamp(13rem,26vw,28rem)] w-[clamp(13rem,26vw,28rem)] ${isExpanding ? "pointer-events-none" : "pointer-events-auto"}`}
      style={{ x, y }}
      animate={{ scale: isExpanding && !reduceMotion ? 10 : 1, opacity: isExpanding ? 1 : 0.12 }}
      transition={{ duration: reduceMotion ? 0 : isExpanding ? 0.66 : 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="h-full w-full rounded-full border border-[var(--accent)] bg-[var(--accent)]"
        whileHover={isExpanding || reduceMotion ? undefined : { scale: 1.035 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
