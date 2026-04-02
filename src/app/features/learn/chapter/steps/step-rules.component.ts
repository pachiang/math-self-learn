import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-step-rules',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="三個隱藏規則" subtitle="§1.4">
      <p>
        到目前為止，你已經觀察到一些規律了。讓我們把它們明確寫出來：
        <strong>單位元</strong>、<strong>逆元</strong>、和<strong>結合律</strong>。
      </p>
      <p class="coming-soon">此節互動內容開發中...</p>
    </app-prose-block>
  `,
  styles: `
    .coming-soon {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted);
      font-style: italic;
      background: var(--bg-inset);
      border-radius: 12px;
      margin-top: 16px;
    }
  `,
})
export class StepRulesComponent {}
