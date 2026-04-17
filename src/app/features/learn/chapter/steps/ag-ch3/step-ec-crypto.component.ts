import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import {
  implicitCurve, PlotView, plotToSvgX, plotToSvgY, plotAxesPath,
} from '../ag-ch1/ag-util';

/* ── Point addition on y^2 = x^3 - 5x + 5 (a = -5, b = 5) over ℝ ── */

interface RealPt { x: number; y: number; inf?: false; }
interface InfPt { inf: true; }
type Pt = RealPt | InfPt;

function ecDoubleR(P: RealPt): Pt {
  if (Math.abs(P.y) < 1e-14) return { inf: true };
  const m = (3 * P.x * P.x - 5) / (2 * P.y);
  const x3 = m * m - 2 * P.x;
  const y3 = m * (P.x - x3) - P.y;
  return { x: x3, y: y3 };
}

function ecAddR(P: RealPt, Q: RealPt): Pt {
  if (Math.abs(P.x - Q.x) < 1e-14 && Math.abs(P.y - Q.y) < 1e-14) {
    return ecDoubleR(P);
  }
  if (Math.abs(P.x - Q.x) < 1e-14) return { inf: true };
  const m = (Q.y - P.y) / (Q.x - P.x);
  const x3 = m * m - P.x - Q.x;
  const y3 = m * (P.x - x3) - P.y;
  return { x: x3, y: y3 };
}

function fmtCoord(v: number): string {
  if (Math.abs(v - Math.round(v)) < 0.005) return Math.round(v).toString();
  return v.toFixed(2);
}

function ptStr(p: Pt): string {
  if (p.inf) return 'O';
  return `(${fmtCoord(p.x)}, ${fmtCoord(p.y)})`;
}

