import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { leftSum, sampleFn } from './analysis-ch6-util';

@Component({
  selector: 'app-step-ftc',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="微積分基本定理" subtitle="§6.4">
      <p>微分和積分是<strong>互逆運算</strong>。這是微積分最深刻的定理：</p>
      <p class="formula axiom">
        FTC I：F(x) = ∫ₐˣ f(t) dt ⟹ F'(x) = f(x)<br /><br />
        FTC II：∫ₐᵇ f(x) dx = F(b) − F(a)，其中 F' = f
      </p>
      <p>
        FTC I 說：「先積分再微分 = 回到原函數」。<br />
        FTC II 說：「定積分可以用反導數來算」——這讓積分從極限問題變成代數問題。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動 x 看 F(x) = ∫₀ˣ f(t)dt 怎麼隨 x 變化——F 的斜率就是 f">
      <div class="x-ctrl">
        <span class="xl">x = {{ xVal().toFixed(2) }}</span>
        <input type="range" min="0.1" max="3" step="0.05" [value]="xVal()"
               (input)="xVal.set(+($any($event.target)).value)" class="x-slider" />
      </div>

      <div class="dual-panel">
        <div class="panel">
          <div class="p-title">f(t) = sin(t)（被積分函數）</div>
          <svg viewBox="0 0 250 150" class="ftc-svg">
            <line x1="20" y1="75" x2="240" y2="75" stroke="var(--border)" stroke-width="0.5" />
            <!-- Shaded area from 0 to x -->
            <path [attr.d]="areaPath()" fill="var(--accent)" fill-opacity="0.15" />
            <!-- Curve -->
            <path [attr.d]="fPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
            <!-- x marker -->
            <line [attr.x1]="tx(xVal())" y1="10" [attr.x2]="tx(xVal())" y2="140"
                  stroke="#c8983b" stroke-width="1" stroke-dasharray="3 3" />
          </svg>
        </div>

        <div class="panel">
          <div class="p-title">F(x) = ∫₀ˣ sin(t) dt = 1 − cos(x)</div>
          <svg viewBox="0 0 250 150" class="ftc-svg">
            <line x1="20" y1="75" x2="240" y2="75" stroke="var(--border)" stroke-width="0.5" />
            <!-- F curve -->
            <path [attr.d]="FPath()" fill="none" stroke="#5a8a5a" stroke-width="2.5" />
            <!-- Current point -->
            <circle [attr.cx]="tx(xVal())" [attr.cy]="Fy(FVal())" r="5"
                    fill="#5a8a5a" stroke="white" stroke-width="1.5" />
            <!-- Tangent (slope = f(x)) -->
            <line [attr.x1]="tx(xVal() - 0.8)" [attr.y1]="Fy(FVal() - 0.8 * fVal())"
                  [attr.x2]="tx(xVal() + 0.8)" [attr.y2]="Fy(FVal() + 0.8 * fVal())"
                  stroke="var(--accent)" stroke-width="1.5" stroke-opacity="0.6" />
          </svg>
        </div>
      </div>

      <div class="info-row">
        <div class="i-card">f(x) = sin({{ xVal().toFixed(2) }}) = {{ fVal().toFixed(4) }}</div>
        <div class="i-card">F(x) = {{ FVal().toFixed(4) }}</div>
        <div class="i-card ok">F'(x) = f(x) ✓</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        FTC 把微分（局部、瞬時）和積分（整體、累積）連起來。
        它的證明用了<strong>均值定理</strong>（Ch5）和<strong>連續性</strong>（Ch4）——
        前面所有章節的工具在這裡匯合。
      </p>
      <p>下一節看積分的<strong>運算技巧</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .x-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .xl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 70px; }
    .x-slider { flex: 1; accent-color: var(--accent); }
    .dual-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    @media (max-width: 600px) { .dual-panel { grid-template-columns: 1fr; } }
    .panel { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .p-title { padding: 6px 10px; font-size: 11px; font-weight: 600; color: var(--text-muted);
      background: var(--bg-surface); }
    .ftc-svg { width: 100%; display: block; background: var(--bg); }
    .info-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .i-card { flex: 1; min-width: 100px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepFtcComponent {
  readonly xVal = signal(2.0);
  readonly fVal = computed(() => Math.sin(this.xVal()));
  readonly FVal = computed(() => 1 - Math.cos(this.xVal())); // ∫₀ˣ sin t dt

  tx(x: number): number { return 20 + (x / 3.5) * 220; }
  fy(y: number): number { return 75 - y * 55; }
  Fy(y: number): number { return 75 - (y - 1) * 40; } // center around 1

  fPath(): string {
    const pts = sampleFn(Math.sin, 0, 3.5, 150);
    return 'M' + pts.map((p) => `${this.tx(p.x)},${this.fy(p.y)}`).join('L');
  }

  areaPath(): string {
    const x = this.xVal();
    let d = `M${this.tx(0)},${this.fy(0)}`;
    for (let t = 0; t <= x; t += 0.02) d += `L${this.tx(t)},${this.fy(Math.sin(t))}`;
    d += `L${this.tx(x)},${this.fy(0)}Z`;
    return d;
  }

  FPath(): string {
    const pts: string[] = [];
    for (let x = 0; x <= 3.5; x += 0.02) pts.push(`${this.tx(x)},${this.Fy(1 - Math.cos(x))}`);
    return 'M' + pts.join('L');
  }
}
