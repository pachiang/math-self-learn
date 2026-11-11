import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import { euler, squarestPair } from './ch1-numbers';

type Phase = 'ask' | 'run' | 'predict' | 'reveal';

const SHOWCASE = [
  { n: 40, note: '剛好排成正方形' },
  { n: 41, note: '' },
  { n: 44, note: '跟 41 無關的失敗' },
];

@Component({
  selector: 'app-pf-fortieth',
  standalone: true,
  styleUrl: './scene-fortieth.component.scss',
  template: `
    <section class="pf-scene">
      <div class="pf-col">
        <p class="pf-kicker">2 / 4 · 第四十個數</p>
        <h1 class="pf-title">要看到幾個例子，<br />你才會相信？</h1>

        <div class="pf-slip">
          <small>陳述</small>
          <p>對每個 n = 0, 1, 2, 3, …，<br /><span class="pf-num">n² + n + 41</span> 都是質數。</p>
          @if (phase() === 'reveal') {
            <div class="pf-seal refuted stamp">推翻<span>反例：n = 40</span></div>
          } @else {
            <div class="pf-seal open">未定</div>
          }
        </div>

        @switch (phase()) {
          @case ('ask') {
            <p class="pf-lede">
              機器會從 n = 0 開始一個一個檢查。在它開始之前，先決定：<b>連續成功幾個</b>，你就願意相信這句話？
            </p>
            <div class="pf-row" role="group" aria-label="選擇你的門檻">
              @for (t of presets; track t) {
                <button type="button" class="pf-btn" [class.picked]="threshold() === t" (click)="threshold.set(t)">
                  {{ t }} 個
                </button>
              }
              <label class="custom">
                或
                <input
                  class="pf-input small"
                  inputmode="numeric"
                  aria-label="自訂門檻"
                  [value]="draft()"
                  (input)="setDraft($any($event.target).value)"
                />
                個
              </label>
            </div>
            <div class="pf-row">
              <button type="button" class="pf-btn primary" [disabled]="!threshold()" (click)="run()">開始檢查</button>
            </div>
          }
          @case ('run') {
            <p class="pf-q">檢查中……</p>
          }
          @case ('predict') {
            <p class="pf-feedback you">
              連續 40 個都是質數。你的門檻是 {{ threshold() }} 個，在 n = {{ believedAt() }} 的時候就已經相信了。
            </p>
            <p class="pf-q">n = 40：<span class="pf-num">40² + 40 + 41 = 1681</span>。<br />它是質數嗎？</p>
            <div class="pf-row">
              <button type="button" class="pf-btn" (click)="predict('prime')">是質數</button>
              <button type="button" class="pf-btn" (click)="predict('composite')">不是</button>
            </div>
          }
          @case ('reveal') {
            <p class="pf-feedback bad" role="status">
              <b class="pf-num">1681 = 41 × 41</b>。
              @if (guess() === 'composite') {
                你猜對了，但「猜」也只是猜。你憑的是上一幕的經驗，不是理由。
              } @else {
                40 個成功，換來的是第 41 個檢查失敗。
              }
            </p>
            <p class="pf-p">
              一個數是質數，代表它的點<b>排不成</b>長方形（只排成一列不算）。右邊把 1681 個點排了出來。
            </p>
            <div class="pf-row" role="group" aria-label="看其他失敗">
              @for (s of showcase; track s.n) {
                <button type="button" class="pf-btn ghost" [class.picked]="shown() === s.n" (click)="shown.set(s.n)">
                  n = {{ s.n }}
                </button>
              }
            </div>
            <details class="pf-why">
              <summary>為什麼偏偏是 40？</summary>
              <div>
                <p>n² + n + 41 = n(n + 1) + 41。當 n = 40 時，變成 40 · 41 + 41 = 41 · 41。</p>
                <p>這個理由一眼就說明了為什麼會失敗。而前面 40 個成功，沒有一個能告訴你它會在哪裡停下來。</p>
              </div>
            </details>
          }
        }

        @if (phase() === 'reveal') {
          <div class="wall">
            <p class="pf-q">那麼，多少個才算「夠多」？</p>
            <svg viewBox="0 0 520 96" role="img" aria-label="規律第一次失敗的位置：6、40、906,150,257">
              <line x1="16" y1="48" x2="504" y2="48" class="axis" />
              @for (t of ticks; track t.label) {
                <line [attr.x1]="t.x" y1="42" [attr.x2]="t.x" y2="54" class="tick" />
                <text [attr.x]="t.x" y="74" class="tick-label">{{ t.label }}</text>
              }
              @for (m of marks; track m.label) {
                <circle [attr.cx]="m.x" cy="48" r="7" class="mark" />
                <text [attr.x]="m.x" [attr.y]="m.y" class="mark-label">{{ m.label }}</text>
              }
            </svg>
            <p class="pf-note">
              這條軸用的是對數刻度。有一個關於質因數個數的猜想（Pólya 猜想），第一個反例出現在 906,150,257。在那之前的九億多個數，全都乖乖成立。
            </p>
          </div>

          <div class="pf-takeaway reveal">
            <small>帶走這一句</small>
            <p>四十個成功，只證明了那四十個。<br />例子能提高信心，但改變不了邏輯狀態。</p>
          </div>
        }
      </div>

      <div class="stage pf-panel">
        @if (phase() !== 'reveal') {
          <div class="meters" aria-live="polite">
            <div class="meter">
              <small>你的信心</small>
              <div class="bar" aria-hidden="true">
                <i [style.width.%]="confidencePct()"></i>
              </div>
              <span>{{ confidenceText() }}</span>
            </div>
            <div class="meter">
              <small>邏輯狀態</small>
              <div class="status">未定</div>
              <span>看了 {{ checked() }} 個例子，它一格也沒動</span>
            </div>
          </div>

          <ol class="cells" aria-label="n = 0 到 39 的檢查結果">
            @for (c of cells; track c.n) {
              <li
                [class.on]="c.n < checked()"
                [class.believe]="threshold() && c.n === (threshold() ?? 0) - 1 && c.n < checked()"
              >
                <small>n = {{ c.n }}</small>
                <span class="pf-num">{{ c.n < checked() ? c.v : '·' }}</span>
                <i aria-hidden="true">✓</i>
                @if (threshold() && c.n === (threshold() ?? 0) - 1 && c.n < checked()) {
                  <em>你在這裡相信了</em>
                }
              </li>
            }
            <li class="next" [class.on]="phase() === 'predict'">
              <small>n = 40</small>
              <span class="pf-num">?</span>
            </li>
          </ol>
        } @else {
          <figure class="dots">
            <svg [attr.viewBox]="'0 0 ' + grid().w + ' ' + grid().h" role="img" [attr.aria-label]="grid().value + ' 個點排成 ' + grid().rows + ' × ' + grid().cols">
              @for (d of grid().dots; track $index) {
                <circle [attr.cx]="d.x" [attr.cy]="d.y" [attr.r]="grid().r" />
              }
            </svg>
            <figcaption>
              <span class="pf-num">n = {{ shown() }} → {{ grid().value }} = {{ grid().rows }} × {{ grid().cols }}</span>
              @if (shownNote()) {
                <small>{{ shownNote() }}</small>
              }
            </figcaption>
          </figure>
        }
      </div>
    </section>
  `,
})
export class SceneFortiethComponent implements OnDestroy {
  private readonly progress = inject(LearnProgressService);
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly presets = [3, 5, 10, 20];
  readonly showcase = SHOWCASE;
  readonly cells = Array.from({ length: 40 }, (_, n) => ({ n, v: euler(n) }));

