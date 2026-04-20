import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
} from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type PhenId = 'cooling' | 'population' | 'freefall' | 'infection' | 'interest';

interface Phenomenon {
  id: PhenId;
  name: string;
  emoji: string;
  story: string;
  variable: string;
  variableDesc: string;
  causality: string;
  equation: string;
  color: string;
  paramLabel: string;
  paramMin: number;
  paramMax: number;
  paramStep: number;
  paramDefault: number;
  paramFormat: (v: number) => string;
  tMax: number;
}

const PHENOMENA: Phenomenon[] = [
  {
    id: 'cooling',
    name: '咖啡冷卻',
    emoji: '\u2615',
    story: '熱咖啡放室溫下，越燙冷得越快；快接近室溫時降溫變慢。',
    variable: 'T(t)',
    variableDesc: '咖啡溫度（°C）',
    causality: '降溫速度 ∝ 咖啡跟室溫的溫差',
    equation: 'dT/dt = -k (T - T\u2090)',
    color: '#c87b5e',
    paramLabel: 'T\u2090（室溫）',
    paramMin: 5,
    paramMax: 35,
    paramStep: 1,
    paramDefault: 25,
    paramFormat: (v) => `${v.toFixed(0)} °C`,
    tMax: 30,
  },
  {
    id: 'population',
    name: '兔子繁殖',
    emoji: '\ud83d\udc07',
    story: '一小群兔子放到無天敵的島上，數量越多，新生速度就越快。',
    variable: 'N(t)',
    variableDesc: '兔子總數',
    causality: '新生速度 ∝ 當前兔子數量',
    equation: 'dN/dt = r N',
    color: '#a89a5c',
    paramLabel: 'r（繁殖率）',
    paramMin: 0.1,
    paramMax: 0.8,
    paramStep: 0.02,
    paramDefault: 0.35,
    paramFormat: (v) => v.toFixed(2),
    tMax: 10,
  },
  {
    id: 'freefall',
    name: '自由落體',
    emoji: '\ud83c\udf4e',
    story: '蘋果下落：重力讓它加速，空氣阻力隨速度增加而變強。',
    variable: 'v(t)',
    variableDesc: '下落速度（m/s）',
    causality: '加速度 = 重力 − 阻力（∝ 速度）',
    equation: 'dv/dt = g - (k/m) v',
    color: '#5e7fb0',
    paramLabel: 'k/m（阻力/質量）',
    paramMin: 0.1,
    paramMax: 2.0,
    paramStep: 0.05,
    paramDefault: 0.5,
    paramFormat: (v) => v.toFixed(2),
    tMax: 12,
  },
  {
    id: 'infection',
    name: '病毒傳染',
    emoji: '\ud83e\udda0',
    story: '一人帶病入鎮。染病人少時傳得慢，中段最快，全鎮快染滿時又減緩。',
    variable: 'I(t)',
    variableDesc: '感染人數',
    causality: '新感染速度 ∝ I × (P − I)',
    equation: 'dI/dt = \u03b2 I (P - I)',
    color: '#a85ca0',
    paramLabel: '\u03b2（接觸率）',
    paramMin: 0.01,
    paramMax: 0.2,
    paramStep: 0.005,
    paramDefault: 0.05,
    paramFormat: (v) => v.toFixed(3),
    tMax: 20,
  },
  {
    id: 'interest',
    name: '複利儲蓄',
    emoji: '\ud83d\udcb0',
    story: '連續複利的帳戶，每秒多賺的錢正比於目前餘額。',
    variable: 'M(t)',
    variableDesc: '帳戶餘額',
    causality: '利息速度 ∝ 當前餘額',
    equation: 'dM/dt = r M',
    color: '#5ca878',
    paramLabel: 'r（年利率）',
    paramMin: 0.01,
    paramMax: 0.2,
    paramStep: 0.005,
    paramDefault: 0.08,
    paramFormat: (v) => `${(v * 100).toFixed(1)}%`,
    tMax: 30,
  },
];

function coolingValue(t: number, Ta: number): number {
  const T0 = 90;
  const k = 0.12;
  return Ta + (T0 - Ta) * Math.exp(-k * t);
}

function populationValue(t: number, r: number): number {
  const N0 = 2;
  return N0 * Math.exp(r * t);
}

