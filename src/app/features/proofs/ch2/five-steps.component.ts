import { Component, computed, signal } from '@angular/core';

interface Step {
  n: number;
  name: string;
  ex: string;
  kind?: 'got' | 'made';
}

const STEPS: Step[] = [
  { n: 1, name: '寫下已知和目標', ex: '已知：x 是偶數　目標：x + 6 是偶數' },
  { n: 2, name: '展開已知：寫下你拿到什麼，取新名字', ex: '整數 k，x = 2k', kind: 'got' },
  { n: 3, name: '展開目標：寫下你要造什麼', ex: '要找整數 □，使 x + 6 = 2 × □', kind: 'made' },
  { n: 4, name: '接起來：用已知改寫，整理成目標要的形狀', ex: 'x + 6 = 2k + 6 = 2 × (k + 3)' },
  { n: 5, name: '檢查附加條件，寫結論', ex: 'k + 3 是整數，所以 x + 6 是偶數' },
];

/** End-of-chapter preview of the routine Ch6–7 formalise: only step 4 needs an idea. */
@Component({
  selector: 'app-pf-five-steps',
  standalone: true,
  styleUrl: './five-steps.component.scss',
  template: `
    <section class="card pf-rise" aria-labelledby="pf-five-title">
      <small class="eyebrow">預告 · 第 6、7 章會正式練</small>
      <h2 id="pf-five-title">這一章你其實一直在走同一套五步。</h2>
      <p class="lead">拿第 3 幕的「已知 x 是偶數，證 x + 6 是偶數」來看：</p>

      <ol>
        @for (s of steps; track s.n) {
          <li [class.think]="picked() !== null && s.n === 4">
            <span class="num">{{ s.n }}</span>
            <div class="body">
              <div class="name">
                {{ s.name }}
                @if (picked() !== null) {
                  <span class="tag" [class.idea]="s.n === 4">{{ s.n === 4 ? '要想' : '照定義' }}</span>
                }
              </div>
              <div class="ex" [class.got]="s.kind === 'got'" [class.made]="s.kind === 'made'">{{ s.ex }}</div>
              @if (picked() !== null && s.n === 4) {
                <p class="tip">也有方向：第 3 步已經說了終點長怎樣（2 × □）。把 x 換成 2k 之後，要做的就是把 2 提出來。</p>
              }
            </div>
          </li>
        }
      </ol>

      <div class="ask">
        <p class="q">這五步裡，哪一步真的需要想？</p>
        <div class="pf-row">
          @for (s of steps; track s.n) {
            <button type="button" class="pf-btn small" [class.picked]="picked() === s.n" [disabled]="picked() !== null" (click)="picked.set(s.n)">第 {{ s.n }} 步</button>
          }
        </div>
        @if (picked(); as p) {
          <p class="pf-feedback" [class.good]="p === 4" [class.you]="p !== 4" role="status">{{ feedback() }}</p>
          <p class="pf-note">
            第 4 幕的兩個奇數，第 2 步要展開兩次，所以要兩個名字；這一幕的 r / 2，第 5 步多檢查一個條件 q ≠ 0。步驟本身沒變。
          </p>
        }
      </div>
    </section>
  `,
})
export class FiveStepsComponent {
  readonly steps = STEPS;
  readonly picked = signal<number | null>(null);

  readonly feedback = computed(() =>
    this.picked() === 4
      ? '對。1、2、3、5 都是照著定義抄下來；只有第 4 步要想怎麼接。'
      : `第 ${this.picked()} 步只是照著定義抄下來，不用想。真正要想的是第 4 步：怎麼把左邊整理成目標要的形狀。`,
  );
}
