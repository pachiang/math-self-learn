import { Component, computed, signal } from '@angular/core';
import { pPart } from './sylow-model';

interface TargetPreset {
  label: string;
  order: number;
  prime: number;
}

@Component({
  selector: 'app-algebra-v3-p-part-target-gauge',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch30-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 30.1</p>
        <h2>Sylow target 不是整個群；它只把 group order 裡所有 p-factors 吃乾淨</h2>
        <p class="lede">
          Cauchy 給一顆 order-p seed。要知道它還得長多大，先把 |G| 拆成 p-power budget 與不含 p 的
          remainder。
        </p>
      </header>
      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>|G|=24=2³·3；一個 Sylow 2-subgroup 應有多少 elements？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(8)">8，吃滿 2³</button
          ><button type="button" (click)="prediction.set(24)">24，必須等於整個群</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 8">
            {{
              prediction() === 8
                ? '對。剩下的 factor 3 不屬於 2-subgroup 的 budget。'
                : '2-subgroup 的大小只能是 2-power；24 還含 factor 3。'
            }}
          </p>
        }
      </section>
      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">p-part target gauge</p>
            <h3>切換 group order 與 prime，讀出唯一的 full p-budget</h3>
          </div>
          <p>p-factors 用連續實線 slots，remainder 用虛線框與 NOT-p 標籤；辨識不只靠顏色。</p>
        </div>
        <div class="target-presets">
          @for (item of presets; track item.label; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="presetIndex() === i"
              (click)="selectPreset(i)"
            >
              {{ item.label }}
            </button>
          }
        </div>
        <div class="stage target-stage">
          <section class="factor-rack" [attr.aria-label]="factorLabel()">
            <header>
              <span>GROUP ORDER</span><b>{{ active().order }}</b>
            </header>
            <div>
              @for (_ of pSlots(); track $index) {
                <article>
                  <small>p-FACTOR {{ $index + 1 }}</small
                  ><b>{{ active().prime }}</b
                  ><span>CLAIMED</span>
                </article>
              }
              <i>×</i>
              <article class="remainder">
                <small>REMAINDER</small><b>{{ part().rest }}</b
                ><span>NOT DIVISIBLE BY {{ active().prime }}</span>
              </article>
            </div>
          </section>
          <section class="target-console">
            <p class="kicker">SYLOW GAUGE</p>
            <div>
              <span>FACTORIZATION</span
              ><b
                >{{ active().order }} = {{ active().prime }}^{{ part().exponent }} ×
                {{ part().rest }}</b
              >
            </div>
            <div>
              <span>FULL p-PART</span><b>{{ part().power }}</b>
            </div>
            <div>
              <span>CURRENT CANDIDATE</span><b>{{ candidate() }}</b
              ><small>{{ candidateStatus() }}</small>
            </div>
          </section>
        </div>
        <div class="rung-picker">
          <span>SELECT CURRENT p-SUBGROUP SIZE</span>
          @for (size of rungSizes(); track size) {
            <button
              type="button"
              [attr.aria-pressed]="candidate() === size"
              (click)="candidate.set(size)"
            >
              {{ size }}
            </button>
          }
        </div>
      </section>
      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>|G| = pⁿ·m</span><i>strip m</i><span>target = pⁿ</span>
        </div>
        <p>
          <strong>Sylow p-subgroup 是把 p-adic capacity 吃滿的 subgroup。</strong
          >「最大」在這裡有可量化的 target；不是靠肉眼判斷還能不能塞 element。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>|K|=360=2³·3²·5；Sylow 3-subgroup 的 target 是？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(9)">9</button
          ><button type="button" (click)="transfer.set(27)">27</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 9">
            {{
              transfer() === 9
                ? '對。360 中只有兩個 factors 3。'
                : '27 需要三個 factors 3，但 27 不整除 360。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Definition：Sylow p-subgroup</summary>
          <div>
            若 |G|=pⁿm 且 p 不整除 m，任何 order 為 pⁿ 的 subgroup P 稱為 Sylow p-subgroup。Lagrange
            已保證 p-subgroup order 不可能超過 pⁿ；本章剩下的任務是證明 pⁿ 真的能達到。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3PPartTargetGaugeComponent {
  readonly presets: TargetPreset[] = [
    { label: '|G|=12 · p=2', order: 12, prime: 2 },
    { label: '|G|=18 · p=3', order: 18, prime: 3 },
    { label: '|G|=24 · p=2', order: 24, prime: 2 },
    { label: '|G|=60 · p=5', order: 60, prime: 5 },
  ];
  readonly presetIndex = signal(2);
  readonly candidate = signal(2);
  readonly prediction = signal<number | null>(null);
  readonly transfer = signal<number | null>(null);
  readonly active = computed(() => this.presets[this.presetIndex()]);
  readonly part = computed(() => pPart(this.active().order, this.active().prime));
  readonly pSlots = computed(() => Array.from({ length: this.part().exponent }));
  readonly rungSizes = computed(() =>
    Array.from(
      { length: this.part().exponent + 1 },
      (_, exponent) => this.active().prime ** exponent,
    ),
  );
  readonly factorLabel = computed(
    () =>
      `${this.active().order} 分成 ${this.active().prime} 的 ${this.part().exponent} 個 factors 與 remainder ${this.part().rest}`,
  );
  readonly candidateStatus = computed(() =>
    this.candidate() === this.part().power
      ? '✓ BUDGET FULL'
      : this.candidate() < this.part().power
        ? '↗ CAN STILL GROW'
        : '× NOT A p-POWER SLOT',
  );
  selectPreset(index: number): void {
    this.presetIndex.set(index);
    this.candidate.set(this.active().prime);
  }
}
