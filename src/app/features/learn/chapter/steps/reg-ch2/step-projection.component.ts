import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-reg-ch2-projection',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="幾何觀：投影與帽子矩陣" subtitle="§2.3">
      <p>
        OLS 的美感藏在幾何——它不是在做「擬合」，而是在做<strong>投影</strong>。
      </p>

      <h4>把每個向量想成 n 維空間裡的一點</h4>
      <p>
        Y ∈ ℝⁿ 是一個 n 維向量（n 筆觀察）。
        X 的 p + 1 個欄也是 ℝⁿ 的向量，張成一個子空間 <strong>col(X)</strong>（最多 p + 1 維）。
      </p>
      <p>
        Xβ 可以是 col(X) 裡的<em>任何</em>向量。問題變成：
      </p>
      <div class="key-question">
        在 col(X) 這個子空間裡，哪個向量離 Y 最近？
      </div>

      <h4>答案：Y 在 col(X) 上的正交投影</h4>
      <div class="centered-eq big">
        Ŷ = H Y，&nbsp; H = X(XᵀX)⁻¹Xᵀ
      </div>
      <p>
        殘差 e = Y − Ŷ 垂直於 col(X)——這正是「正規方程 Xᵀe = 0」的幾何意義：
      </p>
      <div class="centered-eq">
        Xᵀ e = 0 &nbsp;&nbsp; ↔ &nbsp;&nbsp; 殘差與每個 xⱼ 正交
      </div>

      <div class="key-idea">
        <strong>為什麼第一行是全 1？</strong>
        1 向量也在 col(X) 裡 → Xᵀe 的第一個元素 = 1ᵀe = Σeᵢ = 0 —— <em>殘差和必為 0</em>。
        這就是「直線過 (x̄, ȳ)」的代數版。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="3D 視覺化：Y、Ŷ、e 的關係（把 X 視為 ℝ³ 中的平面）">
      <div class="proj-view">
        <svg viewBox="0 0 440 320" class="p-svg">
          <!-- Ground plane (col(X)) -->
          <polygon points="80,220 380,220 340,160 40,160"
                   fill="#5a8aa8" opacity="0.15" stroke="#5a8aa8" stroke-width="1" />
          <text x="50" y="220" class="tk">col(X)</text>

          <!-- Grid on plane -->
          <g stroke="#5a8aa8" stroke-width="0.5" opacity="0.4">
            <line x1="130" y1="210" x2="90" y2="170" />
            <line x1="180" y1="200" x2="140" y2="170" />
            <line x1="230" y1="200" x2="190" y2="170" />
            <line x1="280" y1="200" x2="240" y2="170" />
            <line x1="330" y1="200" x2="290" y2="170" />
            <line x1="110" y1="200" x2="350" y2="200" />
            <line x1="90" y1="185" x2="325" y2="185" />
            <line x1="60" y1="170" x2="330" y2="170" />
          </g>

          <!-- Vectors -->
          <!-- Y vector from origin to Y point -->
          <line x1="200" y1="195" [attr.x2]="yTipX()" [attr.y2]="yTipY()"
                stroke="var(--text)" stroke-width="2.4" marker-end="url(#arr-y)" />
          <!-- Y-hat projection (on plane) -->
          <line x1="200" y1="195" [attr.x2]="yHatX()" [attr.y2]="yHatY()"
                stroke="var(--accent)" stroke-width="2.4" marker-end="url(#arr-yh)" />
          <!-- Residual: Y - Y-hat (perpendicular to plane) -->
          <line [attr.x1]="yHatX()" [attr.y1]="yHatY()"
                [attr.x2]="yTipX()" [attr.y2]="yTipY()"
                stroke="#b06c4a" stroke-width="2.4" stroke-dasharray="4 2" marker-end="url(#arr-e)" />

          <!-- Right-angle marker -->
          <rect [attr.x]="yHatX() - 5" [attr.y]="yHatY() - 5" width="5" height="5"
                fill="none" stroke="#b06c4a" stroke-width="1" />

          <!-- Labels -->
          <text [attr.x]="yTipX() + 8" [attr.y]="yTipY() + 4" class="lab">Y</text>
          <text [attr.x]="yHatX() + 8" [attr.y]="yHatY() + 8" class="lab acc">Ŷ = HY</text>
          <text [attr.x]="(yHatX() + yTipX()) / 2 + 10" [attr.y]="(yHatY() + yTipY()) / 2 - 4" class="lab org">e = Y − Ŷ</text>

          <circle [attr.cx]="yTipX()" [attr.cy]="yTipY()" r="4" fill="var(--text)" />
          <circle [attr.cx]="yHatX()" [attr.cy]="yHatY()" r="4" fill="var(--accent)" />
          <circle cx="200" cy="195" r="3" fill="var(--text-muted)" />
          <text x="175" y="212" class="lab" fill="var(--text-muted)">0</text>

          <defs>
            <marker id="arr-y" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--text)" />
            </marker>
            <marker id="arr-yh" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="var(--accent)" />
            </marker>
            <marker id="arr-e" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#b06c4a" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">Y 仰角</span>
          <input type="range" min="-80" max="0" step="2" [value]="angle()"
            (input)="angle.set(+$any($event).target.value)" />
          <span class="sl-val">{{ angle() }}°</span>
        </div>
      </div>

      <h4>H 的五個關鍵性質</h4>
      <ul class="props">
        <li><strong>冪等</strong>：H² = H（投影一次與兩次結果相同）</li>
        <li><strong>對稱</strong>：Hᵀ = H</li>
        <li><strong>秩</strong>：rank(H) = p + 1 = 參數數</li>
        <li><strong>跡</strong>：tr(H) = p + 1，代表「自由度被用掉多少」</li>
        <li><strong>對角線 hᵢᵢ ∈ [0, 1]</strong>：觀察 i 的「槓桿值」（leverage）——第 4 章會用到</li>
      </ul>
    </app-challenge-card>

    <app-prose-block>
      <h4>線性代數 + 統計的橋梁</h4>
      <p>
        若修過線性代數 Ch5（四個子空間），這裡正是那套的應用：
      </p>
      <ul class="bridge">
        <li>col(X) = X 的<strong>欄空間</strong></li>
        <li>null(Xᵀ) = 殘差的<strong>居所</strong>（與 col(X) 正交）</li>
        <li>OLS = Y 投影到 col(X)，殘差投影到 null(Xᵀ)</li>
        <li>β̂ 是該投影在「X 的自然座標系」下的座標</li>
      </ul>

      <p class="takeaway">
        <strong>take-away：</strong>
        OLS = 投影。Ŷ = HY 把 Y 投到 col(X)；殘差 e 垂直於所有預測變數。
        所有「直線過 (x̄, ȳ)」、「殘差和為 0」、「殘差與 x 正交」都是這條幾何的後果。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 15px; padding: 14px; }
    .key-question { padding: 14px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 8px;
      text-align: center; font-size: 15px; font-style: italic; color: var(--accent); margin: 12px 0; font-weight: 600; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    .key-idea em { color: var(--accent); font-style: normal; font-weight: 600; }
    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .proj-view { border: 1px solid var(--border); border-radius: 10px; background: var(--bg); padding: 4px; }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 11px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .lab { font-size: 13px; fill: var(--text); font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .lab.acc { fill: var(--accent); }
    .lab.org { fill: #b06c4a; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .props, .bridge { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .props strong, .bridge strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
    .takeaway strong { color: var(--accent); }
  `,
})
export class RegCh2ProjectionComponent {
  readonly angle = signal(-40);

  // Y is a vector in 3D; we project to a 2D plane (which represents col(X))
  // Ŷ is shadow on plane, e is vertical-ish above
  yTipX(): number {
    const a = this.angle() * Math.PI / 180;
    return 200 + 120 * Math.cos(a);
  }
  yTipY(): number {
    const a = this.angle() * Math.PI / 180;
    return 195 + 120 * Math.sin(a) * 1.3;  // Tilted perspective
  }
  yHatX(): number {
    // Shadow on plane: project along perpendicular to plane
    const a = this.angle() * Math.PI / 180;
    return 200 + 120 * Math.cos(a);
  }
  yHatY(): number {
    const a = this.angle() * Math.PI / 180;
    // Shadow y-coord: same x but on the plane (which is y ≈ 185 + small perspective shift)
    return 195 + 120 * Math.cos(a) * 0.2;
  }
}
