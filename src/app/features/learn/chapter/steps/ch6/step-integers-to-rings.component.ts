import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-integers-to-rings',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從整數到環" subtitle="\u00A76.1">
      <p>
        群只有<strong>一個</strong>運算。但我們最熟悉的數學對象 — 整數 —
        有<strong>兩個</strong>運算：加法和乘法。
      </p>
      <p>
        這兩個運算之間還有一條紐帶：<strong>分配律</strong>。
        a \u00D7 (b + c) = a \u00D7 b + a \u00D7 c。
        環（ring）就是把這整套結構抽象出來的概念。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="看看整數的性質，哪些是群公理，哪些是新的">
      <div class="property-table">
        <div class="pt-section">
          <div class="pt-header add">加法性質（這些你在第一章學過）</div>
          <div class="pt-row"><span class="check">\u2713</span> 封閉性：a + b 是整數</div>
          <div class="pt-row"><span class="check">\u2713</span> 結合律：(a+b)+c = a+(b+c)</div>
          <div class="pt-row"><span class="check">\u2713</span> 單位元：a + 0 = a</div>
          <div class="pt-row"><span class="check">\u2713</span> 逆元：a + (\u2212a) = 0</div>
          <div class="pt-row"><span class="check">\u2713</span> 交換律：a + b = b + a</div>
          <div class="pt-verdict">整數的加法構成<strong>交換群</strong></div>
        </div>

        <div class="pt-section">
          <div class="pt-header mul">乘法性質（新的！）</div>
          <div class="pt-row"><span class="check">\u2713</span> 封閉性：a \u00D7 b 是整數</div>
          <div class="pt-row"><span class="check">\u2713</span> 結合律：(a\u00D7b)\u00D7c = a\u00D7(b\u00D7c)</div>
          <div class="pt-row"><span class="check">\u2713</span> 單位元：a \u00D7 1 = a</div>
          <div class="pt-row"><span class="cross">\u2717</span> 逆元：2 沒有整數倒數</div>
        </div>

        <div class="pt-section">
          <div class="pt-header bridge">加法和乘法的橋樑</div>
          <div class="pt-row"><span class="check">\u2713</span> 分配律：a \u00D7 (b+c) = a\u00D7b + a\u00D7c</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="環的定義">
      <p>一個<strong>環</strong>（ring）是一個集合 R 配上兩個運算 + 和 \u00D7，滿足：</p>
      <div class="def-list">
        <div class="def-item"><span class="num">1</span> (R, +) 是交換群</div>
        <div class="def-item"><span class="num">2</span> 乘法封閉、結合</div>
        <div class="def-item"><span class="num">3</span> 有乘法單位元 1</div>
        <div class="def-item"><span class="num">4</span> 分配律成立</div>
      </div>
      <p>
        注意：環<strong>不要求乘法有逆元</strong>（不能除），
        也<strong>不要求乘法交換</strong>（ab 不一定等於 ba）。
      </p>

      <div class="analogy-box">
        <div class="ab-title">類比</div>
        <div class="ab-row"><span class="ab-l">群</span><span class="ab-r">一個運算（加或乘）</span></div>
        <div class="ab-row"><span class="ab-l">環</span><span class="ab-r">兩個運算（加 + 乘 + 分配律）</span></div>
        <div class="ab-row"><span class="ab-l">域</span><span class="ab-r">環 + 乘法也有逆元（可以除）</span></div>
      </div>

      <span class="hint">
        整數是最經典的環。但環的世界比整數豐富得多。
        下一節我們看看其他奇妙的環。
      </span>
    </app-prose-block>
  `,
  styles: `
    .property-table { display: flex; flex-direction: column; gap: 12px; margin-bottom: 8px; }
    .pt-section { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .pt-header {
      padding: 8px 14px; font-size: 13px; font-weight: 700; color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      &.add { background: var(--v1); }
      &.mul { background: var(--v0); }
      &.bridge { background: var(--v4); }
    }
    .pt-row {
      padding: 6px 14px; font-size: 13px; color: var(--text-secondary);
      border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px;
      &:last-child { border-bottom: none; }
    }
    .check { color: #5a8a5a; font-weight: 700; }
    .cross { color: #a05a5a; font-weight: 700; }
    .pt-verdict {
      padding: 8px 14px; background: var(--accent-10); font-size: 12px; color: var(--text-secondary);
      strong { color: var(--text); }
    }

    .def-list { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    .def-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      border: 1px solid var(--border); border-radius: 6px; font-size: 13px;
      color: var(--text-secondary); background: var(--bg-surface);
    }
    .num {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
      color: white; font-size: 12px; font-weight: 700; flex-shrink: 0;
    }

    .analogy-box {
      border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: 14px 0;
    }
    .ab-title { padding: 8px 14px; background: var(--accent-10); font-size: 12px; font-weight: 700; color: var(--accent); }
    .ab-row {
      display: grid; grid-template-columns: 60px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
    }
    .ab-l { padding: 6px 12px; font-weight: 600; color: var(--text); background: var(--bg-surface); font-size: 13px; }
    .ab-r { padding: 6px 12px; font-size: 13px; color: var(--text-secondary); }
  `,
})
export class StepIntegersToRingsComponent {}
