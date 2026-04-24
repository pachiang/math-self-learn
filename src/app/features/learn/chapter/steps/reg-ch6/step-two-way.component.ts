import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch6-two-way',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="雙因子與交互作用" subtitle="§6.2">
      <p>
        兩個類別變數：性別 × 藥物。要問：
      </p>
      <ul class="qs">
        <li>性別對 Y 有影響嗎？（主效應 A）</li>
        <li>藥物對 Y 有影響嗎？（主效應 B）</li>
        <li>藥物效果在不同性別<strong>不同</strong>嗎？（交互作用 A × B）</li>
      </ul>

      <h4>模型</h4>
      <div class="centered-eq big">
        Y = β₀ + β_sex · d_sex + β_drug · d_drug + β_× · (d_sex · d_drug) + ε
      </div>
      <p>
        第四項是<strong>交互作用項</strong>——兩個虛擬變數相乘。
        β_× 捕捉「主效應無法解釋的差異」。
      </p>

      <div class="key-idea">
        <strong>交互作用的直覺：</strong>
        若 β_× ≈ 0 → 「藥效在男性和女性一樣大」（效應可加、平行線）。<br>
        若 β_× 大 → 「藥效在不同性別差異明顯」（不平行、甚至反轉）。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調整四格均值。看交互作用圖「平行」還是「交叉」">
      <div class="grid-inputs">
        <div class="cell-head"></div>
        <div class="cell-head">藥 A</div>
        <div class="cell-head">藥 B</div>

        <div class="cell-head">男性</div>
        <div class="cell">
          <input type="range" min="2" max="9" step="0.1" [value]="mMA()"
            (input)="mMA.set(+$any($event).target.value)" />
          <span>{{ mMA().toFixed(1) }}</span>
        </div>
        <div class="cell">
          <input type="range" min="2" max="9" step="0.1" [value]="mMB()"
            (input)="mMB.set(+$any($event).target.value)" />
          <span>{{ mMB().toFixed(1) }}</span>
        </div>

        <div class="cell-head">女性</div>
        <div class="cell">
          <input type="range" min="2" max="9" step="0.1" [value]="mFA()"
            (input)="mFA.set(+$any($event).target.value)" />
          <span>{{ mFA().toFixed(1) }}</span>
        </div>
        <div class="cell">
          <input type="range" min="2" max="9" step="0.1" [value]="mFB()"
            (input)="mFB.set(+$any($event).target.value)" />
          <span>{{ mFB().toFixed(1) }}</span>
        </div>
      </div>

      <div class="plot">
        <div class="p-title">交互作用圖：兩條線平行 → 無交互；交叉或發散 → 有交互</div>
        <svg viewBox="0 0 440 240" class="p-svg">
          <line x1="40" y1="210" x2="420" y2="210" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="40" y1="20" x2="40" y2="210" stroke="var(--border-strong)" stroke-width="1" />

          <!-- x-axis labels -->
          <text x="140" y="228" class="tk" text-anchor="middle">藥 A</text>
          <text x="320" y="228" class="tk" text-anchor="middle">藥 B</text>
          <!-- y ticks -->
          @for (t of yticks; track t) {
            <line x1="36" [attr.y1]="mapY(t)" x2="40" [attr.y2]="mapY(t)" stroke="var(--border-strong)" stroke-width="0.8" />
            <text x="32" [attr.y]="mapY(t) + 3" class="tk" text-anchor="end">{{ t }}</text>
          }

          <!-- Male line -->
          <line [attr.x1]="140" [attr.y1]="mapY(mMA())" [attr.x2]="320" [attr.y2]="mapY(mMB())"
                stroke="#5a8aa8" stroke-width="2.5" />
          <circle [attr.cx]="140" [attr.cy]="mapY(mMA())" r="5" fill="#5a8aa8" />
          <circle [attr.cx]="320" [attr.cy]="mapY(mMB())" r="5" fill="#5a8aa8" />
          <text x="330" [attr.y]="mapY(mMB()) + 4" class="tk" fill="#5a8aa8" font-weight="700">男</text>

          <!-- Female line -->
          <line [attr.x1]="140" [attr.y1]="mapY(mFA())" [attr.x2]="320" [attr.y2]="mapY(mFB())"
                stroke="#b06c4a" stroke-width="2.5" />
          <circle [attr.cx]="140" [attr.cy]="mapY(mFA())" r="5" fill="#b06c4a" />
          <circle [attr.cx]="320" [attr.cy]="mapY(mFB())" r="5" fill="#b06c4a" />
          <text x="330" [attr.y]="mapY(mFB()) + 4" class="tk" fill="#b06c4a" font-weight="700">女</text>
        </svg>
      </div>

      <div class="stats">
        <div class="st"><div class="st-l">主效應性別</div><div class="st-v">{{ mainSex().toFixed(2) }}</div></div>
        <div class="st"><div class="st-l">主效應藥物</div><div class="st-v">{{ mainDrug().toFixed(2) }}</div></div>
        <div class="st" [class.hi]="Math.abs(interaction()) > 0.5">
          <div class="st-l">交互作用 β_×</div>
          <div class="st-v">{{ interaction().toFixed(2) }}</div>
        </div>
        <div class="st">
          <div class="st-l">詮釋</div>
          <div class="st-v">{{ interpretation() }}</div>
        </div>
      </div>

      <div class="demo-buttons">
        <button class="btn" (click)="setPreset('parallel')">① 純加性（平行）</button>
        <button class="btn" (click)="setPreset('crossed')">② 反轉（交叉）</button>
        <button class="btn" (click)="setPreset('amplify')">③ 放大</button>
        <button class="btn" (click)="setPreset('only-drug')">④ 只有藥效</button>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼交互作用常被忽略但很重要</h4>
      <p>
        許多研究只報告主效應，認為「藥 B 比 A 有效 2 單位」。
        但若存在交互作用，這個數字<strong>只對某些子群體正確</strong>——
        在其他子群體可能完全相反！
      </p>
      <ul class="caveat">
        <li>醫學：藥物在男性 vs 女性可能完全不同反應</li>
        <li>教育：教法在優秀生 vs 落後生差異懸殊</li>
        <li>行銷：優惠券對新客戶 vs 老客戶效果相反</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        雙因子 ANOVA 看<em>主效應 + 交互作用</em>。
        先畫互動圖檢查平行不平行——若交叉，就別只談平均效應。
        這是「用對模型說對故事」的關鍵。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }
    .qs, .caveat { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .qs strong { color: var(--accent); }

    .grid-inputs { display: grid; grid-template-columns: 100px 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .cell-head { padding: 8px; background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; text-align: center; border-radius: 6px; font-family: 'JetBrains Mono', monospace; }
    .cell { padding: 8px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; gap: 8px; }
    .cell input { flex: 1; accent-color: var(--accent); }
    .cell span { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 700; min-width: 32px; text-align: right; }

    .plot { padding: 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 10px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .st { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .st.hi { border-color: #ba8d2a; background: rgba(186, 141, 42, 0.08); }
    .st-l { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .st-v { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .st.hi .st-v { color: #ba8d2a; }

    .demo-buttons { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
    .btn { font: inherit; font-size: 11px; padding: 6px 10px; border: 1px solid var(--border); background: var(--bg); border-radius: 8px; cursor: pointer; color: var(--text-muted); }
    .btn:hover { border-color: var(--accent); color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
    .takeaway em { color: var(--accent); font-style: normal; font-weight: 600; }
  `,
})
export class RegCh6TwoWayComponent {
  readonly Math = Math;
  readonly yticks = [2, 4, 6, 8, 10];

  readonly mMA = signal(4.0);
  readonly mMB = signal(5.5);
  readonly mFA = signal(5.0);
  readonly mFB = signal(6.5);

  mapY(y: number): number { return 210 - (y / 10) * 190; }

  readonly mainSex = computed(() => ((this.mFA() + this.mFB()) - (this.mMA() + this.mMB())) / 2);
  readonly mainDrug = computed(() => ((this.mMB() + this.mFB()) - (this.mMA() + this.mFA())) / 2);
  readonly interaction = computed(() => ((this.mFB() - this.mFA()) - (this.mMB() - this.mMA())) / 2);

  readonly interpretation = computed(() => {
    const inter = Math.abs(this.interaction());
    if (inter < 0.3) return '無交互';
    if (inter < 0.8) return '弱交互';
    if ((this.mFB() - this.mFA()) * (this.mMB() - this.mMA()) < 0) return '反轉！';
    return '強交互';
  });

  setPreset(p: 'parallel' | 'crossed' | 'amplify' | 'only-drug') {
    switch (p) {
      case 'parallel':
        this.mMA.set(4); this.mMB.set(5.5); this.mFA.set(5); this.mFB.set(6.5); break;
      case 'crossed':
        this.mMA.set(6.5); this.mMB.set(4); this.mFA.set(3.5); this.mFB.set(6.5); break;
      case 'amplify':
        this.mMA.set(4.5); this.mMB.set(5.5); this.mFA.set(3); this.mFB.set(7.5); break;
      case 'only-drug':
        this.mMA.set(4); this.mMB.set(7); this.mFA.set(4); this.mFB.set(7); break;
    }
  }
}
