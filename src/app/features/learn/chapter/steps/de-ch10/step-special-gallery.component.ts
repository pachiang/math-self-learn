import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// Legendre polynomials via Rodrigues (recurrence (n+1)P_{n+1} = (2n+1)xP_n - nP_{n-1})
function legendreP(n: number, x: number): number {
  if (n === 0) return 1;
  if (n === 1) return x;
  let pm1 = 1, p = x;
  for (let k = 1; k < n; k++) {
    const pp = ((2 * k + 1) * x * p - k * pm1) / (k + 1);
    pm1 = p;
    p = pp;
  }
  return p;
}

// Hermite (physicist) H_n via recurrence H_{n+1} = 2x H_n - 2n H_{n-1}
function hermiteH(n: number, x: number): number {
  if (n === 0) return 1;
  if (n === 1) return 2 * x;
  let hm1 = 1, h = 2 * x;
  for (let k = 1; k < n; k++) {
    const hp = 2 * x * h - 2 * k * hm1;
    hm1 = h;
    h = hp;
  }
  return h;
}

// Laguerre L_n via recurrence (n+1)L_{n+1} = (2n+1 - x)L_n - n L_{n-1}
function laguerreL(n: number, x: number): number {
  if (n === 0) return 1;
  if (n === 1) return 1 - x;
  let lm1 = 1, l = 1 - x;
  for (let k = 1; k < n; k++) {
    const lp = ((2 * k + 1 - x) * l - k * lm1) / (k + 1);
    lm1 = l;
    l = lp;
  }
  return l;
}

// Bessel J_n (reuse series/asymptotic)
function besselJ(n: number, x: number): number {
  if (Math.abs(x) > 20) {
    const phase = x - (n * Math.PI) / 2 - Math.PI / 4;
    return Math.sqrt(2 / (Math.PI * x)) * Math.cos(phase);
  }
  let sum = 0;
  const half = x / 2;
  let term = Math.pow(half, n);
  for (let k = 1; k <= n; k++) term /= k;
  sum = term;
  let sign = -1;
  for (let k = 1; k < 40; k++) {
    term *= (half * half) / (k * (k + n));
    sum += sign * term;
    sign = -sign;
  }
  return sum;
}

type Family = 'legendre' | 'hermite' | 'laguerre' | 'bessel';

interface FamilyInfo {
  id: Family;
  name: string;
  eq: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  eval: (n: number, x: number) => number;
  where: string;
  intervalLabel: string;
}

const FAMILIES: Record<Family, FamilyInfo> = {
  legendre: {
    id: 'legendre',
    name: 'Legendre Pₙ',
    eq: '(1−x²)y″ − 2xy′ + n(n+1)y = 0',
    xMin: -1, xMax: 1, yMin: -1.2, yMax: 1.2,
    eval: legendreP,
    where: '球面諧波、氫原子角向、重力多極',
    intervalLabel: '[−1, 1]',
  },
  hermite: {
    id: 'hermite',
    name: 'Hermite Hₙ',
    eq: 'y″ − 2xy′ + 2n·y = 0',
    xMin: -3, xMax: 3, yMin: -30, yMax: 30,
    eval: hermiteH,
    where: '量子諧振子的波函數',
    intervalLabel: 'ℝ（加 e^(−x²/2) 權重）',
  },
  laguerre: {
    id: 'laguerre',
    name: 'Laguerre Lₙ',
    eq: 'xy″ + (1−x)y′ + n·y = 0',
    xMin: 0, xMax: 10, yMin: -3, yMax: 3,
    eval: laguerreL,
    where: '氫原子徑向、雷射熱分佈',
    intervalLabel: '[0, ∞)（加 e^(−x) 權重）',
  },
  bessel: {
    id: 'bessel',
    name: 'Bessel Jₙ',
    eq: 'x²y″ + xy′ + (x²−n²)y = 0',
    xMin: 0, xMax: 20, yMin: -0.7, yMax: 1.1,
    eval: besselJ,
    where: '圓形鼓面、圓柱波、圓波導',
    intervalLabel: '(0, ∞)',
  },
};

