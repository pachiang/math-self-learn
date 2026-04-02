import { Component, computed, inject, signal } from '@angular/core';
import { ProseBlockComponent } from '../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../shared/challenge-card/challenge-card.component';
import { GuidedCanvasComponent } from '../../shared/guided-canvas/guided-canvas.component';
import { GroupElement, Group } from '../../../../core/math/group';
import { createDihedralGroup } from '../../../../core/math/groups/dihedral';
import { LearnProgressService } from '../../../../core/services/learn-progress.service';

@Component({
  selector: 'app-step-symmetry',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, GuidedCanvasComponent],
  template: `
    <app-prose-block title="對稱是什麼？" subtitle="§1.1">
      <p>
        想像你手上有一個正三角形的紙片。你可以怎樣移動它，
        讓它放回桌上後，看起來跟<strong>沒動過一模一樣</strong>？
      </p>
      <p>
        注意：三角形的三個角分別標了 <strong>0、1、2</strong>
        三種顏色。如果你旋轉或翻轉三角形，顏色的位置會改變
        — 這就是我們追蹤「到底動了什麼」的方式。
      </p>
      <span class="hint">
        提示：可以轉（旋轉），也可以翻（鏡射）。包含「什麼都不做」也算一種！
      </span>
    </app-prose-block>

    <app-challenge-card
      prompt="找出所有 6 個讓三角形「回到原位」的方法"
      [completed]="allDiscovered()"
    >
      <app-guided-canvas
        [group]="d3"
        [highlightedOps]="discovered()"
        (operationCompleted)="onDiscover($event)"
      />

      <div class="discovery-grid">
        <div class="discovery-header">
          已發現 {{ discovered().size }} / {{ total }} 個操作
        </div>
        <div class="discovery-items">
          @for (op of allOps; track op.id) {
            <div class="discovery-item" [class.found]="discovered().has(op.id)">
              <span class="op-name">
                {{ discovered().has(op.id) ? op.label : '？' }}
              </span>
              <span class="op-desc">
                {{ discovered().has(op.id) ? describeOp(op) : '未發現' }}
              </span>
            </div>
          }
        </div>
      </div>
    </app-challenge-card>

    @if (allDiscovered()) {
      <app-prose-block>
        <p>
          太好了！你找到了全部 <strong>6 個</strong>對稱操作：
          3 個<strong>旋轉</strong>（包含「不動」= 旋轉 0°）和
          3 個<strong>翻轉</strong>（鏡射）。
        </p>
        <p>
          這 6 個操作組成的集合，就是正三角形的<strong>對稱</strong>。
          在數學裡，我們把它記作 <strong>D₃</strong>。
        </p>
        <p>
          接下來，我們要問一個有趣的問題：如果連續做兩個操作，會發生什麼事？
        </p>
      </app-prose-block>
    }
  `,
  styles: `
    .discovery-grid {
      margin-top: 16px;
    }

    .discovery-header {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }

    .discovery-items {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .discovery-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 8px;
      border: 1px dashed var(--border-strong);
      border-radius: 8px;
      background: var(--bg);
      transition: all 0.3s ease;

      &.found {
        border-style: solid;
        border-color: var(--accent-30);
        background: var(--accent-10);
      }
    }

    .op-name {
      font-size: 18px;
      font-family: 'Noto Sans Math', 'Cambria Math', serif;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 2px;
    }

    .op-desc {
      font-size: 11px;
      color: var(--text-muted);
    }
  `,
})
export class StepSymmetryComponent {
  private readonly progress = inject(LearnProgressService);

  readonly d3: Group = createDihedralGroup(3);
  readonly allOps: GroupElement[] = this.d3.elements;
  readonly total = this.allOps.length;

  readonly discovered = signal<Set<string>>(
    new Set(
      this.progress.getStepData<string[]>('ch1', '1', 'discovered') ?? [],
    ),
  );

  readonly allDiscovered = computed(() => this.discovered().size >= this.total);

  onDiscover(op: GroupElement): void {
    this.discovered.update((s) => {
      if (s.has(op.id)) return s;
      const next = new Set(s);
      next.add(op.id);
      return next;
    });
    this.progress.saveStepData('ch1', '1', 'discovered', [
      ...this.discovered(),
    ]);
    if (this.allDiscovered()) {
      this.progress.markCompleted('ch1', '1');
    }
  }

  describeOp(op: GroupElement): string {
    if (op.id === 'r0') return '不動';
    if (op.id === 'r1') return '旋轉 120°';
    if (op.id === 'r2') return '旋轉 240°';
    if (op.id === 'sr0') return '翻轉 ↕';
    if (op.id === 'sr1') return '翻轉 ↗';
    if (op.id === 'sr2') return '翻轉 ↖';
    return op.id;
  }
}
