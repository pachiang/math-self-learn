import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { COMMON_SEQUENCES, generateTerms } from './analysis-ch2-util';

@Component({
  selector: 'app-step-what-is-sequence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是數列" subtitle="§2.1">
      <p>
        <strong>數列</strong>是一個函數 a: N → R，把每個自然數 n 對應到一個實數 aₙ。
      </p>
      <p>
        數列<strong>不是集合</strong>——順序很重要，值可以重複。
        {{ '{' }}1, 1, 1, …{{ '}' }} 和 {{ '{' }}1{{ '}' }} 是不同的東西。
      </p>
      <p>
        幾個經典的例子：
      </p>
      <ul>
        <li>aₙ = 1/n → 1, 1/2, 1/3, 1/4, …（趨向 0）</li>
        <li>aₙ = (−1)ⁿ → −1, 1, −1, 1, …（來回彈跳）</li>
        <li>aₙ = (1+1/n)ⁿ → 趨向某個神秘常數 e ≈ 2.71828…</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="按 ▶ 看數列的項如何隨 n 增大而變化">
      <div class="ctrl-row">
        <div class="presets">
          @for (s of sequences; track s.name; let i = $index) {
            <button class="pre-btn" [class.active]="selIdx() === i" (click)="select(i)">{{ s.name }}</button>
          }
        </div>
        <div class="btns">
          <button class="act-btn" (click)="toggleRun()">{{ running() ? '⏸' : '▶' }}</button>
          <button class="act-btn" (click)="step()">+1</button>
          <button class="act-btn reset" (click)="reset()">重置</button>
        </div>
      </div>

      <!-- ===== 主視覺化：散佈圖（橫軸 = n, 縱軸 = aₙ）===== -->
      <svg [attr.viewBox]="'0 0 500 280'" class="seq-svg">
        <!-- 背景格線 -->
        <line x1="60" y1="250" x2="480" y2="250" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="20" x2="60" y2="250" stroke="var(--border)" stroke-width="0.8" />

        <!-- Y 軸刻度（值） -->
        @for (yt of yTicks(); track yt.val) {
          <line x1="55" [attr.y1]="valToY(yt.val)" x2="480" [attr.y2]="valToY(yt.val)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.5" />
          <text x="50" [attr.y]="valToY(yt.val) + 3" class="axis-label" text-anchor="end">{{ yt.label }}</text>
        }

        <!-- X 軸刻度（n） -->
        @for (xt of xTicks(); track xt) {
          <line [attr.x1]="nToX(xt)" y1="250" [attr.x2]="nToX(xt)" y2="254" stroke="var(--border)" stroke-width="0.5" />
          <text [attr.x]="nToX(xt)" y="266" class="axis-label" text-anchor="middle">{{ xt }}</text>
        }

        <!-- 軸標題 -->
        <text x="270" y="278" class="axis-title" text-anchor="middle">n</text>
        <text x="18" y="135" class="axis-title" text-anchor="middle" transform="rotate(-90, 18, 135)">aₙ</text>

        <!-- 極限虛線 -->
        @if (currentSeq().limit !== null) {
          <line x1="60" [attr.y1]="valToY(limitVal())" x2="480" [attr.y2]="valToY(limitVal())"
                stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="6 4" stroke-opacity="0.6" />
          <text x="484" [attr.y]="valToY(limitVal()) + 4" class="limit-label">L = {{ limitVal().toFixed(2) }}</text>
        }

        <!-- 連接線 -->
        @if (visibleTerms().length > 1) {
          <path [attr.d]="linePath()" fill="none" stroke="var(--accent)" stroke-width="1"
                stroke-opacity="0.25" />
        }

        <!-- 數列的點 -->
        @for (term of visibleTerms(); track term.n) {
          <circle [attr.cx]="nToX(term.n)" [attr.cy]="valToY(term.val)"
                  [attr.r]="term.n === visible() ? 5 : 3.5"
                  [attr.fill]="term.n === visible() ? 'var(--accent)' : 'var(--accent)'"
                  [attr.fill-opacity]="0.25 + 0.75 * (term.n / Math.max(visible(), 1))"
                  [attr.stroke]="term.n === visible() ? 'white' : 'none'"
                  [attr.stroke-width]="term.n === visible() ? 1.5 : 0" />
        }

        <!-- 最新項的標註 -->
        @if (visibleTerms().length > 0) {
          <text [attr.x]="nToX(visible()) + 8" [attr.y]="valToY(lastVal()) - 2"
                class="latest-label">
            a{{ visible() }} = {{ lastVal().toFixed(4) }}
          </text>
        }
      </svg>

      <!-- ===== 數線視圖（補充） ===== -->
      <div class="numline-label">數線上的位置</div>
      <svg viewBox="0 0 500 50" class="numline-svg">
        <line x1="30" y1="25" x2="470" y2="25" stroke="var(--border)" stroke-width="0.8" />

        @for (t of numlineTicks(); track t.val) {
          <line [attr.x1]="numX(t.val)" y1="21" [attr.x2]="numX(t.val)" y2="29"
                stroke="var(--border)" stroke-width="0.5" />
          <text [attr.x]="numX(t.val)" y="40" class="nl-tick">{{ t.label }}</text>
        }

        <!-- 極限標記 -->
        @if (currentSeq().limit !== null) {
          <line [attr.x1]="numX(limitVal())" y1="14" [attr.x2]="numX(limitVal())" y2="36"
                stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2" />
        }

        <!-- 點（只顯示最近 15 項避免擠在一起）-->
        @for (term of recentTerms(); track term.n) {
          <circle [attr.cx]="numX(term.val)" cy="25"
                  [attr.r]="term.n === visible() ? 4.5 : 3"
                  fill="var(--accent)"
                  [attr.fill-opacity]="0.2 + 0.8 * ((term.n - recentStart()) / Math.max(recentCount(), 1))" />
        }
      </svg>

      <div class="info-row">
        <div class="info-card">
          <span class="ir-label">已顯示</span>
          <span class="ir-val">{{ visible() }} 項</span>
        </div>
        <div class="info-card">
          <span class="ir-label">aₙ</span>
          <span class="ir-val">{{ currentVal() }}</span>
        </div>
        <div class="info-card" [class.converge]="currentSeq().limit !== null"
             [class.diverge]="currentSeq().limit === null">
          @if (currentSeq().limit !== null) {
            <span class="ir-label">極限</span>
            <span class="ir-val">{{ currentSeq().limit }}</span>
          } @else {
            <span class="ir-val">發散</span>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        有些數列的項越來越靠近某個值——我們說它<strong>收斂</strong>。
        但「靠近」到底多靠近才算？下一節用 ε-N 語言精確定義。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .presets { display: flex; gap: 4px; flex-wrap: wrap; }
    .pre-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .btns { display: flex; gap: 4px; margin-left: auto; }
    .act-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.reset { color: var(--text-muted); } }

    .seq-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 6px; }
    .axis-label { font-size: 8px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
    .axis-title { font-size: 9px; fill: var(--text-muted); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }
    .limit-label { font-size: 8px; fill: var(--accent); font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .latest-label { font-size: 8px; fill: var(--accent); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }

    .numline-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 600; }
    .numline-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg); margin-bottom: 10px; }
    .nl-tick { font-size: 7px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }

    .info-row { display: flex; gap: 8px; }
    .info-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface);
      &.converge { background: rgba(90,138,90,0.08); border-color: rgba(90,138,90,0.3); }
      &.diverge { background: rgba(160,90,90,0.08); border-color: rgba(160,90,90,0.3); } }
    .ir-label { font-size: 11px; color: var(--text-muted); display: block; }
    .ir-val { font-size: 15px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      .converge & { color: #5a8a5a; }
      .diverge & { color: #a05a5a; } }
  `,
})
export class StepWhatIsSequenceComponent implements OnDestroy {
  readonly Math = Math;
  readonly sequences = COMMON_SEQUENCES;
  readonly selIdx = signal(0);
  readonly visible = signal(1);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly currentSeq = computed(() => COMMON_SEQUENCES[this.selIdx()]);
  readonly allTerms = computed(() => generateTerms(this.currentSeq().fn, 40));
  readonly visibleTerms = computed(() => this.allTerms().slice(0, this.visible()));
  readonly lastVal = computed(() => {
    const terms = this.visibleTerms();
    return terms.length ? terms[terms.length - 1].val : 0;
  });
  readonly currentVal = computed(() => this.lastVal().toFixed(6));

  // --- Scatter plot axes ---
  // Y range: compute from all terms
  private readonly yRange = computed(() => {
    const terms = this.allTerms();
    let min = Infinity, max = -Infinity;
    for (const t of terms) {
      if (t.val < min) min = t.val;
      if (t.val > max) max = t.val;
    }
    const pad = Math.max(0.2, (max - min) * 0.15);
    return [min - pad, max + pad] as [number, number];
  });

  valToY(val: number): number {
    const [lo, hi] = this.yRange();
    return 250 - ((val - lo) / (hi - lo)) * 230;
  }

  nToX(n: number): number {
    return 60 + (n / 40) * 420;
  }

  readonly yTicks = computed(() => {
    const [lo, hi] = this.yRange();
    const step = this.niceStep(hi - lo, 5);
    const ticks: { val: number; label: string }[] = [];
    const start = Math.ceil(lo / step) * step;
    for (let v = start; v <= hi; v += step) {
      ticks.push({ val: v, label: Math.abs(v) < 0.001 ? '0' : v.toFixed(Math.max(0, -Math.floor(Math.log10(step)))) });
    }
    return ticks;
  });

  xTicks(): number[] {
    return [1, 5, 10, 15, 20, 25, 30, 35, 40];
  }

  limitVal(): number {
    const l = this.currentSeq().limit;
    return l ?? 0;
  }

  linePath(): string {
    const terms = this.visibleTerms();
    return terms.map((t, i) =>
      `${i === 0 ? 'M' : 'L'}${this.nToX(t.n)},${this.valToY(t.val)}`
    ).join('');
  }

  // --- Number line (only recent terms to avoid crowding) ---
  private readonly numRange = computed(() => {
    const [lo, hi] = this.yRange();
    return [lo, hi] as [number, number];
  });

  numX(val: number): number {
    const [lo, hi] = this.numRange();
    return 30 + ((val - lo) / (hi - lo)) * 440;
  }

  numlineTicks(): { val: number; label: string }[] {
    return this.yTicks();
  }

  readonly recentTerms = computed(() => {
    const all = this.visibleTerms();
    return all.slice(Math.max(0, all.length - 15));
  });

  recentStart(): number {
    return Math.max(1, this.visible() - 15);
  }
  recentCount(): number { return 15; }

  private niceStep(range: number, targetTicks: number): number {
    const rough = range / targetTicks;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    if (norm < 1.5) return mag;
    if (norm < 3.5) return 2 * mag;
    if (norm < 7.5) return 5 * mag;
    return 10 * mag;
  }

  select(i: number): void { this.selIdx.set(i); this.reset(); }
  step(): void { if (this.visible() < 40) this.visible.update((v) => v + 1); }

  toggleRun(): void {
    if (this.running()) { this.stopRun(); } else {
      this.running.set(true);
      this.timer = setInterval(() => {
        if (this.visible() >= 40) this.stopRun(); else this.step();
      }, 200);
    }
  }

  reset(): void { this.stopRun(); this.visible.set(1); }
  private stopRun(): void { this.running.set(false); if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  ngOnDestroy(): void { this.stopRun(); }
}
