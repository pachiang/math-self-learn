import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch12-separation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="分離變數法：拆成兩個 ODE" subtitle="§12.3">
      <p>
        PDE 有兩個自變數，好可怕。但如果我們大膽假設解有<strong>積分離的形式</strong>：
      </p>
      <div class="centered-eq big">
        u(x, t) = X(x) · T(t)
      </div>
      <p>
        代入熱方程 <code>∂u/∂t = α·∂²u/∂x²</code>，左右兩邊變成：
      </p>
      <div class="centered-eq">
        X(x) · T′(t) = α · X″(x) · T(t)
      </div>
      <p>
        兩邊同除 <code>α · X · T</code>：
      </p>
      <div class="centered-eq big">
        T′(t) / [α·T(t)] = X″(x) / X(x)
      </div>
      <p class="key-idea">
        神奇處：<strong>左邊只跟 t 有關、右邊只跟 x 有關</strong>。
        若兩者恆相等，則<strong>都必須等於同一個常數</strong>——記為 <code>−λ</code>。
        原因：對 x 偏微分左邊是 0，對 t 偏微分右邊是 0。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="兩邊分開，就變成 Ch11 的本徵值問題 + 一個簡單 ODE">
      <div class="split-diagram">
        <div class="center-block">
          <div class="cb-title">PDE</div>
          <code class="cb-eq">uₜ = α·uₓₓ</code>
          <p class="cb-note">兩個自變數</p>
        </div>
        <div class="split-arrow">令 u = X(x)·T(t)<br>→ 分離</div>
        <div class="two-eqs">
          <div class="eq-block time">
            <div class="eq-title">時間 ODE</div>
            <code class="eq-body">T′ = −α·λ·T</code>
            <p class="eq-cap">一階、常係數 → <strong>T(t) = e^(−αλt)</strong></p>
          </div>
          <div class="eq-block space">
            <div class="eq-title">空間 BVP</div>
            <code class="eq-body">−X″ = λ·X</code>
            <p class="eq-cap">Ch11 的本徵值問題！由邊界決定 λₙ, Xₙ</p>
          </div>
        </div>
      </div>

      <div class="combo">
        <div class="combo-title">把兩邊組回來</div>
        <div class="centered-eq combo-eq">
          uₙ(x, t) = Xₙ(x) · e^(−α λₙ t)
        </div>
        <p class="combo-note">
          每個本徵對 (λₙ, Xₙ) 給出一個「基本解」。
          因為熱方程線性，<strong>任意線性組合仍是解</strong>：
        </p>
        <div class="centered-eq big combo-sum">
          u(x, t) = Σ bₙ Xₙ(x) · e^(−α λₙ t)
        </div>
        <p class="combo-note">
          bₙ 由<strong>初始條件 u(x, 0) = f(x)</strong> 透過 §11.4 的投影公式決定。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼 λ &gt; 0？</h4>
      <p>
        如果 λ &lt; 0，<code>T(t) = e^(+α|λ|t)</code> 會<strong>指數爆炸</strong>。
        物理上不合理（熱怎會越來越多？）。
        再看空間方程，λ &lt; 0 時 X″ 與 X 同號 → 解類似 sinh、不會在邊界上歸零。
        兩個線索都排除 λ ≤ 0。
      </p>
      <p>
        <strong>結論：</strong> λ 必須 &gt; 0，對應 T 指數衰減。
        這就是熱方程<strong>不可逆、平滑化</strong>的數學體現。
      </p>

      <h4>互動：觀察單一模態的衰減</h4>
    </app-prose-block>

    <app-challenge-card prompt="滑動 n（模態階數）和 t：看高頻衰減得比低頻快">
      <div class="modes-ctrl">
        <div class="sl">
          <span class="sl-lab">模態 n</span>
          <input type="range" min="1" max="6" step="1" [value]="n()"
            (input)="n.set(+$any($event).target.value)" />
          <span class="sl-val">n = {{ n() }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">時間 t</span>
          <input type="range" min="0" max="2" step="0.01" [value]="t()"
            (input)="t.set(+$any($event).target.value)" />
          <span class="sl-val">{{ t().toFixed(2) }}</span>
        </div>
      </div>

      <div class="plot">
        <div class="plot-title">uₙ(x, t) = sin(n·πx/L) · e^(−α·(nπ/L)² t)，α = 0.1</div>
        <svg viewBox="-10 -80 420 150" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-75" x2="0" y2="55" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="400" y1="-75" x2="400" y2="55" stroke="var(--border-strong)" stroke-width="1" />
          <!-- Initial shape (t=0) -->
          <path [attr.d]="modeInitialPath()" fill="none" stroke="var(--text-muted)" stroke-width="1.4" stroke-dasharray="3 2" opacity="0.7" />
          <!-- Current -->
          <path [attr.d]="modePath()" fill="none" stroke="var(--accent)" stroke-width="2.4" />
        </svg>
        <div class="decay-info">
          <strong>衰減率：</strong> α·λₙ = 0.1 × ({{ n() }})²·π²/L² ≈ {{ decayRate().toFixed(2) }} /秒
          &nbsp;&nbsp;·&nbsp;&nbsp; <strong>當前振幅：</strong> {{ amplitude().toFixed(3) }}
        </div>
      </div>

      <p class="note">
        注意：<strong>n 翻倍 → 衰減率快 4 倍</strong>（因為 λₙ ∝ n²）。
        這就是為什麼熱擴散會「磨掉高頻細節」——細小的波紋消失得比整體趨勢快。
        相機鏡頭的模糊效果、CT 影像的雜訊去除都依賴這個性質。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>take-away：</strong>
        分離變數法把 PDE 拆成「時間 ODE + 空間 BVP」。
        空間部分是 Ch11 的本徵值問題，給我們 Xₙ 族；
        時間部分只是一階指數；
        疊加給完整解。下一節用具體初始條件把這個流程跑到底。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 15px; margin: 12px 0; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }

    .split-diagram { display: grid; gap: 10px; }
    .center-block { text-align: center; padding: 14px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 10px; }
    .cb-title { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .cb-eq { display: inline-block; font-size: 18px; margin: 4px 0; background: transparent; color: var(--accent); }
    .cb-note { font-size: 12px; color: var(--text-muted); margin: 0; }
    .split-arrow { text-align: center; color: var(--accent); font-weight: 700; font-size: 13px; padding: 4px; }
    .two-eqs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 640px) { .two-eqs { grid-template-columns: 1fr; } }
    .eq-block { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .eq-block.time { border-left: 4px solid #5a8aa8; }
    .eq-block.space { border-left: 4px solid #c87b5e; }
    .eq-title { font-weight: 700; color: var(--accent); margin-bottom: 6px; font-size: 13px; }
    .eq-body { display: block; font-size: 15px; padding: 6px 10px; text-align: center; background: var(--bg-surface); margin-bottom: 6px; }
    .eq-cap { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .eq-cap strong { color: var(--accent); }

    .combo { margin-top: 12px; padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; }
    .combo-title { font-weight: 700; color: var(--accent); margin-bottom: 6px; font-size: 14px; }
    .combo-eq { font-size: 16px; padding: 10px; }
    .combo-sum { margin-top: 4px; }
    .combo-note { margin: 8px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .combo-note strong { color: var(--accent); }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .modes-ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 60px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .plot-svg { width: 100%; display: block; }

    .decay-info { font-size: 12px; color: var(--text-secondary); padding: 8px; background: var(--bg-surface); border-radius: 6px; margin-top: 6px; }
    .decay-info strong { color: var(--accent); }

    .note { font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin: 10px 0 0; padding: 10px; background: var(--bg-surface); border-radius: 8px; }
    .note strong { color: var(--accent); }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh12SeparationComponent {
  readonly n = signal(1);
  readonly t = signal(0);
  readonly alpha = 0.1;
  readonly L = Math.PI;

  readonly decayRate = computed(() => this.alpha * (this.n() * Math.PI / this.L) ** 2);
  readonly amplitude = computed(() => Math.exp(-this.decayRate() * this.t()));

  modeInitialPath(): string {
    return this.buildPath(this.n(), 0);
  }

  modePath(): string {
    return this.buildPath(this.n(), this.t());
  }

  private buildPath(n: number, t: number): string {
    const pts: string[] = [];
    const W = 400;
    const H = 55;
    const N = 200;
    const decay = Math.exp(-this.alpha * (n * Math.PI / this.L) ** 2 * t);
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * this.L;
      const y = Math.sin((n * Math.PI * x) / this.L) * decay;
      pts.push(`${i === 0 ? 'M' : 'L'} ${((x / this.L) * W).toFixed(1)} ${(-y * H).toFixed(1)}`);
    }
    return pts.join(' ');
  }
}
