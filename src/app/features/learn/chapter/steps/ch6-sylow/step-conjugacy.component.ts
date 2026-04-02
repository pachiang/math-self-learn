import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { Group, GroupElement, GeometricTransform } from '../../../../../core/math/group';
import { createDihedralGroup } from '../../../../../core/math/groups/dihedral';

const CLASS_COLORS = ['var(--v2)', 'var(--v1)', 'var(--v0)'];
const VERT_COLORS = ['#bf9e93', '#8da3b5', '#9aab82'];

/** Build the CSS transform string for a given geometric transform. */
function cssFor(t: GeometricTransform): string {
  if (t.type === 'identity') return 'none';
  if (t.type === 'rotation') return `rotate(${t.angleDeg}deg)`;
  return `rotate3d(${t.axisDx.toFixed(4)}, ${t.axisDy.toFixed(4)}, 0, 180deg)`;
}

/** Compute cumulative CSS transform for chained elements (applied right-to-left). */
function cssCumulative(group: Group, elements: GroupElement[]): string {
  if (elements.length === 0) return 'none';
  let product = group.identity;
  for (const el of elements) {
    product = group.multiply(el, product);
  }
  return cssFor(product.transform);
}

/** Duration for one animation step based on transform type. */
function stepDuration(t: GeometricTransform): number {
  if (t.type === 'identity') return 300;
  if (t.type === 'rotation') return 400 + Math.abs(t.angleDeg) * 1.5;
  return 600;
}

