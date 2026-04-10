import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const COLORS = ['#5a7faa', '#c8983b', '#5a8a5a', '#aa5a6a', '#8a6aaa', '#6aaa8a', '#aa8a5a', '#7a5aaa'];

@Component({
  selector: 'app-step-nested-intervals',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="區間套定理" subtitle="§1.6">
      <p>
        <strong>區間套定理</strong>：如果 [a₁, b₁] ⊃ [a₂, b₂] ⊃ … 是一列嵌套的閉區間，
        而且長度 bₙ − aₙ → 0，那麼交集<strong>恰好包含一個點</strong>。
      </p>
      <p class="formula">⋂ₙ [aₙ, bₙ] = {{ '{' }}c{{ '}' }}，c = sup{{ '{' }}aₙ{{ '}' }} = inf{{ '{' }}bₙ{{ '}' }}</p>
      <p>
        這是完備性的另一種表述。在 Q 裡這個定理<strong>不成立</strong>——
        嵌套區間的交集可能是空的（如果那個唯一的點是無理數）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看閉區間怎麼一層一層縮小到一個點">
      <div class="ctrl-row">
        <button class="act-btn" (click)="addLevel()">加一層</button>
        <button class="act-btn" (click)="toggleRun()">{{ running() ? '暫停' : '自動' }}</button>
        <button class="act-btn reset" (click)="reset()">重置</button>
        <div class="level-info">層數：{{ levels() }}　長度：{{ currentLength().toExponential(2) }}</div>
      </div>

      <svg [attr.viewBox]="'-10 -10 420 ' + (20 + levels() * 22)" class="nest-svg">
        @for (iv of intervals(); track iv.n) {
          <rect [attr.x]="toX(iv.a)" [attr.y]="iv.n * 20"
                [attr.width]="Math.max(1, toX(iv.b) - toX(iv.a))" height="14"
                [attr.fill]="COLORS[iv.n % COLORS.length]" fill-opacity="0.2"
                [attr.stroke]="COLORS[iv.n % COLORS.length]" stroke-width="1"
                rx="3" />
          <text [attr.x]="toX(iv.a) - 3" [attr.y]="iv.n * 20 + 10" class="iv-label"
                text-anchor="end">{{ iv.a.toFixed(4) }}</text>
          <text [attr.x]="toX(iv.b) + 3" [attr.y]="iv.n * 20 + 10" class="iv-label">
            {{ iv.b.toFixed(4) }}
          </text>
        }

        <!-- The limit point -->
        @if (levels() >= 3) {
          <line [attr.x1]="toX(targetPoint)" y1="-5" [attr.x2]="toX(targetPoint)"
                [attr.y2]="levels() * 20 + 10"
                stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2" />
        }
      </svg>

      <div class="target-info">
        交集 → {{ targetPoint.toFixed(10) }}…（= √2）
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="開區間呢？">
      <div class="open-demo">
        <p class="open-desc">
          試試開區間 (0, 1/n)：每一層都包含前一層，長度趨近 0。
          但交集是<strong>空的</strong>！因為 0 不在任何一個開區間裡。
        </p>
        <svg viewBox="-10 -10 420 160" class="nest-svg">
          @for (iv of openIntervals; track iv.n) {
            <rect [attr.x]="toX(iv.a) + 3" [attr.y]="iv.n * 20"
                  [attr.width]="Math.max(1, toX(iv.b) - toX(iv.a) - 6)" height="14"
                  fill="none" stroke="#a05a5a" stroke-width="1" rx="3" stroke-dasharray="4 2" />
            <text [attr.x]="toX(iv.b) + 5" [attr.y]="iv.n * 20 + 10" class="iv-label">
              1/{{ iv.n + 1 }}
            </text>
          }
          <!-- 0 point escapes every interval -->
          <circle [attr.cx]="toX(0)" [attr.cy]="75" r="5"
                  fill="none" stroke="#a05a5a" stroke-width="2" />
          <text [attr.x]="toX(0)" y="95" class="escape-label">0 逃出每個區間！</text>
        </svg>
        <div class="warning">
          閉區間套 → 交集有一個點。開區間套 → 交集可能是空的。
          <strong>「閉」很重要！</strong>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        區間套定理是實數完備性的一個直觀表述：
        你可以用越來越精確的「夾擠」來<strong>鎖定</strong>任何一個實數。
        這正是十進位展開背後的想法——下一節來看。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .act-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.reset { color: var(--text-muted); } }
    .level-info { font-size: 12px; color: var(--text-muted); margin-left: auto;
      font-family: 'JetBrains Mono', monospace; }

    .nest-svg { width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .iv-label { font-size: 8px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }

    .target-info { padding: 10px; text-align: center; font-size: 13px;
      color: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      background: var(--accent-10); border-radius: 8px; }

    .open-demo { }
    .open-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;
      strong { color: #a05a5a; } }
    .escape-label { font-size: 9px; fill: #a05a5a; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .warning { padding: 10px; background: rgba(160, 90, 90, 0.08); border-radius: 8px;
      border: 1px solid rgba(160, 90, 90, 0.2); font-size: 12px; color: var(--text-secondary);
      text-align: center;
      strong { color: #a05a5a; } }
  `,
})
export class StepNestedIntervalsComponent implements OnDestroy {
  readonly Math = Math;
  readonly COLORS = COLORS;
  readonly levels = signal(1);
  readonly running = signal(false);
  readonly targetPoint = Math.SQRT2;
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  // Bisection intervals converging to √2
  readonly intervals = computed(() => {
    const result: { n: number; a: number; b: number }[] = [];
    let a = 1, b = 2;
    for (let n = 0; n < this.levels(); n++) {
      result.push({ n, a, b });
      const mid = (a + b) / 2;
      if (mid * mid < 2) a = mid; else b = mid;
    }
    return result;
  });

  readonly currentLength = computed(() => {
    const ivs = this.intervals();
    const last = ivs[ivs.length - 1];
    return last ? last.b - last.a : 1;
  });

  readonly openIntervals = Array.from({ length: 7 }, (_, n) => ({
    n,
    a: 0,
    b: 1 / (n + 1),
  }));

  toX(v: number): number { return 10 + (v / 2.2) * 390; }

  addLevel(): void {
    if (this.levels() < 30) this.levels.update((v) => v + 1);
  }

  toggleRun(): void {
    if (this.running()) {
      this.stopRun();
    } else {
      this.running.set(true);
      this.timerHandle = setInterval(() => {
        if (this.levels() >= 25) this.stopRun();
        else this.addLevel();
      }, 400);
    }
  }

  reset(): void {
    this.stopRun();
    this.levels.set(1);
  }

  private stopRun(): void {
    this.running.set(false);
    if (this.timerHandle) { clearInterval(this.timerHandle); this.timerHandle = null; }
  }

  ngOnDestroy(): void { this.stopRun(); }
}
