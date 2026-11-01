"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronUp, X } from "lucide-react";
import { scenes } from "@/data/scenes";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./PageCompanion.module.css";

type PageCompanionProps = {
  activeIndex: number;
  direction: 1 | -1;
  hidden: boolean;
  onNavigate: (index: number) => boolean;
};

/** One persistent companion follows navigation outside the departing page frames. */
export function PageCompanion({ activeIndex, direction, hidden, onNavigate }: PageCompanionProps) {
  const reduceMotion = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const menuId = useId();
  const [openForScene, setOpenForScene] = useState<number | null>(null);
  const [isTravelling, setIsTravelling] = useState(false);
  const isOpen = openForScene === activeIndex && !hidden;
  const travelling = isTravelling && !reduceMotion && !hidden;
  const progress = activeIndex / (scenes.length - 1);

  // A guide opened on one page should not reopen when returning from another page.
  if (openForScene !== null && (openForScene !== activeIndex || hidden)) setOpenForScene(null);

  useEffect(() => {
    if (!isOpen) return;
    menu.current?.querySelector<HTMLAnchorElement>("a[aria-current='page']")?.focus();
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpenForScene(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpenForScene(null);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen]);

  return (
    <aside ref={root} data-page-guide aria-label="Robot page guide" hidden={hidden} className={styles.track}
      onBlur={(event) => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpenForScene(null); }}>
      {isOpen && <motion.nav ref={menu} id={menuId} data-lenis-prevent aria-label="Explore portfolio pages" className={styles.menu}
        style={progress <= 0.5 ? { top: `${progress * 100}%` } : { bottom: `${(1 - progress) * 100}%` }}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className={styles.menuHeading}><div><span>Your little guide</span><p>Where to next?</p></div><button type="button" aria-label="Close page guide" onClick={() => { setOpenForScene(null); trigger.current?.focus(); }}><X size={16} /></button></div>
        {scenes.map((scene, index) => <a key={scene.id} href={`#${scene.id === "intro" ? "home" : scene.id === "work" ? "projects" : scene.id}`}
          aria-current={index === activeIndex ? "page" : undefined}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            if (index === activeIndex || onNavigate(index)) {
              setOpenForScene(null);
              trigger.current?.focus();
            }
          }}><span>{scene.number}</span>{scene.label}<ArrowUpRight size={15} aria-hidden="true" /></a>)}
      </motion.nav>}
      <span aria-hidden="true" className={styles.anchor} />
      <motion.div
        className={styles.rig}
        initial={false}
        animate={{ height: `${progress * 100}%` }}
        transition={{ duration: reduceMotion ? 0 : 1.65, ease: [0.42, 0, 0.25, 1] }}
        onAnimationStart={() => setIsTravelling(true)}
        onAnimationComplete={() => setIsTravelling(false)}
      >
        <span aria-hidden="true" className={styles.cord} />
        <div className={styles.position}>
        <button ref={trigger} type="button" className={styles.trigger} aria-label={`Page guide: ${scenes[activeIndex].label}. Explore all pages`}
          aria-expanded={isOpen} aria-controls={isOpen ? menuId : undefined} onClick={() => setOpenForScene(isOpen ? null : activeIndex)}>
        <span className={styles.hint}>{scenes[activeIndex].label}<ChevronUp size={12} aria-hidden="true" /></span>
        <motion.span
          className={styles.character}
          initial={false}
          animate={{ rotate: travelling ? direction * 3 : 0 }}
          transition={{ type: "spring", stiffness: 65, damping: 12, mass: 0.7 }}
        >
          <svg aria-hidden="true" className={styles.robot} viewBox="0 0 64 80" fill="none" focusable="false">
            <path d="M32 24V17" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="14" r="3" fill="var(--accent)" />
            <path d="M46 45Q56 30 48 5" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
            <path d="M45 5Q48 0 51 5" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            <g key={activeIndex} className={!travelling && !isOpen && !hidden ? styles.wave : undefined}>
              <path d="M18 48L9 39L8 31" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
            </g>
            <path d="M25 63L23 72L19 73M39 63L41 71L45 72" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="19" y="45" width="26" height="21" rx="9" fill="var(--accent-fill)" stroke="var(--accent)" strokeWidth="2" />
            <path d="M29 54L26 57L29 60M35 54L38 57L35 60" stroke="white" strokeOpacity="0.85" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="12" y="23" width="40" height="29" rx="12" fill="var(--accent)" />
            <rect x="17" y="28" width="30" height="19" rx="8" fill="var(--inverse-surface)" />
            <g className={styles.eyes}>
              <rect x="23" y="34" width="4" height="6" rx="2" fill="var(--inverse-accent)" />
              <rect x="37" y="34" width="4" height="6" rx="2" fill="var(--inverse-accent)" />
            </g>
            <path d="M29 42Q32 45 35 42" stroke="var(--inverse-accent)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.span>
        </button>
        </div>
      </motion.div>
    </aside>
  );
}
