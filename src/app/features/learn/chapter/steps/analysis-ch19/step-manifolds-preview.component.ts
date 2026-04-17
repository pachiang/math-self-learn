import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-manifolds-preview',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="展望：流形上的微積分" subtitle="§19.9">
      <p>
        微分形式的真正威力：它們不需要「座標」就能定義。
        在彎曲的空間（<strong>流形</strong>）上，微分形式和外微分依然有意義——
        而傳統的 grad、curl、div 需要座標才能寫出來。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="微分形式打開的大門">
      <div class="door-list">
        <div class="door">
          <div class="d-icon">🌐</div>
          <div class="d-title">微分幾何</div>
          <div class="d-body">在彎曲流形上做微積分。廣義相對論的數學語言。</div>
        </div>
        <div class="door">
          <div class="d-icon">🔗</div>
          <div class="d-title">de Rham 上同調</div>
          <div class="d-body">用微分形式計算拓撲不變量。分析 ⇔ 拓撲的深刻對應。</div>
        </div>
        <div class="door">
          <div class="d-icon">⚡</div>
          <div class="d-title">Maxwell 方程</div>
          <div class="d-body">電磁學的四個方程寫成兩行：dF = 0，d*F = J。優雅得令人窒息。</div>
        </div>
        <div class="door">
          <div class="d-icon">🎯</div>
          <div class="d-title">辛幾何 / Hamilton 力學</div>
          <div class="d-body">相空間上的 2-form ω = dp∧dq。力學的幾何本質。</div>
        </div>
      </div>

      <div class="timeline">
        <div class="tl-title">你走過的路</div>
        <div class="tl-row"><span class="tl-ch">Ch1-8</span> 實數 → 極限 → 度量空間（打地基）</div>
        <div class="tl-row"><span class="tl-ch">Ch9-12</span> 測度 → Lebesgue → Lᵖ → Hilbert（建框架）</div>
        <div class="tl-row"><span class="tl-ch">Ch13-16</span> 多變數微積分 → Green → Stokes（向量分析）</div>
        <div class="tl-row"><span class="tl-ch">Ch17-18</span> Fourier → 分佈（廣義函數）</div>
        <div class="tl-row highlight"><span class="tl-ch">Ch19</span> 微分形式 → 大統一（你在這裡）</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        從 Ch1 有理數的一個洞，到 Ch19 任意維度上的 ∫_∂Ω ω = ∫_Ω dω——
        實分析的故事畫了一個巨大的圓。
        <strong>嚴格性不是束縛，而是自由</strong>——因為嚴格，所以能推廣到任何維度、任何形狀。
      </p>
    </app-prose-block>
  `,
  styles: `
    .door-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .door { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); }
    .d-icon { font-size: 20px; margin-bottom: 4px; }
    .d-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .d-body { font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
    .timeline { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .tl-title { padding: 8px 12px; font-size: 12px; font-weight: 700; color: var(--accent);
      background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .tl-row { padding: 8px 12px; font-size: 12px; color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.highlight { background: var(--accent-10); font-weight: 600; color: var(--accent); } }
    .tl-ch { font-weight: 700; color: var(--accent); margin-right: 8px; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepManifoldsPreviewComponent {}
