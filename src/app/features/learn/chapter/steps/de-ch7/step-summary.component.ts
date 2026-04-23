import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface PartIIChapter {
  id: string;
  num: string;
  title: string;
  icon: string;
  color: string;
  key_ideas: string[];
  core_tool: string;
}

const CH_CARDS: PartIIChapter[] = [
  {
    id: 'ch5',
    num: 'Ch5',
    title: '二階線性齊次',
    icon: '\ud83c\udf38',
    color: '#5ca878',
    key_ideas: [
      'F=ma 產生二階 ODE，需要兩個初值',
      '特徵方程 ar²+br+c=0 分類解的行為',
      '阻尼三型：過／臨界／欠',
      '能量守恆 / 耗散',
      '相平面視角',
    ],
    core_tool: '特徵方程',
  },
  {
    id: 'ch6',
    num: 'Ch6',
    title: '非齊次與共振',
    icon: '\ud83c\udf09',
    color: '#c87b5e',
    key_ideas: [
      'y = y_h + y_p（瞬態 + 穩態）',
      '未定係數法：觀察外力猜 y_p',
      '共振：Ω=ω₀ 時振幅線性爆炸',
      '頻率響應 |A(Ω)| / Bode 圖',
      '拍頻 beats：兩頻率相差小',
    ],
    core_tool: '頻率響應',
  },
  {
    id: 'ch7',
    num: 'Ch7',
    title: 'Laplace 變換',
    icon: '\ud83d\udd00',
    color: '#5a8aa8',
    key_ideas: [
      'ODE → 代數方程（s-域）',
      '微分變乘法：ℒ[y′] = sY − y(0)',
      '部分分式 + 查表反變換',
      '階梯、衝擊、延遲都變乘法',
      '傳遞函數 H(s)，極點決定穩定性',
    ],
    core_tool: 's-域代數',
  },
];

interface PartIIIPreview {
  id: string;
  num: string;
  title: string;
  tagline: string;
  why: string;
  tools: string[];
  color: string;
}

const PART3_PREVIEW: PartIIIPreview[] = [
  {
    id: 'ch8',
    num: 'Ch8',
    title: '線性 ODE 系統',
    tagline: '從單一方程到一群方程',
    why:
      '多物件系統：兩個連動彈簧、捕食—被食、RLC 多節電路。狀態變成向量 x(t)，方程變成矩陣形式 dx/dt = A·x。',
    tools: ['矩陣指數 e^(At)', '特徵值 / 特徵向量', '相平面分類（結點／焦點／鞍點）'],
    color: '#8b6aa8',
  },
  {
    id: 'ch9',
    num: 'Ch9',
    title: '非線性動力系統',
    tagline: '線性近似與平衡點',
    why:
      '真實系統幾乎都非線性（鐘擺大振幅、族群動態、疾病模型）。關鍵技巧：在平衡點附近「線性化」，用 Ch8 工具局部分析。',
    tools: ['雅可比矩陣', 'Hartman–Grobman 定理', 'Lotka–Volterra 捕食模型', 'Van der Pol 振盪器'],
    color: '#a85c7b',
  },
  {
    id: 'ch10',
    num: 'Ch10',
    title: '分岔與混沌',
    tagline: '小參數變化、大行為差異',
    why:
      '當系統參數穿越「臨界值」，動力行為突然改變（分岔）；某些非線性系統對初值極度敏感（混沌）。自然界無處不在。',
    tools: ['Saddle-node／pitchfork／Hopf 分岔', 'Lyapunov 指數', 'Lorenz 方程 / 奇異吸引子'],
    color: '#c87b5e',
  },
];

