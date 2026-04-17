import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-function-spaces',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, RouterLink],
  template: `
    <!-- ===== 大觀念 ===== -->
    <app-prose-block title="連續函數空間" subtitle="§4.8">
      <p>
        到目前為止，我們一直在研究<strong>一個</strong>函數的性質：連續、極值、均勻連續。
        但數學經常需要比較<strong>兩個函數有多接近</strong>：
      </p>
      <ul>
        <li>Fourier 級數的部分和 Sₙ 越來越「接近」原函數嗎？</li>
        <li>用多項式近似 sin(x)，「誤差」是多少？</li>
        <li>PDE 的數值解和真正的解「差多遠」？</li>
      </ul>
      <p>
        要回答這些問題，我們需要在<strong>函數組成的集合</strong>上定義「距離」。
        把每個函數想成一個<strong>點</strong>，函數的集合就變成一個<strong>空間</strong>——
        然後就可以用 Ch2 的收斂和 Ch8 的度量空間那套工具。
      </p>
    </app-prose-block>

    <!-- ===== sup 範數 ===== -->
    <app-prose-block subtitle="sup 範數：最壞情況的距離">
      <p>
        C[a,b] = 所有在 [a,b] 上連續的函數。它是一個向量空間（加法、純量乘法保持連續性）。
      </p>
      <div class="norm-box">
        <div class="norm-title">sup 範數（或 ∞ 範數）</div>
        <div class="norm-formula">||f||∞ = max |f(x)| &nbsp;&nbsp;(x ∈ [a,b])</div>
        <div class="norm-dist">兩函數的距離：d(f, g) = ||f − g||∞ = max |f(x) − g(x)|</div>
      </div>
      <p>
        直覺：<strong>兩條曲線之間最大的垂直距離</strong>。
        只要有一個點差很多，距離就大——這是「最壞情況」的衡量。
      </p>
      <p>
        關鍵等價：<strong>sup 範數收斂 = 均勻收斂</strong>。
        所以 §4.7 的均勻連續和這裡的 sup 範數，本質上是同一件事的不同面貌。
      </p>
    </app-prose-block>

    <!-- ===== 互動 1：兩函數的 sup 距離 ===== -->
    <app-challenge-card prompt="選兩個函數，看 sup 距離 = 最大垂直間隙">
      <div class="pair-ctrl">
        <div class="pair-col">
          <div class="pair-label">f (藍)</div>
          @for (fn of fChoices; track fn.name; let i = $index) {
            <button class="pre-btn" [class.active]="fSel() === i" (click)="fSel.set(i)">{{ fn.name }}</button>
          }
        </div>
        <div class="pair-col">
          <div class="pair-label">g (橙)</div>
          @for (fn of gChoices; track fn.name; let i = $index) {
            <button class="pre-btn" [class.active]="gSel() === i" (click)="gSel.set(i)">{{ fn.name }}</button>
          }
        </div>
      </div>

      <svg viewBox="0 0 520 260" class="dist-svg">
        <line x1="50" y1="210" x2="490" y2="210" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="210" stroke="var(--border)" stroke-width="0.8" />

        @for (yt of [-1, -0.5, 0, 0.5, 1, 1.5]; track yt) {
          <line x1="45" [attr.y1]="dy(yt)" x2="490" [attr.y2]="dy(yt)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="42" [attr.y]="dy(yt) + 3" class="ax-label" text-anchor="end">{{ yt }}</text>
        }

        <!-- Max gap indicator -->
        <line [attr.x1]="dx(supGapX())" [attr.y1]="dy(curF().fn(supGapX()))"
              [attr.x2]="dx(supGapX())" [attr.y2]="dy(curG().fn(supGapX()))"
              stroke="#a05a5a" stroke-width="2.5" />
        <text [attr.x]="dx(supGapX()) + 8"
              [attr.y]="dy((curF().fn(supGapX()) + curG().fn(supGapX())) / 2) + 4"
              class="gap-label">{{ supDist().toFixed(3) }}</text>

        <!-- f curve (blue) -->
        <path [attr.d]="fPath()" fill="none" stroke="#5a7faa" stroke-width="2.5" />
        <!-- g curve (orange) -->
        <path [attr.d]="gPath()" fill="none" stroke="#c8983b" stroke-width="2.5" />

        <!-- Sup gap x marker -->
        <circle [attr.cx]="dx(supGapX())" [attr.cy]="dy(curF().fn(supGapX()))" r="4" fill="#5a7faa" stroke="white" stroke-width="1" />
        <circle [attr.cx]="dx(supGapX())" [attr.cy]="dy(curG().fn(supGapX()))" r="4" fill="#c8983b" stroke="white" stroke-width="1" />
      </svg>

      <div class="dist-result">
        <span>d(f, g) = ||f − g||∞ = <strong>{{ supDist().toFixed(4) }}</strong></span>
        <span class="dist-note">（在 x ≈ {{ supGapX().toFixed(2) }} 處達到最大間隙）</span>
      </div>
    </app-challenge-card>

    <!-- ===== 互動 2：xⁿ 的逐點 vs 均勻 ===== -->
    <app-challenge-card prompt="經典反例：xⁿ 逐點收斂但不均勻收斂——sup 範數距離永遠 = 1">
      <div class="n-ctrl">
        <span class="nl">n = {{ nVal() }}</span>
        <input type="range" min="1" max="30" step="1" [value]="nVal()"
               (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 280" class="xn-svg">
        <line x1="50" y1="230" x2="470" y2="230" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="20" x2="50" y2="230" stroke="var(--border)" stroke-width="0.8" />
        <text x="42" [attr.y]="xny(0) + 3" class="ax-label" text-anchor="end">0</text>
        <text x="42" [attr.y]="xny(0.5) + 3" class="ax-label" text-anchor="end">0.5</text>
        <text x="42" [attr.y]="xny(1) + 3" class="ax-label" text-anchor="end">1</text>
        <!-- x ticks -->
        <text [attr.x]="xnx(0)" y="244" class="ax-label" text-anchor="middle">0</text>
        <text [attr.x]="xnx(0.5)" y="244" class="ax-label" text-anchor="middle">0.5</text>
        <text [attr.x]="xnx(1)" y="244" class="ax-label" text-anchor="middle">1</text>

        <!-- Pointwise limit: f = 0 on [0,1) -->
        <line x1="50" [attr.y1]="xny(0)" x2="440" [attr.y2]="xny(0)"
              stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="5 3" />
        <!-- Pointwise limit: f(1) = 1 -->
        <circle [attr.cx]="xnx(1)" [attr.cy]="xny(1)" r="5" fill="#a05a5a" stroke="white" stroke-width="1.5" />
        <text [attr.x]="xnx(1) + 10" [attr.y]="xny(1) + 4" class="lim-label">f(1) = 1</text>
        <text [attr.x]="xnx(0.5)" [attr.y]="xny(0) + 14" class="lim-label">f = 0 (x &lt; 1)</text>

        <!-- Gap region: shade the area between xⁿ and the limit (0) -->
        <path [attr.d]="gapAreaPath()" fill="#a05a5a" fill-opacity="0.12" />

        <!-- Ghost curves -->
        @for (k of ghostNs(); track k) {
          <path [attr.d]="powerPath(k)" fill="none" stroke="var(--accent)" stroke-width="0.8"
                [attr.stroke-opacity]="0.08 + 0.04 * k" />
        }

        <!-- Current xⁿ -->
        <path [attr.d]="powerPath(nVal())" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Y-axis bracket showing sup gap = 1 -->
        <line x1="46" [attr.y1]="xny(0)" x2="46" [attr.y2]="xny(1)"
              stroke="#a05a5a" stroke-width="2.5" />
        <text x="38" [attr.y]="xny(0.5) + 4" class="sup-label" text-anchor="end">sup = 1</text>

        <!-- Transition point label: where xⁿ ≈ 0.5 -->
        <circle [attr.cx]="xnx(halfX())" [attr.cy]="xny(0.5)" r="3.5"
                fill="var(--accent)" fill-opacity="0.5" />
        <text [attr.x]="xnx(halfX()) - 6" [attr.y]="xny(0.5) - 6" class="trans-label" text-anchor="end">
          xⁿ = 0.5 在 x = {{ halfX().toFixed(3) }}
        </text>
      </svg>

      <div class="xn-info">
        <div class="xn-card">
          <div class="xn-label">每個 fₙ = xⁿ</div>
          <div class="xn-val ok">連續 ✓</div>
        </div>
        <div class="xn-card">
          <div class="xn-label">逐點極限</div>
          <div class="xn-val bad">0 (x&lt;1), 1 (x=1) → 不連續 ✗</div>
        </div>
        <div class="xn-card">
          <div class="xn-label">||fₙ − f||∞</div>
          <div class="xn-val bad">= 1（對所有 n！永遠不趨向 0）</div>
        </div>
      </div>

      <div class="xn-moral">
        在任何固定的 x &lt; 1，xⁿ → 0（逐點收斂）。
        但 x 越靠近 1，xⁿ 越接近 1——<strong>最大間隙永遠趨近 1</strong>。
        所以 sup 範數距離 = sup(xⁿ on [0,1)) = 1，<strong>永遠不縮小</strong>。
        這就是「逐點收斂但<strong>不均勻收斂</strong>」的經典畫面。
      </div>
    </app-challenge-card>

    <!-- ===== 完備性 ===== -->
    <app-prose-block subtitle="C[a,b] 的完備性：連續函數的極限還是連續的">
      <p>C[a,b] 配上 sup 範數有一個<strong>極其重要</strong>的性質：</p>
      <div class="complete-box">
        <div class="comp-title">完備性（Banach 空間）</div>
        <div class="comp-body">
          在 sup 範數下，連續函數的 Cauchy 列的<strong>極限仍然連續</strong>。<br>
          也就是說：(C[a,b], ||·||∞) 是<strong>完備的</strong>——沒有「洞」。
        </div>
      </div>
      <p>
        這就像 Ch1 的 R 是完備的（Cauchy 列收斂到 R 裡的點），
        C[a,b] 在 sup 範數下也是完備的（Cauchy 列收斂到 C[a,b] 裡的函數）。
      </p>
      <p>
        但換一種範數——比如 L¹ 範數 ||f||₁ = ∫|f| dx——C[a,b] 就<strong>不完備</strong>了。
        L¹-Cauchy 列可能收斂到不連續的函數。這就是為什麼 Ch11 要引入 Lᵖ 空間。
      </p>
    </app-prose-block>

    <!-- ===== 全景預告 ===== -->
    <app-prose-block subtitle="你正站在什麼位置？">
      <div class="preview-chain">
        <div class="pc-item done">Ch4 §4.8：C[a,b] + sup 範數（你在這裡）</div>
        <div class="pc-arrow">↓</div>
        <div class="pc-item">Ch7：函數列 + 均勻收斂（sup 範數收斂的完整理論）</div>
        <div class="pc-arrow">↓</div>
        <div class="pc-item">Ch8：度量空間（把「距離」抽象化，C[a,b] 是例子之一）</div>
        <div class="pc-arrow">↓</div>
        <div class="pc-item">Ch11：Lᵖ 空間（換一種範數，得到不同的完備化）</div>
        <div class="pc-arrow">↓</div>
        <div class="pc-item">Ch12：Hilbert 空間（L² 裡做 Fourier 展開）</div>
      </div>
      <p>
        <strong>函數空間</strong>是現代分析的舞台。這一節是入口——
        把函數當成「點」，用範數衡量距離，然後問：這個空間完備嗎？收斂保持什麼性質？
      </p>
      <p>下一節用心智圖把第四章總結。心智圖之後有三個<strong>選讀附錄</strong>，深入體驗函數距離的實際應用。</p>

      <div class="explore-links">
        <a class="ex-link" [routerLink]="['/learn', 'analysis', 'ch4', 10]">
          <span class="ex-icon">🎵</span>
          <span class="ex-text"><strong>深入 A</strong>：Fourier 級數逼近——sup 距離 vs L² 距離的差異</span>
        </a>
        <a class="ex-link" [routerLink]="['/learn', 'analysis', 'ch4', 11]">
          <span class="ex-icon">📐</span>
          <span class="ex-text"><strong>深入 B</strong>：Taylor 多項式——收斂半徑外會爆掉！</span>
        </a>
        <a class="ex-link" [routerLink]="['/learn', 'analysis', 'ch4', 12]">
          <span class="ex-icon">🌡</span>
          <span class="ex-text"><strong>深入 C</strong>：PDE 數值解——格子越密 sup 誤差越小</span>
        </a>
      </div>
    </app-prose-block>
  `,
  styles: `
    /* Norm box */
    .norm-box { padding: 14px; border-radius: 10px; background: var(--accent-10);
      border: 2px solid var(--accent); margin: 10px 0; text-align: center; }
    .norm-title { font-size: 12px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .norm-formula { font-size: 16px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
    .norm-dist { font-size: 13px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    /* Distance interactive */
    .pair-ctrl { display: flex; gap: 14px; margin-bottom: 10px; }
    .pair-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .pair-label { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 2px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; text-align: left;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .dist-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 8px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .gap-label { font-size: 9px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .dist-result { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      text-align: center; font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 14px; }
    .dist-result strong { color: var(--accent); font-size: 16px; }
    .dist-note { font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px; }

    /* xⁿ interactive */
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .n-slider { flex: 1; accent-color: var(--accent); height: 22px; }
    .xn-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .lim-label { font-size: 8px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sup-label { font-size: 9px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .trans-label { font-size: 7px; fill: var(--accent); font-family: 'JetBrains Mono', monospace; }

    .xn-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
    @media (max-width: 500px) { .xn-info { grid-template-columns: 1fr; } }
    .xn-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); text-align: center; }
    .xn-label { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
    .xn-val { font-size: 12px; font-weight: 700;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }

    .xn-moral { padding: 12px; text-align: center; font-size: 12px; color: var(--text-secondary);
      background: rgba(160,90,90,0.06); border: 1px solid rgba(160,90,90,0.2); border-radius: 8px;
      line-height: 1.7; margin-bottom: 14px; }
    .xn-moral strong { color: #a05a5a; }

    /* Completeness */
    .complete-box { padding: 14px; border-radius: 10px; background: rgba(90,138,90,0.06);
      border: 2px solid rgba(90,138,90,0.3); margin: 10px 0; text-align: center; }
    .comp-title { font-size: 12px; font-weight: 700; color: #5a8a5a;
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .comp-body { font-size: 14px; color: var(--text); line-height: 1.8;
      font-family: 'JetBrains Mono', monospace; }

    /* Preview chain */
    .preview-chain { display: flex; flex-direction: column; align-items: center; gap: 0; margin: 12px 0; }
    .pc-item { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px;
      font-size: 12px; color: var(--text-secondary); background: var(--bg-surface); text-align: center;
      &.done { border-color: var(--accent); background: var(--accent-10); color: var(--accent); font-weight: 600; } }
    .pc-arrow { font-size: 12px; color: var(--text-muted); padding: 2px 0; }

    /* Explore links */
    .explore-links { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .ex-link { display: flex; gap: 12px; align-items: center; padding: 12px 14px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface);
      text-decoration: none; color: inherit; transition: all 0.15s;
      &:hover { border-color: var(--accent); background: var(--accent-10); transform: translateX(4px); } }
    .ex-icon { font-size: 20px; }
    .ex-text { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .ex-text strong { color: var(--accent); }
  `,
})
export class StepFunctionSpacesComponent {
  readonly Math = Math;
  readonly nVal = signal(3);

