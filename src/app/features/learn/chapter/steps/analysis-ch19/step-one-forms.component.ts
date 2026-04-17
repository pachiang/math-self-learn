import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { DEMO_1FORMS } from './analysis-ch19-util';

@Component({
  selector: 'app-step-one-forms',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="1-form：吃向量吐數字" subtitle="§19.2">
      <p>
        <strong>1-form</strong> ω 在每個點把一個向量映射成一個數字。
      </p>
      <p class="formula">ω = P(x,y) dx + Q(x,y) dy</p>
      <p>
        它作用在向量 v = (a, b) 上：ω(v) = Pa + Qb。
        就是<strong>向量場的點積</strong>，但觀點不同——
        1-form 是「等待被餵向量的線性函數」，而不是「一個向量」。
      </p>
      <p>
        dx 和 dy 是「基本 1-form」：dx(v) = v 的 x 分量，dy(v) = v 的 y 分量。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選 1-form，拖探針看它如何在每個點「測量」方向">
      <div class="fn-tabs">
        @for (f of forms; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.formula }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">x = {{ px().toFixed(1) }}</span>
        <input type="range" min="-2" max="2" step="0.1" [value]="px()"
               (input)="px.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">y = {{ py().toFixed(1) }}</span>
        <input type="range" min="-2" max="2" step="0.1" [value]="py()"
               (input)="py.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-2.5 -2.5 5 5" class="form-svg">
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-2.5" [attr.x2]="g" y2="2.5" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2.5" [attr.y1]="g" x2="2.5" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- 1-form covectors (drawn as short lines perpendicular to the covector direction) -->
        @for (c of covectors(); track c.key) {
          <line [attr.x1]="c.x - c.ny * 0.12" [attr.y1]="-(c.y + c.nx * 0.12)"
                [attr.x2]="c.x + c.ny * 0.12" [attr.y2]="-(c.y - c.nx * 0.12)"
                stroke="var(--accent)" [attr.stroke-width]="0.015 + c.mag * 0.01"
                [attr.stroke-opacity]="0.3 + c.mag * 0.15" />
        }

        <!-- Probe point -->
        <circle [attr.cx]="px()" [attr.cy]="-py()" r="0.08" fill="var(--accent)" stroke="white" stroke-width="0.02" />

        <!-- Show the 1-form covector at probe -->
        <line [attr.x1]="px()" [attr.y1]="-py()"
              [attr.x2]="px() + probeP() * 0.25" [attr.y2]="-(py() + probeQ() * 0.25)"
              stroke="#bf6e6e" stroke-width="0.04" />
        <circle [attr.cx]="px() + probeP() * 0.25" [attr.cy]="-(py() + probeQ() * 0.25)"
                r="0.04" fill="#bf6e6e" />
      </svg>

      <div class="info-row">
        <div class="i-card">在 ({{ px().toFixed(1) }}, {{ py().toFixed(1) }})：</div>
        <div class="i-card accent">ω = {{ probeP().toFixed(2) }} dx + {{ probeQ().toFixed(2) }} dy</div>
        <div class="i-card" [class.exact]="forms[sel()].exact" [class.notexact]="!forms[sel()].exact">
          {{ forms[sel()].exact ? '恰當(exact) ✓' : '非恰當 ✗' }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        1-form 的「恰當」（exact）= 存在函數 f 使 ω = df。
        恰當形式沿任何閉曲線的積分都是零——跟 Ch15 的保守場一模一樣。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 12px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .sl { flex: 1; accent-color: var(--accent); min-width: 80px; }
    .form-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .info-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .i-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 8px; text-align: center; font-size: 11px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); }
      &.exact { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.notexact { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepOneFormsComponent {
  readonly forms = DEMO_1FORMS;
  readonly sel = signal(0);
  readonly px = signal(0.5);
  readonly py = signal(0.5);

  readonly probeP = computed(() => DEMO_1FORMS[this.sel()].omega(this.px(), this.py())[0]);
  readonly probeQ = computed(() => DEMO_1FORMS[this.sel()].omega(this.px(), this.py())[1]);

  readonly covectors = computed(() => {
    const omega = DEMO_1FORMS[this.sel()].omega;
    const result: { key: string; x: number; y: number; nx: number; ny: number; mag: number }[] = [];
    for (let x = -2; x <= 2; x += 0.5) {
      for (let y = -2; y <= 2; y += 0.5) {
        const [P, Q] = omega(x, y);
        const mag = Math.sqrt(P * P + Q * Q);
        if (mag > 0.01) {
          result.push({ key: `${x},${y}`, x, y, nx: P / mag, ny: Q / mag, mag: Math.min(mag, 3) });
        }
      }
    }
    return result;
  });
}
