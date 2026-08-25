import { Component, computed, signal } from '@angular/core';
import {
  FieldWorld,
  WORLD_Q,
  WORLD_Z,
  WORLD_Z5,
  WORLD_Z6,
  blockedElems,
  isField,
} from './fields-ch1-model';

@Component({
  selector: 'app-fields-ch1-divide-is-special',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 1.1</p>
        <h2>能除，是大多數 ring 做不到的一件事</h2>
        <p class="lede">
          環課走完後，<code>+</code>、<code>−</code>、<code>×</code> 都在，加法方程
          <code>a + x = b</code> 永遠有解。但「除」不一樣：選一個非零元，看它在這個世界內
          <strong>找不找得到乘起來等於 1 的夥伴</strong>。判準永遠是「乘積回到 1」，變的只有世界。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>在 ℤ 裡，2 找得到乘法夥伴（某整數乘 2 等於 1）嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'yes'" (click)="prediction.set('yes')">找得到</button>
          <button type="button" [class.active]="prediction() === 'no'" (click)="prediction.set('no')">找不到</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'yes'">
            {{ prediction() === 'no'
              ? '對。ℤ 裡只有 ±1 有夥伴；換個世界，同一個 2 的命運就變了。下面自己切切看。'
              : 'ℤ 裡 2 · b = 1 需要 b = 1/2，而 1/2 不是整數——所以 ℤ 裡 2 沒有夥伴。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="選擇世界">
        <span class="kicker">WORLD</span>
        @for (w of worlds; track w.id) {
          <button type="button" [class.active]="world().id === w.id" (click)="pickWorld(w)">{{ w.label }}</button>
        }
      </div>

      <div class="control-row" aria-label="選擇非零元素">
        <span class="kicker">非零元素 a</span>
        @for (e of world().elems; track e.label; let i = $index) {
          <button type="button" [class.active]="index() === i" (click)="index.set(i); revealed.set(false)">{{ e.label }}</button>
        }
        <button type="button" (click)="reveal()">找夥伴 →</button>
      </div>

      <section class="stage stage-grid">
        <div class="partner-board">
          <p class="board-scope">{{ world().label }} · {{ world().scope }}</p>
          <div class="dock-row" [class.solved]="revealed() && hasPartner()" [class.blocked]="revealed() && !hasPartner()">
            <div class="dock a-dock">
              <span class="dock-tag">a</span>
              <span class="dock-value">{{ elem().label }}</span>
            </div>
            <div class="dock-link">
              <span class="op">×</span>
              <span class="target">= 1 ?</span>
            </div>
            <div class="dock b-dock" [class.filled]="revealed() && hasPartner()" [class.empty]="revealed() && !hasPartner()">
              <span class="dock-tag">夥伴 b</span>
              @if (!revealed()) {
                <span class="dock-value muted">?</span>
              } @else if (hasPartner()) {
                <span class="dock-value">{{ elem().inverseLabel }}</span>
              } @else {
                <span class="dock-value blocked-mark">此世界內<br />無夥伴</span>
              }
            </div>
          </div>
          @if (revealed()) {
            <p class="equation" [class.blocked]="!hasPartner()">{{ elem().equation }}</p>
          } @else {
            <p class="equation muted">按「找夥伴」揭曉這個世界能不能把 a 除回 1。</p>
          }
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">此世界的除法覆蓋</p>
          <h3>{{ fieldVerdict() }}</h3>
          <p>{{ coverageLine() }}</p>
          @if (blocked().length) {
            <div class="readout warn-readout">沒有夥伴的非零元：{{ blocked().join('、') }}</div>
          } @else {
            <div class="readout">每個非零元都有夥伴 → 除法在此世界永遠安全</div>
          }
          <p class="evidence-tag">證據強度：{{ world().evidence }}</p>
        </aside>
      </section>

      <section class="transfer-strip" aria-label="同一個 2，換世界看命運">
        <p class="kicker">同一個 2，只換世界</p>
        <div class="strip-row">
          <span class="chip">ℤ：無夥伴</span>
          <span class="chip ok">ℚ：½</span>
          <span class="chip">ℤ/6：無夥伴</span>
          <span class="chip ok">ℤ/5：3</span>
        </div>
        <p class="strip-note">「可不可除」不是 2 自己的性質，是世界決定的。</p>
      </section>

      <section class="insight">
        <span class="insight-icon">÷</span>
        <div>
          <strong>Ring 保證加法能撤銷；field 只多要求一件事</strong>
          <span>——每個非零元的乘法也能撤銷（都有夥伴把它除回 1）。</span>
        </div>
      </section>

      <details>
        <summary>符號層：unit（可逆元）</summary>
        <p>
          在一個 commutative ring <code>R</code> 中，若存在 <code>b</code> 使 <code>a · b = 1</code>，就說 <code>a</code> 是一個
          <strong>unit（可逆元）</strong>。這一章要建立的 field，就是「每個非零元都是 unit」的 ring。完整 field
          公理與 <code>F&#215;</code> 是 group 的說明放在 1.2 與展開層。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh1DivideIsSpecialComponent {
  readonly worlds: FieldWorld[] = [WORLD_Z, WORLD_Q, WORLD_Z6, WORLD_Z5];
  readonly world = signal<FieldWorld>(WORLD_Z);
  readonly index = signal(4); // ℤ 的第 5 個 element 是 2
  readonly revealed = signal(false);
  readonly prediction = signal<'yes' | 'no' | null>(null);

  readonly elem = computed(() => {
    const list = this.world().elems;
    const i = Math.min(this.index(), list.length - 1);
    return list[i];
  });
  readonly hasPartner = computed(() => this.elem().inverseLabel !== null);
  readonly blocked = computed(() => blockedElems(this.world()));
  readonly fieldVerdict = computed(() =>
    isField(this.world())
      ? `${this.world().label} 是 field`
      : `${this.world().label} 只是 ring，不是 field`,
  );
  readonly coverageLine = computed(() => {
    const total = this.world().elems.length;
    const units = total - this.blocked().length;
    return `非零元共 ${total} 個，其中 ${units} 個有夥伴。`;
  });

  pickWorld(w: FieldWorld): void {
    this.world.set(w);
    this.index.set(Math.min(this.index(), w.elems.length - 1));
    this.revealed.set(false);
  }
  reveal(): void {
    this.revealed.set(true);
  }
}
