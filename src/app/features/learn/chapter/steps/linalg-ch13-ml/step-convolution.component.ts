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

const IMG_SIZE = 32;
const KERNEL_SIZE = 3;

interface KernelPreset { name: string; matrix: number[][]; desc: string; }

const KERNELS: KernelPreset[] = [
  { name: '\u4E0D\u8B8A', matrix: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], desc: 'Identity\uFF1A\u8F38\u51FA = \u8F38\u5165' },
  { name: '\u6A21\u7CCA', matrix: [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]], desc: '3\u00D73 \u5747\u5024\u6A21\u7CCA' },
  { name: '\u9510\u5316', matrix: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], desc: '\u52A0\u5F37\u908A\u7DE3' },
  { name: '\u908A\u7DE3 (Sobel x)', matrix: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], desc: '\u4FA6\u6E2C\u6A6B\u5411\u908A\u7DE3' },
  { name: '\u908A\u7DE3 (Sobel y)', matrix: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], desc: '\u4FA6\u6E2C\u7E31\u5411\u908A\u7DE3' },
  { name: 'Laplacian', matrix: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]], desc: '\u4F30\u8A08\u4E8C\u968E\u5C0E\u6578\uFF0C\u4FA6\u6E2C\u6240\u6709\u908A\u7DE3' },
];

function generateImage(): number[][] {
  const img: number[][] = [];
  for (let i = 0; i < IMG_SIZE; i++) {
    const row: number[] = [];
    for (let j = 0; j < IMG_SIZE; j++) {
      let v = 0.2;
      // Diagonal gradient
      v += (i + j) / (2 * IMG_SIZE) * 0.3;
      // A circle
      const dx = i - 10, dy = j - 10;
      if (Math.hypot(dx, dy) < 5) v += 0.4;
      // A square
      if (i >= 18 && i < 26 && j >= 18 && j < 26) v += 0.45;
      // A line
      if (Math.abs(i - j - 5) < 1) v += 0.3;
      row.push(Math.max(0, Math.min(1, v)));
    }
    img.push(row);
  }
  return img;
}

function convolve(img: number[][], kernel: number[][]): number[][] {
  const n = img.length;
  const out: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const k = Math.floor(kernel.length / 2);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let di = -k; di <= k; di++) {
        for (let dj = -k; dj <= k; dj++) {
          const ii = Math.max(0, Math.min(n - 1, i + di));
          const jj = Math.max(0, Math.min(n - 1, j + dj));
          s += img[ii][jj] * kernel[di + k][dj + k];
        }
      }
      out[i][j] = s;
    }
  }
  return out;
}

