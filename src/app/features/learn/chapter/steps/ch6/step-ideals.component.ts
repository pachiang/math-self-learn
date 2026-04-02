import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { isIdeal, zMul } from './ring-utils';

@Component({
  selector: 'app-step-ideals',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="理想：環版的正規子群" subtitle="\u00A76.4">
      <p>
        群有正規子群，可以拿來做商群。環的對應物叫<strong>理想</strong>（ideal）。
      </p>
      <p>
        理想 I 是環 R 的一個子集，滿足兩個條件：
      </p>
      <div class="conditions">
        <div class="cond">\u2460 (I, +) 是加法子群 — I 裡的元素加減後還在 I 裡</div>
        <div class="cond">\u2461 吸收乘法 — 任何 r \u2208 R、a \u2208 I，ra \u2208 I</div>
      </div>
      <p>
        最經典的理想：Z 裡的 nZ = {{ '{' }}...,-2n, -n, 0, n, 2n,...{{ '}' }}（n 的倍數）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="在 Z\u2081\u2082 裡勾選一個子集，看看是不是理想">
      <div class="n-info">環 = Z\u2081\u2082（模 12 的整數）</div>

      <!-- Element picker -->
      <div class="picker">
        @for (i of range; track i) {
          <button class="el-btn"
            [class.selected]="subset().has(i)"
            (click)="toggle(i)">{{ i }}</button>
        }
      </div>

      <!-- Presets -->
      <div class="presets">
        <span class="pl">快速範例：</span>
        <button class="preset" (click)="loadPreset([0,2,4,6,8,10])">2Z\u2081\u2082（偶數）</button>
        <button class="preset" (click)="loadPreset([0,3,6,9])">3Z\u2081\u2082</button>
        <button class="preset" (click)="loadPreset([0,4,8])">4Z\u2081\u2082</button>
        <button class="preset" (click)="loadPreset([0,6])">6Z\u2081\u2082</button>
        <button class="preset bad" (click)="loadPreset([0,1,3])">{{ '{' }}0,1,3{{ '}' }}（不是）</button>
      </div>

      <!-- Check result -->
      @if (subset().size > 0) {
        <div class="check-result" [class.yes]="check().ok" [class.no]="!check().ok">
          @if (check().ok) {
            \u2713 <strong>是理想！</strong> 加法封閉 \u2713，吸收乘法 \u2713
          } @else {
            <div>\u2717 <strong>不是理想</strong></div>
            @if (!check().addClosed) {
              <div class="fail-detail">加法不封閉：{{ check().addCounter }}</div>
            }
            @if (!check().absorbs) {
              <div class="fail-detail">不吸收乘法：{{ check().absorbCounter }}</div>
            }
          }
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <div class="parallel-box">
        <div class="par-title">群 vs 環：平行概念</div>
        <div class="par-row header">
          <span>群</span><span>環</span>
        </div>
        <div class="par-row"><span>子群</span><span>子環</span></div>
        <div class="par-row"><span>正規子群</span><span>理想</span></div>
        <div class="par-row"><span>商群 G/N</span><span>商環 R/I</span></div>
        <div class="par-row"><span>群同態</span><span>環同態</span></div>
      </div>
      <span class="hint">
        有了理想，就可以做「商環」— 就像商群一樣，
        把理想裡的元素全部「壓扁」成零。下一節見！
      </span>
    </app-prose-block>
  `,
  styles: `
    .conditions { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; }
    .cond {
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
      font-size: 13px; color: var(--text-secondary); background: var(--bg-surface);
    }

    .n-info { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }

    .picker { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
    .el-btn {
      width: 38px; height: 34px; border: 2px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 14px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.12s;
      &:hover { border-color: var(--border-strong); }
      &.selected { border-color: var(--accent); background: var(--accent-18); }
    }

    .presets { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 12px; }
    .pl { font-size: 12px; color: var(--text-muted); }
    .preset {
      padding: 3px 8px; border: 1px solid var(--border); border-radius: 4px;
      background: transparent; color: var(--text-secondary); font-size: 11px;
      font-family: 'JetBrains Mono', monospace; cursor: pointer;
      border-left: 3px solid #5a8a5a;
      &.bad { border-left-color: #a05a5a; }
      &:hover { background: var(--accent-10); }
    }

    .check-result {
      padding: 12px 16px; border-radius: 8px; font-size: 14px;
      &.yes { background: rgba(90,138,90,0.08); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.2); }
      &.no { background: rgba(160,90,90,0.08); color: #a05a5a; border: 1px solid rgba(160,90,90,0.2); }
      strong { font-weight: 700; }
    }
    .fail-detail { font-size: 12px; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

    .parallel-box { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: 14px 0; }
    .par-title { padding: 8px 14px; background: var(--accent-10); font-size: 12px; font-weight: 700; color: var(--accent); }
    .par-row {
      display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.header span { font-weight: 700; background: var(--bg-surface); color: var(--text); }
      span { padding: 6px 14px; font-size: 13px; color: var(--text-secondary);
        &:first-child { border-right: 1px solid var(--border); }
      }
    }
  `,
})
export class StepIdealsComponent {
  readonly range = Array.from({ length: 12 }, (_, i) => i);
  readonly subset = signal(new Set<number>());

  readonly check = computed(() => isIdeal(this.subset(), 12));

  toggle(i: number): void {
    this.subset.update((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  loadPreset(ids: number[]): void {
    this.subset.set(new Set(ids));
  }
}
