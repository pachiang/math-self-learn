import { Component, computed, signal } from '@angular/core';

type EvidenceKey = 'objects' | 'add' | 'multiply';

@Component({
  selector: 'app-rings-ch1-compatibility-gap',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 1.4</p>
        <h2>兩條 rules 都不逃出 world，還沒有完成一個 ring</h2>
        <p class="lede">同一批 objects、兩種 pair-to-output rules、兩邊都 closed：這些證據只各自檢查兩台 machines，還沒測它們混在同一條 route 時能否同步。</p>
      </header>

      <section class="prediction">
        <div>
          <p class="kicker">先下 verdict</p>
          <h3>ADD 與 MULTIPLY 都 closed，已足以稱為 ring 嗎？</h3>
        </div>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('enough')">足夠</button>
          <button type="button" (click)="prediction.set('missing')">還缺連接證據</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() === 'enough'">
            {{ prediction() === 'missing'
              ? '對。兩台 machines 各自能運作，不代表 mixed-operation routes 會相容。'
              : '目前只知道每台 machine 自己有 output；我們尚未比較先 ADD 再 MULTIPLY 與另一條 mixed route。' }}
          </p>
        }
      </section>

      <div class="control-row" aria-label="Ring candidate evidence">
        <span class="kicker">PLACE EVIDENCE</span>
        @for (item of evidenceItems; track item.key) {
          <button type="button" [class.active]="placed().has(item.key)" (click)="toggle(item.key)">
            {{ placed().has(item.key) ? '✓ ' : '+ ' }}{{ item.label }}
          </button>
        }
        <button type="button" (click)="reset()">清空 board</button>
      </div>

      <section class="stage stage-grid">
        <div class="evidence-board">
          <div class="machine-stack" role="img" [attr.aria-label]="ariaLabel()">
            <section class="machine-layer add">
              <div>
                <p class="kicker">ADD LAYER</p>
                <h3>{{ has('add') ? 'PAIR → OUTPUT · CLOSED' : 'WAITING FOR EVIDENCE' }}</h3>
                <p>{{ has('objects') ? 'shared objects connected' : 'shared objects not placed' }}</p>
              </div>
            </section>
            <section class="machine-layer multiply">
              <div>
                <p class="kicker">MULTIPLY LAYER</p>
                <h3>{{ has('multiply') ? 'PAIR → OUTPUT · CLOSED' : 'WAITING FOR EVIDENCE' }}</h3>
                <p>{{ has('objects') ? 'shared objects connected' : 'shared objects not placed' }}</p>
              </div>
            </section>
            <div class="gear-gap" aria-hidden="true">?</div>
          </div>

          <div class="evidence-list" aria-live="polite">
            <button type="button" [class.ready]="has('objects')" [class.missing]="!has('objects')" (click)="toggle('objects')">同一批 objects</button>
            <button type="button" [class.ready]="has('add')" [class.missing]="!has('add')" (click)="toggle('add')">ADD closed</button>
            <button type="button" [class.ready]="has('multiply')" [class.missing]="!has('multiply')" (click)="toggle('multiply')">MULTIPLY closed</button>
            <button type="button" class="missing">? COMPATIBILITY</button>
          </div>
        </div>

        <aside class="console" aria-live="polite">
          <p class="kicker">RING CANDIDATE</p>
          <h3>{{ boardStatus() }}</h3>
          <p>{{ explanation() }}</p>
          <div class="readout">下一章要比較 mixed-operation routes，而不是再各測一次 closure。</div>
        </aside>
      </section>

      <section class="insight">
        <span class="insight-icon">⚙</span>
        <div>
          <strong>Ring 不是兩張 operation tables 的堆疊</strong>
          <span>兩層之間還需要 compatibility law；它會約束一條 operation 如何穿過另一條。</span>
        </div>
      </section>

      <details>
        <summary>下一章的名字：分配律（distributivity）</summary>
        <p>我們將固定一個 multiplier，比較「先 ADD 再作用」與「先作用再 ADD」兩條 routes。這裡先留下問題，不提前把公式當成答案。</p>
      </details>
    </article>
  `,
})
export class RingsCh1CompatibilityGapComponent {
  readonly evidenceItems: readonly { key: EvidenceKey; label: string }[] = [
    { key: 'objects', label: 'SAME OBJECTS' },
    { key: 'add', label: 'ADD CLOSED' },
    { key: 'multiply', label: 'MULTIPLY CLOSED' },
  ];
  readonly placed = signal<ReadonlySet<EvidenceKey>>(new Set());
  readonly prediction = signal<'enough' | 'missing' | null>(null);
  readonly completeLocalEvidence = computed(() => this.evidenceItems.every(item => this.has(item.key)));
  readonly boardStatus = computed(() => this.completeLocalEvidence()
    ? 'LOCAL CHECKS COMPLETE · GEAR STILL OPEN'
    : `${this.placed().size}/3 local evidence cards placed`);
  readonly explanation = computed(() => this.completeLocalEvidence()
    ? '兩層各自亮起，中央 gear socket 仍未連接：closure 沒有回答 mixed routes 是否同終點。'
    : '先把已知證據逐張放入；每一張只會支持它真正檢查過的 claim。');
  readonly ariaLabel = computed(() => `${this.placed().size} of 3 local evidence cards placed；addition 與 multiplication 中央仍有 compatibility gap`);

  has(key: EvidenceKey): boolean {
    return this.placed().has(key);
  }

  toggle(key: EvidenceKey): void {
    this.placed.update(current => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  reset(): void {
    this.placed.set(new Set());
    this.prediction.set(null);
  }
}
