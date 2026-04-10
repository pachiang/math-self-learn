import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'metric', label: '度量空間 (X,d)', x: 220, y: 30, summary: '集合 + 距離函數。三公理：正定、對稱、三角不等式。', color: 'var(--accent)' },
  { id: 'lp', label: 'Lᵖ 範數', x: 60, y: 100, summary: 'p=1 菱形，p=2 圓，p=∞ 方形。連續變形的超橢圓。', color: '#c8983b' },
  { id: 'fnspace', label: '函數空間', x: 160, y: 100, summary: 'C[0,1] 配 sup/L²/L¹ 範數。同集合不同度量。', color: '#c8983b' },
  { id: 'open', label: '開集/閉集', x: 310, y: 100, summary: '由度量衍生的拓撲。interior/closure/boundary。', color: '#5a7faa' },
  { id: 'conv', label: '收斂', x: 60, y: 190, summary: 'd(xₙ, x) → 0。推廣 Ch2 的 |aₙ-L| → 0。', color: '#5a8a5a' },
  { id: 'complete', label: '完備性', x: 160, y: 190, summary: 'Cauchy 列收斂。推廣 Ch1 完備性公理。', color: '#5a8a5a' },
  { id: 'compact', label: '緊緻性', x: 280, y: 190, summary: '開覆蓋 → 有限子覆蓋。推廣 Heine-Borel。', color: '#aa5a6a' },
  { id: 'connected', label: '連通性', x: 390, y: 190, summary: '不可分割。IVT 是推論。', color: '#aa5a6a' },
  { id: 'banach', label: '壓縮映射', x: 120, y: 270, summary: '完備 + 壓縮 → 唯一不動點。蜘蛛網收斂。', color: '#8a6aaa' },
  { id: 'unify', label: 'Ch1-7 統一', x: 300, y: 270, summary: '所有前面的定理都是度量空間的特例。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'metric', to: 'lp' }, { from: 'metric', to: 'fnspace' }, { from: 'metric', to: 'open' },
  { from: 'open', to: 'conv' }, { from: 'conv', to: 'complete' },
  { from: 'open', to: 'compact' }, { from: 'open', to: 'connected' },
  { from: 'complete', to: 'banach' }, { from: 'compact', to: 'unify' },
  { from: 'connected', to: 'unify' },
];

@Component({
  selector: 'app-step-ch8-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：度量空間" subtitle="§8.10">
      <p>
        八章走完，實分析的大脈絡：
      </p>
      <p>
        <strong>R 的完備性 → 數列/級數/連續/微分/積分 → 函數列 → 度量空間（統一框架）</strong>
      </p>
      <p>
        度量空間不是「新東西」——它是你已經學過的一切的<strong>自然推廣</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要——這是整門實分析的大地圖">
      <svg viewBox="0 0 460 310" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                stroke="var(--border)" stroke-width="1" />
        }
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(n.id)" class="ng" [class.active]="sel() === n.id">
            <rect [attr.x]="n.x - 55" [attr.y]="n.y - 15" width="110" height="30" rx="8"
                  [attr.fill]="n.color" fill-opacity="0.15" [attr.stroke]="n.color" stroke-width="1.5" />
            <text [attr.x]="n.x" [attr.y]="n.y + 5" class="nl" [attr.fill]="n.color">{{ n.label }}</text>
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
        恭喜你走完了八章實分析。從「√2 不是有理數」一路走到「度量空間的壓縮映射定理」——
        你現在擁有了理解現代數學的<strong>基本語言</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; max-width: 540px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .ng { cursor: pointer; } .ng:hover rect { stroke-width: 2.5; } .ng.active rect { stroke-width: 3; }
    .nl { font-size: 9px; text-anchor: middle; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sb { padding: 14px; border: 2px solid; border-radius: 10px; background: var(--bg-surface); }
    .st { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .ss { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .hint { text-align: center; font-size: 12px; color: var(--text-muted); padding: 14px; }
  `,
})
export class StepCh8MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
