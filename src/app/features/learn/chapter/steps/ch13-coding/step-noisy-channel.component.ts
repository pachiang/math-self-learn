import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { addNoise } from './coding-utils';

function textToBits(s: string): number[] {
  const enc = new TextEncoder().encode(s);
  const bits: number[] = [];
  for (const byte of enc) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  return bits;
}

function bitsToText(bits: number[]): string {
  const bytes: number[] = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let v = 0;
    for (let b = 0; b < 8; b++) v = (v << 1) | bits[i + b];
    bytes.push(v);
  }
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return '???';
  }
}

@Component({
  selector: 'app-step-noisy-channel',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="為什麼需要糾錯碼" subtitle="§13.1">
      <p>
        每一條通訊通道都有<strong>雜訊</strong>。Wi-Fi 訊號穿過牆壁、衛星訊號穿過大氣層、
        CD 被刮花——位元就是會翻轉。
      </p>
      <p>
        1948 年，Shannon 證明了一件驚人的事：只要加入足夠的<strong>冗餘</strong>，
        就能在雜訊通道上做到「幾乎零錯誤」的通訊。關鍵是怎麼聰明地加冗餘。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="輸入文字，透過雜訊通道傳送看看">
      <div class="input-row">
        <input type="text" [value]="msg()" (input)="onMsg($event)"
               class="msg-input" placeholder="輸入文字…" maxlength="6" />
        <div class="noise-ctrl">
          <span class="n-label">錯誤率 {{ (noise() * 100).toFixed(0) }}%</span>
          <input type="range" min="0" max="0.25" step="0.01" [value]="noise()"
                 (input)="onNoise($event)" class="n-slider" />
        </div>
        <button class="send-btn" (click)="send()">傳送！</button>
      </div>

      <div class="pipeline">
        <div class="stage">
          <div class="st-label">發送端</div>
          <div class="bits-row">
            @for (b of srcBits(); track $index; let i = $index) {
              <span class="bit" [class.one]="b === 1">{{ b }}</span>
            }
          </div>
          <div class="st-text">「{{ msg() }}」→ {{ srcBits().length }} bits</div>
        </div>

        <div class="arrow">→ 雜訊 →</div>

        <div class="stage">
          <div class="st-label">接收端</div>
          <div class="bits-row">
            @for (b of rxBits(); track $index; let i = $index) {
              <span class="bit" [class.one]="b === 1" [class.flipped]="flippedSet().has(i)">{{ b }}</span>
            }
          </div>
          <div class="st-text">
            「{{ rxText() }}」
            <span class="flip-count">（{{ flippedPositions().length }} 位翻轉）</span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="重複三次呢？">
      <div class="rep-section">
        <button class="send-btn" (click)="sendTriple()">用三倍重複碼傳送</button>

        <div class="rep-result">
          <div class="rep-row">
            <span class="rep-label">原始</span>
            <span class="rep-info">{{ srcBits().length }} bits</span>
          </div>
          <div class="rep-row">
            <span class="rep-label">三倍編碼</span>
            <span class="rep-info">{{ srcBits().length * 3 }} bits（3 倍頻寬）</span>
          </div>
          <div class="rep-row">
            <span class="rep-label">翻轉</span>
            <span class="rep-info">{{ tripleFlipCount() }} / {{ srcBits().length * 3 }}</span>
          </div>
          <div class="rep-row">
            <span class="rep-label">多數決解碼</span>
            <span class="rep-info">{{ tripleErrors() }} 個位元還是錯的</span>
          </div>
          <div class="rep-row">
            <span class="rep-label">解碼結果</span>
            <span class="rep-info result">「{{ tripleText() }}」</span>
          </div>
        </div>
      </div>

      <div class="insight">
        重複碼能糾錯，但效率太低——3 倍頻寬只保護 1 個位元的錯誤。我們能做得更好嗎？
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        答案是：可以。用<strong>漢明距離</strong>來設計更聰明的碼。
      </p>
    </app-prose-block>
  `,
  styles: `
    .input-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
    .msg-input { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg); color: var(--text); font-size: 14px; width: 120px; }
    .noise-ctrl { display: flex; align-items: center; gap: 6px; }
    .n-label { font-size: 12px; color: var(--text); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; min-width: 90px; }
    .n-slider { width: 100px; accent-color: var(--accent); }
    .send-btn { padding: 6px 14px; border: 1px solid var(--accent); border-radius: 6px;
      background: var(--accent); color: white; font-size: 12px; font-weight: 600; cursor: pointer;
      &:hover { opacity: 0.9; } }

    .pipeline { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .stage { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); flex: 1; min-width: 180px; }
    .st-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .bits-row { display: flex; gap: 1px; flex-wrap: wrap; margin-bottom: 6px; }
    .bit { width: 14px; height: 16px; display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-family: 'JetBrains Mono', monospace; border-radius: 2px;
      background: rgba(90, 138, 90, 0.12); color: #5a8a5a;
      &.one { background: rgba(110, 138, 168, 0.18); color: #5a7faa; }
      &.flipped { background: rgba(160, 90, 90, 0.25); color: #a05a5a; font-weight: 700; } }
    .st-text { font-size: 12px; color: var(--text-secondary); }
    .flip-count { color: #a05a5a; font-weight: 600; }
    .arrow { font-size: 13px; color: var(--text-muted); font-weight: 600; white-space: nowrap; }

    .rep-section { margin-bottom: 12px; }
    .rep-result { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); margin-top: 10px; }
    .rep-row { display: flex; justify-content: space-between; padding: 4px 0;
      border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; } }
    .rep-label { font-size: 12px; color: var(--text-muted); }
    .rep-info { font-size: 12px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.result { font-weight: 700; color: var(--accent); } }

    .insight { padding: 10px 14px; background: var(--accent-10); border-radius: 8px;
      font-size: 13px; color: var(--text-secondary); font-weight: 600; text-align: center; }
  `,
})
export class StepNoisyChannelComponent {
  readonly msg = signal('你好');
  readonly noise = signal(0.05);

  readonly srcBits = computed(() => textToBits(this.msg()));

  // Direct transmission
  private rxResult = signal<{ output: number[]; flipped: number[] }>({ output: [], flipped: [] });
  readonly rxBits = computed(() => this.rxResult().output.length ? this.rxResult().output : this.srcBits());
  readonly flippedPositions = computed(() => this.rxResult().flipped);
  readonly flippedSet = computed(() => new Set(this.flippedPositions()));
  readonly rxText = computed(() => this.rxResult().output.length ? bitsToText(this.rxResult().output) : this.msg());

  // Triple repetition
  private tripleResult = signal<{ decoded: number[]; flipCount: number; errors: number }>({ decoded: [], flipCount: 0, errors: 0 });
  readonly tripleFlipCount = computed(() => this.tripleResult().flipCount);
  readonly tripleErrors = computed(() => this.tripleResult().errors);
  readonly tripleText = computed(() => this.tripleResult().decoded.length ? bitsToText(this.tripleResult().decoded) : '—');

  onMsg(ev: Event): void { this.msg.set((ev.target as HTMLInputElement).value); }
  onNoise(ev: Event): void { this.noise.set(+(ev.target as HTMLInputElement).value); }

  send(): void {
    this.rxResult.set(addNoise(this.srcBits(), this.noise()));
  }

  sendTriple(): void {
    const src = this.srcBits();
    // Triple each bit
    const tripled: number[] = [];
    for (const b of src) { tripled.push(b, b, b); }
    const { output, flipped } = addNoise(tripled, this.noise());
    // Majority vote
    const decoded: number[] = [];
    let errors = 0;
    for (let i = 0; i < src.length; i++) {
      const sum = output[i * 3] + output[i * 3 + 1] + output[i * 3 + 2];
      const vote = sum >= 2 ? 1 : 0;
      decoded.push(vote);
      if (vote !== src[i]) errors++;
    }
    this.tripleResult.set({ decoded, flipCount: flipped.length, errors });
  }
}
