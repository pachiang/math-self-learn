import { Component, computed, signal } from '@angular/core';

type WorldId = 'evenAdd' | 'positiveSubtract' | 'z3Add';
interface WorldModel { id: WorldId; label: string; note: string; values: readonly number[]; finite: boolean; operation: string; calculate: (a: number, b: number) => number; belongs: (value: number) => boolean; }

const WORLDS: readonly WorldModel[] = [
  { id: 'evenAdd', label: '2ℤ under +', note: 'infinite world · visible window only', values: [-4, -2, 0, 2, 4], finite: false, operation: '+', calculate: (a,b) => a+b, belongs: (value) => value % 2 === 0 },
  { id: 'positiveSubtract', label: 'ℤ₊ under −', note: 'infinite world · contains escapes', values: [1,2,3,4,5], finite: false, operation: '−', calculate: (a,b) => a-b, belongs: (value) => Number.isInteger(value) && value > 0 },
  { id: 'z3Add', label: 'ℤ₃ under + mod 3', note: 'finite world · table is complete', values: [0,1,2], finite: true, operation: '+₃', calculate: (a,b) => ((a+b)%3+3)%3, belongs: (value) => [0,1,2].includes(value) },
];

@Component({ selector: 'app-algebra-v3-evidence-scanner', standalone: true, template: `
  <article class="algebra-v3-lesson alg-ch5-lesson">
    <header class="hero"><p class="eyebrow">Abstract Algebra · 5.3</p><h2>Closure 是全域承諾，不是抽樣印象</h2><p class="lede">「每一對 inputs 都留在 set」是一個 universal statement。成功 examples 只能累積線索；一個 escape 立即推翻；只有有限世界的完整 table 才能用窮舉封住所有 pairs。</p></header>

    <section class="prediction"><p class="kicker">先判斷證據夠不夠</p><h3>測試 100 組 positive integers 的 subtraction 都是正數，足以證明 closure 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不足</button><button type="button" (click)="prediction.set(true)">足夠</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '無限多 pairs 中仍可能藏著 2−5；sample size 變大不會自動變成 universal proof。' : '對。成功抽樣是線索；proof 需要 general reason 或真正 exhaustive scope。' }}</p> }</section>

    <section class="lab">
      <div class="lab-heading"><div><p class="kicker">Evidence scanner</p><h3>同樣 reveal cells，結論由 universe scope 決定</h3></div><p>每個 cell 是一對 inputs。你可以逐格揭露或掃描整個 visible table；系統會區分「visible window」與「complete finite universe」。</p></div>
      <div class="world-picker" role="group" aria-label="選擇 closure evidence world">@for (world of worlds; track world.id) { <button type="button" [attr.aria-pressed]="selectedWorld() === world.id" (click)="selectWorld(world.id)"><strong>{{ world.label }}</strong><span>{{ world.note }}</span></button> }</div>
      <div class="control-row"><button type="button" (click)="revealNext()" [disabled]="revealed().size === totalCells()">揭露下一格</button><button type="button" class="primary" (click)="scanVisible()" [disabled]="revealed().size === totalCells()">掃描全部 visible cells</button><button type="button" (click)="clear()" [disabled]="revealed().size === 0">清空</button></div>

      <div class="stage scan-layout">
        <table class="evidence-table"><caption class="sr-only">{{ current().label }} 的 input pair 掃描表</caption><thead><tr><th>{{ current().operation }}</th>@for (column of current().values; track column) { <th scope="col">{{ column }}</th> }</tr></thead><tbody>
          @for (row of current().values; track row) { <tr><th scope="row">{{ row }}</th>@for (column of current().values; track column) { <td><button type="button" (click)="reveal(row,column)" [class.inside]="isRevealed(row,column) && cell(row,column).inside" [class.outside]="isRevealed(row,column) && !cell(row,column).inside" [attr.aria-label]="cellLabel(row,column)">{{ isRevealed(row,column) ? (cell(row,column).inside ? '✓ ' : '× ') + cell(row,column).output : '?' }}</button></td> }</tr> }
        </tbody></table>
        <section class="evidence-panel" aria-live="polite"><h4>EVIDENCE LEDGER</h4><div class="scope-meter"><div><span>universe</span><strong>{{ current().finite ? 'FINITE' : 'INFINITE' }}</strong></div><div><span>revealed</span><strong>{{ revealed().size }} / {{ totalCells() }} visible</strong></div></div><div class="evidence-status" [class.refuted]="hasEscape()">{{ status() }}</div><p>{{ scopeReading() }}</p></section>
      </div>
    </section>

    <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>all pairs</span><i>must</i><span>stay inside</span><i>but</i><span>one escape refutes</span></div><p><strong>Universal claim 的 proof 與 refutation 天生不對稱。</strong>證明要涵蓋所有 pairs；推翻只需存在一對。有限 table 全掃是 exhaustive check，無限 table 的 viewport 永遠只是 sample。</p></aside>

    <section class="transfer"><p class="kicker">把量詞帶回順序</p><h3>要推翻「所有 rotations 都 commute」，找到一對 rotations 的兩種順序不同就足夠嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">足夠</button><button type="button" (click)="transfer.set(false)">不足</button></div>@if (transfer() !== null) { <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。一個 explicit counterexample 就能推翻「所有 pairs」。' : '全稱敘述的否定正是「存在一對失敗」。' }}</p> }</section>

    <section class="secondary"><p>SECONDARY LAYER</p><details><summary>正式量詞與否定</summary><div>Closure：∀a,b∈G，a◇b∈G。它的否定是 ∃a,b∈G，使 a◇b∉G。這解釋了為何 proof 要處理 arbitrary pair，而 counterexample 只需一對。</div></details><details><summary>Proof Lab：even integers 對 addition closed</summary><div>任取 even a、b，寫 a=2m、b=2n，其中 m,n∈ℤ。則 a+b=2(m+n)，而 m+n 仍是 integer，因此 a+b 是 even。這段 representation 一次涵蓋無限多 input pairs。</div></details></section>
  </article>
` })
export class AlgebraV3EvidenceScannerComponent {
  readonly prediction = signal<boolean | null>(null); readonly transfer = signal<boolean | null>(null);
  readonly selectedWorld = signal<WorldId>('evenAdd'); readonly revealed = signal<ReadonlySet<string>>(new Set()); readonly worlds = WORLDS;
  readonly current = computed(() => WORLDS.find((world) => world.id === this.selectedWorld()) ?? WORLDS[0]);
  readonly totalCells = computed(() => this.current().values.length ** 2);
  readonly hasEscape = computed(() => [...this.revealed()].some((key) => { const [a,b]=key.split(':').map(Number); return !this.cell(a,b).inside; }));
  readonly status = computed(() => {
    if (this.revealed().size === 0) return '○ NO EVIDENCE YET — 尚未檢查任何 pair';
    if (this.hasEscape()) return '× REFUTED — 已找到合法 inputs 產生 set 外 output';
    if (this.current().finite && this.revealed().size === this.totalCells()) return '✓ PROVED BY EXHAUSTION — finite universe 的所有 pairs 已檢查';
    if (!this.current().finite && this.revealed().size === this.totalCells()) return '○ VIEWPORT EXHAUSTED, UNIVERSE NOT — 全部可見 cells 仍只是 infinite world 的 sample';
    return '○ POSITIVE SAMPLES ONLY — 尚未涵蓋所有 pairs';
  });
  readonly scopeReading = computed(() => this.current().finite ? '這張 table 就是 entire input universe；全揭露後可完成 closure check。' : '這張 table 只是 infinite set 的有限 viewport；即使全部成功，仍需要 general proof。');
  selectWorld(world: WorldId): void { this.selectedWorld.set(world); this.clear(); }
  reveal(a:number,b:number): void { this.revealed.update((values)=>new Set([...values,this.key(a,b)])); }
  revealNext(): void { for (const a of this.current().values) for (const b of this.current().values) if (!this.isRevealed(a,b)) { this.reveal(a,b); return; } }
  scanVisible(): void { this.revealed.set(new Set(this.current().values.flatMap((a)=>this.current().values.map((b)=>this.key(a,b))))); }
  clear(): void { this.revealed.set(new Set()); }
  isRevealed(a:number,b:number): boolean { return this.revealed().has(this.key(a,b)); }
  cell(a:number,b:number) { const output=this.current().calculate(a,b); return {output,inside:this.current().belongs(output)}; }
  cellLabel(a:number,b:number): string { const item=this.cell(a,b); return `${a} ${this.current().operation} ${b}${this.isRevealed(a,b)?` equals ${item.output}, ${item.inside?'inside':'outside'}`:', hidden'}`; }
  private key(a:number,b:number): string { return `${a}:${b}`; }
}
