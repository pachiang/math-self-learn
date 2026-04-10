import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-double-dual',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="雙對偶 V** 與自然同構" subtitle="§18.7">
      <p>
        V* 的對偶空間叫 <strong>V**</strong>（雙對偶）。V** 的元素是「吃泛函的泛函」——
        給一個 φ ∈ V*，吐出一個數。
      </p>
      <p>
        驚人的是：V 和 V** 之間有一個<strong>自然</strong>（不需要選基底的）同構：
      </p>
      <p class="formula">v ↦ ev_v，其中 ev_v(φ) = φ(v)</p>
      <p>
        「把 v 送到『在 v 點求值』這個運算」。這不需要基底、不需要內積——
        是完全自然的。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三層結構：V → V* → V**">
      <div class="triple">
        <div class="layer">
          <div class="l-title v-col">V（向量）</div>
          <div class="l-icon">→</div>
          <div class="l-desc">
            元素：箭頭 v<br />
            例：v = [2, 1]ᵀ
          </div>
        </div>

        <div class="arrow-down">
          <div class="ad-label iso">V → V*<br /><span class="needs">需要內積或基底</span></div>
        </div>

        <div class="layer">
          <div class="l-title vstar-col">V*（泛函）</div>
          <div class="l-icon">φ</div>
          <div class="l-desc">
            元素：列向量 φ（等值線族）<br />
            例：φ = [3, −1] → φ(v) = 3·2 + (−1)·1 = 5
          </div>
        </div>

        <div class="arrow-down">
          <div class="ad-label iso">V* → V**<br /><span class="needs">需要內積或基底</span></div>
        </div>

        <div class="layer highlight">
          <div class="l-title vss-col">V**（泛函的泛函）</div>
          <div class="l-icon">ev</div>
          <div class="l-desc">
            元素：「在某個 v 求值」的機器<br />
            例：ev_v(φ) = φ(v) = 5
          </div>
        </div>
      </div>

      <div class="natural-box">
        <div class="nb-title">V ≅ V** 是自然的！</div>
        <div class="nb-body">
          <div class="nb-row">
            <span class="nb-map natural">V → V**</span>
            <span class="nb-desc">v ↦ ev_v：不需要任何選擇</span>
            <span class="nb-tag ok">✓ 自然同構</span>
          </div>
          <div class="nb-row">
            <span class="nb-map">V → V*</span>
            <span class="nb-desc">需要內積 ⟨·,·⟩ 或基底選擇</span>
            <span class="nb-tag warn">✗ 不自然</span>
          </div>
        </div>
      </div>

      <div class="philosophy">
        <div class="ph-title">哲學解讀</div>
        <p>
          一個向量 v「就是」它所有可能的測量結果。
          如果你知道 φ(v) 對所有 φ 的值，你就完全知道 v 了。
          這就是 V ≅ V** 在說的事。
        </p>
        <p>
          V* 是「測量工具的空間」，V** 是「被測量對象的空間」。
          而向量本身——就是被測量的對象。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block title="第十八章總結">
      <ul>
        <li><strong>線性泛函</strong>：列向量 = 吃行向量吐數字的規則（§18.1）</li>
        <li><strong>對偶空間 V*</strong>：所有線性泛函構成的向量空間，dim = dim V（§18.2）</li>
        <li><strong>對偶基底</strong>：eᵢ*(eⱼ) = δᵢⱼ，是 P⁻¹ 的列（§18.3）</li>
        <li><strong>轉置 = 對偶映射</strong>：(T*φ)(v) = φ(Tv)，這是 Aᵀ 的定義（§18.4）</li>
        <li><strong>零化子</strong>：不需要內積的「正交補」，解釋四個子空間（§18.5）</li>
        <li><strong>協變量</strong>：梯度是泛函不是向量，向量需要度量才能畫箭頭（§18.6）</li>
        <li><strong>雙對偶</strong>：V ≅ V** 是唯一的自然同構（§18.7）</li>
      </ul>
      <p>
        對偶空間看起來抽象，但它回答了一個具體的問題：
        <strong>轉置到底是什麼？</strong>
        不是「把矩陣翻過來」，而是「把測量工具拉回去」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .triple { display: flex; flex-direction: column; gap: 0; margin-bottom: 14px; }
    .layer { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); display: grid; grid-template-columns: auto auto 1fr;
      gap: 12px; align-items: center;
      &.highlight { border-color: var(--accent); background: var(--accent-10); } }
    .l-title { font-size: 13px; font-weight: 700; writing-mode: horizontal-tb;
      &.v-col { color: #5a7faa; } &.vstar-col { color: #c8983b; } &.vss-col { color: var(--accent); } }
    .l-icon { font-size: 16px; font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
    .l-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.6;
      font-family: 'JetBrains Mono', monospace; }

    .arrow-down { text-align: center; padding: 6px 0; }
    .ad-label { font-size: 11px; color: var(--text-muted);
      &.iso .needs { color: #a05a5a; font-size: 10px; } }

    .natural-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 14px; }
    .nb-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 10px; }
    .nb-row { display: flex; align-items: center; gap: 12px; padding: 6px 0;
      border-bottom: 1px solid var(--border); flex-wrap: wrap;
      &:last-child { border-bottom: none; } }
    .nb-map { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 80px;
      &.natural { color: #5a8a5a; } }
    .nb-desc { font-size: 12px; color: var(--text-secondary); flex: 1; }
    .nb-tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;
      &.ok { background: rgba(90, 138, 90, 0.12); color: #5a8a5a; }
      &.warn { background: rgba(160, 90, 90, 0.1); color: #a05a5a; } }

    .philosophy { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .ph-title { font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; }
    .philosophy p { font-size: 12px; color: var(--text-secondary); line-height: 1.7; margin: 6px 0; }
  `,
})
export class StepDoubleDualComponent {}
