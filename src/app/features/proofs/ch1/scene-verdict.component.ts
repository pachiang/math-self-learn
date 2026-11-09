import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { isOddComposite, smallestFactor } from './ch1-numbers';

type Verdict = 'proved' | 'refuted' | 'open';

interface Case {
  id: string;
  kind: '存在' | '所有' | '所有（有限範圍）';
  claim: string;
  evidence: string;
  answer: Verdict;
  why: string;
  wrong: Partial<Record<Verdict, string>>;
}

const CASES: Case[] = [
  {
    id: 'a',
    kind: '存在',
    claim: '存在一個大於 100 的質數。',
    evidence: '101 是質數。',
    answer: 'proved',
    why: '「存在」只要求一個。找到 101，就證完了。',
    wrong: {
      open: '「存在」型的陳述，一個例子就夠了，不需要更多。',
      refuted: '這份證據支持它，沒有任何東西推翻它。',
    },
  },
  {
    id: 'b',
    kind: '所有',
    claim: '所有質數都是奇數。',
    evidence: '2 是質數，而且是偶數。',
    answer: 'refuted',
    why: '「所有」只要有一個不符合，就倒了。2 就是那一個。',
    wrong: {
      proved: '2 是質數又是偶數，這正好是這句話說不會發生的事。',
      open: '不需要再看更多：一個反例就足以推翻「所有」。',
    },
  },
  {
    id: 'c',
    kind: '所有',
    claim: '每個大於 2 的偶數，都能寫成兩個質數之和。',
    evidence: '電腦已經檢查到 4 × 10¹⁸，全部成立。',
    answer: 'open',
    why: '4 × 10¹⁸ 個例子仍然是有限個。這就是 Goldbach 猜想：至今沒有人證明它，也沒有人找到反例。',
    wrong: {
      proved: '例子再多都是有限個，而第二幕的規律也撐了 40 個。',
      refuted: '推翻需要一個反例，而這裡一個反例都沒有。',
    },
  },
  {
    id: 'd',
    kind: '所有（有限範圍）',
    claim: '1 到 100 的每個整數，都能寫成四個平方數之和（0 也算平方數）。',
    evidence: '程式把 1 到 100 全部檢查完，每個都找到了寫法。',
    answer: 'proved',
    why: '範圍只有 100 個，而且全部檢查完了。有限範圍逐一檢查完，就是證明。（其實它對所有正整數都成立，這是 Lagrange 四平方和定理，但那需要論證。）',
    wrong: {
      open: '注意範圍：只有 1 到 100，而且每一個都檢查過了，沒有漏掉的情況。',
      refuted: '每一個都找到了寫法，沒有反例。',
    },
  },
  {
    id: 'e',
    kind: '所有',
    claim: '所有奇數都是質數。',
    evidence: '3、5、7 都是質數。',
    answer: 'open',
    why: '光靠這三個例子，什麼都確定不了。但你可能已經想到，這句話其實是錯的……',
    wrong: {
      proved: '三個例子不能證明「所有」。這正是前兩幕的教訓。',
      refuted: '你的直覺對，但這份證據裡沒有反例。下面換你自己找一個。',
    },
  },
  {
    id: 'f',
    kind: '所有',
    claim: '對每個 n，前 n 個奇數的和等於 n²。',
    evidence: '第 3 幕的 L 形論證。',
    answer: 'proved',
    why: '這不是例子，而是一個對每一步都成立的理由，加上成立的起點。',
    wrong: {
      open: '這份證據不是例子，而是論證。它對任何 n 都做同一件事。',
      refuted: '論證裡沒有任何反例。',
    },
  },
];

const VERDICT_LABEL: Record<Verdict, string> = { proved: '證明', refuted: '推翻', open: '未定' };

