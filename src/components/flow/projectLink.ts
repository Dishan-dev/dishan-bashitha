import type { MouseEvent } from "react";

/** Each case study's own address: a real link crawlers can follow and people can open in a new tab. */
export const projectHref = (slug: string) => `/projects/${slug}`;

/**
 * Plain clicks open the case study in place (the cinematic transition); modified clicks
 * (new tab, new window) and other buttons keep the browser's own behaviour.
 */
export const openInPlace = (open: () => void) => (event: MouseEvent<HTMLAnchorElement>) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  open();
};
