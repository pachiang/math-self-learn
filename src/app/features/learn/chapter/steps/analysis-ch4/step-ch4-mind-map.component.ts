import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; label: string; }

const NODES: MN[] = [
  { id: 'seq-lim', label: 'ε-N (Ch2)', x: 200, y: 25, summary: '數列極限。Ch4 的 ε-δ 是同一個想法搬到函數上。', color: '#5a7faa' },
  { id: 'fn-lim', label: '函數極限 ε-δ', x: 80, y: 90, summary: 'lim(x→c) f(x) = L。ε 帶子 + δ 視窗。', color: '#c8983b' },
  { id: 'cont-def', label: '連續定義', x: 200, y: 90, summary: 'lim f(x) = f(c)。三個條件缺一不可。', color: '#c8983b' },
  { id: 'disc', label: '間斷點分類', x: 340, y: 90, summary: '可去、跳躍、振盪三種。', color: '#c8983b' },
  { id: 'ivt', label: 'IVT', x: 80, y: 175, summary: '連續函數不跳過中間值。二分法求根。', color: '#5a8a5a' },
  { id: 'evt', label: 'EVT', x: 200, y: 175, summary: '閉區間上連續函數達到最大最小值。', color: '#5a8a5a' },
  { id: 'uc', label: '均勻連續', x: 320, y: 175, summary: '一個 δ 管所有 x。Heine-Cantor 定理。', color: '#aa5a6a' },
  { id: 'fn-space', label: '函數空間', x: 200, y: 250, summary: 'C[a,b] + sup 範數。均勻收斂保持連續。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'seq-lim', to: 'fn-lim', label: '推廣' },
  { from: 'fn-lim', to: 'cont-def', label: '加 f(c)' },
  { from: 'cont-def', to: 'disc', label: '否定' },
  { from: 'cont-def', to: 'ivt', label: '定理' },
  { from: 'cont-def', to: 'evt', label: '定理' },
  { from: 'cont-def', to: 'uc', label: '強化' },
  { from: 'uc', to: 'fn-space', label: '完備' },
  { from: 'evt', to: 'uc', label: 'Heine-Cantor' },
];

@Component({
  selector: 'app-step-ch4-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：連續性" subtitle="§4.9">
      <p>
        第四章的主線：<strong>ε-δ 極限 → 連續定義 → 三大定理（IVT、EVT、Heine-Cantor）→ 函數空間</strong>。
      </p>
      <p>
        每一步都建立在前一步上。完備性（Ch1）→ 數列（Ch2）→ 級數（Ch3）→ 連續（Ch4）——
        實分析是一座層層疊上去的大樓。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 420 280" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                stroke="var(--border)" stroke-width="1" />
          <text [attr.x]="(nm[e.from].x + nm[e.to].x) / 2"
                [attr.y]="(nm[e.from].y + nm[e.to].y) / 2 - 4" class="el">{{ e.label }}</text>
        }
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(n.id)" class="ng" [class.active]="sel() === n.id">
            <rect [attr.x]="n.x - 50" [attr.y]="n.y - 14" width="100" height="28" rx="8"
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
      <p>
        四章下來你已經掌握了實分析最核心的四根柱子：
        <strong>完備性、數列極限、級數收斂、連續性</strong>。
        下一站：微分。
      </p>
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
export class StepCh4MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
