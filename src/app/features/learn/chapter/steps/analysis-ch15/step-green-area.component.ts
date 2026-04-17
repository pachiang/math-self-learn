import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-green-area',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Green 定理求面積" subtitle="§15.7">
      <p>取 P = −y/2, Q = x/2，則 ∂Q/∂x − ∂P/∂y = 1。Green 定理變成：</p>
      <p class="formula">面積 = ∬_D 1 dA = ½ ∮_C (x dy − y dx)</p>
      <p>不需要直接算面積分——沿邊界繞一圈就能算面積！</p>
    </app-prose-block>

    <app-challenge-card prompt="選形狀，用 Green 面積公式計算">
      <div class="fn-tabs">
        @for (s of shapes; track s.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ s.name }}</button>
        }
      </div>

      <svg viewBox="-2 -2 4 4" class="area-svg">
        <line x1="-2" y1="0" x2="2" y2="0" stroke="var(--border)" stroke-width="0.01" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="var(--border)" stroke-width="0.01" />

        <path [attr.d]="shapePath()" fill="rgba(var(--accent-rgb), 0.15)"
              stroke="var(--accent)" stroke-width="0.04" />

        <!-- Direction arrows -->
        @for (a of dirArrows(); track $index) {
          <circle [attr.cx]="a.x + a.dx * 0.1" [attr.cy]="-(a.y + a.dy * 0.1)"
                  r="0.03" fill="var(--accent)" />
        }
      </svg>

      <div class="info-row">
        <div class="i-card">½ ∮ (x dy − y dx)</div>
        <div class="i-card accent">面積 = {{ greenArea().toFixed(4) }}</div>
        <div class="i-card">精確值 = {{ shapes[sel()].exactArea }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>這個技巧在 GPS 測量、計算幾何中很常用——只需要知道邊界座標就能算面積。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .area-svg { width: 100%; max-width: 360px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .info-row { display: flex; gap: 8px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepGreenAreaComponent {
  readonly shapes = [
    { name: '圓', r: (t: number): [number, number] => [Math.cos(t), Math.sin(t)],
      dr: (t: number): [number, number] => [-Math.sin(t), Math.cos(t)],
      tRange: [0, 2 * Math.PI] as [number, number], exactArea: 'π ≈ 3.1416' },
    { name: '橢圓', r: (t: number): [number, number] => [1.5 * Math.cos(t), Math.sin(t)],
      dr: (t: number): [number, number] => [-1.5 * Math.sin(t), Math.cos(t)],
      tRange: [0, 2 * Math.PI] as [number, number], exactArea: '1.5π ≈ 4.7124' },
    { name: '正方形', r: (t: number): [number, number] => {
        const s = ((t / (2 * Math.PI)) * 4) % 4;
        if (s < 1) return [-1 + 2 * s, -1];
        if (s < 2) return [1, -1 + 2 * (s - 1)];
        if (s < 3) return [1 - 2 * (s - 2), 1];
        return [-1, 1 - 2 * (s - 3)];
      },
      dr: (t: number): [number, number] => {
        const s = ((t / (2 * Math.PI)) * 4) % 4;
        const v = 4 / (2 * Math.PI);
        if (s < 1) return [2 * v, 0];
        if (s < 2) return [0, 2 * v];
        if (s < 3) return [-2 * v, 0];
        return [0, -2 * v];
      },
      tRange: [0, 2 * Math.PI] as [number, number], exactArea: '4' },
  ];
  readonly sel = signal(0);

  readonly greenArea = computed(() => {
    const s = this.shapes[this.sel()];
    const [t0, t1] = s.tRange;
    const steps = 500;
    const dt = (t1 - t0) / steps;
    let sum = 0;
    for (let i = 0; i < steps; i++) {
      const t = t0 + (i + 0.5) * dt;
      const [x, y] = s.r(t);
      const [dx, dy] = s.dr(t);
      sum += (x * dy - y * dx) * dt;
    }
    return sum / 2;
  });

  shapePath(): string {
    const s = this.shapes[this.sel()];
    const [t0, t1] = s.tRange;
    let path = '';
    for (let i = 0; i <= 200; i++) {
      const t = t0 + (t1 - t0) * i / 200;
      const [x, y] = s.r(t);
      path += (i === 0 ? 'M' : 'L') + `${x.toFixed(4)},${(-y).toFixed(4)}`;
    }
    return path + 'Z';
  }

  dirArrows(): { x: number; y: number; dx: number; dy: number }[] {
    const s = this.shapes[this.sel()];
    const [t0, t1] = s.tRange;
    const result: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const t = t0 + (t1 - t0) * (i + 0.5) / 8;
      const [x, y] = s.r(t);
      const [dx, dy] = s.dr(t);
      const mag = Math.sqrt(dx * dx + dy * dy);
      if (mag > 0) result.push({ x, y, dx: dx / mag, dy: dy / mag });
    }
    return result;
  }
}
