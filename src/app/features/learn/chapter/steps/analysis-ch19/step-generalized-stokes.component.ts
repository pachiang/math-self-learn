import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { DEMO_1FORMS, integrateForm1, integrateForm2Disk, d1 } from './analysis-ch19-util';

@Component({
  selector: 'app-step-generalized-stokes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="廣義 Stokes 定理" subtitle="§19.6">
      <p>現在一切就緒，全部濃縮成<strong>一行</strong>：</p>
      <p class="formula thm">∫_∂Ω ω = ∫_Ω dω</p>
      <p>
        Ω 是任意維度的「區域」（流形），∂Ω 是它的邊界，<br>
        ω 是 k-form，dω 是 (k+1)-form。<br>
        <strong>邊界上的積分 = 內部外微分的積分</strong>。就這樣。一個定理統治一切。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="驗證：∮_C ω = ∬_D dω（單位圓 + 單位圓盤）">
      <div class="fn-tabs">
        @for (f of forms; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.formula }}</button>
        }
      </div>

      <div class="verify-box">
        <div class="v-col">
          <div class="v-title">∮_∂D ω</div>
          <div class="v-sub">邊界（單位圓）上的 1-form 積分</div>
          <div class="v-val">{{ boundaryVal().toFixed(4) }}</div>
        </div>
        <div class="v-eq">=</div>
        <div class="v-col">
          <div class="v-title">∬_D dω</div>
          <div class="v-sub">內部（圓盤）上的 2-form 積分</div>
          <div class="v-val">{{ interiorVal().toFixed(4) }}</div>
        </div>
      </div>

      <div class="check" [class.ok]="isClose()">
        {{ isClose() ? '廣義 Stokes 定理 ✓' : '數值誤差' }}
      </div>

      <div class="special-cases">
        <div class="sc-title">這個定理的「面貌」</div>
        <div class="sc-row">ω = 0-form (函數) → <strong>微積分基本定理</strong></div>
        <div class="sc-row">ω = 1-form, Ω ⊂ R² → <strong>Green 定理</strong></div>
        <div class="sc-row">ω = 1-form, Ω ⊂ R³ (曲面) → <strong>Stokes 定理</strong></div>
        <div class="sc-row">ω = 2-form, Ω ⊂ R³ (體) → <strong>散度定理</strong></div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        一個公式，四行特例。這就是微分形式語言的威力——
        不是新的數學，而是<strong>看清舊數學本質</strong>的眼鏡。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 700; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 10px; margin: 12px 0;
      font-family: 'JetBrains Mono', monospace;
      &.thm { border: 3px solid var(--accent); } }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ft { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .verify-box { display: flex; align-items: center; justify-content: center; gap: 14px;
      padding: 16px; border-radius: 10px; background: var(--bg-surface); border: 1px solid var(--border);
      margin-bottom: 10px; flex-wrap: wrap; font-family: 'JetBrains Mono', monospace; }
    .v-col { text-align: center; min-width: 120px; }
    .v-title { font-size: 14px; font-weight: 700; color: var(--accent); }
    .v-sub { font-size: 9px; color: var(--text-muted); margin-bottom: 4px; }
    .v-val { font-size: 22px; font-weight: 700; color: var(--accent); }
    .v-eq { font-size: 24px; font-weight: 700; color: var(--accent); }
    .check { text-align: center; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600;
      margin-bottom: 12px; background: rgba(160,90,90,0.08); color: #a05a5a;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .special-cases { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .sc-title { padding: 8px 12px; font-size: 12px; font-weight: 700; color: var(--accent); background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .sc-row { padding: 8px 12px; font-size: 12px; color: var(--text-secondary); border-bottom: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace;
      &:last-child { border-bottom: none; }
      strong { color: var(--accent); } }
  `,
})
export class StepGeneralizedStokesComponent {
  readonly forms = DEMO_1FORMS;
  readonly sel = signal(0);

  // ∮_C ω (unit circle, CCW)
  readonly boundaryVal = computed(() => {
    const omega = DEMO_1FORMS[this.sel()].omega;
    return integrateForm1(
      omega,
      (t) => [Math.cos(t), Math.sin(t)],
      (t) => [-Math.sin(t), Math.cos(t)],
      [0, 2 * Math.PI],
    );
  });

  // ∬_D dω (unit disk)
  readonly interiorVal = computed(() => {
    const omega = DEMO_1FORMS[this.sel()].omega;
    return integrateForm2Disk((x, y) => d1(omega, x, y), 1, 60, 60);
  });

  readonly isClose = computed(() => Math.abs(this.boundaryVal() - this.interiorVal()) < 0.1);
}
