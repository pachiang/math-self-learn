import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { laplacianMatrix, sortedEigen, type GraphData } from './graph-util';

const N = 8;

// Two clusters with a bridge
function defaultEdges(): [number, number][] {
  return [
    // Cluster A: 0-1-2-3
    [0, 1], [1, 2], [2, 3], [0, 2], [1, 3],
    // Cluster B: 4-5-6-7
    [4, 5], [5, 6], [6, 7], [4, 6], [5, 7],
    // Bridge
    [3, 4],
  ];
}

function circlePos(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    // Arrange two halves on left/right
    if (i < n / 2) {
      const k = i, total = n / 2;
      return [
        -0.55 + 0.45 * Math.cos(2 * Math.PI * k / total),
        0.45 * Math.sin(2 * Math.PI * k / total),
      ] as [number, number];
    } else {
      const k = i - n / 2, total = n / 2;
      return [
        0.55 + 0.45 * Math.cos(2 * Math.PI * k / total),
        0.45 * Math.sin(2 * Math.PI * k / total),
      ] as [number, number];
    }
  });
}

@Component({
  selector: 'app-step-fiedler',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fiedler 值與代數連通度" subtitle="§14.4">
      <p>
        L 的特徵值排好：0 = λ₁ ≤ λ₂ ≤ … ≤ λₙ。
      </p>
      <p>
        第二小的 λ₂ 叫做 <strong>Fiedler 值</strong>（也叫代數連通度）：
      </p>
      <ul>
        <li>λ₂ = 0 ↔ 圖<strong>不連通</strong></li>
        <li>λ₂ 越大 → 圖越「緊密連接」</li>
        <li>λ₂ 對應的特徵向量（Fiedler 向量）的<strong>正負號</strong>自然地把圖切成兩半</li>
      </ul>
      <p>
        這就是「譜方法」的核心想法：用特徵向量來切圖。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點邊來移除/恢復，看 Fiedler 值怎麼變。節點顏色 = Fiedler 向量的正負">
      <div class="layout">
        <div class="graph-panel">
          <svg viewBox="-1.4 -1.1 2.8 2.2" class="g-svg">
            @for (e of edgeList(); track e.key) {
              <line [attr.x1]="e.x1" [attr.y1]="e.y1" [attr.x2]="e.x2" [attr.y2]="e.y2"
                    class="edge" (click)="toggleEdge(e.a, e.b)" />
            }
            @for (nd of nodeData; track nd.i) {
              <circle [attr.cx]="nd.x" [attr.cy]="nd.y" r="0.12"
                      [attr.fill]="fiedlerColor(nd.i)"
                      stroke="var(--border-strong)" stroke-width="0.025" />
              <text [attr.x]="nd.x" [attr.y]="nd.y + 0.045" class="n-label">{{ nd.i }}</text>
            }
          </svg>
          <div class="legend">
            <span class="dot blue"></span> Fiedler < 0
            <span class="dot rose"></span> Fiedler > 0
          </div>
        </div>

        <div class="info-panel">
          <div class="fiedler-box">
            <div class="f-title">Fiedler 值 λ₂</div>
            <div class="f-val">{{ fiedlerVal().toFixed(4) }}</div>
            <div class="f-note">
              @if (fiedlerVal() < 0.001) {
                圖不連通！
              } @else if (fiedlerVal() < 0.5) {
                連通但有明顯瓶頸
              } @else {
                連通且較緊密
              }
            </div>
          </div>

          <div class="vec-block">
            <div class="v-title">Fiedler 向量</div>
            <div class="v-row">
              @for (v of fiedlerVec(); track $index; let i = $index) {
                <div class="v-cell" [style.background]="vecBg(v)">
                  <div class="v-idx">{{ i }}</div>
                  <div class="v-num">{{ v.toFixed(2) }}</div>
                </div>
              }
            </div>
          </div>

          <div class="bar-section">
            <div class="b-title">全部特徵值</div>
            <div class="bars">
              @for (ev of eigenvals(); track $index; let i = $index) {
                <div class="bar-col">
                  <div class="bar"
                       [style.height.px]="Math.max(2, ev * 12)"
                       [class.fiedler]="i === 1"></div>
                  <div class="bar-num" [class.fiedler]="i === 1">{{ ev.toFixed(2) }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        試試看：
      </p>
      <ul>
        <li>移除橋邊 (3-4) → λ₂ 降到 0，圖斷成兩半</li>
        <li>在兩個群之間多加幾條邊 → λ₂ 增加，Fiedler 向量的正負分界線變模糊</li>
      </ul>
      <p>
        下一節把這個想法推廣到 k 群：<strong>譜聚類</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .graph-panel { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .g-svg { width: 100%; max-width: 320px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .edge { stroke: var(--text-muted); stroke-width: 0.03; cursor: pointer;
      &:hover { stroke: var(--accent); stroke-width: 0.05; } }
    .n-label { font-size: 0.12px; fill: white; text-anchor: middle; pointer-events: none;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .legend { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 12px; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 3px;
      &.blue { background: #5a7faa; } &.rose { background: #aa5a6a; } }

    .info-panel { display: flex; flex-direction: column; gap: 10px; }
    .fiedler-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--accent-10); text-align: center; }
    .f-title { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .f-val { font-size: 22px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .f-note { font-size: 11px; color: var(--text-secondary); }

    .vec-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .v-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .v-row { display: flex; gap: 4px; flex-wrap: wrap; }
    .v-cell { padding: 4px 6px; border-radius: 4px; text-align: center; min-width: 38px; }
    .v-idx { font-size: 9px; color: rgba(255,255,255,0.6); }
    .v-num { font-size: 11px; font-weight: 700; color: white;
      font-family: 'JetBrains Mono', monospace; }

    .bar-section { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .b-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .bars { display: flex; gap: 6px; align-items: flex-end; height: 70px; justify-content: center; }
    .bar-col { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .bar { width: 16px; background: var(--border-strong); border-radius: 3px 3px 0 0;
      min-height: 2px; transition: height 0.2s;
      &.fiedler { background: var(--accent); } }
    .bar-num { font-size: 9px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted);
      &.fiedler { color: var(--accent); font-weight: 700; } }
  `,
})
export class StepFiedlerComponent {
  readonly Math = Math;
  private readonly posArr = circlePos(N);
  readonly nodeData = this.posArr.map((p, i) => ({ i, x: p[0], y: p[1] }));

  readonly edgeSet = signal(
    new Set(defaultEdges().map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`)),
  );

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

  private readonly eigen = computed(() => sortedEigen(laplacianMatrix(this.graph())));

  readonly eigenvals = computed(() => this.eigen().values);
  readonly fiedlerVal = computed(() => this.eigenvals()[1] ?? 0);
  readonly fiedlerVec = computed(() => {
    const V = this.eigen().vectors;
    return V.map((row) => row[1]);
  });

  toggleEdge(a: number, b: number): void {
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    const next = new Set(this.edgeSet());
    if (next.has(key)) next.delete(key); else next.add(key);
    this.edgeSet.set(next);
  }

  fiedlerColor(i: number): string {
    const v = this.fiedlerVec()[i] ?? 0;
    const t = Math.min(1, Math.abs(v) * 3);
    return v >= 0
      ? `rgba(170, 90, 106, ${0.3 + t * 0.5})`
      : `rgba(90, 127, 170, ${0.3 + t * 0.5})`;
  }

  vecBg(v: number): string {
    const t = Math.min(1, Math.abs(v) * 3);
    return v >= 0
      ? `rgba(170, 90, 106, ${0.3 + t * 0.5})`
      : `rgba(90, 127, 170, ${0.3 + t * 0.5})`;
  }
}
