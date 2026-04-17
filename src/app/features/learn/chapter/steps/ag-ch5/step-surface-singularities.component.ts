import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Surface preset definitions ── */

interface SurfacePreset {
  key: string;
  label: string;
  tex: string;
  singType: string;
  singLabel: string;
  singPos: [number, number, number] | null;
  build: (group: THREE.Group, showGradient: boolean) => void;
}

/* ── Muted height color palette ── */

function heightColor(t: number): THREE.Color {
  // t in [0,1] -> muted academic palette
  const r = 0.28 + 0.40 * t;
  const g = 0.35 + 0.25 * (1 - t);
  const b = 0.42 + 0.30 * (1 - t * t);
  return new THREE.Color(r, g, b);
}

/* ── Build parametric BufferGeometry from (u,v) -> (x,y,z) ── */

function buildParametricSurface(
  fn: (u: number, v: number) => [number, number, number],
  uRange: [number, number],
  vRange: [number, number],
  segments = 80,
  doubleSide = false,
): THREE.BufferGeometry {
  const uCount = segments;
  const vCount = segments;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const du = (uRange[1] - uRange[0]) / uCount;
  const dv = (vRange[1] - vRange[0]) / vCount;

  // Compute all positions and find z-range
  const pts: [number, number, number][] = [];
  let zMin = Infinity, zMax = -Infinity;
  for (let i = 0; i <= uCount; i++) {
    for (let j = 0; j <= vCount; j++) {
      const u = uRange[0] + i * du;
      const v = vRange[0] + j * dv;
      const p = fn(u, v);
      if (isFinite(p[2])) {
        zMin = Math.min(zMin, p[2]);
        zMax = Math.max(zMax, p[2]);
      }
      pts.push(p);
    }
  }
  if (zMax - zMin < 0.001) { zMax = zMin + 1; }

  for (let i = 0; i <= uCount; i++) {
    for (let j = 0; j <= vCount; j++) {
      const idx = i * (vCount + 1) + j;
      const p = pts[idx];
      positions.push(p[0], p[1], p[2]);
      const t = (p[2] - zMin) / (zMax - zMin);
      const c = heightColor(isFinite(t) ? Math.max(0, Math.min(1, t)) : 0.5);
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let i = 0; i < uCount; i++) {
    for (let j = 0; j < vCount; j++) {
      const a = i * (vCount + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (vCount + 1) + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ── Build height-map surface from z = f(x,y) over PlaneGeometry ── */

function buildHeightMap(
  fn: (x: number, y: number) => number,
  xyRange: [number, number],
  segments = 100,
): THREE.BufferGeometry {
  const n = segments;
  const lo = xyRange[0], hi = xyRange[1];
  const step = (hi - lo) / n;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  let zMin = Infinity, zMax = -Infinity;
  const zVals: number[] = [];

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      const x = lo + i * step;
      const y = lo + j * step;
      let z = fn(x, y);
      if (!isFinite(z)) z = 0;
      zVals.push(z);
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
    }
  }
  if (zMax - zMin < 0.001) { zMax = zMin + 1; }

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      const x = lo + i * step;
      const y = lo + j * step;
      const z = zVals[i * (n + 1) + j];
      positions.push(x, y, z);
      const t = (z - zMin) / (zMax - zMin);
      const c = heightColor(Math.max(0, Math.min(1, t)));
      colors.push(c.r, c.g, c.b);
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * (n + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (n + 1) + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ── Add singular point marker ── */

function addSingularMarker(group: THREE.Group, pos: [number, number, number]): void {
  const geo = new THREE.SphereGeometry(0.06, 16, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0xcc4444, emissive: 0x661111 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  group.add(mesh);

  // Add a ring around it
  const ringGeo = new THREE.RingGeometry(0.09, 0.12, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xcc4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(pos[0], pos[1], pos[2]);
  group.add(ring);
}

/* ── Add gradient arrows ── */

function addGradientArrows(
  group: THREE.Group,
  gradientFn: (x: number, y: number, z: number) => [number, number, number],
  samplePoints: [number, number, number][],
): void {
  for (const pt of samplePoints) {
    const g = gradientFn(pt[0], pt[1], pt[2]);
    const mag = Math.sqrt(g[0] * g[0] + g[1] * g[1] + g[2] * g[2]);
    if (mag < 0.01) continue;

    const dir = new THREE.Vector3(g[0] / mag, g[1] / mag, g[2] / mag);
    const len = Math.min(0.3, mag * 0.15);
    const origin = new THREE.Vector3(pt[0], pt[1], pt[2]);
    const arrow = new THREE.ArrowHelper(dir, origin, len, 0x55cc88, len * 0.3, len * 0.15);
    group.add(arrow);
  }
}

/* ── Surface material factory ── */

function surfaceMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.82,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
  });
}

/* ── Preset definitions ── */

function buildCone(group: THREE.Group, showGradient: boolean): void {
  // Upper sheet: z = sqrt(x^2 + y^2)
  const geoUpper = buildParametricSurface(
    (u, v) => [u * Math.cos(v), u * Math.sin(v), u],
    [0, 2], [0, Math.PI * 2], 80,
  );
  group.add(new THREE.Mesh(geoUpper, surfaceMaterial()));

  // Lower sheet: z = -sqrt(x^2 + y^2)
  const geoLower = buildParametricSurface(
    (u, v) => [u * Math.cos(v), u * Math.sin(v), -u],
    [0, 2], [0, Math.PI * 2], 80,
  );
  group.add(new THREE.Mesh(geoLower, surfaceMaterial()));

  addSingularMarker(group, [0, 0, 0]);

  if (showGradient) {
    // gradient of f = x^2 + y^2 - z^2: (2x, 2y, -2z)
    const pts: [number, number, number][] = [];
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2;
      const r = 1.2;
      pts.push([r * Math.cos(angle), r * Math.sin(angle), r]);
      pts.push([r * Math.cos(angle), r * Math.sin(angle), -r]);
    }
    pts.push([0.05, 0.05, 0.05]); // near singular
    addGradientArrows(group, (x, y, z) => [2 * x, 2 * y, -2 * z], pts);
  }
}

function buildCusp(group: THREE.Group, showGradient: boolean): void {
  // z = (x^2 + y^2)^(1/3)
  const geo = buildHeightMap(
    (x, y) => Math.pow(x * x + y * y, 1 / 3),
    [-1.5, 1.5], 100,
  );
  group.add(new THREE.Mesh(geo, surfaceMaterial()));

  addSingularMarker(group, [0, 0, 0]);

  if (showGradient) {
    // gradient of f = x^2 + y^2 - z^3: (2x, 2y, -3z^2)
    const pts: [number, number, number][] = [];
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const r = 0.8;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      const z = Math.pow(x * x + y * y, 1 / 3);
      pts.push([x, y, z]);
    }
    pts.push([0.02, 0.02, Math.pow(0.0008, 1 / 3)]);
    addGradientArrows(group, (x, y, z) => [2 * x, 2 * y, -3 * z * z], pts);
  }
}

function buildWhitney(group: THREE.Group, showGradient: boolean): void {
  // Parametric: (uv, u, v^2) for u in [-1.5,1.5], v in [0,1.5]
  const geo1 = buildParametricSurface(
    (u, v) => [u * v, u, v * v],
    [-1.5, 1.5], [0, 1.5], 80,
  );
  group.add(new THREE.Mesh(geo1, surfaceMaterial()));

  // Also render v in [-1.5, 0] to get the full umbrella
  const geo2 = buildParametricSurface(
    (u, v) => [u * v, u, v * v],
    [-1.5, 1.5], [-1.5, 0], 80,
  );
  group.add(new THREE.Mesh(geo2, surfaceMaterial()));

  // The handle: along z-axis where x=y=0 (for z < 0, the "handle" extends)
  // Mark singularity along z-axis
  addSingularMarker(group, [0, 0, 0]);

  if (showGradient) {
    // f = x^2 - y^2*z, gradient: (2x, -2yz, -y^2)
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const u = -1.2 + (i / 5) * 2.4;
      const v = 0.8;
      pts.push([u * v, u, v * v]);
    }
    pts.push([0.02, 0.02, 0.01]);
    addGradientArrows(group, (x, y, z) => [2 * x, -2 * y * z, -y * y], pts);
  }
}

function buildSphere(group: THREE.Group, showGradient: boolean): void {
  const geo = buildParametricSurface(
    (u, v) => [
      Math.sin(u) * Math.cos(v),
      Math.sin(u) * Math.sin(v),
      Math.cos(u),
    ],
    [0, Math.PI], [0, Math.PI * 2], 80,
  );
  group.add(new THREE.Mesh(geo, surfaceMaterial()));

  if (showGradient) {
    // f = x^2+y^2+z^2-1, gradient: (2x, 2y, 2z)
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const u = Math.PI * 0.2 + (i / 11) * Math.PI * 0.6;
      const v = (i / 11) * Math.PI * 2;
      pts.push([Math.sin(u) * Math.cos(v), Math.sin(u) * Math.sin(v), Math.cos(u)]);
    }
    addGradientArrows(group, (x, y, z) => [2 * x, 2 * y, 2 * z], pts);
  }
}

