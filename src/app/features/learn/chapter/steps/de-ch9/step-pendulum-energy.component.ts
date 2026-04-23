import {
  Component,
  OnDestroy,
  afterNextRender,
  ElementRef,
  viewChild,
  signal,
  computed,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const COL_BG = 0x141418;

/**
 * Pendulum energy: E(θ, ω) = ω²/2 + (1 - cos θ)
 * (setting m, g, L = 1)
 */
function energy(theta: number, omega: number): number {
  return omega * omega / 2 + (1 - Math.cos(theta));
}

/**
 * Pendulum trajectory (RK4) with periodic θ wrap.
 */
function integratePendulum(
  theta0: number, omega0: number,
  tMax: number, dt = 0.02,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [[theta0, omega0]];
  let theta = theta0, omega = omega0;
  const n = Math.ceil(tMax / dt);
  for (let i = 0; i < n; i++) {
    const f = (th: number, om: number): [number, number] => [om, -Math.sin(th)];
    const [k1a, k1b] = f(theta, omega);
    const [k2a, k2b] = f(theta + (dt / 2) * k1a, omega + (dt / 2) * k1b);
    const [k3a, k3b] = f(theta + (dt / 2) * k2a, omega + (dt / 2) * k2b);
    const [k4a, k4b] = f(theta + dt * k3a, omega + dt * k3b);
    theta += (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
    omega += (dt / 6) * (k1b + 2 * k2b + 2 * k3b + k4b);
    pts.push([theta, omega]);
  }
  return pts;
}

const PX_THETA = 30;
const PX_OMEGA = 30;

@Component({
  selector: 'app-de-ch9-pendulum',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="真實鐘擺：能量守恆與相空間" subtitle="§9.6">
      <p>
        這一章最後看<strong>保守（無阻尼）系統</strong>的完整相空間——用鐘擺當例子。
      </p>
      <div class="centered-eq big">θ″ + sin(θ) = 0</div>
      <p>
        因為沒有阻尼，<strong>能量守恆</strong>：
      </p>
      <div class="centered-eq">
        E(θ, ω) = ω²/2 + (1 − cos θ) = 常數
      </div>
      <p class="key-idea">
        這意味著：相空間的每條軌跡都沿著 <strong>E(θ, ω) = C</strong> 的<strong>等能線</strong>。
        把 E 當成 θ–ω 平面上的「高度」，你就有一個地形——軌跡是沿著等高線走的。
      </p>
      <p>
        這個地形有三個關鍵特徵：
      </p>
      <ul>
        <li><strong>凹陷區（E &lt; 2）</strong>：低能量，鐘擺在底部附近擺動——閉合軌道（振盪）</li>
        <li><strong>隆起區（E &gt; 2）</strong>：高能量，鐘擺繞圈旋轉——開放軌道（旋轉）</li>
        <li><strong>分隔線 E = 2</strong>：<strong>separatrix</strong>——連接不穩定的「倒立」平衡點</li>
      </ul>
    </app-prose-block>

    <app-challenge-card prompt="3D 能量曲面：拖動旋轉、投影到 θ–ω 平面看等高線">
      <div #threeContainer class="three-stage"></div>

      <div class="controls-3d">
        <button class="reset-btn" (click)="resetCamera()">↻ 3D 視角</button>
        <button class="cycle-btn" (click)="addTrajectory(1, 0)">加入振盪軌跡</button>
        <button class="cycle-btn" (click)="addTrajectory(2.9, 0)">加入大擺幅</button>
        <button class="cycle-btn" (click)="addTrajectory(0, 2.2)">加入旋轉軌跡</button>
        <button class="clear-btn" (click)="clearTrajectories()">清除</button>
      </div>

      <div class="regime-boxes">
        <div class="regime osc">
          <div class="r-label">振盪（E &lt; 2）</div>
          <p>相空間中的<strong>閉合橢圓</strong>。鐘擺在 ±π 之間擺動。小振幅接近橢圓（線性化），大振幅變形。</p>
        </div>
        <div class="regime sep">
          <div class="r-label">Separatrix（E = 2）</div>
          <p>臨界能量。軌跡<strong>無限接近但永遠到不了</strong>倒立點。要花無窮時間——這是真實鐘擺理論上的奇異性。</p>
        </div>
        <div class="regime rot">
          <div class="r-label">旋轉（E &gt; 2）</div>
          <p>鐘擺繞過頂點連續旋轉。在 (θ, ω) 平面上是<strong>單調增加 θ 的線</strong>（或減少，視方向）。</p>
        </div>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="Ch10 預告：當參數跨越臨界——分岔與混沌">
      <div class="ch10-preview">
        <div class="preview-intro">
          Ch9 處理的非線性系統都有<strong>固定參數</strong>。Ch10 要問一個更深的問題：
          <strong>系統行為如何隨參數變化</strong>？
        </div>

        <div class="topics-grid">
          <div class="topic-card" style="--col: #c87b5e">
            <div class="t-name">分岔（Bifurcation）</div>
            <p>
              參數穿越某個臨界值時，平衡點會突然出現、消失、或改變穩定性。
              Ch3 §3.6 的 Logistic 捕撈已經看過 saddle-node 分岔；
              Ch10 會細看 <strong>pitchfork</strong>、<strong>Hopf</strong> 等類型。
            </p>
          </div>

          <div class="topic-card" style="--col: #8b6aa8">
            <div class="t-name">Hopf 分岔</div>
            <p>
              極限環如何從平衡點<strong>冒出來</strong>？當穩定焦點的特徵值跨越虛軸時，
              一個極限環從無到有誕生——像心肌細胞開始規律跳動。
            </p>
          </div>

          <div class="topic-card" style="--col: #a85c7b">
            <div class="t-name">混沌（Chaos）</div>
            <p>
              某些非線性系統（3D 以上）對初值<strong>極度敏感</strong>——
              兩條幾乎相同的初始軌跡很快分道揚鑣。著名例子：Lorenz 吸引子、雙擺。
            </p>
          </div>

          <div class="topic-card" style="--col: #5a8aa8">
            <div class="t-name">Logistic 映射與倍週期</div>
            <p>
              離散版的分岔：<code>x_(n+1) = r·x_n·(1 − x_n)</code>。
              r 從小到大時，穩定點 → 倍週期 → 四倍週期 → ⋯ → 混沌。
              Mandelbrot 碎形就是這故事的延伸。
            </p>
          </div>
        </div>

        <div class="bridge-note">
          <strong>這三章構成一個完整故事：</strong>
          Ch8 線性的乾淨分類 → Ch9 非線性的平衡點分析 → Ch10 參數改變時的質變（分岔與混沌）。
          學完 Ch10 你就能理解天氣為什麼難預測、心律為什麼會失常、生態系統為什麼會崩潰。
        </div>

        <a class="next-cta" href="/learn/de/ch10/1">
          下一章 — Ch10：分岔與混沌 →
        </a>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        保守系統（無阻尼）有<strong>能量守恆</strong>——相空間軌跡沿著 E = 常數 的等高線走。
        鐘擺展示了這個結構的完整家譜：振盪、separatrix、旋轉。
        而 separatrix 的出現是「參數改變行為」的前兆——下一章主題。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center;
      padding: 12px;
      background: var(--accent-10);
      border-radius: 8px;
      font-size: 17px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      font-weight: 600;
      margin: 10px 0;
    }
    .centered-eq.big { font-size: 20px; padding: 16px; }

    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .three-stage {
      width: 100%;
      height: 360px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
      margin-bottom: 12px;
      background: #141418;
    }

    .controls-3d {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .reset-btn, .cycle-btn, .clear-btn {
      font: inherit;
      font-size: 12px;
      padding: 6px 12px;
      border: 1.5px solid var(--accent);
      background: var(--accent);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn, .clear-btn {
      background: transparent;
      color: var(--accent);
    }

    .cycle-btn {
      background: transparent;
      color: var(--accent);
      border-style: dashed;
    }

    .regime-boxes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }

    .regime {
      padding: 12px 14px;
      border-radius: 10px;
      border: 1.5px solid;
    }

    .regime.osc {
      border-color: rgba(92, 168, 120, 0.45);
      background: rgba(92, 168, 120, 0.06);
    }

    .regime.sep {
      border-color: rgba(244, 200, 102, 0.45);
      background: rgba(244, 200, 102, 0.06);
    }

    .regime.rot {
      border-color: rgba(200, 123, 94, 0.45);
      background: rgba(200, 123, 94, 0.06);
    }

    .r-label {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .regime.osc .r-label { color: #5ca878; }
    .regime.sep .r-label { color: #ba8d2a; }
    .regime.rot .r-label { color: #c87b5e; }

    .regime p {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .ch10-preview {
      padding: 18px;
      border: 1.5px solid var(--accent);
      background: var(--accent-10);
      border-radius: 12px;
    }

    .preview-intro {
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }

    .preview-intro strong {
      color: var(--accent);
    }

    .topics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }

    .topic-card {
      padding: 12px;
      border-left: 3px solid var(--col);
      background: var(--bg);
      border-radius: 0 8px 8px 0;
    }

    .t-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--col);
      margin-bottom: 6px;
    }

    .topic-card p {
      margin: 0;
      font-size: 12px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .bridge-note {
      padding: 12px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }

    .bridge-note strong {
      color: var(--accent);
    }

    .next-cta {
      display: inline-block;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 700;
      background: var(--accent);
      color: white;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.15s;
    }

    .next-cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px var(--accent-30);
    }
  `,
})
export class DeCh9PendulumComponent implements OnDestroy {
  readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('threeContainer');

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animId = 0;
  private resizeObserver: ResizeObserver | null = null;

  private surfaceMesh: THREE.Mesh | null = null;
  private trajectoryLines: THREE.Line[] = [];
  private separatrixLine: THREE.Line | null = null;

  constructor() {
    afterNextRender(() => {
      this.initThree();
      // Default trajectories
      this.addTrajectory(1, 0);
      this.addTrajectory(2.5, 0);
      this.addTrajectory(0, 2.5);
    });
  }

  ngOnDestroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer) {
      this.renderer.dispose();
      const canvas = this.renderer.domElement;
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    }
  }

  resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(6, 5, 7);
    this.controls.target.set(0, 1, 0);
    this.controls.update();
  }

  addTrajectory(theta0: number, omega0: number): void {
    if (!this.scene) return;
    const pts = integratePendulum(theta0, omega0, 20, 0.02);
    const e = energy(theta0, omega0);

    // Convert to 3D points: x = theta, y = E (height), z = omega
    const points3d = pts.map(([th, om]) => {
      // Wrap theta to [-π, π] for plotting in a single period
      let thWrap = th;
      while (thWrap > Math.PI) thWrap -= 2 * Math.PI;
      while (thWrap < -Math.PI) thWrap += 2 * Math.PI;
      return new THREE.Vector3(thWrap, e, om);
    });

    // Color by regime
    const color = e < 1.98 ? 0x5ca878 : e > 2.02 ? 0xc87b5e : 0xba8d2a;

    const geom = new THREE.BufferGeometry().setFromPoints(points3d);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
    const line = new THREE.Line(geom, mat);
    this.scene.add(line);
    this.trajectoryLines.push(line);
  }

  clearTrajectories(): void {
    if (!this.scene) return;
    for (const line of this.trajectoryLines) {
      this.scene.remove(line);
      line.geometry.dispose();
    }
    this.trajectoryLines = [];
  }

  private initThree(): void {
    const container = this.containerRef()?.nativeElement;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight || 360;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COL_BG);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(6, 5, 7);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 30;
    this.controls.target.set(0, 1, 0);
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffeedd, 0.65);
    dir.position.set(4, 8, 4);
    this.scene.add(dir);

    // Axes
    this.addAxis('θ', 1, 0, 0, Math.PI + 0.5, 0xc87b5e);
    this.addAxis('E', 0, 1, 0, 4, 0xffffff);
    this.addAxis('ω', 0, 0, 1, 3.5, 0x5a8aa8);

    this.addLabel('θ', Math.PI + 0.8, 0, 0, '#c87b5e');
    this.addLabel('E', 0, 4.3, 0, '#ffffff');
    this.addLabel('ω', 0, 0, 3.8, '#5a8aa8');

    // Energy surface
    this.buildSurface();

    // Separatrix (E = 2): parametric curve in (θ, 2, ω)
    this.addSeparatrix();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      this.controls!.update();
      this.renderer!.render(this.scene!, this.camera!);
    };
    this.animId = requestAnimationFrame(animate);
  }

  private buildSurface(): void {
    if (!this.scene) return;

    const thSegs = 50;
    const omSegs = 40;
    const thMax = Math.PI;
    const omMax = 3;

    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i <= thSegs; i++) {
      for (let j = 0; j <= omSegs; j++) {
        const theta = -thMax + (i / thSegs) * 2 * thMax;
        const omega = -omMax + (j / omSegs) * 2 * omMax;
        const E = energy(theta, omega);
        const clampedE = Math.min(4, E);
        vertices.push(theta, clampedE, omega);

        // Color by E value
        const t = Math.min(1, clampedE / 4);
        const hue = 0.4 - t * 0.35; // green-ish low, red high
        const col = new THREE.Color().setHSL(hue, 0.5, 0.4 + t * 0.15);
        colors.push(col.r, col.g, col.b);
      }
    }

    for (let i = 0; i < thSegs; i++) {
      for (let j = 0; j < omSegs; j++) {
        const a = i * (omSegs + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (omSegs + 1) + j;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.78,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
    });

    this.surfaceMesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.surfaceMesh);

    // Wireframe overlay
    const wire = new THREE.Mesh(
      geom.clone(),
      new THREE.MeshBasicMaterial({
        color: 0x444444,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      }),
    );
    this.scene.add(wire);
  }

  private addSeparatrix(): void {
    if (!this.scene) return;
    // Separatrix: E = 2 → ω² / 2 + (1 − cos θ) = 2 → ω = ±√(2(1 + cos θ))
    const pts: THREE.Vector3[] = [];
    const n = 80;
    for (let i = 0; i <= n; i++) {
      const theta = -Math.PI + (i / n) * 2 * Math.PI;
      const omega = Math.sqrt(Math.max(0, 2 * (1 + Math.cos(theta))));
      pts.push(new THREE.Vector3(theta, 2, omega));
    }
    for (let i = n; i >= 0; i--) {
      const theta = -Math.PI + (i / n) * 2 * Math.PI;
      const omega = -Math.sqrt(Math.max(0, 2 * (1 + Math.cos(theta))));
      pts.push(new THREE.Vector3(theta, 2, omega));
    }

    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: 0xba8d2a, linewidth: 2 });
    this.separatrixLine = new THREE.Line(geom, mat);
    this.scene.add(this.separatrixLine);
  }

  private addAxis(
    _label: string,
    dx: number, dy: number, dz: number,
    length: number, color: number,
  ): void {
    const dir = new THREE.Vector3(dx, dy, dz).normalize();
    const arrow = new THREE.ArrowHelper(
      dir, new THREE.Vector3(0, 0, 0), length, color, 0.15, 0.08,
    );
    this.scene!.add(arrow);
  }

  private addLabel(text: string, x: number, y: number, z: number, color: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 36);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(0.6, 0.6, 0.6);
    this.scene!.add(sprite);
  }

  private onResize(): void {
    const c = this.containerRef()?.nativeElement;
    if (!c || !this.renderer || !this.camera) return;
    const w = c.clientWidth;
    const h = c.clientHeight || 360;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
