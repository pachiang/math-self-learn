import { Component, computed, signal } from '@angular/core';
import { S4_P8 } from '../algebra-v3-ch30/sylow-model';
import {
  MAGNET_ACTORS,
  S4_SYLOW_2_POINTS,
  magnetCosets,
  subgroupSummary,
} from './sylow-landscape-model';

@Component({
  selector: 'app-algebra-v3-coset-fixed-magnet',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch31-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 31.2</p>
        <h2>讓 H 搬動 G/P；停住的 coset 會指出一個能容納 H 的 Sylow point</h2>
        <p class="lede">
          這一幕不靠猜 subgroup。把任意 p-subgroup H 放進 coset world，fixed point 會像磁鐵一樣把 H
          對準某個 conjugate gPg⁻¹。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>|G:P| 不被 p 整除時，H-action 能讓所有 cosets 都進入 p-sized moving packets 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不能，必須留下 fixed coset</button>
          <button type="button" (click)="prediction.set(true)">可以，全部一起移動</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'Moving packets 的大小都帶 p-factor；它們無法拼出一個不被 p 整除的總數。'
                : '對。留下的 residue 必須由 fixed cosets 承擔。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Coset fixed-point magnet</p>
            <h3>換一個 H；觀察哪個 coset 停住，以及它指向哪個 Sylow subgroup</h3>
          </div>
          <p>FIXED 使用雙框與實線連接；MOVING 使用虛線與文字，判讀不只依靠顏色。</p>
        </div>
        <div class="magnet-tabs" role="group" aria-label="選擇作用在 coset world 的 p-subgroup H">
          @for (option of options; track option.label; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="optionIndex() === i"
              (click)="optionIndex.set(i)"
            >
              {{ option.label }}<small>{{ option.note }}</small>
            </button>
          }
        </div>
        <div class="stage magnet-stage">
          <section class="h-source">
            <span>ACTING SUBGROUP H</span>
            <b>|H|={{ active().subgroup.length }}</b>
            <small>{{ summary(active().subgroup) }}</small>
          </section>
          <div class="magnet-arrow" aria-hidden="true">H ↷ G/P</div>
          <section class="coset-world" aria-live="polite">
            @for (entry of entries(); track entry.coset.key; let i = $index) {
              <article [class.fixed]="entry.fixed">
                <header>
                  <span>COSET {{ i + 1 }}</span
                  ><b>{{ entry.fixed ? 'FIXED' : 'MOVING' }}</b>
                </header>
                <strong>g{{ i + 1 }}P</strong>
                <small>{{ entry.coset.label }}</small>
                <i>{{ entry.fixed ? '━━ locks onto ━━' : '┄ joins a moving orbit ┄' }}</i>
                <footer>
                  {{
                    entry.fixed
                      ? active().label + ' ≤ ' + pointName(entry.targetIndex)
                      : 'no inclusion decoded'
                  }}
                </footer>
              </article>
            }
          </section>
          <section class="magnet-readout">
            <div><span>COSETS</span><b>3</b><small>|S₄:P|</small></div>
            <div>
              <span>FIXED</span><b>{{ fixedEntries().length }}</b
              ><small>residue 1 mod 2</small>
            </div>
            <div>
              <span>CONTAINMENT</span><b>{{ containmentLabel() }}</b
              ><small>fixed coset decoded</small>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>fixed gP</span><i>decode</i><span>H ≤ gPg⁻¹</span>
        </div>
        <p>
          <strong>Fixed coset 是一張 subgroup containment 證書。</strong>
          若 H 自己已是 Sylow，兩邊大小相同，containment 立刻升級成 equality；所以所有 Sylows
          都落在同一 conjugation orbit。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 H 與 gPg⁻¹ 都是 order pⁿ，而且 H≤gPg⁻¹，還可能是 proper containment 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">
            不能；有限集合大小相同，所以相等
          </button>
          <button type="button" (click)="transfer.set(true)">可以；conjugate 只保證相似</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? 'Proper subset 必須少掉至少一個 element，不能與母集合有相同有限大小。'
                : '對。這一步把「每個 p-subgroup 被吸收」提升為 Sylow subgroups 彼此 conjugate。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Fixed coset 為什麼等價於 H≤gPg⁻¹？</summary>
          <div>
            H 固定 left coset gP，表示對每個 h∈H 都有 hgP=gP；等價於 g⁻¹hg∈P。因此 g⁻¹Hg≤P，也就是
            H≤gPg⁻¹。因 |G:P| 不被 p 整除，H 在 G/P 上的 orbit partition 必有 fixed point。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CosetFixedMagnetComponent {
  readonly options = MAGNET_ACTORS;
  readonly optionIndex = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly active = computed(() => this.options[this.optionIndex()]);
  readonly entries = computed(() => magnetCosets(this.active().subgroup, S4_P8, S4_SYLOW_2_POINTS));
  readonly fixedEntries = computed(() => this.entries().filter((entry) => entry.fixed));
  readonly containmentLabel = computed(() => {
    const fixed = this.fixedEntries()[0];
    return fixed ? `${this.active().label} ≤ ${this.pointName(fixed.targetIndex)}` : 'none';
  });

  pointName(index: number): string {
    return index >= 0 ? S4_SYLOW_2_POINTS[index].id : 'conjugate P';
  }

  summary = subgroupSummary;
}
