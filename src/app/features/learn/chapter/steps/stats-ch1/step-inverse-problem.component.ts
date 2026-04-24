import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-stats-ch1-inverse-problem',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="統計是機率的反問題" subtitle="§1.1">
      <p>
        機率論問的是：<strong>「知道模型，預測資料」</strong>——已知一枚公正硬幣，投 100 次會出現幾次正面？
        我們能精準算出 P(正面數 = 55) ≈ 0.048。
      </p>
      <p>
        統計學問的是反方向：<strong>「看到資料，推論模型」</strong>——投 100 次得到 55 次正面，
        這枚硬幣真的公正嗎？若不公正，正面機率 p 最可能是多少？能有多大把握？
      </p>

      <div class="flip-box">
        <div class="flip-col">
          <div class="flip-lab">機率（Probability）</div>
          <div class="flip-arrow">模型 θ &nbsp;→&nbsp; 資料 X</div>
          <div class="flip-ex">已知 p = 0.5，算 P(X = 55)</div>
        </div>
        <div class="flip-col">
          <div class="flip-lab">統計（Statistics）</div>
          <div class="flip-arrow">資料 X &nbsp;→&nbsp; 模型 θ</div>
          <div class="flip-ex">看到 X = 55，推 p 是多少</div>
        </div>
      </div>

      <h4>四個必須分清楚的詞</h4>
      <ul class="gloss">
        <li><strong>母體 (Population)</strong>：我們真正關心的整個群體（所有選民、所有硬幣投擲的結果）。</li>
        <li><strong>樣本 (Sample)</strong>：我們實際觀察到的有限子集 X₁, …, Xₙ。</li>
        <li><strong>參數 (Parameter)</strong>：母體的未知數字，用希臘字母 (μ, σ², p, θ)。通常<strong>永遠看不到</strong>。</li>
        <li><strong>統計量 (Statistic)</strong>：由樣本算出來的數字，用羅馬字母 (X̄, S², p̂)。<strong>可以算出來</strong>，但會隨樣本浮動。</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="看到隨機樣本，你能猜出真實 p 嗎？把拉桿設到你的猜測">
      <div class="true-box">
        真實 p = <strong class="hidden">?</strong>（<button class="reveal" (click)="reveal.set(!reveal())">{{ reveal() ? '隱藏' : '顯示' }}</button>）
        @if (reveal()) { <span class="true-val">{{ truthP }}</span> }
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">樣本數 n</span>
          <input type="range" min="5" max="500" step="5" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
        <button class="resample" (click)="resample()">重新抽樣</button>
      </div>

      <div class="data">
        <div class="data-row">
          <div class="data-lab">觀察到</div>
          <div class="data-val">{{ heads() }} / {{ n() }} 次正面</div>
        </div>
        <div class="data-row">
          <div class="data-lab">樣本比例 p̂</div>
          <div class="data-val acc">{{ pHat().toFixed(3) }}</div>
        </div>
      </div>

      <div class="guess">
        <div class="sl">
          <span class="sl-lab">你猜 p =</span>
          <input type="range" min="0" max="1" step="0.01" [value]="guess()"
            (input)="guess.set(+$any($event).target.value)" />
          <span class="sl-val">{{ guess().toFixed(2) }}</span>
        </div>
      </div>

      <svg viewBox="-10 -60 420 80" class="p-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
        @for (i of ticks; track i) {
          <line [attr.x1]="i * 40" y1="-3" [attr.x2]="i * 40" y2="3" stroke="var(--border-strong)" stroke-width="0.8" />
          <text [attr.x]="i * 40" y="16" class="tk" text-anchor="middle">{{ (i / 10).toFixed(1) }}</text>
        }
        <line [attr.x1]="pHat() * 400" y1="-45" [attr.x2]="pHat() * 400" y2="5"
              stroke="var(--accent)" stroke-width="2" />
        <text [attr.x]="pHat() * 400" y="-48" class="tk acc" text-anchor="middle">p̂</text>
        <line [attr.x1]="guess() * 400" y1="-30" [attr.x2]="guess() * 400" y2="5"
              stroke="#ba8d2a" stroke-width="2" stroke-dasharray="3 2" />
        <text [attr.x]="guess() * 400" y="-33" class="tk org" text-anchor="middle">你猜</text>
        @if (reveal()) {
          <line [attr.x1]="truthP * 400" y1="-15" [attr.x2]="truthP * 400" y2="5"
                stroke="#5ca878" stroke-width="2" />
          <text [attr.x]="truthP * 400" y="-18" class="tk grn" text-anchor="middle">真實</text>
        }
      </svg>

      <p class="note">
        樣本比例 p̂ 會在真實 p 附近抖動。n 越大抖動越小——但<strong>永遠不等於</strong> p。
        這就是統計的核心困境：用可觀察的 p̂ 推論看不見的 p。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        統計學的三大工具（估計、檢定、迴歸）都是在回答同一個問題——
        <em>「從看得到的樣本，我們對看不到的母體能說些什麼？能有多大把握？」</em>
      </p>
    </app-prose-block>
  `,
  styles: `
    h4 { color: var(--accent); font-size: 15px; margin: 16px 0 6px; }
    .gloss { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .gloss strong { color: var(--accent); }

    .flip-box { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
    .flip-col { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; text-align: center; }
    .flip-lab { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent); }
    .flip-arrow { margin-top: 6px; font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .flip-ex { margin-top: 4px; font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .true-box { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
      font-size: 13px; text-align: center; margin-bottom: 10px; }
    .hidden { color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .reveal { font: inherit; font-size: 11px; padding: 2px 8px; border: 1px solid var(--border); background: var(--bg); border-radius: 10px; cursor: pointer; color: var(--text-muted); }
    .reveal:hover { border-color: var(--accent); color: var(--accent); }
    .true-val { margin-left: 8px; color: #5ca878; font-family: 'JetBrains Mono', monospace; font-weight: 700; }

    .ctrl { display: flex; gap: 10px; align-items: center; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; flex: 1; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 44px; text-align: right; }
    .resample { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--accent); background: var(--accent-10); border-radius: 8px; cursor: pointer; color: var(--accent); font-weight: 600; }
    .resample:hover { background: var(--accent); color: white; }

    .data { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
    .data-row { padding: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; text-align: center; }
    .data-lab { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .data-val { font-size: 15px; font-weight: 700; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
    .data-val.acc { color: var(--accent); }

    .guess { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }

    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.acc { fill: var(--accent); font-weight: 700; }
    .tk.org { fill: #ba8d2a; font-weight: 700; }
    .tk.grn { fill: #5ca878; font-weight: 700; }

    .note { padding: 10px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .note strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class StatsCh1InverseProblemComponent {
  readonly truthP = 0.37;  // hidden "truth"
  readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  readonly reveal = signal(false);
  readonly n = signal(50);
  readonly guess = signal(0.5);
  private readonly seed = signal(0);

  readonly heads = computed(() => {
    this.seed();
    let count = 0;
    const n = this.n();
    for (let i = 0; i < n; i++) if (Math.random() < this.truthP) count++;
    return count;
  });

  readonly pHat = computed(() => this.heads() / this.n());

  resample() { this.seed.update(s => s + 1); }
}
