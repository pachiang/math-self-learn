import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { gf2MatVec, HAMMING_G, HAMMING_H, syndrome, syndromeToPos } from './coding-utils';

@Component({
  selector: 'app-step-linear-code',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="線性碼" subtitle="§13.3">
      <p>
        如果碼字的集合構成 GF(2) 上的<strong>向量空間</strong>，就叫<strong>線性碼</strong>。
        這表示：兩個碼字的 XOR（逐位加法）還是碼字。
      </p>
      <p>
        線性碼有兩個矩陣：
      </p>
      <ul>
        <li><strong>生成矩陣 G</strong>：訊息 m 編碼為 c = mG</li>
        <li><strong>校驗矩陣 H</strong>：對所有碼字 Hcᵀ = 0</li>
      </ul>
      <p>
        收到 r 時，算<strong>症狀 s = Hrᵀ</strong>。如果 s = 0 → 沒錯。s ≠ 0 → s 指出哪位翻了。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="用 Hamming(7,4) 的 G 矩陣編碼，點碼字的位來「損壞」，看症狀怎麼找到錯誤">
      <div class="pipeline">
        <!-- Step 1: Message -->
        <div class="step-box">
          <div class="sb-title">① 訊息 m（4 位）</div>
          <div class="bits">
            @for (b of msg(); track $index; let i = $index) {
              <button class="bit-btn" [class.one]="b === 1" (click)="flipMsg(i)">{{ b }}</button>
            }
          </div>
        </div>

        <!-- Step 2: Encode c = mG -->
        <div class="step-box">
          <div class="sb-title">② 編碼 c = m × G</div>
          <div class="mat-area">
            <div class="mat-label">m</div>
            <div class="mini-row">
              @for (b of msg(); track $index) {
                <span class="mc">{{ b }}</span>
              }
            </div>
            <span class="op">×</span>
            <div class="mat-label">G (4×7)</div>
            <table class="g-table">
              @for (row of G; track $index) {
                <tr>
                  @for (v of row; track $index) {
                    <td [class.one]="v === 1">{{ v }}</td>
                  }
                </tr>
              }
            </table>
            <span class="op">=</span>
            <div class="mat-label">c</div>
            <div class="mini-row">
              @for (b of codeword(); track $index) {
                <span class="mc code">{{ b }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Step 3: Corrupt -->
        <div class="step-box">
          <div class="sb-title">③ 通道（點一個位來損壞）</div>
          <div class="bits">
            @for (b of received(); track $index; let i = $index) {
              <button class="bit-btn"
                      [class.one]="b === 1"
                      [class.corrupted]="errorPos() === i"
                      (click)="setError(i)">{{ b }}</button>
            }
          </div>
          @if (errorPos() !== null) {
            <div class="err-note">位 {{ errorPos()! + 1 }} 被翻轉了</div>
          } @else {
            <div class="err-note ok">無損壞</div>
          }
        </div>

        <!-- Step 4: Syndrome -->
        <div class="step-box">
          <div class="sb-title">④ 症狀 s = H × rᵀ</div>
          <div class="mat-area">
            <div class="mat-label">H (3×7)</div>
            <table class="g-table small">
              @for (row of H; track $index) {
                <tr>
                  @for (v of row; track $index; let j = $index) {
                    <td [class.one]="v === 1" [class.match]="matchCol() === j">{{ v }}</td>
                  }
                </tr>
              }
            </table>
            <span class="op">×</span>
            <div class="mat-label">rᵀ</div>
            <span class="op">=</span>
            <div class="mini-row">
              @for (b of syn(); track $index) {
                <span class="mc syn">{{ b }}</span>
              }
            </div>
          </div>
          <div class="syn-info">
            s = ({{ syn().join(',') }})₂ = {{ synPos() }}
            @if (synPos() === 0) {
              → <strong>無錯誤</strong>
            } @else {
              → <strong>錯在位 {{ synPos() }}</strong>
            }
          </div>
        </div>

        <!-- Step 5: Result -->
        <div class="step-box" [class.success]="success()" [class.fail]="!success() && errorPos() !== null">
          <div class="sb-title">⑤ 糾正後解碼</div>
          <div class="bits">
            @for (b of decoded(); track $index) {
              <span class="bit-box" [class.one]="b === 1">{{ b }}</span>
            }
          </div>
          @if (success()) {
            <div class="result-note ok">✓ 糾正成功！解碼結果 = 原始訊息</div>
          } @else if (errorPos() === null) {
            <div class="result-note ok">✓ 無錯誤，直接解碼</div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        整個過程只用了<strong>矩陣乘法</strong>——全部在 GF(2) 上。
        這就是為什麼叫「線性」碼。
      </p>
      <p>
        下一節看這個特定碼——<strong>Hamming(7,4)</strong>——的結構為什麼這麼巧。
      </p>
    </app-prose-block>
  `,
  styles: `
    .pipeline { display: flex; flex-direction: column; gap: 10px; }
    .step-box { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface);
      &.success { border-color: #5a8a5a; background: rgba(90, 138, 90, 0.06); }
      &.fail { border-color: #a05a5a; background: rgba(160, 90, 90, 0.06); } }
    .sb-title { font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; }

    .bits { display: flex; gap: 4px; }
    .bit-btn { width: 30px; height: 30px; border: 1px solid var(--border); border-radius: 4px;
      font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      cursor: pointer; background: rgba(90, 138, 90, 0.08); color: #5a8a5a;
      &.one { background: rgba(110, 138, 168, 0.18); color: #5a7faa; }
      &.corrupted { background: rgba(160, 90, 90, 0.25); color: #a05a5a;
        border-color: #a05a5a; }
      &:hover { opacity: 0.8; } }
    .bit-box { width: 30px; height: 30px; display: inline-flex; align-items: center;
      justify-content: center; border: 1px solid var(--border); border-radius: 4px;
      font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      background: rgba(90, 138, 90, 0.08); color: #5a8a5a;
      &.one { background: rgba(110, 138, 168, 0.18); color: #5a7faa; } }

    .err-note { font-size: 11px; margin-top: 6px; color: #a05a5a; font-weight: 600;
      &.ok { color: #5a8a5a; } }

    .mat-area { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .mat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; }
    .op { font-size: 14px; color: var(--text-muted); }
    .mini-row { display: flex; gap: 2px; }
    .mc { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      border-radius: 3px; background: var(--bg); border: 1px solid var(--border);
      color: var(--text);
      &.code { background: rgba(200, 152, 59, 0.15); color: #c8983b; }
      &.syn { background: rgba(110, 138, 168, 0.2); color: #5a7faa; } }

    .g-table { border-collapse: collapse; }
    .g-table td { width: 20px; height: 18px; text-align: center; font-size: 10px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border);
      color: var(--text-muted);
      &.one { color: var(--text); font-weight: 700; background: rgba(200, 152, 59, 0.1); }
      &.match { background: rgba(160, 90, 90, 0.2); } }
    .g-table.small td { width: 18px; height: 16px; font-size: 9px; }

    .syn-info { font-size: 12px; color: var(--text-secondary); margin-top: 8px;
      font-family: 'JetBrains Mono', monospace;
      strong { color: var(--accent); } }

    .result-note { font-size: 12px; margin-top: 6px; font-weight: 600;
      &.ok { color: #5a8a5a; } }
  `,
})
export class StepLinearCodeComponent {
  readonly G = HAMMING_G;
  readonly H = HAMMING_H;
  readonly msg = signal([1, 0, 1, 1]);
  readonly errorPos = signal<number | null>(null);

  readonly codeword = computed(() => {
    const m = this.msg();
    const c = new Array(7).fill(0);
    for (let j = 0; j < 7; j++) {
      let s = 0;
      for (let i = 0; i < 4; i++) s ^= m[i] & HAMMING_G[i][j];
      c[j] = s;
    }
    return c;
  });

  readonly received = computed(() => {
    const c = this.codeword().slice();
    const e = this.errorPos();
    if (e !== null && e >= 0 && e < 7) c[e] ^= 1;
    return c;
  });

  readonly syn = computed(() => syndrome(this.received()));
  readonly synPos = computed(() => syndromeToPos(this.syn()));

  readonly matchCol = computed(() => {
    const pos = this.synPos();
    return pos > 0 ? pos - 1 : -1; // 0-indexed column in H
  });

  readonly corrected = computed(() => {
    const r = this.received().slice();
    const pos = this.synPos();
    if (pos > 0 && pos <= 7) r[pos - 1] ^= 1;
    return r;
  });

  readonly decoded = computed(() => [this.corrected()[2], this.corrected()[4], this.corrected()[5], this.corrected()[6]]);

  readonly success = computed(() => {
    const m = this.msg();
    const d = this.decoded();
    return m.every((v, i) => v === d[i]);
  });

  flipMsg(i: number): void {
    const next = [...this.msg()];
    next[i] ^= 1;
    this.msg.set(next);
    this.errorPos.set(null);
  }

  setError(i: number): void {
    this.errorPos.set(this.errorPos() === i ? null : i);
  }
}
