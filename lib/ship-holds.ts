import { shipHoldNewTranslations } from "./new-locales";
import { shipHoldExtraTranslations } from "./extra-locales";
// Headcounts transcribed from IMG_3264.JPG supplied by the user.
// Percentages are the rounded distribution of POWs, not casualty rates.
export const shipHolds = [
  {id: "1", percent: 20, people: 366, units: [{id: "royalNavy", people: 366}]},
  {id: "2", percent: 59, people: 1074, units: [{id: "royalScots", people: 373}, {id: "middlesex", people: 358}, {id: "royalEngineers", people: 171}, {id: "royalSignals", people: 129}, {id: "other", people: 43}]},
  {id: "3", percent: 21, people: 376, units: [{id: "royalArtillery", people: 376}]},
] as const;
export const shipPOWTotal = shipHolds.reduce((total, hold) => total + hold.people, 0);
export type HoldId = typeof shipHolds[number]["id"];
export const shipHoldTranslations = {
 ...shipHoldNewTranslations,
  ...shipHoldExtraTranslations,
  zh: {
    nav: "船舱与战俘", eyebrow: "里斯本丸号船舱", title: "船舱里的人们。", intro: "点击船形图标，了解三个船舱中的战俘分布与所属部队。",
    open: "点击船形图标 · 查看船舱", close: "收起船舱信息", iconAlt: "里斯本丸号船形图标", iconCaption: "里斯本丸号", promptTitle: "从船形图标，走近船舱里的生命。", prompt: "展开后，选择一个船舱，查看人数、部队明细与分布比例。", panel: "船舱中的战俘信息", select: "选择船舱", hold: "{id}号舱", share: "占船上战俘的比例", distribution: "各舱战俘分布", selected: "正在查看：{hold}，{count}人，占比{percent}%。", unitHeading: "笔记中的所属部队与人数",
    unitNames: {royalNavy:"皇家海军", royalScots:"皇家苏格兰团", middlesex:"米德尔塞克斯团", royalEngineers:"皇家工兵", royalSignals:"皇家通信兵", other:"其他（笔记未细分）", royalArtillery:"皇家炮兵"},
    population: "本舱战俘人数", people: "人", unitLabel: "部队 / 单位", countLabel: "人数", totalLabel: "本舱合计", noteBasis: "按所提供笔记",
    source: "人数与部队明细按所提供手绘笔记整理，三舱合计{total}人。20% / 59% / 21%为各舱人数占比四舍五入后的显示，不表示遇难比例。", graphicNote: "船形图标由用户提供，用作互动入口；不代表原船精确结构或船舱位置。", reference: "历史背景另参考：Lisbon Maru Memorial Association（LiMMA）。", sourceLink: "查阅船舱历史资料",
  },
  en: {
    nav: "Holds & POWs", eyebrow: "ABOARD THE LISBON MARU", title: "The people below deck.", intro: "Select the ship icon to explore the POW distribution and service units in its three holds.",
    open: "Select the ship · Explore the holds", close: "Close hold information", iconAlt: "Lisbon Maru ship icon", iconCaption: "LISBON MARU", promptTitle: "Look beyond the ship’s silhouette.", prompt: "Open the ship, then select a hold to see its headcount, service units and share of the POWs.", panel: "Prisoners of war in the holds", select: "Choose a hold", hold: "Hold No.{id}", share: "Share of POWs aboard", distribution: "POW distribution by hold", selected: "Viewing {hold}, {count} people, {percent}% of POWs.", unitHeading: "Service units and headcounts in the notes",
    unitNames: {royalNavy:"Royal Navy", royalScots:"Royal Scots", middlesex:"Middlesex Regiment", royalEngineers:"Royal Engineers", royalSignals:"Royal Corps of Signals", other:"Other (not specified in the notes)", royalArtillery:"Royal Artillery"},
    population: "POWs in this hold", people: "people", unitLabel: "Service unit", countLabel: "Headcount", totalLabel: "Hold total", noteBasis: "As recorded in the supplied notes",
    source: "Headcounts and units are transcribed from the supplied handwritten notes, totalling {total} POWs across the three holds. The rounded shares of 20% / 59% / 21% describe POW distribution, not casualty rates.", graphicNote: "The user-supplied ship icon is an interactive entry point, not an exact plan of the ship or its hold locations.", reference: "Additional historical background: Lisbon Maru Memorial Association (LiMMA).", sourceLink: "Read the history of the holds",
  },
  ja: {
    nav: "船倉と捕虜", eyebrow: "リスボン丸の船内", title: "船倉にいた人々。", intro: "船のアイコンを選び、3つの船倉に収容された捕虜の割合と所属部隊をたどります。",
    open: "船のアイコンを選ぶ · 船倉を見る", close: "船倉の情報を閉じる", iconAlt: "リスボン丸の船形アイコン", iconCaption: "LISBON MARU · リスボン丸", promptTitle: "船の輪郭から、船倉にいた人々へ。", prompt: "船倉を選ぶと、捕虜の人数、所属部隊、収容割合を確認できます。", panel: "船倉にいた捕虜の情報", select: "船倉を選ぶ", hold: "第{id}船倉", share: "乗船していた捕虜に占める割合", distribution: "船倉別の捕虜の割合", selected: "表示中：{hold}、{count}人、捕虜の{percent}%。", unitHeading: "ノートに記された所属部隊と人数",
    unitNames: {royalNavy:"英国海軍", royalScots:"ロイヤル・スコッツ連隊", middlesex:"ミドルセックス連隊", royalEngineers:"英国王立工兵", royalSignals:"英国王立通信兵", other:"その他（ノートに内訳なし）", royalArtillery:"英国王立砲兵"},
    population: "この船倉の捕虜数", people: "人", unitLabel: "部隊・所属", countLabel: "人数", totalLabel: "船倉の合計", noteBasis: "提供されたノートによる",
    source: "人数と所属部隊は提供された手書きノートから転記しています。3船倉の合計は{total}人です。20% / 59% / 21%は収容人数の割合を四捨五入した表示であり、犠牲者の割合ではありません。", graphicNote: "提供された船のアイコンを閲覧の入口に使用しています。船の正確な構造や船倉の位置を示すものではありません。", reference: "歴史的背景の参考：Lisbon Maru Memorial Association（LiMMA）。", sourceLink: "船倉の歴史資料を読む",
  },
} as const;
