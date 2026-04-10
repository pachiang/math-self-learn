import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFn } from './analysis-ch10-util';

@Component({
  selector: 'app-step-dct',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="控制收斂定理 (DCT)" subtitle="§10.6">
      <p>Lebesgue 積分的<strong>皇冠寶石</strong>：</p>
      <p class="formula axiom">
        如果 fₙ → f 逐點，且 |fₙ| ≤ g 對某個 g ∈ L¹，那麼<br />
        <strong>lim ∫ fₙ = ∫ lim fₙ = ∫ f</strong>
      </p>
      <p>
        跟 MCT 比：不需要單調，不需要非負。只要有一個<strong>可積的上界函數 g</strong>「控制住」所有 fₙ。
      </p>
      <p>
        這是現代分析選擇 Lebesgue 積分的<strong>最主要原因</strong>。
        Riemann 積分需要均勻收斂才能交換極限和積分；DCT 只需要逐點收斂 + 可積控制。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="fₙ(x) = x·cos(x/n) 被 g(x) = |x| 控制，逐點收斂到 x">
      <div class="n-ctrl">
        <span class="nl">n = {{ nVal() }}</span>
        <input type="range" min="1" max="20" step="1" [value]="nVal()"
               (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 240" class="dct-svg">
        <line x1="260" y1="10" x2="260" y2="200" stroke="var(--border)" stroke-width="0.5" />
        <line x1="40" y1="120" x2="500" y2="120" stroke="var(--border)" stroke-width="0.5" />

        <!-- Control function g(x) = |x| -->
        <path [attr.d]="gPath" fill="none" stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="5 3" />
        <path [attr.d]="gNegPath" fill="none" stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="5 3" />

        <!-- Limit function f(x) = x -->
        <path [attr.d]="limitPath" fill="none" stroke="#5a8a5a" stroke-width="2" stroke-dasharray="4 3" />

        <!-- Current fₙ -->
        <path [attr.d]="fnPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="legend">
        <span><span class="dot accent"></span>fₙ(x) = x·cos(x/n)</span>
        <span><span class="dot green"></span>f(x) = x（極限）</span>
        <span><span class="dot red"></span>±g(x) = ±|x|（控制）</span>
      </div>

      <div class="dct-summary">
        |fₙ(x)| = |x·cos(x/n)| ≤ |x| = g(x) ∈ L¹ ✓<br />
        fₙ → f = x 逐點 ✓<br />
        DCT → <strong>lim ∫ fₙ = ∫ x</strong>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>DCT 是解析數論、概率論、PDE 裡<strong>最常用</strong>的收斂定理。下一節看 Lebesgue 和 Riemann 的關係。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } strong { color: var(--text); } }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .dct-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .legend { display: flex; gap: 14px; font-size: 11px; color: var(--text-muted); margin-bottom: 10px;
      flex-wrap: wrap; }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.accent { background: var(--accent); } &.green { background: #5a8a5a; } &.red { background: #a05a5a; } }
    .dct-summary { padding: 12px; text-align: center; font-size: 13px;
      font-family: 'JetBrains Mono', monospace; color: var(--text-secondary);
      background: rgba(90,138,90,0.06); border-radius: 8px; border: 1px solid rgba(90,138,90,0.2);
      line-height: 1.8; strong { color: #5a8a5a; font-size: 15px; } }
  `,
})
export class StepDctComponent {
  readonly nVal = signal(3);

  sx(x: number): number { return 260 + x * 40; }
  sy(y: number): number { return 120 - y * 15; }

  // fₙ(x) = x * cos(x/n)
  fnPath(): string {
    const n = this.nVal();
    const pts = sampleFn((x) => x * Math.cos(x / n), -5, 5, 300);
    return 'M' + pts.filter((p) => Math.abs(p.y) < 6).map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  }

  // g(x) = |x| (upper control)
  readonly gPath = (() => {
    const pts = sampleFn(Math.abs, -5, 5, 200);
    return 'M' + pts.map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  })();

  // -g(x) = -|x| (lower control)
  readonly gNegPath = (() => {
    const pts = sampleFn((x) => -Math.abs(x), -5, 5, 200);
    return 'M' + pts.map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  })();

  // f(x) = x (limit)
  readonly limitPath = (() => {
    const pts = sampleFn((x) => x, -5, 5, 200);
    return 'M' + pts.map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  })();
}
