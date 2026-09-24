"use client";

import dynamic from "next/dynamic";
import { Scene } from "@/components/portfolio/Scene";

const ParticleSphere = dynamic(() => import("@/components/motion/ParticleSphere").then((module) => module.ParticleSphere), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-full border border-[var(--inverse-text)]/20" />,
});

export function StatementScene() {
  return (
    <Scene id="statement" eyebrow="Core sphere / approach" className="relative flex flex-col inverse-surface bg-[var(--inverse-surface)] text-[var(--inverse-text)]">
      <div className="absolute left-1/2 top-1/2 h-[min(64vw,38rem)] w-[min(64vw,38rem)] -translate-x-1/2 -translate-y-1/2 opacity-90"><ParticleSphere /></div>
      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <h1 id="statement-title" className="max-w-4xl text-[clamp(3.6rem,8.8vw,9rem)] font-medium leading-[0.81] tracking-[-0.085em]">CRAFTING<br />RESILIENT SYSTEMS<br /><span className="ml-[clamp(1rem,7vw,8rem)]">AND HIGH-FIDELITY</span><br />DIGITAL EXPERIENCES.</h1>
        <p className="ml-auto max-w-sm text-sm leading-relaxed text-[var(--inverse-text)]/65">I bring engineering, product thinking, and creative direction together to make digital systems clear, durable, and memorable.</p>
      </div>
    </Scene>
  );
}
