import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch15-finale',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="微分方程課程總結" subtitle="§15.5 終章">
      <p>
        恭喜——你已經走完 15 章的微分方程旅程。
        從「日常現象 → dy/dt = f(t, y)」的樸素開始，
        一路到熱方程、波動、Laplace、混沌吸引子——
        你已擁有數理世界中最強大的工具集之一。
      </p>

      <h4>三部曲回顧</h4>
      <div class="parts">
        <div class="part">
          <div class="part-num">Part I · Ch1-4</div>
          <div class="part-title">基礎與一階 ODE</div>
          <p>
            從現象寫方程、四招解法、建模應用、存在唯一性 + 數值方法。
            這是 ODE 世界的「入門工具箱」。
          </p>
        </div>
        <div class="part">
          <div class="part-num">Part II · Ch5-7</div>
          <div class="part-title">二階 ODE（振動的語言）</div>
          <p>
            特徵方程、阻尼、共振、相平面、Laplace 變換。
            這裡你學會了「聽」方程在唱什麼——頻率、衰減、共振。
          </p>
        </div>
        <div class="part">
          <div class="part-num">Part III · Ch8-9</div>
          <div class="part-title">系統與非線性</div>
          <p>
            從純量到向量，矩陣指數、相肖像、Hartman-Grobman、極限環。
            這是動力系統的本真面貌。
          </p>
        </div>
        <div class="part">
          <div class="part-num">Part IV · Ch10-11</div>
          <div class="part-title">級數解與 Sturm-Liouville</div>
          <p>
            變係數 ODE、特殊函數、本徵值問題、正交展開。
            所有「物理等級」的方程在這裡統一。
          </p>
        </div>
        <div class="part">
          <div class="part-num">Part V · Ch12-14</div>
          <div class="part-title">偏微分方程入門</div>
          <p>
            熱、波、Laplace 三兄弟。分離變數法 + 本徵函數展開的全面應用。
            這是連續介質物理的語言。
          </p>
        </div>
        <div class="part">
          <div class="part-num">Part VI · Ch15</div>
          <div class="part-title">分岔與混沌</div>
          <p>
            參數空間的分析。從 saddle-node 到 Hopf，從週期倍增到 Lorenz。
            確定性中的不可預測性。
          </p>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="三個領悟">
      <div class="insights">
        <div class="insight">
          <div class="i-num">💡</div>
          <div class="i-body">
            <strong>線性性是禮物</strong>：只要方程線性，無論 ODE 還是 PDE，
            都能用「本徵值 × 本徵函數 × 疊加」解決。
            Ch11 的 Sturm-Liouville 是這個普遍原則的完美結晶。
          </div>
        </div>
        <div class="insight">
          <div class="i-num">💡</div>
          <div class="i-body">
            <strong>非線性是真實</strong>：真實世界幾乎都非線性。
            幸好我們有兩個好工具：<strong>局部線性化</strong>（Ch9 Jacobian + Hartman-Grobman）
            和<strong>不變結構</strong>（極限環、混沌吸引子、分岔骨架）。
          </div>
        </div>
        <div class="insight">
          <div class="i-num">💡</div>
          <div class="i-body">
            <strong>幾何 vs 代數的二重奏</strong>：每個方程都有<strong>代數解法</strong>
            （特徵方程、Laplace 變換、Fourier 係數）和<strong>幾何視角</strong>
            （相平面、相肖像、分岔圖、吸引子）。兩者互補，缺一不可。
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>你可以去哪裡？</h4>
      <div class="future">
        <div class="fut">
          <div class="fut-name">複分析 (complex)</div>
          <p>
            調和函數 = 複解析函數的實部。留數定理讓 ODE 的 Laplace 反變換變得幾何化。
            本站有完整的複分析課程。
          </p>
        </div>
        <div class="fut">
          <div class="fut-name">實分析 (analysis)</div>
          <p>
            Fourier 分析、Hilbert 空間、Sobolev 空間——PDE 解的存在唯一性需要這些工具的嚴格底子。
          </p>
        </div>
        <div class="fut">
          <div class="fut-name">線性代數 (linalg)</div>
          <p>
            Jordan 形式、Spectral Theorem、SVD——這些是理解系統、數值計算的基礎。
            本站 ch9, ch17 跟微分方程直接連結。
          </p>
        </div>
        <div class="fut">
          <div class="fut-name">進階 PDE</div>
          <p>
            Sobolev 空間、弱解、有限元素法、非線性 PDE、流體方程、廣義函數（Ch18 實分析）。
          </p>
        </div>
        <div class="fut">
          <div class="fut-name">動力系統</div>
          <p>
            KAM 理論、遍歷論、辛幾何、流形上的動力。
            當代數學物理的最前沿。
          </p>
        </div>
        <div class="fut">
          <div class="fut-name">科學計算</div>
          <p>
            自適應網格、多尺度方法、深度學習求解 PDE（Physics-Informed Neural Networks）。
            數學與計算的新綜合。
          </p>
        </div>
      </div>

      <div class="final-note">
        <h4>最後一句</h4>
        <p>
          Euler、Poincaré、von Neumann、Lorenz——你現在<strong>握著他們的工具</strong>。
          真實世界每個奇妙現象背後都有一條微分方程在等你去讀懂它。
          去試試看吧。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .parts { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin: 10px 0; }
    .part { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .part-num { font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    .part-title { font-size: 14px; font-weight: 700; color: var(--accent); margin: 4px 0 6px; }
    .part p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

    .insights { display: grid; gap: 10px; }
    .insight { display: grid; grid-template-columns: 40px 1fr; gap: 10px; align-items: start; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .i-num { font-size: 22px; }
    .i-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .i-body strong { color: var(--accent); }

    .future { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .fut { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .fut-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .fut p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .final-note { padding: 18px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; text-align: center; }
    .final-note h4 { margin-top: 0; }
    .final-note p { font-size: 14px; color: var(--text); line-height: 1.7; margin: 6px 0 0; }
    .final-note strong { color: var(--accent); }
  `,
})
export class DeCh15FinaleComponent {}
