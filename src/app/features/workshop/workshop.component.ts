import { Component } from '@angular/core';

@Component({
  selector: 'app-workshop',
  standalone: true,
  template: `
    <div class="workshop">
      <div class="placeholder">
        <span class="icon">&#x1D4A2;</span>
        <h2>工作坊</h2>
        <p>此功能開發中</p>
      </div>
    </div>
  `,
  styles: `
    .workshop {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 56px - 80px);
      padding: 40px 24px;
    }

    .placeholder {
      text-align: center;
      color: var(--text-muted);
    }

    .icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
      opacity: 0.4;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  `,
})
export class WorkshopComponent {}