@Component({
  selector: 'app-step-convolution',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5377\u7A4D\u5C64 = \u5C40\u90E8\u77E9\u9663\u4E58\u6CD5" subtitle="\u00A713.6">
      <p>
        \u4E00\u822C\u7684\u300C\u7DDA\u6027\u5C64\u300D\u6BCF\u500B\u8F38\u51FA\u5143\u7D20\u8DDF<strong>\u6240\u6709</strong>\u8F38\u5165\u5143\u7D20\u90FD\u6709\u95DC\u4FC2\u3002
        \u5728\u5F71\u50CF\u8655\u7406\u88E1\u9019\u4E0D\u53EF\u884C \u2014 64\u00D764 \u7684\u5F71\u50CF\u6709 4096 \u500B\u50CF\u7D20\uFF0C\u5168\u9023\u63A5\u5C31\u662F 4096\u00B2 \u500B\u53C3\u6578\u3002
      </p>
      <p>
        <strong>\u5377\u7A4D\u5C64</strong>\u662F\u4E00\u500B\u300C\u5C40\u90E8\u300D\u7684\u7DDA\u6027\u5C64\uFF1A\u6BCF\u500B\u8F38\u51FA\u50CF\u7D20\u53EA\u8DDF\u8F38\u5165\u88E1\u9644\u8FD1\u7684 3\u00D73 \u6216 5\u00D75 \u500B\u50CF\u7D20\u6709\u95DC\u4FC2\u3002
      </p>
      <p>
        \u4E26\u4E14\u9019\u500B\u300C\u5C40\u90E8\u95DC\u4FC2\u300D\u5728\u6574\u500B\u5F71\u50CF\u4E0A\u662F<strong>\u4E00\u6A23\u7684</strong>\u3002\u63DB\u53E5\u8A71\u8AAA\uFF0C\u4E00\u500B 3\u00D73 \u7684\u300C\u6838\u300D\uFF08kernel\uFF09\u5728\u6574\u500B\u5F71\u50CF\u4E0A\u300C\u6ED1\u52D5\u300D\uFF0C\u6BCF\u500B\u4F4D\u7F6E\u8A08\u7B97\u4E58\u7A4D\u3002
      </p>
      <p>
        \u9019\u500B\u300C\u4E58\u7A4D + \u52A0\u300D\u5C31\u662F\u7DDA\u6027\u4EE3\u6578 \u2014 \u53EA\u662F\u53C3\u8207\u7684\u53EA\u662F\u5C40\u90E8\u9119\u90E8\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E0D\u540C\u7684\u6838\uFF0C\u770B\u7B49\u5F71\u50CF\u88AB\u600E\u9EBC\u8655\u7406">
      <div class="kernel-row">
        @for (k of kernels; track k.name; let i = $index) {
          <button class="k-btn" [class.active]="sel() === i" (click)="sel.set(i)">{{ k.name }}</button>
        }
      </div>

      <div class="kernel-display">
        <div class="kd-title">\u6838 (3\u00D73)\uFF1A</div>
        <div class="kd-grid">
          @for (row of current().matrix; track $index) {
            @for (val of row; track $index) {
              <div class="kd-cell" [class.pos]="val > 0" [class.neg]="val < 0">{{ val.toFixed(2) }}</div>
            }
          }
        </div>
        <div class="kd-desc">{{ current().desc }}</div>
      </div>

      <div class="canvas-row">
        <div class="canvas-block">
          <div class="cv-title">\u539F\u59CB\u5F71\u50CF</div>
          <canvas #originalCanvas [attr.width]="canvasSize" [attr.height]="canvasSize"></canvas>
        </div>
        <div class="canvas-block">
          <div class="cv-title">\u5377\u7A4D\u8F38\u51FA</div>
          <canvas #outputCanvas [attr.width]="canvasSize" [attr.height]="canvasSize"></canvas>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4E00\u4E9B\u8A18\u9304\u7684\u89C0\u5BDF\uFF1A
      </p>
      <ul>
        <li><strong>\u4E0D\u8B8A</strong>\u6838\uFF1A\u8F38\u51FA = \u8F38\u5165\uFF0C\u9A57\u8B49\u5377\u7A4D\u662F\u300C\u5C40\u90E8\u52A0\u6B0A\u548C\u300D\u4E0D\u8AB4\u500B\u4F8B</li>
        <li><strong>\u6A21\u7CCA</strong>\uFF1A\u6BCF\u500B\u8F38\u51FA\u662F\u9644\u8FD1 9 \u500B\u50CF\u7D20\u7684\u5747\u5024 \u2192 \u990A\u70BA\u6A21\u7CCA</li>
        <li><strong>Sobel x</strong>\uFF1A\u8A08\u7B97\u300C\u53F3\u908A \u2212 \u5DE6\u908A\u300D\uFF0C\u53EA\u500B\u300C\u6A6B\u5411\u8B8A\u5316\u5927\u300D\u7684\u5730\u65B9\u8F38\u51FA\u5927</li>
        <li><strong>Laplacian</strong>\uFF1A\u4F30\u8A08\u4E8C\u968E\u5C0E\u6578\uFF0C\u8001\u53C3\u4E0D\u9023\u7E8C\u7684\u5730\u65B9\u8F38\u51FA\u5927</li>
      </ul>
      <p>
        \u9019\u4E9B\u624B\u88FD\u7684\u6838\u539F\u672C\u7528\u4E86\u51E0\u5341\u5E74\u4F86\u505A\u300C\u5F71\u50CF\u8655\u7406\u300D\u3002
        \u90A3\u9EBC<strong>CNN \u662F\u4EC0\u9EBC\uFF1F</strong>\u2014 \u662F\u900F\u904E\u6578\u64DA<strong>\u81EA\u52D5\u5B78\u51FA</strong>\u9019\u4E9B\u6838\u3002\u4F60\u4E0D\u662F\u300C\u8A2D\u8A08\u300D\u300C\u908A\u7DE3\u4FA6\u6E2C\u300D\u7684\u300C\u6838\u300D\uFF0C\u4F60\u662F\u300C\u8A13\u7DF4\u300D\u4ED6\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\u770B\u300C\u8A13\u7DF4\u300D\u9019\u500B\u52D5\u4F5C\u7684\u6838\u5FC3\u6A5F\u88FD\uFF1A\u53CD\u5411\u50B3\u64AD\u3002\u9019\u662F\u9379\u6CD5\u88E1\u300C\u6311\u96B1\u85CF\u72C0\u614B\u300D\u7684\u95DC\u9375\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .kernel-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .k-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .kernel-display { padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 12px; display: flex; flex-direction: column; align-items: center; }
    .kd-title { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .kd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 6px; }
    .kd-cell { min-width: 50px; padding: 6px 10px; text-align: center;
      font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; border-radius: 4px;
      background: var(--bg); color: var(--text-muted);
      &.pos { background: rgba(90, 138, 90, 0.18); color: #5a8a5a; }
      &.neg { background: rgba(160, 90, 90, 0.18); color: #a05a5a; } }
    .kd-desc { font-size: 12px; color: var(--text-secondary); margin-top: 4px; text-align: center; }

    .canvas-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .canvas-block { padding: 10px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .cv-title { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    canvas { width: 100%; max-width: 200px; height: auto; image-rendering: pixelated;
      border: 1px solid var(--border); border-radius: 4px; background: white; }
  `,
})
export class StepConvolutionComponent implements AfterViewInit {
  readonly kernels = KERNELS;
  readonly sel = signal(2); // default to sharpen
  readonly current = computed(() => this.kernels[this.sel()]);

  readonly canvasSize = IMG_SIZE * 5;

  private readonly originalCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('originalCanvas');
  private readonly outputCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('outputCanvas');

  private readonly originalImg = generateImage();
  readonly output = computed(() => convolve(this.originalImg, this.current().matrix));

  constructor() {
    effect(() => {
      const out = this.output();
      this.drawCanvas(this.outputCanvasRef()?.nativeElement, out);
    });
  }

  ngAfterViewInit(): void {
    this.drawCanvas(this.originalCanvasRef()?.nativeElement, this.originalImg);
    this.drawCanvas(this.outputCanvasRef()?.nativeElement, this.output());
  }

  private drawCanvas(canvas: HTMLCanvasElement | undefined, img: number[][]): void {
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
