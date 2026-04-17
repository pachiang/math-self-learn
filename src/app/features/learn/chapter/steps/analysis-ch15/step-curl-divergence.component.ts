import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { VECTOR_FIELDS, curl2D, div2D } from './analysis-ch15-util';

@Component({
  selector: 'app-step-curl-divergence',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="旋度與散度" subtitle="§15.5">
      <p>二維向量場 F = (P, Q) 的兩個微分量：</p>
      <p class="formula">curl F = ∂Q/∂x − ∂P/∂y &nbsp;(旋轉程度)</p>
      <p class="formula">div F = ∂P/∂x + ∂Q/∂y &nbsp;(膨脹/壓縮)</p>
      <p>
        curl 衡量場的<strong>旋轉傾向</strong>（正 = 逆時針）；
        div 衡量場的<strong>源/匯</strong>（正 = 向外膨脹）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選向量場，拖探針看該點的 curl 和 div">
      <div class="fn-tabs">
        @for (f of fields; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">x = {{ px().toFixed(1) }}</span>
        <input type="range" min="-1.5" max="1.5" step="0.1" [value]="px()"
               (input)="px.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">y = {{ py().toFixed(1) }}</span>
        <input type="range" min="-1.5" max="1.5" step="0.1" [value]="py()"
               (input)="py.set(+($any($event.target)).value)" class="sl" />
      </div>

      <svg viewBox="-2 -2 4 4" class="cd-svg">
        @for (g of [-1,0,1]; track g) {
          <line [attr.x1]="g" y1="-2" [attr.x2]="g" y2="2" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2" [attr.y1]="g" x2="2" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        @for (a of arrows(); track a.key) {
          <line [attr.x1]="a.x" [attr.y1]="-a.y"
                [attr.x2]="a.x + a.dx * a.scale" [attr.y2]="-(a.y + a.dy * a.scale)"
                stroke="var(--text-muted)" stroke-width="0.02" stroke-opacity="0.3" />
        }

        <!-- Probe point -->
        <circle [attr.cx]="px()" [attr.cy]="-py()" r="0.08" fill="var(--accent)" stroke="white" stroke-width="0.02" />

        <!-- Curl indicator (rotation arrow) -->
        @if (Math.abs(curlVal()) > 0.01) {
          <circle [attr.cx]="px()" [attr.cy]="-py()" r="0.3" fill="none"
                  [attr.stroke]="curlVal() > 0 ? '#5a8a5a' : '#a05a5a'" stroke-width="0.025"
                  stroke-dasharray="0.8 0.1" />
        }
      </svg>

      <div class="info-row">
        <div class="i-card" [class.pos]="curlVal() > 0.01" [class.neg]="curlVal() < -0.01">
          curl F = {{ curlVal().toFixed(3) }}
          {{ curlVal() > 0.01 ? '↺ 逆時針' : curlVal() < -0.01 ? '↻ 順時針' : '（無旋轉）' }}
        </div>
        <div class="i-card" [class.pos]="divVal() > 0.01" [class.neg]="divVal() < -0.01">
          div F = {{ divVal().toFixed(3) }}
          {{ divVal() > 0.01 ? '⊕ 源' : divVal() < -0.01 ? '⊖ 匯' : '（不可壓縮）' }}
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>旋轉場的 curl = 2（處處逆時針旋轉），div = 0（不可壓縮）��</p>
      <p>輻射場的 curl = 0（無旋轉），div = 2（處處向外膨脹）。</p>
      <p>下一節用 <strong>Green 定理</strong>把這些微分量和線積分連起來。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 10px; background: var(--accent-10); border-radius: 8px; margin: 6px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 12px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 55px; }
    .sl { flex: 1; accent-color: var(--accent); min-width: 80px; }
    .cd-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .info-row { display: flex; gap: 10px; }
    .i-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.pos { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.neg { background: rgba(160,90,90,0.08); color: #a05a5a; } }
  `,
})
export class StepCurlDivergenceComponent {
  readonly Math = Math;
  readonly fields = VECTOR_FIELDS;
  readonly sel = signal(0);
  readonly px = signal(0.5);
  readonly py = signal(0.5);

  readonly curlVal = computed(() => curl2D(VECTOR_FIELDS[this.sel()].F, this.px(), this.py()));
  readonly divVal = computed(() => div2D(VECTOR_FIELDS[this.sel()].F, this.px(), this.py()));

  readonly arrows = computed(() => {
    const F = VECTOR_FIELDS[this.sel()].F;
    const result: { key: string; x: number; y: number; dx: number; dy: number; scale: number }[] = [];
    for (let x = -1.8; x <= 1.8; x += 0.5) {
      for (let y = -1.8; y <= 1.8; y += 0.5) {
        const [fx, fy] = F(x, y);
        const mag = Math.sqrt(fx * fx + fy * fy);
        const scale = mag > 0 ? Math.min(0.3, 0.3 / Math.max(1, mag)) : 0;
        result.push({ key: `${x},${y}`, x, y, dx: fx, dy: fy, scale });
      }
    }
    return result;
  });
}
