"use client";

import { useState } from "react";
import { Scene } from "@/components/portfolio/Scene";

const experienceGroups = [
  {
    id: "professional",
    label: "Industry / Professional",
    description: "Paid roles and professional software engineering work.",
    experiences: [{
      period: "2025 — 2026",
      role: "Software Engineer",
      organization: "NIOLLA (PVT) LTD",
      description: "Worked across frontend and backend development on scalable enterprise applications, building APIs, interfaces, and data-driven systems using modern full-stack technologies.",
      focus: "Spring Boot / React / Next.js / PostgreSQL",
    }],
  },
  {
    id: "volunteer",
    label: "Volunteer",
    description: "Leadership, community, and mission-driven contributions.",
    experiences: [
      {
        period: "2025",
        role: "Software Engineer",
        organization: "AIESEC IN SRI LANKA",
        description: "Contributed technical solutions within a national organizational environment, working closely with people, systems, and evolving needs.",
        focus: "Technical Solutions / Collaboration / Systems",
      },
      {
        period: "Leadership",
        role: "Local Committee Vice President",
        organization: "AIESEC IN UNIVERSITY OF MORATUWA",
        description: "Led communication, digital systems, and cross-functional coordination with a focus on ownership and thoughtful collaboration.",
        focus: "Leadership / Communication / Coordination",
      },
    ],
  },
] as const;

export function ExperienceScene() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const activeGroup = experienceGroups[activeGroupIndex];

  return (
    <Scene id="experience" eyebrow="" className="relative isolate overflow-hidden p-0">
      <div aria-hidden="true" className="absolute right-[7%] top-[18%] h-px w-[26vw] bg-[var(--accent)]/25" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 h-[20rem] w-[20rem] -translate-x-1/2 translate-y-1/2 rounded-full border border-[var(--accent)]/15" />

      <section aria-label="Experience" className="relative z-10 flex h-full flex-col px-[var(--space-2)] pb-[clamp(5rem,9svh,7rem)] pt-[clamp(5.25rem,9svh,6.5rem)] sm:px-[var(--space-4)]">
        <header className="flex items-end justify-between gap-8">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Experience / 05</p>
            <h1 id="experience-title" className="mt-3 text-[clamp(3rem,5.2vw,5.8rem)] font-semibold leading-[0.86] tracking-[-0.08em]">Experience.</h1>
          </div>
          <p className="hidden max-w-72 pb-1 text-right text-sm leading-relaxed text-[var(--muted)] md:block">A selection of professional software work and volunteer leadership.</p>
        </header>

        <nav role="tablist" aria-label="Experience type" className="mt-[clamp(2rem,4svh,3.5rem)] flex border-b border-[var(--border)]">
          {experienceGroups.map((group, index) => {
            const isActive = activeGroupIndex === index;
            return (
              <button key={group.id} id={`${group.id}-tab`} type="button" role="tab" aria-selected={isActive} aria-controls="experience-panel" onClick={() => setActiveGroupIndex(index)} className={`relative flex items-center gap-3 px-0 pb-4 pr-8 text-left font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.14em] transition-colors sm:pr-12 ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                <span>{group.label}</span>
                <span className="text-[var(--accent)]">{String(group.experiences.length).padStart(2, "0")}</span>
                {isActive && <span aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[var(--accent)]" />}
              </button>
            );
          })}
        </nav>

        <div id="experience-panel" role="tabpanel" aria-labelledby={`${activeGroup.id}-tab`} className="mt-6 flex min-h-0 flex-1 flex-col">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">{activeGroup.label} experiences</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{activeGroup.description}</p>
            </div>
            <p className="hidden shrink-0 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.15em] text-[var(--muted)] sm:block">{String(activeGroup.experiences.length).padStart(2, "0")} total</p>
          </div>

          <div className="mt-6 grid min-h-0 flex-1 gap-px overflow-y-auto border-y border-[var(--border)] bg-[var(--border)] pr-px lg:grid-cols-2">
            {activeGroup.experiences.map((experience, index) => (
              <article key={experience.organization} className="relative bg-[var(--background)] px-6 py-7 sm:px-8 sm:py-8">
                <span aria-hidden="true" className="absolute right-6 top-6 font-[family-name:var(--font-mono)] text-xs tracking-[0.12em] text-[var(--border)] sm:right-8 sm:top-8">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-[var(--accent)]"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" />{experience.period}</div>
                <p className="mt-7 max-w-[85%] font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{experience.organization}</p>
                <h2 className="mt-3 max-w-[15ch] text-[clamp(2rem,3.1vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.065em]">{experience.role}</h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--muted)]">{experience.description}</p>
                <p className="mt-6 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">{experience.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Scene>
  );
}
