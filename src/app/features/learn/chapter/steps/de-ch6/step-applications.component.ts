import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface RealCase {
  id: string;
  icon: string;
  name: string;
  category: 'disaster' | 'useful' | 'natural';
  story: string;
  resonance_source: string;
  natural_freq: string;
  engineering: string;
  color: string;
}

const CASES: RealCase[] = [
  {
    id: 'tacoma',
    icon: '\ud83c\udf09',
    name: 'Tacoma Narrows 橋（1940）',
    category: 'disaster',
    story:
      '華盛頓州的懸吊橋。完工四個月後在一個風速僅 64 km/h 的早晨劇烈擺動並崩塌——全程錄影。「會搖動的蓋勒夫人」成為結構工程的經典警示。',
    resonance_source: '不是單純共振，更像「空氣彈性顫振」——結構振動與風渦流頻率耦合放大。',
    natural_freq: '約 0.2 Hz（扭轉模態）',
    engineering: '後續橋樑加強剛度、加風洞測試；當代橋樑設計必考慮空氣動力學。',
    color: '#c87b5e',
  },
  {
    id: 'millennium',
    icon: '\ud83d\udeb6',
    name: '千禧橋倫敦（2000）',
    category: 'disaster',
    story:
      '英女王剪綵後，行人走上橋面——橋開始左右晃動。數百人的腳步自動同步於橋的橫向自然頻率，放大效應讓橋不堪使用。三天後關閉改裝。',
    resonance_source: '人群自組織同步（synchronization）+ 橋橫向自然模態。',
    natural_freq: '約 0.5 Hz（橫向擺動）',
    engineering: '加裝 37 個調諧質量阻尼器（TMD）把振動吸走。',
    color: '#c87b5e',
  },
  {
    id: 'mri',
    icon: '\ud83e\uddf2',
    name: 'MRI 核磁共振',
    category: 'useful',
    story:
      '醫學影像的核心技術。強磁場讓體內氫原子核進動；射頻脈衝「擊中」它們的拉莫爾頻率（共振），吸收能量；再量測釋放出的訊號重建影像。',
    resonance_source: '外加射頻與核子磁矩進動頻率精確匹配。',
    natural_freq: '數十到數百 MHz，視磁場強度而定',
    engineering: '精準控制頻率與磁場均勻性，是現代醫療影像的物理核心。',
    color: '#5ca878',
  },
  {
    id: 'radio',
    icon: '\ud83d\udce1',
    name: '收音機調台',
    category: 'useful',
    story:
      '空中有上百個電磁波頻率同時存在。收音機的 LC 共振電路「挑」出你想要的頻率——其他頻率響應幾乎為零。',
    resonance_source: '天線 + LC 電路的窄帶響應峰。',
    natural_freq: 'AM：540–1600 kHz；FM：88–108 MHz',
    engineering: '高 Q 共振電路（低阻尼）才能分辨接近的電台。',
    color: '#5ca878',
  },
  {
    id: 'violin',
    icon: '\ud83c\udfbb',
    name: '樂器共鳴',
    category: 'useful',
    story:
      '小提琴弦本身很細、聲音微弱。共鳴箱的自然頻率涵蓋人耳可聽範圍，把弦的振動放大並賦予「音色」——不同木材、形狀造成不同的頻率響應曲線。',
    resonance_source: '琴弦振動激發琴身多重共鳴模式。',
    natural_freq: '多個峰值（200 Hz – 5 kHz）',
    engineering: '精選雲杉、楓木、形狀精雕——所有都是調諧頻率響應的工藝。',
    color: '#5ca878',
  },
  {
    id: 'quake',
    icon: '\ud83c\udfe2',
    name: '建築物地震共振',
    category: 'disaster',
    story:
      '大地震的主要危險頻率約 0.5–5 Hz。高樓的自然頻率恰好也在這區——若二者匹配，建築會共振崩塌（台北 921、1985 墨西哥市的教訓）。',
    resonance_source: '地震波頻率 + 建築基本模態匹配。',
    natural_freq: '1/(0.1 × 樓層數) Hz — 10 層約 1 Hz',
    engineering: '調諧質量阻尼器（台北 101 的 660 噸球）、基礎隔震裝置。',
    color: '#c87b5e',
  },
  {
    id: 'glass',
    icon: '\ud83c\udf77',
    name: '震碎玻璃杯',
    category: 'natural',
    story:
      '高音歌手唱出玻璃杯的自然頻率，能量不斷累積直到材料裂開。不是都市傳說——好 Q 值的薄壁玻璃杯 + 持續 110 dB 的純音就會發生。',
    resonance_source: '音波頻率 = 玻璃自然模態。',
    natural_freq: '視玻璃形狀：數百 Hz–1 kHz',
    engineering: '反向應用：超音波清洗利用類似現象鬆動汙垢。',
    color: '#a89a5c',
  },
];

