import { Component, computed, signal } from '@angular/core';

type Answer = 'always' | 'depends';
type ActionId = 'rotate' | 'reflect' | 'shear';
type StructureId = 'geometry' | 'entrance' | 'graph';

interface Check {
  label: string;
  detail: string;
  pass: boolean;
}

@Component({
  selector: 'app-algebra-v3-structure-preserved',
  standalone: true,
  template: `
    <article class="alg-ch1-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 1.3</p>
        <h2>Symmetry 不是「什麼都沒變」，而是指定的 structure 沒壞</h2>
        <p class="lede">
          同一個 transformation 可能是某個物件的 symmetry，卻不是另一個更有資料的物件的
          symmetry。判斷前，必須先說清楚什麼關係值得保留。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先找隱藏前提</p>
        <h3>正方形旋轉 90° 後，是否永遠算 symmetry？</h3>
        <div class="choice-row">
          <button
            type="button"
            [class.selected]="answer() === 'always'"
            (click)="answer.set('always')"
          >
            永遠算
          </button>
          <button
            type="button"
            [class.selected]="answer() === 'depends'"
            (click)="answer.set('depends')"
          >
            要看指定了什麼 structure
          </button>
        </div>
        @if (answer(); as value) {
          <p class="feedback" [class.warning]="value === 'always'">
            {{
              value === 'depends'
                ? '對。若左上角是固定入口，90° rotation 就把入口搬走了。'
                : '你預設物件只有無標記方形輪廓；加入入口、顏色或方向後，答案可能改變。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Structure switchboard</p>
            <h3>固定 transformation，切換我們承諾保留的資料</h3>
          </div>
          <p>先選 action，再選觀察鏡頭。圖形如何移動和「它是否為 symmetry」是兩個不同問題。</p>
        </div>

        <div class="action-row" role="group" aria-label="選擇 transformation">
          <button
            type="button"
            [class.active]="action() === 'rotate'"
            (click)="action.set('rotate')"
          >
            rotate 90°
          </button>
          <button
            type="button"
            [class.active]="action() === 'reflect'"
            (click)="action.set('reflect')"
          >
            diagonal reflection
          </button>
          <button type="button" [class.active]="action() === 'shear'" (click)="action.set('shear')">
            shear
          </button>
        </div>
        <div class="action-row" role="group" aria-label="選擇要保留的 structure">
          <button
            type="button"
            [class.active]="structure() === 'geometry'"
            (click)="structure.set('geometry')"
          >
            幾何：距離與角度
          </button>
          <button
            type="button"
            [class.active]="structure() === 'entrance'"
            (click)="structure.set('entrance')"
          >
            有指定入口的方形
          </button>
          <button
            type="button"
            [class.active]="structure() === 'graph'"
            (click)="structure.set('graph')"
          >
            只看 adjacency graph
          </button>
        </div>

        <div class="stage structure-workbench">
          <div class="square-scene">
            <svg viewBox="0 0 340 300" role="img" [attr.aria-label]="visualLabel()">
              <g class="square-object" [style.transform]="shapeTransform()">
                <rect x="80" y="55" width="180" height="180" rx="4" class="square-shape" />
                <line x1="80" y1="55" x2="260" y2="235" class="square-edge" />
                <line x1="260" y1="55" x2="80" y2="235" class="square-edge" />
                @if (structure() === 'entrance') {
                  <circle cx="80" cy="55" r="14" class="entrance-mark" />
                  <text x="80" y="60" fill="white" text-anchor="middle" font-size="11">IN</text>
                }
                @if (structure() === 'graph') {
                  @for (point of graphPoints; track $index) {
                    <circle
                      [attr.cx]="point[0]"
                      [attr.cy]="point[1]"
                      r="10"
                      class="entrance-mark"
                    />
                  }
                }
              </g>
            </svg>
          </div>

          <div class="structure-console">
            <div class="action-name">
              <span>目前判定</span>
              <strong>{{ isSymmetry() ? '✓ 是 symmetry' : '× 不是 symmetry' }}</strong>
            </div>
            <div class="structure-tests">
              @for (check of checks(); track check.label) {
                <div class="structure-test" [class.pass]="check.pass" [class.fail]="!check.pass">
                  <span>{{ check.pass ? '✓' : '×' }}</span>
                  <div>
                    <strong>{{ check.label }}</strong
                    ><small>{{ check.detail }}</small>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <p class="readout">
          <strong>{{ verdict() }}</strong
          ><br />{{ invariantSentence() }}
        </p>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>action</span><i>＋</i><span>structure</span>
        </div>
        <p>
          <strong>「是不是 symmetry」不是 action 單獨的屬性。</strong>
          它是 action 相對於指定 structure 的判斷：幾何保留距離，graph 保留 adjacency，代數將保留
          operation。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移檢查</p>
        <h3>
          一張 graph 的重新畫法改變了邊的長度，但每對相鄰 vertices 仍相鄰；它保留 graph structure
          嗎？
        </h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">保留</button>
          <button type="button" (click)="transfer.set(false)">不保留</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{
              transfer()
                ? '對。graph 不把畫面上的邊長當作 structure。'
                : '你把幾何距離混進了 graph adjacency。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>正式定義：structure-preserving bijection</summary>
          <div>
            Symmetry 是 object 到自身的 bijection，並保留事先指定的 relations 或 operations。不同
            category 的「structure-preserving」會有不同精確定義。
          </div>
        </details>
        <details>
          <summary>Proof Lab：驗證 graph automorphism</summary>
          <div>
            列出 vertices 的 bijection；對每一條 edge (u,v)，檢查 (f(u),f(v)) 仍是 edge；再由
            inverse mapping 確認沒有額外 edges 被創造。這個證明不需要量任何幾何長度。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3StructurePreservedComponent {
  readonly graphPoints: [number, number][] = [
    [80, 55],
    [260, 55],
    [260, 235],
    [80, 235],
  ];
  readonly answer = signal<Answer | null>(null);
  readonly action = signal<ActionId>('rotate');
  readonly structure = signal<StructureId>('geometry');
  readonly transfer = signal<boolean | null>(null);

  readonly checks = computed<Check[]>(() => {
    const action = this.action();
    const structure = this.structure();
    if (structure === 'geometry') {
      const rigid = action !== 'shear';
      return [
        {
          label: '距離',
          pass: rigid,
          detail: rigid ? '所有 pairwise distances 不變。' : '水平距離被位置依賴地改寫。',
        },
        { label: '直角', pass: rigid, detail: rigid ? '四個 90° 仍是 90°。' : '直角被推成斜角。' },
        {
          label: '可逆',
          pass: true,
          detail: '三個 transformations 都可撤銷；但可逆不等於幾何 symmetry。',
        },
      ];
    }
    if (structure === 'entrance') {
      const entranceFixed = action === 'reflect';
      return [
        {
          label: '方形輪廓',
          pass: action !== 'shear',
          detail: action === 'shear' ? '輪廓變成平行四邊形。' : '輪廓仍是方形。',
        },
        {
          label: '指定入口',
          pass: entranceFixed,
          detail: entranceFixed ? '主對角 reflection 固定左上角。' : '入口被搬到別的位置。',
        },
        {
          label: '全部 structure',
          pass: action !== 'shear' && entranceFixed,
          detail: '每一項承諾都必須同時成立。',
        },
      ];
    }
    return [
      { label: 'vertex bijection', pass: true, detail: '四個 vertices 仍一一對應。' },
      { label: 'adjacency', pass: true, detail: '每條 edge 仍連接原本相鄰的 endpoints。' },
      {
        label: '畫面距離',
        pass: action !== 'shear',
        detail: 'graph structure 並沒有要求保留這一項。',
      },
    ];
  });

  readonly isSymmetry = computed(() =>
    this.checks()
      .filter((check) => !(this.structure() === 'graph' && check.label === '畫面距離'))
      .every((check) => check.pass),
  );
  readonly verdict = computed(() => {
    const action = { rotate: '90° rotation', reflect: 'diagonal reflection', shear: 'shear' }[
      this.action()
    ];
    const structure = {
      geometry: 'Euclidean geometry',
      entrance: 'marked entrance',
      graph: 'adjacency graph',
    }[this.structure()];
    return `${action} 對 ${structure} ${this.isSymmetry() ? '是' : '不是'} symmetry。`;
  });
  readonly invariantSentence = computed(() =>
    this.structure() === 'graph'
      ? '現在只承諾 adjacency；畫面距離即使改變，也不影響 graph 判定。'
      : '判定必須逐項對照事先指定的 structure，不能靠「看起來差不多」。',
  );
  readonly visualLabel = computed(() => `${this.verdict()} ${this.invariantSentence()}`);

  shapeTransform(): string {
    if (this.action() === 'rotate') return 'rotate(90deg)';
    if (this.action() === 'reflect') return 'matrix(0, 1, 1, 0, 0, 0)';
    return 'skewX(22deg) scaleX(0.88)';
  }
}
