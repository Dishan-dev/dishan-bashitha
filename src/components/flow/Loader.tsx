"use client";

import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { reducedQuery } from "@/lib/motion";
import styles from "./Loader.module.css";

const name = "Dishan Bashitha";
const statuses = ["Loading experiences", "Composing the stage", "Tuning the motion", "Almost there"];
const minimum = 1.6;
const maximum = 6;

/** Sections hold their entrance until the loader has lifted. */
export const loadedEvent = "flow:loaded";
export const isLoading = () => document.documentElement.hasAttribute("data-flow-loading");

/**
 * The opening curtain: the name rises letter by letter around a spinning star while a counter
 * follows real progress (fonts and the cover images). At 100 the letters lift away, the star
 * bursts, and the curtain rolls up to reveal the cover.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const status = useRef<HTMLSpanElement>(null);

  // Marked before any section sets up its entrance, so they wait for the reveal.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-flow-loading", "");
    return () => document.documentElement.removeAttribute("data-flow-loading");
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduce = window.matchMedia(reducedQuery).matches;
    const finish = () => {
      document.documentElement.removeAttribute("data-flow-loading");
      window.dispatchEvent(new Event(loadedEvent));
    };

    // Real progress: fonts plus every image displayed on the cover. Lazy images inside hidden
    // parts of the layout never load, so they are not counted.
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("#home img")).filter(image => image.getClientRects().length > 0);
    const tasks = [document.fonts?.ready ?? Promise.resolve(), ...images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    }))];
    let done = 0;
    tasks.forEach(task => task.then(() => { done += 1; }));

    if (reduce) {
      let cancelled = false;
      Promise.race([Promise.all(tasks), new Promise(resolve => setTimeout(resolve, 2000))]).then(() => {
        if (cancelled) return;
        finish();
        gsap.to(element, { opacity: 0, duration: 0.3, onComplete: onDone });
      });
      return () => { cancelled = true; };
    }

    const shown = { value: 0 };
    const start = performance.now();
    let exiting = false;
    let lastStatus = -1;
    const render = () => {
      const value = Math.round(shown.value);
      if (count.current) count.current.textContent = String(value).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown.value / 100})`;
      const index = Math.min(statuses.length - 1, Math.floor(shown.value / 26));
      if (status.current && index !== lastStatus) { status.current.textContent = statuses[index]; lastStatus = index; }
    };
    // The counter eases toward real progress but never outruns the minimum stage time.
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const real = elapsed > maximum ? 1 : done / tasks.length;
      const target = Math.min(real, elapsed / minimum) * 100;
      shown.value += (target - shown.value) * 0.12;
      if (target >= 100 && shown.value > 99.4) { shown.value = 100; exit(); }
      render();
    };
    const exit = () => {
      if (exiting) return;
      exiting = true;
      gsap.ticker.remove(tick);
      gsap.timeline({ defaults: { ease: "expo.inOut" }, onComplete: onDone })
        .to(element.querySelectorAll("[data-char]"), { yPercent: -110, duration: 0.7, stagger: 0.025, ease: "power3.in" }, 0)
        .to(element.querySelectorAll("[data-fade]"), { opacity: 0, y: -12, duration: 0.4, ease: "power2.in" }, 0)
        .to(element.querySelector("[data-star]"), { scale: 9, rotation: 135, opacity: 0, duration: 1.1 }, 0.15)
        .to(element, { clipPath: "inset(0% 0% 100% 0% round 0 0 48px 48px)", duration: 1.05 }, 0.55)
        .add(finish, 0.8);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); };
  }, [onDone]);

  let index = 0;
  return (
    <div ref={root} className={styles.loader} role="status" aria-live="polite" aria-label="Loading Dishan Bashitha’s portfolio">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.orbit} aria-hidden="true"><span /><span /></div>

      <div className={styles.center} aria-hidden="true">
        <svg data-star className={styles.star} viewBox="0 0 200 200"><path d="M100 0C108 62 138 92 200 100C138 108 108 138 100 200C92 138 62 108 0 100C62 92 92 62 100 0Z" /></svg>
        <p className={styles.name}>
          {name.split(" ").map((word, wordIndex) => (
            <span key={word} className={styles.word} data-dim={wordIndex ? "true" : undefined}>
              {word.split("").map(char => <span key={index} className={styles.mask}><span data-char className={styles.char} style={{ "--i": index++ } as CSSProperties}>{char}</span></span>)}
            </span>
          ))}
        </p>
        <p data-fade className={styles.role}>Software Engineer <i /> Portfolio ’26</p>
      </div>

      <div data-fade className={styles.foot} aria-hidden="true">
        <span ref={count} className={styles.count}>000</span>
        <span className={styles.status}><i /><span ref={status}>{statuses[0]}</span></span>
      </div>
      <span data-fade className={styles.track} aria-hidden="true"><span ref={bar} /></span>
    </div>
  );
}
