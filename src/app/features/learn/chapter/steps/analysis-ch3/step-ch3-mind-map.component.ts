import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; label: string; }

const NODES: MN[] = [
  { id: 'seq', label: '數列 (Ch2)', x: 200, y: 25, summary: '級數 = 部分和數列的極限。Ch2 的工具全部適用。', color: '#5a7faa' },
  { id: 'series-def', label: '級數定義', x: 80, y: 90, summary: '部分和 Sₙ 的收斂性。必要條件 aₙ→0。', color: '#c8983b' },
  { id: 'comparison', label: '比較法', x: 40, y: 160, summary: '跟已知級數比大小。直接比較和極限比較。', color: '#5a8a5a' },
  { id: 'ratio-root', label: '比值/根式', x: 150, y: 160, summary: 'lim|aₙ₊₁/aₙ| 和 lim|aₙ|^(1/n) 跟 1 比。', color: '#5a8a5a' },
  { id: 'integral', label: '積分判別', x: 260, y: 160, summary: '用積分比較。p 級數：p>1 收斂。', color: '#5a8a5a' },
  { id: 'alternating', label: '交替級數', x: 370, y: 160, summary: 'Leibniz 判別法。誤差界 ≤ bₙ₊₁。', color: '#aa5a6a' },
  { id: 'abs-cond', label: '絕對/條件', x: 310, y: 90, summary: '絕對收斂安全可重排；條件收斂的和取決於順序（Riemann 重排）。', color: '#aa5a6a' },
  { id: 'power', label: '冪級數', x: 120, y: 240, summary: 'Σaₙxⁿ，收斂半徑 R。區間內可逐項微積分。', color: '#8a6aaa' },
  { id: 'taylor', label: 'Taylor', x: 280, y: 240, summary: 'f(x) = Σf⁽ⁿ⁾(a)/n! (x−a)ⁿ。函數用多項式逼近。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'seq', to: 'series-def', label: '部分和' },
  { from: 'series-def', to: 'comparison', label: '判別' },
  { from: 'series-def', to: 'ratio-root', label: '判別' },
  { from: 'series-def', to: 'integral', label: '判別' },
  { from: 'series-def', to: 'alternating', label: '帶符號' },
  { from: 'alternating', to: 'abs-cond', label: '分類' },
  { from: 'comparison', to: 'power', label: '應用' },
  { from: 'ratio-root', to: 'power', label: '求 R' },
  { from: 'power', to: 'taylor', label: '特例' },
];

@Component({
  selector: 'app-step-ch3-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：級數" subtitle="§3.9">
      <p>
        級數的核心問題只有一個：<strong>這個無限和收斂嗎？</strong>
        每個判別法都是回答這個問題的工具。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 420 275" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                stroke="var(--border)" stroke-width="1" />
          <text [attr.x]="(nm[e.from].x + nm[e.to].x) / 2"
                [attr.y]="(nm[e.from].y + nm[e.to].y) / 2 - 4" class="el">{{ e.label }}</text>
        }
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(n.id)" class="ng" [class.active]="sel() === n.id">
            <rect [attr.x]="n.x - 48" [attr.y]="n.y - 14" width="96" height="28" rx="8"
                  [attr.fill]="n.color" fill-opacity="0.15" [attr.stroke]="n.color" stroke-width="1.5" />
            <text [attr.x]="n.x" [attr.y]="n.y + 4" class="nl" [attr.fill]="n.color">{{ n.label }}</text>
          </g>
        }
      </svg>

      @if (selNode()) {
        <div class="sb" [style.border-color]="selNode()!.color">
          <div class="st" [style.color]="selNode()!.color">{{ selNode()!.label }}</div>
          <div class="ss">{{ selNode()!.summary }}</div>
        </div>
      } @else { <div class="hint">點一個節點看摘要</div> }
    </app-challenge-card>

    <app-prose-block>
      <p>下一章：<strong>連續性</strong>——把極限的概念從數列搬到函數。</p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .el { font-size: 7px; fill: var(--text-muted); text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .ng { cursor: pointer; } .ng:hover rect { stroke-width: 2.5; } .ng.active rect { stroke-width: 3; }
    .nl { font-size: 9px; text-anchor: middle; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sb { padding: 14px; border: 2px solid; border-radius: 10px; background: var(--bg-surface); }
    .st { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .ss { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .hint { text-align: center; font-size: 12px; color: var(--text-muted); padding: 14px; }
  `,
})
export class StepCh3MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
