import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Visualize characteristic equation: a·r² + b·r + c = 0
 * User controls a, b, c; see roots in complex plane, and the resulting y(t).
 */

function roots(a: number, b: number, c: number): { r1Re: number; r1Im: number; r2Re: number; r2Im: number; disc: number } {
  const disc = b * b - 4 * a * c;
  if (disc > 0) {
    const s = Math.sqrt(disc);
    return { r1Re: (-b - s) / (2 * a), r1Im: 0, r2Re: (-b + s) / (2 * a), r2Im: 0, disc };
  } else if (disc === 0 || Math.abs(disc) < 1e-6) {
    const r = -b / (2 * a);
    return { r1Re: r, r1Im: 0, r2Re: r, r2Im: 0, disc: 0 };
  } else {
    const s = Math.sqrt(-disc);
    return { r1Re: -b / (2 * a), r1Im: -s / (2 * a), r2Re: -b / (2 * a), r2Im: s / (2 * a), disc };
  }
}

const PX_PER_T = 30;
const PX_PER_Y = 20;

@Component({
  selector: 'app-de-ch5-char-eq',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="特徵方程：用代數取代微積分" subtitle="§5.2">
      <p>
        上一節我們站在「物理定律」的立場看二階 ODE；這一節站在<strong>求解者</strong>的立場。
        給你 <code>a·y″ + b·y′ + c·y = 0</code>，怎麼找到 y(t)？
      </p>
      <p class="key-idea">
        <strong>天才的一擊（Euler）：</strong>猜 y = e^(rt)。代入方程：
      </p>
      <div class="centered-eq">
        a · r² · e^(rt) + b · r · e^(rt) + c · e^(rt) = 0
      </div>
      <p>
        兩邊除以 e^(rt)（永遠非零），<strong>微分方程變成純代數方程</strong>：
      </p>
      <div class="centered-eq big">
        a·r² + b·r + c = 0
      </div>
      <p>
        這叫「<strong>特徵方程</strong>」。二次方程的兩個根 r₁, r₂ 對應兩個基本解 e^(r₁t) 跟 e^(r₂t)，
        線性組合就是通解：
      </p>
      <div class="centered-eq">
        y(t) = C₁ · e^(r₁t) + C₂ · e^(r₂t)
      </div>
      <p>
        （C₁, C₂ 由兩個初值 y(0), y′(0) 決定——正好兩個常數對兩個條件。）
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖 a, b, c 看特徵方程的根與對應的 y(t) 如何變化">
      <div class="eq-display">
        <span class="eq-label">方程：</span>
        <code class="eq-code">
          {{ a().toFixed(1) }}·y″ + {{ b().toFixed(1) }}·y′ + {{ c().toFixed(1) }}·y = 0
        </code>
      </div>

      <div class="viz-grid">
        <!-- Complex plane with roots -->
        <div class="viz-col">
          <div class="viz-head">特徵根所在的複平面</div>
          <svg viewBox="-80 -80 160 160" class="complex-svg">
            <!-- Axes -->
            <line x1="-70" y1="0" x2="70" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            <text x="74" y="4" class="ax">Re</text>
            <text x="4" y="-74" class="ax">Im</text>

            <!-- Grid -->
            @for (g of [-4, -3, -2, -1, 1, 2, 3, 4]; track g) {
              <line [attr.x1]="g * 14" y1="-70" [attr.x2]="g * 14" y2="70"
                stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
              <line x1="-70" [attr.y1]="-g * 14" x2="70" [attr.y2]="-g * 14"
                stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            }

            <!-- Imaginary axis shading (oscillation zone) -->
            <rect x="-2" y="-70" width="4" height="140"
              fill="var(--accent)" opacity="0.08" />
            <text x="-74" y="-60" class="zone-lab" style="fill: var(--accent)">
              Re = 0：純振盪
            </text>

            <!-- Left half plane (decay) -->
            <rect x="-70" y="-70" width="70" height="140"
              fill="#5ca878" opacity="0.05" />
            <text x="-68" y="66" class="zone-lab" style="fill: #5ca878">
              衰退區（Re &lt; 0，穩定）
            </text>

            <!-- Right half plane (growth) -->
            <rect x="0" y="-70" width="70" height="140"
              fill="#c87b5e" opacity="0.05" />
            <text x="4" y="66" class="zone-lab" style="fill: #c87b5e">
              爆炸區（Re &gt; 0，不穩定）
            </text>

            <!-- Roots -->
            <circle [attr.cx]="rootsInfo().r1Re * 14" [attr.cy]="-rootsInfo().r1Im * 14"
              r="5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
            @if (!isRepeated()) {
              <circle [attr.cx]="rootsInfo().r2Re * 14" [attr.cy]="-rootsInfo().r2Im * 14"
                r="5" fill="var(--accent)" stroke="white" stroke-width="1.5" />
            } @else {
              <!-- Repeated root: double circle -->
              <circle [attr.cx]="rootsInfo().r2Re * 14" [attr.cy]="-rootsInfo().r2Im * 14"
                r="8" fill="none" stroke="var(--accent)" stroke-width="2" />
            }

            <!-- Root labels -->
            <text [attr.x]="rootsInfo().r1Re * 14 + 8" [attr.y]="-rootsInfo().r1Im * 14 - 6"
              class="root-lab">
              r₁ = {{ formatComplex(rootsInfo().r1Re, rootsInfo().r1Im) }}
            </text>
            @if (!isRepeated()) {
              <text [attr.x]="rootsInfo().r2Re * 14 + 8" [attr.y]="-rootsInfo().r2Im * 14 + 14"
                class="root-lab">
                r₂ = {{ formatComplex(rootsInfo().r2Re, rootsInfo().r2Im) }}
              </text>
            }
          </svg>
        </div>

        <!-- y(t) curve -->
        <div class="viz-col">
          <div class="viz-head">對應的解 y(t)</div>
          <svg viewBox="-10 -60 310 130" class="ts-svg">
            <line x1="0" y1="0" x2="290" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-55" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="1" />
            <text x="294" y="4" class="ax">t</text>
            <text x="-4" y="-58" class="ax">y</text>

            @for (g of [-2, -1, 1, 2]; track g) {
              <line x1="0" [attr.y1]="-g * PX_PER_Y" x2="290" [attr.y2]="-g * PX_PER_Y"
                stroke="var(--border)" stroke-width="0.4" opacity="0.5" />
            }

            <path [attr.d]="solutionPath()" fill="none"
              stroke="var(--accent)" stroke-width="2" />
          </svg>

          <div class="verdict" [attr.data-kind]="verdictKind()">
            {{ verdictLabel() }}
          </div>
        </div>
      </div>

      <!-- Coefficient controls -->
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">a</span>
          <input type="range" min="0.2" max="3" step="0.05"
            [value]="a()" (input)="a.set(+$any($event).target.value)" />
          <span class="sl-val">{{ a().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">b</span>
          <input type="range" min="-3" max="5" step="0.05"
            [value]="b()" (input)="b.set(+$any($event).target.value)" />
          <span class="sl-val">{{ b().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">c</span>
          <input type="range" min="-3" max="10" step="0.05"
            [value]="c()" (input)="c.set(+$any($event).target.value)" />
          <span class="sl-val">{{ c().toFixed(2) }}</span>
        </div>

        <div class="presets">
          <button class="pre" (click)="preset(1, 0, 1)">1·y″ + 1·y = 0 (SHM)</button>
          <button class="pre" (click)="preset(1, 0.5, 1)">1·y″ + 0.5·y′ + 1·y (欠阻尼)</button>
          <button class="pre" (click)="preset(1, 2, 1)">1·y″ + 2·y′ + 1·y (臨界)</button>
          <button class="pre" (click)="preset(1, 3, 1)">1·y″ + 3·y′ + 1·y (過阻尼)</button>
          <button class="pre" (click)="preset(1, -1, 0.5)">1·y″ − 1·y′ + 0.5·y (不穩定)</button>
        </div>

        <div class="readout">
          <div class="ro">
            <span class="ro-k">判別式 Δ = b² − 4ac</span>
            <strong [class.neg]="rootsInfo().disc < -0.01" [class.pos]="rootsInfo().disc > 0.01">
              {{ rootsInfo().disc.toFixed(3) }}
            </strong>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        三種根的幾何對應三種解的行為：
      </p>
      <div class="cases-grid">
        <div class="case" [style.--col]="'#8b6aa8'">
          <div class="c-tag">Δ &gt; 0</div>
          <div class="c-name">兩個實根</div>
          <code class="c-eq">y = C₁e^(r₁t) + C₂e^(r₂t)</code>
          <p>純粹的指數組合（無振盪）。物理上對應「過阻尼」。</p>
        </div>
        <div class="case" [style.--col]="'#c87b5e'">
          <div class="c-tag">Δ = 0</div>
          <div class="c-name">重根</div>
          <code class="c-eq">y = (C₁ + C₂·t) · e^(rt)</code>
          <p>注意多了一個 t！這是重根的特徵。對應「臨界阻尼」。</p>
        </div>
        <div class="case" [style.--col]="'#5ca878'">
          <div class="c-tag">Δ &lt; 0</div>
          <div class="c-name">共軛複根 α ± iβ</div>
          <code class="c-eq">y = e^(αt)(C₁cos βt + C₂sin βt)</code>
          <p>指數 × 正弦——振盪包在指數包絡裡。對應「欠阻尼」跟「SHM」。</p>
        </div>
      </div>
      <p>
        為什麼複根會變出 cos 跟 sin？<strong>Euler 公式</strong> e^(iθ) = cos θ + i·sin θ 把複指數換成三角函數。
        對稱性要求實數方程得到實數解，所以虛部抵消、剩下 cos 跟 sin 的線性組合。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        二階線性齊次 ODE 的整個解結構被一個<strong>二次方程</strong>決定——它的判別式 Δ 分成三類解的行為。
        接下來三節我們把這三類一一用物理情境走一遍。
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

    .eq-display {
      padding: 10px 14px;
      background: var(--accent-10);
      border-radius: 8px;
      margin-bottom: 12px;
      text-align: center;
    }

    .eq-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-right: 8px;
    }

    .eq-code {
      font-size: 16px;
      font-weight: 600;
      padding: 4px 10px;
    }

    .viz-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
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
      margin-bottom: 6px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .complex-svg, .ts-svg {
      width: 100%;
      display: block;
    }

    .ax {
      font-size: 11px;
      fill: var(--text-muted);
      font-style: italic;
    }

    .zone-lab {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
    }

    .root-lab {
      font-size: 10px;
      fill: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    .verdict {
      margin-top: 6px;
      padding: 6px 10px;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
    }

    .verdict[data-kind='distinct-real'] { background: rgba(139, 106, 168, 0.1); color: #8b6aa8; }
    .verdict[data-kind='repeated'] { background: rgba(200, 123, 94, 0.1); color: #c87b5e; }
    .verdict[data-kind='complex'] { background: rgba(92, 168, 120, 0.1); color: #5ca878; }

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
      margin-bottom: 6px;
    }

    .sl-lab {
      font-size: 13px;
      color: var(--accent);
      font-weight: 700;
      min-width: 24px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 10px 0;
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
      grid-template-columns: 1fr;
      gap: 4px;
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

    .ro strong.pos { color: #5ca878; }
    .ro strong.neg { color: #c87b5e; }

    .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      letter-spacing: 0.08em;
    }

    .c-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      margin: 2px 0 8px;
    }

    .c-eq {
      display: block;
      text-align: center;
      font-size: 13px;
      padding: 6px;
      margin-bottom: 6px;
      background: var(--bg-surface);
      color: var(--col);
    }

    .case p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `,
})
export class DeCh5CharEqComponent {
  readonly a = signal(1);
  readonly b = signal(0.5);
  readonly c = signal(1);

  readonly PX_PER_Y = PX_PER_Y;

  preset(a: number, b: number, c: number): void {
    this.a.set(a);
    this.b.set(b);
    this.c.set(c);
  }

  readonly rootsInfo = computed(() => roots(this.a(), this.b(), this.c()));

  readonly isRepeated = computed(() => Math.abs(this.rootsInfo().disc) < 0.01);

  formatComplex(re: number, im: number): string {
    if (Math.abs(im) < 0.01) return re.toFixed(2);
    const sign = im >= 0 ? '+' : '−';
    return `${re.toFixed(2)} ${sign} ${Math.abs(im).toFixed(2)}i`;
  }

  readonly verdictKind = computed(() => {
    const d = this.rootsInfo().disc;
    if (Math.abs(d) < 0.01) return 'repeated';
    if (d > 0) return 'distinct-real';
    return 'complex';
  });

  readonly verdictLabel = computed(() => {
    const kind = this.verdictKind();
    const info = this.rootsInfo();
    const maxRe = Math.max(info.r1Re, info.r2Re);
    if (kind === 'distinct-real') {
      if (maxRe < 0) return '兩實根、皆為負 → 純衰退（過阻尼）';
      if (maxRe > 0.01) return '兩實根、至少一個為正 → 爆炸（不穩定）';
      return '兩實根、含 0 → 邊界情況';
    }
    if (kind === 'repeated') {
      if (info.r1Re < 0) return '重根、負 → 臨界衰退';
      if (info.r1Re > 0.01) return '重根、正 → 爆炸';
      return '重根 = 0 → 邊界情況';
    }
    // complex
    if (info.r1Re < -0.01) return '共軛複根、實部負 → 衰退振盪（欠阻尼）';
    if (info.r1Re > 0.01) return '共軛複根、實部正 → 振幅爆炸';
    return '共軛複根、實部 0 → 純振盪（無阻尼）';
  });

  /**
   * Solve IVP: y(0) = 1, y'(0) = 0 for visualization
   * Use analytical formula by case.
   */
  readonly solutionPath = computed(() => {
    const info = this.rootsInfo();
    const pts: string[] = [];
    const n = 200;
    const tMax = 10;
    const isRep = this.isRepeated();
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * tMax;
      let y = 0;
      if (Math.abs(info.r1Im) > 0.01) {
        // complex roots: α ± iβ
        const alpha = info.r1Re;
        const beta = Math.abs(info.r1Im);
        // With y(0)=1, y'(0)=0: C1=1, C2 = -α/β
        const C1 = 1;
        const C2 = -alpha / beta;
        y = Math.exp(alpha * t) * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t));
      } else if (isRep) {
        // repeated root r
        const r = info.r1Re;
        // y(0)=1 → C1=1; y'(0)=0 → C1·r + C2 = 0 → C2 = -r
        y = (1 + (-r) * t) * Math.exp(r * t);
      } else {
        // distinct real roots r1, r2
        const r1 = info.r1Re;
        const r2 = info.r2Re;
        // y(0)=1: C1+C2=1; y'(0)=0: C1·r1+C2·r2=0
        // C1 = -r2/(r1-r2); C2 = r1/(r1-r2)
        const den = r1 - r2;
        if (Math.abs(den) < 1e-9) continue;
        const C1 = -r2 / den;
        const C2 = r1 / den;
        y = C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
      }
      if (!isFinite(y) || Math.abs(y) > 10) continue;
      const yc = Math.max(-3, Math.min(3, y));
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(-yc * PX_PER_Y).toFixed(1)}`);
    }
    return pts.join(' ');
  });
}
