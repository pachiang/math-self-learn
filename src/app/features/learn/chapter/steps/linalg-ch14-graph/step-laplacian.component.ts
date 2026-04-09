import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import {
  adjacencyMatrix, degreeMatrix, laplacianMatrix, sortedEigen,
  type GraphData,
} from './graph-util';

const N = 6;

function makeDefault(): { edges: [number, number][]; } {
  return {
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3]],
  };
}

function circlePos(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => [
    Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  ] as [number, number]);
}

@Component({
  selector: 'app-step-laplacian',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="圖拉普拉斯矩陣" subtitle="§14.3">
      <p>
        把鄰接矩陣跟度矩陣結合，就得到<strong>拉普拉斯矩陣</strong>：
      </p>
      <p class="formula">L = D − A</p>
      <p>
        L 有幾個重要性質：
      </p>
      <ul>
        <li>L 是<strong>對稱矩陣</strong>（A 對稱 + D 對角 → L 對稱）。跟第七章的老朋友一樣。</li>
        <li>L 是<strong>半正定</strong>的：xᵀ L x ≥ 0 對所有 x。而且有一個漂亮的公式：</li>
      </ul>
      <p class="formula">xᵀ L x = Σ<sub>(i,j)∈E</sub> (xᵢ − xⱼ)²</p>
      <p>
        這就是「<strong>相鄰節點的差的平方和</strong>」。如果 x 在圖上「很平滑」（相鄰的 x 值差不多），
        xᵀ L x 就很小。如果 x 在相鄰節點上劇烈變化，這個值就很大。
      </p>
      <p>
        最小的特徵值永遠 = 0，特徵向量 = 全 1 向量。因為常數訊號的差 = 0。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="給每個節點一個值，看 xᵀLx 怎麼變。也試試斷開一條邊">
      <div class="layout">
        <div class="graph-panel">
          <svg viewBox="-1.6 -1.6 3.2 3.2" class="g-svg">
            @for (e of edgeList(); track e.key) {
              <line [attr.x1]="e.x1" [attr.y1]="e.y1" [attr.x2]="e.x2" [attr.y2]="e.y2"
                    class="edge" (click)="toggleEdge(e.a, e.b)" />
            }
            @for (nd of nodes; track nd.i) {
              <circle [attr.cx]="nd.x" [attr.cy]="nd.y" r="0.18"
                      [attr.fill]="nodeColor(nodeValues()[nd.i])"
                      stroke="var(--border-strong)" stroke-width="0.03" />
              <text [attr.x]="nd.x" [attr.y]="nd.y + 0.06" class="n-label">
                {{ nodeValues()[nd.i].toFixed(1) }}
              </text>
            }
          </svg>
          <div class="slider-grid">
            @for (nd of nodes; track nd.i) {
              <div class="s-row">
                <span class="s-id">x{{ nd.i }}</span>
                <input type="range" min="-2" max="2" step="0.1"
                       [value]="nodeValues()[nd.i]"
                       (input)="onVal(nd.i, $event)" class="s-input" />
              </div>
            }
          </div>
        </div>

        <div class="info-panel">
          <div class="mat-section">
            <div class="mat-label">L = D − A</div>
            <table class="l-table">
              @for (row of lap(); track $index) {
                <tr>
                  @for (v of row; track $index) {
                    <td [class.diag]="v > 0" [class.neg]="v < 0">{{ v }}</td>
                  }
                </tr>
              }
            </table>
          </div>

          <div class="quad-box">
            <span class="qf-label">xᵀ L x =</span>
            <span class="qf-val">{{ quadForm().toFixed(3) }}</span>
          </div>

          <div class="eigen-section">
            <div class="eig-label">L 的特徵值（從小到大）</div>
            <div class="eig-bars">
              @for (ev of eigenvals(); track $index; let i = $index) {
                <div class="eig-bar-wrap">
                  <div class="eig-bar" [style.height.px]="Math.max(2, ev * 14)"></div>
                  <div class="eig-num">{{ ev.toFixed(2) }}</div>
                </div>
              }
            </div>
            <div class="eig-note">零特徵值個數 = {{ zeroCount() }}（= 連通分量數）</div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        試試看：
      </p>
      <ul>
        <li>把所有 x 設成一樣 → xᵀ L x = 0（常數訊號）</li>
        <li>把相鄰節點的 x 設成一正一負 → xᵀ L x 很大</li>
        <li>斷開一條邊 → 零特徵值數量從 1 變 2（兩個連通分量）</li>
      </ul>
      <p>
        下一節看第二小的特徵值——<strong>Fiedler 值</strong>——他揭示圖的「連通程度」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .graph-panel { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .g-svg { width: 100%; max-width: 260px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .edge { stroke: var(--text-muted); stroke-width: 0.04; cursor: pointer;
      &:hover { stroke: var(--accent); stroke-width: 0.06; } }
    .n-label { font-size: 0.15px; fill: white; text-anchor: middle; pointer-events: none;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .slider-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; width: 100%; }
    .s-row { display: flex; align-items: center; gap: 4px; }
    .s-id { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      min-width: 22px; }
    .s-input { flex: 1; accent-color: var(--accent); height: 16px; }

    .info-panel { display: flex; flex-direction: column; gap: 12px; }
    .mat-section { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .mat-label { font-size: 12px; font-weight: 600; color: var(--text-muted);
      margin-bottom: 6px; text-align: center; }
    .l-table { margin: 0 auto; border-collapse: collapse; }
    .l-table td { width: 28px; height: 24px; text-align: center; font-size: 11px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      color: var(--text-muted);
      &.diag { color: var(--text); font-weight: 700; background: rgba(110, 138, 168, 0.15); }
      &.neg { color: #a05a5a; background: rgba(160, 90, 90, 0.08); } }

    .quad-box { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--accent-10); text-align: center; }
    .qf-label { font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; }
    .qf-val { font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin-left: 8px; }

    .eigen-section { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .eig-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .eig-bars { display: flex; gap: 8px; align-items: flex-end; justify-content: center;
      height: 80px; padding: 4px 0; }
    .eig-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .eig-bar { width: 20px; background: var(--accent); border-radius: 3px 3px 0 0;
      min-height: 2px; transition: height 0.2s; }
    .eig-num { font-size: 10px; font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted); }
    .eig-note { font-size: 11px; color: var(--text-secondary); margin-top: 6px; text-align: center; }
  `,
})
export class StepLaplacianComponent {
  readonly Math = Math;
  readonly n = N;
  readonly edgeSet = signal(new Set(makeDefault().edges.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`)));
  readonly nodeValues = signal<number[]>(Array.from({ length: N }, (_, i) => (i % 2 === 0 ? 1 : -1)));

  private readonly posArr = circlePos(N);
  readonly nodes = this.posArr.map((p, i) => ({ i, x: p[0], y: p[1] }));

  readonly graph = computed<GraphData>(() => {
    const es: [number, number][] = [];
    for (const k of this.edgeSet()) {
      const [a, b] = k.split('-').map(Number);
      es.push([a, b]);
    }
    return { n: N, edges: es };
  });

  readonly edgeList = computed(() => {
    const out: { key: string; a: number; b: number; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const k of this.edgeSet()) {
      const [a, b] = k.split('-').map(Number);
      out.push({
        key: k, a, b,
        x1: this.posArr[a][0], y1: this.posArr[a][1],
        x2: this.posArr[b][0], y2: this.posArr[b][1],
      });
    }
    return out;
  });

  readonly lap = computed(() => laplacianMatrix(this.graph()));

  readonly quadForm = computed(() => {
    const L = this.lap();
    const x = this.nodeValues();
    let s = 0;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        s += x[i] * L[i][j] * x[j];
    return s;
  });

  readonly eigenvals = computed(() => {
    const L = this.lap();
    if (L.length === 0) return [];
    return sortedEigen(L).values;
  });

  readonly zeroCount = computed(() =>
    this.eigenvals().filter((v) => Math.abs(v) < 0.01).length,
  );

  toggleEdge(a: number, b: number): void {
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    const next = new Set(this.edgeSet());
    if (next.has(key)) next.delete(key); else next.add(key);
    this.edgeSet.set(next);
  }

  onVal(i: number, ev: Event): void {
    const v = +(ev.target as HTMLInputElement).value;
    const next = [...this.nodeValues()];
    next[i] = v;
    this.nodeValues.set(next);
  }

  nodeColor(v: number): string {
    // map [-2, 2] to blue..red
    const t = (v + 2) / 4; // 0..1
    const r = Math.round(60 + t * 140);
    const b = Math.round(200 - t * 140);
    return `rgb(${r}, 80, ${b})`;
  }
}
