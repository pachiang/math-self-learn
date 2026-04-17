import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { FIELDS_3D, fluxIntegral, curl3D, Surface, VectorField3D } from './analysis-ch16-util';

// Upper hemisphere as the surface, boundary = unit circle in z=0 plane
const HEMISPHERE: Surface = {
  name: '上半球',
  r: (u, v) => [Math.sin(u) * Math.cos(v), Math.sin(u) * Math.sin(v), Math.cos(u)],
  uRange: [0, Math.PI / 2], vRange: [0, 2 * Math.PI],
};

// Disk in z=0 plane (flat cap)
const DISK: Surface = {
  name: '圓盤',
  r: (u, v) => [u * Math.cos(v), u * Math.sin(v), 0],
  uRange: [0, 1], vRange: [0, 2 * Math.PI],
};

@Component({
  selector: 'app-step-stokes-theorem',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Stokes 定理" subtitle="§16.7">
      <p>Green 定理的終極推廣——把<strong>線積分</strong>轉成<strong>曲面積分</strong>：</p>
      <p class="formula thm">∮_C F · dr = ∬_S (curl F) · dS</p>
      <p>
        C 是 S 的邊界（右手定則確定方向）。<br>
        邊界上的<strong>環流量</strong> = 曲面上 <strong>curl F</strong> 的通量。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="兩種曲面（半球和圓盤）有相同的邊界 → Stokes 保證積分相同">
      <div class="fn-tabs">
        @for (f of fields; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <div class="verify-3col">
        <div class="v-col">
          <div class="v-title">∮_C F · dr</div>
          <div class="v-sub">線積分（邊界）</div>
          <div class="v-val">{{ lineVal().toFixed(3) }}</div>
        </div>
        <div class="v-eq">=</div>
        <div class="v-col">
          <div class="v-title">∬_半球 curl F · dS</div>
          <div class="v-sub">半球面上 curl 的通量</div>
          <div class="v-val">{{ hemisphereVal().toFixed(3) }}</div>
        </div>
        <div class="v-eq">=</div>
        <div class="v-col">
          <div class="v-title">∬_圓盤 curl F · dS</div>
          <div class="v-sub">平面圓盤上 curl 的通量</div>
          <div class="v-val">{{ diskVal().toFixed(3) }}</div>
        </div>
      </div>

      <div class="check" [class.ok]="allClose()">
        {{ allClose() ? 'Stokes 定理驗證通過 ✓ — 三個值一致' : '數值誤差（精度有限）' }}
      </div>

      <div class="insight">
        同一個邊界（單位圓），不同的曲面（半球 vs 圓盤）→ Stokes 保證 ∬ curl F · dS 的值一樣。
        曲面積分只取決於<strong>邊界</strong>，不取決於曲面本身！
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Stokes 定理統一了：<br>
        • Green 定理（平面上的 Stokes）<br>
        • 散度定理（封閉曲面，邊界 = 空）<br>
        這是微積分基本定理的最終形式：<strong>∫_∂Ω ω = ∫_Ω dω</strong>。
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
    .verify-3col { display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 14px; border-radius: 10px; background: var(--bg-surface); border: 1px solid var(--border);
      margin-bottom: 10px; flex-wrap: wrap; }
    .v-col { text-align: center; min-width: 100px; }
    .v-title { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .v-sub { font-size: 9px; color: var(--text-muted); margin-bottom: 4px; }
    .v-val { font-size: 20px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .v-eq { font-size: 20px; font-weight: 700; color: var(--accent); }
    .check { text-align: center; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600;
      margin-bottom: 10px; background: rgba(160,90,90,0.08); color: #a05a5a;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .insight { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; }
    .insight strong { color: var(--accent); }
  `,
})
export class StepStokesTheoremComponent {
  readonly fields = FIELDS_3D;
  readonly sel = signal(1);

  // Line integral ∮_C F·dr on unit circle in z=0
  readonly lineVal = computed(() => {
    const F = FIELDS_3D[this.sel()].F;
    const steps = 500; const dt = (2 * Math.PI) / steps;
    let sum = 0;
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) * dt;
      const x = Math.cos(t), y = Math.sin(t);
      const [fx, fy] = F(x, y, 0);
      sum += (-fx * Math.sin(t) + fy * Math.cos(t)) * dt;
    }
    return sum;
  });

  // ∬_hemisphere curl F · dS
  readonly hemisphereVal = computed(() => {
    const F = FIELDS_3D[this.sel()].F;
    const curlF: VectorField3D = (x, y, z) => curl3D(F, x, y, z);
    return fluxIntegral(curlF, HEMISPHERE, 40, 40);
  });

  // ∬_disk curl F · dS
  readonly diskVal = computed(() => {
    const F = FIELDS_3D[this.sel()].F;
    const curlF: VectorField3D = (x, y, z) => curl3D(F, x, y, z);
    return fluxIntegral(curlF, DISK, 40, 40);
  });

  readonly allClose = computed(() => {
    const l = this.lineVal(), h = this.hemisphereVal(), d = this.diskVal();
    return Math.abs(l - h) < 0.5 && Math.abs(l - d) < 0.5;
  });
}
