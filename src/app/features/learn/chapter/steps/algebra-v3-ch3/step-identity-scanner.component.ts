import { Component, computed, signal } from '@angular/core';

type Vertex = 'A' | 'B' | 'C';
type Primitive = 'r' | 's';
type ProgramId = 'e' | 'r3' | 's' | 'r';

const VERTICES: readonly Vertex[] = ['A', 'B', 'C'];
const MAPS: Record<Primitive, Record<Vertex, Vertex>> = {
  r: { A: 'B', B: 'C', C: 'A' },
  s: { A: 'A', B: 'C', C: 'B' },
};
const PROGRAMS: ReadonlyArray<{ id: ProgramId; label: string; note: string; history: Primitive[] }> = [
  { id: 'e', label: 'e', note: 'standby action', history: [] },
  { id: 'r3', label: 'r³', note: '三次 rotation', history: ['r', 'r', 'r'] },
  { id: 's', label: 's', note: '固定 A 的 reflection', history: ['s'] },
  { id: 'r', label: 'r', note: '一次 rotation', history: ['r'] },
];

@Component({
  selector: 'app-algebra-v3-identity-scanner',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch3-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 3.1</p>
        <h2>Identity 是整個世界共用的「不動」</h2>
        <p class="lede">
          一個 state 沒變，只是一次觀察；identity（單位元素）是一個 global claim：無論從哪個 possible state 出發，總 action 都把它送回自己。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先抓出錯誤捷徑</p>
        <h3>reflection s 固定頂點 A。只憑這件事，可以把 s 判定為 identity 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不可以</button>
          <button type="button" (click)="prediction.set(true)">可以</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{ prediction() ? 'A 只是 fixed point；s 同時把 B、C 交換，所以整個 mapping 並非不動。' : '對。identity 的量詞是「每一個 state」，不能由一個成功案例代替。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Whole-world identity scanner</p><h3>切換候選 program，一次掃描所有起點</h3></div>
          <p>history 可以是空的，也可以很長；判定 identity 只看壓縮後的完整 mapping。這直接延續第 2 章的 composite action。</p>
        </div>

        <div class="program-picker" role="group" aria-label="選擇要檢查的 action program">
          @for (program of programs; track program.id) {
            <button type="button" [attr.aria-pressed]="selected() === program.id" (click)="selected.set(program.id)">
              <strong>{{ program.label }}</strong><span>{{ program.note }}</span>
            </button>
          }
        </div>

        <div class="stage world-scan" aria-live="polite">
          @for (path of paths(); track path.start) {
            <div class="scan-row">
              <b>{{ path.start }}</b>
              <span class="path">{{ path.history.join(' → ') }}</span>
              <b class="end">{{ path.end }}</b>
              <span class="verdict" [class.changed]="path.start !== path.end">
                {{ path.start === path.end ? '✓ 回到自己' : '× state 改變' }}
              </span>
            </div>
          }
        </div>

        <div class="world-verdict" aria-live="polite">
          {{ isIdentity() ? '✓ IDENTITY — 所有 states 都保持不變' : '× NOT IDENTITY — 至少一個 state 被改變' }}
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>every state x</span><i>→</i><span>same x</span></div>
        <p>
          <strong>Identity 描述的是總效果，不是 history 的長度。</strong>
          <code>e</code> 沒有淨改變，<code>r³</code> 也沒有淨改變；它們代表同一個 action effect。相反地，s 即使固定 A，仍不是 identity。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">換一個 operation</p>
        <h3>在整數加法中，identity 應該是 1，因為乘法的 identity 是 1。這個推論正確嗎？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set(false)">錯</button><button type="button" (click)="transfer.set(true)">對</button></div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{ transfer() ? 'identity 取決於 operation；加法要找讓 x 不變的 addend，所以是 0。' : '對。0+x=x=x+0；同一個 underlying set 換 operation，identity 的外表也會換。' }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>正式條件：two-sided identity</summary>
          <div>Element e 必須對每個 a 同時滿足 e·a=a 與 a·e=a。左側與右側都要成立；「固定某個 state」與「只在一側不改變」都不是完整條件。</div>
        </details>
        <details>
          <summary>Proof Lab：identity 為什麼不可能有兩個？</summary>
          <div>若 e、f 都是 identity，計算同一個 e·f：因 f 是 right identity，e·f=e；因 e 是 left identity，e·f=f。因此 e=f。這個短 proof 不需要交換順序。</div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3IdentityScannerComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly selected = signal<ProgramId>('s');
  readonly programs = PROGRAMS;
  readonly current = computed(() => PROGRAMS.find((program) => program.id === this.selected()) ?? PROGRAMS[0]);
  readonly paths = computed(() => VERTICES.map((start) => {
    const history = [start];
    let current = start;
    for (const action of this.current().history) {
      current = MAPS[action][current];
      history.push(current);
    }
    return { start, end: current, history };
  }));
  readonly isIdentity = computed(() => this.paths().every((path) => path.start === path.end));
}
