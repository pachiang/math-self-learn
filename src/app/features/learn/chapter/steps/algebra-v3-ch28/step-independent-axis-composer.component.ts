import { Component, computed, signal } from '@angular/core';
import { mod, productGrid } from './product-model';

@Component({
  selector: 'app-algebra-v3-independent-axis-composer',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch28-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 28.2</p>
        <h2>兩個 axis moves 會 commute，因為它們寫入不同的 coordinate slots</h2>
        <p class="lede">
          橫向 move 只改第一格，縱向 move 只改第二格。交換順序會改變中途路線，卻不會改變最後的
          pair。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>就算 G、H 各自不 commutative，(g,e) 和 (e,h) 仍一定 commute 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(true)">一定，兩者改不同 slots</button
          ><button type="button" (click)="prediction.set(false)">不一定，要 G、H 都 abelian</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="!prediction()">
            {{
              prediction()
                ? '對。兩種順序都得到 (g,h)；這不要求各軸內部 commutative。'
                : '每一步只在自己的 coordinate 內運算；跨軸沒有搶同一個 slot。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Independent-axis composer</p>
            <h3>調整 horizontal a 與 vertical b，比較兩條 execution paths</h3>
          </div>
          <p>實線 path A、虛線 path B 與每一步的 H／V label 同時說明順序，不只靠顏色。</p>
        </div>
        <div class="axis-controls">
          <fieldset>
            <legend>HORIZONTAL MOVE a</legend>
            @for (value of horizontalMoves; track value) {
              <button type="button" [attr.aria-pressed]="a() === value" (click)="a.set(value)">
                +{{ value }}
              </button>
            }
          </fieldset>
          <fieldset>
            <legend>VERTICAL MOVE b</legend>
            @for (value of verticalMoves; track value) {
              <button type="button" [attr.aria-pressed]="b() === value" (click)="b.set(value)">
                +{{ value }}
              </button>
            }
          </fieldset>
        </div>
        <div class="stage axis-composer-stage">
          <section class="route-panel">
            <header><span>PATH A · SOLID</span><b>H then V</b></header>
            <div class="route-grid">
              @for (cell of cells; track cell.key) {
                <i
                  [class.start]="cell.key === '0,0'"
                  [class.mid]="cell.key === horizontalMid()"
                  [class.end]="cell.key === endpoint()"
                  ><small>({{ cell.x }},{{ cell.y }})</small></i
                >
              }
              <svg viewBox="0 0 400 300" aria-hidden="true">
                <polyline class="path-a" [attr.points]="horizontalFirstPoints()" />
              </svg>
            </div>
            <ol>
              <li>START (0,0)</li>
              <li>H writes first slot → ({{ endX() }},0)</li>
              <li>V writes second slot → {{ endpointLabel() }}</li>
            </ol>
          </section>
          <section class="route-panel">
            <header><span>PATH B · DASHED</span><b>V then H</b></header>
            <div class="route-grid">
              @for (cell of cells; track cell.key) {
                <i
                  [class.start]="cell.key === '0,0'"
                  [class.mid]="cell.key === verticalMid()"
                  [class.end]="cell.key === endpoint()"
                  ><small>({{ cell.x }},{{ cell.y }})</small></i
                >
              }
              <svg viewBox="0 0 400 300" aria-hidden="true">
                <polyline class="path-b" [attr.points]="verticalFirstPoints()" />
              </svg>
            </div>
            <ol>
              <li>START (0,0)</li>
              <li>V writes second slot → (0,{{ endY() }})</li>
              <li>H writes first slot → {{ endpointLabel() }}</li>
            </ol>
          </section>
          <section class="axis-console" aria-live="polite">
            <p class="kicker">COMPOSITION CHECK</p>
            <div>
              <span>H THEN V</span><b>({{ a() }},0)+(0,{{ b() }})</b>
            </div>
            <div>
              <span>V THEN H</span><b>(0,{{ b() }})+({{ a() }},0)</b>
            </div>
            <div class="same-endpoint">SAME ENDPOINT {{ endpointLabel() }}</div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>(a,0)</span><i>different slots</i><span>(0,b)</span><i>→</i><span>(a,b)</span>
        </div>
        <p>
          <strong>Direct-product independence 是「不 cross-write」。</strong>任意 pair move (a,b)
          都能拆成純水平與純垂直 moves；兩軸互不干擾，所以順序可以交換。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>(g,h) 能否只靠兩個 embedded axis moves 完整重建？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">能：(g,e)(e,h)</button
          ><button type="button" (click)="transfer.set(false)">不能，pair 還有額外資訊</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{
              transfer()
                ? '對。兩個 embeddings 放回的 coordinates 正好重建原 pair。'
                : 'Pair 的全部資訊就是兩個 slots；axis embeddings 已分別保存它們。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Embeddings、projections 與 commute 的正式說法</summary>
          <div>
            Maps i_G(g)=(g,e_H)、i_H(h)=(e_G,h) 把兩群嵌入 product；projections
            π_G(g,h)=g、π_H(g,h)=h 再讀回 coordinates。計算 i_G(g)i_H(h) 與 i_H(h)i_G(g) 都得到
            (g,h)。這只保證兩個 embedded copies 彼此 commute，不代表 G 或 H 自己必須 abelian。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3IndependentAxisComposerComponent {
  readonly horizontalMoves = [0, 1, 2, 3];
  readonly verticalMoves = [0, 1, 2];
  readonly cells = productGrid(4, 3);
  readonly a = signal(2);
  readonly b = signal(1);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly endX = computed(() => mod(this.a(), 4));
  readonly endY = computed(() => mod(this.b(), 3));
  endpoint() {
    return `${this.endX()},${this.endY()}`;
  }
  endpointLabel() {
    return `(${this.endX()},${this.endY()})`;
  }
  horizontalMid() {
    return `${this.endX()},0`;
  }
  verticalMid() {
    return `0,${this.endY()}`;
  }
  point(x: number, y: number) {
    return `${50 + x * 100},${50 + y * 100}`;
  }
  horizontalFirstPoints() {
    return `${this.point(0, 0)} ${this.point(this.endX(), 0)} ${this.point(this.endX(), this.endY())}`;
  }
  verticalFirstPoints() {
    return `${this.point(0, 0)} ${this.point(0, this.endY())} ${this.point(this.endX(), this.endY())}`;
  }
}
