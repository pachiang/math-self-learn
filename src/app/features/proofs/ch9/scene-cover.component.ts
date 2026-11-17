import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { SkeletonReviewComponent } from '../board/skeleton-review.component';
import { CH8_SKELETON } from '../board/skeletons';
import { CaseLineComponent, CaseRow } from './case-line.component';

interface Cond {
  id: string;
  text: string;
  test: (n: number) => boolean;
}

const CONDS: Cond[] = [
  { id: 'pos', text: 'x > 0', test: (n) => n > 0 },
  { id: 'neg', text: 'x < 0', test: (n) => n < 0 },
  { id: 'zero', text: 'x = 0', test: (n) => n === 0 },
  { id: 'ge0', text: 'x ≥ 0', test: (n) => n >= 0 },
  { id: 'le0', text: 'x ≤ 0', test: (n) => n <= 0 },
  { id: 'ge2', text: 'x ≥ 2', test: (n) => n >= 2 },
  { id: 'even', text: 'x 是偶數', test: (n) => n % 2 === 0 },
  { id: 'odd', text: 'x 是奇數', test: (n) => n % 2 !== 0 },
];

const LO = -10;
const HI = 10;
const NS = Array.from({ length: HI - LO + 1 }, (_, i) => LO + i);
const fmt = (n: number): string => String(n).replace('-', '−');

