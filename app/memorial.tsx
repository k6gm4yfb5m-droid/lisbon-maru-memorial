"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Anchor, Waves, Search, Flower2, BookOpen, X, Check, ChevronLeft, ChevronRight, Download, ArrowUpRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { memorialRecords as records, unitGroups, unitName, type UnitId } from "@/lib/units";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translations, languageTags, languageDirections, formatText, type Locale } from "@/lib/i18n";
import RitualLight from "./ritual-light";
import CoordinateTypewriter from "./coordinate-typewriter";
import LanguageMenu from "./language-menu";
import SectionPages from "./section-pages";
import MemoryArchive from "@/app/memory-archive";
import { archiveTranslations } from "@/lib/memory-archive";
import WarReflection from "@/app/war-reflection";
import VisitorReflections from "./visitor-reflections";
import PoppyRitual from "./poppy-ritual";
import { poppyTranslations } from "@/lib/poppy-ritual";
import { visitorReflectionTranslations } from "@/lib/visitor-reflections";
import { reflectionTranslations } from "@/lib/war-reflection";
import HistoricalData from "@/app/historical-data";
import NamesToStars from "@/app/names-to-stars";
import SinkingTimeline from "@/app/sinking-timeline";
import { timelineTranslations } from "@/lib/sinking-timeline";
import { personDisplay } from "@/lib/person-display";
import { historicalTranslations } from "@/lib/historical-data";
import ShipHolds from "@/app/ship-holds";
import { shipHoldTranslations } from "@/lib/ship-holds";
import Geography from "@/app/geography";
import EventTopology from "@/app/event-topology";
import FishermenRescue from "@/app/rescue";
import { rescueTranslations } from "@/lib/rescue";
import { topologyTranslations } from "@/lib/event-topology";
import { geographyTranslations } from "@/lib/geography";
import IncidentBackground from "@/app/incident-background";
import { backgroundTranslations } from "@/lib/incident-background";
type Person = typeof records[number];
type TributeResponse = {count: number; remembered: boolean; error?: string};
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const normalize = (v: string) => v.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export default function Memorial({initialPersonId, initialLocale}: {initialPersonId?: string; initialLocale: Locale}) {
 const [locale, setLocale] = useState<Locale>(initialLocale);
 const t = translations[locale];
 const requestEpoch = useRef(0);
 const detailTrigger = useRef<HTMLElement | null>(null);
 const searchInput = useRef<HTMLInputElement>(null);
 const [query, setQuery] = useState("");
 const [letter, setLetter] = useState("全部");
 const [page, setPage] = useState(1);
 const [pageSize,setPageSize] = useState(24);
 const pageSizeRef=useRef(24);
 const [viewMode, setViewMode] = useState<"names" | "units">("names");
 const [unit, setUnit] = useState<UnitId | "all">("all");
 const [person, setPerson] = useState<Person | null>(() => records.find(p=>p.id===initialPersonId) || null);
 const [flowers, setFlowers] = useState<number | null>(null);
 const [remembered, setRemembered] = useState(false);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<"" | "read" | "save">("");
 const filtered = useMemo(() => records.filter(p => (viewMode === "units" ? (unit === "all" || p.unitId === unit) : (letter === "全部" || p.letter === letter)) && normalize(`${p.name} ${p.details}`).includes(normalize(query))), [query, letter, viewMode, unit]);
 const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
 const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
 useEffect(()=>{
  const roll=document.getElementById('roll');if(!roll)return;
  let frame=0;
  function measure(){
   frame=0;const grid=roll!.querySelector<HTMLElement>('.name-grid'),footer=roll!.querySelector<HTMLElement>('.roll-footer');if(!grid || !footer || document.body.style.overflow==='hidden')return;
   const scale=parseFloat(getComputedStyle(document.body).zoom)||1;
   const height=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--section-page-height'))||innerHeight;
   const chrome=(grid.getBoundingClientRect().top-roll!.getBoundingClientRect().top+footer.getBoundingClientRect().height)/scale+parseFloat(getComputedStyle(footer).marginTop)+parseFloat(getComputedStyle(roll!).paddingBottom)+12;
   const columns=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
   const row=Math.max(1,...Array.from(grid.children).map(card=>card.getBoundingClientRect().height/scale));
   const size=Math.min(24,Math.max(1,Math.floor((height-chrome)/row))*columns);
   if(size!==pageSizeRef.current){const old=pageSizeRef.current;pageSizeRef.current=size;setPage(p=>Math.floor((p-1)*old/size)+1);setPageSize(size);}
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
  const observer=new ResizeObserver(schedule);observer.observe(roll);schedule();
  window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);};
 },[locale,viewMode,query,letter,unit]);
 const currentUnitName = unit === "all" ? t.allUnits : unitName(unit,locale);
 function chooseUnit(next: UnitId | "all") {setUnit(next);setPage(1);}
 const openPerson = (p: Person) => { detailTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; requestEpoch.current++; setSaving(false); setFlowers(null); setRemembered(false); setError(""); setPerson(p); };
 useEffect(() => {
  if (!person) return;
  const controller = new AbortController();
  fetch(`/api/tributes?personId=${person.id}`, {signal: controller.signal}).then(async r => {
   if (!r.ok) throw new Error("read");
   const data = await r.json() as TributeResponse; setFlowers(data.count); setRemembered(data.remembered);
  }).catch(e => {if (e.name !== "AbortError") setError("read");});
  const url = new URL(window.location.href); url.searchParams.set("person", person.id); window.history.replaceState(null, "", url);
  return () => controller.abort();
 }, [person]);
 async function offerFlower() {
  if (!person || saving || remembered) return;
  const epoch = requestEpoch.current;
  setSaving(true); setError("");
  try {
   const r = await fetch("/api/tributes", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({personId: person.id})});
   const data = await r.json() as TributeResponse; if (!r.ok) throw new Error("save");
   if (requestEpoch.current === epoch) {setFlowers(data.count); setRemembered(true);}
  } catch {if (requestEpoch.current === epoch) setError("save");}
  finally {if (requestEpoch.current === epoch) setSaving(false);}
 }
 function closePerson() {
  requestEpoch.current++; setSaving(false); setPerson(null); const url = new URL(window.location.href); url.searchParams.delete("person"); window.history.replaceState(null, "", url);
 }
 function changePage(next: number) {setPage(next);requestAnimationFrame(()=>{const roll=document.getElementById('roll');if(roll)window.scrollTo({top:scrollY+roll.getBoundingClientRect().top-(visualViewport?.offsetTop??0),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});}
 useEffect(() => {
  type Context = {registerTool: (tool: Record<string, unknown>, options: {signal: AbortSignal}) => unknown};
  const context = (document as Document & {modelContext?: Context}).modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  try {
   Promise.resolve(context.registerTool({name: "search_memorial_records", title: t.toolTitle, description: t.toolDescription, inputSchema: {type: "object", properties: {query: {type: "string", maxLength: 120}, unitId: {type:"string", enum:["all",...unitGroups.map(u=>u.id)]}}, required: ["query"], additionalProperties: false}, annotations: {readOnlyHint: true, untrustedContentHint: true}, execute: (input: unknown) => {
    const value = input as {query?: unknown; unitId?: unknown};
    if (!value || typeof value.query !== "string" || value.query.length > 120) throw new Error(t.toolError);
    if (value.unitId !== undefined && value.unitId !== "all" && !unitGroups.some(u=>u.id===value.unitId)) throw new Error(t.toolError);
    const q = value.query; const selectedUnit = (value.unitId || "all") as UnitId | "all"; setQuery(q); setLetter("全部"); setUnit(selectedUnit); if(value.unitId) setViewMode("units"); setPage(1);
    return {matches: records.filter(p => (selectedUnit === "all" || p.unitId===selectedUnit) && normalize(`${p.name} ${p.details}`).includes(normalize(q))).map(p => ({id: p.id, name: p.name, details: p.details, unitId: p.unitId}))};
   }}, {signal: lifecycle.signal})).catch(console.error);
  } catch (e) {console.error(e);}
  return () => lifecycle.abort();
 }, [t]);
 useEffect(() => {document.documentElement.lang = languageTags[locale]; document.documentElement.dir = languageDirections[locale]; document.title = t.title; document.querySelector('meta[name="description"]')?.setAttribute("content", t.description); document.cookie = `lm_language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;}, [locale, t.title, t.description]);
 function changeLanguage(next: Locale) {
  setLocale(next);
  const url = new URL(window.location.href); url.searchParams.set("lang", next); window.history.replaceState(null, "", url);
 }
 const resultList = <>
    <div className="results-line" aria-live="polite"><span>{query || (viewMode === "names" ? letter!=="全部" : unit!=="all") ? formatText(t.found,{count:filtered.length}) : t.names}</span><span>{filtered.length ? `${(page-1)*pageSize+1}–${Math.min(page*pageSize,filtered.length)} / ${filtered.length}` : t.zero}</span></div>
    {visible.length ? <div className="name-grid">{visible.map((p,i)=><button className="person-card" key={p.id} onClick={()=>openPerson(p)}><span className="person-index">{String((page-1)*pageSize+i+1).padStart(3,"0")}</span><span className="person-name" dir="ltr" lang="en">{personDisplay(p).name}</span><span className="person-action"><BookOpen size={17} strokeWidth={1.4}/><span>{t.read}</span></span></button>)}</div> : <div className="no-results"><Search size={28}/><h3>{t.emptyTitle}</h3><p>{viewMode === "units" ? t.unitEmpty : t.emptyBody}</p><button className="text-button" onClick={()=>{setQuery("");setLetter("全部");setUnit("all");setPage(1);}}>{t.reset}</button></div>}
    <div className="roll-footer"><span>{t.rollFooter}</span><Pagination aria-label={t.pagination}><PaginationContent><PaginationItem><button className="page-button" disabled={page===1} onClick={()=>changePage(page-1)} aria-label={t.previous}><ChevronLeft size={18}/></button></PaginationItem><PaginationItem><span className="page-number">{page} / {pageCount}</span></PaginationItem><PaginationItem><button className="page-button" disabled={page===pageCount} onClick={()=>changePage(page+1)} aria-label={t.next}><ChevronRight size={18}/></button></PaginationItem></PaginationContent></Pagination></div>
 </>;
 return <>
  <a className="skip-link" href="#roll">{t.skip}</a>
  <header id="top" className={`site-header locale-${locale}`} dir={languageDirections[locale]}>
   <a className="brand" href="#top" aria-label={t.home}><Anchor strokeWidth={1.2}/><span>{t.brand}<small>{t.brandSubtitle}</small></span></a>
   <nav aria-label={t.nav}><a href="#incident-background">{backgroundTranslations[locale].nav}</a><a href="#roll">{t.roll}</a><a href="#sinking-timeline">{timelineTranslations[locale].nav}</a><a href="#historical-data">{historicalTranslations[locale].nav}</a><a href="#ship-holds">{shipHoldTranslations[locale].nav}</a><a href="#geography">{geographyTranslations[locale].nav}</a><a href="#fishermen-rescue">{rescueTranslations[locale].nav}</a><a href="#event-topology">{topologyTranslations[locale].nav}</a><a href="#history">{t.history}</a><a href="#memory-archive">{archiveTranslations[locale].nav}</a><a href="#war-reflection">{reflectionTranslations[locale].nav}</a><a href="#poppy-ritual">{poppyTranslations[locale].nav}</a><a href="#visitor-reflections">{visitorReflectionTranslations[locale].nav}</a><a href="#sources">{t.sources}</a></nav><LanguageMenu locale={locale} onChange={changeLanguage}/>
  </header>
  <main id="memorial-main" lang={languageTags[locale]} dir={languageDirections[locale]}>
   <section id="memorial-intro" className={`intro locale-${locale}`} aria-labelledby="memorial-heading">
    <RitualLight/><div className="intro-copy"><div className="eyebrow"><span/> {t.introEyebrow}</div><h1 id="memorial-heading">{t.hero[0]}<br/>{t.hero[1]}</h1><p>{t.subtitle}</p><div className="intro-rule"/><p className="intro-note">{t.intro[0]}<br/>{t.intro[1]}</p><div className="intro-actions"><a className="ceremony-link" href="#roll">{t.roll}<ArrowUpRight size={18}/></a><a className="ceremony-link secondary" href="#incident-background">{backgroundTranslations[locale].nav}<ChevronRight size={17}/></a></div></div>
    <div className="dedication"><Waves size={38} strokeWidth={1}/><p className="dedication-english">{t.dedication[0]}<br/>{t.dedication[1]}</p><span>{t.dedicatedTo}</span><div className="dedication-date">{t.date}<br/><span>{t.sea}</span></div><div className="dedication-coordinate"><span className="dedication-coordinate-label">{t.wreckCoordinate}</span><CoordinateTypewriter/></div></div>
   </section>
   <IncidentBackground locale={locale}/>
   <section className="roll-section" id="roll" aria-labelledby="roll-title">
    <div className="section-heading"><div><div className="eyebrow">{t.rollEyebrow}</div><h2 id="roll-title">{t.rollHeading}</h2></div><p><strong>{records.length}</strong> {t.recordCount}<span>{t.clickPrompt}</span></p></div>
    <Tabs className="browse-tabs" value={viewMode} onValueChange={v=>{setViewMode(v as "names" | "units");setPage(1);}}>
     <TabsList className="browse-tab-list" variant="line" aria-label={t.viewLabel}><TabsTrigger value="names">{t.byName}</TabsTrigger><TabsTrigger value="units">{t.byUnit}</TabsTrigger></TabsList>
    <div className="toolbar" id="roll-toolbar"><label className="search-box"><Search size={20} strokeWidth={1.5}/><span className="sr-only">{t.searchLabel}</span><input ref={searchInput} value={query} onChange={e => {setQuery(e.target.value);setPage(1);}} placeholder={t.searchPlaceholder} maxLength={120}/>{query && <button onClick={()=>{setQuery("");setPage(1);}} aria-label={t.clear}><X size={18}/></button>}</label><span className="sort-note">{t.sort}</span></div>

     <TabsContent value="names">
    <div dir="ltr" className="alphabet" aria-label={t.alphabetLabel}>{["全部", ...alphabet].map(l => <button key={l} aria-pressed={letter===l} disabled={l!=="全部" && !records.some(p => p.letter===l)} onClick={()=>{setLetter(l);setPage(1);}}>{l === "全部" ? t.all : l}</button>)}</div>

      {resultList}
     </TabsContent>
     <TabsContent value="units">
      <p className="unit-note">{t.unitNote}</p>
      <div className="unit-mobile"><label id="unit-select-label">{t.unitLabel}</label><Select value={unit} onValueChange={v=>chooseUnit(v as UnitId | "all")}><SelectTrigger aria-labelledby="unit-select-label" className="unit-select"><SelectValue/></SelectTrigger><SelectContent position="popper"><SelectItem value="all">{t.allUnits} ({records.length})</SelectItem>{unitGroups.map(group=><SelectItem key={group.id} value={group.id}>{unitName(group.id,locale)} ({group.count})</SelectItem>)}</SelectContent></Select></div>
      <div className="unit-layout">
       <aside className="unit-sidebar" aria-label={t.unitLabel}><div className="unit-sidebar-label">{t.unitLabel}</div><button className="unit-choice" aria-pressed={unit==="all"} onClick={()=>chooseUnit("all")}><span>{t.allUnits}</span><strong>{records.length}</strong></button>{unitGroups.map(group=><button key={group.id} className="unit-choice" aria-pressed={unit===group.id} onClick={()=>chooseUnit(group.id)}><span>{unitName(group.id,locale)}</span><strong>{group.count}</strong></button>)}</aside>
       <div className="unit-results"><h3 className="unit-heading">{formatText(t.unitHeading,{unit:currentUnitName,count:filtered.length})}</h3>{unit==="other" && <p className="unit-other-note">{t.unitOtherNote}</p>}{resultList}</div>
      </div>
     </TabsContent>
    </Tabs>
   </section>
   <NamesToStars locale={locale} onReadPerson={openPerson} detailsOpen={!!person}/>
   <SinkingTimeline locale={locale}/>
   <HistoricalData locale={locale} recordCount={records.length}/>
   <ShipHolds locale={locale}/>
   <Geography locale={locale}/>
   <FishermenRescue locale={locale}/>
   <EventTopology locale={locale}/>
   <section className="history-section" id="history"><div><div className="eyebrow">{t.historyEyebrow}</div><h2>{t.historyHeading[0]}<br/>{t.historyHeading[1]}</h2><a href="https://www.lisbonmaru.org.uk/resource/html/Background%2Bto%2Bthe%2Bsinking%2Bof%2Bthe%2Blisbon%2Bmaru" target="_blank" rel="noreferrer">{t.historyLink}</a></div><div className="history-text"><p>{t.historyBody[0]}</p><p>{t.historyBody[1]}</p><span>{t.historySource}</span></div></section>
   <MemoryArchive locale={locale}/>
   <WarReflection locale={locale}/>
   <PoppyRitual locale={locale}/>
   <VisitorReflections locale={locale}/>
   <section className="source-section" id="sources"><div><div className="eyebrow">{t.sourcesEyebrow}</div><h2>{t.sourcesHeading}</h2></div><div><p>{formatText(t.sourceBody[0],{count:records.length})}</p><p>{t.sourceBody[1]}</p><p>{t.unitSourceNote}</p><a className="download-link" href="/data/lisbon_maru_casualties.csv" download><Download size={16}/>{t.download}</a></div></section>
  </main>
  <SectionPages locale={locale}/>
  <footer className="site-footer" dir={languageDirections[locale]}><div className="footer-brand"><Anchor size={21} strokeWidth={1}/>{t.footerBrand}</div><span>{t.footerNote}</span><a href="#top">{t.top}</a></footer>
  <Sheet open={!!person} onOpenChange={open=>{if(!open) closePerson();}}><SheetContent dir={languageDirections[locale]} className="memorial-sheet w-full sm:max-w-[540px]" showCloseButton={false} onCloseAutoFocus={event=>{event.preventDefault(); const target = detailTrigger.current?.isConnected ? detailTrigger.current : searchInput.current; target?.focus({preventScroll:true});}}>
   {person && <><button className="sheet-close" onClick={closePerson} aria-label={t.close}><X size={22}/></button><div className="sheet-top"><div className="eyebrow">{t.memoryEyebrow}</div><Anchor size={40} strokeWidth={0.8}/><SheetTitle className="sheet-name" dir="ltr" lang="en">{personDisplay(person).name}</SheetTitle><SheetDescription className="sheet-description">{t.personDescription}</SheetDescription><span className="record-id">{person.id.toUpperCase()}</span></div><div className="sheet-body"><div className="record-label">{t.original}</div><dl><div><dt>{t.unitField}</dt><dd>{unitName(person.unitId,locale)}</dd></div><div><dt>{t.nameLabel}</dt><dd dir="ltr" lang="en">{personDisplay(person).name}</dd></div><div><dt>{t.detailsLabel}</dt><dd className="raw-details" dir={personDisplay(person).details ? "ltr" : languageDirections[locale]} lang={personDisplay(person).details ? "en" : languageTags[locale]}>{personDisplay(person).details || t.missing}</dd></div></dl><p className="record-note">{t.recordNote}</p><div className="source-row">{formatText(t.sourceRow,{row:person.sourceRow})}</div><div className="tribute-box"><Flower2 size={32} strokeWidth={1}/><h3>{t.tributeTitle}</h3><p>{t.tributeBody}</p><button className="flower-button" disabled={saving || remembered || flowers===null} onClick={offerFlower}>{remembered ? <Check size={18}/> : <Flower2 size={18}/>} {saving ? t.saving : remembered ? t.remembered : t.flower}</button><div className="flower-count" aria-live="polite">{flowers===null ? (error ? t.unavailable : t.loading) : formatText(t.flowerCount,{count:flowers})}</div><p className="tribute-note">{t.tributeNote}</p>{error && <div className="save-error" role="alert">{error === "read" ? t.readError : t.saveError}<button onClick={()=>{setError("");setPerson({...person});}}>{t.retry}</button></div>}</div><div className="closing-line">{t.closing}<small>{t.closingEnglish}</small></div></div></>}
  </SheetContent></Sheet>
 </>;
}
