import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface Mat { name: string; m: [number, number, number, number]; }

const M1: Mat = { name: 'T\u2081 = \u65CB\u8F49 90\u00B0', m: [0, -1, 1, 0] };
const M2: Mat = { name: 'T\u2082 = \u6C34\u5E73\u526A\u5207', m: [1, 1, 0, 1] };

function multiply(a: [number, number, number, number], b: [number, number, number, number]): [number, number, number, number] {
  // a · b (math 2x2 multiplication)
  // a = [[a0, a1], [a2, a3]], b = [[b0, b1], [b2, b3]]
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ];
}

@Component({
  selector: 'app-step-linalg-composition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u8B8A\u63DB\u7684\u7D44\u5408 = \u77E9\u9663\u4E58\u6CD5" subtitle="\u00A72.4">
      <p>
        \u5982\u679C\u5148\u505A\u8B8A\u63DB T\u2081\uFF0C\u518D\u505A T\u2082\uFF0C\u7D44\u5408\u8D77\u4F86\u9084\u662F\u4E00\u500B\u7DDA\u6027\u8B8A\u63DB\u3002
      </p>
      <p>
        \u9019\u500B\u300C\u5148\u505A T\u2081 \u518D\u505A T\u2082\u300D\u7684\u5408\u6210\u8B8A\u63DB\uFF0C\u5C0D\u61C9\u7684\u77E9\u9663\u5C31\u662F\u5169\u500B\u77E9\u9663\u7684<strong>\u4E58\u7A4D</strong> M\u2082M\u2081\u3002
      </p>
      <p>
        \u6CE8\u610F\u9806\u5E8F\uFF1A<strong>\u5F8C\u505A\u7684\u5728\u5DE6\u908A</strong>\u3002\u9019\u662F\u6709\u9053\u7406\u7684 \u2014 \u8DDF\u51FD\u6578\u5408\u6210 (g\u2218f)(x) = g(f(x)) \u4E00\u6A23\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u6309\u300C\u64AD\u653E\u300D\u770B\u4E09\u6B65\u52D5\u756B\uFF1Aidentity \u2192 \u5957\u7528 T\u2081 \u2192 \u518D\u5957\u7528 T\u2082">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of refGrid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <g class="grid-layer" [style.transform]="cssTransform()" [style.transition]="cssTransition()">
            @for (g of fineGrid; track g) {
              <line [attr.x1]="g" y1="-100" [attr.x2]="g" y2="100" stroke="var(--v1)" stroke-width="0.9" opacity="0.4" />
            }
            @for (g of fineGrid; track g) {
              <line x1="-100" [attr.y1]="g" x2="100" [attr.y2]="g" stroke="var(--v0)" stroke-width="0.9" opacity="0.4" />
            }
            <line x1="0" y1="0" x2="40" y2="0" stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-c1)" />
            <line x1="0" y1="0" x2="0" y2="-40" stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-c2)" />
          </g>

          <defs>
            <marker id="tip-c1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-c2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <button class="play-btn" (click)="play()" [disabled]="step() > 0 && step() < 3">
        @if (step() === 0) { \u25B6 \u64AD\u653E } @else if (step() < 3) { \u64AD\u653E\u4E2D... } @else { \u21BA \u91CD\u64AD }
      </button>

      <!-- Step indicators -->
      <div class="steps">
        <div class="si" [class.active]="step() === 1" [class.done]="step() > 1">
          <span class="si-num">1</span><span class="si-text">{{ M1.name }}</span>
        </div>
        <span class="arr">\u2192</span>
        <div class="si" [class.active]="step() === 2" [class.done]="step() > 2">
          <span class="si-num">2</span><span class="si-text">{{ M2.name }}</span>
        </div>
        <span class="arr">\u2192</span>
        <div class="si" [class.active]="step() === 3">
          <span class="si-num">=</span><span class="si-text">M\u2082M\u2081</span>
        </div>
      </div>

      @if (step() === 3) {
        <div class="result">
          <div class="r-title">\u9A57\u8B49\uFF1A\u77E9\u9663\u4E58\u6CD5</div>
          <div class="r-formula">
            <span class="m m1">M\u2082</span>
            \u00B7
            <span class="m m2">M\u2081</span>
            =
            <span class="m mp">[[{{ product[0] }}, {{ product[1] }}], [{{ product[2] }}, {{ product[3] }}]]</span>
          </div>
          <div class="r-note">\u9019\u500B\u4E58\u7A4D\u77E9\u9663\u7684\u5169\u500B\u6B04\uFF0C\u6B63\u662F\u4E0A\u9762\u756B\u9762\u4E2D\u9EDE\u578B\u5411\u91CF\u7684\u4F4D\u7F6E\u3002</div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u5C31\u662F\u70BA\u4EC0\u9EBC\u77E9\u9663\u4E58\u6CD5\u8981\u90A3\u6A23\u5B9A\u7FA9\u3002\u4E0D\u662F\u96A8\u610F\u9078\u7684\u898F\u5247\uFF0C
        \u662F<strong>\u70BA\u4E86\u8B93\u300C\u8B8A\u63DB\u7684\u7D44\u5408\u300D\u8DDF\u300C\u77E9\u9663\u7684\u4E58\u7A4D\u300D\u4E00\u81F4</strong>\u3002
      </p>
      <span class="hint">
        \u9806\u5E8F\u91CD\u8981\uFF1AM\u2082M\u2081 \u4E00\u822C\u4E0D\u7B49\u65BC M\u2081M\u2082\u3002\u5148\u65CB\u8F49\u518D\u526A\u5207\uFF0C\u8DDF\u5148\u526A\u5207\u518D\u65CB\u8F49\u662F\u4E0D\u540C\u7684\u3002
      </span>
    </app-prose-block>
  `,
  styles: `
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 340px; }
    .grid-layer { transform-origin: 0 0; will-change: transform; }

    .play-btn {
      display: block; margin: 0 auto 14px; padding: 8px 24px;
      border: 1px solid var(--accent-30); border-radius: 8px;
      background: var(--accent-10); color: var(--accent); font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.12s;
      &:hover:not(:disabled) { background: var(--accent-18); }
      &:disabled { opacity: 0.5; cursor: default; }
    }

    .steps { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .si { display: flex; align-items: center; gap: 6px; padding: 6px 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg);
      opacity: 0.4; transition: all 0.3s;
      &.active { opacity: 1; border-color: var(--accent); background: var(--accent-10); }
      &.done { opacity: 0.7; } }
    .si-num { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;
      border-radius: 50%; background: var(--border-strong); color: var(--text-muted);
      font-size: 11px; font-weight: 700;
      .active & { background: var(--accent); color: white; }
      .done & { background: rgba(90,138,90,0.3); color: #5a8a5a; } }
    .si-text { font-size: 12px; font-weight: 600; color: var(--text); }
    .arr { color: var(--text-muted); }

    .result { padding: 14px 18px; border: 2px solid var(--accent); border-radius: 10px;
      background: var(--accent-10); text-align: center; }
    .r-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .r-formula { font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--text); margin-bottom: 6px; }
    .m1 { color: var(--v1); font-weight: 700; }
    .m2 { color: var(--v0); font-weight: 700; }
    .mp { color: var(--accent); font-weight: 700; }
    .r-note { font-size: 12px; color: var(--text-secondary); }
  `,
})
export class StepCompositionComponent {
  readonly refGrid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly fineGrid = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];

  readonly M1 = M1;
  readonly M2 = M2;
  readonly product = multiply(M2.m, M1.m);

  readonly step = signal(0); // 0=identity, 1=after M1, 2=after M2M1, 3=done
  readonly cssTransform = signal('matrix(1, 0, 0, 1, 0, 0)');
  readonly cssTransition = signal('transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)');

  private toCss(m: [number, number, number, number]): string {
    const [a, b, c, d] = m;
    return `matrix(${a}, ${-c}, ${-b}, ${d}, 0, 0)`;
  }

  play(): void {
    if (this.step() > 0 && this.step() < 3) return;
    if (this.step() === 3) { this.reset(); return; }
    this.step.set(1);
    this.cssTransform.set(this.toCss(M1.m));

    setTimeout(() => {
      this.step.set(2);
      this.cssTransform.set(this.toCss(this.product));
    }, 900);

    setTimeout(() => {
      this.step.set(3);
    }, 1700);
  }

  reset(): void {
    this.step.set(0);
    this.cssTransform.set('matrix(1, 0, 0, 1, 0, 0)');
  }
}
