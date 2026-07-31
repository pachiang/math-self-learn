import { Component, signal } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';

type PathView = 'direct' | 'complement';

@Component({
  selector: 'app-prob-v2-complement-paths',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="prob-v2-lesson prob-v2-ch7">
      <header class="hero">
        <p class="eyebrow">Probability v2 · 7.2</p>
        <h2>「至少一次」有七種樣子；它的反面只有一種</h2>
        <p class="lede">
          <strong>補事件（complement）</strong>不是另一個問題，而是把同一個世界切成
          event 與「event 沒發生」兩塊。哪一塊比較規則，就從哪一塊進去。
        </p>
      </header>

      <section class="scene">
        <div class="path-prediction">
          <div>
            <p class="eyebrow">先預測 · 三次嘗試</p>
            <h3>每次不是 success（S）就是 failure（F）。至少一次 success 包含幾條 paths？</h3>
          </div>
          <div class="choice-row" role="group" aria-label="預測至少一次成功包含幾條路徑">
            @for (choice of [3, 7, 8]; track choice) {
              <button
                type="button"
                [class.selected]="prediction() === choice"
                (click)="prediction.set(choice)"
              >
                {{ choice }} 條
              </button>
            }
          </div>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" aria-live="polite">
            @if (prediction() === 7) {
              <strong>對，是 7 條。</strong>除了 FFF 之外，每條完整 path 都至少含一個 S。
            } @else if (prediction() === 3) {
              3 只是在數 S 可以出現的「位置數」；但每個位置旁邊還有其他 S/F
              組合，因此不是完整 paths 的數量。
            } @else {
              8 是整個 sample space；其中 FFF 沒有任何 success，不能算進 event。
            }
          </p>
        }
      </section>

      <section>
        <div class="scene-heading">
          <div>
            <p class="eyebrow">Same world · two entrances</p>
            <h3>切換視角，世界本身沒有改變</h3>
          </div>
          <div class="preset-row" role="group" aria-label="切換直接與補事件視角">
            <button
              type="button"
              [class.active]="view() === 'direct'"
              (click)="view.set('direct')"
            >
              直接圈 event
            </button>
            <button
              type="button"
              [class.active]="view() === 'complement'"
              (click)="view.set('complement')"
            >
              改圈 complement
            </button>
          </div>
        </div>

        <div class="binary-world" aria-label="三次嘗試的八條完整路徑">
          @for (path of paths; track path) {
            <div
              class="binary-path"
              [class.selected]="view() === 'direct' && path.includes('S')"
              [class.complement-selected]="view() === 'complement' && path === 'FFF'"
            >
              <strong>{{ path }}</strong>
              <span>{{ path.includes('S') ? '至少一個 S' : '沒有 S' }}</span>
            </div>
          }
        </div>
      </section>

      <section class="selection-cost">
        <div class="cost-panel" [class.easier]="view() === 'complement'">
          <span>COMPLEMENT · EVENT 沒發生</span>
          <strong>只描述 FFF</strong>
          <p>「一次 success 都沒有」迫使三次全是 failure，只有一種 pattern。</p>
        </div>
        <div class="flip-map" aria-label="至少一次與完全沒有互為補事件">
          <div>
            <span>At least one success</span>
            <strong>7 條 paths</strong>
          </div>
          <i>剛好瓜分 Ω</i>
          <div>
            <span>No success</span>
            <strong>1 條 path</strong>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="flip-map" aria-hidden="true">
          <div>
            <span>Direct entrance</span>
            <strong>圈出 7 條</strong>
          </div>
          <i>flip the question</i>
          <div>
            <span>Complement entrance</span>
            <strong>先算唯一反面</strong>
          </div>
        </div>
        <div>
          <span class="card-label">Complement 是換入口，不是換問題</span>
          <p>
            <strong>兩邊合起來仍是同一個完整世界。</strong>
            當 event 有很多零散形狀、反面卻只有一個規則時，先量反面，再用整體扣掉它。
          </p>
        </div>
      </aside>

      <details class="deep-dive">
        <summary>公式層：為什麼可以用 1 減掉 complement？</summary>
        <div>
          <p>A 與它的 complement Aᶜ 不重疊，而且合起來是整個 sample space：</p>
          <div class="math-line">
            <app-math e="A\\cap A^c=\\varnothing,\\qquad A\\cup A^c=\\Omega" />
          </div>
          <div class="math-line">
            <app-math e="P(A)=1-P(A^c)" />
          </div>
          <p>
            若八條 paths 等可能，A =「至少一次 success」，則 Aᶜ 只包含 FFF，所以
            P(A)=1−1/8=7/8。下一節會把每條 path 不一定等重時的 probability 也放進來。
          </p>
        </div>
      </details>
    </article>
  `,
})
export class ProbV2ComplementPathsComponent {
  readonly paths = ['SSS', 'SSF', 'SFS', 'SFF', 'FSS', 'FSF', 'FFS', 'FFF'];
  readonly prediction = signal<number | null>(null);
  readonly view = signal<PathView>('direct');
}
