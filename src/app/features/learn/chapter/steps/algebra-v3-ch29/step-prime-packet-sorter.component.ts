import { Component, computed, signal } from '@angular/core';
import { D3_GROUP, displayTuple, rotationPackets } from './cauchy-model';

@Component({
  selector: 'app-algebra-v3-prime-packet-sorter',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch29-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 29.4</p>
        <h2>Rotation 會把 36 個 triples 裝成 3-packets；只有完全不動的 tuple 單獨留下</h2>
        <p class="lede">
          現在真的把 constrained room 全部排序。因為 action 本身三步回原位，每個 packet
          的大小只能整除 3。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>
          在 3 次就回原位的 rotation 下，一個 orbit packet 可能剛好含 2 個 distinct triples 嗎？
        </h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不能，只可能 1 或 3</button>
          <button type="button" (click)="prediction.set(true)">可以，1、2、3 都可能</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? '若第二次先回到起點，第三次再 shift 反而會離開；這和 action 三步必回衝突。'
                : '對。packet size 必須整除 prime 3，因此只有 singleton 或 triple。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Prime-packet sorter</p>
            <h3>逐包 reveal；每張 tuple card 只進入一個 orbit</h3>
          </div>
          <p>Singleton 用雙框與 FIXED 標籤；triple 用三格連線與 SIZE 3 標籤，分類不依賴顏色。</p>
        </div>
        <div class="packet-controls">
          <button type="button" [disabled]="shown() >= packets.length" (click)="nextPacket()">
            揭露下一包
          </button>
          <button type="button" class="primary" (click)="shown.set(packets.length)">
            完成全部 sorting
          </button>
          <button type="button" (click)="shown.set(1)">重設</button>
        </div>
        <div class="stage packet-sort-stage">
          <section class="packet-deck" aria-live="polite">
            @for (packet of visiblePackets(); track packet.key; let i = $index) {
              <article [class.singleton]="packet.fixed">
                <header>
                  <span>PACKET {{ i + 1 }}</span>
                  <b>{{ packet.fixed ? 'FIXED · SIZE 1' : 'ROTATES · SIZE 3' }}</b>
                </header>
                <div>
                  @for (tuple of packet.tuples; track $index) {
                    <span>{{ display(tuple) }}</span>
                    @if ($index < packet.tuples.length - 1) {
                      <i>→</i>
                    }
                  }
                  @if (!packet.fixed) {
                    <i>↺</i>
                  }
                </div>
              </article>
            }
            @if (shown() < packets.length) {
              <article class="unrevealed">
                <b>{{ packets.length - shown() }} PACKETS NOT YET OPENED</b>
                <span>按「揭露下一包」繼續 sorting</span>
              </article>
            }
          </section>
          <section class="packet-console" aria-live="polite">
            <p class="kicker">SORT STATUS</p>
            <div><span>ROOM STATES</span><b>36 triples</b></div>
            <div>
              <span>REVEALED PACKETS</span><b>{{ shown() }} / {{ packets.length }}</b>
            </div>
            <div>
              <span>SIZE-3 PACKETS</span><b>{{ visibleTripleCount() }}</b>
            </div>
            <div>
              <span>SINGLETONS</span><b>{{ visibleSingletonCount() }}</b>
            </div>
            <div class="packet-rule">
              <strong>NO SIZE-2 PACKET</strong><small>ORBIT SIZE DIVIDES PRIME 3</small>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>moving tuple</span><i>3 at a time</i><span>fixed tuple</span><i>1</i
          ><span>no other size</span>
        </div>
        <p>
          <strong>Prime action 把所有「會動的情況」整批消耗掉。</strong>非固定 triples
          一律三個一包；真正可能影響除以 3 餘數的，只剩 singleton fixed points。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">邊界測試</p>
        <h3>若改成 4-slot rotation，tuple pattern (a,b,a,b) 的 orbit 有多大？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(2)">2；shift 兩次就回來</button>
          <button type="button" (click)="transfer.set(4)">4；所有 nonfixed orbit 都要滿長</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 2">
            {{
              transfer() === 2
                ? '對。4 是 composite，所以 orbit size 2 可以出現；prime 條件正是排除中間 divisors。'
                : 'Pattern (a,b,a,b) shift 兩次已回原位，形成 size-2 orbit。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>一般 prime p 時，為什麼 orbit size 只有 1 或 p？</summary>
          <div>
            Cₚ 作用下，orbit size 等於 p 除以 stabilizer size，因此必須整除 p。因 p 是 prime，只有
            1、p 兩種 divisor。等價地，若某次 1≤k&lt;p 的 shift 已回到原 tuple，k 在 mod p
            中可生成全部 shifts，於是 tuple 被每次 shift 固定，orbit size 其實是 1。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3PrimePacketSorterComponent {
  readonly packets = rotationPackets(D3_GROUP, 3);
  readonly shown = signal(12);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<number | null>(null);
  readonly visiblePackets = computed(() => this.packets.slice(0, this.shown()));
  readonly visibleTripleCount = computed(
    () => this.visiblePackets().filter((packet) => !packet.fixed).length,
  );
  readonly visibleSingletonCount = computed(
    () => this.visiblePackets().filter((packet) => packet.fixed).length,
  );

  nextPacket(): void {
    this.shown.update((value) => Math.min(this.packets.length, value + 1));
  }

  display(tuple: string[]): string {
    return displayTuple(D3_GROUP, tuple);
  }
}
