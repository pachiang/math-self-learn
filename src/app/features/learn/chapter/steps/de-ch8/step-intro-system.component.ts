import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch8-intro',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從二階到一階系統" subtitle="§8.1">
      <p>
        Part II 處理的二階 ODE <code>my″ + cy′ + ky = 0</code> 有一個「神秘」步驟：
        我們不知怎麼就接受了它需要「兩個初值」y(0) 跟 y′(0)。
      </p>
      <p>
        現在回頭看，答案清楚了：<strong>二階 ODE 本質上就是兩個一階方程的系統</strong>。
        只要引入新變數 <code>v = y′</code>，整個方程就拆開：
      </p>
      <div class="split-grid">
        <div class="split-col">
          <div class="split-head">單一二階方程</div>
          <div class="split-eq">
            m·y″ + c·y′ + k·y = 0
          </div>
          <div class="split-ic">
            IC：y(0) = y₀, y′(0) = v₀
          </div>
        </div>
        <div class="split-arrow">
          <div>↓ 引入 v = y′</div>
        </div>
        <div class="split-col">
          <div class="split-head">兩個一階方程的系統</div>
          <div class="split-eq">
            y′ = v<br>
            v′ = −(k/m)·y − (c/m)·v
          </div>
          <div class="split-ic">
            IC：y(0) = y₀, v(0) = v₀
          </div>
        </div>
      </div>

      <p class="key-idea">
        這兩種寫法<strong>完全等價</strong>，但第二種有個巨大優勢：
        它直接展示了「狀態是 (y, v) 這個二維向量」、「演化是向量到向量的映射」。
        一旦用矩陣寫出：
      </p>
      <div class="centered-eq big">
        d/dt [ y ; v ] = [ 0    1 ; −k/m  −c/m ] [ y ; v ]
      </div>
      <p>
        這是個<strong>線性一階系統</strong> —— 接下來整章的主角。
        用單字符：dx/dt = Ax，其中 x = (y, v) 是狀態向量、A 是 2×2 矩陣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：輸入二階方程的係數 m, c, k → 看系統矩陣 A 自動組出">
      <div class="input-panel">
        <div class="eq-display">
          <code class="eq-code">
            {{ m().toFixed(1) }}·y″ + {{ c().toFixed(2) }}·y′ + {{ k().toFixed(1) }}·y = 0
          </code>
        </div>

        <div class="sl-row">
          <span class="sl-lab">m</span>
          <input type="range" min="0.3" max="3" step="0.05"
            [value]="m()" (input)="m.set(+$any($event).target.value)" />
          <span class="sl-val">{{ m().toFixed(2) }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab">c</span>
          <input type="range" min="0" max="3" step="0.05"
            [value]="c()" (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c().toFixed(2) }}</span>
        </div>
        <div class="sl-row">
          <span class="sl-lab">k</span>
          <input type="range" min="0.5" max="6" step="0.05"
            [value]="k()" (input)="k.set(+$any($event).target.value)" />
          <span class="sl-val">{{ k().toFixed(2) }}</span>
        </div>
      </div>

      <div class="conversion-flow">
        <div class="flow-col">
          <span class="flow-tag">設 v = y′</span>
          <div class="flow-body">
            <code class="flow-eq">
              y′ = v<br>
              v′ = −({{ k().toFixed(2) }}/{{ m().toFixed(2) }})·y − ({{ c().toFixed(2) }}/{{ m().toFixed(2) }})·v<br>
              &nbsp;&nbsp;&nbsp;= {{ (-k() / m()).toFixed(3) }}·y − {{ (c() / m()).toFixed(3) }}·v
            </code>
          </div>
        </div>

        <div class="flow-arrow">→ 寫成矩陣形式</div>

        <div class="flow-col matrix">
          <span class="flow-tag">dx/dt = A·x，A =</span>
          <div class="matrix-display">
            <div class="matrix-bracket">
              <div class="matrix-row">
                <span>0</span><span>1</span>
              </div>
              <div class="matrix-row">
                <span>{{ (-k() / m()).toFixed(2) }}</span><span>{{ (-c() / m()).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <div class="matrix-props">
            <div class="prop">
              <span class="prop-k">tr(A) = −c/m</span>
              <strong>{{ (-c() / m()).toFixed(3) }}</strong>
            </div>
            <div class="prop">
              <span class="prop-k">det(A) = k/m</span>
              <strong>{{ (k() / m()).toFixed(3) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個重寫有三個重大好處：
      </p>
      <ul>
        <li><strong>狀態空間幾何化</strong>：解是 (y, v) 平面上的<strong>一條曲線</strong>（相軌跡），而不只是時間序列。Ch5 §5.6 已經預習過。</li>
        <li><strong>推廣到高維簡單</strong>：三階 ODE？變成 3×3 系統。N 個連動彈簧？變成 2N×2N 系統。方法都一樣。</li>
        <li><strong>用線性代數武裝</strong>：矩陣 A 的特徵值決定系統所有行為——跟 Ch5 的特徵方程根完全一致，但現在用線代語言更通用。</li>
      </ul>

      <div class="connection-box">
        <h4>連結回 Part II：</h4>
        <p>
          二階 ODE 的特徵方程 <code>mr² + cr + k = 0</code>，它的根 r₁, r₂ 就是矩陣 A 的<strong>特徵值</strong>。
          為什麼？因為矩陣 A 的特徵方程就是 <code>det(A − λI) = λ² − tr(A)λ + det(A) = 0</code>，
          這正是上面右側 <code>λ² + (c/m)λ + (k/m) = 0</code>，乘以 m 就回到 <code>mλ² + cλ + k = 0</code>——一模一樣！
        </p>
      </div>

      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        二階 ODE = 2D 一階系統；三階 ODE = 3D 系統；以此類推。
        矩陣 A 的特徵值取代了 Part II 的特徵方程根——本質相同但語言更通用。
        下一節看這個矩陣形式怎麼直接「積分」出來。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 19px; padding: 16px; }

    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .split-grid {
      display: grid;
      grid-template-columns: 1fr 40px 1fr;
      gap: 8px;
      align-items: center;
      margin: 14px 0;
    }

    @media (max-width: 600px) {
      .split-grid {
        grid-template-columns: 1fr;
      }
      .split-arrow {
        text-align: center;
      }
    }

    .split-col {
      padding: 14px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .split-head {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 8px;
      text-align: center;
    }

    .split-eq {
      padding: 10px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
      color: var(--accent);
      background: var(--accent-10);
      border-radius: 6px;
      margin-bottom: 6px;
      line-height: 1.7;
    }

    .split-ic {
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .split-arrow {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
    }

    .input-panel {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 14px;
    }

    .eq-display {
      padding: 10px;
      background: var(--accent-10);
      border-radius: 6px;
      margin-bottom: 12px;
      text-align: center;
    }

    .eq-code {
      font-size: 15px;
      font-weight: 600;
      padding: 4px 10px;
    }

    .sl-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .sl-lab {
      font-size: 14px;
      color: var(--accent);
      font-weight: 700;
      min-width: 20px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl-row input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 52px;
      text-align: right;
    }

    .conversion-flow {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .flow-col {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .flow-col.matrix {
      border-color: var(--accent-30);
      background: var(--accent-10);
    }

    .flow-tag {
      display: block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .flow-col.matrix .flow-tag { color: var(--accent); }

    .flow-body {
      padding: 8px 10px;
      background: var(--bg-surface);
      border-radius: 6px;
    }

    .flow-eq {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.9;
      background: transparent;
    }

    .flow-arrow {
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
      padding: 4px 0;
    }

    .matrix-display {
      display: flex;
      justify-content: center;
      margin: 12px 0;
    }

    .matrix-bracket {
      display: inline-block;
      padding: 10px 14px;
      border-left: 3px solid var(--accent);
      border-right: 3px solid var(--accent);
      background: var(--bg);
    }

    .matrix-row {
      display: grid;
      grid-template-columns: 70px 70px;
      gap: 10px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 700;
      color: var(--accent);
      padding: 4px 0;
    }

    .matrix-props {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
    }

    .prop {
      padding: 8px 12px;
      background: var(--bg);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 12px;
    }

    .prop-k {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .prop strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }

    .connection-box {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin: 12px 0;
    }

    .connection-box h4 {
      margin: 0 0 8px;
      font-size: 14px;
      color: var(--accent);
    }

    .connection-box p {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh8IntroComponent {
  readonly m = signal(1);
  readonly c = signal(0.5);
  readonly k = signal(4);
}
