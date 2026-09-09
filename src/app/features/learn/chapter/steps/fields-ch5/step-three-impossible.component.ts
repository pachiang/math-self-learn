import { Component, signal } from '@angular/core';

interface ImpCard {
  task: string;
  target: string;
  reason: string;
  degree: string;
  transcendental: boolean;
  verdict: string;
}

const CARDS: ImpCard[] = [
  {
    task: '倍立方',
    target: '∛2',
    reason: 'minimal polynomial x³ − 2',
    degree: '次數 3',
    transcendental: false,
    verdict: '3 不是 2 的冪 → 不可作圖',
  },
  {
    task: '三等分 60°',
    target: 'cos 20°',
    reason: '滿足 8x³ − 6x − 1 = 0（irreducible）',
    degree: '次數 3',
    transcendental: false,
    verdict: '3 不是 2 的冪 → 不可作圖',
  },
  {
    task: '化圓為方',
    target: '√π',
    reason: 'π 是 transcendental（Lindemann）',
    degree: '非代數數',
    transcendental: true,
    verdict: '落不進任何有限塔 → 不可作圖',
  },
];

@Component({
  selector: 'app-fields-ch5-three-impossible',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 5.3</p>
        <h2>三大古典不可能</h2>
        <p class="lede">
          兩千年沒人做出來，不是不夠聰明——是<strong>次數對不上 2 的冪</strong>。同一條判準（Ch4.3：次數必整除 2ᵐ）套三次：
          倍立方、<strong>三等分 60°</strong>都卡在次數 3；化圓為方更狠，π 連代數數都不是。這裡的 60° 是推翻「任意角都有通用三等分法」的 decisive witness，並不是說每個角都不能三等分。
        </p>
      </header>

      <span class="map-convention">STRAIGHTEDGE + COMPASS ONLY · THREE FIXED TARGETS · NECESSARY TEST</span>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>倍立方、三等分 60°、化圓為方——哪些做得到？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'none'" (click)="reveal('none')">都做不到</button>
          <button type="button" [class.active]="prediction() === 'some'" (click)="reveal('some')">至少一個做得到</button>
          <button type="button" [class.active]="prediction() === 'hard'" (click)="reveal('hard')">只是還沒想到方法</button>
        </div>
        @if (prediction()) {
          <p class="feedback">
            三個都做不到——但原因分兩種：前兩個是「次數 3 ∤ 2ᵐ」，第三個是「π 根本非代數」。看下面三張卡。
          </p>
        }
      </section>

      @if (revealed()) {
        <section class="imp-grid">
          @for (c of cards; track c.task) {
            <div class="imp-card" [class.transc]="c.transcendental">
              <p class="imp-task">{{ c.task }}</p>
              <p class="imp-target">需要 {{ c.target }}</p>
              <div class="imp-chain">
                <span class="ic-step">{{ c.reason }}</span>
                <span class="ic-arrow">→</span>
                <span class="ic-step deg" [class.transc-deg]="c.transcendental">{{ c.degree }}</span>
              </div>
              <p class="imp-verdict">{{ c.verdict }}</p>
              <span class="imp-mode">{{ c.transcendental ? 'TRANSCENDENTAL（非代數）' : 'ALGEBRAIC · 次數 3' }}</span>
            </div>
          }
        </section>

        <section class="insight">
          <span class="insight-icon">≠2ᵏ</span>
          <div>
            <strong>固定目標一旦被 degree 擋下，再聰明的尺規步驟也救不回來</strong>
            <span>——倍立方與三等分 60° 卡在 degree 3；化圓為方則卡在 transcendence。</span>
          </div>
        </section>
      }

      <details>
        <summary>符號層：三個次數怎麼來的</summary>
        <p>
          倍立方要 <code>∛2</code>，minimal poly <code>x³−2</code>（次數 3）。三等分 60° 要 <code>cos20°</code>：由
          <code>cos3θ = 4cos³θ − 3cosθ</code> 與 <code>cos60° = ½</code> 得 <code>8x³ − 6x − 1 = 0</code>（無有理根、irreducible，次數 3）。
          化圓為方要 <code>√π</code>，而 <code>π</code> transcendental（Lindemann 1882），非任何多項式的根 → 不在任何有限擴張裡。每個都由「次數必整除 2ᵐ」擋下（第三個更是連塔都進不去）。
          三等分的結論是「不存在適用任意角的尺規 construction」；某些特定角當然仍可三等分，例如 90° 可作出 30°。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh5ThreeImpossibleComponent {
  readonly cards = CARDS;
  readonly prediction = signal<'none' | 'some' | 'hard' | null>(null);
  readonly revealed = signal(false);

  reveal(p: 'none' | 'some' | 'hard'): void {
    this.prediction.set(p);
    this.revealed.set(true);
  }
}
