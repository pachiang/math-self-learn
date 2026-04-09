import { Component, signal, computed, ElementRef, viewChild } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Pt { x: number; y: number; }

const DEFAULT_PTS: Pt[] = [
  { x: -3.5, y: -2.8 },
  { x: -2.3, y: -1.7 },
  { x: -1.1, y: -0.5 },
  { x: 0.2, y: 0.6 },
  { x: 1.4, y: 1.4 },
  { x: 2.6, y: 2.5 },
  { x: 3.5, y: 3.0 },
  { x: -0.8, y: 1.4 },
  { x: 1.8, y: 0.4 },
];

@Component({
  selector: 'app-step-linear-regression',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u7DDA\u6027\u56DE\u6B78 = \u6700\u5C0F\u5E73\u65B9" subtitle="\u00A713.1">
      <p>
        \u6A5F\u5668\u5B78\u7FD2\u7684\u300C\u96B1\u85CF\u4E3B\u89D2\u300D\u5176\u5BE6\u5C31\u662F\u4F60\u5DF2\u7D93\u5728\u7B2C\u56DB\u7AE0\u5B78\u904E\u7684<strong>\u7DDA\u6027\u56DE\u6B78</strong>\u3002
      </p>
      <p>
        \u554F\u984C\uFF1A\u7D66 N \u500B\u8CC7\u6599\u9EDE (x\u1D62, y\u1D62)\uFF0C\u627E\u4E00\u689D\u76F4\u7DDA y = wx + b \u8B93\u5168\u90E8\u8AA4\u5DEE<strong>\u5E73\u65B9\u548C\u6700\u5C0F</strong>\uFF1A
      </p>
      <p class="formula">L(w, b) = \u03A3 (y\u1D62 \u2212 wx\u1D62 \u2212 b)\u00B2</p>
      <p>
        \u9019\u500B\u53EF\u4EE5\u5BEB\u6210\u77E9\u9663\u5F62\u5F0F\u3002\u8B93 A = [[x\u2081, 1], [x\u2082, 1], ..., [x_N, 1]]\u3001\u8AA4\u5DEE\u5411\u91CF\u662F r = b_vec \u2212 A\u00B7[w; b]\u3002
        \u8981\u8B93 \u2225r\u2225\u00B2 \u6700\u5C0F\uFF0C<strong>r \u5FC5\u9808\u5782\u76F4\u65BC A \u7684\u5217\u7A7A\u9593</strong>\uFF08Ch3 \u7684\u6295\u5F71\uFF09\u3002
      </p>
      <p>\u9019\u7D66\u4E86\u300C\u6B63\u898F\u65B9\u7A0B\u300D\uFF1A</p>
      <p class="formula big">A\u1D40 A x = A\u1D40 b</p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA\uFF0C\u300CML \u88E1\u7684\u300C\u8A13\u7DF4\u7DDA\u6027\u56DE\u6B78\u300D\u300D = \u300C\u7B2C\u56DB\u7AE0\u88E1\u300C\u89E3\u8907\u5B9A\u7684 Ax = b\u300D\u300D\u3002\u540C\u4E00\u4EF6\u4E8B\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6\u62FD\u9EDE\u6216\u589E\u6E1B\uFF0C\u6700\u4F73\u64EC\u5408\u7DDA\u5C0D\u8AA4\u5DEE\u5E73\u65B9\u548C\u6700\u5C0F">
      <div class="grid-wrap">
        <svg #svg viewBox="-150 -130 300 260" class="reg-svg"
          (pointerdown)="onPointerDown($event)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp($event)">
          @for (g of grid; track g) {
            <line [attr.x1]="-120" [attr.y1]="g" [attr.x2]="120" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-130" y1="0" x2="130" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Best fit line -->
          <line [attr.x1]="-130" [attr.y1]="-(slope() * -5.2 + intercept()) * 25"
            [attr.x2]="130" [attr.y2]="-(slope() * 5.2 + intercept()) * 25"
            stroke="var(--accent)" stroke-width="2.5" />

          <!-- Residuals -->
          @for (p of points(); track $index) {
            <line [attr.x1]="p.x * 25" [attr.y1]="-p.y * 25"
              [attr.x2]="p.x * 25" [attr.y2]="-(slope() * p.x + intercept()) * 25"
              stroke="#a05a5a" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.7" />
          }

          <!-- Data points -->
          @for (p of points(); track $index; let i = $index) {
            <circle [attr.cx]="p.x * 25" [attr.cy]="-p.y * 25" r="6"
              fill="var(--v1)" stroke="white" stroke-width="2"
              class="dpt" (pointerdown)="startDrag(i, $event)" />
          }
        </svg>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="addPoint()">+ \u52A0\u9EDE</button>
        <button class="ctrl-btn" (click)="removePoint()" [disabled]="points().length <= 2">\u2212 \u6E1B\u9EDE</button>
        <button class="ctrl-btn" (click)="reset()">\u91CD\u7F6E</button>
        <span class="ctrl-info">\u62D6\u85CD\u9EDE\u6539\u8B8A\u8CC7\u6599</span>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u6700\u4F73\u64EC\u5408</span>
          <span class="iv">y = <strong>{{ slope().toFixed(3) }}</strong> x + <strong>{{ intercept().toFixed(3) }}</strong></span>
        </div>
        <div class="info-row">
          <span class="il">\u8AA4\u5DEE\u5E73\u65B9\u548C</span>
          <span class="iv">\u03A3(y\u1D62 \u2212 \u0177\u1D62)\u00B2 = <strong>{{ sse().toFixed(3) }}</strong></span>
        </div>
      </div>

      <div class="normal-eq">
        <div class="ne-title">\u6B63\u898F\u65B9\u7A0B Aᵀ A x = Aᵀ b\uFF1A</div>
        <div class="ne-formula">
          <div class="ne-mat">
            <div class="ne-bracket">[</div>
            <div class="ne-body">
              <div class="ne-row"><span>{{ ata()[0][0].toFixed(2) }}</span><span>{{ ata()[0][1].toFixed(2) }}</span></div>
              <div class="ne-row"><span>{{ ata()[1][0].toFixed(2) }}</span><span>{{ ata()[1][1].toFixed(2) }}</span></div>
            </div>
            <div class="ne-bracket">]</div>
          </div>
          <div class="ne-mat">
            <div class="ne-bracket">[</div>
            <div class="ne-body">
              <div class="ne-row"><span>w</span></div>
              <div class="ne-row"><span>b</span></div>
            </div>
            <div class="ne-bracket">]</div>
          </div>
          <span class="ne-eq">=</span>
          <div class="ne-mat">
            <div class="ne-bracket">[</div>
            <div class="ne-body">
              <div class="ne-row"><span>{{ atb()[0].toFixed(2) }}</span></div>
              <div class="ne-row"><span>{{ atb()[1].toFixed(2) }}</span></div>
            </div>
            <div class="ne-bracket">]</div>
          </div>
          <span class="ne-eq">\u2192</span>
          <div class="ne-mat">
            <div class="ne-bracket">[</div>
            <div class="ne-body">
              <div class="ne-row sol"><span>{{ slope().toFixed(2) }}</span></div>
              <div class="ne-row sol"><span>{{ intercept().toFixed(2) }}</span></div>
            </div>
            <div class="ne-bracket">]</div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>\u9019\u500B\u500B\u300C\u62FF\u8AA4\u5DEE\u7684\u5E73\u65B9\u300D\u70BA\u4EC0\u9EBC\u9019\u9EBC\u91CD\u8981\uFF1F\u4E09\u500B\u539F\u56E0\uFF1A</p>
      <ul>
        <li><strong>\u5E7E\u4F55\u4E0A</strong>\uFF1A\u8AA4\u5DEE = \u6B63\u4EA4\u88DC\u88E1\u7684\u90E8\u5206\u3002\u8981\u8B93\u8AA4\u5DEE\u6700\u5C0F = \u8B93\u9810\u6E2C\u662F b \u5728\u300C\u53EF\u9054\u5230\u7684\u5217\u7A7A\u9593\u300D\u4E0A\u7684\u6700\u4F73\u6295\u5F71</li>
        <li><strong>\u4EE3\u6578\u4E0A</strong>\uFF1A\u5E73\u65B9\u662F\u53EF\u5FAE\u7684\uFF0C\u53EF\u4EE5\u4F7F\u7528\u5FAE\u5206\u8A08\u7B97\u6700\u5C0F\u503C \u2192 \u5C0E\u5230\u6B63\u898F\u65B9\u7A0B</li>
        <li><strong>\u7D71\u8A08\u4E0A</strong>\uFF1A\u5982\u679C\u8AA4\u5DEE\u662F\u9AD8\u65AF\u5206\u4F48\uFF0C\u6700\u5C0F\u5E73\u65B9 = \u6700\u5927\u4F3C\u7136</li>
      </ul>
      <p>
        \u9019\u500B\u300C\u4E00\u500B\u516C\u5F0F\u4F86\u81EA\u4E09\u500B\u4E0D\u540C\u9818\u57DF\u300D\u7684\u4E8B\u5BE6\uFF0C\u662F\u70BA\u4EC0\u9EBC\u6700\u5C0F\u5E73\u65B9\u662F\u6A5F\u5668\u5B78\u7FD2\u88E1\u7684\u57FA\u672C\u5167\u73AD\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7Bc0\u770B\u5F37\u5316\u7248\uFF1A<strong>\u591A\u9805\u5F0F\u64EC\u5408</strong>\u3002\u540C\u6A23\u662F\u6700\u5C0F\u5E73\u65B9\uFF0C\u53EA\u662F\u7279\u5FB5\u8B8A\u591A\u4E86\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 24px; padding: 18px; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .reg-svg { width: 100%; max-width: 380px; touch-action: none;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .dpt { cursor: grab; &:active { cursor: grabbing; } }

    .ctrl-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover:not(:disabled) { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &:disabled { opacity: 0.4; cursor: default; } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 110px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); }
    .iv { padding: 7px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 14px; }

    .normal-eq { padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .ne-title { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; text-align: center; }
    .ne-formula { display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap; }
    .ne-mat { display: flex; align-items: center; gap: 2px; }
    .ne-bracket { font-size: 36px; font-weight: 200; color: var(--text-muted); line-height: 0.9; }
    .ne-body { display: flex; flex-direction: column; gap: 2px; padding: 0 4px; }
    .ne-row { display: flex; gap: 4px; }
    .ne-row span { min-width: 40px; padding: 3px 6px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--bg-surface); border-radius: 3px; }
    .ne-row.sol span { background: var(--accent-10); color: var(--accent); }
    .ne-eq { font-size: 18px; color: var(--text-muted); padding: 0 4px; }
  `,
})
export class StepLinearRegressionComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly points = signal<Pt[]>([...DEFAULT_PTS]);

  // Drag handling
  private dragIdx: number | null = null;
  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('svg');

  startDrag(i: number, e: PointerEvent): void {
    this.dragIdx = i;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  onPointerDown(_e: PointerEvent): void {}

  onPointerMove(e: PointerEvent): void {
    if (this.dragIdx === null) return;
    const svg = this.svgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const x = Math.max(-5, Math.min(5, local.x / 25));
    const y = Math.max(-4, Math.min(4, -local.y / 25));
    this.points.update((pts) => {
      const next = [...pts];
      next[this.dragIdx!] = { x, y };
      return next;
    });
  }

  onPointerUp(e: PointerEvent): void {
    this.dragIdx = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }

  // Compute Aᵀ A and Aᵀ b directly (2 unknowns)
  readonly ata = computed(() => {
    const pts = this.points();
    let xx = 0, x = 0, n = 0;
    for (const p of pts) {
      xx += p.x * p.x;
      x += p.x;
      n += 1;
    }
    return [[xx, x], [x, n]];
  });
  readonly atb = computed(() => {
    const pts = this.points();
    let xy = 0, y = 0;
    for (const p of pts) {
      xy += p.x * p.y;
      y += p.y;
    }
    return [xy, y];
  });

  // Solve 2x2 system
  readonly slope = computed(() => {
    const M = this.ata();
    const b = this.atb();
    const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    if (Math.abs(det) < 1e-9) return 0;
    return (b[0] * M[1][1] - b[1] * M[0][1]) / det;
  });
  readonly intercept = computed(() => {
    const M = this.ata();
    const b = this.atb();
    const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    if (Math.abs(det) < 1e-9) return 0;
    return (M[0][0] * b[1] - M[1][0] * b[0]) / det;
  });

  readonly sse = computed(() => {
    const m = this.slope(), c = this.intercept();
    return this.points().reduce((s, p) => s + (p.y - m * p.x - c) ** 2, 0);
  });

  addPoint(): void {
    this.points.update((pts) => [...pts, { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 4 }]);
  }
  removePoint(): void {
    this.points.update((pts) => pts.length > 2 ? pts.slice(0, -1) : pts);
  }
  reset(): void {
    this.points.set([...DEFAULT_PTS]);
  }
}
