import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { functionPath, maxAbs, polyValue } from './abstract-util';

@Component({
  selector: 'app-step-basis-dimension',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="基底與維度" subtitle="§11.3">
      <p>
        一個向量空間不是只有一種基底。你可以換一套座標系統，<strong>向量本身不變，但它的座標會變</strong>。
      </p>
      <p>
        對多項式空間 P₃ 而言，最常見的基底是
        <strong>{{ '{' }}1, x, x², x³{{ '}' }}</strong>。
        但你也可以改用
        <strong>{{ '{' }}1, x + 1, (x + 1)², (x + 1)³{{ '}' }}</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看同一個多項式在兩套基底下的座標如何改變；注意：需要的座標數目仍然是 4">
      <div class="sliders">
        <div class="sl">
          <span class="lab">a₀</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a0()" (input)="a0.set(+$any($event).target.value)" />
          <span class="val">{{ a0().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₁</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a1()" (input)="a1.set(+$any($event).target.value)" />
          <span class="val">{{ a1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₂</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a2()" (input)="a2.set(+$any($event).target.value)" />
          <span class="val">{{ a2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">a₃</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="a3()" (input)="a3.set(+$any($event).target.value)" />
          <span class="val">{{ a3().toFixed(1) }}</span>
        </div>
      </div>

      <div class="summary-strip">
        <span class="chip">標準基底座標：{{ vectorText(standardCoords()) }}</span>
        <span class="chip alt">平移基底座標：{{ vectorText(shiftedCoords()) }}</span>
      </div>

      <div class="layout">
        <section class="graph-card">
          <div class="gc-title">同一條曲線</div>
          <svg viewBox="-130 -105 260 210" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-90" [attr.x2]="g" [attr.y2]="90" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-90" x2="0" y2="90" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="standardPath()" fill="none" stroke="var(--accent)" stroke-width="3.8" />
            <path [attr.d]="shiftedPath()" fill="none" stroke="var(--v1)" stroke-width="2.2" stroke-dasharray="5 4" />
          </svg>
          <div class="legend">
            <span class="lg"><span class="sw standard"></span>用標準基底重建</span>
            <span class="lg"><span class="sw shifted"></span>用平移基底重建</span>
          </div>
        </section>

        <section class="graph-card">
          <div class="gc-title">標準基底 {{ '{' }}1, x, x², x³{{ '}' }}</div>
          <svg viewBox="0 0 240 140" class="bar-viz">
            <line x1="10" y1="70" x2="230" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            @for (c of standardCoords(); track $index; let i = $index) {
              <rect [attr.x]="32 + i * 48" [attr.y]="barTop(c, standardMax())"
                width="28" [attr.height]="barHeight(c, standardMax())"
                [attr.fill]="barColor(i)" rx="4" />
              <text [attr.x]="46 + i * 48" y="132" class="bar-label">{{ basisNames[i] }}</text>
              <text [attr.x]="46 + i * 48" [attr.y]="barValueY(c, standardMax())" class="bar-value">{{ c.toFixed(1) }}</text>
            }
          </svg>
        </section>

        <section class="graph-card">
          <div class="gc-title">平移基底 {{ '{' }}1, x+1, (x+1)², (x+1)³{{ '}' }}</div>
          <svg viewBox="0 0 240 140" class="bar-viz">
            <line x1="10" y1="70" x2="230" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            @for (c of shiftedCoords(); track $index; let i = $index) {
              <rect [attr.x]="32 + i * 48" [attr.y]="barTop(c, shiftedMax())"
                width="28" [attr.height]="barHeight(c, shiftedMax())"
                [attr.fill]="barColor(i)" rx="4" opacity="0.85" />
              <text [attr.x]="46 + i * 48" y="132" class="bar-label">c{{ i }}</text>
              <text [attr.x]="46 + i * 48" [attr.y]="barValueY(c, shiftedMax())" class="bar-value">{{ c.toFixed(1) }}</text>
            }
          </svg>
        </section>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        你剛剛看到的是抽象線代最關鍵的一句話：
        <strong>矩陣和座標都依賴基底，但向量空間本身不依賴。</strong>
      </p>
      <p>
        這也是「維度」真正的意思：不管你換哪一套基底，描述這個空間仍然需要同樣數目的座標。
        對 P₃ 來說，這個數字就是 <strong>4</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .sl { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); text-align: center; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 36px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .summary-strip { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .chip { padding: 6px 10px; border-radius: 999px; background: var(--bg); border: 1px solid var(--border); font-size: 12px;
      color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .chip.alt { background: rgba(110, 154, 110, 0.08); border-color: rgba(110, 154, 110, 0.28); color: var(--text); }

    .layout { display: grid; grid-template-columns: minmax(0, 1.3fr) 1fr 1fr; gap: 12px; }
    .graph-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); min-width: 0; }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz, .bar-viz { width: 100%; display: block; }
    .legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--text-secondary); margin-top: 8px; }
    .lg { display: inline-flex; align-items: center; gap: 6px; }
    .sw { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
    .sw.standard { background: var(--accent); }
    .sw.shifted { background: var(--v1); }

    .bar-label, .bar-value { font-size: 11px; text-anchor: middle; font-family: 'JetBrains Mono', monospace; }
    .bar-label { fill: var(--text-muted); }
    .bar-value { fill: var(--text); font-weight: 700; }

    @media (max-width: 920px) {
      .layout { grid-template-columns: 1fr; }
    }
  `,
})
export class StepBasisDimensionComponent {
  readonly grid = [-90, -60, -30, 30, 60, 90];
  readonly basisNames = ['1', 'x', 'x²', 'x³'];

  readonly a0 = signal(1.1);
  readonly a1 = signal(-0.6);
  readonly a2 = signal(0.9);
  readonly a3 = signal(0.4);

  readonly standardCoords = computed<[number, number, number, number]>(() => [this.a0(), this.a1(), this.a2(), this.a3()]);
  readonly shiftedCoords = computed<[number, number, number, number]>(() => {
    const a0 = this.a0();
    const a1 = this.a1();
    const a2 = this.a2();
    const a3 = this.a3();
    return [
      a0 - a1 + a2 - a3,
      a1 - 2 * a2 + 3 * a3,
      a2 - 3 * a3,
      a3,
    ];
  });

  readonly standardPath = computed(() => functionPath((x) => polyValue(this.standardCoords(), x), { scaleY: 24 }));
  readonly shiftedPath = computed(() => functionPath((x) => {
    const c = this.shiftedCoords();
    return c[0] + c[1] * (x + 1) + c[2] * (x + 1) * (x + 1) + c[3] * (x + 1) * (x + 1) * (x + 1);
  }, { scaleY: 24 }));

  readonly standardMax = computed(() => maxAbs(this.standardCoords()));
  readonly shiftedMax = computed(() => maxAbs(this.shiftedCoords()));

  vectorText(values: readonly number[]): string {
    return `[${values.map((value) => value.toFixed(1)).join(', ')}]`;
  }

  barColor(index: number): string {
    return ['var(--v6)', 'var(--v0)', 'var(--v1)', 'var(--v4)'][index] ?? 'var(--accent)';
  }

  barHeight(value: number, maxValue: number): number {
    return Math.abs(value) * (52 / maxValue);
  }

  barTop(value: number, maxValue: number): number {
    const height = this.barHeight(value, maxValue);
    return value >= 0 ? 70 - height : 70;
  }

  barValueY(value: number, maxValue: number): number {
    return value >= 0 ? this.barTop(value, maxValue) - 6 : this.barTop(value, maxValue) + this.barHeight(value, maxValue) + 14;
  }
}
