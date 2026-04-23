import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Lotka-Volterra:
 *   x' = a·x - b·x·y   (prey)
 *   y' = -c·y + d·x·y   (predator)
 *
 * Equilibria: (0, 0) saddle, (c/d, a/b) center (linearization).
 * Nonlinear: closed orbits around center (conserved quantity V = d·x - c·ln x + b·y - a·ln y)
 */
const A_PARAM = 1;
const B_PARAM = 1;
const C_PARAM = 1;
const D_PARAM = 1;
// Equilibrium at (c/d, a/b) = (1, 1)

function lv(x: number, y: number): [number, number] {
  return [A_PARAM * x - B_PARAM * x * y, -C_PARAM * y + D_PARAM * x * y];
}

function integrate(x0: number, y0: number, tMax: number, dt = 0.01): Array<{ t: number; x: number; y: number }> {
  const pts: Array<{ t: number; x: number; y: number }> = [{ t: 0, x: x0, y: y0 }];
  let x = x0, y = y0;
  const n = Math.ceil(tMax / dt);
  for (let i = 0; i < n; i++) {
    const [k1x, k1y] = lv(x, y);
    const [k2x, k2y] = lv(x + (dt / 2) * k1x, y + (dt / 2) * k1y);
    const [k3x, k3y] = lv(x + (dt / 2) * k2x, y + (dt / 2) * k2y);
    const [k4x, k4y] = lv(x + dt * k3x, y + dt * k3y);
    x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    if (!isFinite(x) || !isFinite(y) || x < 0 || y < 0) break;
    pts.push({ t: (i + 1) * dt, x, y });
  }
  return pts;
}

const PX_PHASE = 40;
const PX_TIME_T = 16;
const PX_TIME_Y = 24;

