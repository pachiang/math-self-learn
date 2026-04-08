import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-matrix-form',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u77E9\u9663\u5F62\u5F0F Ax = b" subtitle="\u00A74.2">
      <p>
        \u4E0A\u4E00\u7BC0\u7684\u65B9\u7A0B\u7D44\u53EF\u4EE5\u91CD\u5BEB\u6210<strong>\u77E9\u9663\u5F62\u5F0F</strong>\uFF1A
      </p>
      <p class="formula-block">
        [a  b] [x]     [e]<br/>
        [c  d] [y]  =  [f]
      </p>
      <p>
        \u7C21\u5BEB\uFF1A<strong>Ax = b</strong>\u3002\u9019\u500B\u8868\u793A\u6CD5\u8B93\u300C\u89E3\u65B9\u7A0B\u7D44\u300D\u8B8A\u6210\u4E00\u500B\u7D71\u4E00\u7684\u554F\u984C\uFF1A
      </p>
      <p>
        <strong>\u627E\u4E00\u500B\u5411\u91CF x\uFF0C\u8B93\u8B8A\u63DB A \u628A\u5B83\u642C\u5230 b \u7684\u4F4D\u7F6E\u3002</strong>
      </p>
      <p>
        \u9019\u8DDF\u7B2C\u4E8C\u7AE0\u6709\u4EC0\u9EBC\u95DC\u4FC2\uFF1F\u5F88\u6DF1\u3002\u4F60\u5728\u7B2C\u4E8C\u7AE0\u5B78\u7684\u662F\u300C\u7D66\u4E00\u500B x\uFF0C\u7B97 Ax\u300D\uFF0C
        \u9019\u4E00\u7AE0\u662F<strong>\u53CD\u904E\u4F86</strong>\uFF1A\u7D66\u4E00\u500B\u76EE\u6A19 b\uFF0C\u627E x\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u62D6 b \u4F4D\u7F6E\uFF0C\u770B\u8B93 Ax = b \u7684 x \u662F\u8AB0">
      <div class="grid-wrap">
        <svg viewBox="-130 -130 260 260" class="t-svg">
          @for (g of grid; track g) {
            <line [attr.x1]="-100" [attr.y1]="g" [attr.x2]="100" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
            <line [attr.x1]="g" [attr.y1]="-100" [attr.x2]="g" [attr.y2]="100" stroke="var(--border)" stroke-width="0.4" />
          }
          <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
          <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--border-strong)" stroke-width="0.8" />

          <!-- x (the unknown, computed from inverse) - dashed gray -->
          <line x1="0" y1="0" [attr.x2]="solX() * 25" [attr.y2]="-solY() * 25"
            stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="3 3" />
          <text [attr.x]="solX() * 25 + 8" [attr.y]="-solY() * 25 - 4" class="lab" style="fill: var(--text-muted)">x</text>

          <!-- b (the target) - bold accent -->
          <line x1="0" y1="0" [attr.x2]="bx() * 25" [attr.y2]="-by() * 25"
            stroke="var(--accent)" stroke-width="3" marker-end="url(#tip-mfb)" />
          <text [attr.x]="bx() * 25 + 8" [attr.y]="-by() * 25 - 4" class="lab" style="fill: var(--accent)">b</text>

          <defs>
            <marker id="tip-mfb" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0,6 2,0 4" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div class="b-sliders">
        <div class="sl"><span class="sl-lab">b\u2093</span>
          <input type="range" min="-4" max="4" step="0.5" [value]="bx()" (input)="bx.set(+$any($event).target.value)" />
          <span class="sl-val">{{ bx() }}</span></div>
        <div class="sl"><span class="sl-lab">b\u1D67</span>
          <input type="range" min="-4" max="4" step="0.5" [value]="by()" (input)="by.set(+$any($event).target.value)" />
          <span class="sl-val">{{ by() }}</span></div>
      </div>

      <!-- Display A and the system -->
      <div class="system-display">
        <div class="sd-title">\u77E9\u9663\u5F62\u5F0F\uFF1A</div>
        <div class="sd-eq">
          <div class="bracket">[</div>
          <div class="mat">
            <div class="mr"><span>{{ A[0][0] }}</span><span>{{ A[0][1] }}</span></div>
            <div class="mr"><span>{{ A[1][0] }}</span><span>{{ A[1][1] }}</span></div>
          </div>
          <div class="bracket">]</div>
          <div class="bracket sm">[</div>
          <div class="vec"><span>x</span><span>y</span></div>
          <div class="bracket sm">]</div>
          <div class="eq-sign">=</div>
          <div class="bracket sm">[</div>
          <div class="vec"><span>{{ bx() }}</span><span>{{ by() }}</span></div>
          <div class="bracket sm">]</div>
        </div>
      </div>

      <div class="answer">
        \u89E3\uFF1A(x, y) = (<strong>{{ solX().toFixed(2) }}</strong>, <strong>{{ solY().toFixed(2) }}</strong>)
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u4E0B\u4E00\u7BC0\u8DDF\u4E0B\u4E0B\u7BC0\u6703\u770B\u5230\u4E00\u500B\u7CFB\u7D71\u6027\u7684\u6F14\u7B97\u6CD5\u53EB<strong>\u9AD8\u65AF\u6D88\u53BB\u6CD5</strong>\uFF0C\u7528\u4F86\u89E3\u9019\u985E\u65B9\u7A0B\u7D44\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula-block { text-align: center; font-family: 'JetBrains Mono', monospace;
      font-size: 14px; color: var(--accent); padding: 12px; background: var(--accent-10);
      border-radius: 8px; line-height: 1.7; }
    .grid-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
    .t-svg { width: 100%; max-width: 320px; }
    .lab { font-size: 13px; font-weight: 700; font-family: 'Noto Sans Math', serif; }

    .b-sliders { display: flex; flex-direction: column; gap: 6px; padding: 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); margin-bottom: 12px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; font-weight: 700; min-width: 28px; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 36px; text-align: right; }

    .system-display { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 12px; }
    .sd-title { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
    .sd-eq { display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap; }
    .bracket { font-size: 38px; font-weight: 200; color: var(--text-muted); line-height: 0.9;
      &.sm { font-size: 30px; } }
    .mat, .vec { display: flex; flex-direction: column; gap: 3px; padding: 0 4px; }
    .mat .mr { display: flex; gap: 6px; }
    .mat span, .vec span { min-width: 26px; padding: 2px 6px; text-align: center;
      font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .eq-sign { font-size: 18px; color: var(--text-muted); padding: 0 4px; }

    .answer { padding: 12px 16px; border-radius: 8px; background: var(--accent-10);
      text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text-secondary);
      strong { color: var(--accent); font-size: 16px; } }
  `,
})
export class StepMatrixFormComponent {
  readonly grid = [-100, -75, -50, -25, 25, 50, 75, 100];

  // Fixed A
  readonly A = [[2, 1], [1, -1]];

  readonly bx = signal(3);
  readonly by = signal(0);

  // Solve A x = b via inverse
  readonly solX = computed(() => {
    const det = this.A[0][0] * this.A[1][1] - this.A[0][1] * this.A[1][0];
    return (this.A[1][1] * this.bx() - this.A[0][1] * this.by()) / det;
  });
  readonly solY = computed(() => {
    const det = this.A[0][0] * this.A[1][1] - this.A[0][1] * this.A[1][0];
    return (-this.A[1][0] * this.bx() + this.A[0][0] * this.by()) / det;
  });
}