  // --- Distance interactive ---
  readonly fChoices = [
    { name: 'sin(x)', fn: Math.sin },
    { name: 'x/π', fn: (x: number) => x / Math.PI },
    { name: 'cos(x)', fn: Math.cos },
  ];
  readonly gChoices = [
    { name: 'x/π', fn: (x: number) => x / Math.PI },
    { name: 'sin(x) + 0.3', fn: (x: number) => Math.sin(x) + 0.3 },
    { name: '0', fn: () => 0 },
  ];
  readonly fSel = signal(0);
  readonly gSel = signal(0);
  readonly curF = computed(() => this.fChoices[this.fSel()]);
  readonly curG = computed(() => this.gChoices[this.gSel()]);

  dx(x: number): number { return 50 + ((x + 0.3) / (Math.PI + 0.6)) * 440; }
  dy(y: number): number { return 210 - ((y + 1.2) / 3) * 190; }

  fPath(): string {
    let path = '';
    for (let i = 0; i <= 200; i++) {
      const x = -0.1 + (Math.PI + 0.2) * i / 200;
      path += (i === 0 ? 'M' : 'L') + `${this.dx(x).toFixed(1)},${this.dy(this.curF().fn(x)).toFixed(1)}`;
    }
    return path;
  }
  gPath(): string {
    let path = '';
    for (let i = 0; i <= 200; i++) {
      const x = -0.1 + (Math.PI + 0.2) * i / 200;
      path += (i === 0 ? 'M' : 'L') + `${this.dx(x).toFixed(1)},${this.dy(this.curG().fn(x)).toFixed(1)}`;
    }
    return path;
  }

