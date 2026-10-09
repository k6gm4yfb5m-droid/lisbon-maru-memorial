"use client";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Maximize, Minimize } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { fullscreenTranslations } from "@/lib/fullscreen";

/** Expand the existing surface: its animation, camera and interactive records stay mounted. */
export default function FullscreenView({ children, locale, title, kind }: {
  children: ReactNode; locale: Locale; title: string; kind: "stars" | "voyage" | "rescue" | "topology" | "archive" | "poppy";
}) {
  const t = fullscreenTranslations[locale];
  const [active, setActive] = useState(false);
  const [reservedHeight, setReservedHeight] = useState(0);
  const root = useRef<HTMLDivElement>(null), button = useRef<HTMLButtonElement>(null);
  const activeRef = useRef(false), ownsNative = useRef(false);
  const scroll = useRef({ x: 0, y: 0, scale: 1 });

  function restorePosition(position: typeof scroll.current) {
    // Native fullscreen can reset trackpad zoom. Restore the same document
    // passage in the current scale rather than reusing scaled pixel coordinates.
    const scale = (parseFloat(getComputedStyle(document.body).zoom) || 1) / position.scale;
    window.scrollTo({ left: position.x * scale, top: position.y * scale, behavior: "instant" });
  }

  function restorePage() {
    requestAnimationFrame(() => {
      restorePosition(scroll.current);
      button.current?.focus({ preventScroll: true });
    });
  }
  function close() {
    activeRef.current = false;
    setActive(false);
    if (ownsNative.current && document.fullscreenElement === document.documentElement) {
      void document.exitFullscreen().then(restorePage).catch(() => { ownsNative.current = false; });
    } else ownsNative.current = false;
  }
  function enter() {
    setReservedHeight(root.current?.offsetHeight ?? 0);
    scroll.current = { x: window.scrollX, y: window.scrollY, scale: parseFloat(getComputedStyle(document.body).zoom) || 1 };
    activeRef.current = true;
    setActive(true);
    // Fullscreen the document so the existing person-detail portal also remains visible.
    // Browsers without native support still get the same full-viewport interactive surface.
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      ownsNative.current = true;
      void document.documentElement.requestFullscreen().then(() => {
        if (!activeRef.current && document.fullscreenElement === document.documentElement) {
          void document.exitFullscreen().catch(() => {});
        }
      }).catch(() => { ownsNative.current = false; });
    }
  }
  useEffect(() => {
    const changed = () => {
      if (ownsNative.current && !document.fullscreenElement) {
        ownsNative.current = false;
        activeRef.current = false;
        setActive(false);
        restorePage();
      }
    };
    document.addEventListener("fullscreenchange", changed);
    return () => {
      document.removeEventListener("fullscreenchange", changed);
      activeRef.current = false;
      if (ownsNative.current && document.fullscreenElement === document.documentElement) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);
  useLayoutEffect(() => {
    if (!active || !root.current) return;
    const overflow = document.body.style.overflow;
    const toolbarButton = button.current, originalScroll = scroll.current;
    document.body.style.overflow = "hidden";
    const background: { element: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement = root.current;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          background.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    toolbarButton?.focus({ preventScroll: true });
    return () => {
      background.forEach(({ element, inert }) => { element.inert = inert; });
      document.body.style.overflow = overflow;
      requestAnimationFrame(() => {
        restorePosition(originalScroll);
        toolbarButton?.focus({ preventScroll: true });
      });
    };
  }, [active]);

  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (!active) return;
    if (event.key === "Escape") {
      event.preventDefault(); event.stopPropagation(); close();
    } else if (event.key === "Tab" && root.current) {
      const focusable = Array.from(root.current.querySelectorAll<HTMLElement | SVGElement>(
        'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )).filter(element => !element.closest("[inert]") && element.getClientRects().length &&
        getComputedStyle(element).visibility !== "hidden");
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }
  }
  return <div className="fullscreen-holder" style={active ? { height: reservedHeight } : undefined}>
    <div ref={root} className={`fullscreen-view fullscreen-${kind}`} data-fullscreen={active}
      role={active ? "dialog" : undefined} aria-modal={active ? true : undefined}
      aria-label={active ? title : undefined} onKeyDownCapture={keys}>
      <div className="fullscreen-bar"><span>{title}</span><button ref={button} type="button"
        className="fullscreen-toggle" aria-expanded={active} onClick={active ? close : enter}>
        {active ? <Minimize size={18}/> : <Maximize size={18}/>} {active ? t.exit : t.enter}
      </button></div>
      <div className="fullscreen-body">{children}</div>
    </div>
  </div>;
}
