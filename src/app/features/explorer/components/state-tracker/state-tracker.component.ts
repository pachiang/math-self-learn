import { Component, computed, inject } from '@angular/core';
import { GroupStateService } from '../../../../core/services/group-state.service';
import { VERTEX_COLORS, VERTEX_COLOR_NAMES } from '../../../../shared/utils/colors';

@Component({
  selector: 'app-state-tracker',
  standalone: true,
  template: `
    <div class="tracker">
      <div class="current-element">
        <span class="label">目前元素</span>
        <span class="value">{{ currentLabel() }}</span>
      </div>

      <div class="permutation">
        <span class="label">排列</span>
        <span class="value mono">{{ cycleNotation() }}</span>
      </div>

      <div class="mapping">
        <span class="label">頂點映射</span>
        <div class="mapping-rows">
          @for (row of mappingRows(); track row.from) {
            <div class="mapping-row">
              <span
                class="color-dot"
                [style.background]="row.fromColor"
              ></span>
              <span class="mono">{{ row.from }}</span>
              <span class="arrow">→</span>
              <span class="mono">P{{ row.toPosition }}</span>
            </div>
          }
        </div>
      </div>

      @if (history().length > 0) {
        <div class="history">
          <span class="label">操作歷史</span>
          <div class="history-list">
            @for (h of history(); track $index) {
              <span class="history-item">{{ h.label }}</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .tracker {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .label {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .value {
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
    }

    .mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .mapping-rows {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mapping-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .arrow {
      color: var(--text-muted);
    }

    .history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .history-item {
      padding: 2px 8px;
      background: var(--accent-10);
      border-radius: 4px;
      font-size: 14px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      color: var(--text-secondary);
    }
  `,
})
export class StateTrackerComponent {
  private readonly groupState = inject(GroupStateService);

  readonly currentLabel = computed(
    () => this.groupState.currentElement().label,
  );

  readonly cycleNotation = computed(() =>
    this.groupState.currentElement().permutation.toCycleNotation(),
  );

  readonly history = computed(() => this.groupState.history());

  readonly mappingRows = computed(() => {
    const state = this.groupState.state();
    return state
      .map((colorIdx, pos) => ({
        from: colorIdx,
        fromColor: VERTEX_COLORS[colorIdx],
        fromName: VERTEX_COLOR_NAMES[colorIdx],
        toPosition: pos,
      }))
      .sort((a, b) => a.from - b.from);
  });
}
