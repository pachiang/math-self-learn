import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { GroupStateService } from '../../../../core/services/group-state.service';
import { Group, GroupElement } from '../../../../core/math/group';
import { ShapeCanvasComponent } from '../../../explorer/components/shape-canvas/shape-canvas.component';

@Component({
  selector: 'app-guided-canvas',
  standalone: true,
  imports: [ShapeCanvasComponent],
  providers: [GroupStateService],
  template: `
    <div class="guided">
      <div class="canvas-frame">
        <app-shape-canvas />
      </div>
      @if (showOperations()) {
        <div class="operations">
          @for (op of visibleOps(); track op.id) {
            <button
              class="op-btn"
              [class.highlighted]="highlightedOps().has(op.id)"
              [class.dimmed]="!highlightedOps().has(op.id) && highlightedOps().size > 0"
              [disabled]="groupState.isAnimating()"
              (click)="onApply(op)"
            >
              {{ op.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .guided {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .canvas-frame {
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1;
      display: flex;
      justify-content: center;
      background: var(--bg-inset);
      border-radius: 12px;
      border: 1px solid var(--border);
      padding: 8px;
    }

    .operations {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }

    .op-btn {
      padding: 7px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: transparent;
      color: var(--text);
      font-size: 17px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      cursor: pointer;
      transition: all 0.15s ease;
      min-width: 44px;

      &:hover:not(:disabled) {
        background: var(--accent-10);
        border-color: var(--border-strong);
      }

      &:disabled {
        opacity: 0.5;
        cursor: default;
      }

      &.highlighted {
        border-color: var(--accent);
        background: var(--accent-18);
      }

      &.dimmed {
        opacity: 0.45;
      }
    }
  `,
})
export class GuidedCanvasComponent {
  readonly groupState = inject(GroupStateService);

  /** The group to display. Defaults to whatever the service has. */
  group = input<Group>();
  /** Which element IDs to show as buttons. Null = show all. */
  allowedOperations = input<string[] | null>(null);
  /** Show operation buttons at all? */
  showOperations = input(true);
  /** Set of element IDs to visually highlight. */
  highlightedOps = input<Set<string>>(new Set());

  /** Fires when the user clicks an operation (before animation). */
  operationStarted = output<GroupElement>();
  /** Fires after the animation finishes and state is committed. */
  operationCompleted = output<GroupElement>();

  private lastApplied: GroupElement | null = null;

  constructor() {
    // Sync group input → service
    effect(() => {
      const g = this.group();
      if (g) this.groupState.setGroup(g);
    });

    // Detect animation completion
    effect(() => {
      const pending = this.groupState.pendingElement();
      if (pending === null && this.lastApplied) {
        const applied = this.lastApplied;
        this.lastApplied = null;
        // Emit asynchronously so the signal graph settles first
        queueMicrotask(() => this.operationCompleted.emit(applied));
      }
    });
  }

  readonly visibleOps = computed(() => {
    const allowed = this.allowedOperations();
    const elements = this.groupState.group().elements;
    if (!allowed) return elements;
    return elements.filter((e) => allowed.includes(e.id));
  });

  onApply(op: GroupElement): void {
    this.lastApplied = op;
    this.operationStarted.emit(op);
    this.groupState.requestOperation(op);
  }

  /** Programmatically apply an operation (for external control). */
  apply(op: GroupElement): void {
    this.lastApplied = op;
    this.groupState.requestOperation(op);
  }

  /** Reset to identity. */
  reset(): void {
    this.groupState.reset();
  }
}
