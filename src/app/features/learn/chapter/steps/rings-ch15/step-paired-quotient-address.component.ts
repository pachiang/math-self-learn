import { Component, computed, signal } from '@angular/core';
import { CH15_RESIDUES, CoordinateAddress, address, addressKey, addressLabel, addressFiber } from './rings-ch15-model';

@Component({
  selector: 'app-rings-ch15-paired-quotient-address',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 15.1</p><h2>一張 quotient 只看一個方向；兩張 views 合起來形成座標</h2><p class="lede">固定 R=ℤ/12ℤ、I=(2)、J=(3)。把同一張 ambient card 同時送往 R/I 與 R/J；左右兩個 outputs 合起來，不再只是兩個答案，而是一個 product-grid address。</p></header>
      <span class="map-convention">PAIRED READER · Φ(x)=(x+I,x+J) · R→R/I×R/J</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>0 與 6 在 parity view 和 mod-3 view 都相同嗎？它們會落進同一格嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(true)">會；兩邊 outputs 都相同</button><button type="button" (click)="prediction.set(false)">不會；ambient cards 不同</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '先保留判斷；用兩條 output wires 同時驗證。' : 'Product address 比 ambient identity 粗；兩張 cards 仍可能共用同一對 outputs。' }}</p> }</section>

      <div class="control-row"><span class="kicker">AMBIENT x</span>@for (value of residues; track value) { <button type="button" [class.active]="selected()===value" (click)="selected.set(value)">{{ value }}</button> }<button type="button" (click)="routeSelected()">SEND TO BOTH VIEWS</button><button type="button" (click)="routeNext()">SEND NEXT UNTRACED</button><button type="button" (click)="routeAll()">FILL WHOLE ADDRESS GRID</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid"><div class="paired-address-lab">
        <section class="paired-source"><div class="tray-heading"><p class="kicker">AMBIENT R · 12 CARDS</p><strong>{{ routed().length }}/12 routed</strong></div><div class="crt-ambient-grid">@for (value of residues; track value) { <button type="button" [class.selected]="selected()===value" [class.routed]="isRouted(value)" (click)="selected.set(value)"><strong>{{ value }}</strong><small>{{ isRouted(value) ? addressText(value) : 'ambient' }}</small></button> }</div></section>

        <section class="paired-reader-machine"><div class="reader-branch"><span>πᵢ</span><strong>R/I</strong><small>parity output</small><b>{{ currentRouted() ? currentAddress().mod2 : '?' }}</b></div><div class="source-port"><small>INPUT</small><strong>{{ selected() }}</strong><span>Φ</span></div><div class="reader-branch"><span>πⱼ</span><strong>R/J</strong><small>mod-3 output</small><b>{{ currentRouted() ? currentAddress().second : '?' }}</b></div></section>

        <section class="coordinate-board"><div class="tray-heading"><p class="kicker">PRODUCT ADDRESS GRID · 2×3</p><strong>row=mod 2 · column=mod 3</strong></div><div class="coordinate-column-labels"><span></span><strong>0</strong><strong>1</strong><strong>2</strong></div>@for (row of rows; track row) { <div class="coordinate-row"><strong class="row-label">{{ row }}</strong>@for (column of columns; track column) { <div class="address-socket" [class.current]="currentRouted() && currentAddress().mod2===row && currentAddress().second===column" [class.complete]="socketComplete(row,column)"><small>ADDRESS ({{ row }},{{ column }})</small><span>@for (value of socketMembers(row,column); track value) { <i [class.arrived]="isRouted(value)">{{ isRouted(value) ? value : '?' }}</i> }</span></div> }</div> }</section>

        <section class="address-certificate"><div><small>ONE VIEW</small><strong>2 or 3 output classes</strong></div><span>+</span><div><small>PAIRED VIEW</small><strong>6 coordinate addresses</strong></div><span>≠</span><div><small>AMBIENT IDENTITIES</small><strong>12 cards</strong></div></section>
      </div><aside class="console" aria-live="polite"><span class="evidence-badge">{{ allRouted() ? 'ADDRESS GRID COMPLETE' : 'PAIRED QUOTIENT ROUTER' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">Φ({{ selected() }})={{ currentRouted() ? addressText(selected()) : '?' }} · fiber={{ currentRouted() ? fiberLabel() : '?' }}</div></aside></section>

      @if (allRouted()) { <section class="transfer-strip"><div><p class="kicker">SIX ADDRESSES · TWO HANDLES EACH</p><strong>x and x+6 always share one coordinate</strong></div><p>Paired reader 比任一單獨 view 更精細，但仍把 12 張 cards 收成 6 組；剩下的 collisions 正是下一節要找的共同 blind spot。</p></section> }
      <section class="insight"><span class="insight-icon">( , )</span><div><strong>兩個 quotient outputs 合起來，會成為一個新的 coordinate address</strong><span>一邊記 parity、一邊記 mod 3；兩張 views 可以補足彼此遺失的 distinctions，但不保證已經恢復全部 ambient identity。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 15.2</strong><p>0 與 6 為什麼仍然撞在同一格？哪一組 differences 會同時被 I-view 與 J-view 看成 zero？</p></div>
      <details><summary>正式層：paired map 為什麼是 ring homomorphism？</summary><p>兩個 canonical projections 都保留 addition 與 multiplication；product ring 的 operations 逐 coordinate 計算，因此 Φ(x+y)=Φ(x)+Φ(y)、Φ(xy)=Φ(x)Φ(y)。</p></details>
    </article>
  `,
})
export class RingsCh15PairedQuotientAddressComponent {
  readonly residues = CH15_RESIDUES;
  readonly rows = [0, 1] as const;
  readonly columns = [0, 1, 2] as const;
  readonly selected = signal(0);
  readonly routed = signal<readonly number[]>([]);
  readonly prediction = signal<boolean | null>(null);
  readonly currentAddress = computed(() => address(this.selected()));
  readonly currentRouted = computed(() => this.isRouted(this.selected()));
  readonly allRouted = computed(() => this.routed().length === 12);
  readonly verdictTitle = computed(() => this.allRouted() ? 'TWELVE CARDS BECOME SIX PAIRED ADDRESSES' : this.currentRouted() ? 'TWO OUTPUTS NOW ACT AS ONE ADDRESS' : 'SEND ONE CARD THROUGH BOTH QUOTIENT VIEWS');
  readonly verdictReading = computed(() => this.allRouted() ? '每格恰好收到兩張相差 6 的 cards；任何單一 view 都分得更少。' : this.currentRouted() ? `${this.selected()} 的 parity 是 ${this.currentAddress().mod2}、mod-3 output 是 ${this.currentAddress().second}，因此落在 ${this.addressText(this.selected())}。` : '兩條 branches 必須讀同一張 input card，才能合成可解釋的 coordinate。');

  addressText(value: number): string { return addressLabel(address(value)); }
  isRouted(value: number): boolean { return this.routed().includes(value); }
  socketMembers(row: number, column: number): readonly number[] { return this.residues.filter(value => addressKey(address(value)) === `${row},${column}`); }
  socketComplete(row: number, column: number): boolean { return this.socketMembers(row, column).every(value => this.isRouted(value)); }
  fiberLabel(): string { return `{${addressFiber(this.selected()).join(',')}}`; }
  routeSelected(): void { if (!this.isRouted(this.selected())) this.routed.update(values => [...values, this.selected()]); }
  routeNext(): void { const next = this.residues.find(value => !this.isRouted(value)); if (next !== undefined) { this.selected.set(next); this.routeSelected(); } }
  routeAll(): void { this.routed.set(this.residues); }
  reset(): void { this.selected.set(0); this.routed.set([]); this.prediction.set(null); }
}
