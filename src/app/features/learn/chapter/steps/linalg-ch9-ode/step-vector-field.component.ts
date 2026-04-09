import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Trajectory { points: { x: number; y: number }[]; color: string; }

const COLORS = ['var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)', 'var(--v4)', 'var(--v6)'];

@Component({
  selector: 'app-step-vector-field',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="2D \u5411\u91CF\u5834\u8207\u76F8\u5E73\u9762" subtitle="\u00A79.2">
      <p>
        \u73FE\u5728\u8B93\u72C0\u614B\u662F\u4E00\u500B<strong>\u5411\u91CF</strong> x = (x\u2081, x\u2082)\uFF0C\u65B9\u7A0B\u8B8A\u6210\uFF1A
      </p>
      <p class="formula big">dx/dt = A x</p>
      <p>
        \u5176\u4E2D A \u662F 2\u00D72 \u77E9\u9663\u3002\u9019\u500B\u65B9\u7A0B\u544A\u8A34\u6211\u5011\uFF1A<strong>\u5728\u4F4D\u7F6E x \u9019\u88E1\uFF0C\u72C0\u614B\u7684\u901F\u5EA6\u662F Ax\u300D</strong>\u3002
      </p>
      <p>
        \u63DB\u53E5\u8A71\uFF1A\u5E73\u9762\u4E0A<strong>\u6BCF\u4E00\u500B\u9EDE\u90FD\u6709\u4E00\u500B\u901F\u5EA6\u5411\u91CF</strong>\u3002\u9019\u500B\u9EDE \u2192 \u901F\u5EA6\u5411\u91CF\u7684\u5C0D\u61C9\u53EB\u505A
        <strong>\u5411\u91CF\u5834</strong>\uFF08vector field\uFF09\u3002
      </p>
      <p>
        \u4E1F\u4E00\u500B\u521D\u59CB\u9EDE\u9032\u53BB\uFF0C\u8DDF\u8457\u5411\u91CF\u8D70\uFF0C\u4F60\u5C31\u5F97\u5230\u4E00\u689D<strong>\u8ECC\u8DE1</strong>\uFF08trajectory\uFF09\u3002\u8ECC\u8DE1\u672C\u8EAB\u662F\u9019\u500B\u65B9\u7A0B\u7684\u89E3\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9EDE\u4EFB\u4F55\u5730\u65B9\u4E1F\u4E00\u500B\u9EDE\uFF0C\u770B\u5B83\u8DDF\u8457\u5411\u91CF\u5834\u600E\u9EBC\u8DD1">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg" (click)="addTrajectory($event)">
          <!-- Background grid -->
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- Vector field arrows -->
          @for (v of vectorField(); track $index) {
            <line [attr.x1]="v.x" [attr.y1]="v.y"
              [attr.x2]="v.x + v.dx" [attr.y2]="v.y + v.dy"
              stroke="var(--text-muted)" stroke-width="0.8" opacity="0.45"
              marker-end="url(#tip-vf)" />
          }

          <!-- Equilibrium at origin -->
          <circle cx="0" cy="0" r="3" fill="var(--text-muted)" />

          <!-- Trajectories -->
          @for (traj of trajectories(); track $index) {
            <path [attr.d]="trajPath(traj)" fill="none" [attr.stroke]="traj.color" stroke-width="2" />
            <circle [attr.cx]="traj.points[0].x * 25" [attr.cy]="-traj.points[0].y * 25" r="4"
              [attr.fill]="traj.color" stroke="white" stroke-width="1.5" />
          }

          <defs>
            <marker id="tip-vf" markerWidth="4" markerHeight="3" refX="3" refY="1.5" orient="auto">
              <polygon points="0 0,4 1.5,0 3" fill="var(--text-muted)" opacity="0.6" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="clearTrajectories()">\u6E05\u9664\u8ECC\u8DE1</button>
        <button class="ctrl-btn" [class.active]="showField()" (click)="showField.set(!showField())">
          {{ showField() ? '\u96B1\u85CF\u5411\u91CF\u5834' : '\u986F\u793A\u5411\u91CF\u5834' }}
        </button>
        <span class="ctrl-info">\u9EDE\u756B\u9762\u4EFB\u610F\u4F4D\u7F6E\u4E1F\u9EDE</span>
      </div>

      <div class="preset-row">
        <span class="pst-l">\u9078\u4E0D\u540C\u7684 A\uFF1A</span>
        @for (p of presets; track p.name; let i = $index) {
          <button class="pst-btn" [class.active]="sel() === i" (click)="setPreset(i)">{{ p.name }}</button>
        }
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">A</span>
          <span class="iv">[[{{ A()[0][0] }}, {{ A()[0][1] }}], [{{ A()[1][0] }}, {{ A()[1][1] }}]]</span>
        </div>
        <div class="info-row">
          <span class="il">\u8AAA\u660E</span>
          <span class="iv plain">{{ presets[sel()].desc }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u6CE8\u610F\u51E0\u500B\u95DC\u9375\u89C0\u5BDF\uFF1A
      </p>
      <ul>
        <li>\u539F\u9EDE\u662F<strong>\u5E73\u8861\u9EDE</strong>\u2014 \u5728\u90A3\u88E1 dx/dt = A\u00B70 = 0\uFF0C\u4E1F\u9EDE\u9032\u53BB\u5C31\u4E0D\u52D5</li>
        <li>\u8ECC\u8DE1\u4E0D\u4E92\u76F8\u4EA4\u53C9\u2014 \u91CD\u758A\u4EE3\u8868\u540C\u4E00\u500B\u4F4D\u7F6E\u6709\u5169\u500B\u4E0D\u540C\u7684\u672A\u4F86\uFF0C\u4E0D\u53EF\u80FD</li>
        <li>\u4E0D\u540C\u7684 A \u7522\u751F\u4E0D\u540C\u7684\u300C\u5E7E\u4F55\u5F62\u72C0\u300D\u7684\u8ECC\u8DE1\u96C6\u5408</li>
      </ul>
      <p>
        \u90A3\u9EBC\u95DC\u9375\u554F\u984C\u4F86\u4E86\uFF1A<strong>\u600E\u9EBC\u89E3\u9019\u500B\u65B9\u7A0B\uFF1F</strong>
      </p>
      <p>
        \u95DC\u9375\u6D1E\u898B\uFF1A\u5728<strong>\u7279\u5FB5\u5411\u91CF\u7684\u65B9\u5411</strong>\u4E0A\uFF0C\u9019\u500B 2D \u65B9\u7A0B\u9000\u5316\u6210 1D\uFF0C\u53EF\u4EE5\u7528 e^(at) \u89E3\u3002\u4E0B\u4E00\u7BC0\u898B\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 24px; padding: 16px; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 400px; cursor: crosshair;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }

    .ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .ctrl-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.active { background: var(--accent-18); color: var(--accent); } }
    .ctrl-info { font-size: 11px; color: var(--text-muted); margin-left: auto; }

    .preset-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
    .pst-l { font-size: 12px; color: var(--text-muted); }
    .pst-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 60px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.plain { font-family: inherit; } }
  `,
})
export class StepVectorFieldComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  readonly presets = [
    { name: '\u7A69\u5B9A\u7BC0\u9EDE', A: [[-1, 0], [0, -2]], desc: '\u5169\u500B\u8CA0\u5BE6\u7279\u5FB5\u503C \u2192 \u4E00\u5207\u8DD1\u5411\u539F\u9EDE' },
    { name: '\u4E0D\u7A69\u5B9A\u7BC0\u9EDE', A: [[1, 0], [0, 2]], desc: '\u5169\u500B\u6B63\u5BE6\u7279\u5FB5\u503C \u2192 \u4E00\u5207\u9580\u96E2\u539F\u9EDE' },
    { name: '\u978D\u9EDE', A: [[1, 0], [0, -1]], desc: '\u4E00\u6B63\u4E00\u8CA0 \u2192 \u67D0\u4E9B\u65B9\u5411\u9580\u96E2\u3001\u67D0\u4E9B\u65B9\u5411\u63A5\u8FD1' },
    { name: '\u7A69\u5B9A\u87BA\u65CB', A: [[-0.3, -1], [1, -0.3]], desc: '\u8907\u7279\u5FB5\u503C\u4E14\u5BE6\u90E8 < 0 \u2192 \u87BA\u65CB\u5411\u5167\u5708' },
    { name: '\u4E2D\u5FC3', A: [[0, -1], [1, 0]], desc: '\u7D14\u865B\u7279\u5FB5\u503C \u2192 \u9577\u671F\u5708\u8ECC\u9053\u3001\u4E0D\u589E\u4E0D\u6E1B' },
  ];

  readonly sel = signal(0);
  readonly A = computed(() => this.presets[this.sel()].A);
  readonly showField = signal(true);
  readonly trajectories = signal<Trajectory[]>([]);

  setPreset(i: number): void {
    this.sel.set(i);
    this.trajectories.set([]);
  }

  // Vector field as a list of arrows on a grid
  readonly vectorField = computed(() => {
    if (!this.showField()) return [];
    const A = this.A();
    const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        const x = i;
        const y = j;
        // velocity at (x, y) = A * (x, y)
        const vx = A[0][0] * x + A[0][1] * y;
        const vy = A[1][0] * x + A[1][1] * y;
        // Normalise length to fixed display length
        const len = Math.hypot(vx, vy);
        if (len < 0.01) continue;
        const targetLen = 12;
        const dx = (vx / len) * targetLen;
        const dy = -(vy / len) * targetLen;
        arrows.push({ x: x * 25, y: -y * 25, dx, dy });
      }
    }
    return arrows;
  });

  // Click handler: convert click position to math coords, generate trajectory
  addTrajectory(event: MouseEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;
    // Convert to viewBox coords (-130 -130 260 260)
    const vx = (cx / rect.width) * 260 - 130;
    const vy = (cy / rect.height) * 260 - 130;
    // Convert to math coords (svg uses y-down, math uses y-up; scale 25)
    const mathX = vx / 25;
    const mathY = -vy / 25;

    // Skip if too close to origin (would just be 0)
    if (Math.hypot(mathX, mathY) < 0.1) return;

    // Integrate trajectory using RK4
    const A = this.A();
    const points: { x: number; y: number }[] = [{ x: mathX, y: mathY }];
    let x = mathX, y = mathY;
    const dt = 0.04;
    for (let step = 0; step < 250; step++) {
      // RK4
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
      points.push({ x, y });
      // Stop if outside view
      if (Math.abs(x) > 6 || Math.abs(y) > 6) break;
    }

    const color = COLORS[this.trajectories().length % COLORS.length];
    this.trajectories.update((t) => [...t, { points, color }]);
  }

  trajPath(traj: Trajectory): string {
    return 'M ' + traj.points.map((p) => `${(p.x * 25).toFixed(1)},${(-p.y * 25).toFixed(1)}`).join(' L ');
  }

  clearTrajectories(): void {
    this.trajectories.set([]);
  }
}
