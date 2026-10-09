"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import FullscreenView from "./fullscreen-view";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber, formatPercent, type Locale } from "@/lib/i18n";
import { topologyNodes, topologyEdges, topologyCategories, topologyHighlight, topologyNodeRadius, topologyTranslations, topologySources, type TopologyNodeId, type TopologyCategory, type TopologySelection } from "@/lib/event-topology";

const colors={place:"#779ca5",attack:"#b45463",death:"#b45463",captive:"#c5a06a",survivor:"#8eaa7a",rescue:"#6b969c",planned:"#779ca5",actual:"#b45463"};
const motionLabels={es:{replay:"Repetir animación",pause:"Pausar animación",resume:"Reanudar animación"},ar:{replay:"أعد الحركة",pause:"أوقف الحركة مؤقتًا",resume:"استأنف الحركة"},fr:{replay:"Rejouer l’animation",pause:"Mettre en pause",resume:"Reprendre"},ko:{replay:"애니메이션 다시 보기",pause:"일시 정지",resume:"계속 재생"},zh:{replay:"重播动画",pause:"暂停动画",resume:"继续动画"},en:{replay:"Replay animation",pause:"Pause animation",resume:"Resume animation"},ja:{replay:"アニメーションを再生",pause:"一時停止",resume:"再開"}};
const nodeDelays={hongkong:0,moji:600,dongji:600,attack:1300,died:1950,captured:1950,rescued:1950,rescue:2650,recaptured:3350,escaped:3350,britain:4000};
const shortLabels={
 es:{hongkong:"Hong Kong (británico)",moji:"Puerto de Moji, Japón",dongji:"Dongji, Zhejiang",attack:"Ataque y hundimiento",died:"Fallecidos",captured:"Capturados",rescued:"Rescatados",rescue:"Rescate de pescadores",recaptured:"Capturados de nuevo",escaped:"Evitaron la captura",britain:"Reino Unido"},
 ar:{hongkong:"هونغ كونغ (الحكم البريطاني)",moji:"ميناء موجي، اليابان",dongji:"دونغجي، تشجيانغ",attack:"الهجوم والغرق",died:"المتوفون",captured:"الأسرى",rescued:"الناجون",rescue:"إنقاذ الصيادين",recaptured:"أُسروا مجددًا",escaped:"نجوا من إعادة الأسر",britain:"المملكة المتحدة"},
  fr:{hongkong:"Hong Kong (britannique)",moji:"Port de Moji, Japon",dongji:"Dongji, Zhejiang",attack:"Attaque et naufrage",died:"Décédés",captured:"Capturés",rescued:"Secourus",rescue:"Sauvetage des pêcheurs",recaptured:"Repris",escaped:"Échappés à la capture",britain:topologyTranslations.fr.nodes.britain.title},
  ko:{hongkong:"홍콩(영국령)",moji:"모지항, 일본",dongji:"저장성 둥지 제도",attack:"피격과 침몰",died:"사망",captured:"포획",rescued:"어민에게 구조됨",rescue:"어민의 구조",recaptured:"재포획",escaped:"재포획을 피함",britain:topologyTranslations.ko.nodes.britain.title},
  zh:{hongkong:"香港（英属）",moji:"日本门司港",dongji:"浙江东极岛一带",attack:"遇袭与沉没",died:"遇难",captured:"被俘",rescued:"获渔民营救",rescue:"渔民营救",recaptured:"再次被俘",escaped:"逃脱再次被捕",britain:topologyTranslations.zh.nodes.britain.title},
  en:{hongkong:"Hong Kong (British)",moji:"Moji Port, Japan",dongji:"Dongji, Zhejiang",attack:"Attack and sinking",died:"Died",captured:"Captured",rescued:"Rescued by fishermen",rescue:"Fishermen’s rescue",recaptured:"Recaptured",escaped:"Escaped recapture",britain:topologyTranslations.en.nodes.britain.title},
  ja:{hongkong:"香港（英国領）",moji:"日本・門司港",dongji:"浙江省・東極諸島",attack:"攻撃と沈没",died:"犠牲者",captured:"拘束",rescued:"漁民による救助",rescue:"漁民の救助",recaptured:"再拘束",escaped:"再拘束を免れる",britain:topologyTranslations.ja.nodes.britain.title},
};

