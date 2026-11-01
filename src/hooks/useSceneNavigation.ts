"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scenes, type SceneId } from "@/data/scenes";
import { isStacked, sceneGeometry, scrollToScene } from "@/lib/portfolioScroll";

const hashFor = (id: SceneId) => `#${id === "intro" ? "home" : id === "work" ? "projects" : id}`;

function sceneFromHash(hash: string) {
  const id = hash.startsWith("project-") || hash === "projects" ? "work" : hash === "home" || !hash ? "intro" : hash;
  return scenes.findIndex(scene => scene.id === id);
}

/** Scrolling owns the active section; navigation is a smooth, interruptible journey to it. */
export function useSceneNavigation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const activeIndexRef = useRef(0);
  const isNavigating = useRef(false);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Passive scrolling keeps the address current without adding history entries. A hash that
  // already belongs to the scene (such as a case-study link) is left untouched.
  const syncHash = useCallback(() => {
    const index = activeIndexRef.current;
    if (document.body.dataset.projectViewer === "open" || sceneFromHash(window.location.hash.slice(1)) === index) return;
    window.history.replaceState(window.history.state, "", hashFor(scenes[index].id));
  }, []);

  // A finished or interrupted journey may end somewhere other than where it was heading.
  const finishNavigation = useCallback(() => {
    isNavigating.current = false;
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    syncHash();
  }, [syncHash]);

  const goTo = useCallback((index: number, immediate = false) => {
    isNavigating.current = true;
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    // Native smooth scrolling may not report scrollend; never block hash updates for long.
    navigationTimer.current = setTimeout(finishNavigation, 2400);
    scrollToScene(scenes[index].id, { immediate, onComplete: finishNavigation });
  }, [finishNavigation]);

  useEffect(() => {
    let geometry = sceneGeometry();
    let frame = 0;
    const update = () => {
      // A scene becomes current once it covers half of the viewport.
      const line = window.scrollY + window.innerHeight * 0.5;
      let index = 0;
      geometry.forEach((scene, sceneIndex) => { if (line >= scene.top) index = sceneIndex; });
      if (index === activeIndexRef.current) return;
      setDirection(index > activeIndexRef.current ? 1 : -1);
      activeIndexRef.current = index;
      setActiveIndex(index);
      if (!isNavigating.current) syncHash();
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const measure = () => { geometry = sceneGeometry(); schedule(); };
    // User input interrupts a programmatic journey, so its hash updates resume immediately.
    const interrupt = () => { if (isNavigating.current) finishNavigation(); };
    const track = document.querySelector("[data-scene-track]");
    const observer = new ResizeObserver(measure);
    if (track) observer.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
    };
  }, [finishNavigation, syncHash]);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    let userScrolled = false;
    const markScrolled = () => { userScrolled = true; };
    const restore = (immediate: boolean) => {
      const index = sceneFromHash(window.location.hash.slice(1));
      if (index >= 0) goTo(index, immediate);
    };
    const onHistory = () => restore(false);
    // Direct links land on the settled scene; fonts can still change compact heights afterwards.
    const initialFrame = requestAnimationFrame(() => restore(true));
    document.fonts?.ready.then(() => { if (!userScrolled && window.location.hash) restore(true); });
    window.addEventListener("wheel", markScrolled, { passive: true, once: true });
    window.addEventListener("touchstart", markScrolled, { passive: true, once: true });
    window.addEventListener("popstate", onHistory);
    window.addEventListener("hashchange", onHistory);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("wheel", markScrolled);
      window.removeEventListener("touchstart", markScrolled);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
    };
  }, [goTo]);

  // Keyboard focus inside a covered or still-composing scene settles that scene first.
  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      if (!isStacked() || !(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
      const id = event.target.closest<HTMLElement>("[data-scene-frame]")?.dataset.sceneFrame;
      const scene = sceneGeometry().find(item => item.id === id);
      if (!scene || Math.abs(window.scrollY - scene.rest) < 4) return;
      goTo(scenes.findIndex(item => item.id === id));
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [goTo]);

  const navigateTo = useCallback((targetIndex: number) => {
    const index = Math.min(Math.max(targetIndex, 0), scenes.length - 1);
    const hash = hashFor(scenes[index].id);
    if (window.location.hash !== hash) window.history.pushState({ ...window.history.state, projectViewer: undefined }, "", hash);
    goTo(index);
    return true;
  }, [goTo]);

  return { activeIndex, activeScene: scenes[activeIndex], direction, navigateTo };
}
