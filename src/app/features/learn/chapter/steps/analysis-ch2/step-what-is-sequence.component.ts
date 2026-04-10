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

    <app-challenge-card prompt="按 ▶ 看數列的項一個一個出現在數線上">
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

      <svg viewBox="-20 -50 540 100" class="seq-svg">
        <!-- Number line -->
        <line x1="0" y1="0" x2="500" y2="0" stroke="var(--border)" stroke-width="1" />
        @for (t of ticks; track t.val) {
          <line [attr.x1]="toX(t.val)" y1="-4" [attr.x2]="toX(t.val)" y2="4"
                stroke="var(--border-strong)" stroke-width="0.8" />
          <text [attr.x]="toX(t.val)" y="16" class="tick">{{ t.label }}</text>
        }

        <!-- Sequence dots -->
        @for (term of visibleTerms(); track term.n) {
          <circle [attr.cx]="toX(term.val)" [attr.cy]="-8 - (term.n % 3) * 8" r="3.5"
                  fill="var(--accent)" [attr.fill-opacity]="0.3 + 0.7 * (term.n / visible())" />
          <text [attr.x]="toX(term.val)" [attr.y]="-16 - (term.n % 3) * 8"
                class="n-label">{{ term.n }}</text>
        }
      </svg>

      <div class="info-row">
        <span class="ir-label">已顯示</span>
        <span class="ir-val">{{ visible() }} 項</span>
        <span class="ir-label">aₙ =</span>
        <span class="ir-val">{{ currentVal() }}</span>
        @if (currentSeq().limit !== null) {
          <span class="ir-label">極限</span>
          <span class="ir-val accent">{{ currentSeq().limit }}</span>
        } @else {
          <span class="ir-val warn">發散</span>
        }
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
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .btns { display: flex; gap: 4px; margin-left: auto; }
    .act-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.reset { color: var(--text-muted); } }

    .seq-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .n-label { font-size: 6px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }

    .info-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      padding: 8px 12px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); }
    .ir-label { font-size: 12px; color: var(--text-muted); }
    .ir-val { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.accent { color: var(--accent); }
      &.warn { color: #a05a5a; } }
  `,
})
export class StepWhatIsSequenceComponent implements OnDestroy {
  readonly sequences = COMMON_SEQUENCES;
  readonly selIdx = signal(0);
  readonly visible = signal(1);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly ticks = [
    { val: -1, label: '-1' }, { val: 0, label: '0' }, { val: 0.5, label: '' },
    { val: 1, label: '1' }, { val: 1.5, label: '' }, { val: 2, label: '2' },
    { val: 2.5, label: '' }, { val: 3, label: '3' },
  ];

  readonly currentSeq = computed(() => COMMON_SEQUENCES[this.selIdx()]);
  readonly allTerms = computed(() => generateTerms(this.currentSeq().fn, 40));
  readonly visibleTerms = computed(() => this.allTerms().slice(0, this.visible()));
  readonly currentVal = computed(() => {
    const terms = this.visibleTerms();
    return terms.length ? terms[terms.length - 1].val.toFixed(6) : '—';
  });

  toX(v: number): number { return 50 + (v + 1) * 100; }

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
