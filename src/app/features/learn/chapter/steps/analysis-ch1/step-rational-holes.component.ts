import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const SQRT2 = Math.SQRT2;

@Component({
  selector: 'app-step-rational-holes',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <!-- ===== 第一段：提出「尷尬的問題」===== -->
    <app-prose-block title="有理數的「洞」" subtitle="§1.2">
      <p>
        上一節我們證明了 √2 不是有理數。OK，那⋯⋯然後呢？
      </p>
      <p>
        你可能覺得：「知道了，√2 是無理數，那直接用就好了嘛。」
        但如果你是 19 世紀的數學家，這裡有一個<strong>非常尷尬的問題</strong>：
      </p>
      <p class="question-box">
        「√2 到底是<strong>什麼</strong>？」
      </p>
      <p>
        你說：「它是平方等於 2 的正數。」<br>
        數學家會問：「但在有理數的世界裡，根本找不到這個數——你憑什麼說它<strong>存在</strong>？」
      </p>
      <p>
        這不是吹毛求疵。在 Dedekind 之前，數學家們天天在用 √2、π、e 這些數，
        但如果追問「這些數的<strong>定義</strong>是什麼」，沒有人能給出嚴格的回答。
        大家靠的是直覺和圖形——但直覺會騙人。
      </p>
    </app-prose-block>

    <!-- ===== 第二段：碎石路的比喻 ===== -->
    <app-prose-block>
      <p>
        想像有理數是一條路上的<strong>碎石</strong>。碎石很多、很密——
        任何兩塊之間都能找到更多碎石（有理數的稠密性）。
        路看起來鋪得很滿。
      </p>
      <p>
        但碎石之間其實有<strong>微小的縫隙</strong>。
        如果你是一隻螞蟻，想沿著這條路從 0 走到 2，走著走著，你會突然掉進一個坑裡——
        坑的位置正好在 √2。
      </p>
      <p>
        <strong>如果不把這些坑填起來</strong>，會出什麼事？
      </p>
      <ul>
        <li>數列 1, 1.4, 1.41, 1.414, ⋯ 明明越來越靠近某個東西，但目的地「不存在」（<strong>極限消失</strong>）</li>
        <li>連續函數 f(x) = x² − 2 在 x=1 時為負、x=2 時為正，但 f(x)=0 的那個 x「找不到」（<strong>中間值定理失效</strong>）</li>
        <li>微積分的基礎全部崩潰</li>
      </ul>
      <p>
        所以問題不是「√2 存不存在」——問題是<strong>有理數不夠用</strong>，
        我們需要一套更完整的數字系統，能保證「路上沒有坑」。
      </p>
    </app-prose-block>

    <!-- ===== 第三段：Dedekind 的天才構造 ===== -->
    <app-prose-block subtitle="Dedekind 的構造（1872）">
      <p>
        Richard Dedekind 的天才之處在於：
        <strong>既然我找不到那個點，那我就用「切割方式」來定義那個點。</strong>
      </p>
      <p>
        把所有有理數分成兩堆：
      </p>
      <ul>
        <li><strong class="left-color">左邊 L</strong> = 所有 q ∈ Q 使得 q &lt; 0 或 q² &lt; 2</li>
        <li><strong class="right-color">右邊 R</strong> = 所有 q ∈ Q 使得 q > 0 且 q² ≥ 2</li>
      </ul>
      <p>
        L 裡的每個數都比 R 裡的每個數小。中間那個「分界點」就是 √2——
        但它<strong>不在有理數裡</strong>。L 沒有最大值，R 沒有最小值。中間有一條<strong>裂縫</strong>。
      </p>
      <p>
        Dedekind 說：<strong>這個切割行為本身，就是 √2 的定義。</strong>
      </p>
      <p>
        不需要「找到」√2——只需要知道「它把有理數分成哪兩半」，就足以完全確定它是什麼。
        就像你不需要見過某人，只要知道「所有比他矮的人」和「所有比他高的人」分別是誰，
        你就能確定他的身高。
      </p>
    </app-prose-block>

    <!-- ===== 互動：拖動分割線 ===== -->
    <app-challenge-card prompt="拖動分割線，看看有理數怎麼被切開——把它拖到 √2 附近">
      <svg viewBox="0 -40 400 80" class="cut-svg"
           (pointermove)="onPointerMove($event)"
           (pointerdown)="dragging.set(true)"
           (pointerup)="dragging.set(false)"
           (pointerleave)="dragging.set(false)">
        <!-- Number line -->
        <line x1="10" y1="0" x2="390" y2="0" stroke="var(--border)" stroke-width="1" />

        <!-- Ticks -->
        @for (tick of ticks; track tick.val) {
          <line [attr.x1]="toX(tick.val)" y1="-5" [attr.x2]="toX(tick.val)" y2="5"
                stroke="var(--border-strong)" stroke-width="1" />
          <text [attr.x]="toX(tick.val)" y="18" class="tick-label">{{ tick.label }}</text>
        }

        <!-- Left region -->
        <rect x="10" y="-8" [attr.width]="toX(divider()) - 10" height="16"
              fill="#5a7faa" fill-opacity="0.12" />
        <!-- Right region -->
        <rect [attr.x]="toX(divider())" y="-8" [attr.width]="390 - toX(divider())" height="16"
              fill="#aa5a6a" fill-opacity="0.12" />

        <!-- Rational dots near the cut -->
        @for (r of nearbyRationals(); track r.key) {
          <circle [attr.cx]="toX(r.val)" cy="0" r="2.5"
                  [attr.fill]="r.val < divider() ? '#5a7faa' : '#aa5a6a'" />
        }

        <!-- √2 marker -->
        <line [attr.x1]="toX(SQRT2)" y1="-12" [attr.x2]="toX(SQRT2)" y2="12"
              stroke="var(--accent)" stroke-width="1" stroke-opacity="0.3" />
        <text [attr.x]="toX(SQRT2)" y="-16" class="sqrt2-label">√2</text>

        <!-- Divider line -->
        <line [attr.x1]="toX(divider())" y1="-25" [attr.x2]="toX(divider())" y2="25"
              stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3" />
        <text [attr.x]="toX(divider())" y="-30" class="div-label">
          {{ divider().toFixed(4) }}
        </text>

        <!-- Gap indicator near √2 -->
        @if (nearSqrt2()) {
          <circle [attr.cx]="toX(SQRT2)" cy="0" r="6"
                  fill="none" stroke="var(--accent)" stroke-width="1.5"
                  stroke-dasharray="3 2" />
        }
      </svg>

      <div class="info-row">
        <div class="info-card left">
          <div class="ic-title">左邊 L</div>
          <div class="ic-body">
            @if (isAtSqrt2()) {
              <strong>沒有最大值！</strong>
            } @else {
              max ≈ {{ divider().toFixed(4) }}
            }
          </div>
        </div>
        <div class="info-card gap" [class.visible]="nearSqrt2()">
          <div class="ic-title">裂縫</div>
          <div class="ic-body">√2 ≈ {{ SQRT2.toFixed(6) }}</div>
          <div class="ic-sub">不在 Q 裡！</div>
        </div>
        <div class="info-card right">
          <div class="ic-title">右邊 R</div>
          <div class="ic-body">
            @if (isAtSqrt2()) {
              <strong>沒有最小值！</strong>
            } @else {
              min ≈ {{ divider().toFixed(4) }}
            }
          </div>
        </div>
      </div>

      @if (nearSqrt2()) {
        <div class="insight highlight">
          你找到了！左邊<strong>永遠沒有最大值</strong>，右邊<strong>永遠沒有最小值</strong>——
          中間有一條裂縫，但裂縫裡面<strong>空空如也</strong>。
          這就是有理數系統的根本缺陷。
        </div>
      } @else {
        <div class="insight">
          試試把分割線拖到 √2 ≈ 1.4142 的位置。
        </div>
      }
    </app-challenge-card>

    <!-- ===== 第四段：為什麼不能「直接補上去」===== -->
    <app-prose-block subtitle="為什麼不能直接說「補上去就好」？">
      <p>
        你可能在想：「好吧，那就規定 √2 存在不就好了？幹嘛搞這麼複雜？」
      </p>
      <p>
        問題是：有理數線上的「洞」不只 √2 一個。π 是洞、e 是洞、
        √3 是洞、sin(1) 也是洞——洞有<strong>不可數多個</strong>（後面會證明）。
        你不可能一個一個「規定」它們存在。
      </p>
      <p>
        Dedekind 的方案是<strong>一次性</strong>的：
      </p>
      <p class="key-idea">
        <strong>每一種</strong>把有理數切成左右兩半的方式，都<strong>定義</strong>了一個實數。
        如果切割點是有理數，那就是有理數本身；如果不是——那就是一個新的數，一個「無理數」。
      </p>
      <p>
        這樣定義出來的數系叫做<strong>實數 R</strong>。
        它的關鍵性質是：<strong>沒有洞了</strong>。
        不管你怎麼切，切割點一定在 R 裡。這就是下一節的主角——<strong>上確界公理</strong>。
      </p>
    </app-prose-block>

    <!-- ===== 第二個互動：逼近 √2 的數列 ===== -->
    <app-challenge-card prompt="看一個數列如何「收斂」到有理數的洞裡">
      <div class="seq-ctrl">
        <span class="seq-label">逼近步數 n = {{ seqN() }}</span>
        <input type="range" min="1" max="15" step="1" [value]="seqN()"
               (input)="seqN.set(+($any($event.target)).value)" class="seq-slider" />
      </div>

      <svg viewBox="0 -30 400 60" class="seq-svg">
        <line x1="10" y1="0" x2="390" y2="0" stroke="var(--border)" stroke-width="0.8" />
        <!-- √2 target -->
        <line [attr.x1]="seqToX(SQRT2)" y1="-15" [attr.x2]="seqToX(SQRT2)" y2="15"
              stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2" />
        <text [attr.x]="seqToX(SQRT2)" y="-20" class="sqrt2-label">√2</text>

        <!-- Sequence terms -->
        @for (term of seqTerms(); track $index; let i = $index) {
          <circle [attr.cx]="seqToX(term)" cy="0" r="3"
                  [attr.fill]="i === seqTerms().length - 1 ? 'var(--accent)' : '#5a7faa'"
                  [attr.fill-opacity]="0.3 + 0.7 * (i + 1) / seqTerms().length" />
          @if (i === seqTerms().length - 1) {
            <text [attr.x]="seqToX(term)" y="22" class="term-label">{{ term.toFixed(6) }}</text>
          }
        }
      </svg>

      <div class="seq-info">
        <div class="si-card">aₙ = {{ currentTerm().toFixed(10) }}</div>
        <div class="si-card">aₙ² = {{ (currentTerm() * currentTerm()).toFixed(10) }}</div>
        <div class="si-card accent">|aₙ² − 2| = {{ Math.abs(currentTerm() * currentTerm() - 2).toExponential(2) }}</div>
      </div>

      <div class="insight">
        用<strong>巴比倫法</strong>（aₙ₊₁ = ½(aₙ + 2/aₙ)）逼近 √2。
        每一項都是有理數，越來越靠近 √2——但永遠到不了。
        @if (seqN() >= 10) {
          <strong>在有理數的世界裡，這個數列「沒有極限」。這就是洞。</strong>
        }
      </div>
    </app-challenge-card>

    <!-- ===== 總結 ===== -->
    <app-prose-block subtitle="本節小結">
      <p>
        這一節不是在玩文字遊戲，而是在<strong>打地基</strong>：
      </p>
      <ol>
        <li>
          <strong>直覺的你</strong>：「我看得到那裡有個洞，補上去不就好了？」
        </li>
        <li>
          <strong>數學的回答</strong>：「我們要怎麼<em>只用有理數</em>，
          <em>邏輯上嚴格地</em>定義出那個洞的內容？
          而且要確保填完後，整條數線<em>再也沒有洞</em>？」
        </li>
      </ol>
      <p>
        Dedekind 的切割回答了這個問題。
        下一節的<strong>上確界公理</strong>會把「沒有洞」這件事變成一個精確的數學陳述。
      </p>
    </app-prose-block>
  `,
  styles: `
    .question-box { text-align: center; font-size: 17px; padding: 14px; margin: 12px 0;
      background: rgba(160,90,90,0.06); border: 2px solid rgba(160,90,90,0.2);
      border-radius: 10px; color: var(--text); }
    .left-color { color: #5a7faa; }
    .right-color { color: #aa5a6a; }

    .key-idea { text-align: center; font-size: 14px; padding: 14px; margin: 12px 0;
      background: var(--accent-10); border: 2px solid var(--accent);
      border-radius: 10px; color: var(--text); line-height: 1.8; }

    .cut-svg { width: 100%; display: block; margin-bottom: 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
      cursor: ew-resize; touch-action: none; }
    .tick-label { font-size: 10px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .div-label { font-size: 9px; fill: var(--accent); text-anchor: middle;
      font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sqrt2-label { font-size: 7px; fill: var(--accent); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; opacity: 0.6; }

    .info-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .info-card { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      text-align: center;
      &.left { background: rgba(90, 127, 170, 0.08); }
      &.right { background: rgba(170, 90, 106, 0.08); }
      &.gap { background: var(--accent-10); opacity: 0; transition: opacity 0.3s;
        &.visible { opacity: 1; } } }
    .ic-title { font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .ic-body { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px;
      strong { color: var(--accent); } }
    .ic-sub { font-size: 10px; color: var(--accent); margin-top: 2px; font-weight: 600; }

    .insight { padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);
      text-align: center;
      strong { color: var(--accent); }
      &.highlight { background: var(--accent-10); border-color: var(--accent); } }

    /* Sequence viz */
    .seq-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .seq-label { font-size: 13px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 100px; }
    .seq-slider { flex: 1; accent-color: var(--accent); }
    .seq-svg { width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .term-label { font-size: 7px; fill: var(--accent); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; font-weight: 600; }

    .seq-info { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .si-card { flex: 1; min-width: 100px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
  `,
})
export class StepRationalHolesComponent {
  readonly Math = Math;
  readonly SQRT2 = SQRT2;
  readonly divider = signal(1.5);
  readonly dragging = signal(false);
  readonly seqN = signal(5);

  readonly ticks = [
    { val: 0, label: '0' }, { val: 0.5, label: '' }, { val: 1, label: '1' },
    { val: 1.5, label: '' }, { val: 2, label: '2' }, { val: 2.5, label: '' },
  ];

  readonly nearSqrt2 = computed(() => Math.abs(this.divider() - SQRT2) < 0.05);
  readonly isAtSqrt2 = computed(() => Math.abs(this.divider() - SQRT2) < 0.02);

  readonly nearbyRationals = computed(() => {
    const center = this.divider();
    const rats: { key: string; val: number }[] = [];
    for (let q = 1; q <= 20; q++) {
      for (let p = Math.floor((center - 0.3) * q); p <= Math.ceil((center + 0.3) * q); p++) {
        const val = p / q;
        if (val > 0 && val < 2.5 && Math.abs(val - center) < 0.3) {
          rats.push({ key: `${p}/${q}`, val });
        }
      }
    }
    return rats.slice(0, 40);
  });

  // Babylonian method: a_{n+1} = (a_n + 2/a_n) / 2
  readonly seqTerms = computed(() => {
    const n = this.seqN();
    const terms: number[] = [1];
    for (let i = 1; i <= n; i++) {
      const prev = terms[terms.length - 1];
      terms.push((prev + 2 / prev) / 2);
    }
    return terms;
  });

  readonly currentTerm = computed(() => {
    const terms = this.seqTerms();
    return terms[terms.length - 1];
  });

  toX(val: number): number { return 10 + (val / 2.5) * 380; }

  seqToX(val: number): number {
    // Zoom into [1.0, 1.8] for the sequence viz
    return 10 + ((val - 1.0) / 0.8) * 380;
  }

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging()) return;
    const svg = ev.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const xRatio = (ev.clientX - rect.left) / rect.width;
    const val = (xRatio * 400 - 10) / 380 * 2.5;
    this.divider.set(Math.max(0.1, Math.min(2.4, val)));
  }
}
