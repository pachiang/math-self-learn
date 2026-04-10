import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Ball { center: number; radius: number; }

@Component({
  selector: 'app-step-compactness',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="緊緻性" subtitle="§8.6">
      <p>
        <strong>緊緻</strong>：任何開覆蓋都有有限子覆蓋。
      </p>
      <p>
        <strong>Heine-Borel</strong>（Rⁿ 中）：緊緻 ⟺ 閉且有界。
      </p>
      <p>
        為什麼緊緻重要？它保證：
      </p>
      <ul>
        <li>連續函數有最大最小值（極值定理 Ch4）</li>
        <li>連續函數均勻連續（Heine-Cantor Ch4）</li>
        <li>數列有收斂子列（BW 推廣）</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="開覆蓋遊戲：用 open balls 蓋住 [0,1]">
      <div class="mode-row">
        <button class="pre-btn" [class.active]="mode() === 'closed'" (click)="switchMode('closed')">
          [0, 1]（緊緻）
        </button>
        <button class="pre-btn" [class.active]="mode() === 'open'" (click)="switchMode('open')">
          (0, 1)（不緊緻）
        </button>
        <button class="act-btn" (click)="addBall()">+ 加一個球</button>
        <button class="act-btn reset" (click)="clearBalls()">清除</button>
      </div>

      <svg viewBox="-20 -40 540 100" class="cover-svg">
        <!-- The set -->
        <line [attr.x1]="toX(0)" y1="30" [attr.x2]="toX(1)" y2="30"
              stroke="var(--accent)" stroke-width="3" />
        @if (mode() === 'closed') {
          <circle [attr.cx]="toX(0)" cy="30" r="4" fill="var(--accent)" />
          <circle [attr.cx]="toX(1)" cy="30" r="4" fill="var(--accent)" />
        } @else {
          <circle [attr.cx]="toX(0)" cy="30" r="4" fill="none" stroke="var(--accent)" stroke-width="1.5" />
          <circle [attr.cx]="toX(1)" cy="30" r="4" fill="none" stroke="var(--accent)" stroke-width="1.5" />
        }

        <!-- Open balls (covering intervals) -->
        @for (b of balls(); track $index; let i = $index) {
          <rect [attr.x]="toX(b.center - b.radius)" y="18" [attr.width]="Math.max(1, toX(b.center + b.radius) - toX(b.center - b.radius))"
                height="24" fill="#5a8a5a" fill-opacity="0.12" stroke="#5a8a5a" stroke-width="0.8" rx="4" />
        }

        <!-- Coverage indicator -->
        <text x="260" y="-10" class="cover-label">
          {{ balls().length }} 個球　{{ covered() ? '已覆蓋 ✓' : '尚未覆蓋' }}
        </text>
      </svg>

      <div class="verdict" [class.ok]="covered()" [class.partial]="!covered()">
        @if (mode() === 'closed' && covered()) {
          ✓ 有限個球蓋住了 [0,1]！Heine-Borel：閉且有界 → 緊緻。
        } @else if (mode() === 'open' && balls().length > 10) {
          ⚠ (0,1) 不是緊緻的——邊界附近永遠需要更多球。
        } @else {
          繼續加球…
        }
      </div>

      <div class="hb-table">
        <table class="hb">
          <thead><tr><th>集合</th><th>閉？</th><th>有界？</th><th>緊緻？</th></tr></thead>
          <tbody>
            <tr><td>[0,1]</td><td class="ok">✓</td><td class="ok">✓</td><td class="ok">✓</td></tr>
            <tr><td>(0,1)</td><td class="bad">✗</td><td class="ok">✓</td><td class="bad">✗</td></tr>
            <tr><td>[0,∞)</td><td class="ok">✓</td><td class="bad">✗</td><td class="bad">✗</td></tr>
            <tr><td>R</td><td class="ok">✓</td><td class="bad">✗</td><td class="bad">✗</td></tr>
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看度量空間的另一個拓撲性質——<strong>連通性</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .mode-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .act-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); } &.reset { color: var(--text-muted); } }
    .cover-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .cover-label { font-size: 10px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .verdict { padding: 10px; text-align: center; font-size: 13px; font-weight: 600;
      border-radius: 8px; margin-bottom: 12px;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.partial { background: rgba(200,152,59,0.08); color: #c8983b; } }
    .hb-table { overflow-x: auto; }
    .hb { width: 100%; border-collapse: collapse; font-size: 13px; }
    .hb th { padding: 6px 10px; text-align: center; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; }
    .hb td { padding: 6px 10px; text-align: center; border-bottom: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      &.ok { color: #5a8a5a; font-weight: 700; } &.bad { color: #a05a5a; font-weight: 700; } }
  `,
})
export class StepCompactnessComponent {
  readonly Math = Math;
  readonly mode = signal<'closed' | 'open'>('closed');
  readonly balls = signal<Ball[]>([]);

  readonly covered = computed(() => {
    const bs = this.balls();
    if (bs.length === 0) return false;
    // Check if union of balls covers [0,1] (or (0,1))
    const step = 0.005;
    for (let x = 0; x <= 1; x += step) {
      if (this.mode() === 'open' && (x < 0.001 || x > 0.999)) continue;
      const inBall = bs.some((b) => Math.abs(x - b.center) < b.radius);
      if (!inBall) return false;
    }
    return true;
  });

  toX(v: number): number { return 20 + v * 460; }

  switchMode(m: 'closed' | 'open'): void {
    this.mode.set(m);
    this.balls.set([]);
  }

  addBall(): void {
    // Add a random ball that partially covers [0,1]
    const center = Math.random();
    const radius = 0.1 + Math.random() * 0.3;
    this.balls.update((bs) => [...bs, { center, radius }]);
  }

  clearBalls(): void { this.balls.set([]); }
}
