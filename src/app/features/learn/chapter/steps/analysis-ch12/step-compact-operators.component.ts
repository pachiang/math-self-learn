import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-compact-operators',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="緊算子入門" subtitle="§12.7">
      <p>
        有限維矩陣有<strong>特徵值分解</strong>（線代 Ch6）。
        無限維怎麼辦？一般的算子太「野」了，但<strong>緊算子</strong>幾乎跟矩陣一樣好。
      </p>
      <p>
        <strong>緊算子</strong> T: H → H：把有界集映射成「相對緊」集
        （像的閉包是緊的）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="緊算子的譜定理——無限維的特徵值分解">
      <div class="spectral-card">
        <div class="sc-title">Hilbert-Schmidt 譜定理（自伴緊算子）</div>
        <div class="sc-formula">
          T 自伴 + 緊 ⟹ T 有可數多個實特徵值 λₙ → 0，<br />
          對應的特徵向量構成 H 的<strong>正交基底</strong>
        </div>
        <div class="sc-note">
          這就是線代 Ch7 譜定理（對稱矩陣 = QΛQᵀ）的<strong>無限維推廣</strong>。
        </div>
      </div>

      <div class="examples">
        <div class="ex-title">重要的緊算子</div>
        <div class="ex-grid">
          <div class="ex-card">
            <div class="ec-name">積分算子</div>
            <div class="ec-def">(Tf)(x) = ∫ K(x,y) f(y) dy</div>
            <div class="ec-note">核函數 K ∈ L² → T 是緊的</div>
          </div>
          <div class="ex-card">
            <div class="ec-name">Sturm-Liouville</div>
            <div class="ec-def">−(pu')' + qu = λwu</div>
            <div class="ec-note">逆算子是緊的 → 有可數多特徵值</div>
          </div>
          <div class="ex-card">
            <div class="ec-name">有限秩算子</div>
            <div class="ec-def">像是有限維的</div>
            <div class="ec-note">緊算子 = 有限秩的極限</div>
          </div>
        </div>
      </div>

      <div class="connection">
        <div class="cn-title">跟線代的連結</div>
        <div class="cn-body">
          有限維矩陣 = 所有算子都是緊的 → 總有特徵值分解。<br />
          無限維 → 只有緊算子「像矩陣」→ 有好的譜理論。<br />
          這就是<strong>泛函分析</strong>的起點。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看 Hilbert 空間在物理裡最深刻的應用——<strong>量子力學的語言</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .spectral-card { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); margin-bottom: 14px; }
    .sc-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .sc-formula { font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      strong { color: var(--text); } }
    .sc-note { font-size: 12px; color: var(--text-muted); margin-top: 6px;
      strong { color: var(--accent); } }
    .examples { margin-bottom: 14px; }
    .ex-title { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .ex-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    @media (max-width: 600px) { .ex-grid { grid-template-columns: 1fr; } }
    .ex-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .ec-name { font-size: 13px; font-weight: 700; color: var(--text); }
    .ec-def { font-size: 11px; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .ec-note { font-size: 10px; color: var(--text-muted); }
    .connection { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .cn-title { font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
    .cn-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--accent); } }
  `,
})
export class StepCompactOperatorsComponent {}
