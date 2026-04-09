import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { laplacianMatrix, sortedEigen, type GraphData } from './graph-util';

type Preset = { name: string; n: number; edges: [number, number][]; pos: [number, number][] };

const PRESETS: Preset[] = [
  {
    name: '兩社群',
    n: 10,
    edges: [
      [0,1],[0,2],[1,2],[1,3],[2,3],[0,3],
      [4,5],[5,6],[6,7],[4,6],[5,7],[4,7],
      [8,9],[4,8],[6,9],
      [3,5],
    ],
    pos: [
      [-1,-0.5],[-0.6,-0.9],[-0.6,-0.1],[-0.2,-0.5],
      [0.5,-0.2],[0.9,-0.5],[0.9,0.1],[0.5,0.4],
      [1.2,-0.7],[1.2,0.4],
    ],
  },
  {
    name: '三社群',
    n: 12,
    edges: [
      [0,1],[1,2],[2,3],[0,2],[1,3],
      [4,5],[5,6],[6,7],[4,6],[5,7],
      [8,9],[9,10],[10,11],[8,10],[9,11],
      [3,4],[7,8],
    ],
    pos: [
      [-1.1,-0.7],[-0.7,-1],[-0.7,-0.4],[-0.3,-0.7],
      [0.0,0.2],[0.4,-0.1],[0.4,0.5],[0.0,0.8],
      [0.8,-0.8],[1.2,-0.5],[1.2,0.1],[0.8,0.2],
    ],
  },
  {
    name: '啞鈴',
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
];

const CLUSTER_COLORS = ['#5a7faa', '#aa5a6a', '#6a9a5a'];

@Component({
  selector: 'app-step-spectral-clustering',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="譜聚類" subtitle="§14.5">
      <p>
        上一節看到 Fiedler 向量的正負可以把圖切成兩半。
        <strong>譜聚類</strong>把這個想法推廣到 k 群：
      </p>
      <ol>
        <li>算 L 的前 k 個特徵向量 v₁, v₂, …, vₖ</li>
        <li>把每個節點 i 嵌入到 ℝᵏ：座標 = (v₂[i], v₃[i], …)</li>
        <li>在嵌入空間裡做分群（k-means 或直接看正負號）</li>
      </ol>
      <p>
        為什麼有效？因為 L 的特徵向量在圖上「最平滑」—— 同一群裡面的節點在嵌入空間裡自然靠近。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個預設圖，看譜嵌入怎麼把社群分開">
      <div class="ctrl-bar">
        <div class="presets">
          @for (p of presets; track p.name; let i = $index) {
            <button class="pre-btn" [class.active]="presetIdx() === i" (click)="loadPreset(i)">{{ p.name }}</button>
          }
        </div>
        <div class="k-ctrl">
          <span class="k-label">k = {{ numK() }}</span>
          <input type="range" min="2" max="3" step="1" [value]="numK()" (input)="onK($event)" class="k-slider" />
        </div>
      </div>

      <div class="dual-panel">
        <div class="panel">
          <div class="p-title">圖（節點依群上色）</div>
          <svg [attr.viewBox]="viewBox" class="g-svg">
            @for (e of edgeList(); track e.key) {
              <line [attr.x1]="e.x1" [attr.y1]="e.y1" [attr.x2]="e.x2" [attr.y2]="e.y2" class="edge" />
            }
            @for (nd of nodeList(); track nd.i) {
              <circle [attr.cx]="nd.x" [attr.cy]="nd.y" r="0.1"
                      [attr.fill]="clusterColor(nd.i)" stroke="var(--border-strong)" stroke-width="0.02" />
              <text [attr.x]="nd.x" [attr.y]="nd.y + 0.04" class="n-label">{{ nd.i }}</text>
            }
          </svg>
        </div>

        <div class="panel">
          <div class="p-title">譜嵌入（v₂ × v₃）</div>
          <svg viewBox="-1.3 -1.3 2.6 2.6" class="g-svg">
            <line x1="-1.3" y1="0" x2="1.3" y2="0" stroke="var(--border)" stroke-width="0.015" />
            <line x1="0" y1="-1.3" x2="0" y2="1.3" stroke="var(--border)" stroke-width="0.015" />
            <text x="1.15" y="-0.06" class="ax-label">v₂</text>
            <text x="0.06" y="-1.1" class="ax-label">v₃</text>
            @for (pt of embedding(); track pt.i) {
              <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="0.08"
                      [attr.fill]="clusterColor(pt.i)" stroke="white" stroke-width="0.02" />
              <text [attr.x]="pt.x + 0.1" [attr.y]="pt.y + 0.04" class="embed-label">{{ pt.i }}</text>
            }
          </svg>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        右邊的嵌入空間裡，同群的節點<strong>自然聚在一起</strong>。
        就算原始圖形看起來很混亂，在特徵向量空間裡分群一目瞭然。
      </p>
      <p>
        真實世界的應用：
      </p>
      <ul>
        <li><strong>社群偵測</strong>：社交網路裡誰跟誰是同一群</li>
        <li><strong>影像分割</strong>：把像素當節點，相似度當邊權重</li>
        <li><strong>推薦系統</strong>：用圖把「你可能也喜歡」的品項找出來</li>
      </ul>
      <p>
        下一節看另一個知名的圖演算法：<strong>PageRank</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; align-items: center; }
    .presets { display: flex; gap: 6px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .k-ctrl { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .k-label { font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .k-slider { width: 60px; accent-color: var(--accent); }

    .dual-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 700px) { .dual-panel { grid-template-columns: 1fr; } }
    .panel { padding: 10px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); display: flex; flex-direction: column; align-items: center; }
    .p-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .g-svg { width: 100%; max-width: 300px; }
    .edge { stroke: var(--text-muted); stroke-width: 0.025; stroke-opacity: 0.5; }
    .n-label { font-size: 0.1px; fill: white; text-anchor: middle; pointer-events: none;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .ax-label { font-size: 0.14px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .embed-label { font-size: 0.1px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepSpectralClusteringComponent {
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly numK = signal(2);
  readonly viewBox = '-1.5 -1.3 3 2.6';

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

  private readonly eigen = computed(() => sortedEigen(laplacianMatrix(this.graph())));

  readonly embedding = computed(() => {
    const V = this.eigen().vectors;
    const n = this.graph().n;
    // Use columns 1 (v2) and 2 (v3) as 2D embedding
    return Array.from({ length: n }, (_, i) => ({
      i,
      x: (V[i]?.[1] ?? 0) * 3,
      y: (V[i]?.[2] ?? 0) * 3,
    }));
  });

  // Simple sign-based clustering
  readonly clusters = computed(() => {
    const V = this.eigen().vectors;
    const n = this.graph().n;
    const k = this.numK();
    if (k === 2) {
      // Sign of v2
      return Array.from({ length: n }, (_, i) => (V[i]?.[1] ?? 0) >= 0 ? 0 : 1);
    } else {
      // 3 clusters: sign combination of v2 and v3
      return Array.from({ length: n }, (_, i) => {
        const v2 = V[i]?.[1] ?? 0;
        const v3 = V[i]?.[2] ?? 0;
        // Simple k-means-like: assign by angle in (v2, v3) space
        const angle = Math.atan2(v3, v2);
        if (angle < -Math.PI / 3) return 0;
        if (angle < Math.PI / 3) return 1;
        return 2;
      });
    }
  });

  loadPreset(i: number): void {
    this.presetIdx.set(i);
    // Auto-set k based on preset
    if (PRESETS[i].name === '三社群') this.numK.set(3);
    else this.numK.set(2);
  }

  onK(ev: Event): void {
    this.numK.set(+(ev.target as HTMLInputElement).value as 2 | 3);
  }

  clusterColor(i: number): string {
    const c = this.clusters()[i] ?? 0;
    return CLUSTER_COLORS[c] ?? CLUSTER_COLORS[0];
  }
}
