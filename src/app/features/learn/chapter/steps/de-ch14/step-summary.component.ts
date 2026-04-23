import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch14-summary',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Laplace 總結 & PDE 三章大統整" subtitle="§14.5">
      <p>
        本章把 PDE 三兄弟的最後一位——橢圓型——介紹完畢。
        讓我們把 Ch12-Ch14 三章的結構統整一下。
      </p>

      <h4>核心觀念回顧</h4>
      <div class="key-grid">
        <div class="key">
          <div class="key-name">分離變數法</div>
          <p>u(x, t) = X(x)·T(t) → PDE 拆成空間 ODE + 時間 ODE，同一個「分離常數」。</p>
        </div>
        <div class="key">
          <div class="key-name">本徵函數展開</div>
          <p>空間 BVP 給本徵函數族 Xₙ，用 Fourier 型展開初值/邊界值，每個模態獨立演化。</p>
        </div>
        <div class="key">
          <div class="key-name">疊加原理</div>
          <p>線性 PDE：所有解的組合仍是解。把四個「單邊 Dirichlet」疊加成完整問題。</p>
        </div>
        <div class="key">
          <div class="key-name">能量 / 守恆</div>
          <p>熱方程能量遞減（耗散），波方程能量守恆，Laplace 穩態是極小化問題的解。</p>
        </div>
      </div>

      <h4>三兄弟並排</h4>
      <table class="three">
        <thead>
          <tr><th>名字</th><th>方程</th><th>時間因子</th><th>類型</th><th>靈魂</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="heat">熱</td>
            <td><code>uₜ = α·Δu</code></td>
            <td>e^(−αλₙt)</td>
            <td>拋物</td>
            <td>平滑化、耗散、不可逆</td>
          </tr>
          <tr>
            <td class="wave">波</td>
            <td><code>uₜₜ = c²·Δu</code></td>
            <td>cos(√λₙ ct), sin</td>
            <td>雙曲</td>
            <td>傳播、振盪、可逆</td>
          </tr>
          <tr>
            <td class="laplace">Laplace</td>
            <td><code>Δu = 0</code></td>
            <td>— (無時間)</td>
            <td>橢圓</td>
            <td>穩態、邊界決定、最平滑</td>
          </tr>
        </tbody>
      </table>

      <h4>以同樣流程解不同 PDE（統一秘訣）</h4>
      <ol class="unified">
        <li><strong>寫下 PDE + BC + IC</strong>。</li>
        <li><strong>分離變數</strong> u = X(x)·T(t)（或 X·Y·T）。</li>
        <li>
          空間部分：解 BVP → 得本徵值 <code>λₙ</code> 與本徵函數 <code>Xₙ</code>。
        </li>
        <li>
          時間部分：解 T 的 ODE（T′ = −λT 指數、T″ = −λT 振盪、或 T 消失）。
        </li>
        <li>疊加：<code>u = Σ cₙ Xₙ(x) · Tₙ(t)</code>。</li>
        <li>用初始/邊界條件算 cₙ（Fourier 投影）。</li>
      </ol>
    </app-prose-block>

    <app-challenge-card prompt="比較三種 PDE 對同一個初始凹凸的不同命運">
      <div class="triple">
        <div class="cell">
          <div class="cell-head heat">熱方程</div>
          <div class="cell-desc">凸起<strong>下沉、擴散</strong>，最終歸零</div>
          <div class="mini-svg">
            <svg viewBox="0 -60 200 80">
              <path d="M 0 0 L 40 0 L 40 0 Q 100 -40 160 0 L 200 0" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="3 2" />
              <path d="M 0 0 Q 100 -15 200 0" fill="none" stroke="var(--accent)" stroke-width="2.2" />
              <line x1="0" y1="0" x2="200" y2="0" stroke="var(--border)" stroke-width="0.5" />
            </svg>
          </div>
        </div>
        <div class="cell">
          <div class="cell-head wave">波動方程</div>
          <div class="cell-desc">分裂成<strong>兩個行波</strong>往左右跑</div>
          <div class="mini-svg">
            <svg viewBox="0 -60 200 80">
              <path d="M 0 0 L 40 0 L 40 0 Q 100 -40 160 0 L 200 0" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="3 2" />
              <path d="M 0 0 L 20 0 Q 50 -20 80 0 L 120 0 Q 150 -20 180 0 L 200 0" fill="none" stroke="var(--accent)" stroke-width="2.2" />
              <line x1="0" y1="0" x2="200" y2="0" stroke="var(--border)" stroke-width="0.5" />
            </svg>
          </div>
        </div>
        <div class="cell">
          <div class="cell-head laplace">Laplace</div>
          <div class="cell-desc">沒有「演化」——<strong>穩態</strong>由邊界決定</div>
          <div class="mini-svg">
            <svg viewBox="0 -60 200 80">
              <path d="M 0 0 Q 100 -18 200 0" fill="none" stroke="var(--accent)" stroke-width="2.2" />
              <circle cx="0" cy="0" r="3" fill="#ba8d2a" />
              <circle cx="200" cy="0" r="3" fill="#ba8d2a" />
              <text x="100" y="18" text-anchor="middle" font-size="9" fill="var(--text-muted)">邊界固定</text>
            </svg>
          </div>
        </div>
      </div>

      <div class="unified-note">
        <strong>底層的統一性：</strong>
        都用分離變數，都得到本徵函數展開，差異只在「時間因子的 ODE 結構」。
        熱給指數、波給三角、Laplace 直接穩態——這是拉普拉斯算子 Δ 的三種「時間嗜好」。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>這趟旅程，你現在會什麼？</h4>
      <ul class="skills">
        <li>✓ 把一個物理現象寫成 ODE 或 PDE。</li>
        <li>✓ 認出方程是常係數、變係數、線性非線性。</li>
        <li>✓ 用四招（可分離、線性、精確、代換）解一階 ODE。</li>
        <li>✓ 用特徵方程解常係數二階 ODE，理解阻尼三型。</li>
        <li>✓ 用 Laplace 變換把 ODE 變代數。</li>
        <li>✓ 用矩陣指數解線性系統；看 trace-det 分類相平面。</li>
        <li>✓ 用 Jacobian 線性化非線性平衡點；認出極限環。</li>
        <li>✓ 用冪級數 / Frobenius 解變係數 ODE。</li>
        <li>✓ 認出 Sturm-Liouville 結構，用本徵函數展開。</li>
        <li>✓ 用分離變數法解熱、波、Laplace 三大 PDE。</li>
      </ul>

      <div class="next-ch">
        <h4>下一章（收尾）：分岔與混沌</h4>
        <p>
          Ch15 不再推出新的方程類型，而是回頭看非線性動力系統
          <strong>當參數改變時</strong>會發生什麼。
          分岔（bifurcation）、極限環誕生（Hopf）、
          週期倍增通往混沌（logistic map）、
          三維相空間的奇異吸引子（Lorenz）。
          這是動力系統最詩意、最不可預測、也最啟發性的領域——
          本課程的最終章。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .key-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .key { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .key-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .key p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .three { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
    .three th, .three td { padding: 8px; border: 1px solid var(--border); text-align: left; }
    .three th { background: var(--accent-10); color: var(--accent); font-weight: 700; }
    .three td.heat { background: rgba(200, 123, 94, 0.1); color: #c87b5e; font-weight: 700; }
    .three td.wave { background: rgba(90, 138, 168, 0.1); color: #5a8aa8; font-weight: 700; }
    .three td.laplace { background: rgba(92, 168, 120, 0.1); color: #5ca878; font-weight: 700; }

    .unified { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .unified strong { color: var(--accent); }

    .triple { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 10px 0; }
    @media (max-width: 640px) { .triple { grid-template-columns: 1fr; } }
    .cell { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); text-align: center; }
    .cell-head { font-weight: 700; padding: 6px; margin: -10px -10px 8px; color: white; font-size: 13px; }
    .cell-head.heat { background: #c87b5e; }
    .cell-head.wave { background: #5a8aa8; }
    .cell-head.laplace { background: #5ca878; }
    .cell-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
    .cell-desc strong { color: var(--accent); }
    .mini-svg svg { width: 100%; display: block; }

    .unified-note { padding: 12px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 13px; color: var(--text); line-height: 1.6; }
    .unified-note strong { color: var(--accent); }

    .skills { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); list-style: none; padding-left: 10px; }
    .skills li::before { content: ''; }

    .next-ch { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .next-ch p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .next-ch strong { color: var(--accent); }
  `,
})
export class DeCh14SummaryComponent {}
