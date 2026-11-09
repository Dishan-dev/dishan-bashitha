"use client";

import { gsap } from "gsap";
import { Great_Vibes } from "next/font/google";
import { useEffect, useLayoutEffect, useRef } from "react";
import { reducedQuery } from "@/lib/motion";
import styles from "./Loader.module.css";

const script = Great_Vibes({ weight: "400", subsets: ["latin"] });
const name = "Dishan Bashitha";
const [first, last] = name.split(" ");
// Long enough for the name to be written out in full before the curtain lifts.
const minimum = 2.8;
const maximum = 6;

/**
 * Visitors from a shared link (LinkedIn's in-app browser, a ?ref=linkedin or utm_source link, or a
 * case-study address) get a brisk curtain: they came for something specific and leave quickly.
 */
function isQuickVisit() {
  const params = new URLSearchParams(window.location.search);
  const source = `${params.get("ref") ?? ""} ${params.get("utm_source") ?? ""}`.toLowerCase();
  return source.includes("linkedin") || /LinkedInApp/i.test(navigator.userAgent) || window.location.pathname.startsWith("/projects/");
}

/** Sections hold their entrance until the loader has lifted. */
export const loadedEvent = "flow:loaded";
export const isLoading = () => document.documentElement.hasAttribute("data-flow-loading");

/**
 * The opening curtain: the name is written out in script by a pen and underlined with a
 * flourish while a counter follows real progress (fonts and the cover images). At 100 the
 * signature lifts away and the curtain rolls up to reveal the cover.
 */
/**
 * Writes the name left to right: a feathered mask sweeps across the script while a pen tip rides
 * its edge, bobbing over the letters, then a flourish is drawn beneath. Returns a cleanup.
 */
function write(svg: SVGSVGElement | null, reduce: boolean, speed = 1) {
  const text = svg?.querySelector<SVGTextElement>("[data-sig-text]");
  const wipe = svg?.querySelector<SVGRectElement>("[data-sig-wipe]");
  const pen = svg?.querySelector<SVGCircleElement>("[data-sig-pen]");
  const flourish = svg?.querySelector<SVGPathElement>("[data-sig-flourish]");
  if (!svg || !text || !wipe || !pen || !flourish) return () => {};
  let timeline: gsap.core.Timeline | undefined;
  let cancelled = false;
  // Measure once the script face has arrived, so the sweep spans the real letters.
  document.fonts.load(`150px ${script.style.fontFamily}`).catch(() => undefined).then(() => {
    if (cancelled) return;
    const box = text.getBBox();
    const start = box.x - 12, span = box.width + 24;
    const underline = 168 + 34;
    flourish.setAttribute("d", `M ${start + span * 0.06} ${underline + 6} C ${start + span * 0.32} ${underline + 22}, ${start + span * 0.68} ${underline - 14}, ${start + span * 0.98} ${underline - 2}`);
    const length = flourish.getTotalLength();
    wipe.setAttribute("x", String(start));
    if (reduce) { wipe.setAttribute("width", String(span / 0.9)); return; }
    // Hidden until drawn: a zero-length dash would still show its round cap as a dot.
    gsap.set(flourish, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 });
    const ink = { at: 0 };
    timeline = gsap.timeline({ delay: 0.25 })
      .set(pen, { opacity: 1 })
      .to(ink, { at: 1, duration: 1.9, ease: "sine.inOut", onUpdate: () => {
        // The solid ink ends at 90% of the mask and the feather runs on; the pen leads from inside it.
        const width = (span * ink.at) / 0.9;
        wipe.setAttribute("width", String(width));
        pen.setAttribute("cx", String(start + width * 0.95));
        pen.setAttribute("cy", String(box.y + box.height * (0.52 + Math.sin(ink.at * 46) * 0.24)));
      } })
      .set(flourish, { opacity: 1 }, ">-0.05")
      .to(flourish, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, "<")
      .to(pen, { attr: { cx: start + span * 0.98, cy: underline - 2 }, duration: 0.55, ease: "power2.inOut" }, "<")
      .to(pen, { opacity: 0, duration: 0.4, ease: "power2.out" })
      .timeScale(speed);
  });
  return () => { cancelled = true; timeline?.kill(); };
}

