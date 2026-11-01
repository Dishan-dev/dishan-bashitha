"use client";

import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Box, Code2, GraduationCap, Sparkles, UserRound } from "lucide-react";
import Image from "next/image";
import { FaJava, FaNodeJs, FaReact } from "react-icons/fa6";
import { SiJavascript, SiSpringboot, SiTypescript } from "react-icons/si";
import { useState } from "react";
import { portfolioMotion } from "@/lib/motion";
import { Scene } from "@/components/portfolio/Scene";
import type { Choreography } from "@/hooks/useSceneMotion";
import { SceneLabel } from "@/components/ui/SceneLabel";
import { projects } from "@/data/projects";

type IntroSceneProps = { isReady?: boolean; onEnter?: () => void; onNavigate?: (index: number) => void };
const featuredProject = projects[0];
const navItems = [{ label: "Work", index: 2 }, { label: "Experience", index: 5 }, { label: "Projects", index: 3 }, { label: "About", index: 1 }, { label: "Contact", index: 6 }];
const capabilities = [
  { label: ["Clean", "Architecture"], icon: Box },
  { label: ["Scalable", "Solutions"], icon: Code2 },
  { label: ["User", "Focused"], icon: UserRound },
  { label: ["Always", "Learning"], icon: GraduationCap },
];
const technologies = [
  { label: "Java", icon: FaJava, className: "text-[#d75b34]" },
  { label: "JavaScript", icon: SiJavascript, className: "text-[#d6a900]" },
  { label: "TypeScript", icon: SiTypescript, className: "text-[#2877c8]" },
  { label: "React", icon: FaReact, className: "text-[#2e9dcd]" },
  { label: "Spring Boot", icon: SiSpringboot, className: "text-[#5c9f43]" },
  { label: "Node.js", icon: FaNodeJs, className: "text-[#539e43]" },
];
const editorialEase = portfolioMotion.ease;

/**
 * As About slides over the cover, its layers part at different depths: the headline lifts
 * and recedes, the portrait rises a little forward, and the colour panel sinks away.
 * Motion owns hover and entrance transforms, so scroll moves inner or neighbouring layers.
 */
const introChoreography: Choreography = ({ exit }) => {
  exit(".intro-heading", { yPercent: -22, scale: 0.94, transformOrigin: "0% 0%" });
  exit(".intro-impact > *", { yPercent: -45, stagger: 0.05 });
  exit(".intro-portrait img", { yPercent: -5, scale: 1.05, transformOrigin: "50% 100%" });
  exit(".intro-color-panel", { yPercent: 16, scaleX: 0.95 });
  exit(".intro-orbits", { scale: 1.16, rotation: 6, yPercent: -6 });
  exit(".intro-bio > *, .intro-featured > *", { y: -56, stagger: 0.03 });
};

