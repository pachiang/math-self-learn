import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-why-topology',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼需要拓撲" subtitle="§1.1">
      <p>
        在實分析 Ch8 裡，我們用<strong>度量空間</strong>推廣了距離和收斂。
        但有些重要的問題不需要「距離」就能問：
      </p>
      <ul>
        <li>甜甜圈和咖啡杯「一樣」嗎？（可以連續變形）</li>
        <li>地球表面（球面）和平面「不一樣」在哪裡？</li>
        <li>什麼是「連通」？什麼是「有洞」？</li>
      </ul>
      <p>
        這些問題只在乎<strong>形狀</strong>，不在乎精確的距離。
        拓撲學就是研究「連續變形下不變的性質」的數學。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="從度量到拓撲：保留什麼、丟棄什麼——點形狀看哪些在連續變形下不變">
      <div class="compare">
        <div class="cmp-col">
          <div class="cmp-title metric">度量空間 (X, d)</div>
          <div class="cmp-item">✓ 兩點之間的距離</div>
          <div class="cmp-item">✓ ε-球 B(x, ε)</div>
          <div class="cmp-item">✓ 收斂：d(xₙ, x) → 0</div>
          <div class="cmp-item">✓ 連續：ε-δ 定義</div>
          <div class="cmp-item dim">△ 距離的具體數值</div>
        </div>
        <div class="arrow">→ 抽象化</div>
        <div class="cmp-col">
          <div class="cmp-title topo">拓撲空間 (X, τ)</div>
          <div class="cmp-item">✗ 不需要距離</div>
          <div class="cmp-item">✓ 開集族 τ</div>
          <div class="cmp-item">✓ 收斂：用開集定義</div>
          <div class="cmp-item">✓ 連續：開集的原像是開集</div>
          <div class="cmp-item bright">★ 更一般、更自由</div>
        </div>
      </div>

      <!-- Shape morphing demo -->
      <div class="morph-section">
        <div class="morph-title">哪些在連續變形下<strong>不變</strong>？</div>
        <div class="morph-grid">
          @for (item of invariants; track item.name) {
            <div class="morph-card" [class.yes]="item.preserved" [class.no]="!item.preserved">
              <div class="mc-icon">{{ item.icon }}</div>
              <div class="mc-name">{{ item.name }}</div>
              <div class="mc-val">{{ item.preserved ? '不變 ✓' : '會變 ✗' }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Interactive: drag to deform a shape -->
      <div class="deform-section">
        <div class="deform-title">拖滑桿「壓扁」圓——形狀變了，但拓撲性質沒變</div>
        <div class="deform-ctrl">
          <span class="dc-label">變形 = {{ deform().toFixed(2) }}</span>
          <input type="range" min="0" max="1" step="0.01" [value]="deform()"
                 (input)="deform.set(+($any($event.target)).value)" class="dc-slider" />
        </div>
        <svg viewBox="0 0 300 150" class="deform-svg">
          <ellipse cx="150" cy="75" [attr.rx]="40 + deform() * 80" [attr.ry]="60 - deform() * 40"
                   fill="rgba(var(--accent-rgb), 0.12)" stroke="var(--accent)" stroke-width="2" />
          <text x="150" y="135" text-anchor="middle" fill="var(--text-muted)" font-size="10">
            {{ deform() < 0.3 ? '接近圓形' : deform() < 0.7 ? '橢圓' : '很扁的橢圓' }}
            — 但依然是<tspan fill="var(--accent)" font-weight="700">同胚</tspan>的！
          </text>
        </svg>
        <div class="preserved-row">
          <div class="pv-card ok">連通 ✓</div>
          <div class="pv-card ok">緊緻 ✓</div>
          <div class="pv-card ok">沒有洞 ✓</div>
          <div class="pv-card bad">面積 ✗ 改變了</div>
          <div class="pv-card bad">周長 ✗ 改變了</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        拓撲空間比度量空間更廣——有些拓撲空間不來自任何度量。
        正因為丟掉了不需要的結構，我們能看到更本質的東西。
      </p>
    </app-prose-block>
  `,
  styles: `
    .compare { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; }
    .cmp-col { flex: 1; padding: 12px; border: 1px solid var(--border); border-radius: 10px; }
    .cmp-title { font-size: 13px; font-weight: 700; margin-bottom: 8px;
      &.metric { color: #5a7faa; } &.topo { color: var(--accent); } }
    .cmp-item { font-size: 12px; color: var(--text-secondary); padding: 3px 0;
      &.dim { color: var(--text-muted); opacity: 0.5; text-decoration: line-through; }
      &.bright { color: var(--accent); font-weight: 600; } }
    .arrow { font-size: 16px; color: var(--accent); font-weight: 700; }

    .morph-section { margin-bottom: 14px; }
    .morph-title { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .morph-title strong { color: var(--accent); }
    .morph-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    @media (max-width: 500px) { .morph-grid { grid-template-columns: repeat(3, 1fr); } }
    .morph-card { padding: 8px 4px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border);
      &.yes { background: rgba(90,138,90,0.06); border-color: rgba(90,138,90,0.2); }
      &.no { background: rgba(160,90,90,0.04); border-color: rgba(160,90,90,0.15); } }
    .mc-icon { font-size: 18px; }
    .mc-name { font-size: 10px; font-weight: 600; color: var(--text); margin: 2px 0; }
    .mc-val { font-size: 9px; font-weight: 700;
      .yes & { color: #5a8a5a; } .no & { color: #a05a5a; } }

    .deform-section { margin-bottom: 10px; }
    .deform-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .deform-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .dc-label { font-size: 12px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 90px; }
    .dc-slider { flex: 1; accent-color: var(--accent); height: 20px; }
    .deform-svg { width: 100%; max-width: 300px; display: block; margin: 0 auto 8px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }

    .preserved-row { display: flex; gap: 4px; flex-wrap: wrap; }
    .pv-card { padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
      &.ok { background: rgba(90,138,90,0.06); color: #5a8a5a; border: 1px solid rgba(90,138,90,0.2); }
      &.bad { background: rgba(160,90,90,0.04); color: #a05a5a; border: 1px solid rgba(160,90,90,0.15); } }
  `,
})
export class StepWhyTopologyComponent {
  readonly deform = signal(0);

  readonly invariants = [
    { name: '連通', icon: '🔗', preserved: true },
    { name: '洞的數量', icon: '🕳', preserved: true },
    { name: '緊緻', icon: '📦', preserved: true },
    { name: '距離', icon: '📏', preserved: false },
    { name: '面積', icon: '📐', preserved: false },
  ];
}
