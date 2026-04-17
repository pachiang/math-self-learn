import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'why', label: '為什麼微分形式', x: 220, y: 30, summary: '統一 FTC/Green/Stokes/散度為一個公式 ∫_∂Ω ω = ∫_Ω dω。', color: 'var(--accent)' },
  { id: '1form', label: '1-form', x: 80, y: 100, summary: 'ω = P dx + Q dy。吃向量吐數字。向量場的「對偶」。', color: '#c8983b' },
  { id: '2form', label: '2-form / ∧', x: 220, y: 100, summary: 'dx∧dy = 有向面積。反對稱：α∧β = −β∧α。', color: '#c8983b' },
  { id: 'ed', label: '外微分 d', x: 370, y: 100, summary: 'd 統一 grad/curl/div。dd=0。閉⇒恰當（可縮空間）。', color: '#5a7faa' },
  { id: 'pb', label: '拉回 φ*', x: 80, y: 190, summary: '座標變換。φ*(dω) = d(φ*ω)。換元公式的本質。', color: '#5a8a5a' },
  { id: 'stokes', label: '廣義 Stokes', x: 220, y: 190, summary: '∫_∂Ω ω = ∫_Ω dω。一個公式統治一切。', color: '#aa5a6a' },
  { id: 'ce', label: 'closed / exact', x: 370, y: 190, summary: 'dω=0 (closed), ω=dα (exact)。差異=上同調=拓撲。', color: '#5a7faa' },
  { id: 'int', label: '積分', x: 130, y: 270, summary: 'k-form 在 k 維流形上積分。形式自動匹配維度。', color: '#8a6aaa' },
  { id: 'manifold', label: '流形展望', x: 320, y: 270, summary: '微分幾何、de Rham、Maxwell、辛幾何。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'why', to: '1form' }, { from: 'why', to: '2form' }, { from: 'why', to: 'ed' },
  { from: '1form', to: 'pb' }, { from: '2form', to: 'stokes' }, { from: 'ed', to: 'ce' },
  { from: 'pb', to: 'int' }, { from: 'stokes', to: 'int' }, { from: 'ce', to: 'manifold' },
];

@Component({
  selector: 'app-step-ch19-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：微分形式" subtitle="§19.10">
      <p><strong>動機 → 1-form/2-form/∧ → 外微分 d → 拉回/積分 → 廣義 Stokes → closed/exact → 流形</strong></p>
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
    .node { cursor: pointer; } .node:hover rect { filter: brightness(1.1); }
    .summary { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 13px; text-align: center; color: var(--text); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepCh19MindMapComponent {
  readonly nodes = NODES; readonly edges = EDGES;
  readonly active = signal('why');
  readonly nm: Record<string, MN> = {};
  readonly activeSummary = computed(() => NODES.find(n => n.id === this.active())?.summary ?? '');
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
