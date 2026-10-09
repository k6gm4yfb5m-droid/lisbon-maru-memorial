import { fullscreenNewTranslations } from "./new-locales";
import type { Locale } from "./i18n";

export const fullscreenTranslations = {
 ...fullscreenNewTranslations,
  zh: { enter: "全屏查看", exit: "退出全屏" },
  en: { enter: "View fullscreen", exit: "Exit fullscreen" },
  ja: { enter: "全画面で表示", exit: "全画面を終了" },
  fr: { enter: "Plein écran", exit: "Quitter le plein écran" },
  ko: { enter: "전체 화면 보기", exit: "전체 화면 종료" },
} satisfies Record<Locale, { enter: string; exit: string }>;
