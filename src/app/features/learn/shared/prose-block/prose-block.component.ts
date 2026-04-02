import { Component, input } from '@angular/core';

@Component({
  selector: 'app-prose-block',
  standalone: true,
  template: `
    <section class="prose">
      @if (subtitle()) {
        <span class="subtitle">{{ subtitle() }}</span>
      }
      @if (title()) {
        <h2 class="title">{{ title() }}</h2>
      }
      <div class="body">
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    .prose {
      margin-bottom: 24px;
    }

    .subtitle {
      display: block;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 4px;
    }

    .title {
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 12px;
      line-height: 1.3;
    }

    .body {
      font-size: 15px;
      line-height: 1.75;
      color: var(--text-secondary);

      :host ::ng-deep p {
        margin: 0 0 12px;
      }

      :host ::ng-deep strong {
        color: var(--text);
        font-weight: 600;
      }

      :host ::ng-deep .hint {
        display: block;
        padding: 10px 14px;
        background: var(--accent-10);
        border-left: 3px solid var(--accent);
        border-radius: 0 8px 8px 0;
        font-size: 14px;
        color: var(--text-secondary);
        margin: 12px 0;
      }
    }
  `,
})
export class ProseBlockComponent {
  title = input<string>();
  subtitle = input<string>();
}
