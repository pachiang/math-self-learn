import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const M = 1;
const K = 4; // ω₀ = √(k/m) = 2
const OMEGA0 = Math.sqrt(K / M);
const C_CRIT = 2 * Math.sqrt(M * K); // critical damping = 4

function solve(c: number, t: number, y0 = 1, v0 = 0): number {
  // m·y'' + c·y' + k·y = 0
  // roots: r = (-c ± sqrt(c² - 4mk)) / (2m)
  const disc = c * c - 4 * M * K;
  if (Math.abs(disc) < 1e-6) {
    // critical
    const r = -c / (2 * M);
    // y(0) = C1 = y0, y'(0) = C1·r + C2 = v0 → C2 = v0 - r·y0
    const C1 = y0;
    const C2 = v0 - r * y0;
    return (C1 + C2 * t) * Math.exp(r * t);
  } else if (disc > 0) {
    // overdamped (two real roots)
    const s = Math.sqrt(disc);
    const r1 = (-c - s) / (2 * M);
    const r2 = (-c + s) / (2 * M);
    const den = r1 - r2;
    // y(0) = C1 + C2 = y0; y'(0) = C1·r1 + C2·r2 = v0
    const C1 = (y0 * r2 - v0) / (r2 - r1);
    const C2 = y0 - C1;
    return C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
  } else {
    // underdamped (complex roots α ± iβ)
    const alpha = -c / (2 * M);
    const beta = Math.sqrt(-disc) / (2 * M);
    // y(0) = C1 = y0; y'(0) = C1·α + C2·β = v0 → C2 = (v0 - α·y0)/β
    const C1 = y0;
    const C2 = (v0 - alpha * y0) / beta;
    return Math.exp(alpha * t) * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t));
  }
}

const PX_PER_T = 40;
const PX_PER_Y = 40;

