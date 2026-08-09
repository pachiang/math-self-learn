import { ALGEBRA_V2_PART2_LESSONS } from './algebra-v2-part2-lessons';
import { ALGEBRA_V2_PART3_LESSONS } from './algebra-v2-part3-lessons';
import { ALGEBRA_V2_PART4_LESSONS } from './algebra-v2-part4-lessons';
import { ALGEBRA_V2_PART5_LESSONS } from './algebra-v2-part5-lessons';

export type AlgebraV2ChapterId =
  | 'ch1'
  | 'ch2'
  | 'ch3'
  | 'ch4'
  | 'ch5'
  | 'ch6'
  | 'ch7'
  | 'ch8'
  | 'ch9'
  | 'ch10'
  | 'ch11'
  | 'ch12'
  | 'ch13'
  | 'ch14'
  | 'ch15'
  | 'ch16'
  | 'ch17'
  | 'ch18'
  | 'ch19'
  | 'ch20'
  | 'ch21'
  | 'ch22'
  | 'ch23'
  | 'ch24'
  | 'ch25'
  | 'ch26'
  | 'ch27'
  | 'ch28'
  | 'ch29'
  | 'ch30'
  | 'ch31'
  | 'ch32';

export type AlgebraV2ModelKind =
  | 'transform'
  | 'timeline'
  | 'mapping'
  | 'table'
  | 'diagnostic'
  | 'closure'
  | 'symbols'
  | 'network'
  | 'partition'
  | 'lattice'
  | 'cube';

export interface AlgebraV2Node {
  label: string;
  state?: 'origin' | 'active' | 'dim';
}

export interface AlgebraV2Block {
  label: string;
  items: string[];
  state?: 'active' | 'muted' | 'warning';
  level?: number;
}

export interface AlgebraV2Choice {
  label: string;
  correct: boolean;
  feedback: string;
}

export interface AlgebraV2Check {
  label: string;
  pass: boolean;
  reason: string;
}

export interface AlgebraV2Mapping {
  from: string;
  to: string;
  accent?: boolean;
}

export interface AlgebraV2Table {
  headers: string[];
  rowHeaders?: string[];
  rows: string[][];
  highlight?: [number, number];
}

export interface AlgebraV2Cube {
  axis: [number, number, number];
  angle: number;
  focus: 'vertex' | 'face' | 'none';
  focusLabel: string;
  invariant: string;
}

export interface AlgebraV2Preset {
  label: string;
  before?: string;
  after?: string;
  actions?: string[];
  formula?: string;
  detail: string;
  status: 'good' | 'bad' | 'neutral';
  rotation?: number;
  reflected?: boolean;
  showLabels?: boolean;
  mapping?: AlgebraV2Mapping[];
  checks?: AlgebraV2Check[];
  table?: AlgebraV2Table;
  tableNote?: string;
  setLabel?: string;
  operation?: string;
  output?: string;
  nodes?: AlgebraV2Node[];
  blocks?: AlgebraV2Block[];
  cube?: AlgebraV2Cube;
}

export interface AlgebraV2Lesson {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  prediction: {
    question: string;
    choices: AlgebraV2Choice[];
  };
  model: {
    kind: AlgebraV2ModelKind;
    eyebrow: string;
    title: string;
    prompt: string;
    presets: AlgebraV2Preset[];
  };
  insight: string;
  transfer: {
    question: string;
    choices: AlgebraV2Choice[];
  };
  formal: {
    title: string;
    body: string;
    notation?: string;
  };
  proof: {
    title: string;
    goal: string;
    steps: string[];
  };
  boundary: string;
}

const yesNo = (yesCorrect: boolean, yesFeedback: string, noFeedback: string): AlgebraV2Choice[] => [
  { label: '是', correct: yesCorrect, feedback: yesFeedback },
  { label: '不是', correct: !yesCorrect, feedback: noFeedback },
];

