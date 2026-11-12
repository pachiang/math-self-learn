import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { fmtQ, isInt, readNumber } from '../ch2/ch2-expr';
import { Cell, CellView, Grid4Component, num } from '../ch3/grid4.component';
import { NegSpec, NegateMachineComponent } from './negate-machine.component';

const C_SPEC: NegSpec = {
  quants: [{ q: 'forall', v: 'n', dom: 'Z', all: '對每個整數 n', some: '存在整數 n' }],
  body: '若 n 是偶數，則 n 是 4 的倍數',
  options: [
    {
      text: '若 n 是偶數，則 n 不是 4 的倍數',
      ok: false,
      why: '這又許了一個新的承諾。看 n = 3：它不是偶數，原來的承諾沒被觸發，算守住；新的承諾也沒被觸發，也算守住。兩句在同一個 n 上一起成立，沒有唱反調。',
    },
    {
      text: '若 n 不是偶數，則 n 不是 4 的倍數',
      ok: false,
      why: '看 n = 8：它是偶數，也是 4 的倍數，原來的承諾守住了；新的承諾沒被觸發，也算守住。兩句一起成立，沒有唱反調。',
    },
    {
      text: 'n 是偶數，而且 n 不是 4 的倍數',
      ok: true,
      why: '對。第 3 章說過，承諾只在一格被打破：n 是偶數，可是不是 4 的倍數。否定句說的就是「違約格裡真的有一個數」。',
    },
    {
      text: 'n 不是偶數，而且 n 是 4 的倍數',
      ok: false,
      why: '看 n = 6：它是偶數、不是 4 的倍數，原來的承諾被打破了，可是這一句也不成立。兩句一起不成立。違約的是四格圖右上那一格，不是左下那一格。',
    },
  ],
  check: '若 n 是偶數，則 n 是 4 的倍數',
  negCheck: 'n 是偶數，而且不是 4 的倍數',
};

const cellOf = (n: number): Cell => {
  const even = n % 2 === 0;
  const four = ((n % 4) + 4) % 4 === 0;
  return `${even ? 'T' : 'F'}${four ? 'T' : 'F'}` as Cell;
};

@Component({
  selector: 'app-pf-break',
  standalone: true,
  imports: [NegateMachineComponent, Grid4Component],
  styleUrl: './scene-break.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">4 / 5 · 打破一個承諾</p>
        <h1 class="pf-title">「若…則」被否定時，<br />變成什麼？</h1>
        <p class="pf-lede">
          第 3 章第 5 幕的逆命題，加上它藏起來的量詞，就是句子 C。你已經知道它不成立。現在把它的否定句寫出來，再親手證明那個否定句。
        </p>

        <div class="pf-slip">
          <small>句子 C</small>
          <p>對每個整數 n，若 n 是偶數，則 n 是 4 的倍數。</p>
          @if (witness() !== null) {
            <span class="pf-seal refuted stamp">推翻</span>
          }
        </div>

        <p class="pf-p">先把第 3 章的四格圖拿出來：這個承諾只在右上那一格被打破。</p>
        <app-pf-grid4 p="n 是偶數" q="n 是 4 的倍數" [view]="view()" label="四格圖：n 是偶數、n 是 4 的倍數" />
        <app-pf-negate [spec]="spec" label="句子 C" (finished)="negDone.set(true)" />

        @if (negDone()) {
          <div class="pf-col tight pf-rise">
            <div class="pf-slip">
              <small>C 的否定句（¬C）</small>
              <p>存在整數 n，n 是偶數，而且 n 不是 4 的倍數。</p>
              @if (witness() !== null) {
                <span class="pf-seal proved stamp">證明</span>
              }
            </div>
            <p class="pf-p">
              ¬C 是一句「存在」：只要你拿出一個 n 就成立。打一個數，看它落進四格圖的哪一格。
            </p>
            @if (witness() === null) {
              <form class="pf-row" (submit)="$event.preventDefault(); tryN()">
                <label class="n-eq" for="pf-n-c">n =</label>
                <input class="pf-input" id="pf-n-c" inputmode="numeric" autocomplete="off" [value]="draft()" (input)="draft.set($any($event.target).value)" />
                <button type="submit" class="pf-btn primary small">放進四格圖</button>
              </form>
            }
            @if (msg(); as m) {
              <p class="pf-feedback" [class.good]="witness() !== null" [class.bad]="witness() === null" role="status">{{ m }}</p>
            }
          </div>
        }

        @if (witness() !== null) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">
              同一個 n = {{ w() }} 做了兩件事：它是 C 的<b>反例</b>，也是 ¬C 的<b>證明</b>。第 1 章說「一個例子就能推翻『所有』」，現在你知道為什麼了：推翻「所有」，就是證明一句「存在」，而「存在」只要一個例子。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>「若 P 則 Q」的否定不是另一個承諾，<br />而是「P，而且不是 Q」：違約格裡真的有一個例子。<br />找到一個反例，就是證明了否定句。</p>
            </div>
            <details class="pf-why">
              <summary>第 1 章的 n² + n + 41 也是這樣嗎？</summary>
              <div>
                <p>原句：對每個自然數 n，n² + n + 41 是質數。否定句：存在自然數 n，使 n² + n + 41 不是質數。</p>
                <p>n = 40 時，40² + 40 + 41 = 1681 = 41 × 41。這一個 n 就證明了否定句，也就推翻了原句。前面 0 到 39 都是質數，對否定句一點影響都沒有。</p>
              </div>
            </details>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneBreakComponent {
  private readonly progress = inject(LearnProgressService);

  readonly spec = C_SPEC;
  readonly negDone = signal(false);
  readonly draft = signal('');
  readonly tried = signal<number[]>([]);
  readonly witness = signal<number | null>(null);
  readonly msg = signal<string | null>(null);

  readonly w = computed(() => num(this.witness() ?? 0));

  readonly view = computed<Partial<Record<Cell, CellView>>>(() => {
    const toks: Record<Cell, string[]> = { TT: [], TF: [], FT: [], FF: [] };
    for (const n of this.tried()) toks[cellOf(n)].push(num(n));
    return {
      TT: { mark: 'kept', tokens: toks.TT },
      TF: { mark: 'breach', tokens: toks.TF, picked: this.witness() !== null },
      FT: { mark: 'impossible', tokens: toks.FT },
      FF: { mark: 'idle', note: '算守約', tokens: toks.FF },
    };
  });

  tryN(): void {
    const r = readNumber(this.draft());
    if (!r.ok) {
      this.msg.set(r.msg);
      return;
    }
    if (!isInt(r.v)) {
      this.msg.set(`${fmtQ(r.v)} 不是整數，句子要的 n 是整數。`);
      return;
    }
    const n = r.v.n;
    this.draft.set('');
    if (!this.tried().includes(n)) this.tried.update((t) => [...t, n]);
    const c = cellOf(n);
    if (c === 'TF') {
      this.witness.set(n);
      this.msg.set(`${num(n)} 是偶數，卻不是 4 的倍數，落在違約格。¬C 成立了。`);
      this.progress.markCompleted('proofs-ch5', '4');
    } else if (c === 'TT') {
      this.msg.set(`${num(n)} 是偶數，也是 4 的倍數。承諾守住了，它不在違約格。再找一個。`);
    } else {
      this.msg.set(`${num(n)} 不是偶數，承諾根本沒被觸發。再找一個。`);
    }
  }
}
