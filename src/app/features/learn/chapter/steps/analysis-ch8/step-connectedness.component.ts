import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface SetEx { name: string; connected: boolean; desc: string;
  regions: { cx: number; cy: number; r: number }[]; }

const EXAMPLES: SetEx[] = [
  { name: '圓碟', connected: true, desc: '一塊連續的區域 → 連通',
    regions: [{ cx: 0, cy: 0, r: 1 }] },
  { name: '兩個碟', connected: false, desc: '兩塊分開的區域 → 不連通（可以用空隙分割）',
    regions: [{ cx: -1, cy: 0, r: 0.6 }, { cx: 1, cy: 0, r: 0.6 }] },
  { name: '環形', connected: true, desc: '中間有洞但邊界相連 → 連通',
    regions: [{ cx: 0, cy: 0, r: 1 }] },
];

@Component({
  selector: 'app-step-connectedness',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="連通性" subtitle="§8.7">
      <p>
        <strong>連通</strong>：不能寫成兩個不相交非空開集的聯集。
        直覺：「一塊」的空間。
      </p>
      <p>
        <strong>路徑連通</strong>：任意兩點之間有連續的路徑。路徑連通 → 連通。
      </p>
      <p>
        IVT 是連通性的推論：f 連續，[a,b] 連通 → f([a,b]) 連通 = 區間 → 包含中間值。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="哪些集合連通？">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <svg viewBox="-2 -1.5 4 3" class="conn-svg">
        @for (reg of examples[selIdx()].regions; track $index) {
          <circle [attr.cx]="reg.cx" [attr.cy]="reg.cy" [attr.r]="reg.r"
                  fill="var(--accent)" fill-opacity="0.15" stroke="var(--accent)" stroke-width="0.03" />
        }
        @if (selIdx() === 2) {
          <!-- Ring: cut out inner circle -->
          <circle cx="0" cy="0" r="0.4" fill="var(--bg)" stroke="var(--accent)" stroke-width="0.02" />
        }
      </svg>

      <div class="verdict" [class.ok]="examples[selIdx()].connected" [class.bad]="!examples[selIdx()].connected">
        {{ examples[selIdx()].connected ? '連通 ✓' : '不連通 ✗' }} — {{ examples[selIdx()].desc }}
      </div>

      <div class="ivt-box">
        <div class="ivt-title">IVT = 連通性的推論</div>
        <div class="ivt-body">
          f: [a,b] → R 連續。[a,b] 連通 → f([a,b]) 連通 → f([a,b]) 是區間 → 中間值都取到。
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看度量空間裡最漂亮的定理——<strong>壓縮映射定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .conn-svg { width: 100%; max-width: 400px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .verdict { padding: 10px; text-align: center; font-size: 14px; font-weight: 600; border-radius: 8px;
      margin-bottom: 12px;
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
    .ivt-box { padding: 14px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); }
    .ivt-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .ivt-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class StepConnectednessComponent {
  readonly examples = EXAMPLES;
  readonly selIdx = signal(0);
}
