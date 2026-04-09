import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { hammingDist } from './coding-utils';

// 3-bit Hamming cube vertices with isometric projection
const CUBE_VERTICES: { label: string; bits: number[]; x: number; y: number }[] = (() => {
  const verts: { label: string; bits: number[]; x: number; y: number }[] = [];
  const dx = 1.2, dy = 0.7, dz = 1.0;
  for (let b2 = 0; b2 < 2; b2++) {
    for (let b1 = 0; b1 < 2; b1++) {
      for (let b0 = 0; b0 < 2; b0++) {
        const label = `${b2}${b1}${b0}`;
        const x = b0 * dx + b1 * (-dx * 0.5) + 0;
        const y = -b2 * dz + b1 * (dy * 0.5) + 0;
        verts.push({ label, bits: [b2, b1, b0], x, y });
      }
    }
  }
  return verts;
})();

// Edges: pairs with hamming distance 1
const CUBE_EDGES: { a: number; b: number }[] = [];
for (let i = 0; i < 8; i++) {
  for (let j = i + 1; j < 8; j++) {
    if (hammingDist(CUBE_VERTICES[i].bits, CUBE_VERTICES[j].bits) === 1) {
      CUBE_EDGES.push({ a: i, b: j });
    }
  }
}

type CubePreset = { name: string; selected: number[]; desc: string };
const CUBE_PRESETS: CubePreset[] = [
  { name: '重複碼', selected: [0, 7], desc: '{000, 111}，d_min = 3，可糾正 1 個錯誤' },
  { name: '奇偶碼', selected: [0, 3, 5, 6], desc: '{000, 011, 101, 110}，d_min = 2，可偵測 1 個錯誤' },
  { name: '全部', selected: [0, 1, 2, 3, 4, 5, 6, 7], desc: '全部 8 個字，d_min = 1，沒有糾錯能力' },
];

