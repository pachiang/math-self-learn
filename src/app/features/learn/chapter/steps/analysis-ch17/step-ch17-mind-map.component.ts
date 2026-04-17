import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'fourier', label: 'Fourier 分析', x: 220, y: 30, summary: '用正弦波基底表示函數。周期→級數，非周期→變換。', color: 'var(--accent)' },
  { id: 'coeffs', label: 'Fourier 係數', x: 80, y: 100, summary: 'aₙ, bₙ 正交投影。奇函數只有 sin，偶函數只有 cos。', color: '#c8983b' },
  { id: 'partial', label: '部分和', x: 220, y: 100, summary: 'Sₙ(x) 截斷到 N 項。N↑ 逼近更好。', color: '#c8983b' },
  { id: 'gibbs', label: 'Gibbs 現象', x: 370, y: 100, summary: '不連續點~9%過衝。均勻收斂 vs L² 收斂的差異。', color: '#bf6e6e' },
  { id: 'convergence', label: '收斂定理', x: 80, y: 190, summary: 'L² / 逐點(Dirichlet) / 均勻。三層遞進。', color: '#5a7faa' },
  { id: 'parseval', label: 'Parseval', x: 220, y: 190, summary: '時域能量=頻域能量。L² 中的 Pythagoras。', color: '#5a8a5a' },
  { id: 'transform', label: 'Fourier 變換', x: 370, y: 190, summary: '非周期函數。T→∞ 級數→積分。時域⇄頻域。', color: '#5a7faa' },
  { id: 'convolution', label: '卷積定理', x: 130, y: 270, summary: 'f*g ↔ F̂·Ĝ。時域卷積=頻域乘法。FFT 的基礎。', color: '#aa5a6a' },
  { id: 'apps', label: '壓縮/熱方程', x: 320, y: 270, summary: 'JPEG/MP3 丟高頻。熱方程：高頻先衰減。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'fourier', to: 'coeffs' }, { from: 'fourier', to: 'partial' }, { from: 'fourier', to: 'gibbs' },
  { from: 'coeffs', to: 'convergence' }, { from: 'partial', to: 'parseval' }, { from: 'gibbs', to: 'transform' },
  { from: 'convergence', to: 'convolution' }, { from: 'parseval', to: 'apps' }, { from: 'transform', to: 'apps' },
];

@Component({
  selector: 'app-step-ch17-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：Fourier 分析" subtitle="§17.10">
      <p>Fourier 分析的全景：</p>
      <p><strong>正弦波基底 → 係數/部分和 → 收斂 → 變換/卷積 → 壓縮/PDE</strong></p>
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
export class StepCh17MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly active = signal('fourier');
  readonly nm: Record<string, MN> = {};

  readonly activeSummary = computed(() => {
    const node = NODES.find(n => n.id === this.active());
    return node?.summary ?? '';
  });

  constructor() {
    for (const n of NODES) this.nm[n.id] = n;
  }
}
