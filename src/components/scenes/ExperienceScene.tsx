"use client";

import { Scene } from "@/components/portfolio/Scene";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const experienceGroups = [
  {
    id: "professional",
    label: "Industry / Professional",
    description: "Paid roles and professional software engineering work.",
    experiences: [{
      period: "2025 — 2026",
      role: "Software Engineer",
      organization: "NIOLLA (PVT) LTD",
      description: "Developed enterprise web applications, REST APIs, and responsive interfaces. Designed and optimized PostgreSQL and MySQL databases, integrated third-party services, and collaborated in Agile workflows.",
      focus: "Spring Boot / Node.js / React / Next.js / PostgreSQL / MySQL",
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
        role: "Local Committee Vice President — Public Relations & Information Management",
        organization: "AIESEC IN UNIVERSITY OF MORATUWA",
        description: "Local Committee Vice President for Public Relations & Information Management.",
        focus: "Leadership / Communication / Coordination",
      },
      {
        period: "2026",
        role: "Event Manager — IDEALIZE 2026",
        organization: "AIESEC IN COLOMBO SOUTH",
        description: "Event Manager for IDEALIZE 2026.",
        focus: "Event Management / Leadership",
      },
      {
        period: "Activities",
        role: "Organizing Committee Member — Robotics Day",
        organization: "IEEE STUDENT BRANCH, UNIVERSITY OF MORATUWA",
        description: "Organizing Committee Member for Robotics Day.",
        focus: "Robotics Day / Community",
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    description: "Academic qualifications and ongoing study.",
    experiences: [
      {
        period: "2024 — 2028",
        role: "BSc (Hons) Information Technology & Management",
        organization: "UNIVERSITY OF MORATUWA",
        description: "Undergraduate study in Katubedda, Sri Lanka. Ongoing GPA: 3.54 / 4.00.",
        focus: "Information Technology / Management",
      },
      {
        period: "2022 — 2025",
        role: "BEng (Hons) Software Engineering",
        organization: "LONDON METROPOLITAN UNIVERSITY",
        description: "Bachelor of Engineering (Hons) in Software Engineering, awarded First Class Honours.",
        focus: "Software Engineering / First Class Honours",
      },
      {
        period: "Higher National Diploma",
        role: "Software Engineering",
        organization: "ESOFT METRO CAMPUS",
        description: "Higher National Diploma in Software Engineering, Kurunegala, Sri Lanka.",
        focus: "Software Engineering",
      },
    ],
  },
] as const;

// Dated roles run newest first; undated activities keep their original labels.
const timelines = [
  {
    id: "work",
    label: "Work",
    entries: [
      { ...experienceGroups[0].experiences[0], category: "Professional" },
      { ...experienceGroups[1].experiences[0], category: "Volunteer" },
    ],
  },
  {
    id: "leadership",
    label: "Leadership",
    entries: [
      { ...experienceGroups[1].experiences[2], category: "Volunteer" },
      { ...experienceGroups[1].experiences[1], category: "Volunteer" },
      { ...experienceGroups[1].experiences[3], category: "Volunteer" },
    ],
  },
  {
    id: "education",
    label: "Education",
    entries: experienceGroups[2].experiences.map((entry) => ({ ...entry, category: "Education" })),
  },
];

export function ExperienceScene() {
  const reduceMotion = useReducedMotion();
  return (
    <Scene id="experience" eyebrow="" className="experience-scene">
      <div className="experience-content">
        <header className="experience-heading">
          <p className="experience-eyebrow">Experience / 05</p>
          <h1 id="experience-title">My journey.</h1>
          <p className="experience-intro">Building software, leading teams, and always learning.</p>
        </header>

        <div className="experience-overview" role="region" aria-label="Experience timelines" tabIndex={0}>
          {timelines.map((timeline) => (
            <section key={timeline.id} aria-labelledby={`experience-${timeline.id}`} className="experience-group">
              <h2 id={`experience-${timeline.id}`} className="experience-group-title">
                {timeline.label}
                <span>{String(timeline.entries.length).padStart(2, "0")}</span>
              </h2>
              <ol className="experience-timeline">
                {timeline.entries.map((experience, index) => (
                  <motion.li key={experience.organization} className="experience-entry"
                    initial={reduceMotion ? false : { opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : index * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span aria-hidden="true" className="experience-marker" />
                    <article>
                      <div className="experience-meta">
                        <p className="experience-period">{experience.period}</p>
                        {timeline.id !== "education" && <span className="experience-category">{experience.category}</span>}
                      </div>
                      <h3>{experience.role}</h3>
                      <p className="experience-organization">{experience.organization}</p>
                      {timeline.id === "education" && <p className="experience-description">{experience.description}</p>}
                      {experience.category === "Professional" && <p className="experience-focus">{experience.focus}</p>}
                    </article>
                  </motion.li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </Scene>
  );
}
