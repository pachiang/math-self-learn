import { Routes } from '@angular/router';

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
  {
    path: 'workshop',
    loadComponent: () =>
      import('./features/workshop/workshop.component').then(
        (m) => m.WorkshopComponent,
      ),
  },
];
