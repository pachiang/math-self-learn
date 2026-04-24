import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-bayes-ch1-bayes-theorem',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="Bayes 定理：從離散到連續" subtitle="§1.2">
      <p>
        機率論 Ch2 學過離散版的 Bayes：
      </p>
      <div class="centered-eq big">
        P(H | E) = P(E | H) · P(H) / P(E)
      </div>
      <p>
        把 H 換成「參數 θ」、E 換成「觀察到的資料 D」，連續版誕生：
      </p>
      <div class="centered-eq big accent">
        p(θ | D) = p(D | θ) · p(θ) / p(D)
      </div>

      <h4>四個元件，四個名字</h4>
      <table class="terms">
        <thead><tr><th>符號</th><th>名稱</th><th>意思</th></tr></thead>
        <tbody>
          <tr><td><code>p(θ)</code></td><td><strong>先驗 prior</strong></td><td>看資料<em>之前</em>對 θ 的信念</td></tr>
          <tr><td><code>p(D|θ)</code></td><td><strong>概似 likelihood</strong></td><td>若 θ 真，資料長這樣的機率</td></tr>
          <tr><td><code>p(θ|D)</code></td><td><strong>後驗 posterior</strong></td><td>看資料<em>之後</em>對 θ 的信念</td></tr>
          <tr><td><code>p(D)</code></td><td>證據 / 邊際概似</td><td>歸一化常數：∫ p(D|θ) p(θ) dθ</td></tr>
        </tbody>
      </table>

      <h4>最常用的寫法</h4>
      <div class="centered-eq big">
        posterior &nbsp;∝&nbsp; likelihood × prior
      </div>
      <p>
        <code>∝</code> 是「正比於」。分母 <code>p(D)</code> 不含 θ，只是歸一化用——
        很多貝氏計算直接忽略它，最後再歸一化就好。
      </p>

      <div class="key-idea">
        <strong>這條公式就是整個貝氏統計的中心。</strong>
        所有接下來的章節——共軛先驗、MCMC、階層模型——
        都只是在<em>計算這個 posterior</em>。困難的不是公式，是<strong>算出 posterior 的形狀</strong>。
      </div>
    </app-prose-block>

    <app-prose-block subtitle="和機率 Ch2 的連結">
      <h4>Bayes 定理的離散版 vs 連續版</h4>
      <div class="bridge">
        <div class="side">
          <div class="s-head">機率 Ch2（離散）</div>
          <pre class="code-block">
P(疾病 | 陽性)
  = P(陽性 | 疾病) P(疾病)
    / P(陽性)
          </pre>
          <div class="s-note">兩個事件、兩個機率、除法</div>
        </div>
        <div class="side">
          <div class="s-head">貝氏統計（連續）</div>
          <pre class="code-block">
p(θ | D)
  = p(D | θ) p(θ)
    / ∫ p(D|θ') p(θ') dθ'
          </pre>
          <div class="s-note">兩個分佈、積分、歸一化</div>
        </div>
      </div>
      <p>
        <strong>核心結構完全相同</strong>——只是從「單一數字」升級到「整個分佈」。
      </p>
    </app-prose-block>

    <app-prose-block subtitle="核心直覺">
      <h4>貝氏更新是「相信度的相乘」</h4>
      <pre class="update">
起點：p(θ)          「我本來以為」
乘上：p(D | θ)      「若 θ 真，D 長這樣」
得到：p(θ | D)      「現在我以為」
      </pre>

      <h4>三個重要性質</h4>
      <ul class="props">
        <li>
          <strong>先驗主導（prior dominates）</strong>：資料少時，posterior 靠近 prior
        </li>
        <li>
          <strong>概似主導（likelihood dominates）</strong>：資料多時，prior 被洗掉，posterior 靠近 MLE
        </li>
        <li>
          <strong>順序無關</strong>：先看 D₁ 再看 D₂、或反過來、或同時——posterior 相同
          （Bayesian updating 是可交換的）
        </li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        posterior ∝ likelihood × prior——整門課的起點。
        下一節我們動手算一次完整的 Bayes 更新，看三條曲線如何互相作用。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 14px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 12px 0; }
    .centered-eq.big { font-size: 17px; padding: 16px; }
    .centered-eq.accent { background: var(--accent); color: white; font-size: 19px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 16px; margin: 14px 0 6px; }

    .terms { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .terms th, .terms td { padding: 8px 10px; border: 1px solid var(--border); text-align: left; }
    .terms th { background: var(--accent-10); color: var(--accent); font-weight: 700; font-size: 12px; }
    .terms td strong { color: var(--accent); }
    .terms td em { color: var(--text); font-style: normal; font-weight: 600; }

    .bridge { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    .side { padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .s-head { font-size: 12px; font-weight: 700; color: var(--accent); text-align: center; margin-bottom: 6px; }
    .code-block { background: var(--bg); padding: 10px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; color: var(--text); margin: 0; white-space: pre; }
    .s-note { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 4px; font-style: italic; }

    .update { background: var(--bg-surface); padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text); line-height: 1.9; margin: 10px 0; white-space: pre; }

    .props { margin: 6px 0 12px 22px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .props strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class BayesCh1BayesTheoremComponent {}
