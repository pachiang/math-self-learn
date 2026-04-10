import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; label: string; }

const NODES: MN[] = [
  { id: 'pw', label: '逐點收斂', x: 80, y: 30, summary: '每個 x 各自收斂。不保持連續、微分、積分。', color: '#aa5a6a' },
  { id: 'uc', label: '均勻收斂', x: 240, y: 30, summary: 'sup 範數 → 0。一個 N 管所有 x。ε-管子。', color: '#5a8a5a' },
  { id: 'mtest', label: 'M-test', x: 370, y: 30, summary: '|fₙ| ≤ Mₙ 且 ΣMₙ 收斂 → 均勻+絕對收斂。', color: '#c8983b' },
  { id: 'cont', label: '保持連續', x: 80, y: 120, summary: '均勻極限 of 連續 = 連續。逐點收斂不行（xⁿ）。', color: '#5a8a5a' },
  { id: 'diff', label: '逐項微分', x: 200, y: 120, summary: '需要 Σfₙ\' 均勻收斂。比逐項積分更嚴格。', color: '#5a8a5a' },
  { id: 'int', label: '逐項積分', x: 320, y: 120, summary: '需要 Σfₙ 均勻收斂。「先加再積 = 先積再加」。', color: '#5a8a5a' },
  { id: 'power', label: '冪級數性質', x: 120, y: 210, summary: '收斂半徑內無限可微、可逐項操作。最乖的函數。', color: '#8a6aaa' },
  { id: 'sw', label: 'Stone-W.', x: 260, y: 210, summary: '連續函數可被多項式均勻逼近。Bernstein 多項式。', color: '#8a6aaa' },
  { id: 'aa', label: 'Arzela-Ascoli', x: 380, y: 210, summary: '有界+等度連續 → 有均勻收斂子列。函數版 BW。', color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'pw', to: 'uc', label: '加強' },
  { from: 'uc', to: 'mtest', label: '判定' },
  { from: 'uc', to: 'cont', label: '保持' },
  { from: 'uc', to: 'diff', label: '交換 d/dx' },
  { from: 'uc', to: 'int', label: '交換 ∫' },
  { from: 'mtest', to: 'power', label: '應用' },
  { from: 'cont', to: 'sw', label: '逼近' },
  { from: 'cont', to: 'aa', label: '子列' },
];

@Component({
  selector: 'app-step-ch7-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：函數列與均勻收斂" subtitle="§7.10">
      <p>
        均勻收斂是本章的<strong>中心概念</strong>。
        它讓「極限」和「分析操作」（連續、微分、積分）可以安全地<strong>交換順序</strong>。
      </p>
      <p>
        七章走完：<strong>完備性 → 數列 → 級數 → 連續 → 微分 → 積分 → 函數列</strong>。
        這是一門完整的實分析課程。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 440 250" class="map-svg">
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
export class StepCh7MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
