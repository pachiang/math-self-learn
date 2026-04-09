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
          <span class="sc-label">第一科目</span>
          <h2 class="sc-title">線性代數</h2>
          <p class="sc-desc">
            向量、線性變換、特徵值、基底變換 — 大學數學的基石。
          </p>
          <span class="sc-meta">15 章已完成</span>
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
          <span class="sc-label">第二科目</span>
          <h2 class="sc-title">抽象代數</h2>
          <p class="sc-desc">
            從正三角形的對稱出發，到群論、環論、伽羅瓦理論。
          </p>
          <span class="sc-meta">9 章主線 + 4 專題</span>
        </div>
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

    .subject-card {
      display: flex;
      gap: 20px;
      align-items: center;
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
        transform: translateY(-1px);
      }
    }

    .sc-icon-wrap {
      flex-shrink: 0;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--bg);
      border: 1px solid var(--border);
    }

    .sc-icon {
      width: 56px;
      height: 56px;
    }

    .sc-body {
      flex: 1;
      min-width: 0;
    }

    .sc-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
    }

    .sc-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin: 4px 0 6px;
    }

    .sc-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 6px;
      line-height: 1.5;
    }

    .sc-meta {
      font-size: 12px;
      color: var(--text-muted);
    }
  `,
})
export class LearnComponent {}
