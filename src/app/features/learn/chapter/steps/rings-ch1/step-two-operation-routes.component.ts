import { Component, computed, signal } from '@angular/core';
import { MODULUS, RESIDUES, RingOperation, clockPoint, combineResidues } from './rings-ch1-model';

@Component({
  selector: 'app-rings-ch1-two-operation-routes',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 1.1</p>
        <h2>Objects 沒有換；換一條 operation rule，終點就可能改變</h2>
        <p class="lede">把 0–5 放在同一個 clock world。固定兩個 inputs，只切換 ADD 與 MULTIPLY：不是換題目，而是在同一批 objects 上選擇另一層 wiring。</p>
      </header>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>固定 4、4：ADD 與 MULTIPLY 會抵達同一格嗎？</h3></div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('same')">會，同一格</button>
          <button type="button" (click)="prediction.set('different')">不會，不同格</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'same'">{{ prediction() === 'different' ? '對。先保留你的兩個終點，再到 clock 上逐一揭曉。' : '同一對 inputs 不會固定 output；output 也取決於目前選用哪一條 rule。' }}</p>
        }
      </section>

      <div class="control-row" aria-label="Clock inputs 與 operation">
        <span class="kicker">INPUT A</span>
        @for (value of residues; track value) { <button type="button" [class.active]="a() === value" (click)="a.set(value)">{{ value }}</button> }
        <span class="kicker">INPUT B</span>
        @for (value of residues; track value) { <button type="button" [class.active]="b() === value" (click)="b.set(value)">{{ value }}</button> }
        <button type="button" [class.active]="operation() === 'add'" (click)="operation.set('add')">＋ ADD</button>
        <button type="button" class="multiply" [class.active]="operation() === 'multiply'" (click)="operation.set('multiply')">× MULTIPLY</button>
        <button type="button" (click)="reset()">重設 4、4</button>
      </div>

      <section class="stage stage-grid">
        <div class="clock-board">
          <svg class="clock-svg" viewBox="0 0 300 300" role="img" [attr.aria-label]="ariaLabel()">
            <circle class="clock-ring" cx="150" cy="150" r="112" />
            <path [attr.class]="'route ' + operation()" [attr.d]="routePath()" />
            <text class="route-label" x="150" y="153">{{ operation() === 'add' ? 'ADD · solid route' : 'MULTIPLY · dashed route' }}</text>
            @for (value of residues; track value) {
              <g class="node" [class.input]="value === a() || value === b()" [class.output]="value === output()" [class.multiply]="operation() === 'multiply'" [attr.transform]="nodeTransform(value)">
                <circle r="22" /><text y="1">{{ value }}</text>
              </g>
            }
          </svg>
        </div>
        <aside class="console" aria-live="polite">
          <p class="kicker">SAME WORLD · ℤ/{{ modulus }}ℤ</p>
          <h3>{{ a() }} {{ operation() === 'add' ? '+' : '×' }} {{ b() }} 抵達 {{ output() }}</h3>
          <p>Inputs 沒離開 clock；active wiring 決定它們如何合成。</p>
          <div class="readout">同一對 ({{ a() }}, {{ b() }})：ADD → {{ addOutput() }} · MULTIPLY → {{ multiplyOutput() }}</div>
        </aside>
      </section>

      <section class="insight"><span class="insight-icon">↦</span><div><strong>Operation 不是符號外觀</strong><span>它是這個 world 指定的 pair → output rule。</span></div></section>
      <details><summary>符號層：二元運算（binary operation）</summary><p>一條 binary operation 是 map <code>R × R → R</code>。這裡兩條 maps 都把 residue pair 送回同一個 residue world；完整 ring contract 到 Ch3 才整理。</p></details>
    </article>
  `,
})
export class RingsCh1TwoOperationRoutesComponent {
  readonly residues = RESIDUES;
  readonly modulus = MODULUS;
  readonly a = signal(4);
  readonly b = signal(4);
  readonly operation = signal<RingOperation>('add');
  readonly prediction = signal<'same' | 'different' | null>(null);
  readonly addOutput = computed(() => combineResidues(this.a(), this.b(), 'add'));
  readonly multiplyOutput = computed(() => combineResidues(this.a(), this.b(), 'multiply'));
  readonly output = computed(() => combineResidues(this.a(), this.b(), this.operation()));
  readonly routePath = computed(() => {
    const start = clockPoint(this.a());
    const end = clockPoint(this.output());
    return `M ${start.x} ${start.y} Q 150 150 ${end.x} ${end.y}`;
  });
  readonly ariaLabel = computed(() => `模六 clock，同一對 inputs ${this.a()}、${this.b()}，目前使用 ${this.operation() === 'add' ? '加法' : '乘法'}，output 是 ${this.output()}`);

  nodeTransform(value: number): string { const point = clockPoint(value); return `translate(${point.x} ${point.y})`; }
  reset(): void { this.a.set(4); this.b.set(4); this.operation.set('add'); this.prediction.set(null); }
}
