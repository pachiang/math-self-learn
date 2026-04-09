import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { fourierCoefficient, partialFourier, samplePath, sawWave, squareWave, triangleWave } from './fourier-util';

type SeriesKind = 'square' | 'triangle' | 'saw';

@Component({
  selector: 'app-step-fourier-series',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fourier 級數" subtitle="§12.6">
      <p>
        Fourier 級數做的事情，就是把一個目標函數，寫成越來越多個 sine / cosine 基底的和。
      </p>
      <p>
        當你把項數 N 慢慢加上去，函數不是突然「被猜到」，而是一步一步沿著正交方向補回來。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個目標波形，拖動項數 N，看 Fourier 級數如何一層一層長出來">
      <div class="controls">
        <div class="tabs">
          @for (item of kinds; track item.kind) {
            <button class="tab" [class.active]="kind() === item.kind" (click)="kind.set(item.kind)">{{ item.label }}</button>
          }
        </div>
        <div class="slider">
          <span class="lab">N</span>
          <input type="range" min="1" max="25" step="1" [value]="terms()" (input)="terms.set(+$any($event).target.value)" />
          <span class="val">{{ terms() }}</span>
        </div>
      </div>

      <div class="graph-card">
        <div class="gc-title">目標函數 vs 第 {{ terms() }} 項部分和</div>
        <svg viewBox="-120 -95 240 190" class="viz">
          @for (g of grid; track g) {
            <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
          <path [attr.d]="targetPath()" fill="none" stroke="var(--v1)" stroke-width="2.2" stroke-dasharray="6 4" />
          <path [attr.d]="partialPath()" fill="none" stroke="var(--accent)" stroke-width="3.8" />
        </svg>
      </div>

      <div class="bars">
        @for (bar of coeffBars(); track bar.n) {
          <div class="bar-card">
            <span class="name">sin({{ bar.n }}x)</span>
            <div class="bar-wrap"><div class="bar" [style.width.%]="barWidth(bar.value)" [class.neg]="bar.value < 0"></div></div>
            <span class="mono">{{ bar.value.toFixed(3) }}</span>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個畫面最值得記住的一點是：<strong>Fourier 級數不是魔法擬合，而是座標展開。</strong>
      </p>
    </app-prose-block>
  `,
  styles: `
    .controls { display: grid; gap: 12px; margin-bottom: 12px; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tab { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; }
    .tab:hover { background: var(--accent-10); }
    .tab.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 700; }
    .slider { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); padding: 10px 12px; }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .slider input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 32px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .graph-card, .bar-card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .graph-card { padding: 12px; margin-bottom: 12px; }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }
    .bars { display: grid; gap: 8px; }
    .bar-card { display: grid; grid-template-columns: 72px 1fr 58px; gap: 10px; align-items: center; padding: 10px 12px; }
    .name { font-size: 12px; color: var(--text); font-weight: 700; }
    .bar-wrap { height: 10px; border-radius: 999px; background: var(--bg-surface); overflow: hidden; }
    .bar { height: 100%; background: var(--accent); }
    .bar.neg { background: var(--v1); }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-secondary); text-align: right; }
  `,
})
export class StepFourierSeriesComponent {
  readonly kinds = [
    { kind: 'square' as const, label: '方波' },
    { kind: 'triangle' as const, label: '三角波' },
    { kind: 'saw' as const, label: '鋸齒波' },
  ];
  readonly grid = [-45, -15, 15, 45];
  readonly kind = signal<SeriesKind>('square');
  readonly terms = signal(7);

  targetFn(kind: SeriesKind): (x: number) => number {
    if (kind === 'square') return squareWave;
    if (kind === 'triangle') return triangleWave;
    return sawWave;
  }

  readonly targetPath = computed(() => samplePath(this.targetFn(this.kind())));
  readonly partialPath = computed(() => samplePath(partialFourier(this.kind(), this.terms())));
  readonly coeffBars = computed(() =>
    Array.from({ length: this.terms() }, (_, i) => ({ n: i + 1, value: fourierCoefficient(this.kind(), i + 1) })),
  );

  barWidth(value: number): number {
    return Math.min(100, Math.abs(value) * 85);
  }
}

