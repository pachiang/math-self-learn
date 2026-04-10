import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; size?: number; }
interface ME { from: string; to: string; label: string; }

const NODES: MN[] = [
  // Part I foundation
  { id: 'complete', label: '完備性 Ch1', x: 60, y: 20, summary: '實數的完備性公理。一切的根基。', color: '#888', size: 0.7 },
  { id: 'metric', label: '度量空間 Ch8', x: 180, y: 20, summary: '距離的抽象化。Banach 不動點。', color: '#888', size: 0.7 },
  // Part II measure
  { id: 'measure', label: '測度 Ch9', x: 320, y: 20, summary: 'Lebesgue 測度。集合的「大小」。', color: '#888', size: 0.7 },
  { id: 'integral', label: '積分 Ch10', x: 440, y: 20, summary: 'Lebesgue 積分。MCT、DCT。', color: '#888', size: 0.7 },
  { id: 'lp', label: 'Lᵖ Ch11', x: 380, y: 90, summary: '完備的函數空間。Banach 空間。', color: '#5a7faa' },
  // Ch12 nodes
  { id: 'inner', label: '內積空間', x: 80, y: 100, summary: '向量空間 + 內積 ⟨·,·⟩。角度和正交。', color: '#c8983b', size: 1.1 },
  { id: 'hilbert', label: 'Hilbert 空間', x: 230, y: 100, summary: '完備的內積空間。L² 是典型例子。', color: 'var(--accent)', size: 1.3 },
  { id: 'proj', label: '正交投影', x: 80, y: 180, summary: '最佳逼近。f = proj + 殘差，兩者正交。', color: '#5a8a5a' },
  { id: 'fourier', label: 'Fourier 展開', x: 200, y: 180, summary: '正交基底展開。Parseval 能量守恆。連回線代 Ch12。', color: '#5a8a5a' },
  { id: 'complement', label: '正交補 M⊥', x: 320, y: 180, summary: 'H = M ⊕ M⊥。連回線代 Ch5 四子空間。', color: '#5a8a5a' },
  { id: 'riesz', label: 'Riesz 表示', x: 100, y: 260, summary: 'H* ≅ H。自對偶。連回線代 Ch18。', color: '#8a6aaa' },
  { id: 'weak', label: '弱收斂', x: 230, y: 260, summary: 'fₙ ⇀ f。比強收斂弱但夠用。變分法基礎。', color: '#8a6aaa' },
  { id: 'compact', label: '緊算子', x: 360, y: 260, summary: '無限維的「矩陣」。譜定理。連回線代 Ch6。', color: '#8a6aaa' },
  { id: 'quantum', label: '量子力學', x: 230, y: 330, summary: '態 = 向量。觀測 = 自伴算子。不確定性 = Cauchy-Schwarz。', color: '#aa5a6a' },
];

const EDGES: ME[] = [
  { from: 'complete', to: 'metric', label: '推廣' },
  { from: 'metric', to: 'measure', label: '賦測度' },
  { from: 'measure', to: 'integral', label: '定義積分' },
  { from: 'integral', to: 'lp', label: '建立空間' },
  { from: 'lp', to: 'hilbert', label: 'p=2' },
  { from: 'inner', to: 'hilbert', label: '+完備' },
  { from: 'hilbert', to: 'proj', label: '投影定理' },
  { from: 'hilbert', to: 'fourier', label: '正交基底' },
  { from: 'hilbert', to: 'complement', label: '分解' },
  { from: 'hilbert', to: 'riesz', label: 'H*≅H' },
  { from: 'hilbert', to: 'weak', label: '弱拓撲' },
  { from: 'hilbert', to: 'compact', label: '算子理論' },
  { from: 'riesz', to: 'quantum', label: 'Dirac' },
  { from: 'compact', to: 'quantum', label: '可觀測量' },
  { from: 'weak', to: 'quantum', label: '態空間' },
];

