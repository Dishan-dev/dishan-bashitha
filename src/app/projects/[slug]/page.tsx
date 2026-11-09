import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FlowExperience } from "@/components/flow/FlowExperience";
import { projects } from "@/data/projects";
import { JsonLd, projectSchema } from "@/lib/structuredData";

// One shareable, indexable address per case study. The case study is rendered open on the
// server, so its heading, overview, features, stack and sources are in the initial HTML; the
// full site sits behind it and closing it lands on the projects.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) return {};
  const title = `${project.title} – ${project.headline}`;
  const path = `/projects/${slug}`;
  return {
    title,
    description: project.description,
    alternates: { canonical: path },
    openGraph: { type: "article", title, description: project.description, url: path, authors: ["Dishan Bashitha"] },
    twitter: { card: "summary_large_image", title, description: project.description },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  return (
    <>
      <JsonLd data={projectSchema(project)} />
      <FlowExperience initialProject={slug} />
    </>
  );
}
