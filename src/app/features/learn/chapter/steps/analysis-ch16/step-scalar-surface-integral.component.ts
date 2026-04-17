import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { SURFACES, surfaceIntegralScalar } from './analysis-ch16-util';

@Component({
  selector: 'app-step-scalar-surface-integral',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="標量曲面積分" subtitle="§16.3">
      <p>在曲面上積分一個純量函數 f：</p>
      <p class="formula">∬_S f dS = ∬ f(r(u,v)) |rᵤ × rᵥ| du dv</p>
      <p>
        f = 1 → 面積。f = 密度 → 質量。f = 溫度 → 平均溫度 × 面積。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選函數和曲面，看曲面積分的值">
      <div class="ctrl-grid">
        <div class="ctrl-col">
          <div class="ctrl-label">被積函數</div>
          @for (f of fns; track f.name; let i = $index) {
            <button class="ft" [class.active]="fnSel() === i" (click)="fnSel.set(i)">{{ f.name }}</button>
          }
        </div>
        <div class="ctrl-col">
          <div class="ctrl-label">曲面</div>
          @for (s of surfaces; track s.name; let i = $index) {
            <button class="ft" [class.active]="surfSel() === i" (click)="surfSel.set(i)">{{ s.name }}</button>
          }
        </div>
      </div>

      <div class="result">
        <span class="rl">∬_S {{ fns[fnSel()].formula }} dS =</span>
        <span class="rv">{{ result().toFixed(4) }}</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        標量曲面積分不在乎曲面的「朝向」（正面反面一樣）。
        下一節看<strong>向量曲面積分</strong>（通量）——朝向很重要！
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-grid { display: flex; gap: 14px; margin-bottom: 14px; }
    .ctrl-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .ctrl-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 2px; }
    .ft { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer; text-align: left;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .result { display: flex; justify-content: center; align-items: baseline; gap: 10px;
      padding: 16px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent);
      font-family: 'JetBrains Mono', monospace; }
    .rl { font-size: 13px; color: var(--text-muted); }
    .rv { font-size: 22px; font-weight: 700; color: var(--accent); }
  `,
})
export class StepScalarSurfaceIntegralComponent {
  readonly surfaces = SURFACES;
  readonly fnSel = signal(0);
  readonly surfSel = signal(1);

  readonly fns = [
    { name: 'f = 1 (面積)', formula: '1', fn: () => 1 },
    { name: 'f = x² + y²', formula: 'x²+y²', fn: (x: number, y: number) => x * x + y * y },
    { name: 'f = z', formula: 'z', fn: (_x: number, _y: number, z: number) => z },
  ];

  readonly result = computed(() =>
    surfaceIntegralScalar(this.fns[this.fnSel()].fn, SURFACES[this.surfSel()]),
  );
}
