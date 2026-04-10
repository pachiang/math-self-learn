import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; label: string; }

const NODES: MN[] = [
  { id: 'diff', label: '微分 (Ch5)', x: 200, y: 25, summary: 'FTC 把微分和積分連起來。積分是微分的逆。', color: '#5a7faa' },
  { id: 'idea', label: 'Riemann 想法', x: 60, y: 90, summary: '長方形逼近面積。分割越細越準。', color: '#c8983b' },
  { id: 'ul', label: '上和/下和', x: 180, y: 90, summary: '上和從上方夾，下和從下方夾。差趨向 0 就可積。', color: '#c8983b' },
  { id: 'integ', label: '可積條件', x: 320, y: 90, summary: '連續 → 可積。間斷點測度零 → 可積。Dirichlet 不可積。', color: '#c8983b' },
  { id: 'ftc', label: 'FTC', x: 100, y: 175, summary: '微積分基本定理。F(x) = ∫f → F\' = f。∫f = F(b)−F(a)。', color: '#5a8a5a' },
  { id: 'tech', label: '積分技巧', x: 230, y: 175, summary: '換元、分部、部分分式——找反導數的三大工具。', color: '#5a8a5a' },
  { id: 'improper', label: '瑕積分', x: 360, y: 175, summary: '無窮區間或無界函數。p>1 收斂。', color: '#aa5a6a' },
  { id: 'interchange', label: '逐項積分', x: 140, y: 250, summary: '均勻收斂 → 可以交換 Σ 和 ∫。', color: '#8a6aaa' },
  { id: 'gamma', label: 'Gamma 函數', x: 300, y: 250, summary: 'Γ(s) = ∫t^(s−1)e^(−t)dt。階乘的連續版本。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'diff', to: 'ftc', label: '逆運算' },
  { from: 'idea', to: 'ul', label: '嚴格化' },
  { from: 'ul', to: 'integ', label: '判準' },
  { from: 'integ', to: 'ftc', label: '計算' },
  { from: 'ftc', to: 'tech', label: '技巧' },
  { from: 'integ', to: 'improper', label: '推廣' },
  { from: 'ftc', to: 'interchange', label: '交換' },
  { from: 'improper', to: 'gamma', label: '應用' },
];

@Component({
  selector: 'app-step-ch6-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：Riemann 積分" subtitle="§6.9">
      <p>
        六章完成了實分析最核心的脈絡：
        <strong>完備性 → 數列 → 級數 → 連續 → 微分 → 積分</strong>。
        FTC 把微分和積分合為一體。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 420 280" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                stroke="var(--border)" stroke-width="1" />
        }
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(n.id)" class="ng" [class.active]="sel() === n.id">
            <rect [attr.x]="n.x - 50" [attr.y]="n.y - 14" width="100" height="28" rx="8"
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
        這六章構成了一門完整的「一學期實分析」課程。
        後續可以走向度量空間、Lebesgue 積分、函數分析⋯⋯
        但基礎已經穩固。
      </p>
    </app-prose-block>
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
export class StepCh6MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
