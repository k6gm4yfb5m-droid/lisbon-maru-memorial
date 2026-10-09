import type { Metadata } from "next";
import { cookies } from "next/headers";
import { languageTags, languageDirections, validLocale } from "@/lib/i18n";
import ScreenFit from "./screen-fit";
import "./globals.css";
import "./contemporary-memorial.css";
export const metadata: Metadata = {
 title: "里斯本丸号 · 永志纪念 | Lisbon Maru Memorial",
 description: "翻阅里斯本丸号遇难者纪念册，阅读名单原始记录，为逝者献花。",
 icons: {icon: "/favicon.svg", shortcut: "/favicon.svg"},
};
export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 const saved = (await cookies()).get("lm_language")?.value;
 const locale = validLocale(saved) ? saved : "zh";
 return <html dir={languageDirections[locale]} lang={languageTags[validLocale(saved) ? saved : "zh"]}><body><ScreenFit/>{children}</body></html>;
}
