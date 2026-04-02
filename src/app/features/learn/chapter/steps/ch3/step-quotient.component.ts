import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

const COLORS = [
  'var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)',
  'var(--v4)', 'var(--v5)', 'var(--v6)', 'var(--v7)',
];

interface CosetEl { idx: number; elements: GroupElement[]; shortLabel: string; fullLabel: string; }

@Component({
  selector: 'app-step-quotient',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="商群：壓縮後的群" subtitle="\u00A73.3">
      <p>
        上一節我們知道，正規子群的陪集乘法是良定義的。
        那麼，<strong>陪集本身能不能構成一個群？</strong>
      </p>
      <p>
        答案是：可以！這個新群叫做<strong>商群</strong>（quotient group），
        記作 G/H。它的「元素」就是 H 的陪集，「乘法」就是陪集乘法。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看看 D\u2083 的 6 個元素怎樣「塌縮」成商群的 2 個元素">
      <!-- Collapse visualization -->
      <div class="collapse-viz">
        <div class="collapse-from">
          <div class="viz-title">D\u2083（6 個元素）</div>
          <div class="element-row">
            @for (el of d3.elements; track el.id) {
              <div class="el-chip" [style.background]="elementColor(el.id)">
                {{ el.label }}
              </div>
            }
          </div>
        </div>
        <div class="collapse-arrow">\u2193 除以 H = {{ '{' }}e, r, r\u00B2{{ '}' }}</div>
        <div class="collapse-to">
          <div class="viz-title">D\u2083/H（{{ cosets().length }} 個元素）</div>
          <div class="coset-row">
            @for (c of cosets(); track c.idx) {
              <div class="coset-block" [style.border-color]="COLORS[c.idx]">
                <div class="coset-name" [style.background]="COLORS[c.idx]">{{ c.shortLabel }}</div>
                <div class="coset-contents">{{ c.fullLabel }}</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quotient Cayley table -->
      <div class="section-label">商群的乘法表：</div>
      <div class="table-wrap">
        <table class="cayley">
          <thead>
            <tr>
              <th class="op">\u2218</th>
              @for (c of cosets(); track c.idx) {
                <th [style.background]="COLORS[c.idx]" class="ch">{{ c.shortLabel }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of cosets(); track row.idx) {
              <tr>
                <th [style.background]="COLORS[row.idx]" class="ch">{{ row.shortLabel }}</th>
                @for (col of cosets(); track col.idx) {
                  <td [style.background]="COLORS[quotientProduct(row.idx, col.idx)]" class="qcell">
                    {{ cosets()[quotientProduct(row.idx, col.idx)].shortLabel }}
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="recognition">
        這個 {{ cosets().length }}\u00D7{{ cosets().length }} 的乘法表，
        看起來跟 <strong>Z\u2082</strong> 的乘法表一模一樣！
        <br/>
        所以 D\u2083 / {{ '{' }}e, r, r\u00B2{{ '}' }} \u2245 Z\u2082。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        商群的直覺：把「細節」模糊掉，只保留「大方向」。
      </p>
      <div class="analogy">
        <div class="an-row">
          <span class="an-label">原群 D\u2083</span>
          <span class="an-desc">6 個操作，有旋轉有翻轉，很複雜</span>
        </div>
        <div class="an-row">
          <span class="an-label">商群 D\u2083/H</span>
          <span class="an-desc">只問「是旋轉還是翻轉？」— 2 個答案，簡單</span>
        </div>
        <div class="an-row">
          <span class="an-label">類比</span>
          <span class="an-desc">就像問一個人「你是學生還是老師？」而不問「你叫什麼名字」</span>
        </div>
      </div>
      <span class="hint">
        商群把群「壓縮」了。但壓縮過程中丟了什麼資訊？又保留了什麼？
        下一節我們用「同態」這個概念來精確回答這個問題。
      </span>
    </app-prose-block>
  `,
  styles: `
    .collapse-viz {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      margin-bottom: 18px; padding: 16px; background: var(--bg); border-radius: 12px;
      border: 1px solid var(--border);
    }
    .viz-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-align: center; }
    .element-row { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
    .el-chip {
      padding: 4px 10px; border-radius: 5px; font-size: 14px; font-weight: 600;
      color: white; font-family: 'JetBrains Mono', monospace;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .collapse-arrow { font-size: 18px; color: var(--text-muted); font-weight: 600; }
    .coset-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    .coset-block {
      border: 2px solid; border-radius: 8px; overflow: hidden; min-width: 100px; text-align: center;
    }
    .coset-name {
      padding: 4px 12px; color: white; font-size: 13px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .coset-contents { padding: 6px 10px; font-size: 12px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .section-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }

    .table-wrap { overflow-x: auto; margin-bottom: 14px; }
    .cayley { border-collapse: collapse; }
    th, td { padding: 8px 16px; text-align: center; border: 1px solid var(--border); }
    .op { background: var(--accent-18) !important; color: var(--text); font-size: 16px; }
    .ch { color: white !important; font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    .qcell { color: white; font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }

    .recognition {
      padding: 12px 16px; border-radius: 8px; background: rgba(90,138,90,0.08);
      color: var(--text-secondary); font-size: 14px; line-height: 1.6;
      border: 1px solid rgba(90,138,90,0.2);
      strong { color: var(--text); }
    }

    .analogy {
      display: flex; flex-direction: column; gap: 6px; margin: 12px 0;
      border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
    }
    .an-row { display: grid; grid-template-columns: 120px 1fr; border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; } }
    .an-label { padding: 8px 12px; font-size: 13px; font-weight: 600; color: var(--text); background: var(--accent-10); }
    .an-desc { padding: 8px 12px; font-size: 13px; color: var(--text-secondary); }
  `,
})
export class StepQuotientComponent {
  readonly d3 = createDihedralGroup(3);
  readonly COLORS = COLORS;

  // Normal subgroup H = {e, r, r²}
  private readonly hIds = new Set(['r0', 'r1', 'r2']);

  readonly cosets = computed(() => {
    const hEls = this.d3.elements.filter((e) => this.hIds.has(e.id));
    const assigned = new Set<string>();
    const result: CosetEl[] = [];
    for (const g of this.d3.elements) {
      if (assigned.has(g.id)) continue;
      const coset = hEls.map((h) => this.d3.multiply(g, h));
      coset.forEach((e) => assigned.add(e.id));
      const isH = coset.some((e) => e.id === 'r0');
      result.push({
        idx: result.length,
        elements: coset,
        shortLabel: isH ? 'H' : g.label + 'H',
        fullLabel: coset.map((e) => e.label).join(', '),
      });
    }
    return result;
  });

  private cosetIdxOf(elId: string): number {
    for (const c of this.cosets()) {
      if (c.elements.some((e) => e.id === elId)) return c.idx;
    }
    return 0;
  }

  elementColor(id: string): string {
    return COLORS[this.cosetIdxOf(id)];
  }

  quotientProduct(i: number, j: number): number {
    const a = this.cosets()[i].elements[0];
    const b = this.cosets()[j].elements[0];
    return this.cosetIdxOf(this.d3.multiply(a, b).id);
  }
}
