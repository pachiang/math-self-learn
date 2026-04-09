import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { adjacencyMatrix, type GraphData } from './graph-util';

type Preset = { name: string; n: number; edges: [number, number][]; pos: [number, number][] };

const PRESETS: Preset[] = [
  {
    name: '快混合（密圖）',
    n: 8,
    edges: [
      [0,1],[0,2],[0,3],[0,4],[1,2],[1,5],[2,3],[2,6],
      [3,4],[3,7],[4,5],[5,6],[5,7],[6,7],[1,6],[4,7],
    ],
    pos: [
      [-0.7,-0.7],[0.0,-1.0],[0.7,-0.7],[1.0,0.0],
      [0.7,0.7],[0.0,1.0],[-0.7,0.7],[-1.0,0.0],
    ],
  },
  {
    name: '慢混合（啞鈴）',
    n: 8,
    edges: [
      [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
      [4,5],[4,6],[4,7],[5,6],[5,7],[6,7],
      [3,4],
    ],
    pos: [
      [-0.9,-0.3],[-0.9,0.3],[-0.5,-0.3],[-0.5,0.3],
      [0.5,-0.3],[0.5,0.3],[0.9,-0.3],[0.9,0.3],
    ],
  },
  {
    name: '路徑',
    n: 8,
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],
    pos: Array.from({ length: 8 }, (_, i) => [-1.0 + i * 2 / 7, 0] as [number, number]),
  },
];

