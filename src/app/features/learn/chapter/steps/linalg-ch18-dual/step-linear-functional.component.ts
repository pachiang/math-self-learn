import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { levelLinePath, applyFunctional } from './dual-util';

@Component({
  selector: 'app-step-linear-functional',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="一列吃一行：線性泛函" subtitle="§18.1">
      <p>
        整個課程裡我們寫過無數次「列向量 × 行向量 = 數字」。
        但一個<strong>列向量</strong>到底「是」什麼？
      </p>
      <p>
        φ = [a, b] 定義了一個規則：給任何行向量 v = [x, y]ᵀ，
        產出一個數 φ(v) = ax + by。這個規則對 v 是<strong>線性</strong>的。
      </p>
      <p>
        這樣的規則叫做<strong>線性泛函</strong>（linear functional）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整 φ = [a, b]，拖動向量 v，看 φ(v) 的值和等值線">
      <div class="ctrl-row">
        <div class="ctrl">
          <span class="cl">a =</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="a()"
                 (input)="a.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ a().toFixed(1) }}</span>
        </div>
        <div class="ctrl">
          <span class="cl">b =</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="b()"
                 (input)="b.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ b().toFixed(1) }}</span>
        </div>
      </div>

      <div class="layout">
        <svg viewBox="-3.5 -3.5 7 7" class="func-svg"
             (pointerdown)="dragging.set(true)"
             (pointerup)="dragging.set(false)"
             (pointerleave)="dragging.set(false)"
             (pointermove)="onPointerMove($event)">
          <!-- Grid -->
          @for (g of grid; track g) {
            <line [attr.x1]="g" y1="-3.5" [attr.x2]="g" y2="3.5" stroke="var(--border)" stroke-width="0.02" />
            <line x1="-3.5" [attr.y1]="g" x2="3.5" [attr.y2]="g" stroke="var(--border)" stroke-width="0.02" />
          }

          <!-- Level lines -->
          @for (level of levels; track level) {
            <path [attr.d]="levelPath(level)" fill="none"
                  [attr.stroke]="level === 0 ? 'var(--text-muted)' : '#c8983b'"
                  [attr.stroke-width]="level === 0 ? 0.04 : 0.025"
                  [attr.stroke-opacity]="level === 0 ? 0.8 : 0.4" />
          }

          <!-- Vector v -->
          <line x1="0" y1="0" [attr.x2]="vx()" [attr.y2]="vy()"
                stroke="var(--accent)" stroke-width="0.06" />
          <circle [attr.cx]="vx()" [attr.cy]="vy()" r="0.12"
                  fill="var(--accent)" stroke="white" stroke-width="0.03" cursor="grab" />

          <!-- φ direction -->
          <line x1="0" y1="0" [attr.x2]="a() * 0.8" [attr.y2]="b() * 0.8"
                stroke="#c8983b" stroke-width="0.04" stroke-dasharray="0.1 0.08" />
        </svg>

        <div class="info-panel">
          <div class="info-card big">
            <div class="ic-label">φ(v) = {{ a().toFixed(1) }}·{{ vx().toFixed(1) }} + {{ b().toFixed(1) }}·{{ vy().toFixed(1) }}</div>
            <div class="ic-val">= {{ phiV().toFixed(3) }}</div>
          </div>

          <div class="info-card">
            <div class="ic-label">φ = [{{ a().toFixed(1) }}, {{ b().toFixed(1) }}]</div>
          </div>
          <div class="info-card">
            <div class="ic-label">v = [{{ vx().toFixed(1) }}, {{ vy().toFixed(1) }}]ᵀ</div>
          </div>

          <div class="insight">
            等值線是一族<strong>平行線</strong>，
            垂直於 [a, b] 的方向。
            間距 = 1/‖φ‖。
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        一個線性泛函就是一族平行的超平面（在 2D 裡是平行線）。
        φ(v) 的值 = v 穿過了幾條等值線。
      </p>
      <p>
        所有線性泛函的集合，本身也構成一個向量空間——
        這就是<strong>對偶空間 V*</strong>。下一節正式定義。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
    .ctrl { display: flex; align-items: center; gap: 6px; }
    .cl { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .sl { width: 100px; accent-color: var(--accent); }
    .cv { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 30px; }

    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }

    .func-svg { width: 100%; max-width: 320px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); cursor: crosshair; touch-action: none; }

    .info-panel { display: flex; flex-direction: column; gap: 8px; }
    .info-card { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
      &.big { background: var(--accent-10); } }
    .ic-label { font-size: 12px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
    .ic-val { font-size: 22px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }

    .insight { padding: 10px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border);
      strong { color: var(--text); } }
  `,
})
export class StepLinearFunctionalComponent {
  readonly a = signal(1);
  readonly b = signal(0.5);
  readonly vx = signal(1.5);
  readonly vy = signal(1.0);
  readonly dragging = signal(false);
  readonly grid = [-3, -2, -1, 0, 1, 2, 3];
  readonly levels = [-3, -2, -1, 0, 1, 2, 3];

  readonly phiV = computed(() => applyFunctional([this.a(), this.b()], [this.vx(), this.vy()]));

  levelPath(c: number): string {
    return levelLinePath(this.a(), this.b(), c, 3.5);
  }

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 7 - 3.5;
    const y = ((ev.clientY - rect.top) / rect.height) * 7 - 3.5;
    this.vx.set(Math.max(-3, Math.min(3, x)));
    this.vy.set(Math.max(-3, Math.min(3, y)));
  }
}
