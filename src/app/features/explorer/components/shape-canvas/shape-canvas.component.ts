import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { GroupStateService } from '../../../../core/services/group-state.service';
import { GeometricTransform } from '../../../../core/math/group';
import { VERTEX_COLORS } from '../../../../shared/utils/colors';
import { polygonPoints, vertexPosition } from '../../../../shared/utils/geometry';

const SHAPE_RADIUS = 120;
const LABEL_RADIUS = 155;
const MARKER_RADIUS = 22;

@Component({
  selector: 'app-shape-canvas',
  standalone: true,
  template: `
    <div class="canvas-root">
      <!-- Ground shadow -->
      <div
        class="ground-shadow"
        [class.reflecting]="animType() === 'reflection'"
        [class.rotating]="animType() === 'rotation'"
        [style.animation-duration]="durationMs() + 'ms'"
      ></div>

      <!-- 3D perspective container -->
      <div class="perspective-box">
        <div
          #shapeLayer
          class="shape-layer"
          [style.transform]="layerTransform()"
          [style.transition]="layerTransition()"
          (transitionend)="onTransitionEnd($event)"
        >
          <svg
            viewBox="-200 -200 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Polygon edges -->
            <polygon
              [attr.points]="polyPoints()"
              class="polygon-outline"
            />

            <!-- Position labels (fixed in space) -->
            @for (pos of positions(); track pos.index) {
              <text
                [attr.x]="pos.labelX"
                [attr.y]="pos.labelY"
                class="position-label"
              >
                P{{ pos.index }}
              </text>
            }

            <!-- Vertex markers -->
            @for (marker of markers(); track marker.colorIndex) {
              <g [attr.transform]="'translate(' + marker.x + ',' + marker.y + ')'">
                <circle
                  [attr.r]="markerRadius"
                  [style.fill]="marker.color"
                  class="marker-circle"
                />
                <text class="marker-text">{{ marker.colorIndex }}</text>
              </g>
            }
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .canvas-root {
      position: relative;
      width: 100%;
      max-width: 420px;
      aspect-ratio: 1;
    }

    /* ── Ground shadow ── */
    .ground-shadow {
      position: absolute;
      bottom: 8%;
      left: 50%;
      transform: translateX(-50%);
      width: 55%;
      height: 14px;
      border-radius: 50%;
      background: radial-gradient(
        ellipse,
        var(--shadow-color) 0%,
        transparent 70%
      );
      pointer-events: none;
      z-index: 0;
    }

    .ground-shadow.reflecting {
      animation: shadow-flip linear forwards;
    }

    .ground-shadow.rotating {
      animation: shadow-rotate ease-in-out forwards;
    }

    @keyframes shadow-flip {
      0%   { transform: translateX(-50%) scaleY(1) scaleX(1);   opacity: 1; }
      35%  { transform: translateX(-50%) scaleY(1.6) scaleX(0.5); opacity: 0.6; }
      50%  { transform: translateX(-50%) scaleY(1.8) scaleX(0.3); opacity: 0.45; }
      65%  { transform: translateX(-50%) scaleY(1.6) scaleX(0.5); opacity: 0.6; }
      100% { transform: translateX(-50%) scaleY(1) scaleX(1);   opacity: 1; }
    }

    @keyframes shadow-rotate {
      0%   { transform: translateX(-50%) scaleX(1); opacity: 1; }
      50%  { transform: translateX(-50%) scaleX(0.92); opacity: 0.85; }
      100% { transform: translateX(-50%) scaleX(1); opacity: 1; }
    }

    /* ── 3D perspective ── */
    .perspective-box {
      position: relative;
      width: 100%;
      height: 100%;
      perspective: 700px;
      z-index: 1;
    }

    .shape-layer {
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      will-change: transform;
    }

    /* ── SVG ── */
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .polygon-outline {
      fill: var(--polygon-fill);
      stroke: var(--polygon-stroke);
      stroke-width: 2;
      stroke-linejoin: round;
    }

    .position-label {
      fill: var(--text-muted);
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
      dominant-baseline: central;
    }

    .marker-circle {
      stroke: var(--marker-stroke);
      stroke-width: 2;
      filter: drop-shadow(0 2px 6px var(--marker-shadow));
    }

    .marker-text {
      fill: white;
      font-size: 16px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      text-anchor: middle;
      dominant-baseline: central;
      pointer-events: none;
    }
  `,
})
export class ShapeCanvasComponent {
  private readonly groupState = inject(GroupStateService);

  readonly markerRadius = MARKER_RADIUS;

  /* ── Animation state ── */
  private readonly targetTransform = signal('none');
  private readonly transition = signal('none');
  readonly durationMs = signal(0);
  readonly animType = signal<'rotation' | 'reflection' | null>(null);

  readonly layerTransform = this.targetTransform.asReadonly();
  readonly layerTransition = this.transition.asReadonly();

  private readonly shapeLayerRef =
    viewChild<ElementRef<HTMLDivElement>>('shapeLayer');

  constructor() {
    effect(() => {
      const el = this.groupState.pendingElement();
      if (el) {
        this.animate(el.transform);
      }
    });
  }

  /* ── Computed shape data ── */

  readonly polyPoints = computed(() =>
    polygonPoints(this.groupState.group().vertices, SHAPE_RADIUS),
  );

  readonly positions = computed(() => {
    const n = this.groupState.group().vertices;
    return Array.from({ length: n }, (_, i) => {
      const { x, y } = vertexPosition(i, n, LABEL_RADIUS);
      return { index: i, labelX: x, labelY: y };
    });
  });

  readonly markers = computed(() => {
    const state = this.groupState.state();
    const n = state.length;
    return Array.from({ length: n }, (_, colorIdx) => {
      const pos = state.indexOf(colorIdx);
      const { x, y } = vertexPosition(pos, n, SHAPE_RADIUS);
      return { colorIndex: colorIdx, color: VERTEX_COLORS[colorIdx], x, y };
    });
  });

  /* ── Animation logic ── */

  private animate(t: GeometricTransform): void {
    if (t.type === 'identity') {
      this.groupState.commitPending();
      return;
    }

    let css: string;
    let duration: number;
    let easing: string;

    if (t.type === 'rotation') {
      css = `rotate(${t.angleDeg}deg)`;
      // Larger angles feel heavier — generous timing
      duration = 420 + Math.abs(t.angleDeg) * 2.8;
      easing = 'cubic-bezier(0.22, 0.68, 0.35, 1.0)';
      this.animType.set('rotation');
    } else {
      const { axisDx, axisDy } = t;
      css = `rotate3d(${axisDx.toFixed(4)}, ${axisDy.toFixed(4)}, 0, 180deg)`;
      duration = 720;
      easing = 'cubic-bezier(0.32, 0.72, 0.35, 1.0)';
      this.animType.set('reflection');
    }

    this.durationMs.set(duration);

    // Reset without transition
    this.transition.set('none');
    this.targetTransform.set('none');

    // Force reflow
    this.shapeLayerRef()?.nativeElement?.offsetHeight;

    // Start animation
    this.transition.set(`transform ${duration}ms ${easing}`);
    this.targetTransform.set(css);
  }

  onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform') return;

    this.transition.set('none');
    this.targetTransform.set('none');
    this.animType.set(null);
    this.durationMs.set(0);

    this.groupState.commitPending();
  }
}
