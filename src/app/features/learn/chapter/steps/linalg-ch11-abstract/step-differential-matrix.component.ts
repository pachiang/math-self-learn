import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { functionPath, formatPolynomial, polyDerivative, polyValue } from './abstract-util';

@Component({
  selector: 'app-step-differential-matrix',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="微分的矩陣表示" subtitle="§11.5">
      <p>
        微分是一個最漂亮的線性算子例子。對 P₃ 而言，
        <strong>D = d/dx</strong> 會把三次多項式送到二次多項式：
      </p>
      <p class="formula">a₀ + a₁x + a₂x² + a₃x³ ⟶ a₁ + 2a₂x + 3a₃x²</p>
      <p>
        如果基底固定為 {{ '{' }}1, x, x², x³{{ '}' }}，那麼微分就可以被寫成一個矩陣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整 p(x)，看 tangent slope、導函數曲線和矩陣乘法如何同步變動">
      <div class="sliders">
        <div class="sl">
          <span class="lab">a₀</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="a0()" (input)="a0.set(+$any($event).target.value)" />
          <span class="val">{{ a0().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₁</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="a1()" (input)="a1.set(+$any($event).target.value)" />
          <span class="val">{{ a1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₂</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="a2()" (input)="a2.set(+$any($event).target.value)" />
          <span class="val">{{ a2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₃</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="a3()" (input)="a3.set(+$any($event).target.value)" />
          <span class="val">{{ a3().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">x₀</span>
          <input type="range" min="-1.2" max="1.2" step="0.05" [value]="x0()" (input)="x0.set(+$any($event).target.value)" />
          <span class="val">{{ x0().toFixed(2) }}</span>
        </div>
      </div>

      <div class="equations">
        <div class="eq mono">p(x) = {{ polyText() }}</div>
        <div class="eq mono strong">p′(x) = {{ derivativeText() }}</div>
        <div class="eq mono">p′({{ x0().toFixed(2) }}) = {{ slope().toFixed(2) }}</div>
      </div>

      <div class="graph-grid">
        <section class="graph-card">
          <div class="gc-title">原函數與切線</div>
          <svg viewBox="-130 -95 260 190" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-80" [attr.x2]="g" [attr.y2]="80" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="3.5" />
            <path [attr.d]="tangentPath()" fill="none" stroke="var(--v4)" stroke-width="2.3" stroke-dasharray="6 4" />
            <circle [attr.cx]="x0() * 92" [attr.cy]="-y0()" r="4.5" fill="var(--accent)" stroke="white" stroke-width="1.2" />
          </svg>
        </section>

        <section class="graph-card">
          <div class="gc-title">導函數 p′(x)</div>
          <svg viewBox="-130 -95 260 190" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-80" [attr.x2]="g" [attr.y2]="80" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="derivativePath()" fill="none" stroke="var(--v1)" stroke-width="3.2" />
            <line [attr.x1]="x0() * 92" y1="-80" [attr.x2]="x0() * 92" y2="80" stroke="var(--v1)" stroke-width="1.4" stroke-dasharray="5 4" opacity="0.6" />
            <circle [attr.cx]="x0() * 92" [attr.cy]="-(slope() * 24)" r="4.5" fill="var(--v1)" stroke="white" stroke-width="1.2" />
          </svg>
        </section>
      </div>

      <div class="matrix-card">
        <div class="mc-title">在基底 {{ '{' }}1, x, x², x³{{ '}' }} 下，D 的矩陣是</div>
        <div class="mono matrix-form">
          <span class="bracket">[</span>
          <div class="mat-grid">
            @for (row of matrix; track $index) {
              @for (entry of row; track $index) {
                <span>{{ entry }}</span>
              }
            }
          </div>
          <span class="bracket">]</span>
        </div>
        <div class="mono product">
          D · {{ vectorText(coeffs()) }} = {{ vectorText(derivativeVector()) }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這裡很值得停一下：<strong>微分不是矩陣本身，它是一個線性算子；矩陣只是它在某套基底下的座標表示。</strong>
      </p>
      <p>
        只要換一套基底，矩陣會變；但「這台機器在做微分」這件事不變。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 700; color: var(--accent); padding: 10px;
      background: var(--accent-10); border-radius: 8px; margin: 10px 0; font-family: 'JetBrains Mono', monospace; }

    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .sl { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); text-align: center; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 42px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .equations { display: grid; gap: 6px; margin-bottom: 12px; }
    .eq { padding: 8px 12px; border-radius: 8px; background: var(--bg); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-secondary); }
    .eq.strong { color: var(--text); font-weight: 700; }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .graph-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .graph-card, .matrix-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .gc-title, .mc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }

    .matrix-form { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }
    .bracket { font-size: 46px; color: var(--accent); line-height: 1; }
    .mat-grid { display: grid; grid-template-columns: repeat(4, 28px); gap: 6px; justify-items: center; align-items: center; font-size: 13px; color: var(--text); }
    .product { text-align: center; font-size: 13px; color: var(--text-secondary); }
  `,
})
export class StepDifferentialMatrixComponent {
  readonly grid = [-60, -30, 30, 60];
  readonly matrix = [
    [0, 1, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 3],
    [0, 0, 0, 0],
  ];

  readonly a0 = signal(0.6);
  readonly a1 = signal(-0.9);
  readonly a2 = signal(1.2);
  readonly a3 = signal(0.7);
  readonly x0 = signal(0.35);

  readonly coeffs = computed<[number, number, number, number]>(() => [this.a0(), this.a1(), this.a2(), this.a3()]);
  readonly derivativeCoeffs = computed(() => polyDerivative(this.coeffs()));
  readonly derivativeVector = computed<[number, number, number, number]>(() => [
    this.a1(),
    2 * this.a2(),
    3 * this.a3(),
    0,
  ]);

  readonly polyText = computed(() => formatPolynomial(this.coeffs()));
  readonly derivativeText = computed(() => formatPolynomial(this.derivativeCoeffs()));
  readonly curvePath = computed(() => functionPath((x) => polyValue(this.coeffs(), x), { scaleY: 24 }));
  readonly derivativePath = computed(() => functionPath((x) => polyValue(this.derivativeCoeffs(), x), { scaleY: 24 }));
  readonly y0 = computed(() => polyValue(this.coeffs(), this.x0()) * 24);
  readonly slope = computed(() => polyValue(this.derivativeCoeffs(), this.x0()));
  readonly tangentPath = computed(() => functionPath((x) => {
    const x0 = this.x0();
    const y0 = polyValue(this.coeffs(), x0);
    return y0 + this.slope() * (x - x0);
  }, { scaleY: 24 }));

  vectorText(values: readonly number[]): string {
    return `[${values.map((value) => value.toFixed(1)).join(', ')}]`;
  }
}
