import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch15-bifurcation-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="分岔：參數一動，世界改變" subtitle="§15.1">
      <p>
        Ch9 介紹了非線性動力系統的局部分析。
        但真實世界的系統有<strong>參數</strong>：溫度、控制旋鈕、族群壓力。
        當參數跨越某個<strong>臨界值</strong>，平衡點的數量或穩定性會<strong>突然改變</strong>——
        這叫做<strong>分岔（bifurcation）</strong>。
      </p>
      <p class="key-idea">
        分岔是<strong>定量變化引發定性變化</strong>的數學。
        水變冰、雷射發光、心跳失常、股市崩盤——都是分岔的實例。
      </p>

      <h4>Saddle-Node（鞍結）分岔</h4>
      <p>最簡單的分岔：兩個平衡點碰撞並消失。</p>
      <div class="centered-eq big">
        dx/dt = r + x²
      </div>
      <p>
        <strong>r &lt; 0</strong>：有兩個平衡點 x* = ±√(−r)，一穩一不穩。
        <strong>r = 0</strong>：兩個平衡點合而為一（<strong>臨界</strong>）。
        <strong>r &gt; 0</strong>：沒有平衡點，x 一路跑到 ∞。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="滑動 r：看兩個平衡點碰撞並消失">
      <div class="two-plots">
        <div class="plot">
          <div class="pt-title">相圖 f(x) = r + x²</div>
          <svg viewBox="-120 -100 240 180" class="pt-svg">
            <line x1="-120" y1="0" x2="120" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-95" x2="0" y2="75" stroke="var(--border-strong)" stroke-width="1" />
            <!-- f(x) -->
            <path [attr.d]="fPath()" fill="none" stroke="var(--accent)" stroke-width="2.2" />
            <!-- Equilibria -->
            @for (eq of equilibria(); track eq.x) {
              <circle [attr.cx]="eq.x * 30" cy="0" r="5"
                [attr.fill]="eq.stable ? '#5ca878' : 'white'"
                [attr.stroke]="eq.stable ? '#5ca878' : '#c87b5e'"
                stroke-width="2" />
              <text [attr.x]="eq.x * 30" y="-10" class="eq-lab" text-anchor="middle"
                [attr.fill]="eq.stable ? '#5ca878' : '#c87b5e'">{{ eq.stable ? '穩' : '不穩' }}</text>
            }
            <text x="118" y="14" class="tk">x</text>
            <text x="-4" y="-95" class="tk">f(x)</text>
          </svg>
        </div>

        <div class="plot">
          <div class="pt-title">分岔圖：x*(r)</div>
          <svg viewBox="-120 -100 240 180" class="pt-svg">
            <line x1="-120" y1="0" x2="120" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-95" x2="0" y2="75" stroke="var(--border-strong)" stroke-width="1" />
            <!-- Upper unstable branch -->
            <path d="M -100 -60 Q -50 -42 -4 -4" fill="none" stroke="#c87b5e" stroke-width="2" stroke-dasharray="3 2" />
            <!-- Lower stable branch -->
            <path d="M -100 60 Q -50 42 -4 4" fill="none" stroke="#5ca878" stroke-width="2.2" />
            <!-- Current r vertical line -->
            <line [attr.x1]="rVal() * 100" y1="-95" [attr.x2]="rVal() * 100" y2="75"
              stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 2" />
            <text [attr.x]="rVal() * 100 + 3" y="-80" class="tk">r = {{ rVal().toFixed(2) }}</text>
            <text x="118" y="14" class="tk">r</text>
            <text x="-4" y="-95" class="tk">x*</text>
            <text x="-100" y="-42" class="branch-lab" style="fill:#c87b5e;">不穩分支</text>
            <text x="-100" y="82" class="branch-lab" style="fill:#5ca878;">穩定分支</text>
          </svg>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">參數 r</span>
          <input type="range" min="-1" max="1" step="0.01" [value]="rVal()"
            (input)="rVal.set(+$any($event).target.value)" />
          <span class="sl-val">{{ rVal().toFixed(2) }}</span>
        </div>
      </div>

      <div class="verdict" [attr.data-stage]="stage()">
        @if (stage() === 'left') {
          <strong>r &lt; 0：</strong> 兩個平衡點（一穩、一不穩），x 會收斂到左邊穩定的。
        } @else if (stage() === 'crit') {
          <strong>r ≈ 0：</strong> 分岔點——兩個平衡點合而為一（半穩定）。
        } @else {
          <strong>r &gt; 0：</strong> 沒有平衡點。無論初始條件都被推向 +∞。
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>四種經典 1D 分岔</h4>
      <div class="bif-grid">
        <div class="bif">
          <div class="bif-name">Saddle-node</div>
          <code class="bif-eq">dx/dt = r + x²</code>
          <p>兩點碰撞消失。臨界時系統失去平衡。</p>
        </div>
        <div class="bif">
          <div class="bif-name">Transcritical</div>
          <code class="bif-eq">dx/dt = rx − x²</code>
          <p>兩條線交叉，穩定性互換。族群存續 vs 滅絕的典型模型。</p>
        </div>
        <div class="bif">
          <div class="bif-name">Pitchfork (supercritical)</div>
          <code class="bif-eq">dx/dt = rx − x³</code>
          <p>一個平衡點分裂成三個（中間不穩）。磁化、對稱破缺。</p>
        </div>
        <div class="bif">
          <div class="bif-name">Pitchfork (subcritical)</div>
          <code class="bif-eq">dx/dt = rx + x³</code>
          <p>危險的突變——過了臨界值系統「跳走」。雷射、Euler 屈曲。</p>
        </div>
      </div>

      <h4>全局觀：分岔 = 參數空間的「骨架」</h4>
      <p>
        固定一個動力系統族 <code>ẋ = f(x; r)</code>。
        把 (r, x*) 平面上所有平衡點畫出來 → 一條曲線。
        這條曲線就是<strong>分岔圖</strong>，呈現系統的全局定性結構。
        凡是曲線彎折、交叉、出現折點之處，就是分岔。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        參數動一動，平衡點的數量和穩定性可能突變。
        四種 1D 分岔涵蓋了絕大部分真實現象。
        下一節把這個推廣到 2D——那裡會出現 Hopf 分岔，從平衡點<strong>生出極限環</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 18px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 15px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .two-plots { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    @media (max-width: 640px) { .two-plots { grid-template-columns: 1fr; } }
    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pt-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pt-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .eq-lab { font-size: 9px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .branch-lab { font-size: 9px; font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 48px; text-align: right; }

    .verdict { padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 10px; line-height: 1.6; }
    .verdict[data-stage='left'] { background: rgba(92, 168, 120, 0.1); color: #5ca878; }
    .verdict[data-stage='crit'] { background: rgba(244, 200, 102, 0.1); color: #ba8d2a; }
    .verdict[data-stage='right'] { background: rgba(200, 123, 94, 0.1); color: #c87b5e; }
    .verdict strong { color: inherit; }

    .bif-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .bif { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .bif-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .bif-eq { display: block; font-size: 12px; padding: 4px 8px; margin-bottom: 6px; background: var(--bg-surface); }
    .bif p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh15BifurcationIntroComponent {
  readonly rVal = signal(-0.3);

  readonly stage = computed(() => {
    const r = this.rVal();
    if (r < -0.03) return 'left';
    if (r < 0.03) return 'crit';
    return 'right';
  });

  readonly equilibria = computed(() => {
    const r = this.rVal();
    if (r >= 0) return [];
    const s = Math.sqrt(-r);
    // f = r + x^2, f'(x) = 2x, at x = -s: f' = -2s < 0 stable, at x = +s: f' = +2s > 0 unstable
    return [
      { x: -s, stable: true },
      { x: s, stable: false },
    ];
  });

  fPath(): string {
    const r = this.rVal();
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = -4 + (8 * i) / N;
      const f = r + x * x;
      const fc = Math.max(-3, Math.min(3, f));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(x * 30).toFixed(1)} ${(-fc * 25).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
