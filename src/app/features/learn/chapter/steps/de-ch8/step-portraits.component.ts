import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Portrait {
  id: string;
  label: string;
  name_en: string;
  A: [[number, number], [number, number]];
  eigenvalues: string;
  description: string;
  stability: 'stable' | 'unstable' | 'neutral';
  color: string;
}

const PORTRAITS: Portrait[] = [
  {
    id: 'stable-node',
    label: '穩定節點',
    name_en: 'Stable Node',
    A: [[-1, 0], [0, -2]],
    eigenvalues: 'λ₁, λ₂ < 0 (實)',
    description: '兩個特徵值都負實數。所有軌跡沿著兩條特徵向量方向指數收斂到原點。',
    stability: 'stable',
    color: '#5ca878',
  },
  {
    id: 'unstable-node',
    label: '不穩定節點',
    name_en: 'Unstable Node',
    A: [[1, 0], [0, 2]],
    eigenvalues: 'λ₁, λ₂ > 0 (實)',
    description: '兩個特徵值都正實數。軌跡從原點擴散到無限。',
    stability: 'unstable',
    color: '#c87b5e',
  },
  {
    id: 'saddle',
    label: '鞍點',
    name_en: 'Saddle',
    A: [[1, 0], [0, -1]],
    eigenvalues: 'λ₁ > 0, λ₂ < 0',
    description: '一正一負。沿穩定方向收斂、沿不穩定方向爆炸。軌跡像雙曲線。',
    stability: 'unstable',
    color: '#c87b5e',
  },
  {
    id: 'stable-spiral',
    label: '穩定焦點',
    name_en: 'Stable Spiral',
    A: [[-0.3, -1], [1, -0.3]],
    eigenvalues: 'Re(λ) < 0, 複',
    description: '複特徵值帶負實部。軌跡螺旋收斂到原點（欠阻尼振盪）。',
    stability: 'stable',
    color: '#5ca878',
  },
  {
    id: 'unstable-spiral',
    label: '不穩定焦點',
    name_en: 'Unstable Spiral',
    A: [[0.3, -1], [1, 0.3]],
    eigenvalues: 'Re(λ) > 0, 複',
    description: '複特徵值帶正實部。軌跡螺旋爆炸到無限。',
    stability: 'unstable',
    color: '#c87b5e',
  },
  {
    id: 'center',
    label: '中心',
    name_en: 'Center',
    A: [[0, -1], [1, 0]],
    eigenvalues: 'Re(λ) = 0, 純虛',
    description: '純虛特徵值。軌跡是閉合橢圓——能量永久守恆（純無阻尼振盪）。',
    stability: 'neutral',
    color: '#8b6aa8',
  },
];

