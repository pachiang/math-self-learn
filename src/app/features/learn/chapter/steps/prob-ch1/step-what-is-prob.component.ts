import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch1-what-is-prob',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="什麼是機率？" subtitle="§1.1">
      <p>
        擲一顆六面骰，P(得到 3) = 1/6。這個數字 1/6 是什麼意思？它是：
      </p>
      <div class="interpretations">
        <div class="interp">
          <div class="i-name">古典 (Classical)</div>
          <p>「6 個等可能結果，其中 1 個是 3」。建立在<strong>對稱性</strong>假設上。骰子公平、硬幣公平。</p>
        </div>
        <div class="interp">
          <div class="i-name">頻率 (Frequentist)</div>
          <p>「扔 6000 次，約 1000 次會是 3」——長時間比例。<strong>需要能重複</strong>。</p>
        </div>
        <div class="interp">
          <div class="i-name">主觀 (Bayesian)</div>
          <p>「我對『下一擲是 3』的<strong>信念強度</strong>是 1/6」。能處理獨一無二的事件（總統大選）。</p>
        </div>
      </div>
      <p class="key-idea">
        三種詮釋算出相同數字 1/6，但<strong>意義</strong>不同。
        現代機率論從 Kolmogorov 的三條公理出發，讓數學上面完全不管你採哪種詮釋——公理說了算。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="體驗頻率詮釋：丟 N 次硬幣，看 P(正面) 的估計怎麼收斂">
      <div class="coin-viz">
        <div class="stat-row">
          <div class="stat">
            <div class="stat-lab">擲出次數</div>
            <div class="stat-val">{{ nFlips() }}</div>
          </div>
          <div class="stat">
            <div class="stat-lab">正面數</div>
            <div class="stat-val">{{ heads() }}</div>
          </div>
          <div class="stat big">
            <div class="stat-lab">估計 P(H)</div>
            <div class="stat-val">{{ estimate().toFixed(4) }}</div>
          </div>
          <div class="stat">
            <div class="stat-lab">與 0.5 的差距</div>
            <div class="stat-val">{{ Math.abs(estimate() - 0.5).toFixed(4) }}</div>
          </div>
        </div>

        <div class="plot">
          <svg viewBox="-10 -90 420 140" class="p-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-40" x2="400" y2="-40" stroke="#5ca878" stroke-width="0.8" stroke-dasharray="4 3" />
            <text x="404" y="-36" class="tk" text-anchor="start">真值 0.5</text>
            <line x1="0" y1="-85" x2="0" y2="50" stroke="var(--border-strong)" stroke-width="1" />

            <path [attr.d]="estimatePath()" fill="none" stroke="var(--accent)" stroke-width="1.8" />

            <text x="0" y="14" class="tk">0</text>
            <text x="400" y="14" class="tk" text-anchor="end">{{ maxFlips }}</text>
            <text x="-4" y="-82" class="tk" text-anchor="end">1.0</text>
            <text x="-4" y="4" class="tk" text-anchor="end">0.0</text>
          </svg>
        </div>

        <div class="controls">
          <button class="btn" (click)="flipOne()">擲 1 次</button>
          <button class="btn" (click)="flipMany(10)">擲 10 次</button>
          <button class="btn" (click)="flipMany(100)">擲 100 次</button>
          <button class="btn" (click)="flipMany(1000)">擲 1000 次</button>
          <button class="btn reset" (click)="reset()">↻ 重設</button>
        </div>
      </div>

      <div class="history">
        <div class="h-title">最近 40 次結果：</div>
        <div class="coin-row">
          @for (r of recent40(); track $index) {
            <div class="coin" [class.h]="r">{{ r ? 'H' : 'T' }}</div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>觀察：為什麼估計值會收斂？</h4>
      <p>
        這是<strong>大數法則</strong>（Ch6 會嚴格證明）的直觀展現：
        大量獨立實驗的平均值收斂到真實期望。
        <strong>短期</strong>隨機波動大（10 次裡 8 正 2 反很常見），
        <strong>長期</strong>波動被平均掉（1000 次裡 800 正 200 反極罕見）。
      </p>

      <h4>但小心：機率 ≠ 保證</h4>
      <p>
        P(H) = 1/2 不表示「擲偶數次必定一半正面」——只是長期比例。
        連續擲出 10 個正面的機率是 1/1024，雖小但不是 0。
        <strong>賭徒謬誤</strong>：以為「剛剛太多正面了，下次該反面了」——錯，每擲獨立。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        機率量化<strong>不確定性</strong>。不管你採哪種詮釋，數學基礎相同。
        下一節正式定義：樣本空間、事件、機率測度三件套。
      </p>
    </app-prose-block>
  `,
  styles: `
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .interpretations { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 12px 0; }
    .interp { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .i-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .interp p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .interp strong { color: var(--accent); }

    .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; }
    .stat { padding: 8px; text-align: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; }
    .stat.big { background: var(--accent-10); border-color: var(--accent-30); }
    .stat-lab { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-val { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .stat.big .stat-val { font-size: 17px; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .controls { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
    .btn { font: inherit; font-size: 12px; padding: 6px 12px; border: 1.5px solid var(--accent); background: var(--accent); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn.reset { background: transparent; color: var(--accent); }
    .btn:hover { opacity: 0.85; }

    .history { margin-top: 12px; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); }
    .h-title { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; text-align: center; }
    .coin-row { display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; }
    .coin { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 10px; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: #5a8aa8; color: white; }
    .coin.h { background: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh1WhatIsProbComponent {
  readonly Math = Math;
  readonly maxFlips = 2000;
  readonly results = signal<boolean[]>([]);

  readonly nFlips = computed(() => this.results().length);
  readonly heads = computed(() => this.results().filter(r => r).length);
  readonly estimate = computed(() => this.nFlips() === 0 ? 0 : this.heads() / this.nFlips());
  readonly recent40 = computed(() => this.results().slice(-40));

  flipOne() {
    this.results.update(arr => [...arr, Math.random() < 0.5]);
  }

  flipMany(n: number) {
    this.results.update(arr => {
      const next = [...arr];
      for (let i = 0; i < n; i++) next.push(Math.random() < 0.5);
      return next.slice(-this.maxFlips);
    });
  }

  reset() { this.results.set([]); }

  estimatePath(): string {
    const arr = this.results();
    if (arr.length === 0) return '';
    const pts: string[] = [];
    let heads = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) heads++;
      const est = heads / (i + 1);
      const px = ((i + 1) / this.maxFlips) * 400;
      const py = -est * 85;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
