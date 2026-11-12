import { Component, computed, input } from '@angular/core';
import { num } from '../ch3/grid4.component';

/**
 * The "sing the opposite" check on a stretch of integers: one column per x,
 * a row for the original condition, a row for the candidate, and a verdict row.
 * A column passes only when exactly one of the two holds.
 */
@Component({
  selector: 'app-pf-flip-line',
  standalone: true,
  styleUrl: './flip-line.component.scss',
  template: `
    <figure class="fl">
      <table class="fl-t">
        <caption class="pf-sr-only">{{ label() }}：每個整數 x 上，兩個條件各自成立與否</caption>
        <tr class="fl-x">
          <th scope="row">x ∈ ℤ</th>
          @for (x of xs(); track x) {
            <td class="pf-num">{{ n(x) }}</td>
          }
        </tr>
        <tr>
          <th scope="row">{{ origText() }}</th>
          @for (x of xs(); track x) {
            <td>
              @if (orig()(x)) {
                <span class="dot o" aria-label="成立">●</span>
              } @else {
                <span class="off" aria-label="不成立">·</span>
              }
            </td>
          }
        </tr>
        <tr>
          <th scope="row">{{ candText() || '（還沒選）' }}</th>
          @for (x of xs(); track x) {
            <td>
              @if (cand(); as c) {
                @if (c(x)) {
                  <span class="dot c" aria-label="成立">■</span>
                } @else {
                  <span class="off" aria-label="不成立">·</span>
                }
              }
            </td>
          }
        </tr>
        @if (cand()) {
          <tr class="fl-v">
            <th scope="row">唱反調？</th>
            @for (x of xs(); track x) {
              <td [class.bad]="!ok(x)">{{ ok(x) ? '✓' : '✗' }}</td>
            }
          </tr>
        }
      </table>
      <figcaption class="pf-note">● 原條件成立　■ 候選成立　每一欄恰好一個成立才算 ✓。</figcaption>
    </figure>
  `,
})
export class FlipLineComponent {
  readonly lo = input.required<number>();
  readonly hi = input.required<number>();
  readonly orig = input.required<(x: number) => boolean>();
  readonly origText = input.required<string>();
  readonly cand = input<((x: number) => boolean) | null>(null);
  readonly candText = input('');
  readonly label = input('唱反調數線');

  readonly xs = computed(() => Array.from({ length: this.hi() - this.lo() + 1 }, (_, i) => this.lo() + i));

  readonly n = num;

  ok(x: number): boolean {
    const c = this.cand();
    return !!c && this.orig()(x) !== c(x);
  }
}
