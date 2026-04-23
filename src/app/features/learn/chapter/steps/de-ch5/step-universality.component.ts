import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface PhysicalSystem {
  id: string;
  name: string;
  icon: string;
  equation: string;
  variable: string;
  m_analog: string;
  c_analog: string;
  k_analog: string;
  natural_freq: string;
  description: string;
  color: string;
}

const SYSTEMS: PhysicalSystem[] = [
  {
    id: 'spring',
    name: '彈簧—質量—阻尼',
    icon: '\ud83c\udf38',
    equation: 'm·ÿ + c·ẏ + k·y = 0',
    variable: 'y = 位置（相對平衡）',
    m_analog: 'm（質量）',
    c_analog: 'c（阻尼係數）',
    k_analog: 'k（彈簧硬度）',
    natural_freq: 'ω₀ = √(k/m)',
    description: '這章的主角。質量慣性 × 加速度 = 彈簧回復力 − 黏滯阻尼力。',
    color: '#c87b5e',
  },
  {
    id: 'lc',
    name: 'RLC 電路',
    icon: '\u26a1',
    equation: 'L·q̈ + R·q̇ + (1/C)·q = 0',
    variable: 'q = 電容電荷',
    m_analog: 'L（電感）',
    c_analog: 'R（電阻）',
    k_analog: '1/C（電容倒數）',
    natural_freq: 'ω₀ = 1/√(LC)',
    description: '電學版「彈簧—質量—阻尼」。電感儲能像慣性、電容儲能像位能、電阻耗能像阻尼。',
    color: '#5a8aa8',
  },
  {
    id: 'pendulum',
    name: '鐘擺（小振幅）',
    icon: '\u23f3',
    equation: 'm·L²·θ̈ + b·θ̇ + m·g·L·θ = 0',
    variable: 'θ = 擺角（小）',
    m_analog: 'm·L²（轉動慣量）',
    c_analog: 'b（空氣阻尼）',
    k_analog: 'm·g·L（重力回復扭矩係數）',
    natural_freq: 'ω₀ = √(g/L)',
    description: '小角度時 sin θ ≈ θ，鐘擺方程變線性——週期只跟 L 有關，不跟振幅有關（大擺幅會破壞這點）。',
    color: '#5ca878',
  },
  {
    id: 'cantilever',
    name: '懸臂梁末端',
    icon: '\ud83c\udfd7\ufe0f',
    equation: 'm·ÿ + c·ẏ + (3EI/L³)·y = 0',
    variable: 'y = 末端位移',
    m_analog: 'm（末端等效質量）',
    c_analog: 'c（結構內阻尼）',
    k_analog: '3EI/L³（梁剛度）',
    natural_freq: 'ω₀ = √(3EI/(mL³))',
    description: '建築與機械的振動分析都從這開始。鋼材的 E、截面的 I、長度 L 決定一切。',
    color: '#8b6aa8',
  },
  {
    id: 'floating',
    name: '浮體振動',
    icon: '\ud83d\udea2',
    equation: 'm·ÿ + c·ẏ + (ρ·g·A)·y = 0',
    variable: 'y = 浮體上下位移',
    m_analog: 'm（浮體質量）',
    c_analog: 'c（水阻力）',
    k_analog: 'ρ·g·A（浮力回復）',
    natural_freq: 'ω₀ = √(ρgA/m)',
    description: '船或浮標在水面上的上下晃動。浮力隨著下沉量線性增加——這就是「彈簧」常數。',
    color: '#a89a5c',
  },
];

