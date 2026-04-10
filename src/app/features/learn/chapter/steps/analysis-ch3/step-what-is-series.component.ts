import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { partialSums, geometricPartialSum } from './analysis-ch3-util';

interface SeriesPreset { name: string; fn: (k: number) => number; limit: number | null; desc: string; }

const PRESETS: SeriesPreset[] = [
  { name: '幾何 r=1/2', fn: (k) => Math.pow(0.5, k), limit: 2, desc: '|r|<1 → 收斂到 1/(1-r) = 2' },
  { name: '幾何 r=−0.7', fn: (k) => Math.pow(-0.7, k), limit: 1/1.7, desc: '|r|<1 → 收斂（振盪逼近）' },
  { name: '調和 1/n', fn: (k) => 1 / k, limit: null, desc: '每項→0 但級數發散！' },
  { name: '望遠鏡 1/k(k+1)', fn: (k) => 1 / (k * (k + 1)), limit: 1, desc: '伸縮消去 → 收斂到 1' },
  { name: 'p=2: 1/n²', fn: (k) => 1 / (k * k), limit: Math.PI * Math.PI / 6, desc: '收斂到 π²/6 ≈ 1.6449' },
];

@Component({
  selector: 'app-step-what-is-series',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是級數" subtitle="§3.1">
      <p>
        <strong>級數</strong>就是把無限多項加起來：
      </p>
      <p class="formula">Σaₙ = a₁ + a₂ + a₃ + …</p>
      <p>
        但「無限多項的和」是什麼意思？定義為<strong>部分和數列</strong>的極限：
      </p>
      <p class="formula">Sₙ = a₁ + a₂ + … + aₙ，級數收斂 ⟺ lim Sₙ 存在</p>
      <p>
        所以級數問題<strong>歸結為數列問題</strong>——第二章的工具全部適用。
      </p>
      <p>
        ⚠️ 必要條件：如果 Σaₙ 收斂，那 aₙ → 0。但<strong>反過來不成立</strong>——
        調和級數 Σ1/n 的 aₙ → 0 但發散。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選不同級數，看部分和怎麼跑">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="select(i)">{{ p.name }}</button>
        }
        <div class="btns">
          <button class="act-btn" (click)="step()">+1</button>
          <button class="act-btn" (click)="toggleRun()">{{ running() ? '⏸' : '▶' }}</button>
          <button class="act-btn reset" (click)="reset()">重置</button>
        </div>
      </div>

      <svg viewBox="0 0 520 220" class="series-svg">
        <!-- Axes -->
        <line x1="40" y1="190" x2="510" y2="190" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="190" stroke="var(--border)" stroke-width="0.8" />

        <!-- Limit line -->
        @if (currentLimit() !== null) {
          <line x1="40" [attr.y1]="ty(currentLimit()!)" x2="510" [attr.y2]="ty(currentLimit()!)"
                stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />
          <text x="512" [attr.y]="ty(currentLimit()!) + 4" class="lim-label">{{ currentLimit()!.toFixed(4) }}</text>
        }

        <!-- Partial sum path -->
        @if (visibleData().length > 1) {
          <path [attr.d]="pathD()" fill="none" stroke="var(--accent)" stroke-width="1.5" />
        }

        <!-- Dots -->
        @for (d of visibleData(); track d.n) {
          <circle [attr.cx]="nx(d.n)" [attr.cy]="ty(d.sum)" r="3"
                  fill="var(--accent)" fill-opacity="0.8" />
        }
      </svg>

      <div class="info-row">
        <span class="ir">n = {{ visible() }}</span>
        <span class="ir">Sₙ = {{ lastSum() }}</span>
        @if (currentLimit() !== null) {
          <span class="ir accent">極限 = {{ currentLimit()!.toFixed(6) }}</span>
        } @else {
          <span class="ir warn">發散</span>
        }
      </div>
      <div class="desc">{{ presets[selIdx()].desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾何級數是最基本的——它有公式解。但大多數級數沒有。
        下一節看怎麼<strong>不算出和</strong>就判斷收斂性。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .btns { display: flex; gap: 4px; margin-left: auto; }
    .act-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); } &.reset { color: var(--text-muted); } }

    .series-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .lim-label { font-size: 8px; fill: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .info-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 6px; }
    .ir { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.accent { color: var(--accent); } &.warn { color: #a05a5a; } }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepWhatIsSeriesComponent implements OnDestroy {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly visible = signal(1);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly allData = computed(() => partialSums(PRESETS[this.selIdx()].fn, 60));
  readonly visibleData = computed(() => this.allData().slice(0, this.visible()));
  readonly currentLimit = computed(() => PRESETS[this.selIdx()].limit);
  readonly lastSum = computed(() => {
    const d = this.visibleData();
    return d.length ? d[d.length - 1].sum.toFixed(6) : '0';
  });

  private readonly yRange = computed(() => {
    const vals = this.allData().map((d) => d.sum);
    const L = this.currentLimit();
    const mn = Math.min(...vals, L ?? 0, 0);
    const mx = Math.max(...vals, L ?? 0, 1);
    return { min: mn - 0.1, max: mx + 0.1 };
  });

  ty(v: number): number {
    const { min, max } = this.yRange();
    return 190 - ((v - min) / (max - min || 1)) * 175;
  }
  nx(n: number): number { return 40 + (n / 62) * 470; }
  pathD(): string {
    const d = this.visibleData();
    return 'M' + d.map((p) => `${this.nx(p.n)},${this.ty(p.sum)}`).join('L');
  }

  select(i: number): void { this.selIdx.set(i); this.reset(); }
  step(): void { if (this.visible() < 60) this.visible.update((v) => v + 1); }
  toggleRun(): void {
    if (this.running()) { this.stopRun(); } else {
      this.running.set(true);
      this.timer = setInterval(() => { if (this.visible() >= 60) this.stopRun(); else this.step(); }, 150);
    }
  }
  reset(): void { this.stopRun(); this.visible.set(1); }
  private stopRun(): void { this.running.set(false); if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  ngOnDestroy(): void { this.stopRun(); }
}
