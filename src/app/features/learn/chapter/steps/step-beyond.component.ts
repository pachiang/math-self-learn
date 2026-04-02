import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-step-beyond',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block title="其他群的味道" subtitle="§1.6">
      <p>
        正三角形只是開始。正方形有 8 個對稱操作（D₄），
        而「時鐘算術」構成了另一類更簡單的群（循環群 Zₙ）。
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
export class StepBeyondComponent {}
