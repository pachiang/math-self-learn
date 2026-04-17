import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { FIELDS_3D, curl3D } from './analysis-ch16-util';

@Component({
  selector: 'app-step-curl-3d',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="三維旋度" subtitle="§16.6">
      <p>三維的 curl 是一個<strong>向量</strong>（不像二維只是純量）：</p>
      <p class="formula">
        curl F = (∂R/∂y − ∂Q/∂z, ∂P/∂z − ∂R/∂x, ∂Q/∂x − ∂P/∂y)
      </p>
      <p>
        curl F 的<strong>方向</strong>：旋轉軸（右手定則）。<br>
        curl F 的<strong>大小</strong>：旋轉強度。<br>
        curl F = 0 → 無旋場（保守場在單連通區域中）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選向量場和探測點，看 curl 向量">
      <div class="fn-tabs">
        @for (f of fields; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.name }}</button>
        }
      </div>

      <div class="ctrl-row">
        <span class="cl">x={{ px().toFixed(1) }}</span>
        <input type="range" min="-1" max="1" step="0.1" [value]="px()" (input)="px.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">y={{ py().toFixed(1) }}</span>
        <input type="range" min="-1" max="1" step="0.1" [value]="py()" (input)="py.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">z={{ pz().toFixed(1) }}</span>
        <input type="range" min="-1" max="1" step="0.1" [value]="pz()" (input)="pz.set(+($any($event.target)).value)" class="sl" />
      </div>

      <div class="result-grid">
        <div class="r-card">F = ({{ fVal()[0].toFixed(2) }}, {{ fVal()[1].toFixed(2) }}, {{ fVal()[2].toFixed(2) }})</div>
        <div class="r-card accent">curl F = ({{ curlVal()[0].toFixed(2) }}, {{ curlVal()[1].toFixed(2) }}, {{ curlVal()[2].toFixed(2) }})</div>
        <div class="r-card">|curl F| = {{ curlMag().toFixed(4) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        旋轉場 (−y,x,0) 的 curl = (0,0,2)——純 z 方向旋轉。
        輻射場的 curl = (0,0,0)——無旋。
        下一節用 <strong>Stokes 定理</strong>把 curl 和線積分連起來。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .ctrl-row { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
    .cl { font-size: 11px; font-weight: 600; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 40px; }
    .sl { flex: 1; accent-color: var(--accent); min-width: 60px; }
    .result-grid { display: flex; flex-direction: column; gap: 8px; }
    .r-card { padding: 10px 14px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); border-color: var(--accent); } }
  `,
})
export class StepCurl3dComponent {
  readonly fields = FIELDS_3D;
  readonly sel = signal(1);
  readonly px = signal(0.5); readonly py = signal(0.5); readonly pz = signal(0);

  readonly fVal = computed(() => FIELDS_3D[this.sel()].F(this.px(), this.py(), this.pz()));
  readonly curlVal = computed(() => curl3D(FIELDS_3D[this.sel()].F, this.px(), this.py(), this.pz()));
  readonly curlMag = computed(() => {
    const c = this.curlVal();
    return Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2]);
  });
}