@Component({
  selector: 'app-de-ch9-lotka',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Lotka-Volterra：捕食者與獵物" subtitle="§9.4">
      <p>
        生態學最經典的非線性模型——1920 年代義大利數學家 Lotka 跟 Volterra 獨立提出的「捕食—獵物」動力學。
      </p>
      <div class="centered-eq big">
        x′ = a·x − b·x·y   (獵物)<br>
        y′ = −c·y + d·x·y  (捕食者)
      </div>
      <p class="key-idea">
        <strong>直觀解讀</strong>：
      </p>
      <ul>
        <li><code>x</code> = 兔子（獵物）；<code>y</code> = 狼（捕食者）</li>
        <li>獵物自然成長（+ax），但被狼吃（−bxy —— 兩物種相遇次數）</li>
        <li>捕食者自然餓死（−cy），但因吃獵物而增長（+dxy）</li>
        <li><strong>xy 乘積項讓系統非線性</strong>——疊加原理失效</li>
      </ul>
      <p>
        兩平衡點：
      </p>
      <ul>
        <li><strong>(0, 0)</strong>：兩族群滅絕。Jacobian 對角 (a, −c) → 鞍點。</li>
        <li><strong>(c/d, a/b)</strong> = (1, 1)：共存。Jacobian = [[0, −bc/d], [ad/b, 0]] → τ = 0, Δ &gt; 0 → <strong>中心（線性化）</strong>。</li>
      </ul>
      <div class="warning-box">
        ⚠ 上一節說過：中心在 Hartman-Grobman 下<strong>沒有保證</strong>。但 Lotka-Volterra 是幸運的例外——
        真的是中心（閉合軌道），因為它有<strong>守恆量</strong>：V(x, y) = d·x − c·ln x + b·y − a·ln y 為常數。
        能量守恆讓軌跡沒有收縮或擴張的「餘地」。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="點相平面任一點 → 看捕食—獵物循環">
      <div class="layout">
        <div class="phase-col">
          <div class="ph-head">相平面 (兔子 x, 狼 y)</div>
          <svg viewBox="-30 -120 180 150" class="phase-svg"
            (click)="handleClick($event)"
            #phaseSvg>
            <!-- Grid -->
            @for (g of [1, 2, 3]; track g) {
              <line [attr.x1]="g * PX_PHASE" y1="-110" [attr.x2]="g * PX_PHASE" y2="10"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
              <line x1="-20" [attr.y1]="-g * PX_PHASE" x2="150" [attr.y2]="-g * PX_PHASE"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
            }
            <!-- Axes (x, y > 0) -->
            <line x1="0" y1="0" x2="150" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-110" x2="0" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <text x="154" y="4" class="ax">兔 x</text>
            <text x="-4" y="-114" class="ax">狼 y</text>

            <!-- Vector field -->
            @for (a of vectorField; track a.k) {
              <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"
                stroke="var(--text-muted)" stroke-width="0.8"
                stroke-linecap="round" opacity="0.4" />
            }

            <!-- Equilibria -->
            <circle cx="0" cy="0" r="5" fill="#c87b5e" stroke="white" stroke-width="1.5" />
            <text x="6" y="-6" class="eq-lbl" style="fill: #c87b5e">(0,0) 滅絕</text>
            <circle [attr.cx]="1 * PX_PHASE" [attr.cy]="-1 * PX_PHASE" r="5"
              fill="#8b6aa8" stroke="white" stroke-width="1.5" />
            <text [attr.x]="1 * PX_PHASE + 8" [attr.y]="-1 * PX_PHASE - 6" class="eq-lbl"
              style="fill: #8b6aa8">(1,1) 共存</text>

            <!-- User trajectories -->
            @for (tr of trajectories(); track $index) {
              <path [attr.d]="tr.phasePath" fill="none"
                [attr.stroke]="tr.color" stroke-width="2" opacity="0.85" />
              <circle [attr.cx]="tr.x0 * PX_PHASE" [attr.cy]="-tr.y0 * PX_PHASE" r="4"
                [attr.fill]="tr.color" stroke="white" stroke-width="1.5" />
            }

            <!-- Playback cursor for latest trajectory -->
            @if (currentPoint(); as p) {
              <circle [attr.cx]="p.x * PX_PHASE" [attr.cy]="-p.y * PX_PHASE" r="5"
                fill="var(--accent)" stroke="white" stroke-width="2" />
            }
          </svg>
          <div class="ph-hint">點圖上任一點（x &gt; 0, y &gt; 0）放入新軌跡。</div>
        </div>

        <div class="time-col">
          <div class="ph-head">時間序列 x(t), y(t)</div>
          <svg viewBox="-10 -110 340 140" class="time-svg">
            <line x1="0" y1="0" x2="320" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-100" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
            <text x="324" y="4" class="ax">t</text>

            @for (g of [1, 2, 3]; track g) {
              <line x1="0" [attr.y1]="-g * PX_TIME_Y" x2="320" [attr.y2]="-g * PX_TIME_Y"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
              <text x="-4" [attr.y]="-g * PX_TIME_Y + 3" class="tick">{{ g }}</text>
            }

            @if (latestTrajectory(); as tr) {
              <path [attr.d]="tr.xTimePath" fill="none"
                stroke="#5ca878" stroke-width="1.8" />
              <path [attr.d]="tr.yTimePath" fill="none"
                stroke="#c87b5e" stroke-width="1.8" />

              <line [attr.x1]="t() * PX_TIME_T" y1="-100" [attr.x2]="t() * PX_TIME_T" y2="20"
                stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />

              @if (currentPoint(); as p) {
                <circle [attr.cx]="t() * PX_TIME_T" [attr.cy]="-p.x * PX_TIME_Y" r="3.5"
                  fill="#5ca878" stroke="white" stroke-width="1" />
                <circle [attr.cx]="t() * PX_TIME_T" [attr.cy]="-p.y * PX_TIME_Y" r="3.5"
                  fill="#c87b5e" stroke="white" stroke-width="1" />
              }

              <!-- Legend -->
              <rect x="260" y="-106" width="60" height="28" fill="var(--bg-surface)"
                stroke="var(--border)" rx="3" />
              <line x1="264" y1="-98" x2="276" y2="-98" stroke="#5ca878" stroke-width="2" />
              <text x="280" y="-95" class="leg">兔 x</text>
              <line x1="264" y1="-86" x2="276" y2="-86" stroke="#c87b5e" stroke-width="2" />
              <text x="280" y="-83" class="leg">狼 y</text>
            }
          </svg>
          @if (latestTrajectory(); as tr) {
            <div class="period-display">
              週期 ≈ {{ tr.period.toFixed(2) }} s
            </div>
          }
        </div>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="clearAll()">↻ 清除所有軌跡</button>
        </div>
        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        試試看不同的初值——你會發現：
      </p>
      <ul>
        <li><strong>所有軌跡都是閉合的</strong>——這是中心的標誌。</li>
        <li><strong>捕食者和獵物有「相位差」</strong>：兔子多時狼開始繁殖、狼多到兔子變少、兔子少後狼餓死、狼少後兔子回升——<strong>永遠循環</strong>。</li>
        <li><strong>振幅大小由初值決定</strong>——不同的閉合軌跡對應不同的族群波動幅度。</li>
        <li><strong>週期在大振幅下變長</strong>——非線性的特徵之一（線性系統週期固定）。</li>
      </ul>
      <p>
        歷史小記：Volterra 分析第一次世界大戰後亞得里亞海的漁業數據——發現鯊魚（捕食者）比例在戰時反而上升，
        因為捕魚減少後獵物變多了。
        這個反直覺的現象就是 Lotka-Volterra 預測到的：「<strong>獵物平均數只被捕食者的死亡率 c/d 決定，與獵物繁殖率 a 無關</strong>。」
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Lotka-Volterra 展示了非線性系統的特有行為——<strong>閉合軌道 + 週期循環</strong>。
        雖然每條軌跡都線性化為中心，但它們的週期跟振幅跟初值都有關——這種行為線性系統做不到。
        然而中心不是「穩定」——微小擾動會讓軌跡跳到不同的閉合曲線。真實生態系有阻尼或食物上限時，這中心會退化成穩定焦點。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 18px; padding: 16px; line-height: 1.7; }

    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    .warning-box {
      padding: 12px 14px;
      background: rgba(244, 200, 102, 0.08);
      border: 1px solid rgba(244, 200, 102, 0.3);
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin: 12px 0;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    @media (max-width: 700px) {
      .layout { grid-template-columns: 1fr; }
    }

    .phase-col, .time-col {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .ph-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .phase-svg, .time-svg {
      width: 100%;
      display: block;
    }

    .phase-svg { cursor: crosshair; }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: end;
      font-family: 'JetBrains Mono', monospace;
    }

    .eq-lbl {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .leg {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .ph-hint {
      margin-top: 4px;
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
    }

    .period-display {
      margin-top: 6px;
      padding: 6px 10px;
      background: var(--bg-surface);
      border-radius: 6px;
      text-align: center;
      font-size: 12px;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }

    .play-btn, .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn { background: transparent; color: var(--accent); }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 30px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 52px;
      text-align: right;
    }
  `,
})
export class DeCh9LotkaComponent implements OnInit, OnDestroy {
  readonly PX_PHASE = PX_PHASE;
  readonly PX_TIME_T = PX_TIME_T;
  readonly PX_TIME_Y = PX_TIME_Y;
  readonly T_MAX = 20;

  readonly trajectories = signal<Array<{
    x0: number;
    y0: number;
    color: string;
    pts: Array<{ t: number; x: number; y: number }>;
    phasePath: string;
    xTimePath: string;
    yTimePath: string;
    period: number;
  }>>([]);

  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;
  private colorIdx = 0;
  private readonly COLORS = ['var(--accent)', '#5a8aa8', '#a89a5c', '#8b6aa8'];

  ngOnInit(): void {
    // Add a default trajectory for initial view
    this.addTrajectory(2, 0.5);

    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.2;
        if (newT >= this.T_MAX) {
          this.t.set(this.T_MAX);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  togglePlay(): void {
    if (this.t() >= this.T_MAX - 0.05) this.t.set(0);
    this.playing.set(!this.playing());
  }

  clearAll(): void {
    this.trajectories.set([]);
    this.t.set(0);
    this.playing.set(false);
  }

  handleClick(event: MouseEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const x = inv.x / PX_PHASE;
    const y = -inv.y / PX_PHASE;
    if (x < 0.05 || y < 0.05 || x > 3.5 || y > 2.8) return;
    this.addTrajectory(x, y);
  }

  private addTrajectory(x0: number, y0: number): void {
    const pts = integrate(x0, y0, this.T_MAX, 0.01);
    const color = this.COLORS[this.colorIdx % this.COLORS.length];
    this.colorIdx++;

    // Build paths
    const phasePath = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x * PX_PHASE).toFixed(1)} ${(-p.y * PX_PHASE).toFixed(1)}`)
      .join(' ');

    const xTimePath = pts
      .filter((_, i) => i % 2 === 0)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t * PX_TIME_T).toFixed(1)} ${(-Math.min(4, p.x) * PX_TIME_Y).toFixed(1)}`)
      .join(' ');

    const yTimePath = pts
      .filter((_, i) => i % 2 === 0)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t * PX_TIME_T).toFixed(1)} ${(-Math.min(4, p.y) * PX_TIME_Y).toFixed(1)}`)
      .join(' ');

    // Estimate period by finding when trajectory returns close to start
    let period = 0;
    const threshold = 0.05;
    for (let i = 50; i < pts.length; i++) {
      const dx = pts[i].x - x0;
      const dy = pts[i].y - y0;
      if (Math.hypot(dx, dy) < threshold) {
        period = pts[i].t;
        break;
      }
    }

    const next = [...this.trajectories()];
    next.push({ x0, y0, color, pts, phasePath, xTimePath, yTimePath, period });
    this.trajectories.set(next);
    this.t.set(0);
  }

  readonly latestTrajectory = computed(() => {
    const trs = this.trajectories();
    return trs.length > 0 ? trs[trs.length - 1] : null;
  });

  readonly currentPoint = computed(() => {
    const tr = this.latestTrajectory();
    if (!tr) return null;
    const idx = Math.min(tr.pts.length - 1, Math.floor(this.t() / 0.01));
    return { x: tr.pts[idx].x, y: tr.pts[idx].y };
  });

  // Precomputed vector field for the phase plane
  readonly vectorField = (() => {
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let xi = 0.2; xi <= 3.2; xi += 0.35) {
      for (let yi = 0.2; yi <= 2.8; yi += 0.35) {
        const [fx, fy] = lv(xi, yi);
        const mag = Math.hypot(fx, fy);
        if (mag < 0.02) continue;
        const cx = xi * PX_PHASE;
        const cy = -yi * PX_PHASE;
        const scale = 10 / mag;
        out.push({
          k: `${xi.toFixed(1)}_${yi.toFixed(1)}`,
          x1: cx, y1: cy,
          x2: cx + fx * scale, y2: cy - fy * scale,
        });
      }
    }
    return out;
  })();
}
