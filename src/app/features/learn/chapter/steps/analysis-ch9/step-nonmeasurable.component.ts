import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-nonmeasurable',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="不可測集" subtitle="§9.6">
      <p>
        並非所有集合都可測。<strong>Vitali 集</strong>（1905）是第一個被構造出的不可測集。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Vitali 的構造（需要選擇公理）">
      <div class="proof-steps">
        <div class="ps">
          <div class="ps-num">1</div>
          <div class="ps-body">
            在 [0,1] 上定義等價關係：x ∼ y ⟺ x − y ∈ Q。<br />
            每個等價類是 Q 的一個平移（如 √2 + Q）。
          </div>
        </div>
        <div class="ps">
          <div class="ps-num">2</div>
          <div class="ps-body">
            <strong>選擇公理</strong>：從每個等價類裡挑一個代表元，組成集合 V。
          </div>
        </div>
        <div class="ps">
          <div class="ps-num">3</div>
          <div class="ps-body">
            考慮 V 的有理平移：Vᵣ = V + r，r ∈ Q ∩ [−1, 1]。<br />
            這些平移<strong>互不相交</strong>（因為不同等價類的代表元不會因有理平移重疊）。
          </div>
        </div>
        <div class="ps">
          <div class="ps-num">4</div>
          <div class="ps-body">
            [0,1] ⊂ ∪Vᵣ ⊂ [−1, 2]。<br />
            如果 V 可測：m(Vᵣ) = m(V)（平移不變），而且 m(∪Vᵣ) = Σm(V)（可數可加）。
          </div>
        </div>
        <div class="ps contradiction">
          <div class="ps-num">!</div>
          <div class="ps-body">
            如果 m(V) = 0 → Σm(V) = 0 → m([0,1]) ≤ 0。矛盾！<br />
            如果 m(V) > 0 → Σm(V) = ∞ → m([−1,2]) = ∞。矛盾！<br />
            <strong>V 不可能有測度。V 是不可測的。</strong>
          </div>
        </div>
      </div>

      <div class="philosophy">
        <div class="ph-title">這告訴我們什麼？</div>
        <div class="ph-body">
          <p>不可能同時滿足：(1) 所有子集可測 (2) 可數可加 (3) 平移不變 (4) m([0,1]) = 1。</p>
          <p>Lebesgue 的選擇：放棄 (1)，接受有些「病態」集合不可測。代價很小——自然出現的集合全部可測。</p>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看<strong>可測函數</strong>——Lebesgue 積分的對象。</p>
    </app-prose-block>
  `,
  styles: `
    .proof-steps { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
    .ps { display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface);
      &.contradiction { border-color: #a05a5a; background: rgba(160,90,90,0.04); } }
    .ps-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; flex-shrink: 0;
      .contradiction & { background: #a05a5a; } }
    .ps-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: var(--text); } }
    .philosophy { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .ph-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .ph-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      p { margin: 6px 0; } }
  `,
})
export class StepNonmeasurableComponent {}
