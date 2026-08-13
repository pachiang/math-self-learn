import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface ChapterEntry {
  id: string;
  label: string;
  title: string;
  desc: string;
  meta: string;
  topic?: boolean;
}

interface PartInfo {
  label: string;
  desc?: string;
  chapters: ChapterEntry[];
}

interface SubjectInfo {
  title: string;
  desc: string;
  chapters: ChapterEntry[];
  topics?: ChapterEntry[];
  parts?: PartInfo[];
}

const SUBJECT_INFO: Record<string, SubjectInfo> = {
  linalg: {
    title: '線性代數',
    desc: '向量、線性變換、特徵值、基底變換 — 大學數學的基石',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '向量與線性組合',
        desc: '向量的三種觀點、加法、線性組合、Span、線性獨立、基底。',
        meta: '6 個小節 · 約 25 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '線性變換與矩陣',
        desc: '線性變換的幾何意義、矩陣表示、矩陣乘法 = 變換組合、行列式、反矩陣。',
        meta: '6 個小節 · 約 30 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '點積、長度與正交',
        desc: '點積的代數與幾何、投影、正交向量、正交基底、Gram–Schmidt 正交化。',
        meta: '6 個小節 · 約 30 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '解線性方程組',
        desc: '兩條直線的交點、矩陣形式 Ax = b、高斯消去法、解空間、最小平方法。',
        meta: '6 個小節 · 約 30 分鐘',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '矩陣的四個基本子空間',
        desc: '子空間、列空間、零空間、秩、Strang 大圖、正交補與線性代數基本定理。',
        meta: '6 個小節 · 約 35 分鐘',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: '特徵值與特徵向量',
        desc: '不變的方向、特徵方程、對角化、矩陣冪次、馬可夫鏈穩態。',
        meta: '6 個小節 · 約 35 分鐘',
      },
      {
        id: 'ch7',
        label: '第七章',
        title: '對稱矩陣與二次型',
        desc: '對稱矩陣、xᵀAx、主軸定理、正定矩陣。',
        meta: '6 個小節 · 約 35 分鐘',
      },
      {
        id: 'ch8',
        label: '第八章',
        title: 'SVD 與其應用',
        desc: 'SVD 的幾何（旋轉縮放旋轉）、四個子空間的統一、低秩近似、圖片壓縮、PCA 主成分分析。',
        meta: '6 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch9',
        label: '第九章',
        title: '線性微分方程組與動力系統',
        desc: '從 1D ODE 到向量場、特徵值解法、矩陣指數、四種平衡點、阻尼振盪、勞侖茲吸引子。',
        meta: '7 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch10',
        label: '第十章',
        title: '複矩陣與量子的觀點',
        desc: '為什麼需要複數、Hermitian 內積、Hermitian/Unitary 矩陣、Pauli 矩陣、Bloch 球面、量子閘、測量。',
        meta: '8 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch11',
        label: '第十一章',
        title: '抽象向量空間與線性算子',
        desc: '把向量從 R^n 推廣到多項式與函數，理解基底、維度、線性算子，以及微分為什麼也能寫成矩陣。',
        meta: '7 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch12',
        label: '第十二章',
        title: '函數空間、正交與傅立葉',
        desc: '把內積、正交與投影搬到函數空間，從 Legendre 多項式一路走到 Fourier 級數與 Gibbs 現象。',
        meta: '7 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch13',
        label: '第十三章',
        title: '線性代數與機器學習',
        desc: '線性回歸、多項式擬合、嶺回歸、Logistic、神經網路、卷積、反向傳播、推薦系統與詞嵌入。',
        meta: '8 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch14',
        label: '第十四章',
        title: '圖與網路的線性代數',
        desc: '鄰接矩陣、關聯矩陣、圖拉普拉斯、Fiedler 值、譜聚類、PageRank、隨機漫步。',
        meta: '7 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch15',
        label: '第十五章',
        title: '數值線性代數',
        desc: '浮點數、條件數、LU/QR 分解、樞軸選取、Jacobi/Gauss-Seidel 迭代、共軛梯度法。',
        meta: '7 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch16',
        label: '第十六章',
        title: 'Least Squares 與偽逆',
        desc: '從 overdetermined systems、投影與 normal equations，一路走到 QR、pseudoinverse 與 minimum-norm solution。',
        meta: '6 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch17',
        label: '第十七章',
        title: 'Jordan 標準形',
        desc: '對角化失敗怎麼辦：Schur 分解、Cayley-Hamilton、廣義特徵向量、Jordan 區塊與 ODE 重根。',
        meta: '7 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch18',
        label: '第十八章',
        title: '對偶空間',
        desc: '線性泛函、對偶基底、轉置的真正意義、零化子、協變量與梯度、雙對偶 V**。',
        meta: '7 個小節 · 約 45 分鐘',
      },
    ],
  },
  algebra: {
    title: '抽象代數',
    desc: '從 actions 如何運作開始，用生成、回路與等大拼圖一步步看懂群',
    chapters: [],
    parts: [
      {
        label: 'Part I · 先建立群的操作直覺',
        desc: '先看 action world 為何需要四條穩定運作條件，再讀正式符號。',
        chapters: [
          {
            id: 'ch1',
            label: '第一章',
            title: '狀態不是動作',
            desc: '分開 state、action 與 symmetry；外觀相同不代表動作相同。',
            meta: '4 個小節 · 約 25 分鐘',
          },
          {
            id: 'ch2',
            label: '第二章',
            title: '合成是在執行一串動作',
            desc: '追蹤 action chain、順序效應與 Cayley table。',
            meta: '3 個小節 · 約 20 分鐘',
          },
          {
            id: 'ch3',
            label: '第三章',
            title: '停留、撤銷與資訊',
            desc: '從 identity、inverse 看見 cancellation 與資訊保存。',
            meta: '4 個小節 · 約 25 分鐘',
          },
          {
            id: 'ch4',
            label: '第四章',
            title: '括號不改變 action chain',
            desc: '把 associativity 與 commutativity 徹底分開。',
            meta: '3 個小節 · 約 20 分鐘',
          },
          {
            id: 'ch5',
            label: '第五章',
            title: '世界必須對操作封閉',
            desc: '把 closure 看成不讓 output 掉出世界的全域承諾。',
            meta: '3 個小節 · 約 20 分鐘',
          },
          {
            id: 'ch6',
            label: '第六章',
            title: '四條條件是一份契約',
            desc: '每條 group axiom 都對應一種具體故障與推理能力。',
            meta: '3 個小節 · 約 25 分鐘',
          },
        ],
      },
      {
        label: 'Part II · 用少量資訊看懂整個群',
        desc: '從 generators 與 relations，走到 subgroup、coset 與 Lagrange。',
        chapters: [
          {
            id: 'ch7',
            label: '第七章',
            title: '少數按鈕可以走遍世界',
            desc: '以 reachability 理解 generators、words 與 generated subgroup。',
            meta: '4 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch8',
            label: '第八章',
            title: 'Relations 是閉合回路',
            desc: '把 relation 畫成 loop，並用它壓縮 action words。',
            meta: '4 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch9',
            label: '第九章',
            title: '重複一個動作形成週期',
            desc: '從 repeated action 理解 element order 與 cyclic group。',
            meta: '4 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch10',
            label: '第十章',
            title: '名字不同，運作方式相同',
            desc: '以可逆的結構翻譯理解 isomorphism 與 invariants。',
            meta: '4 個小節 · 約 35 分鐘',
          },
          {
            id: 'ch11',
            label: '第十一章',
            title: '完整機器裡的封閉子機器',
            desc: '用 subgroup test、生成與 lattice 看群的子世界。',
            meta: '4 個小節 · 約 35 分鐘',
          },
          {
            id: 'ch12',
            label: '第十二章',
            title: '用同一塊模板平移整個群',
            desc: '把 cosets 看成等大、相同或分離的 translates。',
            meta: '4 個小節 · 約 35 分鐘',
          },
          {
            id: 'ch13',
            label: '第十三章',
            title: '整除來自等大拼圖',
            desc: '從 coset partition 自己推出 Lagrange theorem 與其邊界。',
            meta: '4 個小節 · 約 35 分鐘',
          },
        ],
      },
      {
        label: 'Part III · 保留結構地遺忘資訊',
        desc: '用 homomorphism 鏡頭理解 kernel、normal subgroup、quotient 與 image。',
        chapters: [
          {
            id: 'ch14',
            label: '第十四章',
            title: '保留合成的結構翻譯',
            desc: '允許壓縮資訊，但 commuting square 不可分岔。',
            meta: '3 個小節 · 約 25 分鐘',
          },
          {
            id: 'ch15',
            label: '第十五章',
            title: '看得見什麼、看不見什麼',
            desc: 'Image 是可達輸出；kernel 是鏡頭無法分辨的 actions。',
            meta: '4 個小節 · 約 35 分鐘',
          },
          {
            id: 'ch16',
            label: '第十六章',
            title: '不可見差異要對所有座標穩定',
            desc: '從 kernel 的 context stability 理解 normal subgroup。',
            meta: '3 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch17',
            label: '第十七章',
            title: '把不可見差異壓成一點',
            desc: '讓 cosets 成為新 elements，並理解 well-defined quotient operation。',
            meta: '4 個小節 · 約 40 分鐘',
          },
          {
            id: 'ch18',
            label: '第十八章',
            title: '每種結構壓縮都走同一條路',
            desc: '以 kernel–quotient–image 重建 first isomorphism theorem。',
            meta: '3 個小節 · 約 35 分鐘',
          },
        ],
      },
      {
        label: 'Part IV · 群如何作用在其他世界',
        desc: '從 permutations 到 orbit、stabilizer、conjugacy 與 Burnside counting。',
        chapters: [
          {
            id: 'ch19',
            label: '第十九章',
            title: '重新排列就是 transformation',
            desc: '把 permutation 視為 finite states 上的 reversible action。',
            meta: '3 個小節 · 約 25 分鐘',
          },
          {
            id: 'ch20',
            label: '第二十章',
            title: 'Cycles 與 parity',
            desc: '拆出互不干擾的 cycles，再辨認 swap parity invariant。',
            meta: '4 個小節 · 約 35 分鐘',
          },
          {
            id: 'ch21',
            label: '第二十一章',
            title: '每個群都能成為 permutation group',
            desc: '讓群 left-act on itself，具體重建 Cayley theorem。',
            meta: '3 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch22',
            label: '第二十二章',
            title: '同一群可以操作不同世界',
            desc: '以 action homomorphism 選擇觀察對象與可見結構。',
            meta: '4 個小節 · 約 35 分鐘',
          },
          {
            id: 'ch23',
            label: '第二十三章',
            title: '能到哪裡、誰讓它不動',
            desc: '分開 orbit reachability 與 stabilizer local symmetry。',
            meta: '4 個小節 · 約 35 分鐘',
          },
          {
            id: 'ch24',
            label: '第二十四章',
            title: 'Reachability 與 local symmetry 守恆',
            desc: '用 action fibers 自己推出 orbit–stabilizer theorem。',
            meta: '3 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch25',
            label: '第二十五章',
            title: '同一動作換一個觀察座標',
            desc: '把 conjugation 解讀為 coordinate sandwich。',
            meta: '3 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch26',
            label: '第二十六章',
            title: '按 action type 分類整個群',
            desc: '由 centralizer stabilizer 組裝 class equation。',
            meta: '3 個小節 · 約 30 分鐘',
          },
          {
            id: 'ch27',
            label: '第二十七章',
            title: '用 fixed points 數 symmetry classes',
            desc: '以 double counting 重建 Burnside lemma 與 necklace counting。',
            meta: '4 個小節 · 約 40 分鐘',
          },
        ],
      },
      {
        label: 'Part V · 有限群的骨架',
        desc: '從獨立 action coordinates，走到 Cauchy、p-groups、Sylow 與陌生群分析。',
        chapters: [
          {
            id: 'ch28',
            label: '第二十八章',
            title: '把獨立 coordinates 接成一個群',
            desc: '用座標網格看見 direct product 的獨立更新、同步週期與內部辨認。',
            meta: '4 個小節 · 約 40 分鐘',
          },
          {
            id: 'ch29',
            label: '第二十九章',
            title: 'Prime divisor 為什麼一定留下 cycle',
            desc: '用 constrained tuples 與 prime-sized orbit packets 看見 Cauchy theorem。',
            meta: '5 個小節 · 約 50 分鐘',
          },
          {
            id: 'ch30',
            label: '第三十章',
            title: 'p-subgroup 為什麼能一路長到上限',
            desc: '用 coset action、normalizer quotient 與 lift 重建 first Sylow theorem。',
            meta: '5 個小節 · 約 50 分鐘',
          },
          {
            id: 'ch31',
            label: '第三十一章',
            title: '最大 p-subgroups 如何分布',
            desc: '合併 conjugacy、divisibility 與 congruence constraints。',
            meta: '5 個小節 · 約 50 分鐘',
          },
          {
            id: 'ch32',
            label: '第三十二章',
            title: '面對陌生群要看哪裡',
            desc: '先把目標翻成 observable，再把 representation、map、action 與 constraints 接成 proof route。',
            meta: '6 個小節 · 約 60 分鐘',
          },
        ],
      },
    ],
  },
  rings: {
    title: 'Rings & Ideals',
    desc: '從同一世界的兩種 operations 出發，理解 ideals 為何是 quotient multiplication 所需的穩定差異',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '一個世界，兩種合成方式',
        desc: '在同一批 objects 上切換 addition 與 multiplication，先看見角色差異，再留下 compatibility 問題。',
        meta: '4 個小節 · 約 30 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: 'Distributivity 是同步齒輪',
        desc: '讓先合再作用與先作用再合沿兩條 routes 相遇，並分開 closure 與 compatibility。',
        meta: '4 個小節 · 約 35 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '什麼條件才撐得住 ring world？',
        desc: '把 additive backbone、multiplication chain 與 distributive gearbox 組成一份不對稱的 ring contract。',
        meta: '5 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '哪些 elements 真正能把 multiplication 倒帶？',
        desc: '從 inverse dock、ambient ring 與 global undo 建立 unit 直覺，再轉移到 modular detector、unit group 與 function ring。',
        meta: '6 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '非零也可能把資訊乘沒',
        desc: '從 multiplication collision 抽出 zero divisor witness，分開 nonunit 的 gaps 與真正的資訊壓縮，再遷移到 function ring。',
        meta: '5 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: 'Subring 如何在邊界內自給自足？',
        desc: '沿用 ambient pointwise operations，分清 inherited laws 與 boundary obligations，最後讓 seed 長成最小 generated subring。',
        meta: '5 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch7',
        label: '第七章',
        title: '一張 map，兩套 wiring 都不能翻壞',
        desc: '用同一座two-route bridge檢查ADD、MULTIPLY與identity，再把map collision翻成送往0的difference。',
        meta: '4 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch8',
        label: '第八章',
        title: '看不見的 difference，為什麼乘完仍看不見？',
        desc: '從zero-output fiber發現kernel，再由difference stability與ambient absorption建立ideal contract。',
        meta: '4 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch9',
        label: '第九章',
        title: 'Subring 與 ideal 把 inputs 接在不同地方',
        desc: '固定同一個function world，比較internal autonomy、ambient absorption與identity obligation。',
        meta: '4 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch10',
        label: '第十章',
        title: '若 seed 必須變成 0，什麼會一起消失？',
        desc: '從ambient multiples、principal ideal到多seed combinations，最後用forced certificates看見generated的最小性。',
        meta: '4 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch11',
        label: '第十一章',
        title: '把 ideal 壓成 0，世界會變成什麼？',
        desc: '從forced identification建立coset elements，檢查兩種operations的representative independence，再組成quotient ring並追蹤compression。',
        meta: '5 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch12',
        label: '第十二章',
        title: 'Quotient 為什麼是最不浪費的壓縮？',
        desc: '把collapse包成canonical projection，測哪些maps能穿過quotient，再由唯一induced map看見R/I為何只做必要的資訊合併。',
        meta: '4 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch13',
        label: '第十三章',
        title: '一張 map 真正忘掉了哪些差異？',
        desc: '從output collisions反推出kernel differences，把fibers看成kernel cosets，再讓R/ker f與真正reachable的image精確對齊。',
        meta: '4 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch14',
        label: '第十四章',
        title: '壓縮之後，還能合法地再壓掉什麼？',
        desc: '在R/K與所有包含K的upstairs ideals之間來回，對齊整張ideal lattice，最後比較two-stage quotient與direct quotient。',
        meta: '4 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch15',
        label: '第十五章',
        title: '兩個 quotient views 合起來，能把世界拼回來嗎？',
        desc: '把兩個quotient outputs組成coordinates，分辨I∩J與I+J各自控制的資訊，再用CRT重建R/(I∩J)。',
        meta: '4 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch16',
        label: '第十六章',
        title: '什麼 boundary 會讓 quotient 的每個非零元素都能回到 1？',
        desc: '先看nonzero classes如何打開identity dock，再用同一張certificate、fiber bundling與no-intermediate criterion建立maximal ideal和field quotient的精確對應。',
        meta: '5 個小節 · 約 65 分鐘',
      },
    ],
  },
  analysis: {
    title: '實分析',
    desc: '從有理數的缺陷出發，建立完備性、極限、微積分的嚴格基礎，再推廣到測度論與多變數',
    chapters: [
      // Part I 直接放在 chapters 裡（不需要分隔線）
      {
        id: 'ch1',
        label: '第一章',
        title: '實數的完備性',
        desc: '有理數的洞、上確界、完備性公理、Archimedean 性質、區間套、不可數性、Cantor 集。',
        meta: '10 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '數列與極限',
        desc: 'ε-N 定義、極限運算律、單調有界、Bolzano-Weierstrass、Cauchy 列、上下極限。',
        meta: '9 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '級數',
        desc: '部分和、比較法、比值/根式法、積分判別法、交替級數、絕對/條件收斂、冪級數、Taylor 級數。',
        meta: '9 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '連續性',
        desc: 'ε-δ 極限、連續定義、間斷點、中間值定理、極值定理、均勻連續、函數空間。',
        meta: '9 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '微分',
        desc: "導數定義、可微與連續、微分法則、均值定理、L'Hôpital、Taylor 餘項、凸函數、反函數定理。",
        meta: '9 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: 'Riemann 積分',
        desc: '上和下和、可積條件、微積分基本定理、積分技巧、瑕積分、逐項積分、Gamma 函數。',
        meta: '9 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch7',
        label: '第七章',
        title: '函數列與均勻收斂',
        desc: '逐點 vs 均勻收斂、M-test、保持連續/微分/積分、冪級數性質、Stone-Weierstrass、Arzela-Ascoli。',
        meta: '10 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch8',
        label: '第八章',
        title: '度量空間',
        desc: 'Lᵖ 範數、函數空間度量、開集閉集、完備性、緊緻性、連通性、壓縮映射定理。',
        meta: '10 個小節 · 約 65 分鐘',
      },
    ],
    parts: [
      {
        label: 'Part II：測度與積分',
        desc: '從 Riemann 積分的局限出發，建立 Lebesgue 測度與積分',
        chapters: [
          {
            id: 'ch9',
            label: '第九章',
            title: 'Lebesgue 測度',
            desc: '外測度、可測集、σ-代數、測度零集、不可測集（Vitali）、Cantor 集的測度。',
            meta: '9 個小節 · 約 60 分鐘',
          },
          {
            id: 'ch10',
            label: '第十章',
            title: 'Lebesgue 積分',
            desc: '簡單函數積分、MCT、Fatou 引理、DCT（控制收斂定理）、跟 Riemann 的關係、Fubini。',
            meta: '9 個小節 · 約 60 分鐘',
          },
          {
            id: 'ch11',
            label: '第十一章',
            title: 'Lᵖ 空間',
            desc: 'Lᵖ 範數、Hölder/Minkowski 不等式、Riesz-Fischer（完備性）、L² 內積、收斂模式、對偶。',
            meta: '9 個小節 · 約 60 分鐘',
          },
          {
            id: 'ch12',
            label: '第十二章',
            title: 'Hilbert 空間入門',
            desc: '內積空間、正交投影、Fourier 展開、Riesz 表示、弱收斂、緊算子、量子力學的語言。',
            meta: '9 個小節 · 約 60 分鐘',
          },
        ],
      },
      {
        label: 'Part III：多變數分析',
        desc: '把微積分從一變數推廣到多變數',
        chapters: [
          {
            id: 'ch13',
            label: '第十三章',
            title: '多變數微分',
            desc: 'Rⁿ 拓撲、偏導數、全微分、Jacobian、鏈式法則、Hessian、反函數定理、隱函數定理。',
            meta: '9 個小節 · 約 60 分鐘',
          },
          {
            id: 'ch14',
            label: '第十四章',
            title: '多變數積分與 Fubini',
            desc: '重積分、Fubini 定理、累次積分、非矩形區域、極座標、Jacobian 換元、瑕積分、質心與慣性矩。',
            meta: '10 個小節 · 約 65 分鐘',
          },
          {
            id: 'ch15',
            label: '第十五章',
            title: '曲線積分與 Green 定理',
            desc: '向量場、標量/向量線積分、保守場、旋度與散度、Green 定理、通量、單連通區域。',
            meta: '10 個小節 · 約 65 分鐘',
          },
          {
            id: 'ch16',
            label: '第十六章',
            title: '曲面積分與 Stokes/散度定理',
            desc: '參數曲面、曲面面積、通量、散度定理(Gauss)、3D curl、Stokes 定理、定向、大統一。',
            meta: '10 個小節 · 約 70 分鐘',
          },
          {
            id: 'ch19',
            label: '第十九章',
            title: '微分形式與廣義 Stokes',
            desc: '1-form/2-form、wedge product、外微分 d、拉回、廣義 Stokes ∫∂Ω ω = ∫Ω dω、closed/exact、de Rham 上同調。',
            meta: '10 個小節 · 約 70 分鐘',
          },
        ],
      },
      {
        label: 'Part IV：Fourier 分析',
        desc: '用正弦波基底分解、重建與分析函數',
        chapters: [
          {
            id: 'ch17',
            label: '第十七章',
            title: 'Fourier 分析',
            desc: 'Fourier 級數與係數、部分和逼近、Gibbs 現象、Parseval 等式、Fourier 變換、卷積定理、壓縮與熱方程。',
            meta: '10 個小節 · 約 65 分鐘',
          },
        ],
      },
      {
        label: 'Part V：廣義函數',
        desc: '把「函數」推廣到分佈，讓 delta 和 PDE 基本解都有嚴格定義',
        chapters: [
          {
            id: 'ch18',
            label: '第十八章',
            title: '分佈與廣義函數',
            desc: 'Dirac delta、測試函數、分佈導數、Schwartz 空間、tempered distributions、Fourier 變換、卷積、Green 函數。',
            meta: '10 個小節 · 約 65 分鐘',
          },
        ],
      },
    ],
  },
  complex: {
    title: '複分析',
    desc: '從複數平面出發，探索解析函數、Cauchy 積分、留數定理與保角映射',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '複數與複數平面',
        desc: '複數的定義、幾何意義、極座標形式、Euler 公式、複數平面上的集合。',
        meta: '4 個小節 · 約 20 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '解析函數',
        desc: '複變函數的幾何意義、Cauchy-Riemann 方程、調和函數、3D 解剖、深入 1/z·z²·e^z 映射。',
        meta: '8 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '複數積分',
        desc: '路徑積分、Cauchy 積分定理與積分公式、Liouville 定理、最大模原理。',
        meta: '5 個小節 · 約 30 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '級數與奇異點',
        desc: 'Taylor 級數、Laurent 級數、奇異點分類（3D 曲面）、零點與極點、Riemann 球面（3D 立體投影）。',
        meta: '5 個小節 · 約 35 分鐘',
      },
    ],
  },
  ag: {
    title: '代數幾何',
    desc: '從多項式方程到幾何形狀——用代數理解曲線、曲面與奇異性',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '從多項式到幾何',
        desc: '多項式零點集、仿射簇、交集與聯集、奇異點分類、橢圓曲線虧格、射影化。',
        meta: '5 個小節 · 約 30 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '理想與簇的對話',
        desc: 'I(V) 與 V(I) 的對應、Hilbert 基底定理、Nullstellensatz、不可約分解、Zariski 拓撲。',
        meta: '5 個小節 · 約 35 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '橢圓曲線',
        desc: 'Weierstrass 方程、幾何群法則（點擊加法！）、有理點與 Mordell-Weil 定理、ECDH 密碼學。',
        meta: '5 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: 'Gröbner 基與計算代數幾何',
        desc: '多項式除法、單項式序、Buchberger 演算法逐步執行、消去法求解方程組。',
        meta: '5 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '代數曲面',
        desc: '從曲線到曲面、二次曲面（3D）、三次曲面與 27 條直線（3D）、奇異點分類（3D）、Kodaira 分類。',
        meta: '5 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: 'Blowup 與奇異點消解',
        desc: 'Blowup 空間（3D）、嚴格變換、結點消解動畫、尖點兩步消解、Hironaka 定理與消解畫廊。',
        meta: '5 個小節 · 約 35 分鐘',
      },
      {
        id: 'ch7',
        label: '第七章',
        title: '因子、線叢與 Riemann-Roch',
        desc: '因子與重數、主因子、線叢（3D Möbius 帶）、截面空間、Riemann-Roch 互動計算器、曲線分類。',
        meta: '7 個小節 · 約 50 分鐘',
      },
    ],
  },
  de: {
    title: '微分方程',
    desc: '從現象出發寫出方程，看它在空間中流動——斜率場、相平面、振動、PDE',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '什麼是微分方程？',
        desc: '從日常現象寫出 dy/dt = f(t,y)、斜率場、初值問題、解族、ODE 分類、自由落體案例。',
        meta: '8 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '一階 ODE 的解法',
        desc: '四招主力：可分離、線性＋積分因子、精確方程、代換法（Bernoulli／齊次）。每招配 step-by-step 推導。',
        meta: '6 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '建模應用',
        desc: '從現象寫到方程：牛頓冷卻、混合槽（3D）、RC 電路、彈道與阻力（3D）、Logistic 捕撈與臨界分岔。',
        meta: '7 個小節 · 約 70 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '存在唯一性 + 數值方法',
        desc: 'Picard-Lindelöf（含反例）、Euler 步進、local vs global 誤差、RK4、自適應步長、剛性方程與隱式法。Part I 完結。',
        meta: '7 個小節 · 約 65 分鐘',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '二階線性齊次（振動的語言）',
        desc: 'Part II 起點：F=ma、特徵方程、簡諧振動（3D 彈簧）、阻尼三型、能量、相平面（3D 螺旋）、LC / 鐘擺 / 懸臂的通用結構。',
        meta: '7 個小節 · 約 70 分鐘',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: '非齊次與共振',
        desc: '外力登場：y_h + y_p 分解、未定係數法、共振（無阻尼爆炸）、頻率響應 Bode 圖 + 3D 振幅曲面、拍頻、Tacoma 與 MRI 等真實案例。',
        meta: '6 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch7',
        label: '第七章',
        title: 'Laplace 變換',
        desc: '把 ODE 變代數：積分定義、變換表、微分變 s 相乘、部分分式反變換、階梯衝擊延遲、卷積定理與傳遞函數 H(s)。Part II 收尾。',
        meta: '6 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch8',
        label: '第八章',
        title: '線性 ODE 系統',
        desc: 'Part III 起點：從二階到一階系統、矩陣指數、特徵向量即不變方向、相平面六種肖像、Trace-Det 分類、耦合兩彈簧。',
        meta: '6 個小節 · 約 65 分鐘',
      },
      {
        id: 'ch9',
        label: '第九章',
        title: '非線性動力系統',
        desc: '真實鐘擺、Lotka-Volterra、Van der Pol 極限環；平衡點 + Jacobian、Hartman-Grobman 線性化、能量守恆與 3D 鐘擺能量曲面。',
        meta: '6 個小節 · 約 70 分鐘',
      },
      {
        id: 'ch10',
        label: '第十章',
        title: '級數解法與特殊函數',
        desc: '變係數 ODE、冪級數解 Airy、Frobenius 處理正則奇點、Bessel/Legendre/Hermite/Laguerre 畫廊、圓形鼓面模態。',
        meta: '5 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch11',
        label: '第十一章',
        title: 'Sturm-Liouville 與邊界值問題',
        desc: 'BVP vs IVP、本徵值問題、正交性、本徵函數展開（= Fourier 級數）、SL 統一架構。',
        meta: '5 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch12',
        label: '第十二章',
        title: 'PDE 入門：熱方程',
        desc: '從 Fourier 定律推出熱方程、分離變數法、Fourier 級數解、不同邊界（Dirichlet/Neumann/Mixed）、2D 擴散。',
        meta: '6 個小節 · 約 65 分鐘',
      },
      {
        id: 'ch13',
        label: '第十三章',
        title: '波動方程',
        desc: 'F=ma 推出 uₜₜ=c²Δu、dAlembert 行波、駐波與模態、2D 方形與圓形鼓、能量守恆。',
        meta: '5 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch14',
        label: '第十四章',
        title: 'Laplace 方程與調和函數',
        desc: '時間消失後的 Δu=0、平均值性質、最大值原理、Dirichlet 問題（方形 + 圓盤 Poisson 核）、PDE 三兄弟統整。',
        meta: '5 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch15',
        label: '第十五章',
        title: '分岔與混沌（收尾）',
        desc: 'Saddle-node / Pitchfork、Hopf 生極限環、Lorenz 蝴蝶吸引子、Logistic 週期倍增與費根鮑姆常數、整課總結。',
        meta: '5 個小節 · 約 60 分鐘',
      },
    ],
  },
  prob: {
    title: '機率論',
    desc: '從可能世界與權重出發，一步步建立對不確定性的正確直覺',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '機率不是預言',
        desc: '70% 的真正意思、短期隨機的模樣，以及長期規律如何從許多可能路徑中浮現。',
        meta: '3 個小節 · 新版主線',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '把可能世界畫完整',
        desc: 'experiment、outcome、sample space 與 event 的層級，以及如何選擇剛好夠用的可能世界。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '可能不等於一樣可能',
        desc: '從分類名稱與 probability mass 的差異出發，理解 equally likely 捷徑的前提與機率的三條地基。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '事件的幾何',
        desc: '用同一張可能地圖理解 union、intersection、complement、double counting 與 mutually exclusive。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '世界如何分岔',
        desc: '用 tree diagram 看完整 paths、branch weights、放回與不放回，以及「沿路乘、跨路加」。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: '計數是壓縮樹狀圖',
        desc: '從 multiplication principle 出發，理解 permutation、combination、重複元素與 birthday problem。',
        meta: '5 個小節 · 新版主線',
      },
      {
        id: 'ch7',
        label: '第七章',
        title: '從反面看「至少一次」',
        desc: '釐清 at least、at most、exactly，用 complement 觀看 repeated attempts、reliability 與策略選擇。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch8',
        label: '第八章',
        title: '條件機率是世界縮小',
        desc: '用 filter、renormalization 與 nested area 理解 conditional probability、given 的方向和不放回更新。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch9',
        label: '第九章',
        title: '獨立是縮小後比例不變',
        desc: '從 ratio invariant 出發，分清 independent 與 mutually exclusive、精確與近似獨立，以及 shared cause。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch10',
        label: '第十章',
        title: 'Bayes 從結果反推原因',
        desc: '用 natural frequencies 看 likelihood、posterior、base rate 與 false positive，再建立 Bayes update 和 total probability。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch11',
        label: '第十一章',
        title: 'Random variable 是測量規則',
        desc: '把 outcome 映成數值，分清世界與 measurement，理解 preimage，以及 discrete 和 continuous outputs。',
        meta: '4 個小節 · 新版主線',
      },
      {
        id: 'ch12',
        label: '第十二章',
        title: 'Distribution 是數值世界的重量地圖',
        desc: '追蹤 probability mass 如何被搬運，分別建立 PMF、CDF、PDF、interval area 與 normalization。',
        meta: '5 個小節 · 新版主線',
      },
      {
        id: 'ch13',
        label: '第十三章',
        title: 'Expectation 是重量中心',
        desc: '用 balance point 建立 expectation，分清 center 與 spread，再理解 linearity、variance 和 covariance。',
        meta: '5 個小節 · 新版主線',
      },
      {
        id: 'ch14',
        label: '第十四章',
        title: '同一台 Yes／No 實驗機',
        desc: '從 Bernoulli sequence 出發，理解 Binomial 的 count 壓縮、成立條件，以及 Geometric、Negative Binomial 的停止規則。',
        meta: '8 個小節 · 新版主線',
      },
      {
        id: 'ch15',
        label: '第十五章',
        title: '同一條事件流，兩種提問',
        desc: '固定 window 看 Poisson count，從 NOW 看 Exponential、Gamma wait，最後用 count／wait duality 把三者接回同一個 mechanism。',
        meta: '8 個小節 · 新版主線',
      },
      {
        id: 'ch16',
        label: '第十六章',
        title: '連續區間、比例與 transformations',
        desc: '從 interval area 與 Uniform 出發，用重量守恆理解 affine、nonlinear transformations，再把 Gamma weights normalize 成 Beta proportion。',
        meta: '8 個小節 · 新版主線',
      },
      {
        id: 'ch17',
        label: '第十七章',
        title: 'Normal、χ² 與 distribution family map',
        desc: '從 signed effects 的相加建立 Normal，再用平方與加總生成 χ²，最後以 normalize 串回 Gamma、Beta 的生成關係。',
        meta: '8 個小節 · 新版主線',
      },
      {
        id: 'ch18',
        label: '第十八章',
        title: '大數法則不是未來補償過去',
        desc: '用 running average、many worlds 與 ε-band 看 sample mean 收束，並處理 dependence、heavy tails 和 gambler’s fallacy。',
        meta: '8 個小節 · 新版主線',
      },
      {
        id: 'ch19',
        label: '第十九章',
        title: '中央極限定理是一副 √n 顯微鏡',
        desc: '把 shrinking average error 標準化，觀察不同 sources 的 sums 如何共享 Normal limit，並處理條件、速度與常見誤解。',
        meta: '8 個小節 · 新版主線',
      },
    ],
  },
  bayes: {
    title: '貝氏統計',
    desc: 'Prior × Likelihood = Posterior——把不確定性當作分佈來推理',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '貝氏思維',
        desc: '頻率派 vs 貝氏派的哲學差異、Bayes 定理的連續版、posterior 點估計 (Mean/Median/MAP)。',
        meta: '4 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '共軛先驗',
        desc: 'Beta-Binomial 逐筆更新、Normal-Normal 的 precision 疊加、Gamma-Poisson 計數資料。',
        meta: '3 個小節 · 建構中',
      },
    ],
  },
  reg: {
    title: '迴歸與線性模型',
    desc: 'OLS、GLM、正則化——把直線玩到極致的資料科學骨幹',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '簡單線性迴歸',
        desc: 'OLS 推導與點擊式擬合、SST/SSR/SSE 分解、殘差第一眼、β̂₁ 的 CI 與 t 檢定。',
        meta: '4 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '多元迴歸與矩陣觀點',
        desc: 'Simpson 悖論、矩陣形式 Y = Xβ + ε、投影與帽子矩陣、偏迴歸與 FWL 定理。',
        meta: '4 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: 'Gauss–Markov 與推論',
        desc: '五條假設、Gauss–Markov 定理（BLUE）、F 檢定、信賴區間 vs 預測區間。',
        meta: '3 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '診斷',
        desc: '殘差 vs 擬合、Q–Q plot 看常態、Leverage 與 Cook 距離、共線性 VIF。',
        meta: '4 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '模型選擇與正則化',
        desc: 'Bias–Variance、AIC/BIC、Ridge 縮收、Lasso 稀疏化、Elastic Net 與交叉驗證。',
        meta: '4 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: 'ANOVA 作為線性模型',
        desc: '單因子 ANOVA = 虛擬變數迴歸、雙因子與交互作用、ANCOVA。',
        meta: '3 個小節 · 約 45 分鐘',
      },
      {
        id: 'ch7',
        label: '第七章',
        title: '廣義線性模型 GLM',
        desc: 'Link 函數、Logistic（sigmoid 互動）、Poisson 計數迴歸、Deviance 與模型比較。',
        meta: '4 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch8',
        label: '第八章',
        title: '擴充與總結',
        desc: '多項式、Spline、LOESS 的比較；整課地圖與線性模型的現代延伸。',
        meta: '2 個小節 · 約 30 分鐘',
      },
    ],
  },
  stats: {
    title: '數理統計',
    desc: '從樣本推論母體——估計、檢定、迴歸的古典三柱',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '從機率到統計',
        desc: '統計是機率的反問題、樣本統計量與 Bessel 修正、χ²/t/F 三大抽樣分佈。',
        meta: '3 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '點估計',
        desc: 'Bias–Var–MSE、最大概似 MLE、動差法 MoM、Fisher 資訊與 Cramér–Rao 下界。',
        meta: '4 個小節 · 約 50 分鐘',
      },
      {
        id: 'ch3',
        label: '第三章',
        title: '區間估計',
        desc: 'CI 的正確詮釋、μ 的 z/t 區間、比例的 Wald 與 Wilson 區間、樣本大小規劃。',
        meta: '3 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch4',
        label: '第四章',
        title: '假設檢定',
        desc: 'H₀/H₁、α/β、p-value、z 與 t 檢定、檢定力 power、Neyman–Pearson 引理。',
        meta: '4 個小節 · 約 55 分鐘',
      },
      {
        id: 'ch5',
        label: '第五章',
        title: '兩群比較與關聯',
        desc: '雙樣本 & 配對 t、χ² 適合度 / 獨立性檢定、ANOVA 概念。',
        meta: '3 個小節 · 約 40 分鐘',
      },
      {
        id: 'ch6',
        label: '第六章',
        title: '迴歸與總結',
        desc: '簡單線性迴歸 OLS、R² 與殘差診斷、整課總結：估計／檢定／迴歸三柱。',
        meta: '3 個小節 · 約 40 分鐘',
      },
    ],
  },
  topology: {
    title: '點集拓撲',
    desc: '從開集公理出發，研究連續、連通、緊緻等不依賴距離的空間性質',
    chapters: [
      {
        id: 'ch1',
        label: '第一章',
        title: '拓撲空間與開集',
        desc: '開集公理、離散/密著/標準/餘有限拓撲、閉集、基底、度量拓撲、子空間拓撲、內部閉包邊界。',
        meta: '10 個小節 · 約 60 分鐘',
      },
      {
        id: 'ch2',
        label: '第二章',
        title: '連續映射與同胚',
        desc: '拓撲連續、同胚、拓撲不變量、積拓撲、商拓撲（黏合空間）、Hausdorff、開閉映射、嵌入。',
        meta: '10 個小節 · 約 60 分鐘',
      },
    ],
  },
};

