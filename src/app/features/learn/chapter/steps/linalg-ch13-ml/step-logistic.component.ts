import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; cls: 0 | 1; }

// Two clusters of points
const POINTS: Pt[] = [
  { x: -2.5, y: 1.5, cls: 0 }, { x: -2, y: 0.5, cls: 0 }, { x: -1.5, y: 2, cls: 0 },
  { x: -3, y: 2.5, cls: 0 }, { x: -1, y: 1, cls: 0 }, { x: -2, y: 2, cls: 0 },
  { x: -1.5, y: 0, cls: 0 }, { x: -3, y: 0, cls: 0 }, { x: -0.5, y: 2.5, cls: 0 },
  { x: 2, y: -1, cls: 1 }, { x: 1.5, y: -2, cls: 1 }, { x: 2.5, y: -1.5, cls: 1 },
  { x: 1, y: -2, cls: 1 }, { x: 3, y: -0.5, cls: 1 }, { x: 1.5, y: -0.5, cls: 1 },
  { x: 2.5, y: 0, cls: 1 }, { x: 0.5, y: -1.5, cls: 1 }, { x: 3, y: -2, cls: 1 },
];

@Component({
  selector: 'app-step-logistic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u908F\u8F2F\u56DE\u6B78 = \u7DDA\u6027 + sigmoid" subtitle="\u00A713.4">
      <p>
        \u7DDA\u6027\u56DE\u6B78\u7B97\u6578\u5B57\u3002\u4F46\u5982\u679C\u6211\u5011\u8981\u300C\u5206\u985E\u300D\uFF08\u8C93 vs \u72D7\u3001\u5783\u573E\u4FE1 vs \u6B63\u5E38\u4FE1\uFF09\u8A72\u600E\u9EBC\u8FA6\uFF1F
      </p>
      <p>
        \u7B2C\u4E00\u500B\u60F3\u6CD5\uFF1A\u7528\u7DDA\u6027\u56DE\u6B78\u9810\u6E2C 0 \u6216 1\u3002\u4F46\u9019\u500B\u6709\u554F\u984C\u2014 \u9810\u6E2C\u6703\u8DD1\u51FA [0, 1] \u4E4B\u5916\uFF0C\u8B80\u8D77\u4F86\u4E0D\u662F\u300C\u6A5F\u7387\u300D\u3002
      </p>
      <p>
        \u4FEE\u6B63\uFF1A\u8B93\u9810\u6E2C\u900F\u904E\u4E00\u500B\u300C\u58D3\u6263\u6210 0~1\u300D\u7684\u51FD\u6578\u3002\u9019\u500B\u51FD\u6578\u53EB <strong>sigmoid</strong>\uFF1A
      </p>
      <p class="formula">\u03C3(z) = 1 / (1 + e^(\u2212z))</p>
      <p>
        \u7D44\u5408\u8D77\u4F86\u5C31\u662F\u908F\u8F2F\u56DE\u6B78\uFF1A
      </p>
      <p class="formula big">P(\u985E\u5225 = 1 | x) = \u03C3(w\u00B7x + b)</p>
      <p>
        \u4E2D\u9593\u7684 <strong>w\u00B7x + b</strong> \u662F\u500B\u7DDA\u6027\u51FD\u6578\u2014\u9019\u5C31\u662F\u4F60\u5DF2\u7D93\u719F\u6089\u7684\u90E8\u5206\u3002
        sigmoid \u53EA\u662F\u5C07\u5176\u300C\u58D3\u6263\u300D\u6210\u6A5F\u7387\u3002
      </p>
      <p>
        <strong>\u6C7A\u7B56\u908A\u754C</strong>\uFF1A\u90A3\u4E9B\u8B93 P = 0.5 \u7684 x\u3002\u4ED6\u5011\u6EFF\u8DB3 w\u00B7x + b = 0\u2014 \u4E5F\u5C31\u662F\u4E00\u689D<strong>\u76F4\u7DDA</strong>\uFF08\u6216\u9AD8\u7DAD\u4E2D\u7684\u8D85\u5E73\u9762\uFF09\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 w\u2081, w\u2082, b \u6ED1\u6876\uFF0C\u8A66\u8457\u627E\u4E00\u689D\u5206\u958B\u5169\u985E\u8CC7\u6599\u7684\u76F4\u7DDA">
      <div class="grid-wrap">
        <svg viewBox="-150 -130 300 260" class="reg-svg">
          <!-- Probability heatmap (sampled grid) -->
          @for (cell of heatmap(); track $index) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y" width="11" height="11"
              [attr.fill]="cell.color" opacity="0.6" />
          }

          @for (g of grid; track g) {
            <line [attr.x1]="-120" [attr.y1]="g" [attr.x2]="120" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-130" y1="0" x2="130" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Decision boundary line: w1 x + w2 y + b = 0 → y = -(w1 x + b) / w2 -->
          @if (Math.abs(w2()) > 0.01) {
            <line [attr.x1]="-130" [attr.y1]="-(-(w1() * -5.2 + b()) / w2()) * 25"
              [attr.x2]="130" [attr.y2]="-(-(w1() * 5.2 + b()) / w2()) * 25"
              stroke="var(--text)" stroke-width="2.5" />
          }

          <!-- Data points -->
          @for (p of points; track $index) {
            <circle [attr.cx]="p.x * 25" [attr.cy]="-p.y * 25" r="6"
              [attr.fill]="p.cls === 0 ? 'var(--v1)' : 'var(--v0)'"
              stroke="white" stroke-width="2" />
          }
        </svg>
      </div>

      <div class="sliders">
        <div class="sl">
          <span class="sl-lab">w\u2081</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="w1()"
            (input)="w1.set(+$any($event).target.value)" />
          <span class="sl-val">{{ w1().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">w\u2082</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="w2()"
            (input)="w2.set(+$any($event).target.value)" />
          <span class="sl-val">{{ w2().toFixed(1) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">b</span>
          <input type="range" min="-3" max="3" step="0.1" [value]="b()"
            (input)="b.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b().toFixed(1) }}</span>
        </div>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="autoFit()">\u81EA\u52D5\u8A13\u7DF4\uFF08\u68AF\u5EA6\u4E0B\u964D 100 \u6B65\uFF09</button>
        <button class="ctrl-btn" (click)="reset()">\u91CD\u7F6E</button>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u6C7A\u7B56\u908A\u754C</span>
          <span class="iv">{{ w1().toFixed(2) }} x\u2081 + {{ w2().toFixed(2) }} x\u2082 + {{ b().toFixed(2) }} = 0</span>
        </div>
        <div class="info-row">
          <span class="il">\u4EA4\u53C9\u71B5\u640D\u5931</span>
          <span class="iv">L = <strong>{{ loss().toFixed(3) }}</strong></span>
        </div>
        <div class="info-row big">
          <span class="il">\u6E96\u78BA\u7387</span>
          <span class="iv"><strong>{{ (accuracy() * 100).toFixed(0) }}%</strong>\uFF08{{ correctCount() }} / {{ points.length }}\uFF09</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u300C\u4EA4\u53C9\u71B5\u640D\u5931\u300D\u662F\u908F\u8F2F\u56DE\u6B78\u7684\u300C\u8AA4\u5DEE\u51FD\u6578\u300D\uFF1A
      </p>
      <p class="formula">L = \u2212\u03A3 [y\u1D62 log(\u0177\u1D62) + (1 \u2212 y\u1D62) log(1 \u2212 \u0177\u1D62)]</p>
      <p>
        \u96D6\u7136\u770B\u8D77\u4F86\u8907\u96DC\uFF0C\u4F46\u5176\u5BE6\u6BD4\u6700\u5C0F\u5E73\u65B9\u9084\u300C\u9069\u5408\u300D\u908F\u8F2F\u56DE\u6B78\u2014\u9019\u4F86\u81EA\u300C\u6700\u5927\u4F3C\u7136\u300D\u539F\u5247\u3002
      </p>
      <p>
        \u91CD\u9EDE\u662F\uFF1A\u9019\u500B\u540C\u6A23\u662F\u4E00\u500B\u300C\u8B93\u640D\u5931\u6700\u5C0F\u5316\u300D\u7684\u554F\u984C\u3002\u4F46\u540C\u7BC0\u898F\u65B9\u7A0B\u4E0D\u80FD\u9069\u7528\uFF08\u540C\u3008\u3009\u3008\u3009\u3008\u3009\u3008\u3009\u80FD\u96E2\u3008\u3009\u300C\u63DB\u3008\u3009\u3008\u3009\u300D\u4E0D\u662F\u7DDA\u6027\u7684\uFF09\uFF0C\u9700\u8981\u7528<strong>\u68AF\u5EA6\u4E0B\u964D</strong>\u3002
      </p>
      <p>
        \u9EDE\u300C\u81EA\u52D5\u8A13\u7DF4\u300D\u770B\u68AF\u5EA6\u4E0B\u964D\u600E\u9EBC\u9010\u6B65\u6539\u8B8A w\u3001b\uFF0C\u8B93\u908A\u754C\u8DD1\u5230\u80FD\u5206\u958B\u5169\u985E\u7684\u4F4D\u7F6E\u3002\u9019\u662F\u4F60\u770B\u898B\u7684\u7B2C\u4E00\u500B\u771F\u6B63\u7684\u300C\u8A13\u7DF4\u300D\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u770B<strong>\u795E\u7D93\u7DB2\u8DEF</strong>\u2014 \u908F\u8F2F\u56DE\u6B78\u7684\u8B8A\u5316\u308A\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 18px; padding: 16px; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .reg-svg { width: 100%; max-width: 380px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }

    .sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; color: var(--accent); min-width: 32px;
      font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text);
      min-width: 44px; text-align: right; }

    .ctrl-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 6px 14px; border: 1px solid var(--accent-30); border-radius: 6px;
      background: var(--accent-10); color: var(--accent); font-size: 12px; cursor: pointer; font-weight: 600;
      &:hover { background: var(--accent-18); } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 110px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 14px; }
  `,
})
export class StepLogisticComponent {
  readonly Math = Math;
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly points = POINTS;

  readonly w1 = signal(0.5);
  readonly w2 = signal(-0.5);
  readonly b = signal(0);

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  // Heatmap of P(class=1) on a coarse grid
  readonly heatmap = computed(() => {
    const cells: { x: number; y: number; color: string }[] = [];
    const w1 = this.w1(), w2 = this.w2(), b = this.b();
    for (let i = -11; i <= 10; i++) {
      for (let j = -10; j <= 10; j++) {
        const mx = i * 0.5;
        const my = j * 0.5;
        const z = w1 * mx + w2 * my + b;
        const p = this.sigmoid(z);
        // Color: red for class 1 (high p), blue for class 0 (low p)
        const r = Math.round(255 * p);
        const bb = Math.round(255 * (1 - p));
        cells.push({
          x: mx * 25 - 5.5,
          y: -my * 25 - 5.5,
          color: `rgb(${r}, ${Math.round(110 + 50 * (1 - Math.abs(p - 0.5) * 2))}, ${bb})`,
        });
      }
    }
    return cells;
  });

  // Predictions
  readonly predictions = computed(() => {
    const w1 = this.w1(), w2 = this.w2(), b = this.b();
    return this.points.map((p) => {
      const z = w1 * p.x + w2 * p.y + b;
      return this.sigmoid(z);
    });
  });

  readonly correctCount = computed(() => {
    const preds = this.predictions();
    let n = 0;
    for (let i = 0; i < this.points.length; i++) {
      const predicted = preds[i] >= 0.5 ? 1 : 0;
      if (predicted === this.points[i].cls) n++;
    }
    return n;
  });

  readonly accuracy = computed(() => this.correctCount() / this.points.length);

  readonly loss = computed(() => {
    const preds = this.predictions();
    let s = 0;
    for (let i = 0; i < this.points.length; i++) {
      const y = this.points[i].cls;
      const yhat = Math.max(1e-9, Math.min(1 - 1e-9, preds[i]));
      s -= y * Math.log(yhat) + (1 - y) * Math.log(1 - yhat);
    }
    return s;
  });

  autoFit(): void {
    let w1 = this.w1(), w2 = this.w2(), b = this.b();
    const lr = 0.1;
    const steps = 100;
    for (let s = 0; s < steps; s++) {
      let dw1 = 0, dw2 = 0, db = 0;
      for (const p of this.points) {
        const z = w1 * p.x + w2 * p.y + b;
        const yhat = 1 / (1 + Math.exp(-z));
        const err = yhat - p.cls;
        dw1 += err * p.x;
        dw2 += err * p.y;
        db += err;
      }
      const n = this.points.length;
      w1 -= (lr * dw1) / n;
      w2 -= (lr * dw2) / n;
      b -= (lr * db) / n;
    }
    this.w1.set(+w1.toFixed(2));
    this.w2.set(+w2.toFixed(2));
    this.b.set(+b.toFixed(2));
  }

  reset(): void {
    this.w1.set(0.5);
    this.w2.set(-0.5);
    this.b.set(0);
  }
}
