"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCallback, useEffect, useState } from "react";
import { PortfolioLoader } from "@/components/motion/PortfolioLoader";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { SceneNavigator } from "@/components/portfolio/SceneNavigator";
import { PageCompanion } from "@/components/portfolio/PageCompanion";
import { AboutScene } from "@/components/scenes/AboutScene";
import { ContactScene } from "@/components/scenes/ContactScene";
import { ExperienceScene } from "@/components/scenes/ExperienceScene";
import { IntroScene } from "@/components/scenes/IntroScene";
import { SkillsScene } from "@/components/scenes/SkillsScene";
import { WorkScene } from "@/components/scenes/WorkScene";
import { scenes } from "@/data/scenes";
import { useSceneNavigation } from "@/hooks/useSceneNavigation";
import { stackedQuery } from "@/lib/motion";
import { lockScroll, startSmoothScroll, stopSmoothScroll } from "@/lib/portfolioScroll";

const sceneComponents = {
  about: AboutScene,
  work: WorkScene,
  skills: SkillsScene,
  experience: ExperienceScene,
  contact: ContactScene,
};

/** One continuous document: desktop frames stack as the next scene slides over the last. */
export function PortfolioExperience() {
  const { activeIndex, direction, navigateTo } = useSceneNavigation();
  const reduceMotion = useReducedMotion();
  const [isProjectViewerOpen, setIsProjectViewerOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isLoaderLeaving, setIsLoaderLeaving] = useState(false);

  const enterPortfolio = useCallback(() => { navigateTo(2); }, [navigateTo]);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setIsLoaderLeaving(true), reduceMotion ? 80 : 450);
    const removeTimer = window.setTimeout(() => setShowLoader(false), reduceMotion ? 250 : 1150);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [reduceMotion]);

  // Smoothing only where the stacked desktop choreography runs; touch keeps native momentum.
  useEffect(() => {
    const media = window.matchMedia(stackedQuery);
    const configure = () => { if (media.matches) startSmoothScroll(); else stopSmoothScroll(); };
    configure();
    media.addEventListener("change", configure);
    return () => { media.removeEventListener("change", configure); stopSmoothScroll(); };
  }, []);

  useEffect(() => {
    const restart = () => { navigateTo(0); };
    window.addEventListener("portfolio:restart", restart);
    return () => window.removeEventListener("portfolio:restart", restart);
  }, [navigateTo]);

  useEffect(() => {
    const handleProjectViewer = (event: Event) => {
      const open = Boolean((event as CustomEvent<boolean>).detail);
      setIsProjectViewerOpen(open);
      lockScroll(open);
    };
    window.addEventListener("portfolio:project-viewer", handleProjectViewer);
    return () => window.removeEventListener("portfolio:project-viewer", handleProjectViewer);
  }, []);

  return (
    <main className="portfolio-shell isolate" aria-roledescription="cinematic portfolio">
      {showLoader && <PortfolioLoader isLeaving={isLoaderLeaving} />}
      {!isProjectViewerOpen && <PortfolioHeader activeIndex={activeIndex} onNavigate={navigateTo} />}
      <div data-scene-track className="scene-track">
        {scenes.map(({ id }) => {
          const SceneComponent = id === "intro" ? null : sceneComponents[id];
          return <div key={id} data-scene-frame={id} className="scene-frame">
            <div data-scene-surface className="scene-surface">
              {SceneComponent ? <SceneComponent /> : <IntroScene isReady={isLoaderLeaving || !showLoader} onEnter={enterPortfolio} onNavigate={navigateTo} />}
              <span aria-hidden="true" data-scene-shade className="scene-shade" />
            </div>
          </div>;
        })}
      </div>
      {!isProjectViewerOpen && <SceneNavigator activeIndex={activeIndex} onNavigate={navigateTo} />}
      <PageCompanion activeIndex={activeIndex} direction={direction} hidden={showLoader || isProjectViewerOpen} onNavigate={navigateTo} />
    </main>
  );
}