/** Reference-inspired full-viewport cover; all content belongs to one composed frame. */
export function IntroScene({ isReady = true, onEnter = () => undefined, onNavigate = () => undefined }: IntroSceneProps) {
  const reduceMotion = useReducedMotion();
  const tiltX = useSpring(0, { stiffness: 90, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 90, damping: 20 });
  const [isPortraitHovered, setIsPortraitHovered] = useState(false);
  const revealX = useMotionValue(50);
  const revealY = useMotionValue(46);
  const mask = useMotionTemplate`radial-gradient(circle min(25vw, 13rem) at ${revealX}% ${revealY}%, #000 0%, #000 48%, transparent 72%)`;
  const revealLeft = useMotionTemplate`${revealX}%`;
  const revealTop = useMotionTemplate`${revealY}%`;
  const backgroundX = useSpring(0, { stiffness: 55, damping: 22 });
  const backgroundY = useSpring(0, { stiffness: 55, damping: 22 });
  const glowX = useTransform(backgroundX, value => value * 48);
  const glowY = useTransform(backgroundY, value => value * 36);
  const orbitX = useTransform(backgroundX, value => value * -32);
  const orbitY = useTransform(backgroundY, value => value * -24);
  const orbitRotate = useTransform(backgroundX, value => value * 7);
  const innerX = useTransform(backgroundX, value => value * 42);
  const innerY = useTransform(backgroundY, value => value * 28);
  const dotX = useTransform(backgroundX, value => value * -60);
  const dotY = useTransform(backgroundY, value => value * -48);

  return (
    <Scene
      id="intro"
      eyebrow=""
      className="relative isolate p-0"
      choreography={introChoreography}
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        backgroundX.set((event.clientX - bounds.left) / bounds.width - 0.5);
        backgroundY.set((event.clientY - bounds.top) / bounds.height - 0.5);
      }}
      onPointerLeave={() => { backgroundX.set(0); backgroundY.set(0); }}
    >
      <header aria-hidden="true" className="hidden">
        <button type="button" onClick={() => onNavigate(0)} className="text-left text-[clamp(0.9rem,1.2vw,1.25rem)] font-semibold uppercase leading-none tracking-[-0.04em]">
          Dishan Bashitha
          <span className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[9px] font-normal normal-case tracking-normal text-[var(--accent)]"><i className="h-2 w-2 rounded-full bg-[var(--accent-fill)]" />Software Engineer</span>
        </button>
        <nav aria-label="Portfolio sections" className="hidden items-center gap-[clamp(1.25rem,3vw,3.5rem)] md:flex">
          {navItems.map((item) => <button key={item.label} type="button" onClick={() => onNavigate(item.index)} className="text-sm font-medium hover:text-[var(--accent)]">{item.label}</button>)}
        </nav>
        <button type="button" onClick={onEnter} className="rounded-full bg-[var(--accent-fill)] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]">Let&apos;s Connect <span aria-hidden="true" className="ml-2">↗</span></button>
      </header>

      <div aria-hidden="true" className="intro-orbits pointer-events-none absolute inset-0 -z-20">
        <motion.div
          style={{ x: reduceMotion ? 0 : glowX, y: reduceMotion ? 0 : glowY }}
          transition={{ type: "spring", stiffness: 45, damping: 18, mass: 0.8 }}
          className="absolute -left-[15%] top-[8%] h-[min(56vw,58rem)] w-[min(56vw,58rem)] rounded-full bg-[radial-gradient(circle,rgba(118,82,212,0.12)_0%,rgba(118,82,212,0.045)_42%,transparent_70%)]"
        />
        <motion.div
          style={{ x: reduceMotion ? 0 : orbitX, y: reduceMotion ? 0 : orbitY, rotate: reduceMotion ? 0 : orbitRotate }}
          transition={{ type: "spring", stiffness: 55, damping: 18, mass: 0.8 }}
          className="absolute left-1/2 top-[16svh] h-[min(37vw,38rem)] w-[min(62vw,64rem)] -translate-x-1/2 rounded-[50%] border border-[var(--accent)]/15"
        />
        <motion.div
          style={{ x: reduceMotion ? 0 : innerX, y: reduceMotion ? 0 : innerY }}
          transition={{ type: "spring", stiffness: 62, damping: 18, mass: 0.8 }}
          className="absolute left-1/2 top-[25svh] h-[min(21vw,22rem)] w-[min(50vw,52rem)] -translate-x-1/2 rounded-[50%] border border-[var(--accent)]/12"
        />
        <motion.div
          style={{ x: reduceMotion ? 0 : dotX, y: reduceMotion ? 0 : dotY, opacity: 0.5 }}
          transition={{ type: "spring", stiffness: 70, damping: 17, mass: 0.65 }}
          className="absolute right-[14%] top-[24svh] h-2.5 w-2.5 rounded-full bg-[var(--accent-fill)] shadow-[0_0_2rem_rgba(118,82,212,0.7)]"
        />
      </div>

      <div aria-hidden="true" className="intro-color-panel absolute inset-x-[clamp(0.75rem,1.7vw,1.8rem)] bottom-[clamp(1.75rem,3vw,2.5rem)] top-[47svh] -z-10 rounded-[clamp(1.6rem,3vw,3rem)] bg-[var(--accent-fill)]" />

      <motion.div initial={false} animate={{ opacity: isReady ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 1.05, ease: editorialEase, delay: reduceMotion ? 0 : 0.12 }} className="intro-heading absolute left-[clamp(1.75rem,4.2vw,4rem)] top-[18svh] z-20 max-w-[min(30rem,32vw)]">
        <SceneLabel sceneId="intro" className="mb-5" />
        <h1 id="intro-title" className="text-[clamp(3rem,5.6vw,6.8rem)] font-semibold leading-[0.86] tracking-[-0.09em]">{["I Build", "Digital", "Experiences"].map((line, index) => <span key={line} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]"><motion.span className={`block ${index ? "text-[var(--accent)]" : ""}`} initial={{ y: "105%", opacity: 0 }} animate={{ y: isReady ? "0%" : "105%", opacity: isReady ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.85, delay: reduceMotion ? 0 : 0.08 + index * 0.1, ease: editorialEase }}>{line}</motion.span></span>)}</h1>
      </motion.div>
      <motion.div initial={reduceMotion ? false : { scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 0 }} transition={{ scale: { duration: reduceMotion ? 0 : 0.65, ease: editorialEase, delay: reduceMotion ? 0 : 0.6 }, rotate: { duration: 0.8 } }} className="intro-sparkle absolute left-[clamp(20rem,25vw,31rem)] top-[22svh] z-20 text-[var(--accent)]"><Sparkles aria-hidden="true" size={46} strokeWidth={1.25} /></motion.div>

      <motion.div initial={reduceMotion ? false : { y: 20, opacity: 0 }} animate={{ y: isReady ? 0 : 20, opacity: isReady ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.8, ease: editorialEase, delay: reduceMotion ? 0 : 0.38 }} className="intro-impact absolute right-[clamp(1.75rem,5vw,5rem)] top-[19svh] z-20 w-[min(23rem,28vw)]">
        <p className="text-[clamp(2.5rem,4.4vw,5.5rem)] font-semibold leading-[0.88] tracking-[-0.08em]">That Make<br /><span className="text-[var(--accent)]">An Impact</span></p>
        <p className="mt-4 max-w-xs text-[clamp(0.9rem,1.25vw,1.1rem)] leading-relaxed text-[var(--muted)]">Software Engineer skilled in building scalable web applications and delivering intuitive user experiences.</p>
        <div className="mobile-hero-actions">
          <button type="button" onClick={() => onNavigate(2)}>Explore projects <span aria-hidden="true">↗</span></button>
          <button type="button" onClick={() => onNavigate(5)}>Let&apos;s talk</button>
        </div>
      </motion.div>

      <motion.div
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== "mouse") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
          const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
          tiltX.set(vertical * -5); tiltY.set(horizontal * 6);
          revealX.set(Math.max(8, Math.min(92, (horizontal + 0.5) * 100)));
          revealY.set(Math.max(8, Math.min(92, (vertical + 0.5) * 100)));
        }}
        onHoverStart={() => setIsPortraitHovered(true)}
        onHoverEnd={() => { setIsPortraitHovered(false); tiltX.set(0); tiltY.set(0); }}
        animate={{ y: isPortraitHovered && !reduceMotion ? -12 : 0, scale: isPortraitHovered && !reduceMotion ? 1.035 : 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 20, mass: 0.7 }}
        style={{ transformPerspective: 1200, rotateX: reduceMotion ? 0 : tiltX, rotateY: reduceMotion ? 0 : tiltY }}
        className="intro-portrait absolute bottom-[clamp(0.75rem,1.7vw,1.8rem)] left-1/2 top-[11svh] z-30 w-[min(37vw,34rem)] min-w-[17rem] -translate-x-1/2 cursor-pointer"
      >
        <motion.div initial={{ y: 24, opacity: 0, scale: 1.025 }} animate={{ y: isReady ? 0 : 24, opacity: isReady ? 1 : 0, scale: isReady ? 1 : 1.025 }} transition={{ duration: reduceMotion ? 0 : 1.05, ease: editorialEase, delay: reduceMotion ? 0 : 0.2 }} className="absolute inset-0 z-10">
          <Image src="/images/DishanBashitha.png" alt="Dishan Bashitha" fill priority unoptimized sizes="(max-width: 640px) 54vw, 34rem" className="origin-bottom scale-[1.22] object-cover object-center drop-shadow-[0_1.8rem_1.5rem_rgba(34,21,63,0.2)]" />
        </motion.div>
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: isPortraitHovered ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.42, ease: editorialEase }}
          style={reduceMotion ? undefined : {
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <Image src="/images/DishanBashitha-anime-hoodie-aligned.png" alt="" fill unoptimized loading="eager" sizes="(max-width: 640px) 54vw, 34rem" className="origin-bottom scale-[1.22] object-cover object-center drop-shadow-[0_1.8rem_1.5rem_rgba(118,82,212,0.34)]" />
        </motion.div>
        {!reduceMotion && <motion.span aria-hidden="true" style={{ left: revealLeft, top: revealTop }} animate={{ opacity: isPortraitHovered ? 1 : 0, scale: isPortraitHovered ? 1 : 0.6 }} transition={{ type: "spring", stiffness: 240, damping: 24 }} className="pointer-events-none absolute z-30 h-[min(25vw,13rem)] w-[min(25vw,13rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 shadow-[0_0_0_0.4rem_rgba(118,82,212,0.12),0_0_2rem_rgba(118,82,212,0.5)]" />}
      </motion.div>

      <motion.div initial={reduceMotion ? false : { y: 20, opacity: 0 }} animate={{ y: isReady ? 0 : 20, opacity: isReady ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.75, ease: editorialEase, delay: reduceMotion ? 0 : 0.38 }} className="intro-bio absolute bottom-[clamp(9rem,15svh,11rem)] left-[clamp(1.75rem,4.2vw,4rem)] z-30 w-[min(28rem,30vw)] text-white">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.13em] text-white/70">Based in Sri Lanka</p>
        <h2 className="mt-4 whitespace-nowrap text-[clamp(1.65rem,2.35vw,2.85rem)] font-semibold leading-tight tracking-[-0.06em]">Full Stack Developer</h2>
        <p className="mt-3 max-w-[25rem] text-sm leading-relaxed text-white/80">Passionate about clean code, modern web technologies and solving real-world problems.</p>
        <button data-magnetic type="button" onClick={onEnter} className="mt-5 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)]">Explore My Work <span aria-hidden="true" className="ml-2">→</span></button>
        <p className="mt-5 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.12em] text-white/70">TypeScript · React · Next.js · Motion</p>
      </motion.div>

      <motion.div aria-hidden="true" className="hidden">
        {technologies.map((technology) => {
          const Icon = technology.icon;
          return <div key={technology.label} className="flex w-[clamp(3.3rem,4.1vw,4.5rem)] flex-col items-center gap-1.5 text-center"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--background)]"><Icon aria-hidden="true" className={technology.className} size={21} /></span><span className="font-[family-name:var(--font-mono)] text-[8px] leading-none text-[var(--foreground)]">{technology.label}</span></div>;
        })}
      </motion.div>

      <motion.div initial={reduceMotion ? false : { y: 20, opacity: 0 }} animate={{ y: isReady ? 0 : 20, opacity: isReady ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.75, ease: editorialEase, delay: reduceMotion ? 0 : 0.46 }} className="intro-featured absolute bottom-[clamp(4rem,9svh,6rem)] right-[clamp(2rem,5.5vw,6rem)] z-30 w-[min(28rem,30vw)] text-white">
        <div className="mb-6 grid grid-cols-4 gap-2">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return <div key={item.label[0]} className="border-r border-white/20 pr-2 text-center last:border-0 last:pr-0"><Icon aria-hidden="true" className="mx-auto mb-2" size={25} strokeWidth={1.35} /><p className="text-[11px] leading-tight text-white/85">{item.label[0]}<br />{item.label[1]}</p></div>;
          })}
        </div>
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.13em] text-white/70">Featured project</p>
        <button type="button" onClick={() => onNavigate(2)} className="mt-3 flex w-full gap-3 rounded-[1.25rem] bg-[var(--surface)]/95 p-3 text-left text-[var(--foreground)] transition-transform hover:-translate-y-1">
          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--accent-soft)]"><Image src={featuredProject.coverImage} alt="" fill sizes="(max-width: 1023px) 75vw, 96px" className="object-cover" /></div>
          <span><span className="block text-sm font-semibold">{featuredProject.title}</span><span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">{featuredProject.description}</span><span className="mt-2 block text-xs font-medium text-[var(--accent)]">View project →</span></span>
        </button>
      </motion.div>
    </Scene>
  );
}
