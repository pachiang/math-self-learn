import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'surf', label: '參數曲面', x: 220, y: 30, summary: 'S(u,v) = (x,y,z)。球面、圓柱、拋物面。', color: 'var(--accent)' },
  { id: 'area', label: '曲面面積', x: 80, y: 100, summary: '∬|rᵤ×rᵥ| du dv。法向量長度=面積微元。', color: '#c8983b' },
  { id: 'scalint', label: '標量曲面積分', x: 220, y: 100, summary: '∬f dS。面積、質量。不分正反面。', color: '#c8983b' },
  { id: 'flux', label: '通量', x: 370, y: 100, summary: '∬F·dS = ∬F·n dS。穿過曲面的流量。', color: '#5a7faa' },
  { id: 'curl3d', label: '3D curl', x: 60, y: 190, summary: 'curl F = ∇×F。向量，方向=旋轉軸，大小=強度。', color: '#5a8a5a' },
  { id: 'div3d', label: '3D div', x: 180, y: 190, summary: 'div F = ∇·F。純量，正=源，負=匯。', color: '#5a8a5a' },
  { id: 'stokes', label: 'Stokes 定理', x: 330, y: 190, summary: '∮F·dr = ∬curl F·dS。線積分=curl 的通量。', color: '#aa5a6a' },
  { id: 'divthm', label: '散度定理', x: 130, y: 270, summary: '∬F·dS = ∭div F dV。通量=div 的體積分。', color: '#aa5a6a' },
  { id: 'orient', label: '定向', x: 270, y: 270, summary: '一致法向量。Möbius 帶不可定向。右手定則。', color: '#8a6aaa' },
  { id: 'ftc', label: '∫_∂Ω ω = ∫_Ω dω', x: 400, y: 270, summary: '大統一：FTC→Green→Stokes→散度。邊界積分=內部導數。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'surf', to: 'area' }, { from: 'surf', to: 'scalint' }, { from: 'surf', to: 'flux' },
  { from: 'scalint', to: 'curl3d' }, { from: 'flux', to: 'div3d' },
  { from: 'curl3d', to: 'stokes' }, { from: 'div3d', to: 'divthm' },
  { from: 'stokes', to: 'orient' }, { from: 'stokes', to: 'ftc' },
];

@Component({
  selector: 'app-step-ch16-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：曲面積分與 Stokes/散度" subtitle="§16.10">
      <p><strong>參數曲面 → 面積/通量 → curl/div → Stokes/散度定理 → ∫_∂Ω ω = ∫_Ω dω</strong></p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 470 310" class="map-svg">
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
                  font-size="9" font-weight="600">{{ n.label }}</text>
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
export class StepCh16MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly active = signal('surf');
  readonly nm: Record<string, MN> = {};
  readonly activeSummary = computed(() => NODES.find(n => n.id === this.active())?.summary ?? '');
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
