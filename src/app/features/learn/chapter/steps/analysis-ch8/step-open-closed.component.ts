import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface ClickedPt { x: number; y: number; type: 'interior' | 'boundary' | 'exterior'; }

@Component({
  selector: 'app-step-open-closed',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="開集、閉集與鄰域" subtitle="§8.4">
      <p>度量空間裡的拓撲概念：</p>
      <ul>
        <li><strong>開球</strong> B(x, r) = 距離 x 小於 r 的所有點</li>
        <li><strong>開集</strong>：每個點都是內點（有一個 open ball 完全在裡面）</li>
        <li><strong>閉集</strong>：補集是開集；等價地，包含所有極限點</li>
        <li><strong>邊界</strong>：既不完全在內也不完全在外的點</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="點擊分類：這個點是內點、邊界點、還是外點？">
      <div class="ctrl-row">
        <button class="pre-btn" [class.active]="setType() === 'closed-disk'" (click)="reset('closed-disk')">閉碟 x²+y²≤1</button>
        <button class="pre-btn" [class.active]="setType() === 'open-disk'" (click)="reset('open-disk')">開碟 x²+y²&lt;1</button>
        <button class="pre-btn" [class.active]="setType() === 'square'" (click)="reset('square')">[0,1]²</button>
      </div>

      <svg viewBox="-2 -2 4 4" class="oc-svg" (click)="onSvgClick($event)">
        <!-- Grid -->
        @for (g of [-1,0,1]; track g) {
          <line [attr.x1]="g" y1="-2" [attr.x2]="g" y2="2" stroke="var(--border)" stroke-width="0.01" />
          <line x1="-2" [attr.y1]="g" x2="2" [attr.y2]="g" stroke="var(--border)" stroke-width="0.01" />
        }

        <!-- Set boundary -->
        @if (setType() === 'closed-disk' || setType() === 'open-disk') {
          <circle cx="0" cy="0" r="1" fill="var(--accent)" fill-opacity="0.06"
                  stroke="var(--accent)" stroke-width="0.03"
                  [attr.stroke-dasharray]="setType() === 'open-disk' ? '0.06 0.04' : 'none'" />
        } @else {
          <rect x="0" y="0" width="1" height="1" fill="var(--accent)" fill-opacity="0.06"
                stroke="var(--accent)" stroke-width="0.03" />
        }

        <!-- Clicked points -->
        @for (pt of clicked(); track $index) {
          <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="0.06"
                  [attr.fill]="ptColor(pt.type)" stroke="white" stroke-width="0.02" />
          <!-- Small ball indicator -->
          <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="0.15"
                  fill="none" [attr.stroke]="ptColor(pt.type)" stroke-width="0.01"
                  stroke-dasharray="0.03 0.02" />
        }
      </svg>

      <div class="legend">
        <span><span class="dot green"></span>內點 (interior)</span>
        <span><span class="dot amber"></span>邊界點 (boundary)</span>
        <span><span class="dot gray"></span>外點 (exterior)</span>
      </div>

      <div class="stats">
        已分類 {{ clicked().length }} 個點：
        {{ interiorCount() }} 內、{{ boundaryCount() }} 邊、{{ exteriorCount() }} 外
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看度量空間裡的<strong>收斂和完備性</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .oc-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); cursor: crosshair; }
    .legend { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; justify-content: center; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px;
      vertical-align: middle;
      &.green { background: #5a8a5a; } &.amber { background: #c8983b; } &.gray { background: #888; } }
    .stats { text-align: center; font-size: 12px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepOpenClosedComponent {
  readonly setType = signal<'closed-disk' | 'open-disk' | 'square'>('closed-disk');
  readonly clicked = signal<ClickedPt[]>([]);

  readonly interiorCount = computed(() => this.clicked().filter((p) => p.type === 'interior').length);
  readonly boundaryCount = computed(() => this.clicked().filter((p) => p.type === 'boundary').length);
  readonly exteriorCount = computed(() => this.clicked().filter((p) => p.type === 'exterior').length);

  reset(type: 'closed-disk' | 'open-disk' | 'square'): void {
    this.setType.set(type);
    this.clicked.set([]);
  }

  classify(x: number, y: number): 'interior' | 'boundary' | 'exterior' {
    const eps = 0.05;
    const t = this.setType();
    if (t === 'closed-disk' || t === 'open-disk') {
      const r2 = x * x + y * y;
      if (r2 < (1 - eps) * (1 - eps)) return 'interior';
      if (r2 > (1 + eps) * (1 + eps)) return 'exterior';
      return 'boundary';
    } else {
      // [0,1]^2
      if (x > eps && x < 1 - eps && y > eps && y < 1 - eps) return 'interior';
      if (x < -eps || x > 1 + eps || y < -eps || y > 1 + eps) return 'exterior';
      return 'boundary';
    }
  }

  onSvgClick(ev: MouseEvent): void {
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 4 - 2;
    const y = ((ev.clientY - rect.top) / rect.height) * 4 - 2;
    const type = this.classify(x, y);
    this.clicked.update((pts) => [...pts, { x, y, type }]);
  }

  ptColor(type: string): string {
    return type === 'interior' ? '#5a8a5a' : type === 'boundary' ? '#c8983b' : '#888';
  }
}
