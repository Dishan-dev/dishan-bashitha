"use client";

import { gsap } from "gsap";
import { ArrowDown, ArrowUp, Copy, FileDown, Play, Shuffle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import styles from "./Flow.module.css";

type Mood = "idle" | "happy" | "sleep" | "whoa";
type Stop = { id: string; say: string; hold?: number; flips?: number };

const lines: Record<string, string> = {
  home: "Hi, I’m Bit, Dishan’s guide. Tap me for a tour!",
  about: "That’s Dishan. Try swinging the badge!",
  experience: "Swipe or use the arrows to flip through the journey.",
  education: "Always learning: three chapters so far.",
  projects: "Click a project to open its case study.",
  contact: "Got an idea? Let’s build it together!",
};
const waving = new Set(["home", "contact"]);

/** The guided tour: where Bit takes the reader, what it says there, and how many cards it flips. */
const tour: Stop[] = [
  { id: "home", say: "Sit back, I’ll show you around. Scroll or tap anywhere to take over.", hold: 3200 },
  { id: "about", say: "This is Dishan: a Software Engineering undergrad at Moratuwa who builds full stack.", hold: 4400 },
  { id: "experience", say: "Five roles so far. I’ll flip through them for you…", flips: 4 },
  { id: "education", say: "Three chapters of learning, and counting.", hold: 3800 },
  { id: "projects", say: "Four builds. Sliding through them now…", flips: 3 },
  { id: "contact", say: "That’s the tour! Dishan is one message away.", hold: 4200 },
];
const travel = 1800;
const flipEvery = 1400;

/**
 * Bit, a small guide that travels with the reader. Tapping it opens a menu: a guided tour that
 * scrolls the page and flips the cards itself, a random project, the email and the résumé. It
 * has moods: it naps when left alone, says "whoa" at fast scrolling, enjoys being hovered, and
 * can be dragged and flung back to its spot. Its eyes follow the pointer.
 */
export function Companion({ active, hidden, onNext, onGo, onOpen }: {
  active: string;
  hidden: boolean;
  onNext: () => void;
  onGo: (id: string) => boolean;
  onOpen: (slug: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const bot = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState(false);
  const [touring, setTouring] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const moodRef = useRef<Mood>("idle");
  const timers = useRef<number[]>([]);
  const moodTimer = useRef(0);
  const speechTimer = useRef(0);
  const dragged = useRef(false);

  // A mood that wears off by itself, back to idle.
  const feel = useCallback((next: Mood, ms = 0) => {
    window.clearTimeout(moodTimer.current);
    moodRef.current = next;
    setMood(next);
    if (ms) moodTimer.current = window.setTimeout(() => { moodRef.current = "idle"; setMood("idle"); }, ms);
  }, []);
  // A short remark that clears itself (the tour's narration stays until the next stop).
  const say = useCallback((text: string, ms = 2400) => {
    window.clearTimeout(speechTimer.current);
    setSpeech(text);
    if (ms) speechTimer.current = window.setTimeout(() => setSpeech(null), ms);
  }, []);

  const stopTour = useCallback(() => {
    timers.current.forEach(id => window.clearTimeout(id));
    timers.current = [];
    setTouring(false);
    setSpeech(null);
  }, []);

  const startTour = () => {
    setMenu(false);
    setTouring(true);
    feel("happy", 1400);
    const later = (ms: number, run: () => void) => { timers.current.push(window.setTimeout(run, ms)); };
    let at = 0;
    tour.forEach((stop, index) => {
      later(at, () => { onGo(stop.id); say(stop.say, 0); });
      at += travel;
      // Flip with the section's own arrows, so it moves exactly as a reader's tap would.
      for (let flip = 0; flip < (stop.flips ?? 0); flip++) {
        at += flipEvery;
        later(at, () => document.querySelector<HTMLButtonElement>(`#${stop.id} [data-step="1"]`)?.click());
      }
      at += stop.flips ? 1600 : stop.hold ?? 0;
      if (index === tour.length - 1) later(at, () => { stopTour(); feel("happy", 1600); });
    });
  };

  const surprise = () => {
    setMenu(false);
    const pick = projects[Math.floor(Math.random() * projects.length)];
    say(`How about ${pick.shortTitle}?`, 1600);
    window.setTimeout(() => onOpen(pick.slug), 500);
  };

  const copyEmail = async () => {
    setMenu(false);
    try {
      await navigator.clipboard.writeText(profile.email);
      say("Copied! It’s on your clipboard.");
      feel("happy", 1600);
    } catch {
      say(profile.email, 4000);
    }
  };

  // Any input of the reader's own ends the tour: they have taken over.
  useEffect(() => {
    if (!touring) return;
    const cancel = (event: Event) => { if (!root.current?.contains(event.target as Node)) stopTour(); };
    const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    events.forEach(type => window.addEventListener(type, cancel, { passive: true }));
    return () => events.forEach(type => window.removeEventListener(type, cancel));
  }, [touring, stopTour]);

  // The menu closes on Escape or a click elsewhere.
  useEffect(() => {
    if (!menu) return;
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenu(false); bot.current?.focus(); } };
    const away = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setMenu(false); };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", away);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("pointerdown", away); };
  }, [menu]);

  // Moods: naps after a quiet spell, wakes up pleased, and is startled by a fast scroll.
  useEffect(() => {
    let nap = 0, lastY = window.scrollY, lastTime = performance.now();
    const rest = () => { window.clearTimeout(nap); nap = window.setTimeout(() => feel("sleep"), 25000); };
    const stir = () => {
      if (moodRef.current === "sleep") { feel("happy", 1400); say("Oh! I’m awake, I’m awake.", 1800); }
      rest();
    };
    const scroll = () => {
      const now = performance.now();
      const speed = Math.abs(window.scrollY - lastY) / Math.max(now - lastTime, 1);
      lastY = window.scrollY;
      lastTime = now;
      if (speed > 5 && moodRef.current === "idle") feel("whoa", 800);
      stir();
    };
    rest();
    window.addEventListener("pointermove", stir, { passive: true });
    window.addEventListener("keydown", stir);
    window.addEventListener("touchstart", stir, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.clearTimeout(nap);
      window.removeEventListener("pointermove", stir);
      window.removeEventListener("keydown", stir);
      window.removeEventListener("touchstart", stir);
      window.removeEventListener("scroll", scroll);
    };
  }, [feel, say]);

  // Eyes follow the pointer.
  useEffect(() => {
    const element = root.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const look = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = element.getBoundingClientRect();
        const dx = event.clientX - (bounds.right - 40);
        const dy = event.clientY - (bounds.bottom - 50);
        const length = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, length / 240) * 3;
        element.style.setProperty("--look-x", `${(dx / length) * reach}px`);
        element.style.setProperty("--look-y", `${(dy / length) * reach}px`);
      });
    };
    window.addEventListener("pointermove", look, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", look); };
  }, []);

  // Drag and fling: past a few pixels a press becomes a drag; on release Bit springs home.
  useEffect(() => {
    const element = root.current;
    const handle = bot.current;
    if (!element || !handle) return;
    let pressed = false, dragging = false, startX = 0, startY = 0, lastX = 0;
    const down = (event: PointerEvent) => {
      pressed = true;
      dragging = false;
      startX = lastX = event.clientX;
      startY = event.clientY;
      handle.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!pressed) return;
      const dx = event.clientX - startX, dy = event.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) > 6) { dragging = true; gsap.killTweensOf(element); feel("whoa"); }
      if (!dragging) return;
      const lean = Math.max(-28, Math.min(28, (event.clientX - lastX) * 2));
      lastX = event.clientX;
      gsap.set(element, { x: dx, y: dy, rotation: lean });
    };
    const up = () => {
      if (!pressed) return;
      pressed = false;
      if (!dragging) return;
      dragged.current = true;
      gsap.to(element, { x: 0, y: 0, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.4)" });
      feel("happy", 1500);
      say("Wheee!", 1400);
    };
    handle.addEventListener("pointerdown", down);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
    return () => {
      handle.removeEventListener("pointerdown", down);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      gsap.killTweensOf(element);
    };
  }, [feel, say]);

  // Hovering for a moment counts as a pat.
  const patTimer = useRef(0);
  const patStart = () => { patTimer.current = window.setTimeout(() => { if (moodRef.current === "idle") feel("happy", 1600); }, 900); };
  const patEnd = () => window.clearTimeout(patTimer.current);

  const press = () => {
    if (dragged.current) { dragged.current = false; return; }
    if (touring) { stopTour(); return; }
    setSpeech(null);
    setMenu(open => !open);
  };

  const showMenu = menu && !hidden;
  const showSpeech = Boolean(speech) && !hidden && !showMenu;
  const eyes = {
    idle: (
      <g className={styles.botEyes}>
        <ellipse cx="31" cy="39" rx="5" ry="6.5" fill="#cbbcff" />
        <ellipse cx="49" cy="39" rx="5" ry="6.5" fill="#cbbcff" />
        <circle cx="32.5" cy="37" r="1.6" fill="#fff" />
        <circle cx="50.5" cy="37" r="1.6" fill="#fff" />
      </g>
    ),
    happy: <path d="M26 41l5-5.5 5 5.5M44 41l5-5.5 5 5.5" fill="none" stroke="#cbbcff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    sleep: <path d="M26 39q5 4 10 0M44 39q5 4 10 0" fill="none" stroke="#cbbcff" strokeWidth="2.6" strokeLinecap="round" />,
    whoa: (
      <g className={styles.botEyes}>
        <circle cx="31" cy="38" r="7" fill="#cbbcff" />
        <circle cx="49" cy="38" r="7" fill="#cbbcff" />
        <circle cx="31" cy="38" r="2.4" fill="#140a3a" />
        <circle cx="49" cy="38" r="2.4" fill="#140a3a" />
      </g>
    ),
  }[mood];
  const mouth = mood === "whoa"
    ? <ellipse className={styles.botMouth} cx="40" cy="50" rx="3.2" ry="3.6" fill="#cbbcff" />
    : mood === "sleep"
      ? <path className={styles.botMouth} d="M36 50h8" stroke="#cbbcff" strokeWidth="2.2" strokeLinecap="round" />
      : <path className={styles.botMouth} d="M34 49c3.5 3 8.5 3 12 0" fill="none" stroke="#cbbcff" strokeWidth="2.2" strokeLinecap="round" />;

  return (
    <div ref={root} className={styles.companion} data-hidden={hidden ? "true" : undefined} data-mood={mood}
      data-talking={touring ? "true" : undefined} data-waving={waving.has(active) && mood === "idle" && !touring ? "true" : undefined}>
      {!showMenu && !showSpeech && <p key={`line-${active}-${hidden}`} className={styles.bubble} aria-hidden="true">{lines[active] ?? lines.home}</p>}
      {showSpeech && (
        <div key={speech} className={styles.botSpeech} role="status">
          <p>{speech}</p>
          {touring && <button type="button" onClick={stopTour}>Stop the tour</button>}
        </div>
      )}
      {showMenu && (
        <div id="bit-menu" className={styles.botPanel} role="group" aria-label="Ask Bit">
          <p>What shall we do?</p>
          <button type="button" className={styles.botTour} onClick={startTour}><Play size={16} />Give me the guided tour</button>
          <button type="button" onClick={surprise}><Shuffle size={16} />Surprise me with a project</button>
          <button type="button" onClick={copyEmail}><Copy size={16} />Copy Dishan’s email</button>
          <a href={profile.resume} download="DISHAN_BASHITHA.pdf" onClick={() => setMenu(false)}><FileDown size={16} />Grab the résumé</a>
          <button type="button" onClick={() => { setMenu(false); onNext(); }}>
            {active === "contact" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}{active === "contact" ? "Back to the top" : "Next section"}
          </button>
        </div>
      )}
      <button ref={bot} type="button" className={styles.bot} onClick={press} onPointerEnter={patStart} onPointerLeave={patEnd}
        aria-label={touring ? "Stop the tour" : "Ask Bit, the guide"} aria-expanded={showMenu} aria-controls="bit-menu">
        <span className={styles.botZ} aria-hidden="true"><i>z</i><i>z</i><i>z</i></span>
        <span className={styles.botHeart} aria-hidden="true">♥</span>
        <span key={active} className={styles.botHop}>
          <svg viewBox="0 0 80 100" aria-hidden="true">
            <defs>
              <linearGradient id="bit-shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a58bff" /><stop offset="1" stopColor="#5b2be0" /></linearGradient>
              <radialGradient id="bit-glow"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#cbbcff" stopOpacity="0" /></radialGradient>
            </defs>
            <ellipse className={styles.botShadow} cx="40" cy="96" rx="20" ry="3.5" />
            <line x1="40" y1="16" x2="40" y2="6" stroke="#cbbcff" strokeWidth="2.5" strokeLinecap="round" />
            <circle className={styles.botTip} cx="40" cy="5" r="4.5" fill="url(#bit-glow)" />
            <g className={styles.botArmLeft}><rect x="12" y="66" width="8" height="20" rx="4" fill="#6b3cf2" /></g>
            <g className={styles.botArmRight}><rect x="60" y="66" width="8" height="20" rx="4" fill="#6b3cf2" /></g>
            <rect x="22" y="62" width="36" height="28" rx="11" fill="url(#bit-shell)" />
            <circle cx="40" cy="75" r="4" fill="#e9dcff" opacity=".85" />
            <rect x="9" y="16" width="62" height="48" rx="19" fill="url(#bit-shell)" />
            <rect x="16" y="24" width="48" height="32" rx="13" fill="#140a3a" />
            {eyes}
            {mouth}
            <circle cx="22" cy="47" r="2.6" fill="#ff8fd0" opacity={mood === "happy" ? 0.95 : 0.55} />
            <circle cx="58" cy="47" r="2.6" fill="#ff8fd0" opacity={mood === "happy" ? 0.95 : 0.55} />
          </svg>
        </span>
      </button>
    </div>
  );
}
