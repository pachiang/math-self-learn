import { Component, computed, inject } from '@angular/core';
import { GroupStateService } from '../../../../core/services/group-state.service';
import { GroupElement } from '../../../../core/math/group';

@Component({
  selector: 'app-cayley-table',
  standalone: true,
  template: `
    <div class="table-wrapper">
      <table class="cayley">
        <thead>
          <tr>
            <th class="op-header">∘</th>
            @for (col of elements(); track col.id) {
              <th
                [class.highlight-col]="col.id === currentId()"
                [title]="col.id"
              >
                {{ col.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of elements(); track row.id) {
            <tr>
              <th
                class="row-header"
                [class.highlight-row]="row.id === currentId()"
              >
                {{ row.label }}
              </th>
              @for (col of elements(); track col.id) {
                <td
                  class="cell"
                  [class.highlight]="
                    row.id === currentId() || col.id === currentId()
                  "
                  [class.result]="getProduct(row, col).id === currentId()"
                  (click)="apply(row, col)"
                  [title]="
                    row.label + ' ∘ ' + col.label + ' = ' + getProduct(row, col).label
                  "
                >
                  {{ getProduct(row, col).label }}
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .cayley {
      border-collapse: collapse;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      font-size: 15px;
      width: 100%;
    }

    th,
    td {
      padding: 8px 12px;
      text-align: center;
      border: 1px solid var(--border);
      min-width: 44px;
    }

    thead th {
      background: var(--accent-10);
      color: var(--text-secondary);
      font-weight: 600;
      position: sticky;
      top: 0;
    }

    .op-header {
      background: var(--accent-18) !important;
      color: var(--text);
      font-size: 18px;
    }

    .row-header {
      background: var(--accent-10);
      color: var(--text-secondary);
      font-weight: 600;
    }

    .cell {
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.12s ease;

      &:hover {
        background: var(--accent-10);
        color: var(--text);
      }
    }

    .highlight {
      background: rgba(140, 126, 115, 0.05);
    }

    .highlight-col,
    .highlight-row {
      background: var(--accent-18) !important;
      color: var(--text) !important;
    }

    .result {
      background: var(--accent-30) !important;
      color: var(--text) !important;
      font-weight: 700;
    }
  `,
})
export class CayleyTableComponent {
  private readonly groupState = inject(GroupStateService);

  readonly elements = computed(() => this.groupState.group().elements);
  readonly currentId = computed(() => this.groupState.currentElement().id);

  private productCache = new Map<string, GroupElement>();
  private lastGroupNotation = '';

  getProduct(a: GroupElement, b: GroupElement): GroupElement {
    const g = this.groupState.group();

    if (g.notation !== this.lastGroupNotation) {
      this.productCache.clear();
      this.lastGroupNotation = g.notation;
    }

    const key = `${a.id}|${b.id}`;
    let result = this.productCache.get(key);
    if (!result) {
      result = g.multiply(a, b);
      this.productCache.set(key, result);
    }
    return result;
  }

  apply(row: GroupElement, col: GroupElement): void {
    const product = this.getProduct(row, col);
    this.groupState.jumpToElement(product);
  }
}