export default function EventTopology({locale}:{locale:Locale}){
  const t=topologyTranslations[locale];
  const [selection,setSelection]=useState<TopologySelection>(null);
  const canvasRef=useRef<HTMLDivElement>(null),toolsRef=useRef<HTMLDivElement>(null),maskId=useId();
  const [animationRun,setAnimationRun]=useState(0),[playing,setPlaying]=useState(false),[complete,setComplete]=useState(false);
  const [inView,setInView]=useState(false),[pageVisible,setPageVisible]=useState(true),[reducedMotion,setReducedMotion]=useState(false);
  const started=useRef(false),remaining=useRef(4800),clockRun=useRef({run:0});
  const active=playing && inView && pageVisible && !reducedMotion;
  useEffect(()=>{
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const motion=()=>{setReducedMotion(media.matches);if(media.matches){clockRun.current.run++;remaining.current=0;setAnimationRun(0);setPlaying(false);}},visibility=()=>setPageVisible(!document.hidden);
    motion();visibility();media.addEventListener("change",motion);document.addEventListener("visibilitychange",visibility);
    const observer=new IntersectionObserver(([entry])=>{
      setInView(entry.isIntersecting);
      if(entry.isIntersecting && !started.current && !media.matches){started.current=true;remaining.current=4800;clockRun.current.run++;setAnimationRun(1);setPlaying(true);}
    },{threshold:.1});
    if(canvasRef.current)observer.observe(canvasRef.current);
    return()=>{observer.disconnect();media.removeEventListener("change",motion);document.removeEventListener("visibilitychange",visibility);};
  },[]);
  useEffect(()=>{
    if(!active)return;
    const began=performance.now(),clock=clockRun.current,run=clock.run;
    const timer=setTimeout(()=>{remaining.current=0;setComplete(true);setPlaying(false);},remaining.current);
    return()=>{clearTimeout(timer);if(clock.run===run)remaining.current=Math.max(0,remaining.current-(performance.now()-began));};
  },[active,animationRun]);
  function replay(){clockRun.current.run++;remaining.current=4800;started.current=true;setComplete(false);setSelection(null);setAnimationRun(run=>run+1);setPlaying(true);}
  function restoreOverview(){
    setSelection(null);
    // Show every branch even if the introductory drawing was paused partway through.
    clockRun.current.run++;remaining.current=0;started.current=true;
    setAnimationRun(0);setComplete(true);setPlaying(false);
    canvasRef.current?.scrollTo({left:0,top:0,behavior:"instant"});
    toolsRef.current?.scrollTo({left:0,top:0,behavior:"instant"});
  }
  const highlighted=useMemo(()=>topologyHighlight(selection),[selection]);
  const detail=selection?.type==="node" ? t.nodes[selection.id] : null;
  function chooseNode(id:TopologyNodeId){setSelection(current=>current?.type==="node" && current.id===id ? null : {type:"node",id});}
  function chooseCategory(id:TopologyCategory){setSelection(current=>current?.type==="category" && current.id===id ? null : {type:"category",id});}
  const pressed=(type:"node"|"category",id:string)=>selection?.type===type && selection.id===id;
  return <section className="topology-section" id="event-topology" aria-labelledby="topology-title" onKeyDown={event=>{if(event.key==="Escape")setSelection(null);}}>
    <div className="topology-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="topology-title">{t.title}</h2><p>{t.intro}</p></div>
    <p className="topology-hint">{t.hint}</p>
    <FullscreenView locale={locale} title={t.title} kind="topology">
    <div ref={canvasRef} className="topology-canvas" tabIndex={0} role="region" aria-label={t.diagramLabel} data-animation={animationRun ? "started" : "idle"} data-playing={active}>
      <svg key={animationRun} className="topology-svg" viewBox="0 0 1280 850" role="group" aria-label={t.diagramLabel}>
        <defs>{topologyEdges.map(edge=><mask key={edge.id} id={`${maskId}-${edge.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="850"><path className="topology-reveal" d={edge.d} pathLength="1" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" style={{animationDelay:`${edge.delay}ms`}}/></mask>)}</defs>
        {topologyEdges.map(edge=><g key={edge.id} className={`topology-edge edge-${edge.kind}`} data-edge={edge.id} data-emphasis={!selection ? "default" : highlighted.edges.has(edge.id) ? "selected" : "muted"} role="button" tabIndex={0} aria-label={t.categories[edge.kind]} aria-pressed={pressed("category",edge.kind)} onClick={()=>chooseCategory(edge.kind)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();chooseCategory(edge.kind);}}}>
          <path className="topology-line" d={edge.d} fill="none" stroke={colors[edge.kind]} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={edge.kind==="planned" ? "9 8" : undefined} mask={`url(#${maskId}-${edge.id})`}/><path className="topology-line-hit" d={edge.d} fill="none" stroke="transparent" strokeWidth={20}/>
        </g>)}
        {topologyNodes.map(node=>{
          const isPlace=node.kind==="place",radius=topologyNodeRadius(node.kind),isRescue=node.id==="rescue";
          const labelY=node.id==="hongkong" ? -58 : node.id==="attack" ? -44 : isRescue ? -69 : "value" in node ? 93 : 64;
          const labelX=isRescue ? -40 : node.id==="attack" ? 70 : 0;
          return <g key={node.id} className={`topology-node node-${node.kind}`} data-node={node.id} data-emphasis={!selection ? "default" : highlighted.nodes.has(node.id) ? "selected" : "muted"} transform={`translate(${node.x},${node.y})`} role="button" tabIndex={0} aria-label={`${t.nodes[node.id].title} · ${t.nodes[node.id].meta}`} aria-pressed={pressed("node",node.id)} onClick={()=>chooseNode(node.id)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();chooseNode(node.id);}}}>
            <circle className="topology-node-hit" r={38} fill="transparent"/><circle className="topology-node-focus" r={radius+3} fill="none" stroke="#f3f3ee" strokeWidth={2}/>
            <g className="topology-node-symbol"><g className="topology-node-appearance" style={{animationDelay:`${nodeDelays[node.id]}ms`}}><circle r={radius} fill={colors[node.kind]} stroke={node.kind==="rescue" ? "#c9dedb" : "none"} strokeWidth={1.5}/>{isPlace && <circle cx={20} cy={19} r={12} fill="#c5a06a"/>}{node.kind==="attack" && <circle r={13} fill="#16323b" stroke="#f3f3ee" strokeWidth={1.5}/>}</g></g>
            {"value" in node && <><text className="topology-number" x={isRescue ? -40 : 0} y={isRescue ? -104 : 57} fill="#ffffff" stroke="none" textAnchor={isRescue ? "end" : "middle"} style={{fill:"#ffffff",stroke:"none"}}>{formatNumber(node.value,locale)}</text>{"percent" in node && <text className="topology-percent" y={120} fill="#c9d6d0" stroke="none" textAnchor="middle" style={{fill:"#c9d6d0",stroke:"none"}}>{formatPercent(parseFloat(node.percent),locale)}</text>}</>}
            <text className="topology-node-label" x={labelX} y={labelY} fill="#ffffff" stroke="none" textAnchor={isRescue ? "end" : "middle"} style={{fill:"#ffffff",stroke:"none"}}>{shortLabels[locale][node.id]}</text>
            {isRescue && <text className="topology-node-secondary" x={-40} y={-37} fill="#c9d6d0" stroke="none" textAnchor="end" style={{fill:"#c9d6d0",stroke:"none"}}>{t.fishermenUnit} · {t.rescuedMeta}</text>}
          </g>;
        })}
      </svg>
    </div>
    <div ref={toolsRef} className="topology-tools">
    <p className="topology-scroll-hint">{t.scrollHint}</p>
    <div className="topology-legend" role="group" aria-label={t.legendLabel}>{topologyCategories.map(category=><Button key={category} variant="ghost" data-category={category} aria-pressed={pressed("category",category)} onClick={()=>chooseCategory(category)}><span aria-hidden="true" className={`topology-legend-symbol symbol-${category}`} style={{"--symbol-color":colors[category]} as React.CSSProperties}/>{t.categories[category]}</Button>)}</div>
    <div className="topology-controls"><label id="topology-select-label">{t.selectLabel}</label><Select value={selection?.type==="node" ? selection.id : "overview"} onValueChange={value=>{if(value==="overview")restoreOverview();else setSelection({type:"node",id:value as TopologyNodeId});}}><SelectTrigger aria-labelledby="topology-select-label" className="topology-select"><SelectValue/></SelectTrigger><SelectContent position="popper"><SelectItem value="overview">{t.overview}</SelectItem>{topologyNodes.map(node=><SelectItem key={node.id} value={node.id}>{t.nodes[node.id].title}</SelectItem>)}</SelectContent></Select><Button variant="outline" data-action="reset" onClick={restoreOverview}><RotateCcw size={15}/>{t.reset}</Button>{!reducedMotion && <><Button variant="outline" onClick={replay}><RotateCcw size={15}/>{motionLabels[locale].replay}</Button>{animationRun>0 && !complete && <Button variant="outline" onClick={()=>setPlaying(value=>!value)}>{playing ? <Pause size={15}/> : <Play size={15}/>} {playing ? motionLabels[locale].pause : motionLabels[locale].resume}</Button>}</>}</div>
    <div className="topology-detail" data-selected={selection !== null} role="region" aria-label={t.detailLabel} aria-live="polite"><div><span>{detail?.meta || t.overview}</span><h3>{detail?.title || (selection?.type==="category" ? t.categories[selection.id] : t.title)}</h3></div><div><p>{detail?.body || (selection?.type==="category" ? t.categoryDescriptions[selection.id] : t.intro)}</p>{detail && <a href={topologySources[detail.source]} target="_blank" rel="noreferrer">{t.sourceLink}</a>}</div></div>
    </div>
    </FullscreenView>
    <div className="topology-notes"><p>{t.note}</p><div aria-label={t.sourcesTitle}><a href={topologySources.history} target="_blank" rel="noreferrer">{t.historySource}</a><a href={topologySources.fishermen} target="_blank" rel="noreferrer">{t.fishermenSource}</a><a href={topologySources.escape} target="_blank" rel="noreferrer">{t.escapeSource}</a><a href={topologySources.destination} target="_blank" rel="noreferrer">{t.destinationSource}</a></div></div>
  </section>;
}
