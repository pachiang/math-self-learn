import { Component, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnProgressService } from '../../core/services/learn-progress.service';
import { PROOFS_PARTS, PROOFS_PROGRESS_PREFIX, ProofsChapter } from './proofs-course-data';

@Component({
  selector: 'app-proofs-course',
  standalone: true,
  imports: [RouterLink],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./proofs-shell.scss', './proofs-course.component.scss'],
  template: `
    <div class="pf-root pf-course">
      <header class="pf-bar">
        <a class="pf-back" routerLink="/learn">← 所有課程</a>
      </header>
      <main class="pf-main course-main">
        <section class="course-hero">
          <p class="pf-kicker">基礎課 · 所有證明型課程的先修</p>
          <h1 class="course-title">證明與數學思維</h1>
          <p class="pf-lede">
            面對一句沒見過的數學陳述：它到底要求你做什麼？手上有什麼可以用？卡住時下一步做什麼？做完之後，你怎麼知道自己真的證完了？
          </p>
          <blockquote>
            證明是一場說服「專門找碴的對手」的遊戲。陳述的形狀決定你能走哪幾步，定義是你唯一的武器。
          </blockquote>
          <p class="pf-note">為沒有紙筆的學習而設計：畫面替你記住已知和目標，你用打字給出證人和反例。</p>
          <div class="pf-row">
            <a class="pf-btn primary" routerLink="/learn/proofs/ch1/1">{{ startLabel() }}</a>
          </div>
        </section>

        <ol class="parts">
          @for (part of parts; track part.label) {
            <li class="part">
              <div class="part-head">
                <span class="part-mark">{{ part.label }}</span>
                <h2>{{ part.title }}</h2>
              </div>
              <ol class="chapters">
                @for (c of part.chapters; track c.id) {
                  <li>
                    @if (c.scenes) {
                      <a class="chapter open" [routerLink]="['/learn/proofs', c.id, 1]">
                        <span class="num pf-num">{{ c.num }}</span>
                        <span class="body">
                          <b>{{ c.title }}</b>
                          <small>{{ c.hook }}</small>
                        </span>
                        <span class="state">{{ doneCount(c) }} / {{ c.scenes.length }}</span>
                      </a>
                    } @else {
                      <div class="chapter">
                        <span class="num pf-num">{{ c.num }}</span>
                        <span class="body">
                          <b>{{ c.title }}</b>
                          <small>{{ c.hook }}</small>
                        </span>
                        <span class="state">規畫中</span>
                      </div>
                    }
                  </li>
                }
              </ol>
            </li>
          }
        </ol>
      </main>
    </div>
  `,
})
export class ProofsCourseComponent {
  private readonly progress = inject(LearnProgressService);
  readonly parts = PROOFS_PARTS;

  doneCount(c: ProofsChapter): number {
    return (c.scenes ?? []).filter((s) =>
      this.progress.isCompleted(PROOFS_PROGRESS_PREFIX + c.id, String(s.num)),
    ).length;
  }

  startLabel(): string {
    const first = PROOFS_PARTS[0].chapters[0];
    return this.doneCount(first) > 0 ? '繼續第 1 章' : '從第 1 章開始';
  }
}
