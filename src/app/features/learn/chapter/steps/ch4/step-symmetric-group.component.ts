import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Permutation } from '../../../../../core/math/permutation';

const COLORS = ['var(--v0)', 'var(--v1)', 'var(--v2)'];

interface PermInfo {
  perm: Permutation;
  d3Label: string;
  cycle: string;
}

const S3_ELEMENTS: PermInfo[] = [
  { perm: new Permutation([0,1,2]), d3Label: 'e',   cycle: '( )' },
  { perm: new Permutation([1,2,0]), d3Label: 'r',   cycle: '(1 2 3)' },
  { perm: new Permutation([2,0,1]), d3Label: 'r\u00B2', cycle: '(1 3 2)' },
  { perm: new Permutation([0,2,1]), d3Label: 's',   cycle: '(2 3)' },
  { perm: new Permutation([2,1,0]), d3Label: 'sr',  cycle: '(1 3)' },
  { perm: new Permutation([1,0,2]), d3Label: 'sr\u00B2', cycle: '(1 2)' },
];

// Layout constants for the main SVG
const BOX = 48;       // box size
const GAP = 16;       // gap between boxes
const PAD_L = 8;      // left padding inside SVG
const Y_TOP = 8;      // top row y
const Y_BOT = 110;    // bottom row y
const SVG_W = PAD_L + 3 * BOX + 2 * GAP + PAD_L;
const SVG_H = Y_BOT + BOX + 8;

