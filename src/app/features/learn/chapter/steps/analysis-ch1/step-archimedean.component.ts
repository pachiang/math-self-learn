import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { findRationalBetween } from './analysis-util';

@Component({
  selector: 'app-step-archimedean',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Archimedean 性質" subtitle="§1.5">
      <p>
        完備性公理的第一個重要推論：
      </p>
      <p class="formula">對任何實數 x > 0，存在自然數 n 使得 n > x</p>
      <p>
        換句話說：<strong>沒有無限大的實數</strong>。不管 x 多大，自然數總會超過它。
      </p>
      <p>
        一個等價的說法：對任何 ε > 0，存在 n 使得 1/n &lt; ε。
        也就是說：<strong>自然數的倒數可以任意小</strong>。
      </p>
      <p>
        更重要的推論：<strong>有理數在 R 中稠密</strong>——任意兩個實數之間都有有理數。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="給兩個實數 a < b，找出一個有理數夾在中間">
      <div class="ctrl-row">
        <div class="ctrl">
          <span class="cl">a =</span>
          <input type="range" min="0" max="3" step="0.001" [value]="a()"
                 (input)="a.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ a().toFixed(4) }}</span>
        </div>
        <div class="ctrl">
          <span class="cl">b =</span>
          <input type="range" min="0" max="3" step="0.001" [value]="b()"
                 (input)="b.set(+($any($event.target)).value)" class="sl" />
          <span class="cv">{{ b().toFixed(4) }}</span>
        </div>
      </div>

      <svg viewBox="-10 -30 420 65" class="arch-svg">
        <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border)" stroke-width="1" />

        <!-- Interval [a, b] highlighted -->
        <rect [attr.x]="toX(a())" y="-8" [attr.width]="Math.max(1, toX(b()) - toX(a()))" height="16"
              fill="var(--accent)" fill-opacity="0.12" rx="3" />

        <!-- a and b markers -->
        <circle [attr.cx]="toX(a())" cy="0" r="4" fill="#5a7faa" />
        <text [attr.x]="toX(a())" y="-14" class="marker-label" fill="#5a7faa">a</text>
        <circle [attr.cx]="toX(b())" cy="0" r="4" fill="#aa5a6a" />
        <text [attr.x]="toX(b())" y="-14" class="marker-label" fill="#aa5a6a">b</text>

        <!-- Found rational -->
        @if (valid()) {
          <line [attr.x1]="toX(foundVal())" y1="-20" [attr.x2]="toX(foundVal())" y2="20"
                stroke="#5a8a5a" stroke-width="1.5" />
          <circle [attr.cx]="toX(foundVal())" cy="0" r="5" fill="#5a8a5a" stroke="white" stroke-width="1" />
          <text [attr.x]="toX(foundVal())" y="28" class="found-label">
            {{ found()[0] }}/{{ found()[1] }} = {{ foundVal().toFixed(6) }}
          </text>
        }
      </svg>

      @if (valid()) {
        <div class="result-box">
          <div class="rb-line">
            b − a = {{ (b() - a()).toExponential(2) }}
          </div>
          <div class="rb-line">
            取 n = {{ found()[1] }}，使得 1/n = {{ (1/found()[1]).toExponential(2) }} &lt; b − a
          </div>
          <div class="rb-line success">
            a &lt; <strong>{{ found()[0] }}/{{ found()[1] }}</strong> &lt; b ✓
          </div>
        </div>
      } @else {
        <div class="result-box warn">請確保 a &lt; b</div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        試試把 a 和 b 拉得<strong>非常接近</strong>——不管多近，
        算法總能找到夾在中間的有理數。這就是「Q 在 R 中稠密」的意思。
      </p>
      <p>
        下一節看完備性的另一個等價形式：<strong>區間套定理</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .ctrl-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
    .ctrl { display: flex; align-items: center; gap: 6px; }
    .cl { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; }
    .sl { width: 120px; accent-color: var(--accent); }
    .cv { font-size: 12px; font-weight: 700; color: var(--accent);
      font-family: 'JetBrains Mono', monospace; min-width: 50px; }

    .arch-svg { width: 100%; display: block; margin-bottom: 12px;
      border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .marker-label { font-size: 10px; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .found-label { font-size: 8px; fill: #5a8a5a; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }

    .result-box { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
      &.warn { color: var(--text-muted); text-align: center; } }
    .rb-line { font-size: 12px; color: var(--text-secondary); margin: 4px 0;
      font-family: 'JetBrains Mono', monospace;
      &.success { color: #5a8a5a; font-weight: 700; font-size: 14px; margin-top: 8px;
        strong { color: var(--accent); } } }
  `,
})
export class StepArchimedeanComponent {
  readonly Math = Math;
  readonly a = signal(1.414);
  readonly b = signal(1.415);

  readonly valid = computed(() => this.a() < this.b());
  readonly found = computed(() => findRationalBetween(this.a(), this.b()));
  readonly foundVal = computed(() => this.found()[0] / this.found()[1]);

  toX(v: number): number { return (v / 3.2) * 400; }
}
