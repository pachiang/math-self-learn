import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { hessian2x2 } from './analysis-ch13-util';

@Component({
  selector: 'app-step-mvt-taylor-mv',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="均值定理與 Taylor" subtitle="§13.6">
      <p>一變數均值定理在多變數的推廣：</p>
      <p class="formula">f(b) − f(a) = ∇f(c) · (b − a)，某 c 在 a 和 b 之間</p>
      <p>
        二階 Taylor 展開用 <strong>Hessian 矩陣</strong>（二階偏導數矩陣）：
      </p>
      <p class="formula">
        f(a + h) ≈ f(a) + ∇f(a)·h + ½ hᵀ H(a) h
      </p>
      <p>
        H(a) = Hessian 矩陣 = [∂²f/∂xᵢ∂xⱼ]。
        它是<strong>對稱矩陣</strong>（Schwarz），跟線代 Ch7 的二次型直接連結。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="f(x,y) = x³ − 3xy² 的 Hessian 在不同點的行為">
      <div class="ctrl-row">
        <span class="cl">x₀ = {{ px().toFixed(1) }}</span>
        <input type="range" min="-2" max="2" step="0.1" [value]="px()"
               (input)="px.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">y₀ = {{ py().toFixed(1) }}</span>
        <input type="range" min="-2" max="2" step="0.1" [value]="py()"
               (input)="py.set(+($any($event.target)).value)" class="sl" />
      </div>

      <div class="hessian-display">
        <div class="hd-label">H =</div>
        <table class="hd-table">
          @for (row of hess(); track $index) {
            <tr>
              @for (v of row; track $index) {
                <td>{{ v.toFixed(2) }}</td>
              }
            </tr>
          }
        </table>
        <div class="hd-info">
          <div class="hi-row">
            <span class="hi-label">det H</span>
            <span class="hi-val">{{ hessDet().toFixed(2) }}</span>
          </div>
          <div class="hi-row">
            <span class="hi-label">類型</span>
            <span class="hi-val" [class.ok]="hessDet() > 0" [class.bad]="hessDet() < 0">
              {{ classifyPoint() }}
            </span>
          </div>
        </div>
      </div>

      <div class="classify-table">
        <table class="ct">
          <thead><tr><th>det H</th><th>fₓₓ</th><th>臨界點類型</th></tr></thead>
          <tbody>
            <tr><td>> 0</td><td>> 0</td><td class="ok">極小值</td></tr>
            <tr><td>> 0</td><td>&lt; 0</td><td class="ok">極大值</td></tr>
            <tr><td>&lt; 0</td><td>—</td><td class="bad">鞍點</td></tr>
            <tr><td>= 0</td><td>—</td><td>無法判斷</td></tr>
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Hessian 就是線代 Ch7 的<strong>二次型</strong>在微積分裡的再現。
        正定 → 極小，負定 → 極大，不定 → 鞍點。
      </p>
      <p>下一節看<strong>反函數定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.7; }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .cl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .sl { width: 80px; accent-color: var(--accent); }
    .hessian-display { display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
      padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; }
    .hd-label { font-size: 16px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .hd-table { border-collapse: collapse; }
    .hd-table td { padding: 8px 14px; font-size: 15px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; color: var(--accent);
      border: 1px solid var(--border); text-align: center; }
    .hd-info { margin-left: auto; }
    .hi-row { display: flex; gap: 10px; margin: 4px 0; }
    .hi-label { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .hi-val { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }
    .classify-table { overflow-x: auto; }
    .ct { width: 100%; border-collapse: collapse; font-size: 13px; text-align: center; }
    .ct th { padding: 8px; color: var(--text-muted); border-bottom: 1px solid var(--border);
      font-weight: 600; background: var(--bg-surface); }
    .ct td { padding: 8px; border-bottom: 1px solid var(--border); color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.ok { color: #5a8a5a; font-weight: 700; } &.bad { color: #a05a5a; font-weight: 700; } }
  `,
})
export class StepMvtTaylorMvComponent {
  readonly px = signal(1.0);
  readonly py = signal(0.5);

  // f(x,y) = x³ − 3xy²
  private readonly f = (x: number, y: number) => x * x * x - 3 * x * y * y;

  readonly hess = computed(() => hessian2x2(this.f, this.px(), this.py()));

  readonly hessDet = computed(() => {
    const H = this.hess();
    return H[0][0] * H[1][1] - H[0][1] * H[1][0];
  });

  classifyPoint(): string {
    const d = this.hessDet();
    const fxx = this.hess()[0][0];
    if (Math.abs(d) < 0.1) return '退化';
    if (d > 0) return fxx > 0 ? '極小值' : '極大值';
    return '鞍點';
  }
}
