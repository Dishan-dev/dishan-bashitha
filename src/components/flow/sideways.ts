import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToY } from "@/lib/portfolioScroll";

const locked = () => document.documentElement.classList.contains("scroll-locked");

/**
 * Lets a pinned, stepped sequence move sideways as well as by scrolling: horizontal swipes and
 * mouse drags across `surface`, sideways trackpad gestures, the arrow keys while it is pinned,
 * and its own `[data-step]` buttons. Every step scrolls the page to that point of the pin, so
 * the scroll position stays the single source of truth. The surface should carry
 * `data-lenis-prevent-touch`: Lenis stops any running scroll when a touch ends, which would
 * cancel the step a swipe has just started.
 */
export function sideways(section: HTMLElement, surface: HTMLElement, trigger: ScrollTrigger, steps: number) {
  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>("[data-step]"));
  const current = () => Math.round(trigger.progress * steps);
  // Quick repeats build on the step already on its way rather than the one on screen.
  let pending: number | null = null;
  let settle = 0;
  const go = (delta: number) => {
    if (locked()) return;
    const from = pending ?? current();
    const index = Math.max(0, Math.min(steps, from + delta));
    if (index === from) return;
    pending = index;
    window.clearTimeout(settle);
    settle = window.setTimeout(() => { pending = null; }, 1200);
    scrollToY(trigger.start + ((trigger.end - trigger.start) * index) / steps, { onComplete: () => { pending = null; } });
  };
  const sync = () => {
    const index = current();
    buttons.forEach(button => { button.disabled = Number(button.dataset.step) < 0 ? index <= 0 : index >= steps; });
  };

  // Swipes and drags: a mostly horizontal stroke past a small threshold moves one step.
  // The stroke is measured from its moves: some touch screens report a lifted finger's position late.
  let startX = 0, startY = 0, endX = 0, endY = 0, tracking = false, swiped = false;
  const down = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    tracking = true;
    swiped = false;
    startX = endX = event.clientX;
    startY = endY = event.clientY;
  };
  const move = (event: PointerEvent) => { if (tracking) { endX = event.clientX; endY = event.clientY; } };
  const up = () => {
    if (!tracking) return;
    tracking = false;
    const dx = endX - startX, dy = endY - startY;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped = true; go(dx < 0 ? 1 : -1); }
  };
  const cancel = () => { tracking = false; };
  // A drag that ended on a card should not also open it.
  const click = (event: MouseEvent) => { if (swiped) { event.preventDefault(); event.stopPropagation(); swiped = false; } };
  const dragstart = (event: DragEvent) => event.preventDefault();

  // Sideways trackpad gestures: one step per gesture, however long its inertia runs.
  let quietUntil = 0, sum = 0;
  const wheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const now = performance.now();
    if (now < quietUntil) { quietUntil = now + 240; return; }
    sum += event.deltaX;
    if (Math.abs(sum) > 36) { go(sum > 0 ? 1 : -1); sum = 0; quietUntil = now + 240; }
  };

  const key = (event: KeyboardEvent) => {
    if (!trigger.isActive || event.altKey || event.ctrlKey || event.metaKey) return;
    if ((event.target as Element | null)?.closest?.("input, textarea, select, [contenteditable], [role='dialog']")) return;
    if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
  };
  const press = (event: MouseEvent) => go(Number((event.currentTarget as HTMLElement).dataset.step));

  surface.addEventListener("pointerdown", down);
  surface.addEventListener("pointermove", move);
  surface.addEventListener("pointerup", up);
  surface.addEventListener("pointercancel", cancel);
  surface.addEventListener("click", click, true);
  surface.addEventListener("dragstart", dragstart);
  surface.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("keydown", key);
  buttons.forEach(button => button.addEventListener("click", press));
  sync();

  return {
    sync,
    kill() {
      window.clearTimeout(settle);
      surface.removeEventListener("pointerdown", down);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", up);
      surface.removeEventListener("pointercancel", cancel);
      surface.removeEventListener("click", click, true);
      surface.removeEventListener("dragstart", dragstart);
      surface.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
      buttons.forEach(button => { button.removeEventListener("click", press); button.disabled = false; });
    },
  };
}
