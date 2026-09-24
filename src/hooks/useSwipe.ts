"use client";

import { useRef } from "react";

type UseSwipeOptions = {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
};

/** Detects intentional vertical touch gestures without treating small drags as navigation. */
export function useSwipe({ onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, threshold = 56 }: UseSwipeOptions) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (event: React.TouchEvent) => {
      const touch = event.changedTouches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd: (event: React.TouchEvent) => {
      if (!start.current) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.current.x;
      const deltaY = touch.clientY - start.current.y;
      start.current = null;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) return;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) onSwipeLeft?.(); else onSwipeRight?.();
        return;
      }
      if (deltaY < 0) onSwipeUp?.(); else onSwipeDown?.();
    },
  };
}
