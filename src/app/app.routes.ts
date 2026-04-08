import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';

function legacyLearnStepMatcher(
  segments: UrlSegment[],
): UrlMatchResult | null {
  if (
    segments.length === 2 &&
    /^ch\d+$/.test(segments[0].path) &&
    /^\d+$/.test(segments[1].path)
  ) {
    return {
      consumed: segments,
      posParams: {
        chapterId: segments[0],
        step: segments[1],
      },
    };
  }

  return null;
}

function legacyLearnChapterMatcher(
  segments: UrlSegment[],
): UrlMatchResult | null {
  if (segments.length === 1 && /^ch\d+$/.test(segments[0].path)) {
    return {
      consumed: segments,
      posParams: {
        chapterId: segments[0],
      },
    };
  }

  return null;
}

export const routes: Routes = [
  { path: '', redirectTo: 'explorer', pathMatch: 'full' },
  {
    path: 'explorer',
    loadComponent: () =>
      import('./features/explorer/explorer.component').then(
        (m) => m.ExplorerComponent,
      ),
  },
  {
    path: 'learn',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/learn/learn.component').then(
            (m) => m.LearnComponent,
          ),
      },
      {
        matcher: legacyLearnStepMatcher,
        redirectTo: 'algebra/:chapterId/:step',
      },
      {
        matcher: legacyLearnChapterMatcher,
        redirectTo: 'algebra/:chapterId/1',
      },
      {
        path: ':subject',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/learn/subject-catalog/subject-catalog.component'
              ).then((m) => m.SubjectCatalogComponent),
          },
          {
            path: ':chapterId',
            redirectTo: ':chapterId/1',
            pathMatch: 'full',
          },
          {
            path: ':chapterId/:step',
            loadComponent: () =>
              import('./features/learn/chapter/chapter.component').then(
                (m) => m.ChapterComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'workshop',
    loadComponent: () =>
      import('./features/workshop/workshop.component').then(
        (m) => m.WorkshopComponent,
      ),
  },
];