const PRESETS: SurfacePreset[] = [
  {
    key: 'a1',
    label: 'A\u2081 \u7D50\u9EDE (\u5713\u9310)',
    tex: 'x^2 + y^2 - z^2 = 0',
    singType: 'A\u2081',
    singLabel: '(0, 0, 0)',
    singPos: [0, 0, 0],
    build: buildCone,
  },
  {
    key: 'a2',
    label: 'A\u2082 \u5C16\u9EDE',
    tex: 'x^2 + y^2 - z^3 = 0',
    singType: 'A\u2082',
    singLabel: '(0, 0, 0)',
    singPos: [0, 0, 0],
    build: buildCusp,
  },
  {
    key: 'whitney',
    label: 'Whitney \u5098',
    tex: 'x^2 - y^2 z = 0',
    singType: 'Whitney',
    singLabel: '(0, 0, 0)',
    singPos: [0, 0, 0],
    build: buildWhitney,
  },
  {
    key: 'smooth',
    label: '\u5149\u6ED1\u7403\u9762 (\u5C0D\u6BD4)',
    tex: 'x^2 + y^2 + z^2 - 1 = 0',
    singType: '\u5149\u6ED1',
    singLabel: '\u7121',
    singPos: null,
    build: buildSphere,
  },
];

/* ── Component ── */

