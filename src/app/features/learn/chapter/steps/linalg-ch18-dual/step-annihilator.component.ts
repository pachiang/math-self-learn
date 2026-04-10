import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { levelLinePath } from './dual-util';

@Component({
  selector: 'app-step-annihilator',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="零化子與四個子空間" subtitle="§18.5">
      <p>
        子空間 W ⊂ V 的<strong>零化子</strong> W⁰ 是所有「在 W 上消失」的泛函：
      </p>
      <p class="formula">W⁰ = {{ '{' }} φ ∈ V* : φ(w) = 0 ∀ w ∈ W {{ '}' }}</p>
      <p>
        維度公式：dim(W⁰) = dim(V) − dim(W)。
      </p>
      <p>
        這跟第五章的<strong>正交補</strong>很像，但零化子不需要內積——
        它是純粹的代數概念。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調整子空間方向，看零化子（紅色等值線）怎麼跟著轉">
      <div class="ctrl-row">
        <span class="cl">子空間 W = span(</span>
        <input type="range" min="-3.14" max="3.14" step="0.05" [value]="angle()"
               (input)="angle.set(+($any($event.target)).value)" class="sl" />
        <span class="cv">({{ wx().toFixed(2) }}, {{ wy().toFixed(2) }})</span>
        <span class="cl">)</span>
      </div>

      <svg viewBox="-3 -3 6 6" class="ann-svg">
        @for (g of grid; track g) {
          <line [attr.x1]="g" y1="-3" [attr.x2]="g" y2="3" stroke="var(--border)" stroke-width="0.015" />
          <line x1="-3" [attr.y1]="g" x2="3" [attr.y2]="g" stroke="var(--border)" stroke-width="0.015" />
        }

        <!-- Subspace W (a line through origin) -->
        <line [attr.x1]="wx() * -3" [attr.y1]="wy() * -3"
              [attr.x2]="wx() * 3" [attr.y2]="wy() * 3"
              stroke="#5a7faa" stroke-width="0.06" />
        <text [attr.x]="wx() * 2.2" [attr.y]="wy() * 2.2 - 0.2"
              class="v-label" fill="#5a7faa">W</text>

        <!-- Annihilator W⁰ level sets (perpendicular to W in non-metric sense) -->
        @for (c of annLevels; track c) {
          <path [attr.d]="annLevel(c)" fill="none"
                stroke="#a05a5a" stroke-width="0.025" [attr.stroke-opacity]="c === 0 ? 0.8 : 0.3" />
        }
        <text [attr.x]="annDir()[0] * 2.5" [attr.y]="annDir()[1] * 2.5 - 0.15"
              class="v-label" fill="#a05a5a">W⁰</text>
      </svg>

      <div class="dim-info">
        <div class="di-row">
          <span class="di-label">dim(V)</span>
          <span class="di-val">2</span>
        </div>
        <div class="di-row">
          <span class="di-label">dim(W)</span>
          <span class="di-val">1</span>
        </div>
        <div class="di-row">
          <span class="di-label">dim(W⁰)</span>
          <span class="di-val accent">{{ 2 - 1 }} = dim(V) − dim(W)</span>
        </div>
      </div>

      <div class="four-spaces">
        <div class="fs-title">第五章的四個子空間 — 對偶觀點</div>
        <table class="fs-table">
          <tr><th>第五章（用內積）</th><th>對偶觀點（不需內積）</th></tr>
          <tr>
            <td>null(Aᵀ) = col(A)⊥</td>
            <td>ker(T*) = im(T)⁰</td>
          </tr>
          <tr>
            <td>null(A) = row(A)⊥</td>
            <td>ker(T) = im(T*)⁰... 的原像</td>
          </tr>
        </table>
        <div class="fs-note">
          正交補需要內積；零化子不需要。零化子是更基本的概念。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        零化子讓第五章的「四個子空間」定理變成純代數——不依賴內積。
        在抽象向量空間（第十一章）裡，這是唯一正確的說法。
      </p>
      <p>
        下一節看一個物理應用：<strong>梯度</strong>其實是協變量（covector），不是向量。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .cl { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .sl { width: 140px; accent-color: var(--accent); }
    .cv { font-size: 12px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }

    .ann-svg { width: 100%; max-width: 360px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .v-label { font-size: 0.22px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .dim-info { display: flex; gap: 12px; margin-bottom: 14px; justify-content: center; }
    .di-row { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); display: flex; gap: 8px; }
    .di-label { font-size: 12px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; }
    .di-val { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      &.accent { color: var(--accent); } }

    .four-spaces { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .fs-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .fs-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .fs-table th { padding: 6px 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); }
    .fs-table td { padding: 6px 8px; border-bottom: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .fs-note { font-size: 11px; color: var(--text-secondary); margin-top: 8px;
      font-weight: 600; }
  `,
})
export class StepAnnihilatorComponent {
  readonly grid = [-2, -1, 0, 1, 2];
  readonly annLevels = [-2, -1, 0, 1, 2];
  readonly angle = signal(0.5);

  readonly wx = computed(() => Math.cos(this.angle()));
  readonly wy = computed(() => Math.sin(this.angle()));

  // Annihilator direction: perpendicular to W (in standard coords)
  readonly annDir = computed(() => [-this.wy(), this.wx()]);

  annLevel(c: number): string {
    const d = this.annDir();
    return levelLinePath(d[0], d[1], c, 3);
  }
}
