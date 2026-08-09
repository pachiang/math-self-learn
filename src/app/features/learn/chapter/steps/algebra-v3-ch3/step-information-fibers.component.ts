import { Component, computed, signal } from '@angular/core';

type OperationId = 'shuffle' | 'sort' | 'delete';

interface OperationModel {
  id: OperationId;
  label: string;
  note: string;
  rows: ReadonlyArray<{ input: string; output: string }>;
}

const OPERATIONS: readonly OperationModel[] = [
  {
    id: 'shuffle', label: 'cyclic shuffle', note: '重新排列，不刪資訊',
    rows: [{ input: 'ABC', output: 'BCA' }, { input: 'BCA', output: 'CAB' }, { input: 'CAB', output: 'ABC' }],
  },
  {
    id: 'sort', label: 'alphabetical sort', note: '不同順序被壓成同一個',
    rows: [{ input: 'ABC', output: 'ABC' }, { input: 'BCA', output: 'ABC' }, { input: 'CAB', output: 'ABC' }],
  },
  {
    id: 'delete', label: 'delete last card', note: '最後一張永久消失',
    rows: [{ input: 'ABC', output: 'AB' }, { input: 'ABD', output: 'AB' }, { input: 'ABE', output: 'AB' }],
  },
];

@Component({
  selector: 'app-algebra-v3-information-fibers',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch3-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 3.4</p>
        <h2>不可逆 action 會把不同來源壓成同一點</h2>
        <p class="lede">
          undo 失敗通常不是因為我們還沒找到好公式，而是 output 已經不含足夠資訊。若兩個 inputs 撞進同一 output，任何 reverse function 都無法同時猜對兩個來源。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先看資訊是否還在</p>
        <h3>把任意三張牌按字母排序後，看見 ABC。能用一個固定 inverse action 找回原排列嗎？</h3>
        <div class="choice-row"><button type="button" (click)="prediction.set(false)">不能</button><button type="button" (click)="prediction.set(true)">可以</button></div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'ABC、BCA、CAB 都可能產生 ABC；reverse function 只有一個 output，卻被要求給三個答案。' : '對。sorting 可以重做結果，卻不能恢復被抹掉的原順序。' }}</p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Information-fiber inspector</p><h3>選 operation，再反查某個 output 的所有 possible sources</h3></div>
          <p>左側保留完整 source→output pipeline；右側從 output 逆讀。碰撞不只用顏色標示，還會列出來源數與明確 verdict。</p>
        </div>

        <div class="operation-picker" role="group" aria-label="選擇要檢查的 operation">
          @for (operation of operations; track operation.id) {
            <button type="button" [attr.aria-pressed]="selectedOperation() === operation.id" (click)="selectOperation(operation.id)">
              <strong>{{ operation.label }}</strong><span>{{ operation.note }}</span>
            </button>
          }
        </div>

        <div class="stage fiber-workbench">
          <div class="mapping-fibers" aria-label="完整的 source 到 output mappings">
            @for (row of current().rows; track row.input) {
              <div class="fiber-row" [class.collision]="sourceCount(row.output) > 1">
                <span>{{ row.input }}</span><i>→</i><span>{{ row.output }}</span>
              </div>
            }
          </div>

          <section class="source-inspector" aria-live="polite">
            <h4>從哪個 output 往回看？</h4>
            <div class="output-picker">
              @for (output of outputs(); track output) {
                <button type="button" [attr.aria-pressed]="selectedOutput() === output" (click)="selectedOutput.set(output)">{{ output }}</button>
              }
            </div>
            <span>possible sources · {{ sources().length }}</span>
            <div class="source-list" [class.ambiguous]="sources().length !== 1">
              @for (source of sources(); track source) { <b>{{ source }}</b> }
            </div>
            <div class="fiber-verdict" [class.loss]="sources().length !== 1">
              {{ sources().length === 1 ? '✓ 此 output 有唯一來源' : '× 來源不唯一：reverse function 無法決定要回哪裡' }}
            </div>
          </section>
        </div>

        <p class="readout" aria-live="polite">
          {{ hasUniversalInverse() ? '✓ UNIVERSAL UNDO EXISTS — 每個 output 都只有一個來源，完整 mapping 可以反向讀取。' : '× NO UNIVERSAL UNDO — 至少一個 output 合併了多個 sources；來源資訊已經遺失。' }}
        </p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>distinct sources</span><i>→</i><span>same output</span><i>⇒</i><span>no undo</span></div>
        <p>
          <strong>可逆 action 可以重新排列資訊，卻不能永久忘掉資訊。</strong>
          inverse 的存在等價於每個 output 都能唯一指出來源；一旦 arrows merge，回程就不再是一個 function。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">幾何中的同一故障</p>
        <h3>把平面投影到 x 軸後，只知道 output x=2。這通常足以恢復原本的 y 嗎？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set(false)">不足</button><button type="button" (click)="transfer.set(true)">足夠</button></div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">{{ transfer() ? '整條垂直線上的 points 都投影到 x=2；y 已被壓掉。' : '對。projection 的一個 output 有許多 possible sources，所以沒有 universal inverse。' }}</p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details><summary>正式連結：inverse function 與 bijection</summary><div>若 T 有 two-sided inverse，T 必須 injective：T(x)=T(y) 時兩側套 T⁻¹ 可得 x=y；也必須 surjective，因為任一 output z 都是 T(T⁻¹(z))。反過來，bijection 的每個 output 恰有一個來源，因此可定義 inverse function。</div></details>
        <details><summary>邊界：有用的 operation 不一定是 group action</summary><div>sorting、compression、projection 都非常有用，但它們解決的是「忘掉哪些差異」的問題。Monoid 等結構可以容納不可逆 operations；本課暫不展開分類，只用來看清 group 的可逆性承諾。</div></details>
      </section>
    </article>
  `,
})
export class AlgebraV3InformationFibersComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly selectedOperation = signal<OperationId>('shuffle');
  readonly selectedOutput = signal('BCA');
  readonly operations = OPERATIONS;
  readonly current = computed(() => OPERATIONS.find((operation) => operation.id === this.selectedOperation()) ?? OPERATIONS[0]);
  readonly outputs = computed(() => [...new Set(this.current().rows.map((row) => row.output))]);
  readonly sources = computed(() => this.current().rows.filter((row) => row.output === this.selectedOutput()).map((row) => row.input));
  readonly hasUniversalInverse = computed(() => this.outputs().length === this.current().rows.length && this.outputs().every((output) => this.sourceCount(output) === 1));

  selectOperation(operation: OperationId): void {
    this.selectedOperation.set(operation);
    const model = OPERATIONS.find((item) => item.id === operation) ?? OPERATIONS[0];
    this.selectedOutput.set(model.rows[0].output);
  }
  sourceCount(output: string): number { return this.current().rows.filter((row) => row.output === output).length; }
}
