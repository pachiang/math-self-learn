import { Component, computed, signal } from '@angular/core';
import {
  CH13_CLASSES,
  CH13_TARGET,
  KernelClass,
  RingOperation,
  TargetPoint,
  isImagePoint,
  mapToTarget,
  quotientOperate,
  targetKey,
  targetLabel,
  targetOperate,
} from './rings-ch13-model';

@Component({
  selector: 'app-rings-ch13-image-isomorphism',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">RINGS & IDEALS · 13.4</p><h2>Quotient 對準的是 reachable image，不一定是整個 target</h2><p class="lede">Target ℤ/4ℤ×ℤ/2ℤ 有 8 個 points，但 f 只點亮其中 4 個。把四張 quotient cards 逐一接上 target，再用 ADD 或 MULTIPLY 檢查這個一對一配對是否保留 ring structure。</p></header>
      <span class="map-convention">FIRST ISOMORPHISM · R/ker f ≅ im f · WHOLE TARGET ONLY WHEN f IS SURJECTIVE</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>(ℤ/12ℤ)/ker f 應該和哪個 world 對齊：4-point image，還是 8-point target？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('image')">只和 reachable image</button><button type="button" (click)="prediction.set('target')">和整個 target</button></div>@if (prediction() !== null) { <p class="feedback" [class.warning]="prediction()==='target'">{{ prediction()==='image' ? '先追蹤四張 cards；看看它們是否剛好填滿所有亮著的 sockets。' : 'Injective 不等於 surjective；先找 target 裡哪些 sockets 根本沒有 preimage。' }}</p> }</section>

      <div class="control-row"><span class="kicker">IMAGE ROUTER</span><button type="button" (click)="routeNext()">ROUTE NEXT QUOTIENT ELEMENT</button><button type="button" (click)="routeAll()">REVEAL WHOLE IMAGE</button><button type="button" [class.active]="operation()==='add'" (click)="selectOperation('add')">ADD</button><button type="button" [class.active]="operation()==='multiply'" (click)="selectOperation('multiply')">MULTIPLY</button><span class="kicker">A</span>@for (quotientClass of classes; track quotientClass.index) { <button type="button" [class.active]="leftClass()===quotientClass.index" (click)="leftClass.set(quotientClass.index)">C{{ quotientClass.index }}</button> }<span class="kicker">B</span>@for (quotientClass of classes; track quotientClass.index) { <button type="button" [class.active]="rightClass()===quotientClass.index" (click)="rightClass.set(quotientClass.index)">C{{ quotientClass.index }}</button> }<button type="button" (click)="checkTwoRoutes()">CHECK TWO ROUTES</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="image-isomorphism-lab">
          <section class="quotient-image-source"><div class="tray-heading"><p class="kicker">R/ker f · 4 ELEMENTS</p><strong>effective domain</strong></div>@for (quotientClass of classes; track quotientClass.index) { <div class="iso-source-card" [class.routed]="isRouted(quotientClass.index)"><strong>C{{ quotientClass.index }}</strong><small>{{ classMembers(quotientClass) }}</small><span>{{ isRouted(quotientClass.index) ? '→ '+pointLabel(quotientClass.image) : 'waiting' }}</span></div> }</section>

          <div class="iso-machine"><span>f̄</span><strong>BIJECTION ONTO IMAGE</strong><small>{{ routed().length }}/4 connected</small></div>

          <section class="target-world"><div class="tray-heading"><p class="kicker">TARGET S · 8 POINTS</p><strong>{{ routed().length }} lit · {{ 8-routed().length }} unlit</strong></div><div class="target-point-grid">@for (point of target; track pointKey(point)) { <div class="target-point" [class.reachable]="showReachable(point)" [class.lit]="isLit(point)"><small>{{ socketStatus(point) }}</small><strong>{{ pointLabel(point) }}</strong><span>{{ sourceFor(point) }}</span></div> }</div></section>

          <section class="operation-seal" [class.checked]="checked()"><div><small>QUOTIENT ROUTE</small><strong>C{{ leftClass() }} {{ operationSymbol() }} C{{ rightClass() }} = C{{ quotientResult() }}</strong><span>f̄ → {{ checked() ? pointLabel(quotientRouteOutput()) : '?' }}</span></div><span>{{ checked() ? '=' : '?' }}</span><div><small>IMAGE ROUTE</small><strong>{{ pointLabel(leftImage()) }} {{ operationSymbol() }} {{ pointLabel(rightImage()) }}</strong><span>= {{ checked() ? pointLabel(imageRouteOutput()) : '?' }}</span></div></section>
        </div>

        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ checked() ? 'RING ISOMORPHISM CHECK' : imageComplete() ? 'IMAGE REVEALED' : 'CODOMAIN AUDIT' }}</span><h3>{{ verdictTitle() }}</h3><p>{{ verdictReading() }}</p><div class="readout">|R/ker f|=4 · |im f|=4 · |S|=8 {{ checked() ? '· two routes agree' : '' }}</div></aside>
      </section>

      @if (checked()) { <section class="transfer-strip"><div><p class="kicker">EXACT MATCH</p><strong>R/ker f ≅ im f · not necessarily S</strong></div><p>f̄ 沒有 collisions、填滿 image，並保留 ADD 與 MULTIPLY。未點亮的四個 target points 不屬於這個 correspondence；只有 f surjective 時，image 才等於整個 target。</p></section> }
      <section class="insight"><span class="insight-icon">≅</span><div><strong>Map 忘掉的差異形成 kernel；map 真正看見的世界形成 image</strong><span>Quotient by kernel 把前者精確移除，剩下的 effective domain 與後者逐 element、逐 operation 完全對齊。</span></div></section>
      <div class="chapter-resolution"><strong>CH13 RESOLUTION</strong><p>Collision → kernel difference；whole fiber → kernel coset；compress fibers → injective induced map；match reachable outputs → R/ker f ≅ im f。</p></div>
      <details><summary>正式層：First Isomorphism Theorem</summary><p>對 ring homomorphism f:R→S，定義 f̄:R/ker f→im f，f̄(x+ker f)=f(x)。它 well-defined、injective、surjective onto im f，且保留 addition 與 multiplication，因此 R/ker f≅im f。若 f 本身 surjective，才可進一步寫成 R/ker f≅S。</p></details>
    </article>
  `,
})
export class RingsCh13ImageIsomorphismComponent {
  readonly classes = CH13_CLASSES;
  readonly target = CH13_TARGET;
  readonly routed = signal<readonly number[]>([]);
  readonly operation = signal<RingOperation>('add');
  readonly leftClass = signal(1);
  readonly rightClass = signal(3);
  readonly checked = signal(false);
  readonly prediction = signal<'image' | 'target' | null>(null);
  readonly imageComplete = computed(() => this.routed().length === this.classes.length);
  readonly quotientResult = computed(() => quotientOperate(this.operation(), this.leftClass(), this.rightClass()));
  readonly leftImage = computed(() => mapToTarget(this.leftClass()));
  readonly rightImage = computed(() => mapToTarget(this.rightClass()));
  readonly quotientRouteOutput = computed(() => mapToTarget(this.quotientResult()));
  readonly imageRouteOutput = computed(() => targetOperate(this.operation(), this.leftImage(), this.rightImage()));
  readonly verdictTitle = computed(() => this.checked()
    ? 'R/ker f ≅ im f · NOT THE WHOLE TARGET'
    : this.imageComplete() ? 'FOUR CLASSES MATCH FOUR REACHABLE POINTS' : 'WHICH TARGET POINTS CAN f ACTUALLY REACH?');
  readonly verdictReading = computed(() => this.checked()
    ? `${this.operation()==='add' ? 'Addition' : 'Multiplication'} 的兩條 routes 都抵達 ${this.pointLabel(this.quotientRouteOutput())}；配對不只是 bijection，也保留 operations。`
    : this.imageComplete()
      ? '每個 quotient element 有唯一 image point，且每個亮起的 point 都被接上；另外四個 target points 仍無 preimage。'
      : '逐一送入 C0 到 C3；target 中有些 sockets 會一直保持不可達。');

  pointKey(point: TargetPoint): string { return targetKey(point); }
  pointLabel(point: TargetPoint): string { return targetLabel(point); }
  pointIsImage(point: TargetPoint): boolean { return isImagePoint(point); }
  showReachable(point: TargetPoint): boolean { return this.isLit(point) || (this.imageComplete() && this.pointIsImage(point)); }
  socketStatus(point: TargetPoint): string {
    if (this.isLit(point)) return 'IMAGE SOCKET';
    if (!this.imageComplete()) return 'TARGET SOCKET';
    return this.pointIsImage(point) ? 'IMAGE SOCKET' : 'NO PREIMAGE';
  }
  classMembers(quotientClass: KernelClass): string { return `{${quotientClass.members.join(',')}}`; }
  isRouted(index: number): boolean { return this.routed().includes(index); }
  isLit(point: TargetPoint): boolean { return this.classes.some(quotientClass => this.isRouted(quotientClass.index) && targetKey(quotientClass.image) === targetKey(point)); }
  sourceFor(point: TargetPoint): string {
    const source = this.classes.find(quotientClass => targetKey(quotientClass.image) === targetKey(point));
    if (source && this.isRouted(source.index)) return `from C${source.index}`;
    if (!this.imageComplete()) return 'waiting';
    return this.pointIsImage(point) ? 'waiting' : 'unreachable';
  }
  operationSymbol(): string { return this.operation() === 'add' ? '+' : '×'; }
  selectOperation(operation: RingOperation): void { this.operation.set(operation); this.checked.set(false); }
  routeNext(): void {
    const next = this.classes.find(quotientClass => !this.isRouted(quotientClass.index));
    if (next) this.routed.update(indices => [...indices, next.index]);
  }
  routeAll(): void { this.routed.set(this.classes.map(quotientClass => quotientClass.index)); }
  checkTwoRoutes(): void { this.routeAll(); this.checked.set(true); }
  reset(): void { this.routed.set([]); this.operation.set('add'); this.leftClass.set(1); this.rightClass.set(3); this.checked.set(false); this.prediction.set(null); }
}
