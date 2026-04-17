import {
  Component, signal, computed, ElementRef, viewChild,
  afterNextRender, OnDestroy, effect,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { KatexComponent } from '../../../shared/katex/katex.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ── Constants ── */
const COL_BG = 0x141418;
const RES = 80;
const COL_ACCENT = 0x66aaff;
const COL_E = 0xcc5555;
const COL_LINE1 = 0x55cc88;
const COL_LINE2 = 0xddaa44;

@Component({
  selector: 'app-step-what-is-blowup',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent, KatexComponent],
  template: `
    <app-prose-block title="什麼是 Blowup" subtitle="&sect;6.1">
      <p>
        <strong>Blowup</strong> 是代數幾何的「顯微鏡」。
        我們把一個點替換成通過該點的所有<strong>方向</strong>。
        在 <app-math e="\\mathbb{R}^2" /> 的原點，有無窮多個方向——
        每條通過原點的直線對應一個方向。這些方向組成一條射影直線
        <app-math e="\\mathbb{P}^1" />（一個圓）。
      </p>
      <app-math block [e]="formulaBlowup"></app-math>
      <p>
        方程 <app-math e="xt = ys" /> 表示：
        點 (x,y) 位於通過原點、斜率為 t/s 的直線上。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        Blowup 空間生活在三維中：(x, y) 來自原始平面，加上一個方向坐標。
        在原點上方，我們得到一整條線的點（每個方向一個）。
        在其他任何點上方，只有唯一一個點（通向原點的方向已被確定）。
      </p>
      <p>
        那條替代原點的「額外」線稱為<strong>例外除子 E</strong>（exceptional divisor）。
      </p>
    </app-prose-block>

    <app-prose-block>
      <p>
        為什麼有用？如果一條曲線在原點有奇異點（兩條分支交叉），
        blowup 會<strong>分離</strong>這些分支——
        每條分支到達 E 的不同位置，因為它們從不同方向接近原點！
      </p>
    </app-prose-block>

    <app-challenge-card prompt="旋轉 3D blowup 空間——原點被一條線（例外除子 E）取代">
      <!-- Three.js container -->
      <div #threeContainer class="three-container"></div>

      <!-- Controls -->
      <div class="ctrl-row">
        <button class="ctrl-btn" (click)="resetCamera()">重置視角</button>
        <button class="ctrl-btn" [class.active]="showLines()"
                (click)="showLines.set(!showLines())">
          {{ showLines() ? '隱藏示例直線' : '顯示示例直線' }}
        </button>
      </div>

      <!-- Info cards -->
      <div class="info-row">
        <div class="info-card">
          <div class="ic-title">原點 (0,0)</div>
          <div class="ic-body accent">
            例外除子 <app-math e="E \\cong \\mathbb{P}^1" />
          </div>
        </div>
        <div class="info-card">
          <div class="ic-title">通過原點的直線</div>
          <div class="ic-body">在 blowup 上被分離到不同高度</div>
        </div>
      </div>

      @if (showLines()) {
        <div class="legend-row">
          <span class="legend-dot" style="background:#55cc88"></span>
          <span class="legend-text">y = x (斜率 s=1)</span>
          <span class="legend-dot" style="background:#ddaa44"></span>
          <span class="legend-text">y = 2x (斜率 s=2)</span>
          <span class="legend-dot" style="background:#cc5555"></span>
          <span class="legend-text">E (例外除子)</span>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        Blowup 的精髓：原點被「炸開」成一條線，
        每個方向對應線上的一個點。
        通過原點的不同曲線被分離到 E 的不同位置。
        下一節看這如何消解奇異點。
      </p>
    </app-prose-block>
  `,
  styles: `
    .three-container {
      width: 100%; height: 440px;
      border-radius: 10px; border: 1px solid var(--border);
      overflow: hidden; margin-bottom: 10px;
    }

    .ctrl-row {
      display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
    }
    .ctrl-btn {
      padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px;
      cursor: pointer; font-family: 'JetBrains Mono', monospace;
      transition: background 0.15s, border-color 0.15s;
      &:hover { background: var(--accent-10); color: var(--accent); border-color: var(--accent-30); }
      &.active { background: var(--accent-10); border-color: var(--accent); color: var(--accent); }
    }

    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
    }
    .info-card {
      flex: 1; min-width: 140px; padding: 10px 12px; border: 1px solid var(--border);
      border-radius: 8px; text-align: center; background: var(--bg-surface);
    }
    .ic-title {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .ic-body {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 4px;
    }
    .ic-body.accent { color: var(--accent); }

    .legend-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); font-size: 12px; color: var(--text-secondary);
    }
    .legend-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .legend-text {
      font-family: 'JetBrains Mono', monospace; margin-right: 12px;
    }
  `,
})
export class StepWhatIsBlowupComponent implements OnDestroy {
  readonly formulaBlowup =
    `\\text{Bl}_0(\\mathbb{R}^2) = \\{(x, y, [s:t]) \\in \\mathbb{R}^2 \\times \\mathbb{P}^1 : xt = ys\\}`;

