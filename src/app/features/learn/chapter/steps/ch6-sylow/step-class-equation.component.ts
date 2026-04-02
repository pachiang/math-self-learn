import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

@Component({
  selector: 'app-step-class-equation',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="類方程" subtitle="\u00A76.2">
      <p>群的大小 = 所有共軛類大小的總和。寫出來就是<strong>類方程</strong>：</p>
      <div class="formula">|G| = |Z(G)| + \u03A3 [G : C(x\u1D62)]</div>
      <p>其中求和跑過所有大小 > 1 的共軛類的代表元。</p>
    </app-prose-block>

    <app-challenge-card prompt="用 D\u2083 和 D\u2084 驗證類方程">
      <div class="group-select">
        @for (opt of groupOptions; track opt.id) {
          <button class="g-btn" [class.active]="sel() === opt.id"
            (click)="sel.set(opt.id)">{{ opt.label }}</button>
        }
      </div>

      <div class="equation-viz">
        <div class="eq-left">|G| = {{ groupSize() }}</div>
        <div class="eq-right">
          = {{ centerSize() }}
          @for (size of nonCentralSizes(); track $index) {
            + {{ size }}
          }
        </div>
      </div>

      <div class="breakdown">
        <div class="bd-row center-row">
          <span class="bd-label">Z(G)：大小 1 的共軛類</span>
          <span class="bd-count">{{ centerSize() }} 個</span>
        </div>
        @for (cls of nonCentralClasses(); track $index; let i = $index) {
          <div class="bd-row">
            <span class="bd-label">
              共軛類 {{ '{' }}{{ cls.map(e => e.label).join(', ') }}{{ '}' }}
            </span>
            <span class="bd-count">{{ cls.length }} 個</span>
          </div>
        }
        <div class="bd-row total-row">
          <span class="bd-label">總計</span>
          <span class="bd-count">{{ groupSize() }} \u2713</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>類方程看起來簡單，但它極其強大。關鍵洞察：</p>
      <div class="insight">
        如果 |G| = p\u207F（p 的冪），那類方程裡<strong>每一項都被 p 整除</strong>
        \u2014 包括 |Z(G)|。所以 |Z(G)| \u2265 p > 1。
        <br/><strong>p-群的中心一定非平凡！</strong>
      </div>
      <span class="hint">這個看似技術性的結論，是 Sylow 定理的基石。下一節見。</span>
    </app-prose-block>
  `,
  styles: `
    .formula { padding: 14px; text-align: center; font-size: 17px; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--accent-10); border: 2px solid var(--accent); border-radius: 10px; margin: 10px 0; }
    .group-select { display: flex; gap: 8px; margin-bottom: 14px; }
    .g-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 600; } }
    .equation-viz { display: flex; gap: 12px; align-items: center; font-size: 18px;
      font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--text);
      padding: 12px 16px; background: var(--bg); border-radius: 8px; border: 1px solid var(--border); margin-bottom: 12px; }
    .eq-left { color: var(--accent); }
    .breakdown { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .bd-row { display: flex; justify-content: space-between; padding: 6px 14px;
      font-size: 13px; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.center-row { background: rgba(90,138,90,0.05); }
      &.total-row { background: var(--accent-10); font-weight: 700; } }
    .bd-label { color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .bd-count { color: var(--text); font-weight: 600; }
    .insight { padding: 14px 18px; border-radius: 10px; background: var(--accent-10); border: 2px solid var(--accent-30);
      font-size: 13px; color: var(--text-secondary); line-height: 1.7; text-align: center;
      strong { color: var(--text); } }
  `,
})
export class StepClassEquationComponent {
  private d3 = createDihedralGroup(3);
  private d4 = createDihedralGroup(4);
  readonly groupOptions = [
    { id: 'd3', label: 'D\u2083', group: this.d3 },
    { id: 'd4', label: 'D\u2084', group: this.d4 },
  ];
  readonly sel = signal('d3');
  private g = computed(() => this.groupOptions.find(o => o.id === this.sel())!.group);
  readonly groupSize = computed(() => this.g().elements.length);

  private classes = computed(() => {
    const g = this.g(); const assigned = new Set<string>(); const result: GroupElement[][] = [];
    for (const a of g.elements) {
      if (assigned.has(a.id)) continue;
      const cls: GroupElement[] = []; const seen = new Set<string>();
      for (const x of g.elements) {
        const conj = g.multiply(g.multiply(x, a), g.inverse(x));
        if (!seen.has(conj.id)) { seen.add(conj.id); cls.push(conj); }
      }
      cls.forEach(e => assigned.add(e.id)); result.push(cls);
    }
    return result;
  });

  readonly centerSize = computed(() => this.classes().filter(c => c.length === 1).length);
  readonly nonCentralClasses = computed(() => this.classes().filter(c => c.length > 1));
  readonly nonCentralSizes = computed(() => this.nonCentralClasses().map(c => c.length));
}