@Component({
  selector: 'app-de-ch7-summary',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Part II 總結 + Part III 預告" subtitle="§7.6">
      <p>
        你已經走完了 <strong>Part II：線性高階 ODE</strong>（振動的語言）——三章 20 節。
        這節停下來回顧，然後跨過第二個分水嶺，前往 <strong>Part III：非線性系統、分岔、混沌</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Part II 三章的核心精華">
      <div class="chapter-grid">
        @for (c of chapters; track c.id) {
          <div class="ch-card" [style.--col]="c.color">
            <div class="ch-head">
              <span class="ch-icon">{{ c.icon }}</span>
              <div>
                <span class="ch-label">{{ c.num }}</span>
                <div class="ch-title">{{ c.title }}</div>
              </div>
            </div>
            <ul class="ch-bullets">
              @for (b of c.key_ideas; track b) {
                <li>{{ b }}</li>
              }
            </ul>
            <div class="core-tool">
              <span class="ct-lab">核心工具</span>
              <strong>{{ c.core_tool }}</strong>
            </div>
          </div>
        }
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="為什麼同一個方程 ax″ + bx′ + cx = F 可以有這麼多角度？">
      <div class="viewpoints">
        <div class="vp">
          <div class="vp-tag">Ch5 視角</div>
          <div class="vp-title">特徵方程</div>
          <p>「解的指數模式」。特徵多項式的根 ↔ 時域基本解形式。</p>
        </div>

        <div class="vp">
          <div class="vp-tag">Ch6 視角</div>
          <div class="vp-title">頻率響應</div>
          <p>「系統對每個頻率 Ω 的增益與相位」。Bode 圖濃縮一切。</p>
        </div>

        <div class="vp">
          <div class="vp-tag">Ch7 視角</div>
          <div class="vp-title">s-域代數</div>
          <p>「Y(s) 的極點」。部分分式還原時域，極點位置 = 穩定性。</p>
        </div>
      </div>

      <div class="synthesis">
        <p>
          三個視角<strong>指向同一個真理</strong>——<em>特徵多項式的根 = 自然頻率 = 傳遞函數極點</em>——
          只是用不同的語言描述。選哪個用，端看你的問題：
        </p>
        <ul>
          <li><strong>Ch5 方法</strong>：手算齊次方程、理解行為分類。</li>
          <li><strong>Ch6 方法</strong>：正弦輸入、設計濾波器、分析共振。</li>
          <li><strong>Ch7 方法</strong>：複雜輸入、控制系統、工業分析軟體。</li>
        </ul>
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="Part III 預告：從線性走向非線性的世界">
      <div class="warning-banner">
        <strong>⚠ 前方預警：</strong>
        Part I 跟 Part II 的所有方法，都依賴<strong>線性</strong>這個金雞母——
        疊加原理、特徵方程、頻率響應、部分分式⋯⋯<em>通通只在線性世界成立</em>。
        Part III 踏入非線性——這裡<strong>沒有通用解法</strong>，但有更豐富的行為。
      </div>

      <div class="preview-grid">
        @for (p of part3Preview; track p.id) {
          <div class="pv-card" [style.--col]="p.color"
            [class.expanded]="expanded() === p.id"
            (click)="expanded.set(expanded() === p.id ? null : p.id)">
            <div class="pv-head">
              <span class="pv-num">{{ p.num }}</span>
              <div>
                <div class="pv-title">{{ p.title }}</div>
                <div class="pv-tagline">{{ p.tagline }}</div>
              </div>
            </div>

            @if (expanded() === p.id) {
              <div class="pv-body">
                <p class="pv-why">{{ p.why }}</p>
                <div class="pv-tools">
                  <span class="tools-lab">主要工具</span>
                  @for (t of p.tools; track t) {
                    <span class="tool-chip">{{ t }}</span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <div class="next-link">
        <a class="next-cta" href="/learn/de/ch8/1">
          開始 Part III — Ch8 §8.1 →
        </a>
        <p class="next-note">
          目前 Ch8 尚未開放（持續建構中）。後續還有 Part IV：熱方程、波方程、Laplace 方程（PDE）。
        </p>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>整個 Part II 的 take-away：</strong>
        「振動」是物理與工程的共通語言——彈簧、電路、鐘擺、樂器、建築⋯⋯全部共用相同的 ax″+bx′+cx=F 骨架。
        Ch5 教你看懂骨架；Ch6 加上外力看見共振；Ch7 把整套語言升級為工程通用的 s-域代數。
        三章共同構成現代控制理論與訊號處理的基礎。
      </p>
    </app-prose-block>
  `,
  styles: `
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

    .chapter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
    }

    .ch-card {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 6%, var(--bg));
    }

    .ch-head {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }

    .ch-icon { font-size: 28px; }

    .ch-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--col);
      text-transform: uppercase;
    }

    .ch-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    .ch-bullets {
      margin: 0 0 10px;
      padding-left: 18px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .ch-bullets li { margin-bottom: 3px; }

    .core-tool {
      padding: 8px 12px;
      background: var(--bg-surface);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-left: 3px solid var(--col);
    }

    .ct-lab {
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .core-tool strong {
      font-size: 13px;
      color: var(--col);
      font-weight: 700;
    }

    .viewpoints {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }

    .vp {
      padding: 14px;
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      background: var(--bg);
    }

    .vp-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .vp-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--accent);
      margin: 4px 0 6px;
    }

    .vp p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .synthesis {
      padding: 12px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .synthesis p {
      margin: 0 0 10px;
    }

    .synthesis ul {
      margin: 0;
      padding-left: 20px;
    }

    .warning-banner {
      padding: 12px 14px;
      background: rgba(200, 123, 94, 0.08);
      border: 1px solid rgba(200, 123, 94, 0.35);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 14px;
    }

    .warning-banner strong { color: #c87b5e; }

    .preview-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    .pv-card {
      padding: 14px 16px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 5%, var(--bg));
      cursor: pointer;
      transition: all 0.15s;
    }

    .pv-card:hover {
      background: color-mix(in srgb, var(--col) 10%, var(--bg));
    }

    .pv-head {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .pv-num {
      display: inline-flex;
      min-width: 36px;
      height: 28px;
      padding: 0 8px;
      background: var(--col);
      color: white;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      justify-content: center;
      align-items: center;
      letter-spacing: 0.06em;
    }

    .pv-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }

    .pv-tagline {
      font-size: 12px;
      color: var(--text-muted);
    }

    .pv-body {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed var(--border);
    }

    .pv-why {
      margin: 0 0 10px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .pv-tools {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: baseline;
    }

    .tools-lab {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-right: 4px;
    }

    .tool-chip {
      font-size: 11px;
      padding: 3px 10px;
      background: var(--bg);
      border: 1px solid var(--col);
      color: var(--col);
      border-radius: 12px;
    }

    .next-link {
      text-align: center;
      padding-top: 14px;
      border-top: 1px dashed var(--border);
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

    .next-note {
      margin: 8px 0 0;
      font-size: 11px;
      color: var(--text-muted);
    }
  `,
})
export class DeCh7SummaryComponent {
  readonly chapters = CH_CARDS;
  readonly part3Preview = PART3_PREVIEW;
  readonly expanded = signal<string | null>('ch8');
}
