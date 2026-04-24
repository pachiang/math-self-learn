import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch4-vif',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="共線性與 VIF" subtitle="§4.4">
      <p>
        多元迴歸的第二大陷阱（第一是遺漏變數）：<strong>共線性 (multicollinearity)</strong>。
        當預測變數彼此高度相關，XᵀX 接近奇異，(XᵀX)⁻¹ 元素爆炸 → β̂ 的 SE 爆炸。
      </p>

      <h4>症狀</h4>
      <ul class="sym">
        <li>係數怎麼加就怎麼翻：加 x₂ 後 x₁ 的係數大變、甚至變號</li>
        <li>每個 βⱼ 的 t 檢定不顯著，但整體 F 檢定顯著（矛盾！）</li>
        <li>SE 很大、CI 寬到沒用</li>
        <li>資料一微調，β̂ 就大跳</li>
      </ul>

      <h4>診斷：變異膨脹因子 VIF</h4>
      <p>
        對第 j 個變數，把它對其他所有變數做迴歸，算出 R²ⱼ：
      </p>
      <div class="centered-eq big">
        VIFⱼ = 1 / (1 − R²ⱼ)
      </div>
      <ul class="vif">
        <li>VIF = 1：無共線性（xⱼ 與其他完全不相關）</li>
        <li>VIF = 5：「xⱼ 有 80% 可以由其他變數預測」</li>
        <li>VIF &gt; 10：經驗法則——嚴重共線性</li>
        <li>VIF = ∞：完美共線（XᵀX 奇異，OLS 不存在）</li>
      </ul>
      <p>
        VIFⱼ 直接告訴你 β̂ⱼ 的變異<strong>被共線性膨脹了幾倍</strong>：
      </p>
      <div class="centered-eq">
        Var(β̂ⱼ) = σ² / (Σ(xⱼ − x̄ⱼ)²) · VIFⱼ
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整 x₁ 與 x₂ 相關係數。觀察 VIF 膨脹 β̂ 的 SE">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">ρ(x₁, x₂)</span>
          <input type="range" min="0" max="0.99" step="0.01" [value]="rho()"
            (input)="rho.set(+$any($event).target.value)" />
          <span class="sl-val">{{ rho().toFixed(2) }}</span>
        </div>
      </div>

      <div class="gauge-row">
        <div class="gauge">
          <div class="g-lab">VIF = 1/(1−ρ²)</div>
          <svg viewBox="0 -10 220 100" class="g-svg">
            <rect x="10" y="35" width="200" height="18" fill="var(--bg)" stroke="var(--border)" />
            <rect x="10" y="35" [attr.width]="vifBarW()" height="18"
                  [attr.fill]="vifColor()" />
            <text x="110" y="47" class="g-num" text-anchor="middle">{{ vif().toFixed(2) }}×</text>
            <line x1="102" y1="30" x2="102" y2="58" stroke="#ba8d2a" stroke-width="1" stroke-dasharray="2 2" />
            <text x="102" y="72" class="g-tk" text-anchor="middle">5×</text>
            <line x1="128" y1="30" x2="128" y2="58" stroke="#b06c4a" stroke-width="1" stroke-dasharray="2 2" />
            <text x="128" y="72" class="g-tk" text-anchor="middle">10×</text>
          </svg>
          <div class="g-msg" [class.warn]="vif() > 10">{{ vifMessage() }}</div>
        </div>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">ρ</div><div class="st-v">{{ rho().toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">R²ⱼ</div><div class="st-v">{{ (rho() ** 2).toFixed(3) }}</div></div>
        <div class="st"><div class="st-l">VIF</div><div class="st-v">{{ vif().toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">SE 膨脹</div><div class="st-v">{{ Math.sqrt(vif()).toFixed(2) }}×</div></div>
      </div>

      <div class="p">
        <div class="p-title">資料與不確定區域（橢圓越扁 = 共線性越嚴重）</div>
        <svg viewBox="0 0 440 220" class="p-svg">
          <line x1="40" y1="190" x2="420" y2="190" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border-strong)" stroke-width="1" />
          <!-- Scatter -->
          @for (p of scatter(); track $index) {
            <circle [attr.cx]="mapSx(p.x1)" [attr.cy]="mapSy(p.x2)" r="2.5" fill="var(--text)" opacity="0.55" />
          }
          <!-- Confidence ellipse for β̂₁, β̂₂ (schematic: orientation from rho) -->
          <ellipse cx="230" cy="100" [attr.rx]="ellipseRx()" [attr.ry]="ellipseRy()"
                   [attr.transform]="ellipseRotate()"
                   fill="var(--accent)" opacity="0.12" stroke="var(--accent)" stroke-width="1.5" />
          <text x="230" y="207" class="tk" text-anchor="middle">x₁</text>
          <text x="30" y="100" class="tk">x₂</text>
        </svg>
      </div>

      <p class="note">
        ρ 趨近 1：<strong>VIF 爆炸</strong>、<strong>橢圓變成一條線</strong>——
        β̂₁, β̂₂ 個別沒辦法定準（但兩者之「和」或「線性組合」仍可準）。
        這就是「個別不顯著、整體顯著」的幾何解釋。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>對付共線性的三條路</h4>
      <ol class="fix">
        <li>
          <strong>刪變數</strong>：若兩個變數幾乎一樣，留一個即可。
          但注意——<em>刪掉的變數可能重要</em>，這會變成遺漏變數偏誤。
        </li>
        <li>
          <strong>合成</strong>：主成分 (PCR)、把相關變數合併成一個指標。
        </li>
        <li>
          <strong>正則化</strong>：Ridge 迴歸（Ch5）——接受偏誤換取超穩定的 β̂。
          這是最常用的方法。
        </li>
      </ol>

      <p class="takeaway">
        <strong>take-away：</strong>
        共線性不讓 OLS 偏誤，但讓 SE 爆炸——<em>估計變得不穩</em>。
        VIF &gt; 10 是警戒線。對策：刪變數、合成、或 Ridge。
        下一章我們進入正則化的世界，徹底解決這個問題。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 16px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .sym, .vif, .fix { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .vif strong, .fix strong { color: var(--accent); }
    .fix em { color: var(--text); font-style: normal; font-weight: 600; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .gauge-row { margin-bottom: 10px; }
    .gauge { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .g-lab { font-size: 12px; color: var(--text-muted); text-align: center; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
    .g-svg { width: 100%; display: block; max-height: 100px; }
    .g-num { font-size: 14px; font-weight: 700; fill: white; font-family: 'JetBrains Mono', monospace; }
    .g-tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .g-msg { text-align: center; font-size: 12px; color: #5ca878; font-weight: 600; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
    .g-msg.warn { color: #b06c4a; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .note strong { color: var(--accent); }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh4VifComponent {
  readonly Math = Math;
  readonly rho = signal(0.5);

  readonly vif = computed(() => 1 / Math.max(1e-6, 1 - this.rho() ** 2));

  vifBarW(): number {
    const v = this.vif();
    const maxW = 200;
    const logV = Math.log(v) / Math.log(20);
    return Math.max(3, Math.min(maxW, logV * maxW));
  }

  vifColor(): string {
    const v = this.vif();
    if (v > 10) return '#b06c4a';
    if (v > 5) return '#ba8d2a';
    return '#5ca878';
  }

  vifMessage(): string {
    const v = this.vif();
    if (v > 20) return '共線性嚴重：SE 至少被膨脹 ' + Math.sqrt(v).toFixed(1) + '×';
    if (v > 10) return '共線性警戒 ⚠';
    if (v > 5) return '中度共線';
    return '安全';
  }

  mapSx(x: number): number { return 40 + ((x + 3) / 6) * 380; }
  mapSy(y: number): number { return 190 - ((y + 3) / 6) * 180; }

  readonly scatter = computed(() => {
    const rng = this.mulberry(5);
    const n = 50;
    const r = this.rho();
    const out: Array<{ x1: number; x2: number }> = [];
    for (let i = 0; i < n; i++) {
      const z1 = this.randN(rng);
      const z2 = this.randN(rng);
      out.push({ x1: z1, x2: r * z1 + Math.sqrt(Math.max(0, 1 - r * r)) * z2 });
    }
    return out;
  });

  ellipseRx(): number {
    const r = this.rho();
    // More correlation => ellipse along diagonal, narrower minor axis
    return 80 / Math.sqrt(Math.max(0.05, 1 - r * 0.95));
  }
  ellipseRy(): number {
    const r = this.rho();
    return 80 * Math.sqrt(Math.max(0.05, 1 - r * 0.95));
  }
  ellipseRotate(): string {
    return `rotate(-45 230 100)`;
  }

  private randN(rng: () => number): number {
    const u1 = rng() || 1e-9;
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private mulberry(a: number) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
