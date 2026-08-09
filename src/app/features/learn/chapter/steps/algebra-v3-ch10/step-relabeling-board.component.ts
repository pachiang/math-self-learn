import { Component, computed, signal } from '@angular/core';

type LabelMode = 'angles' | 'roots' | 'collision';

@Component({
  selector: 'app-algebra-v3-relabeling-board',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch10-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 10.1</p>
        <h2>先把外表拿掉：名字換了，關係可以完全沒變</h2>
        <p class="lede">ℤ₄ 的 0、1、2、3 與四次方根的 1、i、−1、−i 看起來毫不相干。先別急著談公式；把兩邊逐點配對，再看「下一步」的箭頭是否仍接成同一個 cycle。</p>
      </header>

      <section class="prediction">
        <p class="kicker">先判斷</p>
        <h3>如果把每個 element 都換成新名字，group 的結構一定改變嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不一定</button>
          <button type="button" (click)="prediction.set(true)">一定改變</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '名字只是標籤。真正要檢查的是 operation 形成的關係網，而不是符號長相。' : '對。只要配對不合併、不漏掉，而且 operation 的箭頭也跟著對上，就可能只是同一結構的另一套名字。' }}</p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Relabeling board</p><h3>沿著 +1 走，看兩套標籤是否同步</h3></div>
          <p>選一張翻譯表，再逐步前進。上排永遠走 0→1→2→3；下排顯示相同位置被叫成什麼。</p>
        </div>
        <div class="mode-picker" role="group" aria-label="選擇翻譯表">
          <button type="button" [attr.aria-pressed]="mode()==='angles'" (click)="setMode('angles')">角度標籤</button>
          <button type="button" [attr.aria-pressed]="mode()==='roots'" (click)="setMode('roots')">四次方根</button>
          <button type="button" [attr.aria-pressed]="mode()==='collision'" (click)="setMode('collision')">故意撞名</button>
        </div>
        <div class="stage mapping-layout">
          <div class="mapping-rows" aria-label="元素翻譯表">
            @for (source of sources; track source; let index = $index) {
              <div class="mapping-row" [class.active]="step()===index" [class.collision]="isDuplicate(index)">
                <span class="source-node">{{ source }}</span><span class="map-arrow" aria-hidden="true">⟶</span><span class="target-node">{{ labels()[index] }}</span>
                <small>{{ step()===index ? 'CURRENT POSITION' : isDuplicate(index) ? 'DUPLICATE TARGET' : 'ONE-TO-ONE SLOT' }}</small>
              </div>
            }
          </div>
          <section class="map-console" aria-live="polite">
            <p class="kicker">SYNC PLAYER</p>
            <div class="path-sync"><span>ℤ₄: {{ step() }}</span><b>same slot</b><span>target: {{ labels()[step()] }}</span></div>
            <div class="control-row"><button type="button" class="primary" (click)="advance()">走一步 +1</button><button type="button" (click)="step.set(0)">回到起點</button></div>
            <div class="translation-verdict" [class.fail]="!bijective()">{{ bijective() ? '✓ 每個位置都有唯一新名字：翻譯沒有合併或遺漏' : '× 兩個來源撞到同一名字：翻譯已經丟失資訊' }}</div>
            <p>{{ bijective() ? '這是 bijection 的視覺模型；它只通過「無損配對」這一關，還沒證明 operation 被保留。' : '一旦兩個 elements 被壓成同一個 target，就不可能再從 target 唯一翻回來。' }}</p>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>old labels</span><i>↔</i><span>new labels</span></div>
        <p><strong>結構不住在 element 的名字裡。</strong>Bijection 讓我們安全地換標籤，不合併也不漏掉；下一頁才檢查最關鍵的一件事：operation 是否也被原封不動搬過去。</p>
      </aside>

      <section class="transfer">
        <p class="kicker">邊界檢查</p><h3>兩個 sets 都有四個 elements，就足以說它們是同一個 group 結構嗎？</h3>
        <div class="choice-row"><button type="button" (click)="transfer.set(false)">不足以</button><button type="button" (click)="transfer.set(true)">足以</button></div>
        @if (transfer() !== null) { <p class="feedback" [class.warning]="transfer()">{{ transfer() ? '相同大小只保證有 bijection；不同 operation 仍可能形成不同關係網。' : '對。相同 cardinality 只是第一關，還必須讓 operation commute。' }}</p> }
      </section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Bijection 的正式角色</summary><div>Map φ:G→H 若同時 injective 與 surjective，就是 bijection。它保證每個 target 恰有一個 source，因此 φ⁻¹ 存在；但 bijection 本身不涉及 group operation。</div></details><details><summary>為什麼這頁還不叫 isomorphism？</summary><div>因為我們尚未檢查 φ(ab)=φ(a)φ(b)。一張完美的一對一名冊仍可能把 operation table 的關係打亂。</div></details></section>
    </article>
  `,
})
export class AlgebraV3RelabelingBoardComponent {
  readonly sources = ['0', '1', '2', '3'];
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly mode = signal<LabelMode>('roots');
  readonly step = signal(0);
  readonly labels = computed(() => ({
    angles: ['0°', '90°', '180°', '270°'],
    roots: ['1', 'i', '−1', '−i'],
    collision: ['1', 'i', '−1', '1'],
  })[this.mode()]);
  readonly bijective = computed(() => new Set(this.labels()).size === this.sources.length);

  setMode(mode: LabelMode): void { this.mode.set(mode); this.step.set(0); }
  advance(): void { this.step.update(value => (value + 1) % 4); }
  isDuplicate(index: number): boolean {
    return this.labels().indexOf(this.labels()[index]) !== index;
  }
}
