"use client";

import { useCallback, useRef, useState } from "react";

const PROJECT_TRANSITION_LOCK = 820;

export function useProjectNavigation(total: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const locked = useRef(false);

  const move = useCallback((offset: 1 | -1) => {
    if (locked.current) return false;
    locked.current = true;
    setDirection(offset);
    setActiveIndex((index) => (index + offset + total) % total);
    window.setTimeout(() => { locked.current = false; }, PROJECT_TRANSITION_LOCK);
    return true;
  }, [total]);

  return { activeIndex, direction, nextProject: () => move(1), previousProject: () => move(-1) };
}