@Component({
  selector: 'app-de-ch5-universality',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="同一首詩：LC 電路、鐘擺、懸臂" subtitle="§5.7">
      <p>
        Ch5 整章都在處理「彈簧—質量—阻尼」。但你可能已經有感覺——
        <strong>這條方程的觸角伸到物理、電子、結構、生物的每個角落</strong>。
      </p>
      <p class="key-idea">
        只要有「<strong>慣性（儲存動態能）+ 回復力（儲存位勢能）+ 耗散（把能量轉成熱）</strong>」這個結構，
        就會得到相同形狀的二階 ODE。
      </p>
      <p>
        這個「數學結構的普適性」讓你只要學會彈簧方程，就自動學會了所有這些系統。
        下面這張互動表展示同樣的方程如何化身成五種物理情境。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點卡片看每個系統的 m / c / k 各對應什麼">
      <div class="systems-grid">
        @for (s of systems; track s.id) {
          <button
            class="sys-card"
            [class.active]="selected().id === s.id"
            [style.--sys-color]="s.color"
            (click)="selected.set(s)"
          >
            <span class="sys-icon">{{ s.icon }}</span>
            <span class="sys-name">{{ s.name }}</span>
          </button>
        }
      </div>

      <!-- Detail panel -->
      <div class="detail" [style.--sys-color]="selected().color">
        <div class="detail-head">
          <span class="detail-icon">{{ selected().icon }}</span>
          <div>
            <div class="detail-tag">系統</div>
            <h3 class="detail-title">{{ selected().name }}</h3>
          </div>
        </div>

        <div class="detail-eq">
          <span class="eq-lab">方程：</span>
          <code class="eq-code">{{ selected().equation }}</code>
        </div>

        <p class="detail-desc">{{ selected().description }}</p>

        <div class="analog-table">
          <div class="tr head">
            <span>抽象變數</span>
            <span>此系統意義</span>
          </div>
          <div class="tr">
            <span class="sym">y 或狀態</span>
            <span>{{ selected().variable }}</span>
          </div>
          <div class="tr">
            <span class="sym">m（慣性）</span>
            <span>{{ selected().m_analog }}</span>
          </div>
          <div class="tr">
            <span class="sym">c（阻尼）</span>
            <span>{{ selected().c_analog }}</span>
          </div>
          <div class="tr">
            <span class="sym">k（回復）</span>
            <span>{{ selected().k_analog }}</span>
          </div>
          <div class="tr highlight">
            <span class="sym">自然頻率 ω₀</span>
            <span>{{ selected().natural_freq }}</span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這個「普適性」是 <strong>數學的一次偉大勝利</strong>：
      </p>
      <ul>
        <li>工程師不用為每個領域重發明輪子——同一套理論（Laplace 變換、共振分析、阻尼設計）全套適用。</li>
        <li>實驗室裡研究一個「簡單」的彈簧—質量系統，就在學所有這些系統的共通行為。</li>
        <li>這種「類比」威力巨大——理解 RC 電路就自動理解牛頓冷卻；理解彈簧就自動理解 RLC 電路。</li>
      </ul>
      <p>
        Part II 接下來的章節會一路沿著這條脈絡走：Ch6 加上外力驅動（共振）、Ch7 用 Laplace 變換掃蕩一切——<strong>所有推導都同時適用於這五個系統</strong>。
      </p>

      <div class="next-preview">
        <div class="np-card">
          <span class="np-lab">下一章 Ch6</span>
          <div class="np-title">受迫振動與共振</div>
          <p>外力 F(t) 加進來：<code>m·ÿ + c·ẏ + k·y = F(t)</code>。當 F 的頻率接近 ω₀，振幅會放大到驚人——這就是<strong>共振</strong>。Tacoma Narrows 橋倒塌的主角。</p>
        </div>
        <div class="np-card">
          <span class="np-lab">Ch7</span>
          <div class="np-title">Laplace 變換</div>
          <p>把時域 ODE 變頻域代數方程。階躍、衝擊、延遲——全部靠代數除法解決。工程分析的瑞士刀。</p>
        </div>
      </div>

      <p class="takeaway">
        <strong>整章 Ch5 的 take-away：</strong>
        二階線性齊次 ODE <code>m·ÿ + c·ẏ + k·y = 0</code> 藏了整個「振動的宇宙」——
        從彈簧到電路到行星軌道。
        判別式分成三類、能量流失率 = c·v²、相平面軌跡揭示系統命運、自然頻率 ω₀ = √(k/m) 是唯一的特徵尺度。
        接下來兩章加上外力，行為更豐富。
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

    .systems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
      margin-bottom: 14px;
    }

    .sys-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 8px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      cursor: pointer;
      transition: all 0.15s;
      font: inherit;
      color: var(--text);
    }

    .sys-card:hover {
      border-color: var(--sys-color);
    }

    .sys-card.active {
      border-color: var(--sys-color);
      background: color-mix(in srgb, var(--sys-color) 12%, var(--bg));
    }

    .sys-icon { font-size: 26px; }
    .sys-name {
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }

    .detail {
      padding: 16px 18px;
      border: 1.5px solid var(--sys-color);
      border-radius: 10px;
      background: color-mix(in srgb, var(--sys-color) 5%, var(--bg));
      margin-bottom: 14px;
    }

    .detail-head {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 10px;
    }

    .detail-icon { font-size: 36px; }

    .detail-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .detail-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin: 2px 0 0;
    }

    .detail-eq {
      padding: 10px 14px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 10px;
      display: flex;
      align-items: baseline;
      gap: 10px;
      flex-wrap: wrap;
    }

    .eq-lab {
      font-size: 11px;
      color: var(--text-muted);
    }

    .eq-code {
      font-size: 15px;
      font-weight: 600;
      padding: 4px 10px;
    }

    .detail-desc {
      margin: 0 0 12px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .analog-table {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg);
    }

    .tr {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px;
      padding: 8px 14px;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      align-items: center;
    }

    .tr:last-child { border-bottom: none; }

    .tr.head {
      background: var(--bg-surface);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .tr.highlight {
      background: color-mix(in srgb, var(--sys-color) 10%, var(--bg));
    }

    .tr.highlight .sym {
      color: var(--sys-color);
      font-weight: 700;
    }

    .tr.highlight span:last-child {
      font-family: 'JetBrains Mono', monospace;
      color: var(--sys-color);
      font-weight: 700;
    }

    .sym {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      font-size: 12px;
    }

    .next-preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 14px 0;
    }

    @media (max-width: 560px) {
      .next-preview { grid-template-columns: 1fr; }
    }

    .np-card {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
    }

    .np-lab {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--accent);
      text-transform: uppercase;
    }

    .np-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      margin: 4px 0 6px;
    }

    .np-card p {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh5UniversalityComponent {
  readonly systems = SYSTEMS;
  readonly selected = signal<PhysicalSystem>(SYSTEMS[0]);
}