  readonly showLines = signal(true);

  /* ── Three.js refs ── */
  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId = 0;
  private resizeObserver: ResizeObserver | null = null;
  private dynamicGroup: THREE.Group | null = null;
  private lineGroup: THREE.Group | null = null;

  constructor() {
    afterNextRender(() => {
      this.initThree();
    });

    effect(() => {
      const show = this.showLines();
      if (this.lineGroup) {
        this.lineGroup.visible = show;
      }
    });
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(3.2, 2.5, 3.8);
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
    this.camera.position.set(3.2, 2.5, 3.8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 14;
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

    // Dynamic group for the blowup surface
    this.dynamicGroup = new THREE.Group();
    this.scene.add(this.dynamicGroup);

    // Line group for example lines
    this.lineGroup = new THREE.Group();
    this.lineGroup.visible = this.showLines();
    this.scene.add(this.lineGroup);

    this.buildBlowupSurface();
    this.buildExceptionalDivisor();
    this.buildExampleLines();
    this.buildAxisLabels();

    // Animation loop
    const animate = (): void => {
      this.animFrameId = requestAnimationFrame(animate);
      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    animate();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);
  }

  /* ── Build blowup surface: y = x*s in (x, s, y)-space ── */
  /* Three.js coords: x_three = x, y_three = s (direction axis, vertical), z_three = y = x*s */

  private buildBlowupSurface(): void {
    if (!this.dynamicGroup) return;

    const xMin = -2, xMax = 2;
    const sMin = -2, sMax = 2;
    const segs = RES;

    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i <= segs; i++) {
      for (let j = 0; j <= segs; j++) {
        const x = xMin + (i / segs) * (xMax - xMin);
        const s = sMin + (j / segs) * (sMax - sMin);
        const y = x * s; // blowup equation

        // Three.js: x_three = x, y_three = s, z_three = y
        vertices.push(x, s, y);

        // Color: use a gradient based on |s| and x for visual appeal
        const h = 0.58 + s * 0.04;   // slight hue shift by direction
        const sat = 0.3;
        const light = 0.35 + Math.abs(x) * 0.08;
        const col = new THREE.Color().setHSL(h % 1, sat, Math.min(light, 0.6));
        colors.push(col.r, col.g, col.b);
      }
    }

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
      opacity: 0.72,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.dynamicGroup.add(mesh);

    // Wireframe overlay
    const wire = new THREE.Mesh(
      geometry.clone(),
      new THREE.MeshBasicMaterial({
        color: 0x444444,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
      }),
    );
    this.dynamicGroup.add(wire);

    // Semi-transparent base plane (original R^2 at s=0 conceptually, shown as the z=0 plane)
    const planeGeo = new THREE.PlaneGeometry(4, 4);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a4a,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      roughness: 0.82,
      metalness: 0.0,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    // Plane at y_three = 0 (s = 0), in xz-plane
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    this.dynamicGroup.add(plane);
  }

  /* ── Exceptional divisor E: x=0, so (0, s, 0) for all s ── */

  private buildExceptionalDivisor(): void {
    if (!this.dynamicGroup) return;

    const points: THREE.Vector3[] = [];
    for (let j = 0; j <= 60; j++) {
      const s = -2.2 + (j / 60) * 4.4;
      points.push(new THREE.Vector3(0, s, 0));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: COL_E, linewidth: 2 });
    const line = new THREE.Line(geo, mat);
    this.dynamicGroup.add(line);

