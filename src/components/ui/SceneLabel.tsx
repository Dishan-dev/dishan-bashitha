import { profile } from "@/data/profile";
import { scenes, type SceneId } from "@/data/scenes";

export function SceneLabel({ sceneId, className = "" }: { sceneId: SceneId; className?: string }) {
  const scene = scenes.find((item) => item.id === sceneId)!;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 font-[family-name:var(--font-mono)] text-xs font-normal uppercase leading-relaxed tracking-[0.16em] text-[var(--muted)] ${className}`}>
      <span className="inline-flex shrink-0 items-center gap-3">
        <span className="text-[var(--foreground)]">({scene.number})</span>
        <span>{scene.label}</span>
      </span>
      <span>{profile.location}</span>
    </div>
  );
}
