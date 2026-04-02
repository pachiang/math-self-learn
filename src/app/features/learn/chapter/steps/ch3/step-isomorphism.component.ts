import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';
import { createCyclicGroup } from '../../../../../core/math/groups/cyclic';

const COLORS = ['var(--v0)', 'var(--v1)', 'var(--v2)', 'var(--v3)'];

// Build quotient group D₃/{e,r,r²} manually as a 2-element "group"
interface MiniGroup { name: string; elements: string[]; table: number[][]; }

const Q_D3: MiniGroup = { name: 'D\u2083/H', elements: ['H', 'sH'], table: [[0,1],[1,0]] };
const G_Z2: MiniGroup = { name: 'Z\u2082', elements: ['0', '1'], table: [[0,1],[1,0]] };

// Rotation subgroup of D₃
const ROT3: MiniGroup = { name: '\u27E8r\u27E9', elements: ['e', 'r', 'r\u00B2'], table: [[0,1,2],[1,2,0],[2,0,1]] };
const G_Z3: MiniGroup = { name: 'Z\u2083', elements: ['0', '1', '2'], table: [[0,1,2],[1,2,0],[2,0,1]] };

// Klein four-group V₄ = {e, a, b, ab} where a²=b²=(ab)²=e
const V4: MiniGroup = {
  name: 'V\u2084',
  elements: ['e', 'a', 'b', 'ab'],
  table: [
    [0,1,2,3],
    [1,0,3,2],
    [2,3,0,1],
    [3,2,1,0],
  ],
};
// Z₂ × Z₂ with elements (0,0),(1,0),(0,1),(1,1)
const Z2xZ2: MiniGroup = {
  name: 'Z\u2082\u00D7Z\u2082',
  elements: ['(0,0)', '(1,0)', '(0,1)', '(1,1)'],
  table: [
    [0,1,2,3],
    [1,0,3,2],
    [2,3,0,1],
    [3,2,1,0],
  ],
};

interface Pair { left: MiniGroup; right: MiniGroup; isoMap: string[]; explanation: string; }

