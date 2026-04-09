import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; cls: 0 | 1; }

// XOR-like data: hard for a single linear classifier
const XOR_POINTS: Pt[] = [
  { x: -2, y: -2, cls: 0 }, { x: -1.5, y: -2.5, cls: 0 }, { x: -2.5, y: -1.5, cls: 0 },
  { x: 2, y: 2, cls: 0 }, { x: 2.5, y: 1.5, cls: 0 }, { x: 1.5, y: 2.5, cls: 0 },
  { x: -2, y: 2, cls: 1 }, { x: -1.5, y: 2.5, cls: 1 }, { x: -2.5, y: 1.5, cls: 1 },
  { x: 2, y: -2, cls: 1 }, { x: 2.5, y: -1.5, cls: 1 }, { x: 1.5, y: -2.5, cls: 1 },
];

function relu(z: number): number { return Math.max(0, z); }
function sigmoid(z: number): number { return 1 / (1 + Math.exp(-z)); }

interface Net {
  W1: number[][]; // 4×2
  b1: number[];   // 4
  W2: number[][]; // 1×4
  b2: number[];   // 1
}

function makeRandomNet(seed: number): Net {
  let s = seed | 0;
  const rand = (): number => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff) - 0.5;
  };
  return {
    W1: Array.from({ length: 4 }, () => [rand() * 2, rand() * 2]),
    b1: Array.from({ length: 4 }, () => rand()),
    W2: [Array.from({ length: 4 }, () => rand() * 2)],
    b2: [rand()],
  };
}

function forward(net: Net, x: number, y: number): { hidden: number[]; out: number } {
  const inp = [x, y];
  const hidden = net.W1.map((row, i) => relu(row[0] * inp[0] + row[1] * inp[1] + net.b1[i]));
  const z2 = net.W2[0].reduce((s, w, i) => s + w * hidden[i], 0) + net.b2[0];
  return { hidden, out: sigmoid(z2) };
}

function trainStep(net: Net, points: Pt[], lr: number): void {
  const grad: any = {
    W1: net.W1.map((row) => row.map(() => 0)),
    b1: net.b1.map(() => 0),
    W2: net.W2.map((row) => row.map(() => 0)),
    b2: net.b2.map(() => 0),
  };
  for (const p of points) {
    const inp = [p.x, p.y];
    // Forward
    const z1 = net.W1.map((row, i) => row[0] * inp[0] + row[1] * inp[1] + net.b1[i]);
    const h = z1.map(relu);
    const z2 = net.W2[0].reduce((s, w, i) => s + w * h[i], 0) + net.b2[0];
    const out = sigmoid(z2);
    // Backward
    const dout = out - p.cls; // dL/dz2 (with cross-entropy + sigmoid)
    for (let i = 0; i < 4; i++) {
      grad.W2[0][i] += dout * h[i];
    }
    grad.b2[0] += dout;
    const dh = net.W2[0].map((w) => dout * w);
    const dz1 = dh.map((d, i) => d * (z1[i] > 0 ? 1 : 0));
    for (let i = 0; i < 4; i++) {
      grad.W1[i][0] += dz1[i] * inp[0];
      grad.W1[i][1] += dz1[i] * inp[1];
      grad.b1[i] += dz1[i];
    }
  }
  const n = points.length;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) net.W1[i][j] -= (lr * grad.W1[i][j]) / n;
    net.b1[i] -= (lr * grad.b1[i]) / n;
    net.W2[0][i] -= (lr * grad.W2[0][i]) / n;
  }
  net.b2[0] -= (lr * grad.b2[0]) / n;
}

