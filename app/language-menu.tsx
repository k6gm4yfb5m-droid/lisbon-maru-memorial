"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { languageDirections, languageNames, languageTags, supportedLocales, translations, type Locale } from "@/lib/i18n";

export default function LanguageMenu({locale,onChange}:{locale:Locale;onChange:(locale:Locale)=>void}) {
 const [open,setOpen] = useState(false);
 const content=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 useLayoutEffect(()=>{
  if(!open)return;
  let frame=0;
  // Radix measures in viewport pixels; desktop fitting uses a scaled CSS coordinate system.
  const position=()=>{
   const menu=content.current,anchor=trigger.current;
   if(!menu || !anchor)return;
   const wrapper=menu.parentElement;
   if(!wrapper)return;
   if(document.documentElement.dataset.screenFit!=="true"){
    wrapper.removeAttribute("data-language-fit");return;
   }
   const viewport=window.visualViewport;
   const scale=Number.parseFloat(getComputedStyle(document.body).zoom)||1;
   const rect=anchor.getBoundingClientRect();
   const left=(viewport?.offsetLeft??0)/scale+12;
   const right=((viewport?.offsetLeft??0)+(viewport?.width??innerWidth))/scale-12;
   const top=(viewport?.offsetTop??0)/scale+12;
   const bottom=((viewport?.offsetTop??0)+(viewport?.height??innerHeight))/scale-12;
   const width=menu.offsetWidth,height=menu.offsetHeight;
   const x=Math.max(left,Math.min(right-width,languageDirections[locale]==="rtl"?rect.left/scale:rect.right/scale-width));
   const y=Math.max(top,Math.min(bottom-height,rect.bottom/scale+7));
   wrapper.style.setProperty("--language-menu-left",`${x}px`);
   wrapper.style.setProperty("--language-menu-top",`${y}px`);
   wrapper.dataset.languageFit="true";
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(position);};
  schedule();window.addEventListener("resize",schedule);window.addEventListener("scroll",schedule,{passive:true});
  window.visualViewport?.addEventListener("resize",schedule);window.visualViewport?.addEventListener("scroll",schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",schedule);window.removeEventListener("scroll",schedule);window.visualViewport?.removeEventListener("resize",schedule);window.visualViewport?.removeEventListener("scroll",schedule);};
 },[open,locale]);
 return <div className="language-switch language-picker">
  <DropdownMenu open={open} onOpenChange={setOpen} modal={false} dir={languageDirections[locale]}>
   <DropdownMenuTrigger asChild><button ref={trigger} type="button" className="language-menu-trigger" aria-label={`${translations[locale].language} · ${languageNames[locale]}`}><Languages size={16} strokeWidth={1.4} aria-hidden="true"/><span lang={languageTags[locale]} dir={languageDirections[locale]}>{languageNames[locale]}</span><ChevronDown className="language-menu-chevron" size={14} strokeWidth={1.3} aria-hidden="true"/></button></DropdownMenuTrigger>
   <DropdownMenuContent ref={content} className="language-menu" align="end" sideOffset={7} collisionPadding={12} aria-label={translations[locale].language}>
    {supportedLocales.map(language=><DropdownMenuItem key={language} className="language-menu-option" onSelect={()=>onChange(language)} aria-current={language===locale ? "true" : undefined}><span lang={languageTags[language]} dir={languageDirections[language]}>{languageNames[language]}</span>{language===locale && <Check size={14} strokeWidth={1.5} aria-hidden="true"/>}</DropdownMenuItem>)}
   </DropdownMenuContent>
  </DropdownMenu>
 </div>;
}
