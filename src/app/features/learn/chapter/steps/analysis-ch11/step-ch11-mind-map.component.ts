import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'def', label: 'Lᵖ 定義', x: 80, y: 30, summary: '∫|f|ᵖ < ∞ 的可測函數。p-範數。', color: '#c8983b' },
  { id: 'holder', label: 'Hölder', x: 220, y: 30, summary: '∫|fg| ≤ ||f||ₚ · ||g||_q。共軛指數。', color: '#5a7faa' },
  { id: 'mink', label: 'Minkowski', x: 360, y: 30, summary: '||f+g||ₚ ≤ ||f||ₚ + ||g||ₚ。三角不等式。', color: '#5a7faa' },
  { id: 'rf', label: 'Riesz-Fischer', x: 100, y: 120, summary: 'Lᵖ 完備 → Banach 空間。', color: '#5a8a5a' },
  { id: 'l2', label: 'L² 內積', x: 250, y: 120, summary: '⟨f,g⟩ = ∫fg。Hilbert 空間。正交。', color: '#5a8a5a' },
  { id: 'dense', label: '稠密子集', x: 400, y: 120, summary: '簡單 ⊂ 連續 ⊂ C∞ᶜ 在 Lᵖ 中稠密。', color: '#aa5a6a' },
  { id: 'conv', label: '收斂模式', x: 130, y: 210, summary: 'Lᵖ / a.e. / 依測度 / 均勻。互不蘊含。', color: '#8a6aaa' },
  { id: 'dual', label: '(Lᵖ)* = Lq', x: 310, y: 210, summary: 'Riesz 表示。L² 自對偶。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'def', to: 'holder' }, { from: 'holder', to: 'mink' },
  { from: 'mink', to: 'rf' }, { from: 'rf', to: 'l2' },
  { from: 'def', to: 'dense' }, { from: 'rf', to: 'conv' },
  { from: 'l2', to: 'dual' },
];

@Component({
  selector: 'app-step-ch11-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：Lᵖ 空間" subtitle="§11.9">
      <p>
        Lᵖ 空間是 Lebesgue 積分的自然產物——完備的函數空間，配有範數（Banach）或內積（Hilbert）。
        它是泛函分析、PDE、概率論的共同語言。
      </p>
      <p>
        Part II（Ch9-11）完成了測度論的核心：<strong>測度 → 積分 → Lᵖ 空間</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 460 240" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                stroke="var(--border)" stroke-width="1" />
        }
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(n.id)" class="ng" [class.active]="sel() === n.id">
            <rect [attr.x]="n.x - 52" [attr.y]="n.y - 14" width="104" height="28" rx="8"
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
export class StepCh11MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
