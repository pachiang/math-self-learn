import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { EVEN_SQ, EVEN_SQ_DIRECT } from '../board/board-model';
import { ProofBoardComponent } from '../board/proof-board.component';
import { SkeletonReviewComponent } from '../board/skeleton-review.component';
import { CH7_SKELETON } from '../board/skeletons';

const NS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const xTop = (n: number) => 60 + n * 102;
const xBot = (v: number) => 60 + v * 12.75;

@Component({
  selector: 'app-pf-stuck',
  standalone: true,
  imports: [ProofBoardComponent, SkeletonReviewComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', './ch8.scss', './ch8-direction.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">1 / 6 · 方向</p>
        <h1 class="pf-title">直接證，<br />卡在哪裡？</h1>
        <p class="pf-lede">
          上一章的橋都是從已知走到目標。這一章會遇到兩種走不過去的情況，以及兩張把句子翻過來的新卡。開始之前，先從記憶裡把上一章的骨架拿出來。
        </p>

        <app-pf-skeleton-review [card]="skeleton" [saveAt]="['proofs-ch8', '1']" (finished)="reviewed.set(true)" />

        @if (reviewed()) {
          <div class="c6-block pf-rise">
            <div class="c7-claim">
              <small>要證的句子</small>
              <p>對每個整數 n，若 n² 是偶數，則 n 是偶數。</p>
            </div>
            <p class="pf-p">
              先看幾個例子：4 = 2²、16 = 4²、36 = 6²，n² 是偶數時 n 都是偶數<span class="c8-tag">例子</span>。例子只是線索。照上一章的做法，在板上直接證：開頭已經照形狀走好了，剩下中段。
            </p>
            <app-pf-board
              [start]="start"
              [prefix]="opening"
              bridge="manual"
              [frozen]="stuck()"
              label="定理：若 n² 是偶數，則 n 是偶數（直接證）"
              idBase="pf-c8-stuck"
              (refused)="onRefused($event.code)"
            />
            @if (!stuck()) {
              <button type="button" class="pf-btn small c7-giveup" (click)="stuck.set(true)">我填不出 □</button>
            }
          </div>
        }

        @if (stuck()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              橋要從 <b class="pf-num">n</b> 出發往前代入，可是已知裡沒有任何一條寫著「n = …」。唯一的等式是 <b class="pf-num">n² = 2k</b>：它講的是 n²，不是 n。
            </p>
            <p class="pf-p">把 n 和 n² 畫在一起，看箭頭往哪邊走得通。上排是 n，下排是 n²。拖動滑桿，挑一個偶數當 n² = 2k，看能不能往上找到 n：</p>

            <figure class="c8-dir">
              <svg viewBox="0 0 940 250" role="img" [attr.aria-label]="dirLabel()">
                <text class="row-label" x="0" y="54">n</text>
                <text class="row-label" x="0" y="206">n²</text>
                @for (n of ns; track n) {
                  <path class="fwd" [attr.d]="fwdPath(n)" />
                  <polygon class="fwd-head" [attr.points]="headAt(n)" />
                }
                @for (n of ns; track n) {
                  <circle class="n-dot" [class.odd]="n % 2 === 1" [attr.cx]="xTop(n)" cy="50" r="17" />
                  <text class="n-txt" [attr.x]="xTop(n)" y="50">{{ n }}</text>
                }
                <line class="axis" x1="50" y1="200" x2="886" y2="200" />
                @for (v of ticks; track v) {
                  <line class="tick" [class.even]="v % 2 === 0" [attr.x1]="xBot(v)" [attr.x2]="xBot(v)" y1="200" [attr.y2]="v % 2 === 0 ? 192 : 196" />
                }
                @for (n of ns; track n) {
                  <text class="sq-txt" [attr.x]="xBot(n * n)" y="222">{{ n * n }}</text>
                }
                <circle class="pick-ring" [attr.cx]="xBot(v())" cy="200" r="8" />
                <circle class="pick" [attr.cx]="xBot(v())" cy="200" r="4" />
                @if (root(); as r) {
                  <path class="back ok" [attr.d]="backPath(r)" />
                  <circle class="pick-ring" [attr.cx]="xTop(r)" cy="50" r="22" />
                  <text class="hit" [attr.x]="(xTop(r) + xBot(v())) / 2 + 40" y="128">n = {{ r }}</text>
                } @else {
                  <path class="back" [attr.d]="'M ' + xBot(v()) + ' 190 L ' + xBot(v()) + ' 112'" />
                  <text class="miss" [attr.x]="xBot(v())" y="100">√{{ v() }} 不是整數</text>
                }
                <text class="sq-txt" [attr.x]="xBot(v())" y="244" style="fill: var(--pf-amber); font-weight: 800">2k = {{ v() }}</text>
              </svg>
              <div class="c8-dir-ctl">
                <label for="pf-c8-k">k =</label>
                <input id="pf-c8-k" type="range" min="1" max="32" [value]="k()" (input)="setK($any($event.target).value)" />
                <span class="pf-num">{{ k() }}</span>
                <span class="pf-num">n² = 2k = {{ v() }}</span>
              </div>
              <div class="c8-legend" aria-hidden="true">
                <span><i></i>往下：n 算出 n²，每個 n 都有箭頭</span>
                <span><i class="back"></i>往上：從 2k 找 n，要開根號</span>
              </div>
              <p class="pf-feedback" [class.you]="!!root()" role="status">{{ dirText() }}</p>
            </figure>

            @if (seen().size >= 5) {
              <div class="c6-block pf-rise">
                <p class="pf-p">
                  往下的箭頭每個 n 都有，而且是一條公式：n 乘 n。往上的箭頭大多數斷在半路：√(2k) 寫不成 k 的整數式子，所以橋上的 □ 永遠填不出來。
                </p>
                <p class="pf-p">
                  這和第 7 章的「橋接不上」不一樣。7.3 是句子本身錯了，缺口就是反例。這裡句子沒錯，往上找得到 n 的那幾格，n 都是偶數；卡住是因為已知講的是 n²，目標問的是 n，資訊的方向反了。
                </p>
                <div class="pf-takeaway reveal">
                  <small>帶走這一句</small>
                  <p>橋接不上有兩種原因：句子錯了，或資訊的方向反了。<br />已知講的是 n²、目標問的是 n，從已知往前推只會愈走愈遠。</p>
                </div>
                <p class="pf-note">
                  如果已知講的是 n 呢？那就是往下的箭頭，一條公式就到了。<a routerLink="/learn/proofs/ch8/2">下一幕</a>把整句話翻過來，讓已知變成關於 n 的句子。
                </p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneStuckComponent {
  private readonly progress = inject(LearnProgressService);

  readonly skeleton = CH7_SKELETON;
  readonly start = EVEN_SQ;
  readonly opening = EVEN_SQ_DIRECT;
  readonly ns = NS;
  readonly ticks = Array.from({ length: 65 }, (_, i) => i);
  readonly xTop = xTop;
  readonly xBot = xBot;

  readonly reviewed = signal(!!this.progress.getStepData('proofs-ch8', '1', 'skeleton'));
  readonly stuck = signal(false);
  readonly k = signal(3);
  readonly seen = signal(new Set<number>([3]));
  readonly v = computed(() => 2 * this.k());
  readonly root = computed(() => {
    const r = Math.round(Math.sqrt(this.v()));
    return r * r === this.v() ? r : null;
  });

  readonly dirText = computed(() => {
    const r = this.root();
    const v = this.v();
    if (r !== null) return `2k = ${v} 剛好是 ${r}²，往上找到 n = ${r}，是偶數。可是 ${r} 是對著平方表查到的，不是一條用 k 寫成的公式；換一個 k，多半就查不到了。`;
    return `2k = ${v}：要找 n，得算 √${v}，它不是整數。沒有整數 n 的平方是 ${v}，往上的箭頭斷在半路。`;
  });
  readonly dirLabel = computed(() => `n 從 0 到 8 往下連到 n²；目前選的 2k = ${this.v()}。${this.dirText()}`);

  setK(raw: string): void {
    const k = Math.max(1, Math.min(32, Number(raw) || 1));
    this.k.set(k);
    this.seen.update((s) => new Set(s).add(k));
    if (this.seen().size >= 5) this.progress.markCompleted('proofs-ch8', '1');
  }

  onRefused(code: string): void {
    if (code === 'neq' || code === 'div') this.stuck.set(true);
  }

  fwdPath(n: number): string {
    const x1 = xTop(n);
    const x2 = xBot(n * n);
    return `M ${x1} 68 C ${x1} 130, ${x2} 130, ${x2} 188`;
  }
  headAt(n: number): string {
    const x = xBot(n * n);
    return `${x - 4},${182} ${x + 4},${182} ${x},${191}`;
  }
  backPath(r: number): string {
    const x1 = xBot(this.v());
    const x2 = xTop(r);
    return `M ${x1} 190 C ${x1} 130, ${x2} 130, ${x2} 74`;
  }
}
