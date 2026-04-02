import { Component, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { GroupElement } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

@Component({
  selector: 'app-step-kernel',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="核：同態的心臟" subtitle="\u00A73.6">
      <p>
        同態 \u03C6: D\u2083 \u2192 Z\u2082 把 6 個元素壓成 2 個。
        那些被壓到<strong>單位元（0）</strong>的元素是哪些？
      </p>
      <p>
        這些被「壓扁」成單位元的元素，有一個名字：<strong>核</strong>（kernel），記作 ker(\u03C6)。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="找出 \u03C6 的核 \u2014 哪些元素被映射到 0？">
      <div class="kernel-viz">
        <div class="group-col">
          <div class="col-title">D\u2083</div>
          @for (el of d3.elements; track el.id) {
            <div class="el-row" [class.in-kernel]="isInKernel(el)" [class.not-kernel]="!isInKernel(el)">
              <span class="el-name">{{ el.label }}</span>
              <span class="el-arrow">\u2192</span>
              <span class="el-image" [class.zero]="isInKernel(el)" [class.one]="!isInKernel(el)">
                {{ phi(el) }}
              </span>
            </div>
          }
        </div>
      </div>

      <div class="kernel-result">
        <div class="kr-label">ker(\u03C6) =</div>
        <div class="kr-set">
          {{ '{' }}{{ kernelLabels() }}{{ '}' }}
        </div>
      </div>

      <div class="discovery">
        <strong>等等 \u2014 這不就是 {{ '{' }}e, r, r\u00B2{{ '}' }} 嗎？</strong>
        就是我們一直在用的正規子群 H！
      </div>
    </app-challenge-card>

    <app-prose-block title="核的性質">
      <div class="property-list">
        <div class="prop">
          <span class="prop-num">1</span>
          <div>
            <strong>核是子群</strong>：ker(\u03C6) 對乘法封閉，
            包含單位元，有逆元。
          </div>
        </div>
        <div class="prop">
          <span class="prop-num">2</span>
          <div>
            <strong>核是正規子群</strong>：對所有 g，g\u00B7ker(\u03C6)\u00B7g\u207B\u00B9 = ker(\u03C6)。
          </div>
        </div>
        <div class="prop">
          <span class="prop-num">3</span>
          <div>
            <strong>核 = 被壓扁的部分</strong>：核越大，壓縮越多，丟的資訊越多。
            <br/>核 = {{ '{' }}e{{ '}' }} 時，什麼都沒丟 \u2192 同構（一對一）。
          </div>
        </div>
      </div>

      <div class="connection-box">
        <div class="conn-title">三者的關係浮現了：</div>
        <div class="conn-chain">
          <span class="conn-item">同態 \u03C6</span>
          <span class="conn-arrow">\u2192</span>
          <span class="conn-item">核 ker(\u03C6) = 正規子群</span>
          <span class="conn-arrow">\u2192</span>
          <span class="conn-item">商群 G/ker(\u03C6)</span>
        </div>
      </div>

      <span class="hint">
        同態創造了正規子群（核），正規子群創造了商群。
        那商群跟同態的像（image）之間是什麼關係？
        \u2014 這就是下一節的第一同構定理，整章的高潮。
      </span>
    </app-prose-block>
  `,
  styles: `
    .kernel-viz {
      padding: 14px; background: var(--bg); border-radius: 10px;
      border: 1px solid var(--border); margin-bottom: 14px;
    }
    .col-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 10px; text-align: center; }
    .el-row {
      display: flex; align-items: center; gap: 12px; padding: 6px 12px;
      border-radius: 6px; margin-bottom: 3px; transition: all 0.2s;
      &.in-kernel { background: rgba(90,138,90,0.08); }
      &.not-kernel { opacity: 0.5; }
    }
    .el-name { font-size: 16px; font-weight: 600; font-family: 'Noto Sans Math', 'Cambria Math', serif; color: var(--text); min-width: 36px; }
    .el-arrow { color: var(--text-muted); }
    .el-image {
      font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      padding: 2px 12px; border-radius: 4px;
      &.zero { background: var(--v1); color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
      &.one { background: var(--v0); color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    }

    .kernel-result {
      display: flex; align-items: center; gap: 10px; padding: 12px 16px;
      background: rgba(90,138,90,0.08); border-radius: 8px; margin-bottom: 12px;
      border: 1px solid rgba(90,138,90,0.2);
    }
    .kr-label { font-size: 14px; font-weight: 600; color: #5a8a5a; }
    .kr-set { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }

    .discovery {
      padding: 12px 16px; border-radius: 8px; font-size: 14px;
      background: var(--accent-10); border-left: 3px solid var(--accent);
      color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); }
    }

    .property-list { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
    .prop {
      display: flex; gap: 12px; padding: 10px 14px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); }
    }
    .prop-num {
      display: flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border-radius: 50%;
      background: var(--accent-18); color: var(--accent);
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }

    .connection-box {
      padding: 16px; border: 2px solid var(--accent-30); border-radius: 12px;
      background: var(--accent-10); text-align: center; margin: 16px 0;
    }
    .conn-title { font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 10px; }
    .conn-chain { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .conn-item {
      padding: 6px 12px; border-radius: 6px; background: var(--bg-surface);
      font-size: 13px; font-weight: 600; color: var(--text);
      border: 1px solid var(--border);
    }
    .conn-arrow { font-size: 16px; color: var(--accent); }
  `,
})
export class StepKernelComponent {
  readonly d3 = createDihedralGroup(3);

  isInKernel(el: GroupElement): boolean {
    return el.id.startsWith('r'); // rotations map to 0
  }

  phi(el: GroupElement): string {
    return this.isInKernel(el) ? '0' : '1';
  }

  readonly kernelLabels = computed(() =>
    this.d3.elements
      .filter((e) => this.isInKernel(e))
      .map((e) => e.label)
      .join(', '),
  );
}