function integrate(
  A: [[number, number], [number, number]],
  x0: [number, number],
  tMax: number,
  dir: 1 | -1,
  dt = 0.02,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [x0];
  let x = x0[0], y = x0[1];
  const h = dt * dir;
  const n = Math.ceil(tMax / dt);
  for (let i = 0; i < n; i++) {
    const f = (xx: number, yy: number): [number, number] => [
      A[0][0] * xx + A[0][1] * yy,
      A[1][0] * xx + A[1][1] * yy,
    ];
    const [k1x, k1y] = f(x, y);
    const [k2x, k2y] = f(x + (h / 2) * k1x, y + (h / 2) * k1y);
    const [k3x, k3y] = f(x + (h / 2) * k2x, y + (h / 2) * k2y);
    const [k4x, k4y] = f(x + h * k3x, y + h * k3y);
    x = x + (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    y = y + (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 10 || Math.abs(y) > 10) break;
    pts.push([x, y]);
  }
  return pts;
}

const PX = 36;

@Component({
  selector: 'app-de-ch8-portraits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="相平面六種肖像" subtitle="§8.4">
      <p>
        線性 2D 系統 <code>dx/dt = A·x</code> 的所有可能行為都能<strong>分類成六種基本肖像</strong>。
        決定肖像的唯一因素是 A 的<strong>兩個特徵值</strong>——實部符號、是否為複數、是否相等。
      </p>
      <p class="key-idea">
        六種肖像：節點（穩定／不穩定）、焦點（穩定／不穩定）、鞍點、中心。
      </p>
      <p>
        這個分類為什麼重要？因為在 Ch9 處理<strong>非線性系統</strong>時，每個平衡點附近的局部行為都會落在這六類其中一種——
        這叫<strong>線性化</strong>。先把線性世界的「地圖」記熟，下一章就能套用。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="六種相肖像一次看完">
      <div class="gallery">
        @for (p of portraits; track p.id) {
          <div class="port-card"
            [style.--col]="p.color"
            [class.stable]="p.stability === 'stable'"
            [class.unstable]="p.stability === 'unstable'"
            [class.neutral]="p.stability === 'neutral'">
            <div class="port-head">
              <div class="port-label">{{ p.label }}</div>
              <span class="stab-badge">
                {{ p.stability === 'stable' ? '✓ 穩定' : p.stability === 'unstable' ? '✗ 不穩定' : '◯ 中性' }}
              </span>
            </div>
            <div class="port-eig">{{ p.eigenvalues }}</div>

            <svg viewBox="-80 -80 160 160" class="port-svg">
              <!-- Grid -->
              <line x1="-70" y1="0" x2="70" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
              <line x1="0" y1="-70" x2="0" y2="70" stroke="var(--border-strong)" stroke-width="0.8" />

              <!-- Vector field (sparse) -->
              @for (a of vectorFieldOf(p.A); track a.k) {
                <line [attr.x1]="a.x1" [attr.y1]="a.y1"
                  [attr.x2]="a.x2" [attr.y2]="a.y2"
                  stroke="var(--text-muted)" stroke-width="0.7"
                  stroke-linecap="round" opacity="0.4" />
              }

              <!-- Trajectories from various initial points -->
              @for (tr of trajectoriesOf(p.A); track $index) {
                <path [attr.d]="tr" fill="none"
                  [attr.stroke]="p.color" stroke-width="1.4" opacity="0.85" />
              }

              <!-- Origin marker -->
              <circle cx="0" cy="0" r="3"
                [attr.fill]="p.stability === 'stable' ? '#5ca878' : p.stability === 'unstable' ? '#c87b5e' : '#8b6aa8'"
                stroke="white" stroke-width="1" />
            </svg>

            <p class="port-desc">{{ p.description }}</p>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="怎麼判斷？trace（τ）與 determinant（Δ）">
      <p>
        2×2 矩陣 A = [[a, b], [c, d]] 的特徵值是
        <code>λ = (τ ± √(τ² − 4Δ))/2</code>，其中：
      </p>
      <ul>
        <li><strong>τ = tr(A) = a + d</strong>（主對角線和）</li>
        <li><strong>Δ = det(A) = ad − bc</strong></li>
      </ul>
      <p>
        從 τ 跟 Δ 就能讀出相肖像類型：
      </p>

      <div class="decision">
        <div class="d-node root">
          <div class="d-title">從 Δ 開始</div>
        </div>

        <div class="d-branch">
          <div class="d-path">
            <div class="d-question">Δ &lt; 0？</div>
            <div class="d-answer yes">是 →</div>
            <div class="d-node leaf saddle">
              <div class="d-label">鞍點</div>
              <div class="d-note">一正一負特徵值</div>
            </div>
          </div>

          <div class="d-path">
            <div class="d-question">Δ &gt; 0？繼續看 τ 跟判別式</div>
            <div class="d-sub">
              <div class="d-sub-path">
                <div class="d-sub-q">τ² − 4Δ &gt; 0</div>
                <div class="d-sub-note">節點</div>
                <div class="d-sub-split">
                  <span class="d-leaf stable">τ &lt; 0 → 穩定節點</span>
                  <span class="d-leaf unstable">τ &gt; 0 → 不穩定節點</span>
                </div>
              </div>
              <div class="d-sub-path">
                <div class="d-sub-q">τ² − 4Δ &lt; 0</div>
                <div class="d-sub-note">焦點（複特徵值）</div>
                <div class="d-sub-split">
                  <span class="d-leaf stable">τ &lt; 0 → 穩定焦點</span>
                  <span class="d-leaf unstable">τ &gt; 0 → 不穩定焦點</span>
                  <span class="d-leaf neutral">τ = 0 → 中心</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        幾個觀察：
      </p>
      <ul>
        <li><strong>穩定性由 τ（trace）決定</strong>：兩特徵值和為負 → 系統收斂。</li>
        <li><strong>振盪與否由 τ² − 4Δ（判別式）決定</strong>：負判別式 → 複根 → 螺旋／中心。</li>
        <li><strong>鞍點 Δ &lt; 0</strong> 永遠不穩定——這是最危險的平衡點（控制系統設計時要避開）。</li>
      </ul>
      <p>
        接下來一節直接用 τ 跟 Δ 做軸，畫出一張「一張圖看全部」的<strong>分類圖</strong>——
        Poincaré 的 trace-det 平面。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        線性 2D 系統只有 6 種可能的長相，完全由矩陣 A 的兩個特徵值分類。
        記住這張 gallery，下一章處理非線性系統時你只需要「局部看一眼」就能判斷平衡點的行為。
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

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .port-card {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 5%, var(--bg));
    }

    .port-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .port-label {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    .stab-badge {
      font-size: 10px;
      padding: 2px 8px;
      background: var(--col);
      color: white;
      border-radius: 10px;
      font-weight: 700;
    }

    .port-eig {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--col);
      margin-bottom: 8px;
    }

    .port-svg {
      width: 100%;
      display: block;
      background: var(--bg);
      border-radius: 6px;
      padding: 4px;
      margin-bottom: 8px;
    }

    .port-desc {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .decision {
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      margin: 14px 0;
    }

    .d-node {
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .d-node.root {
      background: var(--accent-10);
      border: 1px solid var(--accent-30);
      text-align: center;
    }

    .d-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
    }

    .d-branch {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .d-path {
      padding: 10px;
      background: var(--bg-surface);
      border-radius: 8px;
    }

    .d-question {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
    }

    .d-answer.yes {
      display: inline-block;
      padding: 4px 10px;
      margin-right: 8px;
      background: #c87b5e;
      color: white;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }

    .d-node.leaf.saddle {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(200, 123, 94, 0.15);
      color: #c87b5e;
      border-radius: 6px;
      border: 1px solid rgba(200, 123, 94, 0.4);
    }

    .d-label {
      font-size: 14px;
      font-weight: 700;
    }

    .d-note {
      font-size: 11px;
      opacity: 0.85;
    }

    .d-sub {
      margin-top: 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    @media (max-width: 620px) {
      .d-sub { grid-template-columns: 1fr; }
    }

    .d-sub-path {
      padding: 10px;
      background: var(--bg);
      border-radius: 6px;
      border: 1px dashed var(--border);
    }

    .d-sub-q {
      font-size: 12px;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 4px;
    }

    .d-sub-note {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .d-sub-split {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .d-leaf {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .d-leaf.stable {
      background: rgba(92, 168, 120, 0.12);
      color: #5ca878;
    }

    .d-leaf.unstable {
      background: rgba(200, 123, 94, 0.12);
      color: #c87b5e;
    }

    .d-leaf.neutral {
      background: rgba(139, 106, 168, 0.12);
      color: #8b6aa8;
    }
  `,
})
export class DeCh8PortraitsComponent {
  readonly portraits = PORTRAITS;

  vectorFieldOf(A: [[number, number], [number, number]]): Array<{
    k: string; x1: number; y1: number; x2: number; y2: number;
  }> {
    const out: { k: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const range = 2.5;
    const step = 0.9;
    for (let xi = -range; xi <= range + 0.01; xi += step) {
      for (let yi = -range; yi <= range + 0.01; yi += step) {
        const dx = A[0][0] * xi + A[0][1] * yi;
        const dy = A[1][0] * xi + A[1][1] * yi;
        const mag = Math.hypot(dx, dy);
        if (mag < 0.01) continue;
        const cx = xi * 24;
        const cy = -yi * 24;
        const scale = 8 / mag;
        out.push({
          k: `${xi.toFixed(1)}_${yi.toFixed(1)}`,
          x1: cx, y1: cy,
          x2: cx + dx * scale, y2: cy - dy * scale,
        });
      }
    }
    return out;
  }

  trajectoriesOf(A: [[number, number], [number, number]]): string[] {
    const initials: Array<[number, number]> = [
      [2, 0], [-2, 0], [0, 2], [0, -2],
      [1.5, 1.5], [-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5],
    ];
    return initials.map((ic) => {
      const fwd = integrate(A, ic, 4, 1);
      const bwd = integrate(A, ic, 2.5, -1);
      const all = [...bwd.reverse(), ...fwd];
      return all
        .map(([x, y], i) => {
          const xc = Math.max(-3, Math.min(3, x));
          const yc = Math.max(-3, Math.min(3, y));
          return `${i === 0 ? 'M' : 'L'} ${(xc * 24).toFixed(1)} ${(-yc * 24).toFixed(1)}`;
        })
        .join(' ');
    });
  }
}
