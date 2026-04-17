import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { VECTOR_FIELDS, CURVES, lineIntegral } from './analysis-ch15-util';

@Component({
  selector: 'app-step-conservative-fields',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="保守場與路徑無關性" subtitle="§15.4">
      <p>
        若 F = ∇φ（某個純量函數 φ 的梯度），則 F 是<strong>保守場</strong>：
      </p>
      <p class="formula">∫_C F · dr = φ(B) − φ(A)（只看端點！）</p>
      <p>
        三個等價條件：① F = ∇φ ② 閉曲線積分 = 0 ③ 積分路徑無關
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較保守場 vs 非保守場：閉曲線積分">
      <div class="comparison">
        <div class="cmp-col">
          <div class="cmp-title conservative">保守場：F = (x, y)</div>
          <div class="cmp-val">∮ F·dr = {{ conservativeWork().toFixed(4) }}</div>
          <div class="cmp-note">≈ 0（閉路做功為零）</div>
        </div>
        <div class="vs">vs</div>
        <div class="cmp-col">
          <div class="cmp-title nonconservative">非保守場：F = (−y, x)</div>
          <div class="cmp-val">∮ F·dr = {{ nonconservativeWork().toFixed(4) }}</div>
          <div class="cmp-note">≈ 2π（繞一圈做正功！）</div>
        </div>
      </div>

      <svg viewBox="-2 -2 4 4" class="cmp-svg">
        @for (g of [-1,0,1]; track g) {
          <line [attr.x1]="g" y1="-2" [attr.x2]="g" y2="2" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2" [attr.y1]="g" x2="2" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- Unit circle -->
        <circle cx="0" cy="0" r="1" fill="none" stroke="var(--accent)" stroke-width="0.04" />

        <!-- Direction arrows -->
        @for (a of circleArrows; track $index) {
          <line [attr.x1]="a.x" [attr.y1]="-a.y"
                [attr.x2]="a.x + a.dx * 0.15" [attr.y2]="-(a.y + a.dy * 0.15)"
                stroke="#bf6e6e" stroke-width="0.03" />
          <circle [attr.cx]="a.x + a.dx * 0.15" [attr.cy]="-(a.y + a.dy * 0.15)"
                  r="0.03" fill="#bf6e6e" />
        }
      </svg>

      <div class="equivalence">
        <div class="eq-row"><span class="eq-num">①</span> F = ∇φ（存在勢函數）</div>
        <div class="eq-row"><span class="eq-arrow">⇔</span></div>
        <div class="eq-row"><span class="eq-num">②</span> ∮_C F · dr = 0（閉路積分為零）</div>
        <div class="eq-row"><span class="eq-arrow">⇔</span></div>
        <div class="eq-row"><span class="eq-num">③</span> ∫_C F · dr 路徑無關（只看端點）</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>如何判斷保守？在<strong>單連通區域</strong>上，curl F = 0 ⇔ 保守。下一節定義 curl。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .comparison { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .cmp-col { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border); text-align: center; }
    .cmp-title { font-size: 12px; font-weight: 600; margin-bottom: 6px;
      &.conservative { color: #5a8a5a; } &.nonconservative { color: #a05a5a; } }
    .cmp-val { font-size: 18px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .cmp-note { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .vs { font-size: 16px; font-weight: 700; color: var(--text-muted); }
    .cmp-svg { width: 100%; max-width: 300px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .equivalence { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); }
    .eq-row { font-size: 13px; font-family: 'JetBrains Mono', monospace; padding: 4px 0; color: var(--text); }
    .eq-num { font-weight: 700; color: var(--accent); margin-right: 8px; }
    .eq-arrow { color: var(--accent); font-weight: 700; display: block; text-align: center; }
  `,
})
export class StepConservativeFieldsComponent {
  readonly conservativeWork = computed(() => lineIntegral(VECTOR_FIELDS[1].F, CURVES[0]));
  readonly nonconservativeWork = computed(() => lineIntegral(VECTOR_FIELDS[0].F, CURVES[0]));

  readonly circleArrows = (() => {
    const result: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const t = (2 * Math.PI * i) / 8;
      const x = Math.cos(t), y = Math.sin(t);
      result.push({ x, y, dx: -Math.sin(t), dy: Math.cos(t) });
    }
    return result;
  })();
}
