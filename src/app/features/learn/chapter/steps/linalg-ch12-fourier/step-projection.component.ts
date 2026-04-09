import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { combineBasis, projectOntoBasis, samplePath, squareWave, sawWave, triangleWave, trigBasisList } from './fourier-util';

type TargetKind = 'square' | 'triangle' | 'saw' | 'smooth';

@Component({
  selector: 'app-step-function-projection',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="正交基底與投影" subtitle="§12.3">
      <p>
        如果一組基底彼此正交，想把函數投影到它們張成的子空間，就會變得非常乾淨。
      </p>
      <p>
        你只要算每個方向上的內積，係數就能直接讀出來。這其實就是把第三章的投影概念搬到函數空間。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個目標函數，再決定你願意用多少個基底方向去近似它">
      <div class="controls">
        <div class="tabs">
          @for (item of targets; track item.kind) {
            <button class="tab" [class.active]="target() === item.kind" (click)="target.set(item.kind)">{{ item.label }}</button>
          }
        </div>
        <div class="slider">
          <span class="lab">N</span>
          <input type="range" min="1" max="7" step="1" [value]="count()" (input)="count.set(+$any($event).target.value)" />
          <span class="val">{{ count() }}</span>
        </div>
      </div>

      <div class="graph-card">
        <div class="gc-title">目標函數 vs 投影近似</div>
        <svg viewBox="-120 -90 240 180" class="viz">
          @for (g of grid; track g) {
            <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
          <path [attr.d]="targetPath()" fill="none" stroke="var(--v1)" stroke-width="2.3" stroke-dasharray="6 4" />
          <path [attr.d]="approxPath()" fill="none" stroke="var(--accent)" stroke-width="3.8" />
        </svg>
        <div class="legend">
          <span class="lg"><span class="sw target"></span>目標函數</span>
          <span class="lg"><span class="sw approx"></span>投影到前 {{ count() }} 個基底</span>
        </div>
      </div>

      <div class="bars">
        @for (coef of coeffs(); track $index; let i = $index) {
          <div class="bar-card">
            <span class="name">{{ basis[i].label }}</span>
            <div class="bar-wrap">
              <div class="bar" [style.width.%]="barPercent(coef)" [class.neg]="coef < 0"></div>
            </div>
            <span class="mono">{{ coef.toFixed(2) }}</span>
          </div>
        }
      </div>

      <div class="info">
        <span class="chip">誤差能量 ≈ {{ error().toFixed(3) }}</span>
        <span class="chip">基底數 {{ count() }}</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這裡的「投影」不是比喻，而是貨真價實的內積投影。之後 Fourier series 做的事情，本質上就是把函數投影到一串正交的 sine / cosine 方向上。
      </p>
    </app-prose-block>
  `,
  styles: `
    .controls { display: grid; gap: 12px; margin-bottom: 12px; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .tab { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 12px; }
    .tab:hover { background: var(--accent-10); }
    .tab.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 700; }
    .slider { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); padding: 10px 12px; }
    .lab { font-size: 14px; font-weight: 700; color: var(--accent); min-width: 24px; font-family: 'Noto Sans Math', serif; }
    .slider input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 24px; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .graph-card, .bar-card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .graph-card { padding: 12px; margin-bottom: 12px; }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }
    .legend { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; font-size: 12px; color: var(--text-secondary); }
    .lg { display: inline-flex; align-items: center; gap: 6px; }
    .sw { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
    .sw.target { background: var(--v1); }
    .sw.approx { background: var(--accent); }
    .bars { display: grid; gap: 8px; margin-bottom: 12px; }
    .bar-card { display: grid; grid-template-columns: 88px 1fr 52px; align-items: center; gap: 10px; padding: 10px 12px; }
    .name { font-size: 12px; color: var(--text); font-weight: 700; }
    .bar-wrap { height: 10px; border-radius: 999px; background: var(--bg-surface); overflow: hidden; }
    .bar { height: 100%; background: var(--accent); }
    .bar.neg { background: var(--v1); }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-secondary); text-align: right; }
    .info { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { padding: 6px 10px; border-radius: 999px; background: var(--bg); border: 1px solid var(--border); font-size: 12px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepProjectionComponent {
  readonly basis = trigBasisList(7);
  readonly targets = [
    { kind: 'square' as const, label: '方波' },
    { kind: 'triangle' as const, label: '三角波' },
    { kind: 'saw' as const, label: '鋸齒波' },
    { kind: 'smooth' as const, label: '平滑函數' },
  ];
  readonly grid = [-45, -15, 15, 45];
  readonly target = signal<TargetKind>('smooth');
  readonly count = signal(5);

  targetFn(kind: TargetKind): (x: number) => number {
    if (kind === 'square') return squareWave;
    if (kind === 'triangle') return triangleWave;
    if (kind === 'saw') return sawWave;
    return (x) => 0.6 * Math.cos(x) - 0.3 * Math.sin(2 * x) + 0.4 * Math.cos(3 * x);
  }

  readonly coeffs = computed(() => projectOntoBasis(this.targetFn(this.target()), this.count()));
  readonly approxFn = computed(() => combineBasis(this.coeffs()));
  readonly targetPath = computed(() => samplePath(this.targetFn(this.target())));
  readonly approxPath = computed(() => samplePath(this.approxFn()));
  readonly error = computed(() => {
    let total = 0;
    const target = this.targetFn(this.target());
    const approx = this.approxFn();
    for (let i = 0; i <= 300; i++) {
      const x = -Math.PI + (2 * Math.PI * i) / 300;
      const d = target(x) - approx(x);
      total += d * d;
    }
    return total / 301;
  });

  barPercent(value: number): number {
    return Math.min(100, Math.abs(value) * 42);
  }
}

