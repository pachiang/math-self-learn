import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { wedge11 } from './analysis-ch19-util';

@Component({
  selector: 'app-step-two-forms',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="2-form 與 wedge product" subtitle="§19.3">
      <p>
        <strong>2-form</strong> 吃兩個向量，吐出一個數——這個數就是它們張成的<strong>有向面積</strong>。
      </p>
      <p class="formula">dx ∧ dy (u, v) = u₁v₂ − u₂v₁ = 平行四邊形的有向面積</p>
      <p>
        <strong>Wedge product</strong> ∧ 是反對稱的：α ∧ β = −β ∧ α。
        特別地 dx ∧ dx = 0（同方向沒有面積）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動兩個向量 u, v，看 wedge product = 有向面積">
      <div class="ctrl-grid">
        <div class="ctrl-col">
          <div class="ctrl-label">向量 u</div>
          <div class="ctrl-row">
            <span class="cl">u₁={{ u1().toFixed(1) }}</span>
            <input type="range" min="-2" max="2" step="0.1" [value]="u1()"
                   (input)="u1.set(+($any($event.target)).value)" class="sl" />
          </div>
          <div class="ctrl-row">
            <span class="cl">u₂={{ u2().toFixed(1) }}</span>
            <input type="range" min="-2" max="2" step="0.1" [value]="u2()"
                   (input)="u2.set(+($any($event.target)).value)" class="sl" />
          </div>
        </div>
        <div class="ctrl-col">
          <div class="ctrl-label">向量 v</div>
          <div class="ctrl-row">
            <span class="cl">v₁={{ v1().toFixed(1) }}</span>
            <input type="range" min="-2" max="2" step="0.1" [value]="v1()"
                   (input)="v1.set(+($any($event.target)).value)" class="sl" />
          </div>
          <div class="ctrl-row">
            <span class="cl">v₂={{ v2().toFixed(1) }}</span>
            <input type="range" min="-2" max="2" step="0.1" [value]="v2()"
                   (input)="v2.set(+($any($event.target)).value)" class="sl" />
          </div>
        </div>
      </div>

      <svg viewBox="-2.5 -2.5 5 5" class="wedge-svg">
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-2.5" [attr.x2]="g" y2="2.5" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2.5" [attr.y1]="g" x2="2.5" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- Parallelogram -->
        <path [attr.d]="paraPath()" [attr.fill]="wedgeVal() >= 0 ? 'rgba(90,138,90,0.15)' : 'rgba(160,90,90,0.15)'"
              stroke="var(--border)" stroke-width="0.015" />

        <!-- Vector u (blue) -->
        <line x1="0" y1="0" [attr.x2]="u1()" [attr.y2]="-u2()"
              stroke="#5a7faa" stroke-width="0.04" />
        <circle [attr.cx]="u1()" [attr.cy]="-u2()" r="0.06" fill="#5a7faa" />
        <text [attr.x]="u1() + 0.1" [attr.y]="-u2() - 0.1" fill="#5a7faa" font-size="0.15" font-weight="700">u</text>

        <!-- Vector v (orange) -->
        <line x1="0" y1="0" [attr.x2]="v1()" [attr.y2]="-v2()"
              stroke="#bf8a5a" stroke-width="0.04" />
        <circle [attr.cx]="v1()" [attr.cy]="-v2()" r="0.06" fill="#bf8a5a" />
        <text [attr.x]="v1() + 0.1" [attr.y]="-v2() - 0.1" fill="#bf8a5a" font-size="0.15" font-weight="700">v</text>
      </svg>

      <div class="result-row">
        <div class="r-card">u = ({{ u1().toFixed(1) }}, {{ u2().toFixed(1) }})</div>
        <div class="r-card">v = ({{ v1().toFixed(1) }}, {{ v2().toFixed(1) }})</div>
        <div class="r-card accent" [class.pos]="wedgeVal() > 0" [class.neg]="wedgeVal() < 0">
          dx∧dy(u,v) = {{ wedgeVal().toFixed(2) }}
          {{ wedgeVal() > 0.01 ? ' (逆時針+)' : wedgeVal() < -0.01 ? ' (順時針−)' : '' }}
        </div>
      </div>

      <div class="antisym">
        反對稱：dx∧dy(v,u) = {{ (-wedgeVal()).toFixed(2) }} = −(dx∧dy(u,v))。交換向量 → 面積變號。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        2-form 就是「有向面積測量器」。在 3D 裡，dx∧dy、dy∧dz、dz∧dx 分別測量投影到三個座標平面的面積。
        3-form dx∧dy∧dz 測量有向體積。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-grid { display: flex; gap: 14px; margin-bottom: 10px; }
    .ctrl-col { flex: 1; }
    .ctrl-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .ctrl-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .cl { font-size: 11px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 55px; }
    .sl { flex: 1; accent-color: var(--accent); }
    .wedge-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .result-row { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 90px; padding: 8px; border-radius: 8px; text-align: center; font-size: 11px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { border-color: var(--accent); }
      &.pos { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.neg { background: rgba(160,90,90,0.08); color: #a05a5a; } }
    .antisym { padding: 8px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 11px; color: var(--text-muted); text-align: center; font-family: 'JetBrains Mono', monospace; }
  `,
})
export class StepTwoFormsComponent {
  readonly u1 = signal(1); readonly u2 = signal(0.5);
  readonly v1 = signal(-0.3); readonly v2 = signal(1);

  readonly wedgeVal = computed(() => wedge11([this.u1(), this.u2()], [this.v1(), this.v2()]));

  paraPath(): string {
    const a = this.u1(), b = this.u2(), c = this.v1(), d = this.v2();
    return `M0,0 L${a},${-b} L${a + c},${-(b + d)} L${c},${-d} Z`;
  }
}
