import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';
import {
  BASE_ANGLES,
  Pt,
  SUGGESTED_SIXTH,
  angleGapOk,
  buildArrangement,
  polyPath,
} from './ch1-chords';

type Phase = 'bet' | 'place' | 'count' | 'done';

@Component({
  selector: 'app-pf-sixth-point',
  standalone: true,
  styleUrl: './scene-sixth-point.component.scss',
  template: `
    <section class="pf-scene">
      <div class="pf-col">
        <p class="pf-kicker">1 / 4 · 第六個點</p>
        <h1 class="pf-title">圓上放幾個點、<br />全部兩兩連線，<br />能切出幾塊？</h1>

        <ol class="strip" aria-label="前五個例子">
          @for (m of minis; track m.n) {
            <li>
              <span class="strip-n">{{ m.n }} 點</span>
              <svg viewBox="-1.18 -1.18 2.36 2.36" aria-hidden="true">
                <circle r="1" class="m-rim" />
                @for (c of m.arr.chords; track $index) {
                  <line [attr.x1]="c[0].x" [attr.y1]="c[0].y" [attr.x2]="c[1].x" [attr.y2]="c[1].y" class="m-chord" />
                }
                @for (p of m.arr.points; track $index) {
                  <circle [attr.cx]="p.x" [attr.cy]="p.y" r="0.11" class="m-pt" />
                }
              </svg>
              <span class="strip-count pf-num">{{ m.arr.regions.length }}</span>
            </li>
          }
          <li class="slot" [class.has-bet]="bet() !== null" [class.revealed]="phase() === 'done'">
            <span class="strip-n">6 點</span>
            @if (phase() === 'done') {
              <svg viewBox="-1.18 -1.18 2.36 2.36" aria-hidden="true">
                <circle r="1" class="m-rim red" />
                @for (c of arr().chords; track $index) {
                  <line [attr.x1]="c[0].x" [attr.y1]="c[0].y" [attr.x2]="c[1].x" [attr.y2]="c[1].y" class="m-chord" />
                }
                @for (p of arr().points; track $index) {
                  <circle [attr.cx]="p.x" [attr.cy]="p.y" r="0.11" class="m-pt" />
                }
              </svg>
            } @else {
              <span class="slot-ring" aria-hidden="true">?</span>
            }
            <span class="strip-count pf-num">
              @if (phase() === 'done') {
                @if (bet() !== 31) {
                  <s>{{ bet() }}</s>
                }
                <em>{{ regionCount() }}</em>
              } @else {
                {{ bet() ?? '　' }}
              }
            </span>
          </li>
        </ol>

        @switch (phase()) {
          @case ('bet') {
            <p class="pf-lede">
              任三條線都不交在同一點。前五個依序是
              <span class="pf-num">1、2、4、8、16</span> 塊。
            </p>
            <form class="pf-col tight" (submit)="placeBet($event)">
              <label class="pf-q" for="pf-bet">6 個點會切出幾塊？先寫下你的答案。</label>
              <div class="pf-row">
                <input
                  id="pf-bet"
                  class="pf-input"
                  inputmode="numeric"
                  autocomplete="off"
                  [value]="betDraft()"
                  (input)="betDraft.set($any($event.target).value)"
                  aria-describedby="pf-bet-hint"
                />
                <button class="pf-btn primary" type="submit" [disabled]="!validBet()">寫下了</button>
              </div>
              <p class="pf-note" id="pf-bet-hint">寫下來再看答案。一個寫下來的猜測，才有辦法被推翻。</p>
            </form>
          }
          @case ('place') {
            <p class="pf-feedback you">你寫下 <b class="pf-num">{{ bet() }}</b> 塊。現在親手驗證。</p>
            <p class="pf-q">在右邊的圓周上點一下，放下第六個點。</p>
            <div class="pf-row">
              <button class="pf-btn ghost" type="button" (click)="tryPlace(suggested)">替我放一個</button>
            </div>
            @if (message()) {
              <p class="pf-note" role="status">{{ message() }}</p>
            }
          }
          @case ('count') {
            <p class="pf-q">一塊一塊數……</p>
            <p class="pf-note">右邊正在把每一塊編號。</p>
          }
          @case ('done') {
            <p class="pf-feedback" [class.bad]="bet() !== 31" [class.good]="bet() === 31" role="status">
              @if (bet() === 31) {
                你寫的就是 31。你也許聽過這題，也許只是沒有相信加倍。不管是哪一種，光看前五個例子，都無法確定第六個。
              } @else {
                你寫下 <b class="pf-num">{{ bet() }}</b>，實際是 <b class="pf-num">31</b>。前五個例子都很聽話，第六個沒有。
              }
            </p>

            <div class="pf-slip">
              <small>陳述</small>
              <p>每多一個點，塊數就加倍。</p>
              <div class="pf-seal refuted stamp">推翻<span>反例：6 點</span></div>
            </div>

            <div class="pf-col tight">
              <p class="pf-q">不服氣？</p>
              <p class="pf-p">也許是點放得不好。拖動右邊任何一個點（或用 Tab 選取、方向鍵移動），試著擺出 32 塊。</p>
              <p class="tally pf-num" aria-live="polite">
                現在 <b>{{ regionCount() }}</b> 塊 · 你擺出過的最大值 <b>{{ maxSeen() }}</b>
              </p>
              @if (minSeen() < 31) {
                <p class="pf-note">掉到 {{ minSeen() }} 塊，是因為有三條線擠在同一點，少了一塊。題目要求的「任三條不交於一點」被破壞了。</p>
              }
              @if (moved()) {
                <p class="pf-p">
                  你可能試了很多種擺法，都到不了 32。但「試了很多次都到不了」，本身<em>也只是例子</em>。要確定最多就是
                  31，需要一個理由：
                </p>
                <details class="pf-why">
                  <summary>為什麼最多 31？</summary>
                  <div>
                    <p>一開始圓是 1 塊。每畫一條線，它會被沿途的交點切成幾段，每一段都把一塊切成兩塊。所以這條線新增的塊數，等於它碰到的交點數加 1。</p>
                    <p>總塊數 ＝ 1 ＋ 線的條數 ＋ 交點數。6 個點有 15 條線；每個交點由 4 個點決定（兩條線各用兩個點），有 15 種選法。1 ＋ 15 ＋ 15 ＝ 31。</p>
                    <p>這個理由不管點怎麼放都成立，所以 32 永遠擺不出來。只要有三條線擠在同一點，交點就會變少，塊數也跟著變少。</p>
                  </div>
                </details>
              }
              <p class="pf-note">如果繼續：7 個點會切出 57 塊，加倍的話應該是 64。</p>
            </div>

            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>前五個都對，不保證第六個也對。<br />一個反例，就足以推翻「所有」。</p>
            </div>
          }
        }
      </div>

      <div class="stage pf-panel">
        <svg
          #board
          class="board"
          [class.placing]="phase() === 'place'"
          [class.dragging]="dragIndex() !== null"
          viewBox="-1.22 -1.22 2.44 2.44"
          role="group"
          [attr.aria-label]="'圓上 ' + arr().points.length + ' 個點，切出 ' + visibleCount() + ' 塊'"
          (pointerdown)="onDown($event)"
          (pointermove)="onMove($event)"
          (pointerup)="onUp()"
          (pointercancel)="onUp()"
          (pointerleave)="hoverAngle.set(null)"
        >
          <circle r="1" class="disk" />
          @for (r of regionsView(); track $index) {
            <path [attr.d]="r.d" class="region" [class.counted]="r.counted" [class.fresh]="r.fresh" />
          }
          @for (c of arr().chords; track $index) {
            <line [attr.x1]="c[0].x" [attr.y1]="c[0].y" [attr.x2]="c[1].x" [attr.y2]="c[1].y" class="chord" />
          }
          <circle r="1" class="rim" />
          @for (r of regionsView(); track $index) {
            @if (r.counted) {
              @if (r.label) {
                <text [attr.x]="r.cx" [attr.y]="r.cy" [attr.font-size]="r.fs" class="label">{{ r.num }}</text>
              } @else {
                <circle [attr.cx]="r.cx" [attr.cy]="r.cy" r="0.009" class="tiny" />
              }
            }
          }
          @if (ghost(); as g) {
            <circle [attr.cx]="g.x" [attr.cy]="g.y" r="0.045" class="ghost" />
          }
          @for (p of arr().points; track $index; let i = $index) {
            <g
              class="pt"
              [class.yours]="i === 5"
              [class.handle]="phase() === 'done'"
              [attr.tabindex]="phase() === 'done' ? 0 : null"
              [attr.role]="phase() === 'done' ? 'slider' : null"
              [attr.aria-label]="'第 ' + (i + 1) + ' 個點的位置（角度）'"
              [attr.aria-valuenow]="phase() === 'done' ? round(angles()[i]) : null"
              aria-valuemin="0"
              aria-valuemax="359"
              (keydown)="onKey($event, i)"
            >
              <circle [attr.cx]="p.x" [attr.cy]="p.y" r="0.085" class="hit" />
              <circle [attr.cx]="p.x" [attr.cy]="p.y" r="0.038" class="dot" />
            </g>
          }
        </svg>
        <div class="readout" aria-live="polite">
          <span class="pf-num">{{ visibleCount() }}</span>
          <small>塊 · {{ arr().points.length }} 個點</small>
        </div>
      </div>
    </section>
  `,
})
export class SceneSixthPointComponent implements OnDestroy {
  private readonly progress = inject(LearnProgressService);
  private readonly board = viewChild<ElementRef<SVGSVGElement>>('board');
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly suggested = SUGGESTED_SIXTH;
  readonly minis = [1, 2, 3, 4, 5].map((n) => ({ n, arr: buildArrangement(BASE_ANGLES.slice(0, n)) }));

