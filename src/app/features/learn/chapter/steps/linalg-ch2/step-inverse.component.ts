import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MatChoice { name: string; m: [number, number, number, number]; det: number; invertible: boolean; }

const CHOICES: MatChoice[] = [
  { name: '\u53EF\u9006\uFF1A\u65CB\u8F49 + \u62C9\u4F38', m: [1.5, -0.5, 0.5, 1], det: 1.75, invertible: true },
  { name: '\u53EF\u9006\uFF1A\u526A\u5207', m: [1, 1, 0, 1], det: 1, invertible: true },
  { name: '\u4E0D\u53EF\u9006\uFF1A\u5169\u6B04\u5171\u7DDA', m: [1, 2, 0.5, 1], det: 0, invertible: false },
  { name: '\u4E0D\u53EF\u9006\uFF1A\u96F6\u77E9\u9663', m: [0, 0, 0, 0], det: 0, invertible: false },
];

function inv(m: [number, number, number, number]): [number, number, number, number] {
  const [a, b, c, d] = m;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-9) return [1, 0, 0, 1];
  return [d / det, -b / det, -c / det, a / det];
}

function toCss(m: [number, number, number, number]): string {
  const [a, b, c, d] = m;
  return `matrix(${a}, ${-c}, ${-b}, ${d}, 0, 0)`;
}

