import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch6-one-way',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="單因子 ANOVA = 虛擬變數迴歸" subtitle="§6.1">
      <p>
        回顧數理統計 Ch5：ANOVA 用 F 檢定比較 k 群的均值。
        其實——<strong>ANOVA 和迴歸是同一件事</strong>，差別只在 X 的形式。
      </p>

      <h4>範例：三種施肥方式（A, B, C）對產量的影響</h4>
      <p>
        類別變數 group ∈ &#123;A, B, C&#125;（3 個水準）。編碼成 2 個虛擬變數（k − 1 個）：
      </p>
      <table class="dummy">
        <thead><tr><th>group</th><th>d_B</th><th>d_C</th></tr></thead>
        <tbody>
          <tr><td>A</td><td>0</td><td>0</td></tr>
          <tr><td>B</td><td>1</td><td>0</td></tr>
          <tr><td>C</td><td>0</td><td>1</td></tr>
        </tbody>
      </table>
      <p>
        A 是「參考組」（reference level）——所有 0。B 和 C 各用一個指示變數。
      </p>

      <h4>線性模型</h4>
      <div class="centered-eq big">
        Y = β₀ + β_B · d_B + β_C · d_C + ε
      </div>
      <ul class="interp">
        <li><strong>β̂₀</strong> = A 組的平均（參考組）</li>
        <li><strong>β̂_B</strong> = B 組 − A 組平均</li>
        <li><strong>β̂_C</strong> = C 組 − A 組平均</li>
      </ul>

      <div class="key-idea">
        <strong>所以 ANOVA 做的事：</strong>
        <br>「H₀: β_B = β_C = 0」←→ 「所有組平均相等」——<strong>用迴歸的 F 檢定！</strong>
        ANOVA 的整體 F 檢定、迴歸的整體 F 檢定，答案數值完全一樣。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="拖動每組的均值：看 β̂ 反映「與 A 組的差距」">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">μ_A</span>
          <input type="range" min="2" max="9" step="0.05" [value]="muA()"
            (input)="muA.set(+$any($event).target.value)" />
          <span class="sl-val">{{ muA().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">μ_B</span>
          <input type="range" min="2" max="9" step="0.05" [value]="muB()"
            (input)="muB.set(+$any($event).target.value)" />
          <span class="sl-val">{{ muB().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">μ_C</span>
          <input type="range" min="2" max="9" step="0.05" [value]="muC()"
            (input)="muC.set(+$any($event).target.value)" />
          <span class="sl-val">{{ muC().toFixed(2) }}</span>
        </div>
      </div>

      <div class="plot">
        <svg viewBox="0 0 440 260" class="p-svg">
          <line x1="40" y1="220" x2="420" y2="220" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Grand mean -->
          <line x1="40" [attr.y1]="mapY(grandMean())" x2="420" [attr.y2]="mapY(grandMean())"
                stroke="#5ca878" stroke-width="1.2" stroke-dasharray="3 2" />
          <text x="45" [attr.y]="mapY(grandMean()) - 4" class="tk grn">總均值</text>

          @for (grp of groups(); track grp.name) {
            <!-- Points -->
            @for (y of grp.data; track $index) {
              <circle [attr.cx]="grp.x + (($index % 6) - 2.5) * 8" [attr.cy]="mapY(y)"
                      r="3" [attr.fill]="grp.color" opacity="0.6" />
            }
            <!-- Group mean marker -->
            <line [attr.x1]="grp.x - 30" [attr.y1]="mapY(grp.mean)"
                  [attr.x2]="grp.x + 30" [attr.y2]="mapY(grp.mean)"
                  [attr.stroke]="grp.color" stroke-width="2.5" />
            <text [attr.x]="grp.x" y="242" class="tk g-lab" text-anchor="middle">{{ grp.name }}</text>
            <text [attr.x]="grp.x" [attr.y]="mapY(grp.mean) - 8" class="tk g-val" text-anchor="middle">{{ grp.mean.toFixed(2) }}</text>
          }
        </svg>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">β̂₀ = μ̂_A</div><div class="st-v">{{ muA().toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">β̂_B = μ̂_B − μ̂_A</div><div class="st-v">{{ (muB() - muA()).toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">β̂_C = μ̂_C − μ̂_A</div><div class="st-v">{{ (muC() - muA()).toFixed(2) }}</div></div>
        <div class="st" [class.sig]="fStatValue() > 3">
          <div class="st-l">F 統計量</div>
          <div class="st-v">{{ fStatValue().toFixed(2) }}</div>
        </div>
      </div>

      <p class="note">
        把三個 μ 調到很接近 → β̂_B, β̂_C 接近 0，F 接近 0，整體不顯著。<br>
        把 μ_C 拉高、μ_B 拉低 → β̂ 變大、F 飆升 → 組間差異顯著。<br>
        這就是 ANOVA 的直覺——而它本質上就是迴歸。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>其他編碼方式</h4>
      <ul class="encodings">
        <li><strong>Treatment (dummy)</strong>：上面的方式，β 解讀為「vs 參考組」，軟體預設</li>
        <li><strong>Sum contrast</strong>：β 解讀為「vs 總均值」——SAS 習慣</li>
        <li><strong>Helmert</strong>：第 k 個 β 解讀為「第 k 組 vs 前 k − 1 組平均」——適合有序類別</li>
      </ul>
      <p>
        換編碼 β 的數值改變，但<em>擬合值、F 檢定、R²</em>完全不變——只是「同一個模型的不同座標」。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        ANOVA 是虛擬變數迴歸的特例——當 X 全是類別時的別名。
        這個視角統一了「t 檢定、ANOVA、ANCOVA、迴歸」——它們都是<strong>線性模型</strong>的切片。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .dummy { width: 60%; border-collapse: collapse; margin: 10px 0; font-size: 13px; font-family: 'JetBrains Mono', monospace; }
    .dummy th, .dummy td { padding: 6px 10px; border: 1px solid var(--border); text-align: center; }
    .dummy th { background: var(--accent-10); color: var(--accent); font-weight: 700; }

    .interp, .encodings { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .interp strong, .encodings strong { color: var(--accent); }
    .encodings em { color: var(--accent); font-style: normal; font-weight: 600; }

    .ctrl { display: flex; gap: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 160px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 40px; font-family: 'JetBrains Mono', monospace; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 36px; text-align: right; }

    .plot { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.grn { fill: #5ca878; font-weight: 700; }
    .tk.g-lab { font-size: 13px; font-weight: 700; fill: var(--text); }
    .tk.g-val { font-size: 11px; font-weight: 700; fill: var(--accent); }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.sig { border-color: #b06c4a; background: rgba(176, 108, 74, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.sig .st-v { color: #b06c4a; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh6OneWayComponent {
  readonly muA = signal(5.0);
  readonly muB = signal(5.5);
  readonly muC = signal(6.5);

  mapY(y: number): number { return 220 - (y / 10) * 200; }

  readonly groups = computed(() => {
    const rng = this.mulberry(7);
    const genSample = (mu: number, n: number) => {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) arr.push(mu + (rng() - 0.5) * 1.6);
      return arr;
    };
    const A = genSample(this.muA(), 12);
    const B = genSample(this.muB(), 12);
    const C = genSample(this.muC(), 12);
    return [
      { name: 'A', x: 120, color: '#5a8aa8', data: A, mean: A.reduce((s, v) => s + v, 0) / A.length },
      { name: 'B', x: 230, color: '#b06c4a', data: B, mean: B.reduce((s, v) => s + v, 0) / B.length },
      { name: 'C', x: 340, color: '#5ca878', data: C, mean: C.reduce((s, v) => s + v, 0) / C.length },
    ];
  });

  readonly grandMean = computed(() => {
    const g = this.groups();
    const all = g.flatMap(grp => grp.data);
    return all.reduce((s, v) => s + v, 0) / all.length;
  });

  readonly fStatValue = computed(() => {
    const g = this.groups();
    const grand = this.grandMean();
    const k = g.length;
    const n = g.reduce((s, grp) => s + grp.data.length, 0);
    const ssb = g.reduce((s, grp) => s + grp.data.length * (grp.mean - grand) ** 2, 0);
    const ssw = g.reduce((s, grp) => s + grp.data.reduce((a, v) => a + (v - grp.mean) ** 2, 0), 0);
    const msb = ssb / (k - 1);
    const msw = ssw / (n - k);
    return msw > 1e-9 ? msb / msw : 0;
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
