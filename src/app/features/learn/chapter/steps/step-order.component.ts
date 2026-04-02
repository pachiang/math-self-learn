import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-step-order',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="順序重要嗎？" subtitle="§1.3">
      <p>
        上一節我們學會了把兩個操作組合起來。但如果<strong>交換順序</strong>呢？
        「先 r 再 s」跟「先 s 再 r」，結果一樣嗎？
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
export class StepOrderComponent {}
