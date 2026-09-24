export function SceneIndicator({ activeIndex, total }: { activeIndex: number; total: number }) {
  return <p aria-live="polite" className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</p>;
}
