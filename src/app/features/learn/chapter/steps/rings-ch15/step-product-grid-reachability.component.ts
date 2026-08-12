import { Component, computed, signal } from '@angular/core';
import { CH15_RESIDUES, CoordinateAddress, IDEAL_H, IDEAL_I, IDEAL_J, PairMode, address, addressKey, addressLabel, coordinateGrid, reachableAddresses, representativeFor, sumIdeal } from './rings-ch15-model';

@Component({
  selector: 'app-rings-ch15-product-grid-reachability',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 15.3</p><h2>Kernel 控制忘掉什麼；I+J 控制兩邊 outputs 能否自由組合</h2><p class="lede">Product target 會列出所有形式上的 coordinate pairs，但它們不一定都有 ambient preimage。切換兩組 ideals、指定一個 socket，讓 reachability scanner 尋找能同時滿足兩邊 outputs 的 card。</p></header>
      <span class="map-convention">REACHABILITY GATE · Φ IS ONTO R/I×R/J IFF I+J=R</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>若第二個 ideal 是 (4)⊆(2)，parity 0 能否和 mod-4 output 1 任意搭配？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不能；兩個 coordinates 必須相容</button><button type="button" (click)="prediction.set(true)">能；product 的每格都是合法 output</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()">{{ prediction() ? 'Product target 允許寫出一格，不代表原 map 能抵達；實際搜尋 (0,1)。' : '對；mod-4 output 已決定 parity，兩邊不是獨立 controls。' }}</p> }</section>

      <div class="control-row"><span class="kicker">IDEAL PAIR</span><button type="button" [class.active]="mode()==='nested'" (click)="selectMode('nested')">I=(2), H=(4) · NESTED</button><button type="button" [class.active]="mode()==='comaximal'" (click)="selectMode('comaximal')">I=(2), J=(3) · COMAXIMAL</button><button type="button" (click)="attempt()">FIND PREIMAGE FOR SELECTED SOCKET</button><button type="button" (click)="scanAll()">SCAN WHOLE PRODUCT GRID</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid"><div class="reachability-lab">
        <section class="ideal-control-panel"><div class="ideal-control"><small>FIRST ZERO REGION</small><strong>I=(2)</strong><span>{{ set(IDEAL_I) }}</span></div><div class="sum-mixer"><span>+</span><strong>SUM IDEAL</strong><small>{{ sumName() }}</small></div><div class="ideal-control"><small>SECOND ZERO REGION</small><strong>{{ secondIdealName() }}</strong><span>{{ set(secondIdeal()) }}</span></div><div class="sum-result" [class.whole]="isComaximal()"><small>AVAILABLE CORRECTIONS</small><strong>{{ sumName() }}={{ set(sumSet()) }}</strong><span>{{ isComaximal() ? 'WHOLE R · INDEPENDENT CONTROLS' : 'PROPER IDEAL · COORDINATES LINKED' }}</span></div></section>

        <section class="target-grid-panel"><div class="tray-heading"><p class="kicker">FORMAL PRODUCT TARGET · 2×{{ secondModulus() }}</p><strong>select one socket</strong></div><div class="reachability-grid" [class.four-columns]="secondModulus()===4">@for (socket of grid(); track socketKey(socket)) { <button type="button" [class.selected]="socketKey(socket)===socketKey(selectedSocket())" [class.reachable]="socketTested(socket) && socketReachable(socket)" [class.unreachable]="socketTested(socket) && !socketReachable(socket)" (click)="selectSocket(socket)"><small>COORDINATE</small><strong>{{ socketLabel(socket) }}</strong><span>{{ socketStatus(socket) }}</span></button> }</div></section>

        <section class="preimage-scanner"><div class="scanner-target"><small>REQUESTED OUTPUT</small><strong>{{ socketLabel(selectedSocket()) }}</strong><span>mod 2 · mod {{ secondModulus() }}</span></div><div class="scanner-beam"><span>←</span><strong>SEARCH x∈ℤ/12ℤ</strong><small>{{ attempted() ? '12 cards audited' : 'not started' }}</small></div><div class="scanner-result" [class.found]="attempted() && selectedRepresentative()!==null" [class.missing]="attempted() && selectedRepresentative()===null"><small>AMBIENT PREIMAGE</small><strong>{{ attempted() ? (selectedRepresentative()===null ? 'NONE' : 'x='+selectedRepresentative()) : '?' }}</strong><span>{{ attempted() ? compatibilityReading() : 'waiting' }}</span></div></section>

        <section class="reachability-meter"><div><small>FORMAL TARGET SOCKETS</small><strong>{{ grid().length }}</strong></div><span>→</span><div><small>ACTUALLY REACHABLE</small><strong>{{ scanned() ? reachable().length : '?' }}</strong></div><span>{{ scanned() ? (isComaximal() ? '=' : '<') : '?' }}</span><div><small>ONTO?</small><strong>{{ scanned() ? (isComaximal() ? 'YES' : 'NO') : '?' }}</strong></div></section>
      </div><aside class="console" aria-live="polite"><span class="evidence-badge">{{ scanned() ? 'WHOLE-GRID AUDIT' : 'TARGET SOCKET SCANNER' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">I+{{ mode()==='comaximal' ? 'J' : 'H' }}={{ sumName() }} · image keeps {{ scanned() ? reachable().length : '?' }}/{{ grid().length }} product sockets</div></aside></section>

      @if (scanned()) { <section class="transfer-strip"><div><p class="kicker">{{ isComaximal() ? 'SURJECTIVE PRODUCT MAP' : 'COMPATIBILITY RESTRICTION' }}</p><strong>{{ isComaximal() ? 'I+J=R · every pair is reachable' : 'I+H=I≠R · only parity-compatible pairs survive' }}</strong></div><p>{{ isComaximal() ? '兩個 ideals 合起來能做出任何 ambient correction，因此可獨立調整兩個 quotient coordinates。' : '第二個 coordinate 已暗含第一個 coordinate；product target 的另外四格只是形式上存在，沒有 preimage。' }}</p></section> }
      <section class="insight"><span class="insight-icon">I+J</span><div><strong>Intersection 描述共同遺忘；sum 描述兩張 views 是否真正互補</strong><span>I+J=R 時可獨立指定兩個 coordinates，paired map 填滿 product；若 sum 仍是 proper ideal，outputs 之間就存在 compatibility constraint。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 15.4</strong><p>當 I+J=R，六個 coordinate pairs 都有唯一的 R/(I∩J) input；能否直接從兩個 coordinates 重建 quotient element，並保留兩種 operations？</p></div>
      <details><summary>正式層：為什麼 I+J=R 等價於 surjective？</summary><p>若 I+J=R，可寫 1=i+j。給定 a+I、b+J，元素 x=b i+a j 同時滿足 x≡a mod I、x≡b mod J，所以任意 pair 可達。反過來，若 (0+I,1+J) 可達，某 x∈I 且 x−1∈J，故 1=x−(x−1)∈I+J。</p></details>
    </article>
  `,
})
export class RingsCh15ProductGridReachabilityComponent {
  readonly IDEAL_I = IDEAL_I;
  readonly mode = signal<PairMode>('nested');
  readonly selectedSocket = signal<CoordinateAddress>({ mod2: 0, second: 1 });
  readonly attempted = signal(false);
  readonly scanned = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly grid = computed(() => coordinateGrid(this.mode()));
  readonly reachable = computed(() => reachableAddresses(this.mode()));
  readonly secondIdeal = computed(() => this.mode() === 'comaximal' ? IDEAL_J : IDEAL_H);
  readonly sumSet = computed(() => sumIdeal(IDEAL_I, this.secondIdeal()));
  readonly selectedRepresentative = computed(() => representativeFor(this.selectedSocket(), this.mode()));
  readonly isComaximal = computed(() => this.sumSet().length === 12);
  readonly verdictTitle = computed(() => this.scanned() ? this.isComaximal() ? 'EVERY PRODUCT SOCKET HAS A PREIMAGE' : 'FORMAL PRODUCT IS LARGER THAN THE IMAGE' : this.attempted() ? this.selectedRepresentative() === null ? 'SOCKET BLOCKED · COORDINATES CONFLICT' : 'SOCKET REACHED · PREIMAGE FOUND' : 'CHOOSE A TARGET PAIR · THEN ASK IF IT IS REACHABLE');
  readonly verdictReading = computed(() => this.scanned() ? this.isComaximal() ? '六個 coordinate pairs 全部被填滿；兩張 quotient views 是獨立 controls。' : '八格中只有四格有 preimage；mod-4 output 的 parity 必須等於第一 coordinate。' : this.attempted() ? this.compatibilityReading() : 'Target grid 展示形式上可能的 pairs；scanner 才判斷它們是否真在 image 裡。');

  secondModulus(): number { return this.mode() === 'comaximal' ? 3 : 4; }
  secondIdealName(): string { return this.mode() === 'comaximal' ? 'J=(3)' : 'H=(4)'; }
  sumName(): string { return this.isComaximal() ? 'R' : 'I'; }
  set(values: readonly number[]): string { return `{${values.join(',')}}`; }
  socketKey(socket: CoordinateAddress): string { return addressKey(socket); }
  socketLabel(socket: CoordinateAddress): string { return addressLabel(socket); }
  socketReachable(socket: CoordinateAddress): boolean { return representativeFor(socket, this.mode()) !== null; }
  socketTested(socket: CoordinateAddress): boolean {
    return this.scanned() || (this.attempted() && this.socketKey(socket) === this.socketKey(this.selectedSocket()));
  }
  socketStatus(socket: CoordinateAddress): string { if (!this.socketTested(socket)) return 'UNTESTED'; const rep = representativeFor(socket, this.mode()); return rep === null ? '× NO PREIMAGE' : `✓ x=${rep}`; }
  compatibilityReading(): string { const rep = this.selectedRepresentative(); if (rep !== null) return `${this.socketLabel(this.selectedSocket())} is realized by x=${rep}.`; return `${this.selectedSocket().mod2}≠${this.selectedSocket().second % 2}: parity conflicts with mod-4 output.`; }
  selectSocket(socket: CoordinateAddress): void { this.selectedSocket.set(socket); this.attempted.set(false); }
  selectMode(mode: PairMode): void { this.mode.set(mode); this.selectedSocket.set({ mod2: 0, second: 1 }); this.attempted.set(false); this.scanned.set(false); }
  attempt(): void { this.attempted.set(true); }
  scanAll(): void { this.attempted.set(true); this.scanned.set(true); }
  reset(): void { this.mode.set('nested'); this.selectedSocket.set({ mod2: 0, second: 1 }); this.attempted.set(false); this.scanned.set(false); this.prediction.set(null); }
}
