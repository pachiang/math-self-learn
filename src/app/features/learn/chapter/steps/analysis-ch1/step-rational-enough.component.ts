import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sqrt2Approximations } from './analysis-util';

const SQRT2 = Math.SQRT2;
const APPROX = sqrt2Approximations(6);

@Component({
  selector: 'app-step-rational-enough',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="有理數夠用嗎？" subtitle="§1.1">
      <p>
        有理數 Q = {{ '{' }}p/q : p, q ∈ Z, q ≠ 0{{ '}' }} 是我們最熟悉的數系。
        分數能表示「所有的」數嗎？
      </p>
      <p>
        古希臘的畢達哥拉斯學派相信「萬物皆數」——所有量都能用整數的比來表達。
        但他們自己發現了一個致命的反例：
      </p>
      <p>
        邊長 1 的正方形，對角線長度是多少？
      </p>
      <p class="formula">√(1² + 1²) = √2</p>
      <p>
        √2 不是有理數。證明出乎意料地簡潔：
      </p>
    </app-prose-block>

    <app-challenge-card prompt="√2 的無理性證明（反證法）">
      <div class="proof-box">
        <div class="proof-step" [class.active]="proofStep() >= 1" (click)="proofStep.set(1)">
          <div class="ps-num">1</div>
          <div class="ps-body">
            假設 √2 = p/q，其中 p, q 互質（最簡分數）
          </div>
        </div>
        <div class="proof-step" [class.active]="proofStep() >= 2" (click)="proofStep.set(2)">
          <div class="ps-num">2</div>
          <div class="ps-body">
            兩邊平方：2 = p²/q² → p² = 2q²<br />
            所以 p² 是偶數 → p 是偶數（奇數的平方是奇數）
          </div>
        </div>
        <div class="proof-step" [class.active]="proofStep() >= 3" (click)="proofStep.set(3)">
          <div class="ps-num">3</div>
          <div class="ps-body">
            設 p = 2k，代入：(2k)² = 2q² → 4k² = 2q² → q² = 2k²<br />
            所以 q² 是偶數 → q 是偶數
          </div>
        </div>
        <div class="proof-step" [class.active]="proofStep() >= 4" (click)="proofStep.set(4)">
          <div class="ps-num">4</div>
          <div class="ps-body">
            p 和 q 都是偶數 → 它們有公因數 2 → <strong>與「互質」矛盾！</strong><br />
            所以 √2 不可能是有理數。∎
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="在數線上放大看看 √2 附近——有理數很密，但永遠摸不到 √2">
      <div class="zoom-ctrl">
        <span class="zl">放大</span>
        <input type="range" min="0" max="8" step="1" [value]="zoomLevel()"
               (input)="zoomLevel.set(+($any($event.target)).value)" class="z-slider" />
        <span class="zv">×{{ zoomFactor().toFixed(0) }}</span>
      </div>

      <svg [attr.viewBox]="viewBox()" class="numline-svg">
        <!-- Number line -->
        <line [attr.x1]="vbLeft()" y1="0" [attr.x2]="vbRight()" y2="0"
              stroke="var(--border)" stroke-width="0.002" />

        <!-- Rational approximations from below -->
        @for (r of belowApprox(); track r.label) {
          <line [attr.x1]="r.val" y1="-0.008" [attr.x2]="r.val" y2="0.008"
                stroke="#5a7faa" stroke-width="0.001" />
          @if (r.visible) {
            <text [attr.x]="r.val" y="0.018" class="r-label">{{ r.label }}</text>
          }
        }

        <!-- Rational approximations from above -->
        @for (r of aboveApprox(); track r.label) {
          <line [attr.x1]="r.val" y1="-0.008" [attr.x2]="r.val" y2="0.008"
                stroke="#aa5a6a" stroke-width="0.001" />
          @if (r.visible) {
            <text [attr.x]="r.val" y="-0.012" class="r-label above">{{ r.label }}</text>
          }
        }

        <!-- √2 marker (the gap!) -->
        <circle [attr.cx]="sqrt2" cy="0" r="0.005"
                fill="none" stroke="var(--accent)" stroke-width="0.002" stroke-dasharray="0.003 0.002" />
        <text [attr.x]="sqrt2" y="-0.025" class="sqrt2-label">√2</text>
      </svg>

      <div class="zoom-note">
        不管放大多少倍，√2 的位置永遠是一個<strong>空洞</strong>——
        有理數從兩邊逼近但永遠到不了。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        有理數在數線上<strong>稠密</strong>——任意兩個有理數之間都有無窮多個有理數。
        但稠密不等於「沒有洞」。√2 的位置就是一個洞。
      </p>
      <p>
        下一節來更精確地描述這個「洞」是什麼。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .proof-box { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .proof-step { display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border);
      cursor: pointer; opacity: 0.35; transition: opacity 0.2s;
      &:last-child { border-bottom: none; }
      &.active { opacity: 1; }
      &:hover { background: var(--bg-surface); } }
    .ps-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .ps-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7;
      strong { color: #a05a5a; } }

    .zoom-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .zl { font-size: 13px; color: var(--text-muted); }
    .z-slider { flex: 1; accent-color: var(--accent); }
    .zv { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 40px; }

    .numline-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .r-label { font-size: 0.008px; fill: #5a7faa; text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
      &.above { fill: #aa5a6a; } }
    .sqrt2-label { font-size: 0.01px; fill: var(--accent); text-anchor: middle;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .zoom-note { font-size: 12px; color: var(--text-secondary); text-align: center;
      padding: 8px; background: var(--bg-surface); border-radius: 6px;
      border: 1px solid var(--border);
      strong { color: var(--accent); } }
  `,
})
export class StepRationalEnoughComponent {
  readonly sqrt2 = SQRT2;
  readonly proofStep = signal(0);
  readonly zoomLevel = signal(0);

  readonly zoomFactor = computed(() => Math.pow(3, this.zoomLevel()));
  readonly halfWidth = computed(() => 0.5 / this.zoomFactor());

  readonly vbLeft = computed(() => SQRT2 - this.halfWidth());
  readonly vbRight = computed(() => SQRT2 + this.halfWidth());
  readonly viewBox = computed(() => {
    const hw = this.halfWidth();
    return `${SQRT2 - hw} -0.035 ${2 * hw} 0.07`;
  });

  readonly belowApprox = computed(() => {
    const hw = this.halfWidth();
    return APPROX.below.map(([p, q]) => ({
      val: p / q,
      label: `${p}/${q}`,
      visible: Math.abs(p / q - SQRT2) < hw * 1.8,
    }));
  });

  readonly aboveApprox = computed(() => {
    const hw = this.halfWidth();
    return APPROX.above.map(([p, q]) => ({
      val: p / q,
      label: `${p}/${q}`,
      visible: Math.abs(p / q - SQRT2) < hw * 1.8,
    }));
  });
}
