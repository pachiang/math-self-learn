import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { dualBasis2d, levelLinePath, applyFunctional } from './dual-util';

@Component({
  selector: 'app-step-dual-basis',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="對偶基底" subtitle="§18.3">
      <p>
        給定 V 的一組基底 {{ '{' }}e₁, e₂{{ '}' }}，
        <strong>對偶基底</strong> {{ '{' }}e₁*, e₂*{{ '}' }} 定義為：
      </p>
      <p class="formula">eᵢ*(eⱼ) = δᵢⱼ（i=j 時 1，否則 0）</p>
      <p>
        e₁* 是「提取第 1 個座標」的泛函：對 e₁ 輸出 1，對 e₂ 輸出 0。
      </p>
      <p>
        矩陣語言：如果基底向量是 P 的行，對偶基底就是 <strong>P⁻¹ 的列</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動基底向量 e₁ 和 e₂，看對偶基底怎麼跟著變">
      <div class="ctrl-row">
        <div class="ctrl">
          <span class="cl">e₁ = (</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="e1x()"
                 (input)="e1x.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ e1x().toFixed(1) }}</span>
          <span class="cl">,</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="e1y()"
                 (input)="e1y.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ e1y().toFixed(1) }}</span>
          <span class="cl">)</span>
        </div>
        <div class="ctrl">
          <span class="cl">e₂ = (</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="e2x()"
                 (input)="e2x.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ e2x().toFixed(1) }}</span>
          <span class="cl">,</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="e2y()"
                 (input)="e2y.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ e2y().toFixed(1) }}</span>
          <span class="cl">)</span>
        </div>
      </div>

      <svg viewBox="-3 -3 6 6" class="dual-svg">
        <!-- Level sets of e1* -->
        @if (dualVecs()) {
          @for (c of levels; track c) {
            <path [attr.d]="levelPath(0, c)" fill="none"
                  stroke="#c8983b" stroke-width="0.015" stroke-opacity="0.3" />
          }
          @for (c of levels; track c) {
            <path [attr.d]="levelPath(1, c)" fill="none"
                  stroke="#5a7faa" stroke-width="0.015" stroke-opacity="0.3" />
          }
        }

        <!-- Basis vectors e1, e2 -->
        <line x1="0" y1="0" [attr.x2]="e1x()" [attr.y2]="e1y()"
              stroke="#c8983b" stroke-width="0.06" />
        <circle [attr.cx]="e1x()" [attr.cy]="e1y()" r="0.08" fill="#c8983b" />
        <text [attr.x]="e1x() + 0.15" [attr.y]="e1y() - 0.1" class="vec-label" fill="#c8983b">e₁</text>

        <line x1="0" y1="0" [attr.x2]="e2x()" [attr.y2]="e2y()"
              stroke="#5a7faa" stroke-width="0.06" />
        <circle [attr.cx]="e2x()" [attr.cy]="e2y()" r="0.08" fill="#5a7faa" />
        <text [attr.x]="e2x() + 0.15" [attr.y]="e2y() - 0.1" class="vec-label" fill="#5a7faa">e₂</text>

        <!-- Dual basis direction arrows (dashed) -->
        @if (dualVecs()) {
          <line x1="0" y1="0" [attr.x2]="dualVecs()![0][0] * 1.5" [attr.y2]="dualVecs()![0][1] * 1.5"
                stroke="#c8983b" stroke-width="0.04" stroke-dasharray="0.1 0.07" />
          <text [attr.x]="dualVecs()![0][0] * 1.6" [attr.y]="dualVecs()![0][1] * 1.6"
                class="vec-label" fill="#c8983b">e₁*</text>

          <line x1="0" y1="0" [attr.x2]="dualVecs()![1][0] * 1.5" [attr.y2]="dualVecs()![1][1] * 1.5"
                stroke="#5a7faa" stroke-width="0.04" stroke-dasharray="0.1 0.07" />
          <text [attr.x]="dualVecs()![1][0] * 1.6" [attr.y]="dualVecs()![1][1] * 1.6"
                class="vec-label" fill="#5a7faa">e₂*</text>
        }
      </svg>

      <div class="pairing-table">
        <div class="pt-title">配對驗證：eᵢ*(eⱼ) = δᵢⱼ</div>
        @if (dualVecs()) {
          <table class="pt">
            <tr><th></th><th>e₁</th><th>e₂</th></tr>
            <tr>
              <th>e₁*</th>
              <td [class.one]="Math.abs(pair(0,0) - 1) < 0.01">{{ pair(0,0).toFixed(2) }}</td>
              <td [class.zero]="Math.abs(pair(0,1)) < 0.01">{{ pair(0,1).toFixed(2) }}</td>
            </tr>
            <tr>
              <th>e₂*</th>
              <td [class.zero]="Math.abs(pair(1,0)) < 0.01">{{ pair(1,0).toFixed(2) }}</td>
              <td [class.one]="Math.abs(pair(1,1) - 1) < 0.01">{{ pair(1,1).toFixed(2) }}</td>
            </tr>
          </table>
        }
      </div>

      <div class="insight">
        觀察：e₁* 的等值線<strong>平行於 e₂</strong>（因為 e₁*(e₂)=0），
        而且 e₁*(e₁)=1 的那條線剛好通過 e₁ 的尖端。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        當基底正交時，對偶基底 = 同方向。但基底歪了之後，
        對偶基底指向<strong>不同的方向</strong>——
        這就是「共變」(covariant) 和「反變」(contravariant) 的來源。
      </p>
      <p>
        下一節揭開最深的秘密：<strong>轉置的真正意義</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .ctrl { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .cl { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .sl { width: 70px; accent-color: var(--accent); }
    .cv { font-size: 12px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 28px; }

    .dual-svg { width: 100%; max-width: 360px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .vec-label { font-size: 0.2px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .pairing-table { margin-bottom: 12px; }
    .pt-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .pt { border-collapse: collapse; margin: 0 auto; }
    .pt th { padding: 6px 12px; font-size: 12px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); }
    .pt td { padding: 6px 16px; font-size: 14px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      text-align: center; color: var(--text-muted);
      &.one { background: rgba(90, 138, 90, 0.15); color: #5a8a5a; }
      &.zero { background: rgba(200, 152, 59, 0.08); color: #c8983b; } }

    .insight { padding: 10px 14px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--text); } }
  `,
})
export class StepDualBasisComponent {
  readonly Math = Math;
  readonly e1x = signal(1.5);
  readonly e1y = signal(0.3);
  readonly e2x = signal(0.2);
  readonly e2y = signal(1.2);
  readonly levels = [-2, -1, 0, 1, 2];

  readonly dualVecs = computed(() =>
    dualBasis2d([this.e1x(), this.e1y()], [this.e2x(), this.e2y()]),
  );

  levelPath(idx: number, c: number): string {
    const d = this.dualVecs();
    if (!d) return '';
    return levelLinePath(d[idx][0], d[idx][1], c, 3);
  }

  pair(i: number, j: number): number {
    const d = this.dualVecs();
    if (!d) return 0;
    const e = j === 0 ? [this.e1x(), this.e1y()] : [this.e2x(), this.e2y()];
    return applyFunctional(d[i], e);
  }
}
