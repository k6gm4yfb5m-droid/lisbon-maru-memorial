"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Anchor } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatText, formatNumber, formatPercent, type Locale } from "@/lib/i18n";
import { historicalSource } from "@/lib/historical-data";
import { shipHolds, shipPOWTotal, shipHoldTranslations, type HoldId } from "@/lib/ship-holds";

export default function ShipHolds({locale}: {locale: Locale}) {
  const t = shipHoldTranslations[locale];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HoldId>("1");
  const icon = useRef<HTMLButtonElement>(null);
  const holdName = (id: HoldId) => formatText(t.hold,{id});
  const active = shipHolds.find(hold => hold.id === selected)!;
  function close() {setOpen(false); icon.current?.focus({preventScroll:true});}
  return <section className="ship-holds-section" id="ship-holds" aria-labelledby="ship-holds-title" onKeyDown={event=>{if(open && event.key === "Escape"){event.preventDefault();close();}}}>
    <div className="ship-holds-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="ship-holds-title">{t.title}</h2><p>{t.intro}</p></div>
    <div className="ship-holds-layout">
      <div className="ship-icon-column">
        <button ref={icon} type="button" className="ship-icon-button" aria-expanded={open} aria-controls="ship-hold-information" aria-label={open ? t.close : t.open} onClick={()=>setOpen(current=>!current)}>
          <Image src="/images/lisbon-maru-icon.jpg" alt={t.iconAlt} width={1769} height={1053} unoptimized className="ship-icon-image"/>
          <span className="ship-icon-caption">{t.iconCaption}</span>
          <span className="ship-icon-action">{open ? t.close : t.open}{open ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</span>
        </button>
        <p className="ship-graphic-note">{t.graphicNote}</p>
      </div>
      <div className="ship-hold-placeholder" hidden={open}><Anchor size={32} strokeWidth={1}/><h3>{t.promptTitle}</h3><p>{t.prompt}</p></div>
      <div id="ship-hold-information" className="ship-hold-information" hidden={!open} role="region" aria-label={t.panel}>
        <Tabs value={selected} onValueChange={value=>setSelected(value as HoldId)} className="hold-tabs">
          <TabsList variant="line" className="hold-tab-list" aria-label={t.select}>{shipHolds.map(hold=><TabsTrigger value={hold.id} key={hold.id}>{holdName(hold.id)}</TabsTrigger>)}</TabsList>
          {shipHolds.map(hold=><TabsContent value={hold.id} key={hold.id} className="hold-content">
            <div className="hold-summary">
            <div className="hold-detail"><div><span className="hold-number">{locale === "en" ? `HOLD NO.${hold.id}` : holdName(hold.id)}</span><h3>{holdName(hold.id)}</h3><p className="hold-share-label">{t.share}</p></div><div className="hold-donut" role="img" aria-label={`${holdName(hold.id)} · ${t.share} · ${formatPercent(hold.percent,locale)}`}>
              <svg viewBox="0 0 120 120" aria-hidden="true"><circle className="hold-donut-track" cx={60} cy={60} r={48}/><circle className="hold-donut-share" data-share={hold.percent} cx={60} cy={60} r={48} pathLength={100} strokeDasharray={`${hold.percent} ${100-hold.percent}`} transform="rotate(-90 60 60)"/></svg>
              <strong className="hold-percent">{formatNumber(hold.percent,locale)}<span>%</span></strong>
            </div></div>
            <div className="hold-population"><div><span>{t.population}</span><small>{t.noteBasis}</small></div><strong data-headcount={hold.people}>{formatNumber(hold.people,locale)}<small>{t.people}</small></strong></div>
            </div>
            <div className="hold-unit-details"><h4 id={`hold-${hold.id}-units`}>{t.unitHeading}</h4><table className="hold-unit-table" aria-labelledby={`hold-${hold.id}-units`}><thead><tr><th scope="col">{t.unitLabel}</th><th scope="col">{t.countLabel}</th></tr></thead><tbody>{hold.units.map(unit=><tr key={unit.id} data-unit={unit.id}><th scope="row">{t.unitNames[unit.id]}</th><td>{unit.people}</td></tr>)}</tbody><tfoot><tr><th scope="row">{t.totalLabel}</th><td>{formatNumber(hold.people,locale)}</td></tr></tfoot></table></div>
          </TabsContent>)}
        </Tabs>
        <div className="hold-distribution"><p>{t.distribution}</p><div className="hold-distribution-bar" role="group" aria-label={t.select}>{shipHolds.map(hold=><button type="button" key={hold.id} style={{width:`${hold.percent}%`}} data-hold={hold.id} aria-label={`${holdName(hold.id)} · ${formatPercent(hold.percent,locale)}`} aria-pressed={selected===hold.id} onClick={()=>setSelected(hold.id)}><span>{formatPercent(hold.percent,locale)}</span></button>)}</div><div className="hold-bar-labels">{shipHolds.map(hold=><span key={hold.id}>{holdName(hold.id)} · {formatPercent(hold.percent,locale)}</span>)}</div></div>
        <p className="sr-only" role="status">{open ? formatText(t.selected,{hold:holdName(active.id),count:active.people,percent:active.percent}) : ""}</p>
        <button className="hold-close" type="button" onClick={close}>{t.close}<ChevronUp size={16}/></button>
      </div>
    </div>
    <div className="ship-holds-source"><p>{formatText(t.source,{total:formatNumber(shipPOWTotal,locale)})}</p><span>{t.reference}</span><a href={historicalSource} target="_blank" rel="noreferrer">{t.sourceLink} ↗</a></div>
  </section>;
}
