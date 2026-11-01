import { SplitProjectPortal } from "@/components/projects/SplitProjectPortal";
import { Scene } from "@/components/portfolio/Scene";
import { projects } from "@/data/projects";
import styles from "@/components/projects/ProjectShowcase.module.css";

export function WorkScene({ progress = 1 }: { progress?: number }) {
  return <Scene id="work" eyebrow="" className={`flex flex-col ${styles.scene}`}><SplitProjectPortal projects={projects} progress={progress} /></Scene>;
}
