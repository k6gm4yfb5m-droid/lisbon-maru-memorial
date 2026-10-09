"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, BookOpen, ChevronDown, ChevronUp, Mail, MessageSquare } from "lucide-react";
import FullscreenView from "./fullscreen-view";
import type { Locale } from "@/lib/i18n";
import { archiveRecords, archiveTranslations, archivePassageTranslations, archiveFoldTranslations, type ArchiveCategory } from "@/lib/memory-archive";

const categories = ["all", "letter", "witness", "family"] as const;
const symbols = { letter: Mail, witness: BookOpen, family: MessageSquare };
export default function MemoryArchive({locale}:{locale:Locale}) {
  const t = archiveTranslations[locale];
  const f = archiveFoldTranslations[locale];
  const paperId = useId();
  const [filter,setFilter] = useState<ArchiveCategory|"all">("all");
  const [selected,setSelected] = useState(0);
  const [opened,setOpened] = useState(false);
  const [passage,setPassage] = useState(0);
  const [foldCount,setFoldCount] = useState(1);
  const foldCountRef = useRef(1);
  const paper = useRef<HTMLQuoteElement>(null);
  const suppressClick = useRef(false);
  const [translated,setTranslated] = useState(true);
  const reader = useRef<HTMLElement>(null);
  const record = archiveRecords[selected];
  const visible = archiveRecords.map((item,index)=>({item,index})).filter(({item})=>filter === "all" || item.category === filter);
  const position = visible.findIndex(({index})=>index === selected);
  const Icon = symbols[record.category];
  function choose(index:number, scroll=false) {
    setSelected(index);setPassage(0);setPaperCount(1);
    if(scroll)requestAnimationFrame(()=>reader.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"}));
  }
  function chooseFilter(value:typeof filter) {
    setFilter(value);
    if(value !== "all" && record.category !== value)choose(archiveRecords.findIndex(item=>item.category===value));
  }
  function openArchive() {setOpened(true);setPassage(0);setPaperCount(1);}
  function setPaperCount(count:number) {
    foldCountRef.current = count;
    setFoldCount(count);
  }
  function readPassage(index:number) {setPassage(index);}
  function moveFold(direction:number) {
    const next = foldCountRef.current + direction;
    if(next < 0 || next > record.original.length)return false;
    setPaperCount(next);
    setPassage(value=>direction>0?next-1:Math.min(value,Math.max(0,next-1)));
    return true;
  }
  useEffect(()=>{
    const sheet = paper.current;
    if(!sheet || !opened)return;
    let lastWheel = 0, wheelTotal = 0, wheelDirection = 0, wheelTurned = false;
    let startX = 0, startY = 0, active = false, turned = false;
    let clickTimer:ReturnType<typeof setTimeout>;
    const canMove = (direction:number)=>direction>0?foldCountRef.current<record.original.length:foldCountRef.current>0;
    const onWheel = (event:WheelEvent)=>{
      if(event.ctrlKey || !event.cancelable || Math.abs(event.deltaX)>Math.abs(event.deltaY) || !event.deltaY)return;
      const now = performance.now(), direction = Math.sign(event.deltaY);
      // A trackpad's momentum belongs to the same fold, not the following folds.
      if(now-lastWheel>220 || direction!==wheelDirection){wheelTotal=0;wheelTurned=false;}
      lastWheel=now;wheelDirection=direction;
      if(wheelTurned){event.preventDefault();return;}
      // A fresh gesture at either boundary resumes ordinary page scrolling.
      if(!canMove(direction))return;
      event.preventDefault();
      wheelTotal+=Math.abs(event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);
      if(wheelTotal>=45){wheelTurned=true;moveFold(direction);}
    };
    const begin = (x:number,y:number)=>{startX=x;startY=y;active=true;turned=false;suppressClick.current=false;};
    const onMouseDown = (event:MouseEvent)=>{
      if(event.target instanceof Element && event.target.closest('.archive-fold-corner')){active=false;return;}
      if(event.button===0)begin(event.clientX,event.clientY);
    };
    const onMouseMove = (event:MouseEvent)=>{
      if(!active || turned)return;
      const dy=event.clientY-startY;
      if(Math.abs(dy)<40 || Math.abs(dy)<Math.abs(event.clientX-startX))return;
      if(moveFold(Math.sign(dy))){turned=true;suppressClick.current=true;event.preventDefault();}
    };
    const end = ()=>{active=false;clickTimer=setTimeout(()=>{suppressClick.current=false;},0);};
    const onTouchStart = (event:TouchEvent)=>{
      if(event.target instanceof Element && event.target.closest('.archive-fold-corner')){active=false;return;}
      if(event.touches.length===1)begin(event.touches[0].clientX,event.touches[0].clientY);else active=false;
    };
    const onTouchMove = (event:TouchEvent)=>{
      if(!active || event.touches.length!==1)return;
      const touch=event.touches[0],dy=startY-touch.clientY;
      if(Math.abs(dy)<8 || Math.abs(dy)<Math.abs(touch.clientX-startX))return;
      if(turned){if(event.cancelable)event.preventDefault();return;}
      if(!canMove(Math.sign(dy)))return;
      if(event.cancelable)event.preventDefault();
      if(Math.abs(dy)>=40){moveFold(Math.sign(dy));turned=true;suppressClick.current=true;}
    };
    sheet.addEventListener('wheel',onWheel,{passive:false});
    sheet.addEventListener('mousedown',onMouseDown);
    window.addEventListener('mousemove',onMouseMove);
    window.addEventListener('mouseup',end);
    sheet.addEventListener('touchstart',onTouchStart,{passive:true});
    sheet.addEventListener('touchmove',onTouchMove,{passive:false});
    sheet.addEventListener('touchend',end);sheet.addEventListener('touchcancel',end);
    return ()=>{
      clearTimeout(clickTimer);
      sheet.removeEventListener('wheel',onWheel);sheet.removeEventListener('mousedown',onMouseDown);
      window.removeEventListener('mousemove',onMouseMove);window.removeEventListener('mouseup',end);
      sheet.removeEventListener('touchstart',onTouchStart);sheet.removeEventListener('touchmove',onTouchMove);
      sheet.removeEventListener('touchend',end);sheet.removeEventListener('touchcancel',end);
    };
  },[opened,selected]);
  return <section id="memory-archive" className="memory-archive" data-reading={opened} aria-labelledby="archive-title">
    <div className="archive-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="archive-title">{t.title}</h2><p>{t.intro}</p></div>
    <FullscreenView locale={locale} title={t.reading} kind="archive">
      <div className="archive-workspace">
        <aside className="archive-index" aria-label={t.choose}>
          <div className="archive-filters" role="group" aria-label={t.choose}>{categories.map((category,index)=><button type="button" key={category} aria-pressed={filter===category} onClick={()=>chooseFilter(category)}>{t.categories[index]}<span>{category === "all" ? archiveRecords.length : archiveRecords.filter(item=>item.category===category).length}</span></button>)}</div>
          <div className="archive-records">{visible.map(({item,index})=>{
            const Symbol = symbols[item.category];
            return <button type="button" key={item.id} className="archive-record" aria-pressed={selected===index} onClick={()=>choose(index,true)}><Symbol size={18} strokeWidth={1.2} aria-hidden="true"/><span><strong>{item.name}</strong><small>{t.relations[item.relation]}</small></span></button>;
          })}</div>
        </aside>
        <article ref={reader} className="archive-reader" aria-labelledby="archive-person" data-record={record.id}>
          <header className="archive-reader-header"><div><span className="archive-kind">{t.categories[categories.indexOf(record.category)]}</span><h3 id="archive-person">{record.name}</h3><p>{t.relations[record.relation]} · {record.rank !== undefined ? `${t.ranks[record.rank]} · ` : ""}{t.units[record.unit]}</p></div><Icon size={30} strokeWidth={1} aria-hidden="true"/></header>
          {!opened ? <div className="archive-closed"><button type="button" className="archive-envelope-button" aria-label={t.open} onClick={openArchive}><Mail size={76} strokeWidth={.85} aria-hidden="true"/></button><span className="archive-address">{t.relations[record.relation]}</span><p>{t.closed}</p><button type="button" className="archive-open" onClick={openArchive}><Mail size={20} strokeWidth={1.2} aria-hidden="true"/>{t.open}</button></div> : <div className="archive-reading" key={record.id}>
            <div className="archive-reading-toolbar"><span>{t.original}</span><div>{locale!=="en" && <button type="button" aria-pressed={translated} onClick={()=>setTranslated(value=>!value)}>{translated?t.hide:t.show}</button>}<button type="button" onClick={()=>setOpened(false)}>{t.close}</button></div></div>
            <blockquote ref={paper} tabIndex={0} className="archive-original archive-fold-paper" aria-label={f.paper} aria-describedby={`${paperId}-hint ${paperId}-keys`} onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}} onKeyDown={event=>{
              if(event.key==="ArrowDown" || event.key==="ArrowUp") {if(moveFold(event.key==="ArrowDown"?1:-1))event.preventDefault();}
              else if(event.target===event.currentTarget && (event.key==="Home" || event.key==="End")){event.preventDefault();const count=event.key==="Home"?0:record.original.length;setPaperCount(count);setPassage(Math.max(0,count-1));}
            }}><button type="button" className="archive-fold-corner archive-fold-corner-close" aria-label={f.closeFold} title={f.closeFold} disabled={foldCount===0} onClick={()=>moveFold(-1)}><ChevronUp size={14} strokeWidth={1.2} aria-hidden="true"/></button>{record.original.map((text,index)=>{
              const isOpen = index<foldCount;
              return <div key={index} className="archive-fold" data-open={isOpen}>
                <div className="archive-fold-crease" aria-hidden="true"/>
                <div className="archive-fold-body" aria-hidden={!isOpen} inert={!isOpen}>
                  <div className="archive-fold-clip"><div className="archive-fold-face"><button type="button" className="archive-passage" lang="en" dir="ltr" disabled={!isOpen} aria-pressed={passage===index&&isOpen} onClick={()=>readPassage(index)}>{text}</button></div></div>
                </div>
              </div>;
            })}<div className="archive-fold-guidance"><ArrowDown size={12} strokeWidth={1} aria-hidden="true"/><span id={`${paperId}-hint`}>{f.hint}</span><span className="archive-fold-marks" aria-hidden="true">{record.original.map((_,i)=><i key={i} data-open={i<foldCount}/>)}</span></div><button type="button" className="archive-fold-corner archive-fold-corner-open" aria-label={f.openFold} title={f.openFold} disabled={foldCount===record.original.length} onClick={()=>moveFold(1)}><ChevronDown size={14} strokeWidth={1.2} aria-hidden="true"/></button><span className="archive-fold-keyboard" id={`${paperId}-keys`}>{f.keyboard}</span></blockquote>
            {locale!=="en" && translated && passage<foldCount && <div className="archive-translation" aria-live="polite" aria-atomic="true"><span>{t.translation} · {t.passage} {passage+1}</span><p key={`${record.id}-${passage}`}>{archivePassageTranslations[locale][selected][passage]}</p></div>}
          </div>}
          <div className="archive-pagination" role="group" aria-label={t.choose}><button type="button" disabled={position<=0} onClick={()=>choose(visible[position-1].index)}>{t.previous}</button><span>{position+1} / {visible.length}</span><button type="button" disabled={position>=visible.length-1} onClick={()=>choose(visible[position+1].index)}>{t.next}</button></div>
        </article>
      </div>
    </FullscreenView>
    <p className="archive-note">{t.note}</p>
  </section>;
}
