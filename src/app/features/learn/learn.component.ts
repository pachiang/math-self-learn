import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="learn-page">
      <h1 class="page-title">教學</h1>
      <p class="page-desc">透過互動動畫，從零開始理解抽象代數</p>

      <a class="chapter-card" routerLink="/learn/ch1/1">
        <span class="ch-label">第一章</span>
        <h2 class="ch-title">什麼是群？</h2>
        <p class="ch-desc">
          從正三角形的對稱操作出發，一步步發現群的四條公理。
        </p>
        <span class="ch-meta">6 個小節 · 約 20 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch2/1">
        <span class="ch-label">第二章</span>
        <h2 class="ch-title">群的內部結構</h2>
        <p class="ch-desc">
          元素的階、子群、等價類與陪集、拉格朗日定理。
        </p>
        <span class="ch-meta">7 個小節 · 約 30 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch3/1">
        <span class="ch-label">第三章</span>
        <h2 class="ch-title">商群與同態</h2>
        <p class="ch-desc">
          正規子群、商群、同態映射、核、第一同構定理。
        </p>
        <span class="ch-meta">7 個小節 · 約 40 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch4/1">
        <span class="ch-label">第四章</span>
        <h2 class="ch-title">置換群</h2>
        <p class="ch-desc">
          S\u2099 與循環記號、對換、奇偶性、交替群、凱萊定理。
        </p>
        <span class="ch-meta">6 個小節 · 約 30 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch5/1">
        <span class="ch-label">第五章</span>
        <h2 class="ch-title">群作用</h2>
        <p class="ch-desc">
          軌道、穩定子、Burnside 引理、項鍊計數。
        </p>
        <span class="ch-meta">6 個小節 · 約 35 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch6/1">
        <span class="ch-label">第六章</span>
        <h2 class="ch-title">Sylow 定理</h2>
        <p class="ch-desc">
          共軛類、類方程、p-群、Sylow 定理、小階群分類。
        </p>
        <span class="ch-meta">6 個小節 · 約 35 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch7/1">
        <span class="ch-label">第七章</span>
        <h2 class="ch-title">環</h2>
        <p class="ch-desc">
          從整數到環、零因子、理想、商環、環同態。
        </p>
        <span class="ch-meta">6 個小節 · 約 30 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch8/1">
        <span class="ch-label">第八章</span>
        <h2 class="ch-title">域與多項式</h2>
        <p class="ch-desc">
          有限域、多項式環、不可約多項式、域擴張。
        </p>
        <span class="ch-meta">6 個小節 · 約 35 分鐘</span>
      </a>

      <a class="chapter-card" routerLink="/learn/ch9/1">
        <span class="ch-label">第九章</span>
        <h2 class="ch-title">伽羅瓦理論</h2>
        <p class="ch-desc">
          分裂域、域自同構、伽羅瓦群、五次方程為什麼沒有公式解。
        </p>
        <span class="ch-meta">6 個小節 · 約 40 分鐘</span>
      </a>

      <div class="section-divider">
        <span class="divider-line"></span>
        <span class="divider-text">專題探索</span>
        <span class="divider-line"></span>
      </div>
      <p class="section-desc">獨立專題，可按興趣選讀</p>

      <a class="chapter-card topic" routerLink="/learn/ch10/1">
        <span class="ch-label topic-label">專題 A</span>
        <h2 class="ch-title">魔術方塊群</h2>
        <p class="ch-desc">
          魔方的群結構、交換子與共軛、子群分解、上帝之數。
        </p>
        <span class="ch-meta">5 個小節</span>
      </a>

      <a class="chapter-card topic" routerLink="/learn/ch11/1">
        <span class="ch-label topic-label">專題 B</span>
        <h2 class="ch-title">表示論入門</h2>
        <p class="ch-desc">
          群的矩陣表示、特徵標、不可約分解、傅立葉變換的群論本質。
        </p>
        <span class="ch-meta">5 個小節</span>
      </a>

      <a class="chapter-card topic" routerLink="/learn/ch12/1">
        <span class="ch-label topic-label">專題 C</span>
        <h2 class="ch-title">代數幾何入門</h2>
        <p class="ch-desc">
          代數簇、理想與幾何的對應、Hilbert 零點定理、橢圓曲線。
        </p>
        <span class="ch-meta">5 個小節</span>
      </a>
    </div>
  `,
  styles: `
    .learn-page {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 24px 80px;
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

      &.placeholder {
        opacity: 0.5;
        pointer-events: none;
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
export class LearnComponent {}