@Component({
  selector: 'app-pf-cover',
  standalone: true,
  imports: [SkeletonReviewComponent, CaseLineComponent, RouterLink],
  styleUrls: ['../ch6/ch6.scss', '../ch7/ch7.scss', '../ch8/ch8.scss', './ch9-cover.scss'],
  template: `
    <section class="pf-scene solo wide">
      <div class="pf-col">
        <p class="pf-kicker">1 / 5 · 蓋滿</p>
        <h1 class="pf-title">每一段都對，<br />結論卻是錯的</h1>
        <p class="pf-lede">
          這一章的證明會把整數分成幾種情況，一種一種處理。開始之前，先從記憶裡把上一章的骨架拿出來。
        </p>

        <app-pf-skeleton-review [card]="skeleton" [saveAt]="['proofs-ch9', '1']" (finished)="reviewed.set(true)" />

        @if (reviewed()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">一位同學交來這段證明：</p>
            <div class="c7-claim">
              <small>要證的句子</small>
              <p>對每個整數 x，x² &gt; 0。</p>
            </div>
            <ol class="c6-proof">
              <li><span class="c6-ln">1</span><span>令 x 為任意整數。分兩種情況來看。</span></li>
              <li><span class="c6-ln">2</span><span>情況一：x &gt; 0。兩個正數相乘還是正數，所以 x² = x · x &gt; 0。</span></li>
              <li><span class="c6-ln">3</span><span>情況二：x &lt; 0。這時 −x &gt; 0，所以 x² = (−x) · (−x) &gt; 0。</span></li>
              <li><span class="c6-ln">4</span><span>兩種情況都得到 x² &gt; 0，所以對每個整數 x，x² &gt; 0。</span></li>
            </ol>
            <p class="pf-q">這段證明成立嗎？</p>
            <div class="c7-predict" role="group" aria-label="這段證明成立嗎">
              <button type="button" class="pf-btn" [class.picked]="verdict() === 'yes'" (click)="verdict.set('yes')">成立</button>
              <button type="button" class="pf-btn" [class.picked]="verdict() === 'no'" (click)="verdict.set('no')">不成立</button>
            </div>
          </div>
        }

        @if (verdict()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">
              {{ verdict() === 'yes' ? '你覺得成立。' : '你覺得不成立。' }}拿幾個整數檢查結論：打一個 x，看 x² &gt; 0 對不對。
            </p>
            <form class="pf-row" (submit)="$event.preventDefault(); tryX()">
              <label class="pf-q small" for="pf-c9-x">x =</label>
              <input id="pf-c9-x" class="pf-input" autocomplete="off" spellcheck="false" [value]="xDraft()" (input)="xDraft.set($any($event.target).value)" />
              <button type="submit" class="pf-btn primary small">檢查</button>
            </form>
            @if (tries().length) {
              <ul class="c9-tries" aria-label="試過的 x">
                @for (t of tries(); track t) {
                  <li [class.bad]="t === 0"><span class="pf-num">x = {{ fmt(t) }}</span>{{ t === 0 ? '0² = 0，不大於 0' : sq(t) + ' = ' + t * t + ' > 0' }}</li>
                }
              </ul>
            }
            @if (xMsg(); as m) {
              <p class="pf-feedback" [class.bad]="!found()" role="status">{{ m }}</p>
            }
            @if (found()) {
              <p class="pf-feedback c7-verdict bad pf-rise" role="status">
                <span>x = 0 時 x² = 0，不大於 0。一個整數就推翻了「對每個整數 x，x² &gt; 0」，所以這段證明不可能成立{{ verdict() === 'yes' ? '，雖然你本來覺得它成立' : '' }}。</span>
                <span class="pf-seal mini refuted stamp">推翻</span>
              </p>
            }
          </div>
        }

        @if (found()) {
          <div class="c6-block pf-rise">
            <p class="pf-p">奇怪的是，第 2、3 行都沒有錯。把兩種情況畫在數線上，就看得出問題在哪裡：</p>
            <app-pf-case-line [rows]="studentRows" [lo]="lo" [hi]="hi" [mark]="0" />
            <p class="pf-p">
              情況一管 0 右邊的數，情況二管 0 左邊的數，0 夾在中間，誰都沒管。兩段論證各自都對，只是對 0 什麼也沒說；第 4 行卻說「對每個整數」。分情況的證明，只證到情況蓋到的數。
            </p>
          </div>

          <div class="c6-block pf-rise">
            <p class="pf-p">
              換一句真的話：<b>對每個整數 x，x² ≥ 0</b>。這次由你來切。點選下面的條件，每選一個就多一種情況，目標是蓋滿整條數線。每一種情況裡的論證都不難（例如 x = 0 時 x² = 0），這裡只看切法。
            </p>
            <div class="c9-conds" role="group" aria-label="挑選情況">
              @for (c of conds; track c.id) {
                <button type="button" class="pf-btn small" [class.picked]="picked().includes(c.id)" [attr.aria-pressed]="picked().includes(c.id)" (click)="toggle(c.id)">
                  {{ c.text }}
                </button>
              }
            </div>
            @if (myRows().length) {
              <app-pf-case-line [rows]="myRows()" [lo]="lo" [hi]="hi" />
              <p class="pf-note">數線上的每個點都是一個整數<span class="c8-tag finite">有限檢查</span>。畫面只看得到 {{ fmt(lo) }} 到 {{ fmt(hi) }}，蓋滿要靠理由。</p>
            }
            <p class="pf-feedback" [class.good]="covered()" [class.bad]="!!myRows().length && !covered()" role="status">{{ coverMsg() }}</p>
          </div>
        }

        @if (doneCover()) {
          <div class="c6-block pf-rise">
            <div class="pf-def">
              <small>蓋滿的理由</small>
              <p>{{ reason() }}</p>
            </div>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>分情況的證明，只證到情況蓋到的數。<br />情況可以重疊，不能留空隙；蓋滿本身也要有理由。</p>
            </div>
            <p class="pf-note">
              情況切好之後，每一種都要真的證完。<a routerLink="/learn/proofs/ch9/2">下一幕</a>在證明板上分情況，看一句話怎麼一種一種證完。
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneCoverComponent {
  private readonly progress = inject(LearnProgressService);

  readonly skeleton = CH8_SKELETON;
  readonly conds = CONDS;
  readonly lo = LO;
  readonly hi = HI;
  readonly fmt = fmt;
  /** x² written for a value: (−2)², not −2², which would mean −4. */
  sq(n: number): string {
    return n < 0 ? `(${fmt(n)})²` : `${fmt(n)}²`;
  }
  readonly studentRows: CaseRow[] = [
    { label: '情況一：x > 0', test: (n) => n > 0 },
    { label: '情況二：x < 0', test: (n) => n < 0 },
  ];

  readonly reviewed = signal(!!this.progress.getStepData('proofs-ch9', '1', 'skeleton'));
  readonly verdict = signal<'yes' | 'no' | null>(null);
  readonly xDraft = signal('');
  readonly tries = signal<number[]>([]);
  readonly xMsg = signal<string | null>(null);
  readonly found = computed(() => this.tries().includes(0));
  readonly picked = signal<string[]>([]);
  /** Once a covering split has been made, the reason and takeaway stay. */
  readonly doneCover = signal(false);

  readonly myRows = computed<CaseRow[]>(() =>
    CONDS.filter((c) => this.picked().includes(c.id)).map((c, i) => ({ label: `情況 ${i + 1}：${c.text}`, test: c.test })),
  );
  private readonly counts = computed(() => NS.map((n) => ({ n, k: this.myRows().filter((r) => r.test(n)).length })));
  readonly covered = computed(() => this.myRows().length > 0 && this.counts().every((c) => c.k > 0));

  readonly coverMsg = computed(() => {
    const rows = this.myRows();
    if (!rows.length) return '還沒選任何情況。';
    const gaps = this.counts().filter((c) => c.k === 0).map((c) => c.n);
    const twice = this.counts().filter((c) => c.k > 1).map((c) => c.n);
    const over = twice.length ? `有些數被蓋到不只一次（例如 ${fmt(twice[0])}）：重疊沒關係，那個數只是被證了兩次。` : '';
    if (!gaps.length) {
      return rows.length === 1 ? '一種情況就蓋滿了？再看一次。' : `每個整數都至少被一種情況蓋到。${over}`;
    }
    const edge = gaps.includes(LO) || gaps.includes(HI);
    const shown = gaps.length > 6 ? `${gaps.slice(0, 5).map(fmt).join('、')}……` : gaps.map(fmt).join('、');
    const more = edge ? '，數線外面還有更多' : '';
    return `沒蓋到：${shown}${more}。這些數，證明一個字也沒說。${over}`;
  });

  readonly reason = computed(() => {
    const p = this.picked();
    if (p.includes('even') && p.includes('odd')) {
      return '每個整數不是偶數就是奇數（第 8 章「換正面」靠的就是這件事）。只要「偶數」「奇數」兩種情況都在，就蓋滿了，其他情況只是重疊。';
    }
    return '每個整數和 0 比，只有大於、等於、小於三種結果。你挑的情況把正數、0、負數全部管到了；數線外面的數離 0 更遠，也落在同樣的條件裡。';
  });

  tryX(): void {
    const v = this.xDraft().trim().replace('−', '-');
    if (!/^-?\d{1,6}$/.test(v)) {
      this.xMsg.set('請打一個整數，例如 3 或 −2。');
      return;
    }
    const n = Number(v);
    this.xDraft.set('');
    if (this.tries().includes(n)) {
      this.xMsg.set(`x = ${fmt(n)} 已經試過了。`);
      return;
    }
    this.tries.update((t) => [...t, n]);
    if (n === 0) {
      this.xMsg.set(null);
      return;
    }
    const nonzero = this.tries().filter((t) => t !== 0).length;
    this.xMsg.set(
      nonzero >= 3
        ? `${this.sq(n)} = ${n * n}，還是大於 0。提示：第 2 行管 x > 0，第 3 行管 x < 0。有沒有哪個整數，兩行都沒管到？`
        : `${this.sq(n)} = ${n * n}，大於 0，這一個沒問題。再試試別的 x。`,
    );
  }

  toggle(id: string): void {
    this.picked.update((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    if (this.covered() && this.myRows().length > 1 && !this.doneCover()) {
      this.doneCover.set(true);
      this.progress.markCompleted('proofs-ch9', '1');
    }
  }
}
