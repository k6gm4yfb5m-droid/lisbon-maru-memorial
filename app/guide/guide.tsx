"use client";
import { useEffect, useState } from "react";
import { Anchor, ArrowLeft, ArrowUpRight, BookOpen, Compass, Flower2 } from "lucide-react";
import { languageDirections, languageTags, translations, type Locale } from "@/lib/i18n";
import { guideTranslations } from "@/lib/browsing-guide";
import LanguageMenu from "../language-menu";

export default function Guide({initialLocale}:{initialLocale:Locale}){
  const [locale,setLocale]=useState(initialLocale),t=guideTranslations[locale],site=translations[locale];
  const home=`/?lang=${locale}`;
  useEffect(()=>{
    document.documentElement.lang=languageTags[locale];document.documentElement.dir=languageDirections[locale];
    document.title=`${t.nav} | Lisbon Maru Memorial`;
    document.querySelector('meta[name="description"]')?.setAttribute("content",t.intro);
    document.cookie=`lm_language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  },[locale,t]);
  function changeLanguage(next:Locale){setLocale(next);const url=new URL(location.href);url.searchParams.set("lang",next);history.replaceState(null,"",url);}
  const icons=[Compass,BookOpen,Flower2];
  return <div className="guide-page" lang={languageTags[locale]} dir={languageDirections[locale]}>
    <header className="guide-header">
      <a className="brand" href={`${home}#top`} aria-label={site.home}><Anchor strokeWidth={1.2}/><span>{site.brand}<small>{site.brandSubtitle}</small></span></a>
      <div className="guide-header-actions"><a className="guide-back" href={`${home}#top`}><ArrowLeft size={16}/>{t.back}</a><LanguageMenu locale={locale} onChange={changeLanguage}/></div>
    </header>
    <main id="guide-main" className="guide-main">
      <div className="guide-heading"><div className="eyebrow">{t.nav}</div><h1>{t.title}</h1><p>{t.intro}</p></div>
      <div className="guide-outline">{t.sections.map(([title,body],index)=>{const Icon=icons[index];return <section className="guide-entry" key={index} aria-labelledby={`guide-entry-${index}`}><span className="guide-number" aria-hidden="true">0{index+1}</span><div><h2 id={`guide-entry-${index}`}>{title}</h2><p>{body}</p></div><Icon size={30} strokeWidth={1} aria-hidden="true"/></section>;})}</div>
      <div className="guide-ending"><p>{t.note}</p><a className="guide-begin" href={`${home}#top`}>{t.begin}<ArrowUpRight size={18}/></a></div>
    </main>
    <footer className="guide-footer">{site.footerNote}</footer>
  </div>;
}
