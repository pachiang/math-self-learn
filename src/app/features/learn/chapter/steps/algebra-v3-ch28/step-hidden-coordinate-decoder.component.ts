import { Component, computed, signal } from '@angular/core';

interface CoordinateCandidate {
  id: string;
  title: string;
  subtitle: string;
  universe: string[];
  axisA: string[];
  axisB: string[];
  combine: (a: string, b: string) => string;
}

interface CoordinateCell {
  a: string;
  b: string;
  forward: string;
  reverse: string;
}

function cyclicCandidate(
  id: string,
  modulus: number,
  axisA: number[],
  axisB: number[],
  title: string,
  subtitle: string,
): CoordinateCandidate {
  return {
    id,
    title,
    subtitle,
    universe: Array.from({ length: modulus }, (_, i) => String(i)),
    axisA: axisA.map(String),
    axisB: axisB.map(String),
    combine: (a, b) => String((Number(a) + Number(b)) % modulus),
  };
}

const D3_PAIRS: Record<string, [number, number]> = {
  e: [0, 0],
  r: [1, 0],
  'r²': [2, 0],
  s: [0, 1],
  rs: [1, 1],
  'r²s': [2, 1],
};

function d3Name(a: number, b: number): string {
  const rotation = ((a % 3) + 3) % 3;
  if (b === 0) return ['e', 'r', 'r²'][rotation];
  return ['s', 'rs', 'r²s'][rotation];
}

function d3Multiply(left: string, right: string): string {
  const [a, b] = D3_PAIRS[left];
  const [c, d] = D3_PAIRS[right];
  return d3Name(a + (b === 0 ? c : -c), (b + d) % 2);
}

