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

interface SubjectInfo {
  title: string;
  desc: string;
  chapters: ChapterEntry[];
  topics?: ChapterEntry[];
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
