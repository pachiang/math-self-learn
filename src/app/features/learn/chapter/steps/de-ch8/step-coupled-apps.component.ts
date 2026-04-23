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
 * Coupled spring system:
 *   Two masses m1, m2 connected by 3 springs (wall-1, 1-2, 2-wall).
 *   Equations:
 *     m1 · x1″ = -k·x1 - k_c·(x1 - x2)
 *     m2 · x2″ = -k·x2 - k_c·(x2 - x1)
 *
 *   With m1 = m2 = 1, k = 2, and k_c = coupling (variable):
 *     x1″ = -(k + kc)·x1 + kc·x2
 *     x2″ = kc·x1 - (k + kc)·x2
 *
 *   4-D linear system: state (x1, x2, v1, v2).
 *
 *   Normal modes (decoupled):
 *     sym mode:   x1 = x2,  ω² = k → ω = √k
 *     anti-sym:   x1 = -x2, ω² = k + 2kc → ω = √(k + 2kc)
 */

function solveCoupled(
  t: number,
  ic: { x1: number; x2: number; v1: number; v2: number },
  kc: number,
  k = 2,
): { x1: number; x2: number; v1: number; v2: number } {
  // Normal mode decomposition for symmetric case (m=1, same k on both):
  // sym: q_s = (x1 + x2)/2, frequency ω_s = √k
  // anti: q_a = (x1 - x2)/2, frequency ω_a = √(k + 2kc)
  const omegaS = Math.sqrt(k);
  const omegaA = Math.sqrt(k + 2 * kc);

  const qs0 = (ic.x1 + ic.x2) / 2;
  const qa0 = (ic.x1 - ic.x2) / 2;
  const ps0 = (ic.v1 + ic.v2) / 2;
  const pa0 = (ic.v1 - ic.v2) / 2;

  // Each mode: q(t) = q0 cos(ω t) + p0/ω sin(ω t)
  const qs = qs0 * Math.cos(omegaS * t) + (ps0 / omegaS) * Math.sin(omegaS * t);
  const qa = qa0 * Math.cos(omegaA * t) + (pa0 / omegaA) * Math.sin(omegaA * t);
  const ps = -qs0 * omegaS * Math.sin(omegaS * t) + ps0 * Math.cos(omegaS * t);
  const pa = -qa0 * omegaA * Math.sin(omegaA * t) + pa0 * Math.cos(omegaA * t);

  return {
    x1: qs + qa,
    x2: qs - qa,
    v1: ps + pa,
    v2: ps - pa,
  };
}

