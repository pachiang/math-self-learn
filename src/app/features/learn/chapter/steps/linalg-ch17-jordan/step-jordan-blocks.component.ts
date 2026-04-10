import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { jordanBlock, jordanBlockPower, jordanBlockExp } from './jordan-util';

@Component({
  selector: 'app-step-jordan-blocks',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Jordan 區塊" subtitle="§17.5">
      <p>
        一個 <strong>Jordan 區塊</strong> Jₖ(λ) 是 k×k 的矩陣：對角線全是 λ，
        超對角線（右上方一格）全是 1。
      </p>
      <p class="formula">J₂(λ) = [λ, 1; 0, λ]&emsp;&emsp;J₃(λ) = [λ, 1, 0; 0, λ, 1; 0, 0, λ]</p>
      <p>
        Jordan 區塊的作用：<strong>縮放 + 位移</strong>。λ 負責縮放，
        超對角的 1 把鏈上的向量「往前推一個」。這就是缺陷矩陣的幾何本質。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整 λ 和區塊大小 k，看冪次和指數怎麼變">
      <div class="ctrl-row">
        <div class="ctrl">
          <span class="ctrl-label">λ =</span>
          <input type="range" min="-2" max="3" step="0.1" [value]="lambda()"
                 (input)="onLambda($event)" class="ctrl-slider" />
          <span class="ctrl-val">{{ lambda().toFixed(1) }}</span>
        </div>
        <div class="ctrl">
          <span class="ctrl-label">k =</span>
          <input type="range" min="2" max="4" step="1" [value]="size()"
                 (input)="onSize($event)" class="ctrl-slider" />
          <span class="ctrl-val">{{ size() }}</span>
        </div>
      </div>

      <div class="layout">
        <div class="block-card">
          <div class="bc-title">Jₖ(λ)</div>
          <table class="j-table">
            @for (row of J(); track $index; let i = $index) {
              <tr>
                @for (v of row; track $index; let j = $index) {
                  <td [class.diag]="i === j" [class.super]="j === i + 1 && v === 1"
                      [class.zero]="v === 0 && i !== j">{{ fmt(v) }}</td>
                }
              </tr>
            }
          </table>
        </div>

        <div class="block-card">
          <div class="bc-title">
            Jₖ(λ)ⁿ，n = {{ power() }}
            <input type="range" min="0" max="10" step="1" [value]="power()"
                   (input)="onPower($event)" class="power-slider" />
          </div>
          <table class="j-table">
            @for (row of Jn(); track $index; let i = $index) {
              <tr>
                @for (v of row; track $index; let j = $index) {
                  <td [class.diag]="i === j" [class.nonzero]="Math.abs(v) > 0.001 && i !== j">{{ fmt(v) }}</td>
                }
              </tr>
            }
          </table>
          <div class="pattern-note">
            對角線 = λⁿ = {{ fmt(Math.pow(lambda(), power())) }}，
            超對角 = C(n,1)λⁿ⁻¹, C(n,2)λⁿ⁻², …
          </div>
        </div>
      </div>

      <div class="exp-section">
        <div class="exp-title">
          e^(Jₖ(λ)t)，t = {{ tVal().toFixed(1) }}
          <input type="range" min="0" max="3" step="0.1" [value]="tVal()"
                 (input)="onT($event)" class="power-slider" />
        </div>
        <table class="j-table">
          @for (row of expJ(); track $index; let i = $index) {
            <tr>
              @for (v of row; track $index; let j = $index) {
                <td [class.diag]="i === j" [class.nonzero]="Math.abs(v) > 0.001 && i !== j">{{ fmt(v) }}</td>
              }
            </tr>
          }
        </table>
        <div class="pattern-note">
          對角線 = eᵏᵗ，超對角 = t·eᵏᵗ, t²/2!·eᵏᵗ, …
          → 這就是 ODE 裡 t·eᵏᵗ 出現的原因！
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        現在你看到了：
      </p>
      <ul>
        <li>Jordan 區塊的冪次包含<strong>二項式係數</strong>，增長是多項式 × 指數</li>
        <li>e^(Jt) 裡面出現的 t, t²/2!, … 就是第九章 ODE 重根情形的來源</li>
      </ul>
      <p>
        下一節把所有區塊組合起來：<strong>Jordan 標準形</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
    .ctrl { display: flex; align-items: center; gap: 8px; }
    .ctrl-label { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-slider { width: 100px; accent-color: var(--accent); }
    .ctrl-val { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 30px; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .block-card { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .bc-title { font-size: 12px; font-weight: 600; color: var(--text-muted);
      margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
    .power-slider { width: 80px; accent-color: var(--accent); }

    .j-table { border-collapse: collapse; margin: 0 auto; }
    .j-table td { min-width: 52px; height: 32px; text-align: center; font-size: 13px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      color: var(--text-muted); padding: 4px 8px;
      &.diag { background: rgba(200, 152, 59, 0.15); color: #c8983b; font-weight: 700; }
      &.super { background: rgba(110, 138, 168, 0.15); color: #5a7faa; font-weight: 700; }
      &.nonzero { color: var(--text); font-weight: 600; }
      &.zero { opacity: 0.3; } }

    .pattern-note { font-size: 11px; color: var(--text-secondary); margin-top: 8px;
      text-align: center; font-family: 'JetBrains Mono', monospace; }

    .exp-section { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .exp-title { font-size: 12px; font-weight: 600; color: var(--text-muted);
      margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
  `,
})
export class StepJordanBlocksComponent {
  readonly Math = Math;
  readonly lambda = signal(2);
  readonly size = signal(3);
  readonly power = signal(3);
  readonly tVal = signal(1.0);

  readonly J = computed(() => jordanBlock(this.lambda(), this.size()));
  readonly Jn = computed(() => jordanBlockPower(this.lambda(), this.size(), this.power()));
  readonly expJ = computed(() => jordanBlockExp(this.lambda(), this.size(), this.tVal()));

  onLambda(ev: Event): void { this.lambda.set(+(ev.target as HTMLInputElement).value); }
  onSize(ev: Event): void { this.size.set(+(ev.target as HTMLInputElement).value); }
  onPower(ev: Event): void { this.power.set(+(ev.target as HTMLInputElement).value); }
  onT(ev: Event): void { this.tVal.set(+(ev.target as HTMLInputElement).value); }

  fmt(v: number): string {
    if (Math.abs(v) < 1e-8) return '0';
    if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
    return v.toFixed(2);
  }
}
