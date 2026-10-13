"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scenes, type SceneId } from "@/data/scenes";

const TRANSITION_COOLDOWN = 1300;

export function useSceneNavigation(initialScene: SceneId = "intro") {
  const initialIndex = Math.max(0, scenes.findIndex(({ id }) => id === initialScene));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<1 | -1>(1);
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  const isTransitioning = useRef(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (releaseTimer.current) clearTimeout(releaseTimer.current); }, []);
  useEffect(() => {
    const restore = () => {
      const hash = window.location.hash.slice(1);
      const id = hash.startsWith("project-") || hash === "projects" ? "work" : hash === "home" || !hash ? "intro" : hash;
      const index = scenes.findIndex(scene => scene.id === id);
      if (index < 0) return;
      isTransitioning.current = false;
      setDirection(index >= activeIndexRef.current ? 1 : -1);
      setActiveIndex(index);
    };
    const initialFrame = requestAnimationFrame(restore);
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, []);

  const navigateTo = useCallback((targetIndex: number) => {
    const nextIndex = Math.min(Math.max(targetIndex, 0), scenes.length - 1);
    if (isTransitioning.current || nextIndex === activeIndex) return false;

    isTransitioning.current = true;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(nextIndex);
    const id = scenes[nextIndex].id;
    window.history.pushState({ ...window.history.state, projectViewer: undefined }, "", `#${id === "intro" ? "home" : id === "work" ? "projects" : id}`);
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => { isTransitioning.current = false; }, TRANSITION_COOLDOWN);
    return true;
  }, [activeIndex]);

  const nextScene = useCallback(() => navigateTo(activeIndex + 1), [activeIndex, navigateTo]);
  const previousScene = useCallback(() => navigateTo(activeIndex - 1), [activeIndex, navigateTo]);

  return { activeIndex, activeScene: scenes[activeIndex], direction, navigateTo, nextScene, previousScene };
}
