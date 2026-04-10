import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

// Generate a random decimal string
function randomDecimal(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
}

@Component({
  selector: 'app-step-uncountability',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="不可數性" subtitle="§1.8">
      <p>
        有理數 Q 是<strong>可數</strong>的——可以一個一個列出來（Cantor 的鋸齒排列）。
      </p>
      <p>
        但實數 R 是<strong>不可數</strong>的。即使你嘗試列出 [0,1] 裡的所有實數，
        一定會<strong>漏掉至少一個</strong>。
      </p>
      <p>
        Cantor 在 1891 年給出了一個優雅的證明——<strong>對角論證</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Cantor 的對角論證：你列出一串實數，我構造一個不在你列表裡的">
      <div class="ctrl-row">
        <button class="act-btn" (click)="randomize()">隨機生成列表</button>
        <button class="act-btn" (click)="runDiagonal()">執行對角論證</button>
        <button class="act-btn reset" (click)="reset()">重置</button>
      </div>

      <div class="table-wrap">
        <table class="diag-table">
          <thead>
            <tr>
              <th></th>
              @for (j of digitCols; track j) {
                <th [class.diag-col]="diagStep() > j">{{ j + 1 }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of list(); track $index; let i = $index) {
              <tr>
                <th>r{{ i + 1 }} = 0.</th>
                @for (d of row.split(''); track $index; let j = $index) {
                  <td [class.diag-cell]="diagStep() > j && i === j"
                      [class.dim]="diagStep() > 0 && i !== j">{{ d }}</td>
                }
              </tr>
            }
            @if (diagStep() >= 10) {
              <tr class="result-row">
                <th>新數 = 0.</th>
                @for (d of diagonalNumber(); track $index; let j = $index) {
                  <td class="new-digit">{{ d }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (diagStep() >= 10) {
        <div class="explain-box">
          <p>
            對角線上第 i 個數的第 i 位是 <strong>{{ diagonalDigits().join(', ') }}</strong>。
          </p>
          <p>
            把每一位加 1（mod 10，避開 0 和 9）得到
            <strong>{{ diagonalNumber().join('') }}</strong>。
          </p>
          <p>
            這個新數<strong>不等於列表中的任何一個</strong>——
            因為它跟第 k 個數的第 k 位不同。
          </p>
          <p class="conclusion">
            所以 [0,1] 裡的實數<strong>不可能</strong>被一一列出。R 是不可數的。
          </p>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        對角論證的關鍵：<strong>無論</strong>你怎麼列表，Cantor 都能構造一個漏掉的數。
        這不是「列表不夠好」，而是「列表原則上不可能涵蓋所有實數」。
      </p>
      <p>
        Q 可數但 R 不可數——它們的「大小」（勢, cardinality）不同。
        下一節看一個更驚人的例子：<strong>Cantor 集</strong>——
        一個不可數卻「長度為零」的集合。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .act-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.reset { color: var(--text-muted); } }

    .table-wrap { overflow-x: auto; margin-bottom: 12px; }
    .diag-table { border-collapse: collapse; margin: 0 auto; }
    .diag-table th { padding: 4px 6px; font-size: 11px; color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
      &.diag-col { color: var(--accent); } }
    .diag-table td { width: 26px; height: 26px; text-align: center; font-size: 13px;
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
      border: 1px solid var(--border); color: var(--text);
      &.diag-cell { background: var(--accent-18); color: var(--accent); font-weight: 800;
        border-color: var(--accent); }
      &.dim { opacity: 0.3; }
      &.new-digit { background: rgba(90, 138, 90, 0.15); color: #5a8a5a; font-weight: 800;
        border-color: #5a8a5a; } }
    .result-row th { color: #5a8a5a; font-weight: 700; }

    .explain-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); font-size: 13px; color: var(--text-secondary);
      line-height: 1.8;
      strong { color: var(--accent); }
      p { margin: 4px 0; } }
    .conclusion { color: #5a8a5a; font-weight: 700; font-size: 14px; margin-top: 8px; }
  `,
})
export class StepUncountabilityComponent {
  readonly digitCols = Array.from({ length: 10 }, (_, i) => i);
  readonly list = signal<string[]>(Array.from({ length: 10 }, () => randomDecimal()));
  readonly diagStep = signal(0);

  readonly diagonalDigits = computed(() => {
    return this.list().map((row, i) => parseInt(row[i], 10));
  });

  readonly diagonalNumber = computed(() => {
    return this.diagonalDigits().map((d) => {
      // Avoid 0 and 9 to prevent 0.000...=0 or 0.999...=1 edge cases
      const shifted = (d + 1) % 10;
      return shifted === 0 || shifted === 9 ? (d + 2) % 10 : shifted;
    });
  });

  randomize(): void {
    this.list.set(Array.from({ length: 10 }, () => randomDecimal()));
    this.diagStep.set(0);
  }

  runDiagonal(): void {
    this.diagStep.set(10);
  }

  reset(): void {
    this.diagStep.set(0);
  }
}
