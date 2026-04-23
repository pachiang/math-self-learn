import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function factorial(n: number): number {
  let f = 1;
  for (let k = 2; k <= n; k++) f *= k;
  return f;
}
function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k > n - k) k = n - k;
  let c = 1;
  for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1);
  return c;
}

@Component({
  selector: 'app-prob-ch1-counting',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="計數：機率的前置作業" subtitle="§1.3">
      <p>
        樣本空間等機率時，機率 = 有利/全部，把問題化為<strong>計數問題</strong>。
        四大計數工具：
      </p>
      <div class="tools">
        <div class="tool">
          <div class="t-name">乘法原理</div>
          <code>n₁ × n₂</code>
          <p>兩個獨立選擇：第一有 n₁ 方式、第二有 n₂ 方式 → 總共 n₁×n₂ 方式。</p>
        </div>
        <div class="tool">
          <div class="t-name">排列 (次序重要)</div>
          <code>P(n,k) = n!/(n−k)!</code>
          <p>n 選 k 排順序。n=10 人選 3 人排名次：10×9×8 = 720。</p>
        </div>
        <div class="tool">
          <div class="t-name">組合 (次序不重要)</div>
          <code>C(n,k) = n!/(k!(n−k)!)</code>
          <p>n 選 k 不排序。樂透 49 選 6：C(49,6) = 13,983,816。</p>
        </div>
        <div class="tool">
          <div class="t-name">放回/不放回</div>
          <code>nᵏ vs P(n,k)</code>
          <p>放回允許重複 (nᵏ)；不放回不允許 (P(n,k))。</p>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="經典謎題：生日悖論——多少人同房間才有 50% 機會「兩人同生日」？">
      <div class="birthday-ctrl">
        <div class="sl">
          <span class="sl-lab">房間人數 n</span>
          <input type="range" min="2" max="80" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">{{ n() }}</span>
        </div>
      </div>

      <div class="bp-result">
        <div class="result-big">
          <div class="r-lab">P(至少兩人同生日)</div>
          <div class="r-val" [style.color]="collisionProb() > 0.5 ? '#c87b5e' : '#5ca878'">
            {{ (collisionProb() * 100).toFixed(2) }}%
          </div>
        </div>
        <div class="r-bar">
          <div class="r-bar-fill" [style.width.%]="collisionProb() * 100"></div>
          <div class="r-mark" [style.left]="'50%'"></div>
        </div>
        <div class="r-explanation">
          用<strong>補集</strong>：P(都不同) = <code>365·364·⋯·(365−n+1) / 365ⁿ</code>。
          P(至少一對) = 1 − P(都不同)。
        </div>
      </div>

      <div class="b-plot">
        <svg viewBox="-10 -90 420 140" class="b-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-85" x2="0" y2="35" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-42.5" x2="400" y2="-42.5" stroke="#5ca878" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.6" />
          <text x="404" y="-38" class="tk">50%</text>

          <path [attr.d]="bPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />
          <!-- n = 23 marker (where it crosses 50%) -->
          <line [attr.x1]="23 * 5" y1="-85" [attr.x2]="23 * 5" y2="15"
            stroke="#ba8d2a" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.7" />
          <text [attr.x]="23 * 5" y="24" class="tk" text-anchor="middle" style="fill:#ba8d2a;">n=23</text>

          <!-- Current n marker -->
          <line [attr.x1]="n() * 5" y1="-85" [attr.x2]="n() * 5" y2="15" stroke="var(--accent)" stroke-width="1.2" />
          <circle [attr.cx]="n() * 5" [attr.cy]="-collisionProb() * 85" r="5"
            fill="var(--accent)" stroke="white" stroke-width="1.5" />

          <text x="0" y="14" class="tk">0</text>
          <text x="400" y="14" class="tk" text-anchor="end">80</text>
        </svg>
      </div>

      <div class="surprise-row">
        <div class="surprise-card">
          <div class="s-label">有趣數字</div>
          <ul>
            <li>n = 23 → 50.73%</li>
            <li>n = 50 → 97.04%</li>
            <li>n = 70 → 99.92%</li>
          </ul>
        </div>
        <div class="surprise-card">
          <div class="s-label">為什麼看起來這麼少？</div>
          <p>
            關鍵：我們不是問「誰跟<strong>我</strong>同生日」（n/365 線性），
            而是「<strong>任兩人</strong>同生日」——有 C(n,2) = n(n−1)/2 對。
            n=23 時有 253 對，每對衝撞機率 1/365，總期望值 ≈ 0.69 衝撞。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>其他經典計數問題</h4>
      <div class="q-grid">
        <div class="q-card">
          <div class="q-name">洗牌後第 1 張是 A</div>
          <p>52 張中 4 張 A → P = 4/52 = 1/13。</p>
        </div>
        <div class="q-card">
          <div class="q-name">樂透 49 選 6 中頭獎</div>
          <p>P = 1 / C(49,6) = 1 / 13,983,816 ≈ 7.15 × 10⁻⁸。</p>
        </div>
        <div class="q-card">
          <div class="q-name">5 張撲克牌為 flush（全同花色）</div>
          <p>P = 4·C(13,5) / C(52,5) = 5148/2598960 ≈ 0.00198。</p>
        </div>
        <div class="q-card">
          <div class="q-name">10 個相同球放 3 個盒子</div>
          <p>C(n+k-1, k-1) = C(12,2) = 66。</p>
        </div>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        計數 = 把問題對應到「有結構的集合」+ 用排列組合算大小。
        生日悖論展示了機率直覺的脆弱——下一章深入「條件機率」，直覺會更崩潰。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .tool { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .t-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
    .tool code { display: inline-block; font-size: 12px; margin-bottom: 4px; }
    .tool p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .birthday-ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 80px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; text-align: right; }

    .bp-result { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; text-align: center; }
    .result-big { margin-bottom: 10px; }
    .r-lab { font-size: 12px; color: var(--text-muted); }
    .r-val { font-size: 34px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .r-bar { position: relative; height: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 5px; overflow: hidden; margin-bottom: 10px; }
    .r-bar-fill { height: 100%; background: var(--accent); transition: width 0.12s ease; }
    .r-mark { position: absolute; top: -4px; bottom: -4px; width: 2px; background: #5ca878; }
    .r-explanation { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .r-explanation strong { color: var(--accent); }

    .b-plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-top: 10px; }
    .b-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .surprise-row { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 10px; }
    @media (max-width: 640px) { .surprise-row { grid-template-columns: 1fr; } }
    .surprise-card { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .s-label { font-weight: 700; color: var(--accent); font-size: 12px; margin-bottom: 6px; }
    .surprise-card ul { margin: 0; padding-left: 18px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; font-family: 'JetBrains Mono', monospace; }
    .surprise-card p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .surprise-card strong { color: var(--accent); }

    .q-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .q-card { padding: 12px; border: 1px dashed var(--border); border-radius: 10px; background: var(--bg); }
    .q-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
    .q-card p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh1CountingComponent {
  readonly n = signal(23);

  readonly collisionProb = computed(() => {
    const n = this.n();
    let p = 1;
    for (let i = 0; i < n; i++) p *= (365 - i) / 365;
    return 1 - p;
  });

  bPath(): string {
    const pts: string[] = [];
    for (let n = 1; n <= 80; n++) {
      let p = 1;
      for (let i = 0; i < n; i++) p *= (365 - i) / 365;
      const coll = 1 - p;
      pts.push(`${n === 1 ? 'M' : 'L'} ${(n * 5).toFixed(1)} ${(-coll * 85).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
