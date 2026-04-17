import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'vf', label: '向量場', x: 220, y: 30, summary: 'F: R² → R²。風場、力場、電場。每個點一個向量。', color: 'var(--accent)' },
  { id: 'scalar', label: '標量線積分', x: 80, y: 100, summary: '∫f ds = ∫f|r\'|dt。弧長、質量。方向無關。', color: '#c8983b' },
  { id: 'vector', label: '向量線積分', x: 220, y: 100, summary: '∫F·dr = ∫F·r\'dt。做功。方向相關。', color: '#c8983b' },
  { id: 'conservative', label: '保守場', x: 370, y: 100, summary: 'F=∇φ。路徑無關。閉路∮=0。', color: '#5a8a5a' },
  { id: 'curl', label: 'curl / div', x: 80, y: 190, summary: 'curl = ∂Q/∂x−∂P/∂y (旋轉)。div = ∂P/∂x+∂Q/∂y (膨脹)。', color: '#5a7faa' },
  { id: 'green', label: 'Green 定理', x: 220, y: 190, summary: '∮F·dr = ∬curl F dA。邊界環流=內部旋度。', color: '#aa5a6a' },
  { id: 'area', label: '面積公式', x: 370, y: 190, summary: 'A = ½∮(x dy−y dx)。邊界積分算面積。', color: '#5a8a5a' },
  { id: 'flux', label: '通量/散度', x: 130, y: 270, summary: '∮F·n ds = ∬div F dA。Green 的散度版本。', color: '#8a6aaa' },
  { id: 'sc', label: '單連通', x: 320, y: 270, summary: '無洞→curl=0⇔保守。有洞則不保證。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'vf', to: 'scalar' }, { from: 'vf', to: 'vector' }, { from: 'vf', to: 'conservative' },
  { from: 'vector', to: 'curl' }, { from: 'curl', to: 'green' }, { from: 'green', to: 'area' },
  { from: 'green', to: 'flux' }, { from: 'conservative', to: 'sc' },
];

@Component({
  selector: 'app-step-ch15-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：曲線積分與 Green 定理" subtitle="§15.10">
      <p><strong>向量場 → 線積分(標量/向量) → curl/div → Green 定理 → ���積/通量 → 單連通</strong></p>
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
            <rect [attr.x]="n.x - 55" [attr.y]="n.y - 14" width="110" height="28" rx="8"
                  [attr.fill]="active() === n.id ? n.color : 'var(--bg-surface)'"
                  [attr.stroke]="n.color" stroke-width="2" />
            <text [attr.x]="n.x" [attr.y]="n.y + 4" text-anchor="middle"
                  [attr.fill]="active() === n.id ? 'white' : n.color"
                  font-size="10" font-weight="600">{{ n.label }}</text>
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
export class StepCh15MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly active = signal('vf');
  readonly nm: Record<string, MN> = {};

  readonly activeSummary = computed(() => {
    const node = NODES.find(n => n.id === this.active());
    return node?.summary ?? '';
  });

  constructor() {
    for (const n of NODES) this.nm[n.id] = n;
  }
}
