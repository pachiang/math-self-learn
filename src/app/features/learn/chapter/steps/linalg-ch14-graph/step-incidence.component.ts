import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { incidenceMatrix, type GraphData } from './graph-util';

// Fixed small directed graph: 4 nodes, 5 directed edges
const GRAPH: GraphData = {
  n: 4,
  edges: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 2]],
  directed: true,
};

const NODE_POS: [number, number][] = [
  [-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8],
];

const EDGE_LABELS = ['e₀', 'e₁', 'e₂', 'e₃', 'e₄'];

@Component({
  selector: 'app-step-incidence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="關聯矩陣與網路流" subtitle="§14.2">
      <p>
        鄰接矩陣記錄「誰連誰」。<strong>關聯矩陣 B</strong> 記錄的是「每條邊怎麼連」。
      </p>
      <p>
        在有向圖裡，B 是 n × |E| 的矩陣（n 個節點，|E| 條邊）。對邊 eₖ = (i → j)：
      </p>
      <p class="formula">B[i][k] = +1,&emsp;B[j][k] = −1</p>
      <p>
        換句話說，+1 = 「流出」，−1 = 「流入」。這跟電路裡的<strong>基爾霍夫電流定律</strong>直接對上：
        每個節點的流入 = 流出，寫成矩陣就是 Bᵀ f = 0。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整每條邊的電流，看哪些節點守恆">
      <div class="layout">
        <div class="graph-side">
          <svg viewBox="-1.6 -1.3 3.2 2.6" class="graph-svg">
            <defs>
              <marker id="inc-tip" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" fill="var(--text-muted)" />
              </marker>
            </defs>
            @for (e of edgeData; track e.label) {
              <line [attr.x1]="e.x1" [attr.y1]="e.y1" [attr.x2]="e.x2" [attr.y2]="e.y2"
                    class="dir-edge" marker-end="url(#inc-tip)" />
              <text [attr.x]="e.mx" [attr.y]="e.my" class="edge-label">{{ e.label }}</text>
            }
            @for (nd of nodeData; track nd.i) {
              <circle [attr.cx]="nd.x" [attr.cy]="nd.y" r="0.16"
                      class="node" [class.ok]="residuals()[nd.i] === 0"
                      [class.bad]="residuals()[nd.i] !== 0" />
              <text [attr.x]="nd.x" [attr.y]="nd.y + 0.055" class="node-txt">{{ nd.i }}</text>
            }
          </svg>
        </div>

        <div class="controls-side">
          <div class="flow-title">邊上的流量 f</div>
          @for (e of edgeData; track e.label; let k = $index) {
            <div class="flow-row">
              <span class="flow-label">{{ e.label }} ({{ graph.edges[k][0] }}→{{ graph.edges[k][1] }})</span>
              <input type="range" min="-3" max="3" step="1"
                     [value]="flows()[k]"
                     (input)="onFlow(k, $event)" class="flow-slider" />
              <span class="flow-val">{{ flows()[k] }}</span>
            </div>
          }
          <div class="residual-block">
            <div class="res-title">Bᵀ f（每個節點的淨流出）</div>
            @for (r of residuals(); track $index; let i = $index) {
              <span class="res-chip" [class.zero]="r === 0" [class.nonzero]="r !== 0">
                節點 {{ i }}: {{ r >= 0 ? '+' : '' }}{{ r }}
              </span>
            }
          </div>
        </div>
      </div>

      <div class="b-matrix">
        <div class="bm-title">關聯矩陣 B（{{ graph.n }} × {{ graph.edges.length }}）</div>
        <table class="bm-table">
          <thead>
            <tr>
              <th></th>
              @for (l of edgeLabels; track l) { <th>{{ l }}</th> }
            </tr>
          </thead>
          <tbody>
            @for (row of B; track $index; let i = $index) {
              <tr>
                <th>{{ i }}</th>
                @for (v of row; track $index) {
                  <td [class.pos]="v > 0" [class.neg]="v < 0">{{ v === 0 ? '·' : v > 0 ? '+1' : '−1' }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        你會發現：只有<strong>所有節點的 Bᵀ f 都 = 0</strong> 時，電流才守恆。
      </p>
      <p>
        一個重要的公式：<strong>Bᵀ B = L</strong>（拉普拉斯矩陣）。
        這把「邊的矩陣」跟「節點的矩陣」連起來了。下一節就來看 L。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .graph-side { display: flex; justify-content: center; }
    .graph-svg { width: 100%; max-width: 260px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .dir-edge { stroke: var(--text-muted); stroke-width: 0.035; }
    .edge-label { font-size: 0.18px; fill: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace; text-anchor: middle; }
    .node { stroke-width: 0.035; transition: fill 0.15s, stroke 0.15s;
      &.ok { fill: rgba(90, 138, 90, 0.25); stroke: #5a8a5a; }
      &.bad { fill: rgba(160, 90, 90, 0.25); stroke: #a05a5a; } }
    .node-txt { font-size: 0.16px; fill: var(--text); text-anchor: middle;
      font-weight: 700; pointer-events: none; }

    .controls-side { display: flex; flex-direction: column; gap: 8px; }
    .flow-title { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .flow-row { display: flex; align-items: center; gap: 8px; }
    .flow-label { font-size: 11px; color: var(--text-secondary); min-width: 80px;
      font-family: 'JetBrains Mono', monospace; }
    .flow-slider { flex: 1; accent-color: var(--accent); }
    .flow-val { font-size: 12px; font-weight: 700; color: var(--text); min-width: 24px;
      text-align: right; font-family: 'JetBrains Mono', monospace; }

    .residual-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); margin-top: 4px; }
    .res-title { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600; }
    .res-chip { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px;
      font-family: 'JetBrains Mono', monospace; margin: 2px 4px;
      &.zero { background: rgba(90, 138, 90, 0.15); color: #5a8a5a; }
      &.nonzero { background: rgba(160, 90, 90, 0.15); color: #a05a5a; } }

    .b-matrix { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .bm-title { font-size: 12px; font-weight: 600; color: var(--text-muted);
      margin-bottom: 8px; text-align: center; }
    .bm-table { margin: 0 auto; border-collapse: collapse; }
    .bm-table th { font-size: 11px; color: var(--text-muted); padding: 4px 8px;
      font-family: 'JetBrains Mono', monospace; }
    .bm-table td { text-align: center; padding: 5px 10px; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      color: var(--text-muted);
      &.pos { color: #5a8a5a; font-weight: 700; background: rgba(90, 138, 90, 0.1); }
      &.neg { color: #a05a5a; font-weight: 700; background: rgba(160, 90, 90, 0.1); } }
  `,
})
export class StepIncidenceComponent {
  readonly graph = GRAPH;
  readonly edgeLabels = EDGE_LABELS;
  readonly B = incidenceMatrix(GRAPH);

  readonly flows = signal([1, 1, 1, 1, 0]); // initial flows

  readonly residuals = computed(() => {
    const f = this.flows();
    // Bᵀ f: for each node sum of B[node][e] * f[e]
    const res: number[] = new Array(GRAPH.n).fill(0);
    for (let e = 0; e < GRAPH.edges.length; e++) {
      for (let i = 0; i < GRAPH.n; i++) {
        res[i] += this.B[i][e] * f[e];
      }
    }
    return res;
  });

  // Pre-computed geometry
  readonly nodeData = NODE_POS.map((p, i) => ({ i, x: p[0], y: p[1] }));

  readonly edgeData = GRAPH.edges.map(([a, b], k) => {
    const [x1, y1] = NODE_POS[a];
    const [x2, y2] = NODE_POS[b];
    // Shorten line to not overlap node circles
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const off = 0.18 / len;
    return {
      label: EDGE_LABELS[k],
      x1: x1 + dx * off, y1: y1 + dy * off,
      x2: x2 - dx * off, y2: y2 - dy * off,
      mx: (x1 + x2) / 2 + (dy / len) * 0.15,
      my: (y1 + y2) / 2 - (dx / len) * 0.15,
    };
  });

  onFlow(k: number, ev: Event): void {
    const v = +(ev.target as HTMLInputElement).value;
    const next = [...this.flows()];
    next[k] = v;
    this.flows.set(next);
  }
}
