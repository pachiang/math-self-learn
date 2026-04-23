import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch5-expectation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="期望值：長期平均" subtitle="§5.1">
      <p>
        期望值 E[X]（也叫均值、mean）是所有可能值的「加權平均」，權重是機率：
      </p>
      <div class="centered-eq big">
        E[X] = Σ k · p(k) &nbsp;(離散)&nbsp; 或 &nbsp;∫ x · f(x) dx &nbsp;(連續)
      </div>
      <p class="key-idea">
        直覺：<strong>E[X] 是重複實驗無限次後的平均值</strong>。
        「擲一骰」期望值 3.5——雖然沒任一擲會得到 3.5。
      </p>

      <h4>線性性（Linearity of Expectation）— 最重要的工具</h4>
      <div class="centered-eq big">
        E[aX + bY] = a·E[X] + b·E[Y]
      </div>
      <p>
        <strong>不需要 X, Y 獨立！</strong> 這是機率論最強的工具之一。
        很多問題看似困難，用線性性就能解。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="經典：帽子檢查問題">
      <div class="hat-scenario">
        <div class="h-desc">
          <strong>問題：</strong>
          n 個人把帽子交給櫃台，櫃台隨機發還。平均有幾個人拿到自己的帽子？
        </div>

        <div class="h-solve">
          <div class="solve-step">
            定義 X = 拿到自己帽子的人數 =
            <strong>X₁ + X₂ + ⋯ + Xₙ</strong>，
            其中 Xᵢ = 1 若 i 拿到自己帽子、0 若否。
          </div>
          <div class="solve-step">
            P(Xᵢ = 1) = 1/n（第 i 個隨機收到的帽子中有 1/n 是自己的）。
            所以 E[Xᵢ] = 1/n。
          </div>
          <div class="solve-step final">
            <strong>E[X] = Σ E[Xᵢ] = n · (1/n) = 1</strong>
          </div>
          <div class="solve-note">
            答案是 1，<strong>不管 n 多大</strong>。
            Xᵢ 之間明顯<strong>不獨立</strong>（若 1 號拿對了，其他人就少一個機會），
            但線性性不在乎——直接相加即可。
          </div>
        </div>
      </div>

      <div class="sim">
        <div class="sim-title">模擬驗證</div>
        <div class="sim-ctrl">
          <div class="sl">
            <span class="sl-lab">人數 n</span>
            <input type="range" min="2" max="50" step="1" [value]="n()"
              (input)="reset(); n.set(+$any($event).target.value)" />
            <span class="sl-val">{{ n() }}</span>
          </div>
          <button class="btn" (click)="simulate(1)">+ 1 輪</button>
          <button class="btn" (click)="simulate(1000)">+ 1000 輪</button>
          <button class="btn reset" (click)="reset()">↻</button>
        </div>
        <div class="sim-stats">
          <div class="st">
            <div class="st-lab">輪數</div>
            <div class="st-val">{{ rounds() }}</div>
          </div>
          <div class="st">
            <div class="st-lab">平均命中數</div>
            <div class="st-val">{{ avgHits().toFixed(3) }}</div>
          </div>
          <div class="st big">
            <div class="st-lab">理論 E[X]</div>
            <div class="st-val">1.000</div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>LOTUS: Law of the Unconscious Statistician</h4>
      <p>
        若 Y = g(X)，直接計算 E[Y] = E[g(X)]：
      </p>
      <div class="centered-eq big">
        E[g(X)] = Σ g(k)·p(k) &nbsp; 或 &nbsp; ∫ g(x)·f(x) dx
      </div>
      <p>
        <strong>不用先算 Y 的分佈</strong>——直接用 X 的分佈加權 g(X) 的值。
        這就是 LOTUS。
      </p>
      <div class="examples">
        <div class="ex">
          <div class="ex-name">E[X²]</div>
          <code>= Σ k²·p(k)</code>
          <p>用於變異數計算。</p>
        </div>
        <div class="ex">
          <div class="ex-name">E[e^X]</div>
          <code>= Σ eᵏ·p(k)</code>
          <p>動差生成函數 M(t) = E[e^tX] 的核心。</p>
        </div>
      </div>

      <h4>E[X] 不等於「最可能值」</h4>
      <p>
        擲一骰期望 3.5，但你<strong>永遠不會得到 3.5</strong>。
        家庭平均 2.3 個小孩——沒人家 2.3 小孩。
        E[X] 是<strong>平均</strong>，不是<strong>典型</strong>。
      </p>
      <p class="takeaway">
        <strong>take-away：</strong>
        期望值線性、LOTUS 讓計算變簡單。
        下一節談變異數：E[X] 告訴你「中心」，Var(X) 告訴你「散佈程度」。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .hat-scenario { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .h-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 8px; }
    .h-desc strong { color: var(--accent); }
    .h-solve { padding: 10px; background: var(--bg); border-radius: 8px; }
    .solve-step { font-size: 13px; color: var(--text-secondary); padding: 6px 0; line-height: 1.6; }
    .solve-step strong { color: var(--accent); }
    .solve-step.final { background: var(--accent-10); padding: 10px; border-radius: 6px; text-align: center; font-weight: 700; color: var(--accent); margin: 6px 0; }
    .solve-note { font-size: 12px; color: var(--text-muted); padding: 6px 0; line-height: 1.6; }
    .solve-note strong { color: var(--accent); }

    .sim { margin-top: 10px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .sim-title { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 8px; }
    .sim-ctrl { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 8px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { width: 120px; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 30px; }
    .btn { font: inherit; font-size: 12px; padding: 5px 10px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn.reset { background: transparent; color: var(--accent); }

    .sim-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .st { padding: 8px; text-align: center; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; }
    .st.big { background: var(--accent-10); border-color: var(--accent-30); }
    .st-lab { font-size: 10px; color: var(--text-muted); }
    .st-val { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .examples { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
    @media (max-width: 640px) { .examples { grid-template-columns: 1fr; } }
    .ex { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .ex-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .ex code { display: inline-block; font-size: 12px; margin-bottom: 4px; }
    .ex p { margin: 0; font-size: 12px; color: var(--text-secondary); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh5ExpectationComponent {
  readonly n = signal(10);
  readonly rounds = signal(0);
  readonly totalHits = signal(0);

  readonly avgHits = computed(() =>
    this.rounds() === 0 ? 0 : this.totalHits() / this.rounds()
  );

  simulate(k: number) {
    let hits = 0;
    const n = this.n();
    for (let r = 0; r < k; r++) {
      // random permutation, count fixed points
      const arr = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      for (let i = 0; i < n; i++) if (arr[i] === i) hits++;
    }
    this.rounds.update(x => x + k);
    this.totalHits.update(x => x + hits);
  }

  reset() {
    this.rounds.set(0);
    this.totalHits.set(0);
  }
}
