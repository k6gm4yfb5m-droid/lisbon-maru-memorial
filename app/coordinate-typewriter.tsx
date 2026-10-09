"use client";
import { useEffect, useRef, useState } from "react";
import { wreckCoordinateLabel } from "@/lib/geography";

const lines = wreckCoordinateLabel.split(" ");
const length = lines.join("").length;

export default function CoordinateTypewriter() {
  const element = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let started = false;
    let current = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      timer = setTimeout(type, 300);
    }, { threshold: 0.5 });
    function type() {
      current++;
      setCount(current);
      if (current < length) timer = setTimeout(type, current === lines[0].length ? 260 : 75);
    }
    function preference() {
      if (!motion.matches) return;
      clearTimeout(timer);
      observer.disconnect();
      setCount(length);
    }
    if (motion.matches) preference();
    else if (element.current) observer.observe(element.current);
    motion.addEventListener("change", preference);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      motion.removeEventListener("change", preference);
    };
  }, []);

  let offset = 0;
  return <div ref={element} className="coordinate-typewriter" dir="ltr" aria-label={wreckCoordinateLabel}>
    {lines.map(line => {
      const start = offset;
      offset += line.length;
      return <span key={line} className="dedication-coordinate-value" aria-hidden="true">
        {Array.from(line).map((character, index) => <span key={index} className="coordinate-character" data-visible={start + index < count} data-caret={start + index === count - 1 && count < length}>{character}</span>)}
      </span>;
    })}
  </div>;
}
