import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

type Technique = 'separable' | 'linear' | 'exact' | 'bernoulli' | 'homogeneous' | 'numerical';

interface QuizQuestion {
  id: string;
  eq: string;
  correct: Technique;
  explanation: string;
}

const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    eq: "dy/dt = t · y²",
    correct: 'separable',
    explanation:
      '右側是 t · y²，可拆成 g(t) = t 跟 h(y) = y²。分家 → dy/y² = t dt → −1/y = t²/2 + C。',
  },
  {
    id: 'q2',
    eq: "dy/dt + 3y = e^{−t}",
    correct: 'linear',
    explanation:
      '標準線性一階形式 y′ + p(t)y = g(t)，其中 p = 3、g = e^{−t}。μ(t) = e^{3t} → 乘上去 → d/dt(e^{3t} y) = e^{2t} → 積分。',
  },
  {
    id: 'q3',
    eq: "(3t² + y) dt + (t + 2y) dy = 0",
    correct: 'exact',
    explanation:
      '∂M/∂y = 1，∂N/∂t = 1，相等 → 精確。找 F：F_t = 3t² + y → F = t³ + ty + h(y)，F_y = t + h′(y) = t + 2y → h(y) = y²。所以 F = t³ + ty + y² = C。',
  },
  {
    id: 'q4',
    eq: "dy/dt − 2y/t = t·y²",
    correct: 'bernoulli',
    explanation:
      '右邊有 y²，Bernoulli (n = 2)。代換 u = y^{−1}：du/dt + 2u/t = −t，變成線性。',
  },
  {
    id: 'q5',
    eq: "dy/dt = (3y − t) / (t + y)",
    correct: 'homogeneous',
    explanation:
      '分子分母皆一次齊次，右側可寫成 F(y/t)。代換 v = y/t → 變可分離。',
  },
  {
    id: 'q6',
    eq: "dy/dt = sin(y² + t²)",
    correct: 'numerical',
    explanation:
      'sin(y² + t²) 既不是 g(t)h(y)、也不線性、寫成微分形式也不精確、沒有 y^n 或 y/t 結構 → 沒封閉解，靠數值。',
  },
];

const TECHNIQUE_LABELS: Record<Technique, { short: string; full: string; section: string; color: string }> = {
  separable: { short: '可分離', full: '可分離方程', section: '§2.2', color: '#5ca878' },
  linear: { short: '線性', full: '線性 + 積分因子', section: '§2.3', color: '#5a8aa8' },
  exact: { short: '精確', full: '精確方程', section: '§2.4', color: '#8b6aa8' },
  bernoulli: { short: 'Bernoulli', full: 'Bernoulli 代換', section: '§2.5', color: '#a89a5c' },
  homogeneous: { short: '齊次', full: '齊次代換 v = y/t', section: '§2.5', color: '#c89a5e' },
  numerical: { short: '數值', full: '數值方法', section: 'Ch4', color: '#c87b5e' },
};

