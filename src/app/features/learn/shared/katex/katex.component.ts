import { Component, Input, ElementRef, AfterViewInit, OnChanges, viewChild } from '@angular/core';
import katex from 'katex';

/**
 * Reusable KaTeX math rendering component.
 *
 * Usage:
 *   Inline:  <app-math e="\Gamma(s)" />
 *   Block:   <app-math block e="x^2 + y^2 = r^2" />
 *   Color:   <app-math e="\pi" color="#c00" />
 *
 * NOTE: use `block` not `display` to avoid HTML attribute collision.
 * `block` can be used as bare attribute:  <app-math block e="..." />
 * or as binding: <app-math [block]="true" e="..." />
 */
@Component({
  selector: 'app-math',
  standalone: true,
  template: `<span #container></span>`,
  styles: `
    :host { display: inline; }
    :host(.block-math) { display: block; text-align: center; margin: 10px 0; }
    :host(.block-math) span { display: block; }
  `,
  host: {
    '[class.block-math]': 'block',
  },
})
export class KatexComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) e!: string;
  @Input() color?: string;

  // Using a getter/setter so both `block` (bare attr → "") and `[block]="true"` work
  private _block = false;
  @Input()
  get block(): boolean { return this._block; }
  set block(v: boolean | string) {
    // bare attribute `block` passes "" which is truthy-ish; explicit false stays false
    this._block = v !== false && v !== 'false';
  }

  private readonly containerRef = viewChild<ElementRef<HTMLSpanElement>>('container');

  ngAfterViewInit(): void { this.render(); }
  ngOnChanges(): void { this.render(); }

  private render(): void {
    const el = this.containerRef()?.nativeElement;
    if (!el || !this.e) return;
    try {
      katex.render(this.e, el, {
        displayMode: this._block,
        throwOnError: false,
        trust: true,
      });
      if (this.color) {
        el.style.color = this.color;
      }
    } catch {
      el.textContent = this.e;
    }
  }
}
