import { archiveNewTranslations, archivePassageNewTranslations, archiveFoldNewTranslations } from "./new-locales";
import type { Locale } from "./i18n";
export type ArchiveCategory = "letter" | "witness" | "family";
export type ArchiveRecord = {id:string;category:ArchiveCategory;name:string;relation:number;unit:number;original:string[];rank?:number;related?:string};
// User-supplied transcriptions. Do not silently correct spelling, grammar or punctuation.
export const archiveRecords: ArchiveRecord[] = [
  {
    "id": "penny",
    "category": "letter",
    "name": "Richard Penny",
    "relation": 0,
    "unit": 0,
    "original": [
      "Dear Gerald\nThank you very much for your letter, there is not much\nI can say to you, except this,",
      "Always love and take\nCare of your mother, she is only and best one\nYou will ever have.",
      "Love to You from\nYour Brother\nRichard."
    ],
    "rank": 0
  },
  {
    "id": "hughieson",
    "category": "witness",
    "name": "Jack Hughieson",
    "relation": 1,
    "unit": 1,
    "original": [
      "At the moment it’s resonbly safe,",
      "But water is pouring in, we won’t last for much longer"
    ],
    "related": "https://www.iwm.org.uk/collections/item/object/80025920"
  },
  {
    "id": "morley",
    "category": "witness",
    "name": "Dennis Morley",
    "relation": 1,
    "unit": 2,
    "original": [
      "we are close together. We were right on the bottom",
      "that’s where all the sewage was. So we were",
      "swimming in it, virtually."
    ],
    "rank": 0
  },
  {
    "id": "beningfield",
    "category": "witness",
    "name": "William Beningfield",
    "relation": 1,
    "unit": 5,
    "original": [
      "A lot of guy were pretty sick.",
      "Dry pellagra, it used to affect your whole body."
    ],
    "rank": 0
  },
  {
    "id": "johnes",
    "category": "family",
    "name": "THOMAS JOHNES",
    "relation": 2,
    "unit": 1,
    "original": [
      "I was 9 years old\nwhen my father died. The information came from my mother.",
      "The Red Cross would send a parcel to the prisoners to Hong Kong",
      "They would burn this in front of the prisoner by the Japanese"
    ],
    "rank": 1
  },
  {
    "id": "barlow",
    "category": "family",
    "name": "William Barlow",
    "relation": 3,
    "unit": 3,
    "original": [
      "my father William Arthur Barlow, was a Sergent Major in\nRoyal Artillery, was unfortunately killed on the Lisbon Maru, I had\nto grow up without my dad."
    ],
    "rank": 2
  },
  {
    "id": "taylor",
    "category": "family",
    "name": "Gerald Taylor",
    "relation": 3,
    "unit": 4,
    "original": [
      "I believed my father absolutely adored me.",
      "I kept thinking my daddy was coming home, but he didn’t",
      "It’s a big question Mark not to know and go through childhood without\nyour dad"
    ],
    "rank": 3
  },
  {
    "id": "brooks",
    "category": "family",
    "name": "Charles Brooks",
    "relation": 2,
    "unit": 3,
    "original": [
      "My memories of my father are very slight.",
      "It’s not just the killings take place on the battle field\nIt’s the result for the families forever)."
    ],
    "rank": 4
  },
  {
    "id": "glister",
    "category": "family",
    "name": "Montague Glister",
    "relation": 4,
    "unit": 3,
    "original": [
      "My father was only seven when he lost my grand dad.",
      "Alway it was a hole in his heart that he never has his dad."
    ],
    "rank": 5
  }
];
export const archiveTranslations = {
 ...archiveNewTranslations,
  "zh": {
    "nav": "家书与回忆",
    "eyebrow": "留下的声音",
    "title": "他们的话，还留在这里。",
    "intro": "一封写给兄弟的信。一段船舱里的回忆。一个没有等到父亲回家的童年。",
    "categories": [
      "全部档案",
      "家书",
      "亲历者回忆",
      "后代访谈"
    ],
    "relations": [
      "致兄弟 Gerald Penny",
      "幸存者的回忆",
      "儿子的访谈",
      "女儿的访谈",
      "孙女的访谈"
    ],
    "units": [
      "米德尔塞克斯团",
      "皇家海军",
      "皇家苏格兰团",
      "皇家炮兵",
      "皇家陆军牙医军团",
      "米德尔塞克斯团第1营"
    ],
    "open": "打开档案",
    "close": "收起档案",
    "original": "英文原文",
    "show": "显示译文",
    "hide": "隐藏译文",
    "translation": "阅读译文",
    "passage": "句段",
    "previous": "上一份档案",
    "next": "下一份档案",
    "nextPassage": "继续读下一段",
    "allRead": "回到第一段",
    "choose": "选择一份记录",
    "hint": "点击原文句段，停留在那句话。",
    "transcript": "文字转录，非原件影印。原文保留所提供转录的拼写与语法；译文仅辅助阅读。",
    "sourcePending": "转录摘录 · 原始出处待补充",
    "related": "相关口述史档案",
    "relatedNote": "相关档案链接不代表本摘录已逐字核对。",
    "note": "访谈者未具名时，以亲属关系标注。亲历者资料为口述回忆摘录。",
    "closed": "打开一份记录，读他们留下的话。",
    "reading": "档案阅读",
    "ranks": [
      "列兵",
      "报务员",
      "军士长",
      "中士",
      "炮兵军士长",
      "炮手"
    ]
  },
  "en": {
    "nav": "Letters & memories",
    "eyebrow": "VOICES THAT REMAIN",
    "title": "Their words remain.",
    "intro": "A letter to a brother. A memory of the hold. A childhood spent waiting for a father to return.",
    "categories": [
      "All records",
      "Letter",
      "Eyewitness memories",
      "Family interviews"
    ],
    "relations": [
      "To his brother Gerald Penny",
      "A survivor’s recollection",
      "His son’s interview",
      "His daughter’s interview",
      "His granddaughter’s interview"
    ],
    "units": [
      "Middlesex Regiment",
      "Royal Navy",
      "Royal Scots",
      "Royal Artillery",
      "Royal Army Dental Corps",
      "1st Battalion, Middlesex Regiment"
    ],
    "open": "Open record",
    "close": "Close record",
    "original": "Original English",
    "show": "Show translation",
    "hide": "Hide translation",
    "translation": "Reading translation",
    "passage": "Passage",
    "previous": "Previous record",
    "next": "Next record",
    "nextPassage": "Read the next passage",
    "allRead": "Return to the first passage",
    "choose": "Choose a record",
    "hint": "Select a passage to stay with those words.",
    "transcript": "A text transcription, not a facsimile. Supplied spelling and grammar are preserved; translations are reading aids.",
    "sourcePending": "Transcribed excerpt · Original source pending",
    "related": "Related oral-history archive",
    "relatedNote": "The related archive does not establish verbatim verification of this excerpt.",
    "note": "Unnamed speakers are identified by their family relationship. Eyewitness records are excerpts from oral recollections.",
    "closed": "Open a record to read the words they left behind.",
    "reading": "Read an archive record",
    "ranks": [
      "Private",
      "Telegraphist",
      "Sergeant Major",
      "Sergeant",
      "Master Gunner",
      "Gunner"
    ]
  },
  "ja": {
    "nav": "手紙と記憶",
    "eyebrow": "残された声",
    "title": "言葉は、ここに残っている。",
    "intro": "兄弟に宛てた手紙。船倉の記憶。父の帰りを待ち続けた子ども時代。",
    "categories": [
      "すべて",
      "手紙",
      "生存者の記憶",
      "遺族の証言"
    ],
    "relations": [
      "兄弟 Gerald Penny へ",
      "生存者の回想",
      "息子の証言",
      "娘の証言",
      "孫娘の証言"
    ],
    "units": [
      "ミドルセックス連隊",
      "王立海軍",
      "ロイヤル・スコッツ連隊",
      "王立砲兵隊",
      "王立陸軍歯科部隊",
      "ミドルセックス連隊第1大隊"
    ],
    "open": "記録を開く",
    "close": "記録を閉じる",
    "original": "英語原文",
    "show": "訳文を表示",
    "hide": "訳文を隠す",
    "translation": "参考訳",
    "passage": "文章",
    "previous": "前の記録",
    "next": "次の記録",
    "nextPassage": "次の文章を読む",
    "allRead": "最初の文章へ",
    "choose": "記録を選ぶ",
    "hint": "原文の文章を押すと、その言葉に留まれます。",
    "transcript": "原資料の画像ではなく文字起こしです。提供された綴りと文法を保持し、訳文は読解の補助です。",
    "sourcePending": "文字起こしの抜粋 · 原出典は未確認",
    "related": "関連する口述史資料",
    "relatedNote": "関連資料へのリンクは、この抜粋の逐語確認を意味しません。",
    "note": "氏名不明の話者は続柄で表示しています。生存者の資料は口述回想の抜粋です。",
    "closed": "記録を開いて、残された言葉を読む。",
    "reading": "記録を読む",
    "ranks": [
      "兵卒",
      "通信兵",
      "曹長",
      "軍曹",
      "砲術長",
      "砲兵"
    ]
  },
  "fr": {
    "nav": "Lettres et souvenirs",
    "eyebrow": "LES VOIX QUI RESTENT",
    "title": "Leurs mots sont encore là.",
    "intro": "Une lettre à un frère. Un souvenir de la cale. Une enfance à attendre le retour d’un père.",
    "categories": [
      "Tous les documents",
      "Lettre",
      "Souvenirs des témoins",
      "Entretiens des familles"
    ],
    "relations": [
      "À son frère Gerald Penny",
      "Souvenir d’un survivant",
      "Entretien de son fils",
      "Entretien de sa fille",
      "Entretien de sa petite-fille"
    ],
    "units": [
      "Régiment du Middlesex",
      "Marine royale",
      "Royal Scots",
      "Artillerie royale",
      "Corps dentaire de l’armée royale",
      "1er bataillon du régiment du Middlesex"
    ],
    "open": "Ouvrir le document",
    "close": "Fermer le document",
    "original": "Texte anglais original",
    "show": "Afficher la traduction",
    "hide": "Masquer la traduction",
    "translation": "Traduction de lecture",
    "passage": "Passage",
    "previous": "Document précédent",
    "next": "Document suivant",
    "nextPassage": "Lire le passage suivant",
    "allRead": "Revenir au premier passage",
    "choose": "Choisir un document",
    "hint": "Sélectionnez un passage pour vous arrêter sur ses mots.",
    "transcript": "Transcription textuelle, sans fac-similé. L’orthographe et la grammaire fournies sont conservées ; les traductions aident à la lecture.",
    "sourcePending": "Extrait transcrit · Source originale à compléter",
    "related": "Archives orales associées",
    "relatedNote": "Le lien associé ne constitue pas une vérification mot à mot de cet extrait.",
    "note": "Les personnes non nommées sont identifiées par leur lien familial. Les souvenirs des témoins sont des extraits de récits oraux.",
    "closed": "Ouvrir un document et lire les mots qu’ils ont laissés.",
    "reading": "Lire un document",
    "ranks": [
      "Soldat",
      "Télégraphiste",
      "Sergent-major",
      "Sergent",
      "Maître canonnier",
      "Artilleur"
    ]
  },
  "ko": {
    "nav": "편지와 기억",
    "eyebrow": "남겨진 목소리",
    "title": "그들의 말은 여기에 남아 있다.",
    "intro": "형제에게 쓴 편지. 선창의 기억. 아버지가 돌아오기를 기다렸던 어린 시절.",
    "categories": [
      "모든 기록",
      "편지",
      "생존자의 기억",
      "후손 인터뷰"
    ],
    "relations": [
      "형제 Gerald Penny에게",
      "생존자의 회상",
      "아들의 인터뷰",
      "딸의 인터뷰",
      "손녀의 인터뷰"
    ],
    "units": [
      "미들섹스 연대",
      "왕립 해군",
      "로열 스코츠 연대",
      "왕립 포병대",
      "왕립 육군 치과 군단",
      "미들섹스 연대 제1대대"
    ],
    "open": "기록 열기",
    "close": "기록 닫기",
    "original": "영어 원문",
    "show": "번역 보기",
    "hide": "번역 숨기기",
    "translation": "읽기용 번역",
    "passage": "문단",
    "previous": "이전 기록",
    "next": "다음 기록",
    "nextPassage": "다음 문단 읽기",
    "allRead": "첫 문단으로",
    "choose": "기록 선택",
    "hint": "원문 문단을 눌러 그 말에 잠시 머물러 보세요.",
    "transcript": "원본 이미지가 아닌 문자 전사입니다. 제공된 철자와 문법을 유지하며 번역은 이해를 돕습니다.",
    "sourcePending": "전사 발췌 · 원출처 확인 필요",
    "related": "관련 구술사 기록",
    "relatedNote": "관련 기록 링크는 이 발췌문이 단어별로 검증되었음을 뜻하지 않습니다.",
    "note": "이름이 없는 화자는 가족 관계로 표시합니다. 생존자 자료는 구술 회상의 발췌문입니다.",
    "closed": "기록을 열고 그들이 남긴 말을 읽어 보세요.",
    "reading": "기록 읽기",
    "ranks": [
      "이등병",
      "통신병",
      "상사",
      "중사",
      "포술장",
      "포병"
    ]
  }
};
export const archivePassageTranslations: Record<Exclude<Locale,"en">,string[][]> = {
 ...archivePassageNewTranslations,
  "zh": [
    [
      "亲爱的 Gerald：谢谢你的来信。我能对你说的不多，只有这一点：",
      "永远爱你的母亲，好好照顾她。她是你唯一、也是最好的母亲。",
      "爱你的兄弟，Richard。"
    ],
    [
      "此刻还算安全。",
      "但水正不断涌进来，我们撑不了太久了。"
    ],
    [
      "我们紧紧挤在一起，就在船舱最底部。",
      "那里是污水汇集的地方。所以我们",
      "几乎是在污水里游泳。"
    ],
    [
      "很多人病得很重。",
      "干性糙皮病会影响你的整个身体。"
    ],
    [
      "父亲去世时，我九岁。这个消息是母亲告诉我的。",
      "红十字会会给在香港的战俘寄包裹。",
      "日本人会当着战俘的面把包裹烧掉。"
    ],
    [
      "我的父亲 William Arthur Barlow 是皇家炮兵的军士长，不幸在里斯本丸号上遇难。我不得不在没有父亲的日子里长大。"
    ],
    [
      "我相信父亲非常爱我。",
      "我一直以为爸爸会回家，可他没有。",
      "不知道究竟发生了什么，在没有父亲的日子里度过童年，那是一个巨大的问号。"
    ],
    [
      "我对父亲的记忆很少。",
      "战争带来的不只是战场上的杀戮，还有家庭永远承受的后果。"
    ],
    [
      "我的父亲失去他的爸爸，也就是我的祖父时，只有七岁。",
      "从此，他心里一直有一个缺口，因为他再也没有爸爸了。"
    ]
  ],
  "ja": [
    [
      "親愛なる Gerald へ。手紙をありがとう。君に言えることは多くない。ただ一つだけ。",
      "いつもお母さんを愛し、大切にしてほしい。君にとって唯一の、最高のお母さんなのだから。",
      "愛を込めて。君の兄弟 Richard より。"
    ],
    [
      "今のところは、比較的安全だ。",
      "でも水が流れ込んでいる。もう長くは持たない。"
    ],
    [
      "私たちは身を寄せ合い、船倉の一番底にいた。",
      "そこには汚水が全部たまっていた。だから私たちは",
      "ほとんど汚水の中を泳いでいた。"
    ],
    [
      "多くの仲間がひどく病んでいた。",
      "乾性ペラグラは全身に影響した。"
    ],
    [
      "父が亡くなったとき、私は九歳だった。母から知らせを聞いた。",
      "赤十字は香港の捕虜たちへ小包を送っていた。",
      "日本側は捕虜たちの目の前で、それを焼いていた。"
    ],
    [
      "父 William Arthur Barlow は王立砲兵隊の曹長だった。リスボン丸で亡くなり、私は父のいないまま育たなければならなかった。"
    ],
    [
      "父は私を心から愛してくれていたと思う。",
      "ずっと、パパは帰ってくると思っていた。でも帰ってこなかった。",
      "何が起きたのか分からないまま、父のいない子ども時代を過ごす。それは大きな疑問符だった。"
    ],
    [
      "父の記憶はほんのわずかしかない。",
      "戦場で起きる殺戮だけではない。家族には、その影響が永遠に残る。"
    ],
    [
      "私の父が祖父を失ったとき、まだ七歳だった。",
      "お父さんがいないことは、いつも父の心に穴を残していた。"
    ]
  ],
  "fr": [
    [
      "Cher Gerald, merci beaucoup pour ta lettre. Je n’ai pas grand-chose à te dire, sinon ceci :",
      "Aime toujours ta mère et prends soin d’elle. Elle est la seule et la meilleure mère que tu auras jamais.",
      "Avec toute mon affection. Ton frère, Richard."
    ],
    [
      "Pour le moment, nous sommes relativement en sécurité.",
      "Mais l’eau entre à flots. Nous ne tiendrons plus très longtemps."
    ],
    [
      "Nous étions serrés les uns contre les autres, tout au fond de la cale.",
      "C’est là que se trouvaient toutes les eaux usées. Alors nous",
      "nagions pratiquement dedans."
    ],
    [
      "Beaucoup d’hommes étaient très malades.",
      "La pellagre sèche affectait tout le corps."
    ],
    [
      "J’avais neuf ans quand mon père est mort. C’est ma mère qui me l’a annoncé.",
      "La Croix-Rouge envoyait des colis aux prisonniers à Hong Kong.",
      "Les Japonais les brûlaient devant les prisonniers."
    ],
    [
      "Mon père, William Arthur Barlow, était sergent-major dans l’Artillerie royale. Il a malheureusement été tué à bord du Lisbon Maru. J’ai dû grandir sans mon père."
    ],
    [
      "Je croyais que mon père m’adorait.",
      "Je pensais sans cesse que papa allait rentrer, mais il n’est pas revenu.",
      "Ne pas savoir, traverser l’enfance sans son père : c’est un immense point d’interrogation."
    ],
    [
      "Mes souvenirs de mon père sont très ténus.",
      "Il n’y a pas que les morts sur le champ de bataille. Il y a les conséquences pour les familles, pour toujours."
    ],
    [
      "Mon père n’avait que sept ans lorsqu’il a perdu mon grand-père.",
      "Il gardait toujours ce vide dans son cœur : il n’avait plus son père."
    ]
  ],
  "ko": [
    [
      "Gerald에게. 편지를 보내 줘서 정말 고맙다. 네게 할 말이 많지는 않지만, 이것만은 말하고 싶다.",
      "언제나 어머니를 사랑하고 잘 돌봐 드려라. 네게는 단 한 분뿐인, 가장 좋은 어머니이시니까.",
      "사랑을 담아. 너의 형제 Richard."
    ],
    [
      "지금은 비교적 안전해.",
      "하지만 물이 쏟아져 들어오고 있어. 오래 버티지 못할 거야."
    ],
    [
      "우리는 서로 바짝 붙어 있었고, 선창의 맨 아래에 있었다.",
      "그곳에는 온갖 오수가 모여 있었다. 그래서 우리는",
      "사실상 그 안에서 헤엄치고 있었다."
    ],
    [
      "많은 사람들이 몹시 아팠다.",
      "건성 펠라그라는 온몸에 영향을 주었다."
    ],
    [
      "아버지가 돌아가셨을 때 나는 아홉 살이었다. 어머니에게서 소식을 들었다.",
      "적십자는 홍콩의 포로들에게 소포를 보내곤 했다.",
      "일본 측은 포로들이 보는 앞에서 소포를 불태웠다."
    ],
    [
      "아버지 William Arthur Barlow는 왕립 포병대의 상사였다. 불행히도 리스본 마루호에서 돌아가셨고, 나는 아버지 없이 자라야 했다."
    ],
    [
      "아버지는 나를 무척 사랑했다고 믿었다.",
      "아빠가 집으로 돌아올 거라고 계속 생각했지만, 돌아오지 않았다.",
      "무슨 일이 있었는지 모른 채 아버지 없이 어린 시절을 보내는 것은 커다란 물음표였다."
    ],
    [
      "아버지에 대한 기억은 아주 희미하다.",
      "전쟁은 전장에서의 죽음만으로 끝나지 않는다. 가족들에게는 그 결과가 영원히 남는다."
    ],
    [
      "아버지는 할아버지를 잃었을 때 겨우 일곱 살이었다.",
      "아버지가 없다는 사실은 늘 그의 마음에 빈자리로 남아 있었다."
    ]
  ]
};

