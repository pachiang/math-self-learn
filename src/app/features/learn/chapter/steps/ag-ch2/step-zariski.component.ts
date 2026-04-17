import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Topology presets ── */

type TopologyStatus = 'open' | 'closed' | 'neither';

interface TopoPreset {
  key: string;
  label: string;
  desc: string;
  /** The variety / curve function for drawing: f(x,y)=0 is the variety */
  varietyFn: ((x: number, y: number) => number) | null;
  /** For shading in the Zariski panel: which region is "the set"? */
  zariskiStatus: TopologyStatus;
  zariskiNote: string;
  euclideanStatus: TopologyStatus;
  euclideanNote: string;
  /** Type of Zariski visualization */
  zariskiType: 'open-complement' | 'closed-variety' | 'invalid';
  /** For Euclidean panel: region test (x,y) => boolean, true = in the set */
  euclideanRegion: ((x: number, y: number) => boolean) | null;
  /** Euclidean boundary function (if any) for drawing boundary curve */
  euclideanBoundaryFn: ((x: number, y: number) => number) | null;
}

const PRESETS: TopoPreset[] = [
  {
    key: 'd-x',
    label: 'D(x) = \u211D\u00B2 \\ {x=0}',
    desc: 'D(x) 是 y 軸的補集。Zariski 開集（V(x) 的補集）。歐氏拓撲中也是開集。',
    varietyFn: (x, _y) => x,
    zariskiStatus: 'open',
    zariskiNote: 'D(x) = k\u00B2 \\ V(x) : Zariski 開集',
    euclideanStatus: 'open',
    euclideanNote: '歐氏拓撲中也是開集（y 軸的補集）',
    zariskiType: 'open-complement',
    euclideanRegion: (x, _y) => Math.abs(x) > 0.02,
    euclideanBoundaryFn: (x, _y) => x,
  },
  {
    key: 'd-xy',
    label: 'D(xy) = \u211D\u00B2 \\ {xy=0}',
    desc: 'D(xy) 是兩條座標軸的補集。Zariski 開集。歐氏拓撲中也是開集。',
    varietyFn: (x, y) => x * y,
    zariskiStatus: 'open',
    zariskiNote: 'D(xy) = k\u00B2 \\ V(xy) : Zariski 開集',
    euclideanStatus: 'open',
    euclideanNote: '歐氏拓撲中也是開集（兩軸的補集）',
    zariskiType: 'open-complement',
    euclideanRegion: (x, y) => Math.abs(x) > 0.02 && Math.abs(y) > 0.02,
    euclideanBoundaryFn: (x, y) => x * y,
  },
  {
    key: 'd-circle',
    label: 'D(x\u00B2+y\u00B2-1)',
    desc: 'D(x\u00B2+y\u00B2-1) 是單位圓的補集（圓內和圓外）。Zariski 開集。歐氏拓撲中也是開集——但它不連通！',
    varietyFn: (x, y) => x * x + y * y - 1,
    zariskiStatus: 'open',
    zariskiNote: 'D(x\u00B2+y\u00B2-1) = k\u00B2 \\ V(x\u00B2+y\u00B2-1) : Zariski 開集',
    euclideanStatus: 'open',
    euclideanNote: '歐氏開集（但不連通：圓內 + 圓外）',
    zariskiType: 'open-complement',
    euclideanRegion: (x, y) => Math.abs(x * x + y * y - 1) > 0.02,
    euclideanBoundaryFn: (x, y) => x * x + y * y - 1,
  },
  {
    key: 'open-disk',
    label: '開圓盤 x\u00B2+y\u00B2 < 1',
    desc: '開圓盤是歐氏開集，但不是 Zariski 開集——沒有多項式 f 使得 D(f) 恰好等於圓盤內部。D(x\u00B2+y\u00B2-1) 包含圓內和圓外兩部分！',
    varietyFn: (x, y) => x * x + y * y - 1,
    zariskiStatus: 'neither',
    zariskiNote: '非 Zariski 開集（無法表示為 D(f) 的形式）',
    euclideanStatus: 'open',
    euclideanNote: '歐氏開集（開圓盤）',
    zariskiType: 'invalid',
    euclideanRegion: (x, y) => x * x + y * y < 1,
    euclideanBoundaryFn: (x, y) => x * x + y * y - 1,
  },
  {
    key: 'finite-pts',
    label: '有限點集 {(0,0), (1,0)}',
    desc: '有限點集是 Zariski 閉集：V(x(x-1), y) = {(0,0), (1,0)}。歐氏拓撲中也是閉集。有限點集在 Zariski 拓撲下是「很小的」閉集。',
    varietyFn: null,
    zariskiStatus: 'closed',
    zariskiNote: 'Zariski 閉集：V(x(x-1), y)',
    euclideanStatus: 'closed',
    euclideanNote: '歐氏閉集（有限點集）',
    zariskiType: 'closed-variety',
    euclideanRegion: null,
    euclideanBoundaryFn: null,
  },
];

