import {
  Component,
  ElementRef,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Example {
  name: string;
  A: [number, number, number];
  desc: string;
}

const EXAMPLES: Example[] = [
  {
    name: '圓碗',
    A: [1, 0, 1],
    desc: 'x² + y²：每個方向都一樣貴，像一個標準碗。',
  },
  {
    name: '斜橢圓',
    A: [2, 1, 2],
    desc: 'x² + 2xy + y² 的混合會讓不同方向彼此影響。',
  },
  {
    name: '鞍形',
    A: [1, 0, -1],
    desc: 'x² − y²：有些方向是正的，有些方向是負的。',
  },
];

@Component({
  selector: 'app-step-quadratic-form',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="二次型 xᵀAx" subtitle="§7.2">
      <p>
        對稱矩陣最自然的輸出，不是另一個向量，而是一個<strong>數</strong>：
      </p>
      <p class="formula">q(x) = xᵀAx</p>
      <p>
        如果 x = (u, v)，A = [[a, b], [b, d]]，那麼
      </p>
      <p class="formula">q(u, v) = au² + 2buv + dv²</p>
      <p>
        所以二次型其實是在問：<strong>這個方向和長度，對這個矩陣來說值是多少？</strong>
        這個值可以解讀成能量、高度，或某種代價。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動點 x，感受同一個向量在不同對稱矩陣下會得到不同的 q(x)">
      <div class="ex-tabs">
        @for (e of examples; track e.name; let i = $index) {
          <button class="et" [class.active]="sel() === i" (click)="sel.set(i)">{{ e.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg
          #svg
          viewBox="-110 -110 220 220"
          class="grid-svg"
          (pointerdown)="onDown($event)"
          (pointermove)="onMove($event)"
          (pointerup)="onUp($event)"
          (pointercancel)="onUp($event)"
        >
          @for (g of gridLines; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.5" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.5" />
          }
          <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="1.1" />
          <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1.1" />

          <line x1="0" y1="0" [attr.x2]="px()" [attr.y2]="py()" stroke="var(--accent)" stroke-width="2.6" marker-end="url(#tip-qf)" />
          <circle [attr.cx]="px()" [attr.cy]="py()" r="8.5" class="drag-pt" />
          <text [attr.x]="px() + 10" [attr.y]="py() - 8" class="coord-lab">x = ({{ xVal() }}, {{ yVal() }})</text>

          <defs>
            <marker id="tip-qf" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="value-box" [class.pos]="qValue() > 0.05" [class.neg]="qValue() < -0.05">
        <div class="vb-title">q(x) = xᵀAx</div>
        <div class="vb-value">{{ qValue().toFixed(2) }}</div>
        <div class="vb-desc">{{ current().desc }}</div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ a() }}, {{ b() }}], [{{ b() }}, {{ d() }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">x</span>
          <span class="iv">({{ xVal() }}, {{ yVal() }})</span>
        </div>
        <div class="info-row">
          <span class="il">展開</span>
          <span class="iv">{{ a() }}·{{ xVal() }}² + 2·{{ b() }}·{{ xVal() }}·{{ yVal() }} + {{ d() }}·{{ yVal() }}²</span>
        </div>
        <div class="info-row big">
          <span class="il">結果</span>
          <span class="iv"><strong>{{ qValue().toFixed(2) }}</strong></span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        你現在可以把對稱矩陣想成一台「評分機」：它拿到向量 x，吐出一個數 q(x)。
      </p>
      <p>
        接下來我們把這個數當成<strong>高度</strong>來看。也就是把每個點 (x, y) 都送到高度 z = xᵀAx，
        你會得到一整片曲面。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula {
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      padding: 10px 12px;
      background: var(--accent-10);
      border-radius: 8px;
      margin: 10px 0;
    }

    .ex-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .et {
      padding: 5px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: var(--accent-10);
      }

      &.active {
        background: var(--accent-18);
        border-color: var(--accent);
        color: var(--text);
        font-weight: 600;
      }
    }

    .grid-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
    }

    .grid-svg {
      width: 100%;
      max-width: 320px;
      touch-action: none;
      cursor: crosshair;
    }

    .drag-pt {
      fill: var(--accent);
      stroke: white;
      stroke-width: 2;
    }

    .coord-lab {
      font-size: 11px;
      fill: var(--accent);
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .value-box {
      padding: 14px 16px;
      border-radius: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      text-align: center;
      margin-bottom: 12px;

      &.pos {
        background: rgba(90, 138, 90, 0.08);
        border-color: rgba(90, 138, 90, 0.22);
      }

      &.neg {
        background: rgba(90, 110, 159, 0.08);
        border-color: rgba(90, 110, 159, 0.22);
      }
    }

    .vb-title {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .vb-value {
      font-size: 30px;
      font-weight: 700;
      color: var(--text);
      line-height: 1.1;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .vb-desc {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .info {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .info-row {
      display: grid;
      grid-template-columns: 72px 1fr;
      border-bottom: 1px solid var(--border);

      &:last-child {
        border-bottom: none;
      }

      &.big {
        background: var(--accent-10);
      }
    }

    .il {
      padding: 8px 12px;
      font-size: 12px;
      color: var(--text-muted);
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
    }

    .iv {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .iv strong {
      color: var(--accent);
      font-size: 16px;
    }
  `,
})
export class StepQuadraticFormComponent {
  readonly examples = EXAMPLES;
  readonly gridLines = [-100, -75, -50, -25, 25, 50, 75, 100];

  readonly sel = signal(0);
  readonly px = signal(40);
  readonly py = signal(-20);

  private dragging = false;
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  readonly current = computed(() => this.examples[this.sel()]);
  readonly a = computed(() => this.current().A[0]);
  readonly b = computed(() => this.current().A[1]);
  readonly d = computed(() => this.current().A[2]);

  readonly xVal = computed(() => Math.round(this.px() / 20));
  readonly yVal = computed(() => Math.round(-this.py() / 20));
  readonly qValue = computed(
    () =>
      this.a() * this.xVal() ** 2 +
      2 * this.b() * this.xVal() * this.yVal() +
      this.d() * this.yVal() ** 2,
  );

  onDown(e: PointerEvent): void {
    this.dragging = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    this.updateFromEvent(e);
  }

  onMove(e: PointerEvent): void {
    if (!this.dragging) return;
    this.updateFromEvent(e);
  }

  onUp(e: PointerEvent): void {
    this.dragging = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }

  private updateFromEvent(e: PointerEvent): void {
    const svg = this.svgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const snap = (v: number) =>
      Math.round(Math.max(-80, Math.min(80, v)) / 20) * 20;
    this.px.set(snap(local.x));
    this.py.set(snap(local.y));
  }
}
