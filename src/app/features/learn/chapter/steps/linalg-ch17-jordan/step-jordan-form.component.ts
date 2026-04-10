import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Preset {
  name: string;
  n: number;
  blocks: { lambda: number; size: number }[];
  desc: string;
}

const PRESETS: Preset[] = [
  { name: '可對角化', n: 3, blocks: [{ lambda: 2, size: 1 }, { lambda: 3, size: 1 }, { lambda: -1, size: 1 }],
    desc: '所有區塊都是 1×1 → 對角矩陣（第六章的情形）' },
  { name: '一個 2×2 塊', n: 3, blocks: [{ lambda: 2, size: 2 }, { lambda: 5, size: 1 }],
    desc: 'λ=2 的幾何重數 < 代數重數 → 需要一個 2×2 Jordan 區塊' },
  { name: '一個 3×3 塊', n: 3, blocks: [{ lambda: 1, size: 3 }],
    desc: '最「缺陷」的情形：整個矩陣是一個大 Jordan 區塊' },
  { name: '4×4 混合', n: 4, blocks: [{ lambda: 2, size: 2 }, { lambda: 2, size: 1 }, { lambda: 3, size: 1 }],
    desc: 'λ=2 出現兩個區塊（一個 2×2，一個 1×1），λ=3 一個 1×1' },
];

function buildJordanMatrix(blocks: { lambda: number; size: number }[]): number[][] {
  let n = 0;
  for (const b of blocks) n += b.size;
  const J: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let offset = 0;
  for (const b of blocks) {
    for (let i = 0; i < b.size; i++) {
      J[offset + i][offset + i] = b.lambda;
      if (i < b.size - 1) J[offset + i][offset + i + 1] = 1;
    }
    offset += b.size;
  }
  return J;
}

const BLOCK_COLORS = ['#c8983b', '#5a7faa', '#5a8a5a', '#a05a5a', '#8a6aaa'];

@Component({
  selector: 'app-step-jordan-form',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Jordan 標準形" subtitle="§17.6">
      <p>
        <strong>Jordan 標準形定理</strong>：任何方陣 A 都相似於一個<strong>區塊對角矩陣</strong> J，
        每個區塊都是一個 Jordan 區塊。
      </p>
      <p class="formula">A = P J P⁻¹</p>
      <p>
        而且 J 是<strong>唯一</strong>的（除了區塊的排列順序）。
        這是矩陣在相似變換下的「最簡形式」。
      </p>
      <ul>
        <li>所有區塊都是 1×1 → 可對角化（回到第六章）</li>
        <li>有 k×k (k≥2) 的區塊 → 缺陷矩陣</li>
        <li>最大區塊的大小 = 最小多項式裡該特徵值的冪次</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="選不同 Jordan 形，看區塊結構">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i" (click)="presetIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="jordan-viz">
        <div class="j-matrix-wrap">
          <div class="jm-title">J =</div>
          <table class="j-matrix">
            @for (row of jordanMatrix(); track $index; let i = $index) {
              <tr>
                @for (v of row; track $index; let j = $index) {
                  <td [style.background]="cellBg(i, j)" [class.border-cell]="isBorderCell(i, j)">
                    {{ fmtCell(v, i, j) }}
                  </td>
                }
              </tr>
            }
          </table>
        </div>

        <div class="block-list">
          <div class="bl-title">區塊分解</div>
          @for (b of currentBlocks(); track $index; let i = $index) {
            <div class="block-chip" [style.border-color]="blockColors[i]">
              <span class="bc-name" [style.color]="blockColors[i]">J{{ b.size }}({{ b.lambda }})</span>
              <span class="bc-desc">{{ b.size }}×{{ b.size }} 區塊，λ = {{ b.lambda }}</span>
            </div>
          }
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="ic-label">特徵值</div>
          <div class="ic-val">{{ eigenvalueList() }}</div>
        </div>
        <div class="info-card">
          <div class="ic-label">可對角化？</div>
          <div class="ic-val" [class.ok]="isDiag()" [class.bad]="!isDiag()">
            {{ isDiag() ? '是（所有區塊 1×1）' : '否（有 k≥2 的區塊）' }}
          </div>
        </div>
      </div>

      <div class="desc">{{ presets[presetIdx()].desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Jordan 標準形統一了所有情形：
      </p>
      <ul>
        <li><strong>對角矩陣</strong>是 Jordan 形的特例（所有區塊 1×1）</li>
        <li><strong>Schur 上三角</strong>是「至少做到上三角」；Jordan 做到「區塊對角 + 最少的 1」</li>
        <li>Jordan 形是<strong>唯一</strong>的，Schur 形不唯一</li>
      </ul>
      <p>
        下一節看 Jordan 形最重要的應用：ODE 重根和矩陣指數。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .preset-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .jordan-viz { display: grid; grid-template-columns: auto 1fr; gap: 16px;
      margin-bottom: 12px; align-items: start; }
    @media (max-width: 600px) { .jordan-viz { grid-template-columns: 1fr; } }

    .j-matrix-wrap { display: flex; align-items: center; gap: 8px; }
    .jm-title { font-size: 16px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .j-matrix { border-collapse: collapse; }
    .j-matrix td { min-width: 38px; height: 32px; text-align: center; font-size: 13px;
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
      color: var(--text); padding: 4px 6px; }
    .j-matrix td.border-cell { border: 1px solid var(--border); }

    .block-list { display: flex; flex-direction: column; gap: 8px; }
    .bl-title { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .block-chip { padding: 8px 12px; border: 2px solid; border-radius: 8px;
      background: var(--bg-surface); }
    .bc-name { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .bc-desc { font-size: 11px; color: var(--text-muted); margin-left: 8px; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .info-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); }
    .ic-label { font-size: 11px; color: var(--text-muted); font-weight: 600; }
    .ic-val { font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      margin-top: 2px;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }

    .desc { padding: 10px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepJordanFormComponent {
  readonly presets = PRESETS;
  readonly presetIdx = signal(0);
  readonly blockColors = BLOCK_COLORS;

  readonly currentBlocks = computed(() => PRESETS[this.presetIdx()].blocks);
  readonly jordanMatrix = computed(() => buildJordanMatrix(this.currentBlocks()));

  readonly isDiag = computed(() => this.currentBlocks().every((b) => b.size === 1));

  readonly eigenvalueList = computed(() => {
    const seen = new Map<number, number>();
    for (const b of this.currentBlocks()) {
      seen.set(b.lambda, (seen.get(b.lambda) ?? 0) + b.size);
    }
    return Array.from(seen.entries()).map(([lam, mult]) =>
      mult > 1 ? `${lam} (×${mult})` : String(lam)
    ).join(', ');
  });

  // Determine which block a cell belongs to (for coloring)
  private blockOf(i: number): number {
    let offset = 0;
    for (let b = 0; b < this.currentBlocks().length; b++) {
      if (i < offset + this.currentBlocks()[b].size) return b;
      offset += this.currentBlocks()[b].size;
    }
    return -1;
  }

  cellBg(i: number, j: number): string {
    const bi = this.blockOf(i);
    const bj = this.blockOf(j);
    if (bi !== bj) return 'transparent';
    const color = BLOCK_COLORS[bi % BLOCK_COLORS.length];
    return color + '18';
  }

  isBorderCell(i: number, j: number): boolean {
    return this.blockOf(i) === this.blockOf(j);
  }

  fmtCell(v: number, i: number, j: number): string {
    if (this.blockOf(i) !== this.blockOf(j)) return '';
    if (Math.abs(v) < 1e-8) return '0';
    if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
    return v.toFixed(1);
  }
}
