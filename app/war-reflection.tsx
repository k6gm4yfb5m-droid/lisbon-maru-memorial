"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatPercent } from "@/lib/i18n";
import { apologyResponses, reflectionSources, reflectionTranslations } from "@/lib/war-reflection";

function ResponseGraphic({index, percent, locale}: {index: number; percent: number; locale: Locale}) {
  return <svg className="reflection-response-svg" viewBox="0 0 220 220" aria-hidden="true" data-chart={['donut','waffle','gauge','segmented-bar'][index]} style={{"--response-share":percent,"--response-rest":100-percent} as CSSProperties}>
    {index === 0 && <g fill="none" strokeWidth="17"><circle cx="110" cy="110" r="76" stroke="#e1e6e2"/><circle className="reflection-draw-arc" cx="110" cy="110" r="76" stroke="currentColor" pathLength="100" strokeDasharray={`${percent} ${100-percent}`} transform="rotate(-90 110 110)"/></g>}
    {index === 1 && Array.from({length:100},(_,i) => <rect key={i} className={i < percent ? "reflection-reveal-cell" : undefined} style={i < percent ? {animationDelay:`${i/Math.max(1,percent-1)*220}ms`} : undefined} x={23+(i%10)*17.5} y={23+Math.floor(i/10)*17.5} width="14" height="14" rx="1.5" fill={i < percent ? 'currentColor' : '#e1e6e2'} data-filled={i < percent}/>)}
    {index === 2 && <g><path d="M30 140 A80 80 0 0 1 190 140" fill="none" stroke="#e1e6e2" strokeWidth="17"/><path className="reflection-draw-arc" d="M30 140 A80 80 0 0 1 190 140" fill="none" stroke="currentColor" strokeWidth="17" pathLength="100" strokeDasharray={`${percent} ${100-percent}`}/><g className="reflection-axis-label"><text x="30" y="173" textAnchor="middle">{formatPercent(0,locale)}</text><text x="190" y="173" textAnchor="middle">{formatPercent(100,locale)}</text></g></g>}
    {index === 3 && <g>{Array.from({length:20},(_,i)=>{
      const fill = Math.max(0,Math.min(1,(percent-i*5)/5));
      return <g key={i}><rect x={10+i*10} y="92" width="8" height="36" fill="#e1e6e2"/>{fill > 0 && <rect className="reflection-fill-segment" style={{animationDelay:`${i/Math.max(1,Math.ceil(percent/5)-1)*180}ms`}} x={10+i*10} y="92" width={8*fill} height="36" fill="currentColor" data-filled-units={fill*5}/>}</g>;
    })}<g className="reflection-axis-label"><text x="10" y="163">{formatPercent(0,locale)}</text><text x="210" y="163" textAnchor="end">{formatPercent(100,locale)}</text></g></g>}
  </svg>;
}

