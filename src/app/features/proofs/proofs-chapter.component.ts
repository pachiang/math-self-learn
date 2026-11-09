import { Component, ViewEncapsulation, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LearnProgressService } from '../../core/services/learn-progress.service';
import { PROOFS_CHAPTERS, PROOFS_PROGRESS_PREFIX, ProofsChapter } from './proofs-course-data';
import { SceneSixthPointComponent } from './ch1/scene-sixth-point.component';
import { SceneFortiethComponent } from './ch1/scene-fortieth.component';
import { SceneEveryNComponent } from './ch1/scene-every-n.component';
import { SceneVerdictComponent } from './ch1/scene-verdict.component';
import { SceneEvenComponent } from './ch2/scene-even.component';
import { SceneDividesComponent } from './ch2/scene-divides.component';
import { SceneObtainComponent } from './ch2/scene-obtain.component';
import { SceneTwoNamesComponent } from './ch2/scene-two-names.component';
import { SceneRationalComponent } from './ch2/scene-rational.component';

@Component({
  selector: 'app-proofs-chapter',
  standalone: true,
  imports: [
    RouterLink,
    SceneSixthPointComponent,
    SceneFortiethComponent,
    SceneEveryNComponent,
    SceneVerdictComponent,
    SceneEvenComponent,
    SceneDividesComponent,
    SceneObtainComponent,
    SceneTwoNamesComponent,
    SceneRationalComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./proofs-shell.scss', './proofs-kit.scss'],
  template: `
    <div class="pf-root proofs-lesson">
      <header class="pf-bar">
        <a class="pf-back" routerLink="/learn/proofs">← 證明與數學思維</a>
        @if (chapter(); as c) {
          <div class="pf-chapter-label"><small>第 {{ c.num }} 章</small>{{ c.title }}</div>
          @if (c.scenes) {
            <nav class="pf-scenes" aria-label="本章小節">
              @for (s of c.scenes; track s.num) {
                <a
                  [routerLink]="['/learn/proofs', c.id, s.num]"
                  [class.active]="s.num === step()"
                  [class.done]="isDone(s.num)"
                  [attr.aria-current]="s.num === step() ? 'step' : null"
                >
                  <b>{{ s.num }}</b>{{ s.title }}
                  @if (isDone(s.num)) {
                    <span class="pf-sr-only">（已完成）</span>
                  }
                </a>
              }
            </nav>
          }
        }
      </header>

      <main class="pf-main">
        @if (chapter()?.scenes) {
          @switch (chapterId() + '/' + step()) {
            @case ('ch1/1') { <app-pf-sixth-point /> }
            @case ('ch1/2') { <app-pf-fortieth /> }
            @case ('ch1/3') { <app-pf-every-n /> }
            @case ('ch1/4') { <app-pf-verdict /> }
            @case ('ch2/1') { <app-pf-even /> }
            @case ('ch2/2') { <app-pf-divides /> }
            @case ('ch2/3') { <app-pf-obtain /> }
            @case ('ch2/4') { <app-pf-two-names /> }
            @case ('ch2/5') { <app-pf-rational /> }
          }
        } @else {
          <section class="pf-col" style="max-width: 640px">
            <p class="pf-kicker">尚未開放</p>
            <h1 class="pf-title">{{ chapter()?.title ?? '找不到這一章' }}</h1>
            <p class="pf-lede">這一章還在規畫中。先從第 1 章開始。</p>
            <div class="pf-row"><a class="pf-btn primary" routerLink="/learn/proofs/ch1/1">前往第 1 章</a></div>
          </section>
        }
      </main>

      @if (chapter()?.scenes; as scenes) {
        <footer class="pf-foot">
          @if (step() > 1) {
            <a class="pf-btn ghost" [routerLink]="['/learn/proofs', chapterId(), step() - 1]">← {{ scenes[step() - 2].title }}</a>
          } @else {
            <span></span>
          }
          @if (step() < scenes.length) {
            <a class="pf-btn" [routerLink]="['/learn/proofs', chapterId(), step() + 1]">{{ scenes[step()].title }} →</a>
          } @else {
            <a class="pf-btn ghost" routerLink="/learn/proofs">回到課程地圖</a>
          }
        </footer>
      }
    </div>
  `,
})
export class ProofsChapterComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly progress = inject(LearnProgressService);

  private readonly params = toSignal(this.route.paramMap.pipe(map((p) => p)), {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly chapterId = computed(() => this.params().get('chapterId') ?? 'ch1');
  readonly chapter = computed<ProofsChapter | null>(() => PROOFS_CHAPTERS[this.chapterId()] ?? null);
  readonly step = computed(() => {
    const total = this.chapter()?.scenes?.length ?? 1;
    const raw = Number(this.params().get('step')) || 1;
    return Math.max(1, Math.min(raw, total));
  });

  constructor() {
    effect(() => {
      this.step();
      this.chapterId();
      window.scrollTo({ top: 0 });
    });
  }

  isDone(num: number): boolean {
    return this.progress.isCompleted(PROOFS_PROGRESS_PREFIX + this.chapterId(), String(num));
  }
}
