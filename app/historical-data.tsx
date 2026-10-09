"use client";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import { formatText, formatNumber, formatPercent, type Locale } from "@/lib/i18n";
import { historicalFigures as figures, historicalTranslations, historicalSource, otherRecaptured, rescuedThenRecaptured } from "@/lib/historical-data";

function useChartAppearance(ref:RefObject<SVGSVGElement|null>,run:number) {
  const [visible,setVisible] = useState(false);
  const [appearance,setAppearance] = useState<number|null>(null);
  useEffect(()=>{
    const svg=ref.current;if(!svg)return;
    if(typeof IntersectionObserver==="undefined"){setVisible(true);return;}
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting&&entry.intersectionRatio>=.2),{threshold:.2});
    observer.observe(svg);return()=>observer.disconnect();
  },[ref]);
  // Play on first entry; a selection made off screen waits until the chart is visible.
  useEffect(()=>{if(visible)setAppearance(run);},[visible,run]);
  return appearance;
}

export default function HistoricalData({locale, recordCount}: {locale: Locale; recordCount: number}) {
  const t = historicalTranslations[locale];
  const [waffleSelection, setWaffleSelection] = useState<string | null>(null);
  const [fateSelection, setFateSelection] = useState<string | null>(null);
  const [waffleRun,setWaffleRun] = useState(0),[fateRun,setFateRun] = useState(0);
  const waffleRef=useRef<SVGSVGElement>(null),fateRef=useRef<SVGSVGElement>(null);
  const waffleAppearance=useChartAppearance(waffleRef,waffleRun),fateAppearance=useChartAppearance(fateRef,fateRun);
  const categories = [
    {id: "died", label: t.died, count: figures.died, dots: 46},
    {id: "recaptured", label: t.other, count: otherRecaptured, dots: 33},
    {id: "rescued", label: t.rescued, count: figures.rescued, dots: 21},
  ];
  const dots = categories.flatMap(category => Array.from({length: category.dots}, () => category.id));
  const outcomes = [
    {id: "recaptured", color: "died", label: t.recaptured, count: rescuedThenRecaptured},
    {id: "escaped", color: "rescued", label: t.escaped, count: figures.escaped},
  ];
  function controls(chart: "waffle" | "fate", id: string, label: string) {
    const selection = chart === "waffle" ? waffleSelection : fateSelection;
    const setSelection = chart === "waffle" ? setWaffleSelection : setFateSelection;
    const replay = chart === "waffle" ? setWaffleRun : setFateRun;
    const toggle = () => {setSelection(current => current === id ? null : id);replay(value=>value+1);};
    return {
      "aria-label": label,
      "aria-pressed": selection === id,
      "data-emphasis": selection ? (selection === id ? "selected" : "muted") : "normal",
      onClick: toggle,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "Escape") {event.preventDefault(); setSelection(null);replay(value=>value+1);}
        if ((event.key === "Enter" || event.key === " ") && event.currentTarget.tagName.toLowerCase() === "g") {event.preventDefault(); toggle();}
      },
    };
  }
  const selectedCategory = categories.find(category => category.id === waffleSelection);
  const selectedOutcome = outcomes.find(outcome => outcome.id === fateSelection);
  return <section className="historical-data-section" id="historical-data" aria-labelledby="historical-data-title">
    <div className="historical-data-heading"><div><div className="eyebrow">{t.eyebrow}</div><h2 id="historical-data-title">{t.title}</h2><p>{t.introduction}</p></div><div className="aboard-total"><strong>{formatNumber(figures.aboard,locale)}</strong><span>{t.aboard}</span></div></div>
    <p className="chart-interaction-hint">{t.interactionHint}</p>
    <div className="historical-charts">
      <figure className="historical-chart waffle-chart">
        <figcaption><h3>{t.casualties}</h3></figcaption>
        <svg ref={waffleRef} className="waffle-svg" data-animation={waffleAppearance===null?"waiting":"started"} data-animation-run={waffleAppearance} viewBox="0 0 300 300" role="group" aria-labelledby="waffle-title" aria-describedby="waffle-description">
          <title id="waffle-title">{t.casualties}</title><desc id="waffle-description">{t.waffleDescription}</desc>
          {categories.map(category => <g key={category.id} className="chart-segment" data-category={category.id} role="button" tabIndex={0} {...controls("waffle",category.id,`${category.label} · ${formatNumber(category.count,locale)} · ${formatPercent(category.dots,locale)}`)}>
            <g key={waffleAppearance??"waiting"} className="historical-dot-appearance">{dots.map((id, index) => id === category.id ? <circle key={index} data-category={id} className={`chart-${id}`} cx={15 + (index % 10) * 30} cy={15 + Math.floor(index / 10) * 30} r={12} style={{animationDelay:`${index/99*320}ms`}}/> : null)}</g>
          </g>)}
        </svg>
        <ul className="chart-legend">{categories.map(category => <li key={category.id}><button type="button" data-category={category.id} {...controls("waffle",category.id,`${category.label} · ${formatNumber(category.count,locale)} · ${formatPercent(category.dots,locale)}`)}><span className={`legend-dot chart-${category.id}`} aria-hidden="true"/><span>{category.label}</span><strong>{formatNumber(category.count,locale)}<small>{formatPercent(category.dots,locale)}</small></strong></button></li>)}</ul>
        <p className="sr-only" role="status">{selectedCategory ? formatText(t.selected,{label:selectedCategory.label,count:selectedCategory.count,percent:formatPercent(selectedCategory.dots,locale)}) : t.allVisible}</p>
        <p className="chart-note">{t.waffleNote}</p>
      </figure>
      <figure className="historical-chart fate-chart">
        <figcaption><h3>{t.fate}</h3><p>{t.fateBody}</p></figcaption>
        <div className="donut-wrap">
          <svg ref={fateRef} className="donut-svg" data-animation={fateAppearance===null?"waiting":"started"} data-animation-run={fateAppearance} viewBox="0 0 260 260" role="group" aria-labelledby="donut-title" aria-describedby="donut-description">
            <title id="donut-title">{t.fate}</title><desc id="donut-description">{t.ringDescription}</desc>
            <g className="chart-segment" data-category="recaptured" role="button" tabIndex={0} {...controls("fate","recaptured",`${t.recaptured} · ${formatNumber(rescuedThenRecaptured,locale)} · ${formatPercent(99.22,locale)}`)}>
              <circle key={fateAppearance??"waiting"} className="chart-died historical-ring-appearance" style={{"--ring-total":figures.rescued,"--ring-segment":`${rescuedThenRecaptured} ${figures.escaped}`} as CSSProperties} cx="130" cy="130" r="105" fill="none" strokeWidth="34" pathLength={figures.rescued} strokeDasharray={`${rescuedThenRecaptured} ${figures.escaped}`} transform={`rotate(${-90 + 360 * figures.escaped / figures.rescued} 130 130)`}/>
            </g>
            <g className="chart-segment" data-category="escaped" role="button" tabIndex={0} {...controls("fate","escaped",`${t.escaped} · ${formatNumber(figures.escaped,locale)} · ${formatPercent(.78,locale)}`)}>
              <circle key={fateAppearance??"waiting"} className="chart-rescued historical-ring-appearance" style={{"--ring-total":figures.rescued,"--ring-segment":`${figures.escaped} ${rescuedThenRecaptured}`} as CSSProperties} data-escaped={figures.escaped} cx="130" cy="130" r="105" fill="none" strokeWidth="34" pathLength={figures.rescued} strokeDasharray={`${figures.escaped} ${rescuedThenRecaptured}`} transform="rotate(-90 130 130)"/>
              <circle className="ring-hit-target" cx="130" cy="130" r="105" fill="none" stroke="transparent" strokeWidth="44" pathLength={figures.rescued} strokeDasharray="12 372" transform="rotate(-94.21875 130 130)"/>
            </g>
          </svg>
          <div key={fateAppearance??"waiting"} className="donut-label" data-animation={fateAppearance===null?"waiting":"started"} aria-hidden="true"><strong>&lt;1%</strong><span>{t.escapedShare}</span></div>
        </div>
        <p className="donut-exact">{t.exactShare}</p>
        <ul className="chart-legend">{outcomes.map(outcome => <li key={outcome.id}><button type="button" data-category={outcome.id} {...controls("fate",outcome.id,`${outcome.label} · ${formatNumber(outcome.count,locale)} · ${formatPercent(outcome.id === "escaped" ? .78 : 99.22,locale)}`)}><span className={`legend-dot chart-${outcome.color}`} aria-hidden="true"/><span>{outcome.label}</span><strong>{outcome.count}</strong></button></li>)}</ul>
        <p className="sr-only" role="status">{selectedOutcome ? formatText(t.selected,{label:selectedOutcome.label,count:selectedOutcome.count,percent:formatPercent(selectedOutcome.id === "escaped" ? .78 : 99.22,locale)}) : t.allVisible}</p>
      </figure>
    </div>
    <div className="historical-data-notes"><h3>{t.contextTitle}</h3><p>{t.context}</p><p>{formatText(t.rosterNote,{count:recordCount})}</p><div className="historical-citation"><p>{t.source}</p><a href={historicalSource} target="_blank" rel="noreferrer">{t.sourceLink} ↗</a></div></div>
  </section>;
}
