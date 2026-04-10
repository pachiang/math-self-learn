import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFunction } from './analysis-ch4-util';

@Component({
  selector: 'app-step-extreme-value',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="極值定理" subtitle="§4.6">
      <p>
        <strong>極值定理</strong>：f 在閉區間 [a,b] 上連續 → f <strong>一定</strong>達到最大值和最小值。
      </p>
      <p class="formula">∃ c, d ∈ [a,b] 使得 f(c) ≤ f(x) ≤ f(d) ∀ x ∈ [a,b]</p>
      <p>三個條件都必要：</p>
      <ul>
        <li><strong>閉</strong>區間：開區間上 f(x)=x 沒有最大值</li>
        <li><strong>有界</strong>區間：f(x)=1/x 在 (0,∞) 沒有最大值</li>
        <li><strong>連續</strong>：跳躍函數可能跳過極值</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="三個「打破」按鈕——看哪個條件被拿掉後定理就失效">
      <div class="ctrl-row">
        <button class="pre-btn" [class.active]="mode() === 'ok'" (click)="mode.set('ok')">
          正常（閉+連續）
        </button>
        <button class="pre-btn" [class.active]="mode() === 'open'" (click)="mode.set('open')">
          開區間
        </button>
        <button class="pre-btn" [class.active]="mode() === 'disc'" (click)="mode.set('disc')">
          不連續
        </button>
      </div>

      <svg viewBox="0 0 500 250" class="ev-svg">
        <line x1="50" y1="200" x2="450" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="200" stroke="var(--border)" stroke-width="0.8" />

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Endpoints -->
        @if (mode() === 'ok') {
          <circle [attr.cx]="fx(0)" [attr.cy]="fy(fn(0))" r="5" fill="var(--accent)" stroke="white" stroke-width="1" />
          <circle [attr.cx]="fx(3)" [attr.cy]="fy(fn(3))" r="5" fill="var(--accent)" stroke="white" stroke-width="1" />
        } @else if (mode() === 'open') {
          <circle [attr.cx]="fx(0)" [attr.cy]="fy(fn(0.01))" r="5" fill="none" stroke="#a05a5a" stroke-width="2" />
          <circle [attr.cx]="fx(3)" [attr.cy]="fy(fn(2.99))" r="5" fill="none" stroke="#a05a5a" stroke-width="2" />
        }

        <!-- Max/min markers -->
        @if (mode() === 'ok') {
          <circle [attr.cx]="fx(maxX())" [attr.cy]="fy(maxY())" r="6"
                  fill="#5a8a5a" stroke="white" stroke-width="1.5" />
          <text [attr.x]="fx(maxX()) + 8" [attr.y]="fy(maxY()) - 5" class="ext-label">max</text>
          <circle [attr.cx]="fx(minX())" [attr.cy]="fy(minY())" r="6"
                  fill="#5a7faa" stroke="white" stroke-width="1.5" />
          <text [attr.x]="fx(minX()) + 8" [attr.y]="fy(minY()) + 12" class="ext-label">min</text>
        }
      </svg>

      <div class="verdict" [class.ok]="mode() === 'ok'" [class.bad]="mode() !== 'ok'">
        @if (mode() === 'ok') {
          ✓ 閉區間 + 連續 → 最大值 {{ maxY().toFixed(2) }} 和最小值 {{ minY().toFixed(2) }} 都達到
        } @else if (mode() === 'open') {
          ✗ 開區間 → 端點的值「接近但永遠到不了」→ sup 不被達到
        } @else {
          ✗ 不連續 → 函數可以「跳過」最大值
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>極值定理保證了<strong>最優化問題</strong>在閉區間上總有解。下一節看一個更深的性質——<strong>均勻連續</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ev-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .ext-label { font-size: 9px; fill: var(--text-muted); font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .verdict { padding: 10px; text-align: center; font-size: 13px; font-weight: 600; border-radius: 8px;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepExtremeValueComponent {
  readonly mode = signal<'ok' | 'open' | 'disc'>('ok');

  // f(x) = sin(2x) + x/3 on [0, 3]
  readonly fn = (x: number) => {
    if (this.mode() === 'disc' && Math.abs(x - 1.5) < 0.02) return -1; // artificial jump
    return Math.sin(2 * x) + x / 3;
  };

  readonly samples = computed(() => sampleFunction(this.fn, 0, 3, 200));

  readonly maxX = computed(() => { let mx = 0, my = -Infinity; for (const p of this.samples()) { if (p.y > my) { my = p.y; mx = p.x; } } return mx; });
  readonly maxY = computed(() => Math.max(...this.samples().map((p) => p.y)));
  readonly minX = computed(() => { let mx = 0, my = Infinity; for (const p of this.samples()) { if (p.y < my) { my = p.y; mx = p.x; } } return mx; });
  readonly minY = computed(() => Math.min(...this.samples().map((p) => p.y)));

  fx(x: number): number { return 50 + (x / 3) * 400; }
  fy(y: number): number { return 200 - ((y + 1.5) / 3.5) * 180; }

  curvePath(): string {
    const pts = this.samples();
    if (pts.length < 2) return '';
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
