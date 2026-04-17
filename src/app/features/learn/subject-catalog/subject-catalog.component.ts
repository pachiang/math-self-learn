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
    desc: '從正三角形的對稱出發，到群論、環論、伽羅瓦理論',
    chapters: [
      { id: 'ch1', label: '第一章', title: '什麼是群？', desc: '從正三角形的對稱操作出發，一步步發現群的四條公理。', meta: '6 個小節 · 約 20 分鐘' },
      { id: 'ch2', label: '第二章', title: '群的內部結構', desc: '元素的階、子群、等價類與陪集、拉格朗日定理。', meta: '7 個小節 · 約 30 分鐘' },
      { id: 'ch3', label: '第三章', title: '商群與同態', desc: '正規子群、商群、同態映射、核、第一同構定理。', meta: '7 個小節 · 約 40 分鐘' },
      { id: 'ch4', label: '第四章', title: '置換群', desc: 'S\u2099 與循環記號、對換、奇偶性、交替群、凱萊定理。', meta: '6 個小節 · 約 30 分鐘' },
      { id: 'ch5', label: '第五章', title: '群作用', desc: '軌道、穩定子、Burnside 引理、項鍊計數。', meta: '6 個小節 · 約 35 分鐘' },
      { id: 'ch6', label: '第六章', title: 'Sylow 定理', desc: '共軛類、類方程、p-群、Sylow 定理、小階群分類。', meta: '6 個小節 · 約 35 分鐘' },
      { id: 'ch7', label: '第七章', title: '環', desc: '從整數到環、零因子、理想、商環、環同態。', meta: '6 個小節 · 約 30 分鐘' },
      { id: 'ch8', label: '第八章', title: '域與多項式', desc: '有限域、多項式環、不可約多項式、域擴張。', meta: '6 個小節 · 約 35 分鐘' },
      { id: 'ch9', label: '第九章', title: '伽羅瓦理論', desc: '分裂域、域自同構、伽羅瓦群、五次方程為什麼沒有公式解。', meta: '6 個小節 · 約 40 分鐘' },
    ],
    topics: [
      { id: 'ch10', label: '專題 A', title: '魔術方塊群', desc: '魔方的群結構、交換子與共軛、子群分解、上帝之數。', meta: '5 個小節', topic: true },
      { id: 'ch11', label: '專題 B', title: '表示論入門', desc: '群的矩陣表示、特徵標、不可約分解、傅立葉變換的群論本質。', meta: '5 個小節', topic: true },
      { id: 'ch12', label: '專題 C', title: '代數幾何入門', desc: '代數簇、理想與幾何的對應、Hilbert 零點定理、橢圓曲線。', meta: '5 個小節', topic: true },
      { id: 'ch13', label: '專題 D', title: '編碼理論', desc: '雜訊通道、漢明距離、線性碼、Hamming(7,4)、Reed-Solomon 碼。', meta: '5 個小節', topic: true },
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

      &:hover { color: var(--accent); }
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

  readonly subject = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('subject') ?? 'algebra')),
    { initialValue: 'algebra' },
  );

  readonly info = computed(
    () => SUBJECT_INFO[this.subject()] ?? SUBJECT_INFO['algebra'],
  );
}