export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const signature = useRef<SVGSVGElement>(null);

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

    const quick = isQuickVisit();
    const least = quick ? 1.2 : minimum, most = quick ? 3 : maximum;
    const writing = write(signature.current, reduce, quick ? 2.4 : 1);

    if (reduce) {
      let cancelled = false;
      Promise.race([Promise.all(tasks), new Promise(resolve => setTimeout(resolve, 2000))]).then(() => {
        if (cancelled) return;
        finish();
        gsap.to(element, { opacity: 0, duration: 0.3, onComplete: onDone });
      });
      return () => { cancelled = true; writing(); };
    }

    const shown = { value: 0 };
    const start = performance.now();
    let exiting = false;
    const render = () => {
      const value = Math.round(shown.value);
      if (count.current) count.current.textContent = String(value);
      if (bar.current) bar.current.style.transform = `scaleX(${shown.value / 100})`;
    };
    // The counter eases toward real progress but never outruns the minimum stage time.
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const real = elapsed > most ? 1 : done / tasks.length;
      const target = Math.min(real, elapsed / least) * 100;
      shown.value += (target - shown.value) * 0.12;
      if (target >= 100 && shown.value > 99.4) { shown.value = 100; exit(); }
      render();
    };
    const exit = () => {
      if (exiting) return;
      exiting = true;
      gsap.ticker.remove(tick);
      gsap.timeline({ defaults: { ease: "expo.inOut" }, onComplete: onDone })
        .to(signature.current, { yPercent: -40, opacity: 0, duration: 0.7, ease: "power3.in" }, 0)
        .to(element.querySelectorAll("[data-fade]"), { opacity: 0, y: -12, duration: 0.4, ease: "power2.in" }, 0)
        .to(element, { clipPath: "inset(0% 0% 100% 0% round 0 0 48px 48px)", duration: 1.05 }, 0.55)
        .add(finish, 0.8);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); writing(); };
  }, [onDone]);

  return (
    <div ref={root} data-loader className={styles.loader} role="status" aria-live="polite" aria-label="Loading Dishan Bashitha’s portfolio">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.center} aria-hidden="true">
        <p data-fade className={styles.eyebrow}>Software Engineer · Sri Lanka</p>
        <svg ref={signature} className={styles.signature} viewBox="0 0 1000 260">
          <defs>
            {/* The written part is white; its leading edge feathers out like wet ink. */}
            <linearGradient id="loader-feather" x1="0" y1="0" x2="1" y2="0"><stop offset=".9" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
            <mask id="loader-write" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="260"><rect data-sig-wipe x="0" y="0" width="0" height="260" fill="url(#loader-feather)" /></mask>
          </defs>
          <g mask="url(#loader-write)">
            {/* Two-tone like the cover's headline: the surname in lilac. */}
            <text data-sig-text x="500" y="168" textAnchor="middle" className={styles.ink} style={{ fontFamily: script.style.fontFamily, fontSize: 150 }}>
              {first} <tspan className={styles.inkDim}>{last}</tspan>
            </text>
          </g>
          <path data-sig-flourish className={styles.flourish} d="" />
          <circle data-sig-pen className={styles.pen} r="3.5" cx="0" cy="0" />
        </svg>
      </div>

      <div data-fade className={styles.foot} aria-hidden="true">
        <span className={styles.count}><span ref={count}>0</span><small>%</small></span>
        <span className={styles.track}><span ref={bar} /></span>
        <span className={styles.label}>Portfolio ’26</span>
      </div>
    </div>
  );
}
