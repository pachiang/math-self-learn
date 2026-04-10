import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const SQRT2 = Math.SQRT2;

@Component({
  selector: 'app-step-rational-holes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="有理數的「洞」" subtitle="§1.2">
      <p>
        上一節看到 √2 不是有理數。現在來精確描述這個「洞」。
      </p>
      <p>
        想像把所有有理數分成兩堆：
      </p>
      <ul>
        <li><strong>左邊 L</strong> = {{ '{' }} q ∈ Q : q < 0 或 q² < 2 {{ '}' }}</li>
        <li><strong>右邊 R</strong> = {{ '{' }} q ∈ Q : q > 0 且 q² ≥ 2 {{ '}' }}</li>
      </ul>
      <p>
        L 的每一個元素都比 R 的每一個元素小。但是——
      </p>
      <ul>
        <li>L <strong>沒有最大值</strong>：不管你在 L 裡選哪個 q，都能找到更大的 q' 滿足 q'² < 2</li>
        <li>R <strong>沒有最小值</strong>：不管你在 R 裡選哪個 q，都能找到更小的 q' 滿足 q'² > 2</li>
      </ul>
      <p>
        中間那個「分界點」√2 <strong>不在 Q 裡</strong>。這就是 Dedekind 所說的「切割」——
        有理數可以被切開，但切割點卻不存在。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動分割線，看看有理數怎麼被切開">
      <svg viewBox="0 -40 400 80" class="cut-svg"
           (pointermove)="onPointerMove($event)"
           (pointerdown)="dragging.set(true)"
           (pointerup)="dragging.set(false)"
           (pointerleave)="dragging.set(false)">
        <!-- Number line -->
        <line x1="10" y1="0" x2="390" y2="0" stroke="var(--border)" stroke-width="1" />

        <!-- Ticks at 0, 1, 2 -->
        @for (tick of ticks; track tick.val) {
          <line [attr.x1]="toX(tick.val)" y1="-5" [attr.x2]="toX(tick.val)" y2="5"
                stroke="var(--border-strong)" stroke-width="1" />
          <text [attr.x]="toX(tick.val)" y="18" class="tick-label">{{ tick.label }}</text>
        }

        <!-- Left region (blue) -->
        <rect x="10" y="-8" [attr.width]="toX(divider()) - 10" height="16"
              fill="#5a7faa" fill-opacity="0.12" />
        <!-- Right region (red) -->
        <rect [attr.x]="toX(divider())" y="-8" [attr.width]="390 - toX(divider())" height="16"
              fill="#aa5a6a" fill-opacity="0.12" />

        <!-- Rational dots near the cut -->
        @for (r of nearbyRationals(); track r.key) {
          <circle [attr.cx]="toX(r.val)" cy="0" r="2.5"
                  [attr.fill]="r.val < divider() ? '#5a7faa' : '#aa5a6a'" />
        }

        <!-- Divider line -->
        <line [attr.x1]="toX(divider())" y1="-25" [attr.x2]="toX(divider())" y2="25"
              stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3" />
        <text [attr.x]="toX(divider())" y="-30" class="div-label">
          {{ divider().toFixed(4) }}
        </text>

        <!-- Gap indicator near √2 -->
        @if (nearSqrt2()) {
          <circle [attr.cx]="toX(SQRT2)" cy="0" r="5"
                  fill="none" stroke="var(--accent)" stroke-width="1.5"
                  stroke-dasharray="3 2" />
        }
      </svg>

      <div class="info-row">
        <div class="info-card left">
          <div class="ic-title">左邊 L</div>
          <div class="ic-body">
            @if (isAtSqrt2()) {
              沒有最大值！
            } @else {
              max = {{ divider().toFixed(4) }}
            }
          </div>
        </div>
        <div class="info-card gap" [class.visible]="nearSqrt2()">
          <div class="ic-title">洞</div>
          <div class="ic-body">√2 ≈ {{ SQRT2.toFixed(6) }}</div>
        </div>
        <div class="info-card right">
          <div class="ic-title">右邊 R</div>
          <div class="ic-body">
            @if (isAtSqrt2()) {
              沒有最小值！
            } @else {
              min = {{ divider().toFixed(4) }}
            }
          </div>
        </div>
      </div>

      <div class="insight">
        把分割線拖到 √2 附近：左邊沒有最大值，右邊沒有最小值——
        中間有一個<strong>洞</strong>。這就是有理數的缺陷。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Dedekind 在 1872 年意識到：<strong>每一個這樣的「洞」都應該被填上</strong>。
        實數 R 就是「填完所有洞的有理數」。
      </p>
      <p>
        但怎麼<strong>正式定義</strong>「填洞」？答案是<strong>上確界</strong>——
        一個集合的「最小上界」。
      </p>
    </app-prose-block>
  `,
  styles: `
    .cut-svg { width: 100%; display: block; margin-bottom: 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
      cursor: ew-resize; touch-action: none; }
    .tick-label { font-size: 10px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .div-label { font-size: 9px; fill: var(--accent); text-anchor: middle;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .info-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .info-card { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      text-align: center;
      &.left { background: rgba(90, 127, 170, 0.08); }
      &.right { background: rgba(170, 90, 106, 0.08); }
      &.gap { background: var(--accent-10); opacity: 0; transition: opacity 0.3s;
        &.visible { opacity: 1; } } }
    .ic-title { font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .ic-body { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

    .insight { padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);
      text-align: center;
      strong { color: var(--accent); } }
  `,
})
export class StepRationalHolesComponent {
  readonly SQRT2 = SQRT2;
  readonly divider = signal(1.5);
  readonly dragging = signal(false);
  readonly ticks = [
    { val: 0, label: '0' }, { val: 0.5, label: '' }, { val: 1, label: '1' },
    { val: 1.5, label: '' }, { val: 2, label: '2' }, { val: 2.5, label: '' },
  ];

  readonly nearSqrt2 = computed(() => Math.abs(this.divider() - SQRT2) < 0.05);
  readonly isAtSqrt2 = computed(() => Math.abs(this.divider() - SQRT2) < 0.02);

  readonly nearbyRationals = computed(() => {
    const center = this.divider();
    const rats: { key: string; val: number }[] = [];
    for (let q = 1; q <= 20; q++) {
      for (let p = Math.floor((center - 0.3) * q); p <= Math.ceil((center + 0.3) * q); p++) {
        const val = p / q;
        if (val > 0 && val < 2.5 && Math.abs(val - center) < 0.3) {
          rats.push({ key: `${p}/${q}`, val });
        }
      }
    }
    return rats.slice(0, 40);
  });

  toX(val: number): number { return 10 + (val / 2.5) * 380; }

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const xRatio = (ev.clientX - rect.left) / rect.width;
    const val = (xRatio * 400 - 10) / 380 * 2.5;
    this.divider.set(Math.max(0.1, Math.min(2.4, val)));
  }
}
