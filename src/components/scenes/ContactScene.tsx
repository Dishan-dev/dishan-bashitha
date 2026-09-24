"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect, useRef, useState } from "react";
import { Scene } from "@/components/portfolio/Scene";

const channels = [
  { label: "Email", text: "dshnz029@gmail.com", href: "mailto:dshnz029@gmail.com" },
  { label: "LinkedIn", text: "Connect with me", href: "https://linkedin.com/in/dishanbashitha" },
  { label: "GitHub", text: "Explore my code", href: "https://github.com/Dishan-dev" },
  { label: "Resume", text: "Request résumé", href: "mailto:dshnz029@gmail.com?subject=Resume%20request" },
] as const;

const editorialEase = [0.22, 1, 0.36, 1] as const;

export function ContactScene() {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const returnTimer = useRef<number | null>(null);

  useEffect(() => () => { if (returnTimer.current) window.clearTimeout(returnTimer.current); }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("dshnz029@gmail.com");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const returnToBeginning = () => {
    if (isReturning) return;
    setIsReturning(true);
    const restart = () => window.dispatchEvent(new CustomEvent("portfolio:restart"));
    if (reduceMotion) restart();
    else returnTimer.current = window.setTimeout(restart, 620);
  };

  return (
    <Scene id="contact" eyebrow="" className="relative isolate overflow-hidden bg-[var(--background)] p-0 text-[var(--foreground)]">
      <motion.div aria-hidden="true" animate={isReturning ? { scale: 16, opacity: 1 } : reduceMotion ? undefined : { scale: [1, 1.05, 1], y: [0, -5, 0] }} transition={isReturning ? { duration: 0.62, ease: editorialEase } : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[clamp(5.5rem,10svh,7.5rem)] left-[clamp(52%,57vw,64%)] z-0 h-[clamp(4.5rem,7vw,7rem)] w-[clamp(4.5rem,7vw,7rem)] rounded-full border border-[var(--accent)]/40 bg-[var(--accent)] shadow-[0_0_0_1rem_rgba(118,82,212,0.08)]" />

      <motion.div animate={isReturning ? { opacity: 0, scale: 0.98, y: -12 } : { opacity: 1, scale: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.42, ease: editorialEase }} className="relative z-10 flex h-full flex-col px-[var(--space-2)] pb-[clamp(6rem,12svh,8.5rem)] pt-[clamp(6.5rem,11svh,8.5rem)] sm:px-[var(--space-4)]">
        <div className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]"><span className="text-[var(--foreground)]">Contact / 06</span><span className="h-px w-8 bg-[var(--foreground)]/20" /><span>Available for considered work</span></div>

        <div className="my-auto grid items-center gap-[clamp(2rem,6vw,7rem)] md:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.58fr)]">
          <div>
            <motion.h1 id="contact-title" initial={reduceMotion ? false : { y: 56, clipPath: "inset(0 0 100% 0)" }} animate={{ y: 0, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.08, ease: editorialEase }} className="max-w-[10ch] text-[clamp(3.5rem,6.45vw,7.35rem)] font-semibold leading-[0.84] tracking-[-0.085em]">Have something<br /><span className="text-[var(--accent)]">interesting</span><br />in mind?<br /><span className="text-[var(--foreground)]">Let&apos;s build it.</span></motion.h1>
            <motion.p initial={reduceMotion ? false : { y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.42, ease: editorialEase }} className="mt-7 max-w-md text-sm leading-relaxed text-[var(--muted)]">Open to meaningful projects, collaborations and conversations around software, products and creative technology.</motion.p>
          </div>

          <motion.div initial={reduceMotion ? false : { x: 26, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.62, delay: reduceMotion ? 0 : 0.5, ease: editorialEase }} className="space-y-1">
            {channels.map((channel, index) => <div key={channel.label} className="border-t border-[var(--foreground)]/20 py-3 first:border-t-0 first:pt-0"><p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">{channel.label}</p><div className="mt-1.5 flex items-center justify-between gap-3"><a href={channel.href} target={channel.label === "Email" || channel.label === "Resume" ? undefined : "_blank"} rel={channel.label === "Email" || channel.label === "Resume" ? undefined : "noreferrer"} className="group inline-flex items-center gap-2 border-b border-[var(--foreground)]/30 pb-1 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"><span>{channel.text}</span><span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></a>{index === 0 && <button type="button" onClick={copyEmail} className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]">{copied ? "Copied ✓" : "Copy email"}</button>}</div></div>)}
          </motion.div>
        </div>

        <footer className="flex items-end justify-between gap-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]"><p>Based in Sri Lanka<br />Available for interesting builds &amp; collaborations</p><button type="button" onClick={returnToBeginning} className="border-b border-[var(--foreground)]/30 pb-1 text-right transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">Back to beginning ↗</button></footer>
      </motion.div>
    </Scene>
  );
}
