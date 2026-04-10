import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; label: string; }

const NODES: MN[] = [
  { id: 'cont', label: '連續 (Ch4)', x: 200, y: 25, summary: '可微 → 連續，但連續不一定可微。', color: '#5a7faa' },
  { id: 'deriv', label: '導數定義', x: 80, y: 95, summary: '差商的極限。割線 → 切線。最佳線性近似。', color: '#c8983b' },
  { id: 'diff-cont', label: '可微⟹連續', x: 200, y: 95, summary: '可微是比連續更嚴格的條件。|x| 是反例。', color: '#c8983b' },
  { id: 'rules', label: '微分法則', x: 320, y: 95, summary: '和差積商鏈——從定義推導出來的計算工具。', color: '#c8983b' },
  { id: 'mvt', label: '均值定理', x: 80, y: 175, summary: '某處的切線平行於割線。微積分最重要的定理。', color: '#5a8a5a' },
  { id: 'lhop', label: "L'Hôpital", x: 200, y: 175, summary: '0/0 或 ∞/∞ 不定式用導數的比來求。', color: '#5a8a5a' },
  { id: 'taylor', label: 'Taylor 餘項', x: 320, y: 175, summary: '精確的近似誤差界。Lagrange 餘項。', color: '#5a8a5a' },
  { id: 'convex', label: '凸函數', x: 130, y: 250, summary: "f'' ≥ 0。割線在曲線上方。Jensen 不等式。", color: '#8a6aaa' },
  { id: 'inverse', label: '反函數定理', x: 270, y: 250, summary: "f'≠0 → 局部可逆。(f⁻¹)' = 1/f'。", color: '#8a6aaa' },
];

const EDGES: ME[] = [
  { from: 'cont', to: 'diff-cont', label: '關係' },
  { from: 'deriv', to: 'diff-cont', label: '定義' },
  { from: 'deriv', to: 'rules', label: '運算' },
  { from: 'rules', to: 'mvt', label: '理論' },
  { from: 'mvt', to: 'lhop', label: '推論' },
  { from: 'deriv', to: 'taylor', label: '高階' },
  { from: 'mvt', to: 'convex', label: '應用' },
  { from: 'deriv', to: 'inverse', label: '應用' },
];

@Component({
  selector: 'app-step-ch5-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：微分" subtitle="§5.9">
      <p>
        微分的主線：<strong>定義（差商極限）→ 規則 → 均值定理 → 應用</strong>。
        均值定理是樞紐——L'Hôpital、Taylor 餘項、凸性判斷都從它推出。
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
      <p>五章下來：<strong>完備性 → 數列 → 級數 → 連續 → 微分</strong>。下一站：積分。</p>
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
export class StepCh5MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly nm: Record<string, MN> = {};
  readonly selNode = computed(() => { const id = this.sel(); return id ? NODES.find((n) => n.id === id) ?? null : null; });
  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
