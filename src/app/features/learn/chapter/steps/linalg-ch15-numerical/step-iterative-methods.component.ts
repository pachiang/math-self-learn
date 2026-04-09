import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { jacobiSolve, gaussSeidelSolve, type IterStep } from './numerical-util';

interface Preset { name: string; A: number[][]; b: number[]; sol: number[]; desc: string; }

const PRESETS: Preset[] = [
  {
    name: '良條件',
    A: [[4, 1], [1, 3]],
    b: [1, 2],
    sol: [0.0909, 0.6364],
    desc: '對角優勢，收斂快',
  },
  {
    name: '中等',
    A: [[3, 1], [1, 2]],
    b: [5, 5],
    sol: [1, 2],
    desc: '仍然收斂但慢一點',
  },
];

const SVG_W = 300;
const SVG_H = 300;
const VIEW = { xMin: -1, xMax: 3, yMin: -1, yMax: 3 };

function toSvgX(x: number): number {
  return ((x - VIEW.xMin) / (VIEW.xMax - VIEW.xMin)) * SVG_W;
}
function toSvgY(y: number): number {
  return SVG_H - ((y - VIEW.yMin) / (VIEW.yMax - VIEW.yMin)) * SVG_H;
}

@Component({
  selector: 'app-step-iterative-methods',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="迭代法" subtitle="§15.6">
      <p>
        LU 和 QR 都是「直接法」——算完就得到精確解。但如果矩陣非常大（百萬 × 百萬），
        直接法太貴。
      </p>
      <p>
        <strong>迭代法</strong>：從一個猜測 x₀ 出發，反覆改進，逼近真正的解。
      </p>
      <ul>
        <li><strong>Jacobi</strong>：用「上一步的全部值」算新的每個分量</li>
        <li><strong>Gauss-Seidel</strong>：一算出來就馬上用，不等其他分量更新完</li>
      </ul>
      <p>
        Gauss-Seidel 通常更快，因為它用的是「最新資訊」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看兩種迭代法的路徑怎麼走向解">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="loadPreset(i)">{{ p.name }}</button>
        }
        <div class="method-btns">
          <button class="m-btn" [class.active]="method() === 'jacobi'" (click)="method.set('jacobi')">Jacobi</button>
          <button class="m-btn" [class.active]="method() === 'gs'" (click)="method.set('gs')">Gauss-Seidel</button>
        </div>
        <div class="act-btns">
          <button class="act-btn" (click)="step()">一步</button>
          <button class="act-btn" (click)="toggleRun()">{{ running() ? '暫停' : '連續' }}</button>
          <button class="act-btn reset" (click)="reset()">重置</button>
        </div>
      </div>

      <div class="layout">
        <div class="svg-side">
          <svg [attr.viewBox]="'0 0 ' + SVG_W + ' ' + SVG_H" class="iter-svg">
            <!-- Grid -->
            @for (g of gridVals; track g) {
              <line [attr.x1]="toSvgX(g)" y1="0" [attr.x2]="toSvgX(g)" [attr.y2]="SVG_H"
                    stroke="var(--border)" stroke-width="0.5" />
              <line x1="0" [attr.y1]="toSvgY(g)" [attr.x2]="SVG_W" [attr.y2]="toSvgY(g)"
                    stroke="var(--border)" stroke-width="0.5" />
            }

            <!-- Equation lines -->
            <line [attr.x1]="toSvgX(VIEW.xMin)" [attr.y1]="toSvgY(line1y(VIEW.xMin))"
                  [attr.x2]="toSvgX(VIEW.xMax)" [attr.y2]="toSvgY(line1y(VIEW.xMax))"
                  stroke="#5a7faa" stroke-width="1.5" stroke-opacity="0.5" />
            <line [attr.x1]="toSvgX(VIEW.xMin)" [attr.y1]="toSvgY(line2y(VIEW.xMin))"
                  [attr.x2]="toSvgX(VIEW.xMax)" [attr.y2]="toSvgY(line2y(VIEW.xMax))"
                  stroke="#aa5a6a" stroke-width="1.5" stroke-opacity="0.5" />

            <!-- Solution point -->
            <circle [attr.cx]="toSvgX(currentPreset().sol[0])"
                    [attr.cy]="toSvgY(currentPreset().sol[1])"
                    r="5" fill="#5a8a5a" stroke="white" stroke-width="1" />

            <!-- Iteration path -->
            @for (pt of pathPoints(); track $index; let i = $index) {
              @if (i > 0) {
                <line [attr.x1]="toSvgX(pathPoints()[i - 1][0])" [attr.y1]="toSvgY(pathPoints()[i - 1][1])"
                      [attr.x2]="toSvgX(pt[0])" [attr.y2]="toSvgY(pt[1])"
                      stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.6" />
              }
              <circle [attr.cx]="toSvgX(pt[0])" [attr.cy]="toSvgY(pt[1])"
                      [attr.r]="i === pathPoints().length - 1 ? 4 : 2.5"
                      fill="var(--accent)" [attr.fill-opacity]="0.3 + (i / pathPoints().length) * 0.7" />
            }
          </svg>
        </div>

        <div class="info-side">
          <div class="iter-info">
            <div class="ii-label">迭代</div>
            <div class="ii-val">k = {{ currentIter() }}</div>
          </div>
          <div class="iter-info">
            <div class="ii-label">當前 x</div>
            <div class="ii-val mono">
              ({{ currentX()[0]?.toFixed(4) }}, {{ currentX()[1]?.toFixed(4) }})
            </div>
          </div>
          <div class="iter-info">
            <div class="ii-label">殘差 ‖b − Ax‖</div>
            <div class="ii-val mono" [class.small]="currentRes() < 0.01">{{ currentRes().toExponential(2) }}</div>
          </div>

          <div class="res-chart">
            <div class="rc-title">殘差歷史</div>
            <div class="rc-bars">
              @for (s of displaySteps(); track $index) {
                <div class="rc-bar-col">
                  <div class="rc-bar" [style.height.px]="resBarH(s.resNorm)"></div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        看路徑圖：Jacobi 通常走「鋸齒形」，Gauss-Seidel 更像「螺旋收斂」。
      </p>
      <p>
        但兩者的收斂速度都取決於<strong>矩陣的性質</strong>。
        下一節看一個更聰明的迭代法——<strong>共軛梯度</strong>——
        它在正定矩陣上保證 n 步收斂。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .method-btns { display: flex; gap: 4px; }
    .m-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &.active { background: var(--accent); color: white; border-color: var(--accent); } }
    .act-btns { display: flex; gap: 4px; margin-left: auto; }
    .act-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.reset { color: var(--text-muted); } }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .svg-side { display: flex; justify-content: center; }
    .iter-svg { width: 100%; max-width: 300px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); }

    .info-side { display: flex; flex-direction: column; gap: 8px; }
    .iter-info { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); display: flex; justify-content: space-between; align-items: center; }
    .ii-label { font-size: 11px; color: var(--text-muted); }
    .ii-val { font-size: 14px; font-weight: 700; color: var(--text);
      &.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
      &.small { color: #5a8a5a; } }

    .res-chart { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); flex: 1; }
    .rc-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .rc-bars { display: flex; gap: 2px; align-items: flex-end; height: 80px; }
    .rc-bar-col { flex: 1; display: flex; justify-content: center; }
    .rc-bar { width: 6px; background: var(--accent); border-radius: 2px 2px 0 0;
      min-height: 1px; transition: height 0.15s; max-height: 80px; }
  `,
})
export class StepIterativeMethodsComponent implements OnDestroy {
  readonly SVG_W = SVG_W;
  readonly SVG_H = SVG_H;
  readonly VIEW = VIEW;
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly method = signal<'jacobi' | 'gs'>('jacobi');
  readonly currentIter = signal(0);
  readonly running = signal(false);
  readonly gridVals = [-1, 0, 1, 2, 3];

  private timerHandle: ReturnType<typeof setInterval> | null = null;

  // Pre-compute all iterations (up to 60)
  private readonly allSteps = computed<IterStep[]>(() => {
    const p = PRESETS[this.presetIdx()];
    const x0 = [-0.5, -0.5]; // starting point
    return this.method() === 'jacobi'
      ? jacobiSolve(p.A, p.b, x0, 60)
      : gaussSeidelSolve(p.A, p.b, x0, 60);
  });

  readonly currentPreset = computed(() => PRESETS[this.presetIdx()]);

  readonly pathPoints = computed(() => {
    const steps = this.allSteps();
    const k = Math.min(this.currentIter(), steps.length - 1);
    return steps.slice(0, k + 1).map((s) => s.x);
  });

  readonly displaySteps = computed(() => {
    const steps = this.allSteps();
    const k = Math.min(this.currentIter(), steps.length - 1);
    return steps.slice(0, k + 1);
  });

  readonly currentX = computed(() => {
    const steps = this.allSteps();
    const k = Math.min(this.currentIter(), steps.length - 1);
    return steps[k]?.x ?? [0, 0];
  });

  readonly currentRes = computed(() => {
    const steps = this.allSteps();
    const k = Math.min(this.currentIter(), steps.length - 1);
    return steps[k]?.resNorm ?? 0;
  });

  loadPreset(i: number): void {
    this.stopRun();
    this.presetIdx.set(i);
    this.currentIter.set(0);
  }

  step(): void {
    const max = this.allSteps().length - 1;
    if (this.currentIter() < max) {
      this.currentIter.update((v) => v + 1);
    }
  }

  toggleRun(): void {
    if (this.running()) {
      this.stopRun();
    } else {
      this.running.set(true);
      this.timerHandle = setInterval(() => {
        if (this.currentIter() >= this.allSteps().length - 1) {
          this.stopRun();
        } else {
          this.step();
        }
      }, 200);
    }
  }

  reset(): void {
    this.stopRun();
    this.currentIter.set(0);
  }

  private stopRun(): void {
    this.running.set(false);
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  ngOnDestroy(): void { this.stopRun(); }

  toSvgX = toSvgX;
  toSvgY = toSvgY;

  // Line helpers: eq 0 → a00*x + a01*y = b0 → y = (b0 - a00*x)/a01
  line1y(x: number): number {
    const p = this.currentPreset();
    return (p.b[0] - p.A[0][0] * x) / (p.A[0][1] || 1);
  }
  line2y(x: number): number {
    const p = this.currentPreset();
    return (p.b[1] - p.A[1][0] * x) / (p.A[1][1] || 1);
  }

  resBarH(v: number): number {
    // Log scale bar height
    if (v < 1e-10) return 1;
    const logV = Math.log10(v);
    return Math.max(1, Math.min(80, (logV + 3) * 20));
  }
}
