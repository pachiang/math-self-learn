import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Row { ch: string; concept: string; rVersion: string; metricVersion: string; color: string; }

const ROWS: Row[] = [
  { ch: 'Ch1', concept: '完備性', rVersion: 'sup 性質：有上界子集有 sup', metricVersion: '每個 Cauchy 列都收斂', color: '#5a7faa' },
  { ch: 'Ch2', concept: '數列收斂', rVersion: '|aₙ − L| < ε when n > N', metricVersion: 'd(xₙ, x) < ε when n > N', color: '#c8983b' },
  { ch: 'Ch3', concept: '級數', rVersion: 'Σaₙ 絕對收斂 → 收斂', metricVersion: 'Banach 空間：絕對收斂級數收斂', color: '#c8983b' },
  { ch: 'Ch4', concept: '連續', rVersion: '|f(x)−f(a)| < ε when |x−a| < δ', metricVersion: 'dY(f(x),f(a)) < ε when dX(x,a) < δ', color: '#5a8a5a' },
  { ch: 'Ch4', concept: '緊緻', rVersion: '閉 + 有界（Heine-Borel）', metricVersion: '每個開覆蓋有有限子覆蓋', color: '#aa5a6a' },
  { ch: 'Ch4', concept: 'IVT', rVersion: '連續 + [a,b] → 取到中間值', metricVersion: '連續映射保持連通性', color: '#5a8a5a' },
  { ch: 'Ch7', concept: '均勻收斂', rVersion: 'sup|fₙ − f| → 0', metricVersion: '(C(X), d_sup) 中的收斂', color: '#8a6aaa' },
];

@Component({
  selector: 'app-step-unification',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從 R 到度量空間：統一回顧" subtitle="§8.9">
      <p>
        前七章的每一個概念——收斂、連續、完備、緊緻——
        都是度量空間的<strong>特例</strong>。把 |·| 換成 d，一切自然推廣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點一列看 R 版 vs 度量空間版的對比">
      <div class="unif-table">
        @for (r of rows; track r.concept; let i = $index) {
          <div class="u-row" [class.expanded]="expanded() === i" (click)="expanded.set(expanded() === i ? -1 : i)">
            <div class="ur-header">
              <span class="ur-ch" [style.color]="r.color">{{ r.ch }}</span>
              <span class="ur-concept">{{ r.concept }}</span>
              <span class="ur-arrow">{{ expanded() === i ? '▾' : '▸' }}</span>
            </div>
            @if (expanded() === i) {
              <div class="ur-body">
                <div class="ur-side r-side">
                  <div class="urs-label">R 版</div>
                  <div class="urs-text">{{ r.rVersion }}</div>
                </div>
                <div class="ur-side m-side">
                  <div class="urs-label">度量空間版</div>
                  <div class="urs-text">{{ r.metricVersion }}</div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <div class="insight">
        度量空間是一副<strong>統一的眼鏡</strong>——
        戴上它，所有之前學過的定理都變成同一個定理的不同面貌。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節：心智圖，把整個實分析課程串起來。</p>
    </app-prose-block>
  `,
  styles: `
    .unif-table { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
    .u-row { border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
      cursor: pointer; transition: background 0.15s;
      &:hover { background: var(--bg-surface); }
      &.expanded { background: var(--bg-surface); } }
    .ur-header { display: flex; align-items: center; gap: 10px; padding: 10px 14px; }
    .ur-ch { font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace; min-width: 32px; }
    .ur-concept { font-size: 14px; font-weight: 600; color: var(--text); flex: 1; }
    .ur-arrow { font-size: 12px; color: var(--text-muted); }
    .ur-body { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 14px 12px; }
    @media (max-width: 500px) { .ur-body { grid-template-columns: 1fr; } }
    .ur-side { padding: 10px; border-radius: 6px;
      &.r-side { background: rgba(90,127,170,0.06); }
      &.m-side { background: rgba(200,152,59,0.06); } }
    .urs-label { font-size: 10px; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; }
    .urs-text { font-size: 12px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; line-height: 1.6; }
    .insight { padding: 14px; text-align: center; font-size: 14px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 10px; border: 2px solid var(--accent);
      strong { color: var(--accent); } }
  `,
})
export class StepUnificationComponent {
  readonly rows = ROWS;
  readonly expanded = signal(-1);
}
