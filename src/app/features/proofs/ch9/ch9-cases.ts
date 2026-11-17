import { BoardState } from '../board/board-model';
import { CaseRow } from './case-line.component';

/** Which integers a case covers, read off the board's case label. */
export function caseTest(label: string): (n: number) => boolean {
  if (/是偶數$/.test(label)) return (n) => n % 2 === 0;
  if (/是奇數$/.test(label)) return (n) => n % 2 !== 0;
  const m = label.match(/除以 (\d+) 餘 (\d+)/);
  if (m) {
    const d = Number(m[1]);
    const r = Number(m[2]);
    return (n) => ((n % d) + d) % d === r;
  }
  return () => false;
}

/** The board's top-level cases as rows of the case line, sealed once proved. */
export function caseRows(st: BoardState | null): CaseRow[] {
  if (!st) return [];
  return st.tabs
    .filter((t) => !t.id.includes('.'))
    .map((t) => ({ label: `情況 ${t.id}：${t.label}`, test: caseTest(t.label), sealed: t.status === 'done', active: t.status === 'active' }));
}
