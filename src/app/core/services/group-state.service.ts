import { Injectable, computed, signal } from '@angular/core';
import { Group, GroupElement } from '../math/group';
import { createDihedralGroup } from '../math/groups/dihedral';

@Injectable({ providedIn: 'root' })
export class GroupStateService {
  readonly group = signal<Group>(createDihedralGroup(3));
  readonly currentElement = signal<GroupElement>(this.group().identity);
  readonly history = signal<GroupElement[]>([]);

  /** Element waiting for animation to finish before being committed. */
  readonly pendingElement = signal<GroupElement | null>(null);
  readonly isAnimating = computed(() => this.pendingElement() !== null);

  readonly state = computed(() => {
    const inv = this.currentElement().permutation.inverse();
    const n = this.group().vertices;
    return Array.from({ length: n }, (_, i) => inv.apply(i));
  });

  /** Request an operation with animation. Does nothing if busy. */
  requestOperation(element: GroupElement): void {
    if (this.pendingElement()) return;

    if (element.transform.type === 'identity') {
      // No visual change — skip animation
      return;
    }
    this.pendingElement.set(element);
  }

  /** Called by shape-canvas when 3D animation finishes. */
  commitPending(): void {
    const el = this.pendingElement();
    if (!el) return;

    const g = this.group();
    const current = this.currentElement();
    this.currentElement.set(g.multiply(el, current));
    this.history.update((h) => [...h, el]);
    this.pendingElement.set(null);
  }

  /** Instant jump — used by Cayley table. */
  jumpToElement(element: GroupElement): void {
    if (this.pendingElement()) return;
    this.currentElement.set(element);
    this.history.set([]);
  }

  setGroup(group: Group): void {
    this.group.set(group);
    this.currentElement.set(group.identity);
    this.history.set([]);
    this.pendingElement.set(null);
  }

  reset(): void {
    if (this.pendingElement()) return;
    this.currentElement.set(this.group().identity);
    this.history.set([]);
  }
}
