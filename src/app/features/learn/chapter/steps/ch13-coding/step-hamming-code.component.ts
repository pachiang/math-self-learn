import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { hammingEncode, syndrome, syndromeToPos, hammingDecode } from './coding-utils';

const BIT_ROLES = ['p₁', 'p₂', 'd₁', 'p₃', 'd₂', 'd₃', 'd₄'];

@Component({
  selector: 'app-step-hamming-code',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="漢明碼 Hamming(7,4)" subtitle="§13.4">
      <p>
        Hamming(7,4) 是最經典的線性碼：用 <strong>7 位</strong>送 <strong>4 位</strong>資料，
        能糾正<strong>任何 1 位錯誤</strong>。效率 4/7 ≈ 57%，比重複碼的 33% 好很多。
      </p>
      <p>
        7 位裡面：3 位是校驗位（位 1, 2, 4），4 位是資料位（位 3, 5, 6, 7）。
        校驗位在<strong>2 的冪次位置</strong>，這讓症狀直接是錯誤位置的二進位表示。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="完整走一遍：輸入 → 編碼 → 損壞 → 偵測 → 糾正">
      <!-- Input -->
      <div class="stage">
        <div class="st-num">1</div>
        <div class="st-body">
          <div class="st-title">輸入 4 位資料</div>
          <div class="data-bits">
            @for (b of dataBits(); track $index; let i = $index) {
              <button class="big-bit" [class.one]="b === 1" (click)="flipData(i)">
                <span class="bb-val">{{ b }}</span>
                <span class="bb-label">d{{ i + 1 }}</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Encode -->
      <div class="stage">
        <div class="st-num">2</div>
        <div class="st-body">
          <div class="st-title">編碼（c = m × G）</div>
          <div class="code-bits">
            @for (b of codeword(); track $index; let i = $index) {
              <div class="cb" [class.parity]="isParity(i)" [class.data]="!isParity(i)">
                <span class="cb-val">{{ b }}</span>
                <span class="cb-role">{{ roles[i] }}</span>
              </div>
            }
          </div>
          <div class="legend">
            <span class="leg parity">校驗位</span>
            <span class="leg data">資料位</span>
          </div>
        </div>
      </div>

      <!-- Corrupt -->
      <div class="stage">
        <div class="st-num">3</div>
        <div class="st-body">
          <div class="st-title">通道傳輸（點一個位來損壞，再點取消）</div>
          <div class="code-bits">
            @for (b of received(); track $index; let i = $index) {
              <button class="cb clickable" [class.corrupted]="corruptPos() === i"
                      [class.parity]="isParity(i) && corruptPos() !== i"
                      [class.data]="!isParity(i) && corruptPos() !== i"
                      (click)="toggleCorrupt(i)">
                <span class="cb-val">{{ b }}</span>
                <span class="cb-role">位 {{ i + 1 }}</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Syndrome -->
      <div class="stage">
        <div class="st-num">4</div>
        <div class="st-body">
          <div class="st-title">症狀 s = H × rᵀ</div>
          <div class="syn-display">
            <span class="syn-bits">
              s = ({{ syn().join(', ') }})
            </span>
            <span class="syn-arrow">→</span>
            <span class="syn-val" [class.zero]="synPos() === 0" [class.found]="synPos() > 0">
              @if (synPos() === 0) {
                無錯誤
              } @else {
                錯在位 {{ synPos() }}（{{ synPos().toString(2).padStart(3, '0') }}₂）
              }
            </span>
          </div>
        </div>
      </div>

      <!-- Correct & Decode -->
      <div class="stage" [class.success]="success()">
        <div class="st-num">5</div>
        <div class="st-body">
          <div class="st-title">糾正並解碼</div>
          <div class="code-bits">
            @for (b of corrected(); track $index; let i = $index) {
              <div class="cb" [class.fixed]="synPos() === i + 1"
                   [class.parity]="isParity(i) && synPos() !== i + 1"
                   [class.data]="!isParity(i) && synPos() !== i + 1">
                <span class="cb-val">{{ b }}</span>
              </div>
            }
          </div>
          <div class="decode-row">
            解碼結果：
            @for (b of decoded(); track $index) {
              <span class="dec-bit" [class.one]="b === 1">{{ b }}</span>
            }
            @if (success()) {
              <span class="check">✓</span>
            }
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Hamming(7,4) 的症狀就是錯誤位置的<strong>二進位</strong>。
        三個校驗位分別檢查「位址的第 1, 2, 3 位是 1 的那些位」——
        這就是為什麼校驗位放在 2 的冪次。
      </p>
      <p>
        但 Hamming 碼只能糾正 1 位錯誤。如果整段資料被「連續損壞」（burst error）怎麼辦？
        下一節看 <strong>Reed-Solomon 碼</strong>——他能處理連續錯誤。
      </p>
    </app-prose-block>
  `,
  styles: `
    .stage { display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg-surface); margin-bottom: 8px;
      &.success { border-color: #5a8a5a; background: rgba(90, 138, 90, 0.05); } }
    .st-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .st-body { flex: 1; }
    .st-title { font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; }

    .data-bits { display: flex; gap: 8px; }
    .big-bit { width: 44px; height: 52px; border: 2px solid var(--border); border-radius: 8px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      cursor: pointer; background: rgba(90, 138, 90, 0.08); gap: 2px;
      &.one { background: rgba(110, 138, 168, 0.2); border-color: #5a7faa; }
      &:hover { opacity: 0.8; } }
    .bb-val { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      color: var(--text); }
    .bb-label { font-size: 9px; color: var(--text-muted); }

    .code-bits { display: flex; gap: 4px; flex-wrap: wrap; }
    .cb { width: 36px; height: 44px; border: 1px solid var(--border); border-radius: 6px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px;
      &.parity { background: rgba(200, 152, 59, 0.12); border-color: rgba(200, 152, 59, 0.3); }
      &.data { background: rgba(110, 138, 168, 0.12); border-color: rgba(110, 138, 168, 0.3); }
      &.corrupted { background: rgba(160, 90, 90, 0.25); border-color: #a05a5a; }
      &.fixed { background: rgba(90, 138, 90, 0.25); border-color: #5a8a5a; }
      &.clickable { cursor: pointer; &:hover { opacity: 0.8; } } }
    .cb-val { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      color: var(--text); }
    .cb-role { font-size: 8px; color: var(--text-muted); }

    .legend { display: flex; gap: 12px; margin-top: 6px; font-size: 11px; }
    .leg { padding: 2px 8px; border-radius: 4px;
      &.parity { background: rgba(200, 152, 59, 0.12); color: #c8983b; }
      &.data { background: rgba(110, 138, 168, 0.12); color: #5a7faa; } }

    .syn-display { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .syn-bits { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .syn-arrow { color: var(--text-muted); }
    .syn-val { font-size: 13px; font-weight: 700;
      &.zero { color: #5a8a5a; }
      &.found { color: #a05a5a; } }

    .decode-row { display: flex; align-items: center; gap: 6px; margin-top: 8px;
      font-size: 13px; color: var(--text-secondary); }
    .dec-bit { width: 26px; height: 26px; display: inline-flex; align-items: center;
      justify-content: center; border: 1px solid var(--border); border-radius: 4px;
      font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      background: rgba(90, 138, 90, 0.08); color: #5a8a5a;
      &.one { background: rgba(110, 138, 168, 0.18); color: #5a7faa; } }
    .check { color: #5a8a5a; font-size: 16px; font-weight: 700; }
  `,
})
export class StepHammingCodeComponent {
  readonly roles = BIT_ROLES;
  readonly dataBits = signal([1, 0, 1, 1]);
  readonly corruptPos = signal<number | null>(null);

  readonly codeword = computed(() => hammingEncode(this.dataBits()));

  readonly received = computed(() => {
    const c = this.codeword().slice();
    const p = this.corruptPos();
    if (p !== null && p >= 0 && p < 7) c[p] ^= 1;
    return c;
  });

  readonly syn = computed(() => syndrome(this.received()));
  readonly synPos = computed(() => syndromeToPos(this.syn()));

  readonly corrected = computed(() => {
    const r = this.received().slice();
    const pos = this.synPos();
    if (pos > 0 && pos <= 7) r[pos - 1] ^= 1;
    return r;
  });

  readonly decoded = computed(() => hammingDecode(this.corrected()));

  readonly success = computed(() => {
    const d = this.decoded(), m = this.dataBits();
    return d.every((v, i) => v === m[i]);
  });

  isParity(i: number): boolean {
    return i === 0 || i === 1 || i === 3; // positions 1,2,4 (0-indexed: 0,1,3)
  }

  flipData(i: number): void {
    const next = [...this.dataBits()];
    next[i] ^= 1;
    this.dataBits.set(next);
    this.corruptPos.set(null);
  }

  toggleCorrupt(i: number): void {
    this.corruptPos.set(this.corruptPos() === i ? null : i);
  }
}
