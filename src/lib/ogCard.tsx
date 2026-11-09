import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Link-preview cards (LinkedIn, X, Slack…) share the cover's violet stage. They are rendered at
// build time from small copies of the photo and covers kept in src/assets/og.
export const ogSize = { width: 1200, height: 630 };

export async function ogAsset(file: string) {
  const data = await readFile(join(process.cwd(), "src/assets/og", file));
  return `data:image/${file.endsWith(".png") ? "png" : "jpeg"};base64,${data.toString("base64")}`;
}

export const ogStage = "linear-gradient(160deg, #07041a 0%, #2a1294 55%, #4d22d6 100%)";

export function OgGlow({ color = "#8f4bff", x = 70, y = 105 }: { color?: string; x?: number; y?: number }) {
  return <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent 55%)`, opacity: 0.85 }} />;
}

export function OgEyebrow({ children }: { children: string }) {
  return <div style={{ display: "flex", fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "#cbbcff" }}>{children}</div>;
}
