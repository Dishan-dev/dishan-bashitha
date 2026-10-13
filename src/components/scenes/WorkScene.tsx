import { SplitProjectPortal } from "@/components/projects/SplitProjectPortal";
import { Scene } from "@/components/portfolio/Scene";
import { projects } from "@/data/projects";
import styles from "@/components/projects/ProjectShowcase.module.css";

export function WorkScene() {
  return <Scene id="work" eyebrow="" className={`flex flex-col ${styles.scene}`}><SplitProjectPortal projects={projects} /></Scene>;
}
