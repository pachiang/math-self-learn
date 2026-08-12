import { Component, computed, signal } from '@angular/core';
import { INTEGER_WINDOW, integerImage, integerPreimage } from './rings-ch1-model';

@Component({
  selector: 'app-rings-ch1-unequal-undo',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 1.2</p><h2>Addition 保證一條回程；multiplication 沒有做同樣承諾</h2><p class="lede">留在 integer world 裡比較兩台 machines。固定加 2 是整條 lattice 的平移；固定乘 2 會跳過所有 odd targets。</p></header>
      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>哪台 machine 能替每個 integer target 找到 integer input？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set('translate')">只有 ＋2</button><button type="button" (click)="prediction.set('both')">兩台都可以</button></div>
        @if (prediction()) { <p class="feedback" [class.warning]="prediction() === 'both'">{{ prediction() === 'translate' ? '對。接著選一個 target，親自查看回程是否仍在 ℤ。' : '試試 odd target 3：×2 需要 input 1.5，它已經離開 integer world。' }}</p> }
      </section>
      <div class="control-row">
        <button type="button" [class.active]="machine() === 'translate'" (click)="machine.set('translate')">x ↦ x + 2</button>
        <button type="button" class="multiply" [class.active]="machine() === 'double'" (click)="machine.set('double')">x ↦ 2x</button>
        <span class="kicker">TARGET</span>
        @for (value of targets; track value) { <button type="button" [class.active]="target() === value" (click)="target.set(value)">{{ value }}</button> }
        <button type="button" (click)="showUndo.update(value => !value)">{{ showUndo() ? '隱藏回程' : '尋找回程' }}</button>
      </div>
      <section class="stage stage-grid">
        <div class="rail-board" role="img" [attr.aria-label]="ariaLabel()">
          <div><p class="kicker">INPUT RAIL · ℤ</p><div class="rail">@for (value of window; track value) { <div class="rail-cell"><span>{{ value }}</span><small class="arrow-caption">→ {{ image(value) }}</small></div> }</div></div>
          <div><p class="kicker">OUTPUT SOCKETS · ℤ</p><div class="rail">@for (value of window; track value) { <div class="rail-cell" [class.target]="value === target()" [class.reached]="isReached(value)" [class.gap]="!isReached(value)"><span>{{ value }}</span><small class="arrow-caption">{{ isReached(value) ? '有 input' : 'gap' }}</small></div> }</div></div>
        </div>
        <aside class="console" aria-live="polite"><p class="kicker">UNDO CHECK</p><h3>Target {{ target() }}：{{ preimage() === null ? '回程離開 ℤ' : 'input 是 ' + preimage() }}</h3><p>{{ explanation() }}</p>@if (showUndo()) { <div class="readout">{{ undoEquation() }}</div> }</aside>
      </section>
      <section class="insight"><span class="insight-icon">↩</span><div><strong>Addition 的 undo 是底層承諾</strong><span>Multiplication 的 undo 是額外成就，不是 ring 的入場券。</span></div></section>
      <details><summary>邊界：這不表示 multiplication 永遠不可逆</summary><p><code>x ↦ 1x</code> 當然可以撤銷。後面會把具有乘法 inverse 的 elements 稱為 units；本節只建立 ring 不保證每個非零 element 都有這種能力。</p></details>
    </article>
  `,
})
export class RingsCh1UnequalUndoComponent {
  readonly window = INTEGER_WINDOW;
  readonly targets = [-3, -2, -1, 0, 1, 2, 3] as const;
  readonly machine = signal<'translate' | 'double'>('translate');
  readonly target = signal(3);
  readonly showUndo = signal(false);
  readonly prediction = signal<'translate' | 'both' | null>(null);
  readonly preimage = computed(() => integerPreimage(this.target(), this.machine()));
  readonly explanation = computed(() => this.machine() === 'translate' ? '減 2 永遠把 integer target 帶回 integer input，因此整條 rail 沒有 gaps。' : this.preimage() === null ? '若 2x 等於 odd target，x 需要是半整數；這個 undo 不住在目前的 world。' : '這個 even target 有回程，但「某些 targets 可以」不等於「所有 targets 都保證可以」。');
  readonly undoEquation = computed(() => this.preimage() === null ? `${this.target()} ÷ 2 = ${this.target() / 2} ∉ ℤ` : `${this.preimage()} ${this.machine() === 'translate' ? '+ 2' : '× 2'} = ${this.target()}`);
  readonly ariaLabel = computed(() => `${this.machine() === 'translate' ? '加二平移' : '乘二伸縮'} machine；target ${this.target()} ${this.preimage() === null ? '沒有 integer preimage' : `的 integer preimage 是 ${this.preimage()}`}`);
  image(value: number): number { return integerImage(value, this.machine()); }
  isReached(value: number): boolean { return integerPreimage(value, this.machine()) !== null; }
}
