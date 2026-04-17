import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from './ag-util';

/* ── Presets ── */
interface ECPreset {
  label: string;
  a: number;
  b: number;
  desc: string;
}

const EC_PRESETS: ECPreset[] = [
  { label: '兩個分支', a: -1, b: 0, desc: '判別式 > 0，曲線有一個有界卵形和一個無界分支' },
  { label: '一個分支', a: 1, b: 0, desc: '判別式 < 0，曲線只有一個連通分支' },
  { label: '結點', a: -3, b: 2, desc: '判別式 = 0，曲線出現結點奇異點' },
  { label: '尖點', a: 0, b: 0, desc: '判別式 = 0，曲線在原點出現尖點' },
];

@Component({
  selector: 'app-step-curve-topology',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="曲線的虧格：形狀的「洞」" subtitle="§1.4">
      <p>
        代數曲線不只有形狀——它還有<strong>拓撲</strong>。
        <strong>虧格</strong>（genus）衡量一條光滑代數曲線的拓撲複雜度：它有多少個「洞」或「把手」。
      </p>
      <p>
        圓錐曲線（圓、橢圓）的虧格為 0——拓撲上等價於球面。
        橢圓曲線 y<sup>2</sup> = x<sup>3</sup> + ax + b 的虧格為 1——拓撲上等價於環面（甜甜圈）。
        更高次的曲線可以有更高的虧格。
      </p>
      <p>
        對光滑平面曲線，虧格由次數 d 決定：
      </p>
      <app-math block [e]="genusFormula"></app-math>
      <p>
        虧格約束了代數的可能性。例如，虧格 &ge; 1 的曲線無法被有理參數化（L&uuml;roth 定理）。
        換言之，<strong>拓撲決定了代數能做什麼</strong>。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        實際操作中，橢圓曲線 y<sup>2</sup> = x<sup>3</sup> + ax + b 的拓撲由<strong>判別式</strong>決定：
      </p>
      <app-math block [e]="discriminantFormula"></app-math>
      <ul>
        <li>
          <app-math [e]="'\\Delta > 0'" />：曲線有<strong>兩個</strong>連通分支（一個有界卵形加一個無界分支）
        </li>
        <li>
          <app-math [e]="'\\Delta < 0'" />：曲線只有<strong>一個</strong>連通分支
        </li>
        <li>
          <app-math [e]="'\\Delta = 0'" />：曲線出現<strong>奇異點</strong>（結點或尖點）——拓撲變化的臨界時刻
        </li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="拖動係數，觀察橢圓曲線如何從一個分支變成兩個分支——拓撲在你眼前改變">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.label; let i = $index) {
          <button class="pre-btn" [class.active]="paramA() === p.a && paramB() === p.b"
                  (click)="applyPreset(p)">{{ p.label }}</button>
        }
      </div>

      <!-- Sliders -->
      <div class="slider-row">
        <div class="slider-group">
          <span class="sl-label">a = {{ paramA().toFixed(2) }}</span>
          <input type="range" min="-3" max="1" step="0.05"
                 [value]="paramA()"
                 (input)="paramA.set(+($any($event.target)).value)"
                 class="sl-input" />
        </div>
        <div class="slider-group">
          <span class="sl-label">b = {{ paramB().toFixed(2) }}</span>
          <input type="range" min="-2" max="2" step="0.05"
                 [value]="paramB()"
                 (input)="paramB.set(+($any($event.target)).value)"
                 class="sl-input" />
        </div>
      </div>

      <!-- Main SVG with inset -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Implicit curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.2"
              stroke-linecap="round" />

        <!-- ── Inset: discriminant locus in (a,b) parameter space ── -->
        <g>
          <!-- Background -->
          <rect [attr.x]="insetX" [attr.y]="insetY"
                [attr.width]="insetSize" [attr.height]="insetSize"
                rx="6" fill="var(--bg)" fill-opacity="0.92"
                stroke="var(--border)" stroke-width="1" />

          <!-- Inset axes -->
          <line [attr.x1]="insetX + 10" [attr.y1]="insetCenterY"
                [attr.x2]="insetX + insetSize - 10" [attr.y2]="insetCenterY"
                stroke="var(--text-muted)" stroke-width="0.5" />
          <line [attr.x1]="insetCenterX" [attr.y1]="insetY + 10"
                [attr.x2]="insetCenterX" [attr.y2]="insetY + insetSize - 10"
                stroke="var(--text-muted)" stroke-width="0.5" />

          <!-- Discriminant curve Δ=0 in (a,b) space -->
          <path [attr.d]="insetDiscPath()" fill="none"
                stroke="var(--text-secondary)" stroke-width="1.2"
                stroke-dasharray="3 2" />

          <!-- Current (a,b) dot -->
          <circle [attr.cx]="insetDotX()" [attr.cy]="insetDotY()" r="4"
                  [attr.fill]="badgeColor()" stroke="var(--bg)" stroke-width="1.5" />

          <!-- Labels -->
          <text [attr.x]="insetX + insetSize - 12" [attr.y]="insetCenterY - 4"
                class="inset-label">a</text>
          <text [attr.x]="insetCenterX + 4" [attr.y]="insetY + 16"
                class="inset-label">b</text>
          <text [attr.x]="insetX + insetSize / 2" [attr.y]="insetY + insetSize + 12"
                class="inset-title">參數空間 (a, b)</text>
        </g>
      </svg>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">係數</div>
          <div class="ic-body">a = {{ paramA().toFixed(2) }}, b = {{ paramB().toFixed(2) }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">判別式</div>
          <div class="ic-body">
            <app-math [e]="'\\Delta = -4a^3 - 27b^2'" /> = {{ discriminant().toFixed(3) }}
          </div>
        </div>
        <div class="info-card badge-card" [style.border-color]="badgeColor()">
          <div class="ic-badge" [style.background]="badgeColor()">{{ topologyLabel() }}</div>
        </div>
      </div>

      <!-- Preset description -->
      @if (activePresetDesc(); as desc) {
        <div class="preset-desc">{{ desc }}</div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        橢圓曲線是代數幾何最重要的研究對象之一。它的虧格恰好是
        1——足夠簡單可以計算，又足夠複雜有豐富結構。事實上，2018
        年 Peter Scholze 的 Fields 獎工作就大量涉及橢圓曲線和它的推廣。下一節看如何用射影空間把曲線「補完」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    }
    .pre-btn {
      padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }
    .slider-row {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .slider-group {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 160px;
    }
    .sl-label {
      font-size: 12px; font-weight: 600; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 90px;
    }
    .sl-input { flex: 1; accent-color: var(--accent); }

    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .inset-label {
      font-size: 8px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .inset-title {
      font-size: 8px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .info-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 120px; padding: 10px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .badge-card {
      display: flex; align-items: center; justify-content: center; border-width: 2px;
    }
    .ic-badge {
      padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;
      color: #fff; font-family: 'JetBrains Mono', monospace;
    }

    .preset-desc {
      padding: 8px 12px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); font-size: 11px; color: var(--text-secondary);
      text-align: center;
    }
  `,
})
export class StepCurveTopologyComponent {
  readonly presets = EC_PRESETS;

  readonly genusFormula = `g = \\frac{(d-1)(d-2)}{2}`;
  readonly discriminantFormula = `\\Delta = -4a^3 - 27b^2`;

  readonly v: PlotView = { xRange: [-3, 3], yRange: [-3, 3], svgW: 520, svgH: 420, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  readonly paramA = signal(-1);
  readonly paramB = signal(0);

  /* ── Discriminant ── */
  readonly discriminant = computed(() => {
    const a = this.paramA();
    const b = this.paramB();
    return -4 * a * a * a - 27 * b * b;
  });

  readonly topologyLabel = computed(() => {
    const d = this.discriminant();
    if (Math.abs(d) < 0.05) return '奇異！(\u0394=0)';
    return d > 0 ? '兩個分支 (\u0394>0)' : '一個分支 (\u0394<0)';
  });

  readonly badgeColor = computed(() => {
    const d = this.discriminant();
    if (Math.abs(d) < 0.05) return '#aa5a6a';
    return d > 0 ? '#5a7faa' : '#6a8a5a';
  });

  /* ── Main curve path ── */
  readonly curvePath = computed(() => {
    const a = this.paramA();
    const b = this.paramB();
    return implicitCurve(
      (x, y) => y * y - x * x * x - a * x - b,
      this.v.xRange, this.v.yRange,
      (x) => plotToSvgX(this.v, x),
      (y) => plotToSvgY(this.v, y),
      120,
    );
  });

  /* ── Inset: discriminant locus in (a,b) parameter space ── */
  readonly insetSize = 120;
  readonly insetX = 520 - 120 - 14;   // top-right corner
  readonly insetY = 14;
  readonly insetCenterX = this.insetX + this.insetSize / 2;
  readonly insetCenterY = this.insetY + this.insetSize / 2;

  // Map a-range [-3,1] and b-range [-2,2] into the inset rect
  private insetMapA(a: number): number {
    return this.insetX + 10 + ((a - (-3)) / (1 - (-3))) * (this.insetSize - 20);
  }
  private insetMapB(b: number): number {
    // b increases upward, SVG y increases downward
    return this.insetY + this.insetSize - 10 - ((b - (-2)) / (2 - (-2))) * (this.insetSize - 20);
  }

  readonly insetDotX = computed(() => this.insetMapA(this.paramA()));
  readonly insetDotY = computed(() => this.insetMapB(this.paramB()));

  /** Draw the discriminant locus -4a^3 - 27b^2 = 0, i.e. b = +-sqrt(-4a^3/27) for a<=0 */
  readonly insetDiscPath = computed(() => {
    let d = '';
    // Upper branch: b = sqrt(-4a^3/27) for a in [-3, 0]
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const a = -3 + (i / steps) * 3; // a from -3 to 0
      const val = -4 * a * a * a / 27;
      if (val < 0) continue;
      const b = Math.sqrt(val);
      const sx = this.insetMapA(a);
      const sy = this.insetMapB(b);
      d += (d === '' ? 'M' : 'L') + sx.toFixed(1) + ',' + sy.toFixed(1);
    }
    // Continue with lower branch in reverse: b = -sqrt(-4a^3/27) for a from 0 to -3
    for (let i = 0; i <= steps; i++) {
      const a = -(i / steps) * 3; // a from 0 to -3
      const val = -4 * a * a * a / 27;
      if (val < 0) continue;
      const b = -Math.sqrt(val);
      const sx = this.insetMapA(a);
      const sy = this.insetMapB(b);
      d += 'L' + sx.toFixed(1) + ',' + sy.toFixed(1);
    }
    return d;
  });

  readonly activePresetDesc = computed(() => {
    const a = this.paramA();
    const b = this.paramB();
    const match = EC_PRESETS.find(p => p.a === a && p.b === b);
    return match?.desc ?? '';
  });

  applyPreset(p: ECPreset): void {
    this.paramA.set(p.a);
    this.paramB.set(p.b);
  }
}
