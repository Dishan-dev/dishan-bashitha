export type ProjectDetail = { title: string; description: string };
export type ProjectSource = { label: string; url: string };

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
  overview: string;
  features: readonly ProjectDetail[];
  engineering: readonly ProjectDetail[];
  sources: readonly ProjectSource[];
}

export const projects: readonly Project[] = [
  {
    id: "01", slug: "learnix", title: "Learnix", shortTitle: "Learnix", year: "2026",
    role: "AI-powered learning platform", marker: "AI / Realtime",
    description: "AI-assisted quiz creation, classroom workspaces, and live multiplayer assessments for students and lecturers.",
    overview: "Learnix connects assessment preparation with interactive learning. Lecturers organize workspaces and assign quizzes; students practise individually, join live quiz rooms, and review their attempts and performance.",
    technologies: ["Next.js", "TypeScript", "Express", "Prisma", "PostgreSQL", "Socket.IO", "DeepSeek", "Hugging Face"],
    coverImage: "/images/projectLearnix.png", chapters: ["Overview", "Features", "Engineering", "Source"],
    githubUrl: "https://github.com/Dishan-dev/learnix-ai-educational-platform",
    capabilities: ["AI Quiz Generation", "Live Multiplayer", "Classroom Workspaces"],
    features: [
      { title: "AI-assisted assessments", description: "Generate quiz questions from prompts or learning material, with tools for lecturers to create and assign assessments." },
      { title: "Live quiz rooms", description: "Room codes, participant readiness, host controls, and synchronized questions support multiplayer sessions and leaderboards." },
      { title: "Classrooms and progress", description: "Separate student and lecturer areas organize workspaces, quiz history, assignments, and performance reports." },
    ],
    engineering: [
      { title: "Application and data", description: "A Next.js and TypeScript client talks to an Express API, with Prisma and PostgreSQL handling persistent application data." },
      { title: "Realtime state", description: "Socket.IO manages live sessions while authentication and multiplayer contexts organize client-side session and lobby state." },
      { title: "Content generation", description: "The quiz service calls the Hugging Face router with DeepSeek-V3 as its default model. A separate Python utility extracts PDF text using PyPDF2 for quiz conversion." },
    ],
    sources: [
      { label: "Project repository", url: "https://github.com/Dishan-dev/learnix-ai-educational-platform" },
      { label: "Quiz generation service", url: "https://github.com/Dishan-dev/learnix-ai-educational-platform/blob/main/server/src/services/llmQuizService.js" },
      { label: "Realtime server", url: "https://github.com/Dishan-dev/learnix-ai-educational-platform/blob/main/server/src/socket.js" },
    ],
  },
  {
    id: "02", slug: "primecore-bank", title: "PrimeCore Bank", shortTitle: "PrimeCore", year: "2025",
    role: "Digital banking platform", marker: "Fintech / Full Stack",
    description: "A role-based banking application combining credit evaluation, loan eligibility, expense tracking, and money-transfer workflows.",
    overview: "PrimeCore brings customer financial tools and banking operations into separate role-based workspaces. Its four product areas are CreditLens, LoanSense, SpendIQ, and Transact, supported by bank-officer and administrator interfaces.",
    technologies: ["Next.js", "TypeScript", "Java 21", "Spring Boot", "Spring Security", "PostgreSQL", "Flyway"],
    coverImage: "/images/projectPrimeCore.png", chapters: ["Overview", "Features", "Engineering", "Source"],
    githubUrl: "https://github.com/Dishan-dev/bank-web-app",
    capabilities: ["CreditLens", "LoanSense", "SpendIQ / Transact"],
    features: [
      { title: "CreditLens and LoanSense", description: "Credit evaluation and reporting sit alongside eligibility checks for personal, vehicle, education, and housing loans." },
      { title: "SpendIQ and Transact", description: "Expense categories, budgets, and reports accompany beneficiary management, transfer history, and transaction OTP workflows." },
      { title: "Banking operations", description: "Officer workspaces cover onboarding and customer financial records. Admin screens manage branches, officers, users, policies, and audit logs." },
    ],
    engineering: [
      { title: "Separated applications", description: "A Next.js frontend uses TypeScript and charting libraries. A separate Java 21 / Spring Boot backend organizes domain logic into controllers, services, and repositories." },
      { title: "Identity and ownership", description: "Spring Security and JWT support authentication. Service-level ownership checks restrict officers to their assigned customers." },
      { title: "Persistence and reporting", description: "Spring Data JPA connects to PostgreSQL, Flyway manages migrations, and PDF libraries support financial reports and statements." },
    ],
    sources: [
      { label: "Frontend repository", url: "https://github.com/Dishan-dev/bank-web-app" },
      { label: "Backend repository", url: "https://github.com/Dishan-dev/Bank-Web-App-backend" },
      { label: "Loan eligibility service", url: "https://github.com/Dishan-dev/Bank-Web-App-backend/blob/main/src/main/java/com/bank_web_app/backend/loansense/service/LoanEligibilityService.java" },
    ],
  },
  {
    id: "03", slug: "hotel-management-system", title: "Emerald Stay", shortTitle: "Emerald Stay", year: "2025",
    role: "Hotel management system", marker: "Hospitality / Full Stack",
    description: "A hotel operations platform with customer reservations, front-desk workflows, manager reports, and travel-company block bookings.",
    overview: "Emerald Stay connects the guest booking journey with daily hotel operations. Dedicated customer, clerk, manager, and travel-company portals handle reservations, arrivals, departures, room inventory, and billing.",
    technologies: ["Next.js", "TypeScript", "Express", "Prisma", "PostgreSQL", "JWT", "PDFKit"],
    coverImage: "/images/emareldHotelProject.png", chapters: ["Overview", "Features", "Engineering", "Source"],
    githubUrl: "https://github.com/Dishan-dev/Emerald-Stay-Hotel-Management-System-",
    capabilities: ["Guest Reservations", "Front-desk Operations", "Group Bookings"],
    features: [
      { title: "Guest and front-desk journeys", description: "Customers browse hotels and manage reservations. Clerks handle check-ins, check-outs, walk-ins, and room availability." },
      { title: "Travel-company bookings", description: "Group reservations record date ranges, room allocations, guest details, and special rates for block bookings." },
      { title: "Billing and oversight", description: "Payment records, service charges, and PDF receipts complement manager reporting, room management, and audit-log screens." },
    ],
    engineering: [
      { title: "Role-based interface", description: "Next.js and TypeScript provide separate portal routes, with React Hook Form and Zod for forms and Recharts for reporting interfaces." },
      { title: "API and authentication", description: "An Express backend uses JWT authentication and bcrypt password hashing, with dedicated routes for booking and operational workflows." },
      { title: "Relational booking model", description: "Prisma models link reservations to guests, hotels, rooms, check-in/out records, payments, and service charges in PostgreSQL. PDFKit generates receipts." },
    ],
    sources: [
      { label: "Project repository", url: "https://github.com/Dishan-dev/Emerald-Stay-Hotel-Management-System-" },
      { label: "Database schema", url: "https://github.com/Dishan-dev/Emerald-Stay-Hotel-Management-System-/blob/main/server/prisma/schema.prisma" },
      { label: "Backend dependencies", url: "https://github.com/Dishan-dev/Emerald-Stay-Hotel-Management-System-/blob/main/server/package.json" },
    ],
  },
  {
    // Retain the existing project brief until the source repository is supplied.
    // Dishan-dev/planitnow is empty; do not infer its implementation or stack.
    id: "04", slug: "planitnow", title: "PlanItNow", shortTitle: "PlanItNow", year: "2024",
    role: "Event planning platform", marker: "Events / Full Stack",
    description: "An event planning platform that brings event details, trusted suppliers, budgets, and charitable giving into one simple workspace.",
    overview: "PlanItNow brings event planning, supplier discovery, budget management, and charitable giving into a shared workspace.",
    technologies: [], coverImage: "/images/planitnowProject.png", chapters: ["Overview"],
    capabilities: ["Event Planning", "Supplier Discovery", "Budget Management"],
    features: [], engineering: [], sources: [],
  },
];
