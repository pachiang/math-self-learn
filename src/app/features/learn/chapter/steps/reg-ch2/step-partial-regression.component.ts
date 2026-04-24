import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch2-partial-regression',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="係數的意義：偏迴歸與控制變數" subtitle="§2.4">
      <p>
        多元迴歸的 β̂ⱼ 意義是：<strong>其他變數固定的前提下，xⱼ 升 1 單位，ŷ 升 β̂ⱼ 單位</strong>。
        「固定」兩字是關鍵——但真實資料中 x₁, x₂ 通常彼此相關，怎麼「固定」？
      </p>

      <h4>Frisch–Waugh–Lovell 定理（FWL）</h4>
      <p>
        要算「控制 x₂ 後 x₁ 對 y 的效應」，可以分三步：
      </p>
      <ol class="fwl">
        <li>把 y 對 x₂ 迴歸，取殘差 e_y（「y 中不能由 x₂ 解釋的部分」）</li>
        <li>把 x₁ 對 x₂ 迴歸，取殘差 e₁（「x₁ 中不能由 x₂ 解釋的部分」）</li>
        <li>把 e_y 對 e₁ 做簡單迴歸——得到的斜率<strong>正好等於</strong>多元迴歸的 β̂₁</li>
      </ol>

      <div class="key-idea">
        <strong>這正是「控制」的操作定義：</strong>
        「從 x₁ 和 y 中<em>都</em>扣除 x₂ 能解釋的部分，再看剩下的關係」。
        β̂₁ 讀作：<strong>剔除 x₂ 影響後</strong>，x₁ 對 y 的獨立貢獻。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整 x₁ 與 x₂ 的相關程度。看 β̂₁（偏迴歸）與 β₁（單變數）的差距">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">x₁ ⟷ x₂ 相關</span>
          <input type="range" min="-0.95" max="0.95" step="0.05" [value]="corr()"
            (input)="corr.set(+$any($event).target.value)" />
          <span class="sl-val">{{ corr().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">真 β₁（x₁ 效應）</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="trueB1()"
            (input)="trueB1.set(+$any($event).target.value)" />
          <span class="sl-val">{{ trueB1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">真 β₂（x₂ 效應）</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="trueB2()"
            (input)="trueB2.set(+$any($event).target.value)" />
          <span class="sl-val">{{ trueB2().toFixed(1) }}</span>
        </div>
      </div>

      <div class="plots">
        <div class="p">
          <div class="p-title">單變數：y ~ x₁（忽略 x₂）</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="160" x2="210" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="24" y1="10" x2="24" y2="160" stroke="var(--border-strong)" stroke-width="1" />
            @for (p of data(); track $index) {
              <circle [attr.cx]="mapX(p.x1)" [attr.cy]="mapY(p.y)" r="2.5" fill="var(--text)" opacity="0.7" />
            }
            <line [attr.x1]="mapX(-3)" [attr.y1]="mapY(naiveB0() + naiveB1() * -3)"
                  [attr.x2]="mapX(3)" [attr.y2]="mapY(naiveB0() + naiveB1() * 3)"
                  stroke="#b06c4a" stroke-width="2" />
          </svg>
          <div class="tag">斜率 {{ naiveB1().toFixed(3) }}</div>
        </div>
        <div class="p">
          <div class="p-title">偏迴歸：e_y ~ e₁（FWL）</div>
          <svg viewBox="0 0 220 180" class="p-svg">
            <line x1="24" y1="90" x2="210" y2="90" stroke="var(--border-strong)" stroke-width="0.6" stroke-dasharray="2 2" />
            <line x1="117" y1="10" x2="117" y2="160" stroke="var(--border-strong)" stroke-width="0.6" stroke-dasharray="2 2" />
            @for (p of residualsXY(); track $index) {
              <circle [attr.cx]="mapResX(p.e1)" [attr.cy]="mapResY(p.ey)" r="2.5" fill="var(--accent)" opacity="0.7" />
            }
            <line [attr.x1]="mapResX(-3)" [attr.y1]="mapResY(partialSlope() * -3)"
                  [attr.x2]="mapResX(3)" [attr.y2]="mapResY(partialSlope() * 3)"
                  stroke="var(--accent)" stroke-width="2" />
          </svg>
          <div class="tag">斜率 {{ partialSlope().toFixed(3) }}（= β̂₁）</div>
        </div>
      </div>

      <div class="stats">
        <div class="st">
          <div class="st-l">naïve 斜率</div>
          <div class="st-v">{{ naiveB1().toFixed(3) }}</div>
          <div class="st-d">忽略 x₂ 的</div>
        </div>
        <div class="st hi">
          <div class="st-l">β̂₁（多元）</div>
          <div class="st-v">{{ partialSlope().toFixed(3) }}</div>
          <div class="st-d">控制 x₂ 後</div>
        </div>
        <div class="st">
          <div class="st-l">真 β₁</div>
          <div class="st-v">{{ trueB1().toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">偏誤</div>
          <div class="st-v">{{ (naiveB1() - trueB1()).toFixed(3) }}</div>
          <div class="st-d">naïve − 真</div>
        </div>
      </div>

      <p class="note">
        把 x₁⟷x₂ 相關調到 0：naïve 與偏迴歸斜率相等——不相關時「控不控制」一樣。<br>
        調到 0.9 且 β₂ 設大：naïve 斜率嚴重偏離真 β₁——<em>忽略共變數 = 偏誤</em>。<br>
        FWL 告訴我們：多元迴歸就是在消除這種偏誤。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        多元迴歸的 β̂ⱼ = 「剔除其他變數影響後 xⱼ 的獨立貢獻」。
        FWL 定理給出具體算法。若忽略相關的變數，單變數斜率會被<strong>遺漏變數偏誤</strong>污染——
        這是觀察性研究最常見的陷阱。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .fwl { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .fwl strong { color: var(--accent); }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 100px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right; }

    .plots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tag { font-size: 11px; color: var(--accent); text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: 700; margin-top: 4px; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: var(--accent-30); background: var(--accent-10); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st-d { font-size: 9px; color: var(--text-muted); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note em { color: var(--accent); font-style: normal; font-weight: 600; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh2PartialRegressionComponent {
  readonly corr = signal(0.6);
  readonly trueB1 = signal(0.8);
  readonly trueB2 = signal(1.0);

  mapX(x: number): number { return 24 + ((x + 3) / 6) * 186; }
  mapY(y: number): number { return 160 - ((y + 5) / 10) * 150; }
  mapResX(x: number): number { return 24 + ((x + 3) / 6) * 186; }
  mapResY(y: number): number { return 90 - (y / 4) * 70; }

  readonly data = computed(() => {
    const rng = this.mulberry(123);
    const n = 40;
    const r = this.corr();
    const b1 = this.trueB1(), b2 = this.trueB2();
    const out: Array<{ x1: number; x2: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const z1 = (rng() - 0.5) * 4;
      const z2 = (rng() - 0.5) * 4;
      const x1 = z1;
      const x2 = r * z1 + Math.sqrt(Math.max(0, 1 - r * r)) * z2;
      const y = b1 * x1 + b2 * x2 + (rng() - 0.5) * 1.0;
      out.push({ x1, x2, y });
    }
    return out;
  });

  private simpleFit(xs: number[], ys: number[]) {
    const n = xs.length;
    const xb = xs.reduce((s, v) => s + v, 0) / n;
    const yb = ys.reduce((s, v) => s + v, 0) / n;
    const num = xs.reduce((s, x, i) => s + (x - xb) * (ys[i] - yb), 0);
    const den = xs.reduce((s, x) => s + (x - xb) ** 2, 0);
    const b1 = den > 1e-9 ? num / den : 0;
    return { b0: yb - b1 * xb, b1 };
  }

  readonly naiveFit = computed(() => {
    const d = this.data();
    return this.simpleFit(d.map(p => p.x1), d.map(p => p.y));
  });
  readonly naiveB1 = computed(() => this.naiveFit().b1);
  readonly naiveB0 = computed(() => this.naiveFit().b0);

  readonly residualsXY = computed(() => {
    const d = this.data();
    const x1s = d.map(p => p.x1);
    const x2s = d.map(p => p.x2);
    const ys = d.map(p => p.y);
    const f_x = this.simpleFit(x2s, x1s);  // x1 ~ x2
    const f_y = this.simpleFit(x2s, ys);   // y  ~ x2
    return d.map(p => ({
      e1: p.x1 - (f_x.b0 + f_x.b1 * p.x2),
      ey: p.y - (f_y.b0 + f_y.b1 * p.x2),
    }));
  });

  readonly partialSlope = computed(() => {
    const r = this.residualsXY();
    const fit = this.simpleFit(r.map(v => v.e1), r.map(v => v.ey));
    return fit.b1;
  });

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
