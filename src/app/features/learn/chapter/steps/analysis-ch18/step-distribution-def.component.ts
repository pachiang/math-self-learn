import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { TEST_FUNCTIONS, bumpFunction } from './analysis-ch18-util';

@Component({
  selector: 'app-step-distribution-def',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="分佈的定義" subtitle="§18.3">
      <p>
        <strong>分佈</strong>（distribution）T 是 D 上的連續線性泛函：
      </p>
      <p class="formula">T : D → R，滿足線性 + 連續</p>
      <p>
        記作 ⟨T, φ⟩ = T(φ)。直覺：分佈「吃掉」一個測試函數，吐出一個數。
      </p>
      <p>
        每個 locally integrable 函數 f 都對應一個分佈：⟨T_f, φ⟩ = ∫ f(x)φ(x) dx。
        但分佈比函數多——δ 就是無法用函數表示的分佈。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選分佈和測試函數，看 ⟨T, φ⟩ 的值">
      <div class="ctrl-grid">
        <div class="ctrl-col">
          <div class="ctrl-label">分佈 T</div>
          <button class="ft" [class.active]="distSel() === 0" (click)="distSel.set(0)">δ (Dirac)</button>
          <button class="ft" [class.active]="distSel() === 1" (click)="distSel.set(1)">T_1 (常數 1)</button>
          <button class="ft" [class.active]="distSel() === 2" (click)="distSel.set(2)">T_x (恆等)</button>
          <button class="ft" [class.active]="distSel() === 3" (click)="distSel.set(3)">δ' (delta 導數)</button>
        </div>
        <div class="ctrl-col">
          <div class="ctrl-label">測試函數 φ</div>
          @for (t of testFns; track t.name; let i = $index) {
            <button class="ft" [class.active]="fnSel() === i" (click)="fnSel.set(i)">{{ t.name }}</button>
          }
        </div>
      </div>

      <div class="result-box">
        <div class="rb-formula">⟨{{ distNames[distSel()] }}, {{ testFns[fnSel()].formula }}⟩</div>
        <div class="rb-meaning">= {{ meanings[distSel()] }}</div>
        <div class="rb-val">= {{ result().toFixed(6) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        δ 把 φ 映射到 φ(0)——只看一個點的值。δ' 把 φ 映射到 −φ'(0)。
        這些「函數」不在 L² 裡，但作為<strong>線性泛函</strong>完全合法。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-grid { display: flex; gap: 14px; margin-bottom: 14px; }
    .ctrl-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .ctrl-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 2px; }
    .ft { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; text-align: left;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .result-box { padding: 16px; border-radius: 10px; background: var(--bg-surface); border: 2px solid var(--accent);
      text-align: center; font-family: 'JetBrains Mono', monospace; }
    .rb-formula { font-size: 14px; color: var(--text-muted); margin-bottom: 4px; }
    .rb-meaning { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .rb-val { font-size: 24px; font-weight: 700; color: var(--accent); }
  `,
})
export class StepDistributionDefComponent {
  readonly testFns = TEST_FUNCTIONS;
  readonly distSel = signal(0);
  readonly fnSel = signal(0);
  readonly distNames = ['δ', 'T₁', 'T_x', "δ'"];
  readonly meanings = ['φ(0)', '∫ φ(x) dx', '∫ x·φ(x) dx', "−φ'(0)"];

  readonly result = computed(() => {
    const phi = TEST_FUNCTIONS[this.fnSel()].fn;
    const d = this.distSel();
    const h = 1e-5;
    const N = 1000;
    switch (d) {
      case 0: return phi(0); // δ
      case 1: { // T_1 = ∫φ
        let sum = 0;
        for (let i = 0; i < N; i++) { const x = -3 + 6 * (i + 0.5) / N; sum += phi(x) * (6 / N); }
        return sum;
      }
      case 2: { // T_x = ∫xφ
        let sum = 0;
        for (let i = 0; i < N; i++) { const x = -3 + 6 * (i + 0.5) / N; sum += x * phi(x) * (6 / N); }
        return sum;
      }
      case 3: return -(phi(h) - phi(-h)) / (2 * h); // δ' → −φ'(0)
      default: return 0;
    }
  });
}
