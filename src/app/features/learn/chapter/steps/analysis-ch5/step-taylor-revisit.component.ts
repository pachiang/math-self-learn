import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { taylorPoly, sampleFn } from './analysis-ch5-util';

// Pre-computed derivatives at a=0 for sin, cos, exp
const DERIVS: Record<string, number[]> = {
  sin: [0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1],
  cos: [1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0],
  exp: Array(16).fill(1),
};

interface Preset { name: string; fn: (x: number) => number; derivs: number[]; }

const PRESETS: Preset[] = [
  { name: 'sin x', fn: Math.sin, derivs: DERIVS['sin'] },
  { name: 'cos x', fn: Math.cos, derivs: DERIVS['cos'] },
  { name: 'eˣ', fn: Math.exp, derivs: DERIVS['exp'] },
];

@Component({
  selector: 'app-step-taylor-revisit',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Taylor 定理（再訪）" subtitle="§5.6">
      <p>
        第三章介紹了 Taylor 級數。現在有了微分的嚴格定義，可以精確寫出<strong>餘項</strong>：
      </p>
      <p class="formula">
        f(x) = Tₙ(x) + Rₙ(x)<br />
        Lagrange 餘項：Rₙ(x) = f⁽ⁿ⁺¹⁾(ξ)/(n+1)! · (x−a)ⁿ⁺¹
      </p>
      <p>
        這給了一個<strong>精確的誤差界</strong>——你知道 Taylor 多項式「最多錯多少」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 N 看 Taylor 多項式和餘項——餘項隨 N 增大指數衰減">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">N = {{ degree() }}</span>
          <input type="range" min="0" max="12" step="1" [value]="degree()"
                 (input)="degree.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="-20 -20 540 260" class="tr-svg">
        <line x1="250" y1="0" x2="250" y2="240" stroke="var(--border)" stroke-width="0.5" />
        <line x1="0" y1="120" x2="520" y2="120" stroke="var(--border)" stroke-width="0.5" />

        <!-- True function -->
        <path [attr.d]="truePath()" fill="none" stroke="#5a8a5a" stroke-width="2.5" />
        <!-- Taylor polynomial -->
        <path [attr.d]="polyPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>

      <div class="err-info">
        在 x = 1：T{{ degree() }}(1) = {{ polyAt1().toFixed(8) }}，
        f(1) = {{ trueAt1().toFixed(8) }}，
        |Rₙ| = {{ Math.abs(polyAt1() - trueAt1()).toExponential(2) }}
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看導數的另一個重要應用——<strong>凸函數</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 100px; accent-color: var(--accent); }
    .tr-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .err-info { padding: 10px; text-align: center; font-size: 12px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; background: var(--bg-surface);
      border-radius: 8px; border: 1px solid var(--border); }
  `,
})
export class StepTaylorRevisitComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly degree = signal(3);

  readonly cur = computed(() => PRESETS[this.selIdx()]);
  readonly polyAt1 = computed(() => taylorPoly(this.cur().derivs, 0, 1, this.degree()));
  readonly trueAt1 = computed(() => this.cur().fn(1));

  sx(x: number): number { return 250 + x * 60; }
  sy(y: number): number { return 120 - y * 50; }

  truePath(): string {
    const pts = sampleFn(this.cur().fn, -4, 4);
    return 'M' + pts.filter((p) => Math.abs(p.y) < 4.5).map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  }

  polyPath(): string {
    const d = this.cur().derivs, N = this.degree();
    const pts: string[] = [];
    for (let x = -4; x <= 4; x += 0.05) {
      const y = taylorPoly(d, 0, x, N);
      if (Math.abs(y) < 4.5) pts.push(`${this.sx(x)},${this.sy(y)}`);
      else if (pts.length > 0) break;
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }
}
