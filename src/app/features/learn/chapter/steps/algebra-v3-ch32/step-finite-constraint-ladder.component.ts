import { Component, computed, signal } from '@angular/core';
import {
  ORDER_PRESETS,
  primeFactors,
  sylowCandidateLabel,
  sylowCandidates,
} from './diagnostic-model';

@Component({
  selector: 'app-algebra-v3-finite-constraint-ladder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch32-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 32.5</p>
        <h2>Group order 是 constraint budget，不是群的身分證</h2>
        <p class="lede">
          Lagrange、Cauchy 與 Sylow 逐層增加 guaranteed
          information；它們會刪除不可能，但不會把同階的群變成同一個群。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>兩個群都有 order 6，能直接判定它們 isomorphic 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">
            不能；order 只提供 constraints
          </button>
          <button type="button" (click)="prediction.set(true)">能；elements 數量相同</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'C₆ 與 D₃ 都有六個 elements，但一個 abelian、一個 nonabelian。'
                : '對。Order 限制 structure，卻不會唯一決定 multiplication。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Finite-order evidence ladder</p>
            <h3>逐層解鎖證據；把 claims 放進正確 ledger</h3>
          </div>
          <p>GUARANTEED／STILL POSSIBLE／NOT JUSTIFIED 全以文字與框線區分。</p>
        </div>
        <div class="order-controls" role="group" aria-label="選擇有限群 order">
          @for (preset of presets; track preset.order; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="presetIndex() === i"
              (click)="selectPreset(i)"
            >
              |G|={{ preset.order }}
            </button>
          }
        </div>
        <div class="stage constraint-ladder-stage">
          <section class="prime-blocks">
            <span>INPUT ORDER</span><b>{{ active().order }}</b
            ><i>=</i>
            @for (factor of factors(); track $index) {
              <strong>{{ factor }}</strong>
            }
          </section>
          <section class="ladder-shutters">
            <article class="unlocked">
              <header><span>LEVEL 1</span><b>LAGRANGE</b></header>
              <p>Subgroup orders 只能整除 {{ active().order }}</p>
              <small>DIVISIBILITY FILTER</small>
            </article>
            <article [class.unlocked]="level() >= 2">
              <header><span>LEVEL 2</span><b>CAUCHY</b></header>
              <p>
                @for (prime of uniquePrimes(); track prime) {
                  <strong>order {{ prime }} witness</strong>
                }
              </p>
              <small>{{ level() >= 2 ? 'GUARANTEED WITNESSES' : 'LOCKED' }}</small>
            </article>
            <article [class.unlocked]="level() >= 3">
              <header><span>LEVEL 3</span><b>SYLOW</b></header>
              <p>
                @for (prime of active().primes; track prime) {
                  <strong>{{ candidateLabel(prime) }}</strong>
                }
              </p>
              <small>{{ level() >= 3 ? 'CANDIDATE BRANCHES' : 'LOCKED' }}</small>
            </article>
          </section>
          <div class="ladder-actions">
            <button type="button" class="primary" [disabled]="level() >= 3" (click)="advance()">
              解鎖下一層 evidence
            </button>
            <button type="button" (click)="level.set(1)">重設</button>
          </div>
          <section class="claim-tabs" role="group" aria-label="選擇要檢查的 claim">
            @for (claim of claims(); track claim.id) {
              <button
                type="button"
                [attr.aria-pressed]="claimId() === claim.id"
                (click)="claimId.set(claim.id)"
              >
                {{ claim.text }}
              </button>
            }
          </section>
          <section class="evidence-ledger" aria-live="polite">
            @for (column of ledgerColumns; track column.id) {
              <article [class.active]="verdict().status === column.id">
                <header>{{ column.label }}</header>
                <b>{{ verdict().status === column.id ? verdict().claim : '—' }}</b>
                <small>{{ verdict().status === column.id ? verdict().reason : column.hint }}</small>
              </article>
            }
          </section>
          <section class="same-order-warning">
            <article><b>C₆</b><span>order 6</span><small>ABELIAN</small></article>
            <i>same order ≠ same multiplication</i>
            <article><b>D₃</b><span>order 6</span><small>NONABELIAN</small></article>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>order</span><i>→</i><span>constraints</span><i>≠</i><span>group identity</span>
        </div>
        <p>
          <strong>每一層只增加它真正保證的資訊。</strong>
          尚未排除的 branch 必須留下；漂亮、簡單或熟悉都不是刪除證據。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>|G|=30 時得到 n₃∈{{ '{' }}1,10{{ '}' }}，能立刻選 n₃=1 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不能，branch 仍未排除</button>
          <button type="button" (click)="transfer.set(true)">能，1 會給 normal subgroup</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? '想得到 normal 並不構成證據；下一節會把 n₃ 與 n₅ branches 接起來 counting。'
                : '對。先保留 {1,10}；新資訊到來後再縮小。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>三層 theorem 的正式適用範圍</summary>
          <div>
            Lagrange 限制 subgroup orders；Cauchy 對每個 prime divisor p 保證 order-p element；Sylow
            對 maximal p-subgroups 保證存在性、conjugacy 與數量 restrictions。這些均不宣稱 group
            order 唯一決定 group。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3FiniteConstraintLadderComponent {
  readonly presets = ORDER_PRESETS;
  readonly presetIndex = signal(0);
  readonly level = signal<1 | 2 | 3>(1);
  readonly claimId = signal('cauchy');
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly active = computed(() => this.presets[this.presetIndex()]);
  readonly factors = computed(() => primeFactors(this.active().order));
  readonly uniquePrimes = computed(() => [...new Set(this.factors())]);
  readonly ledgerColumns = [
    { id: 'guaranteed', label: 'GUARANTEED', hint: '目前 evidence 已迫使成立' },
    { id: 'possible', label: 'STILL POSSIBLE', hint: '尚未被 constraints 排除' },
    { id: 'unjustified', label: 'NOT JUSTIFIED', hint: '需要額外 structure evidence' },
  ] as const;

  readonly claims = computed(() => {
    const prime = this.uniquePrimes().at(-1)!;
    return [
      { id: 'cauchy', text: `存在 order ${prime} element` },
      { id: 'normal', text: `Sylow ${prime}-subgroup normal` },
      { id: 'cyclic', text: 'G 一定 cyclic' },
    ];
  });

  readonly verdict = computed(() => {
    const claim = this.claims().find((item) => item.id === this.claimId())!;
    if (claim.id === 'cauchy') {
      return this.level() >= 2
        ? { status: 'guaranteed', claim: claim.text, reason: 'Cauchy witness 已解鎖' }
        : {
            status: 'unjustified',
            claim: claim.text,
            reason: 'Lagrange 本身不製造 element witness',
          };
    }
    if (claim.id === 'normal') {
      const prime = this.uniquePrimes().at(-1)!;
      const candidates = sylowCandidates(this.active().order, prime);
      const candidateText = sylowCandidateLabel(this.active().order, prime);
      if (this.level() < 3) {
        return { status: 'unjustified', claim: claim.text, reason: '尚未解鎖 Sylow count' };
      }
      return candidates.length === 1 && candidates[0] === 1
        ? {
            status: 'guaranteed',
            claim: claim.text,
            reason: `${candidateText}；unique forces normal`,
          }
        : {
            status: 'possible',
            claim: claim.text,
            reason: `${candidateText}；branch 1 尚未 forced`,
          };
    }
    return { status: 'unjustified', claim: claim.text, reason: '同階群可能有不同 multiplication' };
  });

  selectPreset(index: number): void {
    this.presetIndex.set(index);
    this.level.set(1);
    this.claimId.set('cauchy');
  }

  advance(): void {
    this.level.update((level) => (level < 3 ? ((level + 1) as 2 | 3) : level));
  }

  candidateLabel(prime: number): string {
    return sylowCandidateLabel(this.active().order, prime);
  }
}
