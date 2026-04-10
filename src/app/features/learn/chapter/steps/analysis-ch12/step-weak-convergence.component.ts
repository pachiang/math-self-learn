import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-weak-convergence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="弱收斂" subtitle="§12.6">
      <p>
        <strong>強收斂</strong>：||fₙ − f|| → 0（範數距離趨向零）。
      </p>
      <p>
        <strong>弱收斂</strong>：⟨fₙ, g⟩ → ⟨f, g⟩ 對所有 g ∈ H。
        記作 fₙ ⇀ f。
      </p>
      <p>
        弱收斂比強收斂<strong>弱</strong>（強 → 弱，但反過來不成立）。
        但弱收斂有一個關鍵優勢：<strong>有界列一定有弱收斂子列</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="強收斂 vs 弱收斂">
      <div class="compare-cards">
        <div class="cc strong-card">
          <div class="cc-title">強收斂</div>
          <div class="cc-def">||fₙ − f|| → 0</div>
          <div class="cc-meaning">函數本身越來越接近</div>
          <div class="cc-example">fₙ = f + (1/n)g → f</div>
        </div>
        <div class="cc weak-card">
          <div class="cc-title">弱收斂</div>
          <div class="cc-def">⟨fₙ, g⟩ → ⟨f, g⟩ ∀g</div>
          <div class="cc-meaning">「從每個角度看」都趨近</div>
          <div class="cc-example">eₙ = √2 sin(nπx) ⇀ 0<br />（但 ||eₙ|| = 1 不趨向 0）</div>
        </div>
      </div>

      <div class="bw-analog">
        <div class="bwa-title">弱版 Bolzano-Weierstrass</div>
        <div class="bwa-body">
          <p>
            有限維：有界列 → 有強收斂子列（BW）。<br />
            無限維：有界列 → <strong>不一定</strong>有強收斂子列（單位球不緊緻）。<br />
            但：有界列 → <strong>一定有弱收斂子列</strong>（Eberlein-Šmulian）。
          </p>
          <p>
            這是變分法和 PDE 弱解理論的基礎——
            先找弱極限，再證明它滿足方程。
          </p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節預覽<strong>緊算子</strong>——連接 Hilbert 空間和線代特徵值理論的橋樑。</p>
    </app-prose-block>
  `,
  styles: `
    .compare-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    @media (max-width: 500px) { .compare-cards { grid-template-columns: 1fr; } }
    .cc { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      &.strong-card { background: rgba(90,138,90,0.04); border-color: rgba(90,138,90,0.3); }
      &.weak-card { background: rgba(110,138,168,0.04); border-color: rgba(110,138,168,0.3); } }
    .cc-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .cc-def { font-size: 13px; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .cc-meaning { font-size: 12px; color: var(--text-secondary); }
    .cc-example { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;
      margin-top: 8px; padding: 6px; background: var(--bg); border-radius: 4px; }
    .bw-analog { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .bwa-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .bwa-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; } strong { color: var(--text); } }
  `,
})
export class StepWeakConvergenceComponent {}
