import { SplitProjectPortal } from "@/components/projects/SplitProjectPortal";
import { Scene } from "@/components/portfolio/Scene";
import { projects } from "@/data/projects";

export function WorkScene() {
  return <Scene id="work" eyebrow="" className="flex flex-col"><SplitProjectPortal projects={projects} /></Scene>;
}
