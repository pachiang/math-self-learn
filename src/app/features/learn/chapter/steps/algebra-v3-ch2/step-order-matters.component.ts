import { Component, computed, signal } from '@angular/core';

type RobotAction = 'F' | 'B' | 'R' | 'L';
type Heading = 0 | 1 | 2 | 3;

interface Pose {
  x: number;
  y: number;
  heading: Heading;
}

const ACTION_LABELS: Record<RobotAction, string> = {
  F: 'F：前進一格',
  B: 'B：後退一格',
  R: 'R：右轉 90°',
  L: 'L：左轉 90°',
};
const DIRECTIONS = [
  { x: 0, y: 1, name: '北' },
  { x: 1, y: 0, name: '東' },
  { x: 0, y: -1, name: '南' },
  { x: -1, y: 0, name: '西' },
] as const;

@Component({
  selector: 'app-algebra-v3-order-matters',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch2-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 2.2</p>
        <h2>同樣兩個 actions，交換順序可能換掉終點</h2>
        <p class="lede">
          composition 記錄的不只是「用了哪些動作」，還記錄「先後」。把機器人的 position 與 heading 一起當作 state，順序差異就無法藏在模糊語句裡。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先在腦中走一次</p>
        <h3>面朝北時，「先前進 F、再右轉 R」與「先右轉 R、再前進 F」會得到相同 state 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不同</button>
          <button type="button" (click)="prediction.set(true)">相同</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()" aria-live="polite">
            {{ prediction() ? '兩邊最後都朝東，但左邊停在 (0,1)，右邊停在 (1,0)。heading 相同不等於 state 相同。' : '對。轉彎改變了「前進」接下來作用的方向，所以終點不同。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Order comparator</p>
            <h3>固定起點，只交換 A、B 的先後</h3>
          </div>
          <p>兩張 board 使用完全相同的 actions。左邊執行 A→B，右邊執行 B→A；比較完整 pose，而不是只看位置或朝向其中之一。</p>
        </div>

        <div class="order-controls">
          <label>
            ACTION A
            <select [value]="first()" (change)="setFirst($event)">
              @for (action of actions; track action) { <option [value]="action" [selected]="action === first()">{{ actionLabels[action] }}</option> }
            </select>
          </label>
          <span class="versus">A → B versus B → A</span>
          <label>
            ACTION B
            <select [value]="second()" (change)="setSecond($event)">
              @for (action of actions; track action) { <option [value]="action" [selected]="action === second()">{{ actionLabels[action] }}</option> }
            </select>
          </label>
          <button type="button" (click)="usePreset('FR')">例：前進／右轉</button>
          <button type="button" (click)="usePreset('RL')">反例：右轉／左轉</button>
        </div>

        <div class="stage robot-boards">
          <section class="robot-board" aria-label="先執行 action A 再執行 action B">
            <h4>A → B：{{ first() }} → {{ second() }}</h4>
            <svg viewBox="0 0 320 300" role="img" [attr.aria-label]="poseText(leftFinal())">
              @for (line of gridLines; track line) {
                <line class="grid-line" [attr.x1]="toX(line)" y1="25" [attr.x2]="toX(line)" y2="275" />
                <line class="grid-line" x1="35" [attr.y1]="toY(line)" x2="285" [attr.y2]="toY(line)" />
              }
              <polyline class="robot-path" [attr.points]="pathPoints(leftTrace())" />
              <circle class="robot-start" [attr.cx]="toX(0)" [attr.cy]="toY(0)" r="8" />
              @for (pose of leftTrace(); track $index) {
                @if ($index > 0) {
                  <text class="step-badge" [attr.x]="toX(pose.x) + 10" [attr.y]="toY(pose.y) - 10">{{ $index }}</text>
                }
              }
              <circle class="robot-final" [attr.cx]="toX(leftFinal().x)" [attr.cy]="toY(leftFinal().y)" r="13" />
              <line class="heading-arrow" [attr.x1]="toX(leftFinal().x)" [attr.y1]="toY(leftFinal().y)" [attr.x2]="headingX(leftFinal())" [attr.y2]="headingY(leftFinal())" />
            </svg>
            <p class="pose">{{ poseText(leftFinal()) }}</p>
          </section>

          <section class="robot-board" aria-label="先執行 action B 再執行 action A">
            <h4>B → A：{{ second() }} → {{ first() }}</h4>
            <svg viewBox="0 0 320 300" role="img" [attr.aria-label]="poseText(rightFinal())">
              @for (line of gridLines; track line) {
                <line class="grid-line" [attr.x1]="toX(line)" y1="25" [attr.x2]="toX(line)" y2="275" />
                <line class="grid-line" x1="35" [attr.y1]="toY(line)" x2="285" [attr.y2]="toY(line)" />
              }
              <polyline class="robot-path" [attr.points]="pathPoints(rightTrace())" />
              <circle class="robot-start" [attr.cx]="toX(0)" [attr.cy]="toY(0)" r="8" />
              @for (pose of rightTrace(); track $index) {
                @if ($index > 0) {
                  <text class="step-badge" [attr.x]="toX(pose.x) + 10" [attr.y]="toY(pose.y) - 10">{{ $index }}</text>
                }
              }
              <circle class="robot-final" [attr.cx]="toX(rightFinal().x)" [attr.cy]="toY(rightFinal().y)" r="13" />
              <line class="heading-arrow" [attr.x1]="toX(rightFinal().x)" [attr.y1]="toY(rightFinal().y)" [attr.x2]="headingX(rightFinal())" [attr.y2]="headingY(rightFinal())" />
            </svg>
            <p class="pose">{{ poseText(rightFinal()) }}</p>
          </section>
        </div>

        <div class="comparison-badge" aria-live="polite">
          {{ sameOutput() ? '✓ SAME — 此起點結果相同；一個例子還不能證明 commute' : '× DIFFERENT — 交換順序改變了完整 state' }}
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>A then B</span><i>≠?</i><span>B then A</span></div>
        <p>
          <strong>「有同樣的 ingredients」不代表「有同樣的 composite action」。</strong>
          後一個 action 作用在前一個 action 已改變的 state 上。若兩種順序對所有 states 都相同，才說它們 commute；這是一個額外性質，不是 composition 自動保證的。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">邊界檢查</p>
        <h3>找到一個起點讓 A→B 與 B→A 結果不同，足以證明這兩個 actions 不 commute 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">足夠</button>
          <button type="button" (click)="transfer.set(false)">不夠</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{ transfer() ? '對。一個 counterexample 就能推翻「對所有 states 都相同」。' : 'commute 要求每個 state 都相同；因此只要一個 state 不同，就已經失敗。' }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>正式定義：commute 與 abelian</summary>
          <div>若兩個 elements 滿足 ab = ba，就說它們 commute。若一個 group 中每一對 elements 都 commute，這個 group 稱為 abelian group。第 2 章只辨認順序效應；group 的完整條件會在後面建立。</div>
        </details>
        <details>
          <summary>為什麼 state 必須包含 heading？</summary>
          <div>action 要能由目前 state 唯一決定下一個 state。若只記 (x,y)，「前進」往哪裡走仍不確定；加入 heading 後，F 才成為真正的 function。</div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3OrderMattersComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly first = signal<RobotAction>('F');
  readonly second = signal<RobotAction>('R');
  readonly actions: readonly RobotAction[] = ['F', 'B', 'R', 'L'];
  readonly actionLabels = ACTION_LABELS;
  readonly gridLines = [-2, -1, 0, 1, 2];
  readonly leftTrace = computed(() => this.run([this.first(), this.second()]));
  readonly rightTrace = computed(() => this.run([this.second(), this.first()]));
  readonly leftFinal = computed<Pose>(() => this.leftTrace().at(-1) ?? { x: 0, y: 0, heading: 0 });
  readonly rightFinal = computed<Pose>(() => this.rightTrace().at(-1) ?? { x: 0, y: 0, heading: 0 });
  readonly sameOutput = computed(() => {
    const left = this.leftFinal();
    const right = this.rightFinal();
    return left.x === right.x && left.y === right.y && left.heading === right.heading;
  });

  setFirst(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) this.first.set(select.value as RobotAction);
  }

  setSecond(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) this.second.set(select.value as RobotAction);
  }

  usePreset(preset: 'FR' | 'RL'): void {
    this.first.set(preset[0] as RobotAction);
    this.second.set(preset[1] as RobotAction);
  }

  run(actions: readonly RobotAction[]): Pose[] {
    const trace: Pose[] = [{ x: 0, y: 0, heading: 0 }];
    for (const action of actions) trace.push(this.apply(trace.at(-1)!, action));
    return trace;
  }

  apply(pose: Pose, action: RobotAction): Pose {
    if (action === 'R') return { ...pose, heading: ((pose.heading + 1) % 4) as Heading };
    if (action === 'L') return { ...pose, heading: ((pose.heading + 3) % 4) as Heading };
    const direction = DIRECTIONS[pose.heading];
    const sign = action === 'F' ? 1 : -1;
    return { x: pose.x + sign * direction.x, y: pose.y + sign * direction.y, heading: pose.heading };
  }

  toX(value: number): number { return 160 + value * 60; }
  toY(value: number): number { return 150 - value * 60; }
  pathPoints(trace: readonly Pose[]): string { return trace.map((pose) => `${this.toX(pose.x)},${this.toY(pose.y)}`).join(' '); }
  headingX(pose: Pose): number { return this.toX(pose.x) + DIRECTIONS[pose.heading].x * 18; }
  headingY(pose: Pose): number { return this.toY(pose.y) - DIRECTIONS[pose.heading].y * 18; }
  poseText(pose: Pose): string { return `位置 (${pose.x}, ${pose.y})，面朝${DIRECTIONS[pose.heading].name}`; }
}