@Component({
  selector: 'app-algebra-v3-hidden-coordinate-decoder',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch28-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 28.4</p>
        <h2>兩個 subgroups 看似兩條軸，還不代表整個群真的藏著 direct-product coordinates</h2>
        <p class="lede">
          要把 k 解碼成 pair (a,b)，每個 state 必須剛好有一組
          coordinates，兩軸還要能交換順序而不扭曲另一軸。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>
          D₃ 的 rotations 與一條 reflection subgroup 交集只有 identity，也共同生成六個
          elements；足以推出 direct product 嗎？
        </h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不夠，還要檢查 cross-talk</button
          ><button type="button" (click)="prediction.set(true)">足夠，沒有 overlap 又全覆蓋</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'D₃ 裡 sr 與 rs 不同。兩軸會互相扭曲，pair operation 不能逐 coordinate 進行。'
                : '對。unique coverage 只建立地址；axis moves 還必須互不干擾。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Hidden-coordinate decoder</p>
            <h3>把 candidate 送過三道 gates，定位是哪種 coordinate failure</h3>
          </div>
          <p>PASS／FAIL、✓／×、數量與 collision labels 同時顯示；結果不只靠紅綠色。</p>
        </div>
        <div class="candidate-tabs">
          @for (item of candidates; track item.id; let i = $index) {
            <button type="button" [attr.aria-pressed]="selected() === i" (click)="selected.set(i)">
              {{ item.title }}
            </button>
          }
        </div>
        <div class="stage decoder-stage">
          <section class="candidate-summary">
            <p class="kicker">{{ active().title }}</p>
            <h3>{{ active().subtitle }}</h3>
            <div>
              <span>AXIS A</span><b>{{ setLabel(active().axisA) }}</b>
            </div>
            <div>
              <span>AXIS B</span><b>{{ setLabel(active().axisB) }}</b>
            </div>
            <div>
              <span>AMBIENT K</span><b>{{ setLabel(active().universe) }}</b>
            </div>
          </section>
          <section
            class="coordinate-table"
            [style.grid-template-columns]="tableColumns()"
            [attr.aria-label]="active().title + ' coordinate products'"
          >
            @for (cell of table(); track cell.a + '|' + cell.b) {
              <article
                [class.collision]="multiplicity(cell.forward) > 1"
                [class.twisted]="cell.forward !== cell.reverse"
              >
                <span>({{ cell.a }}, {{ cell.b }})</span
                ><b>{{ cell.a }}·{{ cell.b }} → {{ cell.forward }}</b
                ><small>{{
                  multiplicity(cell.forward) > 1
                    ? multiplicity(cell.forward) + ' PAIRS SHARE OUTPUT'
                    : 'UNIQUE OUTPUT'
                }}</small>
                @if (cell.forward !== cell.reverse) {
                  <em>reverse: {{ cell.b }}·{{ cell.a }} → {{ cell.reverse }}</em>
                }
              </article>
            }
          </section>
          <section class="gate-deck" aria-live="polite">
            <article [class.pass]="noCollision()">
              <span>GATE 1 · NO COLLISION</span><b>{{ noCollision() ? '✓ PASS' : '× FAIL' }}</b
              ><small
                >{{ uniqueOutputs().length }} outputs from {{ table().length }} pair
                addresses</small
              >
            </article>
            <article [class.pass]="fullCoverage()">
              <span>GATE 2 · FULL COVERAGE</span><b>{{ fullCoverage() ? '✓ PASS' : '× FAIL' }}</b
              ><small
                >{{ uniqueOutputs().length }} of {{ active().universe.length }} ambient states
                reached</small
              >
            </article>
            <article [class.pass]="noCrossTalk()">
              <span>GATE 3 · NO CROSS-TALK</span><b>{{ noCrossTalk() ? '✓ PASS' : '× FAIL' }}</b
              ><small>{{
                noCrossTalk()
                  ? 'a·b = b·a for every cross-axis pair'
                  : twistedCount() + ' pair cells change under reversal'
              }}</small>
            </article>
            <div class="decoder-verdict">
              {{ valid() ? 'DIRECT-PRODUCT COORDINATES FOUND' : failureLabel() }}
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>one pair per state</span><i>+</i><span>all states covered</span><i>+</i
          ><span>axes commute</span>
        </div>
        <p>
          <strong
            >Internal direct product 是一套可解碼、無遺漏、無 cross-talk 的 coordinates。</strong
          >只找到兩個 subgroups 不夠；三道 gates 各擋住不同的假座標系。
        </p>
      </aside>
      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 ambient group K 已知是 abelian，是否仍需檢查 collision 與 coverage？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">需要，只自動通過 cross-talk</button
          ><button type="button" (click)="transfer.set(false)">
            不需要，abelian 自動是 direct product
          </button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{
              transfer()
                ? '對。Abelian 只保證兩軸 commute；它不保證 pair addresses 唯一，也不保證覆蓋整個 K。'
                : '例如 C₁₂ 裡畫面那兩條軸彼此 commute，卻只覆蓋 6/12 個 states。'
            }}
          </p>
        }
      </section>
      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Internal direct-product theorem 與 D₃ 的邊界</summary>
          <div>
            若 A、B 都是 K 的 normal subgroups、A∩B 只有 identity，且 AB=K，則 map A×B→K、(a,b)↦ab
            是 isomorphism。Normality 加 trivial intersection 可推出每個 a 與 b
            commute；intersection 控制 uniqueness，AB=K 控制 coverage。D₃ 的 rotation subgroup與
            reflection subgroup雖能唯一覆蓋 K，卻不 commute，所以它不是 direct
            product；這種有方向性的組合會導向 semidirect product，本章只標出邊界。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3HiddenCoordinateDecoderComponent {
  readonly candidates: CoordinateCandidate[] = [
    cyclicCandidate(
      'valid',
      6,
      [0, 2, 4],
      [0, 3],
      'C₆ · valid split',
      '⟨2⟩ 與 ⟨3⟩ 形成完整 3×2 coordinates',
    ),
    cyclicCandidate(
      'overlap',
      8,
      [0, 2, 4, 6],
      [0, 4],
      'C₈ · overlap',
      '兩軸共享 4，八個 pair addresses 撞成四個 outputs',
    ),
    cyclicCandidate(
      'missing',
      12,
      [0, 4, 8],
      [0, 6],
      'C₁₂ · missing states',
      'Addresses 唯一且 commute，卻只覆蓋 ambient group 一半',
    ),
    {
      id: 'twisted',
      title: 'D₃ · twisted axes',
      subtitle: 'Rotation 與 reflection coordinates 唯一覆蓋，但交換順序會改 output',
      universe: ['e', 'r', 'r²', 's', 'rs', 'r²s'],
      axisA: ['e', 'r', 'r²'],
      axisB: ['e', 's'],
      combine: d3Multiply,
    },
  ];
  readonly selected = signal(0);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly active = computed(() => this.candidates[this.selected()]);
  readonly table = computed<CoordinateCell[]>(() =>
    this.active().axisA.flatMap((a) =>
      this.active().axisB.map((b) => ({
        a,
        b,
        forward: this.active().combine(a, b),
        reverse: this.active().combine(b, a),
      })),
    ),
  );
  readonly uniqueOutputs = computed(() => [...new Set(this.table().map((cell) => cell.forward))]);
  readonly noCollision = computed(() => this.uniqueOutputs().length === this.table().length);
  readonly fullCoverage = computed(
    () => this.uniqueOutputs().length === this.active().universe.length,
  );
  readonly noCrossTalk = computed(() =>
    this.table().every((cell) => cell.forward === cell.reverse),
  );
  readonly valid = computed(() => this.noCollision() && this.fullCoverage() && this.noCrossTalk());
  setLabel(values: string[]) {
    return `{ ${values.join(', ')} }`;
  }
  multiplicity(output: string) {
    return this.table().filter((cell) => cell.forward === output).length;
  }
  twistedCount() {
    return this.table().filter((cell) => cell.forward !== cell.reverse).length;
  }
  tableColumns() {
    return `repeat(${this.active().axisB.length}, minmax(150px, 1fr))`;
  }
  failureLabel() {
    if (!this.noCollision()) return 'NOT A COORDINATE SYSTEM · COLLISIONS';
    if (!this.fullCoverage()) return 'NOT THE WHOLE GROUP · STATES MISSING';
    return 'NOT A DIRECT PRODUCT · AXES TWIST';
  }
}