@Component({
  selector: 'app-de-ch6-applications',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="真實世界的共振" subtitle="§6.6">
      <p>
        共振不只是彈簧題。它<strong>無處不在</strong>——醫療影像、通訊、音樂、災難。
        這一節收集幾個經典案例，讓數學上「振幅放大」這個抽象概念落到真實情境。
      </p>
      <p class="key-idea">
        所有這些案例背後都是同一條方程：<code>mẍ + cẋ + kx = F(t)</code> 或其推廣。
        只是 m、c、k 代表的物理不同、F(t) 的來源不同——但<strong>頻率響應曲線的形狀都一樣</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="七個真實案例：從世紀工程災難到日常科技">
      <!-- Category filters -->
      <div class="cat-row">
        <button class="cat-btn" [class.active]="filter() === 'all'" (click)="filter.set('all')">
          全部
        </button>
        <button class="cat-btn" [class.active]="filter() === 'disaster'" (click)="filter.set('disaster')">
          ⚠ 災難
        </button>
        <button class="cat-btn" [class.active]="filter() === 'useful'" (click)="filter.set('useful')">
          ✓ 善用
        </button>
        <button class="cat-btn" [class.active]="filter() === 'natural'" (click)="filter.set('natural')">
          趣味
        </button>
      </div>

      <div class="cases-grid">
        @for (c of filteredCases(); track c.id) {
          <div class="case-card"
            [style.--col]="c.color"
            [class.expanded]="expanded() === c.id"
            (click)="toggle(c.id)">
            <div class="card-head">
              <span class="c-icon">{{ c.icon }}</span>
              <div>
                <span class="c-cat" [attr.data-cat]="c.category">
                  {{ c.category === 'disaster' ? '⚠' : c.category === 'useful' ? '✓' : '' }}
                </span>
                <div class="c-name">{{ c.name }}</div>
              </div>
            </div>

            @if (expanded() === c.id) {
              <div class="card-body">
                <p class="c-story">{{ c.story }}</p>

                <div class="c-meta">
                  <div class="meta-row">
                    <span class="meta-k">共振來源</span>
                    <span class="meta-v">{{ c.resonance_source }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">自然頻率</span>
                    <span class="meta-v freq">{{ c.natural_freq }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">工程處理</span>
                    <span class="meta-v">{{ c.engineering }}</span>
                  </div>
                </div>
              </div>
            } @else {
              <div class="card-preview">{{ c.story.slice(0, 40) }}…</div>
            }
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        共振有兩面：
      </p>
      <ul>
        <li><strong>工程噩夢</strong>：橋樑、建築、機械的自然頻率不能跟常見激勵（風、地震、車流）重合，否則會放大到崩塌。</li>
        <li><strong>科技基礎</strong>：通訊、醫療影像、樂器——高 Q 共振器是「選頻」的關鍵元件。</li>
      </ul>
      <p>
        設計工程系統時，核心問題往往就是：
      </p>
      <ul>
        <li>「我的系統的自然頻率 ω₀ 是什麼？」</li>
        <li>「可能的外部激勵頻譜是什麼？」</li>
        <li>「兩者會不會重疊？若會，如何避開或阻尼掉？」</li>
      </ul>
      <p>
        這三個問題的答案通通來自這一章的工具：特徵方程找 ω₀、頻率響應 |A(Ω)| 看放大、阻尼比 ζ 控制峰尖。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="Ch7 預告：Laplace 變換——把 ODE 變代數">
      <div class="next-card">
        <div class="next-head">
          <span class="next-lab">下一章 Ch7</span>
          <h3 class="next-title">Laplace 變換</h3>
        </div>

        <p>
          這一章處理的外力都是<strong>cos(Ωt) 這類正弦</strong>。但現實中的外力常是：
        </p>
        <ul>
          <li><strong>階梯函數</strong>：某一瞬間突然開啟的外力（開關）</li>
          <li><strong>衝擊</strong>：極短時間內的大力（敲擊、撞擊）</li>
          <li><strong>方波、鋸齒波</strong>：電子訊號</li>
          <li><strong>延遲</strong>：外力延後一段時間才出現</li>
        </ul>
        <p>
          這些「非平滑」外力在未定係數法下很難處理。但 <strong>Laplace 變換</strong>把整個 ODE 變成頻域代數方程：
        </p>
        <div class="laplace-eq">
          m·s²·Y(s) + c·s·Y(s) + k·Y(s) = F(s)<br>
          → Y(s) = F(s) / (m·s² + c·s + k)
        </div>
        <p>
          除法就解決了 ODE！最難的步驟是把 F(s)/(ms²+cs+k) 反變換回 y(t)——
          那需要查表、部分分式、或 Mellin 積分。
        </p>
        <p>
          Laplace 是工程師求解 ODE 的<strong>瑞士刀</strong>——控制理論、電路分析、訊號處理全部離不開它。
        </p>

        <a class="next-cta" href="/learn/de/ch7/1">
          開始 Ch7 §7.1 →
        </a>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p class="takeaway">
        <strong>整章 Ch6 的 take-away：</strong>
        加入外力讓線性 ODE 從「自由演化」升級成「被驅動的系統」。
        解的結構 = 瞬態（被忘記）+ 穩態（跟隨外力）。
        共振是最戲劇性的現象——可能是災難、也可能是科技。
        頻率響應 |A(Ω)| 是整個工程分析的語言。
        下一章 Laplace 把這套觀點變得更普適。
      </p>
    </app-prose-block>
  `,
  styles: `
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

    .cat-row {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .cat-btn {
      font: inherit;
      font-size: 13px;
      padding: 6px 14px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      border-radius: 20px;
      cursor: pointer;
      color: var(--text);
      font-weight: 600;
    }

    .cat-btn:hover { border-color: var(--accent); }
    .cat-btn.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
    }

    .cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 10px;
    }

    .case-card {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 5%, var(--bg));
      cursor: pointer;
      transition: all 0.2s;
    }

    .case-card:hover {
      background: color-mix(in srgb, var(--col) 10%, var(--bg));
    }

    .case-card.expanded {
      grid-column: 1 / -1;
      background: color-mix(in srgb, var(--col) 10%, var(--bg));
    }

    .card-head {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .c-icon { font-size: 32px; }

    .c-cat[data-cat='disaster'] { color: #c87b5e; font-weight: 700; }
    .c-cat[data-cat='useful'] { color: #5ca878; font-weight: 700; }
    .c-cat[data-cat='natural'] { color: #a89a5c; font-weight: 700; }

    .c-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    .card-preview {
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .card-body {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed var(--border);
    }

    .c-story {
      margin: 0 0 12px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .c-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .meta-row {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 10px;
      padding: 6px 10px;
      background: var(--bg);
      border-radius: 6px;
      font-size: 12px;
    }

    .meta-k {
      color: var(--text-muted);
      font-weight: 600;
      font-size: 11px;
    }

    .meta-v {
      color: var(--text);
      line-height: 1.5;
    }

    .meta-v.freq {
      font-family: 'JetBrains Mono', monospace;
      color: var(--col);
      font-weight: 600;
    }

    .next-card {
      padding: 18px;
      border: 1.5px solid var(--accent);
      background: var(--accent-10);
      border-radius: 12px;
    }

    .next-head {
      margin-bottom: 12px;
    }

    .next-lab {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .next-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--accent);
      margin: 4px 0 0;
    }

    .next-card p {
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .next-card ul {
      margin: 8px 0;
      padding-left: 22px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .laplace-eq {
      padding: 14px 18px;
      background: var(--bg);
      border: 1px dashed var(--accent);
      border-radius: 8px;
      margin: 12px 0;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      line-height: 1.8;
      color: var(--accent);
    }

    .next-cta {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 24px;
      font-size: 14px;
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
export class DeCh6ApplicationsComponent {
  readonly cases = CASES;
  readonly expanded = signal<string | null>('tacoma');
  readonly filter = signal<'all' | 'disaster' | 'useful' | 'natural'>('all');

  toggle(id: string): void {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  readonly filteredCases = computed(() => {
    const f = this.filter();
    if (f === 'all') return CASES;
    return CASES.filter((c) => c.category === f);
  });
}
