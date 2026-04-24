import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch3-assumptions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="線性迴歸的五個假設" subtitle="§3.1">
      <p>
        OLS 公式 β̂ = (XᵀX)⁻¹XᵀY 不需要任何假設也能算。
        但要說它<strong>好</strong>、要做推論（CI、p-value、預測區間），就需要假設。
      </p>

      <h4>五條假設（記 LINE + N）</h4>
      <table class="assum">
        <thead><tr><th>假設</th><th>公式</th><th>違反會怎樣</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>L</strong>inearity</td>
            <td>E[Y|X] = Xβ</td>
            <td>β̂ 偏誤、預測錯誤</td>
          </tr>
          <tr>
            <td><strong>I</strong>ndependence</td>
            <td>εᵢ 彼此獨立</td>
            <td>SE 低估、p-value 假顯著</td>
          </tr>
          <tr>
            <td><strong>N</strong>ormality</td>
            <td>εᵢ ~ N(0, σ²)</td>
            <td>小樣本 CI/檢定不準（大樣本有 CLT 救）</td>
          </tr>
          <tr>
            <td><strong>E</strong>qual variance</td>
            <td>Var(εᵢ) = σ² (不隨 X)</td>
            <td>SE 錯誤、效率損失</td>
          </tr>
          <tr>
            <td>X 非隨機 / 外生</td>
            <td>E[ε|X] = 0</td>
            <td>β̂ 偏誤且不一致</td>
          </tr>
        </tbody>
      </table>

      <div class="key-idea">
        <strong>重要性順位（實務）：</strong>
        外生性 &gt; 線性 ~ 獨立 &gt; 等變異 &gt; 常態性。
        常態性<em>只</em>在小樣本推論時關鍵；n 大時 CLT 讓 β̂ 近似 Normal，整條推論照做。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="四張圖四種假設違反：看殘差圖如何揭露問題">
      <div class="grid4">
        <div class="p" [class.selected]="view() === 'good'" (click)="view.set('good')">
          <div class="p-title">✓ 五條都滿足</div>
          <svg viewBox="0 0 200 140" class="p-svg">
            <line x1="10" y1="70" x2="190" y2="70" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
            @for (p of dataGood(); track $index) {
              <circle [attr.cx]="10 + (p.x / 10) * 180" [attr.cy]="70 - p.res * 20" r="2" fill="var(--accent)" opacity="0.6" />
            }
          </svg>
          <div class="tag ok">健康</div>
        </div>

        <div class="p" [class.selected]="view() === 'nonlin'" (click)="view.set('nonlin')">
          <div class="p-title">違反：非線性</div>
          <svg viewBox="0 0 200 140" class="p-svg">
            <line x1="10" y1="70" x2="190" y2="70" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
            @for (p of dataNonlin(); track $index) {
              <circle [attr.cx]="10 + (p.x / 10) * 180" [attr.cy]="70 - p.res * 15" r="2" fill="#b06c4a" opacity="0.6" />
            }
          </svg>
          <div class="tag bad">U 形</div>
        </div>

        <div class="p" [class.selected]="view() === 'hetero'" (click)="view.set('hetero')">
          <div class="p-title">違反：異方差</div>
          <svg viewBox="0 0 200 140" class="p-svg">
            <line x1="10" y1="70" x2="190" y2="70" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
            @for (p of dataHetero(); track $index) {
              <circle [attr.cx]="10 + (p.x / 10) * 180" [attr.cy]="70 - p.res * 18" r="2" fill="#ba8d2a" opacity="0.6" />
            }
          </svg>
          <div class="tag bad">喇叭型</div>
        </div>

        <div class="p" [class.selected]="view() === 'autocorr'" (click)="view.set('autocorr')">
          <div class="p-title">違反：相關</div>
          <svg viewBox="0 0 200 140" class="p-svg">
            <line x1="10" y1="70" x2="190" y2="70" stroke="var(--border-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
            <path [attr.d]="autocorrPath()" fill="none" stroke="#5a8aa8" stroke-width="1.5" />
            @for (p of dataAutocorr(); track $index) {
              <circle [attr.cx]="10 + (p.x / 10) * 180" [attr.cy]="70 - p.res * 22" r="2" fill="#5a8aa8" opacity="0.6" />
            }
          </svg>
          <div class="tag bad">週期形</div>
        </div>
      </div>

      <div class="detail">
        @switch (view()) {
          @case ('good') {
            <p><strong>健康殘差。</strong>無結構、散佈均勻——五條假設全滿足，OLS 的推論可信。</p>
          }
          @case ('nonlin') {
            <p><strong>殘差呈 U 形 / 笑臉：</strong>線性形式漏掉彎曲。
              <em>修法</em>：加 x² 項、log(x)、spline（Ch8）。</p>
          }
          @case ('hetero') {
            <p><strong>殘差散度隨 x 擴大：</strong>異方差。β̂ 仍無偏但 <strong>SE 錯誤</strong>。
              <em>修法</em>：robust SE（White）、log(y)、WLS。</p>
          }
          @case ('autocorr') {
            <p><strong>殘差呈週期 / 漂移：</strong>獨立假設違反（時間序列常見）。SE 嚴重低估。
              <em>修法</em>：Newey–West SE、時序模型（AR, ARIMA）。</p>
          }
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>一個決策樹</h4>
      <pre class="tree">
看殘差圖
├─ 有曲線？ → 模型沒抓對形狀，加入非線性項
├─ 散度擴大？ → 用 robust SE 或轉換
├─ 有趨勢 / 週期？ → 時間序列模型
└─ 都沒有？→ 繼續看 Q–Q plot 檢查常態性
      </pre>

      <p class="takeaway">
        <strong>take-away：</strong>
        OLS 估計值無假設也成立；但<em>推論</em>（CI、p-value）依賴五條假設。
        殘差圖是檢視所有假設的第一站——幾乎所有違反都會「自首」在殘差裡。
        下一節：Gauss–Markov 告訴我們假設滿足時 OLS 有多好。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .assum { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .assum th, .assum td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .assum th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .assum td:first-child strong { color: var(--accent); font-size: 14px; }

    .grid4 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .p { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); cursor: pointer; transition: all 0.15s; }
    .p:hover { border-color: var(--accent); }
    .p.selected { border-color: var(--accent); background: var(--accent-10); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .p-svg { width: 100%; display: block; }
    .tag { font-size: 10px; text-align: center; margin-top: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .tag.ok { color: #5ca878; }
    .tag.bad { color: #b06c4a; }

    .detail { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
    .detail strong { color: var(--accent); }
    .detail em { color: var(--text); font-style: normal; font-weight: 600; }

    .tree { background: var(--bg-surface); padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text); line-height: 1.8; margin: 10px 0; white-space: pre; overflow-x: auto; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh3AssumptionsComponent {
  readonly view = signal<'good' | 'nonlin' | 'hetero' | 'autocorr'>('good');

  readonly dataGood = computed(() => this.gen((x, rng) => (rng() - 0.5) * 2));
  readonly dataNonlin = computed(() => this.gen((x, rng) => 0.3 * (x - 5) ** 2 / 2 - 1.5 + (rng() - 0.5) * 0.4));
  readonly dataHetero = computed(() => this.gen((x, rng) => (rng() - 0.5) * x * 0.4));
  readonly dataAutocorr = computed(() => this.gen((x, rng) => 1.5 * Math.sin(x * 0.9) + (rng() - 0.5) * 0.3));

  private gen(f: (x: number, rng: () => number) => number) {
    const rng = this.mulberry(7);
    const out: Array<{ x: number; res: number }> = [];
    for (let i = 0; i < 50; i++) {
      const x = 0.2 + (i * 9.6) / 50;
      out.push({ x, res: f(x, rng) });
    }
    return out;
  }

  autocorrPath(): string {
    const pts: string[] = [];
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const x = (i * 10) / N;
      const y = 1.5 * Math.sin(x * 0.9);
      const px = 10 + (x / 10) * 180;
      const py = 70 - y * 22;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
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
