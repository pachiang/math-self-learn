import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { luDecompose, type LUStep } from './numerical-util';

interface Preset { name: string; A: number[][]; }

const PRESETS: Preset[] = [
  { name: '2×2', A: [[4, 3], [6, 3]] },
  { name: '3×3', A: [[2, 1, 1], [4, 3, 3], [8, 7, 9]] },
  { name: '3×3 (b)', A: [[1, 2, 4], [3, 8, 14], [2, 6, 13]] },
];

@Component({
  selector: 'app-step-lu-decomposition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="LU 分解" subtitle="§15.3">
      <p>
        第四章你學過<strong>高斯消去法</strong>。現在來揭開它的數學本質：
        它其實是在把 A 拆成兩個三角矩陣的乘積。
      </p>
      <p class="formula">A = L × U</p>
      <p>
        <strong>L</strong>：下三角（Lower），對角線全 1，下面存「消去時的倍數」<br />
        <strong>U</strong>：上三角（Upper），就是消去後的階梯形
      </p>
      <p>
        有了 L 和 U，解 Ax = b 變成兩步：先解 Ly = b（前代），再解 Ux = y（回代）。
        每步都只需 O(n²)。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個矩陣，一步步看消去法怎麼同時建出 L 和 U">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="loadPreset(i)">{{ p.name }}</button>
        }
        <div class="step-ctrl">
          <button class="nav-btn" [disabled]="stepIdx() === 0" (click)="stepIdx.update(v => v - 1)">‹ 上一步</button>
          <span class="step-num">{{ stepIdx() + 1 }} / {{ steps().length }}</span>
          <button class="nav-btn" [disabled]="stepIdx() === steps().length - 1" (click)="stepIdx.update(v => v + 1)">下一步 ›</button>
        </div>
      </div>

      <div class="step-desc">{{ currentStep().desc }}</div>

      <div class="matrix-row">
        <div class="mat-block">
          <div class="mat-title">L</div>
          <table class="mat-table">
            @for (row of currentStep().L; track $index; let i = $index) {
              <tr>
                @for (v of row; track $index; let j = $index) {
                  <td class="cell"
                      [class.diag]="i === j"
                      [class.lower]="i > j && v !== 0"
                      [class.zero]="v === 0 && i !== j">
                    {{ fmtCell(v) }}
                  </td>
                }
              </tr>
            }
          </table>
        </div>

        <div class="times">×</div>

        <div class="mat-block">
          <div class="mat-title">U</div>
          <table class="mat-table">
            @for (row of currentStep().U; track $index; let i = $index) {
              <tr>
                @for (v of row; track $index; let j = $index) {
                  <td class="cell"
                      [class.upper]="i <= j && v !== 0"
                      [class.eliminated]="i > j && Math.abs(v) < 1e-10">
                    {{ fmtCell(v) }}
                  </td>
                }
              </tr>
            }
          </table>
        </div>
      </div>

      <div class="verify">
        @if (stepIdx() === steps().length - 1) {
          ✓ 完成！L × U = A
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意看 L 的下三角：每個數字就是消去時用的「倍數」。
        消去法不只是「把東西變成 0」，它同時在記錄<strong>怎麼變的</strong>。
      </p>
      <p>
        但有個問題：如果對角線上碰到 0 或很小的數，除以它會<strong>爆掉</strong>。
        下一節看怎麼用「樞軸選取」來避免。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.7; }

    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .step-ctrl { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .nav-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:disabled { opacity: 0.3; cursor: default; }
      &:hover:not(:disabled) { background: var(--accent-10); } }
    .step-num { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .step-desc { padding: 8px 12px; background: var(--bg-surface); border-radius: 6px;
      border: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);
      margin-bottom: 12px; }

    .matrix-row { display: flex; gap: 12px; align-items: center; justify-content: center;
      flex-wrap: wrap; }
    .times { font-size: 20px; color: var(--text-muted); font-weight: 300; }
    .mat-block { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg); }
    .mat-title { font-size: 12px; font-weight: 600; color: var(--text-muted);
      margin-bottom: 6px; text-align: center; }
    .mat-table { border-collapse: collapse; margin: 0 auto; }
    .cell { min-width: 48px; height: 32px; text-align: center; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      color: var(--text-muted); padding: 4px 6px; transition: background 0.2s;
      &.diag { background: rgba(110, 138, 168, 0.15); color: var(--text); font-weight: 700; }
      &.lower { background: rgba(200, 152, 59, 0.15); color: #c8983b; font-weight: 600; }
      &.upper { background: rgba(90, 138, 90, 0.1); color: #5a8a5a; font-weight: 600; }
      &.eliminated { color: var(--text-muted); opacity: 0.4; }
      &.zero { color: var(--text-muted); opacity: 0.3; } }

    .verify { text-align: center; margin-top: 10px; font-size: 13px; color: #5a8a5a;
      font-weight: 600; }
  `,
})
export class StepLuDecompositionComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly stepIdx = signal(0);

  readonly steps = computed(() => {
    const p = PRESETS[this.presetIdx()];
    return luDecompose(p.A, false).steps;
  });

  readonly currentStep = computed(() => this.steps()[this.stepIdx()]);

  loadPreset(i: number): void {
    this.presetIdx.set(i);
    this.stepIdx.set(0);
  }

  fmtCell(v: number): string {
    if (Math.abs(v) < 1e-10) return '0';
    if (Math.abs(v - Math.round(v)) < 1e-10) return String(Math.round(v));
    return v.toFixed(2);
  }
}