@Component({
  selector: 'app-de-ch8-coupled',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="耦合系統 + Ch9 預告" subtitle="§8.6">
      <p>
        所有前面的章節都處理<strong>單變數</strong>系統（一個彈簧、一個電容）。
        但真實世界是<strong>互相連動的</strong>：兩個彈簧、三個電感、N 個原子、成千上萬個耦合神經元。
      </p>
      <p class="key-idea">
        <strong>高維線性系統</strong>——即使狀態空間變成 4D、8D、100D——都用同樣的工具：矩陣指數、特徵值、相空間。
        只是要能想像更高維。
      </p>
      <p>
        看個典型例子：<strong>兩個彈簧連兩個質量</strong>。狀態有四維（x₁, x₂, v₁, v₂），但用<strong>正規模態</strong>分解後就變成兩個<em>獨立</em>的振動模式：
      </p>
      <ul>
        <li><strong>對稱模態</strong>：兩個質量同步振動（q_s = (x₁ + x₂)/2）— 頻率 ω_s = √(k/m)</li>
        <li><strong>反對稱模態</strong>：兩個質量反向振動（q_a = (x₁ − x₂)/2）— 頻率 ω_a = √((k + 2k_c)/m)</li>
      </ul>
      <p>
        <strong>任何初值都是這兩個模態的線性組合</strong>——跟 Ch5 的特徵值分解完全一樣，只是在 4D。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="兩彈簧耦合系統：看對稱 / 反對稱模態怎麼組合">
      <div class="scene-wrap">
        <svg viewBox="-180 -50 360 100" class="scene-svg">
          <!-- Left wall -->
          <line x1="-170" y1="-35" x2="-170" y2="35" stroke="var(--text)" stroke-width="2.5" />
          <!-- Right wall -->
          <line x1="170" y1="-35" x2="170" y2="35" stroke="var(--text)" stroke-width="2.5" />

          <!-- Equilibrium markers -->
          <line x1="-60" y1="-22" x2="-60" y2="22"
            stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.4" />
          <line x1="60" y1="-22" x2="60" y2="22"
            stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.4" />

          <!-- Spring 1: wall to mass 1 -->
          <polyline [attr.points]="spring1Points()"
            fill="none" stroke="var(--text-muted)" stroke-width="1.5" />
          <!-- Spring 2: mass 1 to mass 2 -->
          <polyline [attr.points]="spring2Points()"
            fill="none" stroke="#c87b5e" stroke-width="1.5" />
          <!-- Spring 3: mass 2 to wall -->
          <polyline [attr.points]="spring3Points()"
            fill="none" stroke="var(--text-muted)" stroke-width="1.5" />

          <!-- Mass 1 -->
          <rect [attr.x]="state().x1 * 40 + -60 - 15" y="-15"
            width="30" height="30" rx="3"
            fill="var(--accent)" opacity="0.85" />
          <text [attr.x]="state().x1 * 40 - 60" y="4" class="mass-label"
            text-anchor="middle">m₁</text>

          <!-- Mass 2 -->
          <rect [attr.x]="state().x2 * 40 + 60 - 15" y="-15"
            width="30" height="30" rx="3"
            fill="#5a8aa8" opacity="0.85" />
          <text [attr.x]="state().x2 * 40 + 60" y="4" class="mass-label"
            text-anchor="middle">m₂</text>
        </svg>
      </div>

      <div class="chart-wrap">
        <div class="ch-head">x₁(t) 與 x₂(t)</div>
        <svg viewBox="-10 -80 360 140" class="chart-svg">
          <line x1="0" y1="0" x2="340" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-70" x2="0" y2="50" stroke="var(--border-strong)" stroke-width="1" />

          @for (g of [-1.5, -1, 1, 1.5]; track g) {
            <line x1="0" [attr.y1]="-g * 25" x2="340" [attr.y2]="-g * 25"
              stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
          }

          <path [attr.d]="x1Path()" fill="none" stroke="var(--accent)" stroke-width="2" />
          <path [attr.d]="x2Path()" fill="none" stroke="#5a8aa8" stroke-width="2" />

          <line [attr.x1]="t() * 20" y1="-70" [attr.x2]="t() * 20" y2="50"
            stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 2" opacity="0.4" />

          <rect x="280" y="-76" width="56" height="26" fill="var(--bg-surface)" stroke="var(--border)" rx="3" />
          <line x1="284" y1="-68" x2="296" y2="-68" stroke="var(--accent)" stroke-width="2" />
          <text x="300" y="-65" class="leg">x₁</text>
          <line x1="284" y1="-56" x2="296" y2="-56" stroke="#5a8aa8" stroke-width="2" />
          <text x="300" y="-53" class="leg">x₂</text>
        </svg>
      </div>

      <div class="ctrl">
        <div class="row">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
        </div>

        <div class="mode-row">
          <button class="mode-btn" (click)="setSymMode()">對稱模態（同相）</button>
          <button class="mode-btn" (click)="setAntiMode()">反對稱模態（反相）</button>
          <button class="mode-btn" (click)="setMixed()">混合初值</button>
        </div>

        <div class="sl">
          <span class="sl-lab">耦合強度 k_c</span>
          <input type="range" min="0.05" max="3" step="0.05"
            [value]="kc()" (input)="kc.set(+$any($event).target.value)" />
          <span class="sl-val">{{ kc().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">t</span>
          <input type="range" min="0" [max]="T_MAX" step="0.02"
            [value]="t()" (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>

        <div class="freqs">
          <div class="freq">
            <span class="fq-lab">對稱頻率 ω_s</span>
            <strong>{{ omegaS().toFixed(3) }}</strong>
          </div>
          <div class="freq">
            <span class="fq-lab">反對稱頻率 ω_a</span>
            <strong>{{ omegaA().toFixed(3) }}</strong>
          </div>
          <div class="freq">
            <span class="fq-lab">拍頻週期 (混合)</span>
            <strong>{{ beatPeriod().toFixed(2) }} s</strong>
          </div>
        </div>

        <p class="beats-note">
          若用「混合」初值（只推 m₁、m₂ 靜止），會看到<strong>能量在兩球間來回傳遞</strong>——這正是拍頻！
          因為兩個正規模態頻率略有差距，它們相干涉產生慢速包絡。
        </p>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="Ch9 預告：邁向非線性">
      <div class="bridge">
        <div class="bridge-intro">
          你已經學會 Ch5–Ch8 的整套線性工具：解析、頻率、Laplace、矩陣指數、相平面。
          接下來 Ch9 要挑戰<strong>非線性</strong>——這裡線性的所有好性質都崩潰了。
        </div>

        <div class="loss">
          <div class="loss-head">線性世界保證的、非線性沒有：</div>
          <ul>
            <li><strong>疊加原理消失</strong>：解不能線性組合得到新解。</li>
            <li><strong>沒有通用解法</strong>：大多數非線性 ODE 沒有封閉解。</li>
            <li><strong>頻率響應不存在</strong>：非線性系統對正弦輸入的響應不是純正弦。</li>
            <li><strong>行為可以極端複雜</strong>：混沌、分岔、吸引子、奇異行為。</li>
          </ul>
        </div>

        <div class="gain">
          <div class="gain-head">但真實世界非線性的豐富行為：</div>
          <ul>
            <li><strong>極限環（limit cycle）</strong>：Van der Pol 振盪器——有獨特的自激頻率，跟初值無關。</li>
            <li><strong>捕食者—獵物循環</strong>：Lotka-Volterra 描述生態系統的週期起伏。</li>
            <li><strong>分岔</strong>：參數過一個臨界值後行為突然變——邏輯方程、種群滅絕、氣候轉折。</li>
            <li><strong>混沌</strong>：Lorenz 吸引子、雙擺——對初值極度敏感但軌跡仍有規律結構。</li>
          </ul>
        </div>

        <div class="key-trick">
          <h4>Ch9 的關鍵技巧：線性化</h4>
          <p>
            雖然整體不線性，但<strong>在每個平衡點附近</strong>可以用線性近似——
            然後套用 Ch8 這張 trace-det 分類圖判斷局部行為。
            這叫「<strong>Hartman-Grobman 定理</strong>」。
          </p>
          <p>
            換言之：<strong>你已學會的 Ch8 是 Ch9 的主要武器</strong>，只是要在每個平衡點「重新部署」一次。
          </p>
        </div>

        <a class="next-cta" href="/learn/de/ch9/1">
          下一章 — Ch9：非線性動力系統 →
        </a>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        高維線性系統 = 正規模態的疊加。每個模態獨立振動，跟單自由度 Ch5 一樣。
        但整個 Part III 的核心是<strong>非線性</strong>——下一章開始挑戰它。
        你會發現：Ch5–Ch8 學的線性工具還是主力，只是要「局部」應用。
      </p>
    </app-prose-block>
  `,
  styles: `
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

    .scene-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 10px;
    }

    .scene-svg {
      width: 100%;
      display: block;
    }

    .mass-label {
      font-size: 10px;
      fill: white;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-wrap {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin-bottom: 10px;
    }

    .ch-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .chart-svg {
      width: 100%;
      display: block;
    }

    .leg {
      font-size: 10px;
      fill: var(--text);
      font-family: 'JetBrains Mono', monospace;
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

    .mode-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .mode-btn {
      font: inherit;
      font-size: 11px;
      padding: 5px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
    }

    .mode-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
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
      min-width: 90px;
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

    .freqs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 6px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
    }

    .freq {
      padding: 6px 10px;
      background: var(--bg);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 12px;
    }

    .fq-lab {
      color: var(--text-muted);
    }

    .freq strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .beats-note {
      margin: 8px 0 0;
      padding: 8px 12px;
      background: var(--bg);
      border-radius: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .bridge {
      padding: 16px;
      border: 1.5px solid var(--accent);
      background: var(--accent-10);
      border-radius: 12px;
    }

    .bridge-intro {
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }

    .loss, .gain {
      padding: 12px;
      background: var(--bg);
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .loss-head, .gain-head {
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .loss-head { color: #c87b5e; }
    .gain-head { color: #5ca878; }

    .loss ul, .gain ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .key-trick {
      padding: 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin: 10px 0;
    }

    .key-trick h4 {
      margin: 0 0 6px;
      font-size: 14px;
      color: var(--accent);
    }

    .key-trick p {
      margin: 0 0 8px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .key-trick p:last-child { margin-bottom: 0; }

    .next-cta {
      display: inline-block;
      margin-top: 10px;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 700;
      background: var(--accent);
      color: white;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.15s;
    }

    .next-cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px var(--accent-30);
    }
  `,
})
export class DeCh8CoupledComponent implements OnInit, OnDestroy {
  readonly T_MAX = 20;
  readonly ic = signal<{ x1: number; x2: number; v1: number; v2: number }>({
    x1: 1.5, x2: 0, v1: 0, v2: 0,
  });
  readonly kc = signal(0.5);
  readonly t = signal(0);
  readonly playing = signal(false);

  private rafId: number | null = null;
  private lastFrame = 0;

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.0;
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

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  setSymMode(): void {
    this.ic.set({ x1: 1.2, x2: 1.2, v1: 0, v2: 0 });
    this.t.set(0);
  }

  setAntiMode(): void {
    this.ic.set({ x1: 1.2, x2: -1.2, v1: 0, v2: 0 });
    this.t.set(0);
  }

  setMixed(): void {
    this.ic.set({ x1: 1.5, x2: 0, v1: 0, v2: 0 });
    this.t.set(0);
  }

  readonly state = computed(() => solveCoupled(this.t(), this.ic(), this.kc()));

  readonly omegaS = computed(() => Math.sqrt(2));
  readonly omegaA = computed(() => Math.sqrt(2 + 2 * this.kc()));

  readonly beatPeriod = computed(() => {
    const diff = Math.abs(this.omegaA() - this.omegaS());
    return diff < 0.001 ? Infinity : (2 * Math.PI) / diff;
  });

  buildPath(key: 'x1' | 'x2'): string {
    const pts: string[] = [];
    const n = 400;
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * this.T_MAX;
      const s = solveCoupled(tt, this.ic(), this.kc());
      const val = s[key];
      const clamp = Math.max(-2, Math.min(2, val));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tt * 20).toFixed(1)} ${(-clamp * 25).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  readonly x1Path = computed(() => this.buildPath('x1'));
  readonly x2Path = computed(() => this.buildPath('x2'));

  /** Spring zigzag points builder — draws between two x-coords. */
  private buildSpring(xStart: number, xEnd: number, amp: number = 5): string {
    const segments = 10;
    const parts: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = xStart + (i / segments) * (xEnd - xStart);
      const y = (i > 0 && i < segments) ? (i % 2 === 0 ? -amp : amp) : 0;
      parts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return parts.join(' ');
  }

  readonly spring1Points = computed(() => {
    const m1x = this.state().x1 * 40 + -60 - 15;
    return this.buildSpring(-170, m1x);
  });

  readonly spring2Points = computed(() => {
    const m1x = this.state().x1 * 40 + -60 + 15;
    const m2x = this.state().x2 * 40 + 60 - 15;
    return this.buildSpring(m1x, m2x);
  });

  readonly spring3Points = computed(() => {
    const m2x = this.state().x2 * 40 + 60 + 15;
    return this.buildSpring(m2x, 170);
  });
}