/* ── Panel config ── */

const PANEL_W = 250;
const PANEL_H = 250;
const PANEL_PAD = 22;

@Component({
  selector: 'app-step-zariski',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Zariski 拓撲：代數幾何的「視力」" subtitle="\u00A72.5">
      <p>
        在 k&#xB2; 上定義<strong>Zariski 拓撲</strong>：閉集恰好是代數簇——多項式的零點集。
        開集則是簇的補集。
      </p>
      <app-math block [e]="formulaClosed"></app-math>
      <app-math block [e]="formulaOpen"></app-math>
      <p>
        這滿足拓撲公理：空集和 k&#xB2; 是閉的，閉集的有限聯集是閉的，
        閉集的任意交集是閉的。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        Zariski 拓撲比歐氏拓撲<strong>粗糙得多</strong>：
      </p>
      <ul>
        <li>Zariski 開集 = 有限多條曲線的補集——所以它幾乎是「整個空間」</li>
        <li>Zariski 閉集 = 曲線、有限點集、或整個空間</li>
        <li>開圓盤 &#123; x&#xB2;+y&#xB2; &lt; 1 &#125; <strong>不是</strong> Zariski 開集！</li>
        <li>兩個非空 Zariski 開集<strong>必定相交</strong>（不像歐氏拓撲）</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="比較 Zariski 拓撲和歐氏拓撲——同一個集合，兩種完全不同的「開」">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i"
                  (click)="selIdx.set(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Dual panels -->
      <div class="dual-panel">
        <!-- Zariski panel -->
        <div class="panel-col">
          <div class="panel-title">Zariski 拓撲</div>
          <svg [attr.viewBox]="'0 0 ' + panelW + ' ' + panelH" class="panel-svg">
            <!-- Background shading for open-complement sets -->
            @if (curPreset().zariskiType === 'open-complement') {
              <rect [attr.x]="zPad" [attr.y]="zPad"
                    [attr.width]="panelW - 2 * zPad" [attr.height]="panelH - 2 * zPad"
                    rx="4" fill="var(--accent)" fill-opacity="0.08" />
            }

            <!-- Axes -->
            <path [attr.d]="zariskiAxes" fill="none" stroke="var(--text-muted)" stroke-width="0.6" />

            <!-- Variety curve (the closed set / removed part) -->
            @if (curPreset().zariskiType === 'open-complement') {
              <path [attr.d]="zariskiVarietyPath()" fill="none" stroke="var(--accent)"
                    stroke-width="3" stroke-linecap="round" />
            }

            <!-- For closed-variety (finite points): draw dots -->
            @if (curPreset().zariskiType === 'closed-variety') {
              <circle [attr.cx]="zToSvgX(0)" [attr.cy]="zToSvgY(0)" r="6"
                      fill="var(--accent)" fill-opacity="0.7" stroke="var(--accent)" stroke-width="1.5" />
              <circle [attr.cx]="zToSvgX(1)" [attr.cy]="zToSvgY(0)" r="6"
                      fill="var(--accent)" fill-opacity="0.7" stroke="var(--accent)" stroke-width="1.5" />
            }

            <!-- For invalid (open disk): show the boundary and an X mark -->
            @if (curPreset().zariskiType === 'invalid') {
              <path [attr.d]="zariskiVarietyPath()" fill="none" stroke="var(--text-muted)"
                    stroke-width="1.5" stroke-dasharray="4 3" stroke-linecap="round" />
              <!-- X mark in the center -->
              <line [attr.x1]="panelW/2 - 14" [attr.y1]="panelH/2 - 14"
                    [attr.x2]="panelW/2 + 14" [attr.y2]="panelH/2 + 14"
                    stroke="#aa4444" stroke-width="2.5" stroke-linecap="round" />
              <line [attr.x1]="panelW/2 + 14" [attr.y1]="panelH/2 - 14"
                    [attr.x2]="panelW/2 - 14" [attr.y2]="panelH/2 + 14"
                    stroke="#aa4444" stroke-width="2.5" stroke-linecap="round" />
              <text [attr.x]="panelW/2" [attr.y]="panelH/2 + 36"
                    text-anchor="middle" class="invalid-label">非 Zariski 開集</text>
            }

            <!-- Status badge -->
            <rect x="4" [attr.y]="panelH - 22" width="80" height="18" rx="4"
                  [attr.fill]="zariskiBadgeColor()" fill-opacity="0.15" />
            <text x="44" [attr.y]="panelH - 9" text-anchor="middle"
                  class="badge-text" [attr.fill]="zariskiBadgeColor()">
              {{ zariskiBadgeText() }}
            </text>
          </svg>
        </div>

        <!-- Euclidean panel -->
        <div class="panel-col">
          <div class="panel-title">歐氏拓撲</div>
          <svg [attr.viewBox]="'0 0 ' + panelW + ' ' + panelH" class="panel-svg">
            <!-- Shaded region for Euclidean sets -->
            @for (cell of euclideanCells(); track cell.idx) {
              @if (cell.inside) {
                <rect [attr.x]="cell.sx" [attr.y]="cell.sy"
                      [attr.width]="cell.w" [attr.height]="cell.h"
                      fill="var(--accent)" fill-opacity="0.10" />
              }
            }

            <!-- Axes -->
            <path [attr.d]="euclideanAxes" fill="none" stroke="var(--text-muted)" stroke-width="0.6" />

            <!-- Boundary curve -->
            @if (euclideanBoundaryPath()) {
              <path [attr.d]="euclideanBoundaryPath()" fill="none" stroke="var(--accent)"
                    stroke-width="1.8" stroke-linecap="round" />
            }

            <!-- For finite points: draw dots -->
            @if (curPreset().key === 'finite-pts') {
              <circle [attr.cx]="eToSvgX(0)" [attr.cy]="eToSvgY(0)" r="6"
                      fill="var(--accent)" fill-opacity="0.7" stroke="var(--accent)" stroke-width="1.5" />
              <circle [attr.cx]="eToSvgX(1)" [attr.cy]="eToSvgY(0)" r="6"
                      fill="var(--accent)" fill-opacity="0.7" stroke="var(--accent)" stroke-width="1.5" />
            }

            <!-- Status badge -->
            <rect x="4" [attr.y]="panelH - 22" width="80" height="18" rx="4"
                  [attr.fill]="euclideanBadgeColor()" fill-opacity="0.15" />
            <text x="44" [attr.y]="panelH - 9" text-anchor="middle"
                  class="badge-text" [attr.fill]="euclideanBadgeColor()">
              {{ euclideanBadgeText() }}
            </text>
          </svg>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">Zariski</div>
          <div class="ic-note">{{ curPreset().zariskiNote }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">歐氏</div>
          <div class="ic-note">{{ curPreset().euclideanNote }}</div>
        </div>
      </div>

      <!-- Description -->
      <div class="desc-box">{{ curPreset().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Zariski 拓撲看起來粗糙得不可思議——但它恰好捕捉了「代數性質」。
        在 Zariski 拓撲下，一個集合是閉的當且僅當它能被多項式方程定義。
        這使得代數和拓撲完美結合。事實上，現代代數幾何中的 Grothendieck 拓撲更進一步推廣了這個想法。
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

    .dual-panel {
      display: flex; gap: 12px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .panel-col {
      flex: 1; min-width: 230px;
    }
    .panel-title {
      font-size: 12px; font-weight: 700; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      text-align: center; margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .panel-svg {
      width: 100%; display: block;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }

    .badge-text {
      font-size: 10px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .invalid-label {
      font-size: 11px; fill: #aa4444; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .info-row {
      display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 140px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 13px;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .ic-note {
      font-size: 12px; color: var(--text-secondary); line-height: 1.5;
    }

    .desc-box {
      padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); font-size: 12px; color: var(--text-secondary);
      line-height: 1.6;
    }
  `,
})
export class StepZariskiComponent {
  readonly presets = PRESETS;
  readonly panelW = PANEL_W;
  readonly panelH = PANEL_H;
  readonly zPad = PANEL_PAD;

  readonly formulaClosed = `\\text{Closed: } V(S) \\quad\\text{for } S \\subseteq k[x,y]`;
  readonly formulaOpen = `\\text{Open: } D(f) = k^2 \\setminus V(f) = \\{p : f(p) \\neq 0\\}`;

  /* ── Panel plot views ── */
  readonly zView: PlotView = {
    xRange: [-3, 3], yRange: [-3, 3],
    svgW: PANEL_W, svgH: PANEL_H, pad: PANEL_PAD,
  };
  readonly eView: PlotView = {
    xRange: [-3, 3], yRange: [-3, 3],
    svgW: PANEL_W, svgH: PANEL_H, pad: PANEL_PAD,
  };

  readonly zariskiAxes = plotAxesPath(this.zView);
  readonly euclideanAxes = plotAxesPath(this.eView);

  readonly selIdx = signal(0);
  readonly curPreset = computed(() => PRESETS[this.selIdx()]);

  readonly zToSvgX = (x: number) => plotToSvgX(this.zView, x);
  readonly zToSvgY = (y: number) => plotToSvgY(this.zView, y);
  readonly eToSvgX = (x: number) => plotToSvgX(this.eView, x);
  readonly eToSvgY = (y: number) => plotToSvgY(this.eView, y);

  /* ── Zariski panel variety path ── */
  readonly zariskiVarietyPath = computed(() => {
    const preset = this.curPreset();
    if (!preset.varietyFn) return '';
    return implicitCurve(
      preset.varietyFn,
      this.zView.xRange, this.zView.yRange,
      this.zToSvgX, this.zToSvgY, 100,
    );
  });

  /* ── Euclidean panel boundary path ── */
  readonly euclideanBoundaryPath = computed(() => {
    const preset = this.curPreset();
    if (!preset.euclideanBoundaryFn) return '';
    return implicitCurve(
      preset.euclideanBoundaryFn,
      this.eView.xRange, this.eView.yRange,
      this.eToSvgX, this.eToSvgY, 100,
    );
  });

  /* ── Euclidean shading cells ── */
  readonly euclideanCells = computed(() => {
    const preset = this.curPreset();
    const regionFn = preset.euclideanRegion;
    if (!regionFn) return [];

    const cells: { idx: number; sx: number; sy: number; w: number; h: number; inside: boolean }[] = [];
    const N = 40;
    const [x0, x1] = this.eView.xRange;
    const [y0, y1] = this.eView.yRange;
    const dx = (x1 - x0) / N;
    const dy = (y1 - y0) / N;
    let idx = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const cx = x0 + (i + 0.5) * dx;
        const cy = y0 + (j + 0.5) * dy;
        const inside = regionFn(cx, cy);
        if (inside) {
          const sx = plotToSvgX(this.eView, x0 + i * dx);
          const sy = plotToSvgY(this.eView, y0 + (j + 1) * dy);
          const sw = plotToSvgX(this.eView, x0 + (i + 1) * dx) - sx;
          const sh = plotToSvgY(this.eView, y0 + j * dy) - sy;
          cells.push({ idx: idx++, sx, sy, w: sw, h: sh, inside });
        }
      }
    }
    return cells;
  });

  /* ── Badge helpers ── */

  zariskiBadgeColor(): string {
    const s = this.curPreset().zariskiStatus;
    if (s === 'open') return '#5a8a5a';
    if (s === 'closed') return '#5a6a7a';
    return '#aa4444';
  }

  zariskiBadgeText(): string {
    const s = this.curPreset().zariskiStatus;
    if (s === 'open') return '開集';
    if (s === 'closed') return '閉集';
    return '非開非閉';
  }

  euclideanBadgeColor(): string {
    const s = this.curPreset().euclideanStatus;
    if (s === 'open') return '#5a8a5a';
    if (s === 'closed') return '#5a6a7a';
    return '#aa4444';
  }

  euclideanBadgeText(): string {
    const s = this.curPreset().euclideanStatus;
    if (s === 'open') return '開集';
    if (s === 'closed') return '閉集';
    return '非開非閉';
  }
}
