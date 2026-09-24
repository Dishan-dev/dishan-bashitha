"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scenes } from "@/data/scenes";
import { Home, UserRound, BriefcaseBusiness, Code2, GraduationCap, Mail } from "lucide-react";

const sectionIcons = [Home, UserRound, BriefcaseBusiness, Code2, GraduationCap, Mail];

type SceneNavigatorProps = {
  activeIndex: number;
  onNavigate: (index: number) => void;
};

export function SceneNavigator({ activeIndex, onNavigate }: SceneNavigatorProps) {
  const reduceMotion = useReducedMotion();
  const activeScene = scenes[activeIndex];
  const progress = scenes.length > 1 ? activeIndex / (scenes.length - 1) : 0;
  const meterProgress = progress;

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
    <nav aria-label="Portfolio sections" className="desktop-section-nav pointer-events-none fixed bottom-[-5.25rem] left-1/2 z-40 h-[10.5rem] w-[10.5rem] -translate-x-1/2">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-[var(--accent)]/40 bg-[var(--background)]/95 shadow-[0_0.75rem_2rem_rgba(36,25,59,0.1)] backdrop-blur-sm"
      >
        <div className="absolute inset-[0.7rem] rounded-full border border-[var(--accent)]/15" />
        {Array.from({ length: 24 }, (_, index) => (
          <i key={index} className={`absolute left-1/2 top-[0.2rem] h-2 w-px -translate-x-1/2 ${index % 3 === 0 ? "bg-[var(--accent)]/65" : "bg-[var(--accent)]/25"}`} style={{ transform: `translateX(-50%) rotate(${index * 15}deg)`, transformOrigin: "50% 5.1rem" }} />
        ))}
        <svg aria-hidden="true" viewBox="0 0 168 168" className="absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] overflow-visible">
          <path d="M 2 84 A 82 82 0 0 1 166 84" fill="none" stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="2" />
          <motion.path initial={false} animate={{ pathLength: meterProgress }} transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }} d="M 2 84 A 82 82 0 0 1 166 84" fill="none" stroke="var(--accent)" strokeLinecap="round" strokeWidth="4" />
        </svg>
      </div>

      <div className="pointer-events-auto absolute inset-x-[1.85rem] top-[1.35rem] flex h-[3.3rem] flex-col items-center justify-center rounded-full text-center">
        <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Now viewing</span>
        <span className="mt-1 text-[0.95rem] font-semibold text-[var(--foreground)]">{activeScene.label}</span>
      </div>

      <ul className="sr-only">
        {scenes.map((scene, index) => (
          <li key={scene.id}><button type="button" aria-current={index === activeIndex ? "page" : undefined} onClick={() => onNavigate(index)}>Go to {scene.label}</button></li>
        ))}
      </ul>
    </nav>
    </>
  );
}
