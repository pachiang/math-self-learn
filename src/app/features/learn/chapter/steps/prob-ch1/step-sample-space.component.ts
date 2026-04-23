import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-prob-ch1-sample-space',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="樣本空間、事件、機率" subtitle="§1.2">
      <p>
        機率論的三件套：
      </p>
      <div class="triple">
        <div class="triple-cell">
          <div class="tc-name">樣本空間 Ω</div>
          <p>實驗<strong>所有可能結果</strong>的集合。擲骰 Ω = [1,2,3,4,5,6]；擲兩顆骰 Ω 有 36 個元素。</p>
        </div>
        <div class="triple-cell">
          <div class="tc-name">事件 A</div>
          <p>結果的<strong>子集</strong>。「兩骰之和 ≥ 10」是事件 A = [(4,6),(5,5),(5,6),(6,4),(6,5),(6,6)]，有 6 個元素。</p>
        </div>
        <div class="triple-cell">
          <div class="tc-name">機率 P</div>
          <p>把事件映射到 [0,1]，滿足三條<strong>Kolmogorov 公理</strong>。</p>
        </div>
      </div>

      <h4>Kolmogorov 三公理</h4>
      <ol class="axioms">
        <li><strong>非負</strong>：P(A) ≥ 0。</li>
        <li><strong>歸一</strong>：P(Ω) = 1。</li>
        <li><strong>可加</strong>：若 A₁, A₂, … 兩兩互斥，則 <code>P(∪Aᵢ) = ΣP(Aᵢ)</code>。</li>
      </ol>

      <p class="key-idea">
        就這三條——整個機率論全部從它們導出。
        有限情況下第 3 條是普通和，可數無限時叫<strong>σ-可加性</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="擲兩顆骰：看事件如何對應到 6×6 格子">
      <div class="dice-grid">
        <div class="labels"></div>
        @for (j of [1,2,3,4,5,6]; track j) {
          <div class="labels">{{ j }}</div>
        }
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="labels">{{ i }}</div>
          @for (j of [1,2,3,4,5,6]; track j) {
            <div class="dcell"
              [class.in]="inEvent(i, j)"
              [title]="i + ', ' + j">
              {{ i + j }}
            </div>
          }
        }
      </div>

      <div class="event-selector">
        <span class="es-lab">事件：</span>
        @for (e of events; track e.id) {
          <button class="pill" [class.active]="evId() === e.id" (click)="evId.set(e.id)">{{ e.name }}</button>
        }
      </div>

      <div class="count-display">
        <div class="cd-row">
          <span>事件大小 |A|：</span>
          <span class="cd-val">{{ eventSize() }}</span>
        </div>
        <div class="cd-row">
          <span>|Ω|：</span>
          <span class="cd-val">36</span>
        </div>
        <div class="cd-row big">
          <span>P(A) = |A| / |Ω| = </span>
          <span class="cd-val">{{ eventSize() }} / 36 = {{ (eventSize() / 36).toFixed(4) }}</span>
        </div>
      </div>

      <p class="note">
        這是<strong>古典機率</strong>的威力：當所有結果等機率，機率 = 有利結果數 / 全部結果數。
        但注意——這假設「等機率」成立。若骰子有偏，這個公式就錯了。
      </p>
    </app-challenge-card>

    <app-prose-block>
      <h4>從公理推出的實用規則</h4>
      <div class="rules">
        <div class="rule">
          <div class="rule-name">補集</div>
          <code>P(A^c) = 1 − P(A)</code>
          <p>事件 A 不發生的機率 = 1 減去發生。</p>
        </div>
        <div class="rule">
          <div class="rule-name">包含排斥</div>
          <code>P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</code>
          <p>兩事件聯集：各自相加，扣掉重複的交集。</p>
        </div>
        <div class="rule">
          <div class="rule-name">單調性</div>
          <code>A ⊆ B ⇒ P(A) ≤ P(B)</code>
          <p>更大事件機率更大。</p>
        </div>
        <div class="rule">
          <div class="rule-name">Boole 不等式</div>
          <code>P(∪Aᵢ) ≤ ΣP(Aᵢ)</code>
          <p>「聯集的機率」不超過「各自機率的和」——永遠。</p>
        </div>
      </div>

      <h4>互斥 vs 獨立——別混了！</h4>
      <div class="vs-box">
        <div class="vs-cell">
          <div class="vs-name">互斥</div>
          <code>A ∩ B = ∅</code>
          <p>兩事件不能<strong>同時</strong>發生。P(A∩B) = 0。</p>
          <p class="vs-eg">例：「擲一骰得 1」與「擲一骰得 6」互斥。</p>
        </div>
        <div class="vs-cell">
          <div class="vs-name">獨立</div>
          <code>P(A∩B) = P(A)·P(B)</code>
          <p>發生一個<strong>不影響</strong>另一個的機率。下一章深入。</p>
          <p class="vs-eg">例：「第一擲得 1」與「第二擲得 6」獨立。</p>
        </div>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        三件套（Ω、事件、P）+ 三公理。所有機率都從這裡出發。
        下一節探索「等機率」如何幫助我們求解計數問題——組合學的入口。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }
    .key-idea { padding: 14px; background: var(--accent-10); border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0; font-size: 14px; margin: 12px 0; }

    .triple { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .triple-cell { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .tc-name { font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 13px; }
    .triple-cell p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .triple-cell strong { color: var(--accent); }

    .axioms { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.8; color: var(--text-secondary); }
    .axioms strong { color: var(--accent); }

    .dice-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
      max-width: 380px;
      margin: 10px auto;
    }
    .labels { display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .dcell {
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      background: var(--bg);
      color: var(--text-muted);
      transition: all 0.15s ease;
    }
    .dcell.in {
      background: var(--accent);
      color: white;
      font-weight: 700;
      border-color: var(--accent);
    }

    .event-selector { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin: 10px 0; }
    .es-lab { font-size: 12px; color: var(--text-muted); }
    .pill { font: inherit; font-size: 11px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .count-display { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .cd-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; color: var(--text-secondary); }
    .cd-row.big { border-top: 1px solid var(--border); margin-top: 6px; padding-top: 8px; font-weight: 700; color: var(--accent); }
    .cd-val { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 700; }

    .note { padding: 12px; background: var(--bg-surface); border-radius: 8px; margin-top: 10px; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    .note strong { color: var(--accent); }

    .rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .rule { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .rule-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
    .rule code { display: inline-block; margin-bottom: 4px; font-size: 12px; }
    .rule p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

    .vs-box { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
    @media (max-width: 640px) { .vs-box { grid-template-columns: 1fr; } }
    .vs-cell { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .vs-name { font-weight: 700; color: var(--accent); font-size: 14px; margin-bottom: 4px; }
    .vs-cell code { display: inline-block; margin-bottom: 4px; }
    .vs-cell p { margin: 3px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .vs-cell strong { color: var(--accent); }
    .vs-eg { font-style: italic; color: var(--text-muted) !important; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class ProbCh1SampleSpaceComponent {
  readonly events = [
    { id: 'sum10', name: '兩骰之和 ≥ 10' },
    { id: 'sum7', name: '兩骰之和 = 7' },
    { id: 'double', name: '雙骰相同' },
    { id: 'sum-even', name: '和為偶數' },
    { id: 'first-odd', name: '第一顆為奇' },
  ];
  readonly evId = signal('sum10');

  inEvent(i: number, j: number): boolean {
    const id = this.evId();
    if (id === 'sum10') return i + j >= 10;
    if (id === 'sum7') return i + j === 7;
    if (id === 'double') return i === j;
    if (id === 'sum-even') return (i + j) % 2 === 0;
    if (id === 'first-odd') return i % 2 === 1;
    return false;
  }

  readonly eventSize = computed(() => {
    let c = 0;
    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 6; j++) {
        if (this.inEvent(i, j)) c++;
      }
    }
    return c;
  });
}
