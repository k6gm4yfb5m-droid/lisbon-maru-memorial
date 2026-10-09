import type { Metadata } from "next";
import { cookies } from "next/headers";
import Memorial from "./memorial";
import { validLocale, translations, type Locale } from "@/lib/i18n";
export const dynamic = "force-dynamic";
type Props = {searchParams: Promise<{person?: string | string[]; lang?: string | string[]}>};
async function getLocale(params: {lang?: string | string[]}): Promise<Locale> {
 const saved = (await cookies()).get("lm_language")?.value;
 return validLocale(params.lang) ? params.lang : validLocale(saved) ? saved : "zh";
}
export async function generateMetadata({searchParams}: Props): Promise<Metadata> {
 const t = translations[await getLocale(await searchParams)];
 return {title:t.title,description:t.description};
}
export default async function Home({searchParams}: Props) {
 const params = await searchParams;
 return <Memorial initialPersonId={typeof params.person === "string" ? params.person : undefined} initialLocale={await getLocale(params)}/>;
}