  readonly supGapX = computed(() => {
    let mx = 0, mxX = 0;
    for (let i = 0; i <= 300; i++) {
      const x = (Math.PI) * i / 300;
      const gap = Math.abs(this.curF().fn(x) - this.curG().fn(x));
      if (gap > mx) { mx = gap; mxX = x; }
    }
    return mxX;
  });

  readonly supDist = computed(() => {
    return Math.abs(this.curF().fn(this.supGapX()) - this.curG().fn(this.supGapX()));
  });

  // --- xⁿ interactive ---
  xnx(x: number): number { return 50 + x * 420; }
  xny(y: number): number { return 230 - y * 210; }

  powerPath(n: number): string {
    const pts: string[] = [];
    for (let x = 0; x <= 1; x += 0.004) pts.push(`${this.xnx(x)},${this.xny(Math.pow(x, n))}`);
    return 'M' + pts.join('L');
  }

  readonly ghostNs = computed(() => {
    const n = this.nVal();
    const ghosts: number[] = [];
    for (let k = 1; k < n; k += Math.max(1, Math.floor(n / 5))) ghosts.push(k);
    return ghosts;
  });

  // Where xⁿ = 0.5 — the "transition point" that moves rightward as n grows
  readonly halfX = computed(() => Math.pow(0.5, 1 / this.nVal()));

  // Shaded area = the entire gap between xⁿ curve and y=0 line
  // This is |xⁿ - f(x)| = xⁿ for x ∈ [0,1)
  gapAreaPath(): string {
    const n = this.nVal();
    let path = `M${this.xnx(0)},${this.xny(0)}`;
    for (let x = 0; x <= 0.998; x += 0.004) {
      path += `L${this.xnx(x)},${this.xny(Math.pow(x, n))}`;
    }
    path += `L${this.xnx(0.998)},${this.xny(0)}Z`;
    return path;
  }
}
