import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-metric-topology',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從度量到拓撲" subtitle="§1.6">
      <p>
        每個度量空間 (X, d) 自然產生一個拓撲：U 是開集 ⟺ U 裡的每個點都有 ε-球包含在 U 裡。
      </p>
      <p class="formula">τ_d 的基底 = 所有 ε-球</p>
      <p>
        但不同的度量可能誘導<strong>相同的拓撲</strong>！
        關鍵在於：兩個度量的 ε-球能不能互相「包含」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 p 看 Lp 球的形狀——形狀不同但拓撲相同！">
      <div class="ctrl-row">
        <span class="cl">p = {{ pDisplay() }}</span>
        <input type="range" min="0.5" max="20" step="0.1" [value]="p()"
               (input)="p.set(+($any($event.target)).value)" class="sl" />
      </div>

      <div class="preset-row">
        <button class="pre-btn" (click)="p.set(1)">p=1 菱形</button>
        <button class="pre-btn" (click)="p.set(2)">p=2 圓</button>
        <button class="pre-btn" (click)="p.set(4)">p=4</button>
        <button class="pre-btn" (click)="p.set(20)">p=∞ 正方形</button>
        <button class="pre-btn" [class.active]="showAll()" (click)="showAll.update(v => !v)">
          {{ showAll() ? '◉ 隱藏疊加' : '◈ 顯示 1,2,∞ 疊加' }}
        </button>
      </div>

      <svg viewBox="-1.6 -1.6 3.2 3.2" class="ball-svg">
        <!-- Grid -->
        @for (g of [-1, 0, 1]; track g) {
          <line [attr.x1]="g" y1="-1.5" [attr.x2]="g" y2="1.5" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-1.5" [attr.y1]="g" x2="1.5" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- Reference balls (p=1, p=2, p=∞) when overlay is on -->
        @if (showAll()) {
          <path [attr.d]="ballPath(1)" fill="none" stroke="#bf6e6e" stroke-width="0.015" stroke-opacity="0.4" stroke-dasharray="0.04 0.03" />
          <path [attr.d]="ballPath(2)" fill="none" stroke="#6e9a6e" stroke-width="0.015" stroke-opacity="0.4" stroke-dasharray="0.04 0.03" />
          <path [attr.d]="ballPath(50)" fill="none" stroke="#6e8aa8" stroke-width="0.015" stroke-opacity="0.4" stroke-dasharray="0.04 0.03" />
        }

        <!-- Current Lp ball -->
        <path [attr.d]="ballPath(p())" [attr.fill]="p() < 1 ? 'rgba(160,90,90,0.1)' : 'rgba(var(--accent-rgb), 0.1)'"
              [attr.stroke]="p() < 1 ? '#a05a5a' : 'var(--accent)'" stroke-width="0.03" />

        <!-- Axis labels -->
        <text x="1.35" y="0.08" fill="var(--text-muted)" font-size="0.09">x</text>
        <text x="0.05" y="-1.3" fill="var(--text-muted)" font-size="0.09">y</text>
      </svg>

      @if (showAll()) {
        <div class="overlay-legend">
          <span><span class="dot" style="background:#bf6e6e"></span>p=1 菱形</span>
          <span><span class="dot" style="background:#6e9a6e"></span>p=2 圓</span>
          <span><span class="dot" style="background:#6e8aa8"></span>p=∞ 正方形</span>
          <span><span class="dot accent"></span>p={{ pDisplay() }}</span>
        </div>
      }

      <div class="info-row">
        <div class="i-card" [class.bad]="p() < 1" [class.ok]="p() >= 1">
          {{ p() < 1 ? 'p < 1：不滿足三角不等式' : 'p ≥ 1：合法的範數' }}
        </div>
        <div class="i-card">
          形狀不同，但拓撲相同！
        </div>
      </div>

      <div class="key-insight">
        <strong>菱形裡能塞圓，圓裡能塞菱形。</strong>
        所以它們定義的「開集」完全一樣——任何 d₁-開集也是 d₂-開集，反之亦然。
        <strong>不同的度量 → 相同的拓撲。</strong>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        並非所有拓撲都來自度量。<strong>可度量化</strong>（metrizable）是特殊的——
        不是每個拓撲空間都有度量。這就是為什麼拓撲比度量更一般。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .cl { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .sl { flex: 1; accent-color: var(--accent); height: 24px; }
    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); color: var(--accent); border-color: var(--accent); } }

    .ball-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }

    .overlay-legend { display: flex; gap: 12px; justify-content: center; margin-bottom: 10px;
      font-size: 11px; color: var(--text-muted); }
    .dot { display: inline-block; width: 10px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.accent { background: var(--accent); } }

    .info-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .i-card { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.06); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.06); color: #a05a5a; } }

    .key-insight { padding: 12px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent);
      font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.8; }
    .key-insight strong { color: var(--accent); }
  `,
})
export class StepMetricTopologyComponent {
  readonly p = signal(2);
  readonly showAll = signal(false);
  readonly pDisplay = computed(() => this.p() >= 20 ? '∞' : this.p().toFixed(1));

  ballPath(p: number): string {
    const N = 200;
    let path = '';
    for (let i = 0; i <= N; i++) {
      const theta = (2 * Math.PI * i) / N;
      const ct = Math.cos(theta), st = Math.sin(theta);
      let r: number;
      if (p >= 50) {
        r = 1 / Math.max(Math.abs(ct), Math.abs(st));
      } else {
        r = Math.pow(1 / (Math.pow(Math.abs(ct), p) + Math.pow(Math.abs(st), p)), 1 / p);
      }
      path += (i === 0 ? 'M' : 'L') + `${(r * ct).toFixed(4)},${(-r * st).toFixed(4)}`;
    }
    return path + 'Z';
  }
}
