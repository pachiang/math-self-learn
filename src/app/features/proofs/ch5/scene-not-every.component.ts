import { Component, computed, inject, signal } from '@angular/core';
import { LearnProgressService } from '../../../core/services/learn-progress.service';

const STUDENTS = ['甲', '乙', '丙'];
const COURSES = ['國文', '數學', '英文'];

/** A class: fail[s][c] is true when student s fails course c. */
type World = boolean[][];

/** Each student fails a different course, so no course is failed by everyone. */
const START: World = [
  [false, true, false],
  [false, false, true],
  [true, false, false],
];

const hasFail = (row: boolean[]) => row.some((f) => f);
const hasPass = (row: boolean[]) => row.some((f) => !f);

/** The original: every student has a course they fail. */
const ORIGINAL = (w: World) => w.every(hasFail);

interface Candidate {
  id: string;
  text: string;
  holds: (w: World) => boolean;
  /** Feedback when this was the learner's first pick. */
  predicted: string;
}

const CANDIDATES: Candidate[] = [
  {
    id: 'a',
    text: '每個學生都每門課及格。',
    holds: (w) => w.every((r) => !hasFail(r)),
    predicted: '你選了 (a)，這是最常見的直覺：把「不」放進最裡面，「每個」留著不動。',
  },
  {
    id: 'b',
    text: '有一個學生每門課都及格。',
    holds: (w) => w.some((r) => !hasFail(r)),
    predicted: '你選了 (b)。',
  },
  {
    id: 'c',
    text: '每個學生都有一門課及格。',
    holds: (w) => w.every(hasPass),
    predicted: '你選了 (c)：把「不及格」翻成「及格」，其他不動。',
  },
  {
    id: 'd',
    text: '有一個學生有一門課及格。',
    holds: (w) => w.some(hasPass),
    predicted: '你選了 (d)：「每個」翻成「有一個」，「不及格」也翻成「及格」。',
  },
];

/** Every class of 3 students × 3 courses: 2⁹ = 512. */
function allWorlds(): World[] {
  const out: World[] = [];
  for (let m = 0; m < 512; m++) out.push(STUDENTS.map((_, s) => COURSES.map((_, c) => !!(m & (1 << (s * 3 + c))))));
  return out;
}

