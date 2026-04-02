import { Component, computed, inject } from '@angular/core';
import { GroupStateService } from '../../../../core/services/group-state.service';
import { GroupElement } from '../../../../core/math/group';

@Component({
  selector: 'app-operation-panel',
  standalone: true,
  template: `
    <div class="panel">
      <div class="section">
        <h3 class="section-title">生成元</h3>
        <div class="button-row">
          @for (gen of generators(); track gen.id) {
            <button
              class="op-btn generator"
              (click)="apply(gen)"
              [title]="gen.id"
            >
              {{ gen.label }}
            </button>
          }
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">所有元素</h3>
        <div class="button-row">
          @for (el of elements(); track el.id) {
            <button
              class="op-btn"
              [class.active]="el.id === currentId()"
              (click)="apply(el)"
              [title]="el.id"
            >
              {{ el.label }}
            </button>
          }
        </div>
      </div>

      <div class="section">
        <button class="reset-btn" (click)="reset()">↺ 重置</button>
      </div>
    </div>
  `,
  styles: `
    .panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin: 0 0 8px;
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .op-btn {
      padding: 8px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: transparent;
      color: var(--text);
      font-size: 18px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      cursor: pointer;
      transition: all 0.15s ease;
      min-width: 48px;
      text-align: center;

      &:hover {
        background: var(--accent-10);
        border-color: var(--border-strong);
      }

      &.generator {
        border-color: var(--accent-30);
        background: var(--accent-10);

        &:hover {
          background: var(--accent-18);
        }
      }

      &.active {
        background: var(--accent-18);
        border-color: var(--accent);
        box-shadow: 0 0 0 2px var(--accent-10);
      }
    }

    .reset-btn {
      padding: 8px 20px;
      border: 1px solid rgba(160, 100, 90, 0.25);
      border-radius: 8px;
      background: rgba(160, 100, 90, 0.06);
      color: rgba(160, 100, 90, 0.85);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(160, 100, 90, 0.12);
      }
    }
  `,
})
export class OperationPanelComponent {
  private readonly groupState = inject(GroupStateService);

  readonly generators = computed(() => this.groupState.group().generators);
  readonly elements = computed(() => this.groupState.group().elements);
  readonly currentId = computed(() => this.groupState.currentElement().id);

  apply(element: GroupElement): void {
    this.groupState.requestOperation(element);
  }

  reset(): void {
    this.groupState.reset();
  }
}
