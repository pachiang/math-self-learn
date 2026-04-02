import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MatrixRep { el: string; mat: string[][]; note: string; color: string; trace: string; }

const REPS: MatrixRep[] = [
  { el: 'e',   mat: [['1','0'],['0','1']],          note: '\u4E0D\u52D5', color: 'var(--v2)', trace: '2' },
  { el: 'r',   mat: [['\u22121/2','\u2212\u221A3/2'],['\u221A3/2','\u22121/2']], note: '\u65CB\u8F49 120\u00B0', color: 'var(--v1)', trace: '\u22121' },
  { el: 'r\u00B2', mat: [['\u22121/2','\u221A3/2'],['\u2212\u221A3/2','\u22121/2']], note: '\u65CB\u8F49 240\u00B0', color: 'var(--v4)', trace: '\u22121' },
  { el: 's',   mat: [['1','0'],['0','\u22121']],      note: '\u93E1\u5C04 (x\u8EF8)', color: 'var(--v0)', trace: '0' },
  { el: 'sr',  mat: [['\u22121/2','\u221A3/2'],['\u221A3/2','1/2']],  note: '\u93E1\u5C04', color: 'var(--v3)', trace: '0' },
  { el: 'sr\u00B2', mat: [['\u22121/2','\u2212\u221A3/2'],['\u2212\u221A3/2','1/2']], note: '\u93E1\u5C04', color: 'var(--v6)', trace: '0' },
];

// Transformed vertex positions for the SVG triangle visualization
const VERT_DATA: number[][][] = [
  [[30,6],[55,50],[5,50]],    // e
  [[55,50],[5,50],[30,6]],    // r
  [[5,50],[30,6],[55,50]],    // r²
  [[30,50],[55,6],[5,6]],     // s (flip)
  [[5,6],[30,50],[55,6]],     // sr
  [[55,6],[5,6],[30,50]],     // sr²
];

