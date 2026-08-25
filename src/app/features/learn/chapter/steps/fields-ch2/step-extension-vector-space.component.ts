import { Component, computed, signal } from '@angular/core';

interface Panel {
  id: string;
  world: string;
  b2: string; // 第二基底方向的標籤
  e2x: number;
  e2y: number; // 第二基底方向的螢幕單位向量（y 向下）
}

const S = 26; // 每一步基底的螢幕長度
const OX = 150;
const OY = 140;

@Component({
  selector: 'app-fields-ch2-extension-vector-space',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson fields-lesson">
      <header class="hero">
        <p class="eyebrow">Fields & Galois · 2.2</p>
        <h2>把擴張看成 base field 上的向量空間</h2>
        <p class="lede">
          <code>a + b√2</code> 其實就是座標 <strong>(a, b)</strong>，基底方向是 <code>{{ '{' }}1, √2{{ '}' }}</code>。擴張 <code>L</code> 是
          <code>K</code> 上的 <strong>vector space</strong>：可以相加、可以用 <code>K</code> 縮放。<strong>維度 [L:K]</strong> 就是需要幾個獨立方向。
        </p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先預測</p>
          <h3>要標定 ℚ(√2) 裡的任何一個數，最少需要幾個獨立方向？</h3>
        </div>
        <div class="choice-row">
          <button type="button" [class.active]="prediction() === 'one'" (click)="prediction.set('one')">1 個</button>
          <button type="button" [class.active]="prediction() === 'two'" (click)="prediction.set('two')">2 個</button>
          <button type="button" [class.active]="prediction() === 'inf'" (click)="prediction.set('inf')">無限多個</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'two'">
            {{ prediction() === 'two'
              ? '對。1 的方向與 √2 的方向，兩個座標就定位所有元素 → 維度 2。'
              : '兩個就夠：a 沿「1 方向」、b 沿「√2 方向」。調下面的 a、b 看點怎麼動。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="座標 a">
        <span class="kicker">座標 a（1 方向）</span>
        @for (v of values; track v) {
          <button type="button" [class.active]="a() === v" (click)="a.set(v)">{{ v }}</button>
        }
      </div>
      <div class="control-row" aria-label="座標 b">
        <span class="kicker">座標 b（第二方向）</span>
        @for (v of values; track v) {
          <button type="button" [class.active]="b() === v" (click)="b.set(v)">{{ v }}</button>
        }
      </div>

      <section class="stage vs-grid">
        @for (p of panels; track p.id) {
          <div class="vs-panel">
            <p class="board-scope">{{ p.world }} · 基底 {{ '{' }}1, {{ p.b2 }}{{ '}' }} · 維度 2</p>
            <svg class="vs-svg" viewBox="0 0 300 280" role="img" [attr.aria-label]="ariaFor(p)">
              <!-- 基底方向 ray（非 metric，只表示方向）-->
              <line class="axis" [attr.x1]="OX - 3 * S" y1="140" [attr.x2]="OX + 3 * S" y2="140" />
              <line class="axis" [attr.x1]="axis2(p).x1" [attr.y1]="axis2(p).y1" [attr.x2]="axis2(p).x2" [attr.y2]="axis2(p).y2" />
              <text class="axis-label" [attr.x]="OX + 3 * S + 4" y="144">1 方向</text>
              <text class="axis-label" [attr.x]="axis2(p).x2 + 4" [attr.y]="axis2(p).y2">{{ p.b2 }} 方向</text>
              <!-- 分量 guide -->
              <path class="guide" [attr.d]="guide(p)" />
              <!-- 向量 -->
              <line class="vec" [attr.x1]="OX" y1="140" [attr.x2]="pt(p).x" [attr.y2]="pt(p).y" />
              <circle class="origin-dot" [attr.cx]="OX" cy="140" r="3" />
              <g class="pt-node" [attr.transform]="'translate(' + pt(p).x + ' ' + pt(p).y + ')'">
                <circle r="6" />
              </g>
            </svg>
            <p class="vs-value">{{ p.id === 'q' ? valueQ() : valueC() }}</p>
          </div>
        }
      </section>

      <section class="insight">
        <span class="insight-icon">[L:K]</span>
        <div>
          <strong>擴張的「大小」是一個維度</strong>
          <span>——base 上需要幾個獨立方向。ℂ 對 ℝ、ℚ(√2) 對 ℚ 都是 2；同一個想法，不同外觀。</span>
        </div>
      </section>

      <details>
        <summary>符號層：[L:K] = dim_K L，以及「只用加法與縮放」</summary>
        <p>
          把 <code>L</code> 看成 <code>K</code>-vector space 時，只用到<strong>兩個</strong>運算：元素相加、以及用 <code>K</code> 的純量縮放。
          維度 <code>[L:K] = dim_K L</code> 與選哪組基底無關。注意 <code>√2 · √2 = 2</code> 這種<strong>內部乘法</strong>是額外結構（它讓 L 成為 field），
          不屬於 vector-space 這層——它的一般機制留到 Ch3。座標軸只代表基底方向，圖上的距離與夾角在這裡沒有 field 語意。
        </p>
      </details>
    </article>
  `,
})
export class FieldsCh2ExtensionVectorSpaceComponent {
  readonly OX = OX;
  readonly S = S;
  readonly values = [-3, -2, -1, 0, 1, 2, 3];
  readonly a = signal(3);
  readonly b = signal(2);
  readonly prediction = signal<'one' | 'two' | 'inf' | null>(null);

  readonly panels: Panel[] = [
    { id: 'q', world: 'ℚ(√2)', b2: '√2', e2x: Math.cos((58 * Math.PI) / 180), e2y: -Math.sin((58 * Math.PI) / 180) },
    { id: 'c', world: 'ℂ = ℝ(i)', b2: 'i', e2x: 0, e2y: -1 },
  ];

  readonly valueQ = computed(() => this.fmt('√2'));
  readonly valueC = computed(() => this.fmt('i'));

  private fmt(sym: string): string {
    const a = this.a();
    const b = this.b();
    const bt = b === 0 ? '' : b === 1 ? ` + ${sym}` : b === -1 ? ` − ${sym}` : b > 0 ? ` + ${b}${sym}` : ` − ${-b}${sym}`;
    if (a === 0 && b === 0) return '0';
    if (a === 0) return bt.replace(/^ \+ /, '').replace(/^ − /, '−');
    return `${a}${bt}`;
  }

  pt(p: Panel): { x: number; y: number } {
    return { x: OX + this.a() * S + this.b() * S * p.e2x, y: OY + this.b() * S * p.e2y };
  }
  axis2(p: Panel): { x1: number; y1: number; x2: number; y2: number } {
    return {
      x1: OX - 3 * S * p.e2x,
      y1: OY - 3 * S * p.e2y,
      x2: OX + 3 * S * p.e2x,
      y2: OY + 3 * S * p.e2y,
    };
  }
  guide(p: Panel): string {
    const ax = OX + this.a() * S;
    const pt = this.pt(p);
    return `M ${OX} ${OY} L ${ax} ${OY} L ${pt.x} ${pt.y}`;
  }
  ariaFor(p: Panel): string {
    return `${p.world} 的座標圖，目前元素座標 a=${this.a()}、b=${this.b()}，兩個基底方向 1 與 ${p.b2}`;
  }
}
