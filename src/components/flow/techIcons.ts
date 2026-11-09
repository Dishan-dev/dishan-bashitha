import type { IconType } from "react-icons";
import {
  SiExpress, SiFlyway, SiJsonwebtokens, SiLangchain, SiNextdotjs, SiNodedotjs, SiOpenjdk, SiPostgresql, SiPrisma,
  SiSocketdotio, SiSpringboot, SiSpringsecurity, SiTypescript,
} from "react-icons/si";

// Brand marks for the technologies named in the project data. Anything without a mark here is
// shown by name alone.
export const techIcons: Record<string, IconType> = {
  "Next.js": SiNextdotjs,
  TypeScript: SiTypescript,
  "Node.js": SiNodedotjs,
  Express: SiExpress,
  Prisma: SiPrisma,
  PostgreSQL: SiPostgresql,
  "Socket.IO": SiSocketdotio,
  LangChain: SiLangchain,
  "Java 21": SiOpenjdk,
  "Spring Boot": SiSpringboot,
  "Spring Security": SiSpringsecurity,
  Flyway: SiFlyway,
  JWT: SiJsonwebtokens,
};