@Component({
  selector: 'app-step-random-walk',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="隨機漫步" subtitle="§14.7">
      <p>
        在無向圖上做<strong>隨機漫步</strong>：站在某個節點，每一步均勻地選一個鄰居走過去。
      </p>
      <p>
        走夠多步之後，「你花在每個節點的時間比例」會收斂到一個固定分佈——<strong>穩態分佈</strong>：
      </p>
      <p class="formula">π(i) = degree(i) / (2 |E|)</p>
      <p>
        度大的節點你會更常拜訪。「多快」收斂叫做<strong>混合時間</strong>——他跟拉普拉斯的
        第二特徵值 λ₂ 直接相關。λ₂ 越大 → 混合越快。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選圖形，看隨機漫步的人多快收斂到穩態">
      <div class="ctrl-bar">
        <div class="presets">
          @for (p of presets; track p.name; let i = $index) {
            <button class="pre-btn" [class.active]="presetIdx() === i" (click)="loadPreset(i)">{{ p.name }}</button>
          }
        </div>
        <div class="btn-group">
          <button class="act-btn" (click)="step()">一步</button>
          <button class="act-btn" (click)="toggleRun()">{{ running() ? '暫停' : '連續' }}</button>
          <button class="act-btn reset" (click)="reset()">重置</button>
        </div>
      </div>

      <div class="layout">
        <div class="graph-side">
          <svg viewBox="-1.4 -1.3 2.8 2.6" class="g-svg">
            @for (e of edgeList(); track e.key) {
              <line [attr.x1]="e.x1" [attr.y1]="e.y1" [attr.x2]="e.x2" [attr.y2]="e.y2" class="edge" />
            }
            @for (nd of nodeList(); track nd.i) {
              <circle [attr.cx]="nd.x" [attr.cy]="nd.y" r="0.12"
                      class="node" [class.walker]="walkerPos() === nd.i"
                      [attr.fill-opacity]="0.2 + empirical()[nd.i] * 3" />
              <text [attr.x]="nd.x" [attr.y]="nd.y + 0.045" class="n-label">{{ nd.i }}</text>
            }
            <!-- Walker -->
            <circle [attr.cx]="walkerX()" [attr.cy]="walkerY()" r="0.07"
                    class="walker-dot" />
          </svg>
          <div class="step-count">步數：{{ totalSteps() }}　TV 距離：{{ tvDist().toFixed(3) }}</div>
        </div>

        <div class="hist-side">
          <div class="h-title">經驗分佈 vs 穩態分佈</div>
          <div class="hist-area">
            @for (nd of nodeList(); track nd.i) {
              <div class="hist-col">
                <div class="bar-pair">
                  <div class="bar emp" [style.height.px]="empirical()[nd.i] * 240"></div>
                  <div class="bar stat" [style.height.px]="stationary()[nd.i] * 240"></div>
                </div>
                <div class="hist-label">{{ nd.i }}</div>
              </div>
            }
          </div>
          <div class="legend">
            <span class="leg-item"><span class="leg-box emp"></span>經驗</span>
            <span class="leg-item"><span class="leg-box stat"></span>穩態 π</span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="第十四章總結">
      <p>
        你在這一章看到了：
      </p>
      <ul>
        <li><strong>鄰接矩陣 A</strong>：圖 → 矩陣，對稱</li>
        <li><strong>關聯矩陣 B</strong>：邊 → 矩陣，基爾霍夫定律</li>
        <li><strong>拉普拉斯 L = D − A</strong>：半正定對稱矩陣，xᵀLx 量測平滑度</li>
        <li><strong>Fiedler 值</strong>：λ₂ = 代數連通度，Fiedler 向量切圖</li>
        <li><strong>譜聚類</strong>：用特徵向量做嵌入 → 分群</li>
        <li><strong>PageRank</strong>：有向圖 + 阻尼 → 主特徵向量</li>
        <li><strong>隨機漫步</strong>：穩態分佈 ∝ 度，混合快慢 ∝ λ₂</li>
      </ul>
      <p>
        全部都是<strong>線性代數</strong>——矩陣乘法、特徵值、特徵向量。
        圖不過是另一種「數據」，而線性代數是分析他的通用工具。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .presets { display: flex; gap: 6px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .btn-group { display: flex; gap: 6px; margin-left: auto; }
    .act-btn { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.reset { color: var(--text-muted); } }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .graph-side { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .g-svg { width: 100%; max-width: 280px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }
    .edge { stroke: var(--text-muted); stroke-width: 0.03; }
    .node { fill: var(--accent); stroke: var(--border-strong); stroke-width: 0.025;
      transition: fill-opacity 0.3s;
      &.walker { stroke: var(--accent); stroke-width: 0.04; } }
    .walker-dot { fill: #c8983b; stroke: white; stroke-width: 0.025;
      transition: cx 0.15s, cy 0.15s; }
    .n-label { font-size: 0.11px; fill: white; text-anchor: middle; pointer-events: none;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .step-count { font-size: 11px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }

    .hist-side { display: flex; flex-direction: column; gap: 6px; }
    .h-title { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .hist-area { display: flex; gap: 8px; align-items: flex-end; height: 160px; }
    .hist-col { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
    .bar-pair { display: flex; gap: 2px; align-items: flex-end; }
    .bar { width: 12px; border-radius: 2px 2px 0 0; min-height: 1px; transition: height 0.2s;
      &.emp { background: var(--accent); }
      &.stat { background: var(--text-muted); opacity: 0.4; } }
    .hist-label { font-size: 10px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
    .legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); }
    .leg-item { display: flex; align-items: center; gap: 4px; }
    .leg-box { width: 10px; height: 10px; border-radius: 2px;
      &.emp { background: var(--accent); }
      &.stat { background: var(--text-muted); opacity: 0.4; } }
  `,
})
export class StepRandomWalkComponent implements OnDestroy {
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly walkerPos = signal(0);
  readonly visitCounts = signal<number[]>(new Array(8).fill(0));
  readonly totalSteps = signal(0);
  readonly running = signal(false);

  private timerHandle: ReturnType<typeof setInterval> | null = null;

  readonly currentPreset = computed(() => PRESETS[this.presetIdx()]);
  readonly graph = computed<GraphData>(() => {
    const p = this.currentPreset();
    return { n: p.n, edges: p.edges };
  });

  readonly nodeList = computed(() => {
    const p = this.currentPreset();
    return p.pos.map((xy, i) => ({ i, x: xy[0], y: xy[1] }));
  });

  readonly edgeList = computed(() => {
    const p = this.currentPreset();
    return p.edges.map(([a, b]) => ({
      key: `${a}-${b}`,
      x1: p.pos[a][0], y1: p.pos[a][1],
      x2: p.pos[b][0], y2: p.pos[b][1],
    }));
  });

  readonly walkerX = computed(() => {
    const p = this.currentPreset();
    return p.pos[this.walkerPos()]?.[0] ?? 0;
  });
  readonly walkerY = computed(() => {
    const p = this.currentPreset();
    return p.pos[this.walkerPos()]?.[1] ?? 0;
  });

  readonly empirical = computed(() => {
    const counts = this.visitCounts();
    const total = this.totalSteps() || 1;
    return counts.map((c) => c / total);
  });

  readonly stationary = computed(() => {
    const A = adjacencyMatrix(this.graph());
    const n = this.graph().n;
    const degrees = Array.from({ length: n }, (_, i) => A[i].reduce((s, v) => s + v, 0));
    const totalDeg = degrees.reduce((s, d) => s + d, 0) || 1;
    return degrees.map((d) => d / totalDeg);
  });

  readonly tvDist = computed(() => {
    const emp = this.empirical();
    const stat = this.stationary();
    let d = 0;
    for (let i = 0; i < emp.length; i++) d += Math.abs((emp[i] ?? 0) - (stat[i] ?? 0));
    return d / 2;
  });

  loadPreset(i: number): void {
    this.stopRun();
    this.presetIdx.set(i);
    this.reset();
  }

  reset(): void {
    this.walkerPos.set(0);
    this.visitCounts.set(new Array(this.currentPreset().n).fill(0));
    this.totalSteps.set(0);
  }

  step(): void {
    const A = adjacencyMatrix(this.graph());
    const pos = this.walkerPos();
    // Find neighbours
    const neighbours: number[] = [];
    for (let j = 0; j < this.graph().n; j++) {
      if (A[pos][j] > 0) neighbours.push(j);
    }
    if (neighbours.length === 0) return;
    const next = neighbours[Math.floor(Math.random() * neighbours.length)];
    this.walkerPos.set(next);
    const counts = [...this.visitCounts()];
    counts[next] = (counts[next] ?? 0) + 1;
    this.visitCounts.set(counts);
    this.totalSteps.update((v) => v + 1);
  }

  toggleRun(): void {
    if (this.running()) {
      this.stopRun();
    } else {
      this.running.set(true);
      this.timerHandle = setInterval(() => this.step(), 120);
    }
  }

  private stopRun(): void {
    this.running.set(false);
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  ngOnDestroy(): void {
    this.stopRun();
  }
}
