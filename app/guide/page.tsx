import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validLocale } from "@/lib/i18n";

export const dynamic="force-dynamic";
// Preserve previously shared links by taking readers to the introduction on the main site.
export default async function FormerGuide({searchParams}:{searchParams:Promise<{lang?:string|string[]}>}){
  const params=await searchParams,saved=(await cookies()).get("lm_language")?.value;
  const locale=validLocale(params.lang)?params.lang:validLocale(saved)?saved:"zh";
  redirect(`/?lang=${locale}#website-introduction`);
}
