import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch2-why-multi',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼要多變數？Simpson 在迴歸裡的化身" subtitle="§2.1">
      <p>
        簡單迴歸一次只能處理一個 x。但真實世界——藥效、房價、薪資——永遠由多個因素共同決定。
        <strong>忽略一個重要變數 → 斜率偏誤 → 結論完全翻轉</strong>。
      </p>

      <h4>經典例子：確認性別的薪資分析</h4>
      <p>
        把「薪資 vs 工作經驗」做單變數迴歸，得到正斜率。合理。<br>
        但加入「性別」後發現：<em>控制性別之後</em>，經驗的斜率變大 —— 或縮小、甚至反轉。
        這種現象出現的條件：混淆變數（confounder）同時影響 x 和 y。
      </p>

      <div class="key-idea">
        <strong>多元迴歸的核心直覺：</strong>
        β̂ⱼ 讀作「<em>在控制其他變數下</em>，xⱼ 每升 1 單位，y 的預期變化」。
        這個「控制其他變數」的能力就是多元迴歸的超能力——也是它被所有科學研究依賴的理由。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="切換：是否加入混淆變數。看斜率如何變">
      <div class="pat-tabs">
        <button class="pill" [class.active]="!control()" (click)="control.set(false)">不控制 z</button>
        <button class="pill" [class.active]="control()" (click)="control.set(true)">控制 z（分組）</button>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 280" class="p-svg">
          <!-- Axes -->
          <line x1="40" y1="240" x2="420" y2="240" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="240" stroke="var(--border-strong)" stroke-width="1" />
          <text x="230" y="260" class="tk" text-anchor="middle">x</text>
          <text x="28" y="130" class="tk">y</text>

          <!-- Points -->
          @for (p of pts; track $index) {
            <circle [attr.cx]="mapX(p.x)" [attr.cy]="mapY(p.y)" r="4"
                    [attr.fill]="control() ? (p.z === 0 ? '#5a8aa8' : '#b06c4a') : 'var(--text)'"
                    opacity="0.85" />
          }

          @if (!control()) {
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(naiveLine(0))"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(naiveLine(10))"
                  stroke="var(--accent)" stroke-width="2.4" />
          } @else {
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(groupLine(0, 0))"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(groupLine(10, 0))"
                  stroke="#5a8aa8" stroke-width="2.2" />
            <line [attr.x1]="mapX(0)" [attr.y1]="mapY(groupLine(0, 1))"
                  [attr.x2]="mapX(10)" [attr.y2]="mapY(groupLine(10, 1))"
                  stroke="#b06c4a" stroke-width="2.2" />
          }
        </svg>
      </div>

      <div class="legend">
        @if (control()) {
          <span class="leg"><span class="sw bl"></span>z = 0 組</span>
          <span class="leg"><span class="sw org"></span>z = 1 組</span>
        } @else {
          <span class="leg"><span class="sw acc"></span>整體斜率（Naïve）</span>
        }
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">Naïve 斜率</div><div class="st-v">{{ naiveSlope().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">控制 z 後</div><div class="st-v">{{ controlledSlope().toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">差異</div><div class="st-v">{{ (controlledSlope() - naiveSlope()).toFixed(3) }}</div></div>
      </div>

      <p class="note">
        Naïve 迴歸給正斜率，<em>看起來</em>x 越大 y 越大。<br>
        但真相是：<strong>每組內</strong>斜率其實是<em>負</em>的——z（藍/橘分組）才是真正驅動差異的變數。
        只看 x 忽略 z 完全誤判——這就是 <strong>Simpson 悖論在迴歸裡的化身</strong>。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        忽略關鍵變數 → 斜率偏誤。多元迴歸讓我們同時控制多個變數，讀出每個變數「單獨」的貢獻。
        下一節把這化成矩陣形式，一次解所有係數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .pat-tabs { display: flex; gap: 6px; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }

    .plot { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; justify-content: center; gap: 14px; font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .leg { display: inline-flex; align-items: center; gap: 4px; }
    .sw { display: inline-block; width: 14px; height: 3px; border-radius: 2px; }
    .sw.bl { background: #5a8aa8; }
    .sw.org { background: #b06c4a; }
    .sw.acc { background: var(--accent); }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .note em { color: var(--accent); font-style: normal; font-weight: 600; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh2WhyMultiComponent {
  readonly control = signal(false);

  // Simpson-like data: within each z-group slope is negative,
  // but z shifts the cluster so overall slope is positive
  readonly pts = [
    // z = 0 cluster: low x, high y, downward slope
    { x: 1.0, y: 7.5, z: 0 }, { x: 1.5, y: 7.2, z: 0 }, { x: 2.0, y: 7.0, z: 0 },
    { x: 2.5, y: 6.7, z: 0 }, { x: 3.0, y: 6.5, z: 0 }, { x: 3.5, y: 6.2, z: 0 },
    { x: 4.0, y: 6.0, z: 0 }, { x: 4.5, y: 5.8, z: 0 },
    // z = 1 cluster: high x, low y, downward slope
    { x: 5.5, y: 4.8, z: 1 }, { x: 6.0, y: 4.5, z: 1 }, { x: 6.5, y: 4.3, z: 1 },
    { x: 7.0, y: 4.0, z: 1 }, { x: 7.5, y: 3.8, z: 1 }, { x: 8.0, y: 3.5, z: 1 },
    { x: 8.5, y: 3.3, z: 1 }, { x: 9.0, y: 3.0, z: 1 },
  ];

  mapX(x: number): number { return 40 + (x / 10) * 380; }
  mapY(y: number): number { return 240 - (y / 10) * 220; }

  private fit(subset: Array<{ x: number; y: number }>) {
    const n = subset.length;
    const xb = subset.reduce((s, v) => s + v.x, 0) / n;
    const yb = subset.reduce((s, v) => s + v.y, 0) / n;
    const num = subset.reduce((s, v) => s + (v.x - xb) * (v.y - yb), 0);
    const den = subset.reduce((s, v) => s + (v.x - xb) ** 2, 0);
    const b1 = num / den;
    return { b0: yb - b1 * xb, b1 };
  }

  readonly naiveSlope = computed(() => this.fit(this.pts).b1);
  readonly controlledSlope = computed(() => {
    // Average within-group slope
    const z0 = this.pts.filter(p => p.z === 0);
    const z1 = this.pts.filter(p => p.z === 1);
    return (this.fit(z0).b1 + this.fit(z1).b1) / 2;
  });

  naiveLine(x: number): number {
    const f = this.fit(this.pts);
    return f.b0 + f.b1 * x;
  }

  groupLine(x: number, z: number): number {
    const subset = this.pts.filter(p => p.z === z);
    const f = this.fit(subset);
    return f.b0 + f.b1 * x;
  }
}
