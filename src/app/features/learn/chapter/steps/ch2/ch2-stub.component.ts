import { Component, input } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';

@Component({
  selector: 'app-ch2-stub',
  standalone: true,
  imports: [ProseBlockComponent],
  template: `
    <app-prose-block [title]="title()" [subtitle]="section()">
      <p>{{ hint() }}</p>
      <p class="wip">此節互動內容開發中...</p>
    </app-prose-block>
  `,
  styles: `
    .wip {
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
export class Ch2StubComponent {
  title = input.required<string>();
  section = input.required<string>();
  hint = input('');
}
