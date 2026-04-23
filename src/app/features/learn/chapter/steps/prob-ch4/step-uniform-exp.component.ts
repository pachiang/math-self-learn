import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch4-uniform-exp',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Uniform 與 Exponential" subtitle="§4.2">
      <h4>Uniform(a, b)：每點等機率</h4>
      <div class="centered-eq">
        f(x) = 1/(b − a) 於 [a, b]，其餘為 0
      </div>
      <ul class="props">
        <li>E[X] = (a+b)/2</li>
        <li>Var(X) = (b−a)²/12</li>
      </ul>
      <p>
        最簡單的連續分佈。沒先驗知識時的預設選擇——最大熵的有界分佈。
        <code>Math.random()</code> 就是 Uniform(0, 1)。
      </p>

      <h4>Exponential(λ)：無記憶的等待</h4>
      <div class="centered-eq big">
        f(x) = λ·e<sup>−λx</sup>,&nbsp;&nbsp; x ≥ 0
      </div>
      <ul class="props">
        <li>E[X] = 1/λ</li>
        <li>Var(X) = 1/λ²</li>
        <li>無記憶：P(X &gt; s+t | X &gt; s) = P(X &gt; t)</li>
      </ul>
      <p class="key-idea">
        Exponential 是<strong>連續版的 Geometric</strong>。
        描述 Poisson 事件發生的<strong>時間間隔</strong>：下一通電話來多久、燈泡壽命、放射衰變半衰期。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="互動：Exponential 分佈與指數衰減">
      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">速率 λ</span>
          <input type="range" min="0.1" max="3" step="0.05" [value]="lambda()"
            (input)="lambda.set(+$any($event).target.value)" />
          <span class="sl-val">{{ lambda().toFixed(2) }}</span>
        </div>
        <div class="info">
          <span>E[X] = 1/λ = <strong>{{ (1/lambda()).toFixed(2) }}</strong></span>
          <span>中位數 ln(2)/λ = <strong>{{ (Math.LN2/lambda()).toFixed(2) }}</strong></span>
        </div>
      </div>

      <div class="plots">
        <div class="pl">
          <div class="pl-title">PDF：f(x) = λe^(−λx)</div>
          <svg viewBox="-10 -90 420 120" class="pl-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-85" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
            <path [attr.d]="pdfPath()" fill="var(--accent)" opacity="0.2" />
            <path [attr.d]="pdfPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
            <!-- Mean marker -->
            <line [attr.x1]="(1/lambda()) * 80" y1="-85" [attr.x2]="(1/lambda()) * 80" y2="10"
              stroke="#5ca878" stroke-width="1.2" stroke-dasharray="3 2" />
            <text [attr.x]="(1/lambda()) * 80" y="18" class="tk mean" text-anchor="middle">E[X]</text>
          </svg>
        </div>

        <div class="pl">
          <div class="pl-title">CDF：F(x) = 1 − e^(−λx)</div>
          <svg viewBox="-10 -90 420 120" class="pl-svg">
            <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-85" x2="0" y2="20" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="-80" x2="400" y2="-80" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3 2" />
            <path [attr.d]="cdfPath()" fill="none" stroke="#5a8aa8" stroke-width="2" />
            <text x="0" y="-80" class="tk" text-anchor="end">1</text>
          </svg>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>無記憶性：燈泡不會老</h4>
      <p>
        若燈泡壽命 X ~ Exp(λ)，已經用了 10 小時——它還能用多久？
        跟<strong>剛買回來</strong>一樣，期望值仍是 1/λ。
        真實燈泡當然有「老化」，所以不是完全 exponential——但核心電子元件、放射性衰變非常接近。
      </p>

      <h4>Uniform 的反變換技巧</h4>
      <p>
        要模擬任何分佈？用 Uniform + CDF 反函數：
      </p>
      <div class="centered-eq">
        若 U ~ Uniform(0,1)，則 X = F⁻¹(U) 就有 CDF F
      </div>
      <p>
        例：要 Exp(λ)，U ~ Uniform(0,1)，令 X = −ln(1−U)/λ。
        這叫<strong>逆變換抽樣</strong>，是模擬的基礎。
      </p>

      <div class="examples-box">
        <div class="eb-title">實例應用</div>
        <ul>
          <li>電話中心：下通電話來臨時間 ~ Exp(平均服務率)</li>
          <li>網頁點擊間隔、App 推播觸發</li>
          <li>半衰期 t₁/₂ = ln(2)/λ，經典物理公式</li>
          <li>排隊論 M/M/1：服務和到達時間都 exponential</li>
          <li>生存分析（Survival analysis）的基礎模型</li>
        </ul>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        Uniform 是「平均」的代表、Exponential 是「等待」的代表。
        兩者都是「最大熵」分佈——在給定條件下最不帶偏見的選擇。
        下一節：萬能的 Normal 分佈。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }
    .key-idea strong { color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .props { margin: 6px 0 12px 20px; font-size: 13px; line-height: 1.7; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 50px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }
    .info { display: flex; justify-content: space-around; font-size: 12px; color: var(--text-secondary); }
    .info strong { color: var(--accent); font-family: 'JetBrains Mono', monospace; }

    .plots { display: grid; gap: 8px; }
    .pl { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .pl-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .pl-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .tk.mean { fill: #5ca878; }

    .examples-box { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin: 10px 0; }
    .eb-title { font-weight: 700; color: var(--accent); margin-bottom: 6px; font-size: 13px; }
    .examples-box ul { margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.7; color: var(--text-secondary); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh4UniformExpComponent {
  readonly Math = Math;
  readonly lambda = signal(0.5);

  pdfPath(): string {
    const lam = this.lambda();
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (5 * i) / N;
      const y = lam * Math.exp(-lam * x);
      const px = x * 80;
      const py = -y * 80;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    pts.push('L 400 0 Z');
    return pts.join(' ');
  }

  cdfPath(): string {
    const lam = this.lambda();
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (5 * i) / N;
      const y = 1 - Math.exp(-lam * x);
      const px = x * 80;
      const py = -y * 80;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