@Component({
  selector: 'app-de-ch2-diagnostic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="診斷工具 + 綜合" subtitle="§2.6">
      <p>
        這一章我們學了四招主力 + 兩個代換。現在把它們擺在一起比較，然後測一下你分辨方程的能力。
      </p>
    </app-prose-block>

    <!-- Summary table -->
    <app-challenge-card prompt="四招總覽——一張表看完整章">
      <div class="summary-grid">
        <div class="sum-card" style="--col: #5ca878">
          <div class="sum-sec">§2.2</div>
          <div class="sum-title">可分離</div>
          <div class="sum-shape">dy/dt = g(t) · h(y)</div>
          <div class="sum-action">分家 + 兩邊積分</div>
          <div class="sum-example">例：y′ = t · y²</div>
        </div>
        <div class="sum-card" style="--col: #5a8aa8">
          <div class="sum-sec">§2.3</div>
          <div class="sum-title">線性 + μ</div>
          <div class="sum-shape">y′ + p(t)y = g(t)</div>
          <div class="sum-action">乘 μ = e^(∫p)</div>
          <div class="sum-example">例：y′ + 2y = t</div>
        </div>
        <div class="sum-card" style="--col: #8b6aa8">
          <div class="sum-sec">§2.4</div>
          <div class="sum-title">精確</div>
          <div class="sum-shape">M dt + N dy = 0 且 ∂M/∂y = ∂N/∂t</div>
          <div class="sum-action">找 F 使 dF = 0</div>
          <div class="sum-example">例：2t·dt + 2y·dy = 0</div>
        </div>
        <div class="sum-card" style="--col: #a89a5c">
          <div class="sum-sec">§2.5a</div>
          <div class="sum-title">Bernoulli</div>
          <div class="sum-shape">y′ + p(t)y = g(t)·yⁿ</div>
          <div class="sum-action">代 u = y^(1−n) → 變線性</div>
          <div class="sum-example">例：y′ + y = y²</div>
        </div>
        <div class="sum-card" style="--col: #c89a5e">
          <div class="sum-sec">§2.5b</div>
          <div class="sum-title">齊次</div>
          <div class="sum-shape">dy/dt = F(y/t)</div>
          <div class="sum-action">代 v = y/t → 變可分離</div>
          <div class="sum-example">例：y′ = (y + t)/t</div>
        </div>
        <div class="sum-card" style="--col: #c87b5e">
          <div class="sum-sec">Ch4</div>
          <div class="sum-title">數值</div>
          <div class="sum-shape">以上皆非</div>
          <div class="sum-action">RK4 / Adams-Bashforth</div>
          <div class="sum-example">例：y′ = sin(t·y)</div>
        </div>
      </div>
    </app-challenge-card>

    <!-- Quiz -->
    <app-challenge-card prompt="小考：看到方程後，你該用哪一招？">
      <div class="quiz-progress">
        已完成 <strong>{{ completedCount() }}</strong> / {{ QUIZ.length }}
        @if (correctCount() > 0) {
          · 答對 <strong style="color: #5ca878">{{ correctCount() }}</strong>
        }
      </div>

      <div class="quiz-list">
        @for (q of QUIZ; track q.id; let idx = $index) {
          <div class="q-item" [class.answered]="isAnswered(q.id)">
            <div class="q-head">
              <span class="q-num">Q{{ idx + 1 }}</span>
              <code class="q-eq">{{ q.eq }}</code>
            </div>

            @if (!isAnswered(q.id)) {
              <div class="q-options">
                @for (opt of options; track opt) {
                  <button class="opt-btn" (click)="answer(q.id, opt, q.correct)">
                    {{ labels[opt].short }}
                  </button>
                }
              </div>
            } @else {
              <div class="q-result">
                @if (answers()[q.id] === q.correct) {
                  <div class="result-line correct">
                    ✓ 答對——這是 <strong>{{ labels[q.correct].full }}</strong>
                    （{{ labels[q.correct].section }}）
                  </div>
                } @else {
                  <div class="result-line wrong">
                    ✗ 你選了 <strong>{{ labels[answers()[q.id]].short }}</strong>，
                    正解是 <strong>{{ labels[q.correct].full }}</strong>
                    （{{ labels[q.correct].section }}）
                  </div>
                }
                <div class="q-explain">{{ q.explanation }}</div>
              </div>
            }
          </div>
        }
      </div>

      @if (completedCount() === QUIZ.length) {
        <div class="quiz-done" [class.perfect]="correctCount() === QUIZ.length">
          @if (correctCount() === QUIZ.length) {
            🎉 滿分！你已經完全掌握一階 ODE 的診斷。可以開始解題了。
          } @else {
            完成了！答對 {{ correctCount() }} / {{ QUIZ.length }}。
            回去重看一下答錯的那幾節，再戰一次。
          }
          <button class="reset-btn" (click)="resetQuiz()">↻ 重新開始</button>
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        這一章完整走過了<strong>一階 ODE 的解析攻略</strong>：
      </p>
      <ul>
        <li>可分離、線性、精確——三個「標準形狀」的配方</li>
        <li>Bernoulli、齊次——兩個「代換」把非標準變標準</li>
        <li>當以上都失敗——交給數值方法</li>
      </ul>
      <p>
        下一章（Ch3）我們會把這些技巧丟進<strong>真實的模型</strong>裡：
        牛頓冷卻、RC 電路、鹽水混合、族群動力學——全都一階 ODE，全都會用到這六招其中之一。
      </p>
      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        會解一階 ODE 不只是「套公式」——是<strong>看方程的形狀</strong>，
        判斷它屬於哪一類，再用對應的技巧。這個診斷能力，正是本章的核心。
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

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    .sum-card {
      padding: 14px;
      border: 1.5px solid var(--col);
      border-radius: 10px;
      background: color-mix(in srgb, var(--col) 5%, var(--bg));
    }

    .sum-sec {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--col);
      text-transform: uppercase;
    }

    .sum-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      margin: 2px 0 8px;
    }

    .sum-shape {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      padding: 4px 8px;
      background: var(--bg-surface);
      border: 1px dashed var(--border);
      border-radius: 4px;
      margin-bottom: 6px;
    }

    .sum-action {
      font-size: 12px;
      color: var(--text);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .sum-example {
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
    }

    .quiz-progress {
      text-align: center;
      font-size: 13px;
      color: var(--text-secondary);
      padding: 10px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 14px;
    }

    .quiz-progress strong { color: var(--accent); }

    .quiz-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .q-item {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
      transition: border-color 0.2s;
    }

    .q-item.answered { border-color: var(--accent-30); }

    .q-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .q-num {
      display: inline-block;
      min-width: 28px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 700;
      background: var(--accent);
      color: white;
      border-radius: 4px;
      text-align: center;
    }

    .q-eq {
      font-size: 14px;
      padding: 4px 12px;
      flex: 1;
    }

    .q-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    @media (max-width: 460px) {
      .q-options { grid-template-columns: repeat(2, 1fr); }
    }

    .opt-btn {
      font: inherit;
      font-size: 12px;
      padding: 8px 10px;
      border: 1.5px solid var(--border);
      background: var(--bg-surface);
      border-radius: 6px;
      cursor: pointer;
      color: var(--text);
      font-weight: 600;
      transition: all 0.12s;
    }

    .opt-btn:hover {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
    }

    .q-result {
      padding: 10px 0 0;
    }

    .result-line {
      font-size: 13px;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 6px;
    }

    .result-line.correct {
      background: rgba(92, 168, 120, 0.1);
      color: #5ca878;
      border: 1px solid rgba(92, 168, 120, 0.3);
    }

    .result-line.wrong {
      background: rgba(200, 123, 94, 0.1);
      color: #c87b5e;
      border: 1px solid rgba(200, 123, 94, 0.3);
    }

    .result-line strong { font-weight: 700; }

    .q-explain {
      padding: 10px 14px;
      background: var(--bg-surface);
      border-left: 3px solid var(--accent);
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .quiz-done {
      margin-top: 14px;
      padding: 16px;
      background: var(--accent-10);
      border: 1.5px solid var(--accent);
      border-radius: 10px;
      text-align: center;
      font-size: 14px;
      color: var(--text);
    }

    .quiz-done.perfect {
      background: rgba(92, 168, 120, 0.1);
      border-color: #5ca878;
    }

    .reset-btn {
      font: inherit;
      font-size: 12px;
      margin-top: 10px;
      padding: 6px 14px;
      border: 1px solid var(--accent);
      background: transparent;
      color: var(--accent);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .reset-btn:hover {
      background: var(--accent);
      color: white;
    }
  `,
})
export class DeCh2DiagnosticComponent {
  readonly QUIZ = QUIZ;
  readonly labels = TECHNIQUE_LABELS;
  readonly options: Technique[] = ['separable', 'linear', 'exact', 'bernoulli', 'homogeneous', 'numerical'];
  readonly answers = signal<Record<string, Technique>>({});

  answer(qId: string, chosen: Technique, _correct: Technique): void {
    this.answers.set({ ...this.answers(), [qId]: chosen });
  }

  isAnswered(qId: string): boolean {
    return qId in this.answers();
  }

  readonly completedCount = computed(() => Object.keys(this.answers()).length);

  readonly correctCount = computed(() => {
    let n = 0;
    for (const q of QUIZ) {
      if (this.answers()[q.id] === q.correct) n++;
    }
    return n;
  });

  resetQuiz(): void {
    this.answers.set({});
  }
}