export const ALGEBRA_V2_LESSONS: Record<AlgebraV2ChapterId, AlgebraV2Lesson[]> = {
  ch1: [
    {
      id: '1.1',
      eyebrow: 'Abstract Algebra v2 · 1.1',
      title: '圖形回到原樣，不代表什麼都沒做',
      lede: '先把「現在看到的狀態」和「剛才執行的動作」分開。群論研究的主角不是一張靜止圖片，而是能作用在所有可能狀態上的 transformation。',
      prediction: {
        question: '沒有標記的正三角形旋轉 120° 後外觀相同。這和完全不動是同一個 action 嗎？',
        choices: yesNo(
          false,
          '外觀相同只告訴我們 structure 被保留，不能判斷 action 相同。',
          '對。打開頂點標記後會看見 A、B、C 被送到不同位置。',
        ),
      },
      model: {
        kind: 'transform',
        eyebrow: 'State / action separator',
        title: '固定最後外觀，切換真正執行的動作',
        prompt: '比較頂點 mapping；不要只比較輪廓。',
        presets: [
          {
            label: '完全不動',
            before: '原始狀態',
            after: '相同狀態',
            rotation: 0,
            showLabels: true,
            mapping: [
              { from: 'A', to: 'A' },
              { from: 'B', to: 'B' },
              { from: 'C', to: 'C' },
            ],
            detail: '每個頂點都留在原位置；這是 identity action。',
            status: 'neutral',
          },
          {
            label: '旋轉 120°',
            before: '原始狀態',
            after: '輪廓仍相同',
            rotation: 120,
            showLabels: true,
            mapping: [
              { from: 'A', to: 'B', accent: true },
              { from: 'B', to: 'C', accent: true },
              { from: 'C', to: 'A', accent: true },
            ],
            detail: '輪廓沒有洩漏動作，但三個標記揭露了不同的 mapping。',
            status: 'good',
          },
          {
            label: '旋轉 240°',
            before: '原始狀態',
            after: '輪廓仍相同',
            rotation: 240,
            showLabels: true,
            mapping: [
              { from: 'A', to: 'C', accent: true },
              { from: 'B', to: 'A', accent: true },
              { from: 'C', to: 'B', accent: true },
            ],
            detail: '這又是第三個不同 action，雖然未標記外觀仍完全相同。',
            status: 'good',
          },
        ],
      },
      insight: 'State 說「現在在哪裡」；action 說「每個可能位置被送到哪裡」。',
      transfer: {
        question: '時鐘指針最後回到 12，能否因此推出它從未移動？',
        choices: yesNo(
          false,
          '同一 state 可能由不動、轉一圈或多圈抵達。',
          '正確。最後 state 無法單獨辨認完整 action。',
        ),
      },
      formal: {
        title: 'Transformation 是 state space 到自身的函數',
        body: '一個 transformation 必須對每個可能 state 指定唯一 output。兩個 transformations 相等，表示它們對每個 input state 都給出相同 output。',
        notation: 'T:S\to S',
      },
      proof: {
        title: '如何證明兩個 actions 不同？',
        goal: '找出至少一個 input，使兩個 actions 的 outputs 不同。',
        steps: [
          '選取帶有標記的 state A。',
          'identity 把 A 送到 A。',
          '120° rotation 把 A 送到 B。',
          '因為 outputs 不同，兩個 functions 不相等。',
        ],
      },
      boundary:
        '只看單一 input 得到相同 output，不能證明兩個 functions 相等；但找到一個不同 output，就足以證明它們不相等。',
    },
    {
      id: '1.2',
      eyebrow: 'Abstract Algebra v2 · 1.2',
      title: '一個 action 必須管整個可能世界',
      lede: '「A 被送到 B」只是一條線索，還不是完整 transformation。要知道一個動作，就要知道每個 possible state 的去向。',
      prediction: {
        question: '只知道頂點 A 被送到 B，是否已足以辨認一個三角形 symmetry？',
        choices: yesNo(
          false,
          '還有其他頂點的去向沒有指定；一支箭頭不是完整 mapping。',
          '對。必須把 A、B、C 的 outputs 全部補完。',
        ),
      },
      model: {
        kind: 'mapping',
        eyebrow: 'Mapping builder',
        title: '從一條線索補成完整 action',
        prompt: '切換候選 mapping，觀察「完整」和「保留結構」是兩道不同檢查。',
        presets: [
          {
            label: '只有 A → B',
            mapping: [
              { from: 'A', to: 'B', accent: true },
              { from: 'B', to: '?' },
              { from: 'C', to: '?' },
            ],
            checks: [
              { label: '每個 input 有 output', pass: false, reason: 'B、C 尚未指定。' },
              { label: '沒有重複占位', pass: false, reason: '資料不足，還不能判斷。' },
            ],
            detail: '這只是 partial information，不能拿來合成或比較完整 actions。',
            status: 'bad',
          },
          {
            label: '完整 rotation',
            mapping: [
              { from: 'A', to: 'B', accent: true },
              { from: 'B', to: 'C', accent: true },
              { from: 'C', to: 'A', accent: true },
            ],
            checks: [
              { label: '每個 input 有 output', pass: true, reason: '三個頂點都有去向。' },
              { label: '保留 triangle structure', pass: true, reason: '鄰接與距離都被保留。' },
            ],
            detail: '完整 mapping 才是一個可被重複執行的 action。',
            status: 'good',
          },
          {
            label: '完整但撞在一起',
            mapping: [
              { from: 'A', to: 'B', accent: true },
              { from: 'B', to: 'B', accent: true },
              { from: 'C', to: 'A' },
            ],
            checks: [
              { label: '每個 input 有 output', pass: true, reason: 'mapping 已完整。' },
              {
                label: '保留 triangle structure',
                pass: false,
                reason: 'A、B 同時落到 B，資訊被壓扁。',
              },
            ],
            detail: '完整 function 不一定是 symmetry；還要檢查它是否保留指定結構。',
            status: 'bad',
          },
        ],
      },
      insight: 'Action 是整張 input-output 對應表，不是一支孤立箭頭。',
      transfer: {
        question: '描述洗三張卡時，只說「第一張移到最後」就一定足夠嗎？',
        choices: yesNo(
          false,
          '還必須知道其餘卡片怎麼移動，才能得到完整 shuffle。',
          '對；action 必須決定每張卡的 destination。',
        ),
      },
      formal: {
        title: '完整性和可逆性是不同條件',
        body: 'Function 要求每個 input 恰有一個 output；symmetry 還要求 structure 被保留，且通常是一個 bijection。',
        notation: 'f(x)\text{ 對每個 }x\in S\text{ 都必須被定義}',
      },
      proof: {
        title: '用 mapping 證明 rotation 可逆',
        goal: '說明每個 output 都恰好來自一個 input。',
        steps: [
          '列出 A→B、B→C、C→A。',
          '檢查 A、B、C 各出現一次。',
          '反向讀取 B→A、C→B、A→C。',
          '反向 mapping 是另一個完整 action。',
        ],
      },
      boundary:
        '一個完整 function 可以把兩個 inputs 壓到同一 output；那會遺失資訊，因此不一定能成為 group action。',
    },
    {
      id: '1.3',
      eyebrow: 'Abstract Algebra v2 · 1.3',
      title: 'Symmetry 保留的是指定結構',
      lede: 'Symmetry 並不是「任何東西都沒有改變」。我們先決定哪些關係重要，再問 transformation 是否保留它們。',
      prediction: {
        question: '正方形旋轉 90° 後，是否永遠算 symmetry？',
        choices: yesNo(
          false,
          '要看我們要求保留什麼；若某個角被指定為固定入口，旋轉就破壞了結構。',
          '正確。symmetry 是相對於指定 structure 的判斷。',
        ),
      },
      model: {
        kind: 'diagnostic',
        eyebrow: 'Structure layers',
        title: '固定同一個 90° rotation，只改變要保留的資料',
        prompt: 'action 不變；變的是我們對 structure 的要求。',
        presets: [
          {
            label: '只有方形輪廓',
            checks: [
              { label: '邊長', pass: true, reason: '四條邊仍等長。' },
              { label: '鄰接關係', pass: true, reason: '相鄰角仍相鄰。' },
              { label: '指定角落', pass: true, reason: '目前沒有指定角落。' },
            ],
            detail: '所有被要求的 structure 都保留，所以 rotation 是 symmetry。',
            status: 'good',
          },
          {
            label: '四角有 A/B/C/D',
            checks: [
              { label: '方形輪廓', pass: true, reason: '幾何外形保留。' },
              { label: '標記位置', pass: false, reason: 'A 被送到 B 的位置。' },
              { label: '完整標記圖案', pass: false, reason: '標記後的物件不再相同。' },
            ],
            detail: '相同 rotation 對無標記方形是 symmetry，對固定標記方形卻不是。',
            status: 'bad',
          },
          {
            label: '四角同色',
            checks: [
              { label: '方形輪廓', pass: true, reason: '外形保留。' },
              { label: '顏色配置', pass: true, reason: '每個角落仍呈現相同顏色。' },
              { label: '指定結構', pass: true, reason: '旋轉前後無法區分。' },
            ],
            detail: '標記是否破壞 symmetry，取決於標記本身是否也被保留。',
            status: 'good',
          },
        ],
      },
      insight: 'Symmetry 允許位置改變；它要求指定的 structure 不被破壞。',
      transfer: {
        question: '棋盤旋轉 180° 後，若黑白格配置相同，它可以是棋盤的 symmetry 嗎？',
        choices: yesNo(
          true,
          '可以；位置變了，但格子的鄰接與黑白配置都被保留。',
          '位置改變不會自動排除 symmetry；要檢查的是結構。',
        ),
      },
      formal: {
        title: 'Symmetry 是 structure-preserving bijection',
        body: '不同領域指定的 structure 不同：幾何可能保留距離，graph 保留 adjacency，代數結構則保留 operation。',
      },
      proof: {
        title: '如何驗證一個 graph symmetry？',
        goal: '檢查重新標號前後的 adjacency 完全一致。',
        steps: [
          '列出原 graph 的 edges。',
          '把每個 vertex 依 mapping 重新命名。',
          '逐條檢查 image edge 仍存在。',
          '反向 mapping 也保留 edges，故為 symmetry。',
        ],
      },
      boundary:
        '「看起來很像」不是數學條件。必須先說清楚要保留的 relation、distance、coloring 或 operation。',
    },
    {
      id: '1.4',
      eyebrow: 'Abstract Algebra v2 · 1.4',
      title: '幾何只是 action world 的一個入口',
      lede: '三角形 rotation、時鐘加法與 card shuffle 表面不同，但若重複一次 action 都沿三個 states 循環，它們可能共享同一個結構。',
      prediction: {
        question: '「時鐘數字加 1」沒有移動幾何圖形，所以不能用群論研究嗎？',
        choices: yesNo(
          false,
          '群論只需要可合成的 actions；幾何移動不是必要條件。',
          '正確。數值更新也能形成 action world。',
        ),
      },
      model: {
        kind: 'timeline',
        eyebrow: 'Three worlds, one rhythm',
        title: '重複同一個 action，觀察共同週期',
        prompt: '每個 preset 都做三次；表面表示改變，action rhythm 不變。',
        presets: [
          {
            label: '三角形',
            before: 'A 在上方',
            actions: ['旋轉 120°', '旋轉 120°', '旋轉 120°'],
            after: 'A 回到上方',
            formula: 'r³ = e',
            detail: '三次 rotation 回到起始 state。',
            status: 'good',
          },
          {
            label: '模 3 時鐘',
            before: '0',
            actions: ['+1', '+1', '+1'],
            after: '0',
            formula: '1+1+1 ≡ 0 (mod 3)',
            detail: '數字更新也形成相同的三步循環。',
            status: 'good',
          },
          {
            label: '三張卡',
            before: 'ABC',
            actions: ['左移一格', '左移一格', '左移一格'],
            after: 'ABC',
            formula: '(ABC)³ = e',
            detail: 'card shuffle 的 state graph 和前兩個世界相同。',
            status: 'good',
          },
        ],
      },
      insight: '群論研究 actions 的合成骨架，不要求 actions 一定是幾何運動。',
      transfer: {
        question: '把 RGB 色彩通道循環換位，也可能和三角形 rotation 共享三步結構嗎？',
        choices: yesNo(
          true,
          '是；若三次循環回原配置，它具有相同的 action rhythm。',
          '群論比較的是合成結構，不是物件材質。',
        ),
      },
      formal: {
        title: 'Representation 可以不同，composition pattern 可以相同',
        body: '我們暫時只觀察三步循環。完整的「結構相同」會在 isomorphism 章正式定義。',
        notation: '\{e,r,r^2\}\quad\leftrightarrow\quad\{0,1,2\}',
      },
      proof: {
        title: '如何比較兩個三步世界？',
        goal: '建立一個配對，使做一次 action 前後都能對齊。',
        steps: [
          '配對 e↔0、r↔1、r²↔2。',
          '檢查每個 state 做一次後的 destination。',
          '兩側都沿三週期前進。',
          '因此目前觀察到的 composition pattern 一致。',
        ],
      },
      boundary: '週期相同只是結構相同的線索，不足以比較更大的群；之後仍要檢查所有 compositions。',
    },
  ],
  ch2: [
    {
      id: '2.1',
      eyebrow: 'Abstract Algebra v2 · 2.1',
      title: '兩個 actions 可以壓成一個總效果',
      lede: 'Group operation 並不是突然出現的乘法。它只是把「先做一個動作，再做另一個」壓成一個 composite action。',
      prediction: {
        question: '先旋轉 120°，再旋轉 120°，總效果仍能視為一個 action 嗎？',
        choices: yesNo(
          true,
          '是；總效果就是旋轉 240°。',
          '連續 transformations 的總效果仍是一個 transformation。',
        ),
      },
      model: {
        kind: 'timeline',
        eyebrow: 'Composition compressor',
        title: '把 action sequence 壓成一張 composite chip',
        prompt: '切換兩步 sequence，觀察總效果而不是只數步數。',
        presets: [
          {
            label: 'r 接 r',
            before: 'A 在上方',
            actions: ['r · 120°', 'r · 120°'],
            after: 'A 到左下',
            formula: 'r ∘ r = r²',
            detail: '兩張 r chips 可壓成一張 r² chip。',
            status: 'good',
          },
          {
            label: 'r² 接 r',
            before: 'A 在上方',
            actions: ['r² · 240°', 'r · 120°'],
            after: 'A 回上方',
            formula: 'r ∘ r² = e',
            detail: '總轉角 360°，composite 是 identity。',
            status: 'good',
          },
          {
            label: '反射接反射',
            before: '帶方向三角形',
            actions: ['沿同一軸反射 s', '再次反射 s'],
            after: '回到原狀態',
            formula: 's ∘ s = e',
            detail: '兩次相同 reflection 的總效果是不動。',
            status: 'good',
          },
        ],
      },
      insight: '群的乘法，是把 action sequence 壓成它的總效果。',
      transfer: {
        question: '兩個 card shuffles 連續執行後，總效果也能記成一個 shuffle 嗎？',
        choices: yesNo(
          true,
          '可以；對每張卡追蹤兩步後的 destination，就得到 composite shuffle。',
          '只要兩步都是完整 transformations，連續執行仍是完整 transformation。',
        ),
      },
      formal: {
        title: 'Composition 的方向必須約定清楚',
        body: '本課以 action timeline 的左到右表示執行順序；正式函數記號中 `(g∘f)(x)=g(f(x))` 表示先做 f 再做 g。',
        notation: '(g\circ f)(x)=g(f(x))',
      },
      proof: {
        title: '如何算 composite mapping？',
        goal: '逐一追蹤每個 input 經過兩個 mappings 的 destination。',
        steps: [
          '選一個 input x。',
          '先找 f(x)。',
          '再找 g(f(x))。',
          '對所有 inputs 重複，就得到完整 g∘f。',
        ],
      },
      boundary:
        '不同教材可能採不同乘法方向。方向本身可以約定，但同一課內必須保持一致並讓 action timeline 可見。',
    },
    {
      id: '2.2',
      eyebrow: 'Abstract Algebra v2 · 2.2',
      title: '同樣兩個 actions，換順序可能換世界',
      lede: '數字加法讓我們習慣交換順序，但 transformations 沒有這個保證。先旋轉再反射，可能和先反射再旋轉抵達不同 state。',
      prediction: {
        question: 'rotation r 和 reflection s 各做一次，交換順序後總效果一定相同嗎？',
        choices: yesNo(
          false,
          '非交換正是許多 symmetry groups 的核心現象。',
          '正確。相同 action chips 的排列順序可能改變 composite。',
        ),
      },
      model: {
        kind: 'timeline',
        eyebrow: 'Order comparator',
        title: '兩條 timeline 只交換 action 順序',
        prompt: 'actions 相同；唯一變數是左右順序。',
        presets: [
          {
            label: '先 r，再 s',
            before: 'A 上、B 右下、C 左下',
            actions: ['rotate r', 'reflect s'],
            after: 'A 左下、B 上、C 右下',
            formula: 's ∘ r',
            detail: '先 rotation 改變了 reflection 接下來作用的位置。',
            status: 'neutral',
          },
          {
            label: '先 s，再 r',
            before: 'A 上、B 右下、C 左下',
            actions: ['reflect s', 'rotate r'],
            after: 'A 右下、B 左下、C 上',
            formula: 'r ∘ s',
            detail: 'final mapping 與上一條 timeline 不同。',
            status: 'bad',
          },
          {
            label: '兩次 rotations',
            before: 'A 在上方',
            actions: ['rotate 120°', 'rotate 240°'],
            after: 'A 回上方',
            formula: 'r·r² = r²·r = e',
            detail: '某些 pairs 仍會 commute；非交換不代表每一對都失敗。',
            status: 'good',
          },
        ],
      },
      insight: 'Action sequence 的順序是資料的一部分；不能靠數字乘法的習慣擅自交換。',
      transfer: {
        question: '「向前走一步」與「向右轉」交換順序，機器人會到同一位置嗎？',
        choices: yesNo(
          false,
          '轉向會改變下一步前進方向，所以 destinations 不同。',
          '正確；這是非交換 action 的日常版本。',
        ),
      },
      formal: {
        title: 'Commutative／abelian 是額外性質',
        body: '若所有 a、b 都滿足 ab=ba，群才稱為 commutative 或 abelian。群的基本定義本身不要求交換律。',
        notation: 'ab=ba\quad\text{for all }a,b\in G',
      },
      proof: {
        title: '如何證明一個群不是 abelian？',
        goal: '找到一對 elements，使交換順序後的 outputs 不同。',
        steps: [
          '選擇 rotation r 與 reflection s。',
          '算出 sr 對頂點 A 的 output。',
          '算出 rs 對同一頂點 A 的 output。',
          'outputs 不同，所以 sr≠rs。',
        ],
      },
      boundary: '找到幾對會 commute 不能證明整個群 abelian；但找到一對不 commute 就能推翻。',
    },
    {
      id: '2.3',
      eyebrow: 'Abstract Algebra v2 · 2.3',
      title: 'Cayley table 是 action machine 的查詢表',
      lede: '每一格都回答同一個問題：row action 和 column action 合成後，總效果是哪個已知 element？表格不是另一套知識。',
      prediction: {
        question: '在模 3 加法中，row=2、column=2 的結果會留在 {0,1,2} 裡嗎？',
        choices: yesNo(
          true,
          '2+2≡1 (mod 3)，結果仍是同一世界中的 element。',
          '模 3 會把 4 繞回 1；table cell 不會掉出集合。',
        ),
      },
      model: {
        kind: 'table',
        eyebrow: 'Composition lookup',
        title: '點選不同 pair，讓 table cell 對回 action sequence',
        prompt: 'row 是第一個 action，column 是接著執行的 action。',
        presets: [
          {
            label: 'e 接 r',
            formula: 'e · r = r',
            table: {
              headers: ['e', 'r', 'r²'],
              rows: [
                ['e', 'r', 'r²'],
                ['r', 'r²', 'e'],
                ['r²', 'e', 'r'],
              ],
              highlight: [0, 1],
            },
            detail: '不動再 rotation，總效果仍是 rotation。',
            status: 'neutral',
          },
          {
            label: 'r 接 r',
            formula: 'r · r = r²',
            table: {
              headers: ['e', 'r', 'r²'],
              rows: [
                ['e', 'r', 'r²'],
                ['r', 'r²', 'e'],
                ['r²', 'e', 'r'],
              ],
              highlight: [1, 1],
            },
            detail: '兩次 120° rotation 壓成 r²。',
            status: 'good',
          },
          {
            label: 'r² 接 r',
            formula: 'r² · r = e',
            table: {
              headers: ['e', 'r', 'r²'],
              rows: [
                ['e', 'r', 'r²'],
                ['r', 'r²', 'e'],
                ['r²', 'e', 'r'],
              ],
              highlight: [2, 1],
            },
            detail: '240° 再 120° 回到 identity。',
            status: 'good',
          },
        ],
      },
      insight: 'Cayley table 把所有兩步 action sequences 的總效果收進一張圖。',
      transfer: {
        question: 'Cayley table 的一格可以只靠 row label 判定嗎？',
        choices: yesNo(
          false,
          'cell 同時依賴 row 與 column，也就是一對 inputs。',
          '正確；operation 接收兩個 elements。',
        ),
      },
      formal: {
        title: 'Binary operation 是 G×G 到 G 的 mapping',
        body: 'table 的 rows 與 columns 列出兩個 inputs，cell 是 operation output。方向約定必須寫在表旁。',
        notation: '\cdot:G\times G\to G',
      },
      proof: {
        title: '如何從 table 找 identity？',
        goal: '找到一個 row 與 column 都完整複製 headers 的 element。',
        steps: [
          '查看 e row：e·x 是否都等於 x。',
          '查看 e column：x·e 是否都等於 x。',
          '兩側都成立才是 two-sided identity。',
          '在表中 e 是唯一符合者。',
        ],
      },
      boundary:
        '一張每格都有符號的 square table 不一定是 group table；之後還要檢查 identity、inverse 與 associativity。',
    },
  ],
  ch3: [
    {
      id: '3.1',
      eyebrow: 'Abstract Algebra v2 · 3.1',
      title: 'Identity 對整個世界都不做改變',
      lede: '某個 action 剛好固定一個 state，不代表它是 identity。Identity 必須讓每個 possible state 都保持原樣。',
      prediction: {
        question: '一個 reflection 固定三角形頂點 A。它因此就是 identity 嗎？',
        choices: yesNo(
          false,
          '它雖固定 A，卻交換 B、C；identity 必須固定所有 states。',
          '正確。局部不動不等於整個 transformation 不動。',
        ),
      },
      model: {
        kind: 'mapping',
        eyebrow: 'Identity inspector',
        title: '不要只測一個 state',
        prompt: '比較候選 action 對 A、B、C 的完整 mapping。',
        presets: [
          {
            label: 'identity e',
            mapping: [
              { from: 'A', to: 'A', accent: true },
              { from: 'B', to: 'B', accent: true },
              { from: 'C', to: 'C', accent: true },
            ],
            checks: [{ label: '固定所有 states', pass: true, reason: '每個 input 都回到自己。' }],
            detail: 'e 對任何 state 都沒有可觀察改變。',
            status: 'good',
          },
          {
            label: 'reflection s',
            mapping: [
              { from: 'A', to: 'A' },
              { from: 'B', to: 'C', accent: true },
              { from: 'C', to: 'B', accent: true },
            ],
            checks: [{ label: '固定所有 states', pass: false, reason: 'B、C 被交換。' }],
            detail: '固定一個頂點只表示這個 state 位於 reflection axis 上。',
            status: 'bad',
          },
          {
            label: 'rotation r',
            mapping: [
              { from: 'A', to: 'B', accent: true },
              { from: 'B', to: 'C', accent: true },
              { from: 'C', to: 'A', accent: true },
            ],
            checks: [{ label: '固定所有 states', pass: false, reason: '沒有頂點留在原位。' }],
            detail: 'rotation 明顯不是 identity，但它仍是合法 symmetry。',
            status: 'bad',
          },
        ],
      },
      insight: 'Identity 不是「這次看起來沒變」；它對整個 state space 都不做改變。',
      transfer: {
        question: '矩陣只固定一條向量，就能稱為 identity matrix 嗎？',
        choices: yesNo(
          false,
          'identity matrix 必須固定空間中的每個向量。',
          '正確；固定一條線可能只是 eigenvector 現象。',
        ),
      },
      formal: {
        title: 'Two-sided identity',
        body: 'Element e 必須對所有 a 同時滿足 e·a=a 與 a·e=a。只滿足某個 element 或單側條件還不夠。',
        notation: 'ea=a=ae\quad\text{for every }a\in G',
      },
      proof: {
        title: 'Identity 為什麼唯一？',
        goal: '假設 e、f 都是 identity，證明 e=f。',
        steps: [
          '因為 f 是 right identity，所以 e·f=e。',
          '因為 e 是 left identity，所以 e·f=f。',
          '同一個 e·f 同時等於 e 與 f。',
          '因此 e=f。',
        ],
      },
      boundary:
        '某個 action 可以固定部分 states；那些 fixed points 很重要，但它們屬於 stabilizer 的問題，不是 identity definition。',
    },
    {
      id: '3.2',
      eyebrow: 'Abstract Algebra v2 · 3.2',
      title: 'Inverse 撤銷的是整個 transformation',
      lede: 'Undo 不能只把一張圖片碰巧送回去。真正的 inverse 必須在所有 states 上，把原 action 前後都完整抵銷成 identity。',
      prediction: {
        question: 'rotation 120° 的 inverse 一定寫成負數嗎？',
        choices: yesNo(
          false,
          'inverse 是另一個 action；在三角形群裡它是 rotation 240°。',
          '正確。負號與倒數只是某些群中的表示方式。',
        ),
      },
      model: {
        kind: 'timeline',
        eyebrow: 'Undo tester',
        title: '把候選 undo 接在原 action 後面',
        prompt: 'final composite 必須是 identity，而不只是外觀偶然相同。',
        presets: [
          {
            label: 'r 後接 r²',
            before: '任意 triangle state',
            actions: ['r · 120°', 'r² · 240°'],
            after: '原 state',
            formula: 'r·r⁻¹ = r·r² = e',
            detail: 'r² 對所有 triangle states 都能撤銷 r。',
            status: 'good',
          },
          {
            label: 's 後接 s',
            before: '任意 triangle state',
            actions: ['reflection s', 'reflection s'],
            after: '原 state',
            formula: 's⁻¹ = s',
            detail: '有些 actions 是自己的 inverse。',
            status: 'good',
          },
          {
            label: 'r 後接 r',
            before: 'A 在上方',
            actions: ['r · 120°', 'r · 120°'],
            after: 'A 在左下',
            formula: 'r·r = r² ≠ e',
            detail: '再做一次相同 rotation 不會撤銷；它把轉角累積到 240°。',
            status: 'bad',
          },
        ],
      },
      insight: 'Inverse 是能在 action 前後都把總效果還原成 identity 的 transformation。',
      transfer: {
        question: '「加 5」在整數加法世界中的 inverse 是「減 5」嗎？',
        choices: yesNo(
          true,
          '是；兩個 updates 合成後總位移為 0，也就是 additive identity。',
          '加 5 與加 −5 的總效果是加 0。',
        ),
      },
      formal: {
        title: 'Two-sided inverse',
        body: '對每個 a，必須存在 a⁻¹，使 aa⁻¹=e 且 a⁻¹a=e。inverse 的符號不指定它如何計算。',
        notation: 'aa^{-1}=e=a^{-1}a',
      },
      proof: {
        title: 'Inverse 為什麼唯一？',
        goal: '若 b、c 都是 a 的 inverse，證明 b=c。',
        steps: [
          '寫 b=b·e。',
          '以 a·c=e 代入，得 b=b·(a·c)。',
          '用 associativity 改寫為 (b·a)·c。',
          '因 b·a=e，所以結果為 e·c=c。',
        ],
      },
      boundary:
        '沒有 associativity 時，上述唯一性 proof 的重新分組可能失敗；這預告了下一章為何要單獨處理括號。',
    },
    {
      id: '3.3',
      eyebrow: 'Abstract Algebra v2 · 3.3',
      title: 'Cancellation 是兩邊執行同一個 undo',
      lede: '從 ax=ay 得到 x=y，不是把字母 a 擦掉。真正發生的是：在等式兩側接上相同 inverse，讓共同 action 折返。',
      prediction: {
        question: '在非交換群中，ax=ay 時可以把 a⁻¹ 接在等式右側來消去 a 嗎？',
        choices: yesNo(
          false,
          'a 在左側，inverse 也必須從左側接近它；不能穿過 x、y。',
          '正確。side 是 action order 的一部分。',
        ),
      },
      model: {
        kind: 'timeline',
        eyebrow: 'Cancellation playback',
        title: '選擇 inverse 要接在哪一側',
        prompt: '觀察 a⁻¹ 是否真的能和 a 相鄰。',
        presets: [
          {
            label: '左側接 a⁻¹',
            before: 'a·x = a·y',
            actions: ['左乘 a⁻¹', '重新分組', 'a⁻¹a → e'],
            after: 'x = y',
            formula: 'a⁻¹(ax)=a⁻¹(ay)',
            detail: 'inverse 與共同前綴相鄰，因此可以折返。',
            status: 'good',
          },
          {
            label: '右側接 a⁻¹',
            before: 'a·x = a·y',
            actions: ['右乘 a⁻¹'],
            after: 'a·x·a⁻¹ = a·y·a⁻¹',
            formula: '(ax)a⁻¹=(ay)a⁻¹',
            detail: 'a⁻¹ 被 x、y 隔開，沒有任何共同 pair 可以消去。',
            status: 'bad',
          },
          {
            label: '右 cancellation',
            before: 'x·a = y·a',
            actions: ['右乘 a⁻¹', 'a·a⁻¹ → e'],
            after: 'x = y',
            formula: '(xa)a⁻¹=(ya)a⁻¹',
            detail: '共同後綴要從右側撤銷。',
            status: 'good',
          },
        ],
      },
      insight: 'Cancellation 的力量來自可逆性與正確的作用側，不是符號位置上的刪除。',
      transfer: {
        question: '若可逆矩陣 A 滿足 AX=AY，能推出 X=Y 嗎？',
        choices: yesNo(true, '可以；在兩側左乘 A⁻¹。', 'A 可逆正是 cancellation 所需的 undo。'),
      },
      formal: {
        title: 'Left 與 right cancellation',
        body: '群中 ax=ay 推出 x=y；xa=ya 也推出 x=y。兩個 proof 使用 inverse 的側不同，不需要 commutativity。',
        notation: 'ax=ay\Rightarrow x=y,\qquad xa=ya\Rightarrow x=y',
      },
      proof: {
        title: '左消去律逐步證明',
        goal: '從 ax=ay 嚴格推出 x=y。',
        steps: [
          '等式兩側左乘 a⁻¹。',
          '用 associativity 得 (a⁻¹a)x=(a⁻¹a)y。',
          '用 inverse law 把 a⁻¹a 換成 e。',
          '用 identity law 得 x=y。',
        ],
      },
      boundary:
        '對不可逆矩陣，AX=AY 可能在 X≠Y 時成立；這不是代數技巧失誤，而是 transformation 已遺失資訊。',
    },
    {
      id: '3.4',
      eyebrow: 'Abstract Algebra v2 · 3.4',
      title: '不可逆 action 會留下資訊死路',
      lede: '可逆動作可以改變世界，卻不能永久壓掉差異。刪除、投影或排序可能把多個 inputs 送到同一 output，使我們再也找不回原狀態。',
      prediction: {
        question: '「把三張卡按字母排序」能成為 card-shuffle group 的 element 嗎？',
        choices: yesNo(
          false,
          '不同排列都被送到 ABC，原排列資訊永久遺失。',
          '正確。沒有一個 universal undo 能恢復所有 inputs。',
        ),
      },
      model: {
        kind: 'mapping',
        eyebrow: 'Information loss detector',
        title: '看 arrows 是否撞進同一 output',
        prompt: '多對一 mapping 會讓 inverse 不再是 function。',
        presets: [
          {
            label: 'cyclic shuffle',
            mapping: [
              { from: 'ABC', to: 'BCA', accent: true },
              { from: 'BCA', to: 'CAB', accent: true },
              { from: 'CAB', to: 'ABC', accent: true },
            ],
            checks: [
              { label: 'outputs 不碰撞', pass: true, reason: '每個 output 有唯一來源。' },
              { label: '可反向讀取', pass: true, reason: 'inverse shuffle 完整存在。' },
            ],
            detail: '重新排列保留全部卡片與來源資訊。',
            status: 'good',
          },
          {
            label: 'alphabetical sort',
            mapping: [
              { from: 'ABC', to: 'ABC' },
              { from: 'BCA', to: 'ABC', accent: true },
              { from: 'CAB', to: 'ABC', accent: true },
            ],
            checks: [
              { label: 'outputs 不碰撞', pass: false, reason: '三個 inputs 都撞到 ABC。' },
              { label: '可反向讀取', pass: false, reason: '看到 ABC 無法知道原排列。' },
            ],
            detail: '排序是有用的 operation，但不是可逆 action。',
            status: 'bad',
          },
          {
            label: '刪掉最後一張',
            mapping: [
              { from: 'ABC', to: 'AB' },
              { from: 'ABD', to: 'AB', accent: true },
              { from: 'ABE', to: 'AB', accent: true },
            ],
            checks: [
              { label: '保留全部資料', pass: false, reason: '最後一張的資訊被刪除。' },
              { label: '存在 universal undo', pass: false, reason: 'AB 無法決定補回 C、D 或 E。' },
            ],
            detail: 'action world 出現只能進不能退的 funnel。',
            status: 'bad',
          },
        ],
      },
      insight: 'Group actions 可以重排資訊，但不能永久遺失資訊。',
      transfer: {
        question: '把平面投影到 x 軸通常可逆嗎？',
        choices: yesNo(
          false,
          '不同 y 值都映到同一 x；投影忘掉了垂直資訊。',
          '正確。投影的 fibers 含有許多不同 inputs。',
        ),
      },
      formal: {
        title: 'Group action 對應 bijection',
        body: '若 transformation 有 two-sided inverse，它必定 injective 且 surjective；反過來，集合上的 bijection 也有 inverse function。',
        notation: 'T^{-1}\circ T=\operatorname{id}=T\circ T^{-1}',
      },
      proof: {
        title: 'Inverse 如何推出 injective？',
        goal: '若 T(x)=T(y)，證明 x=y。',
        steps: [
          '假設 T(x)=T(y)。',
          '兩側套用 T⁻¹。',
          '得到 T⁻¹(T(x))=T⁻¹(T(y))。',
          'inverse law 化簡為 x=y。',
        ],
      },
      boundary:
        'Monoid 可以容納不可逆 operations；本課此刻不展開分類，只用它作為理解 group 可逆性的對照。',
    },
  ],
  ch4: [
    {
      id: '4.1',
      eyebrow: 'Abstract Algebra v2 · 4.1',
      title: '括號只決定先壓縮哪一段',
      lede: '三個 actions 的左右順序沒有變時，先把前兩個壓成 composite，或先把後兩個壓成 composite，應得到相同總效果。',
      prediction: {
        question: '從 (ab)c 改寫成 a(bc)，是否交換了 action 執行順序？',
        choices: yesNo(
          false,
          'a、b、c 的順序完全沒變；只改變先計算哪個 composite。',
          '正確。rebracket 不等於 reorder。',
        ),
      },
      model: {
        kind: 'timeline',
        eyebrow: 'Bracket switcher',
        title: '固定 a → b → c，只切換壓縮區段',
        prompt: '比較中間 chip，可以不同；最後 composite 必須相同。',
        presets: [
          {
            label: '先壓 ab',
            before: 'state x',
            actions: ['[a → b] 壓成 ab', '再接 c'],
            after: 'c(b(a(x)))',
            formula: '(ab)c',
            detail: '先計算前兩步的總效果，再和第三步合成。',
            status: 'good',
          },
          {
            label: '先壓 bc',
            before: 'state x',
            actions: ['先做 a', '[b → c] 壓成 bc'],
            after: 'c(b(a(x)))',
            formula: 'a(bc)',
            detail: '同一 input 仍依序通過 a、b、c，final output 相同。',
            status: 'good',
          },
          {
            label: '錯誤：交換 b、c',
            before: 'state x',
            actions: ['a', 'c', 'b'],
            after: 'b(c(a(x)))',
            formula: 'acb',
            detail: '這不是移動括號，而是更換 sequence；非交換世界中可能改變結果。',
            status: 'bad',
          },
        ],
      },
      insight: 'Associativity 允許重新分組同一條 action chain，不允許交換 actions。',
      transfer: {
        question: '字串串接中，(「群」+「論」)+「課」與「群」+(「論」+「課」) 相同嗎？',
        choices: yesNo(
          true,
          '兩者都得到「群論課」；只改變先完成哪一段串接。',
          '字串串接不交換，但可以重新分組。',
        ),
      },
      formal: {
        title: 'Associative law',
        body: '對所有 a、b、c，(ab)c=a(bc)。括號控制 binary operation 的 evaluation order；它不改變元素順序。',
        notation: '(ab)c=a(bc)',
      },
      proof: {
        title: '為什麼長乘積可以省略括號？',
        goal: '說明任何合法 parenthesization 都能透過 associativity 對齊。',
        steps: [
          '三個 elements 時由 axiom 直接成立。',
          '更長 sequence 可逐段移動一組括號。',
          '每一步不交換 elements。',
          '因此最後 composite 與括號選擇無關。',
        ],
      },
      boundary: '省略括號不代表可以省略順序；在 nonabelian group 中，abc 與 acb 通常不同。',
    },
    {
      id: '4.2',
      eyebrow: 'Abstract Algebra v2 · 4.2',
      title: '重新分組和交換順序是兩道測試',
      lede: 'Associative 與 commutative 回答不同問題。一個 operation 可以通過其中一項、卻在另一項失敗。',
      prediction: {
        question: '矩陣乘法通常不 commutative，所以它也不 associative 嗎？',
        choices: yesNo(
          false,
          '矩陣乘法通常不能交換，但仍可重新分組。',
          '正確。兩條性質彼此不推出。',
        ),
      },
      model: {
        kind: 'diagnostic',
        eyebrow: 'Two independent tests',
        title: '對同一 operation 分別執行 reorder 與 regroup',
        prompt: '不要用其中一項的結果猜另一項。',
        presets: [
          {
            label: '矩陣乘法',
            checks: [
              { label: 'regroup：(AB)C=A(BC)', pass: true, reason: 'composition order 不變。' },
              {
                label: 'reorder：AB=BA',
                pass: false,
                reason: '一般矩陣會得到不同 transformation。',
              },
            ],
            detail: 'associative but not commutative。',
            status: 'good',
          },
          {
            label: '整數加法',
            checks: [
              { label: 'regroup', pass: true, reason: '(a+b)+c=a+(b+c)。' },
              { label: 'reorder', pass: true, reason: 'a+b=b+a。' },
            ],
            detail: '兩項都成立，但它們仍是兩個不同事實。',
            status: 'good',
          },
          {
            label: '數字 subtraction',
            checks: [
              { label: 'regroup', pass: false, reason: '(5−3)−1=1，但 5−(3−1)=3。' },
              { label: 'reorder', pass: false, reason: '5−3≠3−5。' },
            ],
            detail: '兩項都失敗；subtraction 不會形成 group operation。',
            status: 'bad',
          },
        ],
      },
      insight: '括號問「先合成哪段」；順序問「先執行哪個 action」。',
      transfer: {
        question: '函數 composition 可以 associative 但不 commutative 嗎？',
        choices: yesNo(
          true,
          '可以；pipeline 可重新分組，但交換 functions 通常改變 output。',
          'function composition 正是兩條性質分家的典型例子。',
        ),
      },
      formal: {
        title: '兩條量詞敘述',
        body: 'Associativity 同時量化三個 elements；commutativity 量化兩個 elements。證明或反例的責任也不同。',
        notation: '(ab)c=a(bc)\qquad\text{vs.}\qquad ab=ba',
      },
      proof: {
        title: '用一個反例分別推翻性質',
        goal: '明確指出反例改的是括號還是順序。',
        steps: [
          '固定三個 numbers 5、3、1。',
          '比較 (5−3)−1 與 5−(3−1)，推翻 associativity。',
          '固定兩個 numbers 5、3。',
          '比較 5−3 與 3−5，另行推翻 commutativity。',
        ],
      },
      boundary:
        'operation table 對稱只能快速判斷 commutativity；associativity 涉及 triples，不能只看表面對稱。',
    },
    {
      id: '4.3',
      eyebrow: 'Abstract Algebra v2 · 4.3',
      title: 'Transformation composition 天生沒有括號歧義',
      lede: '若 actions 是 functions，同一 input 不論先把哪兩個 functions 打包，仍會依序通過相同 mappings。Associativity 來自執行流程本身。',
      prediction: {
        question: '把三段 function pipeline 先編譯前兩段，會改變 input 經過 functions 的順序嗎？',
        choices: yesNo(
          false,
          '只改變打包方式；input 仍依序通過 f、g、h。',
          '正確。pipeline order 保持不變。',
        ),
      },
      model: {
        kind: 'mapping',
        eyebrow: 'Pointwise tracker',
        title: '追蹤同一 input 穿過兩種 parenthesization',
        prompt: '每條路徑都依序使用 +1、×2、平方。',
        presets: [
          {
            label: '先合成前兩段',
            mapping: [
              { from: '3', to: '4 · (+1)' },
              { from: '4', to: '8 · (×2)' },
              { from: '8', to: '64 · (square)', accent: true },
            ],
            formula: '((+1) then ×2) then square',
            detail: '中間先把 +1 與 ×2 打包，output 是 64。',
            status: 'good',
          },
          {
            label: '先合成後兩段',
            mapping: [
              { from: '3', to: '4 · (+1)' },
              { from: '4', to: '8 · (×2)' },
              { from: '8', to: '64 · (square)', accent: true },
            ],
            formula: '+1 then (×2 then square)',
            detail: 'mapping path 完全相同，output 仍是 64。',
            status: 'good',
          },
          {
            label: '真的交換順序',
            mapping: [
              { from: '3', to: '9 · (square)' },
              { from: '9', to: '18 · (×2)' },
              { from: '18', to: '19 · (+1)', accent: true },
            ],
            formula: 'square then ×2 then +1',
            detail: '這次 path 改變，output 變成 19。',
            status: 'bad',
          },
        ],
      },
      insight: 'Associativity 不是硬塞的規矩；它保證同一條 action pipeline 的總效果沒有括號歧義。',
      transfer: {
        question: '資料依序經過 decode、validate、store，重新打包 functions 但不換順序會改結果嗎？',
        choices: yesNo(
          false,
          '只要各 function 相同且順序不變，composition 的 parenthesization 不改 output。',
          '正確；這就是 function composition 的 associativity。',
        ),
      },
      formal: {
        title: '以任意 input 證明 functions 相等',
        body: '兩個 functions 相等，要證明它們對每個 input x 給相同 output。',
        notation: '((h\circ g)\circ f)(x)=h(g(f(x)))=(h\circ(g\circ f))(x)',
      },
      proof: {
        title: 'Function composition 的 associativity',
        goal: '證明 (h∘g)∘f=h∘(g∘f)。',
        steps: [
          '任取 domain 中的 x。',
          '左側輸出為 (h∘g)(f(x))=h(g(f(x)))。',
          '右側輸出為 h((g∘f)(x))=h(g(f(x)))。',
          '對每個 x outputs 相同，因此 functions 相等。',
        ],
      },
      boundary:
        '這個 proof 依賴 functions 確實能依序 composition；domain/codomain 不相容時，pipeline 根本沒有定義。',
    },
  ],
  ch5: [
    {
      id: '5.1',
      eyebrow: 'Abstract Algebra v2 · 5.1',
      title: '合法 actions 合成後不能變成外來物',
      lede: 'Closure 不是圖形「封閉」或數字「不超界」。它保證 operation 對任意兩個合法 elements 都回傳同一個世界中的 element。',
      prediction: {
        question: '正整數在 subtraction 下 closed 嗎？',
        choices: yesNo(
          false,
          '例如 2−5=−3，output 掉出正整數。',
          '正確。一個 escape pair 就足以推翻 closure。',
        ),
      },
      model: {
        kind: 'closure',
        eyebrow: 'Set / operation machine',
        title: '讓 inputs 通過 operation，看 output 落在哪裡',
        prompt: '集合邊界固定；切換 input pair 尋找 escape。',
        presets: [
          {
            label: '8 − 3',
            setLabel: 'positive integers {1,2,3,…}',
            before: '8、3',
            operation: 'subtraction',
            output: '5',
            detail: '這一對留在集合內，但單一成功案例不能證明 closure。',
            status: 'neutral',
          },
          {
            label: '2 − 5',
            setLabel: 'positive integers {1,2,3,…}',
            before: '2、5',
            operation: 'subtraction',
            output: '−3',
            detail: '−3 不在 positive integers；closure 已被這個 pair 推翻。',
            status: 'bad',
          },
          {
            label: 'odd × odd',
            setLabel: 'odd integers',
            before: '5、7',
            operation: 'multiplication',
            output: '35',
            detail: '兩個 odd integers 的 product 一定是 odd；這裡有 general reason。',
            status: 'good',
          },
        ],
      },
      insight: 'Closure：只用世界裡的材料操作，結果仍留在這個世界。',
      transfer: {
        question: '所有平面 rotations 合成後仍是 rotation，因此對 composition closed 嗎？',
        choices: yesNo(
          true,
          '是；轉角相加後仍代表一個 rotation。',
          'rotation composition 不會突然變成刪除或投影。',
        ),
      },
      formal: {
        title: 'Binary operation 的 codomain 已承諾 closure',
        body: '若 `·` 真的是 G 上的 binary operation，它必須把每一對 (a,b)∈G×G 送回 G。教學上仍明列 closure，讓這項承諾可被檢查。',
        notation: '\cdot:G\times G\to G',
      },
      proof: {
        title: '如何證明 odd integers 對 multiplication closed？',
        goal: '處理任意兩個 odd integers，而非只列例子。',
        steps: [
          '任取 odd a=2m+1、b=2n+1。',
          '相乘得 ab=4mn+2m+2n+1。',
          '改寫為 2(2mn+m+n)+1。',
          '因此 ab 仍為 odd。',
        ],
      },
      boundary: '有限集合可以檢查整張 operation table；無限集合不能靠抽樣證明 closure。',
    },
    {
      id: '5.2',
      eyebrow: 'Abstract Algebra v2 · 5.2',
      title: 'Set 與 operation 必須綁在一起判斷',
      lede: '「整數是不是群？」是一個不完整問題。換掉 operation，或只換 underlying set，closure、identity 與 inverse 都可能一起改變。',
      prediction: {
        question: '非零整數在 multiplication 下是一個 group 嗎？',
        choices: yesNo(
          false,
          '雖然 closed 且有 identity，但 2 的 inverse 1/2 不在 nonzero integers。',
          '正確。不能只看集合熟不熟悉。',
        ),
      },
      model: {
        kind: 'closure',
        eyebrow: 'Two-slot system builder',
        title: '分別替換 element box 與 operation machine',
        prompt: '同一批 numbers 搭配不同 operation，能力會改變。',
        presets: [
          {
            label: 'Z with +',
            setLabel: 'integers ℤ',
            before: '−3、5',
            operation: 'addition',
            output: '2',
            checks: [
              { label: 'closed', pass: true, reason: 'integer + integer 仍是 integer。' },
              { label: '每個 element 可撤銷', pass: true, reason: 'a 的 inverse 是 −a。' },
            ],
            detail: 'ℤ 搭配 addition 形成 group。',
            status: 'good',
          },
          {
            label: 'Z with ×',
            setLabel: 'integers ℤ',
            before: '2、3',
            operation: 'multiplication',
            output: '6',
            checks: [
              { label: 'closed', pass: true, reason: 'product 仍是 integer。' },
              { label: '每個 element 可撤銷', pass: false, reason: '2 的 inverse 1/2 不在 ℤ。' },
            ],
            detail: '同一 set 換 operation 後不再是 group。',
            status: 'bad',
          },
          {
            label: 'Q\{0} with ×',
            setLabel: 'nonzero rationals ℚ∖{0}',
            before: '2、1/2',
            operation: 'multiplication',
            output: '1',
            checks: [
              { label: 'closed', pass: true, reason: 'nonzero rational product 仍非零 rational。' },
              { label: '每個 element 可撤銷', pass: true, reason: 'a/b 的 inverse 是 b/a。' },
            ],
            detail: '擴大 set 並排除 0 後，multiplication 能形成 group。',
            status: 'good',
          },
        ],
      },
      insight: '群不是一個集合；群是 underlying set 與 operation 組成的系統。',
      transfer: {
        question: '只說「2×2 matrices 是群」已經是完整敘述嗎？',
        choices: yesNo(
          false,
          '還要指定 operation，並決定是否只取 invertible matrices。',
          '正確。set 與 operation 缺一不可。',
        ),
      },
      formal: {
        title: '用 ordered pair 記錄代數結構',
        body: '常以 `(G,·)` 強調同一 set 搭配不同 operations 是不同 structures。必要時還要指定多個 operations。',
        notation: '(G,\cdot)',
      },
      proof: {
        title: '驗證非零有理數乘法的 inverse',
        goal: '對任意 nonzero rational 找到仍在集合內的 inverse。',
        steps: [
          '任取 q=a/b≠0。',
          'a、b 都非零。',
          '候選 inverse 是 b/a，仍為 nonzero rational。',
          'q·(b/a)=1，因此 inverse 存在。',
        ],
      },
      boundary: '把 0 放進乘法世界會破壞 inverse；移除 0 後才可能得到 multiplicative group。',
    },
    {
      id: '5.3',
      eyebrow: 'Abstract Algebra v2 · 5.3',
      title: 'Closure 是全域承諾，不是抽樣結果',
      lede: '「任意 pair 都留在集合」是一個 universal statement。證明它需要 general reason；推翻它卻只需要一個逃出去的 counterexample。',
      prediction: {
        question: '測試 100 組 positive integers 的 subtraction 都是正數，足以證明 closure 嗎？',
        choices: yesNo(
          false,
          '有限抽樣無法涵蓋無限多 pairs；還可能剛好沒測到 2−5。',
          '正確。抽樣只能提供線索，不能完成 universal proof。',
        ),
      },
      model: {
        kind: 'diagnostic',
        eyebrow: 'Evidence classifier',
        title: '這份證據能證明、推翻，還是只能提示？',
        prompt: '切換 evidence，觀察全稱命題的責任不對稱。',
        presets: [
          {
            label: '三個成功例子',
            checks: [
              { label: '提供 closure 線索', pass: true, reason: '尚未看到失敗。' },
              { label: '完成 universal proof', pass: false, reason: '仍有其他 pairs 未處理。' },
            ],
            detail: 'Examples 幫助猜測，但不能封住所有可能 inputs。',
            status: 'neutral',
          },
          {
            label: '一個 escape pair',
            checks: [
              { label: '足以推翻 closure', pass: true, reason: '2−5=−3 不在 positive integers。' },
              { label: '還需更多反例', pass: true, reason: '不需要；一個已足夠。' },
            ],
            detail: 'Universal claim 遇到一個 counterexample 就失敗。',
            status: 'bad',
          },
          {
            label: '任意元素 proof',
            checks: [
              { label: '處理任意 pair', pass: true, reason: 'a=2m、b=2n 涵蓋所有 even integers。' },
              { label: 'output 留在集合', pass: true, reason: 'a+b=2(m+n) 仍為 even。' },
            ],
            detail: 'General representation 把無限多 pairs 壓成一段 reasoning。',
            status: 'good',
          },
        ],
      },
      insight: '全稱敘述需要 general proof；一個 counterexample 就足以推翻。',
      transfer: {
        question: '要推翻「所有 rotations 都 commute」，找到一對不 commute 足夠嗎？',
        choices: yesNo(
          true,
          '足夠；全稱敘述被一個反例推翻。',
          '只要清楚展示那一對的兩種順序結果不同即可。',
        ),
      },
      formal: {
        title: 'Universal quantifier 與 counterexample',
        body: 'Closure 的形式是「對所有 a,b∈G，ab∈G」。證明必須處理任意 a、b；否定則是「存在一對 a、b 使 ab∉G」。',
        notation: '\forall a,b\in G,\ ab\in G',
      },
      proof: {
        title: '證明 even integers 對 addition closed',
        goal: '把任意 even inputs 寫成可追蹤的形式。',
        steps: [
          '任取 even a、b。',
          '存在 integers m、n，使 a=2m、b=2n。',
          'a+b=2m+2n=2(m+n)。',
          'm+n 是 integer，所以 a+b 是 even。',
        ],
      },
      boundary:
        '有限 operation table 可以窮舉所有 cells；那不是抽樣，而是完整檢查。要區分 exhaustive check 與 sample。',
    },
  ],
  ch6: [
    {
      id: '6.1',
      eyebrow: 'Abstract Algebra v2 · 6.1',
      title: '四條規則各自阻止一種故障',
      lede: '現在才把前五章收束成 group definition。Closure、associativity、identity、inverse 不是四句口訣，而是一份穩定 action world 的最低契約。',
      prediction: {
        question:
          '若系統 closed、有 identity、每個 element 有 inverse，就可以不檢查 associativity 嗎？',
        choices: yesNo(
          false,
          '括號若會改變總效果，長 action chain 仍有歧義。',
          '正確。四項各自排除不同故障，不能互相代替。',
        ),
      },
      model: {
        kind: 'diagnostic',
        eyebrow: 'Group contract dashboard',
        title: '每個 axiom 對應一盞故障燈',
        prompt: '切換故障情境，看缺少哪一項能力。',
        presets: [
          {
            label: '穩定 action world',
            checks: [
              { label: 'Closure · 不掉出去', pass: true, reason: 'composite 仍是合法 action。' },
              {
                label: 'Associativity · 無括號歧義',
                pass: true,
                reason: '長 sequence 有唯一總效果。',
              },
              { label: 'Identity · 可以停留', pass: true, reason: '存在 universal no-op。' },
              { label: 'Inverse · 可以折返', pass: true, reason: '每個 action 都可撤銷。' },
            ],
            detail: '四項同時成立，action system 才是 group。',
            status: 'good',
          },
          {
            label: '刪除操作',
            checks: [
              { label: 'Closure', pass: true, reason: '刪除後仍是字串。' },
              { label: 'Associativity', pass: true, reason: '某些 composition 可穩定執行。' },
              { label: 'Identity', pass: true, reason: '可以定義不刪除。' },
              { label: 'Inverse', pass: false, reason: '被刪資訊無法 universal 恢復。' },
            ],
            detail: '故障是只能前進、不能撤銷。',
            status: 'bad',
          },
          {
            label: 'positive integers +',
            checks: [
              { label: 'Closure', pass: true, reason: '正整數相加仍為正。' },
              { label: 'Associativity', pass: true, reason: '整數加法可重新分組。' },
              { label: 'Identity', pass: false, reason: '0 不在 positive integers。' },
              { label: 'Inverse', pass: false, reason: '−a 不在 positive integers。' },
            ],
            detail: '世界中沒有真正的停留，也無法返回。',
            status: 'bad',
          },
        ],
      },
      insight: 'Group 是能持續合成、保持合法、無歧義、可停留且完整撤銷的 action system。',
      transfer: {
        question: '所有可逆 2×2 matrices 在 multiplication 下具備這四項能力嗎？',
        choices: yesNo(
          true,
          '是；product 仍可逆、matrix multiplication associative、I 是 identity、每個 matrix 有 inverse。',
          '可逆矩陣正是為了保住 closure 與 inverse 而選出的 set。',
        ),
      },
      formal: {
        title: 'Group definition',
        body: 'Group 是 set G 與 binary operation `·`，滿足 closure、associativity、identity existence 與每個 element 的 inverse existence。',
        notation: '(G,\cdot)',
      },
      proof: {
        title: '四條 axioms 如何支撐方程求解？',
        goal: '從 ax=b 推出唯一解 x=a⁻¹b。',
        steps: [
          '左乘 a⁻¹。',
          '用 associativity 讓 a⁻¹ 與 a 相鄰。',
          '用 inverse law 得 ex=a⁻¹b。',
          '用 identity law 得 x=a⁻¹b；cancellation 保證唯一。',
        ],
      },
      boundary:
        '有些教材把 closure 收進 binary operation 的定義，因此只列三類 axioms；數學內容相同，本課保留四燈視覺以顯示每項工作。',
    },
    {
      id: '6.2',
      eyebrow: 'Abstract Algebra v2 · 6.2',
      title: 'Group detector 檢查 operation，不看物件長相',
      lede: '同一套四項契約可以檢查 rotations、numbers、matrices 與 shuffles。抽象的價值正是：表面表示不再左右判斷。',
      prediction: {
        question: '所有 2×2 matrices 在 multiplication 下是 group 嗎？',
        choices: yesNo(
          false,
          'zero matrix 與 singular matrices 沒有 multiplicative inverse。',
          '正確。限制為 invertible matrices 才能得到 group。',
        ),
      },
      model: {
        kind: 'diagnostic',
        eyebrow: 'System scanner',
        title: '用同一台 detector 掃描四種世界',
        prompt: '找到第一盞失敗燈，也查看前面的條件是否真的通過。',
        presets: [
          {
            label: 'integers with +',
            checks: [
              { label: 'closed', pass: true, reason: 'sum 仍是 integer。' },
              { label: 'associative', pass: true, reason: 'integer addition。' },
              { label: 'identity', pass: true, reason: '0。' },
              { label: 'inverse', pass: true, reason: 'a ↔ −a。' },
            ],
            detail: '這是無限 abelian group。',
            status: 'good',
          },
          {
            label: 'natural numbers with +',
            checks: [
              { label: 'closed', pass: true, reason: 'sum 仍是 natural。' },
              { label: 'associative', pass: true, reason: 'addition 可重新分組。' },
              { label: 'identity', pass: true, reason: '若 convention 包含 0。' },
              { label: 'inverse', pass: false, reason: '1 的 inverse −1 不在 set。' },
            ],
            detail: '即使包含 0，仍因大多數 inverses 缺失而不是 group。',
            status: 'bad',
          },
          {
            label: 'invertible matrices',
            checks: [
              { label: 'closed', pass: true, reason: '(AB)⁻¹=B⁻¹A⁻¹。' },
              { label: 'associative', pass: true, reason: 'matrix composition。' },
              { label: 'identity', pass: true, reason: 'identity matrix I。' },
              { label: 'inverse', pass: true, reason: 'set 已限制為 invertible。' },
            ],
            detail: '這個例子通常 nonabelian，但 group 不要求 commutative。',
            status: 'good',
          },
          {
            label: 'all matrices',
            checks: [
              { label: 'closed', pass: true, reason: 'product 仍是 2×2 matrix。' },
              { label: 'associative', pass: true, reason: 'matrix multiplication。' },
              { label: 'identity', pass: true, reason: 'I。' },
              { label: 'inverse', pass: false, reason: 'singular matrices 不可逆。' },
            ],
            detail: '物件名稱幾乎相同，set boundary 卻改變 group verdict。',
            status: 'bad',
          },
        ],
      },
      insight: '不要問 elements「像不像群」；要問 set 與 operation 是否履行完整契約。',
      transfer: {
        question: '一張 operation table 若缺 identity row/column，可以直接判定不是 group 嗎？',
        choices: yesNo(
          true,
          '可以；identity existence 是必要條件。',
          '沒有 universal no-op 就已違反 group contract。',
        ),
      },
      formal: {
        title: 'Verification 的責任',
        body: '有限表可逐格檢查 closure，並尋找 identity/inverses；associativity 仍需檢查 triples 或利用已知 associative structure。',
      },
      proof: {
        title: '可逆矩陣為何對 multiplication closed？',
        goal: '若 A、B 可逆，證明 AB 也可逆。',
        steps: [
          '候選 inverse 是 B⁻¹A⁻¹。',
          '算 (AB)(B⁻¹A⁻¹)=A(BB⁻¹)A⁻¹。',
          '化簡為 AIA⁻¹=I。',
          '另一側同理，因此 AB 可逆。',
        ],
      },
      boundary:
        '用 determinant 非零也能證明 closure，但會依賴線性代數工具；本課優先用 explicit inverse 展示 action 邏輯。',
    },
    {
      id: '6.3',
      eyebrow: 'Abstract Algebra v2 · 6.3',
      title: '拿掉一條 axiom，就會失去一種能力',
      lede: 'Near-group examples 的目的不是多背 monoid、semigroup 名稱，而是看見每條 axiom 真正在支撐哪一種推理。',
      prediction: {
        question: '字串串接有 identity 且 associative，但沒有 inverse；仍能做 cancellation 嗎？',
        choices: yesNo(
          false,
          '一般不能撤銷已串上的 suffix 或 prefix；inverse 缺失使 cancellation 失去保證。',
          '正確。沒有 universal undo，就沒有 group cancellation。',
        ),
      },
      model: {
        kind: 'diagnostic',
        eyebrow: 'Capability remover',
        title: '保持其他條件，觀察缺一項後什麼任務失敗',
        prompt: '分類名稱放次要位置；主畫面只追蹤能力。',
        presets: [
          {
            label: '字串串接',
            checks: [
              { label: '可連續 composition', pass: true, reason: '串接結果仍是字串。' },
              { label: '可重新分組', pass: true, reason: '括號不改字元順序。' },
              { label: '可以不加字元', pass: true, reason: 'empty string。' },
              { label: '每段都可撤銷', pass: false, reason: '一般沒有 inverse string。' },
            ],
            detail: '失去的是 universal undo 與由此而來的 cancellation。',
            status: 'bad',
          },
          {
            label: 'positive integers +',
            checks: [
              { label: '不掉出 set', pass: true, reason: 'positive + positive。' },
              { label: '無括號歧義', pass: true, reason: 'addition associative。' },
              { label: '可以停留', pass: false, reason: '0 不在 set。' },
              { label: '可以撤銷', pass: false, reason: 'negative numbers 不在 set。' },
            ],
            detail: '沒有 identity，也就無法定義「回到不動」的 inverse。',
            status: 'bad',
          },
          {
            label: 'group actions',
            checks: [
              { label: '持續執行', pass: true, reason: 'closure。' },
              { label: '長鏈唯一', pass: true, reason: 'associativity。' },
              { label: '可以停留', pass: true, reason: 'identity。' },
              { label: '可以撤銷', pass: true, reason: 'inverse。' },
            ],
            detail: '四項能力共同打開群論後續工具。',
            status: 'good',
          },
        ],
      },
      insight: '公理不是裝飾；每拿掉一條，就會失去一種可依賴的推理能力。',
      transfer: {
        question: '若 operation 沒有 associativity，長乘積可以安全省略括號嗎？',
        choices: yesNo(
          false,
          '不同 parenthesization 可能得到不同 outputs。',
          '正確；括號會成為必要資料。',
        ),
      },
      formal: {
        title: '延伸分類只作地圖',
        body: 'Semigroup 保留 associative operation；monoid 再加入 identity；group 再要求 inverses。本節不要求背名稱，只要求能預測能力差異。',
      },
      proof: {
        title: '為什麼 identity 是 inverse 的目標？',
        goal: '連結「撤銷」與「總效果不動」。',
        steps: [
          '執行 action a 後需要一個 undo b。',
          '兩步總效果應對所有 states 都不改變。',
          '能對所有 states 不動的 action 是 identity e。',
          '因此 inverse condition 必須寫成 ab=e（並同時要求 ba=e）。',
        ],
      },
      boundary:
        '某些非-group structures 仍有自己的 cancellation 或局部 inverses；群 axioms 提供的是對所有 elements 的統一保證。',
    },
    {
      id: '6.4',
      eyebrow: 'Abstract Algebra v2 · 6.4',
      title: '抽象符號只是 action roles 的壓縮',
      lede: '到這一步，G、·、e、a⁻¹ 才正式站到主畫面。每個符號都必須能指回已操作過的視覺角色，而不是另一套要重新背的內容。',
      prediction: {
        question: '在模 5 加法群中，符號 e 代表數字 1 嗎？',
        choices: yesNo(
          false,
          'operation 是 addition，所以 identity 是 0；e 的角色取決於 operation。',
          '正確。identity 不固定長成 0 或 1。',
        ),
      },
      model: {
        kind: 'symbols',
        eyebrow: 'Concrete → abstract translator',
        title: '把視覺角色配回符號',
        prompt: '切換系統；右側抽象角色不變，左側具體代表會更換。',
        presets: [
          {
            label: 'triangle symmetries',
            mapping: [
              { from: '合法 transformations', to: 'G', accent: true },
              { from: '連續執行', to: '·', accent: true },
              { from: '完全不動', to: 'e', accent: true },
              { from: '反向 rotation', to: 'a⁻¹', accent: true },
            ],
            detail: '抽象字母保留角色，隱藏圖形細節。',
            status: 'good',
          },
          {
            label: 'integers with +',
            mapping: [
              { from: 'all integers', to: 'G', accent: true },
              { from: 'addition', to: '·', accent: true },
              { from: '0', to: 'e', accent: true },
              { from: '−a', to: 'a⁻¹', accent: true },
            ],
            detail: '這裡 inverse 看起來像負數，因為 operation 是 addition。',
            status: 'good',
          },
          {
            label: 'nonzero rationals with ×',
            mapping: [
              { from: 'ℚ∖{0}', to: 'G', accent: true },
              { from: 'multiplication', to: '·', accent: true },
              { from: '1', to: 'e', accent: true },
              { from: '1/a', to: 'a⁻¹', accent: true },
            ],
            detail: '相同 abstract role 在 multiplicative world 中換成 reciprocal。',
            status: 'good',
          },
        ],
      },
      insight: '正式符號把 action world 壓縮成可遷移語言；符號的角色比外觀重要。',
      transfer: {
        question: '在可逆矩陣群中，e 與 a⁻¹ 應分別讀成 I 與 inverse matrix 嗎？',
        choices: yesNo(
          true,
          '是；I 是 composition 的 no-op，A⁻¹ 撤銷 A。',
          '矩陣只是同一套 abstract roles 的另一種具體表示。',
        ),
      },
      formal: {
        title: '第一份完整 vocabulary',
        body: 'G 是 underlying set，`·` 是 binary operation，e 是 identity，a⁻¹ 是 a 的 inverse。群的 order、generator 與 subgroup 留到下一部分。',
        notation: 'G,\quad \cdot,\quad e,\quad a^{-1}',
      },
      proof: {
        title: '用 axioms 解讀符號等式',
        goal: '把 a⁻¹(ab)=b 逐步翻譯回 action logic。',
        steps: [
          'a⁻¹(ab) 代表在 a→b 前面接上 undo a⁻¹。',
          'Associativity 允許改寫為 (a⁻¹a)b。',
          'Inverse law 把 a⁻¹a 換成 e。',
          'Identity law 把 eb 換成 b。',
        ],
      },
      boundary:
        '同一符號在不同教材可能表示不同 operation；第一次出現必須寫清楚 set、operation 與 composition direction。',
    },
  ],
  ...ALGEBRA_V2_PART2_LESSONS,
  ...ALGEBRA_V2_PART3_LESSONS,
  ...ALGEBRA_V2_PART4_LESSONS,
  ...ALGEBRA_V2_PART5_LESSONS,
};
