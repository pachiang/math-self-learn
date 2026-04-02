import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { zMul, zInv } from './field-utils';

@Component({
  selector: 'app-step-finite-fields',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="有限域 Z\u209A" subtitle="\u00A77.2">
      <p>
        Z\u209A（p 為質數）是最簡單的有限域。
        它只有 p 個元素：0, 1, ..., p\u22121，但加減乘除全都能做。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看看 Z\u209A 的乘法表和每個元素的倒數">
      <div class="p-selector">
        <span class="cl">p =</span>
        @for (p of pOptions; track p) {
          <button class="p-btn" [class.active]="prime() === p" (click)="prime.set(p)">{{ p }}</button>
        }
      </div>

      <!-- Multiplication table -->
      <div class="section-label">Z{{ prime() }} 的乘法表（非零部分）：</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="corner">\u00D7</th>
              @for (j of nonZero(); track j) { <th>{{ j }}</th> }
            </tr>
          </thead>
          <tbody>
            @for (i of nonZero(); track i) {
              <tr>
                <th>{{ i }}</th>
                @for (j of nonZero(); track j) {
                  <td [class.one]="mul(i,j) === 1">{{ mul(i,j) }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Inverses -->
      <div class="section-label">乘法逆元：</div>
      <div class="inv-row">
        @for (a of nonZero(); track a) {
          <div class="inv-pair">
            <span class="inv-a">{{ a }}</span>
            <span class="inv-arrow">\u207B\u00B9=</span>
            <span class="inv-b">{{ inverse(a) }}</span>
          </div>
        }
      </div>

      <div class="note">
        每個非零元素都有倒數 — 這就是「域」的意思。
        乘法表裡每行每列恰好是 1~{{ prime()-1 }} 的一個排列。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        有限域不只有 Z\u209A。還有<strong>元素個數是質數冪</strong>的域 GF(p\u207F)，
        但它們不是簡單的 Z\u209A\u207F。構造它們需要多項式 — 這就是下一節的主題。
      </p>
    </app-prose-block>
  `,
  styles: `
    .p-selector { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
    .cl { font-size: 14px; font-weight: 500; color: var(--text-secondary); }
    .p-btn { width: 36px; height: 30px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 14px; font-weight: 600; cursor: pointer;
      &:hover { background: var(--accent-10); } &.active { background: var(--accent-18); border-color: var(--accent); } }
    .section-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 14px; }
    table { border-collapse: collapse; margin: 0 auto; }
    th, td { width: 32px; height: 28px; text-align: center; font-size: 13px; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); }
    th { background: var(--accent-10); color: var(--text-secondary); font-weight: 600; }
    .corner { background: var(--accent-18); }
    .one { background: rgba(90,138,90,0.12); font-weight: 700; color: #5a8a5a; }
    .inv-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .inv-pair { display: flex; align-items: center; gap: 3px; padding: 4px 10px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border); }
    .inv-a { font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .inv-arrow { font-size: 12px; color: var(--text-muted); }
    .inv-b { font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .note { font-size: 13px; color: var(--text-secondary); padding: 10px 14px; background: var(--accent-10); border-radius: 8px; }
  `,
})
export class StepFiniteFieldsComponent {
  readonly pOptions = [2, 3, 5, 7, 11];
  readonly prime = signal(5);
  readonly nonZero = computed(() => Array.from({ length: this.prime() - 1 }, (_, i) => i + 1));
  mul(a: number, b: number): number { return zMul(a, b, this.prime()); }
  inverse(a: number): number { return zInv(a, this.prime()); }
}
