"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scenes } from "@/data/scenes";
import { Home, UserRound, BriefcaseBusiness, Code2, GraduationCap, Mail, ArrowUp, ArrowDown } from "lucide-react";

const sectionIcons = [Home, UserRound, BriefcaseBusiness, Code2, GraduationCap, Mail];

type SceneNavigatorProps = {
  activeIndex: number;
  onNavigate: (index: number) => void;
};

export function SceneNavigator({ activeIndex, onNavigate }: SceneNavigatorProps) {
  const reduceMotion = useReducedMotion();
  const activeScene = scenes[activeIndex];

  return (
    <>
    <nav aria-label="Mobile sections" className="mobile-section-nav">
      {scenes.map((scene, index) => {
        const Icon = sectionIcons[index];
        return <button key={scene.id} type="button" aria-label={`Go to ${scene.label}`} aria-current={index === activeIndex ? "page" : undefined} onClick={() => onNavigate(index)}>
          <Icon aria-hidden="true" size={19} strokeWidth={1.7} />
          <span>{index === 2 ? "Projects" : scene.label}</span>
        </button>;
      })}
    </nav>
    {activeScene.id !== "work" && <nav aria-label="Section navigation" className="desktop-section-nav section-dock">
      <button type="button" disabled={activeIndex === 0} onClick={() => onNavigate(activeIndex - 1)} aria-label="Previous section"><ArrowUp size={16} /></button>
      <span aria-live="polite"><span className="section-dock-number">{String(activeIndex + 1).padStart(2, "0")}</span>{activeScene.label}</span>
      <button type="button" disabled={activeIndex === scenes.length - 1} onClick={() => onNavigate(activeIndex + 1)} aria-label="Next section"><ArrowDown size={16} /></button>
      <motion.i aria-hidden="true" initial={false} animate={{ scaleX: (activeIndex + 1) / scenes.length }} transition={{ duration: reduceMotion ? 0 : 0.6 }} className="section-dock-progress" />
    </nav>}
    </>
  );
}
