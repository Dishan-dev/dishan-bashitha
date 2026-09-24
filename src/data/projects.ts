export interface Project {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  year: string;
  role: string;
  technologies: readonly string[];
  coverImage: string;
  chapters: readonly string[];
  liveUrl?: string;
  githubUrl?: string;
  marker: string;
  capabilities: readonly string[];
}

export const projects: readonly Project[] = [
  {
    id: "01", slug: "learnix", title: "Learnix", shortTitle: "Learnix", description: "An intelligent collaborative learning platform that transforms study materials into quizzes, summaries, and real-time learning experiences.", year: "2026", role: "AI-powered learning platform", technologies: ["Next.js", "Node.js", "PostgreSQL", "Gemini"], coverImage: "/images/projectLearnix.png", chapters: ["Concept", "Experience", "Build", "Outcome"], marker: "AI / Realtime", capabilities: ["PDF → Quiz", "AI Summaries", "Multiplayer Learning"],
  },
  {
    id: "02", slug: "primecore-bank", title: "PrimeCore Bank", shortTitle: "PrimeCore", description: "A role-based digital banking platform designed around secure transactions, clear analytics, and scalable backend services.", year: "2025", role: "Digital banking platform", technologies: ["React", "Spring Boot", "PostgreSQL"], coverImage: "/images/projectPrimeCore.png", chapters: ["Concept", "Experience", "Build", "Outcome"], marker: "Fintech / Full Stack", capabilities: ["Secure Banking", "Transaction Management", "Analytics"],
  },
  {
    id: "03", slug: "hotel-management-system", title: "Hotel Management System", shortTitle: "Hotel System", description: "A streamlined management system for handling reservations, guest stays, room availability, and daily hotel operations.", year: "2025", role: "Hospitality management platform", technologies: ["React", "Node.js", "REST APIs", "MySQL"], coverImage: "/images/emareldHotelProject.png", chapters: ["Concept", "Experience", "Build", "Outcome"], marker: "Hospitality / Full Stack", capabilities: ["Reservations", "Room Management", "Guest Operations"],
  },
  {
    id: "04", slug: "planitnow", title: "PlanItNow", shortTitle: "PlanItNow", description: "An event planning platform that brings event details, trusted suppliers, budgets, and charitable giving into one simple workspace.", year: "2024", role: "Event planning platform", technologies: ["Next.js", "React", "Node.js", "PostgreSQL"], coverImage: "/images/planitnowProject.png", chapters: ["Concept", "Experience", "Build", "Outcome"], marker: "Events / Full Stack", capabilities: ["Event Planning", "Supplier Discovery", "Budget Management"],
  },
];
