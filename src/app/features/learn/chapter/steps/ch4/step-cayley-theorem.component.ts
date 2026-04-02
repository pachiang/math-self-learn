import { Component, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

@Component({
  selector: 'app-step-cayley-theorem',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="凱萊定理：所有群都是置換群" subtitle="\u00A74.6">
      <p>
        到目前為止，我們研究了「置換群」S\u2099 — 由所有排列組成的群。
        凱萊（Cayley）證明了一個深刻的事實：
      </p>
      <p style="text-align:center; font-size:16px; font-weight:700; color:var(--text); padding:12px; background:var(--accent-10); border-radius:8px;">
        每一個群都同構於某個 S\u2099 的子群
      </p>
      <p>
        換句話說：<strong>所有的群本質上都是置換群</strong>。不管群多抽象，
        它都可以被「翻譯」成對某個集合的排列操作。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看看 D\u2083 的每個元素怎樣變成 S\u2086 中的一個置換">
      <div class="idea-box">
        <div class="idea-title">想法</div>
        <p>
          D\u2083 有 6 個元素。每個元素 g 作用在 D\u2083 上（左乘），
          就會<strong>重新排列</strong>這 6 個元素。
          這個「重新排列」就是一個 S\u2086 中的置換！
        </p>
      </div>

      <!-- Left multiplication table -->
      <div class="section-label">左乘表：g \u00D7 (每個元素)</div>
      <div class="table-wrap">
        <table class="lr-table">
          <thead>
            <tr>
              <th>g \u00D7</th>
              @for (el of d3.elements; track el.id) {
                <th>{{ el.label }}</th>
              }
              <th>= S\u2086 中的置換</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.g.id) {
              <tr>
                <td class="g-cell">{{ row.g.label }}</td>
                @for (prod of row.products; track prod.id) {
                  <td class="prod-cell">{{ prod.label }}</td>
                }
                <td class="perm-cell">{{ row.permStr }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="result-box">
        每一行都是 6 個元素的一種排列 — 也就是 S\u2086 的一個元素。
        <br/><strong>6 行 \u2192 S\u2086 的 6 個不同元素 \u2192 構成 S\u2086 的一個子群 \u2245 D\u2083</strong>
      </div>
    </app-challenge-card>

    <app-prose-block title="凱萊定理">
      <div class="theorem-box">
        <div class="thm-text">
          任何群 G 都同構於 S\u005F|G| 的一個子群
        </div>
      </div>
      <p>
        證明的核心就是上面展示的「左乘技巧」：
        把群的每個元素看成「對群自身的一次重排」，
        這就建立了 G \u2192 S\u005F|G| 的單射同態。
      </p>
      <p>
        這意味著「群」這個概念比看起來的更具體：
        <strong>研究群，就是在研究對稱性和排列</strong>。
        你在第一章直覺感受到的「對稱 = 群」，現在有了嚴格的數學保證。
      </p>
      <span class="hint">
        凱萊定理為第四章畫上句號。下一章我們會探索群作用 —
        群不只能作用在「自己」上，還能作用在<strong>任何集合</strong>上，
        由此產生軌道、穩定子、和驚人的計數公式。
      </span>
    </app-prose-block>
  `,
  styles: `
    .idea-box {
      padding: 14px 18px; background: var(--accent-10); border-radius: 10px;
      border-left: 3px solid var(--accent); margin-bottom: 16px;
    }
    .idea-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    .idea-box p { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .idea-box strong { color: var(--text); }

    .section-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }

    .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; }
    th { padding: 6px 10px; background: var(--accent-10); color: var(--text-secondary);
      font-size: 12px; font-weight: 600; text-align: center; border-bottom: 1px solid var(--border); }
    td { padding: 6px 10px; text-align: center; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-secondary); }
    tr:last-child td { border-bottom: none; }
    .g-cell { font-weight: 700; color: var(--text); font-size: 15px; background: var(--accent-10); }
    .prod-cell { color: var(--text); }
    .perm-cell { font-size: 11px; color: var(--accent); font-weight: 600; }

    .result-box {
      padding: 12px 16px; border-radius: 8px; background: rgba(90,138,90,0.08);
      border: 1px solid rgba(90,138,90,0.2); font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); }
    }

    .theorem-box {
      padding: 16px; border: 2px solid var(--accent); border-radius: 12px;
      background: var(--accent-10); text-align: center; margin: 14px 0;
    }
    .thm-text {
      font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text);
    }
  `,
})
export class StepCayleyTheoremComponent {
  readonly d3 = createDihedralGroup(3);

  readonly rows = computed(() => {
    const elIndexMap = new Map(this.d3.elements.map((e, i) => [e.id, i]));
    return this.d3.elements.map((g) => {
      const products = this.d3.elements.map((x) => this.d3.multiply(g, x));
      const permArr = products.map((p) => elIndexMap.get(p.id)!);
      const permStr = '(' + permArr.map((v) => v + 1).join(' ') + ')';
      return { g, products, permStr };
    });
  });
}
