import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({ selector: 'app-step-quintic', standalone: true, imports: [ProseBlockComponent, ChallengeCardComponent], template: `
<app-prose-block title="為什麼五次方程沒有公式解" subtitle="\u00A78.6">
  <p>二次方程有公式解（配方法）。三次、四次也有（雖然很複雜）。但<strong>五次及以上的一般方程式，不存在根式解的公式</strong>。</p>
  <p>200 年來數學家想破頭的問題，被一個 20 歲的法國青年 \u00C9variste Galois 用群論解決了。</p>
</app-prose-block>
<app-challenge-card prompt="跟著邏輯鏈走一遍">
  <div class="logic-chain">
    <div class="lc-step">
      <div class="lc-num">1</div>
      <div class="lc-content">
        <div class="lc-title">「用根式解」= 一連串的開方運算</div>
        <div class="lc-detail">如果方程式可以用 +, \u2212, \u00D7, \u00F7 和 \u207F\u221A 來寫解，那叫「可用根式求解」。</div>
      </div>
    </div>
    <div class="lc-step">
      <div class="lc-num">2</div>
      <div class="lc-content">
        <div class="lc-title">每次開 n 次方 \u2194 一個循環擴張（Z\u2099）</div>
        <div class="lc-detail">加入 \u207F\u221Aa 相當於做一個伽羅瓦群為循環群 Z\u2099 的域擴張。</div>
      </div>
    </div>
    <div class="lc-step">
      <div class="lc-num">3</div>
      <div class="lc-content">
        <div class="lc-title">可用根式求解 \u2194 伽羅瓦群「可解」</div>
        <div class="lc-detail">一個群是<strong>可解群</strong>（solvable group），如果它可以通過一系列正規子群分解成交換群（循環群）。</div>
      </div>
    </div>
    <div class="lc-step">
      <div class="lc-num">4</div>
      <div class="lc-content">
        <div class="lc-title">S\u2085 不是可解群！</div>
        <div class="lc-detail">因為 A\u2085 是<strong>單群</strong>（沒有非平凡正規子群）。S\u2085 \u2283 A\u2085，而 A\u2085 不能再分解。</div>
      </div>
    </div>
    <div class="lc-step final">
      <div class="lc-num">\u2605</div>
      <div class="lc-content">
        <div class="lc-title">存在伽羅瓦群為 S\u2085 的五次多項式</div>
        <div class="lc-detail">例如 x\u2075 \u2212 4x + 2 的伽羅瓦群是 S\u2085。既然 S\u2085 不可解，這個方程式<strong>不可能用根式求解</strong>。</div>
      </div>
    </div>
  </div>

  <div class="callback-box">
    <div class="cb-title">整趟旅程的回顧</div>
    <div class="cb-chain">
      <span class="cb-item">Ch1 D\u2083 對稱</span>
      <span class="cb-arrow">\u2192</span>
      <span class="cb-item">Ch4 S\u2099, A\u2099</span>
      <span class="cb-arrow">\u2192</span>
      <span class="cb-item">Ch6-7 環, 域</span>
      <span class="cb-arrow">\u2192</span>
      <span class="cb-item highlight">Ch8 A\u2085 單群 \u2192 五次不可解</span>
    </div>
    <p>從三角形的旋轉到五次方程的不可解性 — 這就是<strong>抽象代數的力量</strong>。</p>
  </div>
</app-challenge-card>
<app-prose-block>
  <div class="finale-box">
    <div class="fin-title">恭喜！</div>
    <p>你走完了從群論到伽羅瓦理論的完整旅程。</p>
    <p>從第一章的「三角形怎麼轉」，到第八章的「五次方程為什麼沒有公式解」，你見證了抽象代數最核心的思想：</p>
    <div class="fin-idea"><strong>用結構理解對稱，用對稱理解方程式。</strong></div>
  </div>
</app-prose-block>
`, styles: `
  .logic-chain { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .lc-step { display: flex; gap: 12px; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg);
    &.final { border-color: var(--accent); border-width: 2px; background: var(--accent-10); } }
  .lc-num { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%;
    background: var(--accent); color: white; font-size: 14px; font-weight: 700; flex-shrink: 0; }
  .lc-content { flex: 1; }
  .lc-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .lc-detail { font-size: 12px; color: var(--text-secondary); line-height: 1.5; strong { color: var(--text); } }

  .callback-box { padding: 18px; border: 2px solid var(--accent); border-radius: 14px; background: var(--accent-10); text-align: center; }
  .cb-title { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 10px; }
  .cb-chain { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .cb-item { padding: 4px 10px; border-radius: 5px; font-size: 12px; font-weight: 600; background: var(--bg-surface);
    color: var(--text); border: 1px solid var(--border);
    &.highlight { background: rgba(90,138,90,0.15); border-color: rgba(90,138,90,0.3); color: #5a8a5a; } }
  .cb-arrow { color: var(--accent); font-size: 14px; }
  .callback-box p { font-size: 13px; color: var(--text-secondary); margin: 0; strong { color: var(--text); } }

  .finale-box { padding: 24px; border: 3px solid var(--accent); border-radius: 16px; background: var(--accent-10); text-align: center; }
  .fin-title { font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
  .finale-box p { font-size: 14px; color: var(--text-secondary); margin: 6px 0; line-height: 1.6; }
  .fin-idea { font-size: 18px; font-weight: 700; color: var(--text); margin-top: 12px; padding: 12px; background: var(--bg-surface); border-radius: 10px; }
` })
export class StepQuinticComponent {}