@Component({
  selector: 'app-step-hamming-distance',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="漢明距離" subtitle="§13.2">
      <p>
        兩個碼字之間有多少位不同？這就是<strong>漢明距離</strong>：
      </p>
      <p class="formula">d(x, y) = |{{ '{' }} i : xᵢ ≠ yᵢ {{ '}' }}|</p>
      <p>
        一個碼的<strong>最小距離 d_min</strong> 決定了它的能力：
      </p>
      <ul>
        <li>偵測 ≤ d_min − 1 個錯誤</li>
        <li>糾正 ≤ ⌊(d_min − 1) / 2⌋ 個錯誤</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="點位元來改變，看漢明距離怎麼算">
      <div class="dist-calc">
        <div class="word-row">
          <span class="w-label">x =</span>
          @for (b of wordA(); track $index; let i = $index) {
            <button class="bit-btn" [class.one]="b === 1" (click)="flipA(i)">{{ b }}</button>
          }
        </div>
        <div class="word-row">
          <span class="w-label">y =</span>
          @for (b of wordB(); track $index; let i = $index) {
            <button class="bit-btn" [class.one]="b === 1" (click)="flipB(i)">{{ b }}</button>
          }
        </div>
        <div class="diff-row">
          <span class="w-label">≠</span>
          @for (d of diffs(); track $index) {
            <span class="diff-cell" [class.diff]="d">{{ d ? '✗' : '✓' }}</span>
          }
        </div>
        <div class="dist-val">d(x, y) = {{ dist() }}</div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="3-bit 漢明方塊：選碼字看最小距離">
      <div class="preset-row">
        @for (p of cubePresets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="loadPreset(i)">{{ p.name }}</button>
        }
      </div>

      <div class="cube-layout">
        <svg viewBox="-2 -1.8 4 3.6" class="cube-svg">
          <!-- Edges -->
          @for (e of cubeEdges; track e.a * 8 + e.b) {
            <line [attr.x1]="cubeVerts[e.a].x" [attr.y1]="cubeVerts[e.a].y"
                  [attr.x2]="cubeVerts[e.b].x" [attr.y2]="cubeVerts[e.b].y"
                  class="cube-edge" />
          }
          <!-- Vertices -->
          @for (v of cubeVerts; track v.label; let i = $index) {
            <g (click)="toggleVertex(i)" class="vert-g">
              <circle [attr.cx]="v.x" [attr.cy]="v.y"
                      [attr.r]="selectedSet().has(i) ? 0.28 : 0.22"
                      [class.selected]="selectedSet().has(i)"
                      class="cube-node" />
              <text [attr.x]="v.x" [attr.y]="v.y + 0.07" class="cube-label">{{ v.label }}</text>
            </g>
          }
        </svg>

        <div class="cube-info">
          <div class="ci-row">
            <span class="ci-label">碼字數</span>
            <span class="ci-val">{{ selectedList().length }}</span>
          </div>
          <div class="ci-row">
            <span class="ci-label">d_min</span>
            <span class="ci-val accent">{{ dMin() }}</span>
          </div>
          <div class="ci-row">
            <span class="ci-label">可偵測錯誤</span>
            <span class="ci-val">≤ {{ detectCapacity() }}</span>
          </div>
          <div class="ci-row">
            <span class="ci-label">可糾正錯誤</span>
            <span class="ci-val">≤ {{ correctCapacity() }}</span>
          </div>
          <div class="ci-desc">{{ cubePresets[presetIdx()].desc }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        重複碼 {{ '{' }}000, 111{{ '}' }} 的 d_min = 3，所以能糾正 1 個錯誤。
        但它用 3 位只送 1 位資料——效率 1/3。
      </p>
      <p>
        我們能不能找到效率更高、d_min 還是 3 的碼？
        答案是<strong>線性碼</strong>——用矩陣乘法來編碼。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .dist-calc { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .word-row { display: flex; align-items: center; gap: 6px; margin: 6px 0; }
    .w-label { font-size: 13px; font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; min-width: 26px; }
    .bit-btn { width: 32px; height: 32px; border: 1px solid var(--border); border-radius: 4px;
      font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      cursor: pointer; background: rgba(90, 138, 90, 0.1); color: #5a8a5a;
      &.one { background: rgba(110, 138, 168, 0.2); color: #5a7faa; }
      &:hover { opacity: 0.8; } }
    .diff-row { display: flex; align-items: center; gap: 6px; margin: 6px 0; }
    .diff-cell { width: 32px; height: 24px; display: flex; align-items: center; justify-content: center;
      font-size: 12px; color: #5a8a5a;
      &.diff { color: #a05a5a; font-weight: 700; } }
    .dist-val { font-size: 18px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; text-align: center; margin-top: 8px; }

    .preset-row { display: flex; gap: 6px; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .cube-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 600px) { .cube-layout { grid-template-columns: 1fr; } }

    .cube-svg { width: 100%; max-width: 280px; }
    .cube-edge { stroke: var(--border); stroke-width: 0.03; }
    .cube-node { fill: var(--bg-surface); stroke: var(--border-strong); stroke-width: 0.03;
      cursor: pointer; transition: r 0.15s, fill 0.15s;
      &:hover { fill: var(--accent-10); }
      &.selected { fill: var(--accent); stroke: var(--accent); } }
    .cube-label { font-size: 0.18px; fill: var(--text); text-anchor: middle;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; pointer-events: none; }
    .vert-g .selected + .cube-label { fill: white; }

    .cube-info { display: flex; flex-direction: column; gap: 8px; }
    .ci-row { display: flex; justify-content: space-between; padding: 6px 10px;
      border: 1px solid var(--border); border-radius: 6px; background: var(--bg-surface); }
    .ci-label { font-size: 12px; color: var(--text-muted); }
    .ci-val { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.accent { color: var(--accent); } }
    .ci-desc { font-size: 11px; color: var(--text-secondary); padding: 6px 10px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepHammingDistanceComponent {
  readonly cubeVerts = CUBE_VERTICES;
  readonly cubeEdges = CUBE_EDGES;
  readonly cubePresets = CUBE_PRESETS;

  readonly wordA = signal([0, 1, 0, 1, 0, 1, 0]);
  readonly wordB = signal([0, 1, 1, 0, 0, 1, 0]);
  readonly diffs = computed(() => this.wordA().map((a, i) => a !== this.wordB()[i]));
  readonly dist = computed(() => hammingDist(this.wordA(), this.wordB()));

  readonly presetIdx = signal(0);
  readonly selectedList = signal<number[]>([0, 7]);
  readonly selectedSet = computed(() => new Set(this.selectedList()));

  readonly dMin = computed(() => {
    const sel = this.selectedList();
    if (sel.length < 2) return Infinity;
    let min = Infinity;
    for (let i = 0; i < sel.length; i++) {
      for (let j = i + 1; j < sel.length; j++) {
        const d = hammingDist(CUBE_VERTICES[sel[i]].bits, CUBE_VERTICES[sel[j]].bits);
        if (d < min) min = d;
      }
    }
    return min;
  });

  readonly detectCapacity = computed(() => {
    const d = this.dMin();
    return d === Infinity ? '—' : String(d - 1);
  });

  readonly correctCapacity = computed(() => {
    const d = this.dMin();
    return d === Infinity ? '—' : String(Math.floor((d - 1) / 2));
  });

  flipA(i: number): void {
    const next = [...this.wordA()];
    next[i] ^= 1;
    this.wordA.set(next);
  }

  flipB(i: number): void {
    const next = [...this.wordB()];
    next[i] ^= 1;
    this.wordB.set(next);
  }

  loadPreset(i: number): void {
    this.presetIdx.set(i);
    this.selectedList.set([...CUBE_PRESETS[i].selected]);
  }

  toggleVertex(i: number): void {
    const list = [...this.selectedList()];
    const idx = list.indexOf(i);
    if (idx >= 0) list.splice(idx, 1); else list.push(i);
    this.selectedList.set(list);
  }
}
