import { Component, computed, signal } from '@angular/core';
import { conjugate, D3_ELEMENTS, D3Element, label, setLabel } from './d3-model';

interface Candidate { id: string; label: string; members: D3Element[]; }

@Component({
  selector: 'app-algebra-v3-normality-scanner',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch16-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 16.3</p><h2>Normality 是全座標條件：一個 escape 足以否決，完整 scan 才能通過</h2><p class="lede">對 finite D₃，可把每個 g∈G 與 h∈H 的 ghg⁻¹ 全部掃過。這不是抽查 subgroup closure，而是在測外部座標改寫會不會把 H 的差異丟出去。</p></header>

      <section class="prediction"><p class="kicker">先判斷</p><h3>只測 g=e 時所有 h 都留在 H，足以證明 H normal 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不足以</button><button type="button" (click)="prediction.set(true)">足以</button></div>@if (prediction() !== null) {<p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'ehe⁻¹=h 對任何 subgroup 都自動成立，沒有測到外部座標。' : '對。Normality 的 g 必須跑遍整個 G。' }}</p>}</section>

      <section class="lab"><div class="lab-heading"><div><p class="kicker">Finite normality scanner</p><h3>逐格 reveal conjugate，直到完成或找到 ESCAPED witness</h3></div><p>每格顯示結果 element 與 STAYS／ESCAPED；column 數隨 subgroup 改變。</p></div>
        <div class="normal-picker" role="group" aria-label="選擇 candidate subgroup">@for (candidate of candidates; track candidate.id) {<button type="button" [attr.aria-pressed]="candidateId() === candidate.id" (click)="select(candidate.id)">{{ candidate.label }}</button>}</div>
        <div class="stage normal-stage">
          <section class="normal-matrix" role="grid" aria-label="所有 conjugation pairs 的 normality scan" [style.--member-count]="candidate().members.length"><span>g\h</span>@for (h of candidate().members; track h) {<b>{{ label(h) }}</b>}@for (g of elements; track g) {<b>{{ label(g) }}</b>@for (h of candidate().members; track h) {<button type="button" [class.locked]="!isRevealed(g,h)" [class.escaped]="isRevealed(g,h) && !stays(g,h)" (click)="inspect(g,h)"><strong>{{ cellLabel(g,h) }}</strong><small>{{ cellStatus(g,h) }}</small></button>}}</section>
          <section class="normal-console" aria-live="polite"><p class="kicker">SCANNED {{ revealed() }} / {{ totalCells() }}</p><div class="conjugate-readout"><span>{{ label(selectedG()) }} · {{ label(selectedH()) }} · {{ inverseLabel(selectedG()) }}</span><strong>{{ label(result()) }}</strong><small>{{ stays(selectedG(), selectedH()) ? 'STAYS IN H' : 'ESCAPED H' }}</small></div><div class="map-verdict" [class.fail]="isComplete() && !allStay()">{{ verdict() }}</div><div class="control-row"><button type="button" class="primary" [disabled]="isComplete()" (click)="scanNext()">Scan next</button><button type="button" (click)="scanAll()">Scan all</button><button type="button" (click)="reset()">重設</button></div><p>{{ scopeReading() }}</p></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>one ESCAPED</span><i>refutes</i><span>all STAYS</span><i>finite proof</i></div><p><strong>Normality 不是「看起來對稱」；它量化所有 g∈G 與 h∈H。</strong>Finite scanner 把這個 universal scope 直接攤開。</p></aside>

      <section class="transfer"><p class="kicker">遷移</p><h3>Subgroup index [G:H]=2 時，H 一定 normal 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">一定</button><button type="button" (click)="transfer.set(false)">不一定</button></div>@if (transfer() !== null) {<p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。只有 H 與另一個 coset；任一 g∉H 的 left/right coset 都只能是同一個 complement。' : 'Index 2 迫使左右各自唯一的非 H coset 對齊。' }}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>Normal subgroup</summary><div>H≤G 若對所有 g∈G 有 gHg⁻¹=H，稱 H normal in G，寫作 H◁G。因 conjugation 是 bijection，只證 gHg⁻¹⊆H 已足夠。</div></details><details><summary>Scanner 的 finite proof scope</summary><div>本頁完整列出 |G||H| 個 pairs，因此 ALL STAYS 是 exhaustive verification。Infinite group 仍需 general argument，不能靠有限 samples。</div></details></section>
    </article>
  `,
})
export class AlgebraV3NormalityScannerComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly candidateId = signal('rotations');
  readonly revealed = signal(0);
  readonly selectedG = signal<D3Element>(0);
  readonly selectedH = signal<D3Element>(0);
  readonly elements = D3_ELEMENTS;
  readonly candidates: Candidate[] = [
    { id: 'rotations', label: 'R={e,r,r²}', members: [0, 1, 2] },
    { id: 'mirror-s', label: 'M={e,s}', members: [0, 3] },
    { id: 'trivial', label: '{e}', members: [0] },
    { id: 'whole', label: 'D₃', members: [0, 1, 2, 3, 4, 5] },
  ];
  readonly candidate = computed(() => this.candidates.find((item) => item.id === this.candidateId()) ?? this.candidates[0]);
  readonly result = computed(() => conjugate(this.selectedG(), this.selectedH()));
  label = label;
  totalCells(): number { return 6 * this.candidate().members.length; }
  cellIndex(g: D3Element, h: D3Element): number { return g * this.candidate().members.length + this.candidate().members.indexOf(h); }
  isRevealed(g: D3Element, h: D3Element): boolean { return this.cellIndex(g, h) < this.revealed(); }
  stays(g: D3Element, h: D3Element): boolean { return this.candidate().members.includes(conjugate(g, h)); }
  cellLabel(g: D3Element, h: D3Element): string { return this.isRevealed(g, h) ? label(conjugate(g, h)) : '?'; }
  cellStatus(g: D3Element, h: D3Element): string { return this.isRevealed(g, h) ? (this.stays(g, h) ? 'STAYS' : 'ESCAPED') : 'LOCKED'; }
  isComplete(): boolean { return this.revealed() === this.totalCells(); }
  allStay(): boolean { return this.elements.every((g) => this.candidate().members.every((h) => this.stays(g, h))); }
  inspect(g: D3Element, h: D3Element): void { this.selectedG.set(g); this.selectedH.set(h); this.revealed.update((value) => Math.max(value, this.cellIndex(g, h) + 1)); }
  scanNext(): void { const index = this.revealed(); const width = this.candidate().members.length; const g = Math.floor(index / width) as D3Element; const h = this.candidate().members[index % width]; this.selectedG.set(g); this.selectedH.set(h); this.revealed.update((value) => Math.min(this.totalCells(), value + 1)); }
  scanAll(): void { this.revealed.set(this.totalCells()); const witness = this.elements.flatMap((g) => this.candidate().members.map((h) => [g, h] as const)).find(([g, h]) => !this.stays(g, h)); if (witness) { this.selectedG.set(witness[0]); this.selectedH.set(witness[1]); } }
  reset(): void { this.revealed.set(0); this.selectedG.set(0); this.selectedH.set(this.candidate().members[0]); }
  select(id: string): void { this.candidateId.set(id); this.reset(); }
  verdict(): string { if (!this.isComplete()) return '… UNIVERSAL CLAIM NOT YET CHECKED'; return this.allStay() ? '✓ ALL CONJUGATES STAY · NORMAL' : '× ESCAPED WITNESS · NOT NORMAL'; }
  scopeReading(): string { if (!this.isComplete()) return '目前 STAYS cells 只是 samples；尚未涵蓋所有 coordinates。'; return this.allStay() ? `${setLabel(this.candidate().members)} 通過完整 finite conjugation scan。` : '一個 conjugate 跑出 H，已足以否決 normality。'; }
  inverseLabel(g: D3Element): string { const labels: Record<D3Element, string> = { 0: 'e', 1: 'r²', 2: 'r', 3: 's', 4: 'rs', 5: 'r²s' }; return labels[g]; }
}
