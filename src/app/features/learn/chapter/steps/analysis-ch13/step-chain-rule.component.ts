import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { jacobian2x2, det2x2 } from './analysis-ch13-util';

@Component({
  selector: 'app-step-chain-rule-mv',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="鏈式法則" subtitle="§13.5">
      <p>
        一變數：(f∘g)' = f'(g(x)) · g'(x)。多變數的推廣：
      </p>
      <p class="formula axiom">
        D(f∘g)(a) = Df(g(a)) · Dg(a)<br />
        （Jacobian 矩陣的乘積）
      </p>
      <p>
        多變數的鏈式法則就是<strong>Jacobian 矩陣的矩陣乘法</strong>。
        這連回了線代 Ch2 的矩陣乘法——變換的組合 = 矩陣的乘積。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Jacobian 矩陣和行列式">
      <div class="jacobian-display">
        <div class="jd-title">F(x,y) = (x² − y², 2xy)（複數平方映射 z²）</div>

        <div class="probe-ctrl">
          <span class="cl">x = {{ px().toFixed(1) }}</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="px()"
                 (input)="px.set(+($any($event.target)).value)" class="sl" />
          <span class="cl">y = {{ py().toFixed(1) }}</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="py()"
                 (input)="py.set(+($any($event.target)).value)" class="sl" />
        </div>

        <div class="matrix-display">
          <div class="md-label">J = DF =</div>
          <table class="md-table">
            @for (row of jac(); track $index) {
              <tr>
                @for (v of row; track $index) {
                  <td>{{ v.toFixed(2) }}</td>
                }
              </tr>
            }
          </table>
          <div class="md-det">
            det J = {{ jacDet().toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="det-meaning">
        <div class="dm-title">det J 的幾何意義</div>
        <div class="dm-body">
          |det J| = 面積的<strong>局部放大倍率</strong>。<br />
          det J > 0 → 保持方向。det J &lt; 0 → 翻轉方向。<br />
          det J = 0 → 映射在該點「壓扁」成低維（不可逆）。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Jacobian 行列式在換變數（Ch14）和反函數定理（§13.7）裡都是核心角色。
        下一節看多變數的<strong>均值定理和 Taylor</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .jacobian-display { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 14px; }
    .jd-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 10px;
      font-family: 'JetBrains Mono', monospace; }
    .probe-ctrl { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .cl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .sl { width: 80px; accent-color: var(--accent); }
    .matrix-display { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .md-label { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .md-table { border-collapse: collapse; }
    .md-table td { padding: 8px 14px; font-size: 15px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; color: var(--accent);
      border: 1px solid var(--border); text-align: center; }
    .md-det { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-left: auto; }
    .det-meaning { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .dm-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .dm-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepChainRuleMvComponent {
  readonly px = signal(1.0);
  readonly py = signal(0.5);

  // F(x,y) = (x²−y², 2xy)
  private readonly F = (x: number, y: number): [number, number] => [x*x - y*y, 2*x*y];

  readonly jac = computed(() => jacobian2x2(this.F, this.px(), this.py()));
  readonly jacDet = computed(() => det2x2(this.jac()));
}
