import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { functionPath } from './abstract-util';

const FUNCTION_PRESETS = [
  { name: '柔和波', coeffs: [0.2, 0.1, 0.8, 0.15] },
  { name: '傾斜線', coeffs: [-0.1, 0.9, 0.2, 0] },
  { name: '偏移波', coeffs: [0.5, -0.3, 0, 0.8] },
  { name: '反相波', coeffs: [0, 0.2, -0.9, 0.4] },
];

@Component({
  selector: 'app-step-functions-as-vectors',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="函數也能相加與縮放" subtitle="§11.7">
      <p>
        如果函數是向量，那它們就應該也能做兩件事：
        <strong>相加</strong>，以及 <strong>乘上純量</strong>。
      </p>
      <p>
        這節直接把兩個函數 f、g 丟進來，組合成 <strong>αf + βg</strong>。
        你會看到：圖形在變，但座標規則仍然是你熟悉的那套。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選兩個函數，調整 α 和 β，看結果如何在圖形與座標上同步改變">
      <div class="picker-grid">
        <div class="picker">
          <span class="picker-title">選 f</span>
          <div class="tabs">
            @for (preset of presets; track preset.name; let i = $index) {
              <button class="tab" [class.active]="fIdx() === i" (click)="fIdx.set(i)">{{ preset.name }}</button>
            }
          </div>
        </div>
        <div class="picker">
          <span class="picker-title">選 g</span>
          <div class="tabs">
            @for (preset of presets; track preset.name; let i = $index) {
              <button class="tab" [class.active]="gIdx() === i" (click)="gIdx.set(i)">{{ preset.name }}</button>
            }
          </div>
        </div>
      </div>

      <div class="sliders">
        <div class="sl">
          <span class="lab">α</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="alpha()" (input)="alpha.set(+$any($event).target.value)" />
          <span class="val">{{ alpha().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">β</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="beta()" (input)="beta.set(+$any($event).target.value)" />
          <span class="val">{{ beta().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">x₀</span>
          <input type="range" min="-1.2" max="1.2" step="0.05" [value]="x0()" (input)="x0.set(+$any($event).target.value)" />
          <span class="val">{{ x0().toFixed(2) }}</span>
        </div>
      </div>

      <div class="graph-stack">
        <section class="graph-card">
          <div class="gc-title">f(x)</div>
          <svg viewBox="-130 -85 260 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="fPath()" fill="none" stroke="var(--v0)" stroke-width="3.1" />
            <circle [attr.cx]="x0() * 92" [attr.cy]="-fAtX0() * 24" r="4.2" fill="var(--v0)" stroke="white" stroke-width="1.2" />
          </svg>
        </section>

        <section class="graph-card">
          <div class="gc-title">g(x)</div>
          <svg viewBox="-130 -85 260 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="gPath()" fill="none" stroke="var(--v1)" stroke-width="3.1" />
            <circle [attr.cx]="x0() * 92" [attr.cy]="-gAtX0() * 24" r="4.2" fill="var(--v1)" stroke="white" stroke-width="1.2" />
          </svg>
        </section>

        <section class="graph-card result">
          <div class="gc-title">αf(x) + βg(x)</div>
          <svg viewBox="-130 -85 260 170" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="comboPath()" fill="none" stroke="var(--accent)" stroke-width="3.8" />
            <circle [attr.cx]="x0() * 92" [attr.cy]="-comboAtX0() * 24" r="4.6" fill="var(--accent)" stroke="white" stroke-width="1.2" />
          </svg>
        </section>
      </div>

      <div class="coord-card">
        <div class="row">
          <span class="label">[f]</span>
          <span class="mono">{{ vectorText(fCoeffs()) }}</span>
        </div>
        <div class="row">
          <span class="label">[g]</span>
          <span class="mono">{{ vectorText(gCoeffs()) }}</span>
        </div>
        <div class="row highlight">
          <span class="label">[αf + βg]</span>
          <span class="mono strong">{{ vectorText(comboCoeffs()) }}</span>
        </div>
        <div class="row">
          <span class="label">在 x₀</span>
          <span class="mono">{{ alpha().toFixed(1) }}·{{ fAtX0().toFixed(2) }} + {{ beta().toFixed(1) }}·{{ gAtX0().toFixed(2) }} = {{ comboAtX0().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這就是為什麼函數可以被當成向量：<strong>它們真的 obey 同樣的線性規則</strong>。
      </p>
      <p>
        到這裡，第十一章的抽象化已經完成了。下一步最自然的事情，就是在函數空間裡也定義
        <strong>內積、正交、基底展開</strong>，那就會走到傅立葉級數與正交多項式。
      </p>
    </app-prose-block>
  `,
  styles: `
    .picker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .picker { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .picker-title { display: block; font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .tabs { display: flex; flex-wrap: wrap; gap: 6px; }
    .tab { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 700; } }

    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); text-align: center; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 42px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .graph-stack { display: grid; gap: 12px; margin-bottom: 12px; }
    .graph-card, .coord-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .graph-card.result { background: linear-gradient(180deg, var(--accent-10), transparent); }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }

    .coord-card { overflow: hidden; padding: 0; }
    .row { display: grid; grid-template-columns: 96px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.highlight { background: var(--accent-10); } }
    .label { padding: 9px 12px; background: var(--bg); color: var(--text-muted); font-size: 12px; border-right: 1px solid var(--border); }
    .mono { padding: 9px 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-secondary); }
    .strong { color: var(--text); font-weight: 700; }

    @media (max-width: 820px) {
      .picker-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class StepFunctionsAsVectorsComponent {
  readonly grid = [-45, -15, 15, 45];
  readonly presets = FUNCTION_PRESETS;
  readonly basisFns = [
    (x: number) => 1,
    (x: number) => x,
    (x: number) => Math.sin(Math.PI * x),
    (x: number) => Math.cos(Math.PI * x),
  ];

  readonly fIdx = signal(0);
  readonly gIdx = signal(2);
  readonly alpha = signal(1.2);
  readonly beta = signal(-0.8);
  readonly x0 = signal(0.3);

  readonly fCoeffs = computed(() => this.presets[this.fIdx()].coeffs);
  readonly gCoeffs = computed(() => this.presets[this.gIdx()].coeffs);
  readonly comboCoeffs = computed(() =>
    this.fCoeffs().map((value, index) => this.alpha() * value + this.beta() * this.gCoeffs()[index]),
  );

  functionValue(coeffs: readonly number[], x: number): number {
    let total = 0;
    for (let i = 0; i < coeffs.length; i++) {
      total += coeffs[i] * this.basisFns[i](x);
    }
    return total;
  }

  readonly fPath = computed(() => functionPath((x) => this.functionValue(this.fCoeffs(), x), { scaleY: 24 }));
  readonly gPath = computed(() => functionPath((x) => this.functionValue(this.gCoeffs(), x), { scaleY: 24 }));
  readonly comboPath = computed(() => functionPath((x) => this.functionValue(this.comboCoeffs(), x), { scaleY: 24 }));

  readonly fAtX0 = computed(() => this.functionValue(this.fCoeffs(), this.x0()));
  readonly gAtX0 = computed(() => this.functionValue(this.gCoeffs(), this.x0()));
  readonly comboAtX0 = computed(() => this.functionValue(this.comboCoeffs(), this.x0()));

  vectorText(values: readonly number[]): string {
    return `[${values.map((value) => value.toFixed(2)).join(', ')}]`;
  }
}