@Component({
  selector: 'app-subject-catalog',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="learn-page">
      <a routerLink="/learn" class="back-link">← 返回科目列表</a>
      <h1 class="page-title">{{ info().title }}</h1>
      <p class="page-desc">{{ info().desc }}</p>

      @for (ch of info().chapters; track ch.id) {
        <a class="chapter-card" [routerLink]="['/learn', subject(), ch.id, '1']">
          <span class="ch-label">{{ ch.label }}</span>
          <h2 class="ch-title">{{ ch.title }}</h2>
          <p class="ch-desc">{{ ch.desc }}</p>
          <span class="ch-meta">{{ ch.meta }}</span>
        </a>
      }

      @if (info().topics) {
        <div class="section-divider">
          <span class="divider-line"></span>
          <span class="divider-text">專題探索</span>
          <span class="divider-line"></span>
        </div>
        <p class="section-desc">獨立專題，可按興趣選讀</p>
        @for (ch of info().topics; track ch.id) {
          <a class="chapter-card topic" [routerLink]="['/learn', subject(), ch.id, '1']">
            <span class="ch-label topic-label">{{ ch.label }}</span>
            <h2 class="ch-title">{{ ch.title }}</h2>
            <p class="ch-desc">{{ ch.desc }}</p>
            <span class="ch-meta">{{ ch.meta }}</span>
          </a>
        }
      }

      @if (info().parts) {
        @for (part of info().parts; track part.label) {
          <div class="section-divider">
            <span class="divider-line"></span>
            <span class="divider-text">{{ part.label }}</span>
            <span class="divider-line"></span>
          </div>
          @if (part.desc) {
            <p class="section-desc">{{ part.desc }}</p>
          }
          @for (ch of part.chapters; track ch.id) {
            <a class="chapter-card" [routerLink]="['/learn', subject(), ch.id, '1']">
              <span class="ch-label">{{ ch.label }}</span>
              <h2 class="ch-title">{{ ch.title }}</h2>
              <p class="ch-desc">{{ ch.desc }}</p>
              <span class="ch-meta">{{ ch.meta }}</span>
            </a>
          }
        }
      }
    </div>
  `,
  styles: `
    .learn-page {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    .back-link {
      display: inline-block;
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      margin-bottom: 14px;
      transition: color 0.12s;

      &:hover {
        color: var(--accent);
      }
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 4px;
    }

    .page-desc {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 32px;
    }

    .chapter-card {
      display: block;
      padding: 22px 24px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--bg-surface);
      text-decoration: none;
      color: inherit;
      transition: all 0.15s ease;
      margin-bottom: 16px;

      &:hover {
        border-color: var(--accent-30);
        background: var(--accent-10);
      }
    }

    .ch-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
    }

    .ch-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin: 4px 0 8px;
    }

    .ch-desc {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0 0 8px;
      line-height: 1.5;
    }

    .ch-meta {
      font-size: 12px;
      color: var(--text-muted);
    }

    .section-divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 28px 0 8px;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .divider-text {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: 0.08em;
      flex-shrink: 0;
    }

    .section-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin: 0 0 20px;
      text-align: center;
    }

    .topic {
      border-style: dashed;
    }

    .topic-label {
      color: var(--text-muted) !important;
    }
  `,
})
export class SubjectCatalogComponent {
  private readonly route = inject(ActivatedRoute);

  readonly subject = toSignal(this.route.paramMap.pipe(map((p) => p.get('subject') ?? 'algebra')), {
    initialValue: 'algebra',
  });

  readonly info = computed(() => SUBJECT_INFO[this.subject()] ?? SUBJECT_INFO['algebra']);
}