  readonly betDraft = signal('');
  readonly bet = signal<number | null>(null);
  readonly phase = signal<Phase>('bet');
  readonly angles = signal<number[]>([...BASE_ANGLES]);
  readonly arr = computed(() => buildArrangement(this.angles()));
  readonly regionCount = computed(() => this.arr().regions.length);
  readonly counted = signal(0);
  readonly hoverAngle = signal<number | null>(null);
  readonly message = signal('');
  readonly dragIndex = signal<number | null>(null);
  readonly maxSeen = signal(0);
  readonly minSeen = signal(99);
  readonly moved = signal(false);

  readonly validBet = computed(() => {
    const v = Number(this.betDraft().trim());
    return this.betDraft().trim() !== '' && Number.isInteger(v) && v > 0 && v < 1000;
  });

  readonly visibleCount = computed(() =>
    this.phase() === 'count' ? this.counted() : this.regionCount(),
  );

  readonly ghost = computed<Pt | null>(() => {
    const a = this.hoverAngle();
    if (a === null || this.phase() !== 'place') return null;
    const t = (a * Math.PI) / 180;
    return { x: Math.cos(t), y: -Math.sin(t) };
  });

  readonly regionsView = computed(() => {
    const phase = this.phase();
    const c = this.counted();
    return this.arr().regions.map((r, i) => {
      const counted = phase === 'count' ? i < c : true;
      return {
        d: polyPath(r.poly),
        cx: r.centroid.x,
        cy: r.centroid.y,
        num: i + 1,
        label: r.area > 0.0016,
        fs: Math.max(0.038, Math.min(0.085, 0.55 * Math.sqrt(r.area))),
        counted,
        fresh: phase === 'count' && i === c - 1,
      };
    });
  });

