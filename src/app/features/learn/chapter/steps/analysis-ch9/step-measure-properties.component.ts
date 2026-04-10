import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-measure-properties',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Lebesgue 測度的性質" subtitle="§9.4">
      <p>Lebesgue 測度 m 在可測集上滿足以下性質：</p>
    </app-prose-block>

    <app-challenge-card prompt="四大性質">
      <div class="props">
        <div class="prop-card">
          <div class="pc-title">① 可數可加性</div>
          <div class="pc-formula">m(∪Eₙ) = Σm(Eₙ)（不相交時）</div>
          <div class="pc-desc">這是測度最核心的性質。Riemann 做不到——Lebesgue 可以。</div>
        </div>
        <div class="prop-card">
          <div class="pc-title">② 平移不變</div>
          <div class="pc-formula">m(E + x) = m(E)</div>
          <div class="pc-desc">把集合平移不改變大小。「長度」應該跟位置無關。</div>
        </div>
        <div class="prop-card">
          <div class="pc-title">③ 區間的測度 = 長度</div>
          <div class="pc-formula">m([a,b]) = b − a</div>
          <div class="pc-desc">Lebesgue 測度是「長度」的推廣——在區間上跟直覺一致。</div>
        </div>
        <div class="prop-card">
          <div class="pc-title">④ 單調性</div>
          <div class="pc-formula">A ⊂ B → m(A) ≤ m(B)</div>
          <div class="pc-desc">子集不能比包含它的集合更大。</div>
        </div>
      </div>

      <div class="key-diff">
        <div class="kd-title">跟外測度的關鍵差別</div>
        <div class="kd-body">
          外測度 m* 只有<strong>次可加</strong>：m*(∪Eₙ) ≤ Σm*(Eₙ)。<br />
          限制到可測集後，不等號變等號——這就是 Carathéodory 條件的威力。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看一個重要的特殊情形——<strong>測度零集</strong>。它讓我們精確描述「可以忽略不計」的集合。</p>
    </app-prose-block>
  `,
  styles: `
    .props { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    @media (max-width: 500px) { .props { grid-template-columns: 1fr; } }
    .prop-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .pc-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .pc-formula { font-size: 13px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; padding: 6px 10px; margin: 4px 0;
      background: var(--accent-10); border-radius: 4px; }
    .pc-desc { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
    .key-diff { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .kd-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .kd-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
  `,
})
export class StepMeasurePropertiesComponent {}
