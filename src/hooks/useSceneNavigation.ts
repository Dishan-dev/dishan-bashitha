"use client";

import { useCallback, useRef, useState } from "react";
import { scenes, type SceneId } from "@/data/scenes";

const TRANSITION_COOLDOWN = 520;

export function useSceneNavigation(initialScene: SceneId = "intro") {
  const initialIndex = Math.max(0, scenes.findIndex(({ id }) => id === initialScene));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<1 | -1>(1);
  const isTransitioning = useRef(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateTo = useCallback((targetIndex: number) => {
    const nextIndex = Math.min(Math.max(targetIndex, 0), scenes.length - 1);
    if (isTransitioning.current || nextIndex === activeIndex) return false;

    isTransitioning.current = true;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(nextIndex);
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => { isTransitioning.current = false; }, TRANSITION_COOLDOWN);
    return true;
  }, [activeIndex]);

  const nextScene = useCallback(() => navigateTo(activeIndex + 1), [activeIndex, navigateTo]);
  const previousScene = useCallback(() => navigateTo(activeIndex - 1), [activeIndex, navigateTo]);

  return { activeIndex, activeScene: scenes[activeIndex], direction, navigateTo, nextScene, previousScene };
}
