import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { FIELDS_3D, SURFACES, fluxIntegral, div3D, ballIntegral } from './analysis-ch16-util';

@Component({
  selector: 'app-step-divergence-theorem',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="散度定理（Gauss 定理）" subtitle="§16.5">
      <p>Green 定理的 3D 版——把<strong>面積分</strong>轉成<strong>體積分</strong>：</p>
      <p class="formula thm">∬_S F · dS = ∭_V div F dV</p>
      <p>
        左邊��穿過封閉曲面 S 的<strong>通量</strong>。<br>
        右邊：內部體積的<strong>散度</strong>總和。<br>
        通量 = 內部源的總量。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="驗證散度定理：面積分 = 體積分（球面 + 單位球）">
      <div class="fn-tabs">
        @for (f of fields; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <div class="verify-box">
        <div class="v-col">
          <div class="v-title">∬_S F · dS（面積分）</div>
          <div class="v-val">{{ fluxVal().toFixed(3) }}</div>
        </div>
        <div class="v-eq">=</div>
        <div class="v-col">
          <div class="v-title">∭_V div F dV（體積分）</div>
          <div class="v-val">{{ volVal().toFixed(3) }}</div>
        </div>
      </div>

      <div class="check" [class.ok]="Math.abs(fluxVal() - volVal()) < 0.3">
        {{ Math.abs(fluxVal() - volVal()) < 0.3 ? '散度定理驗證通過 ✓' : '數值誤差較大（增加精度可改善）' }}
      </div>

      <div class="detail">
        <div class="d-row">
          <span class="dl">{{ fields[sel()].formula }}</span>
          <span class="dv">{{ fields[sel()].divFormula }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        輻射場 div = 3 → ∭3 dV = 3·(4π/3) = 4π = 通量���完美！<br>
        旋轉場 div = 0 → 通量 = 0。不可壓縮流體不會穿出封閉面。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.thm { border: 2px solid var(--accent); } }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ft { padding: 5px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .verify-box { display: flex; align-items: center; justify-content: center; gap: 14px;
      padding: 16px; border-radius: 10px; background: var(--bg-surface); border: 1px solid var(--border);
      margin-bottom: 10px; flex-wrap: wrap; }
    .v-col { text-align: center; }
    .v-title { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
    .v-val { font-size: 22px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .v-eq { font-size: 24px; font-weight: 700; color: var(--accent); }
    .check { text-align: center; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600;
      margin-bottom: 10px; background: rgba(160,90,90,0.08); color: #a05a5a;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .detail { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .d-row { display: flex; justify-content: space-between; padding: 10px 14px;
      font-size: 13px; font-family: 'JetBrains Mono', monospace; }
    .dl { color: var(--text-muted); } .dv { color: var(--accent); font-weight: 600; }
  `,
})
export class StepDivergenceTheoremComponent {
  readonly Math = Math;
  readonly fields = FIELDS_3D;
  readonly sel = signal(0);

  // Flux through unit sphere
  readonly fluxVal = computed(() => fluxIntegral(FIELDS_3D[this.sel()].F, SURFACES[1], 40, 40));

  // Volume integral of div over unit ball
  readonly volVal = computed(() => {
    const F = FIELDS_3D[this.sel()].F;
    return ballIntegral((x, y, z) => div3D(F, x, y, z), 1, 20);
  });
}