@Component({
  selector: 'app-pf-verdict',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './scene-verdict.component.scss',
  template: `
    <section class="verdict">
      <header class="head">
        <div class="pf-col">
          <p class="pf-kicker">4 / 4 · 你來裁決</p>
          <h1 class="pf-title">這份證據，<br />讓你能下什麼結論？</h1>
        </div>
        <p class="pf-lede">
          每張紙條附上一份證據。要判斷的不是這句話本身對不對，而是<b>單憑這份證據</b>，能蓋哪一個章：
          <span class="legend"><i class="pf-seal proved mini">證明</i><i class="pf-seal refuted mini">推翻</i><i class="pf-seal open mini">未定</i></span>
          「未定」的意思是：這份證據還不夠。
        </p>
      </header>

      <ol class="desk">
        @for (c of cases; track c.id) {
          <li class="card" [class.solved]="solved(c.id)">
            <div class="pf-slip">
              <small>{{ c.kind }}</small>
              <p>{{ c.claim }}</p>
              @if (seal(c.id); as s) {
                <div [class]="'pf-seal stamp ' + s.v">{{ s.label }}</div>
              }
            </div>
            <p class="evidence"><b>證據</b>{{ c.evidence }}</p>
            <div class="pf-row" role="group" [attr.aria-label]="'為「' + c.claim + '」選擇裁決'">
              @for (v of verdicts; track v) {
                <button
                  type="button"
                  class="pf-btn"
                  [class.picked]="picked()[c.id] === v"
                  [disabled]="solved(c.id)"
                  (click)="pick(c, v)"
                >
                  {{ label(v) }}
                </button>
              }
            </div>
            @if (picked()[c.id]; as v) {
              <p class="pf-feedback" [class.good]="v === c.answer" [class.bad]="v !== c.answer" role="status">
                {{ v === c.answer ? c.why : c.wrong[v] }}
              </p>
            }
            @if (c.id === 'e' && solved('e')) {
              <form class="pf-row" (submit)="counter($event)">
                <label for="pf-counter">找一個反例：</label>
                <input
                  id="pf-counter"
                  class="pf-input small"
                  inputmode="numeric"
                  autocomplete="off"
                  [value]="counterDraft()"
                  (input)="counterDraft.set($any($event.target).value)"
                  [disabled]="counterOk()"
                />
                <button type="submit" class="pf-btn primary" [disabled]="counterOk()">檢查</button>
              </form>
              @if (counterMsg()) {
                <p class="pf-feedback" [class.good]="counterOk()" [class.bad]="!counterOk()" role="status">{{ counterMsg() }}</p>
              }
            }
          </li>
        }
      </ol>

      @if (allDone()) {
        <section class="summary pf-rise">
          <div class="rules">
            <div>
              <h2>「存在…」</h2>
              <p>一個例子就能<b class="blue">證明</b>。</p>
            </div>
            <div>
              <h2>「所有…」</h2>
              <p>一個反例就能<b class="red">推翻</b>。有限範圍可以逐一檢查完；無限範圍只能靠<b class="blue">論證</b>。</p>
            </div>
            <div>
              <h2>例子的真正用處</h2>
              <p>例子讓你猜到規律、讓你相信。論證讓你確定。</p>
            </div>
          </div>
          <div class="pf-takeaway">
            <small>第 1 章 · 帶走這一句</small>
            <p>例子能證明「存在」、能推翻「所有」；<br />要證明無限多個「所有」，只能靠論證。</p>
          </div>
          <p class="pf-note">
            下一章：如果證明要靠論證，論證又只能用定義當武器，那就得先讀懂一個定義到底說了什麼。<a routerLink="/learn/proofs/ch2/1">前往第 2 章「定義是開關，也是工具」→</a>
          </p>
        </section>
      } @else {
        <p class="pf-note progress">已完成 {{ solvedCount() }} / {{ cases.length }}{{ needsCounter() ? '，還差第五張紙條的反例' : '' }}</p>
      }
    </section>
  `,
})
export class SceneVerdictComponent {
  private readonly progress = inject(LearnProgressService);

  readonly cases = CASES;
  readonly verdicts: Verdict[] = ['proved', 'refuted', 'open'];
  readonly picked = signal<Record<string, Verdict>>({});
  readonly counterDraft = signal('');
  readonly counterOk = signal(false);
  readonly counterMsg = signal('');
  readonly counterValue = signal<number | null>(null);

  readonly solvedCount = computed(() => CASES.filter((c) => this.picked()[c.id] === c.answer).length);
  readonly needsCounter = computed(() => this.solved('e') && !this.counterOk());
  readonly allDone = computed(() => this.solvedCount() === CASES.length && this.counterOk());

  label(v: Verdict): string {
    return VERDICT_LABEL[v];
  }

  solved(id: string): boolean {
    const c = CASES.find((x) => x.id === id);
    return !!c && this.picked()[id] === c.answer;
  }

  seal(id: string): { v: Verdict; label: string } | null {
    if (id === 'e' && this.counterOk()) return { v: 'refuted', label: '推翻' };
    if (!this.solved(id)) return null;
    const c = CASES.find((x) => x.id === id)!;
    return { v: c.answer, label: VERDICT_LABEL[c.answer] };
  }

  pick(c: Case, v: Verdict): void {
    this.picked.update((p) => ({ ...p, [c.id]: v }));
    this.checkComplete();
  }

  counter(ev: Event): void {
    ev.preventDefault();
    const raw = this.counterDraft().trim().replace(/,/g, '');
    const m = Number(raw);
    if (raw === '' || !Number.isSafeInteger(m)) {
      this.counterMsg.set('請輸入一個整數。');
      return;
    }
    if (isOddComposite(m)) {
      const f = smallestFactor(m);
      this.counterOk.set(true);
      this.counterValue.set(m);
      this.counterMsg.set(`${m} = ${f} × ${m / f}：它是奇數，卻不是質數。一個反例，這句話就倒了。`);
      this.checkComplete();
    } else if (m % 2 === 0) {
      this.counterMsg.set(`${m} 是偶數。我們要找的是「奇數、但不是質數」。`);
    } else if (m === 1) {
      this.counterMsg.set('1 確實不是質數。不過它太特殊了（質數的定義從 2 開始），換一個更有說服力的。');
    } else {
      this.counterMsg.set(`${m} 是質數，沒有違反這句話。再找找。`);
    }
  }

  private checkComplete(): void {
    if (this.allDone()) this.progress.markCompleted('proofs-ch1', '4');
  }
}
