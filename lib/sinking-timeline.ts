import { timelineNewTranslations } from "./new-locales";
import type { Locale } from "./i18n";

export const timelineSources = {
  departure: "https://www.cofepow.org.uk/armed-forces-stories-list/the-lisbon-maru",
  destination: "https://www.pen-and-sword.co.uk/blog/remembering-the-lisbon-maru-vj-day-new-films-and-the-forgotten-war-crime-of-1942/",
  patrol: "https://www.queensregimentalassociation.org/journals-and-newsletters/middlesex-journals/pdfs/volume-15/vol-15-7.pdf#page=12",
  background: "https://www.lisbonmaru.org.uk/page/Background%2Bto%2Bthe%2Bsinking%2Bof%2Bthe%2Blisbon%2Bmaru",
  chronology: "https://www.lisbonmaru.org.uk/page/The%2Bsinking%2Bof%2Bthe%2Blisbon%2Bmaru",
  escape: "https://www.cofepow.org.uk/armed-forces-stories-list/the-lisbon-maru-tragedy",
  return: "https://www.lisbonmaru.org.uk/page/Personal%2Binformation%2Bsheet%2B499",
} as const;

export const timelineEvents = [
  { id: "departure", phase: -1, date: "1942-09-27", source: "departure" },
  { id: "sighting", phase: 0, date: "1942-10-01", source: "patrol" },
  { id: "approach", phase: 1, date: "1942-10-01", source: "background" },
  { id: "torpedoes", phase: 2, date: "1942-10-01", source: "patrol" },
  { id: "hit", phase: 3, date: "1942-10-01", source: "background" },
  { id: "daybreak", phase: 4, date: "1942-10-02", source: "chronology" },
  { id: "evacuation", phase: 5, date: "1942-10-02", source: "chronology" },
  { id: "breakout", phase: 6, date: "1942-10-02", source: "chronology" },
  { id: "rescue", phase: 7, date: "1942-10-02", source: "background" },
  { id: "aftermath", phase: 8, date: "1942-10-05", source: "escape" },
] as const;
type EventText = { date: string; time: string; title: string; body: string; note?: string };
type TimelineText = {
  nav: string; eyebrow: string; title: string; intro: string; hint: string;
  sceneLabel: string; submarine: string; ship: string; islands: string;
  chapters: string; sourceLink: string; destinationSourceLink: string; illustrationNote: string;
  afterTitle: string; afterBody: string; returnLink: string;
  events: readonly EventText[];
};

