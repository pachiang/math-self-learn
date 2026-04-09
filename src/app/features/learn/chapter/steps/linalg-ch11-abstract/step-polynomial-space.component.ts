import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { functionPath, polyValue, formatPolynomial } from './abstract-util';

@Component({
  selector: 'app-step-polynomial-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="多項式空間 P₃" subtitle="§11.2">
      <p>
        一個三次多項式
        <strong>p(x) = a₀ + a₁x + a₂x² + a₃x³</strong>
        其實就像一個四維向量：它有四個座標 a₀, a₁, a₂, a₃。
      </p>
      <p>
        只是這次座標不再被畫成一支箭頭，而是被畫成一條曲線。這正是抽象線代最重要的練習：
        <strong>同一個物件，同時用座標和圖形兩種方式看。</strong>
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動係數，感受「四個數字」如何變成「一條曲線」">
      <div class="top-row">
        <div class="vector-card">
          <div class="vc-title">座標向量</div>
          <div class="coord mono">[{{ a0().toFixed(2) }}, {{ a1().toFixed(2) }}, {{ a2().toFixed(2) }}, {{ a3().toFixed(2) }}]</div>
          <div class="poly mono">p(x) = {{ polyText() }}</div>
        </div>
        <div class="sample-card">
          <div class="vc-title">在 x = {{ x0().toFixed(2) }} 的值</div>
          <div class="sample mono">
            {{ a0().toFixed(2) }}
            + {{ a1().toFixed(2) }}·x
            + {{ a2().toFixed(2) }}·x²
            + {{ a3().toFixed(2) }}·x³
          </div>
          <div class="sample mono strong">
            = {{ termValues()[0].toFixed(2) }}
            + {{ termValues()[1].toFixed(2) }}
            + {{ termValues()[2].toFixed(2) }}
            + {{ termValues()[3].toFixed(2) }}
            = {{ pAtX0().toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="sliders">
        <div class="sl">
          <span class="lab">a₀</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a0()" (input)="a0.set(+$any($event).target.value)" />
          <span class="val">{{ a0().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₁</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a1()" (input)="a1.set(+$any($event).target.value)" />
          <span class="val">{{ a1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₂</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a2()" (input)="a2.set(+$any($event).target.value)" />
          <span class="val">{{ a2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₃</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a3()" (input)="a3.set(+$any($event).target.value)" />
          <span class="val">{{ a3().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">x</span>
          <input type="range" min="-1.2" max="1.2" step="0.05" [value]="x0()" (input)="x0.set(+$any($event).target.value)" />
          <span class="val">{{ x0().toFixed(2) }}</span>
        </div>
      </div>

      <div class="graph-grid">
        <section class="graph-card big">
          <div class="gc-title">多項式曲線</div>
          <svg viewBox="-130 -105 260 210" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-90" [attr.x2]="g" [attr.y2]="90" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-90" x2="0" y2="90" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="termPaths()[0]" fill="none" stroke="var(--v6)" stroke-width="2" />
            <path [attr.d]="termPaths()[1]" fill="none" stroke="var(--v0)" stroke-width="2" />
            <path [attr.d]="termPaths()[2]" fill="none" stroke="var(--v1)" stroke-width="2" />
            <path [attr.d]="termPaths()[3]" fill="none" stroke="var(--v4)" stroke-width="2" />
            <path [attr.d]="totalPath()" fill="none" stroke="var(--accent)" stroke-width="3.8" />

            <line [attr.x1]="x0() * 92" y1="-90" [attr.x2]="x0() * 92" y2="90" stroke="var(--accent-30)" stroke-width="1.5" stroke-dasharray="5 4" />
            <circle [attr.cx]="x0() * 92" [attr.cy]="-pAtX0() * 24" r="4.5" fill="var(--accent)" stroke="white" stroke-width="1.2" />
          </svg>
        </section>

        <section class="graph-card">
          <div class="gc-title">基底分量</div>
          <div class="term-row">
            <span class="swatch basis0"></span>
            <span class="mono">a₀·1 = {{ termValues()[0].toFixed(2) }}</span>
          </div>
          <div class="term-row">
            <span class="swatch basis1"></span>
            <span class="mono">a₁·x = {{ termValues()[1].toFixed(2) }}</span>
          </div>
          <div class="term-row">
            <span class="swatch basis2"></span>
            <span class="mono">a₂·x² = {{ termValues()[2].toFixed(2) }}</span>
          </div>
          <div class="term-row">
            <span class="swatch basis3"></span>
            <span class="mono">a₃·x³ = {{ termValues()[3].toFixed(2) }}</span>
          </div>
          <div class="term-row total">
            <span class="swatch total"></span>
            <span class="mono">p(x) = {{ pAtX0().toFixed(2) }}</span>
          </div>
        </section>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        在這裡，基底就是 <strong>{{ '{' }}1, x, x², x³{{ '}' }}</strong>。你可以把每個多項式都看成這四個基底的線性組合。
      </p>
      <p>
        所以 <strong>P₃ 是四維空間</strong>。它不是畫成四維箭頭，但它確實需要四個座標才能完整描述。
      </p>
    </app-prose-block>
  `,
  styles: `
    .top-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .vector-card, .sample-card, .graph-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .vc-title, .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .coord, .poly, .sample { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .strong { color: var(--text); font-weight: 700; }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .sl { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); text-align: center; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 42px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .graph-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(220px, 1fr); gap: 12px; }
    .graph-card.big { min-width: 0; }
    .viz { width: 100%; display: block; }
    .term-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);
      &:last-child { border-bottom: none; } }
    .swatch { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
    .basis0 { background: var(--v6); }
    .basis1 { background: var(--v0); }
    .basis2 { background: var(--v1); }
    .basis3 { background: var(--v4); }
    .swatch.total { background: var(--accent); }

    @media (max-width: 820px) {
      .graph-grid { grid-template-columns: 1fr; }
    }
  `,
})
export class StepPolynomialSpaceComponent {
  readonly grid = [-90, -60, -30, 30, 60, 90];

  readonly a0 = signal(0.8);
  readonly a1 = signal(-0.4);
  readonly a2 = signal(1.2);
  readonly a3 = signal(-0.7);
  readonly x0 = signal(0.4);

  readonly coeffs = computed<[number, number, number, number]>(() => [this.a0(), this.a1(), this.a2(), this.a3()]);
  readonly polyText = computed(() => formatPolynomial(this.coeffs()));
  readonly totalPath = computed(() => functionPath((x) => polyValue(this.coeffs(), x), { scaleY: 24 }));
  readonly termPaths = computed(() => [
    functionPath(() => this.a0(), { scaleY: 24 }),
    functionPath((x) => this.a1() * x, { scaleY: 24 }),
    functionPath((x) => this.a2() * x * x, { scaleY: 24 }),
    functionPath((x) => this.a3() * x * x * x, { scaleY: 24 }),
  ]);
  readonly termValues = computed(() => {
    const x = this.x0();
    return [
      this.a0(),
      this.a1() * x,
      this.a2() * x * x,
      this.a3() * x * x * x,
    ];
  });
  readonly pAtX0 = computed(() => this.termValues().reduce((sum, value) => sum + value, 0));
}