    // Glow tube around E for emphasis
    const tubePoints = [
      new THREE.Vector3(0, -2.2, 0),
      new THREE.Vector3(0, 2.2, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(tubePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: COL_E,
      emissive: COL_E,
      emissiveIntensity: 0.5,
      roughness: 0.82,
      metalness: 0.0,
    });
    this.dynamicGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
  }

  /* ── Example lines on the blowup surface ── */

  private buildExampleLines(): void {
    if (!this.lineGroup) return;

    // Line y = x (slope 1): on blowup, (x, 1, x) for x in [-2,2]
    const pts1: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = -2 + (i / 60) * 4;
      pts1.push(new THREE.Vector3(x, 1, x));
    }
    const geo1 = new THREE.BufferGeometry().setFromPoints(pts1);
    const mat1 = new THREE.LineBasicMaterial({ color: COL_LINE1, linewidth: 2 });
    this.lineGroup.add(new THREE.Line(geo1, mat1));

    // Tube for line 1
    const curve1 = new THREE.CatmullRomCurve3(pts1);
    const tube1 = new THREE.TubeGeometry(curve1, 40, 0.025, 6, false);
    const tubeMat1 = new THREE.MeshStandardMaterial({
      color: COL_LINE1, emissive: COL_LINE1, emissiveIntensity: 0.3,
      roughness: 0.82, metalness: 0.0,
    });
    this.lineGroup.add(new THREE.Mesh(tube1, tubeMat1));

    // Line y = 2x (slope 2): on blowup, (x, 2, 2x) for x in [-2,2]
    const pts2: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = -2 + (i / 60) * 4;
      pts2.push(new THREE.Vector3(x, 2, 2 * x));
    }
    const geo2 = new THREE.BufferGeometry().setFromPoints(pts2);
    const mat2 = new THREE.LineBasicMaterial({ color: COL_LINE2, linewidth: 2 });
    this.lineGroup.add(new THREE.Line(geo2, mat2));

    // Tube for line 2
    const curve2 = new THREE.CatmullRomCurve3(pts2);
    const tube2 = new THREE.TubeGeometry(curve2, 40, 0.025, 6, false);
    const tubeMat2 = new THREE.MeshStandardMaterial({
      color: COL_LINE2, emissive: COL_LINE2, emissiveIntensity: 0.3,
      roughness: 0.82, metalness: 0.0,
    });
    this.lineGroup.add(new THREE.Mesh(tube2, tubeMat2));

    // Dots where lines meet E (at x=0)
    const dotGeo = new THREE.SphereGeometry(0.06, 16, 16);

    // s=1 dot
    const dotMat1 = new THREE.MeshStandardMaterial({
      color: COL_LINE1, emissive: COL_LINE1, emissiveIntensity: 0.5,
      roughness: 0.82, metalness: 0.0,
    });
    const dot1 = new THREE.Mesh(dotGeo, dotMat1);
    dot1.position.set(0, 1, 0);
    this.lineGroup.add(dot1);

    // s=2 dot
    const dotMat2 = new THREE.MeshStandardMaterial({
      color: COL_LINE2, emissive: COL_LINE2, emissiveIntensity: 0.5,
      roughness: 0.82, metalness: 0.0,
    });
    const dot2 = new THREE.Mesh(dotGeo.clone(), dotMat2);
    dot2.position.set(0, 2, 0);
    this.lineGroup.add(dot2);
  }

  /* ── Axis labels using sprites ── */

  private buildAxisLabels(): void {
    if (!this.dynamicGroup) return;

    const makeLabel = (text: string, position: THREE.Vector3, color: string): THREE.Sprite => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.font = 'bold 28px JetBrains Mono, monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 32);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(position);
      sprite.scale.set(0.6, 0.3, 1);
      return sprite;
    };

    this.dynamicGroup.add(makeLabel('x', new THREE.Vector3(2.4, 0, 0), '#aaaaaa'));
    this.dynamicGroup.add(makeLabel('s (方向)', new THREE.Vector3(0, 2.5, 0), '#cc5555'));
    this.dynamicGroup.add(makeLabel('y = xs', new THREE.Vector3(0, 0, 2.4), '#8888cc'));
    this.dynamicGroup.add(makeLabel('E', new THREE.Vector3(0.25, 2.3, 0.15), '#cc5555'));
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
        } else if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
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
