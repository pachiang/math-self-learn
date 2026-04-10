import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'simple', label: '簡單函數積分', x: 80, y: 30, summary: '∫φ = Σ aₖ · m(Eₖ)。高度 × 測度。Lebesgue 積分的起點。', color: '#c8983b' },
  { id: 'nonneg', label: '非負函數積分', x: 230, y: 30, summary: '∫f = sup ∫φ（φ ≤ f）。從下方逼近取上確界。', color: '#c8983b' },
  { id: 'general', label: '一般函數積分', x: 370, y: 30, summary: '∫f = ∫f⁺ − ∫f⁻。拆正負部。f ∈ L¹ ⟺ ∫|f| < ∞。', color: '#c8983b' },
  { id: 'mct', label: 'MCT', x: 100, y: 120, summary: '單調 + 逐點 → lim∫ = ∫lim。不需要均勻收斂。', color: '#5a8a5a' },
  { id: 'fatou', label: 'Fatou', x: 230, y: 120, summary: '∫lim inf ≤ lim inf ∫。面積可以「逃走」。', color: '#5a8a5a' },
  { id: 'dct', label: 'DCT', x: 360, y: 120, summary: '逐點 + 可積控制 → lim∫ = ∫lim。皇冠寶石。', color: '#5a8a5a' },
  { id: 'vs', label: 'vs Riemann', x: 140, y: 210, summary: 'Riemann 可積 → Lebesgue 可積，值相同。嚴格推廣。', color: '#8a6aaa' },
  { id: 'fubini', label: 'Fubini', x: 300, y: 210, summary: '重積分 = 逐次積分。積分順序可交換。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'simple', to: 'nonneg' }, { from: 'nonneg', to: 'general' },
  { from: 'nonneg', to: 'mct' }, { from: 'mct', to: 'fatou' },
  { from: 'fatou', to: 'dct' }, { from: 'general', to: 'vs' },
  { from: 'general', to: 'fubini' },
];

@Component({
  selector: 'app-step-ch10-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：Lebesgue 積分" subtitle="§10.9">
      <p>
        Lebesgue 積分的構造：簡單函數 → 非負函數 → 一般函數。
        三大收斂定理 MCT → Fatou → DCT 是核心工具。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 440 240" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                stroke="var(--border)" stroke-width="1" />
        }
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(n.id)" class="ng" [class.active]="sel() === n.id">
            <rect [attr.x]="n.x - 55" [attr.y]="n.y - 14" width="110" height="28" rx="8"
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
        Ch9（測度）+ Ch10（積分）完成了 Lebesgue 理論的核心。
        下一章看建立在 Lebesgue 積分上的<strong>Lᵖ 空間</strong>——
        泛函分析的起點。
      </p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; max-width: 520px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .ng { cursor: pointer; } .ng:hover rect { stroke-width: 2.5; } .ng.active rect { stroke-width: 3; }
    .nl { font-size: 9px; text-anchor: middle; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sb { padding: 14px; border: 2px solid; border-radius: 10px; background: var(--bg-surface); }
    .st { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .ss { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .hint { text-align: center; font-size: 12px; color: var(--text-muted); padding: 14px; }
  `,
})
export class StepCh10MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
