import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { DELTA_FAMILIES, samplePath } from './analysis-ch18-util';

@Component({
  selector: 'app-step-dirac-delta',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Dirac Delta" subtitle="§18.4">
      <p>
        <strong>δ(x)</strong> 是最重要的分佈。它的定義：
      </p>
      <p class="formula">⟨δ, φ⟩ = φ(0) &nbsp;&nbsp; ∀φ ∈ D</p>
      <p>
        不是函數，而是「取值算子」。可以用一系列函數逼近：
        δε(x) → δ（弱收斂），其中 ∫δε = 1 且 δε 越來越集中在 0。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="四種逼近族：拖 ε → 0 看它們如何收斂到 delta">
      <div class="fn-tabs">
        @for (f of families; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">ε = {{ eps().toFixed(3) }}</span>
        <input type="range" min="-2" max="0" step="0.02" [value]="epsLog()"
               (input)="epsLog.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="0 0 500 220" class="delta-svg">
        <line x1="40" y1="190" x2="460" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="250" y1="10" x2="250" y2="190" stroke="var(--border)" stroke-width="0.5" />

        <!-- Delta approximation -->
        <path [attr.d]="deltaPath()" fill="rgba(var(--accent-rgb), 0.1)" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="info-row">
        <div class="i-card">{{ families[sel()].formula }}</div>
        <div class="i-card">峰高 ≈ {{ peak().toFixed(1) }}</div>
        <div class="i-card accent">∫ δε dx ≈ {{ integral().toFixed(4) }}</div>
      </div>

      <div class="convergence-note">
        ε → 0：越來越窄、越來越高，但<strong>面積永遠 = 1</strong>。
        這就是 δ 的「弱極限」。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        所有四種逼近「長得不一樣」但都收斂到同一個 δ——因為分佈只看 ⟨·, φ⟩ 的值，
        不看「長什麼樣」。這就是弱拓撲的威力。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cl { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .delta-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 12px; }
    .info-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .i-card { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 11px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
    .convergence-note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; }
    .convergence-note strong { color: var(--accent); }
  `,
})
export class StepDiracDeltaComponent {
  readonly families = DELTA_FAMILIES;
  readonly sel = signal(0);
  readonly epsLog = signal(-0.5);
  readonly eps = computed(() => Math.pow(10, this.epsLog()));

  readonly peak = computed(() => DELTA_FAMILIES[this.sel()].fn(0, this.eps()));

  readonly integral = computed(() => {
    const fn = DELTA_FAMILIES[this.sel()].fn;
    const e = this.eps();
    const N = 800;
    const dx = 8 / N;
    let sum = 0;
    for (let i = 0; i < N; i++) { sum += fn(-4 + (i + 0.5) * dx, e) * dx; }
    return sum;
  });

  deltaPath(): string {
    const fn = DELTA_FAMILIES[this.sel()].fn;
    const e = this.eps();
    const maxY = Math.max(1, fn(0, e));
    const yScale = Math.min(170, 170 / (maxY * 0.7));
    return samplePath((x) => fn(x, e), -3, 3, yScale, 190, 70, 250);
  }
}