@Component({
  selector: 'app-step-what-is-rep',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u4EC0\u9EBC\u662F\u8868\u793A" subtitle="\u00A711.1">
      <p>\u7FA4\u7684<strong>\u8868\u793A</strong>\u5C31\u662F\u628A\u7FA4\u5143\u7D20\u300C\u7FFB\u8B6F\u300D\u6210\u77E9\u9663\uFF0C\u800C\u4E14\u4FDD\u6301\u4E58\u6CD5\u7D50\u69CB\u3002</p>
      <p>\u76F4\u89BA\uFF1A\u6BCF\u500B\u5C0D\u7A31\u64CD\u4F5C\uFF08\u65CB\u8F49\u3001\u93E1\u5C04\uFF09\u90FD\u53EF\u4EE5\u5BEB\u6210\u4E00\u500B\u77E9\u9663\u3002\u77E9\u9663\u4E58\u6CD5 = \u64CD\u4F5C\u7684\u7D44\u5408\u3002</p>
    </app-prose-block>

    <app-challenge-card prompt="\u9EDE\u4E00\u500B\u5143\u7D20\uFF0C\u770B\u5B83\u5C0D\u61C9\u7684\u77E9\u9663\u548C\u5E7E\u4F55\u6548\u679C">
      <div class="rep-selector">
        @for (r of reps; track r.el; let i = $index) {
          <button class="rep-btn" [class.active]="sel() === i"
            [style.border-color]="r.color" (click)="sel.set(i)">{{ r.el }}</button>
        }
      </div>

      <div class="rep-display">
        <!-- Matrix visual -->
        <div class="panel">
          <div class="panel-label">\u03C1({{ current().el }}) =</div>
          <div class="matrix-box">
            <div class="mat-bracket">[</div>
            <div class="mat-body">
              <div class="mat-row">
                <span class="mat-cell" [class.diag]="true">{{ current().mat[0][0] }}</span>
                <span class="mat-cell">{{ current().mat[0][1] }}</span>
              </div>
              <div class="mat-row">
                <span class="mat-cell">{{ current().mat[1][0] }}</span>
                <span class="mat-cell" [class.diag]="true">{{ current().mat[1][1] }}</span>
              </div>
            </div>
            <div class="mat-bracket">]</div>
          </div>
          <div class="mat-note">{{ current().note }}</div>
        </div>

        <!-- Geometric effect SVG -->
        <div class="panel">
          <div class="panel-label">\u5E7E\u4F55\u6548\u679C</div>
          <svg viewBox="-2 0 64 56" class="geo-svg">
            <!-- Original triangle (dashed gray) -->
            <polygon points="30,6 55,50 5,50" fill="none" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="3 2" />
            <!-- Transformed triangle -->
            <polygon [attr.points]="triPoints()" fill="none" [attr.stroke]="current().color" stroke-width="2.5" />
            <!-- Colored vertex dots -->
            @for (v of verts(); track $index; let i = $index) {
              <circle [attr.cx]="v[0]" [attr.cy]="v[1]" r="5"
                [attr.fill]="['var(--v0)','var(--v1)','var(--v2)'][i]" />
            }
          </svg>
          <div class="geo-caption">\u7070\u8655\u7DDA = \u539F\u59CB\uFF0C\u5F69\u8272 = \u8B8A\u63DB\u5F8C</div>
        </div>

        <!-- Trace -->
        <div class="panel">
          <div class="panel-label">\u8DE1\uFF08trace\uFF09</div>
          <div class="trace-formula">
            <span class="trace-diag">{{ current().mat[0][0] }}</span>
            +
            <span class="trace-diag">{{ current().mat[1][1] }}</span>
          </div>
          <div class="trace-value">= {{ current().trace }}</div>
          <div class="trace-type">
            @if (current().trace === '2') { \u2192 \u6046\u7B49 }
            @else if (current().trace === '\u22121') { \u2192 \u65CB\u8F49 }
            @else { \u2192 \u93E1\u5C04 }
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>\u6CE8\u610F<strong>\u8DE1</strong>\u7684\u898F\u5F8B\uFF1A\u6046\u7B49 = 2\uFF0C\u65CB\u8F49 = \u22121\uFF0C\u93E1\u5C04 = 0\u3002\u540C\u4E00\u500B\u5171\u8EDB\u985E\u7684\u5143\u7D20\u8DE1\u76F8\u540C\uFF01</p>
      <p>\u8DE1\u662F\u4E00\u500B\u6BD4\u77E9\u9663\u66F4\u7C21\u6F54\u7684\u300C\u6307\u7D0B\u300D\u2014 \u4E0B\u4E00\u7BC0\u7684<strong>\u7279\u5FB5\u6A19</strong>\u5C31\u662F\u5EFA\u7ACB\u5728\u8DE1\u4E0A\u3002</p>
    </app-prose-block>
  `,
  styles: `
    .rep-selector { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .rep-btn {
      padding: 6px 14px; border: 2px solid var(--border); border-radius: 8px;
      background: transparent; color: var(--text); font-size: 16px; font-weight: 700;
      font-family: 'Noto Sans Math', serif; cursor: pointer; transition: all 0.15s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); }
    }

    .rep-display {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 8px;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .panel {
      padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); display: flex; flex-direction: column; align-items: center;
    }
    .panel-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }

    .matrix-box { display: flex; align-items: center; gap: 4px; }
    .mat-bracket { font-size: 40px; font-weight: 200; color: var(--text-muted); line-height: 1; }
    .mat-body { display: flex; flex-direction: column; gap: 3px; }
    .mat-row { display: flex; gap: 6px; }
    .mat-cell {
      min-width: 44px; text-align: center; font-size: 13px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; color: var(--text);
      padding: 4px 6px; background: var(--bg-surface); border-radius: 4px;
      &.diag { background: var(--accent-18); color: var(--accent); }
    }
    .mat-note { font-size: 12px; color: var(--accent); margin-top: 8px; font-weight: 600; }

    .geo-svg { width: 110px; height: 95px; }
    .geo-caption { font-size: 10px; color: var(--text-muted); margin-top: 4px; }

    .trace-formula { font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .trace-diag { color: var(--accent); font-weight: 700; background: var(--accent-18); padding: 2px 6px; border-radius: 3px; }
    .trace-value { font-size: 32px; font-weight: 800; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin-top: 6px; }
    .trace-type { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  `,
})
export class StepWhatIsRepComponent {
  readonly reps = REPS;
  readonly sel = signal(0);
  readonly current = computed(() => this.reps[this.sel()]);
  readonly verts = computed(() => VERT_DATA[this.sel()]);
  readonly triPoints = computed(() => this.verts().map(v => `${v[0]},${v[1]}`).join(' '));
}
