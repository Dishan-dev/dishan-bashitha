"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCallback, useEffect, useRef, useState } from "react";
import { TransitionShape } from "@/components/motion/TransitionShape";
import { FrameTransition } from "@/components/motion/FrameTransition";
import { PortfolioLoader } from "@/components/motion/PortfolioLoader";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { SceneNavigator } from "@/components/portfolio/SceneNavigator";
import { AboutScene } from "@/components/scenes/AboutScene";
import { ContactScene } from "@/components/scenes/ContactScene";
import { ExperienceScene } from "@/components/scenes/ExperienceScene";
import { IntroScene } from "@/components/scenes/IntroScene";
import { SkillsScene } from "@/components/scenes/SkillsScene";
import { WorkScene } from "@/components/scenes/WorkScene";
import { useSceneNavigation } from "@/hooks/useSceneNavigation";
import { useSwipe } from "@/hooks/useSwipe";

const sceneComponents = {
  intro: IntroScene,
  about: AboutScene,
  work: WorkScene,
  skills: SkillsScene,
  experience: ExperienceScene,
  contact: ContactScene,
};

function isInteractiveElement(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true']"));
}

export function PortfolioExperience() {
  const { activeIndex, activeScene, navigateTo, nextScene, previousScene } = useSceneNavigation();
  const reduceMotion = useReducedMotion();
  const wheelDistance = useRef(0);
  const wheelResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isIntroTransitioning, setIsIntroTransitioning] = useState(false);
  const [isProjectViewerOpen, setIsProjectViewerOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isLoaderLeaving, setIsLoaderLeaving] = useState(false);
  const ActiveScene = sceneComponents[activeScene.id];
  const isCompact = () => window.matchMedia("(max-width: 1023px), (max-height: 600px)").matches;
  const swipeHandlers = useSwipe({
    onSwipeUp: () => { if (!isCompact()) nextScene(); },
    onSwipeDown: () => { if (!isCompact()) previousScene(); },
  });

  const enterPortfolio = useCallback(() => {
    if (isIntroTransitioning) return;
    setIsIntroTransitioning(true);
    const revealStatement = () => {
      if (!navigateTo(1)) {
        setIsIntroTransitioning(false);
        return;
      }
      window.setTimeout(() => setIsIntroTransitioning(false), reduceMotion ? 0 : 780);
    };

    if (reduceMotion) revealStatement();
    else enterTimer.current = setTimeout(revealStatement, 620);
  }, [isIntroTransitioning, navigateTo, reduceMotion]);

  useEffect(() => () => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
  }, []);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setIsLoaderLeaving(true), reduceMotion ? 80 : 1050);
    const removeTimer = window.setTimeout(() => setShowLoader(false), reduceMotion ? 250 : 1750);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [reduceMotion]);

  useEffect(() => {
    const restart = () => { navigateTo(0); };
    window.addEventListener("portfolio:restart", restart);
    return () => window.removeEventListener("portfolio:restart", restart);
  }, [navigateTo]);

  useEffect(() => {
    const handleProjectViewer = (event: Event) => setIsProjectViewerOpen(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("portfolio:project-viewer", handleProjectViewer);
    return () => window.removeEventListener("portfolio:project-viewer", handleProjectViewer);
  }, []);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isCompact()) return;
      if (document.body.dataset.projectViewer === "open") return;
      if ((activeScene.id === "work" || activeScene.id === "experience") && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (!event.deltaY) return;

      wheelDistance.current += event.deltaY;
      if (wheelResetTimer.current) clearTimeout(wheelResetTimer.current);
      wheelResetTimer.current = setTimeout(() => { wheelDistance.current = 0; }, 140);

      if (Math.abs(wheelDistance.current) < 65) return;
      const distance = wheelDistance.current;
      wheelDistance.current = 0;
      if (distance > 0) nextScene(); else previousScene();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeScene.id, nextScene, previousScene]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.body.dataset.projectViewer === "open") return;
      if (isInteractiveElement(event.target) || isCompact()) return;
      if ((activeScene.id === "work" || activeScene.id === "experience") && (event.key === "ArrowLeft" || event.key === "ArrowRight")) return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        nextScene();
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        previousScene();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeScene.id, nextScene, previousScene]);

  return (
    <main {...swipeHandlers} className="portfolio-shell isolate h-[100svh] touch-none overflow-hidden" aria-roledescription="scene-based portfolio">
      {showLoader && <PortfolioLoader isLeaving={isLoaderLeaving} />}
      {activeScene.id !== "contact" && <TransitionShape isExpanding={isIntroTransitioning} />}
      {!isProjectViewerOpen && <PortfolioHeader activeIndex={activeIndex} onNavigate={navigateTo} />}
      <div className="relative h-full">
        <FrameTransition frameKey={activeScene.id}>
          {activeScene.id === "intro" ? <IntroScene isReady={isLoaderLeaving || !showLoader} onEnter={enterPortfolio} isTransitioning={isIntroTransitioning} onNavigate={navigateTo} /> : <ActiveScene />}
        </FrameTransition>
      </div>
      {!isProjectViewerOpen && <SceneNavigator activeIndex={activeIndex} onNavigate={navigateTo} />}
    </main>
  );
}