export const timelineTranslations: Record<Locale, TimelineText> = {
 ...timelineNewTranslations,
  zh: {
    nav: "事件时间轴", eyebrow: "1942 · 沉船事件时间轴", title: "从启航，到救援。",
    intro: "1942年9月27日至10月5日。沿着十个时间节点，回望里斯本丸号从香港启航、遭袭、沉没与救援的经过。",
    hint: "向下滚动推进故事，左右滑动画面切换节点；也可点击时间轴圆点、序号或使用左右方向键。", sceneLabel: "随滚动推进的里斯本丸号事件示意",
    submarine: "USS Grouper", ship: "里斯本丸号", islands: "浙江东极岛一带", chapters: "选择时间节点", sourceLink: "史料来源", destinationSourceLink: "目的地资料",
    illustrationNote: "画面为事件示意，不表示真实船体结构、航线或距离。", afterTitle: "逃脱之后，仍有漫长的旅程。",
    afterBody: "三人在岛民掩护下躲过再俘，随后前往中国大陆。Evans于1942年12月22日抵达重庆；之后经印度和加拿大，于1945年再到英国。",
    returnLink: "后续旅程 · Evans个人记录",
    events: [
      { date: "1942年9月27日", time: "启航", title: "从香港启航", body: "英国战俘由香港深水埗战俘营的码头转运登上里斯本丸号。9月27日，船舶离开香港，计划驶往日本门司港（Moji）。" },
      { date: "1942年10月1日", time: "04:00", title: "发现北上的货轮", body: "美国潜艇USS Grouper发现向北航行的里斯本丸号，将其识别为目标货轮。" },
      { date: "1942年10月1日", time: "06:30", title: "改变航向，准备攻击", body: "观察到货轮改变航向后，艇长Rob Roy McGregor下令准备攻击。" },
      { date: "1942年10月1日", time: "07:04", title: "前三枚鱼雷", body: "潜艇在当时能够接近的最短距离——约3,200码——发射三枚鱼雷，未发生爆炸。" },
      { date: "1942年10月1日", time: "约07:06", title: "第四枚鱼雷", body: "潜艇追加发射第四枚鱼雷，随后击中里斯本丸号。船尾受损，船舶失去继续航行的能力。", note: "约07:06沿用所提供的时间。巡航报告未单列第四枚鱼雷的发射时刻；LiMMA时间轴将命中列为07:15。此处不将发射与命中视为同一时刻。" },
      { date: "1942年10月2日", time: "黎明", title: "船体剧烈摇晃", body: "里斯本丸号开始剧烈摇晃。船舱内的情况持续恶化，战俘尝试冲破封闭的舱口。" },
      { date: "1942年10月2日", time: "08:10", title: "日方人员撤离", body: "留船的日方人员发出请求弃船的信号，随后船员和大部分守卫被救生艇接走。" },
      { date: "1942年10月2日", time: "约09:00", title: "冲出船舱", body: "部分战俘冲破舱口，留守的日军开火，造成逃生者伤亡。随后，更多战俘从下沉的船上进入海中。" },
      { date: "1942年10月2日", time: "随后数小时", title: "渔民驶向落水者", body: "青滨岛、庙子湖岛的渔民往返施救，救起384名英国战俘。相关记载称，渔民介入救援后，日方停止射击并开始救人。" },
      { date: "截至1942年10月5日", time: "数日之后", title: "再俘与逃脱", body: "日军登岛搜捕，大部分获救者再次被俘。三人在岛民帮助下躲过搜捕，之后离岛前往中国大陆；其中Evans后来抵达重庆，讲述沉船经历。", note: "再俘、逃脱和前往重庆发生于一段时间内，不统一标注为10月5日09:00。" },
    ],
  },
  en: {
    nav: "Timeline", eyebrow: "1942 · THE SINKING TIMELINE", title: "From departure to rescue.",
    intro: "27 September–5 October 1942. Follow ten moments from the Lisbon Maru’s departure from Hong Kong to the attack, sinking and rescue.",
    hint: "Scroll through the story, swipe or drag the scene sideways, select a timeline dot or chapter number, or use the left and right arrow keys.", sceneLabel: "A scroll-driven illustration of the Lisbon Maru events",
    submarine: "USS Grouper", ship: "Lisbon Maru", islands: "Dongji Islands · Zhejiang", chapters: "Choose a moment", sourceLink: "Historical source", destinationSourceLink: "Destination source",
    illustrationNote: "A schematic illustration, not an exact ship plan, route or distance.", afterTitle: "Escape was the beginning of another journey.",
    afterBody: "Islanders sheltered the three escapees, who later reached mainland China. Evans arrived in Chongqing on 22 December 1942, then travelled through India and Canada before visiting the UK in 1945.",
    returnLink: "The later journey · Evans’s personal record",
    events: [
      { date: "27 September 1942", time: "Departure", title: "Departing Hong Kong", body: "British POWs were transferred from the pier at Sham Shui Po camp in Hong Kong to the Lisbon Maru. On 27 September 1942, the ship sailed from Hong Kong, bound for Moji, Japan." },
      { date: "1 October 1942", time: "04:00", title: "A northbound freighter", body: "The US submarine USS Grouper identified the northbound Lisbon Maru as a target freighter." },
      { date: "1 October 1942", time: "06:30", title: "Preparing to attack", body: "After observing a change in the freighter’s course, Lieutenant Commander Rob Roy McGregor ordered preparations for an attack." },
      { date: "1 October 1942", time: "07:04", title: "The first three torpedoes", body: "Three torpedoes were fired at the closest attainable range, about 3,200 yards. None detonated." },
      { date: "1 October 1942", time: "Around 07:06", title: "The fourth torpedo", body: "A fourth torpedo was fired and struck the Lisbon Maru. Damage at the stern disabled the ship.", note: "Around 07:06 follows the supplied chronology. The patrol report does not separately time this launch; LiMMA’s timeline gives 07:15 for the hit. Launch and impact were separate moments." },
      { date: "2 October 1942", time: "Daybreak", title: "The ship begins to sway", body: "The Lisbon Maru began to sway violently. Conditions in the holds deteriorated, and the prisoners tried to break out." },
      { date: "2 October 1942", time: "08:10", title: "The crew is evacuated", body: "The remaining Japanese personnel signalled for permission to abandon ship. Lifeboats then removed the crew and most of the guards." },
      { date: "2 October 1942", time: "Around 09:00", title: "Breaking out of the holds", body: "Some POWs forced open a hatch. The remaining Japanese guards opened fire, killing and wounding men attempting to escape. More prisoners entered the sea as the ship sank." },
      { date: "2 October 1942", time: "The following hours", title: "Fishermen come to the rescue", body: "Fishermen from Qingbang and Miaozihu made repeated rescue trips, saving 384 British POWs. Accounts describe Japanese forces ceasing fire and beginning to rescue men after the fishermen intervened." },
      { date: "By 5 October 1942", time: "In the days that followed", title: "Recapture and escape", body: "Japanese forces rounded up most survivors sheltered on the islands. Three avoided recapture with islanders’ help and later reached mainland China. Evans subsequently reached Chongqing and recounted the sinking.", note: "Recapture, escape and the journey to Chongqing unfolded over time, not at a single 09:00 event on 5 October." },
    ],
  },
  ja: {
    nav: "事件の年表", eyebrow: "1942 · 沈没事件の年表", title: "出航から、救助へ。",
    intro: "1942年9月27日から10月5日まで。十の場面をたどり、リスボン丸の香港出航から、攻撃、沈没、救助までを振り返ります。",
    hint: "下へスクロールすると物語が進みます。画面を左右にスワイプ・ドラッグするか、年表の点、番号、左右の矢印キーで場面を切り替えられます。", sceneLabel: "スクロールに連動するリスボン丸事件の模式図",
    submarine: "USS Grouper", ship: "リスボン丸", islands: "浙江省・東極諸島付近", chapters: "場面を選択", sourceLink: "歴史資料", destinationSourceLink: "目的地の資料",
    illustrationNote: "模式図です。正確な船の構造、航路、距離を示すものではありません。", afterTitle: "脱出の先にも、長い旅路がありました。",
    afterBody: "島民に守られた三人は、その後、中国本土へ渡りました。Evansは1942年12月22日に重慶に到着し、さらにインドとカナダを経て、1945年に英国を訪れました。",
    returnLink: "その後の旅路 · Evansの個人記録",
    events: [
      { date: "1942年9月27日", time: "出航", title: "香港から出航", body: "英国人捕虜は香港・深水埗の捕虜収容所の桟橋からリスボン丸へ移送されました。9月27日、同船は日本の門司港を目指して香港を出航しました。" },
      { date: "1942年10月1日", time: "04:00", title: "北へ向かう貨物船", body: "米潜水艦USS Grouperは、北へ航行するリスボン丸を目標の貨物船として確認しました。" },
      { date: "1942年10月1日", time: "06:30", title: "攻撃の準備", body: "貨物船の針路変更を確認した艦長Rob Roy McGregor少佐は、攻撃の準備を命じました。" },
      { date: "1942年10月1日", time: "07:04", title: "最初の三本の魚雷", body: "接近可能な最短距離、約3,200ヤードから三本の魚雷を発射しましたが、爆発は起きませんでした。" },
      { date: "1942年10月1日", time: "07:06頃", title: "四本目の魚雷", body: "さらに発射された魚雷がリスボン丸に命中し、船尾の損傷によって航行不能となりました。", note: "07:06頃は提供された年表によります。哨戒報告にはこの発射時刻の個別記載がなく、LiMMAの年表は命中を07:15としています。発射と命中は別の時点です。" },
      { date: "1942年10月2日", time: "夜明け", title: "激しく揺れる船体", body: "リスボン丸は激しく揺れ始めました。船倉内の状況が悪化し、捕虜たちは閉ざされたハッチを破ろうとしました。" },
      { date: "1942年10月2日", time: "08:10", title: "船員の退船", body: "船に残った日本側の人員が退船の許可を求める信号を送り、船員と大半の見張りは救命艇で退船しました。" },
      { date: "1942年10月2日", time: "09:00頃", title: "船倉からの脱出", body: "一部の捕虜がハッチを破りました。残っていた日本兵が発砲し、脱出しようとした人々に死傷者が出ました。沈む船から、さらに多くの捕虜が海へ入りました。" },
      { date: "1942年10月2日", time: "その後の数時間", title: "救助に向かう漁民", body: "青浜島と廟子湖島の漁民は救助を繰り返し、384人の英国人捕虜を救いました。記録によれば、漁民の介入後、日本側も射撃をやめて救助を始めました。" },
      { date: "1942年10月5日まで", time: "その後の数日間", title: "再捕縛と脱出", body: "日本軍が島で生存者を捜索し、大半は再び捕らえられました。島民の助けで三人が再捕縛を免れ、その後、中国本土へ渡りました。Evansはさらに重慶で沈没の体験を伝えました。", note: "再捕縛、脱出、重慶への旅は一連の出来事であり、10月5日09:00の一時点にはまとめていません。" },
    ],
  },
  fr: {
    nav: "Chronologie", eyebrow: "1942 · CHRONOLOGIE DU NAUFRAGE", title: "Du départ au sauvetage.",
    intro: "Du 27 septembre au 5 octobre 1942. Dix étapes retracent le départ du Lisbon Maru de Hong Kong, l’attaque, le naufrage et le sauvetage.",
    hint: "Faites défiler le récit, glissez la scène à gauche ou à droite, sélectionnez un point de la chronologie ou un numéro, ou utilisez les flèches du clavier.", sceneLabel: "Illustration des événements du Lisbon Maru liée au défilement",
    submarine: "USS Grouper", ship: "Lisbon Maru", islands: "Îles Dongji · Zhejiang", chapters: "Choisir une étape", sourceLink: "Source historique", destinationSourceLink: "Source sur la destination",
    illustrationNote: "Illustration schématique : ni plan exact du navire, ni itinéraire ou distance à l’échelle.", afterTitle: "L’évasion ouvrait un autre voyage.",
    afterBody: "Protégés par les insulaires, les trois hommes gagnèrent ensuite la Chine continentale. Evans arriva à Chongqing le 22 décembre 1942, puis passa par l’Inde et le Canada avant de se rendre au Royaume-Uni en 1945.",
    returnLink: "Le voyage ultérieur · dossier personnel d’Evans",
    events: [
      { date: "27 septembre 1942", time: "Départ", title: "Le départ de Hong Kong", body: "Les prisonniers britanniques furent transférés du quai du camp de Sham Shui Po, à Hong Kong, au Lisbon Maru. Le 27 septembre 1942, le navire quitta Hong Kong à destination du port de Moji, au Japon." },
      { date: "1er octobre 1942", time: "04 h 00", title: "Un cargo vers le nord", body: "Le sous-marin américain USS Grouper repéra le Lisbon Maru, qui faisait route vers le nord, comme un cargo à attaquer." },
      { date: "1er octobre 1942", time: "06 h 30", title: "Préparer l’attaque", body: "Après avoir observé un changement de cap du cargo, le commandant Rob Roy McGregor ordonna de préparer l’attaque." },
      { date: "1er octobre 1942", time: "07 h 04", title: "Les trois premières torpilles", body: "Trois torpilles furent lancées à la distance minimale possible, environ 3 200 yards. Aucune n’explosa." },
      { date: "1er octobre 1942", time: "Vers 07 h 06", title: "La quatrième torpille", body: "Une quatrième torpille fut lancée et toucha le Lisbon Maru. Les dégâts à la poupe immobilisèrent le navire.", note: "L’heure approximative de 07 h 06 vient de la chronologie fournie. Le rapport de patrouille ne précise pas l’heure de ce lancement ; LiMMA situe l’impact à 07 h 15. Lancement et impact sont distincts." },
      { date: "2 octobre 1942", time: "À l’aube", title: "Le navire oscille violemment", body: "Le Lisbon Maru se mit à osciller violemment. Les conditions dans les cales se dégradèrent et les prisonniers tentèrent de sortir." },
      { date: "2 octobre 1942", time: "08 h 10", title: "Évacuation de l’équipage", body: "Les Japonais encore à bord demandèrent par signal l’autorisation d’abandonner le navire. Des canots évacuèrent ensuite l’équipage et la plupart des gardes." },
      { date: "2 octobre 1942", time: "Vers 09 h 00", title: "Sortir des cales", body: "Des prisonniers forcèrent une écoutille. Les gardes japonais restants ouvrirent le feu, tuant et blessant des hommes qui tentaient de s’échapper. D’autres prisonniers gagnèrent la mer tandis que le navire sombrait." },
      { date: "2 octobre 1942", time: "Les heures suivantes", title: "Les pêcheurs à la rescousse", body: "Les pêcheurs de Qingbang et de Miaozihu multiplièrent les sorties et sauvèrent 384 prisonniers britanniques. Les récits indiquent que leur intervention amena les forces japonaises à cesser le feu et à secourir des hommes." },
      { date: "Au 5 octobre 1942", time: "Dans les jours suivants", title: "Recapture et évasion", body: "Les forces japonaises reprirent la plupart des survivants réfugiés sur les îles. Trois hommes échappèrent à la recapture grâce aux insulaires et gagnèrent ensuite la Chine continentale. Evans témoigna plus tard du naufrage à Chongqing.", note: "La recapture, l’évasion et le voyage vers Chongqing se déroulèrent sur une période, et non en un seul événement à 09 h 00 le 5 octobre." },
    ],
  },
  ko: {
    nav: "사건 연표", eyebrow: "1942 · 침몰 사건 연표", title: "출항에서 구조까지.",
    intro: "1942년 9월 27일부터 10월 5일까지. 열 장면을 따라 리스본 마루호의 홍콩 출항부터 피격, 침몰과 구조까지 살펴봅니다.",
    hint: "아래로 스크롤해 이야기를 따라가세요. 화면을 좌우로 밀거나 드래그하고, 연표의 점, 번호 또는 좌우 방향키로 장면을 바꿀 수 있습니다.", sceneLabel: "스크롤에 따라 진행되는 리스본 마루호 사건 개념도",
    submarine: "USS Grouper", ship: "리스본 마루호", islands: "저장성 둥지 제도 일대", chapters: "장면 선택", sourceLink: "역사 자료", destinationSourceLink: "목적지 자료",
    illustrationNote: "실제 선박 구조, 항로 또는 거리를 나타내는 그림이 아닌 개념도입니다.", afterTitle: "탈출 뒤에도 긴 여정이 이어졌습니다.",
    afterBody: "섬 주민들의 보호를 받은 세 사람은 이후 중국 본토로 이동했습니다. Evans는 1942년 12월 22일 충칭에 도착했고, 이후 인도와 캐나다를 거쳐 1945년에 영국을 방문했습니다.",
    returnLink: "이후의 여정 · Evans의 개인 기록",
    events: [
      { date: "1942년 9월 27일", time: "출항", title: "홍콩에서 출항", body: "영국군 포로들은 홍콩 삼수이포 수용소의 부두에서 리스본 마루호로 이송되어 승선했습니다. 1942년 9월 27일, 배는 일본 모지항을 목적지로 홍콩을 출항했습니다." },
      { date: "1942년 10월 1일", time: "04:00", title: "북쪽으로 향하는 화물선", body: "미국 잠수함 USS Grouper는 북쪽으로 항해하던 리스본 마루호를 공격 대상 화물선으로 식별했습니다." },
      { date: "1942년 10월 1일", time: "06:30", title: "공격 준비", body: "화물선의 항로 변경을 확인한 함장 Rob Roy McGregor는 공격 준비를 명령했습니다." },
      { date: "1942년 10월 1일", time: "07:04", title: "첫 번째 어뢰 세 발", body: "접근할 수 있는 가장 가까운 거리인 약 3,200야드에서 어뢰 세 발을 발사했지만 폭발하지 않았습니다." },
      { date: "1942년 10월 1일", time: "약 07:06", title: "네 번째 어뢰", body: "추가로 발사한 어뢰가 리스본 마루호에 명중했습니다. 선미가 손상되어 항해를 계속할 수 없게 되었습니다.", note: "약 07:06은 제공된 연표의 시각입니다. 순찰 보고서에는 이 발사 시각이 따로 기재되어 있지 않으며, LiMMA 연표는 명중 시각을 07:15로 제시합니다. 발사와 명중은 서로 다른 순간입니다." },
      { date: "1942년 10월 2일", time: "새벽", title: "격렬하게 흔들리는 선체", body: "리스본 마루호가 격렬하게 흔들리기 시작했습니다. 선창 안의 상황이 악화되자 포로들은 닫힌 해치를 뚫으려 했습니다." },
      { date: "1942년 10월 2일", time: "08:10", title: "승무원의 철수", body: "배에 남아 있던 일본 측 인원은 퇴선 허가를 요청하는 신호를 보냈습니다. 이후 승무원과 대부분의 경비병이 구명정으로 철수했습니다." },
      { date: "1942년 10월 2일", time: "약 09:00", title: "선창에서 탈출", body: "일부 포로가 해치를 뚫었습니다. 남아 있던 일본군 경비병이 발포하여 탈출하려던 사람들이 죽거나 다쳤습니다. 배가 가라앉으면서 더 많은 포로가 바다로 뛰어들었습니다." },
      { date: "1942년 10월 2일", time: "이후 몇 시간", title: "구조에 나선 어민들", body: "칭방섬과 먀오쯔후섬의 어민들은 여러 차례 구조에 나서 영국군 포로 384명을 구했습니다. 기록에 따르면 어민들이 개입한 뒤 일본 측도 사격을 멈추고 구조를 시작했습니다." },
      { date: "1942년 10월 5일까지", time: "이후 며칠 동안", title: "재포획과 탈출", body: "일본군은 섬에 피신한 생존자 대부분을 다시 붙잡았습니다. 세 사람은 섬 주민들의 도움으로 다시 포로가 되는 것을 피하고 이후 중국 본토로 이동했습니다. Evans는 나중에 충칭에서 침몰 사건을 알렸습니다.", note: "재포획, 탈출, 충칭으로의 이동은 일정 기간에 걸쳐 일어난 일이며, 10월 5일 09:00에 모두 발생한 사건으로 표기하지 않습니다." },
    ],
  },
};

export const timelineRailHints: Record<Locale,string> = {zh:"也可上下拖动时间轴的线或圆点，切换章节。",en:"You can also drag the timeline line or a dot up or down to change chapters.",ja:"タイムラインの線や点を上下にドラッグして、章を切り替えることもできます。",fr:"Vous pouvez aussi faire glisser la ligne ou un point de la chronologie pour changer de chapitre.",ko:"시간축의 선이나 점을 위아래로 끌어 장면을 바꿀 수도 있습니다.",es:"También puedes arrastrar la línea o un punto de la cronología para cambiar de capítulo.",ar:"يمكنك أيضًا سحب الخط أو نقطة لأعلى أو لأسفل على الخط الزمني لتغيير الفصل."};
