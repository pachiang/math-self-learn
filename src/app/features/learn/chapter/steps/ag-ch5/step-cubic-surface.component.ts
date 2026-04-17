import {
  Component, signal, ElementRef, viewChild,
  afterNextRender, OnDestroy,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const COL_BG = 0x141418;
const SURFACE_RES = 100;
const RANGE = 1.5;
const LINE_COLORS = [0xc06060, 0x5a8a5a, 0x5a7aaa];

/** Real cube root that handles negative values. */
function cbrt(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 1 / 3);
}

@Component({
  selector: 'app-step-cubic-surface',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="三次曲面與 27 條直線" subtitle="&sect;5.3">
      <p>
        關於三次曲面最著名的定理：<strong>射影三維空間中的每一個光滑三次曲面
        恰好包含 27 條直線</strong>（Cayley-Salmon 定理，1849 年）。
        這是一個驚人的結果——一個彎曲的曲面竟然能包含完全筆直的直線！
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        我們用 Fermat 三次曲面來視覺化這個現象：
      </p>
      <app-math block [e]="fermatTex" />
      <p>
        在實數域上，它包含 3 條可見的直線：
      </p>
      <ul>
        <li>
          <app-math [e]="'L_1: (t,\\,-t,\\,1)'" /> — 位於平面 z = 1 上
        </li>
        <li>
          <app-math [e]="'L_2: (t,\\,1,\\,-t)'" /> — 位於平面 y = 1 上
        </li>
        <li>
          <app-math [e]="'L_3: (1,\\,t,\\,-t)'" /> — 位於平面 x = 1 上
        </li>
      </ul>
      <p>
        驗證：對 L<sub>1</sub>，
        t<sup>3</sup> + (&minus;t)<sup>3</sup> + 1<sup>3</sup> = 0 + 1 = 1。其餘 24 條直線存在於複數域上。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        27 條直線的相交模式由 E<sub>6</sub> 根系描述——這是數學中最深刻的
        聯繫之一，將代數幾何、李理論和表示論連結在一起。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="旋轉 Fermat 三次曲面，找到 3 條直線">
      <!-- Line toggle -->
      <div class="ctrl-row">
        <button class="ctrl-btn" [class.active]="showLines()"
                (click)="showLines.set(!showLines())">
          {{ showLines() ? '隱藏直線' : '顯示直線' }}
        </button>
        <button class="ctrl-btn" (click)="resetCamera()">重置視角</button>
      </div>

      <!-- Three.js container -->
      <div #threeContainer class="three-container"></div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">曲面</div>
          <div class="ic-body">
            <app-math [e]="'x^3 + y^3 + z^3 = 1'" />
          </div>
          <div class="ic-sub">Fermat 三次</div>
        </div>
        <div class="info-card">
          <div class="ic-title">實直線數</div>
          <div class="ic-body accent">3</div>
          <div class="ic-sub">共 27 條，其餘 24 條在 C 上</div>
        </div>
        <div class="info-card">
          <div class="ic-title">定理</div>
          <div class="ic-body">Cayley-Salmon</div>
          <div class="ic-sub">1849</div>
        </div>
      </div>

      @if (showLines()) {
        <div class="legend-row">
          <div class="legend-item">
            <span class="legend-swatch" style="background:#c06060"></span>
            <app-math [e]="'L_1: (t,-t,1)'" />
          </div>
          <div class="legend-item">
            <span class="legend-swatch" style="background:#5a8a5a"></span>
            <app-math [e]="'L_2: (t,1,-t)'" />
          </div>
          <div class="legend-item">
            <span class="legend-swatch" style="background:#5a7aaa"></span>
            <app-math [e]="'L_3: (1,t,-t)'" />
          </div>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        27 條直線定理是代數幾何最優美的經典結果。它展示了代數曲面的幾何遠比
        曲線豐富——即使是「彎曲」的曲面，也能包含完全「筆直」的直線。
      </p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .ctrl-btn {
      padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px;
      cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    }

    .three-container {
      width: 100%; height: 420px;
      border-radius: 10px; border: 1px solid var(--border);
      overflow: hidden; margin-bottom: 10px;
    }

    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .info-card {
      flex: 1; min-width: 100px; padding: 10px 12px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
      font-family: 'JetBrains Mono', monospace;
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 13px; font-weight: 600; color: var(--text); margin-top: 4px;
    }
    .ic-body.accent { color: var(--accent); font-size: 22px; }
    .ic-sub {
      font-size: 10px; color: var(--text-muted); margin-top: 2px;
    }

    .legend-row {
      display: flex; gap: 14px; flex-wrap: wrap;
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface);
    }
    .legend-item {
      display: flex; align-items: center; gap: 6px; font-size: 12px;
    }
    .legend-swatch {
      display: inline-block; width: 14px; height: 14px; border-radius: 3px;
    }
  `,
})
export class StepCubicSurfaceComponent implements OnDestroy {
  readonly fermatTex = String.raw`x^3 + y^3 + z^3 = 1 \quad\text{(Fermat cubic)}`;

  readonly showLines = signal(false);

  /* ── Three.js refs ── */
  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;

  private lineGroup: THREE.Group | null = null;
  private lastShowLines = false;

  constructor() {
    afterNextRender(() => {
      this.initThree();
    });
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(3.2, 2.5, 3.2);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /* ── Three.js initialization ── */

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(3.2, 2.5, 3.2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 12;
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

    // Grid
    const grid = new THREE.GridHelper(6, 16, 0x2a2a30, 0x222228);
    this.scene.add(grid);

    // Build the Fermat cubic surface
    this.buildFermatSurface();

    // Build lines (initially hidden)
    this.lineGroup = new THREE.Group();
    this.lineGroup.visible = false;
    this.buildLines();
    this.scene.add(this.lineGroup);

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();

      // Toggle line visibility
      const show = this.showLines();
      if (show !== this.lastShowLines) {
        this.lastShowLines = show;
        if (this.lineGroup) this.lineGroup.visible = show;
      }

      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Build Fermat cubic surface z = cbrt(1 - x³ - y³) ── */

  private buildFermatSurface(): void {
    if (!this.scene) return;

    const segs = SURFACE_RES;
    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i <= segs; i++) {
      for (let j = 0; j <= segs; j++) {
        const xMath = -RANGE + (i / segs) * (2 * RANGE);
        const yMath = -RANGE + (j / segs) * (2 * RANGE);
        const val = 1 - xMath * xMath * xMath - yMath * yMath * yMath;
        const zMath = cbrt(val);

        // Three.js coords: (x_math, z_math as height, y_math)
        vertices.push(xMath, zMath, yMath);

        // Domain coloring: hue from atan2(y, x), cyclical
        const angle = Math.atan2(yMath, xMath);
        const hue = (angle / (2 * Math.PI) + 1) % 1;
        const col = new THREE.Color().setHSL(hue, 0.35, 0.48);
        colors.push(col.r, col.g, col.b);
      }
    }

    // Generate indices
    for (let i = 0; i < segs; i++) {
      for (let j = 0; j < segs; j++) {
        const a = i * (segs + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (segs + 1) + j;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.82,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    });

    this.scene.add(new THREE.Mesh(geometry, material));

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x444444,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    this.scene.add(new THREE.Mesh(geometry.clone(), wireMat));
  }

  /* ── Build the 3 real lines on the Fermat cubic ── */

  private buildLines(): void {
    if (!this.lineGroup) return;

    const tMin = -2;
    const tMax = 2;
    const nPts = 80;

    // Line 1: math (t, -t, 1) -> THREE (t, 1, -t)
    const pts1: THREE.Vector3[] = [];
    for (let i = 0; i <= nPts; i++) {
      const t = tMin + (i / nPts) * (tMax - tMin);
      pts1.push(new THREE.Vector3(t, 1, -t));
    }
    this.addLine(pts1, LINE_COLORS[0]);

    // Line 2: math (t, 1, -t) -> THREE (t, -t, 1)
    const pts2: THREE.Vector3[] = [];
    for (let i = 0; i <= nPts; i++) {
      const t = tMin + (i / nPts) * (tMax - tMin);
      pts2.push(new THREE.Vector3(t, -t, 1));
    }
    this.addLine(pts2, LINE_COLORS[1]);

    // Line 3: math (1, t, -t) -> THREE (1, -t, t)
    const pts3: THREE.Vector3[] = [];
    for (let i = 0; i <= nPts; i++) {
      const t = tMin + (i / nPts) * (tMax - tMin);
      pts3.push(new THREE.Vector3(1, -t, t));
    }
    this.addLine(pts3, LINE_COLORS[2]);
  }

  private addLine(points: THREE.Vector3[], color: number): void {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 2,
    });
    this.lineGroup!.add(new THREE.Line(geometry, material));

    // Add small spheres at the endpoints for visual emphasis
    const sphereGeo = new THREE.SphereGeometry(0.04, 12, 8);
    const sphereMat = new THREE.MeshStandardMaterial({ color });
    const s1 = new THREE.Mesh(sphereGeo, sphereMat);
    s1.position.copy(points[0]);
    this.lineGroup!.add(s1);
    const s2 = new THREE.Mesh(sphereGeo.clone(), sphereMat.clone());
    s2.position.copy(points[points.length - 1]);
    this.lineGroup!.add(s2);
  }

  /* ── Utility ── */

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
      try { container.removeChild(this.renderer.domElement); } catch { /* already removed */ }
    }
    this.resizeObserver?.disconnect();
  }
}
