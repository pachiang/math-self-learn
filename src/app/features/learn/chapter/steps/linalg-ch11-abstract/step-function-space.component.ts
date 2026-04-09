import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { functionPath, range } from './abstract-util';

const BASIS_LABELS = ['1', 'x', 'sin(πx)', 'sin(2πx)', 'cos(πx)', 'cos(2πx)'];

@Component({
  selector: 'app-step-function-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="函數空間與無限維" subtitle="§11.6">
      <p>
        一個函數不是只有幾個座標，而是一整條曲線。這讓人直覺上覺得它比多項式空間「大很多」。
      </p>
      <p>
        一種理解方式是：先看一系列越來越大的有限維子空間。例如：
        <strong>span{{ '{' }}1{{ '}' }}</strong>、
        <strong>span{{ '{' }}1, x{{ '}' }}</strong>、
        <strong>span{{ '{' }}1, x, sin(πx){{ '}' }}</strong>……
      </p>
      <p>
        每多放一個基底函數，你就多一個座標自由度。<strong>沒有固定終點</strong>，這就是無限維的味道。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整維度 N 和各個係數，感受函數空間如何越來越『大』">
      <div class="top-strip">
        <div class="dim-card">
          <span class="dim-label">目前子空間</span>
          <strong>span{{ '{' }} φ₁, …, φ{{ dim() }} {{ '}' }}</strong>
        </div>
        <div class="dim-card">
          <span class="dim-label">目前座標數</span>
          <strong>{{ dim() }} 維</strong>
        </div>
      </div>

      <div class="sliders">
        <div class="sl big">
          <span class="lab">N</span>
          <input type="range" min="1" max="6" step="1" [value]="dim()" (input)="dim.set(+$any($event).target.value)" />
          <span class="val">{{ dim() }}</span>
        </div>
      </div>

      <div class="preset-row">
        @for (preset of presets; track preset.name; let i = $index) {
          <button class="preset" [class.active]="presetIdx() === i" (click)="applyPreset(i)">{{ preset.name }}</button>
        }
      </div>

      <div class="graph-card">
        <div class="gc-title">目前的函數</div>
        <svg viewBox="-130 -95 260 190" class="viz">
          @for (g of grid; track g) {
            <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
          <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="0.9" />
          <path [attr.d]="totalPath()" fill="none" stroke="var(--accent)" stroke-width="3.8" />
        </svg>
      </div>

      <div class="basis-grid">
        @for (i of visibleIndices(); track i) {
          <section class="basis-card">
            <div class="basis-head">
              <span class="basis-name">φ{{ i + 1 }}(x) = {{ basisLabels[i] }}</span>
              <span class="basis-coeff mono">c{{ i + 1 }} = {{ coeffs()[i].toFixed(2) }}</span>
            </div>
            <svg viewBox="-110 -42 220 84" class="mini-viz">
              <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
              <path [attr.d]="basisPaths()[i]" fill="none" stroke="var(--v1)" stroke-width="2.2" />
            </svg>
            <input class="coeff-slider" type="range" min="-1.8" max="1.8" step="0.05"
              [value]="coeffs()[i]" (input)="setCoeff(i, +$any($event).target.value)" />
          </section>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個畫面其實在做一件很重要的事：它把「函數」重新看成一個<strong>座標列表</strong>。
      </p>
      <ul>
        <li>如果只看前 2 個基底，你得到一個 2 維子空間</li>
        <li>如果看前 6 個基底，你得到一個 6 維子空間</li>
        <li>如果理論上可以一直加下去，就開始接近無限維空間的概念</li>
      </ul>
      <p>
        下一節我們會更直接地把函數當向量來相加和縮放。
      </p>
    </app-prose-block>
  `,
  styles: `
    .top-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px; }
    .dim-card, .graph-card, .basis-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .dim-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .dim-card strong { font-size: 18px; color: var(--text); }

    .sliders { margin-bottom: 12px; }
    .sl.big { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); text-align: center; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 28px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .preset { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-muted);
      font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 700; } }

    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }

    .basis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
    .basis-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; }
    .basis-name { font-size: 12px; color: var(--text); font-weight: 700; }
    .basis-coeff { font-size: 11px; color: var(--text-secondary); }
    .mini-viz { width: 100%; display: block; margin-bottom: 8px; }
    .coeff-slider { width: 100%; accent-color: var(--accent); }
    .mono { font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepFunctionSpaceComponent {
  readonly basisLabels = BASIS_LABELS;
  readonly grid = [-60, -30, 30, 60];
  readonly presets = [
    { name: '平滑波', coeffs: [0.4, -0.2, 0.9, 0.25, 0.2, 0] },
    { name: '左右擺', coeffs: [-0.1, 0.8, 0.2, -0.5, 0.4, -0.2] },
    { name: '震盪', coeffs: [0, 0.1, 0.2, 0.9, 0, 0.6] },
  ];

  readonly dim = signal(4);
  readonly presetIdx = signal(0);
  readonly coeffs = signal<number[]>([0.4, -0.2, 0.9, 0.25, 0.2, 0]);

  readonly visibleIndices = computed(() => range(this.dim()));
  readonly basisFns = [
    (x: number) => 1,
    (x: number) => x,
    (x: number) => Math.sin(Math.PI * x),
    (x: number) => Math.sin(2 * Math.PI * x),
    (x: number) => Math.cos(Math.PI * x),
    (x: number) => Math.cos(2 * Math.PI * x),
  ];

  readonly basisPaths = computed(() => this.basisFns.map((fn) => functionPath(fn, { scaleY: 22 })));
  readonly totalPath = computed(() => functionPath((x) => this.functionValue(x), { scaleY: 24 }));

  functionValue(x: number): number {
    let total = 0;
    const coeffs = this.coeffs();
    for (let i = 0; i < this.dim(); i++) {
      total += coeffs[i] * this.basisFns[i](x);
    }
    return total;
  }

  setCoeff(index: number, value: number): void {
    this.presetIdx.set(-1);
    this.coeffs.update((prev) => prev.map((entry, i) => i === index ? value : entry));
  }

  applyPreset(index: number): void {
    this.presetIdx.set(index);
    this.coeffs.set([...this.presets[index].coeffs]);
  }
}
