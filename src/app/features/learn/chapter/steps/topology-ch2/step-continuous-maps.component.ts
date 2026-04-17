import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-continuous-maps',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="拓撲版的連續" subtitle="§2.1">
      <p>在度量空間裡，連續的 ε-δ 定義可以改寫成：</p>
      <p class="formula">f 連續 ⟺ 開集的原像是開集</p>
      <p>
        這個等價形式<strong>不需要距離</strong>！所以直接拿來當拓撲空間裡的定義：
      </p>
      <p class="formula def">
        f: (X, τ_X) → (Y, τ_Y) 連續 ⟺ ∀V ∈ τ_Y, f⁻¹(V) ∈ τ_X
      </p>
      <p>
        「Y 裡的開集拉回來還是 X 裡的開集」——就這麼簡單。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較三種「連續」的定義——它們在度量空間裡等價">
      <div class="equiv-stack">
        <div class="eq-card">
          <div class="eq-ver">微積分版</div>
          <div class="eq-def">∀ε > 0, ∃δ > 0: |x−a| &lt; δ ⇒ |f(x)−f(a)| &lt; ε</div>
          <div class="eq-need">需要：距離</div>
        </div>
        <div class="eq-card">
          <div class="eq-ver">度量空間版</div>
          <div class="eq-def">∀ε > 0, ∃δ > 0: d(x,a) &lt; δ ⇒ d(f(x),f(a)) &lt; ε</div>
          <div class="eq-need">需要：度量</div>
        </div>
        <div class="eq-card highlight">
          <div class="eq-ver">拓撲版</div>
          <div class="eq-def">V ∈ τ_Y ⇒ f⁻¹(V) ∈ τ_X</div>
          <div class="eq-need">需要：只有開集！</div>
        </div>
      </div>

      <div class="note">
        拓撲版最抽象，但也最一般。它在沒有距離的空間（如 Zariski 拓撲、弱拓撲）裡依然有意義。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        等價刻劃：f 連續 ⟺ 閉集的原像是閉集 ⟺ 對所有 A ⊂ X, f(cl(A)) ⊂ cl(f(A))。
        多條路通往同一個概念。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.def { border: 2px solid var(--accent); } }
    .equiv-stack { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .eq-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      &.highlight { border: 2px solid var(--accent); background: var(--accent-10); } }
    .eq-ver { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }
    .eq-def { font-size: 13px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .eq-need { font-size: 11px; color: var(--text-muted); }
    .note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; }
  `,
})
export class StepContinuousMapsComponent {}