@Component({
  selector: 'app-step-inverse',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u53CD\u77E9\u9663\u8207\u4E0D\u53EF\u9006" subtitle="\u00A72.6">
      <p>
        \u4E00\u500B\u8B8A\u63DB\u662F<strong>\u53EF\u9006\u7684</strong>\uFF0C\u5982\u679C\u5B58\u5728\u53E6\u4E00\u500B\u8B8A\u63DB\u80FD\u300C\u9084\u539F\u300D\u5B83\u3002
      </p>
      <p>
        \u95DC\u9375\u4E8B\u5BE6\uFF1A<strong>M \u53EF\u9006 \u27FA det(M) \u2260 0</strong>\u3002
      </p>
      <p>
        \u70BA\u4EC0\u9EBC\uFF1Fdet = 0 \u4EE3\u8868\u8B8A\u63DB\u628A\u5E73\u9762\u300C\u58D3\u300D\u6210\u4E86\u4E00\u689D\u7DDA\uFF0C\u8CC7\u8A0A\u6C38\u9060\u907A\u5931\u4E86\uFF0C\u4E0D\u53EF\u80FD\u9084\u539F\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9078\u4E00\u500B\u77E9\u9663\uFF0C\u6309\u300C\u8B8A\u63DB\u300D\u8DDF\u300C\u9084\u539F\u300D\u770B\u80FD\u4E0D\u80FD\u9001\u56DE\u4F86">
      <div class="c-tabs">
        @for (c of choices; track c.name; let i = $index) {
          <button class="ct" [class.active]="sel() === i" (click)="pick(i)"
            [class.bad]="!c.invertible">{{ c.name }}</button>
        }
      </div>

      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of refGrid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <g class="grid-layer" [style.transform]="cssTransform()" [style.transition]="cssTransition">
            @for (g of fineGrid; track g) {
              <line [attr.x1]="g" y1="-100" [attr.x2]="g" y2="100" stroke="var(--v1)" stroke-width="0.9" opacity="0.4" />
            }
            @for (g of fineGrid; track g) {
              <line x1="-100" [attr.y1]="g" x2="100" [attr.y2]="g" stroke="var(--v0)" stroke-width="0.9" opacity="0.4" />
            }
            <line x1="0" y1="0" x2="40" y2="0" stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-i1)" />
            <line x1="0" y1="0" x2="0" y2="-40" stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-i2)" />
          </g>

          <defs>
            <marker id="tip-i1" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v0)" />
            </marker>
            <marker id="tip-i2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
              <polygon points="0 0,5 2,0 4" fill="var(--v1)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="btn-row">
        <button class="apply-btn" (click)="applyM()" [disabled]="phase() !== 'idle'">\u5957\u7528 M</button>
        <button class="undo-btn" (click)="applyInv()"
          [disabled]="phase() !== 'transformed' || !current().invertible">
          \u5957\u7528 M\u207B\u00B9 \u9084\u539F
        </button>
        <button class="reset-btn" (click)="reset()">\u91CD\u7F6E</button>
      </div>

      <div class="det-info">
        det(M) = <strong>{{ current().det }}</strong>
        @if (current().invertible) {
          <span class="ok">\u2192 \u53EF\u9006</span>
        } @else {
          <span class="bad">\u2192 \u4E0D\u53EF\u9006</span>
        }
      </div>

      @if (phase() === 'transformed' && !current().invertible) {
        <div class="error-msg">
          \u26A0 \u9019\u500B\u8B8A\u63DB\u628A\u6574\u500B\u5E73\u9762\u58D3\u6210\u4E86\u4E00\u689D\u7DDA\u3002
          \u4E0D\u540C\u7684\u9EDE\u73FE\u5728\u91CD\u758A\u4E86\uFF0C\u6C92\u6709\u4EFB\u4F55\u8B8A\u63DB\u80FD\u628A\u5B83\u5011\u5206\u958B\u3002
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u662F\u7DDA\u6027\u4EE3\u6578\u4E2D\u4E00\u500B\u6F02\u4EAE\u7684\u9023\u63A5\uFF1A
        <strong>\u4EE3\u6578\uFF08det \u7B97\u51FA\u4F86\uFF09\u8DDF\u5E7E\u4F55\uFF08\u662F\u5426\u6709\u53EF\u80FD\u9084\u539F\uFF09\u8AAA\u7684\u662F\u540C\u4E00\u4EF6\u4E8B</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .c-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .ct { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; }
      &.bad.active { background: rgba(160,90,90,0.15); border-color: #a05a5a; } }

    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 340px; }
    .grid-layer { transform-origin: 0 0; will-change: transform; }

    .btn-row { display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap; }
    .apply-btn, .undo-btn, .reset-btn {
      padding: 6px 16px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer; transition: all 0.12s;
      &:hover:not(:disabled) { background: var(--accent-10); border-color: var(--accent-30); }
      &:disabled { opacity: 0.4; cursor: default; }
    }
    .apply-btn { background: var(--accent-10); border-color: var(--accent-30); color: var(--accent); font-weight: 600; }
    .undo-btn { background: rgba(90,138,90,0.08); border-color: rgba(90,138,90,0.3); color: #5a8a5a; font-weight: 600; }

    .det-info { text-align: center; font-size: 13px; color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace; margin-bottom: 10px;
      strong { color: var(--text); }
      .ok { color: #5a8a5a; margin-left: 6px; }
      .bad { color: #a05a5a; margin-left: 6px; } }

    .error-msg { padding: 12px 14px; border-radius: 8px;
      background: rgba(160,90,90,0.08); border: 1px solid rgba(160,90,90,0.25);
      color: #a05a5a; font-size: 13px; line-height: 1.5; }
  `,
})
export class StepInverseComponent {
  readonly refGrid = [-100, -75, -50, -25, 25, 50, 75, 100];
  readonly fineGrid = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];
  readonly choices = CHOICES;

  readonly sel = signal(0);
  readonly phase = signal<'idle' | 'transformed' | 'restored'>('idle');
  readonly cssTransform = signal('matrix(1, 0, 0, 1, 0, 0)');
  readonly cssTransition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';

  readonly current = computed(() => this.choices[this.sel()]);

  pick(i: number): void {
    this.sel.set(i);
    this.reset();
  }

  applyM(): void {
    this.cssTransform.set(toCss(this.current().m));
    this.phase.set('transformed');
  }

  applyInv(): void {
    if (!this.current().invertible) return;
    // Apply inverse on top of current → back to identity
    this.cssTransform.set('matrix(1, 0, 0, 1, 0, 0)');
    this.phase.set('restored');
  }

  reset(): void {
    this.cssTransform.set('matrix(1, 0, 0, 1, 0, 0)');
    this.phase.set('idle');
  }
}
