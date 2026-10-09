import { reflectionNewTranslations } from "./new-locales";
import type { Locale } from "./i18n";

// Japan's spring 2013 answers, reproduced in Pew's 2016 topline (Q.84, p.19).
export const apologyResponses = [48, 28, 15, 9] as const;
export const reflectionSources = {
  stokes: "https://www.pewresearch.org/global/2015/08/04/the-legacy-of-world-war-two-still-evident-in-german-and-japanese-public-opinion-and-relevant-today-in-dealing-with-russia-and-china/",
  data: "https://www.pewresearch.org/global/wp-content/uploads/sites/2/2016/09/Pew-Research-Center-China-Japan-Report-FINAL-September-13-2016.pdf#page=19",
};
type ReflectionText = {
  nav: string; eyebrow: string; title: string; intro: string; survey: string;
  question: string; finding: string; flagDescription: string; flagNote: string;
  breakdown: string; interaction: string; modeLabel: string; chartNames: readonly [string, string, string, string]; chartNotes: readonly [string, string, string, string]; answers: readonly [string, string, string, string];
  previous: string; next: string; pagerLabel: string; scrollHint: string; activatePercent: string; activateSector: string;
  context: string; citation: string; stokesLink: string; dataLink: string;
};
export const reflectionTranslations: Record<Locale, ReflectionText> = {
 ...reflectionNewTranslations,
  zh: {
    activateSector: "点击百分比，轻轻弹动红色色块",
    activatePercent: "点击图表，轻轻弹动当前百分比",
    previous: "上一项", next: "下一项", pagerLabel: "查看调查回答", scrollHint: "在图内向下滚动查看下一项，向上滚动查看上一项。",
    nav: "战争反思", eyebrow: "战争记忆与反思", title: "关于道歉，日本公众如何看待？",
    intro: "Pew Research Center的2013年调查中，48%的日本受访者认为，日本已为1930至1940年代的军事行为充分道歉。Stokes（2015）引用这一结果，讨论日本国内对战争责任的不同看法。",
    survey: "日本 · 2013年公众意见调查", question: "日本是否已经充分道歉？", finding: "认为日本已充分道歉",
    flagDescription: "以日本国旗为基础的饼图：红色扇形表示所选回答，占圆形面积的{percent}。", flagNote: "红色扇形占圆形面积的{percent}；浅色部分占{remainder}，代表其余回答。",
    breakdown: "同一调查中的四种回答", modeLabel: "图表模式", interaction: "点击任意数据卡，查看上方国旗的比例变化。", chartNames: ["环形图", "100格点阵图", "半圆仪表", "分段比例条"], chartNotes: ["整圈代表100%", "每格代表1%", "全弧代表100%", "每段代表5%"], answers: ["已充分道歉", "道歉仍不充分", "无需道歉", "不知道 / 拒答"],
    context: "这项调查记录了当时对道歉是否充分的看法，不直接衡量个人的反思程度，也不是针对里斯本丸号事件的专项调查。",
    citation: "调查年份：2013。引用：Bruce Stokes，Pew Research Center，2015年8月4日。完整比例见Pew调查表Q.84（2016年报告，第19页）。", stokesLink: "Stokes（2015）原文", dataLink: "2013年调查数据",
  },
  en: {
    activateSector: "Activate percentage to bounce the red sector",
    activatePercent: "Activate chart to bounce the current percentage",
    previous: "Previous", next: "Next", pagerLabel: "Browse survey responses", scrollHint: "Scroll down within the chart for the next response, or up for the previous one.",
    nav: "War reflection", eyebrow: "WAR MEMORY AND REFLECTION", title: "How did Japan’s public view apologies?",
    intro: "In Pew Research Center’s 2013 survey, 48% of Japanese respondents said Japan had apologized sufficiently for its military actions during the 1930s and 1940s. Stokes (2015) cited this finding when discussing divided domestic views on wartime responsibility.",
    survey: "Japan · Public opinion in 2013", question: "Had Japan apologized sufficiently?", finding: "Said Japan had apologized sufficiently",
    flagDescription: "A pie chart based on Japan’s flag: the red sector represents the selected response and covers {percent} of the circle.", flagNote: "The red sector covers {percent} of the circle. The pale {remainder} represents the remaining responses.",
    breakdown: "Four responses in the same survey", modeLabel: "Chart style", interaction: "Select a response to update the flag above.", chartNames: ["Donut chart", "100-cell waffle", "Semicircular gauge", "Segmented bar"], chartNotes: ["Full ring = 100%", "Each cell = 1%", "Full arc = 100%", "Each segment = 5%"], answers: ["Apologized sufficiently", "Not apologized sufficiently", "No apology necessary", "Don’t know / refused"],
    context: "This survey records views on the adequacy of apologies at that time. It does not directly measure personal reflection or specifically address the Lisbon Maru.",
    citation: "Survey: 2013. Citation: Bruce Stokes, Pew Research Center, 4 August 2015. Full percentages: Pew topline Q.84 (2016 report, page 19).", stokesLink: "Stokes (2015)", dataLink: "2013 survey data",
  },
  ja: {
    activateSector: "割合を押すと赤い部分が軽く弾みます",
    activatePercent: "グラフを押すと現在の割合が軽く弾みます",
    previous: "前の回答", next: "次の回答", pagerLabel: "調査の回答を切り替える", scrollHint: "図の上で下にスクロールすると次の回答、上にスクロールすると前の回答を表示します。",
    nav: "戦争への省察", eyebrow: "戦争の記憶と省察", title: "謝罪を、日本の人々はどう捉えたか。",
    intro: "Pew Research Centerの2013年調査では、日本の回答者の48%が、1930〜1940年代の軍事行動について日本は十分に謝罪したと答えました。Stokes（2015）はこの結果を引用し、戦争責任に関する国内の意見の違いを論じています。",
    survey: "日本 · 2013年の世論調査", question: "日本は十分に謝罪したか？", finding: "十分に謝罪したと回答",
    flagDescription: "日本の国旗をもとにした円グラフ。赤い扇形は選択した回答を示し、円全体の{percent}を占めます。", flagNote: "赤い扇形は円全体の{percent}を占めます。淡い色の{remainder}は、その他の回答を表します。",
    breakdown: "同じ調査の四つの回答", modeLabel: "グラフの種類", interaction: "回答を選ぶと、上の国旗の比率が変わります。", chartNames: ["ドーナツ図", "100マス図", "半円ゲージ", "分割棒グラフ"], chartNotes: ["一周で100%", "1マスで1%", "全弧で100%", "1区画で5%"], answers: ["十分に謝罪した", "謝罪は十分ではない", "謝罪は必要ない", "わからない / 回答拒否"],
    context: "この調査は当時の謝罪の十分さに対する意見を示します。個人の省察の程度を直接測るものでも、リスボン丸事件に特化した調査でもありません。",
    citation: "調査年：2013年。引用：Bruce Stokes、Pew Research Center、2015年8月4日。全回答の割合はPew調査表Q.84（2016年報告、19ページ）。", stokesLink: "Stokes（2015）の原文", dataLink: "2013年の調査データ",
  },
  fr: {
    activateSector: "Activer le pourcentage pour faire rebondir légèrement le secteur rouge",
    activatePercent: "Activer le graphique pour faire rebondir légèrement le pourcentage",
    previous: "Précédent", next: "Suivant", pagerLabel: "Parcourir les réponses", scrollHint: "Faites défiler vers le bas dans le graphique pour la réponse suivante, ou vers le haut pour la précédente.",
    nav: "Réflexion sur la guerre", eyebrow: "MÉMOIRE DE GUERRE ET RÉFLEXION", title: "Comment le public japonais percevait-il les excuses ?",
    intro: "Dans l’enquête de Pew Research Center de 2013, 48 % des répondants japonais estimaient que le Japon s’était suffisamment excusé pour ses actions militaires des années 1930 et 1940. Stokes (2015) cite ce résultat pour évoquer les divergences au Japon sur la responsabilité de guerre.",
    survey: "Japon · Opinion publique en 2013", question: "Le Japon s’était-il suffisamment excusé ?", finding: "Estimaient les excuses suffisantes",
    flagDescription: "Diagramme circulaire inspiré du drapeau japonais : le secteur rouge représente la réponse sélectionnée et occupe {percent} du disque.", flagNote: "Le secteur rouge occupe {percent} du disque. La partie claire, soit {remainder}, regroupe les autres réponses.",
    breakdown: "Quatre réponses dans la même enquête", modeLabel: "Type de graphique", interaction: "Sélectionnez une réponse pour actualiser le drapeau ci-dessus.", chartNames: ["Diagramme en anneau", "Grille de 100 cases", "Jauge semi-circulaire", "Barre segmentée"], chartNotes: ["Anneau entier = 100 %", "Chaque case = 1 %", "Arc entier = 100 %", "Chaque segment = 5 %"], answers: ["Excuses suffisantes", "Excuses insuffisantes", "Aucune excuse nécessaire", "Ne sait pas / refus"],
    context: "L’enquête décrit l’opinion sur les excuses à cette époque. Elle ne mesure pas directement la réflexion personnelle et ne porte pas spécifiquement sur le Lisbon Maru.",
    citation: "Enquête : 2013. Référence : Bruce Stokes, Pew Research Center, 4 août 2015. Pourcentages complets : tableau Pew Q.84 (rapport de 2016, page 19).", stokesLink: "Stokes (2015)", dataLink: "Données de l’enquête de 2013",
  },
  ko: {
    activateSector: "비율을 누르면 빨간 영역이 살짝 튀어 오릅니다",
    activatePercent: "차트를 누르면 현재 비율이 살짝 튀어 오릅니다",
    previous: "이전 응답", next: "다음 응답", pagerLabel: "조사 응답 넘기기", scrollHint: "차트 위에서 아래로 스크롤하면 다음 응답, 위로 스크롤하면 이전 응답을 볼 수 있습니다.",
    nav: "전쟁에 대한 성찰", eyebrow: "전쟁의 기억과 성찰", title: "일본 대중은 사과를 어떻게 바라보았을까?",
    intro: "Pew Research Center의 2013년 조사에서 일본 응답자의 48%는 일본이 1930~1940년대의 군사 행동에 대해 충분히 사과했다고 답했습니다. Stokes(2015)는 이 결과를 인용하며 전쟁 책임에 관한 일본 내 의견 차이를 논했습니다.",
    survey: "일본 · 2013년 여론 조사", question: "일본은 충분히 사과했는가?", finding: "충분히 사과했다고 응답",
    flagDescription: "일본 국기를 활용한 원형 차트입니다. 빨간 부채꼴은 선택한 응답을 나타내며 원 전체의 {percent}를 차지합니다.", flagNote: "빨간 부채꼴은 원 전체의 {percent}를 차지합니다. 옅은 부분의 {remainder}는 나머지 응답을 나타냅니다.",
    breakdown: "같은 조사에서 나온 네 가지 응답", modeLabel: "차트 유형", interaction: "응답을 선택하면 위 국기의 비율이 바뀝니다.", chartNames: ["도넛 차트", "100칸 격자", "반원 게이지", "분할 막대"], chartNotes: ["전체 고리 = 100%", "한 칸 = 1%", "전체 호 = 100%", "한 구간 = 5%"], answers: ["충분히 사과했다", "충분히 사과하지 않았다", "사과할 필요가 없다", "모름 / 응답 거부"],
    context: "이 조사는 당시 사과의 충분성에 대한 의견을 기록합니다. 개인의 성찰 정도를 직접 측정하거나 리스본 마루호 사건만을 다룬 조사는 아닙니다.",
    citation: "조사 연도: 2013년. 인용: Bruce Stokes, Pew Research Center, 2015년 8월 4일. 전체 비율: Pew 조사표 Q.84(2016년 보고서, 19쪽).", stokesLink: "Stokes(2015) 원문", dataLink: "2013년 조사 자료",
  },
};
