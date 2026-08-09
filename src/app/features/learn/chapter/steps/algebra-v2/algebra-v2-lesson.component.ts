import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { KatexComponent } from '../../../shared/katex/katex.component';
import { AlgebraV2Cube, AlgebraV2Lesson, AlgebraV2Preset } from './algebra-v2-lessons';

@Component({
  selector: 'app-algebra-v2-lesson',
  standalone: true,
  imports: [KatexComponent],
  template: `
    <article class="algebra-v2-lesson">
      <header class="hero">
        <p class="eyebrow">{{ lesson().eyebrow }}</p>
        <h2>{{ lesson().title }}</h2>
        <p class="lede">{{ lesson().lede }}</p>
      </header>

      <section class="prediction-card" aria-labelledby="prediction-title">
        <div class="section-kicker">先預測，暫時不要找公式</div>
        <h3 id="prediction-title">{{ lesson().prediction.question }}</h3>
        <div class="choice-row" role="group" aria-label="選擇你的預測">
          @for (choice of lesson().prediction.choices; track $index) {
            <button
              type="button"
              [class.selected]="predictionIndex() === $index"
              [attr.aria-pressed]="predictionIndex() === $index"
              (click)="predictionIndex.set($index)"
            >
              {{ choice.label }}
            </button>
          }
        </div>
        @if (selectedPrediction(); as choice) {
          <p
            class="choice-feedback"
            [class.correct]="choice.correct"
            [class.misconception]="!choice.correct"
            aria-live="polite"
          >
            <strong>{{ choice.correct ? '這個判斷抓到結構了。' : '這個直覺少看了一層。' }}</strong>
            {{ choice.feedback }}
          </p>
        }
      </section>

      <section class="model-section" aria-labelledby="model-title">
        <div class="model-heading">
          <div>
            <p class="eyebrow">{{ lesson().model.eyebrow }}</p>
            <h3 id="model-title">{{ lesson().model.title }}</h3>
          </div>
          <p>{{ lesson().model.prompt }}</p>
        </div>

        <div class="preset-row" role="group" aria-label="切換模型情境">
          @for (preset of lesson().model.presets; track preset.label; let index = $index) {
            <button
              type="button"
              [class.active]="presetIndex() === index"
              [attr.aria-pressed]="presetIndex() === index"
              (click)="selectPreset(index)"
            >
              {{ preset.label }}
            </button>
          }
        </div>

        <div class="interaction-hint">
          <span>DIRECT MANIPULATION</span>
          <p>{{ interactionHint() }}</p>
        </div>

        <div class="model-stage">
          @switch (lesson().model.kind) {
            @case ('transform') {
              <div class="transform-stage">
                <div class="shape-panel">
                  <span>{{ activePreset().before ?? 'before' }}</span>
                  <svg viewBox="0 0 200 180" role="img" aria-label="變換前的帶標記三角形">
                    <polygon points="100,25 168,142 32,142" class="shape-outline" />
                    <circle cx="100" cy="25" r="14" class="vertex a" />
                    <circle cx="168" cy="142" r="14" class="vertex b" />
                    <circle cx="32" cy="142" r="14" class="vertex c" />
                    <text x="100" y="30">A</text>
                    <text x="168" y="147">B</text>
                    <text x="32" y="147">C</text>
                  </svg>
                </div>
                <div class="transform-arrow" aria-hidden="true">
                  <span>{{ activePreset().rotation ? activePreset().rotation + '°' : '0°' }}</span>
                  <i>→</i>
                </div>
                <div class="shape-panel">
                  <span>{{ activePreset().after ?? 'after' }}</span>
                  <svg viewBox="0 0 200 180" role="img" aria-label="變換後的帶標記三角形">
                    <g [style.transform]="triangleTransform(activePreset(), transformApplied())">
                      <polygon points="100,25 168,142 32,142" class="shape-outline transformed" />
                      <circle cx="100" cy="25" r="14" class="vertex a" />
                      <circle cx="168" cy="142" r="14" class="vertex b" />
                      <circle cx="32" cy="142" r="14" class="vertex c" />
                      <text x="100" y="30">A</text>
                      <text x="168" y="147">B</text>
                      <text x="32" y="147">C</text>
                    </g>
                  </svg>
                </div>
              </div>
              <div class="direct-controls centered-controls">
                <button
                  type="button"
                  [class.active]="transformApplied()"
                  [attr.aria-pressed]="transformApplied()"
                  (click)="transformApplied.update((applied) => !applied)"
                >
                  {{ transformApplied() ? '復原到 identity' : '套用這個 action' }}
                </button>
              </div>
              @if (activePreset().mapping) {
                <div class="mapping-strip" aria-label="頂點對應">
                  @for (entry of activePreset().mapping; track entry.from) {
                    <span [class.accent]="entry.accent">
                      <b>{{ entry.from }}</b
                      ><i>→</i><b>{{ entry.to }}</b>
                    </span>
                  }
                </div>
              }
            }

            @case ('timeline') {
              <div class="timeline-stage">
                <div class="state-tile start">
                  <span>START</span>
                  <strong>{{ activePreset().before ?? 'input' }}</strong>
                </div>
                <div class="action-track">
                  @for (action of activePreset().actions ?? []; track $index) {
                    <div
                      class="action-chip"
                      [class.executed]="$index < timelineStep()"
                      [class.next]="$index === timelineStep()"
                    >
                      <small>{{ $index + 1 }}</small>
                      <strong>{{ action }}</strong>
                    </div>
                    @if (!$last) {
                      <i aria-hidden="true">→</i>
                    }
                  }
                </div>
                <div class="state-tile result" [class.bad]="activePreset().status === 'bad'">
                  <span>RESULT</span>
                  <strong>
                    {{
                      timelineComplete()
                        ? (activePreset().after ?? activePreset().output ?? 'output')
                        : '尚未完成全部 actions'
                    }}
                  </strong>
                </div>
              </div>
              <div class="direct-controls timeline-controls">
                <button type="button" class="quiet" (click)="timelineStep.set(0)">回到起點</button>
                <label>
                  <span>已執行 {{ timelineStep() }} / {{ actionCount() }}</span>
                  <input
                    type="range"
                    min="0"
                    [max]="actionCount()"
                    [value]="timelineStep()"
                    (input)="setTimelineStep($event)"
                  />
                </label>
                <button type="button" (click)="advanceTimeline()" [disabled]="timelineComplete()">
                  執行下一個 action
                </button>
              </div>
              @if (activePreset().formula) {
                <div class="formula-readout">{{ activePreset().formula }}</div>
              }
            }

            @case ('mapping') {
              <div class="mapping-board">
                @for (entry of activePreset().mapping ?? []; track $index) {
                  <button
                    type="button"
                    class="mapping-row"
                    [class.accent]="entry.accent"
                    [class.focused]="focusIndex() === $index"
                    [class.same-fiber]="isSameFiber(entry.to)"
                    [attr.aria-pressed]="focusIndex() === $index"
                    (click)="focusIndex.set($index)"
                  >
                    <span>{{ entry.from }}</span>
                    <i aria-hidden="true">→</i>
                    <strong>{{ entry.to }}</strong>
                  </button>
                }
              </div>
              @if (focusedMapping(); as focused) {
                <p class="interaction-readout">
                  追蹤 {{ focused.from }} → {{ focused.to }}；共有 {{ fiberSize(focused.to) }} 個
                  inputs 落到同一 output。
                </p>
              }
              @if (activePreset().checks) {
                <div class="mini-checks">
                  @for (check of activePreset().checks; track check.label) {
                    <div [class.pass]="check.pass" [class.fail]="!check.pass">
                      <span aria-hidden="true">{{ check.pass ? '✓' : '×' }}</span>
                      <p>
                        <strong>{{ check.label }}</strong
                        >{{ check.reason }}
                      </p>
                    </div>
                  }
                </div>
              }
            }

            @case ('table') {
              @if (activePreset().table; as table) {
                <div class="cayley-wrap">
                  <table class="cayley-table" aria-label="Cayley table">
                    <thead>
                      <tr>
                        <th scope="col">·</th>
                        @for (header of table.headers; track header) {
                          <th scope="col">{{ header }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of table.rows; track $index; let rowIndex = $index) {
                        <tr>
                          <th scope="row">
                            {{ table.rowHeaders?.[rowIndex] ?? table.headers[rowIndex] }}
                          </th>
                          @for (cell of row; track $index; let columnIndex = $index) {
                            <td>
                              <button
                                type="button"
                                [class.highlight]="
                                  isHighlighted(table.highlight, rowIndex, columnIndex)
                                "
                                [class.selected]="isSelectedCell(rowIndex, columnIndex)"
                                [attr.aria-pressed]="isSelectedCell(rowIndex, columnIndex)"
                                (click)="selectCell(rowIndex, columnIndex)"
                              >
                                {{ cell }}
                              </button>
                            </td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                  <div class="table-readout">
                    <span>目前查詢</span>
                    <strong>{{ selectedTableFormula() }}</strong>
                    <p>
                      {{
                        activePreset().tableNote ??
                          'row 與 column 決定 inputs；高亮 cell 是 composite。'
                      }}
                    </p>
                  </div>
                </div>
              }
            }

            @case ('diagnostic') {
              <div class="diagnostic-grid">
                @for (check of activePreset().checks ?? []; track check.label) {
                  <button
                    type="button"
                    class="diagnostic-item"
                    [class.pass]="check.pass"
                    [class.fail]="!check.pass"
                    [class.focused]="focusIndex() === $index"
                    [class.dimmed]="focusIndex() !== null && focusIndex() !== $index"
                    [attr.aria-pressed]="focusIndex() === $index"
                    (click)="focusIndex.set($index)"
                  >
                    <span class="status-mark" aria-hidden="true">{{ check.pass ? '✓' : '×' }}</span>
                    <div>
                      <strong>{{ check.label }}</strong>
                      <p>{{ check.reason }}</p>
                    </div>
                  </button>
                }
              </div>
            }

            @case ('closure') {
              <div class="closure-machine">
                <div class="set-boundary">
                  <span>UNDERLYING SET</span>
                  <strong>{{ activePreset().setLabel }}</strong>
                  <div class="input-pair">{{ activePreset().before }}</div>
                </div>
                <div class="machine-core">
                  <span>OPERATION</span>
                  <strong>{{ activePreset().operation }}</strong>
                  <i aria-hidden="true">→</i>
                </div>
                <div
                  class="machine-output"
                  [class.inside]="machineRun() && activePreset().status === 'good'"
                  [class.outside]="machineRun() && activePreset().status === 'bad'"
                >
                  <span>OUTPUT</span>
                  <strong>{{ machineRun() ? activePreset().output : '?' }}</strong>
                  <small>
                    {{ activePreset().status === 'bad' ? '掉出集合' : '檢查結果' }}
                  </small>
                </div>
              </div>
              <div class="direct-controls centered-controls">
                <button type="button" (click)="machineRun.set(true)" [disabled]="machineRun()">
                  {{ machineRun() ? 'operation 已執行' : '把 inputs 丟進 operation' }}
                </button>
                <button type="button" class="quiet" (click)="machineRun.set(false)">重設</button>
              </div>
              @if (activePreset().checks) {
                <div class="mini-checks">
                  @for (check of activePreset().checks; track check.label) {
                    <div [class.pass]="check.pass" [class.fail]="!check.pass">
                      <span aria-hidden="true">{{ check.pass ? '✓' : '×' }}</span>
                      <p>
                        <strong>{{ check.label }}</strong
                        >{{ check.reason }}
                      </p>
                    </div>
                  }
                </div>
              }
            }

            @case ('symbols') {
              <div class="symbol-translator">
                @for (entry of activePreset().mapping ?? []; track entry.to) {
                  <button
                    type="button"
                    [class.focused]="focusIndex() === $index"
                    [attr.aria-pressed]="focusIndex() === $index"
                    (click)="focusIndex.set($index)"
                  >
                    <span>{{ entry.from }}</span>
                    <i aria-hidden="true">→</i>
                    <strong>{{ entry.to }}</strong>
                  </button>
                }
              </div>
            }

            @case ('network') {
              <div class="network-stage">
                <div class="node-field" aria-label="action network 的可達狀態">
                  @for (node of activePreset().nodes ?? []; track node.label) {
                    <button
                      type="button"
                      class="network-node"
                      [class.origin]="node.state === 'origin'"
                      [class.active]="node.state === 'active'"
                      [class.dim]="node.state === 'dim'"
                      [class.focused]="focusIndex() === $index"
                      [attr.aria-pressed]="focusIndex() === $index"
                      (click)="focusIndex.set($index)"
                    >
                      <span>{{ node.label }}</span>
                      <small>
                        {{
                          node.state === 'origin'
                            ? 'START'
                            : node.state === 'active'
                              ? 'REACHABLE'
                              : 'NOT REACHED'
                        }}
                      </small>
                    </button>
                  }
                </div>
                <div class="path-readout">
                  <span>ACTION PATH</span>
                  <div class="action-track compact-track">
                    @for (action of activePreset().actions ?? []; track $index) {
                      <div class="action-chip">
                        <small>{{ $index + 1 }}</small
                        ><strong>{{ action }}</strong>
                      </div>
                      @if (!$last) {
                        <i aria-hidden="true">→</i>
                      }
                    }
                  </div>
                  <strong>{{ activePreset().formula ?? activePreset().output }}</strong>
                </div>
              </div>
            }

            @case ('partition') {
              <div class="partition-stage" aria-label="群的區塊分割">
                @for (block of activePreset().blocks ?? []; track block.label) {
                  <button
                    type="button"
                    class="partition-block"
                    [class.active]="block.state === 'active'"
                    [class.warning]="block.state === 'warning'"
                    [class.focused]="focusIndex() === $index"
                    [class.dimmed]="focusIndex() !== null && focusIndex() !== $index"
                    [attr.aria-pressed]="focusIndex() === $index"
                    (click)="focusIndex.set($index)"
                  >
                    <span>{{ block.label }}</span>
                    <div>
                      @for (item of block.items; track item) {
                        <strong>{{ item }}</strong>
                      }
                    </div>
                  </button>
                }
              </div>
              @if (activePreset().formula) {
                <div class="formula-readout">{{ activePreset().formula }}</div>
              }
            }

            @case ('lattice') {
              <div class="lattice-stage" aria-label="subgroup inclusion lattice">
                @for (level of [0, 1, 2]; track level) {
                  <div class="lattice-level">
                    @for (block of activePreset().blocks ?? []; track block.label) {
                      @if ((block.level ?? 0) === level) {
                        <button
                          type="button"
                          class="lattice-node"
                          [class.active]="block.state === 'active'"
                          [class.focused]="focusedBlockLabel() === block.label"
                          [attr.aria-pressed]="focusedBlockLabel() === block.label"
                          (click)="focusBlock(block.label)"
                        >
                          <strong>{{ block.label }}</strong
                          ><span>{{ block.items.join(' · ') }}</span>
                        </button>
                      }
                    }
                  </div>
                }
              </div>
            }

            @case ('cube') {
              @if (activePreset().cube; as cube) {
                <div class="cube-lab">
                  <div class="cube-scene" [class.vertex-focus]="cube.focus === 'vertex'">
                    <div class="cube" [style.transform]="cubeTransform(cube)">
                      <div class="cube-face front">front</div>
                      <div class="cube-face back">back</div>
                      <div class="cube-face right">right</div>
                      <div class="cube-face left">left</div>
                      <div class="cube-face top">top</div>
                      <div class="cube-face bottom">bottom</div>
                      @if (cube.focus === 'vertex') {
                        <span class="cube-vertex" aria-label="選定的 vertex v">v</span>
                      }
                    </div>
                  </div>
                  <div class="cube-console">
                    <span>SPATIAL ACTION</span>
                    <strong>{{ cube.focusLabel }}</strong>
                    <p>{{ cube.invariant }}</p>
                    <div class="cube-counter">
                      <span>rotation</span><b>{{ cubeTurn() * cube.angle }}°</b>
                    </div>
                    <div class="direct-controls">
                      <button type="button" class="quiet" (click)="cubeTurn.set(0)">
                        identity
                      </button>
                      <button type="button" (click)="advanceCube(cube.angle)">
                        再轉 {{ cube.angle }}°
                      </button>
                    </div>
                  </div>
                </div>
                @if (activePreset().checks) {
                  <div class="mini-checks cube-checks">
                    @for (check of activePreset().checks; track check.label) {
                      <div [class.pass]="check.pass" [class.fail]="!check.pass">
                        <span aria-hidden="true">{{ check.pass ? '✓' : '×' }}</span>
                        <p>
                          <strong>{{ check.label }}</strong
                          >{{ check.reason }}
                        </p>
                      </div>
                    }
                  </div>
                }
              }
            }
          }
        </div>

        <div
          class="model-verdict"
          [class.good]="activePreset().status === 'good'"
          [class.bad]="activePreset().status === 'bad'"
          aria-live="polite"
        >
          <span>現在要觀察的因果</span>
          <p>{{ activePreset().detail }}</p>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-icon" aria-hidden="true">
          <span>state</span>
          <i>→</i>
          <span>action</span>
        </div>
        <div>
          <span class="card-label">帶走這個模型</span>
          <p>{{ lesson().insight }}</p>
        </div>
      </aside>

      <section class="transfer-card" aria-labelledby="transfer-title">
        <p class="eyebrow">換一個表面，保留同一個結構</p>
        <h3 id="transfer-title">{{ lesson().transfer.question }}</h3>
        <div class="choice-row compact" role="group" aria-label="遷移題選擇">
          @for (choice of lesson().transfer.choices; track $index) {
            <button
              type="button"
              [class.selected]="transferIndex() === $index"
              [attr.aria-pressed]="transferIndex() === $index"
              (click)="transferIndex.set($index)"
            >
              {{ choice.label }}
            </button>
          }
        </div>
        @if (selectedTransfer(); as choice) {
          <p
            class="choice-feedback"
            [class.correct]="choice.correct"
            [class.misconception]="!choice.correct"
            aria-live="polite"
          >
            <strong>{{ choice.correct ? '可以遷移。' : '再追蹤一次 action。' }}</strong>
            {{ choice.feedback }}
          </p>
        }
      </section>

      <section class="formal-zone" aria-labelledby="formal-zone-title">
        <div class="formal-zone-heading">
          <div>
            <span>SECONDARY LAYER</span>
            <h3 id="formal-zone-title">直覺已完整；需要時再進入形式化</h3>
          </div>
          <p>三個區塊彼此獨立，不打開也不會中斷主流程。</p>
        </div>

        <details class="formal-panel">
          <summary>
            <span>01</span>
            <div>
              <strong>正式定義</strong><small>{{ lesson().formal.title }}</small>
            </div>
          </summary>
          <div class="formal-content">
            <p>{{ lesson().formal.body }}</p>
            @if (lesson().formal.notation) {
              <div class="math-line"><app-math [e]="lesson().formal.notation!" /></div>
            }
          </div>
        </details>

        <details class="formal-panel proof-panel" (toggle)="onProofToggle($event)">
          <summary>
            <span>02</span>
            <div>
              <strong>Proof Lab</strong><small>{{ lesson().proof.title }}</small>
            </div>
          </summary>
          <div class="proof-layout">
            <div class="proof-anchor">
              <span>視覺錨點</span>
              <strong>{{ lesson().insight }}</strong>
              <p>{{ lesson().proof.goal }}</p>
            </div>
            <div class="proof-steps">
              @for (step of lesson().proof.steps; track $index) {
                <div [class.visible]="$index < proofStepCount()">
                  <span>{{ $index + 1 }}</span>
                  <p>
                    {{ $index < proofStepCount() ? step : '先自己想：下一步需要哪個已知條件？' }}
                  </p>
                </div>
              }
              <div class="proof-controls">
                <button type="button" (click)="revealProofStep()" [disabled]="proofComplete()">
                  {{ proofComplete() ? '證明已完整' : '揭示下一步' }}
                </button>
                <button type="button" class="quiet" (click)="proofStepCount.set(1)">
                  重新思考
                </button>
              </div>
            </div>
          </div>
        </details>

        <details class="formal-panel">
          <summary>
            <span>03</span>
            <div><strong>邊界與反例</strong><small>這個模型不能被誤用到哪裡？</small></div>
          </summary>
          <div class="formal-content boundary-content">
            <p>{{ lesson().boundary }}</p>
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV2LessonComponent {
  readonly lesson = input.required<AlgebraV2Lesson>();
  readonly predictionIndex = signal<number | null>(null);
  readonly transferIndex = signal<number | null>(null);
  readonly presetIndex = signal(0);
  readonly proofStepCount = signal(1);
  readonly focusIndex = signal<number | null>(null);
  readonly focusedBlockLabel = signal<string | null>(null);
  readonly selectedCell = signal<[number, number] | null>(null);
  readonly timelineStep = signal(0);
  readonly transformApplied = signal(false);
  readonly machineRun = signal(false);
  readonly cubeTurn = signal(0);

  readonly selectedPrediction = computed(() => {
    const index = this.predictionIndex();
    return index === null ? null : (this.lesson().prediction.choices[index] ?? null);
  });

  readonly selectedTransfer = computed(() => {
    const index = this.transferIndex();
    return index === null ? null : (this.lesson().transfer.choices[index] ?? null);
  });

  readonly activePreset = computed(
    () => (this.lesson().model.presets[this.presetIndex()] ?? this.lesson().model.presets[0])!,
  );

  readonly actionCount = computed(() => this.activePreset().actions?.length ?? 0);
  readonly timelineComplete = computed(() => this.timelineStep() >= this.actionCount());

  readonly focusedMapping = computed(() => {
    const index = this.focusIndex();
    return index === null ? null : (this.activePreset().mapping?.[index] ?? null);
  });

  readonly interactionHint = computed(() => {
    const hints: Record<string, string> = {
      transform: '先選一個 action，再親手套用／復原；比較 labels 如何移動，而不是只看外形。',
      timeline: '拖動進度或逐步執行 actions，觀察 composite 的結果何時真正確定。',
      mapping: '點一條 arrow，系統會同時標出落到相同 output 的整條 fiber。',
      table: '直接點任意 cell 查詢 row–column pair；不要把表格當成要背的答案。',
      diagnostic: '逐一點選檢查項目，把一個複雜判斷拆成可定位的 structural tests。',
      closure: '先預測 output 在哪裡，再親手執行 operation 看它是否仍留在集合內。',
      symbols: '點選一列，在口語角色與 symbols 之間來回翻譯。',
      network: '點選 node 追蹤它在 action network 中的角色與可達性。',
      partition: '點選一個 block 隔離觀察：哪些 elements 被當成同一個 structural unit。',
      lattice: '點選 subgroup node，從 inclusion 的位置理解它，而不是只記名稱。',
      cube: '按下 rotation 直接操控 3D cube；觀察選定 vertex／face 在哪些 rotations 下不動。',
    };
    return hints[this.lesson().model.kind] ?? '直接操作模型，追蹤 action 與 invariant。';
  });

  readonly selectedTableFormula = computed(() => {
    const table = this.activePreset().table;
    const selected = this.selectedCell();
    if (!table || !selected) {
      return this.activePreset().formula ?? '選一個 cell';
    }
    const [row, column] = selected;
    const rowLabel = table.rowHeaders?.[row] ?? table.headers[row] ?? `row ${row + 1}`;
    const columnLabel = table.headers[column] ?? `column ${column + 1}`;
    return `${rowLabel} × ${columnLabel} → ${table.rows[row]?.[column] ?? '?'}`;
  });

  readonly proofComplete = computed(
    () => this.proofStepCount() >= this.lesson().proof.steps.length,
  );

  constructor() {
    effect(() => {
      this.lesson().id;
      untracked(() => {
        this.predictionIndex.set(null);
        this.transferIndex.set(null);
        this.presetIndex.set(0);
        this.proofStepCount.set(1);
        this.resetExploration();
      });
    });
  }

  triangleTransform(preset: AlgebraV2Preset, applied: boolean): string {
    if (!applied) return 'rotate(0deg) scaleX(1)';
    const rotation = preset.rotation ?? 0;
    const reflection = preset.reflected ? ' scaleX(-1)' : '';
    return `rotate(${rotation}deg)${reflection}`;
  }

  selectPreset(index: number): void {
    this.presetIndex.set(index);
    this.resetExploration();
  }

  resetExploration(): void {
    this.focusIndex.set(null);
    this.focusedBlockLabel.set(null);
    this.selectedCell.set(null);
    this.timelineStep.set(0);
    this.transformApplied.set(false);
    this.machineRun.set(false);
    this.cubeTurn.set(0);
  }

  setTimelineStep(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.timelineStep.set(Number(input.value));
    }
  }

  advanceTimeline(): void {
    this.timelineStep.update((step) => Math.min(step + 1, this.actionCount()));
  }

  fiberSize(output: string): number {
    return this.activePreset().mapping?.filter((entry) => entry.to === output).length ?? 0;
  }

  isSameFiber(output: string): boolean {
    return this.focusedMapping()?.to === output;
  }

  selectCell(row: number, column: number): void {
    this.selectedCell.set([row, column]);
  }

  isSelectedCell(row: number, column: number): boolean {
    const selected = this.selectedCell();
    return selected?.[0] === row && selected[1] === column;
  }

  focusBlock(label: string): void {
    this.focusedBlockLabel.set(label);
  }

  cubeTransform(cube: AlgebraV2Cube): string {
    const [x, y, z] = cube.axis;
    return `rotateX(-18deg) rotateY(28deg) rotate3d(${x}, ${y}, ${z}, ${this.cubeTurn() * cube.angle}deg)`;
  }

  advanceCube(angle: number): void {
    const turns = Math.max(1, Math.round(360 / angle));
    this.cubeTurn.update((turn) => (turn + 1) % turns);
  }

  isHighlighted(
    highlight: [number, number] | undefined,
    rowIndex: number,
    columnIndex: number,
  ): boolean {
    return highlight?.[0] === rowIndex && highlight[1] === columnIndex;
  }

  revealProofStep(): void {
    this.proofStepCount.update((count) => Math.min(count + 1, this.lesson().proof.steps.length));
  }

  onProofToggle(event: Event): void {
    const details = event.currentTarget;
    if (details instanceof HTMLDetailsElement && !details.open) {
      this.proofStepCount.set(1);
    }
  }
}
