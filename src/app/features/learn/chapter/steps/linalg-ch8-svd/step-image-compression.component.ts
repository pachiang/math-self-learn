import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { svd, reconstructLowRank, SVDResult } from './svd-util';

const IMG_SIZE = 48;

/** Generate a 48×48 grayscale image with simple structure (gradient + circle + text-like bars). */
function generateImage(): number[][] {
  const M: number[][] = [];
  for (let i = 0; i < IMG_SIZE; i++) {
    const row: number[] = [];
    for (let j = 0; j < IMG_SIZE; j++) {
      let v = 0.15;
      // Soft diagonal gradient
      v += (i + j) / (2 * IMG_SIZE) * 0.25;
      // A circle in the centre
      const dx = i - IMG_SIZE / 2;
      const dy = j - IMG_SIZE / 2;
      const dist = Math.hypot(dx, dy);
      if (dist < 14) v += 0.45;
      if (dist < 8) v -= 0.3;
      // Some horizontal bars
      const phase = Math.floor(i / 6) % 2;
      if (phase === 0 && j > 8 && j < IMG_SIZE - 8) v += 0.05;
      // Clamp
      row.push(Math.max(0, Math.min(1, v)));
    }
    M.push(row);
  }
  return M;
}

@Component({
  selector: 'app-step-image-compression',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5716\u7247\u58D3\u7E2E" subtitle="\u00A78.5">
      <p>
        \u4E00\u5F35\u7070\u968E\u5716\u7247\u5C31\u662F\u4E00\u500B<strong>\u77E9\u9663</strong>\uFF1A\u6BCF\u500B\u9EFE\u7D20\u662F 0~1 \u4E4B\u9593\u7684\u4EAE\u5EA6\u3002
        \u9019\u88E1\u6709\u4E00\u5F35 48\u00D748 \u7684\u5716\u7247\uFF0C\u4E5F\u5C31\u662F\u4E00\u500B 48\u00D748 = 2304 \u500B\u6578\u5B57\u7684\u77E9\u9663\u3002
      </p>
      <p>
        \u5C0D\u9019\u500B\u77E9\u9663\u505A SVD\uFF0C\u53EA\u4FDD\u7559\u524D k \u500B\u5947\u7570\u503C\uFF0C\u5C31\u80FD\u5F97\u5230\u4E00\u500B\u300C\u88AB\u58D3\u7E2E\u300D\u7684\u5716\u3002
        \u5132\u5B58\u9700\u8981\uFF1Ak \u00B7 (m + n + 1) \u500B\u6578\u5B57\u3002\u7576 k \u5F88\u5C0F\u6642\uFF0C\u9019\u6BD4\u5132\u5B58\u539F\u59CB\u77E9\u9663\u5C11\u5F88\u591A\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 k \u6ED1\u6876\u770B\u5716\u7247\u600E\u9EBC\u5F9E\u6A21\u7CCA\u8B8A\u6E05\u6670">
      <div class="img-row">
        <div class="img-block">
          <div class="img-title">\u539F\u59CB\u5716\u7247</div>
          <canvas #originalCanvas [attr.width]="canvasSize" [attr.height]="canvasSize"></canvas>
          <div class="img-meta">{{ IMG_SIZE }}\u00D7{{ IMG_SIZE }} = {{ IMG_SIZE * IMG_SIZE }} \u500B\u6578\u5B57</div>
        </div>
        <div class="img-block">
          <div class="img-title">rank-{{ k() }} \u8FD1\u4F3C</div>
          <canvas #approxCanvas [attr.width]="canvasSize" [attr.height]="canvasSize"></canvas>
          <div class="img-meta">{{ k() * (IMG_SIZE * 2 + 1) }} \u500B\u6578\u5B57\uFF08{{ ratio() }}\uFF09</div>
        </div>
      </div>

      <div class="k-row">
        <span class="k-lab">k =</span>
        <input type="range" min="1" [attr.max]="IMG_SIZE" step="1" [value]="k()" (input)="k.set(+$any($event).target.value)" />
        <span class="k-val">{{ k() }}</span>
      </div>

      <div class="presets">
        <button class="pst-btn" (click)="k.set(1)">k = 1</button>
        <button class="pst-btn" (click)="k.set(3)">k = 3</button>
        <button class="pst-btn" (click)="k.set(5)">k = 5</button>
        <button class="pst-btn" (click)="k.set(10)">k = 10</button>
        <button class="pst-btn" (click)="k.set(20)">k = 20</button>
        <button class="pst-btn" (click)="k.set(IMG_SIZE)">\u5168\u90E8</button>
      </div>

      <div class="info-row">
        \u53EA\u8981 k = 5 \u5DE6\u53F3\uFF0C\u5716\u5C31\u5DF2\u7D93\u8A8D\u5F97\u51FA\u4F86\u4E86\u3002
        \u9019\u662F\u56E0\u70BA\u300C\u91CD\u8981\u7684\u8CC7\u8A0A\u300D\u96C6\u4E2D\u5728\u524D\u5E7E\u500B\u5947\u7570\u503C\u88E1\u3002
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u500B\u8DDF JPEG \u7684\u539F\u7406\u7C21\u4F3C\uFF1A\u90FD\u662F\u300C\u4FDD\u7559\u91CD\u8981\u7684\u983B\u7387\u6210\u5206\uFF0C\u4E1F\u6389\u4E0D\u91CD\u8981\u7684\u300D\u3002
        \u53EA\u662F JPEG \u7528\u7684\u662F\u96E2\u6563\u9918\u5F26\u8B8A\u63DB\uFF08DCT\uFF09\u800C\u4E0D\u662F SVD\uFF0C
        \u4F46\u6838\u5FC3\u601D\u60F3\u662F\u4E00\u6A23\u7684\u3002
      </p>
      <p>
        \u73FE\u4EE3\u63A8\u85A6\u7CFB\u7D71\uFF08Netflix\u3001\u4EAC\u6771\u3001Spotify\uFF09\u4E5F\u662F\u9019\u500B\u539F\u7406\uFF1A
        \u4F7F\u7528\u8005-\u5546\u54C1\u7684\u300C\u8A55\u5206\u77E9\u9663\u300D\u662F\u4E00\u500B\u8D85\u5927\u7684\u7A00\u758F\u77E9\u9663\uFF0CSVD \u8B93\u4F60\u80FD\u7528\u4F4E\u79E9\u8FD1\u4F3C\u586B\u88DC\u907A\u6F0F\u7684\u8A55\u5206\u3002
      </p>
      <span class="hint">
        \u4E0B\u4E00\u7BC0\uFF1A<strong>PCA</strong>\uFF08\u4E3B\u6210\u5206\u5206\u6790\uFF09\u662F SVD \u53E6\u4E00\u500B\u8457\u540D\u7684\u61C9\u7528 \u2014 \u8D87\u8CC7\u6599\u79D1\u5B78\u88E1\u88AB\u4F7F\u7528\u9891\u7E41\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .img-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .img-block { display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .img-title { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .img-block canvas { width: 100%; max-width: 180px; height: auto; image-rendering: pixelated;
      border: 1px solid var(--border); border-radius: 4px; background: white; }
    .img-meta { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .k-row { display: flex; align-items: center; gap: 10px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 8px; }
    .k-lab { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .k-row input { flex: 1; accent-color: var(--accent); }
    .k-val { font-size: 18px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace;
      min-width: 30px; text-align: right; }

    .presets { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pst-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); } }

    .info-row { padding: 10px 14px; border-radius: 8px; background: var(--accent-10);
      font-size: 12px; color: var(--text-secondary); text-align: center; }
  `,
})
export class StepImageCompressionComponent implements AfterViewInit {
  readonly IMG_SIZE = IMG_SIZE;
  readonly canvasSize = IMG_SIZE * 4; // upscale for display
  readonly k = signal(5);

  private readonly originalCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('originalCanvas');
  private readonly approxCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('approxCanvas');

  private readonly original: number[][] = generateImage();
  private readonly svdResult: SVDResult = svd(this.original);

  readonly approx = computed(() => reconstructLowRank(this.svdResult, this.k()));

  readonly ratio = computed(() => {
    const total = IMG_SIZE * IMG_SIZE;
    const compressed = this.k() * (IMG_SIZE * 2 + 1);
    const r = total / compressed;
    return r >= 1 ? `\u58D3\u7E2E ${r.toFixed(1)}\u00D7` : `\u6C92\u7BC0\u7701`;
  });

  constructor() {
    effect(() => {
      const a = this.approx();
      this.drawToCanvas(this.approxCanvasRef()?.nativeElement, a);
    });
  }

  ngAfterViewInit(): void {
    this.drawToCanvas(this.originalCanvasRef()?.nativeElement, this.original);
    this.drawToCanvas(this.approxCanvasRef()?.nativeElement, this.approx());
  }

  private drawToCanvas(canvas: HTMLCanvasElement | undefined, img: number[][]): void {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = this.canvasSize / IMG_SIZE;
    for (let i = 0; i < IMG_SIZE; i++) {
      for (let j = 0; j < IMG_SIZE; j++) {
        const v = Math.max(0, Math.min(1, img[i][j]));
        const grey = Math.round(v * 255);
        ctx.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
        ctx.fillRect(j * scale, i * scale, scale, scale);
      }
    }
  }
}
