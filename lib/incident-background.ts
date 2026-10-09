import { backgroundNewTranslations } from "./new-locales";
import type { Locale } from "./i18n";

export const backgroundSources = [
  "https://www.lisbonmaru.org.uk/page/Background%2Bto%2Bthe%2Bsinking%2Bof%2Bthe%2Blisbon%2Bmaru",
  "https://www.royal-naval-association.co.uk/wp-content/uploads/2025/01/Semaphore-Circular-January-2025-.pdf",
] as const;
type BackgroundText = {
  nav: string; eyebrow: string; title: string; period: string;
  paragraphs: readonly [string, string]; sourcesLabel: string; sourceNames: readonly [string, string];
};
export const backgroundTranslations = {
 ...backgroundNewTranslations,
  zh: {
    nav: "事件背景", eyebrow: "事件背景", title: "里斯本丸号事件", period: "1942年10月1—2日",
    paragraphs: [
      "里斯本丸号事件是第二次世界大战期间一场悲惨、却长期未获充分关注的海上灾难。1942年10月1日，日本运输船里斯本丸号载着1,816名英国战俘，从香港驶往日本途中，遭美国潜艇USS Grouper发射的鱼雷击中。该潜艇的艇员当时并不知道船上载有战俘。",
      "船只于次日沉没。许多战俘被困在船舱中，或在逃生时溺亡、遭日军枪击。中国渔民救起了部分幸存者。约828名英国战俘丧生。",
    ],
    sourcesLabel: "参考史料", sourceNames: ["里斯本丸号纪念协会", "英国皇家海军协会"],
  },
  en: {
    nav: "Background", eyebrow: "BACKGROUND", title: "The Lisbon Maru incident", period: "1–2 October 1942",
    paragraphs: [
      "The Lisbon Maru incident was a tragic and often overlooked maritime disaster of the Second World War. On 1 October 1942, the Japanese transport ship Lisbon Maru was carrying 1,816 British prisoners of war from Hong Kong to Japan when it was torpedoed by the American submarine USS Grouper, whose crew was unaware that prisoners were on board.",
      "The ship sank the next day. Many prisoners were trapped below deck, while others drowned or were shot by Japanese troops as they tried to escape. Chinese fishermen rescued some survivors. Approximately 828 British prisoners of war died.",
    ],
    sourcesLabel: "Historical sources", sourceNames: ["Lisbon Maru Memorial Association", "Royal Naval Association"],
  },
  ja: {
    nav: "事件の背景", eyebrow: "出来事の背景", title: "リスボン丸事件", period: "1942年10月1日–2日",
    paragraphs: [
      "リスボン丸事件は、第二次世界大戦中に起きた、長く十分な注目を集めなかった悲惨な海難事件です。1942年10月1日、日本の輸送船リスボン丸は、英国人捕虜1,816人を香港から日本へ移送する途中、米潜水艦USS Grouperの魚雷攻撃を受けました。同艦の乗員は、船内に捕虜がいることを知りませんでした。",
      "船は翌日沈没しました。多くの捕虜が船倉に閉じ込められ、ほかの捕虜は脱出を試みる中で溺死したり、日本軍に銃撃されたりしました。中国の漁民は生存者の一部を救助しました。約828人の英国人捕虜が命を落としました。",
    ],
    sourcesLabel: "歴史資料", sourceNames: ["リスボン丸記念協会", "王立海軍協会"],
  },
  fr: {
    nav: "Contexte", eyebrow: "CONTEXTE HISTORIQUE", title: "Le drame du Lisbon Maru", period: "1–2 octobre 1942",
    paragraphs: [
      "Le drame du Lisbon Maru fut une tragédie maritime de la Seconde Guerre mondiale longtemps méconnue. Le 1er octobre 1942, le navire de transport japonais Lisbon Maru acheminait 1 816 prisonniers de guerre britanniques de Hong Kong vers le Japon lorsqu’il fut torpillé par le sous-marin américain USS Grouper, dont l’équipage ignorait la présence de prisonniers à bord.",
      "Le navire sombra le lendemain. De nombreux prisonniers restèrent piégés dans les cales, tandis que d’autres se noyèrent ou furent touchés par les tirs de soldats japonais en tentant de s’échapper. Des pêcheurs chinois secoururent des survivants. Environ 828 prisonniers de guerre britanniques perdirent la vie.",
    ],
    sourcesLabel: "Sources historiques", sourceNames: ["Association commémorative du Lisbon Maru", "Royal Naval Association"],
  },
  ko: {
    nav: "사건 배경", eyebrow: "사건의 배경", title: "리스본 마루호 사건", period: "1942년 10월 1–2일",
    paragraphs: [
      "리스본 마루호 사건은 제2차 세계대전 중 발생한 비극적인 해상 참사로, 오랫동안 충분한 주목을 받지 못했습니다. 1942년 10월 1일, 일본 수송선 리스본 마루호는 영국군 전쟁포로 1,816명을 홍콩에서 일본으로 이송하던 중 미국 잠수함 USS Grouper의 어뢰 공격을 받았습니다. 잠수함 승조원들은 배에 포로들이 타고 있다는 사실을 알지 못했습니다.",
      "배는 이튿날 침몰했습니다. 많은 포로가 선창에 갇혔고, 다른 포로들은 탈출을 시도하다 익사하거나 일본군의 총격을 받았습니다. 중국 어민들은 일부 생존자를 구조했습니다. 약 828명의 영국군 전쟁포로가 목숨을 잃었습니다.",
    ],
    sourcesLabel: "역사 자료", sourceNames: ["리스본 마루호 추모 협회", "영국 왕립 해군 협회"],
  },
} as const satisfies Record<Locale, BackgroundText>;
