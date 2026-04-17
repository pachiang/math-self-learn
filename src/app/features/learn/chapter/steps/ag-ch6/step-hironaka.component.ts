import { Component, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Gallery item definition ── */

interface GalleryItem {
  key: string;
  title: string;
  eqBefore: string;
  eqAfter: string;
  badge: string;
  desc: string;
  beforeFn: (x: number, y: number) => number;
  afterFn: (x: number, y: number) => number;
}

const GALLERY: GalleryItem[] = [
  {
    key: 'node',
    title: '結點',
    eqBefore: 'y^2 = x^2(x+1)',
    eqAfter: 's^2 = x + 1',
    badge: '1 次 blowup',
    desc: '兩條分支在原點交叉。一次 blowup 將交叉點拉開為兩個不同的點。',
    beforeFn: (x, y) => y * y - x * x * (x + 1),
    afterFn: (x, y) => y * y - (x + 1),
  },
  {
    key: 'cusp',
    title: '尖點',
    eqBefore: 'y^2 = x^3',
    eqAfter: 'xu^2 = 1',
    badge: '2 次 blowup',
    desc: '分支折回自身，切線方向相同。需要兩次 blowup 才能完全分離。',
    beforeFn: (x, y) => y * y - x * x * x,
    afterFn: (x, y) => x * y * y - 1,
  },
  {
    key: 'tacnode',
    title: 'Tacnode',
    eqBefore: 'y^2 = x^4',
    eqAfter: 's^2 = 1',
    badge: '3 次 blowup',
    desc: '兩條分支以更高階相切。第一次 blowup 得到結點，再一次得到光滑。',
    beforeFn: (x, y) => y * y - x * x * x * x,
    // After 3 blowups: eventually two parallel lines s = +/- 1 (smooth)
    afterFn: (x, y) => y * y - 1,
  },
  {
    key: 'ramphoid',
    title: '高階尖點',
    eqBefore: 'y^3 = x^4',
    eqAfter: 'u^3 = 1',
    badge: '多次 blowup',
    desc: '三次方程的尖點比二次更複雜，需要更多次 blowup 消解。',
    beforeFn: (x, y) => y * y * y - x * x * x * x,
    // After resolution: three horizontal lines (smooth components)
    afterFn: (x, y) => y * y * y - 1,
  },
  {
    key: 'sharp',
    title: '極尖尖點',
    eqBefore: 'y^2 = x^5',
    eqAfter: 'u^2 = x',
    badge: '多次 blowup',
    desc: '奇異性越高，需要的 blowup 次數越多。Hironaka 定理保證必定終止。',
    beforeFn: (x, y) => y * y - x * x * x * x * x,
    // After sufficient blowups: a smooth parabola-like curve
    afterFn: (x, y) => y * y - x,
  },
];

/* ── Timeline items ── */

interface TimelineItem {
  year: string;
  text: string;
}

const TIMELINE: TimelineItem[] = [
  { year: '1964', text: 'Hironaka 證明特徵 0 的消解定理（Fields Medal 1970）' },
  { year: '1988', text: 'Mori 完成三維最小模型計劃（Fields Medal 1990）' },
  { year: '2010', text: 'Birkar-Cascini-Hacon-McKernan 證明高維翻轉的存在性' },
  { year: '2018', text: 'Birkar 因 Fano 簇的有界性獲 Fields Medal' },
];

@Component({
  selector: 'app-step-hironaka',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="Hironaka 定理與消解畫廊" subtitle="&sect;6.5">
      <p>
        廣中平祐（Heisuke Hironaka）在 1964 年證明了一個劃時代的結果（1970 年獲 Fields Medal）：
        在特徵零的域上，<strong>每一個</strong>代數簇都可以透過有限次 blowup 變得光滑。
        這就是<strong>奇異點消解定理</strong>（Resolution of Singularities）——代數幾何最深刻的定理之一。
      </p>
    </app-prose-block>

    <div class="katex-block">
      <app-math block [e]="formulaHironaka" />
    </div>

    <app-prose-block>
      <p>
        原始證明極為複雜（超過 200 頁）。Hironaka 的核心洞見是：
        為每個奇異點定義一個度量其「複雜度」的不變量，
        使得每次 blowup 都<strong>嚴格降低</strong>這個不變量。
        由於非負整數不存在無窮嚴格遞減序列，過程必然終止。
      </p>
      <p style="margin-top: 8px; color: var(--accent);">
        <strong>未解問題：</strong>正特徵（如 F<sub>p</sub> 上）在維度 &ge; 4 時的奇異點消解仍然未知！
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        消解過程將奇異簇 X 變換為光滑簇 X&#x0303;，
        透過 blowup 映射 &pi; 連結。
        &pi; 在奇異點之外是同構——它只改變有奇異性的地方。
        引入的「額外」部分是一組例外因子（exceptional divisors）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="消解畫廊——觀察各種奇異性的 before/after">
      <div class="gallery">
        @for (item of gallery; track item.key; let i = $index) {
          <div class="gallery-card">
            <div class="gc-header">
              <span class="gc-title">{{ item.title }}</span>
              <span class="gc-badge">{{ item.badge }}</span>
            </div>

            <div class="gc-panels">
              <!-- Before panel -->
              <div class="gc-panel">
                <div class="panel-label before-label">Before</div>
                <svg [attr.viewBox]="'0 0 ' + pv.svgW + ' ' + pv.svgH" class="panel-svg">
                  <path [attr.d]="galleryAxes" fill="none" stroke="var(--text-muted)" stroke-width="0.5" />
                  <path [attr.d]="beforePaths()[i]" fill="none" stroke="var(--accent)"
                        stroke-width="2" stroke-linecap="round" />
                  <!-- Singular marker at origin -->
                  <circle [attr.cx]="pvToSvgX(0)" [attr.cy]="pvToSvgY(0)" r="4"
                          fill="#cc4444" opacity="0.9" />
                </svg>
                <div class="panel-eq">
                  <app-math [e]="item.eqBefore" />
                </div>
              </div>

              <!-- Arrow -->
              <div class="panel-arrow">
                <svg width="28" height="24" viewBox="0 0 28 24">
                  <path d="M2,12 L22,12 M18,6 L24,12 L18,18" fill="none"
                        stroke="var(--accent)" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
              </div>

              <!-- After panel -->
              <div class="gc-panel">
                <div class="panel-label after-label">After</div>
                <svg [attr.viewBox]="'0 0 ' + pv.svgW + ' ' + pv.svgH" class="panel-svg">
                  <path [attr.d]="galleryAxes" fill="none" stroke="var(--text-muted)" stroke-width="0.5" />
                  <path [attr.d]="afterPaths()[i]" fill="none" stroke="#3a9a3a"
                        stroke-width="2" stroke-linecap="round" />
                </svg>
                <div class="panel-eq">
                  <app-math [e]="item.eqAfter" />
                </div>
              </div>
            </div>

            <div class="gc-desc">{{ item.desc }}</div>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block title="大圖景：從消解到分類">
      <p>
        奇異點消解是<strong>最小模型計劃</strong>（Minimal Model Program）的第一步——
        這個宏大的計劃旨在分類所有代數簇。
        消解奇異點後，再將光滑簇「化簡」到其最小形式。
        這個計劃由 Mori、Kawamata、Shokurov 和 Birkar（2018 年 Fields Medal）推進，
        是當代代數幾何的前沿。
      </p>
    </app-prose-block>

    <!-- Timeline -->
    <div class="timeline-section">
      <div class="timeline">
        @for (item of timeline; track item.year) {
          <div class="tl-item">
            <div class="tl-dot"></div>
            <div class="tl-content">
              <span class="tl-year">{{ item.year }}</span>
              <span class="tl-text">{{ item.text }}</span>
            </div>
          </div>
        }
        <div class="tl-line"></div>
      </div>
    </div>

    <app-prose-block>
      <p>
        從 Blowup 到消解，從消解到分類——代數幾何用代數工具解決幾何問題，
        用幾何直覺指引代數方向。這門學科在 21 世紀仍然生機勃勃，
        不斷揭示數學結構的深層對稱。
      </p>
    </app-prose-block>
  `,
  styles: `
    .katex-block {
      margin: 12px 0 16px; text-align: center;
    }

    /* ── Gallery ── */
    .gallery {
      display: flex; flex-direction: column; gap: 16px;
    }
    .gallery-card {
      border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); padding: 14px 16px;
      transition: border-color 0.2s;
    }
    .gallery-card:hover { border-color: var(--accent); }

    .gc-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px;
    }
    .gc-title {
      font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }
    .gc-badge {
      font-size: 10px; font-weight: 700; padding: 3px 10px;
      border-radius: 10px; background: var(--accent-10); color: var(--accent);
      font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .gc-panels {
      display: flex; align-items: center; gap: 4px; justify-content: center;
    }
    .gc-panel {
      flex: 1; max-width: 220px;
    }
    .panel-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; text-align: center; margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .before-label { color: #cc4444; }
    .after-label { color: #3a9a3a; }

    .panel-svg {
      width: 100%; display: block;
      border: 1px solid var(--border); border-radius: 6px; background: var(--bg);
    }
    .panel-eq {
      text-align: center; margin-top: 6px; font-size: 12px;
    }
    .panel-arrow {
      flex: 0 0 28px; display: flex; align-items: center; justify-content: center;
      padding-bottom: 24px;
    }

    .gc-desc {
      margin-top: 10px; font-size: 12px; color: var(--text-secondary);
      line-height: 1.6; padding: 0 2px;
    }

    /* ── Timeline ── */
    .timeline-section {
      margin: 20px 0; padding: 0 8px;
    }
    .timeline {
      position: relative; padding-left: 28px;
    }
    .tl-line {
      position: absolute; left: 8px; top: 4px; bottom: 4px; width: 2px;
      background: var(--border); border-radius: 1px;
    }
    .tl-item {
      position: relative; margin-bottom: 18px;
    }
    .tl-item:last-of-type { margin-bottom: 0; }
    .tl-dot {
      position: absolute; left: -24px; top: 4px;
      width: 12px; height: 12px; border-radius: 50%;
      background: var(--accent); border: 2px solid var(--bg);
      box-shadow: 0 0 0 2px var(--accent-18);
    }
    .tl-content {
      display: flex; flex-direction: column; gap: 2px;
    }
    .tl-year {
      font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }
    .tl-text {
      font-size: 12px; color: var(--text-secondary); line-height: 1.5;
    }
  `,
})
export class StepHironakaComponent {
  readonly gallery = GALLERY;
  readonly timeline = TIMELINE;

  /* ── Formula ── */
  readonly formulaHironaka = `\\text{Hironaka (1964):}\\; \\exists\\; \\pi: \\tilde{X} \\to X \\;\\text{s.t.}\\; \\tilde{X} \\text{ smooth, } \\pi \\text{ is a sequence of blowups}`;

  /* ── Gallery plot view (small panels) ── */
  readonly pv: PlotView = { xRange: [-2, 2.5], yRange: [-2, 2], svgW: 220, svgH: 180, pad: 18 };
  readonly galleryAxes = plotAxesPath(this.pv);

  pvToSvgX = (x: number) => plotToSvgX(this.pv, x);
  pvToSvgY = (y: number) => plotToSvgY(this.pv, y);

  /* ── Pre-compute all implicit curve paths ── */
  readonly beforePaths = computed(() =>
    GALLERY.map(item =>
      implicitCurve(item.beforeFn, this.pv.xRange, this.pv.yRange, this.pvToSvgX, this.pvToSvgY, 80),
    ),
  );

  readonly afterPaths = computed(() =>
    GALLERY.map(item =>
      implicitCurve(item.afterFn, this.pv.xRange, this.pv.yRange, this.pvToSvgX, this.pvToSvgY, 80),
    ),
  );
}
