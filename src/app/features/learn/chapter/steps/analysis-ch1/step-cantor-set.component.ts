import { AfterViewInit, Component, ElementRef, effect, signal, computed, viewChild } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { cantorSegments } from './analysis-util';

@Component({
  selector: 'app-step-cantor-set',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Cantor 集" subtitle="§1.9">
      <p>
        Cantor 集是分析裡最著名的「怪物」。構造方法很簡單：
      </p>
      <ol>
        <li>從 [0, 1] 開始</li>
        <li>刪去中間的 1/3（開區間 (1/3, 2/3)）</li>
        <li>對剩下的每一段，再刪去中間的 1/3</li>
        <li>無限重複</li>
      </ol>
      <p>
        剩下的集合就是 <strong>Cantor 集 C</strong>。它有以下驚人的性質：
      </p>
      <ul>
        <li><strong>測度為零</strong>：被刪掉的總長度 = 1，留下的「長度」= 0</li>
        <li><strong>不可數</strong>：跟整個 [0, 1] 一樣多的點！</li>
        <li><strong>自相似</strong>：縮小 3 倍後看起來一模一樣（碎形）</li>
        <li><strong>無處稠密</strong>：不包含任何開區間</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="逐步構造 Cantor 集——看它怎麼越來越碎">
      <div class="ctrl-row">
        <span class="iter-label">迭代次數：{{ iteration() }}</span>
        <input type="range" min="0" max="10" step="1" [value]="iteration()"
               (input)="iteration.set(+($any($event.target)).value)" class="iter-slider" />
      </div>

      <div class="canvas-wrap" #wrap>
        <canvas #canvas width="800" height="300"></canvas>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="st-label">區間數</span>
          <span class="st-val">{{ segmentCount() }}</span>
        </div>
        <div class="stat">
          <span class="st-label">總長度</span>
          <span class="st-val">{{ totalLength().toFixed(8) }}</span>
        </div>
        <div class="stat">
          <span class="st-label">已刪除</span>
          <span class="st-val">{{ (1 - totalLength()).toFixed(8) }}</span>
        </div>
        <div class="stat">
          <span class="st-label">點的數量</span>
          <span class="st-val accent">不可數（跟 R 一樣多）</span>
        </div>
      </div>

      <div class="ternary-note">
        <div class="tn-title">三進位的秘密</div>
        <p>
          Cantor 集 = [0,1] 裡三進位展開只用 0 和 2（不用 1）的點。
          例如：0 = 0.000…₃，1/3 = 0.022…₃，2/3 = 0.200…₃。
        </p>
        <p>
          「只用 0 和 2」的三進位數跟「所有二進位數」一樣多（把 2 換成 1）。
          所以 Cantor 集的勢 = 2ℵ₀ = |R|——<strong>不可數</strong>。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Cantor 集展示了完備性可以創造多「奇怪」的集合：
        <strong>長度為零但不可數</strong>。這在有理數裡不可能發生。
      </p>
      <p>
        下一節用一張心智圖把整章串起來。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .iter-label { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 110px; }
    .iter-slider { flex: 1; accent-color: var(--accent); }

    .canvas-wrap { border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
      background: var(--bg); margin-bottom: 12px; }
    canvas { width: 100%; height: auto; display: block; }

    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px; margin-bottom: 14px; }
    .stat { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .st-label { display: block; font-size: 11px; color: var(--text-muted); }
    .st-val { display: block; font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px;
      &.accent { color: var(--accent); font-size: 12px; } }

    .ternary-note { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); }
    .tn-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .ternary-note p { font-size: 12px; color: var(--text-secondary); line-height: 1.7; margin: 6px 0;
      strong { color: var(--text); } }
  `,
})
export class StepCantorSetComponent implements AfterViewInit {
  readonly iteration = signal(0);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  readonly segments = computed(() => cantorSegments(this.iteration()));
  readonly segmentCount = computed(() => this.segments().length);
  readonly totalLength = computed(() => {
    return this.segments().reduce((s, [a, b]) => s + (b - a), 0);
  });

  constructor() {
    effect(() => {
      this.iteration(); // track
      this.draw();
    });
  }

  ngAfterViewInit(): void {
    this.draw();
  }

  private draw(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const iter = this.iteration();
    const pad = 20;
    const lineW = W - 2 * pad;
    const lineH = 18;
    const gap = 6;

    // Draw each iteration level
    for (let level = 0; level <= iter; level++) {
      const segs = cantorSegments(level);
      const y = 20 + level * (lineH + gap);

      // Level label
      ctx.fillStyle = '#888';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`${level}`, 4, y + 13);

      // Draw segments
      for (const [a, b] of segs) {
        const x1 = pad + a * lineW;
        const x2 = pad + b * lineW;
        const hue = 35 + level * 8;
        ctx.fillStyle = `hsl(${hue}, 50%, ${55 - level * 2}%)`;
        ctx.fillRect(x1, y, Math.max(1, x2 - x1), lineH);
      }
    }
  }
}
