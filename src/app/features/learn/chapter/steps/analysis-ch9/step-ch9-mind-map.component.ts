import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'riemann', label: 'Riemann 局限', x: 200, y: 25, summary: '垂直切法，太多函數不可積，極限交換受限。', color: '#c8983b' },
  { id: 'outer', label: '外測度 m*', x: 80, y: 100, summary: '用開區間覆蓋取下確界。對所有子集有定義。', color: '#5a7faa' },
  { id: 'sigma', label: 'σ-代數', x: 200, y: 100, summary: 'Carathéodory 條件篩出「好」集合。對補集和可數聯集封閉。', color: '#5a7faa' },
  { id: 'measure', label: 'Lebesgue 測度', x: 320, y: 100, summary: '可數可加、平移不變、區間 = 長度。', color: '#5a8a5a' },
  { id: 'zero', label: '測度零', x: 80, y: 185, summary: '可數集、Cantor 集。「可忽略」的精確定義。', color: '#aa5a6a' },
  { id: 'vitali', label: '不可測集', x: 200, y: 185, summary: 'Vitali 集。需要選擇公理。不可測但不自然出現。', color: '#aa5a6a' },
  { id: 'measfn', label: '可測函數', x: 320, y: 185, summary: '水平切片可測。簡單函數逼近。Lebesgue 積分的對象。', color: '#8a6aaa' },
  { id: 'compare', label: 'vs Riemann', x: 200, y: 260, summary: 'Riemann 可積 ⟺ 間斷點測度零。Lebesgue 嚴格更強。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'riemann', to: 'outer' }, { from: 'outer', to: 'sigma' },
  { from: 'sigma', to: 'measure' }, { from: 'measure', to: 'zero' },
  { from: 'sigma', to: 'vitali' }, { from: 'measure', to: 'measfn' },
  { from: 'measfn', to: 'compare' }, { from: 'zero', to: 'compare' },
];

@Component({
  selector: 'app-step-ch9-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：Lebesgue 測度" subtitle="§9.9">
      <p>
        從 Riemann 的局限出發 → 外測度 → σ-代數 → Lebesgue 測度 →
        測度零、不可測集、可測函數 → 跟 Riemann 比較。
      </p>
      <p>
        下一章用這個測度定義<strong>Lebesgue 積分</strong>——真正解決 Riemann 的問題。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 420 290" class="map-svg">
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
  `,
  styles: `
    .map-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .ng { cursor: pointer; } .ng:hover rect { stroke-width: 2.5; } .ng.active rect { stroke-width: 3; }
    .nl { font-size: 9px; text-anchor: middle; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sb { padding: 14px; border: 2px solid; border-radius: 10px; background: var(--bg-surface); }
    .st { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .ss { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .hint { text-align: center; font-size: 12px; color: var(--text-muted); padding: 14px; }
  `,
})
export class StepCh9MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