@Component({
  selector: 'app-step-neural-net',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u795E\u7D93\u7DB2\u8DEF\uFF1A\u7DDA\u6027\u5C64\u7684\u758A\u52A0" subtitle="\u00A713.5">
      <p>
        \u7DDA\u6027\u4E0D\u592A\u5920\u3002\u4F8B\u5982\u9019\u500B\u300CXOR \u8CC7\u6599\u300D\uFF1A\u5169\u985E\u9EDE\u5728\u5C0D\u89D2\u4E0A\u3002\u4E00\u689D\u76F4\u7DDA\u4E0D\u53EF\u80FD\u5206\u958B\u4ED6\u5011\u3002
      </p>
      <p>
        \u89E3\u6CD5\uFF1A<strong>\u758A\u591A\u5C64</strong>\u3002\u7DDA\u6027 \u2192 \u975E\u7DDA\u6027 \u2192 \u7DDA\u6027 \u2192 \u975E\u7DDA\u6027 \u2192 ...
      </p>
      <p class="formula">\u8F38\u51FA = \u03C3(W\u2082 \u00B7 ReLU(W\u2081 \u00B7 x + b\u2081) + b\u2082)</p>
      <p>
        \u9019\u662F\u4E00\u500B<strong>\u4E8C\u5C64\u795E\u7D93\u7DB2\u8DEF</strong>\u3002\u6BCF\u500B W \u662F\u500B\u77E9\u9663\uFF0Cb \u662F\u500B\u504F\u7F6E\u5411\u91CF\u3002
      </p>
      <p>
        ReLU(z) = max(0, z) \u662F\u500B\u300C\u975E\u7DDA\u6027\u95C0\u9580\u300D\u2014 \u4ED6\u662F\u9019\u500B\u8B8A\u63DB\u8B8A\u300C\u4E0D\u662F\u7DDA\u6027\u300D\u7684\u95DC\u9375\u3002
      </p>
      <p>
        \u95DC\u9375\u8AAA\u6CD5\uFF1A\u795E\u7D93\u7DB2\u8DEF = <strong>\u4E00\u9023\u4E32\u77E9\u9663\u4E58\u6CD5</strong> + \u300C\u6296\u4E00\u4E0B\u300D\u7684\u975E\u7DDA\u6027\u3002
        \u91CD\u9EDE\u662F\u300C\u6296\u4E00\u4E0B\u300D\u4F7F\u7CFB\u7D71\u80FD\u8868\u9054\u9060\u8D85\u904E\u7DDA\u6027\u7684\u51FD\u6578\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u770B\u4E00\u500B 2\u21924\u21921 \u7684\u795E\u7D93\u7DB2\u8DEF\u600E\u9EBC\u5B78\u6703 XOR">
      <div class="dual-grid">
        <div class="db-block">
          <div class="db-title">\u8F38\u5165\u7A7A\u9593 + \u6C7A\u7B56\u908A\u754C</div>
          <svg viewBox="-150 -130 300 260" class="reg-svg">
            <!-- Decision heatmap -->
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

            <!-- Hidden layer "fold lines" (W1 row i defines a line where ReLU activates) -->
            @for (line of hiddenLines(); track $index) {
              <line [attr.x1]="line[0]" [attr.y1]="line[1]" [attr.x2]="line[2]" [attr.y2]="line[3]"
                [attr.stroke]="line[4]" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.6" />
            }

            @for (p of points; track $index) {
              <circle [attr.cx]="p.x * 25" [attr.cy]="-p.y * 25" r="6"
                [attr.fill]="p.cls === 0 ? 'var(--v1)' : 'var(--v0)'"
                stroke="white" stroke-width="2" />
            }
          </svg>
        </div>

        <div class="net-block">
          <div class="db-title">\u7DB2\u8DEF\u67B6\u69CB</div>
          <svg viewBox="0 -130 220 260" class="net-svg">
            <!-- Inputs -->
            <circle cx="20" cy="-50" r="12" fill="var(--v1)" stroke="var(--text)" stroke-width="1.5" />
            <text x="20" y="-46" class="node-lab">x</text>
            <circle cx="20" cy="50" r="12" fill="var(--v1)" stroke="var(--text)" stroke-width="1.5" />
            <text x="20" y="54" class="node-lab">y</text>

            <!-- Hidden layer -->
            @for (i of [0, 1, 2, 3]; track i) {
              <circle cx="110" [attr.cy]="-90 + i * 60" r="11"
                fill="var(--accent-10)" stroke="var(--accent)" stroke-width="1.5" />
              <text x="110" [attr.y]="-86 + i * 60" class="node-lab">h{{ i+1 }}</text>
            }

            <!-- Output -->
            <circle cx="200" cy="0" r="13" fill="var(--v0)" stroke="var(--text)" stroke-width="1.5" />
            <text x="200" y="4" class="node-lab">y\u0302</text>

            <!-- Edges (W1) -->
            @for (i of [0, 1, 2, 3]; track i) {
              <line x1="32" y1="-50" x2="99" [attr.y2]="-90 + i * 60"
                [attr.stroke]="weightColor(net().W1[i][0])" [attr.stroke-width]="Math.min(3, Math.abs(net().W1[i][0]) * 1.5 + 0.5)" />
              <line x1="32" y1="50" x2="99" [attr.y2]="-90 + i * 60"
                [attr.stroke]="weightColor(net().W1[i][1])" [attr.stroke-width]="Math.min(3, Math.abs(net().W1[i][1]) * 1.5 + 0.5)" />
            }

            <!-- Edges (W2) -->
            @for (i of [0, 1, 2, 3]; track i) {
              <line x1="121" [attr.y1]="-90 + i * 60" x2="187" y2="0"
                [attr.stroke]="weightColor(net().W2[0][i])" [attr.stroke-width]="Math.min(3, Math.abs(net().W2[0][i]) * 1.5 + 0.5)" />
            }
          </svg>
        </div>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn primary" (click)="train(50)">\u8A13\u7DF4 50 \u6B65</button>
        <button class="ctrl-btn primary" (click)="train(500)">\u8A13\u7DF4 500 \u6B65</button>
        <button class="ctrl-btn" (click)="reset()">\u91CD\u7F6E</button>
      </div>

      <div class="info">
        <div class="info-row"><span class="il">\u8A13\u7DF4\u6B65\u6578</span><span class="iv">{{ trainSteps() }}</span></div>
        <div class="info-row"><span class="il">\u640D\u5931</span><span class="iv">{{ loss().toFixed(4) }}</span></div>
        <div class="info-row big"><span class="il">\u6E96\u78BA\u7387</span><span class="iv"><strong>{{ (accuracy() * 100).toFixed(0) }}%</strong></span></div>
      </div>

      <div class="key-insight">
        \u26A1 \u4E00\u958B\u59CB\u6E96\u78BA\u7387\u53EF\u80FD\u53EA\u6709 50% (\u96A8\u4FBF\u731C)\u3002\u6309\u300C\u8A13\u7DF4\u300D\u770B\u6E96\u78BA\u7387\u8DD1\u5230 100%\u3002
        <br/>\u6CE8\u610F\u5DE6\u908A\u7684\u300C\u865B\u7DDA\u300D\uFF1A\u5B83\u5011\u662F 4 \u500B\u96B1\u85CF\u795E\u7D93\u5143\u7684\u300C\u6296\u9EDE\u300D\uFF0C\u5B83\u5011\u62FC\u8D77\u4F86\u7686\u820D\u6210\u4E00\u500B\u8907\u96DC\u7684\u4E0D\u898F\u5247\u908A\u754C\u3002
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u500B 4 \u500B\u96B1\u85CF\u795E\u7D93\u5143\u5C31\u8DB3\u4EE5\u8A13\u7DF4\u51FA XOR\u3002\u591A\u51E0\u500B\u4E26\u591A\u52A0\u51E0\u5C64\uFF0C\u4F60\u5C31\u80FD\u8868\u9054\u8D8A\u4F86\u8D8A\u8907\u96DC\u7684\u51FD\u6578\u3002
      </p>
      <p>
        \u9019\u500B\u300C\u4E00\u9023\u4E32\u77E9\u9663\u4E58\u6CD5 + ReLU\u300D\u7684\u67B6\u69CB\u5F88\u96B1\u8B19\uFF0C\u4F46<strong>\u4ED6\u80FD\u8FD1\u4F3C\u4EFB\u610F\u9023\u7E8C\u51FD\u6578</strong>\u3002\u9019\u53EB\u300C\u666E\u904D\u8FD1\u4F3C\u5B9A\u7406\u300D\uFF0C\u662F\u73FE\u4EE3 AI \u7684\u6578\u5B78\u57FA\u790E\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u770B\u4E00\u500B\u7279\u5225\u7684\u300C\u7DDA\u6027\u5C64\u300D\uFF1A<strong>\u5377\u7A4D\u5C64</strong>\u3002\u4ED6\u80FD\u9AD4\u73FE\u300C\u5C40\u90E8\u300D\u8DDF\u300C\u4F4D\u7F6E\u4E0D\u8B8A\u300D\uFF0C\u53EA\u5728\u5F71\u50CF\u8655\u7406\u88E1\u8D85\u91CD\u8981\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;
      @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .db-block, .net-block { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .db-title { font-size: 11px; color: var(--text-muted); font-weight: 600; text-align: center; margin-bottom: 6px; }
    .reg-svg, .net-svg { width: 100%; height: auto; }
    .node-lab { font-size: 11px; fill: var(--text); text-anchor: middle; dominant-baseline: middle;
      font-family: 'Noto Sans Math', serif; font-weight: 700; pointer-events: none; }

    .ctrl-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.primary { background: var(--accent-10); border-color: var(--accent-30); color: var(--accent); font-weight: 600; } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 90px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 14px; }

    .key-insight { padding: 12px 16px; border-radius: 8px;
      background: var(--accent-10); border: 1px dashed var(--accent-30);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
  `,
})
export class StepNeuralNetComponent {
  readonly Math = Math;
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly points = XOR_POINTS;

  readonly trainSteps = signal(0);
  readonly net = signal<Net>(makeRandomNet(7));

  weightColor(w: number): string {
    if (w > 0) return `rgba(${191}, ${158}, ${147}, ${Math.min(1, Math.abs(w) * 0.5 + 0.3)})`;
    return `rgba(${141}, ${163}, ${181}, ${Math.min(1, Math.abs(w) * 0.5 + 0.3)})`;
  }

  // Hidden layer "fold lines": W1 row i = (a, b), bias b1[i]
  // Activation boundary: a*x + b*y + b1 = 0
  readonly hiddenLines = computed(() => {
    const lines: [number, number, number, number, string][] = [];
    const colors = ['#bf6e6e', '#6e9a6e', '#6e8aa8', '#c8983b'];
    const n = this.net();
    for (let i = 0; i < 4; i++) {
      const a = n.W1[i][0];
      const b = n.W1[i][1];
      const c = n.b1[i];
      // Line: a x + b y + c = 0
      if (Math.abs(b) > 0.01) {
        const x1 = -5, y1 = -(a * x1 + c) / b;
        const x2 = 5, y2 = -(a * x2 + c) / b;
        lines.push([x1 * 25, -y1 * 25, x2 * 25, -y2 * 25, colors[i]]);
      } else if (Math.abs(a) > 0.01) {
        const x = -c / a;
        lines.push([x * 25, -130, x * 25, 130, colors[i]]);
      }
    }
    return lines;
  });

  readonly heatmap = computed(() => {
    const cells: { x: number; y: number; color: string }[] = [];
    const n = this.net();
    for (let i = -11; i <= 10; i++) {
      for (let j = -10; j <= 10; j++) {
        const mx = i * 0.5;
        const my = j * 0.5;
        const { out } = forward(n, mx, my);
        const r = Math.round(255 * out);
        const bb = Math.round(255 * (1 - out));
        cells.push({
          x: mx * 25 - 5.5,
          y: -my * 25 - 5.5,
          color: `rgb(${r}, ${Math.round(110 + 50 * (1 - Math.abs(out - 0.5) * 2))}, ${bb})`,
        });
      }
    }
    return cells;
  });

  readonly loss = computed(() => {
    const n = this.net();
    let s = 0;
    for (const p of this.points) {
      const { out } = forward(n, p.x, p.y);
      const yhat = Math.max(1e-9, Math.min(1 - 1e-9, out));
      s -= p.cls * Math.log(yhat) + (1 - p.cls) * Math.log(1 - yhat);
    }
    return s;
  });

  readonly accuracy = computed(() => {
    const n = this.net();
    let correct = 0;
    for (const p of this.points) {
      const { out } = forward(n, p.x, p.y);
      const pred = out >= 0.5 ? 1 : 0;
      if (pred === p.cls) correct++;
    }
    return correct / this.points.length;
  });

  train(steps: number): void {
    const n = this.net();
    // Deep copy to allow signal change
    const next: Net = {
      W1: n.W1.map((r) => [...r]),
      b1: [...n.b1],
      W2: n.W2.map((r) => [...r]),
      b2: [...n.b2],
    };
    for (let s = 0; s < steps; s++) {
      trainStep(next, this.points, 0.1);
    }
    this.net.set(next);
    this.trainSteps.update((s) => s + steps);
  }

  reset(): void {
    this.net.set(makeRandomNet(7));
    this.trainSteps.set(0);
  }
}
