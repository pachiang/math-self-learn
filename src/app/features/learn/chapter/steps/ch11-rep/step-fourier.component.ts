import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-fourier',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u5085\u7ACB\u8449\u8B8A\u63DB = \u8868\u793A\u8AD6" subtitle="\u00A711.5">
      <p>\u6700\u9A5A\u4EBA\u7684\u806F\u7E6B\uFF1A<strong>\u5085\u7ACB\u8449\u8B8A\u63DB\u5C31\u662F\u5FAA\u74B0\u7FA4\u7684\u8868\u793A\u8AD6</strong>\u3002</p>
      <p>
        \u8B93\u6211\u5011\u7528 Z\u2084 = {{ '{' }}0, 1, 2, 3{{ '}' }} \u4F86\u770B\u6E05\u695A\u9019\u4EF6\u4E8B\u3002
      </p>
    </app-prose-block>

    <!-- Part 1: Wave builder -->
    <app-challenge-card prompt="\u8ABF\u6574\u4E09\u500B\u983B\u7387\u5206\u91CF\u7684\u632F\u5E45\uFF0C\u770B\u5408\u6210\u6CE2\u7684\u8B8A\u5316">
      <div class="wave-section">
        <div class="freq-controls">
          @for (f of [0,1,2]; track f) {
            <div class="freq-row">
              <span class="freq-label" [style.color]="waveColors[f]">\u03C9{{ f+1 }}</span>
              <input type="range" min="0" max="10" [value]="amps()[f]"
                (input)="setAmp(f, +$any($event).target.value)" class="freq-slider" />
              <span class="freq-val">{{ amps()[f] }}</span>
            </div>
          }
        </div>

        <svg viewBox="0 0 400 120" class="wave-svg">
          <line x1="0" y1="60" x2="400" y2="60" stroke="var(--border)" stroke-width="0.5" />
          @for (f of [0,1,2]; track f) {
            @if (amps()[f] > 0) {
              <path [attr.d]="wavePath(f)" fill="none"
                [attr.stroke]="waveColors[f]" stroke-width="1.5" opacity="0.4" />
            }
          }
          <path [attr.d]="combinedPath()" fill="none" stroke="var(--text)" stroke-width="2.5" />
        </svg>

        <div class="wave-legend">
          @for (f of [0,1,2]; track f) {
            <span class="wl-item">
              <span class="wl-dot" [style.background]="waveColors[f]"></span>
              \u03C9{{ f+1 }}\uFF08\u983B\u7387 {{ f+1 }}\uFF09
            </span>
          }
          <span class="wl-item"><span class="wl-dot combined"></span>\u5408\u6210\u6CE2</span>
        </div>
      </div>
    </app-challenge-card>

    <!-- Part 2: Deep explanation of DFT = character table -->
    <app-prose-block title="Z\u2084 \u7684\u4E0D\u53EF\u7D04\u8868\u793A = \u983B\u7387\u5206\u91CF">
      <p>Z\u2084 = {{ '{' }}0, 1, 2, 3{{ '}' }}\uFF0C\u751F\u6210\u5143 g = 1\uFF08\u52A0 1 \u6A21 4\uFF09\u3002</p>
      <p>\u5B83\u6709 4 \u500B\u4E0D\u53EF\u7D04\u8868\u793A\uFF0C\u6BCF\u500B\u90FD\u662F 1 \u7DAD\u7684\uFF08\u56E0\u70BA Z\u2084 \u662F\u4EA4\u63DB\u7FA4\uFF09\u3002
        \u6BCF\u500B\u8868\u793A\u7531\u300C\u751F\u6210\u5143\u6620\u5230\u54EA\u500B\u8907\u6578\u300D\u5B8C\u5168\u6C7A\u5B9A\uFF1A</p>
    </app-prose-block>

    <app-challenge-card prompt="\u9EDE\u4E00\u500B\u8868\u793A\uFF0C\u770B\u5B83\u600E\u9EBC\u628A Z\u2084 \u7684\u5143\u7D20\u6620\u5230\u8907\u6578\u5E73\u9762">
      <!-- Representation selector -->
      <div class="rep-selector">
        @for (r of repInfo; track r.name; let i = $index) {
          <button class="rep-btn" [class.active]="selRep() === i"
            [style.border-color]="repColors[i]" (click)="selRep.set(i)">{{ r.name }}</button>
        }
      </div>

      <div class="rep-detail-grid">
        <!-- Left: mapping table -->
        <div class="rep-mapping">
          <div class="rm-title">{{ repInfo[selRep()].name }}\uFF1A\u5C07\u751F\u6210\u5143 1 \u6620\u5230 {{ repInfo[selRep()].root }}</div>
          <div class="rm-table">
            @for (entry of repInfo[selRep()].values; track entry.g) {
              <div class="rm-row">
                <span class="rm-g">{{ entry.g }}</span>
                <span class="rm-arrow">\u21A6</span>
                <span class="rm-val" [class.imag]="entry.isImag">{{ entry.val }}</span>
                <span class="rm-explain">{{ entry.explain }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Right: unit circle SVG showing the root of unity -->
        <div class="circle-panel">
          <div class="cp-title">\u8907\u6578\u5E73\u9762\u4E0A\u7684\u5355\u4F4D\u6839</div>
          <svg viewBox="-1.6 -1.6 3.2 3.2" class="unit-circle-svg">
            <!-- Unit circle -->
            <circle cx="0" cy="0" r="1" fill="none" stroke="var(--border)" stroke-width="0.03" />
            <!-- Axes -->
            <line x1="-1.4" y1="0" x2="1.4" y2="0" stroke="var(--border)" stroke-width="0.015" />
            <line x1="0" y1="-1.4" x2="0" y2="1.4" stroke="var(--border)" stroke-width="0.015" />
            <text x="1.3" y="0.15" class="axis-label">Re</text>
            <text x="0.08" y="-1.2" class="axis-label">Im</text>
            <!-- All 4 roots of unity (faint dots) -->
            @for (pt of unitRoots; track $index) {
              <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="0.06" fill="var(--border-strong)" />
              <text [attr.x]="pt.lx" [attr.y]="pt.ly" class="root-label">{{ pt.label }}</text>
            }
            <!-- Highlighted: where the generator maps to -->
            <circle [attr.cx]="genRoot().x" [attr.cy]="genRoot().y" r="0.1"
              [attr.fill]="repColors[selRep()]" />
            <!-- Arrow from origin to the root -->
            <line x1="0" y1="0" [attr.x2]="genRoot().x" [attr.y2]="genRoot().y"
              [attr.stroke]="repColors[selRep()]" stroke-width="0.04"
              marker-end="url(#arrowhead2)" />
            <defs>
              <marker id="arrowhead2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0,6 2,0 4" [attr.fill]="repColors[selRep()]" />
              </marker>
            </defs>
          </svg>
          <div class="cp-explain">
            \u03C1(\u751F\u6210\u5143 1) = {{ repInfo[selRep()].root }}
            <br/>\u9019\u662F\u55AE\u4F4D\u5713\u4E0A\u7684\u7B2C {{ selRep() }} \u500B <strong>4 \u6B21\u5355\u4F4D\u6839</strong>
          </div>
        </div>
      </div>

      <!-- Full DFT matrix with explanation -->
      <div class="dft-section">
        <div class="dft-title">
          \u628A 4 \u500B\u8868\u793A\u758A\u6210\u4E00\u500B\u77E9\u9663\uFF0C\u5C31\u662F <strong>DFT \u77E9\u9663</strong>\uFF1A
        </div>
        <div class="dft-matrix">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>\u03C1(0)</th><th>\u03C1(1)</th><th>\u03C1(2)</th><th>\u03C1(3)</th>
              </tr>
              <tr class="sub-header">
                <td></td>
                <td>\u6642\u9593 0</td><td>\u6642\u9593 1</td><td>\u6642\u9593 2</td><td>\u6642\u9593 3</td>
              </tr>
            </thead>
            <tbody>
              @for (r of repInfo; track r.name; let i = $index) {
                <tr [class.highlight]="selRep() === i" (click)="selRep.set(i)" class="clickable">
                  <td class="freq-h" [style.border-left-color]="repColors[i]">{{ r.name }}</td>
                  @for (v of r.values; track v.g) {
                    <td [class.imag]="v.isImag">{{ v.val }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="dft-explain">
          <p><strong>\u6BCF\u4E00\u884C</strong> = Z\u2084 \u7684\u4E00\u500B\u4E0D\u53EF\u7D04\u8868\u793A\uFF08= \u4E00\u500B\u983B\u7387\u5206\u91CF\uFF09</p>
          <p><strong>\u6BCF\u4E00\u5217</strong> = Z\u2084 \u7684\u4E00\u500B\u5143\u7D20\uFF08= \u4E00\u500B\u6642\u9593\u9EDE\uFF09</p>
          <p><strong>\u77E9\u9663 \u00D7 \u4FE1\u865F\u5411\u91CF</strong> = \u5085\u7ACB\u8449\u4FC2\u6578\uFF08\u6BCF\u500B\u983B\u7387\u7684\u632F\u5E45\uFF09</p>
        </div>
      </div>

      <!-- What are ω₀-ω₃ -->
      <div class="omega-section">
        <div class="omega-title">\u03C9\u2080 \u2013 \u03C9\u2083 \u5206\u5225\u662F\u4EC0\u9EBC\uFF1F</div>
        <div class="omega-cards">
          @for (r of repInfo; track r.name; let i = $index) {
            <div class="omega-card" [style.border-left-color]="repColors[i]">
              <div class="oc-name">{{ r.name }}</div>
              <div class="oc-root">\u751F\u6210\u5143 \u21A6 {{ r.root }}</div>
              <div class="oc-freq">\u983B\u7387 = {{ i }}</div>
              <div class="oc-meaning">{{ r.meaning }}</div>
            </div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="\u5927\u7D71\u4E00">
      <div class="connection">
        <div class="conn-row header"><span>\u7FA4\u8AD6\uFF08\u8868\u793A\u8AD6\uFF09</span><span>\u5085\u7ACB\u8449\u5206\u6790</span></div>
        <div class="conn-row"><span>Z\u2099 \u7684\u5143\u7D20 0, 1, ..., n\u22121</span><span>\u6642\u57DF\u63A1\u6A23\u9EDE</span></div>
        <div class="conn-row"><span>\u4E0D\u53EF\u7D04\u8868\u793A \u03C1\u2096\uFF1Ag \u21A6 e^(2\u03C0igk/n)</span><span>\u983B\u7387\u5206\u91CF\uFF08\u7B2C k \u500B\u8AE7\u6CE2\uFF09</span></div>
        <div class="conn-row"><span>\u7279\u5FB5\u6A19\u8868\uFF08n\u00D7n \u77E9\u9663\uFF09</span><span>DFT \u77E9\u9663</span></div>
        <div class="conn-row"><span>\u8868\u793A\u7684\u5206\u89E3\uFF08\u6295\u5F71\u5230\u4E0D\u53EF\u7D04\u8868\u793A\uFF09</span><span>\u983B\u8B5C\u5206\u6790\uFF08\u8A08\u7B97\u6BCF\u500B\u983B\u7387\u7684\u632F\u5E45\uFF09</span></div>
        <div class="conn-row"><span>\u63A8\u5EE3\u5230 R</span><span>\u7D93\u5178\u5085\u7ACB\u8449\u8B8A\u63DB</span></div>
        <div class="conn-row"><span>\u63A8\u5EE3\u5230\u4EFB\u610F\u7FA4</span><span>\u8ABF\u548C\u5206\u6790\uFF08Harmonic Analysis\uFF09</span></div>
      </div>
      <div class="finale">
        <p>\u8868\u793A\u8AD6\u628A\u62BD\u8C61\u4EE3\u6578\u8DDF\u7DDA\u6027\u4EE3\u6578\u3001\u7269\u7406\u3001\u8A0A\u865F\u8655\u7406\u5168\u90E8\u4E32\u5728\u4E00\u8D77\u3002\u5B83\u662F 20 \u4E16\u7D00\u6578\u5B78\u6700\u6210\u529F\u7684\u7D71\u4E00\u7406\u8AD6\u4E4B\u4E00\u3002</p>
      </div>
    </app-prose-block>
  `,
  styles: `
    /* Wave section */
    .wave-section { padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .freq-controls { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .freq-row { display: flex; align-items: center; gap: 10px; }
    .freq-label { font-size: 14px; font-weight: 700; font-family: 'Noto Sans Math', serif; min-width: 28px; }
    .freq-slider { flex: 1; accent-color: var(--accent); }
    .freq-val { font-size: 14px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 20px; }
    .wave-svg { width: 100%; height: 120px; display: block; border-radius: 8px; background: var(--bg-surface); }
    .wave-legend { display: flex; gap: 12px; margin-top: 8px; justify-content: center; flex-wrap: wrap; }
    .wl-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); }
    .wl-dot { width: 10px; height: 10px; border-radius: 50%; &.combined { background: var(--text); } }

    /* Rep selector */
    .rep-selector { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
    .rep-btn { padding: 6px 14px; border: 2px solid var(--border); border-radius: 8px; background: transparent; color: var(--text);
      font-size: 14px; font-weight: 700; font-family: 'Noto Sans Math', serif; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); } &.active { background: var(--accent-18); } }

    /* Rep detail grid */
    .rep-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;
      @media(max-width:600px) { grid-template-columns: 1fr; } }

    .rep-mapping { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .rm-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
    .rm-table { display: flex; flex-direction: column; gap: 4px; }
    .rm-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 5px; background: var(--bg-surface); }
    .rm-g { font-size: 16px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 16px; }
    .rm-arrow { color: var(--text-muted); }
    .rm-val { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); min-width: 28px;
      &.imag { color: var(--v4); } }
    .rm-explain { font-size: 11px; color: var(--text-muted); }

    /* Unit circle */
    .circle-panel { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); text-align: center; }
    .cp-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .unit-circle-svg { width: 180px; height: 180px; display: block; margin: 0 auto; }
    .axis-label { font-size: 0.15px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .root-label { font-size: 0.13px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .cp-explain { font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; strong { color: var(--text); } }

    /* DFT matrix */
    .dft-section { padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg); margin-bottom: 14px; }
    .dft-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; strong { color: var(--accent); } }
    .dft-matrix { overflow-x: auto; margin-bottom: 10px; }
    .dft-matrix table { border-collapse: collapse; margin: 0 auto; width: 100%; }
    .dft-matrix th, .dft-matrix td { padding: 8px 12px; text-align: center; font-size: 15px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); color: var(--text); }
    .dft-matrix th { background: var(--accent-10); color: var(--text-secondary); font-size: 12px; }
    .sub-header td { background: var(--bg-surface) !important; font-size: 10px !important; color: var(--text-muted) !important; font-weight: 400 !important; padding: 3px 8px !important; }
    .freq-h { background: var(--accent-10) !important; color: var(--accent) !important; font-family: 'Noto Sans Math', serif !important;
      border-left: 3px solid !important; text-align: left !important; padding-left: 10px !important; }
    .imag { color: var(--v4) !important; }
    tr.clickable { cursor: pointer; transition: background 0.12s; &:hover { background: var(--accent-10); } }
    tr.highlight { background: var(--accent-18) !important; }
    .dft-explain { display: flex; flex-direction: column; gap: 4px; }
    .dft-explain p { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.5; strong { color: var(--text); } }

    /* Omega explanation cards */
    .omega-section { margin-bottom: 8px; }
    .omega-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
    .omega-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; @media(max-width:600px){grid-template-columns:repeat(2,1fr);} }
    .omega-card { padding: 10px; border: 1px solid var(--border); border-left: 4px solid; border-radius: 8px; background: var(--bg-surface); }
    .oc-name { font-size: 14px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; }
    .oc-root { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--text); margin: 2px 0; }
    .oc-freq { font-size: 11px; color: var(--text-muted); }
    .oc-meaning { font-size: 11px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4; }

    /* Bottom */
    .connection { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: 14px 0; }
    .conn-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; }
      &.header span { font-weight: 700; background: var(--accent-10); color: var(--text); } }
    .conn-row span { padding: 8px 12px; font-size: 13px; color: var(--text-secondary); &:first-child { border-right: 1px solid var(--border); } }
    .finale { padding: 16px; border: 2px solid var(--accent); border-radius: 12px; background: var(--accent-10); text-align: center;
      p { font-size: 14px; color: var(--text-secondary); margin: 0; line-height: 1.6; } }
  `,
})
export class StepFourierComponent {
  readonly waveColors = ['var(--v0)', 'var(--v1)', 'var(--v2)'];
  readonly repColors = ['var(--v2)', 'var(--v1)', 'var(--v0)', 'var(--v4)'];
  readonly amps = signal([5, 3, 2]);
  readonly selRep = signal(1);

  // 4th roots of unity on the unit circle (y inverted for SVG)
  readonly unitRoots = [
    { x: 1, y: 0, label: '1', lx: 1.15, ly: 0.15 },
    { x: 0, y: -1, label: 'i', lx: 0.1, ly: -1.1 },
    { x: -1, y: 0, label: '\u22121', lx: -1.35, ly: 0.15 },
    { x: 0, y: 1, label: '\u2212i', lx: 0.1, ly: 1.2 },
  ];

  readonly repInfo = [
    {
      name: '\u03C9\u2080',
      root: '1',
      meaning: '\u5E38\u6578\u5206\u91CF\uFF08DC\uFF09\u2014 \u6C92\u6709\u632F\u76EA\uFF0C\u5C31\u662F\u4FE1\u865F\u7684\u5E73\u5747\u503C',
      genIdx: 0, // index into unitRoots
      values: [
        { g: '0', val: '1', isImag: false, explain: '1\u2070 = 1' },
        { g: '1', val: '1', isImag: false, explain: '1\u00B9 = 1' },
        { g: '2', val: '1', isImag: false, explain: '1\u00B2 = 1' },
        { g: '3', val: '1', isImag: false, explain: '1\u00B3 = 1' },
      ],
    },
    {
      name: '\u03C9\u2081',
      root: 'i',
      meaning: '\u57FA\u672C\u983B\u7387 \u2014 \u6BCF 4 \u500B\u6642\u9593\u9EDE\u8F49\u4E00\u5708',
      genIdx: 1,
      values: [
        { g: '0', val: '1', isImag: false, explain: 'i\u2070 = 1' },
        { g: '1', val: 'i', isImag: true, explain: 'i\u00B9 = i' },
        { g: '2', val: '\u22121', isImag: false, explain: 'i\u00B2 = \u22121' },
        { g: '3', val: '\u2212i', isImag: true, explain: 'i\u00B3 = \u2212i' },
      ],
    },
    {
      name: '\u03C9\u2082',
      root: '\u22121',
      meaning: '\u4E8C\u500D\u983B\u7387 \u2014 \u6BCF 2 \u500B\u6642\u9593\u9EDE\u8F49\u4E00\u5708',
      genIdx: 2,
      values: [
        { g: '0', val: '1', isImag: false, explain: '(\u22121)\u2070 = 1' },
        { g: '1', val: '\u22121', isImag: false, explain: '(\u22121)\u00B9 = \u22121' },
        { g: '2', val: '1', isImag: false, explain: '(\u22121)\u00B2 = 1' },
        { g: '3', val: '\u22121', isImag: false, explain: '(\u22121)\u00B3 = \u22121' },
      ],
    },
    {
      name: '\u03C9\u2083',
      root: '\u2212i',
      meaning: '\u4E09\u500D\u983B\u7387 \u2014 \u6BCF 4/3 \u500B\u6642\u9593\u9EDE\u8F49\u4E00\u5708',
      genIdx: 3,
      values: [
        { g: '0', val: '1', isImag: false, explain: '(\u2212i)\u2070 = 1' },
        { g: '1', val: '\u2212i', isImag: true, explain: '(\u2212i)\u00B9 = \u2212i' },
        { g: '2', val: '\u22121', isImag: false, explain: '(\u2212i)\u00B2 = \u22121' },
        { g: '3', val: 'i', isImag: true, explain: '(\u2212i)\u00B3 = i' },
      ],
    },
  ];

  readonly genRoot = computed(() => this.unitRoots[this.repInfo[this.selRep()].genIdx]);

  setAmp(idx: number, val: number): void {
    this.amps.update((a) => { const n = [...a]; n[idx] = val; return n; });
  }

  wavePath(freq: number): string {
    const a = this.amps()[freq];
    const f = freq + 1;
    const pts: string[] = [];
    for (let x = 0; x <= 400; x += 2) {
      const t = (x / 400) * Math.PI * 4;
      const y = 60 - a * Math.sin(f * t) * 4;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  }

  readonly combinedPath = computed(() => {
    const a = this.amps();
    const pts: string[] = [];
    for (let x = 0; x <= 400; x += 2) {
      const t = (x / 400) * Math.PI * 4;
      let y = 60;
      for (let f = 0; f < 3; f++) y -= a[f] * Math.sin((f + 1) * t) * 4;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ');
  });
}
