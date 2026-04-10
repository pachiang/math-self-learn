import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { transpose, levelLinePath, applyFunctional } from './dual-util';

@Component({
  selector: 'app-step-transpose-dual',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="轉置的真正意義" subtitle="§18.4">
      <p>
        轉置不只是「把列和行交換」。它有一個深層的定義：
      </p>
      <p>
        給定線性映射 T: V → W，<strong>對偶映射</strong> T*: W* → V* 定義為：
      </p>
      <p class="formula">(T* φ)(v) = φ(T v)</p>
      <p>
        也就是：先用 T 把 v 送到 W，再用 φ 量測。
        T* 是 φ 的「拉回」（pullback）——把 W 上的泛函拉回到 V 上。
      </p>
      <p>
        在矩陣表示下，<strong>T* 就是 Aᵀ</strong>。這就是轉置的真正意義。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看 T 把向量往前推，T* = Aᵀ 把泛函往回拉">
      <div class="ctrl-row">
        <div class="ctrl">
          <span class="cl">A =</span>
          <span class="mat-inline">[{{ a00().toFixed(1) }}, {{ a01().toFixed(1) }}; {{ a10().toFixed(1) }}, {{ a11().toFixed(1) }}]</span>
        </div>
        <div class="sliders">
          <input type="range" min="-2" max="2" step="0.1" [value]="a00()" (input)="a00.set(+($any($event.target)).value)" class="sl" />
          <input type="range" min="-2" max="2" step="0.1" [value]="a01()" (input)="a01.set(+($any($event.target)).value)" class="sl" />
          <input type="range" min="-2" max="2" step="0.1" [value]="a10()" (input)="a10.set(+($any($event.target)).value)" class="sl" />
          <input type="range" min="-2" max="2" step="0.1" [value]="a11()" (input)="a11.set(+($any($event.target)).value)" class="sl" />
        </div>
      </div>

      <div class="dual-layout">
        <div class="panel">
          <div class="panel-title">T: V → W（向前推向量）</div>
          <svg viewBox="-3 -3 6 6" class="d-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="g" y1="-3" [attr.x2]="g" y2="3" stroke="var(--border)" stroke-width="0.015" />
              <line x1="-3" [attr.y1]="g" x2="3" [attr.y2]="g" stroke="var(--border)" stroke-width="0.015" />
            }
            <!-- Original vector -->
            <line x1="0" y1="0" x2="1" y2="0.5" stroke="var(--text-muted)" stroke-width="0.04" stroke-dasharray="0.1 0.07" />
            <!-- Transformed vector Tv -->
            <line x1="0" y1="0" [attr.x2]="tv()[0]" [attr.y2]="tv()[1]"
                  stroke="var(--accent)" stroke-width="0.06" />
            <circle [attr.cx]="tv()[0]" [attr.cy]="tv()[1]" r="0.08" fill="var(--accent)" />
            <text x="1.1" y="0.3" class="v-label" fill="var(--text-muted)">v</text>
            <text [attr.x]="tv()[0] + 0.15" [attr.y]="tv()[1] - 0.1" class="v-label" fill="var(--accent)">Tv</text>
          </svg>
        </div>

        <div class="arrow-col">
          <div class="arrow-text">T →</div>
          <div class="arrow-text">← T*</div>
        </div>

        <div class="panel">
          <div class="panel-title">T* = Aᵀ: W* → V*（往回拉泛函）</div>
          <svg viewBox="-3 -3 6 6" class="d-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="g" y1="-3" [attr.x2]="g" y2="3" stroke="var(--border)" stroke-width="0.015" />
              <line x1="-3" [attr.y1]="g" x2="3" [attr.y2]="g" stroke="var(--border)" stroke-width="0.015" />
            }
            <!-- φ level sets (in W*) -->
            @for (c of [-1, 0, 1]; track c) {
              <path [attr.d]="phiLevel(c)" fill="none" stroke="#c8983b" stroke-width="0.03" stroke-opacity="0.4" />
            }
            <!-- T*φ level sets (in V*) -->
            @for (c of [-1, 0, 1]; track c) {
              <path [attr.d]="pullbackLevel(c)" fill="none" stroke="var(--accent)" stroke-width="0.03" />
            }
            <text x="-2.5" y="-2.5" class="v-label" fill="#c8983b">φ (W*)</text>
            <text x="-2.5" y="-2.1" class="v-label" fill="var(--accent)">T*φ (V*)</text>
          </svg>
        </div>
      </div>

      <div class="verify">
        驗證：(T*φ)(v) = φ(Tv) — 不管 A 怎麼選，這個等式永遠成立。
        這就是轉置的<strong>定義</strong>，不是巧合。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        現在你理解了：<strong>(AB)ᵀ = BᵀAᵀ</strong> 不是一個需要「記住」的公式——
        它是對偶映射的自然結果：先做 A 再做 B，拉回泛函時自然要反過來。
      </p>
      <p>
        下一節看對偶空間的另一個重要概念：<strong>零化子</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .ctrl { display: flex; align-items: center; gap: 6px; }
    .cl { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .mat-inline { font-size: 12px; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }
    .sliders { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
    .sl { width: 70px; accent-color: var(--accent); }

    .dual-layout { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px;
      margin-bottom: 12px; align-items: center; }
    @media (max-width: 700px) { .dual-layout { grid-template-columns: 1fr; }
      .arrow-col { display: none; } }
    .panel { }
    .panel-title { font-size: 11px; font-weight: 600; color: var(--text-muted);
      text-align: center; margin-bottom: 4px; }
    .d-svg { width: 100%; max-width: 240px; display: block; margin: 0 auto;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .v-label { font-size: 0.2px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .arrow-col { display: flex; flex-direction: column; gap: 8px; align-items: center; }
    .arrow-text { font-size: 12px; color: var(--text-muted); font-weight: 600; }

    .verify { padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);
      text-align: center;
      strong { color: var(--accent); } }
  `,
})
export class StepTransposeDualComponent {
  readonly grid = [-2, -1, 0, 1, 2];
  readonly a00 = signal(1.5);
  readonly a01 = signal(0.5);
  readonly a10 = signal(-0.5);
  readonly a11 = signal(1.0);

  // T applied to v = [1, 0.5]
  readonly tv = computed(() => {
    const v = [1, 0.5];
    return [this.a00() * v[0] + this.a01() * v[1], this.a10() * v[0] + this.a11() * v[1]];
  });

  // φ = [1, 0] (simple functional in W*)
  private readonly phi = [1, 0.5];

  // T*φ = Aᵀ φ
  readonly pullback = computed(() => {
    const p = this.phi;
    return [
      this.a00() * p[0] + this.a10() * p[1], // Aᵀ row 0
      this.a01() * p[0] + this.a11() * p[1], // Aᵀ row 1
    ];
  });

  phiLevel(c: number): string {
    return levelLinePath(this.phi[0], this.phi[1], c, 3);
  }

  pullbackLevel(c: number): string {
    const pb = this.pullback();
    return levelLinePath(pb[0], pb[1], c, 3);
  }
}
