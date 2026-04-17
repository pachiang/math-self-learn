import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-orientation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="曲面的定向" subtitle="§16.8">
      <p>
        向量曲面積分需要曲面有<strong>一致的法向量方向</strong>（定向）。
      </p>
      <p>
        大多數曲面可以選「外向」或「內向」——選擇不同，通量正負相反。
        但 <strong>Möbius 帶</strong>不行——它是<strong>不可定向</strong>的！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較可定向曲面和 Möbius 帶">
      <div class="side-by-side">
        <div class="panel">
          <svg viewBox="-1.5 -1.5 3 3" class="or-svg">
            <!-- Sphere with outward normals -->
            <circle cx="0" cy="0" r="1" fill="rgba(90,138,90,0.1)" stroke="#5a8a5a" stroke-width="0.03" />
            @for (a of normalAngles; track $index) {
              <line [attr.x1]="Math.cos(a) * 1" [attr.y1]="Math.sin(a) * 1"
                    [attr.x2]="Math.cos(a) * 1.3" [attr.y2]="Math.sin(a) * 1.3"
                    stroke="#5a8a5a" stroke-width="0.025" />
              <circle [attr.cx]="Math.cos(a) * 1.3" [attr.cy]="Math.sin(a) * 1.3"
                      r="0.03" fill="#5a8a5a" />
            }
          </svg>
          <div class="panel-label ok">可定向 ✓</div>
          <div class="panel-desc">法向量一致朝外（或一致朝內）</div>
        </div>
        <div class="panel">
          <svg viewBox="-1.5 -1 3 2" class="or-svg mobius">
            <!-- Simplified Möbius band representation -->
            <path d="M-1,0 C-0.5,-0.6 0.5,0.6 1,0 C0.5,-0.6 -0.5,0.6 -1,0"
                  fill="rgba(160,90,90,0.1)" stroke="#a05a5a" stroke-width="0.03" />
            <text x="0" y="0.05" text-anchor="middle" fill="#a05a5a" font-size="0.13" font-weight="600">
              Möbius
            </text>
            <!-- Conflicting normals -->
            <line x1="-0.5" y1="-0.25" x2="-0.5" y2="-0.55" stroke="#5a8a5a" stroke-width="0.025" />
            <circle cx="-0.5" cy="-0.55" r="0.03" fill="#5a8a5a" />
            <line x1="0.5" y1="0.25" x2="0.5" y2="-0.05" stroke="#a05a5a" stroke-width="0.025" />
            <circle cx="0.5" cy="-0.05" r="0.03" fill="#a05a5a" />
          </svg>
          <div class="panel-label bad">不可定向 ✗</div>
          <div class="panel-desc">繞一圈法向量反轉</div>
        </div>
      </div>

      <div class="convention">
        <strong>約定</strong>：
        <ul>
          <li>封閉曲面：外法向量為正（散度定理）</li>
          <li>有邊界的曲面：右手定則連結法向量和邊界方向（Stokes）</li>
          <li>反轉法向量 → 積分值變號</li>
        </ul>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>定向問題連結了拓撲學和分析——Möbius 帶上不能定義通量積分。</p>
    </app-prose-block>
  `,
  styles: `
    .side-by-side { display: flex; gap: 12px; margin-bottom: 14px; }
    .panel { flex: 1; text-align: center; }
    .or-svg { width: 100%; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); aspect-ratio: 1;
      &.mobius { aspect-ratio: 3 / 2; } }
    .panel-label { font-size: 14px; font-weight: 700; margin-top: 6px;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }
    .panel-desc { font-size: 11px; color: var(--text-muted); }
    .convention { padding: 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 13px; color: var(--text-secondary); }
    .convention strong { color: var(--accent); }
    .convention ul { margin: 6px 0 0 16px; padding: 0; }
    .convention li { margin: 4px 0; }
  `,
})
export class StepOrientationComponent {
  readonly Math = Math;
  readonly normalAngles = Array.from({ length: 8 }, (_, i) => (2 * Math.PI * i) / 8);
}