@Component({
  selector: 'app-step-isomorphism',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="同構：同一個群的不同面孔" subtitle="\u00A73.5">
      <p>
        同態允許「多對一」— 很多元素可以映射到同一個。
        但如果映射是<strong>一對一且映滿</strong>（雙射），那就特別了：
        兩個群的結構<strong>完全相同</strong>，只是元素的「名字」不一樣。
      </p>
      <p>
        這種雙射同態叫做<strong>同構</strong>（isomorphism），記作 \u2245。
        如果 G \u2245 G'，那 G 和 G' 本質上就是同一個群。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="比較兩組乘法表，找出結構完全相同的地方">
      <!-- Example selector -->
      <div class="example-selector">
        @for (p of pairs; track p.left.name; let i = $index) {
          <button class="ex-btn" [class.active]="selectedIdx() === i" (click)="selectedIdx.set(i)">
            {{ p.left.name }} \u2245 {{ p.right.name }}
          </button>
        }
      </div>

      <!-- Side by side Cayley tables -->
      <div class="side-by-side">
        @for (side of ['left', 'right']; track side) {
          <div class="table-panel">
            <div class="panel-name">{{ currentPair()[side === 'left' ? 'left' : 'right'].name }}</div>
            <table class="mini-cayley">
              <thead>
                <tr>
                  <th class="op">\u2218</th>
                  @for (el of currentPair()[side === 'left' ? 'left' : 'right'].elements; track el; let j = $index) {
                    <th [style.background]="COLORS[j % COLORS.length]" class="ch">{{ el }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (el of currentPair()[side === 'left' ? 'left' : 'right'].elements; track el; let i = $index) {
                  <tr>
                    <th [style.background]="COLORS[i % COLORS.length]" class="ch">{{ el }}</th>
                    @for (el2 of currentPair()[side === 'left' ? 'left' : 'right'].elements; track el2; let j = $index) {
                      <td [style.background]="COLORS[currentPair()[side === 'left' ? 'left' : 'right'].table[i][j] % COLORS.length]" class="qcell">
                        {{ currentPair()[side === 'left' ? 'left' : 'right'].elements[currentPair()[side === 'left' ? 'left' : 'right'].table[i][j]] }}
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Mapping -->
      <div class="iso-map">
        <div class="iso-title">同構映射：</div>
        <div class="iso-arrows">
          @for (el of currentPair().left.elements; track el; let i = $index) {
            <span class="iso-pair">
              <span [style.color]="COLORS[i % COLORS.length]" class="iso-el">{{ el }}</span>
              \u2194
              <span [style.color]="COLORS[i % COLORS.length]" class="iso-el">{{ currentPair().isoMap[i] }}</span>
            </span>
          }
        </div>
      </div>

      <div class="explain-box">
        {{ currentPair().explanation }}
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        同構的意義：<strong>結構決定一切</strong>。
      </p>
      <p>
        如果兩個群同構，它們的所有代數性質都完全一樣 —
        相同的階、相同的子群結構、相同的交換性。
        唯一的差別就是元素叫什麼名字。
      </p>
      <p>
        就像一首歌可以用不同的語言唱：旋律（結構）不變，
        歌詞（元素名稱）不同。
      </p>
      <span class="hint">
        現在回頭看同態 \u03C6: D\u2083 \u2192 Z\u2082：它不是同構（不是一對一）。
        那些被「壓扁」的元素到底去了哪裡？這就是下一節的「核」要回答的問題。
      </span>
    </app-prose-block>
  `,
  styles: `
    .example-selector { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .ex-btn {
      padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 600; }
    }

    .side-by-side {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;
      @media (max-width: 500px) { grid-template-columns: 1fr; }
    }
    .table-panel { text-align: center; }
    .panel-name { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .mini-cayley { border-collapse: collapse; margin: 0 auto; }
    th, td { padding: 8px 14px; text-align: center; border: 1px solid var(--border); }
    .op { background: var(--accent-18) !important; color: var(--text); font-size: 16px; }
    .ch { color: white !important; font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    .qcell { color: white; font-size: 14px; font-weight: 600; font-family: 'JetBrains Mono', monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }

    .iso-map {
      display: flex; align-items: center; gap: 12px; padding: 10px 16px;
      background: var(--bg); border-radius: 8px; border: 1px solid var(--border);
      margin-bottom: 12px; flex-wrap: wrap;
    }
    .iso-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); flex-shrink: 0; }
    .iso-arrows { display: flex; gap: 16px; flex-wrap: wrap; }
    .iso-pair { font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .iso-el { font-weight: 700; }

    .explain-box {
      padding: 10px 14px; border-radius: 8px; font-size: 13px; color: var(--text-secondary);
      background: var(--accent-10); line-height: 1.6;
    }
  `,
})
export class StepIsomorphismComponent {
  readonly COLORS = COLORS;
  readonly selectedIdx = signal(0);

  readonly pairs: Pair[] = [
    {
      left: Q_D3, right: G_Z2,
      isoMap: ['0', '1'],
      explanation: 'D\u2083/\u007Be, r, r\u00B2\u007D 只有兩個元素：「旋轉類」和「翻轉類」。它的乘法表跟 Z\u2082 一模一樣 \u2014 所以它們同構。',
    },
    {
      left: ROT3, right: G_Z3,
      isoMap: ['0', '1', '2'],
      explanation: 'D\u2083 的旋轉子群 \u27E8r\u27E9 = \u007Be, r, r\u00B2\u007D 是一個三階循環群，跟 Z\u2083 的結構完全一樣。e\u21940, r\u21941, r\u00B2\u21942。',
    },
    {
      left: V4, right: Z2xZ2,
      isoMap: ['(0,0)', '(1,0)', '(0,1)', '(1,1)'],
      explanation: 'Klein 四元群 V\u2084 的每個非單位元素階都是 2（a\u00B2=b\u00B2=(ab)\u00B2=e）。它跟 Z\u2082\u00D7Z\u2082 同構，但\u300C不\u300D跟 Z\u2084 同構 \u2014 因為 Z\u2084 有 4 階元素，V\u2084 沒有。大小相同不代表同構！',
    },
  ];

  readonly currentPair = computed(() => this.pairs[this.selectedIdx()]);

}
