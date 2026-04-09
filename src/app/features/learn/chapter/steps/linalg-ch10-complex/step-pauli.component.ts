import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface PauliInfo {
  name: string;
  symbol: string;
  matrix: string[][];
  desc: string;
  ev1Vec: string;
  ev2Vec: string;
  bloch: string;
}

const PAULIS: PauliInfo[] = [
  {
    name: 'Pauli X',
    symbol: '\u03C3\u2093',
    matrix: [['0', '1'], ['1', '0']],
    desc: '\u4E5F\u53EB NOT \u9598\uFF1A\u4EA4\u63DB |0\u27E9 \u8DDF |1\u27E9',
    ev1Vec: '|+\u27E9 = (|0\u27E9 + |1\u27E9)/\u221A2',
    ev2Vec: '|\u2212\u27E9 = (|0\u27E9 \u2212 |1\u27E9)/\u221A2',
    bloch: 'x \u8EF8',
  },
  {
    name: 'Pauli Y',
    symbol: '\u03C3\u1D67',
    matrix: [['0', '\u2212i'], ['i', '0']],
    desc: '\u542B\u8907\u6578\u7684 Pauli \u77E9\u9663',
    ev1Vec: '|+i\u27E9 = (|0\u27E9 + i|1\u27E9)/\u221A2',
    ev2Vec: '|\u2212i\u27E9 = (|0\u27E9 \u2212 i|1\u27E9)/\u221A2',
    bloch: 'y \u8EF8',
  },
  {
    name: 'Pauli Z',
    symbol: '\u03C3z',
    matrix: [['1', '0'], ['0', '\u22121']],
    desc: '\u5C0D\u89D2\u77E9\u9663\uFF1A\u8B93 |1\u27E9 \u88AB\u4E58 \u22121',
    ev1Vec: '|0\u27E9',
    ev2Vec: '|1\u27E9',
    bloch: 'z \u8EF8',
  },
];

