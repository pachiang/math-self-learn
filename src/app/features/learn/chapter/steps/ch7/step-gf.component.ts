import { Component, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { gfAdd, gfMul, zAdd, zMul } from './field-utils';

// GF(4) = Z₂[x]/(x²+x+1), elements as [a₀, a₁] representing a₀ + a₁α
const GF4_ELEMENTS = [[0,0],[1,0],[0,1],[1,1]]; // 0, 1, α, 1+α
const GF4_LABELS = ['0', '1', '\u03B1', '1+\u03B1'];
const GF4_IRRED = [1, 1, 1]; // x² + x + 1

@Component({
  selector: 'app-step-gf',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="有限域 GF(p\u207F)" subtitle="\u00A77.6">
      <p>
        有限域的大小只能是<strong>質數的冪</strong>：p, p\u00B2, p\u00B3, ...
        Z\u209A 是 p 元素的域。那 p\u00B2 元素的域呢？
      </p>
      <p>
        GF(p\u00B2) = Z\u209A[x]/(不可約二次多項式)。
        讓我們看看最小的非質數有限域：<strong>GF(4)</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="GF(4) 的完整加法和乘法表">
      <div class="info">
        GF(4) = Z\u2082[x]/(x\u00B2+x+1)，元素：0, 1, \u03B1, 1+\u03B1（其中 \u03B1\u00B2 = \u03B1 + 1）
      </div>

      <div class="tables">
        <div class="table-section">
          <div class="table-label">加法表</div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th class="corner">+</th>
                  @for (l of labels; track l) { <th>{{ l }}</th> }
                </tr>
              </thead>
              <tbody>
                @for (i of indices; track i) {
                  <tr>
                    <th>{{ labels[i] }}</th>
                    @for (j of indices; track j) {
                      <td>{{ addLabel(i, j) }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-section">
          <div class="table-label">乘法表</div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th class="corner">\u00D7</th>
                  @for (l of labels; track l) { <th>{{ l }}</th> }
                </tr>
              </thead>
              <tbody>
                @for (i of indices; track i) {
                  <tr>
                    <th>{{ labels[i] }}</th>
                    @for (j of indices; track j) {
                      <td [class.one]="mulLabel(i,j) === '1'">{{ mulLabel(i, j) }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="key-obs">
        <strong>注意：</strong>GF(4) 的加法不是 Z\u2084！
        在 GF(4) 裡 1+1 = 0（因為 Z\u2082 裡 1+1=0）。
        它的加法群是 Z\u2082 \u00D7 Z\u2082，不是 Z\u2084。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <div class="summary">
        <div class="sum-title">有限域的完整圖景</div>
        <div class="sum-facts">
          <div class="fact">\u2460 大小只能是 p\u207F（質數的冪）</div>
          <div class="fact">\u2461 同一大小的有限域<strong>唯一</strong>（同構意義下）</div>
          <div class="fact">\u2462 GF(p\u207F) = Z\u209A[x]/(n 次不可約多項式)</div>
          <div class="fact">\u2463 GF(p\u207F)* = GF(p\u207F) \u2216 {{ '{' }}0{{ '}' }} 的乘法群是循環群</div>
        </div>
      </div>
      <span class="hint">
        有限域的理論到此告一段落。域擴張和多項式的根，
        將在第八章——伽羅瓦理論——中發揮核心作用。
      </span>
    </app-prose-block>
  `,
  styles: `
    .info { font-size: 13px; color: var(--text-secondary); padding: 10px 14px; background: var(--accent-10);
      border-radius: 8px; margin-bottom: 14px; font-family: 'JetBrains Mono', monospace; }
    .tables { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; @media(max-width:500px){grid-template-columns:1fr;} }
    .table-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 6px 8px; text-align: center; font-size: 13px; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); }
    th { background: var(--accent-10); color: var(--text-secondary); font-weight: 600; }
    .corner { background: var(--accent-18); }
    .one { background: rgba(90,138,90,0.12); font-weight: 700; color: #5a8a5a; }

    .key-obs { padding: 12px 16px; border-radius: 8px; background: var(--accent-10); border-left: 3px solid var(--accent);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6; strong { color: var(--text); } }

    .summary { padding: 16px; border: 2px solid var(--accent); border-radius: 12px; background: var(--accent-10); margin: 12px 0; }
    .sum-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 10px; text-align: center; }
    .sum-facts { display: flex; flex-direction: column; gap: 6px; }
    .fact { font-size: 13px; color: var(--text-secondary); padding: 6px 12px; background: var(--bg-surface);
      border-radius: 6px; border: 1px solid var(--border); strong { color: var(--text); } }
  `,
})
export class StepGfComponent {
  readonly labels = GF4_LABELS;
  readonly indices = [0, 1, 2, 3];

  private findLabel(el: number[]): string {
    const idx = GF4_ELEMENTS.findIndex(e => e[0] === el[0] && e[1] === el[1]);
    return idx >= 0 ? GF4_LABELS[idx] : '?';
  }

  addLabel(i: number, j: number): string {
    return this.findLabel(gfAdd(GF4_ELEMENTS[i], GF4_ELEMENTS[j], 2));
  }

  mulLabel(i: number, j: number): string {
    return this.findLabel(gfMul(GF4_ELEMENTS[i], GF4_ELEMENTS[j], GF4_IRRED, 2));
  }
}
