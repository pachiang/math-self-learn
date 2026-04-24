import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="learn-page">
      <h1 class="page-title">教學</h1>
      <p class="page-desc">透過互動動畫，從零開始理解大學數學</p>

      <section class="group">
        <h2 class="group-title">代數</h2>

        <a class="subject-card" routerLink="/learn/linalg">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <line x1="-22" y1="0" x2="22" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
              <line x1="0" y1="-22" x2="0" y2="22" stroke="var(--border-strong)" stroke-width="0.8" />
              <line x1="0" y1="0" x2="18" y2="-9" stroke="var(--v0)" stroke-width="2.5" marker-end="url(#sa1)" />
              <line x1="0" y1="0" x2="-9" y2="-18" stroke="var(--v1)" stroke-width="2.5" marker-end="url(#sa2)" />
              <defs>
                <marker id="sa1" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <polygon points="0 0,6 2,0 4" fill="var(--v0)" />
                </marker>
                <marker id="sa2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <polygon points="0 0,6 2,0 4" fill="var(--v1)" />
                </marker>
              </defs>
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">線性代數</h3>
            <p class="sc-desc">
              向量、線性變換、特徵值、基底變換，大學數學的基石。
            </p>
            <span class="sc-meta">18 章已完成</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/algebra">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <polygon points="0,-22 19,11 -19,11" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />
              <circle cx="0" cy="-22" r="3.5" fill="var(--v0)" />
              <circle cx="19" cy="11" r="3.5" fill="var(--v1)" />
              <circle cx="-19" cy="11" r="3.5" fill="var(--v2)" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">抽象代數</h3>
            <p class="sc-desc">
              從正三角形的對稱出發，到群論、環論、伽羅瓦理論。
            </p>
            <span class="sc-meta">9 章主線 + 4 專題</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/ag">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <path d="M-20,0 Q-20,-18 -8,-18 Q0,-18 4,-10 Q8,-2 8,6 Q8,18 16,18"
                    fill="none" stroke="var(--accent)" stroke-width="2.2" />
              <path d="M-20,0 Q-20,18 -8,18 Q0,18 4,10 Q8,2 8,-6 Q8,-18 16,-18"
                    fill="none" stroke="var(--accent)" stroke-width="2.2" />
              <circle cx="-20" cy="0" r="3" fill="var(--v0)" />
              <circle cx="8" cy="6" r="2.5" fill="var(--v1)" />
              <circle cx="8" cy="-6" r="2.5" fill="var(--v1)" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">代數幾何</h3>
            <p class="sc-desc">
              多項式方程定義幾何形狀——簇、奇異點、射影空間。
            </p>
            <span class="sc-meta">建構中</span>
          </div>
        </a>
      </section>

      <section class="group">
        <h2 class="group-title">分析與拓撲</h2>

        <a class="subject-card" routerLink="/learn/analysis">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <line x1="-24" y1="0" x2="24" y2="0" stroke="var(--border-strong)" stroke-width="1.5" />
              <line x1="-18" y1="-3" x2="-18" y2="3" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="-9" y1="-3" x2="-9" y2="3" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="9" y1="-3" x2="9" y2="3" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="18" y1="-3" x2="18" y2="3" stroke="var(--border-strong)" stroke-width="1" />
              <circle cx="-14" cy="-12" r="2" fill="var(--v0)" />
              <circle cx="-4" cy="-14" r="2" fill="var(--v0)" />
              <circle cx="3" cy="-11" r="2" fill="var(--v0)" />
              <circle cx="8" cy="-13" r="2" fill="var(--v0)" />
              <circle cx="11" cy="-12" r="2" fill="var(--v0)" />
              <circle cx="13" cy="-12.5" r="2.5" fill="var(--accent)" />
              <circle cx="5" cy="0" r="3" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="2 1.5" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">實分析</h3>
            <p class="sc-desc">
              從有理數的缺陷出發，建立實數的完備性，理解極限的根基。
            </p>
            <span class="sc-meta">13 章已完成</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/complex">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <circle cx="0" cy="0" r="20" fill="none" stroke="var(--border-strong)" stroke-width="1.2" stroke-dasharray="3 2" />
              <line x1="-24" y1="0" x2="24" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
              <line x1="0" y1="-24" x2="0" y2="24" stroke="var(--border-strong)" stroke-width="0.8" />
              <line x1="0" y1="0" x2="14" y2="-14" stroke="var(--accent)" stroke-width="2" />
              <circle cx="14" cy="-14" r="3" fill="var(--accent)" />
              <path d="M8,0 A8,8 0 0,0 5.6,-5.6" fill="none" stroke="var(--v0)" stroke-width="1.5" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">複分析</h3>
            <p class="sc-desc">
              複數平面、解析函數、Cauchy 積分、留數定理、保角映射。
            </p>
            <span class="sc-meta">建構中</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/de">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <line x1="-24" y1="0" x2="24" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
              <line x1="0" y1="-24" x2="0" y2="24" stroke="var(--border-strong)" stroke-width="0.8" />
              <g stroke="var(--text-muted)" stroke-width="1.2" stroke-linecap="round" opacity="0.65">
                <line x1="-20" y1="-15" x2="-14" y2="-18" />
                <line x1="-10" y1="-7" x2="-4" y2="-11" />
                <line x1="2" y1="1" x2="8" y2="-4" />
                <line x1="12" y1="9" x2="18" y2="4" />
                <line x1="-20" y1="5" x2="-14" y2="0" />
                <line x1="-10" y1="14" x2="-4" y2="8" />
              </g>
              <path d="M-22,18 Q-10,10 2,-2 T22,-18"
                    fill="none" stroke="var(--accent)" stroke-width="2.5" />
              <circle cx="-22" cy="18" r="3" fill="var(--v0)" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">微分方程</h3>
            <p class="sc-desc">
              斜率場、相平面、振動與 PDE——所有會「變」的東西共同的語言。
            </p>
            <span class="sc-meta">建構中</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/topology">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <circle cx="-6" cy="0" r="18" fill="none" stroke="var(--accent)" stroke-width="2" />
              <circle cx="6" cy="0" r="18" fill="none" stroke="var(--v1)" stroke-width="2" />
              <circle cx="0" cy="0" r="4" fill="none" stroke="var(--v0)" stroke-width="2" stroke-dasharray="3 2" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">點集拓撲</h3>
            <p class="sc-desc">
              從開集公理出發，研究連續、連通、緊緻等不依賴距離的空間性質。
            </p>
            <span class="sc-meta">建構中</span>
          </div>
        </a>
      </section>

      <section class="group">
        <h2 class="group-title">機率與統計</h2>

        <a class="subject-card" routerLink="/learn/prob">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <line x1="-24" y1="18" x2="24" y2="18" stroke="var(--border-strong)" stroke-width="1" />
              <rect x="-20" y="8" width="6" height="10" fill="var(--v0)" opacity="0.7" />
              <rect x="-12" y="-2" width="6" height="20" fill="var(--v0)" opacity="0.7" />
              <rect x="-4" y="-14" width="6" height="32" fill="var(--v0)" opacity="0.7" />
              <rect x="4" y="-6" width="6" height="24" fill="var(--v0)" opacity="0.7" />
              <rect x="12" y="4" width="6" height="14" fill="var(--v0)" opacity="0.7" />
              <path d="M-22,12 Q-10,-16 -1,-18 Q8,-16 20,12" fill="none" stroke="var(--accent)" stroke-width="2.2" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">機率論</h3>
            <p class="sc-desc">
              從擲骰到中央極限定理——用數學量化不確定性。
            </p>
            <span class="sc-meta">6 章已完成</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/stats">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <!-- Axes -->
              <line x1="-22" y1="18" x2="22" y2="18" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="-22" y1="-20" x2="-22" y2="18" stroke="var(--border-strong)" stroke-width="1" />
              <!-- Confidence intervals stacked -->
              <line x1="-14" y1="-12" x2="-6" y2="-12" stroke="var(--accent)" stroke-width="2" />
              <circle cx="-10" cy="-12" r="2" fill="var(--accent)" />
              <line x1="-8" y1="-4" x2="6" y2="-4" stroke="var(--accent)" stroke-width="2" />
              <circle cx="-1" cy="-4" r="2" fill="var(--accent)" />
              <line x1="-4" y1="4" x2="10" y2="4" stroke="var(--accent)" stroke-width="2" />
              <circle cx="3" cy="4" r="2" fill="var(--accent)" />
              <line x1="2" y1="12" x2="14" y2="12" stroke="var(--accent)" stroke-width="2" />
              <circle cx="8" cy="12" r="2" fill="var(--accent)" />
              <!-- μ line -->
              <line x1="0" y1="-20" x2="0" y2="18" stroke="var(--v0)" stroke-width="1.5" stroke-dasharray="2 2" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">數理統計</h3>
            <p class="sc-desc">
              從樣本推論母體——估計、檢定、迴歸的古典三柱。
            </p>
            <span class="sc-meta">6 章已完成</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/reg">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <!-- Axes -->
              <line x1="-22" y1="18" x2="22" y2="18" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="-22" y1="-20" x2="-22" y2="18" stroke="var(--border-strong)" stroke-width="1" />
              <!-- Scatter points -->
              <circle cx="-14" cy="10" r="2" fill="var(--text-muted)" />
              <circle cx="-7" cy="4" r="2" fill="var(--text-muted)" />
              <circle cx="-2" cy="-2" r="2" fill="var(--text-muted)" />
              <circle cx="5" cy="-7" r="2" fill="var(--text-muted)" />
              <circle cx="11" cy="-12" r="2" fill="var(--text-muted)" />
              <circle cx="17" cy="-16" r="2" fill="var(--text-muted)" />
              <!-- OLS line -->
              <line x1="-20" y1="14" x2="20" y2="-18" stroke="var(--accent)" stroke-width="2.2" />
              <!-- Residual marks -->
              <line x1="-7" y1="4" x2="-7" y2="6" stroke="#b06c4a" stroke-width="1.2" />
              <line x1="5" y1="-7" x2="5" y2="-4" stroke="#b06c4a" stroke-width="1.2" />
              <line x1="11" y1="-12" x2="11" y2="-10" stroke="#b06c4a" stroke-width="1.2" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">迴歸與線性模型</h3>
            <p class="sc-desc">
              OLS、GLM、正則化——把直線玩到極致的資料科學骨幹。
            </p>
            <span class="sc-meta">8 章已完成</span>
          </div>
        </a>

        <a class="subject-card" routerLink="/learn/bayes">
          <div class="sc-icon-wrap">
            <svg viewBox="-30 -30 60 60" class="sc-icon">
              <!-- Axes -->
              <line x1="-22" y1="18" x2="22" y2="18" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="-22" y1="-20" x2="-22" y2="18" stroke="var(--border-strong)" stroke-width="1" />
              <!-- Prior (dashed, wide bell) -->
              <path d="M-22,14 Q-12,-2 -2,-4 Q8,-2 18,14"
                    fill="none" stroke="var(--text-muted)" stroke-width="1.4" stroke-dasharray="2.5 2" opacity="0.8" />
              <!-- Likelihood (orange, narrower) -->
              <path d="M-14,14 Q-6,-10 4,-12 Q14,-10 20,14"
                    fill="none" stroke="#b06c4a" stroke-width="1.8" />
              <!-- Posterior (accent, filled, sharpest) -->
              <path d="M-10,14 Q-2,-16 4,-17 Q10,-16 16,14 Z"
                    fill="var(--accent)" opacity="0.3" stroke="var(--accent)" stroke-width="2" />
            </svg>
          </div>
          <div class="sc-body">
            <h3 class="sc-title">貝氏統計</h3>
            <p class="sc-desc">
              Prior × Likelihood = Posterior——把不確定性當作分佈來推理。
            </p>
            <span class="sc-meta">2 章已完成 · 建構中</span>
          </div>
        </a>
      </section>
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

    .group {
      margin-bottom: 28px;
    }
    .group:last-child {
      margin-bottom: 0;
    }

    .group-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin: 0 0 10px 2px;
    }

    .subject-card {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 18px 22px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--bg-surface);
      text-decoration: none;
      color: inherit;
      transition: all 0.15s ease;
      margin-bottom: 10px;

      &:hover {
        border-color: var(--accent-30);
        background: var(--accent-10);
        transform: translateY(-1px);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .sc-icon-wrap {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--bg);
      border: 1px solid var(--border);
    }

    .sc-icon {
      width: 48px;
      height: 48px;
    }

    .sc-body {
      flex: 1;
      min-width: 0;
    }

    .sc-title {
      font-size: 19px;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 4px;
    }

    .sc-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 4px;
      line-height: 1.5;
    }

    .sc-meta {
      font-size: 11px;
      color: var(--text-muted);
    }
  `,
})
export class LearnComponent {}
