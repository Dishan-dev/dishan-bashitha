import { education } from "@/data/experience";
import { profile } from "@/data/profile";
import type { Project } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { absoluteUrl, siteDescription, siteName } from "@/lib/site";

// Schema.org JSON-LD, built only from facts already published on the site (profile, résumé
// data, education and the project case studies). Nothing here is inferred or embellished.

const personId = absoluteUrl("/#person");
const websiteId = absoluteUrl("/#website");

export function personSchema() {
  return {
    "@type": "Person",
    "@id": personId,
    name: siteName,
    url: absoluteUrl("/"),
    image: absoluteUrl("/images/DishanBashitha.png"),
    jobTitle: "Software Engineer",
    description: siteDescription,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Kurunegala", addressCountry: "LK" },
    // Institutions listed in the Education section.
    alumniOf: education.map(entry => ({ "@type": "EducationalOrganization", name: entry.organization })),
    knowsAbout: skillGroups.flatMap(([, tools]) => tools.split(" / ")),
    sameAs: [profile.linkedin, profile.github],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: siteName,
    url: absoluteUrl("/"),
    description: siteDescription,
    inLanguage: "en",
    publisher: { "@id": personId },
  };
}

/** The home page: a profile page about Dishan, with the site and person it describes. */
export function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      personSchema(),
      { "@type": "ProfilePage", "@id": absoluteUrl("/#profile"), url: absoluteUrl("/"), name: siteName, isPartOf: { "@id": websiteId }, mainEntity: { "@id": personId } },
    ],
  };
}

/**
 * A case study. Projects with a public repository are described as source code (that is what
 * the page links to); the rest as a creative work. No ratings, users or outcomes are claimed.
 */
export function projectSchema(project: Project) {
  const url = absoluteUrl(`/projects/${project.slug}`);
  const work = {
    "@type": project.githubUrl ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${url}#work`,
    name: project.title,
    headline: `${project.title}: ${project.headline}`,
    description: project.description,
    abstract: project.overview,
    url,
    image: absoluteUrl(project.coverImage),
    dateCreated: project.year,
    author: { "@id": personId },
    isPartOf: { "@id": websiteId },
    ...(project.technologies.length ? { keywords: project.technologies.join(", ") } : {}),
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      work,
      { "@type": "WebPage", "@id": url, url, name: `${project.title}: ${project.headline}`, description: project.description, isPartOf: { "@id": websiteId }, about: { "@id": `${url}#work` }, primaryImageOfPage: absoluteUrl(project.coverImage) },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: project.title, item: url },
        ],
      },
      personSchema(),
    ],
  };
}

export function JsonLd({ data }: { data: object }) {
  // "<" is escaped so no string in the data can close the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