@Component({
  selector: 'app-pf-not-every',
  standalone: true,
  styleUrl: './scene-not-every.component.scss',
  template: `
    <section class="pf-scene solo">
      <div class="pf-col">
        <p class="pf-kicker">1 / 5 · 不是每個</p>
        <h1 class="pf-title">「不是每個」<br />到底是什麼意思？</h1>
        <p class="pf-lede">
          要說一句話不成立，你得先知道「它不成立」寫出來長什麼樣子。這叫做那句話的<b>否定</b>（negation）。先從一句生活裡的話開始。
        </p>

        <div class="pf-slip">
          <small>原句</small>
          <p>每個學生都有一門課不及格。</p>
        </div>

        <p class="pf-q">下面哪一句，說的正好是「原句不成立」？</p>
        <div class="cands" role="group" aria-label="候選的否定句">
          @for (c of cands; track c.id) {
            <div class="cand" [class.out]="!!killedBy()[c.id]" [class.kept]="exhausted() && c.id === 'b'">
              <button
                type="button"
                class="pf-btn small"
                [class.picked]="pred() === c.id"
                [attr.aria-pressed]="pred() === c.id"
                [disabled]="predDone()"
                (click)="pred.set(c.id)"
              >
                ({{ c.id }})
              </button>
              <span class="ctext">{{ c.text }}</span>
              @if (predDone()) {
                <span class="cstate">
                  @if (killedBy()[c.id]; as k) {
                    ✗ 不是否定：{{ k }}
                  } @else if (exhausted() && c.id === 'b') {
                    ✓ 512 個班級都唱反調
                  } @else {
                    <span class="here">這一班：{{ c.holds(world()) ? '成立' : '不成立' }}{{ opposite(c) ? '，唱反調 ✓' : '，沒有唱反調 ✗' }}</span>
                  }
                </span>
              }
            </div>
          }
        </div>
        @if (!predDone()) {
          <div class="pf-row"><button type="button" class="pf-btn primary" [disabled]="!pred()" (click)="commit()">我選好了</button></div>
        }

        @if (predDone()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-feedback you" role="status">{{ predNote() }}先別急著看答案，用一個班級來試。</p>
            <p class="pf-p">
              否定句得和原句<b>唱反調</b>：原句成立的班級，它一定不成立；原句不成立的班級，它一定成立。只要找到一個班級，兩句一起成立或一起不成立，那一句就不是否定。
            </p>

            <div class="klass">
              <table class="pf-table cls">
                <caption class="pf-sr-only">班級成績表，按一格可以切換及格或不及格</caption>
                <tr>
                  <th></th>
                  @for (c of courses; track c) {
                    <th scope="col">{{ c }}</th>
                  }
                </tr>
                @for (s of students; track s; let i = $index) {
                  <tr>
                    <th scope="row">{{ s }}</th>
                    @for (c of courses; track c; let j = $index) {
                      <td>
                        <button
                          type="button"
                          class="cell"
                          [class.fail]="world()[i][j]"
                          [attr.aria-label]="s + '的' + c + '：' + (world()[i][j] ? '不及格' : '及格')"
                          [disabled]="!editable()"
                          (click)="toggle(i, j)"
                        >
                          {{ world()[i][j] ? '✗ 不及格' : '○ 及格' }}
                        </button>
                      </td>
                    }
                  </tr>
                }
              </table>
              <div class="status">
                <small>這一班</small>
                <p>原句：<b>{{ origHolds() ? '成立' : '不成立' }}</b></p>
                <p class="pf-note">{{ origWhy() }}</p>
              </div>
            </div>

            <p class="pf-p">{{ stageText() }}</p>
            @if (stage() === 0) {
              <div class="pf-row"><button type="button" class="pf-btn primary" (click)="stage.set(1)">好，換我改班級</button></div>
            }
            @if (hint(); as h) {
              <p class="pf-feedback you" role="status">{{ h }}</p>
            }
          </div>
        }

        @if (onlyB() && !exhausted()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-p">只剩 (b)。可是兩個班級不夠：會不會有某個班級讓它露餡？3 位學生、3 門課，每格兩種可能，一共 2⁹ = 512 種班級，少到可以全部檢查。</p>
            <div class="pf-row"><button type="button" class="pf-btn primary" (click)="exhaust()">把 512 個班級全部檢查一次</button></div>
          </div>
        }

        @if (exhausted()) {
          <div class="pf-col tight pf-rise">
            <p class="pf-feedback good" role="status">
              512 個班級裡，(b) 每一次都和原句唱反調。原句成立的 {{ origCount() }} 班，(b) 都不成立；其餘 {{ 512 - origCount() }} 班，(b) 都成立。
              <span class="ex-tag">完整檢查 · 只限 3 位學生、3 門課</span>
            </p>
            <p class="pf-p">
              原句不成立，意思就是「不是每個學生都有不及格」，所以只要<b>有一個</b>學生出問題就夠了：那個學生找不到不及格的課，也就是每門課都及格。其他學生怎樣都不重要。
            </p>
            <div class="pf-takeaway reveal">
              <small>帶走這一句</small>
              <p>否定一句話，就是在每一種情況都和它唱反調。<br />「不是每個學生都…」只要一個學生出問題：<br />否定「每個」，得到的是「有一個」，不是「每個都不」。</p>
            </div>
            <p class="pf-note">512 班的檢查只證明了 3 × 3 的班級。班級變大也一樣嗎？下一幕給一個不靠列舉的理由。</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SceneNotEveryComponent {
  private readonly progress = inject(LearnProgressService);

  readonly cands = CANDIDATES;
  readonly students = STUDENTS;
  readonly courses = COURSES;

  readonly pred = signal<string | null>(null);
  readonly predDone = signal(false);
  readonly world = signal<World>(START.map((r) => [...r]));
  /** 0: looking at the starting class; 1: learner edits. */
  readonly stage = signal(0);
  readonly killedBy = signal<Record<string, string>>({});
  readonly exhausted = signal(false);
  readonly origCount = signal(0);

  readonly origHolds = computed(() => ORIGINAL(this.world()));
  readonly editable = computed(() => this.stage() === 1 && !this.onlyB());
  readonly onlyB = computed(() => ['a', 'c', 'd'].every((id) => this.killedBy()[id]));

  readonly origWhy = computed(() => {
    const w = this.world();
    const clean = STUDENTS.filter((_, i) => !hasFail(w[i]));
    return clean.length ? `${clean.join('、')}每門課都及格，沒有不及格的課。` : '每個學生都至少有一門 ✗。';
  });

  readonly predNote = computed(() => CANDIDATES.find((c) => c.id === this.pred())?.predicted ?? '');

  readonly stageText = computed(() => {
    if (this.onlyB()) return '(a)、(c)、(d) 都被一個班級抓到了。';
    if (this.stage() === 0) {
      return '在這一班，每個學生都有一門 ✗，原句成立。(c) 和 (d) 也成立，兩句一起成立，所以它們都不是否定，這一班就推翻了它們。';
    }
    return '現在動手改班級：讓原句不成立，看看還剩下哪幾句在唱反調。';
  });

  readonly hint = computed(() => {
    if (this.stage() !== 1 || this.onlyB()) return null;
    const w = this.world();
    if (!ORIGINAL(w) && w.every((r) => !hasFail(r))) {
      return '全班都及格時，(a) 也成立，剛好和原句唱反調。試試看只讓一個學生全部及格，其他人照舊。';
    }
    return null;
  });

  opposite(c: Candidate): boolean {
    return c.holds(this.world()) !== this.origHolds();
  }

  commit(): void {
    this.predDone.set(true);
    this.progress.saveStepData('proofs-ch5', '1', 'pred', this.pred());
    this.catchNow('第一班');
  }

  toggle(i: number, j: number): void {
    this.world.update((w) => w.map((r, s) => r.map((f, c) => (s === i && c === j ? !f : f))));
    this.catchNow('你改的班級');
  }

  exhaust(): void {
    const ws = allWorlds();
    const b = CANDIDATES.find((c) => c.id === 'b')!;
    if (!ws.every((w) => b.holds(w) !== ORIGINAL(w))) return;
    this.origCount.set(ws.filter(ORIGINAL).length);
    this.exhausted.set(true);
    this.progress.markCompleted('proofs-ch5', '1');
  }

  /** Any candidate that agrees with the original in the current class is caught by it. */
  private catchNow(where: string): void {
    const w = this.world();
    const o = ORIGINAL(w);
    const verdict = o ? '原句和它一起成立' : '原句和它一起不成立';
    this.killedBy.update((k) => {
      const next = { ...k };
      for (const c of CANDIDATES) {
        if (!next[c.id] && c.holds(w) === o) next[c.id] = `在${where}，${verdict}`;
      }
      return next;
    });
  }
}
