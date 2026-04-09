import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { svd, reconstructLowRank } from '../linalg-ch8-svd/svd-util';

// 6 users × 8 movies. 0 means "not rated yet".
// The "true" matrix has rank ~2 (taste is roughly action vs romance).
const USERS = ['\u5C0F\u5B89', '\u5C0F\u73B2', '\u5C0F\u5091', '\u5C0F\u83EF', '\u5C0F\u660E', '\u5C0F\u6B23'];
const MOVIES = ['\u8907\u4EC7', '\u9418\u9DF4', '\u8B70\u50F9', '\u660E\u5929', '\u9F8D\u9580', '\u6E96\u5247', '\u5DF4\u9ECE', '\u570B\u738B'];

// Underlying "true" preferences (rank-2): user latent × item latent
// User taste: [action, romance]
const USER_TASTE: number[][] = [
  [0.95, 0.10], // 小安 — loves action
  [0.80, 0.30], // 小玲 — mostly action
  [0.20, 0.90], // 小傑 — loves romance
  [0.10, 0.95], // 小華 — pure romance
  [0.55, 0.55], // 小明 — both
  [0.70, 0.40], // 小欣 — leans action
];
// Item profile: [is_action, is_romance]
const ITEM_PROFILE: number[][] = [
  [0.90, 0.10], // 復仇 — action
  [0.95, 0.05], // 鐘鳴 — action
  [0.85, 0.20], // 議價 — action-ish
  [0.05, 0.95], // 明天 — romance
  [0.10, 0.90], // 龍門 — romance
  [0.50, 0.50], // 準則 — both
  [0.30, 0.80], // 巴黎 — romance-leaning
  [0.80, 0.30], // 國王 — action-leaning
];

function buildTrueMatrix(): number[][] {
  const M: number[][] = [];
  for (let u = 0; u < USERS.length; u++) {
    const row: number[] = [];
    for (let i = 0; i < MOVIES.length; i++) {
      // Score 1..5
      const raw = USER_TASTE[u][0] * ITEM_PROFILE[i][0] + USER_TASTE[u][1] * ITEM_PROFILE[i][1];
      row.push(1 + raw * 4);
    }
    M.push(row);
  }
  return M;
}

// Mask: which entries are observed (true) vs missing (false)
const MASK: boolean[][] = [
  [true,  true,  false, true,  false, true,  false, true ],
  [true,  false, true,  false, false, true,  false, true ],
  [false, true,  false, true,  true,  false, true,  false],
  [false, false, false, true,  true,  true,  true,  false],
  [true,  false, true,  false, true,  true,  false, true ],
  [true,  true,  false, false, true,  false, true,  true ],
];

const TRUE_M = buildTrueMatrix();

// Word embedding demo: 2D positions chosen so that
// king - man + woman ≈ queen.
const WORDS: { name: string; pos: [number, number] }[] = [
  { name: 'man',     pos: [-1.5, -1.0] },
  { name: 'woman',   pos: [-1.5,  1.0] },
  { name: 'king',    pos: [ 1.5, -1.0] },
  { name: 'queen',   pos: [ 1.5,  1.0] },
  { name: 'boy',     pos: [-2.5, -1.6] },
  { name: 'girl',    pos: [-2.5,  1.6] },
  { name: 'prince',  pos: [ 2.5, -1.6] },
  { name: 'princess',pos: [ 2.5,  1.6] },
];

