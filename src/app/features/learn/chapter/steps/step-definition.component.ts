import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-step-definition',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="群的定義" subtitle="§1.5">
      <p>
        恭喜！你已經透過正三角形的對稱，<strong>親手</strong>體驗了群的四條公理。
        現在讓我們正式寫下來。
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
export class StepDefinitionComponent {}
