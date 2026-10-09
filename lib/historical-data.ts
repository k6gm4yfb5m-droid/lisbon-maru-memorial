import { historicalNewTranslations } from "./new-locales";
import { historicalExtraTranslations } from "./extra-locales";
export const historicalFigures = {
  aboard: 1816,
  died: 828,
  rescued: 384,
  escaped: 3,
} as const;

// The supplied infographic separates initial rescue routes, not final outcomes.
export const otherRecaptured = historicalFigures.aboard - historicalFigures.died - historicalFigures.rescued;
export const rescuedThenRecaptured = historicalFigures.rescued - historicalFigures.escaped;
export const historicalSource = "https://www.lisbonmaru.org.uk/resource/html/Background%2Bto%2Bthe%2Bsinking%2Bof%2Bthe%2Blisbon%2Bmaru";

export const historicalTranslations = {
 ...historicalNewTranslations,
  ...historicalExtraTranslations,
  zh: {
    nav: "历史数据", eyebrow: "数字背后的生命", title: "数字背后，是生命。",
    introduction: "以数字回望里斯本丸号上的英国战俘，以及营救之后的命运。",
    interactionHint: "点击图表或下方图例，查看对应分类；再次点击或按 Esc 取消选中。", selected: "已选中：{label}，{count}人，{percent}。", allVisible: "正在显示所有分类。",
    aboard: "船上英国战俘", casualties: "英国战俘伤亡与营救", died: "遇难", other: "被日军俘获（不含渔民营救者）", rescued: "获中国渔民营救",
    waffleDescription: "100点图：遇难约46%，被日军俘获（不含渔民营救者）约33%，获中国渔民营救约21%。",
    waffleNote: "每个圆点约代表总人数的1%；百分比四舍五入。",
    fate: "营救之后的命运", fateBody: "384名获中国渔民营救者中，只有3人成功逃脱再次被捕。",
    ringDescription: "384名获渔民营救者中，381人被日军重新俘获，3人逃脱再次被捕，逃脱比例约0.78%。",
    escapedShare: "成功逃脱的比例", recaptured: "获救后被日军重新俘获", escaped: "逃脱再次被捕", exactShare: "约0.78% · 3 / 384",
    contextTitle: "如何阅读这些数字", context: "左图沿用所提供信息图的分类：604人与384人区分的是当时的营救路径，并非最终命运。获渔民营救的384人中，381人随后被日军重新俘获。",
    source: "历史参考：Lisbon Maru Memorial Association（LiMMA）。1,816、828、384与3见该协会历史资料；604由1,816 − 828 − 384计算，381由384 − 3计算。",
    rosterNote: "历史遇难人数828与本纪念册收录的{count}条CSV记录采用不同口径；本册收录量不代表遇难总人数。", sourceLink: "查阅历史资料",
  },
  en: {
    nav: "Historical figures", eyebrow: "LIVES BEHIND THE NUMBERS", title: "Behind every number, a life.",
    introduction: "The British prisoners aboard the Lisbon Maru, and what followed their rescue.",
    interactionHint: "Select a chart segment or legend to highlight its category. Select it again or press Esc to clear.", selected: "Selected: {label}, {count} people, {percent}.", allVisible: "All categories are shown.",
    aboard: "British POWs aboard", casualties: "British POW casualties and rescue", died: "Died", other: "Recaptured by Japanese forces (excluding those rescued by fishermen)", rescued: "Rescued by Chinese fishermen",
    waffleDescription: "100-dot chart: approximately 46% died, 33% were recaptured excluding those rescued by fishermen, and 21% were rescued by Chinese fishermen.",
    waffleNote: "Each dot represents approximately 1% of the total. Percentages are rounded.",
    fate: "After the rescue", fateBody: "Of the 384 men rescued by Chinese fishermen, only three escaped recapture.",
    ringDescription: "Of the 384 men rescued by fishermen, 381 were recaptured by Japanese forces and three escaped recapture, approximately 0.78%.",
    escapedShare: "Escaped recapture", recaptured: "Rescued, then recaptured by Japanese forces", escaped: "Escaped recapture", exactShare: "Approx. 0.78% · 3 / 384",
    contextTitle: "Reading these figures", context: "The left chart follows the supplied infographic: the groups of 604 and 384 distinguish initial rescue routes, rather than final outcomes. Of the 384 rescued by fishermen, 381 were subsequently recaptured by Japanese forces.",
    source: "Historical reference: Lisbon Maru Memorial Association (LiMMA). Its account reports 1,816, 828, 384 and three; 604 is calculated as 1,816 − 828 − 384, and 381 as 384 − 3.",
    rosterNote: "The historical death toll of 828 and the {count} CSV records in this memorial measure different things. This file’s record count is not the total death toll.", sourceLink: "Read the historical account",
  },
  ja: {
    nav: "歴史データ", eyebrow: "数字の向こうにあった命", title: "数字の向こうに、一人ひとりの命。",
    introduction: "リスボン丸に乗せられた英国人捕虜と、救助後の運命を数字でたどります。",
    interactionHint: "図や凡例を選ぶと、対応する分類が強調されます。もう一度選ぶか、Escキーで解除できます。", selected: "選択中：{label}、{count}人、{percent}。", allVisible: "すべての分類を表示しています。",
    aboard: "乗船していた英国人捕虜", casualties: "英国人捕虜の犠牲と救助", died: "死亡", other: "日本軍に捕らえられた人々（漁民による救助者を除く）", rescued: "中国の漁民に救助された人々",
    waffleDescription: "100個の点で示す図：死亡が約46%、漁民による救助者を除く日本軍の捕虜が約33%、中国の漁民に救助された人々が約21%。",
    waffleNote: "点1個は全体の約1%を表します。割合は四捨五入しています。",
    fate: "救助の後に", fateBody: "中国の漁民に救助された384人のうち、再び捕らえられることを免れたのは3人だけでした。",
    ringDescription: "漁民に救助された384人のうち、381人は日本軍に再び捕らえられ、3人が再捕獲を免れました。その割合は約0.78%です。",
    escapedShare: "再捕獲を免れた割合", recaptured: "救助後、日本軍に再び捕らえられた人々", escaped: "再捕獲を免れた人々", exactShare: "約0.78% · 3 / 384",
    contextTitle: "数字の読み方", context: "左の図は提供された図表の分類に従っています。604人と384人は当初の救助経路を区別した数字であり、最終的な運命を示すものではありません。漁民に救助された384人のうち381人は、その後日本軍に再び捕らえられました。",
    source: "歴史資料：Lisbon Maru Memorial Association（LiMMA）。1,816人、828人、384人、3人は同協会の資料によります。604人は1,816 − 828 − 384、381人は384 − 3から算出しています。",
    rosterNote: "歴史資料の犠牲者数828人と、この名簿のCSV記録{count}件は異なる集計です。ファイルの収録件数は犠牲者の総数ではありません。", sourceLink: "歴史資料を読む",
  },
} as const;