@Component({
  selector: 'app-de-ch5-damping',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="阻尼的三種命運" subtitle="§5.4">
      <p>
        現實中的彈簧系統總有<strong>摩擦或空氣阻力</strong>——能量會漸漸耗掉。把阻尼項 <code>c·y′</code> 加進去：
      </p>
      <div class="centered-eq big">m·y″ + c·y′ + k·y = 0</div>
      <p>
        特徵方程 <code>mr² + cr + k = 0</code>，判別式 <code>Δ = c² − 4mk</code> 決定系統的「命運」：
      </p>
      <div class="cases-grid">
        <div class="case" [style.--col]="'#8b6aa8'">
          <div class="c-tag">Δ > 0</div>
          <div class="c-name">過阻尼</div>
          <div class="c-cond">c > c_crit</div>
          <p>兩負實根，純衰退，<strong>不振盪</strong>。慢慢回歸平衡。</p>
        </div>
        <div class="case" [style.--col]="'#c87b5e'">
          <div class="c-tag">Δ = 0</div>
          <div class="c-name">臨界阻尼</div>
          <div class="c-cond">c = c_crit</div>
          <p>重根，<strong>最快回到平衡不振盪</strong>——工程上的理想阻尼（例如汽車懸吊）。</p>
        </div>
        <div class="case" [style.--col]="'#5ca878'">
          <div class="c-tag">Δ < 0</div>
          <div class="c-name">欠阻尼</div>
          <div class="c-cond">c < c_crit</div>
          <p>複根 α ± iβ，振幅指數衰退 × 正弦振盪。</p>
        </div>
      </div>
      <p>
        臨界阻尼 <code>c_crit = 2√(mk)</code> 是一個特殊的「相變」點：
        <strong>越過它，系統從振盪變成純衰退</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖阻尼係數 c：看三種行為模式切換">
      <div class="chart-wrap">
        <div class="chart-title">y(t) 對比：三種阻尼</div>
        <svg viewBox="-10 -100 360 170" class="chart-svg">
          <line x1="0" y1="0" x2="340" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-90" x2="0" y2="60" stroke="var(--border-strong)" stroke-width="1" />
          <text x="344" y="4" class="ax">t</text>
          <text x="-4" y="-92" class="ax">y</text>

          @for (g of [-1.5, -1, -0.5, 0.5, 1, 1.5]; track g) {
            <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="340" [attr.y2]="-g * PX_PER_Y"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }

          <!-- Three reference curves: current c, plus 3 presets overlaid dimly -->
          <path [attr.d]="overdampedRef()" fill="none"
            stroke="#8b6aa8" stroke-width="1.5" opacity="0.35" />
          <path [attr.d]="criticalRef()" fill="none"
            stroke="#c87b5e" stroke-width="1.5" opacity="0.35" />
          <path [attr.d]="underdampedRef()" fill="none"
            stroke="#5ca878" stroke-width="1.5" opacity="0.35" />

          <!-- Highlighted current c -->
          <path [attr.d]="currentCurve()" fill="none"
            stroke="var(--accent)" stroke-width="2.5" />

          <!-- Mass position indicator -->
          <circle [attr.cx]="t() * PX_PER_T" [attr.cy]="-currentY() * PX_PER_Y"
            r="4.5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
        </svg>

        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:#8b6aa8"></span>過阻尼 (c=6)</span>
          <span class="leg"><span class="leg-dot" style="background:#c87b5e"></span>臨界 (c=4)</span>
          <span class="leg"><span class="leg-dot" style="background:#5ca878"></span>欠阻尼 (c=0.8)</span>
          <span class="leg"><span class="leg-dot" style="background:var(--accent)"></span>目前 c</span>
        </div>
      </div>

      <!-- Mass scene -->
      <div class="scene-wrap">
        <div class="scene-title">對應的彈簧—質量模擬（同一個初值）</div>
        <svg viewBox="-150 -60 300 120" class="scene-svg">
          <!-- Wall -->
          <line x1="-140" y1="-40" x2="-140" y2="40" stroke="var(--text)" stroke-width="2.5" />

          <!-- Equilibrium marker -->
          <line x1="0" y1="-25" x2="0" y2="25"
            stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" />
          <text x="0" y="-32" class="eq-lbl" text-anchor="middle">平衡</text>

          <!-- Spring -->
          <polyline [attr.points]="springPoints()"
            fill="none" stroke="var(--text-muted)" stroke-width="1.5" />

          <!-- Damper (dashpot) visualization -->
          <g transform="translate(-70, 25)">
            <rect x="-20" y="-4" width="40" height="8"
              fill="none" stroke="var(--text-muted)" stroke-width="1" />
            <line x1="-22" y1="0" x2="18" y2="0"
              stroke="var(--text-muted)" stroke-width="2" opacity="0.7" />
            <text x="0" y="16" class="eq-lbl" text-anchor="middle">阻尼器 c = {{ c().toFixed(1) }}</text>
          </g>

          <!-- Mass -->
          <rect [attr.x]="currentY() * 60 - 18" y="-18" width="36" height="36" rx="4"
            fill="var(--accent)" opacity="0.88" />
        </svg>
      </div>

      <!-- Controls -->
      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>

        <div class="sl">
          <span class="sl-lab">阻尼 c</span>
          <input type="range" min="0" max="10" step="0.05"
            [value]="c()" (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c().toFixed(2) }}</span>
        </div>

        <div class="presets">
          <button class="pre" (click)="c.set(0)">c=0（無阻尼）</button>
          <button class="pre" (click)="c.set(0.8)">c=0.8（欠阻尼）</button>
          <button class="pre" (click)="c.set(C_CRIT)">c={{ C_CRIT }}（臨界）</button>
          <button class="pre" (click)="c.set(6)">c=6（過阻尼）</button>
        </div>

        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" max="8" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(1) }} s</span>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">c_crit = 2√(mk)</span>
            <strong>{{ C_CRIT }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">阻尼比 ζ = c / c_crit</span>
            <strong>{{ (c() / C_CRIT).toFixed(3) }}</strong>
          </div>
          <div class="ro">
            <span class="ro-k">判別式 Δ</span>
            <strong [class.pos]="discriminant() > 0.01" [class.neg]="discriminant() < -0.01">
              {{ discriminant().toFixed(3) }}
            </strong>
          </div>
          <div class="ro">
            <span class="ro-k">狀態</span>
            <strong [style.color]="regimeColor()">{{ regimeLabel() }}</strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        工程上的設計選擇：
      </p>
      <ul>
        <li><strong>汽車懸吊</strong>：略<em>欠阻尼</em>（ζ ≈ 0.2-0.3）——讓路面衝擊被吸收卻仍有「彈性」讓車身不抖動太久。</li>
        <li><strong>門的緩衝器</strong>：接近<em>臨界</em>（ζ ≈ 1）——關得快又不砰一聲。</li>
        <li><strong>地震阻尼器</strong>：偏<em>過阻尼</em>（ζ &gt; 1）——高樓大廈的液壓阻尼系統，把能量很快耗掉。</li>
      </ul>
      <p>
        物理上有趣的對比：<strong>臨界阻尼</strong>回到平衡的速度最快。再多阻尼反而更慢——因為過阻尼的動作太「黏稠」。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        有阻尼的二階 ODE 由<strong>判別式 c² − 4mk</strong> 分成三類：振盪衰退（欠）、最速返回（臨界）、慢衰退不振盪（過）。
        同一個方程、三種截然不同的物理，全由單一參數 c 決定。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 18px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 22px; padding: 16px; }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .case {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 6%, var(--bg));
    }

    .c-tag {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--col);
      font-weight: 700;
    }

    .c-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin: 2px 0 2px;
    }

    .c-cond {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .case p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .chart-wrap, .scene-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 14px;
    }

    .chart-title, .scene-title {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-svg, .scene-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .eq-lbl {
      font-size: 9px;
      fill: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .legend {
      display: flex;
      gap: 12px;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-muted);
      justify-content: center;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .leg-dot {
      display: inline-block;
      width: 12px;
      height: 3px;
      border-radius: 2px;
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
    .play-btn:hover, .reset-btn:hover { opacity: 0.85; }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 60px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 60px;
      text-align: right;
    }

    .presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .pre {
      font: inherit;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 5px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .pre:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .readout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 6px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
    }

    .ro {
      padding: 6px 10px;
      background: var(--bg);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .ro-k { color: var(--text-muted); }

    .ro strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .ro strong.pos { color: #8b6aa8; }
    .ro strong.neg { color: #5ca878; }
  `,
})
export class DeCh5DampingComponent implements OnInit, OnDestroy {
  readonly C_CRIT = C_CRIT;
  readonly PX_PER_T = PX_PER_T;
  readonly PX_PER_Y = PX_PER_Y;
  readonly c = signal(0.8);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.2;
        if (newT >= 8) {
          this.t.set(8);
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
    if (this.t() >= 7.95) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  readonly discriminant = computed(() => {
    const c = this.c();
    return c * c - 4 * M * K;
  });

  readonly currentY = computed(() => solve(this.c(), this.t()));

  readonly regimeLabel = computed(() => {
    const d = this.discriminant();
    if (Math.abs(d) < 0.05) return '臨界阻尼';
    if (d > 0) return '過阻尼';
    return '欠阻尼';
  });

  readonly regimeColor = computed(() => {
    const d = this.discriminant();
    if (Math.abs(d) < 0.05) return '#c87b5e';
    if (d > 0) return '#8b6aa8';
    return '#5ca878';
  });

  buildCurve(c: number): string {
    const pts: string[] = [];
    const n = 200;
    const tMax = 8;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * tMax;
      const y = solve(c, tt);
      const yc = Math.max(-1.8, Math.min(1.8, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly currentCurve = computed(() => this.buildCurve(this.c()));
  readonly overdampedRef = computed(() => this.buildCurve(6));
  readonly criticalRef = computed(() => this.buildCurve(C_CRIT));
  readonly underdampedRef = computed(() => this.buildCurve(0.8));

  readonly springPoints = computed(() => {
    const xStart = -140;
    // Split spring between wall and mass; mass is at y * 60
    const xEnd = this.currentY() * 60 - 18;
    const segments = 14;
    const amplitude = 5;
    const parts: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = xStart + (i / segments) * (xEnd - xStart);
      const y = (i > 0 && i < segments) ? (i % 2 === 0 ? -amplitude : amplitude) : 0;
      parts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return parts.join(' ');
  });
}
