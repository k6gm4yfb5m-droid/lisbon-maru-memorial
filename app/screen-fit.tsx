"use client";

import { useLayoutEffect } from "react";

/** Desktop trackpad zoom changes the visible viewport without changing CSS breakpoints.
 * Fit that viewport uniformly, retaining the design's typography and column proportions.
 * Touch devices keep native pinch-to-zoom for reading.
 */
export default function ScreenFit() {
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const root = document.documentElement;
    let frame = 0, previousScale = 1;
    const properties = ["--screen-fit-scale", "--screen-fit-width", "--screen-fit-height",
      "--screen-fit-left", "--screen-fit-top", "--screen-fit-right"];

    function update() {
      frame = 0;
      const enabled = desktop.matches && viewport!.scale > 1.001;
      const scale = enabled ? viewport!.width / window.innerWidth : 1;
      const readingPosition = window.scrollY / previousScale;
      if (enabled) {
        const values = [scale, `${window.innerWidth}px`, `${viewport!.height / scale}px`,
          `${viewport!.offsetLeft / scale}px`, `${viewport!.offsetTop / scale}px`,
          `${(window.innerWidth - viewport!.offsetLeft - viewport!.width) / scale}px`];
        properties.forEach((property, index) => {
          const value = String(values[index]);
          if (root.style.getPropertyValue(property) !== value) root.style.setProperty(property, value);
        });
        root.dataset.screenFit = "true";
      } else {
        delete root.dataset.screenFit;
        properties.forEach(property => root.style.removeProperty(property));
      }
      // Keep the current passage in view while the uniform scale changes.
      if (Math.abs(scale - previousScale) > .001 && document.body.style.overflow !== "hidden") {
        window.scrollTo({ top: Math.max(0, readingPosition * scale),
          left: window.scrollX, behavior: "instant" });
      }
      previousScale = scale;
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    document.addEventListener("fullscreenchange", schedule);
    desktop.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      document.removeEventListener("fullscreenchange", schedule);
      desktop.removeEventListener("change", schedule);
      delete root.dataset.screenFit;
      properties.forEach(property => root.style.removeProperty(property));
    };
  }, []);
  return null;
}
