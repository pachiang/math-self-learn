import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { pagerank, type GraphData } from './graph-util';

const N = 7;
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Default directed edges forming a small "web"
const DEFAULT_EDGES: [number, number][] = [
  [0, 1], [0, 2],
  [1, 2], [1, 3],
  [2, 0],
  [3, 4], [3, 5],
  [4, 5],
  [5, 0],
  [6, 3],
];

// Fixed positions (hand-tuned for readability)
const POS: [number, number][] = [
  [-0.3, -0.9],
  [0.6, -0.6],
  [-0.8, 0.0],
  [0.5, 0.1],
  [1.0, 0.7],
  [-0.1, 0.8],
  [1.1, -0.3],
];

@Component({
  selector: 'app-step-pagerank',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="PageRank" subtitle="§14.6">
      <p>
        Google 最初成功的秘密武器就是 <strong>PageRank</strong>——用「連結結構」來排序網頁。
      </p>
      <p>
        想法：一個「隨機上網者」從某頁出發，每一步隨機點一個連結。
        經過夠多步數後，他停在某頁的<strong>機率</strong>就是那頁的「重要性」。
      </p>
      <p>
        但有個問題：如果走到一個沒有連結的頁面（dangling node）就卡住了。
        所以加一個「阻尼因子 d」：每一步有 d 的機率<strong>隨機跳到任一頁</strong>。
      </p>
      <p class="formula">r = (1−d) M r + (d/n) 1</p>
      <p>
        這就是一個<strong>馬可夫鏈的穩態分佈</strong>——第六章特徵值的老朋友。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點兩節點加/刪有向邊，調 damping 看 PageRank 怎麼變">
      <div class="ctrl-row">
        <div class="d-ctrl">
          <span class="d-label">damping d = {{ damping().toFixed(2) }}</span>
          <input type="range" min="0.05" max="0.50" step="0.05" [value]="damping()"
                 (input)="onDamping($event)" class="d-slider" />
        </div>
        @if (selectedNode() !== null) {
          <div class="hint">已選 {{ LABELS[selectedNode()!] }}，再點目標加/刪邊</div>
        }
      </div>

      <div class="layout">
        <div class="graph-side">
          <svg viewBox="-1.3 -1.3 2.6 2.6" class="g-svg">
            <defs>
              <marker id="pr-tip" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill="var(--text-muted)" />
              </marker>
            </defs>
            @for (e of edgeList(); track e.key) {
              <line [attr.x1]="e.x1" [attr.y1]="e.y1" [attr.x2]="e.x2" [attr.y2]="e.y2"
                    class="dir-edge" marker-end="url(#pr-tip)" />
            }
            @for (nd of nodeData; track nd.i) {
              <circle [attr.cx]="nd.x" [attr.cy]="nd.y"
                      [attr.r]="0.08 + ranks()[nd.i] * 1.2"
                      class="node" [class.selected]="selectedNode() === nd.i"
                      (click)="onNodeClick(nd.i)" />
              <text [attr.x]="nd.x" [attr.y]="nd.y + 0.04" class="n-label">{{ LABELS[nd.i] }}</text>
            }
          </svg>
        </div>

        <div class="rank-side">
          <div class="rank-title">PageRank（收斂於 {{ prIter() }} 步）</div>
          @for (nd of nodeData; track nd.i) {
            <div class="rank-row">
              <span class="rank-id">{{ LABELS[nd.i] }}</span>
              <div class="rank-bar-bg">
                <div class="rank-bar" [style.width.%]="ranks()[nd.i] * 100 / maxRank()"></div>
              </div>
              <span class="rank-val">{{ (ranks()[nd.i] * 100).toFixed(1) }}%</span>
            </div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察：
      </p>
      <ul>
        <li>被很多頁連到的頁面 PageRank 高——因為隨機上網者更容易走到那裡</li>
        <li>提高 damping → 分佈更均勻（隨機跳的機會多了）</li>
        <li>移除某頁的所有入邊 → 他的 rank 掉到接近 d/n</li>
      </ul>
      <p>
        本質上就是求一個<strong>矩陣的主特徵向量</strong>——第六章的冪次法。
        下一節看另一個角度：<strong>隨機漫步</strong>跟混合時間。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 14px; flex-wrap: wrap; align-items: center;
      margin-bottom: 12px; }
    .d-ctrl { display: flex; align-items: center; gap: 8px; }
    .d-label { font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 150px; }
    .d-slider { width: 120px; accent-color: var(--accent); }
    .hint { font-size: 11px; color: var(--accent); font-weight: 600; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .graph-side { display: flex; justify-content: center; }
    .g-svg { width: 100%; max-width: 280px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .dir-edge { stroke: var(--text-muted); stroke-width: 0.025; }
    .node { fill: var(--accent); fill-opacity: 0.7; stroke: var(--border-strong); stroke-width: 0.02;
      cursor: pointer; transition: r 0.3s, fill-opacity 0.2s;
      &:hover { fill-opacity: 1; }
      &.selected { stroke: var(--accent); stroke-width: 0.04; fill-opacity: 1; } }
    .n-label { font-size: 0.13px; fill: white; text-anchor: middle; pointer-events: none;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .rank-side { display: flex; flex-direction: column; gap: 6px; }
    .rank-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .rank-row { display: flex; align-items: center; gap: 8px; }
    .rank-id { font-size: 12px; font-weight: 700; color: var(--text); min-width: 16px;
      font-family: 'JetBrains Mono', monospace; }
    .rank-bar-bg { flex: 1; height: 14px; background: var(--bg-surface); border-radius: 4px;
      border: 1px solid var(--border); overflow: hidden; }
    .rank-bar { height: 100%; background: var(--accent); border-radius: 3px;
      transition: width 0.3s; }
    .rank-val { font-size: 11px; font-weight: 600; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; min-width: 46px; text-align: right; }
  `,
})
export class StepPagerankComponent {
  readonly LABELS = LABELS;
  readonly nodeData = POS.map((p, i) => ({ i, x: p[0], y: p[1] }));
  readonly damping = signal(0.15);
  readonly selectedNode = signal<number | null>(null);
  readonly edgeSet = signal(new Set(DEFAULT_EDGES.map(([a, b]) => `${a}->${b}`)));

  readonly graph = computed<GraphData>(() => {
    const es: [number, number][] = [];
    for (const k of this.edgeSet()) {
      const [a, b] = k.split('->').map(Number);
      es.push([a, b]);
    }
    return { n: N, edges: es, directed: true };
  });

  readonly edgeList = computed(() => {
    const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const k of this.edgeSet()) {
      const [a, b] = k.split('->').map(Number);
      const [x1, y1] = POS[a];
      const [x2, y2] = POS[b];
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const off = 0.14 / len;
      out.push({
        key: k,
        x1: x1 + dx * off, y1: y1 + dy * off,
        x2: x2 - dx * off, y2: y2 - dy * off,
      });
    }
    return out;
  });

  private readonly prResult = computed(() => pagerank(this.graph(), this.damping()));
  readonly ranks = computed(() => this.prResult().ranks);
  readonly prIter = computed(() => this.prResult().iterations);
  readonly maxRank = computed(() => Math.max(...this.ranks(), 0.01));

  onDamping(ev: Event): void {
    this.damping.set(+(ev.target as HTMLInputElement).value);
  }

  onNodeClick(i: number): void {
    const s = this.selectedNode();
    if (s === null) {
      this.selectedNode.set(i);
    } else if (s === i) {
      this.selectedNode.set(null);
    } else {
      // Toggle directed edge s -> i
      const key = `${s}->${i}`;
      const next = new Set(this.edgeSet());
      if (next.has(key)) next.delete(key); else next.add(key);
      this.edgeSet.set(next);
      this.selectedNode.set(null);
    }
  }
}