@Component({
  selector: 'app-step-symmetric-group',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="S\u2099\uFF1A\u6240\u6709\u53EF\u80FD\u7684\u6D17\u724C" subtitle="\u00A74.1">
      <p>
        \u628A n \u500B\u6771\u897F\u6392\u6210\u4E00\u5217\uFF0C\u6709\u591A\u5C11\u7A2E\u6392\u6CD5\uFF1F\u7B54\u6848\u662F n!\uFF08n \u7684\u968E\u4E58\uFF09\u3002
        \u6BCF\u4E00\u7A2E\u6392\u6CD5\u5C31\u662F\u4E00\u500B<strong>\u7F6E\u63DB</strong>\uFF08permutation\uFF09\u3002
      </p>
      <p>
        \u6240\u6709 n \u500B\u5143\u7D20\u7684\u7F6E\u63DB\uFF0C\u914D\u4E0A\u300C\u5148\u505A\u518D\u505A\u300D\u7684\u7D44\u5408\u65B9\u5F0F\uFF0C\u69CB\u6210\u4E00\u500B\u7FA4 \u2014
        <strong>\u5C0D\u7A31\u7FA4 S\u2099</strong>\u3002
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="\u9EDE\u5169\u500B\u6578\u5B57\u4EA4\u63DB\u4F4D\u7F6E\uFF0C\u6216\u76F4\u63A5\u9EDE\u4E0B\u65B9\u5361\u7247\u8DF3\u5230\u8A72\u7F6E\u63DB"
      [completed]="foundAll()"
    >
      <!-- Row labels above SVG -->
      <div class="viz-wrapper">
        <div class="row-labels">
          <span class="rl" [style.top.px]="Y_TOP + BOX/2 - 7">\u539F\u59CB</span>
          <span class="rl" [style.top.px]="Y_BOT + BOX/2 - 7">\u7F6E\u63DB</span>
        </div>

        <svg [attr.viewBox]="'0 0 ' + SVG_W + ' ' + SVG_H" class="perm-svg">
          <!-- Top row: original (static) -->
          @for (i of [0,1,2]; track i) {
            <rect [attr.x]="bx(i)" [attr.y]="Y_TOP" [attr.width]="BOX" [attr.height]="BOX"
              rx="10" fill="var(--bg-elevated)" stroke="var(--border)" stroke-width="1.5" />
            <text [attr.x]="bcx(i)" [attr.y]="Y_TOP + BOX/2" class="box-num dim">{{ i + 1 }}</text>
          }

          <!-- Curved arrows -->
          @for (i of [0,1,2]; track i) {
            <path [attr.d]="arrowD(i)" fill="none"
              [attr.stroke]="COLORS[i]" stroke-width="2" opacity="0.55"
              marker-end="url(#arr)" />
          }
          <defs>
            <marker id="arr" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill="var(--accent)" />
            </marker>
          </defs>

          <!-- Bottom row: interactive -->
          @for (i of [0,1,2]; track i) {
            <rect [attr.x]="bx(i)" [attr.y]="Y_BOT" [attr.width]="BOX" [attr.height]="BOX"
              rx="10" [attr.fill]="COLORS[currentPerm()[i]]"
              [attr.stroke]="selected() === i ? 'var(--text)' : 'rgba(255,255,255,0.25)'"
              [attr.stroke-width]="selected() === i ? 3 : 1.5"
              class="clickable-box" (click)="onBoxClick(i)" />
            <text [attr.x]="bcx(i)" [attr.y]="Y_BOT + BOX/2" class="box-num bright"
              (click)="onBoxClick(i)">{{ currentPerm()[i] + 1 }}</text>
          }
        </svg>
      </div>

      <!-- Instruction + result -->
      <div class="info-row">
        <div class="instruction">
          @if (selected() === -1) {
            \u9EDE\u4E00\u500B\u6578\u5B57\u9078\u53D6
          } @else {
            \u5DF2\u9078 <strong>{{ currentPerm()[selected()] + 1 }}</strong>\uFF0C\u518D\u9EDE\u4E00\u500B\u4F86\u4EA4\u63DB
          }
        </div>
        <div class="result-row">
          <span class="result-cycle">{{ currentCycle() }}</span>
          @if (currentMatch()) {
            <span class="d3-tag">= D\u2083 \u7684 {{ currentMatch() }}</span>
          }
          <button class="reset-btn" (click)="resetPerm()">\u21BA</button>
        </div>
      </div>

      <!-- Gallery -->
      <div class="gallery-label">S\u2083 \u7684\u5168\u90E8 6 \u500B\u5143\u7D20\uFF1A</div>
      <div class="perm-grid">
        @for (info of s3; track info.cycle; let idx = $index) {
          <button class="perm-card" [class.found]="discovered().has(info.cycle)"
            (click)="jumpTo(idx)">
            <!-- Mini mapping diagram -->
            <svg viewBox="0 0 110 56" class="mini-svg">
              @for (i of [0,1,2]; track i) {
                <!-- top node -->
                <circle [attr.cx]="20 + i * 35" cy="12" r="8"
                  fill="var(--bg-elevated)" stroke="var(--border)" stroke-width="1" />
                <text [attr.x]="20 + i * 35" y="12" class="mini-num dim">{{ i + 1 }}</text>
                <!-- bottom node -->
                <circle [attr.cx]="20 + info.perm.mapping[i] * 35" cy="44" r="8"
                  [attr.fill]="COLORS[i]" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
                <!-- arrow -->
                <line [attr.x1]="20 + i * 35" y1="21"
                  [attr.x2]="20 + info.perm.mapping[i] * 35" y2="35"
                  [attr.stroke]="COLORS[i]" stroke-width="1.5" opacity="0.5" />
              }
            </svg>
            <div class="card-bottom">
              <span class="card-cycle">{{ info.cycle }}</span>
              <span class="card-d3">{{ info.d3Label }}</span>
            </div>
          </button>
        }
      </div>
      <div class="progress">\u5DF2\u627E\u5230 {{ discovered().size }} / 6</div>
    </app-challenge-card>

    @if (foundAll()) {
      <app-prose-block>
        <p>
          S\u2083 \u6709 3! = <strong>6 \u500B\u5143\u7D20</strong>\uFF0C\u8DDF D\u2083 \u4E00\u6A21\u4E00\u6A23\uFF01
          \u4E8B\u5BE6\u4E0A\uFF0C<strong>S\u2083 \u2245 D\u2083</strong> \u2014 \u5B83\u5011\u662F\u540C\u69CB\u7684\u3002
        </p>
        <span class="hint">
          \u62EC\u865F\u88E1\u7684\u8A18\u865F\u53EB\u505A<strong>\u5FAA\u74B0\u8A18\u865F</strong>\uFF08cycle notation\uFF09\u3002
          \u4E0B\u4E00\u7BC0\u6211\u5011\u6B63\u5F0F\u5B78\u5B83\u3002
        </span>
      </app-prose-block>
    }
  `,
  styles: `
    /* ── Main diagram ── */
    .viz-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      margin-bottom: 4px;
    }

    .row-labels {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 40px;
      pointer-events: none;
    }

    .rl {
      position: absolute;
      left: 0;
      font-size: 11px;
      color: var(--text-muted);
      writing-mode: horizontal-tb;
    }

    .perm-svg {
      width: 100%;
      max-width: 240px;
      display: block;
      margin-left: 40px;
    }

    .box-num {
      font-size: 20px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
      dominant-baseline: central;
      pointer-events: none;

      &.dim { fill: var(--text-muted); }
      &.bright {
        fill: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        cursor: pointer;
      }
    }

    .clickable-box {
      cursor: pointer;
      transition: stroke 0.12s, stroke-width 0.12s;
    }

    /* ── Info row ── */
    .info-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-bottom: 20px;
    }

    .instruction {
      font-size: 13px;
      color: var(--text-muted);
      strong { color: var(--text); }
    }

    .result-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .result-cycle {
      font-size: 20px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
    }

    .d3-tag {
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 4px;
      background: var(--accent-18);
      color: var(--accent);
      font-weight: 600;
    }

    .reset-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted);
      font-size: 14px;
      cursor: pointer;

      &:hover { background: var(--accent-10); }
    }

    /* ── Gallery ── */
    .gallery-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }

    .perm-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 8px;

      @media (max-width: 420px) { grid-template-columns: repeat(2, 1fr); }
    }

    .perm-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 8px 8px;
      border: 1px dashed var(--border-strong);
      border-radius: 10px;
      background: var(--bg);
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        border-color: var(--accent-30);
        background: var(--accent-10);
      }

      &.found {
        border-style: solid;
        border-color: var(--accent-30);
        background: var(--accent-10);
      }
    }

    .mini-svg {
      width: 100%;
      max-width: 110px;
      height: 56px;
      display: block;
      margin-bottom: 6px;
    }

    .mini-num {
      font-size: 10px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
      dominant-baseline: central;

      &.dim { fill: var(--text-muted); }
    }

    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .card-cycle {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
    }

    .card-d3 {
      font-size: 12px;
      color: var(--text-muted);
    }

    .progress {
      font-size: 12px;
      color: var(--text-muted);
    }
  `,
})
export class StepSymmetricGroupComponent {
  readonly s3 = S3_ELEMENTS;
  readonly COLORS = COLORS;

  // Expose constants to template
  readonly BOX = BOX;
  readonly Y_TOP = Y_TOP;
  readonly Y_BOT = Y_BOT;
  readonly SVG_W = SVG_W;
  readonly SVG_H = SVG_H;

  readonly currentPerm = signal([0, 1, 2]);
  readonly selected = signal(-1);
  readonly discovered = signal(new Set<string>(['( )']));
  readonly foundAll = computed(() => this.discovered().size >= 6);

  readonly currentCycle = computed(() => {
    const p = new Permutation(this.currentPerm());
    return p.isIdentity() ? '( )' : this.toCycle1(p);
  });

  readonly currentMatch = computed(() => {
    const p = new Permutation(this.currentPerm());
    return this.s3.find((s) => s.perm.equals(p))?.d3Label ?? null;
  });

  /** X position of the i-th box */
  bx(i: number): number { return PAD_L + i * (BOX + GAP); }
  /** Center X of the i-th box */
  bcx(i: number): number { return this.bx(i) + BOX / 2; }

  /** Arrow path from top[origIdx] to bottom[destPos] */
  arrowD(origIdx: number): string {
    const perm = this.currentPerm();
    const destPos = perm.indexOf(origIdx);
    const x1 = this.bcx(origIdx);
    const x2 = this.bcx(destPos);
    const y1 = Y_TOP + BOX + 4;
    const y2 = Y_BOT - 4;
    const mid = (y1 + y2) / 2;
    const bend = (x2 - x1) * 0.35;
    return `M ${x1} ${y1} C ${x1 + bend} ${mid}, ${x2 - bend} ${mid}, ${x2} ${y2}`;
  }

  onBoxClick(i: number): void {
    const sel = this.selected();
    if (sel === -1) {
      this.selected.set(i);
    } else {
      if (sel !== i) {
        this.currentPerm.update((p) => {
          const next = [...p];
          [next[sel], next[i]] = [next[i], next[sel]];
          return next;
        });
        this.discover();
      }
      this.selected.set(-1);
    }
  }

  jumpTo(idx: number): void {
    this.currentPerm.set([...this.s3[idx].perm.mapping]);
    this.selected.set(-1);
    this.discover();
  }

  resetPerm(): void {
    this.currentPerm.set([0, 1, 2]);
    this.selected.set(-1);
  }

  private discover(): void {
    const cycle = this.currentCycle();
    this.discovered.update((s) => new Set(s).add(cycle));
  }

  private toCycle1(p: Permutation): string {
    const visited = new Array(p.size).fill(false);
    const cycles: number[][] = [];
    for (let i = 0; i < p.size; i++) {
      if (visited[i]) continue;
      const cycle: number[] = [];
      let j = i;
      while (!visited[j]) { visited[j] = true; cycle.push(j + 1); j = p.mapping[j]; }
      if (cycle.length > 1) cycles.push(cycle);
    }
    return cycles.length === 0 ? '( )' : cycles.map((c) => '(' + c.join(' ') + ')').join('');
  }
}
