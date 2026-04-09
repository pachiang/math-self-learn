import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { adjacencyMatrix, degreeMatrix, type GraphData, forceLayout, type Pos } from './graph-util';

const PRESETS: { name: string; build: (n: number) => [number, number][] }[] = [
  {
    name: '完全圖',
    build: (n) => {
      const e: [number, number][] = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]);
      return e;
    },
  },
  {
    name: '路徑',
    build: (n) => Array.from({ length: n - 1 }, (_, i) => [i, i + 1] as [number, number]),
  },
  {
    name: '環',
    build: (n) => {
      const e: [number, number][] = Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);
      if (n > 2) e.push([n - 1, 0]);
      return e;
    },
  },
  {
    name: '星圖',
    build: (n) => Array.from({ length: n - 1 }, (_, i) => [0, i + 1] as [number, number]),
  },
  {
    name: '空圖',
    build: () => [],
  },
];

@Component({
  selector: 'app-step-graph-matrix',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="圖的矩陣表示" subtitle="§14.1">
      <p>
        一張<strong>圖</strong>就是一堆「節點」加上節點之間的「邊」。
        你每天用的社交網路、交通路線圖、甚至網際網路都是圖。
      </p>
      <p>
        給一個有 n 個節點的無向圖，最自然的矩陣表示有兩個：
      </p>
      <ul>
        <li><strong>鄰接矩陣 A</strong>：A[i][j] = 1 如果 i 跟 j 之間有邊，0 如果沒有。因為是無向圖，A = Aᵀ — 對稱矩陣！</li>
        <li><strong>度矩陣 D</strong>：對角矩陣，D[i][i] = 節點 i 連了幾條邊。</li>
      </ul>
      <p>
        這兩個矩陣後面會反覆出場。先在下面試試看。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點兩個節點來連邊，或用預設按鈕載入經典圖形">
      <div class="top-bar">
        <div class="presets">
          @for (p of presets; track p.name) {
            <button class="pre-btn" (click)="loadPreset(p)">{{ p.name }}</button>
          }
        </div>
        <div class="n-control">
          <span class="n-label">n = {{ n() }}</span>
          <input type="range" min="3" max="8" step="1" [value]="n()" (input)="onN($event)" class="n-slider" />
        </div>
      </div>

      <div class="main-area">
        <div class="graph-panel">
          <svg viewBox="-1.4 -1.4 2.8 2.8" class="graph-svg">
            <!-- Edges -->
            @for (e of edgeList(); track e.key) {
              <line [attr.x1]="e.x1" [attr.y1]="e.y1" [attr.x2]="e.x2" [attr.y2]="e.y2"
                    class="edge-line" />
            }
            <!-- Nodes -->
            @for (nd of nodeList(); track nd.i) {
              <g class="node-g" (click)="onNodeClick(nd.i)">
                <circle [attr.cx]="nd.x" [attr.cy]="nd.y" r="0.13"
                        class="node-circle"
                        [class.selected]="selected() === nd.i" />
                <text [attr.x]="nd.x" [attr.y]="nd.y + 0.045" class="node-label">{{ nd.i }}</text>
              </g>
            }
          </svg>
          @if (selected() !== null) {
            <div class="hint-text">選了節點 {{ selected() }}，再點另一個節點來連/斷邊</div>
          }
        </div>

        <div class="matrix-panel">
          <div class="mat-block">
            <div class="mat-title">鄰接矩陣 A</div>
            <table class="mat-table">
              @for (row of adj(); track $index; let i = $index) {
                <tr>
                  @for (val of row; track $index; let j = $index) {
                    <td class="mat-cell" [class.one]="val === 1"
                        [class.hl]="selected() === i || selected() === j">{{ val }}</td>
                  }
                </tr>
              }
            </table>
          </div>
          <div class="mat-block">
            <div class="mat-title">度矩陣 D</div>
            <table class="mat-table">
              @for (row of deg(); track $index; let i = $index) {
                <tr>
                  @for (val of row; track $index; let j = $index) {
                    <td class="mat-cell" [class.diag]="i === j && val > 0">{{ val }}</td>
                  }
                </tr>
              }
            </table>
          </div>
        </div>
      </div>

      <div class="stats">
        邊數 |E| = {{ edgeCount() }}
        A = Aᵀ ✓（無向圖的鄰接矩陣一定對稱）
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察一下：
      </p>
      <ul>
        <li><strong>完全圖</strong>的 A 除了對角線全部是 1，D 對角上全是 n−1</li>
        <li><strong>空圖</strong>的 A 和 D 都是零矩陣</li>
        <li><strong>星圖</strong>的中心節點度數 = n−1，其他 = 1</li>
      </ul>
      <p>
        下一節看另一種矩陣表示——<strong>關聯矩陣</strong>。他直接帶出電路裡的基爾霍夫定律。
      </p>
    </app-prose-block>
  `,
  styles: `
    .top-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; align-items: center; }
    .presets { display: flex; gap: 6px; flex-wrap: wrap; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); } }
    .n-control { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .n-label { font-size: 12px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 80px; accent-color: var(--accent); }

    .main-area { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 700px) { .main-area { grid-template-columns: 1fr; } }

    .graph-panel { display: flex; flex-direction: column; align-items: center; }
    .graph-svg { width: 100%; max-width: 280px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .edge-line { stroke: var(--text-muted); stroke-width: 0.03; }
    .node-circle { fill: var(--bg-surface); stroke: var(--border-strong); stroke-width: 0.03;
      cursor: pointer; transition: fill 0.12s;
      &:hover { fill: var(--accent-10); }
      &.selected { fill: var(--accent-18); stroke: var(--accent); stroke-width: 0.04; } }
    .node-label { font-size: 0.14px; fill: var(--text); text-anchor: middle; pointer-events: none;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .hint-text { font-size: 11px; color: var(--text-muted); margin-top: 6px; }

    .matrix-panel { display: flex; flex-direction: column; gap: 12px; }
    .mat-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .mat-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;
      text-align: center; }
    .mat-table { margin: 0 auto; border-collapse: collapse; }
    .mat-cell { width: 28px; height: 24px; text-align: center; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; color: var(--text-muted);
      border: 1px solid var(--border);
      &.one { background: rgba(200, 152, 59, 0.18); color: var(--text); font-weight: 700; }
      &.diag { background: rgba(110, 138, 168, 0.18); color: var(--text); font-weight: 700; }
      &.hl { background: var(--accent-10); } }

    .stats { padding: 10px; font-size: 12px; color: var(--text-secondary); text-align: center;
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      margin-top: 12px; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepGraphMatrixComponent {
  readonly presets = PRESETS;
  readonly n = signal(5);
  readonly edges = signal<Set<string>>(new Set());
  readonly selected = signal<number | null>(null);

  private positions = signal<Pos[]>([]);

  readonly graph = computed<GraphData>(() => {
    const es: [number, number][] = [];
    for (const key of this.edges()) {
      const [a, b] = key.split('-').map(Number);
      es.push([a, b]);
    }
    return { n: this.n(), edges: es };
  });

  readonly adj = computed(() => adjacencyMatrix(this.graph()));
  readonly deg = computed(() => degreeMatrix(this.graph()));
  readonly edgeCount = computed(() => this.edges().size);

  readonly nodeList = computed(() => {
    const pos = this.positions();
    return Array.from({ length: this.n() }, (_, i) => ({
      i,
      x: pos[i]?.x ?? Math.cos((2 * Math.PI * i) / this.n()),
      y: pos[i]?.y ?? Math.sin((2 * Math.PI * i) / this.n()),
    }));
  });

  readonly edgeList = computed(() => {
    const nodes = this.nodeList();
    const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const key of this.edges()) {
      const [a, b] = key.split('-').map(Number);
      out.push({ key, x1: nodes[a].x, y1: nodes[a].y, x2: nodes[b].x, y2: nodes[b].y });
    }
    return out;
  });

  constructor() {
    this.layoutCircle();
  }

  onN(ev: Event): void {
    const v = +(ev.target as HTMLInputElement).value;
    this.n.set(v);
    this.edges.set(new Set());
    this.selected.set(null);
    this.layoutCircle();
  }

  loadPreset(p: { name: string; build: (n: number) => [number, number][] }): void {
    const es = p.build(this.n());
    const set = new Set<string>();
    for (const [a, b] of es) set.add(`${Math.min(a, b)}-${Math.max(a, b)}`);
    this.edges.set(set);
    this.selected.set(null);

    // Re-layout for this preset
    const g: GraphData = { n: this.n(), edges: es };
    this.positions.set(forceLayout(g));
  }

  onNodeClick(i: number): void {
    const s = this.selected();
    if (s === null) {
      this.selected.set(i);
    } else if (s === i) {
      this.selected.set(null);
    } else {
      const key = `${Math.min(s, i)}-${Math.max(s, i)}`;
      const next = new Set(this.edges());
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      this.edges.set(next);
      this.selected.set(null);
    }
  }

  private layoutCircle(): void {
    const nn = this.n();
    this.positions.set(
      Array.from({ length: nn }, (_, i) => ({
        x: Math.cos((2 * Math.PI * i) / nn - Math.PI / 2),
        y: Math.sin((2 * Math.PI * i) / nn - Math.PI / 2),
      })),
    );
  }
}
