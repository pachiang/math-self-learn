import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { type PlaneView, toSvg, axesPath } from './complex-util';

const VIEW: PlaneView = { cx: 0, cy: 0, radius: 2.5, svgW: 520, svgH: 400, pad: 30 };

interface SetPreset {
  name: string;
  label: string;
  formula: string;
  desc: string;
}

const PRESETS: SetPreset[] = [
  {
    name: 'disk',
    label: '開圓盤 D(0,1)',
    formula: String.raw`D(0,1) = \{z \in \mathbb{C} : |z| < 1\}`,
    desc: '以原點為圓心、半徑 1 的開圓盤。邊界 |z|=1 不包含在內（虛線表示開邊界）。這是複分析中最常見的定義域之一。',
  },
  {
    name: 'annulus',
    label: '圓環',
    formula: String.raw`A = \{z \in \mathbb{C} : 0.5 < |z| < 1.5\}`,
    desc: '內半徑 0.5、外半徑 1.5 的開圓環。Laurent 級數的自然定義域就是圓環。兩條邊界都是開的（虛線）。',
  },
  {
    name: 'upper',
    label: '上半平面',
    formula: String.raw`\mathbb{H} = \{z \in \mathbb{C} : \operatorname{Im}(z) > 0\}`,
    desc: '所有虛部為正的複數構成上半平面。這是一個開集，在共形映射和調和分析中扮演核心角色。',
  },
  {
    name: 'right',
    label: '右半平面',
    formula: String.raw`\{z \in \mathbb{C} : \operatorname{Re}(z) > 0\}`,
    desc: '所有實部為正的複數構成右半平面。Laplace 變換的收斂域通常是右半平面的形式。',
  },
];

@Component({
  selector: 'app-step-complex-sets',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="複數平面上的集合" subtitle="§1.4">
      <p>
        複分析研究的是定義在複數平面子集上的函數。在開始之前，我們需要認識幾種重要的集合。
      </p>
      <p>
        最基本的是<strong>開圓盤</strong>：以 z<sub>0</sub> 為圓心、r 為半徑的所有複數：
      </p>
      <app-math block [e]="formulaDisk" />
      <p>
        類似地，我們有閉圓盤（把 &lt; 改成 &le;）、圓（|z - z<sub>0</sub>| = r）、
        圓環（r<sub>1</sub> &lt; |z - z<sub>0</sub>| &lt; r<sub>2</sub>）、
        以及各種半平面。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選擇不同的集合，觀察它們在複數平面上的形狀">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">
            {{ p.label }}
          </button>
        }
      </div>

      <svg [attr.viewBox]="'0 0 ' + view.svgW + ' ' + view.svgH" class="plane-svg">
        <!-- Axes -->
        <path [attr.d]="axes" stroke="var(--border)" stroke-width="0.8" fill="none" />

        <!-- Axis labels -->
        <text [attr.x]="view.svgW - view.pad + 8" [attr.y]="originSvg[1] + 4"
              class="axis-label">Re</text>
        <text [attr.x]="originSvg[0] + 6" [attr.y]="view.pad - 6"
              class="axis-label">Im</text>

        <!-- Tick labels -->
        @for (t of tickLabels; track t.label) {
          <text [attr.x]="t.x" [attr.y]="t.y" class="tick-label">{{ t.label }}</text>
        }

        <!-- Region: Open disk D(0,1) -->
        @if (curName() === 'disk') {
          <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]" [attr.r]="toR(1)"
                  fill="var(--accent)" fill-opacity="0.12"
                  stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="6 4" />
        }

        <!-- Region: Annulus 0.5 < |z| < 1.5 -->
        @if (curName() === 'annulus') {
          <!-- Outer filled circle -->
          <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]" [attr.r]="toR(1.5)"
                  fill="var(--accent)" fill-opacity="0.12"
                  stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6 4" />
          <!-- Inner cutout (filled with bg to mask) -->
          <circle [attr.cx]="originSvg[0]" [attr.cy]="originSvg[1]" [attr.r]="toR(0.5)"
                  fill="var(--bg)"
                  stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6 4" />
        }

        <!-- Region: Upper half-plane Im(z) > 0 -->
        @if (curName() === 'upper') {
          <rect [attr.x]="view.pad" [attr.y]="view.pad"
                [attr.width]="view.svgW - 2 * view.pad"
                [attr.height]="originSvg[1] - view.pad"
                fill="var(--accent)" fill-opacity="0.12" />
          <line [attr.x1]="view.pad" [attr.y1]="originSvg[1]"
                [attr.x2]="view.svgW - view.pad" [attr.y2]="originSvg[1]"
                stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="6 4" />
        }

        <!-- Region: Right half-plane Re(z) > 0 -->
        @if (curName() === 'right') {
          <rect [attr.x]="originSvg[0]" [attr.y]="view.pad"
                [attr.width]="view.svgW - view.pad - originSvg[0]"
                [attr.height]="view.svgH - 2 * view.pad"
                fill="var(--accent)" fill-opacity="0.12" />
          <line [attr.x1]="originSvg[0]" [attr.y1]="view.pad"
                [attr.x2]="originSvg[0]" [attr.y2]="view.svgH - view.pad"
                stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="6 4" />
        }
      </svg>

      <div class="def-card">
        <div class="def-formula">
          <app-math block [e]="curFormula()" />
        </div>
        <div class="def-desc">{{ curDesc() }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這些集合是複分析的舞台——解析函數的定義域通常是開集。
        理解了它們的形狀，就為下一章的複變函數做好了準備。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent);
        color: var(--text); font-weight: 600; } }

    .plane-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }

    .axis-label { font-size: 10px; fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    .tick-label { font-size: 8px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }

    .def-card { padding: 14px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .def-formula { margin-bottom: 8px; }
    .def-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class StepComplexSetsComponent {
  readonly view = VIEW;
  readonly axes = axesPath(VIEW);
  readonly originSvg = toSvg(VIEW, [0, 0]);
  readonly presets = PRESETS;
  readonly selIdx = signal(0);

  readonly formulaDisk = String.raw`D(z_0, r) = \{z \in \mathbb{C} : |z - z_0| < r\}`;

  readonly curName = computed(() => PRESETS[this.selIdx()].name);
  readonly curFormula = computed(() => PRESETS[this.selIdx()].formula);
  readonly curDesc = computed(() => PRESETS[this.selIdx()].desc);

  /** Tick labels for integer grid values on both axes */
  readonly tickLabels = (() => {
    const labels: { x: number; y: number; label: string }[] = [];
    const [ox, oy] = toSvg(VIEW, [0, 0]);
    for (let k = -2; k <= 2; k++) {
      if (k === 0) continue;
      const [tx] = toSvg(VIEW, [k, 0]);
      labels.push({ x: tx, y: oy + 14, label: String(k) });
      const [, ty] = toSvg(VIEW, [0, k]);
      labels.push({ x: ox - 10, y: ty + 4, label: k + 'i' });
    }
    return labels;
  })();

  /** Convert a complex-plane radius to SVG pixel radius */
  toR(r: number): number {
    const [ox] = toSvg(VIEW, [0, 0]);
    const [rx] = toSvg(VIEW, [r, 0]);
    return rx - ox;
  }
}
