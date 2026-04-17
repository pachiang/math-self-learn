import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'double', label: '重積分', x: 220, y: 30, summary: '∬f dA = lim Σf·ΔA。二維 Riemann 和。', color: 'var(--accent)' },
  { id: 'fubini', label: 'Fubini 定理', x: 100, y: 100, summary: '∬f dA = ∫(∫f dy)dx = ∫(∫f dx)dy。把雙重積分拆成累次積分。', color: '#c8983b' },
  { id: 'iterated', label: '累次積分', x: 320, y: 100, summary: '先算內層再算外層。關鍵是寫對上下限。', color: '#c8983b' },
  { id: 'nonrect', label: '非矩形區域', x: 60, y: 180, summary: 'Type I/II。y 的上下限是 x 的函數或反之。', color: '#5a7faa' },
  { id: 'order', label: '交換順序', x: 180, y: 180, summary: '畫出區域，改描述方式。可以把不可解變可解。', color: '#5a7faa' },
  { id: 'polar', label: '極座標', x: 320, y: 180, summary: 'dA = r dr dθ。圓形區域的最佳選擇。', color: '#5a8a5a' },
  { id: 'jacobian', label: 'Jacobian', x: 120, y: 260, summary: '|det J| 是面積拉伸因子。換元公式的核心。', color: '#aa5a6a' },
  { id: 'improper', label: '瑕積分', x: 260, y: 260, summary: '∬_{ℝ²} e^{-r²} dA = π。極座標 + 極限。', color: '#aa5a6a' },
  { id: 'apps', label: '面積/質心/慣性矩', x: 400, y: 260, summary: '∬1 dA, ∬x dA, ∬r² dA。工程物理核心。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'double', to: 'fubini' }, { from: 'double', to: 'iterated' },
  { from: 'fubini', to: 'nonrect' }, { from: 'fubini', to: 'order' },
  { from: 'iterated', to: 'polar' },
  { from: 'order', to: 'jacobian' }, { from: 'polar', to: 'jacobian' },
  { from: 'jacobian', to: 'improper' }, { from: 'polar', to: 'apps' },
];

@Component({
  selector: 'app-step-ch14-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：多變數積分" subtitle="§14.10">
      <p>
        十四章走完，多變數積分的脈絡：
      </p>
      <p>
        <strong>重積分 → Fubini 拆分 → 非矩形/換序 → 極座標/Jacobian → 應用</strong>
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要——多變數積分的全景">
      <svg viewBox="0 0 470 310" class="map-svg">
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
                  font-size="11" font-weight="600">{{ n.label }}</text>
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
export class StepCh14MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly active = signal('double');
  readonly nm: Record<string, MN> = {};

  readonly activeSummary = computed(() => {
    const node = NODES.find(n => n.id === this.active());
    return node?.summary ?? '';
  });

  constructor() {
    for (const n of NODES) this.nm[n.id] = n;
  }
}
