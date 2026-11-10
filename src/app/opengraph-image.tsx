import { ImageResponse } from "next/og";
import { projects } from "@/data/projects";
import { ogAsset, OgEyebrow, OgGlow, ogSize, ogStage } from "@/lib/ogCard";

export const alt = "Dishan Bashitha, Software Engineer. Full-stack projects in Next.js, TypeScript and Spring Boot.";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const portrait = await ogAsset("portrait.png");
  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", backgroundImage: ogStage, color: "#fff" }}>
        <OgGlow />
        <OgGlow color="#e9a6ff" x={62} y={118} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: 720, padding: "64px 0 60px 72px" }}>
          <OgEyebrow>Software Engineer · Developer</OgEyebrow>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 132, lineHeight: 0.92, letterSpacing: -6 }}>
            <span>Dishan</span>
            <span style={{ color: "rgba(255, 255, 255, .55)" }}>Bashitha</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 30, lineHeight: 1.3, color: "rgba(255, 255, 255, .88)" }}>
              {`${projects.length} projects · Next.js · Spring Boot`}
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "#cbbcff" }}>dishan.me</div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
        <img src={portrait} alt="" height={600} width={426} style={{ position: "absolute", right: 70, bottom: 0 }} />
      </div>
    ),
    size,
  );
}