@Component({
  selector: 'app-step-surface-singularities',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="\u66F2\u9762\u7684\u5947\u7570\u9EDE" subtitle="&sect;5.4">
      <p>
        Just like curves can have nodes and cusps, surfaces can have singular points
        \u2014 where all partial derivatives vanish. But surface singularities are richer:
        nodes (ordinary double points), cusps, pinch points, and exotic forms like the
        Whitney umbrella.
      </p>
      <app-math block [e]="formulaSing"></app-math>
    </app-prose-block>

    <app-prose-block>
      <p>Classification of surface singularities:</p>
      <ul>
        <li>
          <strong>A\u2081 (\u7D50\u9EDE/node)</strong>: like
          <app-math [e]="'x^2 + y^2 - z^2 = 0'" /> at origin \u2014
          a cone, two sheets meeting
        </li>
        <li>
          <strong>A\u2082 (\u5C16\u9EDE/cusp)</strong>: like
          <app-math [e]="'x^2 + y^2 - z^3 = 0'" /> \u2014 a pinch point
        </li>
        <li>
          <strong>D\u2084 (Whitney \u5098)</strong>: like
          <app-math [e]="'x^2 - y^2 z = 0'" /> \u2014 a self-intersecting surface
        </li>
      </ul>
    </app-prose-block>

    <app-prose-block>
      <p>
        The resolution of singularities (Hironaka, 1964, Fields Medal) shows that any
        singular variety can be made smooth by a sequence of blowups \u2014 replacing
        singular points with curves or surfaces.
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u65CB\u8F49\u89C0\u5BDF\u4E0D\u540C\u985E\u578B\u7684\u66F2\u9762\u5947\u7570\u9EDE">
      <!-- Preset buttons -->
      <div class="preset-row">
        @for (p of presets; track p.key; let i = $index) {
          <button class="pre-btn" [class.active]="presetIdx() === i"
                  (click)="selectPreset(i)">{{ p.label }}</button>
        }
      </div>

      <!-- Gradient toggle -->
      <div class="toggle-row">
        <label class="toggle-label">
          <input type="checkbox" [checked]="showGradient()"
                 (change)="toggleGradient()" />
          <span>\u986F\u793A\u68AF\u5EA6\u5834</span>
        </label>
      </div>

      <!-- Three.js container -->
      <div #threeContainer class="three-container"></div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">\u985E\u578B</div>
          <div class="ic-val">{{ activePreset().singType }}</div>
        </div>
        <div class="info-card">
          <div class="ic-title">\u65B9\u7A0B</div>
          <app-math [e]="activePreset().tex"></app-math>
        </div>
        <div class="info-card">
          <div class="ic-title">\u5947\u7570\u9EDE</div>
          <div class="ic-val">{{ activePreset().singLabel }}</div>
        </div>
      </div>
    </app-challenge-card>
  `,
  styles: `
    .preset-row {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
    }
    .pre-btn {
      padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: 11px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { border-color: var(--accent); }
      &.active {
        background: var(--accent-10); border-color: var(--accent);
        color: var(--accent); font-weight: 600;
      }
    }
    .toggle-row {
      margin-bottom: 10px;
    }
    .toggle-label {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 12px; color: var(--text-secondary); cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
    }
    .toggle-label input {
      accent-color: var(--accent);
    }
    .three-container {
      width: 100%; height: 420px; border-radius: 10px;
      border: 1px solid var(--border); overflow: hidden; margin-bottom: 10px;
    }
    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .info-card {
      flex: 1; min-width: 100px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .ic-val {
      font-size: 13px; font-weight: 600; color: var(--text);
    }
  `,
})
export class StepSurfaceSingularitiesComponent implements OnDestroy {
  readonly presets = PRESETS;

  readonly formulaSing = String.raw`\text{奇異點: } \nabla f(p) = \left(\frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z}\right) = (0,0,0)`;

  /* ── Signals ── */
  readonly presetIdx = signal(0);
  readonly showGradient = signal(false);
  readonly activePreset = computed(() => PRESETS[this.presetIdx()]);

  /* ── Three.js refs ── */
  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;
  private dynamicGroup: THREE.Group | null = null;

  private lastPresetIdx = -1;
  private lastShowGrad = false;

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.rebuildSurface();
    });
  }

  selectPreset(idx: number): void {
    this.presetIdx.set(idx);
    this.rebuildSurface();
  }

  toggleGradient(): void {
    this.showGradient.update(v => !v);
    this.rebuildSurface();
  }

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x141418);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(3.0, 2.2, 3.0);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 10;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.55);
    dirLight.position.set(5, 8, 4);
    this.scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xccddff, 0.2);
    fillLight.position.set(-3, 5, -3);
    this.scene.add(fillLight);

    // Dynamic group
    this.dynamicGroup = new THREE.Group();
    this.scene.add(this.dynamicGroup);

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();

      // Check if rebuild needed
      const idx = this.presetIdx();
      const grad = this.showGradient();
      if (idx !== this.lastPresetIdx || grad !== this.lastShowGrad) {
        this.rebuildSurface();
      }

      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Rebuild surface ── */

  private rebuildSurface(): void {
    if (!this.dynamicGroup || !this.scene) return;
    this.clearGroup(this.dynamicGroup);

    const idx = this.presetIdx();
    const grad = this.showGradient();
    this.lastPresetIdx = idx;
    this.lastShowGrad = grad;

    PRESETS[idx].build(this.dynamicGroup, grad);
  }

  /* ── Utility ── */

  private clearGroup(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      } else if (child instanceof THREE.Line || child instanceof THREE.LineLoop) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else (mat as THREE.Material).dispose();
      } else if (child instanceof THREE.Group) {
        this.clearGroup(child);
      } else {
        // ArrowHelper etc.
        child.traverse((obj: THREE.Object3D) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat.dispose();
          } else if (obj instanceof THREE.Line) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else (mat as THREE.Material).dispose();
          }
        });
      }
    }
  }

  private onResize(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.controls?.dispose();
    if (this.scene) {
      this.scene.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else mat.dispose();
        } else if (obj instanceof THREE.Line || obj instanceof THREE.LineLoop) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach(m => m.dispose());
          else (mat as THREE.Material).dispose();
        }
      });
    }
    this.renderer?.dispose();
    const container = this.containerRef()?.nativeElement;
    if (container && this.renderer) {
      try { container.removeChild(this.renderer.domElement); }
      catch { /* already removed */ }
    }
    this.resizeObserver?.disconnect();
  }
}