function freefallValue(t: number, km: number): number {
  const g = 9.8;
  return (g / km) * (1 - Math.exp(-km * t));
}

function infectionValue(t: number, beta: number): number {
  const P = 100;
  const I0 = 1;
  const c = (P - I0) / I0;
  return P / (1 + c * Math.exp(-beta * P * t));
}

function interestValue(t: number, r: number): number {
  const M0 = 1000;
  return M0 * Math.exp(r * t);
}

// Fixed rabbit positions (deterministic so they don't jitter every frame)
const RABBIT_POSITIONS: [number, number][] = Array.from({ length: 60 }, (_, i) => {
  const rng = (i * 2654435761) >>> 0;
  const x = ((rng % 1000) / 1000) * 260 - 130;
  const y = (((rng >>> 10) % 1000) / 1000) * 110 - 55;
  return [x, y];
});

@Component({
  selector: 'app-de-ch1-phenomenon',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="從現象到方程" subtitle="§1.1">
      <p>
        為什麼要學微分方程？因為<strong>世界上絕大多數會「變」的東西</strong>——溫度、族群、速度、疾病、金錢——
        它們的共同語言就是微分方程。
      </p>
      <p>
        這門學問的起點是一個很簡單的觀察：
      </p>
      <p class="mantra">
        很多時候，我們不知道「它現在是多少」，但我們知道「它<strong>正在怎麼變</strong>」。
      </p>
      <p>
        牛頓冷卻定律不會告訴你此刻咖啡幾度，它只說：<em>降溫的速度跟溫差成正比</em>。
        這句話就是一條微分方程。這一節我們就看這樣一句話，怎麼變成可以跑出時間演化的東西。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個現象 → 按 ▶ 播放，看它隨時間怎麼變、方程怎麼描述它">
      <div class="phen-picker">
        @for (p of phenomena; track p.id) {
          <button
            class="phen-btn"
            [class.active]="selected().id === p.id"
            [style.--phen-color]="p.color"
            (click)="switchPhenomenon(p)"
          >
            <span class="phen-emoji">{{ p.emoji }}</span>
            <span class="phen-name">{{ p.name }}</span>
          </button>
        }
      </div>

      <p class="story">{{ selected().story }}</p>

      <!-- Simulation panel -->
      <div class="sim-panel" [style.--phen-color]="selected().color">
        <div class="sim-grid">
          <!-- Scene -->
          <div class="scene-wrap">
            <div class="scene-title">場景</div>
            <svg viewBox="-140 -90 280 180" class="scene-svg">
              @switch (selected().id) {
                @case ('cooling') {
                  <!-- Coffee mug -->
                  <defs>
                    <clipPath id="coffeeClip"><rect x="-45" y="-35" width="90" height="65" rx="3" /></clipPath>
                  </defs>
                  <!-- Ambient background -->
                  <rect x="-140" y="-90" width="280" height="180"
                    [attr.fill]="coolingBgColor()" opacity="0.08" />
                  <!-- Steam (fade out as cooling) -->
                  @for (i of [0, 1, 2]; track i) {
                    <path
                      [attr.d]="coolingSteamPath(i)"
                      stroke="#aab4c0"
                      stroke-width="1.5"
                      fill="none"
                      stroke-linecap="round"
                      [attr.opacity]="coolingSteamOpacity()"
                    />
                  }
                  <!-- Mug body -->
                  <rect x="-46" y="-36" width="92" height="67" rx="4"
                    fill="#3a3a42" stroke="#2a2a30" stroke-width="2" />
                  <!-- Liquid (colored) -->
                  <rect x="-45" y="-35" width="90" height="65"
                    [attr.fill]="coolingLiquidColor()" clip-path="url(#coffeeClip)" />
                  <!-- Liquid surface ellipse -->
                  <ellipse cx="0" cy="-35" rx="45" ry="5"
                    [attr.fill]="coolingLiquidSurfaceColor()" />
                  <!-- Handle -->
                  <path d="M 46,-20 C 70,-20 70,15 46,15"
                    fill="none" stroke="#3a3a42" stroke-width="6" stroke-linecap="round" />
                  <!-- Temperature display -->
                  <g transform="translate(75, -30)">
                    <rect x="-2" y="-8" width="22" height="58" rx="10"
                      fill="var(--bg)" stroke="#3a3a42" stroke-width="1.5" />
                    <rect x="2" y="-4"
                      [attr.height]="coolingThermHeight()"
                      width="14"
                      [attr.y]="46 - coolingThermHeight()"
                      [attr.fill]="coolingLiquidColor()" rx="2" />
                    <circle cx="9" cy="48" r="9" [attr.fill]="coolingLiquidColor()"
                      stroke="#3a3a42" stroke-width="1.5" />
                  </g>
                  <!-- Ambient room temp label -->
                  <text x="-120" y="65" class="env-label">室溫 {{ coffeeTamb().toFixed(0) }}°C</text>
                }

                @case ('population') {
                  <!-- Field background -->
                  <rect x="-130" y="-55" width="260" height="110" rx="6"
                    fill="#6a8a5c" opacity="0.12" stroke="#6a8a5c" stroke-opacity="0.3" />
                  <!-- Rabbits -->
                  @for (r of visibleRabbits(); track r.i) {
                    <g [attr.transform]="'translate(' + r.x + ', ' + r.y + ')'"
                       [attr.opacity]="r.opacity">
                      <ellipse cx="0" cy="1" rx="3.5" ry="2.5" fill="#c8b896" />
                      <ellipse cx="-2" cy="-2" rx="1.2" ry="2" fill="#c8b896" />
                      <ellipse cx="2" cy="-2" rx="1.2" ry="2" fill="#c8b896" />
                      <circle cx="0" cy="-1" r="0.4" fill="#3a3a42" />
                    </g>
                  }
                  <!-- Population counter -->
                  <text x="-120" y="-65" class="pop-count">
                    N = {{ populationN() < 1000 ? populationN().toFixed(0) : populationN().toExponential(1) }}
                  </text>
                  @if (populationN() > RABBIT_CAP) {
                    <text x="-120" y="68" class="overflow-note">
                      實際已超過顯示上限（{{ RABBIT_CAP }}）
                    </text>
                  }
                }

                @case ('freefall') {
                  <!-- Sky -->
                  <rect x="-90" y="-85" width="180" height="175" rx="4"
                    fill="#a8c4d8" opacity="0.22" />
                  <!-- Ground -->
                  <rect x="-90" y="75" width="180" height="15" rx="2" fill="#6a5a48" opacity="0.4" />
                  <line x1="-90" y1="75" x2="90" y2="75" stroke="#6a5a48" stroke-width="1.5" />
                  <!-- Terminal velocity line -->
                  <line x1="-90" y1="60" x2="90" y2="60"
                    stroke="#c87b5e" stroke-width="1" stroke-dasharray="3 2" opacity="0.6" />
                  <text x="-88" y="57" class="hint-label">終端速度</text>
                  <!-- Apple -->
                  <g [attr.transform]="'translate(0, ' + applePosY() + ')'">
                    <circle r="9" fill="#c8472a" />
                    <ellipse cx="-2" cy="-3" rx="2" ry="3" fill="#e07d5a" opacity="0.5" />
                    <line x1="0" y1="-9" x2="2" y2="-14" stroke="#4a3828" stroke-width="1.5" />
                    <ellipse cx="4" cy="-13" rx="3" ry="2" fill="#6a8a5c" />
                  </g>
                  <!-- Velocity arrow -->
                  <g [attr.transform]="'translate(0, ' + applePosY() + ')'"
                     [attr.opacity]="freefallArrowOpacity()">
                    <line x1="15" y1="0"
                      [attr.x2]="15 + freefallArrowLen()" y2="0"
                      stroke="#5e7fb0" stroke-width="2"
                      marker-end="url(#vel-arrow)" />
                    <text [attr.x]="18 + freefallArrowLen()" y="4" class="hint-label">
                      v = {{ freefallV().toFixed(1) }}
                    </text>
                  </g>
                  <defs>
                    <marker id="vel-arrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                      <polygon points="0 0, 6 2.5, 0 5" fill="#5e7fb0" />
                    </marker>
                  </defs>
                }

                @case ('infection') {
                  <!-- Grid of people -->
                  @for (dot of infectionDots(); track dot.i) {
                    <circle
                      [attr.cx]="dot.x"
                      [attr.cy]="dot.y"
                      r="4.5"
                      [attr.fill]="dot.infected ? '#c8472a' : '#8a9a8c'"
                      stroke="white"
                      stroke-width="0.8"
                    />
                  }
                  <!-- Counter -->
                  <text x="-130" y="-65" class="pop-count">
                    I = {{ infectionI().toFixed(0) }} / {{ 100 }}
                  </text>
                }

                @case ('interest') {
                  <!-- Bars over time: show last N discrete years as bars -->
                  @for (bar of interestBars(); track bar.i) {
                    <rect
                      [attr.x]="bar.x"
                      [attr.y]="bar.y"
                      width="14"
                      [attr.height]="bar.h"
                      fill="#5ca878"
                      [attr.opacity]="bar.opacity"
                      rx="2"
                    />
                  }
                  <!-- Ground line -->
                  <line x1="-130" y1="60" x2="130" y2="60" stroke="var(--border-strong)" stroke-width="1" />
                  <!-- Counter -->
                  <text x="-125" y="-65" class="pop-count">
                    M = \${{ interestM() < 100000 ? interestM().toFixed(0) : interestM().toExponential(1) }}
                  </text>
                }
              }
            </svg>
          </div>

          <!-- Chart -->
          <div class="chart-wrap">
            <div class="scene-title">{{ selected().variable }} 隨時間</div>
            <svg viewBox="-10 -100 260 140" class="chart-svg">
              <!-- Axes -->
              <line x1="0" y1="30" x2="250" y2="30" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="0" y1="-95" x2="0" y2="30" stroke="var(--border-strong)" stroke-width="1" />
              <text x="254" y="34" class="axis-lab">t</text>
              <text x="-4" y="-98" class="axis-lab">{{ chartVarName() }}</text>

              <!-- Full solution curve -->
              <path [attr.d]="chartPath()" fill="none"
                [attr.stroke]="selected().color" stroke-width="2.2" />

              <!-- Current time marker -->
              <line
                [attr.x1]="t() * chartTScale()"
                y1="30"
                [attr.x2]="t() * chartTScale()"
                y2="-90"
                stroke="var(--phen-color)"
                stroke-width="1"
                stroke-dasharray="3 2"
                opacity="0.5"
              />
              <circle
                [attr.cx]="t() * chartTScale()"
                [attr.cy]="chartCurrentY()"
                r="5"
                [attr.fill]="selected().color"
                stroke="white"
                stroke-width="2"
              />
              <!-- t tick marks -->
              @for (tick of chartTicks(); track tick.v) {
                <text
                  [attr.x]="tick.x"
                  y="44"
                  class="tick-lab"
                >{{ tick.v }}</text>
                <line
                  [attr.x1]="tick.x"
                  y1="28"
                  [attr.x2]="tick.x"
                  y2="32"
                  stroke="var(--text-muted)"
                  stroke-width="0.8"
                />
              }
            </svg>
            <div class="current-val">
              目前：{{ selected().variable }} ≈
              <strong>{{ currentValueLabel() }}</strong>
              &nbsp;(t = {{ t().toFixed(1) }})
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <button class="play-btn" (click)="togglePlay()">
            {{ playing() ? '⏸ 暫停' : '▶ 播放' }}
          </button>
          <button class="reset-btn" (click)="reset()">↻ 重置</button>
          <div class="t-slider">
            <span class="ctrl-lab">t</span>
            <input type="range" min="0" [max]="selected().tMax" step="0.05"
              [value]="t()" (input)="onTSlider($event)" />
            <span class="ctrl-val">{{ t().toFixed(1) }}</span>
          </div>
          <div class="param-slider">
            <span class="ctrl-lab">{{ selected().paramLabel }}</span>
            <input type="range"
              [min]="selected().paramMin"
              [max]="selected().paramMax"
              [step]="selected().paramStep"
              [value]="paramValue()"
              (input)="onParamSlider($event)" />
            <span class="ctrl-val">{{ selected().paramFormat(paramValue()) }}</span>
          </div>
        </div>
      </div>

      <!-- Equation with live values -->
      <div class="eq-box" [style.--phen-color]="selected().color">
        <div class="eq-head">
          <span class="eq-tag">正在演示的方程</span>
        </div>
        <div class="equation">{{ selected().equation }}</div>
        <div class="eq-translate">
          <div class="row">
            <span class="k">變數</span>
            <span class="v"><code>{{ selected().variable }}</code> — {{ selected().variableDesc }}</span>
          </div>
          <div class="row">
            <span class="k">因果</span>
            <span class="v">{{ selected().causality }}</span>
          </div>
          <div class="row">
            <span class="k">目前 dy/dt</span>
            <span class="v live-rate"><strong>{{ currentRateLabel() }}</strong></span>
          </div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        五個現象天差地遠，方程卻<strong>驚人地相似</strong>：兔子跟複利根本是同一條方程
        <code>dN/dt = r N</code>。咖啡冷卻跟（之後會看到的）RC 電路也是。
      </p>
      <p>
        這就是微分方程的威力：<strong>一條方程可以描述無數看似無關的現象</strong>。
        我們學的不是單一問題的技巧，而是一套能跨領域搬動的工具。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        微分方程的核心是「變化率 = 某個跟當前狀態有關的東西」。寫方程 = 把因果翻譯成
        <code>dy/dt = f(y, t)</code>。下一節我們要看，這樣一條方程可以被<strong>畫出整張地圖</strong>——
        而不只是單一曲線。
      </p>
    </app-prose-block>
  `,
  styles: `
    .mantra {
      text-align: center;
      font-size: 17px;
      font-style: italic;
      padding: 14px 20px;
      border-left: 3px solid var(--accent);
      background: var(--accent-10);
      border-radius: 0 8px 8px 0;
      margin: 16px 0;
      color: var(--text);
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

    .phen-picker {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }

    .phen-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 6px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      cursor: pointer;
      transition: all 0.15s;
      font: inherit;
      color: var(--text);
    }

    .phen-btn:hover { border-color: var(--phen-color, var(--accent)); }
    .phen-btn.active {
      border-color: var(--phen-color, var(--accent));
      background: color-mix(in srgb, var(--phen-color) 10%, var(--bg));
    }

    .phen-emoji { font-size: 22px; }
    .phen-name { font-size: 12px; font-weight: 600; }

    .story {
      margin: 0 0 14px;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-secondary);
      padding: 10px 14px;
      background: var(--bg);
      border-left: 3px solid var(--phen-color, var(--accent));
      border-radius: 0 6px 6px 0;
    }

    .sim-panel {
      padding: 14px;
      border: 1.5px solid var(--phen-color, var(--accent));
      border-radius: 12px;
      background: color-mix(in srgb, var(--phen-color) 4%, var(--bg));
      margin-bottom: 14px;
    }

    .sim-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    @media (max-width: 620px) {
      .sim-grid { grid-template-columns: 1fr; }
    }

    .scene-wrap, .chart-wrap {
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
    }

    .scene-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 4px;
      text-align: center;
    }

    .scene-svg, .chart-svg {
      width: 100%;
      display: block;
    }

    .env-label, .hint-label, .pop-count, .overflow-note {
      font-family: 'JetBrains Mono', monospace;
      fill: var(--text-muted);
    }

    .env-label { font-size: 11px; }
    .hint-label { font-size: 10px; }
    .pop-count {
      font-size: 13px;
      font-weight: 700;
      fill: var(--text);
    }
    .overflow-note { font-size: 10px; fill: #c87b5e; }

    .axis-lab {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }

    .tick-lab {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }

    .current-val {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px dashed var(--border);
    }

    .current-val strong {
      color: var(--phen-color, var(--accent));
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      padding: 10px;
      border-radius: 8px;
      background: var(--bg);
      border: 1px solid var(--border);
    }

    .play-btn, .reset-btn {
      font: inherit;
      font-size: 13px;
      padding: 7px 14px;
      border: 1.5px solid var(--phen-color, var(--accent));
      background: var(--phen-color, var(--accent));
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn {
      background: transparent;
      color: var(--phen-color, var(--accent));
    }

    .play-btn:hover, .reset-btn:hover { opacity: 0.85; }

    .t-slider, .param-slider {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 180px;
    }

    .ctrl-lab {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .t-slider input, .param-slider input {
      flex: 1;
      accent-color: var(--phen-color, var(--accent));
    }

    .ctrl-val {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 60px;
      text-align: right;
    }

    .eq-box {
      padding: 14px 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .eq-head { margin-bottom: 6px; }
    .eq-tag {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .equation {
      text-align: center;
      font-size: 22px;
      font-weight: 600;
      color: var(--phen-color, var(--accent));
      padding: 12px;
      font-family: 'JetBrains Mono', monospace;
    }

    .eq-translate {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
    }

    .row {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 10px;
      align-items: baseline;
      font-size: 13px;
      padding: 4px 0;
    }

    .k {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .v { color: var(--text-secondary); }

    .v code {
      background: color-mix(in srgb, var(--phen-color) 12%, var(--bg));
      color: var(--phen-color, var(--accent));
    }

    .live-rate strong {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: var(--phen-color, var(--accent));
    }
  `,
})
export class DeCh1PhenomenonComponent implements OnInit, OnDestroy {
  readonly phenomena = PHENOMENA;
  readonly selected = signal<Phenomenon>(PHENOMENA[0]);
  readonly t = signal(0);
  readonly playing = signal(false);

  readonly coffeeTamb = signal(25);
  readonly rabbitR = signal(0.35);
  readonly fallKM = signal(0.5);
  readonly infectionBeta = signal(0.05);
  readonly interestR = signal(0.08);

  readonly RABBIT_CAP = 60;

  private rafId: number | null = null;
  private lastFrame = 0;

  constructor() {
    // Auto-play on phenomenon switch feels natural; user can pause
    effect(() => {
      // Reset when switching
      const _ = this.selected();
      // access selected() to track
    });
  }

  ngOnInit(): void {
    const loop = (now: number) => {
      if (this.playing()) {
        const dt = this.lastFrame === 0 ? 0.016 : Math.min(0.05, (now - this.lastFrame) / 1000);
        const newT = this.t() + dt * 1.2; // play speed multiplier
        if (newT >= this.selected().tMax) {
          this.t.set(this.selected().tMax);
          this.playing.set(false);
        } else {
          this.t.set(newT);
        }
      }
      this.lastFrame = now;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  switchPhenomenon(p: Phenomenon): void {
    this.selected.set(p);
    this.t.set(0);
    this.playing.set(false);
  }

  togglePlay(): void {
    // If at end, reset before playing
    if (this.t() >= this.selected().tMax - 0.01) this.t.set(0);
    this.playing.set(!this.playing());
  }

  reset(): void {
    this.t.set(0);
    this.playing.set(false);
  }

  onTSlider(event: Event): void {
    const v = +(event.target as HTMLInputElement).value;
    this.t.set(v);
    this.playing.set(false);
  }

  onParamSlider(event: Event): void {
    const v = +(event.target as HTMLInputElement).value;
    const id = this.selected().id;
    switch (id) {
      case 'cooling': this.coffeeTamb.set(v); break;
      case 'population': this.rabbitR.set(v); break;
      case 'freefall': this.fallKM.set(v); break;
      case 'infection': this.infectionBeta.set(v); break;
      case 'interest': this.interestR.set(v); break;
    }
  }

  readonly paramValue = computed(() => {
    switch (this.selected().id) {
      case 'cooling': return this.coffeeTamb();
      case 'population': return this.rabbitR();
      case 'freefall': return this.fallKM();
      case 'infection': return this.infectionBeta();
      case 'interest': return this.interestR();
    }
  });

  readonly currentValue = computed(() => {
    const t = this.t();
    switch (this.selected().id) {
      case 'cooling': return coolingValue(t, this.coffeeTamb());
      case 'population': return populationValue(t, this.rabbitR());
      case 'freefall': return freefallValue(t, this.fallKM());
      case 'infection': return infectionValue(t, this.infectionBeta());
      case 'interest': return interestValue(t, this.interestR());
    }
  });

  readonly currentValueLabel = computed(() => {
    const v = this.currentValue();
    switch (this.selected().id) {
      case 'cooling': return `${v.toFixed(1)} °C`;
      case 'population':
        return v < 1000 ? v.toFixed(0) : v.toExponential(1);
      case 'freefall': return `${v.toFixed(2)} m/s`;
      case 'infection': return `${v.toFixed(0)} 人`;
      case 'interest': return `\$${v < 1e5 ? v.toFixed(0) : v.toExponential(1)}`;
    }
  });

  readonly currentRateLabel = computed(() => {
    const t = this.t();
    const y = this.currentValue();
    let rate = 0;
    let unit = '';
    switch (this.selected().id) {
      case 'cooling': rate = -0.12 * (y - this.coffeeTamb()); unit = '°C/s'; break;
      case 'population': rate = this.rabbitR() * y; unit = '/s'; break;
      case 'freefall': rate = 9.8 - this.fallKM() * y; unit = 'm/s²'; break;
      case 'infection': rate = this.infectionBeta() * y * (100 - y); unit = '人/s'; break;
      case 'interest': rate = this.interestR() * y; unit = '\$/s'; break;
    }
    return `${rate.toFixed(2)} ${unit}`;
  });

  // ======== Chart helpers ========
  readonly chartTScale = computed(() => 240 / this.selected().tMax);

  readonly chartVarName = computed(() => this.selected().variable.split('(')[0]);

  readonly chartTicks = computed(() => {
    const tMax = this.selected().tMax;
    const scale = this.chartTScale();
    const step = tMax <= 12 ? 2 : tMax <= 20 ? 4 : 6;
    const ticks: { v: number; x: number }[] = [];
    for (let tv = 0; tv <= tMax; tv += step) {
      ticks.push({ v: tv, x: tv * scale });
    }
    return ticks;
  });

  // Normalize chart Y to fit in 0..-90 (pixel coords, up is negative)
  private chartYPixel(v: number): number {
    const id = this.selected().id;
    let y = 0;
    switch (id) {
      case 'cooling': {
        const T0 = 90;
        y = (v - 0) / (T0 - 0); // T in 0..90, map to full height
        break;
      }
      case 'population': {
        const maxN = populationValue(this.selected().tMax, this.rabbitR());
        y = maxN > 0 ? Math.min(1, v / maxN) : 0;
        break;
      }
      case 'freefall': {
        const maxV = 9.8 / this.fallKM();
        y = Math.min(1, v / (maxV * 1.02));
        break;
      }
      case 'infection': {
        y = v / 100;
        break;
      }
      case 'interest': {
        const maxM = interestValue(this.selected().tMax, this.interestR());
        y = maxM > 0 ? Math.min(1, v / maxM) : 0;
        break;
      }
    }
    return 30 - y * 118;
  }

  readonly chartPath = computed(() => {
    const id = this.selected().id;
    const tMax = this.selected().tMax;
    const scale = this.chartTScale();
    const n = 120;
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const tv = (i / n) * tMax;
      let y = 0;
      switch (id) {
        case 'cooling': y = coolingValue(tv, this.coffeeTamb()); break;
        case 'population': y = populationValue(tv, this.rabbitR()); break;
        case 'freefall': y = freefallValue(tv, this.fallKM()); break;
        case 'infection': y = infectionValue(tv, this.infectionBeta()); break;
        case 'interest': y = interestValue(tv, this.interestR()); break;
      }
      pts.push(`${i === 0 ? 'M' : 'L'} ${(tv * scale).toFixed(1)} ${this.chartYPixel(y).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  readonly chartCurrentY = computed(() => this.chartYPixel(this.currentValue()));

  // ======== Scene-specific helpers ========

  // Coffee
  readonly coolingLiquidColor = computed(() => {
    const T = this.currentValue();
    const T0 = 90;
    const Ta = this.coffeeTamb();
    const pct = Math.max(0, Math.min(1, (T - Ta) / (T0 - Ta)));
    // Hot: #e8722c, Cool: #8aa0b4
    const r = Math.round(138 + (232 - 138) * pct);
    const g = Math.round(160 + (114 - 160) * pct);
    const b = Math.round(180 + (44 - 180) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  });

  readonly coolingLiquidSurfaceColor = computed(() => {
    const T = this.currentValue();
    const T0 = 90;
    const Ta = this.coffeeTamb();
    const pct = Math.max(0, Math.min(1, (T - Ta) / (T0 - Ta)));
    const r = Math.round(100 + (180 - 100) * pct);
    const g = Math.round(120 + (80 - 120) * pct);
    const b = Math.round(140 + (40 - 140) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  });

  readonly coolingBgColor = computed(() => {
    // bluish tint always
    return '#5e7fb0';
  });

  readonly coolingSteamOpacity = computed(() => {
    const T = this.currentValue();
    const hotness = Math.max(0, (T - 50) / 40);
    return hotness;
  });

  coolingSteamPath(idx: number): string {
    const t = this.t();
    const phase = t * 1.5 + idx * 1.8;
    const sx = -25 + idx * 25;
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const y = -40 - i * 8;
      const x = sx + 5 * Math.sin(phase + i * 0.7);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y}`);
    }
    return pts.join(' ');
  }

  readonly coolingThermHeight = computed(() => {
    const T = this.currentValue();
    const frac = Math.max(0, Math.min(1, (T - 0) / 100));
    return frac * 50;
  });

  // Rabbits
  readonly populationN = computed(() => this.currentValue());

  readonly visibleRabbits = computed(() => {
    const N = this.currentValue();
    const visible = Math.min(this.RABBIT_CAP, Math.floor(N));
    const out: { i: number; x: number; y: number; opacity: number }[] = [];
    for (let i = 0; i < visible; i++) {
      const [x, y] = RABBIT_POSITIONS[i];
      // Fade in last rabbit smoothly
      const frac = N - Math.floor(N);
      const opacity = i === visible - 1 && visible < this.RABBIT_CAP ? 0.3 + 0.7 * frac : 1;
      out.push({ i, x, y, opacity });
    }
    return out;
  });

  // Free fall
  readonly freefallV = computed(() => this.currentValue());

  readonly applePosY = computed(() => {
    // Apple starts at y=-70 and "falls" until it reaches ground area.
    // But we want it to oscillate between top/bottom for demo, so show cycling position:
    // Better: apple travels a fixed distance, loops.
    const t = this.t();
    const cycleDist = 150;
    const traveled = this.fallTravelIntegral(t) % cycleDist;
    return -70 + traveled;
  });

  private fallTravelIntegral(t: number): number {
    // integral of v(t) from 0 to t: v*t + (v*/k_m)(e^{-k_m t} - 1)
    const km = this.fallKM();
    const vStar = 9.8 / km;
    // scale down for visual
    const s = 3.5; // visual scale
    return s * (vStar * t + (vStar / km) * (Math.exp(-km * t) - 1));
  }

  readonly freefallArrowLen = computed(() => {
    const v = this.currentValue();
    const maxV = 9.8 / this.fallKM();
    return Math.min(60, (v / maxV) * 50);
  });

  readonly freefallArrowOpacity = computed(() => {
    return this.currentValue() > 0.1 ? 1 : 0;
  });

  // Infection: deterministic reveal order
  private readonly infectionOrder = Array.from({ length: 100 }, (_, i) => i)
    .sort((a, b) => {
      // seed-based shuffle
      const ra = ((a * 2654435761) ^ 0x9e3779b9) >>> 0;
      const rb = ((b * 2654435761) ^ 0x9e3779b9) >>> 0;
      return ra - rb;
    });

  readonly infectionI = computed(() => this.currentValue());

  readonly infectionDots = computed(() => {
    const I = Math.floor(this.currentValue());
    const infectedSet = new Set(this.infectionOrder.slice(0, I));
    const out: { i: number; x: number; y: number; infected: boolean }[] = [];
    for (let i = 0; i < 100; i++) {
      const row = Math.floor(i / 10);
      const col = i % 10;
      const x = -90 + col * 20;
      const y = -45 + row * 14;
      out.push({ i, x, y, infected: infectedSet.has(i) });
    }
    return out;
  });

  // Interest: growing bars (years discretized)
  readonly interestM = computed(() => this.currentValue());

  readonly interestBars = computed(() => {
    const tMax = this.selected().tMax;
    const n = 15;
    const r = this.interestR();
    const currentT = this.t();
    const maxM = interestValue(tMax, r);
    const out: { i: number; x: number; y: number; h: number; opacity: number }[] = [];
    for (let i = 0; i < n; i++) {
      const yearT = (i / (n - 1)) * tMax;
      if (yearT > currentT + 0.5) continue;
      const M = interestValue(Math.min(yearT, currentT), r);
      const h = (M / maxM) * 110;
      const x = -130 + i * 17;
      const opacity = Math.min(1, Math.max(0.3, 1 - (currentT - yearT) * 0.02));
      out.push({ i, x, y: 60 - h, h, opacity });
    }
    return out;
  });
}
