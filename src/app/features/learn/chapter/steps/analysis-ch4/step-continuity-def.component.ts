import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFunction } from './analysis-ch4-util';

interface Preset { name: string; fn: (x: number) => number; c: number;
  fCExists: boolean; limExists: boolean; limEqFc: boolean; desc: string; }

const PRESETS: Preset[] = [
  { name: 'x²（連續）', fn: (x) => x*x, c: 1,
    fCExists: true, limExists: true, limEqFc: true, desc: '三個條件全滿足 → 連續' },
  { name: '可去間斷', fn: (x) => x === 1 ? 3 : (x*x-1)/(x-1), c: 1,
    fCExists: true, limExists: true, limEqFc: false, desc: 'f(1)=3 但 lim=2 → 不連續（可修復）' },
  { name: '跳躍間斷', fn: (x) => x >= 0 ? 1 : -1, c: 0,
    fCExists: true, limExists: false, limEqFc: false, desc: '左極限 ≠ 右極限 → 跳躍' },
  { name: 'f(c) 未定義', fn: (x) => x === 1 ? NaN : (x*x-1)/(x-1), c: 1,
    fCExists: false, limExists: true, limEqFc: false, desc: 'f(c) 不存在 → 不連續' },
];

@Component({
  selector: 'app-step-continuity-def',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="連續的定義" subtitle="§4.2">
      <p>
        f 在 c 點<strong>連續</strong>的三個條件：
      </p>
      <ol>
        <li>f(c) <strong>有定義</strong></li>
        <li>lim(x→c) f(x) <strong>存在</strong></li>
        <li>lim(x→c) f(x) <strong>= f(c)</strong></li>
      </ol>
      <p class="formula">連續 ⟺ lim(x→c) f(x) = f(c)</p>
      <p>
        三個條件缺一不可。缺哪一個就對應不同類型的<strong>間斷</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="三條件紅綠燈——看哪些滿足、哪些不滿足">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <svg viewBox="0 0 500 250" class="cont-svg">
        <line x1="50" y1="200" x2="450" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="200" stroke="var(--border)" stroke-width="0.8" />

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Point c marker -->
        <line [attr.x1]="fx(current().c)" y1="20" [attr.x2]="fx(current().c)" y2="200"
              stroke="#c8983b" stroke-width="1" stroke-dasharray="3 3" />

        @if (current().fCExists) {
          <circle [attr.cx]="fx(current().c)" [attr.cy]="fy(current().fn(current().c))" r="5"
                  fill="var(--accent)" stroke="white" stroke-width="1.5" />
        } @else {
          <circle [attr.cx]="fx(current().c)" [attr.cy]="fy(2)" r="5"
                  fill="none" stroke="#a05a5a" stroke-width="2" />
        }
      </svg>

      <div class="traffic-light">
        <div class="tl-item" [class.ok]="current().fCExists" [class.bad]="!current().fCExists">
          <span class="tl-num">①</span> f(c) 有定義？ {{ current().fCExists ? '✓' : '✗' }}
        </div>
        <div class="tl-item" [class.ok]="current().limExists" [class.bad]="!current().limExists">
          <span class="tl-num">②</span> 極限存在？ {{ current().limExists ? '✓' : '✗' }}
        </div>
        <div class="tl-item" [class.ok]="current().limEqFc" [class.bad]="!current().limEqFc">
          <span class="tl-num">③</span> 極限 = f(c)？ {{ current().limEqFc ? '✓' : '✗' }}
        </div>
      </div>

      <div class="verdict" [class.cont]="current().limEqFc" [class.disc]="!current().limEqFc">
        {{ current().limEqFc ? '✓ 連續' : '✗ 不連續' }} — {{ current().desc }}
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看不同類型的間斷點有什麼幾何意義。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .cont-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .traffic-light { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .tl-item { flex: 1; min-width: 100px; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 12px; font-weight: 600;
      &.ok { background: rgba(90,138,90,0.1); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.1); color: #a05a5a; } }
    .tl-num { font-size: 14px; margin-right: 4px; }
    .verdict { padding: 10px; text-align: center; font-size: 14px; font-weight: 700; border-radius: 8px;
      &.cont { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.disc { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepContinuityDefComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly current = computed(() => PRESETS[this.selIdx()]);

  fx(x: number): number { return 50 + ((x + 2) / 6) * 400; }
  fy(y: number): number { return 200 - ((y + 2) / 8) * 180; }

  curvePath(): string {
    const fn = this.current().fn;
    const pts = sampleFunction(fn, -2, 4, 300);
    const valid = pts.filter((p) => isFinite(p.y) && Math.abs(p.y) < 6);
    if (valid.length < 2) return '';
    return 'M' + valid.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