export const archiveFoldTranslations: Record<Locale, {paper:string;hint:string;keyboard:string;openFold:string;closeFold:string}> = {
 ...archiveFoldNewTranslations,
  zh:{openFold:"展开下一折",closeFold:"合上一折",paper:"折页阅读",hint:"滑动展开 · 反向合上",keyboard:"在纸面滚动或上下拖动。键盘向下键展开，向上键合上；Home 全部合上，End 全部展开。"},
  en:{openFold:"Unfold the next panel",closeFold:"Fold one panel",paper:"Folded paper",hint:"Scroll to unfold · reverse to fold",keyboard:"Scroll or drag the paper vertically. Down unfolds, Up folds; Home folds all, End unfolds all."},
  ja:{openFold:"次の折り目を開く",closeFold:"一つ折りたたむ",paper:"折りたたんだ紙の閲覧",hint:"スクロールで開く · 逆方向で閉じる",keyboard:"紙の上でスクロール、または上下にドラッグ。下矢印で開く、上矢印で閉じる。Homeですべて閉じ、Endですべて開きます。"},
  fr:{openFold:"Déplier le volet suivant",closeFold:"Replier un volet",paper:"Lecture du papier plié",hint:"Défiler pour déplier · inverser pour replier",keyboard:"Faites défiler ou glissez le papier verticalement. Flèche bas : déplier ; haut : replier. Home replie tout, End déplie tout."},
  ko:{openFold:"다음 부분 펼치기",closeFold:"한 부분 접기",paper:"접힌 종이 읽기",hint:"스크롤하여 펼치기 · 반대로 접기",keyboard:"종이 위에서 스크롤하거나 위아래로 드래그하세요. 아래 화살표는 펼치기, 위 화살표는 접기. Home은 모두 접기, End는 모두 펼치기."}
};
