import { Component, input } from '@angular/core';

@Component({
  selector: 'app-challenge-card',
  standalone: true,
  template: `
    <div class="card" [class.done]="completed()">
      <div class="card-header">
        <span class="badge">{{ completed() ? '✓ 完成' : '動手試試' }}</span>
        @if (prompt()) {
          <p class="prompt">{{ prompt() }}</p>
        }
      </div>
      <div class="card-body">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .card {
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 24px;
      background: var(--bg-surface);
      transition: border-color 0.3s ease;
    }

    .card.done {
      border-color: var(--accent-30);
    }

    .card-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      background: var(--accent-10);
    }

    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent);
      background: var(--accent-18);
      padding: 3px 10px;
      border-radius: 4px;
      margin-bottom: 6px;
    }

    .done .badge {
      color: #5a8a5a;
      background: rgba(90, 138, 90, 0.12);
    }

    .prompt {
      margin: 0;
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    .card-body {
      padding: 18px;
    }
  `,
})
export class ChallengeCardComponent {
  prompt = input<string>();
  completed = input(false);
}
