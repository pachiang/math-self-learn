import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { C, cAdd, cMul, cConj, cAbsSq, cFormat } from './qubit-util';

@Component({
  selector: 'app-step-complex-vectors',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u8907\u5411\u91CF\u8207 Hermitian \u5167\u7A4D" subtitle="\u00A710.2">
      <p>
        \u8907\u5411\u91CF\u662F\u4E00\u500B\u5411\u91CF\uFF0C\u4F46\u6BCF\u500B\u5143\u7D20\u90FD\u662F<strong>\u8907\u6578</strong>\uFF1A
      </p>
      <p class="formula">v = (z\u2081, z\u2082) \u4E2D z\u1D62 \u2208 \u2102</p>
      <p>
        \u4F8B\u5982 v = (1+i, 2-i)\u3002\u9019\u5176\u5BE6\u662F<strong>\u56DB\u500B\u5BE6\u6578</strong> (1, 1, 2, -1)\uFF0C\u4F46\u6211\u5011\u5C07\u4ED6\u5011\u5169\u5169\u5206\u7D44\u770B\u3002
      </p>
      <p>
        \u95DC\u9375\u554F\u984C\uFF1A\u8907\u5411\u91CF\u7684<strong>\u9577\u5EA6</strong>\u600E\u9EBC\u5B9A\u7FA9\uFF1F
      </p>
      <p>
        \u5BE6\u5411\u91CF\u91CC\u9577\u5EA6\u662F \u221A(v\u00B7v)\u3002\u4F46\u8907\u5411\u91CF\u7684 v\u00B7v = z\u2081\u00B2 + z\u2082\u00B2 \u53EF\u80FD\u662F\u8907\u6578\u751A\u81F3\u8CA0\u6578 \u2014 \u9019\u4E0D\u662F\u300C\u9577\u5EA6\u300D\u3002
      </p>
      <p>
        \u4FEE\u6B63\uFF1A\u5C0D\u7B2C\u4E00\u500B\u53C3\u6578\u53D6<strong>\u5171\u8EDB</strong>\uFF1A
      </p>
      <p class="formula big">\u27E8v|w\u27E9 = z\u2081* w\u2081 + z\u2082* w\u2082</p>
      <p>
        \u9019\u53EB\u505A <strong>Hermitian \u5167\u7A4D</strong>\uFF08\u4E5F\u53EB\u300C\u8907\u5167\u7A4D\u300D\uFF09\u3002\u9019\u6A23\u5B50\u4E00\u4F86\uFF1A
      </p>
      <p class="formula">\u27E8v|v\u27E9 = z\u2081*z\u2081 + z\u2082*z\u2082 = |z\u2081|\u00B2 + |z\u2082|\u00B2 \u2265 0</p>
      <p>
        \u4E00\u5B9A\u662F\u300C\u975E\u8CA0\u5BE6\u6578\u300D\uFF0C\u53EF\u4EE5\u958B\u6839\u865F\u7576\u9577\u5EA6\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u8ABF\u6574\u5169\u500B\u8907\u5411\u91CF\uFF0C\u770B Hermitian \u5167\u7A4D\u600E\u9EBC\u9010\u9805\u8A08\u7B97">
      <!-- Visualisation: each complex component as a point on its own complex plane -->
      <div class="planes">
        <div class="plane-block">
          <div class="plane-title">\u7B2C\u4E00\u5206\u91CF z\u2081 (\u8907\u5E73\u9762)</div>
          <svg viewBox="-110 -110 220 220" class="cp-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="-90" [attr.y1]="g" [attr.x2]="90" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-90" [attr.x2]="g" [attr.y2]="90" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
            <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="0.8" />
            <text x="98" y="-4" class="ax-l">Re</text>
            <text x="6" y="-95" class="ax-l">Im</text>

            <line x1="0" y1="0" [attr.x2]="v1[0] * 30" [attr.y2]="-v1[1] * 30"
              stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-v1c)" />
            <text [attr.x]="v1[0] * 30 + 8" [attr.y]="-v1[1] * 30 - 4" class="lab" style="fill: var(--v0)">v\u2081</text>

            <line x1="0" y1="0" [attr.x2]="w1[0] * 30" [attr.y2]="-w1[1] * 30"
              stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-w1c)" />
            <text [attr.x]="w1[0] * 30 + 8" [attr.y]="-w1[1] * 30 - 4" class="lab" style="fill: var(--v1)">w\u2081</text>

            <defs>
              <marker id="tip-v1c" markerWidth="5" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0,5 1.5,0 3" fill="var(--v0)" />
              </marker>
              <marker id="tip-w1c" markerWidth="5" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0,5 1.5,0 3" fill="var(--v1)" />
              </marker>
            </defs>
          </svg>
        </div>
        <div class="plane-block">
          <div class="plane-title">\u7B2C\u4E8C\u5206\u91CF z\u2082 (\u8907\u5E73\u9762)</div>
          <svg viewBox="-110 -110 220 220" class="cp-svg">
            @for (g of grid; track g) {
              <line [attr.x1]="-90" [attr.y1]="g" [attr.x2]="90" [attr.y2]="g" stroke="var(--border)" stroke-width="0.4" />
              <line [attr.x1]="g" [attr.y1]="-90" [attr.x2]="g" [attr.y2]="90" stroke="var(--border)" stroke-width="0.4" />
            }
            <line x1="-100" y1="0" x2="100" y2="0" stroke="var(--border-strong)" stroke-width="0.8" />
            <line x1="0" y1="-100" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="0.8" />
            <text x="98" y="-4" class="ax-l">Re</text>
            <text x="6" y="-95" class="ax-l">Im</text>

            <line x1="0" y1="0" [attr.x2]="v2[0] * 30" [attr.y2]="-v2[1] * 30"
              stroke="var(--v0)" stroke-width="2.5" marker-end="url(#tip-v2c)" />
            <text [attr.x]="v2[0] * 30 + 8" [attr.y]="-v2[1] * 30 - 4" class="lab" style="fill: var(--v0)">v\u2082</text>

            <line x1="0" y1="0" [attr.x2]="w2[0] * 30" [attr.y2]="-w2[1] * 30"
              stroke="var(--v1)" stroke-width="2.5" marker-end="url(#tip-w2c)" />
            <text [attr.x]="w2[0] * 30 + 8" [attr.y]="-w2[1] * 30 - 4" class="lab" style="fill: var(--v1)">w\u2082</text>

            <defs>
              <marker id="tip-v2c" markerWidth="5" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0,5 1.5,0 3" fill="var(--v0)" />
              </marker>
              <marker id="tip-w2c" markerWidth="5" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0,5 1.5,0 3" fill="var(--v1)" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      <div class="info">
        <div class="info-row v-color">
          <span class="il">v</span>
          <span class="iv">({{ cFormat(v1) }}, {{ cFormat(v2) }})</span>
        </div>
        <div class="info-row w-color">
          <span class="il">w</span>
          <span class="iv">({{ cFormat(w1) }}, {{ cFormat(w2) }})</span>
        </div>
      </div>

      <div class="walkthrough">
        <div class="wt-title">Hermitian \u5167\u7A4D \u27E8v|w\u27E9 \u9010\u9805\u8A08\u7B97\uFF1A</div>
        <div class="wt-step">v\u2081* = ({{ cFormat([v1[0], -v1[1]]) }})\u3001v\u2082* = ({{ cFormat([v2[0], -v2[1]]) }})</div>
        <div class="wt-step">v\u2081* w\u2081 = ({{ cFormat([v1[0], -v1[1]]) }})({{ cFormat(w1) }}) = {{ cFormat(p1()) }}</div>
        <div class="wt-step">v\u2082* w\u2082 = ({{ cFormat([v2[0], -v2[1]]) }})({{ cFormat(w2) }}) = {{ cFormat(p2()) }}</div>
        <div class="wt-step result">\u27E8v|w\u27E9 = <strong>{{ cFormat(innerProduct()) }}</strong></div>
      </div>

      <div class="walkthrough length">
        <div class="wt-title">\u9577\u5EA6\u8A08\u7B97\uFF1A</div>
        <div class="wt-step">|v|\u00B2 = \u27E8v|v\u27E9 = |{{ cFormat(v1) }}|\u00B2 + |{{ cFormat(v2) }}|\u00B2
          = {{ vNormSq().toFixed(2) }} \u2192 |v| = <strong>{{ Math.sqrt(vNormSq()).toFixed(2) }}</strong></div>
        <div class="wt-step">|w|\u00B2 = {{ wNormSq().toFixed(2) }} \u2192 |w| = <strong>{{ Math.sqrt(wNormSq()).toFixed(2) }}</strong></div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u9019\u500B\u5167\u7A4D\u591A\u4E86\u300C\u5C0D v \u53D6\u5171\u8EDB\u300D\u9019\u500B\u52D5\u4F5C\uFF0C\u4ED6\u6709\u4E09\u500B\u91CD\u8981\u6027\u8CEA\uFF1A
      </p>
      <ol>
        <li>\u300C\u5BE6\u8907\u88E1\u300D\u53C0\u53C3\u6578\u63DB\u4F4D\u7F6E\uFF1A\u27E8v|w\u27E9 = \u27E8w|v\u27E9*\uFF08\u8DDF\u5BE6\u6578\u4E0D\u540C\u3001\u4E0D\u662F\u5C0D\u7A31\uFF09</li>
        <li>\u27E8v|v\u27E9 \u4E00\u5B9A\u662F\u975E\u8CA0\u5BE6\u6578\uFF0C\u662F 0 \u7576\u4E14\u50C5\u7576 v = 0</li>
        <li>\u5C0D\u7B2C\u4E8C\u500B\u53C3\u6578\u662F\u7DDA\u6027\u7684\uFF1A\u27E8v|cw\u27E9 = c\u27E8v|w\u27E9</li>
      </ol>
      <p>
        \u9019\u3008\u8DDF\u5BE6\u6578\u5167\u7A4D\u63CA\u906F\u4F8B\u4E0D\u4E00\u6A23\u3002\u4F46\u4ED6\u662F\u300C\u5C0D\u7684\u300D\u4E00\u500B \u2014 \u4ED6\u8B93\u9577\u5EA6\u8DDF\u89D2\u5EA6\u4ECD\u7136\u6709\u610F\u7FA9\u3002
      </p>
      <p>
        \u4E0B\u4E00\u7BC0\uFF0C\u6211\u5011\u770B\u9019\u500B\u300C\u5BE6\u8907\u88E1\u300D\u63DB\u4F4D\u5C0D\u300C\u5C0D\u7A31\u77E9\u9663\u300D\u9019\u500B\u6982\u5FF5\u6709\u4EC0\u9EBC\u5F71\u97FF \u2014 \u51FA\u73FE\u4E86 <strong>Hermitian \u77E9\u9663</strong>\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 16px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      &.big { font-size: 22px; padding: 16px; } }

    .planes { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;
      @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .plane-block { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plane-title { font-size: 12px; color: var(--text-muted); font-weight: 600; text-align: center; margin-bottom: 4px; }
    .cp-svg { width: 100%; height: auto; }
    .lab { font-size: 11px; font-weight: 700; font-family: 'Noto Sans Math', serif; }
    .ax-l { font-size: 10px; fill: var(--text-muted); font-family: 'Noto Sans Math', serif; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
    .info-row { display: grid; grid-template-columns: 60px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.v-color { background: rgba(191, 158, 147, 0.08); }
      &.w-color { background: rgba(141, 163, 181, 0.08); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace; }

    .walkthrough { padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-surface); margin-bottom: 12px;
      &.length { background: var(--accent-10); border-color: var(--accent-30); } }
    .wt-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .wt-step { font-size: 12px; color: var(--text-secondary); padding: 4px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.6; }
    .wt-step.result { font-size: 14px; font-weight: 700; color: var(--text); padding-top: 8px; margin-top: 4px;
      border-top: 1px solid var(--border);
      strong { color: var(--accent); font-size: 16px; } }
    .wt-step strong { color: var(--accent); }
  `,
})
export class StepComplexVectorsComponent {
  readonly grid = [-90, -60, -30, 30, 60, 90];
  readonly Math = Math;
  readonly cFormat = cFormat;

  // Fixed example: v = (1+i, 2-i), w = (2, 1+2i)
  readonly v1: C = [1, 1];
  readonly v2: C = [2, -1];
  readonly w1: C = [2, 0];
  readonly w2: C = [1, 2];

  readonly p1 = computed<C>(() => cMul(cConj(this.v1), this.w1));
  readonly p2 = computed<C>(() => cMul(cConj(this.v2), this.w2));
  readonly innerProduct = computed<C>(() => cAdd(this.p1(), this.p2()));

  readonly vNormSq = computed(() => cAbsSq(this.v1) + cAbsSq(this.v2));
  readonly wNormSq = computed(() => cAbsSq(this.w1) + cAbsSq(this.w2));
}
