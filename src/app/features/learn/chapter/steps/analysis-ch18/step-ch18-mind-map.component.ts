import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'why', label: '為什麼需要分佈', x: 220, y: 30, summary: 'δ不是函數，H不可微。需要推廣「函數」的概念。', color: 'var(--accent)' },
  { id: 'test', label: '測試函數 D', x: 80, y: 100, summary: 'C∞ + 緊支撐。bump function。分佈的「探針」。', color: '#c8983b' },
  { id: 'def', label: '分佈 = 線性泛函', x: 220, y: 100, summary: '⟨T,φ⟩ = T(φ)。吃函數吐數字。比函數更廣。', color: '#c8983b' },
  { id: 'delta', label: 'Dirac δ', x: 370, y: 100, summary: '⟨δ,φ⟩ = φ(0)。四種逼近族。面積=1的極限。', color: '#aa5a6a' },
  { id: 'deriv', label: '分佈導數', x: 80, y: 190, summary: "⟨T',φ⟩ = −⟨T,φ'⟩。每個分佈都 C∞。H'=δ。", color: '#5a7faa' },
  { id: 'schwartz', label: 'Schwartz S / S\'', x: 220, y: 190, summary: '快速衰減函數。F(S)=S。tempered distributions。', color: '#5a8a5a' },
  { id: 'fourier', label: 'F(δ) = 1', x: 370, y: 190, summary: '分佈的Fourier變換。不確定性原理的極端。', color: '#5a7faa' },
  { id: 'conv', label: '卷積/mollifier', x: 130, y: 270, summary: 'f*δ=f。δε是磨光器。平滑任何函數。', color: '#8a6aaa' },
  { id: 'green', label: 'Green 函數', x: 330, y: 270, summary: 'LG=δ → u=G*f。PDE 變成卷積。熱核=高斯。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'why', to: 'test' }, { from: 'why', to: 'def' }, { from: 'def', to: 'delta' },
  { from: 'test', to: 'deriv' }, { from: 'def', to: 'schwartz' }, { from: 'delta', to: 'fourier' },
  { from: 'deriv', to: 'conv' }, { from: 'schwartz', to: 'fourier' }, { from: 'fourier', to: 'green' },
];

@Component({
  selector: 'app-step-ch18-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：分佈與廣義函數" subtitle="§18.10">
      <p><strong>動機 → 測試函數/定義 → δ/導數 → Schwartz/Fourier → 卷積/Green 函數</strong></p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 460 310" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                stroke="var(--border)" stroke-width="1.5" />
        }
        @for (n of nodes; track n.id) {
          <g class="node" [class.active]="active() === n.id" (click)="active.set(n.id)">
            <rect [attr.x]="n.x - 60" [attr.y]="n.y - 14" width="120" height="28" rx="8"
                  [attr.fill]="active() === n.id ? n.color : 'var(--bg-surface)'"
                  [attr.stroke]="n.color" stroke-width="2" />
            <text [attr.x]="n.x" [attr.y]="n.y + 4" text-anchor="middle"
                  [attr.fill]="active() === n.id ? 'white' : n.color"
                  font-size="9.5" font-weight="600">{{ n.label }}</text>
          </g>
        }
      </svg>
      @if (activeSummary()) {
        <div class="summary">{{ activeSummary() }}</div>
      }
    </app-challenge-card>
  `,
  styles: `
    .map-svg { width: 100%; display: block; margin-bottom: 12px; }
    .node { cursor: pointer; }
    .node:hover rect { filter: brightness(1.1); }
    .summary { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 13px; text-align: center; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepCh18MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly active = signal('why');
  readonly nm: Record<string, MN> = {};
  readonly activeSummary = computed(() => NODES.find(n => n.id === this.active())?.summary ?? '');
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