@Component({
  selector: 'app-de-ch10-special-gallery',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="特殊函數畫廊" subtitle="§10.4">
      <p>
        冪級數與 Frobenius 方法產生一整族<strong>特殊函數</strong>。
        它們是物理的工作主力——出現在邊界值問題、分離變數、量子力學的每個角落。
      </p>

      <div class="tab-row">
        @for (f of families; track f.id) {
          <button class="tab" [class.active]="family() === f.id" (click)="family.set(f.id)">
            {{ f.name }}
          </button>
        }
      </div>

      <div class="info-box">
        <div class="info-eq">{{ currentInfo().eq }}</div>
        <div class="info-grid">
          <div><strong>出場：</strong>{{ currentInfo().where }}</div>
          <div><strong>區間：</strong>{{ currentInfo().intervalLabel }}</div>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="滑動階數 n：看同一族的不同成員">
      <div class="plot">
        <div class="plot-title">{{ currentInfo().name }} — 橫軸 x ∈ [{{ currentInfo().xMin }}, {{ currentInfo().xMax }}]</div>
        <svg viewBox="-20 -95 440 190" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <!-- baseline at leftmost if xMin=0 -->
          @if (currentInfo().xMin === 0) {
            <line x1="0" y1="-90" x2="0" y2="85" stroke="var(--border-strong)" stroke-width="1" />
          } @else {
            <line x1="200" y1="-90" x2="200" y2="85" stroke="var(--border-strong)" stroke-width="1" />
          }
          <!-- All orders up to nMax-1 as faint lines, current as bold -->
          @for (k of orderList(); track k) {
            <path [attr.d]="curveFor(k)" fill="none"
              [attr.stroke]="k === n() ? 'var(--accent)' : 'var(--text-muted)'"
              [attr.stroke-width]="k === n() ? 2.4 : 1"
              [attr.opacity]="k === n() ? 1 : 0.3" />
          }
          <text x="405" y="4" class="ax">x</text>
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">階數 n</span>
          <input type="range" min="0" max="6" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">n = {{ n() }}</span>
        </div>
        <p class="note">
          粗橘線是當前 n；淡灰線是 n = 0…6 同時顯示。
          觀察：<strong>n 越大零點越多</strong>——跟量子能階的節點數一模一樣。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>共同特徵：它們全是「Sturm-Liouville 問題」的本徵函數</h4>
      <p>
        這四族函數都滿足類似結構：<strong>找使得 ODE 在特定邊界條件下有非平凡解的 n</strong>。
        這種問題叫做<strong>本徵值問題</strong>（eigenvalue problem）。
      </p>
      <ul class="property-list">
        <li><strong>正交性</strong>：不同階的兩個特殊函數彼此正交（配適當的權重函數）。</li>
        <li><strong>完備性</strong>：任意「好」函數能展開成它們的線性組合（類比 Fourier 基底）。</li>
        <li><strong>遞迴關係</strong>：高階由低階生成，方便計算。</li>
        <li><strong>羅德里奇公式</strong>：每族都有一個微分公式生成 n 階（如 Pₙ = (1/2ⁿn!) dⁿ/dxⁿ [(x²−1)ⁿ]）。</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        特殊函數不是零散的「怪物」——它們是 Sturm-Liouville 問題的統一產物。
        下一章會看到這個架構，以及它如何與 Fourier 級數統一。
      </p>
    </app-prose-block>
  `,
  styles: `
    .tab-row { display: flex; gap: 6px; margin: 10px 0; flex-wrap: wrap; }
    .tab {
      font: inherit; font-size: 13px; padding: 6px 12px;
      background: transparent; border: 1px solid var(--border);
      border-radius: 16px; cursor: pointer; color: var(--text-muted);
    }
    .tab.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .tab:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .info-box { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin: 8px 0 12px; }
    .info-eq {
      text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 15px;
      padding: 8px; background: var(--accent-10); border-radius: 6px; color: var(--accent); font-weight: 600; margin-bottom: 8px;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .info-grid strong { color: var(--accent); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .plot-svg { width: 100%; display: block; }
    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }
    .note { font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin: 8px 0 0; }

    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 4px; }
    .property-list { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .property-list strong { color: var(--accent); }

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
  `,
})
export class DeCh10SpecialGalleryComponent {
  readonly family = signal<Family>('legendre');
  readonly n = signal(2);

  readonly families = [FAMILIES.legendre, FAMILIES.hermite, FAMILIES.laguerre, FAMILIES.bessel];
  readonly currentInfo = computed(() => FAMILIES[this.family()]);
  readonly orderList = () => [0, 1, 2, 3, 4, 5, 6];

  curveFor(k: number): string {
    const info = this.currentInfo();
    const N = 300;
    const W = 400;
    const H = 85;
    const yRange = info.yMax - info.yMin;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = info.xMin + (info.xMax - info.xMin) * t;
      let y: number;
      try {
        y = info.eval(k, x);
      } catch {
        continue;
      }
      if (!isFinite(y)) continue;
      const yc = Math.max(info.yMin, Math.min(info.yMax, y));
      const px = t * W;
      const py = -((yc - info.yMin) / yRange - 0.5) * 2 * H;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
