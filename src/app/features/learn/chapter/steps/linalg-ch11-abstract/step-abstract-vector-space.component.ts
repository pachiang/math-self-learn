import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { functionPath } from './abstract-util';

@Component({
  selector: 'app-step-abstract-vector-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="向量是規則，不是長相" subtitle="§11.1">
      <p>
        到目前為止，你看到的向量幾乎都住在 <strong>R^n</strong> 裡：像是 (2, -1) 或 (3, 0, 4)。
        但線性代數真正厲害的地方是：<strong>向量根本不必長得像箭頭</strong>。
      </p>
      <p>
        只要一個集合能做「加法」和「純量倍」，而且遵守同一套規則，我們就把它當成向量空間。
        多項式可以，函數也可以。
      </p>
      <p class="hint">
        第十一章的核心句子是：<strong>向量是行為，不是外表。</strong>
      </p>
    </app-prose-block>

    <app-challenge-card prompt="同一組座標，在不同空間裡會長不同樣子；但加法和縮放的規則完全一樣">
      <div class="sliders">
        <div class="sl">
          <span class="lab">u₁</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="u1()" (input)="u1.set(+$any($event).target.value)" />
          <span class="val">{{ u1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">u₂</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="u2()" (input)="u2.set(+$any($event).target.value)" />
          <span class="val">{{ u2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">v₁</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="v1()" (input)="v1.set(+$any($event).target.value)" />
          <span class="val">{{ v1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">v₂</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="v2()" (input)="v2.set(+$any($event).target.value)" />
          <span class="val">{{ v2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">λ</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="lambda()" (input)="lambda.set(+$any($event).target.value)" />
          <span class="val">{{ lambda().toFixed(1) }}</span>
        </div>
      </div>

      <div class="coord-strip">
        <span class="chip">u = [{{ u1().toFixed(1) }}, {{ u2().toFixed(1) }}]</span>
        <span class="chip">v = [{{ v1().toFixed(1) }}, {{ v2().toFixed(1) }}]</span>
        <span class="chip strong">u + v = [{{ sum()[0].toFixed(1) }}, {{ sum()[1].toFixed(1) }}]</span>
        <span class="chip strong">λu = [{{ scaled()[0].toFixed(1) }}, {{ scaled()[1].toFixed(1) }}]</span>
      </div>

      <div class="panel-grid">
        <section class="panel">
          <div class="pt">R² 裡的箭頭</div>
          <svg viewBox="-130 -130 260 260" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.9" />

            <line x1="0" y1="0" [attr.x2]="u()[0] * 32" [attr.y2]="-u()[1] * 32"
              stroke="var(--v0)" stroke-width="3" marker-end="url(#tip-u)" />
            <line x1="0" y1="0" [attr.x2]="v()[0] * 32" [attr.y2]="-v()[1] * 32"
              stroke="var(--v1)" stroke-width="3" marker-end="url(#tip-v)" />
            <line x1="0" y1="0" [attr.x2]="sum()[0] * 32" [attr.y2]="-sum()[1] * 32"
              stroke="var(--accent)" stroke-width="4" marker-end="url(#tip-sum)" />
            <line x1="0" y1="0" [attr.x2]="scaled()[0] * 32" [attr.y2]="-scaled()[1] * 32"
              stroke="var(--v4)" stroke-width="3" stroke-dasharray="5 4" marker-end="url(#tip-scaled)" />

            <text [attr.x]="u()[0] * 32 + 8" [attr.y]="-u()[1] * 32 - 6" class="lbl u">u</text>
            <text [attr.x]="v()[0] * 32 + 8" [attr.y]="-v()[1] * 32 - 6" class="lbl v">v</text>
            <text [attr.x]="sum()[0] * 32 + 8" [attr.y]="-sum()[1] * 32 - 6" class="lbl sum">u + v</text>
            <text [attr.x]="scaled()[0] * 32 + 8" [attr.y]="-scaled()[1] * 32 - 6" class="lbl scaled">λu</text>

            <defs>
              <marker id="tip-u" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" fill="var(--v0)" />
              </marker>
              <marker id="tip-v" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" fill="var(--v1)" />
              </marker>
              <marker id="tip-sum" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
              </marker>
              <marker id="tip-scaled" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" fill="var(--v4)" />
              </marker>
            </defs>
          </svg>
          <div class="eq">u + v 就是箭頭相加；λu 就是把箭頭拉長或翻轉。</div>
        </section>

        <section class="panel">
          <div class="pt">多項式空間</div>
          <svg viewBox="-130 -95 260 190" class="viz">
            @for (g of graphGrid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="polyUPath()" fill="none" stroke="var(--v0)" stroke-width="2.5" />
            <path [attr.d]="polyVPath()" fill="none" stroke="var(--v1)" stroke-width="2.5" />
            <path [attr.d]="polySumPath()" fill="none" stroke="var(--accent)" stroke-width="3.5" />
            <path [attr.d]="polyScaledPath()" fill="none" stroke="var(--v4)" stroke-width="2.5" stroke-dasharray="5 4" />
          </svg>
          <div class="eq mono">pᵤ(x) = {{ polyFormula(u()) }}</div>
          <div class="eq mono">pᵥ(x) = {{ polyFormula(v()) }}</div>
          <div class="eq mono strong">(pᵤ + pᵥ)(x) = {{ polyFormula(sum()) }}</div>
        </section>

        <section class="panel">
          <div class="pt">函數波形空間</div>
          <svg viewBox="-130 -95 260 190" class="viz">
            @for (g of graphGrid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="waveUPath()" fill="none" stroke="var(--v0)" stroke-width="2.5" />
            <path [attr.d]="waveVPath()" fill="none" stroke="var(--v1)" stroke-width="2.5" />
            <path [attr.d]="waveSumPath()" fill="none" stroke="var(--accent)" stroke-width="3.5" />
            <path [attr.d]="waveScaledPath()" fill="none" stroke="var(--v4)" stroke-width="2.5" stroke-dasharray="5 4" />
          </svg>
          <div class="eq mono">fᵤ(x) = {{ waveFormula(u()) }}</div>
          <div class="eq mono">fᵥ(x) = {{ waveFormula(v()) }}</div>
          <div class="eq mono strong">(fᵤ + fᵥ)(x) = {{ waveFormula(sum()) }}</div>
        </section>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這三個畫面看起來完全不一樣，但背後用的座標其實都是同一套：
        <strong>[c₁, c₂]</strong>。
      </p>
      <ul>
        <li>在 R²，它是一支箭頭</li>
        <li>在多項式空間，它變成 c₁ + c₂x</li>
        <li>在函數空間，它可以變成 c₁sin(πx) + c₂cos(πx)</li>
      </ul>
      <p>
        所以抽象向量空間真正說的是：<strong>只要加法和純量倍的規則是同一種，線性代數就能搬過去。</strong>
      </p>
    </app-prose-block>
  `,
  styles: `
    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .sl { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); text-align: center;
      font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 36px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .coord-strip { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .chip { padding: 6px 10px; border-radius: 999px; background: var(--bg); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .chip.strong { background: var(--accent-10); color: var(--text); border-color: var(--accent-30); }

    .panel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    .panel { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .pt { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; margin-bottom: 8px; }
    .eq { font-size: 12px; line-height: 1.5; color: var(--text-secondary); }
    .eq.mono { font-family: 'JetBrains Mono', monospace; }
    .eq.strong { color: var(--text); font-weight: 700; }
    .lbl { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .lbl.u { fill: var(--v0); }
    .lbl.v { fill: var(--v1); }
    .lbl.sum { fill: var(--accent); }
    .lbl.scaled { fill: var(--v4); }
  `,
})
export class StepAbstractVectorSpaceComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly graphGrid = [-60, -30, 30, 60];

  readonly u1 = signal(1.2);
  readonly u2 = signal(0.8);
  readonly v1 = signal(-0.7);
  readonly v2 = signal(1.4);
  readonly lambda = signal(-1.3);

  readonly u = computed<[number, number]>(() => [this.u1(), this.u2()]);
  readonly v = computed<[number, number]>(() => [this.v1(), this.v2()]);
  readonly sum = computed<[number, number]>(() => [this.u1() + this.v1(), this.u2() + this.v2()]);
  readonly scaled = computed<[number, number]>(() => [this.lambda() * this.u1(), this.lambda() * this.u2()]);

  polyFormula(coeffs: readonly number[]): string {
    return `${coeffs[0].toFixed(1)} + ${coeffs[1].toFixed(1)}x`;
  }

  waveFormula(coeffs: readonly number[]): string {
    return `${coeffs[0].toFixed(1)}sin(πx) + ${coeffs[1].toFixed(1)}cos(πx)`;
  }

  readonly polyUPath = computed(() => functionPath((x) => this.u1() + this.u2() * x, { scaleY: 26 }));
  readonly polyVPath = computed(() => functionPath((x) => this.v1() + this.v2() * x, { scaleY: 26 }));
  readonly polySumPath = computed(() => functionPath((x) => this.sum()[0] + this.sum()[1] * x, { scaleY: 26 }));
  readonly polyScaledPath = computed(() => functionPath((x) => this.scaled()[0] + this.scaled()[1] * x, { scaleY: 26 }));

  readonly waveUPath = computed(() => functionPath((x) => this.u1() * Math.sin(Math.PI * x) + this.u2() * Math.cos(Math.PI * x), { scaleY: 28 }));
  readonly waveVPath = computed(() => functionPath((x) => this.v1() * Math.sin(Math.PI * x) + this.v2() * Math.cos(Math.PI * x), { scaleY: 28 }));
  readonly waveSumPath = computed(() => functionPath((x) => this.sum()[0] * Math.sin(Math.PI * x) + this.sum()[1] * Math.cos(Math.PI * x), { scaleY: 28 }));
  readonly waveScaledPath = computed(() => functionPath((x) => this.scaled()[0] * Math.sin(Math.PI * x) + this.scaled()[1] * Math.cos(Math.PI * x), { scaleY: 28 }));
}
