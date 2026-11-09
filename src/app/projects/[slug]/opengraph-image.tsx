import { ImageResponse } from "next/og";
import { tintFor } from "@/components/flow/projectTints";
import { projects } from "@/data/projects";
import { ogAsset, OgEyebrow, OgGlow, ogSize } from "@/lib/ogCard";

export const alt = "A software project by Dishan Bashitha";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug) ?? projects[0];
  const tint = tintFor(project.slug);
  const cover = await ogAsset(`${project.slug}.jpg`);
  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#07060f", color: "#fff" }}>
        <OgGlow color={tint} x={78} y={100} />
        <OgGlow color={tint} x={0} y={115} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, padding: "60px 0 56px 64px" }}>
          <OgEyebrow>{`Project ${project.id} · ${project.year}`}</OgEyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: project.title.length > 10 ? 84 : 104, lineHeight: 0.95, letterSpacing: -4 }}>{project.title}</div>
            <div style={{ display: "flex", fontSize: 23, lineHeight: 1.4, color: "rgba(255, 255, 255, .78)" }}>{project.description}</div>
            {project.technologies.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {project.technologies.slice(0, 4).map(tech => (
                  <div key={tech} style={{ display: "flex", padding: "7px 16px", border: "1px solid rgba(255, 255, 255, .25)", borderRadius: 99, fontSize: 18, color: "rgba(255, 255, 255, .85)" }}>{tech}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", fontSize: 21, color: "rgba(255, 255, 255, .7)" }}>Dishan Bashitha · Software Engineer</div>
        </div>
        {/* The cover in a window frame, running off the right edge. */}
        <div style={{ position: "absolute", left: 650, top: 125, display: "flex", flexDirection: "column", width: 700, padding: "0 10px 10px", borderRadius: 18, backgroundColor: "#15102a", border: "1px solid rgba(255, 255, 255, .14)", boxShadow: `0 40px 90px rgba(0, 0, 0, .55)` }}>
          <div style={{ display: "flex", gap: 8, padding: "14px 6px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(color => <div key={color} style={{ display: "flex", width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />)}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
          <img src={cover} alt="" width={680} height={383} style={{ borderRadius: 10 }} />
        </div>
      </div>
    ),
    size,
  );
}
