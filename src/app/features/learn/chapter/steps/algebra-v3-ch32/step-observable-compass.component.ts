import { Component, computed, signal } from '@angular/core';
import { DIAGNOSTIC_SCENARIOS, ROUTE_LABELS, type ObservableRoute } from './diagnostic-model';

@Component({
  selector: 'app-algebra-v3-observable-compass',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch32-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 32.1</p>
        <h2>陌生問題先別猜 theorem；先問：我現在缺哪一種可見資訊？</h2>
        <p class="lede">
          同一句「研究這個群」可能需要完全不同的第一步。把題目拆成 known 與 goal，再讓 goal 指向一個
          observable，工具才不會變成背誦式抽籤。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>只知道 |G|=21，第一步應該先畫出所有 elements 的 permutation 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">
            不一定；先榨出 order constraints
          </button>
          <button type="button" (click)="prediction.set(true)">
            是；所有群都先 representation
          </button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'Representation 永遠存在，但題目只給 order 時，Cauchy／Sylow constraints 更直接。'
                : '對。第一步不是最強的工具，而是最貼近目前可用資訊的 lens。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Question-to-observable compass</p>
            <h3>換一張 problem card；把 goal token 插進最直接的 observable port</h3>
          </div>
          <p>被選的 route 有實線與 DIRECT FIRST MOVE；其他 routes 仍可能稍後加入 proof。</p>
        </div>
        <div class="scenario-tabs" role="group" aria-label="選擇陌生群問題">
          @for (scenario of scenarios; track scenario.id; let i = $index) {
            <button
              type="button"
              [attr.aria-pressed]="scenarioIndex() === i"
              (click)="selectScenario(i)"
            >
              問題 {{ i + 1 }}
            </button>
          }
        </div>
        <div class="stage compass-stage">
          <section class="problem-card">
            <span>KNOWN</span><strong>{{ active().known }}</strong> <i>GOAL TOKEN</i
            ><b>{{ active().goal }}</b
            ><small>cue · {{ active().cue }}</small>
          </section>
          <div class="goal-beam" aria-hidden="true">goal → observable</div>
          <section class="observable-ports" role="group" aria-label="選擇第一個觀察方向">
            @for (route of routes; track route) {
              <button
                type="button"
                [attr.aria-pressed]="selectedRoute() === route"
                [class.direct]="revealed() && active().route === route"
                [class.indirect]="revealed() && active().route !== route"
                (click)="choose(route)"
              >
                <span>{{ routeLabels[route] }}</span>
                <b>{{ revealed() ? routeStamp(route) : 'TRY THIS LENS' }}</b>
              </button>
            }
          </section>
          <section class="observable-monitor" aria-live="polite">
            <span>FIRST OBSERVABLE</span>
            <strong>{{ monitorTitle() }}</strong>
            <p>{{ monitorDetail() }}</p>
            @if (revealed()) {
              <small>{{ active().chapter }}</small>
            }
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>problem wording</span><i>→</i><span>desired observable</span><i>→</i
          ><span>first lens</span>
        </div>
        <p>
          <strong>先診斷資訊缺口，再選工具。</strong>
          theorem 的名字不是入口；你希望哪個 quantity 或 relation 變得可見，才是入口。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>「數 necklaces up to rotation」最先需要的是哪種 observable？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('fixed')">
            fixed configurations 與 orbits
          </button>
          <button type="button" (click)="transfer.set('kernel')">先求某個 map 的 kernel</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 'fixed'">
            {{
              transfer() === 'fixed'
                ? '對。選 configuration world，讓 rotation action 暴露 fixed-state counts。'
                : '題目尚未給一個自然 map；真正缺的是 symmetry 如何作用在 configurations。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>這張 compass 是不是一套機械演算法？</summary>
          <div>
            不是。數學問題常有多條有效 routes；compass 只選擇最直接暴露目前 goal
            的第一步。後續證明仍可能把 representation、map、action 與 counting 接成一條 chain。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3ObservableCompassComponent {
  readonly scenarios = DIAGNOSTIC_SCENARIOS;
  readonly routes = ['representation', 'compression', 'action', 'order'] as const;
  readonly routeLabels = ROUTE_LABELS;
  readonly scenarioIndex = signal(0);
  readonly selectedRoute = signal<ObservableRoute | null>(null);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<'fixed' | 'kernel' | null>(null);
  readonly active = computed(() => this.scenarios[this.scenarioIndex()]);
  readonly revealed = computed(() => this.selectedRoute() !== null);

  selectScenario(index: number): void {
    this.scenarioIndex.set(index);
    this.selectedRoute.set(null);
  }

  choose(route: ObservableRoute): void {
    this.selectedRoute.set(route);
  }

  routeStamp(route: ObservableRoute): string {
    return route === this.active().route ? 'DIRECT FIRST MOVE' : 'POSSIBLE LATER';
  }

  monitorTitle(): string {
    if (!this.revealed()) return '選一個 port，觀察問題會被改寫成什麼';
    return this.selectedRoute() === this.active().route
      ? this.active().observable
      : '這個 lens 尚未直接暴露 goal';
  }

  monitorDetail(): string {
    if (!this.revealed()) return '這一幕只決定第一個 observable，不在同頁展開整套 theorem。';
    return this.selectedRoute() === this.active().route
      ? `GOOD FIRST QUESTION · ${this.active().cue}`
      : `不是錯誤工具，但你仍然看不見「${this.active().cue}」。`;
  }
}
