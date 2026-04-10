import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { l2Inner, lpNorm } from './analysis-ch11-util';

@Component({
  selector: 'app-step-l2-inner',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="L² 內積" subtitle="§11.5">
      <p>
        L² 有一個自然的<strong>內積</strong>：
      </p>
      <p class="formula">⟨f, g⟩ = ∫ f(x) g(x) dx</p>
      <p>
        這讓 L² 成為<strong>Hilbert 空間</strong>——可以談正交、投影、最佳逼近。
        Fourier 級數（線代 Ch12）就是 L² 裡的正交展開。
      </p>
      <p>
        Cauchy-Schwarz 不等式：|⟨f, g⟩| ≤ ||f||₂ · ||g||₂（Hölder 在 p=2 的特例）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="兩個函數的「角度」——用內積量正交性">
      <div class="fn-select">
        <button class="pre-btn" [class.active]="pair() === 0" (click)="pair.set(0)">sin × cos（正交）</button>
        <button class="pre-btn" [class.active]="pair() === 1" (click)="pair.set(1)">sin × sin（平行）</button>
        <button class="pre-btn" [class.active]="pair() === 2" (click)="pair.set(2)">x × x²</button>
      </div>

      <div class="result-grid">
        <div class="rg-card">
          <div class="rgc-label">⟨f, g⟩</div>
          <div class="rgc-val" [class.zero]="Math.abs(inner()) < 0.001">{{ inner().toFixed(4) }}</div>
        </div>
        <div class="rg-card">
          <div class="rgc-label">||f||₂</div>
          <div class="rgc-val">{{ normF().toFixed(4) }}</div>
        </div>
        <div class="rg-card">
          <div class="rgc-label">||g||₂</div>
          <div class="rgc-val">{{ normG().toFixed(4) }}</div>
        </div>
        <div class="rg-card" [class.ortho]="Math.abs(inner()) < 0.001">
          <div class="rgc-label">cos θ = ⟨f,g⟩/(||f||·||g||)</div>
          <div class="rgc-val">{{ cosAngle().toFixed(4) }}</div>
        </div>
      </div>

      @if (Math.abs(inner()) < 0.001) {
        <div class="ortho-msg">⟨f, g⟩ = 0 → f ⊥ g（正交！）</div>
      }

      <div class="hilbert-note">
        <strong>Hilbert 空間</strong> = 完備 + 內積。L² 是無限維 Hilbert 空間——
        就像 Rⁿ 但有無限多個「方向」。Fourier 基底就是 L² 的一組正交基。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看 Lᵖ 裡有哪些<strong>稠密子集</strong>——可以用簡單的函數逼近任何 Lᵖ 函數。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-select { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
    @media (max-width: 500px) { .result-grid { grid-template-columns: 1fr 1fr; } }
    .rg-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
      &.ortho { background: rgba(90,138,90,0.08); border-color: #5a8a5a; } }
    .rgc-label { font-size: 10px; color: var(--text-muted); }
    .rgc-val { font-size: 16px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px;
      &.zero { color: #5a8a5a; } }
    .ortho-msg { padding: 10px; text-align: center; font-size: 14px; font-weight: 700;
      color: #5a8a5a; background: rgba(90,138,90,0.08); border-radius: 8px; margin-bottom: 12px; }
    .hilbert-note { padding: 12px; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); border-radius: 8px;
      strong { color: var(--accent); } }
  `,
})
export class StepL2InnerComponent {
  readonly Math = Math;
  readonly pair = signal(0);

  private readonly pairs: { f: (x: number) => number; g: (x: number) => number }[] = [
    { f: (x) => Math.sin(Math.PI * x), g: (x) => Math.cos(Math.PI * x) },
    { f: (x) => Math.sin(Math.PI * x), g: (x) => Math.sin(Math.PI * x) },
    { f: (x) => x, g: (x) => x * x },
  ];

  readonly inner = computed(() => {
    const p = this.pairs[this.pair()];
    return l2Inner(p.f, p.g, 0, 1);
  });

  readonly normF = computed(() => lpNorm(this.pairs[this.pair()].f, 2, 0, 1));
  readonly normG = computed(() => lpNorm(this.pairs[this.pair()].g, 2, 0, 1));

  readonly cosAngle = computed(() => {
    const nf = this.normF(), ng = this.normG();
    return nf > 0 && ng > 0 ? this.inner() / (nf * ng) : 0;
  });
}