@Component({
  selector: 'app-step-pauli',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Pauli \u77E9\u9663" subtitle="\u00A710.5">
      <p>
        \u4E09\u500B\u7279\u5225\u7684 2\u00D72 \u8907\u77E9\u9663\u4EAE\u76F8\u4E86\uFF0C\u53EB\u505A <strong>Pauli \u77E9\u9663</strong>\uFF1A
      </p>
      <p>\u4ED6\u5011\u540C\u6642\u662F <strong>Hermitian</strong> \u4E26\u4E14 <strong>Unitary</strong>\u3002\u9019\u6975\u70BA\u7279\u6B8A\u2014\u4E00\u822C\u77E9\u9663\u53EA\u6703\u662F\u5176\u4E2D\u4E00\u500B\u3002</p>
      <p>
        \u53E6\u5916 Pauli \u77E9\u9663\u7684\u7279\u5FB5\u503C\u90FD\u662F <strong>\u00B11</strong>\uFF0C
        \u9019\u4F86\u81EA\u300CHermitian \u2192 \u5BE6\u7279\u5FB5\u503C\u300D\u8DDF\u300CUnitary \u2192 |\u03BB|=1\u300D\u7684\u96D9\u91CD\u9650\u5236\u3002
      </p>
    </app-prose-block>

    <app-challenge-card prompt="\u9EDE\u4E09\u500B Pauli \u77E9\u9663\uFF0C\u770B\u4ED6\u5011\u7684\u77E9\u9663\u3001\u7279\u5FB5\u5411\u91CF\u3001\u7279\u5FB5\u503C">
      <div class="tab-row">
        @for (p of paulis; track p.name; let i = $index) {
          <button class="pt" [class.active]="sel() === i" (click)="sel.set(i)">{{ p.symbol }}</button>
        }
      </div>

      <div class="matrix-display">
        <span class="md-name">{{ current().symbol }} =</span>
        <div class="md-bracket">[</div>
        <div class="md-body">
          <div class="md-row">
            <span class="md-cell">{{ current().matrix[0][0] }}</span>
            <span class="md-cell">{{ current().matrix[0][1] }}</span>
          </div>
          <div class="md-row">
            <span class="md-cell">{{ current().matrix[1][0] }}</span>
            <span class="md-cell">{{ current().matrix[1][1] }}</span>
          </div>
        </div>
        <div class="md-bracket">]</div>
      </div>

      <div class="info">
        <div class="info-row">
          <span class="il">\u540D\u7A31</span>
          <span class="iv plain">{{ current().name }} \u00B7 {{ current().desc }}</span>
        </div>
        <div class="info-row pos">
          <span class="il">\u03BB = +1</span>
          <span class="iv">\u7279\u5FB5\u5411\u91CF\uFF1A{{ current().ev1Vec }}</span>
        </div>
        <div class="info-row neg">
          <span class="il">\u03BB = \u22121</span>
          <span class="iv">\u7279\u5FB5\u5411\u91CF\uFF1A{{ current().ev2Vec }}</span>
        </div>
        <div class="info-row big">
          <span class="il">Bloch \u4F4D\u7F6E</span>
          <span class="iv plain">\u5169\u500B\u7279\u5FB5\u5411\u91CF\u5C0D\u61C9 Bloch \u7403\u9762\u7684 <strong>{{ current().bloch }}</strong>\u4E0A\u4E0B\u5169\u7AEF</span>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block title="\u95DC\u9375\u95DC\u4FC2\uFF1A\u53CD\u4EA4\u63DB">
      <p>\u4EFB\u610F\u5169\u500B\u4E0D\u540C\u7684 Pauli \u77E9\u9663\u6EFF\u8DB3\uFF1A</p>
      <p class="formula">\u03C3\u1D62 \u03C3\u2C7C = \u2212 \u03C3\u2C7C \u03C3\u1D62  (i \u2260 j)</p>
      <p>
        \u9019\u53EB\u300C<strong>\u53CD\u4EA4\u63DB</strong>\u300D\u3002\u4ED6\u5011<strong>\u4E0D\u4EA4\u63DB</strong>\uFF0C\u4E14\u4EA4\u63DB\u662F\u300C\u8B8A\u865F\u300D\u7684\u95DC\u4FC2\u3002
      </p>
      <p>
        \u9019\u662F\u91CF\u5B50\u529B\u5B78\u300C\u4E0D\u78BA\u5B9A\u6027\u539F\u7406\u300D\u7684\u8D77\u9EDE\uFF1A\u9019\u4E09\u500B Pauli \u77E9\u9663\u4EE3\u8868\u4E09\u500B\u4E0D\u540C\u65B9\u5411\u7684\u300C\u81EA\u65CB\u300D\u91CF\u6E2C\uFF0C
        \u4ED6\u5011<strong>\u4E0D\u80FD\u540C\u6642\u88AB\u6E2C\u91CF</strong>\uFF08\u56E0\u70BA\u4E0D\u4EA4\u63DB\uFF09\u3002
      </p>
      <p>\u53E6\u4E00\u500B\u91CD\u8981\u95DC\u4FC2\uFF1A</p>
      <p class="formula">\u03C3\u2093\u00B2 = \u03C3\u1D67\u00B2 = \u03C3z\u00B2 = I</p>
      <p>\u4E5F\u5C31\u662F\u8AAA\u6BCF\u500B Pauli \u77E9\u9663\u662F\u300C\u81EA\u9006\u300D\u7684\u3002</p>
    </app-prose-block>

    <app-prose-block>
      <p>
        Pauli \u77E9\u9663\u4E0D\u662F\u73A9\u5177\u3002\u4ED6\u5011\u662F\u91CF\u5B50\u529B\u5B78\u88E1\u9762\u300C\u81EA\u65CB-1/2 \u7C92\u5B50\u300D\uFF08\u4F8B\u5982\u96FB\u5B50\uFF09\u7684\u4E09\u500B\u81EA\u65CB\u5206\u91CF\u7684\u6578\u5B78\u8868\u793A\u3002
      </p>
      <p>
        \u4E5F\u5C31\u662F\u8AAA\uFF0C<strong>\u96FB\u5B50\u9019\u9EBC\u57FA\u672C\u7684\u7269\u4EF6\u88AB 4 \u500B\u8907\u6578\u5B57\u63CF\u8FF0</strong>\uFF1A
      </p>
      <ul>
        <li>\u4E00\u500B\u8907\u632F\u5E45 \u03B1\uFF1A\u300C\u5728\u4E0A\u300D\u7684\u91CF\u5B50\u632F\u5E45</li>
        <li>\u4E00\u500B\u8907\u632F\u5E45 \u03B2\uFF1A\u300C\u5728\u4E0B\u300D\u7684\u91CF\u5B50\u632F\u5E45</li>
        <li>|\u03B1|\u00B2 + |\u03B2|\u00B2 = 1\uFF08\u6A5F\u7387\u7E3D\u548C\uFF09</li>
      </ul>
      <p>
        \u9019\u500B 2 \u7DAD\u8907\u5411\u91CF\u53EB\u505A<strong>\u91CF\u5B50\u4F4D\u5143</strong>\uFF08qubit\uFF09\u3002\u4E0B\u4E00\u7Bc0\u6211\u5011\u770B\u600E\u9EBC\u53EF\u8996\u5316\u4ED6\u3002
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 18px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }

    .tab-row { display: flex; gap: 8px; margin-bottom: 14px; justify-content: center; }
    .pt { padding: 10px 24px; border: 1px solid var(--border); border-radius: 8px;
      background: transparent; color: var(--text); font-size: 18px; font-weight: 700;
      font-family: 'Noto Sans Math', serif; cursor: pointer; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); } }

    .matrix-display { display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg);
      margin-bottom: 14px; }
    .md-name { font-size: 18px; font-weight: 700; color: var(--accent); font-family: 'Noto Sans Math', serif; margin-right: 6px; }
    .md-bracket { font-size: 50px; font-weight: 200; color: var(--text-muted); line-height: 0.9; }
    .md-body { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
    .md-row { display: flex; gap: 6px; }
    .md-cell { min-width: 56px; padding: 6px 12px; text-align: center;
      font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text);
      background: var(--bg-surface); border-radius: 4px; }

    .info { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .info-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      &.pos { background: rgba(90, 138, 90, 0.06); }
      &.neg { background: rgba(160, 90, 90, 0.06); }
      &.big { background: var(--accent-10); } }
    .il { padding: 7px 12px; font-size: 12px; color: var(--text-muted); background: var(--bg-surface);
      border-right: 1px solid var(--border); font-family: 'Noto Sans Math', serif; }
    .iv { padding: 7px 12px; font-size: 13px; color: var(--text); font-family: 'JetBrains Mono', monospace;
      &.plain { font-family: inherit; } }
    .iv strong { color: var(--accent); }
  `,
})
export class StepPauliComponent {
  readonly paulis = PAULIS;
  readonly sel = signal(0);
  readonly current = computed(() => this.paulis[this.sel()]);
}
