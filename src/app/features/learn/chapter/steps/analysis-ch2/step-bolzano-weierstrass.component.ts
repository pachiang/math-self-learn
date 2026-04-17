import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { bisectSubsequence } from './analysis-ch2-util';

const COLORS = ['#5a7faa', '#c8983b', '#5a8a5a', '#aa5a6a', '#8a6aaa', '#6aaa8a',
  '#aa8a5a', '#5aaa7a', '#7a5aaa', '#aa5a8a'];

function bouncingSeq(count: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    Math.sin(i + 1) * 0.8 + 0.1 * Math.cos(3.7 * (i + 1)));
}

@Component({
  selector: 'app-step-bolzano-weierstrass',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <!-- ===== 動機 ===== -->
    <app-prose-block title="Bolzano-Weierstrass 定理" subtitle="§2.5">
      <p>
        上兩節的單調有界定理說：<strong>單調 + 有界 → 收斂</strong>。
        但很多數列不是單調的——它們亂跳。那還有希望找到規律嗎？
      </p>
      <p>
        想像一個派對：房間大小固定（有界），但不斷有人進來（無窮多項）。
        不管人怎麼站，<strong>房間裡至少有一個角落會越來越擁擠</strong>——
        你一定能找到一群人越站越近。
      </p>
    </app-prose-block>

    <!-- ===== 定理 ===== -->
    <app-prose-block>
      <p class="theorem-box">
        <strong>Bolzano-Weierstrass 定理</strong>：
        R 中每個<strong>有界</strong>數列都有一個<strong>收斂的子數列</strong>。
      </p>
      <p>
        子數列 = 從原數列中挑出無限多項（保持順序）組成的新數列。
        定理不要求原數列本身收斂——只要有界，就<strong>一定</strong>能從中挑出收斂的子列。
      </p>
      <p>
        ⚠ 「有界」是必要的。aₙ = n 沒有收斂子列，因為所有子列都趨向無窮。
      </p>
    </app-prose-block>

    <!-- ===== 證明思路 ===== -->
    <app-prose-block subtitle="證明：二分法">
      <ol class="proof-steps">
        <li>所有項都落在某個區間 [a, b] 裡（有界）</li>
        <li>把 [a, b] 切成左右兩半。<strong>至少一半</strong>包含無窮多項——選那一半</li>
        <li>重複切下去：每次區間長度減半，但都包含無窮多項</li>
        <li>嵌套閉區間定理（Ch1）→ 這些區間交出<strong>唯一一個點</strong></li>
        <li>從每層區間各挑一項 → 構成子數列，它收斂到那個點</li>
      </ol>
    </app-prose-block>

    <!-- ===== 互動 ===== -->
    <app-challenge-card prompt="看二分法如何從亂跳的數列裡一步步找出收斂子列">
      <div class="ctrl-row">
        <button class="act-btn" (click)="addStep()" [disabled]="bisectLevel() >= 10">
          🔪 切第 {{ bisectLevel() + 1 }} 刀
        </button>
        <button class="act-btn" (click)="toggleRun()">{{ running() ? '⏸ 暫停' : '▶ 自動' }}</button>
        <button class="act-btn reset" (click)="reset()">↺ 重置</button>
        <span class="step-info">已切 {{ bisectLevel() }} 層</span>
      </div>

      <!-- 散佈圖 -->
      <svg viewBox="0 0 500 300" class="bw-svg">
        <line x1="50" y1="270" x2="480" y2="270" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="270" stroke="var(--border)" stroke-width="0.8" />

        @for (yt of yTicks; track yt.val) {
          <line x1="45" [attr.y1]="valToY(yt.val)" x2="480" [attr.y2]="valToY(yt.val)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.4" />
          <text x="42" [attr.y]="valToY(yt.val) + 3" class="axis-label" text-anchor="end">{{ yt.label }}</text>
        }
        @for (xt of [5,10,15,20,25,30,35,40]; track xt) {
          <text [attr.x]="nToX(xt)" y="284" class="axis-label" text-anchor="middle">{{ xt }}</text>
        }
        <text x="265" y="298" class="axis-title" text-anchor="middle">n</text>
        <text x="14" y="145" class="axis-title" text-anchor="middle" transform="rotate(-90, 14, 145)">aₙ</text>

        <!-- 當前二分區間（水平帶） -->
        @for (iv of intervals(); track $index; let k = $index) {
          <rect x="50" [attr.y]="valToY(iv.b)" width="430"
                [attr.height]="Math.max(1, valToY(iv.a) - valToY(iv.b))"
                [attr.fill]="COLORS[k % COLORS.length]" [attr.fill-opacity]="0.06 + 0.03 * k" />
        }

        <!-- 最新區間邊界 -->
        @if (intervals().length > 0) {
          <line x1="50" [attr.y1]="valToY(latestIv().a)" x2="480" [attr.y2]="valToY(latestIv().a)"
                [attr.stroke]="COLORS[(intervals().length - 1) % COLORS.length]" stroke-width="1.2" stroke-dasharray="6 3" />
          <line x1="50" [attr.y1]="valToY(latestIv().b)" x2="480" [attr.y2]="valToY(latestIv().b)"
                [attr.stroke]="COLORS[(intervals().length - 1) % COLORS.length]" stroke-width="1.2" stroke-dasharray="6 3" />
        }

        <!-- 所有項 -->
        @for (val of rawTerms; track $index; let i = $index) {
          <circle [attr.cx]="nToX(i + 1)" [attr.cy]="valToY(val)"
                  [attr.r]="isInSubseq(i) ? 5 : 3"
                  [attr.fill]="isInSubseq(i) ? '#5a8a5a' : 'var(--text-muted)'"
                  [attr.fill-opacity]="isInSubseq(i) ? 1 : 0.2"
                  [attr.stroke]="isInSubseq(i) ? 'white' : 'none'"
                  [attr.stroke-width]="isInSubseq(i) ? 1.5 : 0" />
        }

        <!-- 子列連接線 -->
        @if (subseqPath()) {
          <path [attr.d]="subseqPath()" fill="none" stroke="#5a8a5a" stroke-width="1.5"
                stroke-opacity="0.5" stroke-dasharray="4 3" />
        }
      </svg>

      <!-- 區間收縮 -->
      <div class="nl-title">區間收縮</div>
      <div class="interval-stack">
        @for (iv of intervals(); track $index; let k = $index) {
          <div class="iv-row">
            <span class="iv-level" [style.color]="COLORS[k % COLORS.length]">{{ k + 1 }}</span>
            <div class="iv-bar-track">
              <div class="iv-bar" [style.left.%]="ivPct(iv.a)" [style.width.%]="ivPct(iv.b) - ivPct(iv.a)"
                   [style.background]="COLORS[k % COLORS.length]"></div>
            </div>
            <span class="iv-range">[{{ iv.a.toFixed(3) }}, {{ iv.b.toFixed(3) }}]</span>
          </div>
        }
      </div>

      <!-- 結果 -->
      <div class="info-row">
        <div class="i-card">
          <span class="il">區間長度</span>
          <span class="iv-num">{{ intervalLength().toFixed(6) }}</span>
        </div>
        <div class="i-card">
          <span class="il">子列項數</span>
          <span class="iv-num">{{ subseqCount() }}</span>
        </div>
        <div class="i-card accent" [class.visible]="bisectLevel() >= 4">
          <span class="il">收斂到</span>
          <span class="iv-num">≈ {{ approxLimit().toFixed(6) }}</span>
        </div>
      </div>

      @if (bisectLevel() >= 6) {
        <div class="result-box">
          {{ bisectLevel() }} 次二分後，區間只剩 {{ intervalLength().toFixed(6) }}。
          <strong>不管原數列多亂，有界就能找到收斂子列！</strong>
        </div>
      }
    </app-challenge-card>

    <!-- ===== 意義 ===== -->
    <app-prose-block subtitle="為什麼重要">
      <p>Bolzano-Weierstrass 是分析裡最常用的<strong>存在性</strong>工具：</p>
      <ul>
        <li>證明<strong>連續函數在閉區間上有最大值</strong>（極值定理）</li>
        <li>證明<strong>緊緻集</strong>上的序列有收斂子列</li>
        <li>是 Ch8 度量空間裡「序列緊緻性」的 R 上特例</li>
      </ul>
      <p>
        核心精神：<strong>有界 → 有聚點</strong>。
        下一節看<strong>Cauchy 列</strong>——不需要知道極限也能判斷收斂。
      </p>
    </app-prose-block>
  `,
  styles: `
    .theorem-box { text-align: center; font-size: 14px; padding: 14px; margin: 12px 0;
      background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 10px; color: var(--text); line-height: 1.8; }
    .theorem-box strong { color: var(--accent); }
    .proof-steps { padding-left: 20px; }
    .proof-steps li { font-size: 13px; color: var(--text-secondary); margin: 8px 0; line-height: 1.6; }
    .proof-steps li strong { color: var(--accent); }

    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .act-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &:disabled { opacity: 0.4; cursor: default; }
      &.reset { color: var(--text-muted); } }
    .step-info { font-size: 12px; color: var(--text-muted); margin-left: auto;
      font-family: 'JetBrains Mono', monospace; }

    .bw-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .axis-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .axis-title { font-size: 9px; fill: var(--text-muted); font-weight: 600; font-family: 'JetBrains Mono', monospace; }

    .nl-title { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .interval-stack { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .iv-row { display: flex; align-items: center; gap: 8px; }
    .iv-level { font-size: 11px; font-weight: 700; min-width: 16px; text-align: center; font-family: 'JetBrains Mono', monospace; }
    .iv-bar-track { flex: 1; height: 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; position: relative; overflow: hidden; }
    .iv-bar { position: absolute; top: 0; height: 100%; opacity: 0.4; border-radius: 3px; transition: left 0.3s, width 0.3s; }
    .iv-range { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; min-width: 120px; }

    .info-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface);
      &.accent { background: var(--accent-10); border-color: var(--accent); opacity: 0; transition: opacity 0.3s;
        &.visible { opacity: 1; } } }
    .il { font-size: 11px; color: var(--text-muted); display: block; }
    .iv-num { font-size: 15px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .accent .iv-num { color: var(--accent); }

    .result-box { padding: 12px; text-align: center; background: rgba(90, 138, 90, 0.08);
      border-radius: 8px; border: 1px solid rgba(90, 138, 90, 0.25);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .result-box strong { color: #5a8a5a; }
  `,
})
export class StepBolzanoWeierstrassComponent implements OnDestroy {
  readonly Math = Math;
  readonly COLORS = COLORS;
  readonly rawTerms = bouncingSeq(40);
  readonly bisectLevel = signal(0);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly yMin = Math.min(...this.rawTerms) - 0.15;
  private readonly yMax = Math.max(...this.rawTerms) + 0.15;

  readonly yTicks = (() => {
    const ticks: { val: number; label: string }[] = [];
    for (let v = Math.ceil(this.yMin * 5) / 5; v <= this.yMax; v += 0.2) {
      ticks.push({ val: +v.toFixed(1), label: v.toFixed(1) });
    }
    return ticks;
  })();

  valToY(v: number): number { return 270 - ((v - this.yMin) / (this.yMax - this.yMin)) * 250; }
  nToX(n: number): number { return 50 + (n / 41) * 430; }
  ivPct(v: number): number { return ((v - this.yMin) / (this.yMax - this.yMin)) * 100; }

  readonly bisectResult = computed(() => bisectSubsequence(this.rawTerms, this.bisectLevel()));
  readonly intervals = computed(() => this.bisectResult().intervals);
  readonly subseqIndices = computed(() => new Set(this.bisectResult().subseqIndices));
  readonly subseqCount = computed(() => this.bisectResult().subseqIndices.length);

  readonly latestIv = computed(() => {
    const ivs = this.intervals();
    return ivs.length > 0 ? ivs[ivs.length - 1] : { a: this.yMin, b: this.yMax };
  });

  readonly intervalLength = computed(() => { const iv = this.latestIv(); return iv.b - iv.a; });
  readonly approxLimit = computed(() => { const iv = this.latestIv(); return (iv.a + iv.b) / 2; });

  isInSubseq(i: number): boolean { return this.subseqIndices().has(i); }

  readonly subseqPath = computed(() => {
    const indices = this.bisectResult().subseqIndices;
    if (indices.length < 2) return '';
    return indices.map((idx, i) =>
      `${i === 0 ? 'M' : 'L'}${this.nToX(idx + 1)},${this.valToY(this.rawTerms[idx])}`
    ).join('');
  });

  addStep(): void { if (this.bisectLevel() < 10) this.bisectLevel.update((v) => v + 1); }

  toggleRun(): void {
    if (this.running()) { this.stopRun(); } else {
      this.running.set(true);
      this.timer = setInterval(() => {
        if (this.bisectLevel() >= 10) this.stopRun(); else this.addStep();
      }, 700);
    }
  }

  reset(): void { this.stopRun(); this.bisectLevel.set(0); }
  private stopRun(): void { this.running.set(false); if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  ngOnDestroy(): void { this.stopRun(); }
}
