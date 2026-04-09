import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { combineBasis, samplePath, trigBasisList } from './fourier-util';

@Component({
  selector: 'app-step-fourier-basis',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fourier 基底" subtitle="§12.5">
      <p>
        對週期函數來說，最常用的一組正交方向就是
        <strong>1, cos(x), sin(x), cos(2x), sin(2x), ...</strong>
      </p>
      <p>
        Fourier 的核心想法不是神祕公式，而是很線代：
        <strong>把函數拆成一組正交基底的座標。</strong>
      </p>
    </app-prose-block>

    <app-challenge-card prompt="直接調係數，感受每個基底方向如何往最後的波形上加一筆">
      <div class="sliders">
        <div class="sl"><span class="lab">c₀</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="coeffs()[0]" (input)="setCoeff(0, +$any($event).target.value)" /><span class="val">{{ coeffs()[0].toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">c₁</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="coeffs()[1]" (input)="setCoeff(1, +$any($event).target.value)" /><span class="val">{{ coeffs()[1].toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">c₂</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="coeffs()[2]" (input)="setCoeff(2, +$any($event).target.value)" /><span class="val">{{ coeffs()[2].toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">c₃</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="coeffs()[3]" (input)="setCoeff(3, +$any($event).target.value)" /><span class="val">{{ coeffs()[3].toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">c₄</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="coeffs()[4]" (input)="setCoeff(4, +$any($event).target.value)" /><span class="val">{{ coeffs()[4].toFixed(1) }}</span></div>
      </div>

      <div class="basis-grid">
        @for (item of basis; track item.label; let i = $index) {
          <section class="basis-card">
            <div class="head">
              <span class="name">{{ item.label }}</span>
              <span class="mono">× {{ coeffs()[i].toFixed(2) }}</span>
            </div>
            <svg viewBox="-120 -50 240 100" class="mini-viz">
              <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
              <path [attr.d]="basisPaths[i]" fill="none" stroke="var(--v1)" stroke-width="2.2" />
            </svg>
          </section>
        }
      </div>

      <div class="result-card">
        <div class="gc-title">合成後的函數</div>
        <svg viewBox="-120 -95 240 190" class="viz">
          @for (g of grid; track g) {
            <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
          <path [attr.d]="resultPath()" fill="none" stroke="var(--accent)" stroke-width="3.8" />
        </svg>
        <div class="mono formula">
          f(x) = {{ coeffs()[0].toFixed(2) }} + {{ coeffs()[1].toFixed(2) }}cos(x) + {{ coeffs()[2].toFixed(2) }}sin(x)
          + {{ coeffs()[3].toFixed(2) }}cos(2x) + {{ coeffs()[4].toFixed(2) }}sin(2x)
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這裡其實就是「基底 + 座標」的老朋友，只是基底從有限維箭頭換成了波。
      </p>
    </app-prose-block>
  `,
  styles: `
    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 36px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .basis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .basis-card, .result-card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg); padding: 12px; }
    .head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
    .name { font-size: 12px; font-weight: 700; color: var(--text); }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-secondary); }
    .mini-viz, .viz { width: 100%; display: block; }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .formula { margin-top: 8px; line-height: 1.6; }
  `,
})
export class StepFourierBasisComponent {
  readonly basis = trigBasisList(5);
  readonly grid = [-45, -15, 15, 45];
  readonly coeffs = signal([0.2, 0.9, -0.6, 0.3, 0.5]);
  readonly basisPaths = this.basis.map((item) => samplePath(item.fn));
  readonly resultPath = computed(() => samplePath(combineBasis(this.coeffs())));

  setCoeff(index: number, value: number): void {
    this.coeffs.update((prev) => prev.map((entry, i) => i === index ? value : entry));
  }
}

