import type { Metadata } from "next";
import { cookies } from "next/headers";
import { validLocale, type Locale } from "@/lib/i18n";
import { guideTranslations } from "@/lib/browsing-guide";
import Guide from "./guide";
import "./guide.css";

export const dynamic="force-dynamic";
type Props={searchParams:Promise<{lang?:string|string[]}>};
async function getLocale(params:{lang?:string|string[]}):Promise<Locale>{
  const saved=(await cookies()).get("lm_language")?.value;
  return validLocale(params.lang)?params.lang:validLocale(saved)?saved:"zh";
}
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
  const t=guideTranslations[await getLocale(await searchParams)];
  return {title:`${t.nav} | Lisbon Maru Memorial`,description:t.intro};
}
export default async function GuidePage({searchParams}:Props){
  return <Guide initialLocale={await getLocale(await searchParams)}/>;
}
