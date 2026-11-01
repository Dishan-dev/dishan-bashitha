"use client";

import { useEffect, useRef, type RefObject } from "react";
import { reducedQuery } from "@/lib/motion";

const rgb = (hex: string) => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));

/**
 * A Fibonacci sphere of points drawn to a 2D canvas in the given tint. `progress` (0–1) grows
 * the sphere and then disperses it; the pointer tilts it. It only animates while visible.
 */
export function ParticleField({ tint, progress, className }: { tint: string; progress: RefObject<number>; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const host = surface?.parentElement;
    const context = surface?.getContext("2d");
    if (!surface || !host || !context) return;
    const reduce = window.matchMedia(reducedQuery).matches;
    const [r, g, b] = rgb(tint);
    const front = `${Math.round(r + (255 - r) * 0.75)},${Math.round(g + (255 - g) * 0.75)},${Math.round(b + (255 - b) * 0.75)}`;
    const back = `${r},${g},${b}`;
    const count = window.innerWidth < 720 ? 900 : 1700;
    const points = Array.from({ length: count }, (_, index) => {
      const y = 1 - (index / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = index * 2.39996;
      return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, spread: 0.6 + (((index * 7919) % 100) / 100) * 2.4 };
    });
    let width = 0, height = 0, rotation = 0, tilt = 0.35, targetTilt = 0.35, nudge = 0, frame = 0, running = false;
    const size = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth; height = host.clientHeight;
      surface.width = width * ratio; surface.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = () => {
      rotation += reduce ? 0 : 0.0032 + nudge;
      nudge *= 0.95;
      tilt += (targetTilt - tilt) * 0.05;
      context.clearRect(0, 0, width, height);
      const value = progress.current ?? 0.35;
      const base = Math.min(width, height) * (0.16 + Math.min(value, 0.6) * 0.3) * (width < 900 ? 0.75 : 1);
      const spread = Math.max(0, value - 0.45) / 0.55;
      const cosR = Math.cos(rotation), sinR = Math.sin(rotation), cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      // Sits in the open space above and right of the hero copy; beside the title on narrow screens.
      const narrow = width < 900;
      const cx = width * (narrow ? 0.78 : 0.72), cy = narrow ? Math.min(height * 0.2, 200) : height * 0.32;
      for (const point of points) {
        const x = point.x * cosR - point.z * sinR;
        let z = point.x * sinR + point.z * cosR;
        const y = point.y * cosT - z * sinT;
        z = point.y * sinT + z * cosT;
        const scale = (1 + spread * spread * point.spread * 3) * (1.6 / (2.4 - z));
        const alpha = (0.25 + (z + 1) * 0.35) * (1 - spread * 0.7);
        const dot = (0.6 + (z + 1) * 0.7) * (1 + spread * 0.6);
        context.fillStyle = `rgba(${z > 0.2 ? front : back},${alpha})`;
        context.fillRect(cx + x * base * scale, cy + y * base * scale, dot, dot);
      }
      if (running && !reduce) frame = requestAnimationFrame(draw);
    };
    const pointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      targetTilt = 0.35 + ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.6;
      nudge = Math.max(-0.02, Math.min(0.02, nudge + event.movementX * 0.00006));
    };
    const resize = () => { size(); if (!running || reduce) draw(); };
    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (running) draw();
    });
    size();
    draw();
    observer.observe(host);
    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", pointer);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("resize", resize); host.removeEventListener("pointermove", pointer); };
  }, [tint, progress]);

  return <canvas ref={canvas} aria-hidden="true" className={className} />;
}