@Component({
  selector: 'app-step-ec-crypto',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="橢圓曲線與密碼學" subtitle="§3.5">
      <p>
        Elliptic curves have a remarkable application in cryptography. The key insight:
        computing nP (adding P to itself n times) is <strong>EASY</strong>
        (just repeat the doubling trick —
        <app-math e="O(\\log n)"></app-math> steps).
        But given P and Q = nP, finding n is <strong>HARD</strong>
        (the Elliptic Curve Discrete Logarithm Problem, ECDLP).
      </p>
      <p>
        This one-way function is the basis of Elliptic Curve Cryptography (ECC),
        used in HTTPS, Bitcoin, Signal, and most modern secure communication.
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>ECDH (Elliptic Curve Diffie-Hellman) key exchange:</p>
      <ol>
        <li>Alice and Bob publicly agree on a curve E and a point G</li>
        <li>Alice picks a secret integer a, computes A = aG, sends A to Bob</li>
        <li>Bob picks a secret integer b, computes B = bG, sends B to Alice</li>
        <li>Alice computes aB = a(bG) = abG</li>
        <li>Bob computes bA = b(aG) = abG</li>
        <li>They share the same secret key abG! An eavesdropper knows G, A, B
          but can't compute abG without solving ECDLP.</li>
      </ol>
    </app-prose-block>

    <app-prose-block>
      <p>
        Why elliptic curves instead of regular integers? For the same security level,
        ECC uses MUCH smaller keys.
        RSA needs 3072-bit keys for 128-bit security; ECC only needs 256 bits.
        This matters for mobile devices, smart cards, IoT.
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        The security depends on choosing the right curve.
        Real-world curves like Curve25519 and P-256 are carefully designed to resist known attacks.
      </p>
    </app-prose-block>

    <app-challenge-card prompt="模擬 ECDH 金鑰交換——觀察 Alice 和 Bob 如何建立共享秘密">
      <!-- Sliders -->
      <div class="slider-row">
        <div class="slider-group">
          <span class="sl-label alice-label">Alice: a = {{ aliceA() }}</span>
          <input type="range" min="2" max="8" step="1"
                 [value]="aliceA()"
                 (input)="aliceA.set(+($any($event.target)).value)"
                 class="sl-input alice-slider" />
        </div>
        <div class="slider-group">
          <span class="sl-label bob-label">Bob: b = {{ bobB() }}</span>
          <input type="range" min="2" max="8" step="1"
                 [value]="bobB()"
                 (input)="bobB.set(+($any($event.target)).value)"
                 class="sl-input bob-slider" />
        </div>
      </div>

      <!-- SVG plot -->
      <svg [attr.viewBox]="'0 0 ' + v.svgW + ' ' + v.svgH" class="plot-svg">
        <!-- Axes -->
        <path [attr.d]="axesPath" fill="none" stroke="var(--text-muted)" stroke-width="0.8" />

        <!-- Curve -->
        <path [attr.d]="curvePath" fill="none" stroke="var(--accent)" stroke-width="2"
              stroke-linecap="round" />

        <!-- Base point G -->
        <circle [attr.cx]="toSvgX(1)" [attr.cy]="toSvgY(1)" r="5"
                fill="#888" stroke="#fff" stroke-width="1.2" />
        <text [attr.x]="toSvgX(1) + 9" [attr.y]="toSvgY(1) - 8"
              class="pt-label" fill="#888">G</text>

        <!-- Alice's public key A = aG -->
        @if (alicePtInfo().show) {
          <circle [attr.cx]="alicePtInfo().sx" [attr.cy]="alicePtInfo().sy" r="6"
                  fill="#4a7ab5" stroke="#fff" stroke-width="1.2" />
          <text [attr.x]="alicePtInfo().sx + 9" [attr.y]="alicePtInfo().sy - 8"
                class="pt-label" fill="#4a7ab5">A</text>
        }

        <!-- Bob's public key B = bG -->
        @if (bobPtInfo().show) {
          <circle [attr.cx]="bobPtInfo().sx" [attr.cy]="bobPtInfo().sy" r="6"
                  fill="#5a9a5a" stroke="#fff" stroke-width="1.2" />
          <text [attr.x]="bobPtInfo().sx + 9" [attr.y]="bobPtInfo().sy - 8"
                class="pt-label" fill="#5a9a5a">B</text>
        }

        <!-- Shared secret S = abG -->
        @if (sharedPtInfo().show) {
          <circle [attr.cx]="sharedPtInfo().sx" [attr.cy]="sharedPtInfo().sy" r="7"
                  fill="#c05050" stroke="#fff" stroke-width="1.5" />
          <text [attr.x]="sharedPtInfo().sx + 10" [attr.y]="sharedPtInfo().sy - 10"
                class="pt-label secret-label" fill="#c05050">S</text>
        }

        <!-- Legend -->
        <g transform="translate(40, 25)">
          <circle cx="0" cy="0" r="4" fill="#888" />
          <text x="8" y="4" class="legend-text">G (基點)</text>
          <circle cx="0" cy="16" r="4" fill="#4a7ab5" />
          <text x="8" y="20" class="legend-text" fill="#4a7ab5">A = aG (Alice)</text>
          <circle cx="0" cy="32" r="4" fill="#5a9a5a" />
          <text x="8" y="36" class="legend-text" fill="#5a9a5a">B = bG (Bob)</text>
          <circle cx="0" cy="48" r="4" fill="#c05050" />
          <text x="8" y="52" class="legend-text" fill="#c05050">S = abG (共享秘密)</text>
        </g>
      </svg>

      <!-- Protocol steps panel -->
      <div class="protocol-panel">
        <div class="proto-title">ECDH 金鑰交換協議</div>
        <div class="proto-step pub-step">
          1. 公開：E: <app-math e="y^2 = x^3 - 5x + 5"></app-math>,  G = (1, 1)
        </div>
        <div class="proto-step private-step">
          2. Alice: a = {{ aliceA() }}
          <span class="arrow-sep">&rarr;</span>
          <span class="pub-val">A = aG = {{ alicePtStr() }}</span>
          <span class="tag private-tag">私密</span>&rarr;<span class="tag pub-tag">公開</span>
        </div>
        <div class="proto-step private-step">
          3. Bob: b = {{ bobB() }}
          <span class="arrow-sep">&rarr;</span>
          <span class="pub-val">B = bG = {{ bobPtStr() }}</span>
          <span class="tag private-tag">私密</span>&rarr;<span class="tag pub-tag">公開</span>
        </div>
        <div class="proto-step secret-step">
          4. Alice: aB = a(bG) = {{ productAB() }}G = {{ sharedPtStr() }}
          <span class="tag secret-tag">共享秘密</span>
        </div>
        <div class="proto-step secret-step">
          5. Bob: bA = b(aG) = {{ productAB() }}G = {{ sharedPtStr() }}
          <span class="tag secret-tag">共享秘密</span>
        </div>
        <div class="proto-step verify-step">
          6. aB = bA = abG
          <span class="check-mark">&check;</span>
        </div>
      </div>

      <!-- Eavesdropper view -->
      <div class="eve-panel">
        <div class="eve-title">竊聽者 Eve 的視角</div>
        <div class="eve-content">
          <div class="eve-row">
            <span class="eve-label">已知：</span>
            <span class="eve-val">G = (1, 1), A = {{ alicePtStr() }}, B = {{ bobPtStr() }}</span>
          </div>
          <div class="eve-row">
            <span class="eve-label">需要求解：</span>
            <span class="eve-val">ECDLP: given G and aG, find a</span>
            <span class="hard-badge">困難!</span>
          </div>
          <div class="eve-row">
            <span class="eve-label">無法計算：</span>
            <span class="eve-val">abG = {{ sharedPtStr() }}</span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        從純粹數學（19 世紀的橢圓函數理論）到現代密碼學（21 世紀的網路安全），
        橢圓曲線的旅程橫跨了 200 年。
        這是基礎數學最終改變世界的典範。
        代數幾何不只是抽象的理論——它保護著你每天的網路通訊。
      </p>
    </app-prose-block>
  `,
  styles: `
    .slider-row {
      display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .slider-group {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 180px;
    }
    .sl-label {
      font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; min-width: 100px;
    }
    .alice-label { color: #4a7ab5; }
    .bob-label { color: #5a9a5a; }
    .sl-input { flex: 1; }
    .alice-slider { accent-color: #4a7ab5; }
    .bob-slider { accent-color: #5a9a5a; }
    .plot-svg {
      width: 100%; display: block; margin-bottom: 10px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    }
    .pt-label {
      font-size: 10px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .secret-label { font-size: 11px; }
    .legend-text {
      font-size: 9px; font-family: 'JetBrains Mono', monospace;
      fill: var(--text-muted);
    }

    /* Protocol panel */
    .protocol-panel {
      padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--bg-surface); margin-bottom: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      line-height: 2;
    }
    .proto-title {
      font-size: 11px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
    }
    .proto-step { padding: 2px 0; }
    .pub-step { color: var(--text-secondary); }
    .private-step { color: var(--text-secondary); }
    .secret-step { color: #c05050; }
    .verify-step { color: #5a9a5a; font-weight: 700; }
    .arrow-sep { margin: 0 4px; color: var(--text-muted); }
    .pub-val { color: var(--text); }
    .tag {
      display: inline-block; padding: 1px 6px; border-radius: 3px;
      font-size: 9px; font-weight: 700; margin-left: 4px; vertical-align: middle;
    }
    .private-tag { background: rgba(170,130,90,0.12); color: #8a6a3a; border: 1px solid rgba(170,130,90,0.25); }
    .pub-tag { background: rgba(100,100,120,0.1); color: var(--text-secondary); border: 1px solid var(--border); }
    .secret-tag { background: rgba(192,80,80,0.1); color: #c05050; border: 1px solid rgba(192,80,80,0.25); }
    .check-mark { color: #5a9a5a; font-size: 14px; margin-left: 6px; }

    /* Eve panel */
    .eve-panel {
      padding: 12px 14px; border-radius: 8px;
      border: 1px solid rgba(192,80,80,0.25);
      background: rgba(192,80,80,0.04); margin-bottom: 10px;
    }
    .eve-title {
      font-size: 11px; font-weight: 700; color: #c05050;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
    }
    .eve-content {
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
    }
    .eve-row {
      padding: 2px 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    }
    .eve-label { color: var(--text-muted); font-weight: 600; min-width: 80px; }
    .eve-val { color: var(--text-secondary); }
    .hard-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      font-size: 10px; font-weight: 700;
      background: rgba(192,60,60,0.12); color: #b03030;
      border: 1px solid rgba(192,60,60,0.3);
    }
  `,
})
export class StepEcCryptoComponent {
  readonly v: PlotView = { xRange: [-4, 8], yRange: [-12, 12], svgW: 520, svgH: 480, pad: 30 };
  readonly axesPath = plotAxesPath(this.v);

  toSvgX = (x: number) => plotToSvgX(this.v, x);
  toSvgY = (y: number) => plotToSvgY(this.v, y);

  /** Curve path for y^2 = x^3 - 5x + 5 */
  readonly curvePath = implicitCurve(
    (x, y) => y * y - x * x * x + 5 * x - 5,
    this.v.xRange, this.v.yRange,
    this.toSvgX, this.toSvgY, 160,
  );

  /** Base point G = (1, 1) */
  private readonly G: RealPt = { x: 1, y: 1 };

  readonly aliceA = signal(3);
  readonly bobB = signal(5);
  readonly productAB = computed(() => this.aliceA() * this.bobB());

  /** Pre-compute scalar multiples nG for n = 1..64 */
  private readonly multCache: Pt[] = (() => {
    const cache: Pt[] = [{ inf: true }]; // index 0 unused
    let cur: Pt = this.G;
    cache.push(cur); // 1G
    for (let i = 2; i <= 64; i++) {
      if (cur.inf) { cache.push({ inf: true }); continue; }
      cur = ecAddR(cur, this.G);
      cache.push(cur);
    }
    return cache;
  })();

  private nG(n: number): Pt {
    if (n <= 0 || n >= this.multCache.length) return { inf: true };
    return this.multCache[n];
  }

  private ptInView(p: Pt): { show: boolean; sx: number; sy: number } {
    if (p.inf) return { show: false, sx: 0, sy: 0 };
    const inRange = p.x >= this.v.xRange[0] && p.x <= this.v.xRange[1]
                 && p.y >= this.v.yRange[0] && p.y <= this.v.yRange[1];
    if (!inRange) return { show: false, sx: 0, sy: 0 };
    return { show: true, sx: this.toSvgX(p.x), sy: this.toSvgY(p.y) };
  }

  /** Alice's public key A = aG */
  readonly alicePt = computed(() => this.nG(this.aliceA()));
  readonly alicePtStr = computed(() => ptStr(this.alicePt()));
  readonly alicePtInfo = computed(() => this.ptInView(this.alicePt()));

  /** Bob's public key B = bG */
  readonly bobPt = computed(() => this.nG(this.bobB()));
  readonly bobPtStr = computed(() => ptStr(this.bobPt()));
  readonly bobPtInfo = computed(() => this.ptInView(this.bobPt()));

  /** Shared secret S = abG */
  readonly sharedPt = computed(() => this.nG(this.productAB()));
  readonly sharedPtStr = computed(() => ptStr(this.sharedPt()));
  readonly sharedPtInfo = computed(() => this.ptInView(this.sharedPt()));
}
