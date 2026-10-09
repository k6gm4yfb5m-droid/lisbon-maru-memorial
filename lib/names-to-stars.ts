import { starNewTranslations } from "./new-locales";
import type { Locale } from "./i18n";

export const starTranslations = {
 ...starNewTranslations,
 zh: {eyebrow:"以名字铭记",title:"每一个名字，一点星光。",intro:"让名录中的名字穿过时光，汇成一片星海。",pause:"暂停",play:"继续播放",replay:"重新播放",static:"观看完整星海",animate:"观看名字汇入",progress:"{count} / {total} 个名字已化为星光",complete:"{total} 个名字，一片星海。",note:"使用纪念名录中的全部 {total} 个名字，保留原始姓名。",description:"遇难者的名字分批向中央靠拢，逐一化为星光。每一点星光对应名录中的一位逝者。",list:"星光中的名字",interaction:"点击人名，查看所属部队与已知资料；悬停或键盘聚焦时，名字会暂时停住。",read:"查看 {name} 的资料"},
 en: {eyebrow:"Remembering by name",title:"Every name, a point of light.",intro:"Names from the memorial roll travel through time and gather into a field of stars.",pause:"Pause",play:"Resume",replay:"Replay",static:"View all stars",animate:"Watch names gather",progress:"{count} / {total} names have become stars",complete:"{total} names, a field of stars.",note:"All {total} names from the memorial roll, in their original form.",description:"The names of those who died travel towards the centre and become stars, one by one. Each star represents one person in the memorial roll.",list:"Names among the stars",interaction:"Select a name to see its unit and known details. Names pause on hover or keyboard focus.",read:"View the record of {name}"},
 ja: {eyebrow:"名前を胸に刻む",title:"一人ひとりの名前が、星の光に。",intro:"名簿に記された名前が時を越え、星々の光へと集います。",pause:"一時停止",play:"再生を続ける",replay:"最初から再生",static:"すべての星を見る",animate:"名前が集う様子を見る",progress:"{count} / {total} 人の名前が星の光に",complete:"{total} 人の名前が、星々の光に。",note:"追悼名簿の全 {total} 人の名前を、原表記のまま使用しています。",description:"亡くなった方々の名前が中央へと集まり、一つずつ星の光に変わります。一つの星が名簿の一人に対応します。",list:"星々に刻まれた名前",interaction:"名前を選ぶと、所属部隊と既知の情報を確認できます。名前にカーソルやキーボードのフォーカスを合わせると、一時停止します。",read:"{name} の記録を見る"},
 fr: {eyebrow:"Se souvenir de chaque nom",title:"Chaque nom, une lumière.",intro:"Les noms du registre traversent le temps et se rassemblent en un ciel étoilé.",pause:"Pause",play:"Reprendre",replay:"Recommencer",static:"Voir toutes les étoiles",animate:"Voir les noms se rassembler",progress:"{count} / {total} noms sont devenus des étoiles",complete:"{total} noms, un ciel étoilé.",note:"Les {total} noms du registre commémoratif, dans leur forme d’origine.",description:"Les noms des victimes convergent vers le centre et deviennent des étoiles, un à un. Chaque étoile représente une personne du registre commémoratif.",list:"Les noms parmi les étoiles",interaction:"Sélectionnez un nom pour consulter son unité et les informations connues. Les noms s’arrêtent au survol ou au focus clavier.",read:"Voir la fiche de {name}"},
 ko: {eyebrow:"이름으로 기억하며",title:"이름 하나하나가 별빛으로.",intro:"명부에 기록된 이름들이 시간을 지나 별빛으로 모입니다.",pause:"일시 정지",play:"계속 재생",replay:"처음부터 재생",static:"모든 별 보기",animate:"이름이 모이는 모습 보기",progress:"{count} / {total}명의 이름이 별빛이 되었습니다",complete:"{total}명의 이름, 하나의 별바다.",note:"추모 명부에 있는 {total}명의 이름을 원문 그대로 사용합니다.",description:"희생자들의 이름이 중앙으로 모여 하나씩 별빛으로 변합니다. 별 하나는 추모 명부에 기록된 한 사람을 나타냅니다.",list:"별빛 속 이름들",interaction:"이름을 선택하면 소속 부대와 알려진 정보를 볼 수 있습니다. 이름 위에 포인터를 올리거나 키보드로 초점을 맞추면 잠시 멈춥니다.",read:"{name}의 기록 보기"},
} satisfies Record<Locale, Record<string,string>>;

// Each source record has exactly one place in the procession and in the final sky.
export const NAME_INTERVAL = 540;
export const NAME_JOURNEY = 4200;
export function arrivedNames(elapsed: number, total: number) {
 return Math.max(0, Math.min(total, Math.floor((elapsed - NAME_JOURNEY) / NAME_INTERVAL) + 1));
}
