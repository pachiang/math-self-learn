import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface PortraitMatrix { name: string; A: number[][]; type: string; }

const PRESETS: PortraitMatrix[] = [
  { name: '\u7A69\u5B9A\u7BC0\u9EDE',  A: [[-1, 0], [0, -2]],     type: 'stable-node' },
  { name: '\u4E0D\u7A69\u5B9A\u7BC0\u9EDE', A: [[1, 0], [0, 2]],   type: 'unstable-node' },
  { name: '\u978D\u9EDE',     A: [[1, 0], [0, -1]],     type: 'saddle' },
  { name: '\u7A69\u5B9A\u87BA\u65CB', A: [[-0.3, -1], [1, -0.3]], type: 'stable-spiral' },
  { name: '\u4E0D\u7A69\u5B9A\u87BA\u65CB', A: [[0.3, -1], [1, 0.3]], type: 'unstable-spiral' },
  { name: '\u4E2D\u5FC3',     A: [[0, -1], [1, 0]],     type: 'center' },
];

interface Trajectory { points: { x: number; y: number }[]; }

@Component({
  selector: 'app-step-stability',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u56DB\u7A2E\u5E73\u8861\u9EDE\u985E\u578B" subtitle="\u00A79.5">
      <p>
        \u5C0D 2D \u7DDA\u6027\u7CFB\u7D71 dx/dt = Ax\uFF0C\u539F\u9EDE\u662F\u552F\u4E00\u7684\u5E73\u8861\u9EDE\uFF08\u5982\u679C A \u53EF\u9006\uFF09\u3002\u9019\u500B\u5E73\u8861\u9EDE\u7684\u985E\u578B
        \u5B8C\u5168\u7531 A \u7684<strong>\u5169\u500B\u7279\u5FB5\u503C</strong>\u6C7A\u5B9A\u3002
      </p>
      <p>\u8A18\u4F4F\u5169\u500B\u91CD\u8981\u91CF\uFF1A</p>
      <ul>
        <li><strong>\u8E64</strong>\uFF08trace\uFF09\uFF1Atr(A) = a + d = \u03BB\u2081 + \u03BB\u2082</li>
        <li><strong>\u884C\u5217\u5F0F</strong>\uFF1Adet(A) = ad \u2212 bc = \u03BB\u2081 \u00D7 \u03BB\u2082</li>
      </ul>
      <p>\u7279\u5FB5\u65B9\u7A0B\uFF1A\u03BB\u00B2 \u2212 tr\u00B7\u03BB + det = 0\u3002\u5224\u5225\u5F0F = tr\u00B2 \u2212 4det\u3002</p>

      <p>\u4F9D\u7167 (tr, det) \u7684\u4F4D\u7F6E\u5C31\u80FD\u5F97\u5230\u516D\u500B\u985E\u578B\uFF1A</p>
      <ul>
        <li><strong>det < 0</strong>\uFF1A\u4E00\u6B63\u4E00\u8CA0\u5BE6\u7279\u5FB5\u503C \u2192 <strong>\u978D\u9EDE</strong></li>
        <li><strong>det > 0, \u5224\u5225\u5F0F > 0</strong>\uFF1A\u5169\u5BE6\u4E14\u540C\u865F</li>
        <ul>
          <li>tr < 0 \u2192 <strong>\u7A69\u5B9A\u7BC0\u9EDE</strong>\uFF08\u5169\u500B\u8CA0\uFF09</li>
          <li>tr > 0 \u2192 <strong>\u4E0D\u7A69\u5B9A\u7BC0\u9EDE</strong>\uFF08\u5169\u500B\u6B63\uFF09</li>
        </ul>
        <li><strong>det > 0, \u5224\u5225\u5F0F < 0</strong>\uFF1A\u8907\u7279\u5FB5\u503C</li>
        <ul>
          <li>tr < 0 \u2192 <strong>\u7A69\u5B9A\u87BA\u65CB</strong></li>
          <li>tr > 0 \u2192 <strong>\u4E0D\u7A69\u5B9A\u87BA\u65CB</strong></li>
          <li>tr = 0 \u2192 <strong>\u4E2D\u5FC3</strong>\uFF08\u5708\u8ECC\u9053\uFF09</li>
        </ul>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="\u70BA\u4E86\u770B\u51FA\u9019\u500B\u5206\u985E\uFF0C\u9078\u4E0D\u540C\u7684\u985E\u578B\u770B\u76F8\u5E73\u9762\u600E\u9EBC\u8B8A">
      <div class="preset-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pst" [class.active]="sel() === i" (click)="sel.set(i)" [class.full]="true">
            {{ p.name }}
          </button>
        }
      </div>

      <div class="phase-block">
        <svg viewBox="-130 -130 260 260" class="phase-svg">
          <!-- Background grid -->
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Vector field -->
          @for (v of vectorField(); track $index) {
            <line [attr.x1]="v.x" [attr.y1]="v.y"
              [attr.x2]="v.x + v.dx" [attr.y2]="v.y + v.dy"
              stroke="var(--text-muted)" stroke-width="0.7" opacity="0.45"
              marker-end="url(#tip-st)" />
          }

          <!-- Many trajectories from a circle of starting points -->
          @for (traj of trajectories(); track $index) {
            <path [attr.d]="trajPath(traj)" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity="0.85" />
          }

          <!-- Equilibrium dot -->
          <circle cx="0" cy="0" r="4" fill="var(--text)" stroke="white" stroke-width="1.5" />

          <defs>
            <marker id="tip-st" markerWidth="4" markerHeight="3" refX="3" refY="1.5" orient="auto">
              <polygon points="0 0,4 1.5,0 3" fill="var(--text-muted)" opacity="0.6" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ A()[0][0] }}, {{ A()[0][1] }}], [{{ A()[1][0] }}, {{ A()[1][1] }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">tr(A)</span>
          <span class="iv">{{ trace().toFixed(2) }}</span>
        </div>
        <div class="info-row">
          <span class="il">det(A)</span>
          <span class="iv">{{ det().toFixed(2) }}</span>
        </div>
        <div class="info-row">
          <span class="il">\u5224\u5225\u5F0F</span>
          <span class="iv">{{ disc().toFixed(2) }}\uFF08{{ disc() > 0 ? '\u5169\u5BE6' : disc() < 0 ? '\u8907\u6839' : '\u91CD\u6839' }}\uFF09</span>
        </div>
        <div class="info-row big">
          <span class="il">\u985E\u578B</span>
          <span class="iv"><strong>{{ presets[sel()].name }}</strong></span>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="\u8E64-\u884C\u5217\u5F0F\u5E73\u9762\uFF1A\u5168\u90E8\u985E\u578B\u7684\u300C\u5730\u5716\u300D">
      <p class="td-intro">
        \u9019\u5F35\u5716\u8B93\u4F60\u4E00\u773C\u770B\u51FA\u300C\u54EA\u500B (tr, det) \u90A3\u500B\u5340\u570B\u300D\u662F\u4EC0\u9EBC\u985E\u578B\u3002\u62CB\u7269\u7DDA\u662F\u91CD\u6839\u7684\u908A\u754C\u3002
      </p>
      <div class="td-block">
        <svg viewBox="-180 -130 360 220" class="td-svg">
          <!-- Background regions (simple rectangles for visual partition) -->
          <!-- det < 0 (saddle): bottom half -->
          <rect x="-160" y="0" width="320" height="120" fill="rgba(212, 161, 75, 0.08)" />
          <!-- det > 0, parabola tr² = 4 det divides -->

          <!-- Discriminant curve: det = tr² / 4 -->
          <path [attr.d]="discCurve()" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4 3" />

          <!-- Axes -->
          <line x1="-160" y1="0" x2="160" y2="0" stroke="var(--text)" stroke-width="1.5" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--text)" stroke-width="1.5" />
          <text x="160" y="14" class="ax-l">tr</text>
          <text x="6" y="-105" class="ax-l">det</text>

          <!-- Region labels -->
          <text x="-80" y="-60" class="rg-lab">\u7A69\u5B9A\u87BA\u65CB</text>
          <text x="80" y="-60" class="rg-lab">\u4E0D\u7A69\u5B9A\u87BA\u65CB</text>
          <text x="-110" y="-15" class="rg-lab">\u7A69\u5B9A\u7BC0\u9EDE</text>
          <text x="80" y="-15" class="rg-lab">\u4E0D\u7A69\u5B9A\u7BC0\u9EDE</text>
          <text x="0" y="-105" class="rg-lab" style="text-anchor: middle">\u4E2D\u5FC3 (tr=0)</text>
          <text x="0" y="60" class="rg-lab" style="text-anchor: middle">\u978D\u9EDE</text>

          <!-- Current point on the diagram -->
          <circle [attr.cx]="trace() * 30" [attr.cy]="-det() * 30" r="6"
            fill="var(--accent)" stroke="white" stroke-width="2" />
          <text [attr.x]="trace() * 30 + 10" [attr.y]="-det() * 30 - 8" class="cur-lab">
            ({{ trace().toFixed(1) }}, {{ det().toFixed(1) }})
          </text>
        </svg>
        <div class="td-caption">
          \u865B\u7DDA\u662F\u62CB\u7269\u7DDA det = tr\u00B2/4\uFF08\u91CD\u6839\u908A\u754C\uFF09\u3002\u62CB\u7269\u7DDA\u4E0A\u65B9 = \u8907\u6839\uFF08\u87BA\u65CB / \u4E2D\u5FC3\uFF09\uFF0C\u4E0B\u65B9 = \u5169\u500B\u5BE6\u6839\uFF08\u7BC0\u9EDE\uFF09\u3002
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u5F35\u300C\u8E64-\u884C\u5217\u5F0F\u5E73\u9762\u300D\u662F\u52D5\u529B\u7CFB\u7D71\u8AB2\u672C\u88E1\u6700\u91CD\u8981\u7684\u4E00\u5F35\u5716\u3002\u53EA\u8981\u8A08\u7B97 A \u7684 tr \u8DDF det\uFF0C
        \u4F60\u5C31\u80FD\u9810\u6E2C\u9019\u500B\u7CFB\u7D71\u7684\u9577\u671F\u884C\u70BA \u2014 <strong>\u4E0D\u9700\u8981\u89E3\u4EFB\u4F55\u65B9\u7A0B\u3002</strong>
      </p>
      <p>
        \u4E0B\u4E00\u7Bc0\u770B\u4E00\u500B\u7269\u7406\u4F8B\u5B50\uFF1A\u96BB\u7C27\u52A0\u4E0A\u8CEA\u91CF\u52A0\u4E0A\u963B\u5C3C\u7684\u7CFB\u7D71\uFF0C\u9019\u662F\u300C\u963B\u5C3C\u632F\u76EA\u5668\u300D\u3002\u4F60\u6703\u770B\u5230\u4E09\u7A2E\u4E0D\u540C\u7684\u8B8A\u5316\u90FD\u80FD\u88AB\u9019\u500B\u5206\u985E\u8868\u8BE0\u91CB\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .preset-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pst { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .phase-block { display: flex; justify-content: center; padding: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); margin-bottom: 12px; }
    .phase-svg { width: 100%; max-width: 380px; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .iv strong { color: var(--accent); font-size: 14px; }

    .td-intro { font-size: 13px; color: var(--text-secondary); margin-bottom: 10px; }
    .td-block { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .td-svg { width: 100%; max-width: 460px; display: block; margin: 0 auto; }
    .ax-l { font-size: 13px; fill: var(--text-muted); font-family: 'Noto Sans Math', serif; font-weight: 700; }
    .rg-lab { font-size: 11px; fill: var(--text-secondary); text-anchor: middle; pointer-events: none; }
    .cur-lab { font-size: 10px; fill: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .td-caption { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 6px; }
  `,
})
export class StepStabilityComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly presets = PRESETS;
  readonly sel = signal(0);

  readonly A = computed(() => this.presets[this.sel()].A);
  readonly trace = computed(() => this.A()[0][0] + this.A()[1][1]);
  readonly det = computed(() => this.A()[0][0] * this.A()[1][1] - this.A()[0][1] * this.A()[1][0]);
  readonly disc = computed(() => this.trace() ** 2 - 4 * this.det());

  // Vector field arrows
  readonly vectorField = computed(() => {
    const A = this.A();
    const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        const vx = A[0][0] * i + A[0][1] * j;
        const vy = A[1][0] * i + A[1][1] * j;
        const len = Math.hypot(vx, vy);
        if (len < 0.01) continue;
        const targetLen = 11;
        const dx = (vx / len) * targetLen;
        const dy = -(vy / len) * targetLen;
        arrows.push({ x: i * 25, y: -j * 25, dx, dy });
      }
    }
    return arrows;
  });

  // Many trajectories from starting points on a small circle (radius 0.5) and large circle (radius 3.5)
  readonly trajectories = computed<Trajectory[]>(() => {
    const A = this.A();
    const trajs: Trajectory[] = [];
    const startRadii = [3.5];
    const numAngles = 14;
    for (const r of startRadii) {
      for (let k = 0; k < numAngles; k++) {
        const theta = (k / numAngles) * 2 * Math.PI;
        const points: { x: number; y: number }[] = [];
        let x = r * Math.cos(theta);
        let y = r * Math.sin(theta);
        const dt = 0.04;
        // Forward integration
        for (let step = 0; step < 250; step++) {
          points.push({ x, y });
          const k1x = A[0][0] * x + A[0][1] * y;
          const k1y = A[1][0] * x + A[1][1] * y;
          const k2x = A[0][0] * (x + dt / 2 * k1x) + A[0][1] * (y + dt / 2 * k1y);
          const k2y = A[1][0] * (x + dt / 2 * k1x) + A[1][1] * (y + dt / 2 * k1y);
          const k3x = A[0][0] * (x + dt / 2 * k2x) + A[0][1] * (y + dt / 2 * k2y);
          const k3y = A[1][0] * (x + dt / 2 * k2x) + A[1][1] * (y + dt / 2 * k2y);
          const k4x = A[0][0] * (x + dt * k3x) + A[0][1] * (y + dt * k3y);
          const k4y = A[1][0] * (x + dt * k3x) + A[1][1] * (y + dt * k3y);
          x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
          y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
          if (Math.abs(x) > 5.5 || Math.abs(y) > 5.5) break;
          if (Math.hypot(x, y) < 0.05) break;
        }
        trajs.push({ points });
      }
    }
    return trajs;
  });

  trajPath(traj: Trajectory): string {
    return 'M ' + traj.points
      .map((p) => `${(p.x * 25).toFixed(1)},${(-p.y * 25).toFixed(1)}`)
      .join(' L ');
  }

  // Discriminant curve det = tr² / 4 in (tr, det) plane (scale 30)
  readonly discCurve = computed(() => {
    const points: string[] = [];
    for (let tr = -5; tr <= 5; tr += 0.1) {
      const det = (tr * tr) / 4;
      if (det > 4) break;
      points.push(`${(tr * 30).toFixed(1)},${(-det * 30).toFixed(1)}`);
    }
    return 'M ' + points.join(' L ');
  });
}
