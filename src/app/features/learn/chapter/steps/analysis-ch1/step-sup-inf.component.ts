import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface SetExample { name: string; points: number[]; sup: number; inf: number; supIn: boolean; infIn: boolean; desc: string; }

const EXAMPLES: SetExample[] = [
  { name: '(0, 1)', points: [0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.99],
    sup: 1, inf: 0, supIn: false, infIn: false, desc: '開區間：sup = 1 不在集合裡，inf = 0 也不在' },
  { name: '[0, 1]', points: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1],
    sup: 1, inf: 0, supIn: true, infIn: true, desc: '閉區間：sup 和 inf 都在集合裡' },
  { name: '{{ \'{\'  }}1/n{{ \'}\' }}', points: [1, 0.5, 1/3, 0.25, 0.2, 1/6, 1/7, 1/8, 1/9, 0.1],
    sup: 1, inf: 0, supIn: true, infIn: false, desc: 'sup = 1 在集合裡，inf = 0 不在（永遠接近但到不了）' },
  { name: '{{ \'{\'  }}1 − 1/n{{ \'}\' }}', points: [0, 0.5, 2/3, 0.75, 0.8, 5/6, 6/7, 7/8, 8/9, 0.9],
    sup: 1, inf: 0, supIn: false, infIn: true, desc: 'sup = 1 不在集合裡，inf = 0 在集合裡' },
];

@Component({
  selector: 'app-step-sup-inf',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="上確界與下確界" subtitle="§1.3">
      <p>
        <strong>上界</strong>：如果 M ≥ s 中的每一個元素 s，M 就是集合 S 的上界。
      </p>
      <p>
        <strong>上確界</strong>（supremum, sup）：<strong>最小的</strong>上界。它是所有上界裡面最接近 S 的那個。
      </p>
      <p class="formula">sup S = min{{ '{' }} M : M 是 S 的上界 {{ '}' }}</p>
      <p>
        同理，<strong>下確界</strong>（infimum, inf）= 最大的下界。
      </p>
      <p>
        重要的區別：sup 可能在集合裡（像 max），也可能<strong>不在集合裡</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動上界標記，找到最小的那個——那就是 sup">
      <div class="preset-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <svg viewBox="-20 -30 440 70" class="sup-svg"
           (pointermove)="onDrag($event)"
           (pointerdown)="dragging.set(true)"
           (pointerup)="dragging.set(false)"
           (pointerleave)="dragging.set(false)">
        <!-- Number line -->
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border)" stroke-width="1" />
        @for (t of [0, 0.5, 1]; track t) {
          <line [attr.x1]="toX(t)" y1="-4" [attr.x2]="toX(t)" y2="4"
                stroke="var(--border-strong)" stroke-width="1" />
          <text [attr.x]="toX(t)" y="16" class="tick">{{ t }}</text>
        }

        <!-- Set points -->
        @for (p of current().points; track p) {
          <circle [attr.cx]="toX(p)" cy="0" r="3.5" fill="var(--accent)" fill-opacity="0.7" />
        }

        <!-- Sup marker (true) -->
        <line [attr.x1]="toX(current().sup)" y1="-18" [attr.x2]="toX(current().sup)" y2="18"
              stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="4 3" />
        @if (current().supIn) {
          <circle [attr.cx]="toX(current().sup)" cy="0" r="5" fill="#5a8a5a" />
        } @else {
          <circle [attr.cx]="toX(current().sup)" cy="0" r="5" fill="none"
                  stroke="#5a8a5a" stroke-width="1.5" />
        }

        <!-- User's draggable upper bound -->
        <line [attr.x1]="toX(userBound())" y1="-22" [attr.x2]="toX(userBound())" y2="22"
              stroke="var(--accent)" stroke-width="2" />
        <text [attr.x]="toX(userBound())" y="-26" class="bound-label">
          {{ userBound().toFixed(2) }}
        </text>
      </svg>

      <div class="result-row">
        <div class="r-card" [class.yes]="isUpperBound()" [class.no]="!isUpperBound()">
          {{ userBound().toFixed(2) }} 是上界？ {{ isUpperBound() ? '✓ 是' : '✗ 不是' }}
        </div>
        <div class="r-card sup-card">
          sup = {{ current().sup }}
          ({{ current().supIn ? '在集合裡' : '不在集合裡' }})
        </div>
      </div>

      <div class="desc">{{ current().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        sup 的關鍵性質：
      </p>
      <ul>
        <li>sup 是上界（S 裡的每個元素 ≤ sup）</li>
        <li>sup 是<strong>最小的</strong>上界（任何比 sup 小的數都不是上界）</li>
        <li>sup 可以在集合裡，也可以不在</li>
      </ul>
      <p>
        下一節用 sup 來定義<strong>完備性</strong>——
        這是實數和有理數之間最根本的差別。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .sup-svg { width: 100%; display: block; margin-bottom: 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
      cursor: ew-resize; touch-action: none; }
    .tick { font-size: 10px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .bound-label { font-size: 9px; fill: var(--accent); text-anchor: middle;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .result-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      &.yes { background: rgba(90, 138, 90, 0.1); color: #5a8a5a; }
      &.no { background: rgba(160, 90, 90, 0.1); color: #a05a5a; }
      &.sup-card { background: var(--bg-surface); color: var(--text); border: 1px solid var(--border); } }

    .desc { padding: 10px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepSupInfComponent {
  readonly examples = EXAMPLES;
  readonly selIdx = signal(0);
  readonly userBound = signal(1.2);
  readonly dragging = signal(false);

  readonly current = computed(() => EXAMPLES[this.selIdx()]);

  readonly isUpperBound = computed(() => {
    const bound = this.userBound();
    return this.current().points.every((p) => p <= bound + 1e-8);
  });

  toX(v: number): number { return 20 + v * 360; }

  onDrag(ev: PointerEvent): void {
    if (!this.dragging()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const xRatio = (ev.clientX - rect.left) / rect.width;
    const val = (xRatio * 440 - 20) / 360;
    this.userBound.set(Math.max(-0.1, Math.min(1.5, val)));
  }
}
