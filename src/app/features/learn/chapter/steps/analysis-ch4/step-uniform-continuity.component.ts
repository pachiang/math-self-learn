import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFunction } from './analysis-ch4-util';

interface UCPreset { name: string; fn: (x: number) => number; xRange: [number, number];
  uniform: boolean; desc: string; troubleSpot?: number; }

const PRESETS: UCPreset[] = [
  { name: 'sin(x) on R', fn: Math.sin, xRange: [-6, 6], uniform: true,
    desc: '均勻連續：δ 不依賴 x（Lipschitz 連續）' },
  { name: '1/x on (0,1)', fn: (x) => 1/x, xRange: [0.05, 1], uniform: false, troubleSpot: 0.1,
    desc: '非均勻連續：越靠近 0，需要的 δ 越小 → 找不到統一的 δ' },
  { name: 'x² on [0,2]', fn: (x) => x*x, xRange: [0, 2], uniform: true,
    desc: '閉區間上的連續函數 → Heine-Cantor 保證均勻連續' },
];

@Component({
  selector: 'app-step-uniform-continuity',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="均勻連續" subtitle="§4.7">
      <p>
        連續：<strong>對每個 x</strong>，對每個 ε，存在 δ(x, ε)。δ 可能跟 x 有關。
      </p>
      <p>
        <strong>均勻連續</strong>：對每個 ε，存在<strong>一個 δ 對所有 x 都管用</strong>。
      </p>
      <p class="formula">均勻連續：∀ε > 0, ∃δ > 0, ∀x: |x−y| &lt; δ ⟹ |f(x)−f(y)| &lt; ε</p>
      <p>
        <strong>Heine-Cantor 定理</strong>：在閉有界區間上連續 → 均勻連續。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖探針 x₀——看 δ 怎麼隨位置變化（非均勻連續時 δ 會縮到 0）">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="probe-ctrl">
        <span class="pl">x₀ = {{ probeX().toFixed(2) }}</span>
        <input type="range" [min]="current().xRange[0]" [max]="current().xRange[1]" step="0.01"
               [value]="probeX()" (input)="probeX.set(+($any($event.target)).value)" class="p-slider" />
        <span class="pl">ε = {{ eps().toFixed(2) }}</span>
        <input type="range" min="0.1" max="1.5" step="0.05" [value]="eps()"
               (input)="eps.set(+($any($event.target)).value)" class="p-slider" />
      </div>

      <svg viewBox="0 0 520 250" class="uc-svg">
        <line x1="40" y1="210" x2="500" y2="210" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="210" stroke="var(--border)" stroke-width="0.8" />

        <!-- Function -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- ε band around f(x0) -->
        <rect x="40" [attr.y]="fy(fAtProbe() + eps())"
              width="460" [attr.height]="Math.max(1, fy(fAtProbe() - eps()) - fy(fAtProbe() + eps()))"
              fill="var(--accent)" fill-opacity="0.08" />

        <!-- δ band around x0 -->
        <rect [attr.x]="Math.max(40, fx(probeX() - localDelta()))" y="10"
              [attr.width]="Math.min(460, fx(probeX() + localDelta()) - fx(probeX() - localDelta()))"
              height="200" fill="#c8983b" fill-opacity="0.08" />

        <!-- Probe point -->
        <circle [attr.cx]="fx(probeX())" [attr.cy]="fy(fAtProbe())" r="5"
                fill="var(--accent)" stroke="white" stroke-width="1.5" />
      </svg>

      <div class="result-row">
        <div class="r-card">δ(x₀) = {{ localDelta().toFixed(4) }}</div>
        <div class="r-card" [class.ok]="current().uniform" [class.bad]="!current().uniform">
          {{ current().uniform ? '均勻連續 ✓（δ 到處差不多大）' : '非均勻連續 ✗（δ 靠近邊界趨向 0）' }}
        </div>
      </div>
      <div class="desc">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        均勻連續保證<strong>Cauchy 列被映射成 Cauchy 列</strong>——
        這是把連續函數延拓到邊界的關鍵。
      </p>
      <p>下一節預覽<strong>連續函數空間</strong>和 sup 範數。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .probe-ctrl { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .pl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .p-slider { width: 100px; accent-color: var(--accent); }
    .uc-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .r-card { flex: 1; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px;
      font-weight: 600; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepUniformContinuityComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly probeX = signal(0.5);
  readonly eps = signal(0.5);

  readonly current = computed(() => PRESETS[this.selIdx()]);
  readonly fAtProbe = computed(() => this.current().fn(this.probeX()));

  // Approximate local delta by scanning
  readonly localDelta = computed(() => {
    const fn = this.current().fn;
    const x0 = this.probeX();
    const e = this.eps();
    const fX0 = fn(x0);
    let delta = 0.001;
    while (delta < 2) {
      const xL = x0 - delta, xR = x0 + delta;
      if ((xL > this.current().xRange[0] && Math.abs(fn(xL) - fX0) >= e) ||
          (xR < this.current().xRange[1] && Math.abs(fn(xR) - fX0) >= e)) break;
      delta += 0.001;
    }
    return Math.max(0.001, delta - 0.001);
  });

  fx(x: number): number {
    const [lo, hi] = this.current().xRange;
    return 40 + ((x - lo) / (hi - lo)) * 460;
  }

  fy(y: number): number { return 210 - ((y + 1) / 6) * 200; }

  curvePath(): string {
    const [lo, hi] = this.current().xRange;
    const pts = sampleFunction(this.current().fn, lo, hi, 300);
    const valid = pts.filter((p) => isFinite(p.y) && Math.abs(p.y) < 5);
    if (valid.length < 2) return '';
    return 'M' + valid.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