  readonly phase = signal<Phase>('ask');
  readonly threshold = signal<number | null>(null);
  readonly draft = signal('');
  readonly checked = signal(0);
  readonly guess = signal<'prime' | 'composite' | null>(null);
  readonly shown = signal(40);

  readonly believedAt = computed(() => Math.max(0, (this.threshold() ?? 1) - 1));
  readonly confidencePct = computed(() => {
    const t = this.threshold();
    if (!t) return 0;
    return Math.min(100, (this.checked() / t) * 100);
  });
  readonly confidenceText = computed(() => {
    const t = this.threshold();
    if (!t) return '先選一個門檻';
    const k = this.checked();
    return k >= t ? `相信了（${t} 個成功）` : `觀察中：${k} / ${t}`;
  });

  readonly shownNote = computed(() => SHOWCASE.find((s) => s.n === this.shown())?.note ?? '');

  readonly grid = computed(() => {
    const value = euler(this.shown());
    const [rows, cols] = squarestPair(value);
    const gap = 10;
    const dots: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) dots.push({ x: gap / 2 + c * gap, y: gap / 2 + r * gap });
    }
    return { value, rows, cols, dots, w: cols * gap, h: rows * gap, r: gap * 0.34 };
  });

  // Log-scale wall: x = 16 + 488 · log10(v) / 9
  private readonly x = (v: number) => 16 + (488 * Math.log10(v)) / 9;
  readonly ticks = [1, 1e3, 1e6, 1e9].map((v) => ({
    x: this.x(v),
    label: v === 1 ? '1' : v === 1e3 ? '1 千' : v === 1e6 ? '1 百萬' : '10 億',
  }));
  readonly marks = [
    { v: 6, label: '6（圓）', y: 28 },
    { v: 40, label: '40（本題）', y: 10 },
    { v: 906150257, label: '906,150,257', y: 28 },
  ].map((m) => ({ x: this.x(m.v), label: m.label, y: m.y }));

  setDraft(v: string): void {
    this.draft.set(v);
    const n = Number(v.trim());
    if (Number.isInteger(n) && n >= 1 && n <= 40) this.threshold.set(n);
  }

  run(): void {
    if (!this.threshold()) return;
    this.phase.set('run');
    if (this.reduced) {
      this.checked.set(40);
      this.phase.set('predict');
      return;
    }
    this.timer = setInterval(() => {
      const next = this.checked() + 1;
      this.checked.set(next);
      if (next >= 40) {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.phase.set('predict');
      }
    }, 95);
  }

  predict(g: 'prime' | 'composite'): void {
    this.guess.set(g);
    this.phase.set('reveal');
    this.progress.markCompleted('proofs-ch1', '2');
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