@Component({
  selector: 'app-step-ch12-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：Hilbert 空間" subtitle="§12.9">
      <p>
        Hilbert 空間是實分析 Part II 的頂點——測度 → 積分 → Lᵖ → L²（Hilbert）。
        它把線代的幾何直覺（正交、投影、特徵值）推廣到無限維，
        成為量子力學和現代 PDE 的語言。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要，點邊看關聯">
      <svg viewBox="0 0 500 370" class="map-svg">
        <!-- Edges -->
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                [attr.stroke]="hoveredEdge() === e ? 'var(--accent)' : 'var(--border)'"
                [attr.stroke-width]="hoveredEdge() === e ? 2 : 0.8"
                class="edge-line"
                (mouseenter)="hoveredEdge.set(e)"
                (mouseleave)="hoveredEdge.set(null)" />
          <!-- Edge label (visible on hover) -->
          @if (hoveredEdge() === e) {
            <rect [attr.x]="(nm[e.from].x + nm[e.to].x)/2 - 28"
                  [attr.y]="(nm[e.from].y + nm[e.to].y)/2 - 10"
                  width="56" height="16" rx="4"
                  fill="var(--accent)" fill-opacity="0.9" />
            <text [attr.x]="(nm[e.from].x + nm[e.to].x)/2"
                  [attr.y]="(nm[e.from].y + nm[e.to].y)/2 + 2"
                  class="edge-label">{{ e.label }}</text>
          }
        }

        <!-- Nodes -->
        @for (n of nodes; track n.id) {
          <g (click)="sel.set(sel() === n.id ? null : n.id)" class="ng"
             [class.active]="sel() === n.id" [class.faded]="n.color === '#888'">
            <rect [attr.x]="n.x - 48 * (n.size ?? 1)" [attr.y]="n.y - 13 * (n.size ?? 1)"
                  [attr.width]="96 * (n.size ?? 1)" [attr.height]="26 * (n.size ?? 1)" rx="8"
                  [attr.fill]="n.color" fill-opacity="0.15"
                  [attr.stroke]="n.color" stroke-width="1.5" />
            <text [attr.x]="n.x" [attr.y]="n.y + 4" class="nl"
                  [attr.fill]="n.color" [attr.font-size]="9 * (n.size ?? 1) + 'px'">{{ n.label }}</text>
          </g>
        }
      </svg>

      @if (selNode()) {
        <div class="tooltip" [style.border-color]="selNode()!.color">
          <div class="tt-title" [style.color]="selNode()!.color">{{ selNode()!.label }}</div>
          <div class="tt-body">{{ selNode()!.summary }}</div>
          <!-- Show connected edges -->
          <div class="tt-connections">
            @for (conn of connectedEdges(); track conn.label) {
              <span class="tt-conn">{{ conn.label }}</span>
            }
          </div>
        </div>
      } @else {
        <div class="hint">點節點看摘要 · 滑過邊看關聯</div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Part II（Ch9-12）從 Riemann 積分的局限走到 Hilbert 空間的量子力學：
        <strong>測度 → 積分 → Lᵖ → Hilbert → 算子 → 量子</strong>。
      </p>
      <p>
        12 章的實分析覆蓋了兩個完整學期的內容。
        恭喜你走到了現代數學的核心地帶。
      </p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; max-width: 580px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 14px; background: var(--bg); }
    .edge-line { cursor: pointer; transition: stroke 0.15s, stroke-width 0.15s; }
    .edge-label { font-size: 8px; fill: white; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; pointer-events: none; }
    .ng { cursor: pointer; transition: opacity 0.15s;
      &.faded { opacity: 0.5; }
      &.faded:hover { opacity: 0.8; } }
    .ng:hover rect { stroke-width: 2.5 !important; }
    .ng.active rect { stroke-width: 3 !important; filter: drop-shadow(0 0 6px rgba(0,0,0,0.12)); }
    .nl { text-anchor: middle; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .tooltip { padding: 16px; border: 2px solid; border-radius: 12px;
      background: var(--bg-surface); animation: fadeIn 0.15s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    .tt-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
    .tt-body { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 8px; }
    .tt-connections { display: flex; gap: 6px; flex-wrap: wrap; }
    .tt-conn { padding: 3px 8px; border-radius: 4px; font-size: 11px;
      background: var(--accent-10); color: var(--accent); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }

    .hint { text-align: center; font-size: 13px; color: var(--text-muted); padding: 16px; }
  `,
})
export class StepCh12MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly sel = signal<string | null>(null);
  readonly hoveredEdge = signal<ME | null>(null);
  readonly nm: Record<string, MN> = {};

  readonly selNode = computed(() => {
    const id = this.sel();
    return id ? NODES.find((n) => n.id === id) ?? null : null;
  });

  readonly connectedEdges = computed(() => {
    const id = this.sel();
    if (!id) return [];
    return EDGES.filter((e) => e.from === id || e.to === id);
  });

  constructor() { for (const n of NODES) this.nm[n.id] = n; }
}
