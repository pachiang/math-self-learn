import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ScalarFn, cumulativeIntegralPath, integrate, samplePath } from './fourier-util';

@Component({
  selector: 'app-step-function-inner-product',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="函數的內積" subtitle="§12.1">
      <p>
        在函數空間裡，內積最常見的版本是
        <strong>〈f, g〉 = ∫ f(x)g(x) dx</strong>。
      </p>
      <p>
        它做的事情很像向量點積：如果兩個函數大部分時候同號，內積會偏正；如果一正一負互相抵消，內積就會接近 0。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整兩個函數，直接看 f、g、乘積 fg 和累積積分如何一起變">
      <div class="sliders">
        <div class="sl"><span class="lab">a₀</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="a0()" (input)="a0.set(+$any($event).target.value)" /><span class="val">{{ a0().toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">a₁</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="a1()" (input)="a1.set(+$any($event).target.value)" /><span class="val">{{ a1().toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">a₂</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="a2()" (input)="a2.set(+$any($event).target.value)" /><span class="val">{{ a2().toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">b₀</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="b0()" (input)="b0.set(+$any($event).target.value)" /><span class="val">{{ b0().toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">b₁</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="b1()" (input)="b1.set(+$any($event).target.value)" /><span class="val">{{ b1().toFixed(1) }}</span></div>
        <div class="sl"><span class="lab">b₂</span><input type="range" min="-1.5" max="1.5" step="0.1" [value]="b2()" (input)="b2.set(+$any($event).target.value)" /><span class="val">{{ b2().toFixed(1) }}</span></div>
      </div>

      <div class="graph-grid">
        <section class="graph-card">
          <div class="gc-title">f(x)</div>
          <svg viewBox="-120 -85 240 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="fPath()" fill="none" stroke="var(--v0)" stroke-width="3" />
          </svg>
        </section>
        <section class="graph-card">
          <div class="gc-title">g(x)</div>
          <svg viewBox="-120 -85 240 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="gPath()" fill="none" stroke="var(--v1)" stroke-width="3" />
          </svg>
        </section>
        <section class="graph-card">
          <div class="gc-title">f(x)g(x)</div>
          <svg viewBox="-120 -85 240 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="fgPath()" fill="none" stroke="var(--accent)" stroke-width="3" />
          </svg>
        </section>
        <section class="graph-card">
          <div class="gc-title">從左累積的積分</div>
          <svg viewBox="-120 -85 240 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="cumPath()" fill="none" stroke="var(--v4)" stroke-width="3" />
          </svg>
        </section>
      </div>

      <div class="info">
        <div class="row"><span class="label">f</span><span class="mono">{{ fText() }}</span></div>
        <div class="row"><span class="label">g</span><span class="mono">{{ gText() }}</span></div>
        <div class="row highlight"><span class="label">〈f,g〉</span><span class="mono strong">{{ inner().toFixed(3) }}</span></div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        你可以把內積想成「重疊程度」，但要記得它比純粹面積更微妙，因為正負會互相抵消。
      </p>
      <p>
        正是這種抵消，讓我們能談 <strong>正交函數</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; text-align: center; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 36px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .graph-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .graph-card, .info { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }
    .info { overflow: hidden; padding: 0; }
    .row { display: grid; grid-template-columns: 56px 1fr; border-bottom: 1px solid var(--border); }
    .row:last-child { border-bottom: none; }
    .row.highlight { background: var(--accent-10); }
    .label { padding: 9px 12px; background: var(--bg); color: var(--text-muted); border-right: 1px solid var(--border); font-size: 12px; }
    .mono { padding: 9px 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-secondary); }
    .strong { color: var(--text); font-weight: 700; }
  `,
})
export class StepFunctionInnerProductComponent {
  readonly a0 = signal(0.2);
  readonly a1 = signal(1.0);
  readonly a2 = signal(-0.4);
  readonly b0 = signal(-0.1);
  readonly b1 = signal(0.2);
  readonly b2 = signal(1.0);

  readonly f = computed<ScalarFn>(() => (x) => this.a0() + this.a1() * Math.sin(x) + this.a2() * Math.cos(2 * x));
  readonly g = computed<ScalarFn>(() => (x) => this.b0() + this.b1() * Math.cos(x) + this.b2() * Math.sin(2 * x));
  readonly fg = computed<ScalarFn>(() => (x) => this.f()(x) * this.g()(x));

  readonly fPath = computed(() => samplePath(this.f()));
  readonly gPath = computed(() => samplePath(this.g()));
  readonly fgPath = computed(() => samplePath(this.fg()));
  readonly cumPath = computed(() => cumulativeIntegralPath(this.fg()));
  readonly inner = computed(() => integrate(this.fg()));

  readonly fText = computed(() => `${this.a0().toFixed(1)} + ${this.a1().toFixed(1)}sin(x) ${this.a2() >= 0 ? '+' : '-'} ${Math.abs(this.a2()).toFixed(1)}cos(2x)`);
  readonly gText = computed(() => `${this.b0().toFixed(1)} ${this.b1() >= 0 ? '+' : '-'} ${Math.abs(this.b1()).toFixed(1)}cos(x) ${this.b2() >= 0 ? '+' : '-'} ${Math.abs(this.b2()).toFixed(1)}sin(2x)`);
}