@Component({
  selector: 'app-step-conjugacy',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5171\u8EDB\u8207\u5171\u8EDB\u985E" subtitle="\u00A76.1">
      <p>
        \u5169\u500B\u7FA4\u5143\u7D20 a \u548C b \u662F<strong>\u5171\u8EDB\u7684</strong>\uFF0C
        \u5982\u679C\u5B58\u5728 g \u4F7F\u5F97 b = gag\u207B\u00B9\u3002
      </p>
      <p>
        \u76F4\u89BA\uFF1A\u300C\u5148\u63DB\u89D2\u5EA6\uFF08g\uFF09\uFF0C\u505A\u540C\u4E00\u4EF6\u4E8B\uFF08a\uFF09\uFF0C\u63DB\u56DE\u4F86\uFF08g\u207B\u00B9\uFF09\u300D\u3002
        \u5982\u679C\u672C\u8CEA\u4E0A\u505A\u7684\u662F\u540C\u4E00\u4EF6\u4E8B\uFF0C\u53EA\u662F\u89D2\u5EA6\u4E0D\u540C\uFF0C\u5B83\u5011\u5C31\u662F\u5171\u8EDB\u7684\u3002
      </p>
    </app-prose-block>

    <!-- Part 1: Gallery with whole-shape hover animation -->
    <app-challenge-card
      prompt="\u6ED1\u9F20\u79FB\u5230\u5143\u7D20\u4E0A\uFF0C\u770B\u4E09\u89D2\u5F62\u65CB\u8F49\u6216\u7FFB\u8F49 \u2014 \u540C\u4E00\u985E\u7684\u300C\u52D5\u4F5C\u4E00\u6A23\u300D"
    >
      <div class="class-gallery">
        @for (cls of classes(); track $index; let ci = $index) {
          <div class="class-group">
            <div class="class-header" [style.border-left-color]="CLASS_COLORS[ci]">
              <span class="class-dot" [style.background]="CLASS_COLORS[ci]"></span>
              \u5171\u8EDB\u985E {{ ci + 1 }}
              @if (cls.length === 1) { <span class="center-tag">\u2208 Z(G)</span> }
            </div>
            <div class="class-elements">
              @for (el of cls; track el.id) {
                <div class="el-viz"
                  (mouseenter)="hoverEl.set(el.id)"
                  (mouseleave)="hoverEl.set(null)">
                  <div class="mini-perspective">
                    <div class="mini-shape"
                      [style.transform]="hoverEl() === el.id ? galleryCss(el) : 'none'"
                      [style.transition]="'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'">
                      <svg viewBox="-35 -35 70 70" class="mini-svg">
                        <polygon [attr.points]="miniPts" fill="none" stroke="var(--border)" stroke-width="1.5" stroke-linejoin="round" />
                        @for (vi of [0,1,2]; track vi) {
                          <circle [attr.cx]="miniV[vi][0]" [attr.cy]="miniV[vi][1]" r="7"
                            [attr.fill]="VERT_COLORS[vi]" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
                          <text [attr.x]="miniV[vi][0]" [attr.y]="miniV[vi][1]" class="v-label">{{ vi }}</text>
                        }
                      </svg>
                    </div>
                  </div>
                  <div class="el-name">{{ el.label }}</div>
                  <div class="el-type">{{ typeOf(el) }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>
      <div class="gallery-insight">
        \u540C\u4E00\u985E\u7684\u5143\u7D20\u505A\u7684\u662F<strong>\u540C\u4E00\u7A2E\u52D5\u4F5C</strong>\uFF1A
        r \u548C r\u00B2 \u90FD\u662F\u65CB\u8F49\uFF0C\u4E09\u500B\u93E1\u5C04\u90FD\u662F\u7FFB\u8F49\u3002
      </div>
    </app-challenge-card>

    <!-- Part 2: Conjugation calculator with 3D animation -->
    <app-prose-block title="\u5171\u8EDB\u8A08\u7B97\u5668">
      <p>\u9078 g \u548C x\uFF0C\u6309\u64AD\u653E\u770B\u4E09\u6B65\u52D5\u756B\uFF1Ag \u2192 x \u2192 g\u207B\u00B9</p>
    </app-prose-block>

    <app-challenge-card prompt="\u770B\u5230 gxg\u207B\u00B9 \u7684\u5E7E\u4F55\u904E\u7A0B">
      <div class="calc-section">
        <div class="calc-pickers">
          <div class="calc-pick">
            <span class="pick-label">g =</span>
            <div class="pick-btns">
              @for (el of d3.elements; track el.id) {
                <button class="pick-btn" [class.active]="selG() === el.id"
                  (click)="selG.set(el.id); resetAnim()">{{ el.label }}</button>
              }
            </div>
          </div>
          <div class="calc-pick">
            <span class="pick-label">x =</span>
            <div class="pick-btns">
              @for (el of d3.elements; track el.id) {
                <button class="pick-btn" [class.active]="selX() === el.id"
                  (click)="selX.set(el.id); resetAnim()">{{ el.label }}</button>
              }
            </div>
          </div>
        </div>

        <!-- 3D animated triangle -->
        <div class="anim-wrapper">
          <div class="anim-perspective">
            <div class="anim-shape"
              [style.transform]="animCssTransform()"
              [style.transition]="animTransition()">
              <svg viewBox="-80 -80 160 160" class="anim-svg">
                <polygon [attr.points]="bigPts" fill="var(--polygon-fill)" stroke="var(--polygon-stroke)" stroke-width="2" stroke-linejoin="round" />
                @for (vi of [0,1,2]; track vi) {
                  <circle [attr.cx]="bigV[vi][0]" [attr.cy]="bigV[vi][1]" r="14"
                    [attr.fill]="VERT_COLORS[vi]" stroke="var(--marker-stroke)" stroke-width="2"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />
                  <text [attr.x]="bigV[vi][0]" [attr.y]="bigV[vi][1]" class="big-v-label">{{ vi }}</text>
                }
              </svg>
            </div>
          </div>
          <button class="play-btn" (click)="playAnimation()" [disabled]="animStep() > 0 && animStep() < 4">
            @if (animStep() === 0) { \u25B6 \u64AD\u653E }
            @else if (animStep() < 4) { \u64AD\u653E\u4E2D... }
            @else { \u21BA \u91CD\u64AD }
          </button>
        </div>

        <!-- Step indicators -->
        <div class="step-indicators">
          <div class="step-ind" [class.active]="animStep() === 1" [class.done]="animStep() > 1">
            <span class="si-num">1</span>
            <div class="si-body">
              <span class="si-text">g = {{ gEl().label }}</span>
              <span class="si-desc">\u63DB\u89D2\u5EA6</span>
            </div>
          </div>
          <div class="si-arrow">\u2192</div>
          <div class="step-ind" [class.active]="animStep() === 2" [class.done]="animStep() > 2">
            <span class="si-num">2</span>
            <div class="si-body">
              <span class="si-text">x = {{ xEl().label }}</span>
              <span class="si-desc">\u505A\u4E8B\u60C5</span>
            </div>
          </div>
          <div class="si-arrow">\u2192</div>
          <div class="step-ind" [class.active]="animStep() === 3" [class.done]="animStep() > 3">
            <span class="si-num">3</span>
            <div class="si-body">
              <span class="si-text">g\u207B\u00B9 = {{ gInvEl().label }}</span>
              <span class="si-desc">\u63DB\u56DE\u4F86</span>
            </div>
          </div>
        </div>

        @if (animStep() >= 4) {
          <div class="calc-result" [style.border-color]="resultClassColor()">
            <div class="cr-formula">
              {{ gEl().label }} \u00B7 {{ xEl().label }} \u00B7 {{ gInvEl().label }}
              = <strong>{{ resultEl().label }}</strong>
            </div>
            <div class="cr-conclusion">
              {{ xEl().label }} \u548C {{ resultEl().label }}
              \u5C6C\u65BC<strong>\u540C\u4E00\u500B\u5171\u8EDB\u985E</strong>
            </div>
          </div>
        }
      </div>
    </app-challenge-card>

    <!-- Center -->
    <app-prose-block>
      <div class="center-section">
        <div class="cs-title">\u4E2D\u5FC3 Z(G)\uFF1A</div>
        <div class="cs-els">
          @for (el of center(); track el.id) {
            <span class="cs-el">{{ el.label }}</span>
          }
        </div>
        <div class="cs-note">\u5171\u8EDB\u985E\u5927\u5C0F = 1 = \u63DB\u4EC0\u9EBC\u89D2\u5EA6\u90FD\u4E00\u6A23 = \u8DDF\u6240\u6709\u5143\u7D20\u4EA4\u63DB\u3002</div>
      </div>
      <span class="hint">\u5171\u8EDB\u985E\u7684\u5927\u5C0F\u6EFF\u8DB3\u4E00\u500B\u6F02\u4EAE\u7684\u7B49\u5F0F\u3002\u4E0B\u4E00\u7BC0\u898B\u3002</span>
    </app-prose-block>
  `,
  styles: `
    /* ── Gallery ── */
    .class-gallery { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
    .class-group { border: 1px solid var(--border); border-radius: 12px; background: var(--bg); overflow: visible; }
    .class-header {
      display: flex; align-items: center; gap: 8px; padding: 8px 14px;
      font-size: 13px; font-weight: 600; color: var(--text-secondary);
      background: var(--bg-surface); border-bottom: 1px solid var(--border); border-left: 4px solid;
    }
    .class-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .center-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: rgba(90,138,90,0.12); color: #5a8a5a; margin-left: auto; }
    .class-elements { display: flex; gap: 10px; padding: 14px; flex-wrap: wrap; }

    .el-viz { display: flex; flex-direction: column; align-items: center; min-width: 76px; }
    .mini-perspective { perspective: 300px; width: 70px; height: 70px; margin-bottom: 4px; }
    .mini-shape { transform-style: preserve-3d; width: 100%; height: 100%; }
    .mini-svg { width: 100%; height: 100%; display: block; }
    .v-label { font-size: 8px; font-weight: 700; fill: white; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
    .el-name { font-size: 15px; font-weight: 700; color: var(--text); font-family: 'Noto Sans Math', serif; }
    .el-type { font-size: 10px; color: var(--text-muted); }

    .gallery-insight {
      padding: 10px 14px; border-radius: 8px; background: var(--accent-10);
      font-size: 13px; color: var(--text-secondary); line-height: 1.6;
      strong { color: var(--text); }
    }

    /* ── Calculator ── */
    .calc-section { display: flex; flex-direction: column; gap: 14px; }
    .calc-pickers { display: flex; gap: 16px; flex-wrap: wrap; }
    .calc-pick { display: flex; align-items: center; gap: 8px; }
    .pick-label { font-size: 14px; font-weight: 600; color: var(--text-secondary); font-family: 'Noto Sans Math', serif; flex-shrink: 0; }
    .pick-btns { display: flex; gap: 4px; flex-wrap: wrap; }
    .pick-btn {
      padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 14px;
      font-family: 'Noto Sans Math', serif; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 700; }
    }

    /* Animated triangle area */
    .anim-wrapper { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .anim-perspective { perspective: 700px; width: 170px; height: 170px; }
    .anim-shape { transform-style: preserve-3d; width: 100%; height: 100%; will-change: transform; }
    .anim-svg { width: 100%; height: 100%; display: block; }
    .big-v-label { font-size: 13px; font-weight: 700; fill: white; text-anchor: middle; dominant-baseline: central; pointer-events: none; }

    .play-btn {
      padding: 8px 24px; border: 1px solid var(--accent-30); border-radius: 8px;
      background: var(--accent-10); color: var(--accent); font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.12s;
      &:hover:not(:disabled) { background: var(--accent-18); }
      &:disabled { opacity: 0.5; cursor: default; }
    }

    /* Step indicators */
    .step-indicators { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
    .step-ind {
      display: flex; align-items: center; gap: 6px; padding: 6px 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg);
      opacity: 0.35; transition: all 0.3s;
      &.active { opacity: 1; border-color: var(--accent); background: var(--accent-10); }
      &.done { opacity: 0.65; }
    }
    .si-num {
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--border-strong); color: var(--text-muted); font-size: 11px; font-weight: 700;
      .active & { background: var(--accent); color: white; }
      .done & { background: rgba(90,138,90,0.3); color: #5a8a5a; }
    }
    .si-body { display: flex; flex-direction: column; }
    .si-text { font-size: 13px; font-weight: 600; color: var(--text); font-family: 'Noto Sans Math', serif; }
    .si-desc { font-size: 10px; color: var(--text-muted); }
    .si-arrow { font-size: 14px; color: var(--text-muted); }

    /* Result */
    .calc-result {
      padding: 14px 18px; border: 2px solid; border-radius: 10px; background: var(--bg); text-align: center;
    }
    .cr-formula {
      font-size: 18px; font-family: 'Noto Sans Math', serif; color: var(--text); margin-bottom: 4px;
      strong { font-size: 22px; color: var(--accent); }
    }
    .cr-conclusion { font-size: 13px; color: var(--text-secondary); strong { color: var(--text); } }

    /* ── Center ── */
    .center-section {
      padding: 14px 18px; border-radius: 10px;
      background: rgba(90,138,90,0.06); border: 1px solid rgba(90,138,90,0.2); margin-bottom: 12px;
    }
    .cs-title { font-size: 13px; font-weight: 600; color: #5a8a5a; margin-bottom: 8px; }
    .cs-els { display: flex; gap: 8px; margin-bottom: 6px; }
    .cs-el {
      padding: 5px 14px; border-radius: 6px; background: rgba(90,138,90,0.12);
      font-size: 15px; font-weight: 600; color: #5a8a5a; font-family: 'Noto Sans Math', serif;
    }
    .cs-note { font-size: 12px; color: var(--text-muted); }
  `,
})
export class StepConjugacyComponent {
  readonly d3 = createDihedralGroup(3);
  readonly CLASS_COLORS = CLASS_COLORS;
  readonly VERT_COLORS = VERT_COLORS;

  // Equilateral triangle centered at origin (0,0).
  // For a regular triangle with circumradius R:
  //   top = (0, -R), bot-right = (R*sin60, R*cos60), bot-left = (-R*sin60, R*cos60)

  // Mini: R=26 → top(0,-26), bot-right(22.5, 13), bot-left(-22.5, 13)
  readonly miniV = [[0, -26], [22.5, 13], [-22.5, 13]];
  // Big: R=60 → top(0,-60), bot-right(52, 30), bot-left(-52, 30)
  readonly bigV = [[0, -60], [52, 30], [-52, 30]];

  // Pre-computed SVG points strings
  readonly miniPts = this.miniV.map(v => `${v[0]},${v[1]}`).join(' ');
  readonly bigPts = this.bigV.map(v => `${v[0]},${v[1]}`).join(' ');

  // Gallery hover
  readonly hoverEl = signal<string | null>(null);

  // Calculator state
  readonly selG = signal('r1');
  readonly selX = signal('sr0');
  readonly animStep = signal(0); // 0=idle, 1=after g, 2=after gx, 3=after gxg⁻¹, 4=done(show result)

  // The CSS transform to apply at the current animation step
  private readonly animCssRaw = signal('none');
  private readonly animTransRaw = signal('none');

  readonly gEl = computed(() => this.d3.elements.find((e) => e.id === this.selG())!);
  readonly xEl = computed(() => this.d3.elements.find((e) => e.id === this.selX())!);
  readonly gInvEl = computed(() => this.d3.inverse(this.gEl()));
  readonly resultEl = computed(() =>
    this.d3.multiply(this.d3.multiply(this.gEl(), this.xEl()), this.gInvEl()),
  );

  readonly classes = computed(() => {
    const assigned = new Set<string>();
    const result: GroupElement[][] = [];
    for (const a of this.d3.elements) {
      if (assigned.has(a.id)) continue;
      const cls: GroupElement[] = [];
      const seen = new Set<string>();
      for (const x of this.d3.elements) {
        const conj = this.d3.multiply(this.d3.multiply(x, a), this.d3.inverse(x));
        if (!seen.has(conj.id)) { seen.add(conj.id); cls.push(conj); }
      }
      cls.forEach((e) => assigned.add(e.id));
      result.push(cls);
    }
    return result;
  });

  readonly center = computed(() =>
    this.classes().filter((c) => c.length === 1).map((c) => c[0]),
  );

  readonly resultClassColor = computed(() => {
    const rid = this.resultEl().id;
    for (let ci = 0; ci < this.classes().length; ci++) {
      if (this.classes()[ci].some((e) => e.id === rid)) return CLASS_COLORS[ci];
    }
    return 'var(--border)';
  });

  /** CSS transform for a gallery mini triangle on hover. */
  galleryCss(el: GroupElement): string {
    return cssFor(el.transform);
  }

  typeOf(el: GroupElement): string {
    if (el.id === 'r0') return '\u4E0D\u52D5';
    if (el.id.startsWith('r')) return '\u65CB\u8F49';
    return '\u93E1\u5C04';
  }

  // Animation CSS — driven by animCssRaw/animTransRaw signals
  animCssTransform(): string { return this.animCssRaw(); }
  animTransition(): string { return this.animTransRaw(); }

  resetAnim(): void {
    this.animStep.set(0);
    this.animTransRaw.set('none');
    this.animCssRaw.set('none');
  }

  playAnimation(): void {
    if (this.animStep() > 0 && this.animStep() < 4) return;
    if (this.animStep() >= 4) { this.resetAnim(); return; }

    const g = this.gEl();
    const x = this.xEl();
    const gInv = this.gInvEl();

    // Compute cumulative elements at each step
    const after1 = g; // just g
    const after2 = this.d3.multiply(x, g); // x then g (= gx in left-mult convention)
    const after3 = this.d3.multiply(gInv, after2); // gxg⁻¹

    const dur1 = stepDuration(g.transform);
    const dur2 = stepDuration(x.transform);
    const dur3 = stepDuration(gInv.transform);

    // Step 1: apply g
    this.animStep.set(1);
    this.animTransRaw.set('none');
    this.animCssRaw.set('none');
    // Force reflow then start transition
    requestAnimationFrame(() => {
      this.animTransRaw.set(`transform ${dur1}ms cubic-bezier(0.4, 0, 0.2, 1)`);
      this.animCssRaw.set(cssFor(after1.transform));
    });

    // Step 2: apply x (cumulative = gx)
    setTimeout(() => {
      this.animStep.set(2);
      this.animTransRaw.set('none');
      this.animCssRaw.set(cssFor(after1.transform));
      requestAnimationFrame(() => {
        this.animTransRaw.set(`transform ${dur2}ms cubic-bezier(0.4, 0, 0.2, 1)`);
        this.animCssRaw.set(cssFor(after2.transform));
      });
    }, dur1 + 200);

    // Step 3: apply g⁻¹ (cumulative = gxg⁻¹)
    setTimeout(() => {
      this.animStep.set(3);
      this.animTransRaw.set('none');
      this.animCssRaw.set(cssFor(after2.transform));
      requestAnimationFrame(() => {
        this.animTransRaw.set(`transform ${dur3}ms cubic-bezier(0.4, 0, 0.2, 1)`);
        this.animCssRaw.set(cssFor(after3.transform));
      });
    }, dur1 + dur2 + 400);

    // Done
    setTimeout(() => {
      this.animStep.set(4);
    }, dur1 + dur2 + dur3 + 600);
  }
}
