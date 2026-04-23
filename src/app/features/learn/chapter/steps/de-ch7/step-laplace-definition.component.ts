import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Preset {
  id: string;
  name: string;
  ft: string;
  Fs: string;
  f: (t: number) => number;
  // parameters for display
  paramLabel?: string;
  param?: number;
}

const PRESETS: Preset[] = [
  {
    id: 'const',
    name: '常數',
    ft: 'f(t) = 1',
    Fs: 'F(s) = 1/s',
    f: (_t) => 1,
  },
  {
    id: 'exp',
    name: '指數',
    ft: 'f(t) = e^(−0.5t)',
    Fs: 'F(s) = 1/(s + 0.5)',
    f: (t) => Math.exp(-0.5 * t),
  },
  {
    id: 'sin',
    name: '正弦',
    ft: 'f(t) = sin(2t)',
    Fs: 'F(s) = 2/(s² + 4)',
    f: (t) => Math.sin(2 * t),
  },
  {
    id: 'damped-sin',
    name: '衰退正弦',
    ft: 'f(t) = e^(−0.3t) · sin(2t)',
    Fs: 'F(s) = 2/((s+0.3)² + 4)',
    f: (t) => Math.exp(-0.3 * t) * Math.sin(2 * t),
  },
  {
    id: 'ramp',
    name: '線性',
    ft: 'f(t) = t',
    Fs: 'F(s) = 1/s²',
    f: (t) => t,
  },
];

interface TablePair {
  ft: string;
  Fs: string;
  note: string;
}

const TABLE: TablePair[] = [
  { ft: '1', Fs: '1/s', note: '常數函數' },
  { ft: 't', Fs: '1/s²', note: '線性' },
  { ft: 't^n', Fs: 'n! / s^(n+1)', note: '冪次' },
  { ft: 'e^(at)', Fs: '1/(s − a)', note: '指數' },
  { ft: 'cos(ωt)', Fs: 's / (s² + ω²)', note: '餘弦' },
  { ft: 'sin(ωt)', Fs: 'ω / (s² + ω²)', note: '正弦' },
  { ft: 'e^(at)·cos(ωt)', Fs: '(s−a) / ((s−a)² + ω²)', note: '衰退餘弦（s-shift）' },
  { ft: 'e^(at)·sin(ωt)', Fs: 'ω / ((s−a)² + ω²)', note: '衰退正弦' },
  { ft: 'δ(t)', Fs: '1', note: 'Dirac 脈衝' },
  { ft: 'u(t−a)', Fs: 'e^(−as)/s', note: 'Heaviside 階梯' },
];

