import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Van der Pol oscillator:
 *   x'' - μ(1 - x²)·x' + x = 0
 * As system:
 *   x' = y
 *   y' = μ(1 - x²)·y - x
 */
function vdp(x: number, y: number, mu: number): [number, number] {
  return [y, mu * (1 - x * x) * y - x];
}

function integrate(
  x0: number, y0: number,
  mu: number,
  tMax: number,
  dt = 0.01,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [[x0, y0]];
  let x = x0, y = y0;
  const n = Math.ceil(tMax / dt);
  for (let i = 0; i < n; i++) {
    const [k1x, k1y] = vdp(x, y, mu);
    const [k2x, k2y] = vdp(x + (dt / 2) * k1x, y + (dt / 2) * k1y, mu);
    const [k3x, k3y] = vdp(x + (dt / 2) * k2x, y + (dt / 2) * k2y, mu);
    const [k4x, k4y] = vdp(x + dt * k3x, y + dt * k3y, mu);
    x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 10 || Math.abs(y) > 10) break;
    pts.push([x, y]);
  }
  return pts;
}

const PX = 30;

@Component({
  selector: 'app-de-ch9-vdp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="極限環：Van der Pol 振盪器" subtitle="§9.5">
      <p>
        Lotka-Volterra 展示了閉合軌道，但軌道<em>有無窮多條</em>——每個初值對應一條。
        現在看更強烈的現象：<strong>所有初值收斂到同一條閉合軌道</strong>。
      </p>
      <p class="key-idea">
        這種「<strong>唯一的閉合吸引軌道</strong>」叫做<strong>極限環（limit cycle）</strong>。
        是純非線性現象——線性系統不可能有！
        （線性系統要嘛所有軌跡爆炸、要嘛全部收斂到原點、要嘛所有閉合軌道並存。）
      </p>
      <p>
        經典例子：<strong>Van der Pol 振盪器</strong>（1927 年 Balthasar van der Pol 在研究電子三極管電路時發現）：
      </p>
      <div class="centered-eq big">
        x″ − μ(1 − x²)·x′ + x = 0
      </div>
      <p>
        關鍵在阻尼項 <code>μ(1 − x²)</code>：
      </p>
      <ul>
        <li><strong>小振幅（|x| &lt; 1）</strong>：阻尼係數為正 → 系統「打氣」→ 振幅增長</li>
        <li><strong>大振幅（|x| &gt; 1）</strong>：阻尼係數為負 → 系統耗能 → 振幅衰退</li>
        <li><strong>結果</strong>：系統被兩邊夾逼，最後鎖定在<strong>某一個特定振幅</strong>——極限環</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="點相平面任一點 → 看軌跡被吸引到同一條極限環">
      <div class="plot-wrap">
        <svg viewBox="-150 -120 300 240" class="plot-svg"
          (click)="handleClick($event)"
          #plotSvg>
          <!-- Grid -->
          @for (g of [-4, -3, -2, -1, 1, 2, 3, 4]; track g) {
            <line [attr.x1]="g * PX" y1="-110" [attr.x2]="g * PX" y2="110"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
            <line x1="-140" [attr.y1]="-g * PX" x2="140" [attr.y2]="-g * PX"
              stroke="var(--border)" stroke-width="0.3" opacity="0.5" />
          }
          <line x1="-140" y1="0" x2="140" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="1" />

          <!-- Vector field -->
          @for (a of vectorField(); track a.k) {
            <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"
              stroke="var(--text-muted)" stroke-width="0.8"
              stroke-linecap="round" opacity="0.45" />
          }

          <!-- Limit cycle (bold orange) -->
          <path [attr.d]="limitCyclePath()" fill="none"
            stroke="#c87b5e" stroke-width="2.5" opacity="0.9" />
          <text x="-6" y="-94" class="cycle-lab" style="fill: #c87b5e" text-anchor="end">
            極限環（所有軌跡的終點）
          </text>

          <!-- Unstable origin -->
          <circle cx="0" cy="0" r="5" fill="none" stroke="#c87b5e" stroke-width="2" />

          <!-- User trajectories -->
          @for (tr of trajectories(); track $index) {
            <path [attr.d]="tr.path" fill="none"
              [attr.stroke]="tr.color" stroke-width="1.5" opacity="0.8" />
            <circle [attr.cx]="tr.x0 * PX" [attr.cy]="-tr.y0 * PX" r="3.5"
              [attr.fill]="tr.color" stroke="white" stroke-width="1" />
          }

          <text x="144" y="4" class="ax">x</text>
          <text x="4" y="-114" class="ax">y = x′</text>
        </svg>
        <div class="hint">
          點圖上任何位置（不管是極限環內還是外）→ 軌跡都會收斂到那條橙色閉合曲線。
          <strong>極限環：吸引所有起點</strong>（除了原點，那是不穩定焦點）。
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">非線性強度 μ</span>
          <input type="range" min="0.1" max="4" step="0.05"
            [value]="mu()" (input)="onMuChange($event)" />
          <span class="sl-val">{{ mu().toFixed(2) }}</span>
        </div>
        <div class="presets">
          <button class="pre" (click)="setMu(0.2)">μ=0.2（接近正弦）</button>
          <button class="pre" (click)="setMu(1)">μ=1（經典）</button>
          <button class="pre" (click)="setMu(2.5)">μ=2.5（鬆弛振盪）</button>
        </div>
        <button class="clear-btn" (click)="clearTrajectories()">清除軌跡</button>

        <div class="mu-note">
          @if (mu() < 0.3) {
            <strong>μ 很小：</strong>極限環接近半徑 2 的圓——跟線性系統的中心類似但會收斂。
          } @else if (mu() < 1.5) {
            <strong>μ 中等：</strong>極限環略為變形——這是教科書最常展示的形狀。
          } @else {
            <strong>μ 很大：</strong>「<strong>鬆弛振盪</strong>」——
            軌跡在極限環上分成「快速跳躍 + 緩慢爬升」的兩階段，像心跳、霓虹燈閃爍。
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        極限環在自然界無處不在——都是非線性的特殊饋贈：
      </p>
      <ul>
        <li><strong>心跳</strong>：心肌細胞的電位振盪。</li>
        <li><strong>神經元的 spike</strong>：Hodgkin-Huxley 模型、FitzHugh-Nagumo 模型。</li>
        <li><strong>霓虹燈閃爍、弛緩振盪器電路</strong>：Van der Pol 的原版應用。</li>
        <li><strong>晝夜節律</strong>：生物內部時鐘。</li>
        <li><strong>肌肉顫動、癲癇波</strong>：病理上的異常極限環。</li>
      </ul>
      <p>
        這些系統的一個共同點：<strong>頻率與振幅對外部擾動有強韌性</strong>——
        不管你如何初始化或輕輕擾動，系統總會回到同一個頻率和振幅。
        這跟線性振子「振幅依賴初值」截然不同。
      </p>

      <div class="nonlinear-gifts">
        <h4>非線性 vs 線性的精神對比：</h4>
        <div class="gifts-table">
          <div class="gt-row head">
            <span>性質</span>
            <span>線性</span>
            <span>非線性</span>
          </div>
          <div class="gt-row">
            <span>振幅</span>
            <span>由初值決定</span>
            <span>由系統內稟決定（極限環）</span>
          </div>
          <div class="gt-row">
            <span>週期</span>
            <span>由係數決定，獨立於振幅</span>
            <span>一般跟振幅有關</span>
          </div>
          <div class="gt-row">
            <span>對擾動</span>
            <span>擾動被加進解中</span>
            <span>擾動被「吸收回」極限環</span>
          </div>
        </div>
      </div>

      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        極限環是非線性系統獨有的行為——<strong>唯一的自激振盪</strong>，
        所有初值（除奇點外）都被吸引到它。
        這個「振幅內稟、對擾動強韌」的特性讓極限環在生物、工程、電路上非常重要。
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

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .plot-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 12px;
    }

    .plot-svg {
      width: 100%;
      display: block;
      max-width: 480px;
      margin: 0 auto;
      cursor: crosshair;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .cycle-lab {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .hint {
      margin-top: 6px;
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
      line-height: 1.6;
    }

    .ctrl {
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

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
      min-width: 100px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 50px;
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

    .pre:hover { border-color: var(--accent); color: var(--accent); }

    .clear-btn {
      font: inherit;
      font-size: 11px;
      padding: 5px 12px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text-muted);
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 8px;
    }

    .clear-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .mu-note {
      padding: 10px 12px;
      background: var(--bg);
      border-left: 3px solid var(--accent);
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .mu-note strong {
      color: var(--accent);
    }

    .nonlinear-gifts {
      padding: 14px;
      background: var(--accent-10);
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      margin: 12px 0;
    }

    .nonlinear-gifts h4 {
      margin: 0 0 10px;
      font-size: 14px;
      color: var(--accent);
    }

    .gifts-table {
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }

    .gt-row {
      display: grid;
      grid-template-columns: 80px 1fr 1.5fr;
      gap: 10px;
      padding: 8px 12px;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      align-items: center;
    }

    .gt-row:last-child { border-bottom: none; }

    .gt-row.head {
      background: var(--bg-surface);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .gt-row span:nth-child(2) {
      color: #5a8aa8;
    }

    .gt-row.head span:nth-child(2) {
      color: var(--text-muted);
    }

    .gt-row span:nth-child(3) {
      color: var(--accent);
      font-weight: 600;
    }

    .gt-row.head span:nth-child(3) {
      color: var(--text-muted);
      font-weight: 700;
    }
  `,
})
export class DeCh9VdpComponent implements OnInit, OnDestroy {
  readonly PX = PX;
  readonly mu = signal(1);

  readonly trajectories = signal<Array<{
    x0: number; y0: number; color: string; path: string;
  }>>([]);

  readonly plotSvgRef = viewChild<ElementRef<SVGSVGElement>>('plotSvg');

  private colorIdx = 0;
  private readonly COLORS = ['var(--accent)', '#5ca878', '#5a8aa8', '#8b6aa8', '#a89a5c'];

  ngOnInit(): void {
    // Default trajectories from inside and outside limit cycle
    this.addTrajectory(0.3, 0.3);
    this.addTrajectory(3.5, 0);
    this.addTrajectory(-3, 2);
  }

  ngOnDestroy(): void {}

  onMuChange(ev: Event): void {
    this.mu.set(+(ev.target as HTMLInputElement).value);
    this.clearTrajectories();
    // re-add default trajectories
    this.addTrajectory(0.3, 0.3);
    this.addTrajectory(3.5, 0);
    this.addTrajectory(-3, 2);
  }

  setMu(mu: number): void {
    this.mu.set(mu);
    this.clearTrajectories();
    this.addTrajectory(0.3, 0.3);
    this.addTrajectory(3.5, 0);
    this.addTrajectory(-3, 2);
  }

  clearTrajectories(): void {
    this.trajectories.set([]);
  }

  handleClick(event: MouseEvent): void {
    const svg = this.plotSvgRef()?.nativeElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = pt.matrixTransform(ctm.inverse());
    const x0 = inv.x / PX;
    const y0 = -inv.y / PX;
    if (Math.abs(x0) > 4.5 || Math.abs(y0) > 4) return;
    this.addTrajectory(x0, y0);
  }

  private addTrajectory(x0: number, y0: number): void {
    const pts = integrate(x0, y0, this.mu(), 25);
    const path = pts
      .map(([x, y], i) => {
        const xc = Math.max(-4.5, Math.min(4.5, x));
        const yc = Math.max(-4, Math.min(4, y));
        return `${i === 0 ? 'M' : 'L'} ${(xc * PX).toFixed(1)} ${(-yc * PX).toFixed(1)}`;
      })
      .join(' ');

    const color = this.COLORS[this.colorIdx % this.COLORS.length];
    this.colorIdx++;

    const next = [...this.trajectories()];
    next.push({ x0, y0, color, path });
    this.trajectories.set(next);
  }

  /**
   * The limit cycle itself (integrate far enough from a starting point to lock on).
   */
  readonly limitCyclePath = computed(() => {
    // Start from a point that will quickly spiral into the cycle
    const warmup = integrate(2, 0, this.mu(), 100);
    if (warmup.length < 200) return '';

    // Take the last ~2000 points to get a stable cycle trace
    const cycle = warmup.slice(Math.max(0, warmup.length - 2000));
    return cycle
      .map(([x, y], i) => {
        const xc = Math.max(-4.5, Math.min(4.5, x));
        const yc = Math.max(-4, Math.min(4, y));
        return `${i === 0 ? 'M' : 'L'} ${(xc * PX).toFixed(1)} ${(-yc * PX).toFixed(1)}`;
      })
      .join(' ');
  });

  readonly vectorField = computed(() => {
    const mu = this.mu();
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let xi = -4; xi <= 4.01; xi += 0.7) {
      for (let yi = -3.5; yi <= 3.5; yi += 0.7) {
        const [fx, fy] = vdp(xi, yi, mu);
        const mag = Math.hypot(fx, fy);
        if (mag < 0.02) continue;
        const cx = xi * PX;
        const cy = -yi * PX;
        const scale = 10 / mag;
        out.push({
          k: `${xi.toFixed(1)}_${yi.toFixed(1)}`,
          x1: cx, y1: cy,
          x2: cx + fx * scale, y2: cy - fy * scale,
        });
      }
    }
    return out;
  });
}
