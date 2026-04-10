import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { generateTerms, factorialSum } from './analysis-ch2-util';

const PRESETS = [
  { name: '1−1/n', fn: (n: number) => 1 - 1 / n, limit: 1, desc: '單調遞增，上界 1' },
  { name: 'Σ1/k!', fn: factorialSum, limit: Math.E, desc: '單調遞增，上界 e' },
  { name: '1/n', fn: (n: number) => 1 / n, limit: 0, desc: '單調遞減，下界 0' },
];

@Component({
  selector: 'app-step-monotone-bounded',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="單調有界定理" subtitle="§2.4">
      <p>
        <strong>單調有界定理</strong>：每個<strong>單調遞增且有上界</strong>的數列都收斂。
        （同理，單調遞減且有下界 → 收斂。）
      </p>
      <p class="formula">單調遞增 + 有上界 → 收斂到 sup</p>
      <p>
        這是完備性公理的<strong>直接推論</strong>。
        集合 {{ '{' }}aₙ{{ '}' }} 有上界 → 由完備性，sup 存在 →
        數列必定趨近 sup（因為 sup 是最小上界）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看單調遞增數列怎麼爬向它的 sup">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="vis-ctrl">
          <span class="vc-label">顯示 {{ visCount() }} 項</span>
          <input type="range" min="3" max="50" step="1" [value]="visCount()"
                 (input)="visCount.set(+($any($event.target)).value)" class="vc-slider" />
        </div>
      </div>

      <svg viewBox="0 0 500 200" class="mb-svg">
        <line x1="40" y1="170" x2="490" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" stroke-width="0.8" />

        <!-- Sup/limit line -->
        <line x1="40" [attr.y1]="ty(current().limit)" x2="490" [attr.y2]="ty(current().limit)"
              stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />
        <text x="492" [attr.y]="ty(current().limit) + 4" class="sup-label">
          sup = {{ current().limit.toFixed(4) }}
        </text>

        <!-- Dots -->
        @for (t of terms(); track t.n) {
          <circle [attr.cx]="40 + t.n * 8.5" [attr.cy]="ty(t.val)" r="3"
                  fill="var(--accent)" fill-opacity="0.7" />
        }

        <!-- Connecting path -->
        <path [attr.d]="pathD()" fill="none" stroke="var(--accent)" stroke-width="1" stroke-opacity="0.4" />
      </svg>

      <div class="info">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        單調有界定理的威力在於：你<strong>不需要知道極限是多少</strong>——
        只要證明數列遞增且有上界，就能保證極限存在。
      </p>
      <p>
        但如果數列不是單調的呢？<strong>Bolzano-Weierstrass 定理</strong>說：
        有界就夠了——至少能找到一個收斂的子數列。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .vis-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .vc-label { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .vc-slider { width: 100px; accent-color: var(--accent); }

    .mb-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .sup-label { font-size: 8px; fill: #5a8a5a; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .info { padding: 10px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border);
      text-align: center; }
  `,
})
export class StepMonotoneBoundedComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly visCount = signal(20);

  readonly current = computed(() => PRESETS[this.selIdx()]);
  readonly terms = computed(() => generateTerms(this.current().fn, this.visCount()));

  ty(v: number): number { return 170 - ((v + 0.1) / (Math.E + 0.3)) * 155; }

  pathD(): string {
    const t = this.terms();
    if (t.length < 2) return '';
    return 'M' + t.map((p) => `${40 + p.n * 8.5},${this.ty(p.val)}`).join('L');
  }
}