export default function WarReflection({locale}: {locale: Locale}) {
  const t = reflectionTranslations[locale];
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState(0);
  const figureRef = useRef<HTMLElement>(null);
  const percentRef = useRef<HTMLButtonElement>(null);
  const sectorRef = useRef<SVGGElement>(null);
  const sectorMotionRef = useRef<Animation | null>(null);
  const percentMotionRef = useRef<Animation | null>(null);
  useEffect(() => () => { percentMotionRef.current?.cancel(); sectorMotionRef.current?.cancel(); }, []);
  const bounce = (target: Element | null, motion: { current: Animation | null }, peakScale: number) => {
    motion.current?.cancel();
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Transform the feedback target without changing the layout or data.
    motion.current = target.animate([
      { transform: "translateY(0) scale(1)", easing: "cubic-bezier(.2,.7,.3,1)" },
      { offset: .42, transform: `translateY(-5px) scale(${peakScale})`, easing: "cubic-bezier(.5,0,.8,.5)" },
      { offset: .78, transform: "translateY(1px) scale(1)", easing: "cubic-bezier(.16,1,.3,1)" },
      { transform: "translateY(0) scale(1)" },
    ], { duration: 460, iterations: 1 });
  };
  const bouncePercent = () => bounce(percentRef.current, percentMotionRef, 1.015);
  const bounceSector = () => bounce(sectorRef.current, sectorMotionRef, 1.035);
  const selectionRef = useRef(selected);
  selectionRef.current = selected;
  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    let lastEvent = 0;
    let total = 0;
    let direction = 0;
    let flipped = false;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || !event.cancelable || (event.target instanceof Element && event.target.closest("button:not(.reflection-flag-button):not(.reflection-percent-display),a,input,select,textarea"))) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      const now = performance.now();
      const sign = Math.sign(delta);
      // One page per wheel gesture; trackpad momentum must not skip answers.
      if (now - lastEvent > 180 || sign !== direction) { total = 0; flipped = false; }
      lastEvent = now;
      direction = sign;
      if (flipped) { event.preventDefault(); return; }
      const next = selectionRef.current + sign;
      // At either end, the next gesture continues scrolling the document.
      if (next < 0 || next >= apologyResponses.length) return;
      event.preventDefault();
      total += Math.abs(delta) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (total >= 60) { flipped = true; selectionRef.current = next; setSelected(next); }
    };
    figure.addEventListener("wheel", onWheel, { passive: false });
    return () => figure.removeEventListener("wheel", onWheel);
  }, []);
  const share = apologyResponses[selected];
  const describe = (text: string, value = share) => text.replaceAll("{percent}", formatPercent(value,locale)).replaceAll("{remainder}", formatPercent(100-value,locale));
  return <section id="war-reflection" className="war-reflection-section" aria-labelledby="war-reflection-title">
    <div className="reflection-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="war-reflection-title">{t.title}</h2><p>{t.intro}</p></div>
    <figure className="reflection-figure" ref={figureRef} tabIndex={0} aria-describedby="reflection-scroll-hint" onKeyDown={event => {
      const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      const next = selected + direction;
      if (direction && next >= 0 && next < apologyResponses.length) { event.preventDefault(); setSelected(next); }
    }}>
      <div className="reflection-flag-wrap"><span className="reflection-survey">{t.survey}</span><button type="button" className="reflection-flag-button" aria-label={t.activatePercent} onClick={bouncePercent}><svg className="reflection-flag" viewBox="0 0 600 400" role="img" aria-labelledby="reflection-flag-title reflection-flag-description"><title id="reflection-flag-title">{t.question}</title><desc id="reflection-flag-description">{describe(t.flagDescription)}</desc><rect width="600" height="400" fill="#f8f8f4"/><circle cx="300" cy="200" r="120" fill="#d7dfda"/><g ref={sectorRef} className="reflection-sector-motion"><circle className="reflection-red-sector" data-percent={share} cx="300" cy="200" r="60" fill="none" stroke="#bc002d" strokeWidth="120" pathLength="100" strokeDasharray={`${share} ${100-share}`} transform="rotate(-90 300 200)"/></g></svg></button></div>
      <figcaption><p className="reflection-question">{t.question}</p>
        <strong className="reflection-primary-percent" aria-live="polite" aria-atomic="true">
          <button type="button" ref={percentRef} className="reflection-percent-display" aria-label={`${t.answers[selected]}: ${formatPercent(share,locale)}. ${t.activateSector}`} onClick={bounceSector}><span className="sr-only">{t.answers[selected]}: </span>{formatPercent(share,locale)}</button>
          {apologyResponses.map(value => <span key={value} className="reflection-measure" aria-hidden="true">{formatPercent(value,locale)}</span>)}
        </strong>
        {/* Size each slot for every localized answer so paging never moves the caption. */}
        <div className="reflection-finding-slot">
          <p className="reflection-finding">{t.answers[selected]}</p>
          {t.answers.map(answer => <p key={answer} className="reflection-finding-size reflection-measure" aria-hidden="true">{answer}</p>)}
        </div>
        <div className="reflection-note-slot">
          <p className="reflection-flag-note">{describe(t.flagNote)}</p>
          {apologyResponses.map(value => <p key={value} className="reflection-note-size reflection-measure" aria-hidden="true">{describe(t.flagNote,value)}</p>)}
        </div>
        <span className="reflection-page-count">{String(selected+1).padStart(2,"0")} / {String(apologyResponses.length).padStart(2,"0")}</span>
        <p className="reflection-scroll-hint" id="reflection-scroll-hint">{t.scrollHint}</p>
      </figcaption>
      <div className="reflection-side-controls" role="group" aria-label={t.pagerLabel}>
        <div className="reflection-side-zone reflection-side-left"><button type="button" className="reflection-pager-button reflection-previous" aria-label={t.previous} onClick={() => setSelected(value => Math.max(0,value-1))} disabled={selected === 0}><ChevronLeft size={24} aria-hidden="true"/></button></div>
        <div className="reflection-side-zone reflection-side-right"><button type="button" className="reflection-pager-button reflection-next" aria-label={t.next} onClick={() => setSelected(value => Math.min(apologyResponses.length-1,value+1))} disabled={selected === apologyResponses.length-1}><ChevronRight size={24} aria-hidden="true"/></button></div>
      </div>
    </figure>
    <h3 className="reflection-breakdown-title">{t.breakdown}</h3>
    <div className="reflection-mode-controls"><div className="reflection-mode-row"><span className="reflection-mode-label">{t.modeLabel}</span><div className="reflection-modes" role="group" aria-label={t.modeLabel}>{t.chartNames.map((name,index) => <button type="button" key={name} className="reflection-mode" aria-pressed={mode === index} onClick={() => setMode(index)}>{name}</button>)}</div></div><div className="reflection-mode-footer"><p className="reflection-mode-note">{t.chartNotes[mode]}</p><p className="reflection-interaction-hint">{t.interaction}</p></div></div>
    <div className="reflection-answers" role="group" aria-label={t.breakdown}>{apologyResponses.map((percent,index) => <button type="button" className="reflection-answer" key={index} data-percent={percent} aria-pressed={selected === index} onClick={() => setSelected(index)}><span className="reflection-answer-label">{t.answers[index]}</span><span className="reflection-answer-value"><span className="reflection-answer-chart"><ResponseGraphic key={mode} index={mode} percent={percent} locale={locale}/></span><span className="reflection-answer-percent">{formatPercent(percent,locale)}</span></span></button>)}</div>
    <div className="reflection-context"><p>{t.context}</p><p className="reflection-citation">{t.citation}</p><div className="reflection-source-links"><a href={reflectionSources.stokes} target="_blank" rel="noreferrer">{t.stokesLink}</a><a href={reflectionSources.data} target="_blank" rel="noreferrer">{t.dataLink}</a></div></div>
  </section>;
}
