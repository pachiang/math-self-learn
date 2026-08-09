import { Component, computed, signal } from '@angular/core';

type Vertex = 'A' | 'B' | 'C';
type Assignment = Record<Vertex, Vertex | null>;

@Component({
  selector: 'app-algebra-v3-whole-world-action',
  standalone: true,
  template: `
    <article class="alg-ch1-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 1.2</p>
        <h2>「A 移到 B」只是一條線索，不是一個完整 action</h2>
        <p class="lede">
          一個 transformation 必須同時管理整個 state
          space。現在不要挑現成答案；親手把一條局部線索補成完整 mapping。
        </p>
      </header>

      <section class="prediction" aria-labelledby="prediction-1-2">
        <p class="kicker">先分辨局部資訊與完整規則</p>
        <h3 id="prediction-1-2">只知道 A→B，是否已足以辨認一個三角形 symmetry？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(true)">足夠</button>
          <button type="button" (click)="prediction.set(false)">不夠</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? '一支 arrow 沒有說明 B、C 的去向；多個 actions 都可能包含 A→B。'
                : '對。action 是整張 input–output 對應表。下面把剩餘 arrows 補完。'
            }}
          </p>
        }
      </section>

      <section class="lab" aria-labelledby="lab-1-2">
        <div class="lab-heading">
          <div>
            <p class="kicker">Mapping builder</p>
            <h3 id="lab-1-2">為每個 input 指定唯一 destination</h3>
          </div>
          <p>
            A→B 是題目給的 clue。你可以讓 outputs 撞在一起，再觀察「完整」和「可逆」為何是兩關。
          </p>
        </div>

        <div class="stage">
          <div class="mapping-builder">
            @for (input of vertices; track input) {
              <div class="mapping-assignment">
                <strong>{{ input }}</strong
                ><i aria-hidden="true">→</i>
                <div class="destination-row" [attr.aria-label]="'選擇 ' + input + ' 的 output'">
                  @for (output of vertices; track output) {
                    <button
                      type="button"
                      [class.active]="assignment()[input] === output"
                      [attr.aria-pressed]="assignment()[input] === output"
                      [disabled]="input === 'A'"
                      (click)="assign(input, output)"
                    >
                      {{ output }}
                    </button>
                  }
                  @if (assignment()[input] === null) {
                    <span>尚未指定</span>
                  }
                </div>
              </div>
            }

            <div class="direct-controls">
              <button type="button" (click)="loadRotation()">載入 120° rotation</button>
              <button type="button" (click)="loadCollision()">故意製造 collision</button>
              <button type="button" (click)="reset()">只保留 A→B</button>
            </div>

            <div class="builder-status" aria-live="polite">
              <div class="status-test" [class.pass]="complete()" [class.fail]="!complete()">
                <span>{{ complete() ? '✓ PASS' : '× WAIT' }}</span>
                <strong>每個 input 有 output</strong>
              </div>
              <div class="status-test" [class.pass]="noCollision()" [class.fail]="!noCollision()">
                <span>{{ noCollision() ? '✓ PASS' : '× FAIL' }}</span>
                <strong>沒有兩個 inputs 撞在一起</strong>
              </div>
              <div class="status-test" [class.pass]="reversible()" [class.fail]="!reversible()">
                <span>{{ reversible() ? '✓ ACTION' : '× NOT YET' }}</span>
                <strong>可反向讀回原 state</strong>
              </div>
            </div>
          </div>
        </div>

        <p class="readout">
          <strong>{{ statusTitle() }}</strong
          ><br />{{ statusExplanation() }}
        </p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>一支 arrow</span><i>→</i><span>整張 map</span>
        </div>
        <p>
          <strong>Action 是對所有 inputs 的全域承諾。</strong>
          完整 function 仍可能壓扁資訊；要成為 symmetry，還要能撤銷，也就是沒有 collision 且沒有漏掉
          output。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移檢查</p>
        <h3>描述洗三張卡時，只說「第一張移到最後」就一定足夠嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">足夠</button>
          <button type="button" (click)="transfer.set(false)">不夠</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? '其餘兩張卡的 destinations 尚未決定。'
                : '對；shuffle 必須決定每張卡去哪裡。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>正式定義：function、bijection、symmetry</summary>
          <div>
            Function 要求每個 input 恰有一個 output。Bijection 再要求每個 output 恰由一個 input
            抵達，因此可以反向讀取。有限 state space 上的 symmetry 會是一個 structure-preserving
            bijection。
          </div>
        </details>
        <details>
          <summary>Proof Lab：rotation 為何可逆？</summary>
          <div>
            A→B、B→C、C→A 中，每個 output 恰出現一次；反向讀得到 B→A、C→B、A→C，這正是 240°
            rotation。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3WholeWorldActionComponent {
  readonly vertices: Vertex[] = ['A', 'B', 'C'];
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly assignment = signal<Assignment>({ A: 'B', B: null, C: null });

  readonly complete = computed(() => this.vertices.every((vertex) => this.assignment()[vertex]));
  readonly noCollision = computed(() => {
    const outputs = this.vertices
      .map((vertex) => this.assignment()[vertex])
      .filter((output): output is Vertex => output !== null);
    return new Set(outputs).size === outputs.length;
  });
  readonly reversible = computed(() => this.complete() && this.noCollision());
  readonly statusTitle = computed(() => {
    if (!this.complete()) return '目前只有 partial mapping。';
    if (!this.noCollision()) return 'Function 已完整，但資訊被壓扁。';
    return '現在才得到一個完整、可撤銷的 action。';
  });
  readonly statusExplanation = computed(() => {
    if (!this.complete()) return 'B、C 仍沒有 outputs，所以這條規則還不能被完整執行或合成。';
    if (!this.noCollision()) return '至少兩個 inputs 共用 output；只看結果時無法知道原本來自哪裡。';
    return '每個 input 與 output 一一配對；反向 mapping 也完整存在。';
  });

  assign(input: Vertex, output: Vertex): void {
    if (input === 'A') return;
    this.assignment.update((current) => ({ ...current, [input]: output }));
  }

  loadRotation(): void {
    this.assignment.set({ A: 'B', B: 'C', C: 'A' });
  }

  loadCollision(): void {
    this.assignment.set({ A: 'B', B: 'B', C: 'A' });
  }

  reset(): void {
    this.assignment.set({ A: 'B', B: null, C: null });
  }
}