@Component({
  selector: 'app-step-matrix-factorization',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="\u77E9\u9663\u5206\u89E3\uFF1A\u63A8\u85A6\u7CFB\u7D71\u8DDF\u8A5E\u5D4C\u5165" subtitle="\u00A713.8">
      <p>
        \u6700\u5F8C\u4E00\u500B\u4E3B\u984C\uFF1A\u7B2C\u516B\u7AE0\u7684 SVD \u4E0D\u53EA\u662F\u300C\u5BEB\u5728\u8AB2\u672C\u88E1\u7684\u516C\u5F0F\u300D\uFF0C
        \u4ED6\u662F\u73FE\u4EE3\u63A8\u85A6\u7CFB\u7D71\u3001\u8A5E\u5D4C\u5165\u3001\u4EE5\u53CA\u751A\u81F3\u8AAD\u4E66\u7B97\u6CD5\u80CC\u5F8C\u7684<strong>\u540C\u4E00\u500B\u6578\u5B78</strong>\u3002
      </p>
      <p>
        \u300C\u4F7F\u7528\u8005 \u00D7 \u5546\u54C1\u300D\u7684\u8A55\u5206\u8868\u662F\u4E00\u500B\u5DE8\u5927\u7684\u77E9\u9663\u3002\u4F46\u9019\u500B\u77E9\u9663\u5176\u5BE6
        <strong>\u4F4E\u79E9</strong>\uFF1A\u4F7F\u7528\u8005\u7684\u53E3\u5473\u53EA\u6709\u5C11\u6578\u5E7E\u500B\u300C\u96B1\u85CF\u8EF8\u300D\uFF08\u52D5\u4F5C\u3001\u611B\u60C5\u3001\u559C\u5287\u2026\uFF09\uFF0C
        \u5546\u54C1\u4E5F\u53EA\u6709\u5C11\u6578\u5E7E\u500B\u96B1\u85CF\u5C6C\u6027\u3002
      </p>
      <p class="formula">M (\u4F7F\u7528\u8005 \u00D7 \u5546\u54C1) \u2248 U \u00B7 \u03A3 \u00B7 V\u1D40 (\u53EA\u53D6\u524D k \u500B\u5947\u7570\u503C)</p>
      <p>
        \u9019\u662F\u4F60\u5728\u7B2C\u516B\u7AE0\u770B\u904E\u7684\u300C\u4F4E\u79E9\u8FD1\u4F3C\u300D\u3002\u53EA\u4E0D\u904E\u73FE\u5728 M \u88E1\u9762\u6709\u5F88\u591A
        <strong>\u7A7A\u683C</strong>\u2014\u2014\u4F7F\u7528\u8005\u9084\u6C92\u770B\u904E\u7684\u96FB\u5F71\u3002
        \u4F46\u53EA\u8981\u770B\u904E\u7684\u90A3\u4E9B\u80FD\u5920\u63A8\u51FA\u300C\u5C11\u6578\u96B1\u85CF\u8EF8\u300D\uFF0C\u6211\u5011\u5C31\u80FD<strong>\u88DC\u5168\u7A7A\u683C</strong>\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u4E0B\u9762\u9019\u500B 6\u00D78 \u96FB\u5F71\u8A55\u5206\u77E9\u9663\u6709\u8A31\u591A\u7A7A\u683C\u3002\u8ABF rank \u770B\u770B\u88DC\u5168\u7684\u6548\u679C">
      <div class="rank-row">
        <span class="rank-label">\u4F4E\u79E9 k = {{ rank() }}</span>
        <input type="range" min="1" max="6" step="1" [value]="rank()" (input)="onRank($event)" class="rank-slider" />
      </div>

      <div class="matrix-grid">
        <div class="m-block">
          <div class="m-title">\u539F\u59CB\u8A55\u5206\uFF08\u7070\u8272 = \u672A\u8A55\u5206\uFF09</div>
          <table class="rate-table">
            <thead>
              <tr>
                <th></th>
                @for (m of movies; track m) {
                  <th>{{ m }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of mask; track $index; let u = $index) {
                <tr>
                  <th class="user">{{ users[u] }}</th>
                  @for (obs of row; track $index; let i = $index) {
                    @if (obs) {
                      <td [style.background]="bg(trueM[u][i])" class="cell observed">{{ trueM[u][i].toFixed(1) }}</td>
                    } @else {
                      <td class="cell empty">?</td>
                    }
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="m-block">
          <div class="m-title">\u4F4E\u79E9\u91CD\u5EFA\uFF08\u9EC3\u6846 = \u88DC\u51FA\u4F86\u7684\uFF09</div>
          <table class="rate-table">
            <thead>
              <tr>
                <th></th>
                @for (m of movies; track m) {
                  <th>{{ m }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of mask; track $index; let u = $index) {
                <tr>
                  <th class="user">{{ users[u] }}</th>
                  @for (obs of row; track $index; let i = $index) {
                    <td
                      [style.background]="bg(reconstructed()[u][i])"
                      class="cell"
                      [class.predicted]="!obs"
                    >{{ reconstructed()[u][i].toFixed(1) }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="error-line">
        \u88DC\u5168\u7684\u8A55\u5206\u8DDF\u300C\u771F\u5BE6\u53E3\u5473\u300D\u7684\u8AA4\u5DEE\uFF1A
        <strong>{{ predictionError().toFixed(3) }}</strong>
        <span class="hint">(k=2 \u662F\u9019\u8CC7\u6599\u7684\u7406\u60F3\u79E9)</span>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        \u8ABF\u6574 k\uFF1A
      </p>
      <ul>
        <li><strong>k=1</strong>\uFF1A\u53EA\u770B\u300C\u53E3\u5473\u4E00\u689D\u8EF8\u300D\uFF0C\u592A\u7C97\u7CD9\u3002</li>
        <li><strong>k=2</strong>\uFF1A\u4E0D\u591A\u4E0D\u5C11 \u2014 \u5806\u51FA\u4E86\u300C\u52D5\u4F5C vs \u611B\u60C5\u300D\u9019\u5169\u500B\u96B1\u85CF\u8EF8\u3002</li>
        <li><strong>k\u22653</strong>\uFF1A\u958B\u59CB\u300C\u6B63\u898F\u5316\u4E0D\u8DB3\u300D\uFF0C\u8A98\u95DC\u4FC2\u88AB\u88FD\u9020\u51FA\u4F86\u3002</li>
      </ul>
      <p>
        \u9019\u8DDF\u4E0A\u4E00\u7BC0\u770B\u904E\u7684<strong>\u591A\u9805\u5F0F\u5EA6\u6578</strong>\u662F\u540C\u4E00\u500B\u6CD5\u5247\uFF1A\u53C3\u6578\u592A\u591A \u2192 \u904E\u64EC\u5408\u3002
        \u9019\u500B\u300C\u9078\u5C0D rank\u300D\u5C31\u662F\u63A8\u85A6\u7CFB\u7D71\u88E1\u4E00\u500B\u8981\u8ABF\u7684\u8D85\u53C3\u6578\u3002
      </p>
    </app-prose-block>

    <app-prose-block title="\u8A5E\u5D4C\u5165\uFF1Aking \u2212 man + woman \u2248 queen">
      <p>
        \u540C\u6A23\u7684\u6982\u5FF5\u4E5F\u51FA\u73FE\u5728\u300C\u8A5E\u5D4C\u5165\u300D\u88E1\u3002\u4E00\u500B\u300C\u8A5E \u00D7 \u4E0A\u4E0B\u6587\u300D\u7684\u5DE8\u5927\u8A08\u6578\u77E9\u9663\u4E5F\u662F<strong>\u4F4E\u79E9</strong>\u7684\uFF0C
        \u900F\u904E SVD \u985E\u4F3C\u7684\u5206\u89E3\uFF0C\u6BCF\u500B\u8A5E\u88AB\u58D3\u7E2E\u6210\u4E00\u500B\u5C11\u6578\u7DAD\u5EA6\u7684\u5411\u91CF\uFF08\u5728\u771F\u5BE6\u6A21\u578B\u88E1\u662F 100 \u7DAD\u3001300 \u7DAD\uFF09\u3002
      </p>
      <p>
        \u70BA\u4E86\u8B93\u4F60\u770B\u898B\u91CD\u9EDE\uFF0C\u9019\u88E1\u7E2A\u53EA\u7528 2 \u7DAD\u3002\u4F46\u52FE\u8AAA\u76F8\u540C\uFF1A\u8A5E\u8DDF\u8A5E\u4E4B\u9593\u7684<strong>\u5411\u91CF\u5DEE</strong>\u6709\u5316\u610F\u7FA9\u3002
      </p>

      <div class="embed-block">
        <svg viewBox="-4.5 -2.8 9 5.6" class="embed-svg">
          <!-- Grid -->
          <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="var(--border)" stroke-width="0.02" />
          <line x1="0" y1="-2.8" x2="0" y2="2.8" stroke="var(--border)" stroke-width="0.02" />

          <!-- The "gender" axis vector: woman - man -->
          <line x1="-1.5" y1="-1" x2="-1.5" y2="1"
                stroke="#c8983b" stroke-width="0.06" stroke-dasharray="0.15 0.1" />
          <line x1="1.5" y1="-1" x2="1.5" y2="1"
                stroke="#c8983b" stroke-width="0.06" stroke-dasharray="0.15 0.1" />

          <!-- The "royalty" axis vector: king - man -->
          <line x1="-1.5" y1="-1" x2="1.5" y2="-1"
                stroke="#6e8aa8" stroke-width="0.06" stroke-dasharray="0.15 0.1" />
          <line x1="-1.5" y1="1" x2="1.5" y2="1"
                stroke="#6e8aa8" stroke-width="0.06" stroke-dasharray="0.15 0.1" />

          <!-- Computed point: king - man + woman -->
          <circle [attr.cx]="computedQueen.x" [attr.cy]="computedQueen.y" r="0.18"
                  fill="none" stroke="var(--accent)" stroke-width="0.06" stroke-dasharray="0.1 0.08" />

          <!-- Words -->
          @for (w of words; track w.name) {
            <g>
              <circle [attr.cx]="w.pos[0]" [attr.cy]="w.pos[1]" r="0.08"
                      [attr.fill]="colorOf(w.name)" />
              <text [attr.x]="w.pos[0] + 0.16" [attr.y]="w.pos[1] + 0.06"
                    class="word-label">{{ w.name }}</text>
            </g>
          }
        </svg>
        <div class="legend">
          <span><span class="dot orange"></span> woman \u2212 man \u8EF8</span>
          <span><span class="dot blue"></span> king \u2212 man \u8EF8</span>
          <span><span class="dot circle"></span> king \u2212 man + woman</span>
        </div>
      </div>

      <p class="formula">king \u2212 man + woman = ({{ computedQueen.x.toFixed(2) }}, {{ computedQueen.y.toFixed(2) }}) \u2248 queen ({{ queenPos.x }}, {{ queenPos.y }})</p>

      <p>
        \u300C\u7537\u2192\u5973\u300D\u7684\u5DEE\u8DDF\u300C\u570B\u738B\u2192\u5973\u738B\u300D\u7684\u5DEE\u662F\u540C\u4E00\u500B\u5411\u91CF\u3002\u8A5E\u88AB\u300C\u5DE7\u5999\u5730\u5C04\u5230\u300D\u4E00\u500B\u7DDA\u6027\u7A7A\u9593\uFF0C
        \u4EE5\u81F3\u65BC\u300C\u8A9E\u610F\u95DC\u4FC2\u300D\u5167\u5316\u5230\u300C\u5411\u91CF\u52A0\u6E1B\u300D\u3002\u9019\u662F\u8A5E\u5D4C\u5165\u6700\u8B93\u4EBA\u9A5A\u8A1D\u7684\u9EDE\u3002
      </p>
    </app-prose-block>

    <app-prose-block title="\u7E3D\u7D50\uFF1A\u7B2C\u5341\u4E09\u7AE0\u770B\u904E\u4E86\u4EC0\u9EBC">
      <p>
        \u4F60\u73FE\u5728\u61C9\u8A72\u770B\u898B\u4E86\uFF1A\u6A5F\u5668\u5B78\u7FD2\u4E0D\u662F\u7948\u79B1\u3002\u4ED6\u662F\u4F60\u5DF2\u7D93\u5B78\u904E\u7684\u7DDA\u6027\u4EE3\u6578\u88E1\u9762\u7684\u5E7E\u500B\u8001\u670B\u53CB\uFF0C
        \u53EA\u662F\u88AB\u63DB\u4E86\u4E00\u500B\u540D\u5B57\uFF1A
      </p>
      <ul>
        <li><strong>\u7DDA\u6027\u56DE\u6B78</strong> = \u6B63\u898F\u65B9\u7A0B A\u1D40Ax = A\u1D40b\uFF08\u00A713.1\uFF09</li>
        <li><strong>\u591A\u9805\u5F0F\u64EC\u5408</strong> = \u5C0D Vandermonde \u77E9\u9663\u89E3\u6700\u5C0F\u5E73\u65B9\uFF08\u00A713.2\uFF09</li>
        <li><strong>\u5DBA\u56DE\u6B78</strong> = \u52A0 \u03BBI \u7684\u6B63\u898F\u65B9\u7A0B\uFF08\u00A713.3\uFF09</li>
        <li><strong>Logistic / softmax</strong> = \u7DDA\u6027 + \u4E00\u500B\u975E\u7DDA\u6027\u95FC\uFF08\u00A713.4\uFF09</li>
        <li><strong>\u795E\u7D93\u7DB2\u8DEF</strong> = \u4E00\u9023\u4E32\u7DDA\u6027\u8B8A\u63DB \u00D7 \u9EDE\u72C0\u975E\u7DDA\u6027\uFF08\u00A713.5\uFF09</li>
        <li><strong>\u5377\u7A4D</strong> = \u5C40\u90E8\u7684\u7DDA\u6027\u8B8A\u63DB\uFF08\u00A713.6\uFF09</li>
        <li><strong>\u53CD\u5411\u50B3\u64AD</strong> = \u9379\u5F0F\u6CD5\u5247 + \u77E9\u9663\u8F49\u7F6E\uFF08\u00A713.7\uFF09</li>
        <li><strong>\u63A8\u85A6\u7CFB\u7D71 / \u8A5E\u5D4C\u5165</strong> = \u4F4E\u79E9 SVD\uFF08\u00A713.8\uFF09</li>
      </ul>
      <p>
        \u9019\u4E5F\u5C31\u662F\u70BA\u4EC0\u9EBC\u300C\u7DDA\u6027\u4EE3\u6578\u300D\u662F\u73FE\u4EE3\u8CC7\u6599\u79D1\u5B78\u8DDF AI \u7684\u300C\u516C\u7528\u8A9E\u8A00\u300D\u3002\u4E0D\u662F\u56E0\u70BA\u300C\u4ED6\u4E0D\u53EF\u601D\u8B70\u5730\u6709\u7528\u300D\uFF0C
        \u800C\u662F\u56E0\u70BA<strong>\u9AD8\u7DAD\u8CC7\u6599\u88E1\u4F4E\u9635\u7684\u7D50\u69CB\u300C\u5C31\u662F\u300D\u7DDA\u6027\u4EE3\u6578\u80FD\u63CF\u8FF0\u7684\u90A3\u500B\u6A23\u5B50</strong>\u3002
      </p>
      <p>
        \u4E00\u500B\u7AE0\u7BC0\u7D50\u675F \u2014 \u4F60\u73FE\u5728\u51F1\u65CB\u4E86\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .rank-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
      padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); }
    .rank-label { font-size: 13px; color: var(--text); font-weight: 600;
      font-family: 'JetBrains Mono', monospace; min-width: 110px; }
    .rank-slider { flex: 1; accent-color: var(--accent); }

    .matrix-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 12px; }
    @media (min-width: 800px) { .matrix-grid { grid-template-columns: 1fr 1fr; } }

    .m-block { padding: 12px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); }
    .m-title { font-size: 12px; color: var(--text-muted); font-weight: 600;
      margin-bottom: 8px; text-align: center; }

    .rate-table { width: 100%; border-collapse: collapse; font-size: 11px;
      font-family: 'JetBrains Mono', monospace; }
    .rate-table th { font-weight: 600; color: var(--text-muted); padding: 4px 2px;
      text-align: center; }
    .rate-table th.user { text-align: right; padding-right: 6px; color: var(--text-secondary); }
    .cell { padding: 5px 4px; text-align: center; border-radius: 3px;
      color: var(--text); font-weight: 600; min-width: 28px; }
    .cell.empty { background: var(--bg-surface) !important; color: var(--text-muted);
      font-weight: 400; }
    .cell.predicted { outline: 1.5px solid var(--accent); outline-offset: -1.5px; }

    .error-line { padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;
      border: 1px solid var(--border); font-size: 13px; color: var(--text-secondary);
      text-align: center; }
    .error-line strong { color: var(--accent); font-family: 'JetBrains Mono', monospace;
      font-size: 14px; margin: 0 6px; }
    .error-line .hint { font-size: 11px; color: var(--text-muted); margin-left: 8px; }

    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .embed-block { padding: 14px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg); margin: 12px 0; }
    .embed-svg { width: 100%; max-width: 520px; display: block; margin: 0 auto; }
    .word-label { font-size: 0.32px; fill: var(--text); font-family: 'JetBrains Mono', monospace;
      font-weight: 600; }

    .legend { display: flex; gap: 16px; justify-content: center; margin-top: 8px;
      font-size: 11px; color: var(--text-muted); flex-wrap: wrap; }
    .dot { display: inline-block; width: 12px; height: 3px; margin-right: 4px;
      vertical-align: middle; }
    .dot.orange { background: #c8983b; }
    .dot.blue { background: #6e8aa8; }
    .dot.circle { width: 8px; height: 8px; border-radius: 50%; border: 1.5px dashed var(--accent);
      background: transparent; }
  `,
})
export class StepMatrixFactorizationComponent {
  readonly users = USERS;
  readonly movies = MOVIES;
  readonly mask = MASK;
  readonly trueM = TRUE_M;
  readonly words = WORDS;

  readonly rank = signal(2);

  // Build the "observed" matrix: missing entries replaced with the global mean
  // of observed values. Then SVD that, take low rank, and use that as
  // the reconstruction.
  private readonly observed = (() => {
    let sum = 0, count = 0;
    for (let u = 0; u < TRUE_M.length; u++) {
      for (let i = 0; i < TRUE_M[0].length; i++) {
        if (MASK[u][i]) { sum += TRUE_M[u][i]; count++; }
      }
    }
    const mean = sum / count;
    const M: number[][] = [];
    for (let u = 0; u < TRUE_M.length; u++) {
      const row: number[] = [];
      for (let i = 0; i < TRUE_M[0].length; i++) {
        row.push(MASK[u][i] ? TRUE_M[u][i] : mean);
      }
      M.push(row);
    }
    return M;
  })();

  private readonly svdResult = svd(this.observed);

  readonly reconstructed = computed(() => reconstructLowRank(this.svdResult, this.rank()));

  // Mean squared error on the *missing* entries (compared to TRUE_M)
  readonly predictionError = computed(() => {
    const R = this.reconstructed();
    let s = 0, n = 0;
    for (let u = 0; u < TRUE_M.length; u++) {
      for (let i = 0; i < TRUE_M[0].length; i++) {
        if (!MASK[u][i]) {
          const d = R[u][i] - TRUE_M[u][i];
          s += d * d;
          n++;
        }
      }
    }
    return Math.sqrt(s / n);
  });

  // king - man + woman
  readonly computedQueen = (() => {
    const king = WORDS.find((w) => w.name === 'king')!.pos;
    const man = WORDS.find((w) => w.name === 'man')!.pos;
    const woman = WORDS.find((w) => w.name === 'woman')!.pos;
    return { x: king[0] - man[0] + woman[0], y: king[1] - man[1] + woman[1] };
  })();

  readonly queenPos = (() => {
    const q = WORDS.find((w) => w.name === 'queen')!.pos;
    return { x: q[0], y: q[1] };
  })();

  onRank(ev: Event): void {
    const v = +(ev.target as HTMLInputElement).value;
    this.rank.set(v);
  }

  bg(v: number): string {
    // Map 1..5 → light → strong accent
    const t = Math.max(0, Math.min(1, (v - 1) / 4));
    return `rgba(200, 152, 59, ${0.08 + t * 0.32})`;
  }

  colorOf(name: string): string {
    if (name === 'king' || name === 'queen' || name === 'prince' || name === 'princess') return '#c8983b';
    return '#6e8aa8';
  }
}
