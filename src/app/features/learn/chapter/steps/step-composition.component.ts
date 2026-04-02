import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ProseBlockComponent } from '../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../shared/challenge-card/challenge-card.component';
import { GuidedCanvasComponent } from '../../shared/guided-canvas/guided-canvas.component';
import { Group, GroupElement } from '../../../../core/math/group';
import { createDihedralGroup } from '../../../../core/math/groups/dihedral';
import { LearnProgressService } from '../../../../core/services/learn-progress.service';

type Phase = 'pick-first' | 'pick-second' | 'result';

@Component({
  selector: 'app-step-composition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, GuidedCanvasComponent],
  template: `
    <app-prose-block title="操作的組合" subtitle="§1.2">
      <p>
        現在我們知道了 6 個對稱操作。如果<strong>連續做兩個</strong>操作，
        結果會是什麼？
      </p>
      <p>
        比如：先旋轉 120°，再旋轉 120°，最後三角形跑到了哪裡？
        那跟直接旋轉 240° 是不是一樣？
      </p>
    </app-prose-block>

    <app-challenge-card
      prompt="選兩個操作組合起來，看看等於哪一個"
      [completed]="challengeComplete()"
    >
      <!-- Picker for first operation -->
      <div class="pick-section">
        <span class="pick-label">
          {{ phase() === 'pick-first' ? '選第一個操作：' : '第一個：' }}
        </span>
        <div class="pick-row">
          @for (op of allOps; track op.id) {
            <button
              class="pick-btn"
              [class.selected]="firstOp()?.id === op.id"
              [disabled]="phase() !== 'pick-first'"
              (click)="pickFirst(op)"
            >
              {{ op.label }}
            </button>
          }
        </div>
      </div>

      <!-- Canvas -->
      <app-guided-canvas
        [group]="d3"
        [showOperations]="false"
        (operationCompleted)="onAnimDone()"
      />

      <!-- Picker for second operation -->
      @if (phase() !== 'pick-first') {
        <div class="pick-section">
          <span class="pick-label">
            {{ phase() === 'pick-second' ? '選第二個操作：' : '第二個：' }}
          </span>
          <div class="pick-row">
            @for (op of allOps; track op.id) {
              <button
                class="pick-btn"
                [class.selected]="secondOp()?.id === op.id"
                [disabled]="phase() !== 'pick-second'"
                (click)="pickSecond(op)"
              >
                {{ op.label }}
              </button>
            }
          </div>
        </div>
      }

      <!-- Result -->
      @if (phase() === 'result' && resultOp()) {
        <div class="result-banner">
          <span class="formula">
            {{ firstOp()!.label }} ∘ {{ secondOp()!.label }}
            = <strong>{{ resultOp()!.label }}</strong>
          </span>
          <button class="retry-btn" (click)="resetComposition()">
            再試一組
          </button>
        </div>
      }

      <!-- Composition log -->
      @if (filledCells().length > 0) {
        <div class="log-section">
          <div class="log-title">
            已發現 {{ filledCells().length }} 個組合
          </div>
          <div class="log-grid">
            @for (entry of filledCells(); track entry.key) {
              <span class="log-item">
                {{ entry.aLabel }} ∘ {{ entry.bLabel }} = {{ entry.rLabel }}
              </span>
            }
          </div>
        </div>
      }
    </app-challenge-card>

    @if (challengeComplete()) {
      <app-prose-block>
        <p>
          你注意到了嗎？不管怎麼組合，結果<strong>一定是 6 個操作中的某一個</strong>。
          沒有任何兩個操作的組合會跑出這 6 個之外。
        </p>
        <p>
          這個性質叫做<strong>封閉性</strong>（closure）— 在這個集合裡做運算，
          結果永遠留在集合裡。這是群的第一條重要規則。
        </p>
      </app-prose-block>
    }
  `,
  styles: `
    .pick-section {
      margin-bottom: 12px;
    }

    .pick-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .pick-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .pick-btn {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      font-size: 16px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      cursor: pointer;
      transition: all 0.12s ease;
      min-width: 40px;

      &:hover:not(:disabled) {
        background: var(--accent-10);
      }

      &.selected {
        background: var(--accent-18);
        border-color: var(--accent);
        font-weight: 700;
      }

      &:disabled {
        opacity: 0.35;
        cursor: default;
      }
    }

    .result-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--accent-10);
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      margin-top: 12px;
    }

    .formula {
      font-size: 18px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      color: var(--text);

      strong {
        color: var(--accent);
      }
    }

    .retry-btn {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.12s;

      &:hover {
        background: var(--accent-10);
      }
    }

    .log-section {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }

    .log-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .log-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .log-item {
      font-size: 13px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      padding: 3px 10px;
      background: var(--bg);
      border-radius: 4px;
      color: var(--text-secondary);
    }
  `,
})
export class StepCompositionComponent {
  private readonly progress = inject(LearnProgressService);
  private readonly canvas = viewChild(GuidedCanvasComponent);

  readonly d3: Group = createDihedralGroup(3);
  readonly allOps: GroupElement[] = this.d3.elements;

  readonly phase = signal<Phase>('pick-first');
  readonly firstOp = signal<GroupElement | null>(null);
  readonly secondOp = signal<GroupElement | null>(null);
  readonly resultOp = signal<GroupElement | null>(null);

  readonly filledCells = signal<
    { key: string; aLabel: string; bLabel: string; rLabel: string }[]
  >(
    (this.progress.getStepData<
      { key: string; aLabel: string; bLabel: string; rLabel: string }[]
    >('ch1', '2', 'cells')) ?? [],
  );

  readonly challengeComplete = computed(() => this.filledCells().length >= 8);

  pickFirst(op: GroupElement): void {
    this.firstOp.set(op);
    this.canvas()?.apply(op);
    // Phase transitions to 'pick-second' after animation completes
  }

  pickSecond(op: GroupElement): void {
    this.secondOp.set(op);
    this.canvas()?.apply(op);
    // Phase transitions to 'result' after animation completes
  }

  onAnimDone(): void {
    if (this.phase() === 'pick-first' && this.firstOp()) {
      this.phase.set('pick-second');
    } else if (this.phase() === 'pick-second' && this.secondOp()) {
      const a = this.firstOp()!;
      const b = this.secondOp()!;
      const result = this.d3.multiply(a, b);
      this.resultOp.set(result);
      this.phase.set('result');
      this.recordComposition(a, b, result);
    }
  }

  resetComposition(): void {
    this.phase.set('pick-first');
    this.firstOp.set(null);
    this.secondOp.set(null);
    this.resultOp.set(null);
    this.canvas()?.reset();
  }

  private recordComposition(
    a: GroupElement,
    b: GroupElement,
    result: GroupElement,
  ): void {
    const key = `${a.id}|${b.id}`;
    this.filledCells.update((cells) => {
      if (cells.some((c) => c.key === key)) return cells;
      const updated = [
        ...cells,
        { key, aLabel: a.label, bLabel: b.label, rLabel: result.label },
      ];
      return updated;
    });
    this.progress.saveStepData('ch1', '2', 'cells', this.filledCells());
    if (this.challengeComplete()) {
      this.progress.markCompleted('ch1', '2');
    }
  }
}

// Helper type for signal inference
type Signal<T> = { (): T };
