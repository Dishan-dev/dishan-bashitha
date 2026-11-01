"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { Scene } from "@/components/portfolio/Scene";
import { SceneLabel } from "@/components/ui/SceneLabel";
import type { Choreography } from "@/hooks/useSceneMotion";

const channels = [
  { label: "Email", text: profile.email, href: `mailto:${profile.email}` },
  { label: "Phone", text: profile.phone, href: profile.phoneHref },
  { label: "LinkedIn", text: "Connect with me", href: profile.linkedin },
  { label: "GitHub", text: "Explore my code", href: profile.github },
  { label: "Resume", text: "Download résumé (PDF)", href: profile.resume },
] as const;

const viewportX = (amount: number) => () => window.innerWidth * amount;
const viewportY = (amount: number) => () => window.innerHeight * amount;

/**
 * The closing frame gathers the journey's motifs: the cover's orbit rings, the section
 * ring, the portal star, and stray accent dots sweep in from across the viewport and
 * converge on the orb while the headline rises and a drawn underline signs it off.
 */
const contactChoreography: Choreography = ({ enter }) => {
  enter(".contact-backdrop", { scale: 1.35, yPercent: 12, opacity: 0 }, { end: 0.9, compact: false });
  enter(".contact-converge-orbit", { scale: 4.8, x: viewportX(-0.34), y: viewportY(-0.62), rotation: -24, opacity: 0 }, { end: 0.92, compact: false });
  enter(".contact-converge-ring", { scale: 3.2, x: viewportX(0.18), y: viewportY(-0.8), rotation: 70 }, { start: 0.05, end: 0.95, compact: false });
  enter(".contact-converge-star", { scale: 2.6, x: viewportX(-0.12), y: viewportY(-0.72), rotation: -140, opacity: 0 }, { start: 0.1, end: 1, compact: false });
  enter(".contact-converge-dot", { x: (index: number) => window.innerWidth * [-0.42, 0.3, -0.2][index], y: (index: number) => window.innerHeight * [-0.5, -0.66, -0.9][index], scale: 2.4 }, { start: 0.1, end: 0.9, compact: false });
  enter(".contact-orb", { scale: 0.35, opacity: 0 }, { start: 0.45, end: 1, compact: false });
  enter(".contact-heading-line > span", { yPercent: 110, stagger: 0.1 }, { start: 0.25, end: 0.88 });
  enter(".contact-underline path", { strokeDashoffset: 1 }, { start: 0.82, end: 1 });
  enter(".contact-lede, .contact-channel", { x: 30, opacity: 0, stagger: 0.05 }, { start: 0.5, end: 1, compact: { x: 16, opacity: 0 } });
  enter(".contact-footer > *", { y: 16, opacity: 0, stagger: 0.08 }, { start: 0.7, end: 1, compact: false });
};

export function ContactScene() {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => () => { if (copyTimer.current) window.clearTimeout(copyTimer.current); }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const returnToBeginning = () => window.dispatchEvent(new CustomEvent("portfolio:restart"));

  return (
    <Scene id="contact" eyebrow="" className="contact-scene relative isolate bg-[var(--background)] p-0 text-[var(--foreground)]" choreography={contactChoreography}>
      <div aria-hidden="true" className="contact-backdrop"><span /><span /></div>
      <div aria-hidden="true" className="contact-converge">
        <span className="contact-converge-orbit" />
        <span className="contact-converge-ring" />
        <svg className="contact-converge-star" viewBox="0 0 100 100"><path d="M50 0C55 30 70 45 100 50C70 55 55 70 50 100C45 70 30 55 0 50C30 45 45 30 50 0Z" /></svg>
        <span className="contact-converge-dot" /><span className="contact-converge-dot" /><span className="contact-converge-dot" />
        <span className="contact-orb" />
      </div>

      <div className="relative z-10 flex h-full flex-col px-[var(--space-2)] pb-[clamp(6rem,12svh,8.5rem)] pt-[clamp(6.5rem,11svh,8.5rem)] sm:px-[var(--space-4)]">
        <SceneLabel sceneId="contact" />

        <div className="contact-grid">
          <div>
            <h1 id="contact-title" className="max-w-[10ch] text-[clamp(3.5rem,6.45vw,7.35rem)] font-semibold leading-[0.84] tracking-[-0.085em]">
              <span className="contact-heading-line"><span>Have something</span></span>
              <span className="contact-heading-line"><span className="text-[var(--accent)]">interesting</span></span>
              <span className="contact-heading-line"><span>in mind?</span></span>
              <span className="contact-heading-line contact-heading-line--signed"><span><span className="relative inline-block">Let&apos;s build it.<svg aria-hidden="true" className="contact-underline" viewBox="0 0 300 26" fill="none" preserveAspectRatio="none"><path d="M4 17C58 9 121 5 182 7c42 1.4 79 5 113 2.5M30 22c66-6 150-8 228-3" pathLength={1} stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" /></svg></span></span></span>
            </h1>
            <p className="contact-lede mt-7 max-w-md text-sm leading-relaxed text-[var(--muted)]">Open to meaningful projects, collaborations and conversations around software, products and creative technology.</p>
          </div>

          <div className="space-y-1">
            {channels.map((channel) => <div key={channel.label} className="contact-channel border-t border-[var(--foreground)]/20 py-3 first:border-t-0 first:pt-0"><p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">{channel.label}</p><div className="mt-1.5 flex flex-col items-start gap-2"><a data-magnetic href={channel.href} download={channel.label === "Resume" ? "DISHAN_BASHITHA.pdf" : undefined} target={channel.href.startsWith("https:") ? "_blank" : undefined} rel={channel.href.startsWith("https:") ? "noopener noreferrer" : undefined} className="group inline-flex items-center gap-2 border-b border-[var(--foreground)]/30 pb-1 break-all text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"><span>{channel.text}</span><span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></a>{channel.label === "Email" && <button type="button" onClick={copyEmail} className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]">{copied ? "Copied ✓" : "Copy email"}</button>}</div></div>)}
          </div>
        </div>

        <footer className="contact-footer flex items-end justify-between gap-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]"><p>Based in {profile.location}<br />Available for interesting builds &amp; collaborations</p><button type="button" onClick={returnToBeginning} className="border-b border-[var(--foreground)]/30 pb-1 text-right transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">Back to beginning ↗</button></footer>
      </div>
    </Scene>
  );
}
