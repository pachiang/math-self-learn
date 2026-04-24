import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-stats-ch5-two-sample',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="比較兩群：雙樣本與配對 t 檢定" subtitle="§5.1">
      <p>
        實務中最常的問題不是「μ 是否等於 100」，而是「<strong>A 組和 B 組有差嗎</strong>」。
        新藥 vs 安慰劑、新網站設計 vs 舊版——統計學的核心戰場。
      </p>

      <h4>獨立雙樣本 t 檢定</h4>
      <p>
        兩組 <em>獨立</em>抽樣：A 組 n₁ 筆、B 組 n₂ 筆。檢定 H₀: μ_A = μ_B。
      </p>
      <div class="centered-eq big">
        T = (X̄_A − X̄_B) / √(S²_A / n₁ + S²_B / n₂)
      </div>
      <p>
        這叫 <strong>Welch t 檢定</strong>，不要求兩組變異相同。
        若假設變異相等可用「合併變異 S_p²」（Student 原版），但 Welch 在真實資料上幾乎永遠比較穩。
      </p>

      <h4>配對 t 檢定</h4>
      <p>
        當兩組<em>不獨立</em>（同一人治療前 vs 後、雙胞胎比較），
        把差 Dᵢ = Aᵢ − Bᵢ 當成<strong>單樣本 t 檢定</strong>：
      </p>
      <div class="centered-eq big">
        T = D̄ / (S_D / √n) &nbsp;~&nbsp; t(n − 1)
      </div>
      <p>
        配對設計把「個體間差異」消掉，通常檢定力遠高於獨立雙樣本。
        能配對就配對。
      </p>

      <div class="key-idea">
        <strong>獨立 ≠ 配對：用錯結果差很多。</strong>
        把「同個人治療前後」當獨立雙樣本 → 忽略了「每人個體基線不同」的資訊 → p-value 大得多。
        正確用配對版，能抓到同樣的效應即使 n 只有一半。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整兩組 X̄ 與 S。看 t 值、p-value 如何變">
      <div class="ctrl">
        <div class="grp">
          <div class="grp-h">A 組 (n = {{ nA() }})</div>
          <div class="sl">
            <span class="sl-lab">X̄_A</span>
            <input type="range" min="0" max="10" step="0.05" [value]="xA()"
              (input)="xA.set(+$any($event).target.value)" />
            <span class="sl-val">{{ xA().toFixed(2) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">S_A</span>
            <input type="range" min="0.2" max="3" step="0.05" [value]="sA()"
              (input)="sA.set(+$any($event).target.value)" />
            <span class="sl-val">{{ sA().toFixed(2) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">n_A</span>
            <input type="range" min="2" max="100" step="1" [value]="nA()"
              (input)="nA.set(+$any($event).target.value)" />
            <span class="sl-val">{{ nA() }}</span>
          </div>
        </div>
        <div class="grp">
          <div class="grp-h">B 組 (n = {{ nB() }})</div>
          <div class="sl">
            <span class="sl-lab">X̄_B</span>
            <input type="range" min="0" max="10" step="0.05" [value]="xB()"
              (input)="xB.set(+$any($event).target.value)" />
            <span class="sl-val">{{ xB().toFixed(2) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">S_B</span>
            <input type="range" min="0.2" max="3" step="0.05" [value]="sB()"
              (input)="sB.set(+$any($event).target.value)" />
            <span class="sl-val">{{ sB().toFixed(2) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">n_B</span>
            <input type="range" min="2" max="100" step="1" [value]="nB()"
              (input)="nB.set(+$any($event).target.value)" />
            <span class="sl-val">{{ nB() }}</span>
          </div>
        </div>
      </div>

      <svg viewBox="-10 -80 420 110" class="p-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        @for (i of ticks; track i) {
          <line [attr.x1]="i * 40" y1="-2" [attr.x2]="i * 40" y2="2" stroke="var(--border-strong)" stroke-width="0.6" />
          <text [attr.x]="i * 40" y="14" class="tk" text-anchor="middle">{{ i }}</text>
        }
        <!-- A group interval (X̄ ± S) -->
        <line [attr.x1]="mapX(xA() - sA())" y1="-50" [attr.x2]="mapX(xA() + sA())" y2="-50"
              stroke="#5a8aa8" stroke-width="2.5" />
        <circle [attr.cx]="mapX(xA())" cy="-50" r="4" fill="#5a8aa8" />
        <text x="5" y="-53" class="tk lab-bl">A</text>
        <!-- B group interval -->
        <line [attr.x1]="mapX(xB() - sB())" y1="-25" [attr.x2]="mapX(xB() + sB())" y2="-25"
              stroke="var(--accent)" stroke-width="2.5" />
        <circle [attr.cx]="mapX(xB())" cy="-25" r="4" fill="var(--accent)" />
        <text x="5" y="-28" class="tk lab-acc">B</text>
      </svg>

      <div class="stats">
        <div class="st">
          <div class="st-l">X̄_A − X̄_B</div>
          <div class="st-v">{{ (xA() - xB()).toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">SE (Welch)</div>
          <div class="st-v">{{ seWelch().toFixed(3) }}</div>
        </div>
        <div class="st">
          <div class="st-l">t</div>
          <div class="st-v">{{ tStat().toFixed(2) }}</div>
        </div>
        <div class="st" [class.sig]="Math.abs(tStat()) > 2">
          <div class="st-l">p (近似雙尾)</div>
          <div class="st-v">{{ pValue().toFixed(4) }}</div>
        </div>
      </div>

      <p class="note">
        粗略：|t| &gt; 2 → p &lt; 0.05（雙尾、n 不太小時）。<br>
        區間（X̄ ± S）重疊 ≠ 無顯著差異——真正看的是 SE，不是 S。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        獨立兩組 → Welch t 檢定；同一人前後或配對 → 配對 t 檢定。
        能配對就配對。同樣結構之後延伸到 ANOVA（多群）、迴歸（連續預測變數）。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 13px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .ctrl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .grp { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .grp-h { font-size: 11px; font-weight: 700; color: var(--accent); margin-bottom: 6px; text-align: center; }
    .sl { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .sl-lab { font-size: 11px; color: var(--text-muted); font-weight: 700; min-width: 32px; font-family: 'JetBrains Mono', monospace; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 11px; font-family: 'JetBrains Mono', monospace; min-width: 32px; text-align: right; }

    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.lab-bl { font-size: 11px; font-weight: 700; fill: #5a8aa8; }
    .tk.lab-acc { font-size: 11px; font-weight: 700; fill: var(--accent); }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.sig { border-color: #b06c4a; background: rgba(176, 108, 74, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.sig .st-v { color: #b06c4a; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class StatsCh5TwoSampleComponent {
  readonly Math = Math;
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  readonly xA = signal(5.5);
  readonly sA = signal(1.2);
  readonly nA = signal(25);
  readonly xB = signal(4.8);
  readonly sB = signal(1.1);
  readonly nB = signal(25);

  mapX(x: number): number {
    return Math.max(0, Math.min(400, (x / 10) * 400));
  }

  readonly seWelch = computed(() =>
    Math.sqrt((this.sA() ** 2) / this.nA() + (this.sB() ** 2) / this.nB())
  );

  readonly tStat = computed(() => (this.xA() - this.xB()) / this.seWelch());

  readonly pValue = computed(() => {
    const t = Math.abs(this.tStat());
    // Normal approx for large n; acceptable for demonstration
    return 2 * (1 - this.normCdf(t));
  });

  private normCdf(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
}
