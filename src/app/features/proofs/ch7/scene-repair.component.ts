import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { BoardState, DIV_SUM_FIXED } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { fmtExpr } from '../board/poly';

@Component({
  selector: 'app-pf-repair',
  standalone: true,
  imports: [ProofBoardComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', './ch7.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">4 / 5 · 補上</p>
        <h1 class="pf-title">補上缺的那一塊</h1>
        <p class="pf-lede">
          上一幕的橋卡在「c 是不是 a 的倍數」。把它加進前提，句子就換了一個。這次從空板開始，兩端和中段都由你來。
        </p>

        <div class="c7-claim">
          <small>修好的句子</small>
          <p>對每個整數 a、b、c，若 a ∣ b + c <b class="c7-added">而且 a ∣ c</b>，則 a ∣ b。</p>
        </div>

        <app-pf-board
          [start]="start"
          bridge="manual"
          [frozen]="!!result()"
          label="定理：若 a ∣ b + c 而且 a ∣ c，則 a ∣ b"
          idBase="pf-c7-repair"
          (solved)="onSolved($event)"
          (refused)="onRefused($event.code)"
        />

        @if (wrong() > 0 && !result()) {
          <p class="pf-feedback you pf-rise" role="note">
            提示：b 有一條等式可以移項換掉，換完會出現 c。這次 c 也有自己的等式，再換一次，兩項就都帶著 a 了。
          </p>
        }

        @if (result(); as r) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              證人是 <b class="pf-num">m = {{ r.wit }}</b>。上一幕卡住的 c 那一項，這次有了自己的等式，換掉之後兩項都是 a 的倍數，提出 a 就碰頭了。
            </p>
            <table class="pf-table c7-compare">
              <caption class="pf-sr-only">上一幕與這一幕的比較</caption>
              <tr><th></th><th>3. 橋接不上</th><th>4. 補上之後</th></tr>
              <tr><td>前提</td><td>a ∣ b + c</td><td>a ∣ b + c，而且 a ∣ c</td></tr>
              <tr><td>c 這一項</td><td>沒有等式可換，卡住</td><td>換成 a 乘上拿到的字母</td></tr>
              <tr><td>結果</td><td><span class="pf-seal mini refuted">推翻</span> 反例</td><td><span class="pf-seal mini proved">證明</span> {{ r.steps }} 步</td></tr>
            </table>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>反例告訴你缺什麼，<br />證明告訴你補上就夠。</p>
            </div>
            <p class="pf-note">
              第 2 幕證過的「整除會傳遞」，到了<a routerLink="/learn/proofs/ch7/5">最後一幕</a>會變成一張卡。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneRepairComponent {
  private readonly progress = inject(LearnProgressService);

  readonly start = DIV_SUM_FIXED;
  readonly wrong = signal(0);
  readonly final = signal<BoardState | null>(null);

  readonly result = computed(() => {
    const st = this.final();
    if (!st) return null;
    const chosen = st.objs.find((o) => o.kind === 'chosen');
    return { wit: chosen?.def ? fmtExpr(chosen.def) : '', steps: st.log.length };
  });

  onSolved(st: BoardState): void {
    this.final.set(st);
    this.progress.markCompleted('proofs-ch7', '4');
  }

  onRefused(code: string): void {
    if (code === 'neq') this.wrong.update((n) => n + 1);
  }
}
