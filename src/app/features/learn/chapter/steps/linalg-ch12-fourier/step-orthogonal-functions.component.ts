import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { ScalarFn, integrate, samplePath, trigBasisList } from './fourier-util';

@Component({
  selector: 'app-step-orthogonal-functions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正交函數" subtitle="§12.2">
      <p>
        在函數空間裡，<strong>正交</strong> 的意思很直接：內積等於 0。
      </p>
      <p>
        這代表兩個函數雖然各自都不為 0，但它們的乘積在整個區間上正負剛好互相抵消。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選兩個基底函數，看內積何時為 0；下方的 Gram matrix 會把整批關係一次畫出來">
      <div class="pickers">
        <div class="pk"><span class="lab">f</span><select [value]="left()" (change)="left.set(+$any($event).target.value)">@for (b of basis; track b.label; let i = $index) {<option [value]="i">{{ b.label }}</option>}</select></div>
        <div class="pk"><span class="lab">g</span><select [value]="right()" (change)="right.set(+$any($event).target.value)">@for (b of basis; track b.label; let i = $index) {<option [value]="i">{{ b.label }}</option>}</select></div>
      </div>

      <div class="graph-grid">
        <section class="graph-card">
          <div class="gc-title">{{ basis[left()].label }}</div>
          <svg viewBox="-120 -85 240 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="leftPath()" fill="none" stroke="var(--v0)" stroke-width="3" />
          </svg>
        </section>
        <section class="graph-card">
          <div class="gc-title">{{ basis[right()].label }}</div>
          <svg viewBox="-120 -85 240 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="rightPath()" fill="none" stroke="var(--v1)" stroke-width="3" />
          </svg>
        </section>
        <section class="graph-card wide">
          <div class="gc-title">乘積與內積</div>
          <svg viewBox="-120 -85 240 170" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="productPath()" fill="none" stroke="var(--accent)" stroke-width="3" />
          </svg>
          <div class="measure" [class.zero]="isZero()">〈f,g〉 = {{ inner().toFixed(3) }}</div>
        </section>
      </div>

      <div class="matrix-card">
        <div class="gc-title">Gram Matrix</div>
        <div class="matrix">
          <div class="corner"></div>
          @for (b of basis; track b.label) {
            <div class="head">{{ b.label }}</div>
          }
          @for (row of gram(); track $index; let i = $index) {
            <div class="head">{{ basis[i].label }}</div>
            @for (cell of row; track $index) {
              <div class="cell" [style.background]="cellColor(cell)">
                {{ cell.toFixed(1) }}
              </div>
            }
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        一旦你有一整組互相正交的函數，很多事情都會變簡單，因為你可以像在正交座標系裡那樣，直接讀出投影係數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .pickers { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .pk { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { font-size: 14px; font-weight: 700; color: var(--accent); min-width: 18px; font-family: 'Noto Sans Math', serif; }
    select { border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px; background: var(--bg-surface); color: var(--text); }
    .graph-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .graph-card, .matrix-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .graph-card.wide { grid-column: span 2; }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }
    .measure { margin-top: 8px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #aa6666; font-weight: 700; }
    .measure.zero { color: #5a8a5a; }
    .matrix { display: grid; grid-template-columns: 78px repeat(5, minmax(56px, 1fr)); gap: 1px; background: var(--border); border-radius: 8px; overflow: hidden; }
    .head, .cell, .corner { padding: 10px 8px; background: var(--bg-surface); font-size: 11px; text-align: center; }
    .head { font-weight: 700; color: var(--text); }
    .cell { font-family: 'JetBrains Mono', monospace; color: var(--text); }
    @media (max-width: 820px) { .graph-card.wide { grid-column: span 1; } .matrix { grid-template-columns: 64px repeat(5, minmax(48px, 1fr)); } }
  `,
})
export class StepOrthogonalFunctionsComponent {
  readonly basis = trigBasisList(5);
  readonly left = signal(1);
  readonly right = signal(2);

  basisFn(index: number): ScalarFn {
    return this.basis[index].fn;
  }

  readonly leftPath = computed(() => samplePath(this.basisFn(this.left())));
  readonly rightPath = computed(() => samplePath(this.basisFn(this.right())));
  readonly product = computed<ScalarFn>(() => (x) => this.basisFn(this.left())(x) * this.basisFn(this.right())(x));
  readonly productPath = computed(() => samplePath(this.product()));
  readonly inner = computed(() => integrate(this.product()));
  readonly isZero = computed(() => Math.abs(this.inner()) < 0.01);
  readonly gram = computed(() =>
    this.basis.map((bi) => this.basis.map((bj) => integrate((x) => bi.fn(x) * bj.fn(x)))),
  );

  cellColor(value: number): string {
    const a = Math.min(1, Math.abs(value) / Math.PI);
    return value > 0
      ? `rgba(199, 152, 59, ${0.12 + 0.45 * a})`
      : `rgba(110, 138, 168, ${0.08 + 0.45 * a})`;
  }
}

