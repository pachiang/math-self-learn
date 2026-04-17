import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-hausdorff',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="分離公理：T₁ 與 Hausdorff" subtitle="§2.7">
      <p>
        不是所有拓撲空間都「好用」。<strong>分離公理</strong>保證點之間可以被開集「隔開」：
      </p>
    </app-prose-block>

    <app-challenge-card prompt="從 T₀ 到 T₄：越來越嚴格的分離要求">
      <div class="sep-stack">
        <div class="sep-card">
          <div class="sep-name">T₁</div>
          <div class="sep-def">對任意 x ≠ y，存在開集 U 含 x 不含 y</div>
          <div class="sep-equiv">等價：每個單點集是閉集</div>
        </div>
        <div class="sep-card highlight">
          <div class="sep-name">T₂ (Hausdorff)</div>
          <div class="sep-def">對任意 x ≠ y，存在<strong>不相交</strong>的開集 U ∋ x, V ∋ y</div>
          <div class="sep-equiv">用兩個開集把兩個點「完全隔開」</div>
          <div class="sep-why">
            <strong>為什麼重要</strong>：保證極限唯一。在非 Hausdorff 空間裡，
            數列可以同時收斂到多個不同的點！
          </div>
        </div>
      </div>

      <svg viewBox="0 0 300 120" class="haus-svg">
        <!-- Hausdorff: two separated open sets -->
        <circle cx="100" cy="60" r="35" fill="rgba(90,138,90,0.1)" stroke="#5a8a5a" stroke-width="1.5" />
        <circle cx="200" cy="60" r="35" fill="rgba(110,138,168,0.1)" stroke="#6e8aa8" stroke-width="1.5" />
        <circle cx="100" cy="60" r="4" fill="var(--accent)" />
        <circle cx="200" cy="60" r="4" fill="var(--accent)" />
        <text x="100" y="55" text-anchor="middle" fill="var(--accent)" font-size="10" font-weight="700">x</text>
        <text x="200" y="55" text-anchor="middle" fill="var(--accent)" font-size="10" font-weight="700">y</text>
        <text x="100" y="105" text-anchor="middle" fill="#5a8a5a" font-size="9">U</text>
        <text x="200" y="105" text-anchor="middle" fill="#6e8aa8" font-size="9">V</text>
        <text x="150" y="65" text-anchor="middle" fill="var(--text-muted)" font-size="9">U ∩ V = ∅</text>
      </svg>

      <div class="examples">
        <div class="ex-row ok">R（標準拓撲）→ Hausdorff ✓</div>
        <div class="ex-row ok">所有度量空間 → Hausdorff ✓</div>
        <div class="ex-row bad">R（餘有限拓撲）→ T₁ 但<strong>不是</strong> Hausdorff</div>
        <div class="ex-row bad">R（密著拓撲）→ 連 T₁ 都不是</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        大部分「自然」的空間（度量空間、流形、CW 複形）都是 Hausdorff 的。
        但代數幾何裡的 Zariski 拓撲通常不是——那裡「開集太少了」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .sep-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
    .sep-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      &.highlight { border: 2px solid var(--accent); background: var(--accent-10); } }
    .sep-name { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .sep-def { font-size: 13px; color: var(--text); margin: 4px 0; }
    .sep-def strong { color: var(--accent); }
    .sep-equiv { font-size: 11px; color: var(--text-muted); }
    .sep-why { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-secondary); }
    .sep-why strong { color: var(--accent); }
    .haus-svg { width: 100%; max-width: 300px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .examples { display: flex; flex-direction: column; gap: 4px; }
    .ex-row { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-family: 'JetBrains Mono', monospace;
      &.ok { background: rgba(90,138,90,0.06); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.06); color: #a05a5a; }
      strong { font-weight: 700; } }
  `,
})
export class StepHausdorffComponent {}
