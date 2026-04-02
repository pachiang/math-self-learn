import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({ selector: 'app-step-elliptic-curves', standalone: true, imports: [ProseBlockComponent], template: `
<app-prose-block title="橢圓曲線" subtitle="\u00A712.4">
  <p>y\u00B2 = x\u00B3 + ax + b 定義的曲線叫<strong>橢圓曲線</strong>。它們有一個神奇的性質：曲線上的點可以「相加」，構成一個<strong>群</strong>！</p>
  <div class="addition">
    <div class="add-title">橢圓曲線上的加法</div>
    <div class="add-steps">
      <div class="add-step">\u2460 取曲線上兩點 P、Q</div>
      <div class="add-step">\u2461 畫一條直線通過 P 和 Q</div>
      <div class="add-step">\u2462 這條線跟曲線交於第三點 R</div>
      <div class="add-step">\u2463 P + Q = R 關於 x 軸的鏡像</div>
    </div>
  </div>
  <p>橢圓曲線群是<strong>交換群</strong>，而且有豐富的結構。它們出現在：</p>
  <div class="apps">
    <div class="app">\u2022 <strong>密碼學</strong>：橢圓曲線密碼（ECC）比 RSA 更高效</div>
    <div class="app">\u2022 <strong>數論</strong>：費馬大定理的證明（Wiles, 1995）核心用到了橢圓曲線</div>
    <div class="app">\u2022 <strong>弦理論</strong>：高維橢圓曲線（Calabi-Yau 流形）是額外維度的形狀</div>
  </div>
</app-prose-block>
`, styles: `
  .addition { padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); margin: 12px 0; }
  .add-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .add-steps { display: flex; flex-direction: column; gap: 4px; }
  .add-step { font-size: 13px; color: var(--text-secondary); padding: 4px 0; }
  .apps { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
  .app { font-size: 13px; color: var(--text-secondary); padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-surface); line-height: 1.5; strong { color: var(--text); } }
` })
export class StepEllipticCurvesComponent {}
