export interface ProofsScene {
  num: number;
  title: string;
}

export interface ProofsChapter {
  id: string;
  num: number;
  title: string;
  /** One-line hook shown on the course map. */
  hook: string;
  scenes?: ProofsScene[];
}

export interface ProofsPart {
  label: string;
  title: string;
  chapters: ProofsChapter[];
}

const ch = (num: number, title: string, hook: string, scenes?: ProofsScene[]): ProofsChapter => ({
  id: `ch${num}`,
  num,
  title,
  hook,
  scenes,
});

export const PROOFS_PARTS: ProofsPart[] = [
  {
    label: '序',
    title: '為什麼需要證明',
    chapters: [
      ch(1, '規律會騙人', '例子能推翻「所有」，卻證明不了它。', [
        { num: 1, title: '第六個點' },
        { num: 2, title: '第四十個數' },
        { num: 3, title: '對每個 n 都成立的圖' },
        { num: 4, title: '你來裁決' },
      ]),
    ],
  },
  {
    label: '一',
    title: '讀懂一句數學',
    chapters: [
      ch(2, '定義是開關，也是工具', '已知「x 是偶數」，你就拿到一個 k。', [
        { num: 1, title: '0 是偶數嗎？' },
        { num: 2, title: '3 整除 0 嗎？' },
        { num: 3, title: '你拿到一個 k' },
        { num: 4, title: '兩個名字' },
        { num: 5, title: '新定義' },
      ]),
      ch(3, '「若…則」是一個承諾', '只有一種情況算違約。', [
        { num: 1, title: '且、或、非' },
        { num: 2, title: '只有一格違約' },
        { num: 3, title: '該翻哪幾張？' },
        { num: 4, title: '不可能的前提' },
        { num: 5, title: '反過來說' },
        { num: 6, title: '兩個承諾' },
      ]),
      ch(4, '量詞是一場對手遊戲', '換了順序，就換了遊戲。', [
        { num: 1, title: '對手先出' },
        { num: 2, title: '你先出' },
        { num: 3, title: '換一個世界' },
        { num: 4, title: '藏起來的量詞' },
        { num: 5, title: '換你當對手' },
      ]),
      ch(5, '否定就是交換角色', '「不是所有」不等於「所有都不」。'),
    ],
  },
  {
    label: '二',
    title: '證明的步法',
    chapters: [
      ch(6, '目標的形狀決定第一步', '還沒想到點子，骨架已經寫好一半。'),
      ch(7, '中段：從定義走到定義', '證人是一個公式。'),
      ch(8, '逆否與反證', '把否定的目標換成可以用的已知。'),
      ch(9, '分情況與 WLOG', '情況必須蓋滿世界。'),
      ch(10, '存在、構造與唯一', '假設有兩個，證明它們相等。'),
      ch(11, '數學歸納法', '同一塊步驟，疊出每一個 n。'),
      ch(12, '最小反例', '最小的反例會自我毀滅。'),
    ],
  },
  {
    label: '三',
    title: '找到想法',
    chapters: [
      ch(13, '先特化，再推廣', '挑一個放得進腦中、又不退化的例子。'),
      ch(14, '不變量', '怎麼動都不變的量，排除不可能。'),
      ch(15, '鴿籠與極端原理', '一定有碰撞，但不說是誰。'),
      ch(16, '倒推與輔助問題', '從終點往回走。'),
    ],
  },
  {
    label: '四',
    title: '遷移到新材料',
    chapters: [
      ch(17, '集合：追元素', '相等＝雙向包含。'),
      ch(18, '函數：箭頭圖的形狀', '同一個公式，四種宣告。'),
      ch(19, '等價關係就是切分', '換代表元，答案不能變。'),
      ch(20, '無限也有大小', '任何清單都漏掉一個。'),
    ],
  },
  {
    label: '五',
    title: '自己當自己的老師',
    chapters: [
      ch(21, '錯誤證明圖鑑', '錯誤只有少數幾種模式。'),
      ch(22, '每個假設都在工作', '拿掉一個，就該找到反例。'),
      ch(23, '讀證明：壓縮成骨架', '蓋起來，還能重建嗎？'),
      ch(24, '從狀態板到文字', '讓讀者知道誰是任意的。'),
    ],
  },
  {
    label: '終',
    title: '收束',
    chapters: [
      ch(25, 'ε–N：三層量詞的總考', '對手給 ε，你回 N。'),
      ch(26, '綜合診斷', '不提示方法，你自己判斷。'),
    ],
  },
];

export const PROOFS_CHAPTERS: Record<string, ProofsChapter> = Object.fromEntries(
  PROOFS_PARTS.flatMap((p) => p.chapters).map((c) => [c.id, c]),
);

export const PROOFS_PROGRESS_PREFIX = 'proofs-';
