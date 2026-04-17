import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { SURFACES, surfaceArea } from './analysis-ch16-util';

@Component({
  selector: 'app-step-surface-area',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="曲面面積" subtitle="§16.2">
      <p>
        曲面面積 = 每個小平行四邊形面積之和：
      </p>
      <p class="formula">A(S) = ∬ |rᵤ × rᵥ| du dv</p>
      <p>
        rᵤ × rᵥ 是兩個切向量的<strong>叉積</strong>——它的長度就是那個小平行四邊形的面積，
        方向就是<strong>法向量</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選曲面，看數值面積逼近">
      <div class="fn-tabs">
        @for (s of surfaces; track s.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ s.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">分割精度 N = {{ N() }}</span>
        <input type="range" min="5" max="60" step="5" [value]="N()"
               (input)="N.set(+($any($event.target)).value)" class="sl" />
      </div>

      <div class="result-box">
        <div class="rb-row">
          <span class="rb-label">{{ surfaces[sel()].name }}</span>
          <span class="rb-val">A ≈ {{ area().toFixed(4) }}</span>
        </div>
        <div class="rb-row exact">
          <span class="rb-label">精確值</span>
          <span class="rb-val">{{ exactAreas[sel()] }}</span>
        </div>
      </div>

      <div class="note">
        球面面積 = 4π ≈ 12.566。上半球 = 2π ≈ 6.283。
        這和 Ch14 的 Jacobian 是同一個想法——|rᵤ × rᵥ| 是面積的「拉伸因子」。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>有了面積微元 dS = |rᵤ × rᵥ| du dv，下一節定義<strong>標量曲面積分</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .cl { font-size: 13px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 110px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .result-box { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
    .rb-row { display: flex; justify-content: space-between; padding: 12px 16px;
      border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; }
      &.exact { background: var(--accent-10); } }
    .rb-label { font-size: 13px; color: var(--text-muted); }
    .rb-val { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; }
  `,
})
export class StepSurfaceAreaComponent {
  readonly surfaces = SURFACES;
  readonly sel = signal(1);
  readonly N = signal(30);
  readonly exactAreas = ['2π ≈ 6.2832', '4π ≈ 12.5664', '≈ 5.33', '2π ≈ 6.2832'];

  readonly area = computed(() => surfaceArea(SURFACES[this.sel()], this.N(), this.N()));
}
