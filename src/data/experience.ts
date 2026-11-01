export type ExperienceEntry = {
  period: string;
  role: string;
  organization: string;
  category: "Professional" | "Volunteer" | "Leadership" | "Education";
  description: string;
};

// Transcribed from DISHAN_BASHITHA.pdf; work first, then leadership.
export const experience: readonly ExperienceEntry[] = [
  { period: "2025 — 2026", role: "Software Engineer", organization: "NIOLLA (PVT) LTD", category: "Professional", description: "Enterprise web applications, REST APIs and responsive interfaces. PostgreSQL and MySQL design, third-party integrations, Agile delivery." },
  { period: "2025", role: "Software Engineer", organization: "AIESEC in Sri Lanka", category: "Volunteer", description: "Technical solutions within a national organisation, working closely with people, systems and evolving needs." },
  { period: "2026", role: "Event Manager, IDEALIZE 2026", organization: "AIESEC in Colombo South", category: "Leadership", description: "Leading the delivery of IDEALIZE 2026." },
  { period: "Leadership", role: "LCVP, Public Relations & Information Management", organization: "AIESEC in University of Moratuwa", category: "Leadership", description: "Local Committee Vice President for Public Relations & Information Management." },
  { period: "Activities", role: "Organizing Committee, Robotics Day", organization: "IEEE Student Branch, University of Moratuwa", category: "Leadership", description: "Organizing Committee Member for Robotics Day." },
];

export const education: readonly ExperienceEntry[] = [
  { period: "2024 — 2028", role: "BSc (Hons) IT & Management", organization: "University of Moratuwa", category: "Education", description: "Undergraduate study in Katubedda, Sri Lanka. Ongoing GPA 3.54 / 4.00." },
  { period: "2022 — 2025", role: "BEng (Hons) Software Engineering", organization: "London Metropolitan University", category: "Education", description: "Awarded First Class Honours." },
  { period: "HND", role: "Software Engineering", organization: "ESOFT Metro Campus", category: "Education", description: "Higher National Diploma in Software Engineering, Kurunegala." },
];
