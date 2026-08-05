import { Component, computed, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

@Component({
  selector: 'app-prob-v2-event-stream-lenses',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch15">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 15.1</p>
        <h2>把 trial 格線縮到看不見，留下真正發生的 event timeline</h2>
        <p class="lede">
          連續事件流（<strong>event stream</strong>）不預先提供第 1、2、3 格。來電可以落在任意時刻；
          minute boxes 是我們畫上的 measuring grid，不是世界本身。
        </p>
      </header>

      <section class="scene stream-prediction">
        <div>
          <p class="eyebrow">先判斷 · two calls in one minute</p>
          <h3>10:03:12 與 10:03:48 各來一通電話，這會違反「每分鐘一次 trial」嗎？</h3>
        </div>
        <div class="choice-row" role="group" aria-label="判斷分鐘格是否為真實試驗">
          <button
            type="button"
            [class.selected]="prediction() === 'violate'"
            (click)="prediction.set('violate')"
          >
            會違反
          </button>
          <button
            type="button"
            [class.selected]="prediction() === 'grid'"
            (click)="prediction.set('grid')"
          >
            格線只是工具
          </button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            @if (prediction() === 'grid') {
              <strong>對。兩個 events 可以落在同一個人造 box。</strong>
            } @else {
              minute 不是 Bernoulli trial；把時間切成盒子只是方便測量，並沒有禁止盒內出現兩個
              marks。
            }
          </p>
        }
      </section>

      <section class="stream-controls">
        <label
          >Measuring grid
          <input
            type="range"
            min="8"
            max="40"
            step="8"
            [value]="slots()"
            (input)="slots.set(+$any($event).target.value)"
          />
          <strong>{{ slots() }} slots</strong>
        </label>
        <div class="stream-segmented" role="group" aria-label="切換計數或等待視角">
          <button type="button" [class.active]="lens() === 'count'" (click)="lens.set('count')">
            COUNT WINDOW
          </button>
          <button type="button" [class.active]="lens() === 'wait'" (click)="lens.set('wait')">
            WAIT ARROW
          </button>
        </div>
      </section>

      <section class="stream-lab">
        <div class="stream-timeline" [class.wait-lens]="lens() === 'wait'">
          <div class="slot-grid" aria-hidden="true">
            @for (slot of slotArray(); track slot) {
              <i></i>
            }
          </div>
          @for (event of events; track event) {
            <button
              type="button"
              class="event-mark"
              [style.left.%]="event"
              [attr.aria-label]="'事件發生在時間 ' + event"
            >
              <span></span><small>{{ event }}</small>
            </button>
          }
          @if (lens() === 'count') {
            <div class="count-window"><span>fixed window</span><strong>4 events</strong></div>
          } @else {
            <div class="wait-arrow"><span>NOW</span><i></i><strong>wait to next event</strong></div>
          }
        </div>
        <div class="lens-readout">
          <span class="card-label">SAME EVENTS · DIFFERENT QUESTION</span>
          @if (lens() === 'count') {
            <h3>框住一段時間，問裡面有幾個 marks</h3>
            <p>輸出是 discrete count：0、1、2、…</p>
          } @else {
            <h3>從 NOW 出發，量到下一個 mark 的距離</h3>
            <p>輸出是 continuous waiting time。</p>
          }
        </div>
      </section>

      <aside class="insight-card">
        <div class="lens-core" aria-hidden="true">
          <span>events</span><i>+</i><strong>window</strong><b>or</b><strong>arrow</strong>
        </div>
        <div>
          <span class="card-label">Events 是世界；window 與 arrow 是問題</span>
          <p><strong>同一組 event times，可以生成 count，也可以生成 wait。</strong></p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>符號層：counting process 如何記錄 timeline？</summary>
        <div class="stream-formulas">
          <app-math e="N(t)=\\text{number of events in }[0,t]" />
          <p>N(t) 隨時間只會向上跳；每個 jump 對應一個 event mark。</p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2EventStreamLensesComponent {
  readonly prediction = signal<'violate' | 'grid' | null>(null);
  readonly slots = signal(16);
  readonly lens = signal<'count' | 'wait'>('count');
  readonly events = [12, 29, 34, 57, 76, 91];
  readonly slotArray = computed(() => Array.from({ length: this.slots() }, (_, index) => index));
}
