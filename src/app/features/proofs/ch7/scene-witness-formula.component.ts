import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { Q, evalExpr, q } from '../ch2/ch2-expr';
import { BoardState, DIV_TRANS, DIV_TRANS_OPENING } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { exprVars, fmtExpr } from '../board/poly';

/** The opponent's moves: three (a, b, c) with a ∣ b and b ∣ c. */
const PLAYS: [number, number, number][] = [
  [3, 12, 60],
  [-2, 6, 42],
  [7, 7, 0],
];

const fmtQ = (v: Q | null): string => (!v ? '—' : v.d === 1 ? String(v.n).replace('-', '−') : `${v.n}/${v.d}`);

@Component({
  selector: 'app-pf-witness-formula',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', './ch7.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">2 / 5 · 證人</p>
        <h1 class="pf-title">證人是一個公式</h1>
        <p class="pf-lede">
          兩端板子已經替你寫好了，和上一幕走到的地方一樣。這一次「代入化簡」之前，先在橋上自己代入：從 c 出發，一次換掉一個字母，看 c 最後長成 a × 什麼。
        </p>

        <app-pf-board
          [start]="start"
          [prefix]="opening"
          bridge="manual"
          [frozen]="!!result()"
          label="定理：整除會傳遞"
          idBase="pf-c7-formula"
          (solved)="onSolved($event)"
          (refused)="onRefused($event.code)"
        />

        @if (wrongTries() > 0 && !result()) {
          <p class="pf-feedback you pf-rise" role="note">
            提示：上一幕的 20 只是 3、12、60 那一組的答案，對手可以出別的 a、b、c。橋上往前那一列換到最後，c 寫成了 a 乘上什麼？那個「什麼」就是證人。
          </p>
        }

        @if (result(); as r) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              你的證人是 <b class="pf-num">m = {{ r.wit }}</b>。它沒有寫成一個數，而是寫成拿到的字母。對手每換一組 a、b、c，拿到的 {{ r.k }}、{{ r.l }} 就跟著換，m 也跟著換：
            </p>
            <table class="pf-table c7-dep">
              <caption class="pf-sr-only">對手出的 a、b、c，拿到的字母，以及證人 m</caption>
              <tr>
                <th>對手出 a、b、c</th>
                <th>拿到 {{ r.k }}（b = a{{ r.k }}）</th>
                <th>拿到 {{ r.l }}（c = b{{ r.l }}）</th>
                <th>證人 m = {{ r.wit }}</th>
                <th>a × m</th>
              </tr>
              @for (row of r.rows; track $index) {
                <tr>
                  <td class="pf-num">{{ row.abc }}</td>
                  <td class="pf-num">{{ row.k }}</td>
                  <td class="pf-num">{{ row.l }}</td>
                  <td class="pf-num"><b>{{ row.m }}</b></td>
                  <td class="pf-num">{{ row.am }} {{ row.ok ? '＝ c ✓' : '≠ c' }}</td>
                </tr>
              }
            </table>
            <p class="pf-note">最後一列 c = 0：拿到的 {{ r.l }} 是 0，證人跟著變成 0，0 = 7 × 0 一樣成立。固定寫 20 的話，這一列就錯了。</p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>證人是一個公式：它用拿到的字母寫成，<br />對手換了 a、b、c，它就跟著換。</p>
            </div>
            <p class="pf-note">
              這座橋每一步都接得上，所以證得出來。<a routerLink="/learn/proofs/ch7/3">下一幕</a>換一個看起來很像的句子，橋卻搭不過去。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneWitnessFormulaComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = DIV_TRANS;
  readonly opening = DIV_TRANS_OPENING;
  readonly wrongTries = signal(0);
  readonly final = signal<BoardState | null>(null);

  readonly result = computed(() => {
    const st = this.final();
    if (!st) return null;
    const chosen = st.objs.find((o) => o.kind === 'chosen');
    if (!chosen?.def) return null;
    // Which taken letter is the quotient b / a, and which is c / b.
    const letterFor = (lhs: string): string => {
      for (const h of st.hyps) {
        if (h.s.t !== 'eq' || h.s.l.t !== 'var' || h.s.l.name !== lhs) continue;
        const v = exprVars(h.s.r).find((x) => st.objs.some((o) => o.kind === 'got' && o.name === x));
        if (v) return v;
      }
      return lhs === 'b' ? 'k' : 'l';
    };
    const k = letterFor('b');
    const l = letterFor('c');
    const rows = PLAYS.map(([a, b, c]) => {
      const kv = q(b, a);
      const lv = q(c, b);
      const m = evalExpr(chosen.def!, { [k]: kv, [l]: lv, a: q(a), b: q(b), c: q(c) });
      const am = m ? q(a * m.n, m.d) : null;
      return {
        abc: [a, b, c].map((x) => fmtQ(q(x))).join('、'),
        k: fmtQ(kv),
        l: fmtQ(lv),
        m: fmtQ(m),
        am: fmtQ(am),
        ok: !!am && am.d === 1 && am.n === c,
      };
    });
    return { wit: fmtExpr(chosen.def), k, l, rows };
  });

  onSolved(st: BoardState): void {
    this.final.set(st);
    this.progress.markCompleted('proofs-ch7', '2');
  }

  onRefused(code: string): void {
    if (code === 'neq') this.wrongTries.update((n) => n + 1);
  }
}
