import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { shiftPower, kernel, identity, matSub, matScale, matVec } from './jordan-util';

interface Preset { name: string; A: number[][]; lambda: number; desc: string; }

const PRESETS: Preset[] = [
  { name: '2×2 缺陷', A: [[2, 1], [0, 2]], lambda: 2,
    desc: 'ker(A−2I) 只有 1 維，ker(A−2I)² 是 2 維 → 需要 rank-2 廣義特徵向量' },
  { name: '3×3 Jordan', A: [[5, 1, 0], [0, 5, 1], [0, 0, 5]], lambda: 5,
    desc: 'ker 的維度從 1→2→3 逐步增長，形成一條長鏈' },
  { name: '3×3 兩塊', A: [[3, 1, 0], [0, 3, 0], [0, 0, 3]], lambda: 3,
    desc: 'ker(A−3I) 已經 2 維，但 ker(A−3I)² 是 3 維 → 兩條短鏈' },
];

@Component({
  selector: 'app-step-generalized-eigenvectors',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="廣義特徵向量" subtitle="§17.4">
      <p>
        普通特徵向量滿足 (A − λI)v = 0。<strong>廣義特徵向量</strong>放寬條件：
      </p>
      <p class="formula">(A − λI)ᵏ v = 0</p>
      <p>
        rank-k 的廣義特徵向量：(A−λI)ᵏ v = 0 但 (A−λI)ᵏ⁻¹ v ≠ 0。
        普通特徵向量是 rank-1 的特例。
      </p>
      <p>
        一條<strong>Jordan 鏈</strong>：v₂ → v₁ → 0，其中 (A−λI)v₂ = v₁ 是特徵向量，
        v₂ 是 rank-2 廣義特徵向量。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看 ker(A−λI)ᵏ 怎麼逐步「長大」">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="chain-viz">
        @for (step of kernelChain(); track step.k) {
          <div class="chain-step" [class.full]="step.dim === n()">
            <div class="cs-header">
              <span class="cs-label">ker(A−λI){{ step.k === 1 ? '' : superscript(step.k) }}</span>
              <span class="cs-dim">維度 = {{ step.dim }}</span>
            </div>
            <div class="cs-basis">
              @if (step.basis.length === 0) {
                <span class="cs-empty">只有零向量</span>
              }
              @for (v of step.basis; track $index) {
                <span class="cs-vec">[{{ v.map(x => fmt(x)).join(', ') }}]</span>
              }
            </div>
            @if (step.k > 1 && step.dim > prevDim(step.k)) {
              <div class="cs-new">← 新出現 {{ step.dim - prevDim(step.k) }} 個方向</div>
            }
          </div>
          @if (step.k < kernelChain().length) {
            <div class="chain-arrow">⊂</div>
          }
        }
      </div>

      <div class="summary-box">
        <div class="sb-title">Jordan 鏈結構</div>
        <div class="sb-body">
          {{ presets[presetIdx()].desc }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        關鍵洞察：ker(A−λI) ⊂ ker(A−λI)² ⊂ … ⊂ ker(A−λI)ⁿ。
        每一步<strong>嚴格增大</strong>直到穩定。增長的速度決定了 Jordan 塊的結構。
      </p>
      <p>
        下一節看這些廣義特徵向量怎麼組成 <strong>Jordan 區塊</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .chain-viz { display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin-bottom: 12px; }
    .chain-step { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); min-width: 140px;
      &.full { border-color: #5a8a5a; background: rgba(90, 138, 90, 0.06); } }
    .cs-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .cs-label { font-size: 12px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .cs-dim { font-size: 12px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; }
    .cs-basis { display: flex; flex-direction: column; gap: 3px; }
    .cs-vec { font-size: 11px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; padding: 2px 6px;
      background: var(--bg); border-radius: 3px; }
    .cs-empty { font-size: 11px; color: var(--text-muted); font-style: italic; }
    .cs-new { font-size: 10px; color: #c8983b; font-weight: 600; margin-top: 4px; }
    .chain-arrow { font-size: 16px; color: var(--text-muted); font-weight: 700; }

    .summary-box { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .sb-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .sb-body { font-size: 13px; color: var(--text-secondary); }
  `,
})
export class StepGeneralizedEigenvectorsComponent {
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);

  readonly n = computed(() => PRESETS[this.presetIdx()].A.length);

  readonly kernelChain = computed(() => {
    const { A, lambda } = PRESETS[this.presetIdx()];
    const n = A.length;
    const chain: { k: number; dim: number; basis: number[][] }[] = [];
    for (let k = 1; k <= n; k++) {
      const M = shiftPower(A, lambda, k);
      const basis = kernel(M);
      chain.push({ k, dim: basis.length, basis });
      if (basis.length === n) break; // full space reached
    }
    return chain;
  });

  prevDim(k: number): number {
    const chain = this.kernelChain();
    const prev = chain.find((s) => s.k === k - 1);
    return prev?.dim ?? 0;
  }

  superscript(n: number): string {
    const map: Record<string, string> = { '2': '²', '3': '³', '4': '⁴', '5': '⁵' };
    return map[String(n)] ?? `^${n}`;
  }

  fmt(v: number): string {
    if (Math.abs(v) < 1e-8) return '0';
    if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
    return v.toFixed(2);
  }
}
