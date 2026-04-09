import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { partialFourier, samplePath, squareWave } from './fourier-util';

@Component({
  selector: 'app-step-gibbs',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Gibbs 現象" subtitle="§12.7">
      <p>
        到了方波這種有跳躍不連續的函數，你會看到一個很有名的現象：
        <strong>就算項數變很多，跳點附近仍然會有固定比例的 overshoot。</strong>
      </p>
      <p>
        這不是 Fourier 壞掉，而是級數逼近不連續函數時的正常代價。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="把視窗縮到跳點附近，看 overshoot 如何隨 N 變窄，但高度不會真的消失">
      <div class="slider">
        <span class="lab">N</span>
        <input type="range" min="1" max="60" step="1" [value]="terms()" (input)="terms.set(+$any($event).target.value)" />
        <span class="val">{{ terms() }}</span>
      </div>

      <div class="graph-grid">
        <section class="graph-card">
          <div class="gc-title">整體波形</div>
          <svg viewBox="-120 -90 240 180" class="viz">
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="globalTargetPath()" fill="none" stroke="var(--v1)" stroke-width="2.1" stroke-dasharray="6 4" />
            <path [attr.d]="globalPartialPath()" fill="none" stroke="var(--accent)" stroke-width="3.6" />
          </svg>
        </section>
        <section class="graph-card">
          <div class="gc-title">跳點附近放大</div>
          <svg viewBox="-120 -90 240 180" class="viz">
            @for (g of zoomGrid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <path [attr.d]="zoomTargetPath()" fill="none" stroke="var(--v1)" stroke-width="2.1" stroke-dasharray="6 4" />
            <path [attr.d]="zoomPartialPath()" fill="none" stroke="var(--accent)" stroke-width="3.6" />
          </svg>
        </section>
      </div>

      <div class="info">
        <span class="chip">最大值 ≈ {{ peak().toFixed(3) }}</span>
        <span class="chip">超出 1 的量 ≈ {{ (peak() - 1).toFixed(3) }}</span>
        <span class="chip">N = {{ terms() }}</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        你現在看到的是一個很經典的數學訊號：<strong>寬度縮小，不代表峰值也一起縮小。</strong>
      </p>
      <p>
        這節很重要，因為它提醒你 Fourier 級數不是萬能平滑器，而是一種有明確行為特徵的展開方式。
      </p>
    </app-prose-block>
  `,
  styles: `
    .slider { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); padding: 10px 12px; margin-bottom: 12px; }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .slider input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 32px; text-align: right; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
    .graph-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .graph-card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg); padding: 12px; }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }
    .info { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { padding: 6px 10px; border-radius: 999px; background: var(--bg); border: 1px solid var(--border); font-size: 12px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepGibbsComponent {
  readonly zoomGrid = [-45, -15, 15, 45];
  readonly terms = signal(25);

  readonly globalTargetPath = computed(() => samplePath(squareWave));
  readonly globalPartialPath = computed(() => samplePath(partialFourier('square', this.terms())));
  readonly zoomTargetPath = computed(() => samplePath(squareWave, { xMin: -0.8, xMax: 0.8, scaleX: 120, scaleY: 50 }));
  readonly zoomPartialPath = computed(() => samplePath(partialFourier('square', this.terms()), { xMin: -0.8, xMax: 0.8, scaleX: 120, scaleY: 50 }));
  readonly peak = computed(() => {
    const fn = partialFourier('square', this.terms());
    let best = -Infinity;
    for (let i = 0; i <= 600; i++) {
      const x = -0.8 + (1.6 * i) / 600;
      best = Math.max(best, fn(x));
    }
    return best;
  });
}
