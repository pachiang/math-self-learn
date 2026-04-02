import { Injectable, signal } from '@angular/core';

export interface StepProgress {
  completed: boolean;
  data: Record<string, unknown>;
}

export interface ChapterProgress {
  currentStep: number;
  steps: Record<string, StepProgress>;
}

const STORAGE_KEY = 'group-anime-learn';

@Injectable({ providedIn: 'root' })
export class LearnProgressService {
  private readonly _progress = signal<Record<string, ChapterProgress>>(
    this.load(),
  );

  getChapter(chapterId: string): ChapterProgress {
    return (
      this._progress()[chapterId] ?? { currentStep: 1, steps: {} }
    );
  }

  getStepData<T = unknown>(
    chapterId: string,
    stepId: string,
    key: string,
  ): T | undefined {
    return this.getChapter(chapterId).steps[stepId]?.data[key] as T | undefined;
  }

  saveStepData(
    chapterId: string,
    stepId: string,
    key: string,
    value: unknown,
  ): void {
    this._progress.update((all) => {
      const ch = all[chapterId] ?? { currentStep: 1, steps: {} };
      const step = ch.steps[stepId] ?? { completed: false, data: {} };
      return {
        ...all,
        [chapterId]: {
          ...ch,
          steps: {
            ...ch.steps,
            [stepId]: { ...step, data: { ...step.data, [key]: value } },
          },
        },
      };
    });
    this.persist();
  }

  markCompleted(chapterId: string, stepId: string): void {
    this._progress.update((all) => {
      const ch = all[chapterId] ?? { currentStep: 1, steps: {} };
      const step = ch.steps[stepId] ?? { completed: false, data: {} };
      return {
        ...all,
        [chapterId]: {
          ...ch,
          steps: { ...ch.steps, [stepId]: { ...step, completed: true } },
        },
      };
    });
    this.persist();
  }

  isCompleted(chapterId: string, stepId: string): boolean {
    return this.getChapter(chapterId).steps[stepId]?.completed ?? false;
  }

  private load(): Record<string, ChapterProgress> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._progress()));
  }
}
