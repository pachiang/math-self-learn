import { Component, computed, signal } from '@angular/core';

type CycleElement = 'e' | 'r' | 'r2';
type Prediction = 'e' | 'r' | 'r2';

const ELEMENTS: readonly CycleElement[] = ['e', 'r', 'r2'];
const EXPONENT: Record<CycleElement, number> = { e: 0, r: 1, r2: 2 };
const LABEL: Record<CycleElement, string> = { e: 'e', r: 'r', r2: 'r²' };
const STATE_LABELS = ['A', 'B', 'C'] as const;

@Component({
  selector: 'app-algebra-v3-cayley-recorder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch2-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 2.3</p>
        <h2>Cayley table 是實驗紀錄，不是待背的方格</h2>
        <p class="lede">
          每一格只回答一個問題：先做 row action，再做 column action，整段等於哪個總 action？親手跑完兩步再記錄，table 才會從 history 壓縮成可查詢的 map。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測一格</p>
        <h3>在三格 rotation cycle 中，先做 r²、再做 r²，總效果是哪個 action？</h3>
        <div class="choice-row">
          @for (choice of elements; track choice) {
            <button type="button" [attr.aria-pressed]="prediction() === choice" (click)="prediction.set(choice)">{{ label[choice] }}</button>
          }
        </div>
        @if (prediction(); as answer) {
          <p class="feedback" [class.warning]="answer !== 'r'" aria-live="polite">
            {{ answer === 'r' ? '對。共轉四格；每三格回到原位，所以淨效果是再轉一格 r。' : '沿 A→C→B 真的走兩段 r²；不要把 superscript 當普通乘法後停在 4。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Cayley table recorder</p>
            <h3>選一格、播放兩步、才把結果寫進去</h3>
          </div>
          <p>本頁明定 row 先、column 後。三次 rotation cycle C₃ 恰好 commute，所以交換後結果相同；這不抹去上一節的警告，只代表這個例子有額外規律。</p>
        </div>

        <div class="stage experiment-layout">
          <div>
            <table class="cayley-table">
              <caption class="sr-only">三次旋轉循環的 Cayley table，row action 先執行</caption>
              <thead>
                <tr><th scope="col">row ↓<br />column →</th>@for (column of elements; track column) { <th scope="col">{{ label[column] }}</th> }</tr>
              </thead>
              <tbody>
                @for (row of elements; track row) {
                  <tr>
                    <th scope="row">{{ label[row] }}</th>
                    @for (column of elements; track column) {
                      <td>
                        <button
                          type="button"
                          [class.selected]="row === selectedRow() && column === selectedColumn()"
                          [class.revealed]="isRevealed(row, column)"
                          (click)="selectCell(row, column)"
                          [attr.aria-label]="cellAriaLabel(row, column)"
                        >{{ isRevealed(row, column) ? label[resultFor(row, column)] : '?' }}</button>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
            <p class="table-progress">已由實驗寫入 {{ revealed().size }} / 9 格；問號代表尚未測，不代表答案不存在。</p>
          </div>

          <section class="cycle-lab" aria-live="polite">
            <h4>目前實驗：{{ label[selectedRow()] }} → {{ label[selectedColumn()] }}</h4>
            <div class="cycle-track" aria-label="A、B、C 三個循環狀態">
              @for (state of stateLabels; track state; let index = $index) {
                <div class="cycle-node" [class.active]="index === currentState()">
                  <b>{{ state }}</b>
                  <span>{{ index === currentState() ? '目前在這裡' : 'cycle state' }}</span>
                </div>
              }
            </div>
            <ol class="trace-list">
              <li class="done">從 A 出發</li>
              <li [class.done]="traceStep() >= 1">row：做 {{ label[selectedRow()] }}，到 {{ stateAfterRow() }}</li>
              <li [class.done]="traceStep() >= 2">column：做 {{ label[selectedColumn()] }}，到 {{ stateAfterBoth() }}</li>
            </ol>
            <button type="button" class="primary" (click)="advanceOrRecord()">
              {{ traceStep() < 2 ? '執行下一步' : isCurrentRevealed() ? '這格已記錄；再確認一次' : '確認 net action，寫入 table' }}
            </button>
            <button type="button" (click)="clearExperiments()" [disabled]="revealed().size === 0">清空實驗紀錄</button>
          </section>
        </div>

        <p class="readout">
          @if (traceStep() < 2) {
            history 尚未完成：目前只知道走到 {{ stateLabels[currentState()] }}，還不能填格。
          } @else {
            兩步 history 已完成；在 C₃ 的三個候選 rotations 中，終點 {{ stateAfterBoth() }} 唯一辨認出淨效果 <strong>{{ label[currentResult()] }}</strong>。因此這格記成 {{ label[currentResult()] }}。
          }
        </p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>two-step experiment</span><i>⇒</i><span>one cell</span></div>
        <p>
          <strong>table 把「每一對 actions 的完整 history」壓成「一個可重用的結果」。</strong>
          row、column 是輸入，cell 是 composite action。表格沒有創造規則；它保存你已經能用 mapping 驗證的規則。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">防止過度推論</p>
        <h3>只要一張 operation table 填滿、而且每格仍在原集合裡，就能立刻斷定它是一個 group 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">還不能</button>
          <button type="button" (click)="transfer.set(true)">可以</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{ transfer() ? '填滿只直接顯示 closure；associativity、identity、inverse 還要另外確認。' : '對。這張表先保存 composition；第 3 章才會從圖樣中辨認 identity 與 inverse。' }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>正式名稱：binary operation 與 Cayley table</summary>
          <div>一個 binary operation 接收集合中的一對 elements，輸出同一集合中的一個 element。有限集合可把所有輸入對與輸出排成 Cayley table；本頁的 operation 是 action composition。</div>
        </details>
        <details>
          <summary>為什麼不能只追 A 就辨認所有 actions？</summary>
          <div>在更大的 symmetry set 中，不同 actions 可能都把 A 送到同一位置，卻對 B、C 做不同事情。C₃ 的三個 rotations 恰好可由 A 的終點區分；一般情況仍應比較完整 mapping。</div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CayleyRecorderComponent {
  readonly prediction = signal<Prediction | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly selectedRow = signal<CycleElement>('e');
  readonly selectedColumn = signal<CycleElement>('e');
  readonly traceStep = signal(0);
  readonly revealed = signal<ReadonlySet<string>>(new Set());
  readonly elements = ELEMENTS;
  readonly label = LABEL;
  readonly stateLabels = STATE_LABELS;
  readonly stateAfterRowIndex = computed(() => EXPONENT[this.selectedRow()] % 3);
  readonly currentResult = computed(() => this.resultFor(this.selectedRow(), this.selectedColumn()));
  readonly stateAfterBothIndex = computed(() => EXPONENT[this.currentResult()]);
  readonly currentState = computed(() => {
    if (this.traceStep() === 0) return 0;
    if (this.traceStep() === 1) return this.stateAfterRowIndex();
    return this.stateAfterBothIndex();
  });

  selectCell(row: CycleElement, column: CycleElement): void {
    this.selectedRow.set(row);
    this.selectedColumn.set(column);
    this.traceStep.set(0);
  }

  advanceOrRecord(): void {
    if (this.traceStep() < 2) {
      this.traceStep.update((step) => step + 1);
      return;
    }
    const key = this.key(this.selectedRow(), this.selectedColumn());
    this.revealed.update((previous) => new Set([...previous, key]));
  }

  clearExperiments(): void {
    this.revealed.set(new Set());
    this.traceStep.set(0);
  }

  resultFor(row: CycleElement, column: CycleElement): CycleElement {
    const exponent = (EXPONENT[row] + EXPONENT[column]) % 3;
    return ELEMENTS[exponent];
  }

  stateAfterRow(): string { return STATE_LABELS[this.stateAfterRowIndex()]; }
  stateAfterBoth(): string { return STATE_LABELS[this.stateAfterBothIndex()]; }
  isRevealed(row: CycleElement, column: CycleElement): boolean { return this.revealed().has(this.key(row, column)); }
  isCurrentRevealed(): boolean { return this.isRevealed(this.selectedRow(), this.selectedColumn()); }
  cellAriaLabel(row: CycleElement, column: CycleElement): string {
    const result = this.isRevealed(row, column) ? `，已記錄結果 ${LABEL[this.resultFor(row, column)]}` : '，尚未實驗';
    return `先做 ${LABEL[row]}，再做 ${LABEL[column]}${result}`;
  }
  private key(row: CycleElement, column: CycleElement): string { return `${row}:${column}`; }
}