  placeBet(ev: Event): void {
    ev.preventDefault();
    if (!this.validBet()) return;
    this.bet.set(Number(this.betDraft().trim()));
    this.phase.set('place');
  }

  tryPlace(angle: number): void {
    if (this.phase() !== 'place') return;
    const current = this.angles();
    if (!angleGapOk(current, angle)) {
      this.message.set('離其他點太近了，換個位置。');
      return;
    }
    this.message.set('');
    this.hoverAngle.set(null);
    this.angles.set([...current, angle]);
    this.phase.set('count');
    this.startCount();
  }

  private startCount(): void {
    const total = this.regionCount();
    if (this.reduced) {
      this.finishCount();
      return;
    }
    this.counted.set(0);
    const interval = Math.max(55, Math.min(120, 2600 / total));
    this.timer = setInterval(() => {
      const next = this.counted() + 1;
      this.counted.set(next);
      if (next >= total) this.finishCount();
    }, interval);
  }

  private finishCount(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.counted.set(this.regionCount());
    this.maxSeen.set(this.regionCount());
    this.minSeen.set(this.regionCount());
    this.phase.set('done');
    this.progress.markCompleted('proofs-ch1', '1');
  }

  private local(ev: PointerEvent): Pt | null {
    const svg = this.board()?.nativeElement;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  private angleOf(p: Pt): number {
    return ((Math.atan2(-p.y, p.x) * 180) / Math.PI + 360) % 360;
  }

  onDown(ev: PointerEvent): void {
    const p = this.local(ev);
    if (!p) return;
    const r = Math.hypot(p.x, p.y);
    if (this.phase() === 'place') {
      if (r > 0.55 && r < 1.22) this.tryPlace(this.angleOf(p));
      return;
    }
    if (this.phase() !== 'done') return;
    const pts = this.arr().points;
    let best = -1;
    let bestD = 0.14;
    pts.forEach((q, i) => {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bestD) {
        best = i;
        bestD = d;
      }
    });
    if (best >= 0) {
      this.dragIndex.set(best);
      this.board()?.nativeElement.setPointerCapture(ev.pointerId);
    }
  }

  onMove(ev: PointerEvent): void {
    const p = this.local(ev);
    if (!p) return;
    if (this.phase() === 'place') {
      const r = Math.hypot(p.x, p.y);
      this.hoverAngle.set(r > 0.55 && r < 1.22 ? this.angleOf(p) : null);
      return;
    }
    const idx = this.dragIndex();
    if (idx !== null) this.moveTo(idx, this.angleOf(p));
  }

  onUp(): void {
    this.dragIndex.set(null);
  }

  onKey(ev: KeyboardEvent, i: number): void {
    if (this.phase() !== 'done') return;
    const step = ev.shiftKey ? 5 : 1;
    const delta =
      ev.key === 'ArrowRight' || ev.key === 'ArrowUp' ? step : ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' ? -step : 0;
    if (!delta) return;
    ev.preventDefault();
    this.moveTo(i, (this.angles()[i] + delta + 360) % 360);
  }

  private moveTo(i: number, angle: number): void {
    const current = this.angles();
    if (!angleGapOk(current, angle, i)) return;
    const next = [...current];
    next[i] = angle;
    this.angles.set(next);
    this.moved.set(true);
    const n = this.regionCount();
    this.maxSeen.set(Math.max(this.maxSeen(), n));
    this.minSeen.set(Math.min(this.minSeen(), n));
  }

  round(v: number): number {
    return Math.round(v);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
