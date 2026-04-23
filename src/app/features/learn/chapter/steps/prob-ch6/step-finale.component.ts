import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch6-finale',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="機率論總結：你現在會什麼？" subtitle="§6.3 終章">
      <p>
        恭喜——你已完成機率與統計的核心六章。從基礎到 CLT，
        你已掌握理解現代統計、機器學習、科學實驗的骨架。
      </p>

      <h4>六章回顧</h4>
      <div class="parts">
        <div class="pt">
          <div class="pt-n">Ch1</div>
          <div class="pt-t">什麼是機率</div>
          <p>三種詮釋、Kolmogorov 公理、計數、Monte Carlo。</p>
        </div>
        <div class="pt">
          <div class="pt-n">Ch2</div>
          <div class="pt-t">條件機率 & Bayes</div>
          <p>Bayes 定理、base rate fallacy、Simpson 悖論。</p>
        </div>
        <div class="pt">
          <div class="pt-n">Ch3</div>
          <div class="pt-t">離散分佈</div>
          <p>Bernoulli、Binomial、Poisson、Geometric。</p>
        </div>
        <div class="pt">
          <div class="pt-n">Ch4</div>
          <div class="pt-t">連續分佈</div>
          <p>PDF/CDF、Uniform、Exponential、Normal、Gamma 家族。</p>
        </div>
        <div class="pt">
          <div class="pt-n">Ch5</div>
          <div class="pt-t">期望值 & 變異數</div>
          <p>線性性、LOTUS、Cov、Chebyshev。</p>
        </div>
        <div class="pt">
          <div class="pt-n">Ch6</div>
          <div class="pt-t">LLN & CLT</div>
          <p>樣本均值的極限理論——統計學的基礎。</p>
        </div>
      </div>

      <h4>關鍵領悟</h4>
      <div class="insights">
        <div class="ins">
          <div class="ins-n">💡</div>
          <div class="ins-b">
            <strong>機率 = 不確定性的語言。</strong> 我們永遠活在不確定中；
            機率讓我們量化它、與之共處、從中學習。
          </div>
        </div>
        <div class="ins">
          <div class="ins-n">💡</div>
          <div class="ins-b">
            <strong>Bayes 定理是合理更新信念的正確方式。</strong>
            新證據不取代舊信念，而是<strong>精煉</strong>它。
          </div>
        </div>
        <div class="ins">
          <div class="ins-n">💡</div>
          <div class="ins-b">
            <strong>線性性和獨立性是兩大「物理守恆律」。</strong>
            E[X+Y] = E[X] + E[Y] 永遠成立；Var(X+Y) 需要獨立。
          </div>
        </div>
        <div class="ins">
          <div class="ins-n">💡</div>
          <div class="ins-b">
            <strong>CLT 不是定理、是自然律。</strong>
            任何「大量獨立小效應」的結果都趨向 Normal——
            從物理量測到族群身高。
          </div>
        </div>
        <div class="ins">
          <div class="ins-n">💡</div>
          <div class="ins-b">
            <strong>直覺總會偏離正確答案。</strong>
            base rate、Simpson、生日悖論⋯⋯ 要相信數學，不是直覺。
          </div>
        </div>
      </div>

      <h4>這是開始，不是結束</h4>
      <p>往下可以探索的領域：</p>
      <div class="future">
        <div class="fu">
          <div class="fu-n">Statistical Inference</div>
          <p>MLE、假設檢定、置信區間、p-value、貝葉斯推論。</p>
        </div>
        <div class="fu">
          <div class="fu-n">隨機過程</div>
          <p>Markov chains、Poisson 過程、Brownian motion。</p>
        </div>
        <div class="fu">
          <div class="fu-n">機器學習</div>
          <p>用機率語言統一：判別式、生成式、Bayesian NN、diffusion。</p>
        </div>
        <div class="fu">
          <div class="fu-n">統計物理</div>
          <p>Ising 模型、熵、配分函數、大偏差理論。</p>
        </div>
        <div class="fu">
          <div class="fu-n">資訊論</div>
          <p>熵、互信息、KL 散度、通道容量、編碼理論。</p>
        </div>
        <div class="fu">
          <div class="fu-n">金融數學</div>
          <p>Black-Scholes、風險、投資組合理論。</p>
        </div>
      </div>

      <div class="closing">
        <h4>最後一句話</h4>
        <p>
          Gauss、Fermat、Kolmogorov、Feller——這些人的工具，
          你現在拿在手上。<strong>世界是機率的</strong>——
          去看，然後去算。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .parts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .pt { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pt-n { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
    .pt-t { font-size: 14px; font-weight: 700; color: var(--accent); margin: 4px 0 6px; }
    .pt p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .insights { display: grid; gap: 8px; margin: 10px 0; }
    .ins { display: grid; grid-template-columns: 40px 1fr; gap: 10px; align-items: start; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .ins-n { font-size: 20px; }
    .ins-b { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .ins-b strong { color: var(--accent); }

    .future { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 10px 0; }
    .fu { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .fu-n { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
    .fu p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .closing { padding: 18px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; text-align: center; }
    .closing h4 { margin-top: 0; }
    .closing p { margin: 6px 0 0; font-size: 14px; color: var(--text); line-height: 1.7; }
    .closing strong { color: var(--accent); }
  `,
})
export class ProbCh6FinaleComponent {}
