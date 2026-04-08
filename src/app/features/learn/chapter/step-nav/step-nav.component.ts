import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface StepDef {
  num: number;
  title: string;
}

@Component({
  selector: 'app-step-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="step-nav">
      @for (step of steps(); track step.num) {
        <a
          class="step-link"
          [routerLink]="['/learn', subject(), chapterId(), String(step.num)]"
          routerLinkActive="active"
        >
          <span class="step-num">{{ step.num }}</span>
          <span class="step-title">{{ step.title }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    .step-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 28px;
    }

    .step-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px 5px 6px;
      border-radius: 20px;
      text-decoration: none;
      transition: all 0.15s ease;
      border: 1px solid var(--border);
      background: transparent;

      &:hover {
        background: var(--accent-10);
        border-color: var(--border-strong);
      }

      &.active {
        background: var(--accent-18);
        border-color: var(--accent-30);

        .step-num {
          background: var(--accent);
          color: white;
        }

        .step-title {
          color: var(--text);
          font-weight: 600;
        }
      }
    }

    .step-num {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--border-strong);
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .step-title {
      font-size: 13px;
      color: var(--text-muted);
      white-space: nowrap;
    }
  `,
})
export class StepNavComponent {
  steps = input.required<StepDef[]>();
  subject = input.required<string>();
  chapterId = input.required<string>();

  protected readonly String = String;
}