@Component({
  selector: 'app-de-ch7-definition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Laplace 的定義與變換表" subtitle="§7.1">
      <p>
        Ch6 最後提到：任意形狀的外力——方波、衝擊、延遲——難用未定係數處理。
        <strong>Laplace 變換</strong>是處理這些問題的通用語言。
      </p>
      <p class="key-idea">
        <strong>定義</strong>：把時域函數 f(t) 映射到 s-域函數 F(s)：
      </p>
      <div class="centered-eq big">
        F(s) = ℒ[f(t)] = ∫₀^∞ e^(−st) · f(t) dt
      </div>
      <p>
        這個積分把 f(t) <strong>對不同的 s 加權積分</strong>——
        s 是一個複數參數，可以想像成「衰退率」。e^(−st) 在 s &gt; 0 時是下降的指數，
        所以積分大致是「用衰退窗口掃過 f(t)，看總和」。
      </p>
      <p>
        這個變換有個神奇性質：<strong>時域的微分 = s-域的相乘</strong>：
      </p>
      <div class="centered-eq">
        ℒ[y′(t)] = s · Y(s) − y(0)
      </div>
      <p>
        意思是：微分運算在 s-域變成「乘 s 加初值」——<strong>微分方程變成代數方程</strong>！
        下一節會細看。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="幾何直覺：看 e^(−st)·f(t) 這個被積函數">
      <div class="preset-row">
        @for (p of presets; track p.id) {
          <button
            class="pre-btn"
            [class.active]="preset().id === p.id"
            (click)="preset.set(p)"
          >{{ p.name }}</button>
        }
      </div>

      <div class="viz-grid">
        <div class="viz-col">
          <div class="viz-head">原函數 f(t)</div>
          <svg viewBox="-10 -80 300 150" class="plot-svg">
            <line x1="0" y1="0" x2="280" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            <text x="284" y="4" class="ax">t</text>
            <text x="-4" y="-72" class="ax">f(t)</text>

            @for (g of [-1, 1]; track g) {
              <line x1="0" [attr.y1]="-g * 30" x2="280" [attr.y2]="-g * 30"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
            }

            <path [attr.d]="ftPath()" fill="none"
              stroke="var(--accent)" stroke-width="2.2" />
          </svg>
          <code class="formula-line">{{ preset().ft }}</code>
        </div>

        <div class="viz-col">
          <div class="viz-head">被積函數 e^(−st)·f(t)，s = {{ s().toFixed(2) }}</div>
          <svg viewBox="-10 -80 300 150" class="plot-svg">
            <line x1="0" y1="0" x2="280" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            <text x="284" y="4" class="ax">t</text>
            <text x="-4" y="-72" class="ax">積分核</text>

            <!-- e^(-st) envelope (dashed) -->
            <path [attr.d]="envelopePath()" fill="none"
              stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.55" />

            <!-- Integrand with shaded area -->
            <path [attr.d]="integrandArea()"
              [attr.fill]="areaPositive() ? '#5ca87866' : '#c87b5e66'" />
            <path [attr.d]="integrandPath()" fill="none"
              stroke="var(--accent)" stroke-width="2" />
          </svg>
          <div class="area-display">
            面積 ≈ F({{ s().toFixed(2) }}) = <strong>{{ computedFs().toFixed(3) }}</strong>
          </div>
        </div>
      </div>

      <div class="sl">
        <span class="sl-lab">s =</span>
        <input type="range" min="0.1" max="3" step="0.02"
          [value]="s()" (input)="s.set(+$any($event).target.value)" />
        <span class="sl-val">{{ s().toFixed(2) }}</span>
      </div>

      <div class="formula-compare">
        <div class="fc-row">
          <span class="fc-k">理論解析解</span>
          <code class="fc-v">{{ preset().Fs }}</code>
        </div>
        <div class="fc-row">
          <span class="fc-k">數值面積 @ s = {{ s().toFixed(2) }}</span>
          <strong class="fc-v numeric">{{ computedFs().toFixed(4) }}</strong>
        </div>
      </div>

      <p class="intuition">
        拖 s：<strong>s 越大</strong>，e^(−st) 衰退得越快 → 積分大部分貢獻來自 t 接近 0 的區域 → F(s) 通常變小。
        <strong>s → 0</strong>：e^(−st) → 1，積分就是 f(t) 的總和（面積）——只有 f 可積才有限。
      </p>
    </app-challenge-card>

    <app-challenge-card prompt="常用 Laplace 對偶表（背不起來沒關係，用的時候查）">
      <div class="table-wrap">
        <div class="tbl-head">
          <span>f(t) 時域</span>
          <span>F(s) = ℒ[f] s-域</span>
          <span>註記</span>
        </div>
        @for (row of table; track row.ft) {
          <div class="tbl-row">
            <code class="tbl-ft">{{ row.ft }}</code>
            <code class="tbl-fs">{{ row.Fs }}</code>
            <span class="tbl-note">{{ row.note }}</span>
          </div>
        }
      </div>

      <div class="rules">
        <div class="rule">
          <span class="rule-tag">線性</span>
          <code>ℒ[a f + b g] = a F(s) + b G(s)</code>
        </div>
        <div class="rule">
          <span class="rule-tag">微分</span>
          <code>ℒ[f′] = s·F(s) − f(0)</code>
        </div>
        <div class="rule">
          <span class="rule-tag">二次微分</span>
          <code>ℒ[f″] = s²·F(s) − s·f(0) − f′(0)</code>
        </div>
        <div class="rule">
          <span class="rule-tag">s-shift</span>
          <code>ℒ[e^(at)·f(t)] = F(s − a)</code>
        </div>
        <div class="rule">
          <span class="rule-tag">t-shift</span>
          <code>ℒ[u(t−a)·f(t−a)] = e^(−as)·F(s)</code>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        觀察幾件事：
      </p>
      <ul>
        <li><strong>線性是最友善的性質</strong>：a·f + b·g 的變換就是 a·F + b·G。所以所有分解、合併都照常運作。</li>
        <li><strong>微分「變簡單」</strong>：ℒ[f′] 的公式 s·F(s) − f(0) 是整個技巧的核心——它把「微分方程」變成「代數方程」。</li>
        <li><strong>s-平面的極點位置決定時域行為</strong>：F(s) = 1/(s − a) 在 s = a 有極點，對應 f(t) = e^(at)；
          極點在左半平面（a &lt; 0）時 f(t) 衰退，右半平面時爆炸，虛軸上則是純振盪。</li>
      </ul>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Laplace 變換 = 把時域函數 f(t) 映射到 s-域 F(s)。
        微分在 s-域變成乘法——這就是它的魔力。下一節看這個魔力怎麼把 ODE 直接變代數。
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

    .preset-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .pre-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
    }

    .pre-btn:hover { border-color: var(--accent); }
    .pre-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .viz-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    @media (max-width: 640px) {
      .viz-grid { grid-template-columns: 1fr; }
    }

    .viz-col {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .viz-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .plot-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .formula-line {
      display: block;
      text-align: center;
      margin-top: 6px;
      padding: 4px 8px;
      font-size: 12px;
    }

    .area-display {
      margin-top: 6px;
      text-align: center;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .area-display strong {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 12px;
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
      min-width: 50px;
      text-align: right;
    }

    .formula-compare {
      padding: 10px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .fc-row {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 10px;
      padding: 5px 0;
      align-items: baseline;
      font-size: 13px;
    }

    .fc-k { color: var(--text-muted); font-size: 11px; }
    .fc-v { color: var(--accent); }
    .fc-v.numeric {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }

    .intuition {
      padding: 10px 14px;
      background: var(--bg);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0;
    }

    .table-wrap {
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      background: var(--bg);
      margin-bottom: 12px;
    }

    .tbl-head, .tbl-row {
      display: grid;
      grid-template-columns: 1.5fr 2fr 1.5fr;
      gap: 10px;
      padding: 9px 14px;
      align-items: center;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
    }

    .tbl-row:last-child { border-bottom: none; }

    .tbl-head {
      background: var(--bg-surface);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .tbl-ft { color: var(--text); padding: 2px 8px; }
    .tbl-fs { color: var(--accent); padding: 2px 8px; }
    .tbl-note { color: var(--text-muted); font-size: 11px; }

    .rules {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .rule {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 10px;
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      font-size: 13px;
      align-items: center;
    }

    .rule-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      padding: 2px 8px;
      background: var(--accent-10);
      border-radius: 4px;
      text-align: center;
    }

    .rule code {
      font-size: 12px;
      background: transparent;
    }
  `,
})
export class DeCh7DefinitionComponent {
  readonly presets = PRESETS;
  readonly table = TABLE;
  readonly preset = signal<Preset>(PRESETS[1]);
  readonly s = signal(1.0);

  // Plot coords: x = t * 28, y = -val * 30 (clamp at ±70)
  readonly T_MAX = 10;

  readonly ftPath = computed(() => {
    const pts: string[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      const y = this.preset().f(t);
      const yc = Math.max(-2, Math.min(2, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 28).toFixed(1)} ${(-yc * 30).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly integrandPath = computed(() => {
    const pts: string[] = [];
    const n = 300;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      const y = this.preset().f(t) * Math.exp(-this.s() * t);
      const yc = Math.max(-2, Math.min(2, y));
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 28).toFixed(1)} ${(-yc * 30).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly integrandArea = computed(() => {
    const pts: string[] = [];
    const n = 300;
    pts.push(`M 0 0`);
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      const y = this.preset().f(t) * Math.exp(-this.s() * t);
      const yc = Math.max(-2, Math.min(2, y));
      pts.push(`L ${(t * 28).toFixed(1)} ${(-yc * 30).toFixed(1)}`);
    }
    pts.push(`L ${(this.T_MAX * 28).toFixed(1)} 0`);
    pts.push('Z');
    return pts.join(' ');
  });

  readonly envelopePath = computed(() => {
    const pts: string[] = [];
    const n = 100;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * this.T_MAX;
      const env = Math.exp(-this.s() * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${(t * 28).toFixed(1)} ${(-env * 30).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  /** Numerical integration: ∫₀^T f(t)·e^(-st) dt */
  readonly computedFs = computed(() => {
    const s = this.s();
    const f = this.preset().f;
    const T = 30; // go further than plot for accuracy
    const n = 1500;
    const h = T / n;
    let sum = 0.5 * (f(0) + f(T) * Math.exp(-s * T));
    for (let i = 1; i < n; i++) {
      const t = i * h;
      sum += f(t) * Math.exp(-s * t);
    }
    return sum * h;
  });

  readonly areaPositive = computed(() => this.computedFs() >= 0);
}
