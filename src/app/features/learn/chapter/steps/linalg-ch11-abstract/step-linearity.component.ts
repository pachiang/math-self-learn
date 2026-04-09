import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { functionPath, polyDerivative, polyValue } from './abstract-util';

type Quad = [number, number, number];
type OperatorKind = 'derivative' | 'shift' | 'square' | 'plusOne';

const OPERATORS: { kind: OperatorKind; name: string; desc: string }[] = [
  { kind: 'derivative', name: 'D(p) = p′', desc: '微分會保留加法和純量倍，所以它是線性的。' },
  { kind: 'shift', name: 'T(p) = p(x + 1)', desc: '把輸入整體平移，仍然保留加法和純量倍。' },
  { kind: 'square', name: 'T(p) = p(x)²', desc: '平方會把不同項目混在一起，這通常不是線性的。' },
  { kind: 'plusOne', name: 'T(p) = p(x) + 1', desc: '加上一個固定常數是仿射變換，不是線性變換。' },
];

@Component({
  selector: 'app-step-linearity',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼叫線性算子" subtitle="§11.4">
      <p>
        一個 <strong>線性算子</strong> 就是一台「保留線性結構」的機器。它必須同時滿足：
      </p>
      <p class="formula">T(p + q) = T(p) + T(q)，而且 T(λp) = λT(p)</p>
      <p>
        這兩句話的意思很簡單：<strong>先相加再丟進機器</strong>，和 <strong>先各自丟進機器再相加</strong>，結果要一樣；
        縮放也一樣。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="換不同規則，檢查它有沒有保住『相加』和『縮放』">
      <div class="op-tabs">
        @for (op of operators; track op.kind) {
          <button class="op" [class.active]="selected() === op.kind" (click)="selected.set(op.kind)">{{ op.name }}</button>
        }
      </div>
      <div class="op-desc">{{ currentOp().desc }}</div>

      <div class="sliders">
        <div class="sl">
          <span class="lab">p₀</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="p0()" (input)="p0.set(+$any($event).target.value)" />
          <span class="val">{{ p0().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">p₁</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="p1()" (input)="p1.set(+$any($event).target.value)" />
          <span class="val">{{ p1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">p₂</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="p2()" (input)="p2.set(+$any($event).target.value)" />
          <span class="val">{{ p2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">q₀</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="q0()" (input)="q0.set(+$any($event).target.value)" />
          <span class="val">{{ q0().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">q₁</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="q1()" (input)="q1.set(+$any($event).target.value)" />
          <span class="val">{{ q1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">q₂</span>
          <input type="range" min="-2" max="2" step="0.1" [value]="q2()" (input)="q2.set(+$any($event).target.value)" />
          <span class="val">{{ q2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="lab">λ</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" [value]="lambda()" (input)="lambda.set(+$any($event).target.value)" />
          <span class="val">{{ lambda().toFixed(1) }}</span>
        </div>
      </div>

      <div class="graph-grid">
        <section class="graph-card">
          <div class="gc-title">加法測試：T(p + q) vs T(p) + T(q)</div>
          <svg viewBox="-130 -95 260 190" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="addLeftPath()" fill="none" stroke="var(--accent)" stroke-width="3.2" />
            <path [attr.d]="addRightPath()" fill="none" stroke="var(--v1)" stroke-width="2.2" stroke-dasharray="5 4" />
          </svg>
          <div class="measure" [class.ok]="additiveOk()">最大差異 = {{ addError().toFixed(3) }}</div>
        </section>

        <section class="graph-card">
          <div class="gc-title">縮放測試：T(λp) vs λT(p)</div>
          <svg viewBox="-130 -95 260 190" class="viz">
            @for (g of grid; track g) {
              <line [attr.x1]="-110" [attr.y1]="g" [attr.x2]="110" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.9" />
            <line x1="0" y1="-80" x2="0" y2="80" stroke="var(--border-strong)" stroke-width="0.9" />

            <path [attr.d]="scaleLeftPath()" fill="none" stroke="var(--accent)" stroke-width="3.2" />
            <path [attr.d]="scaleRightPath()" fill="none" stroke="var(--v4)" stroke-width="2.2" stroke-dasharray="5 4" />
          </svg>
          <div class="measure" [class.ok]="homogeneousOk()">最大差異 = {{ homError().toFixed(3) }}</div>
        </section>
      </div>

      <div class="verdict">
        <div class="row">
          <span class="label">加法</span>
          <span class="value" [class.ok]="additiveOk()">{{ additiveOk() ? '通過' : '失敗' }}</span>
        </div>
        <div class="row">
          <span class="label">縮放</span>
          <span class="value" [class.ok]="homogeneousOk()">{{ homogeneousOk() ? '通過' : '失敗' }}</span>
        </div>
        <div class="row highlight">
          <span class="label">結論</span>
          <span class="value" [class.ok]="isLinear()">{{ isLinear() ? '這個規則是線性的' : '這個規則不是線性的' }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        「線性」不是外觀，而是關於 <strong>結構是否被保留</strong>。只要保留相加和縮放，
        這台機器就能被線性代數完整描述。
      </p>
      <p>
        下一節我們會看一個非常重要的例子：<strong>微分</strong>。它不只線性，甚至還能在選定基底後寫成一個矩陣。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 700; color: var(--accent); padding: 10px;
      background: var(--accent-10); border-radius: 8px; margin: 10px 0; font-family: 'JetBrains Mono', monospace; }

    .op-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .op { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent;
      color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 700; } }
    .op-desc { padding: 10px 12px; border-radius: 8px; background: var(--bg); border: 1px solid var(--border);
      font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }

    .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-bottom: 14px; }
    .sl { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .lab { min-width: 24px; font-size: 14px; font-weight: 700; color: var(--accent); text-align: center; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .val { min-width: 36px; text-align: right; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .graph-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .graph-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--bg); }
    .gc-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .viz { width: 100%; display: block; }
    .measure { font-size: 12px; color: #aa6666; margin-top: 8px; font-family: 'JetBrains Mono', monospace; }
    .measure.ok { color: #5a8a5a; }

    .verdict { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .row { display: grid; grid-template-columns: 72px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.highlight { background: var(--accent-10); } }
    .label { padding: 8px 12px; background: var(--bg); color: var(--text-muted); font-size: 12px; border-right: 1px solid var(--border); }
    .value { padding: 8px 12px; font-size: 12px; color: #aa6666; font-weight: 700; }
    .value.ok { color: #5a8a5a; }
  `,
})
export class StepLinearityComponent {
  readonly grid = [-60, -30, 30, 60];
  readonly operators = OPERATORS;

  readonly selected = signal<OperatorKind>('derivative');
  readonly p0 = signal(0.9);
  readonly p1 = signal(-0.4);
  readonly p2 = signal(0.8);
  readonly q0 = signal(-0.6);
  readonly q1 = signal(1.1);
  readonly q2 = signal(-0.5);
  readonly lambda = signal(-1.4);

  readonly currentOp = computed(() => this.operators.find((op) => op.kind === this.selected()) ?? this.operators[0]);
  readonly p = computed<Quad>(() => [this.p0(), this.p1(), this.p2()]);
  readonly q = computed<Quad>(() => [this.q0(), this.q1(), this.q2()]);
  readonly sum = computed<Quad>(() => [this.p0() + this.q0(), this.p1() + this.q1(), this.p2() + this.q2()]);
  readonly scaled = computed<Quad>(() => [this.lambda() * this.p0(), this.lambda() * this.p1(), this.lambda() * this.p2()]);

  evalOp(kind: OperatorKind, coeffs: readonly number[], x: number): number {
    switch (kind) {
      case 'derivative':
        return polyValue(polyDerivative(coeffs), x);
      case 'shift':
        return polyValue(coeffs, x + 1);
      case 'square':
        return polyValue(coeffs, x) ** 2;
      case 'plusOne':
        return polyValue(coeffs, x) + 1;
    }
  }

  addLeft(x: number): number {
    return this.evalOp(this.selected(), this.sum(), x);
  }

  addRight(x: number): number {
    return this.evalOp(this.selected(), this.p(), x) + this.evalOp(this.selected(), this.q(), x);
  }

  scaleLeft(x: number): number {
    return this.evalOp(this.selected(), this.scaled(), x);
  }

  scaleRight(x: number): number {
    return this.lambda() * this.evalOp(this.selected(), this.p(), x);
  }

  maxError(lhs: (x: number) => number, rhs: (x: number) => number): number {
    let error = 0;
    for (let i = 0; i <= 80; i++) {
      const x = -1.2 + (2.4 * i) / 80;
      error = Math.max(error, Math.abs(lhs(x) - rhs(x)));
    }
    return error;
  }

  readonly addError = computed(() => this.maxError((x) => this.addLeft(x), (x) => this.addRight(x)));
  readonly homError = computed(() => this.maxError((x) => this.scaleLeft(x), (x) => this.scaleRight(x)));
  readonly additiveOk = computed(() => this.addError() < 0.04);
  readonly homogeneousOk = computed(() => this.homError() < 0.04);
  readonly isLinear = computed(() => this.additiveOk() && this.homogeneousOk());

  readonly addLeftPath = computed(() => functionPath((x) => this.addLeft(x), { scaleY: 24 }));
  readonly addRightPath = computed(() => functionPath((x) => this.addRight(x), { scaleY: 24 }));
  readonly scaleLeftPath = computed(() => functionPath((x) => this.scaleLeft(x), { scaleY: 24 }));
  readonly scaleRightPath = computed(() => functionPath((x) => this.scaleRight(x), { scaleY: 24 }));
}
