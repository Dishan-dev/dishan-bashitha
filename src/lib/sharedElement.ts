"use client";

export type FlightBox = { left: number; top: number; width: number; height: number; borderRadius: number };

export function flightBox(element: HTMLElement): FlightBox {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0 };
}

/** Only a visible element can hand its image over; anything else uses the in-place reveal. */
export function isOnScreen(element: HTMLElement | null): element is HTMLElement {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 1 && rect.height > 1 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
}

/** How the card end of a flight frames its artwork, so the clone matches it on landing. */
export function imageFit(element: HTMLElement | null) {
  const image = element?.querySelector("img");
  return image ? getComputedStyle(image).objectFit : "contain";
}

/**
 * The image that travels between a project card and its case study. The case study frame
 * shares the artwork's 16:9 ratio, so the clone uses the card's fit at both ends.
 */
export function createFlight(source: HTMLElement, box: FlightBox, fit = imageFit(source)) {
  const flight = document.createElement("div");
  const image = source.querySelector("img");
  const style = getComputedStyle(source);
  Object.assign(flight.style, {
    position: "fixed", zIndex: "450", pointerEvents: "none", overflow: "hidden", contain: "layout paint",
    left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px`,
    borderRadius: `${box.borderRadius}px`, background: style.backgroundColor, boxShadow: "0 30px 80px #100b1b33",
  });
  if (image) {
    const copy = document.createElement("img");
    copy.alt = "";
    copy.src = image.currentSrc || image.src;
    Object.assign(copy.style, { position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: fit });
    flight.append(copy);
  }
  document.body.append(flight);
  return flight;
}
