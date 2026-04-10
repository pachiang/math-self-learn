import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; size?: number; }
interface ME { from: string; to: string; label: string; }

const NODES: MN[] = [
  { id: 'rn', label: 'Rⁿ 拓撲', x: 80, y: 30, summary: '範數等價、Heine-Borel、完備。有限維的好性質。', color: '#888', size: 0.8 },
  { id: 'limit', label: '多變數極限', x: 230, y: 30, summary: '所有方向逼近。路徑法不夠。ε-δ 是唯一正確的定義。', color: '#c8983b' },
  { id: 'partial', label: '偏導數', x: 380, y: 30, summary: '固定其他變數微分。Schwarz：混合偏導連續則可交換。', color: '#c8983b' },
  { id: 'total', label: '全微分', x: 130, y: 120, summary: '最佳線性近似。Jacobian 矩陣。比偏導數更強。', color: 'var(--accent)', size: 1.2 },
  { id: 'chain', label: '鏈式法則', x: 290, y: 120, summary: 'D(f∘g) = Df · Dg。Jacobian 乘法。連回線代矩陣乘法。', color: '#5a8a5a' },
  { id: 'taylor', label: 'Taylor / Hessian', x: 430, y: 120, summary: '二階展開用 Hessian。正定→極小，不定→鞍點。連回線代 Ch7。', color: '#5a8a5a' },
  { id: 'inverse', label: '反函數定理', x: 160, y: 210, summary: 'det J ≠ 0 → 局部可逆。核心用到壓縮映射（Ch8）。', color: '#8a6aaa' },
  { id: 'implicit', label: '隱函數定理', x: 340, y: 210, summary: '∂F/∂y ≠ 0 → 可解出 y(x)。跟反函數定理等價。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'rn', to: 'limit', label: '拓撲基礎' },
  { from: 'limit', to: 'partial', label: '座標方向' },
  { from: 'partial', to: 'total', label: '加強' },
  { from: 'total', to: 'chain', label: '組合' },
  { from: 'total', to: 'taylor', label: '高階' },
  { from: 'chain', to: 'inverse', label: '應用' },
  { from: 'inverse', to: 'implicit', label: '等價' },
  { from: 'taylor', to: 'implicit', label: '臨界點' },
];

@Component({
  selector: 'app-step-ch13-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：多變數微分" subtitle="§13.9">
      <p>
        多變數微分的主線：<strong>極限 → 偏導數 → 全微分 → 鏈式法則 → 反函數/隱函數定理</strong>。
        全微分（Jacobian）是中心概念——它統一了方向導數、鏈式法則、換變數。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要，滑過邊看關聯">
      <svg viewBox="0 0 500 250" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                [attr.stroke]="hovEdge() === e ? 'var(--accent)' : 'var(--border)'"
                [attr.stroke-width]="hovEdge() === e ? 2 : 0.8"
                class="edge-line" (mouseenter)="hovEdge.set(e)" (mouseleave)="hovEdge.set(null)" />
          @if (hovEdge() === e) {
            <rect [attr.x]="(nm[e.from].x+nm[e.to].x)/2 - 25"
                  [attr.y]="(nm[e.from].y+nm[e.to].y)/2 - 9"
                  width="50" height="14" rx="4" fill="var(--accent)" fill-opacity="0.9" />
            <text [attr.x]="(nm[e.from].x+nm[e.to].x)/2"
                  [attr.y]="(nm[e.from].y+nm[e.to].y)/2 + 2" class="el">{{ e.label }}</text>
          }
        }
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(sel() === n.id ? null : n.id)" class="ng"
             [class.active]="sel() === n.id" [class.faded]="n.color === '#888'">
            <rect [attr.x]="n.x - 50*(n.size??1)" [attr.y]="n.y - 13*(n.size??1)"
                  [attr.width]="100*(n.size??1)" [attr.height]="26*(n.size??1)" rx="8"
                  [attr.fill]="n.color" fill-opacity="0.15" [attr.stroke]="n.color" stroke-width="1.5" />
            <text [attr.x]="n.x" [attr.y]="n.y + 4" class="nl"
                  [attr.fill]="n.color" [attr.font-size]="9*(n.size??1) + 'px'">{{ n.label }}</text>
          </g>
        }
      </svg>

      @if (selNode()) {
        <div class="tooltip" [style.border-color]="selNode()!.color">
          <div class="tt-title" [style.color]="selNode()!.color">{{ selNode()!.label }}</div>
          <div class="tt-body">{{ selNode()!.summary }}</div>
          <div class="tt-conns">
            @for (c of connEdges(); track c.label) {
              <span class="tt-conn">{{ c.label }}</span>
            }
          </div>
        </div>
      } @else {
        <div class="hint">點節點看摘要 · 滑過邊看關聯</div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Part III 第一章完成。下一章：<strong>多變數積分</strong>（換變數公式、Fubini）。
      </p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; max-width: 580px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 14px; background: var(--bg); }
    .edge-line { cursor: pointer; transition: stroke 0.15s; }
    .el { font-size: 7px; fill: white; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; pointer-events: none; }
    .ng { cursor: pointer; transition: opacity 0.15s;
      &.faded { opacity: 0.5; } &.faded:hover { opacity: 0.8; } }
    .ng:hover rect { stroke-width: 2.5 !important; }
    .ng.active rect { stroke-width: 3 !important; }
    .nl { text-anchor: middle; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .tooltip { padding: 16px; border: 2px solid; border-radius: 12px;
      background: var(--bg-surface); animation: fadeIn 0.15s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }
    .tt-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
    .tt-body { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 8px; }
    .tt-conns { display: flex; gap: 6px; flex-wrap: wrap; }
    .tt-conn { padding: 3px 8px; border-radius: 4px; font-size: 11px;
      background: var(--accent-10); color: var(--accent); font-weight: 600; }
    .hint { text-align: center; font-size: 13px; color: var(--text-muted); padding: 16px; }
  `,
})
export class StepCh13MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly hovEdge = signal<ME | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  readonly connEdges = computed(() => { const id = this.sel(); return id ? EDGES.filter((e) => e.from === id || e.to === id) : []; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
