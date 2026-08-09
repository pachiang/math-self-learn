import { Component, computed, signal } from '@angular/core';

type WorldId = 'triangle' | 'z5' | 'qstar';
type RoleId = 'set' | 'operation' | 'identity' | 'inverse';

interface RoleModel {
  symbol: string;
  name: string;
  question: string;
  concrete: string;
  example: string;
}

interface WorldModel {
  id: WorldId;
  label: string;
  note: string;
  object: string;
  roles: Record<RoleId, RoleModel>;
}

const ROLE_IDS: readonly RoleId[] = ['set', 'operation', 'identity', 'inverse'];

const WORLDS: readonly WorldModel[] = [
  {
    id: 'triangle',
    label: 'Triangle symmetries',
    note: '六種保持三角形結構的 actions',
    object: '一個帶有 A、B、C 標記的正三角形',
    roles: {
      set: { symbol: 'G', name: '合法 elements 的世界', question: '哪些東西可以拿來合成？', concrete: '{e, r, r², s, rs, r²s}', example: '六種 rotations / reflections 都是整個三角形上的 actions。' },
      operation: { symbol: '·', name: '合成規則', question: '兩個 actions 如何接成一個？', concrete: '先做右邊 action，再做左邊 action', example: 'r · s 表示先 reflection s，再 rotation r。' },
      identity: { symbol: 'e', name: 'universal no-op', question: '哪個 action 對所有 states 都不改變？', concrete: '不動，或總效果為 r³', example: 'e · a = a = a · e，對六個 actions 都成立。' },
      inverse: { symbol: 'a⁻¹', name: '回到 identity 的 partner', question: '哪個 action 能把 a 完整撤銷？', concrete: 'r⁻¹ = r²；s⁻¹ = s', example: 'inverse 取決於選到哪個 a，不是一個固定 element。' },
    },
  },
  {
    id: 'z5',
    label: 'ℤ₅ under addition',
    note: '餘數 0–4 的循環世界',
    object: '時鐘上五個餘數位置',
    roles: {
      set: { symbol: 'G', name: '合法 elements 的世界', question: '哪些值可以繼續參與運算？', concrete: '{0, 1, 2, 3, 4}', example: '所有 integer 都先讀成它除以 5 的 remainder。' },
      operation: { symbol: '·', name: '合成規則', question: '兩個 elements 如何合成？', concrete: 'addition modulo 5', example: '3 · 4 在這個 world 代表 3 + 4 ≡ 2 (mod 5)。' },
      identity: { symbol: 'e', name: 'universal no-op', question: '加上哪個值不改變任何位置？', concrete: '0', example: '0 + a ≡ a ≡ a + 0 (mod 5)。' },
      inverse: { symbol: 'a⁻¹', name: '回到 identity 的 partner', question: '加上什麼能回到 0？', concrete: '−a modulo 5', example: '若 a = 2，則 a⁻¹ = 3，因為 2 + 3 ≡ 0。' },
    },
  },
  {
    id: 'qstar',
    label: 'ℚ* under multiplication',
    note: '所有 nonzero rational numbers',
    object: '不包含 0 的 rational number line',
    roles: {
      set: { symbol: 'G', name: '合法 elements 的世界', question: '哪些 numbers 能相乘並保有 inverse？', concrete: 'ℚ* = ℚ \\ {0}', example: '0 被排除，因為不存在 rational number 能把它乘回 1。' },
      operation: { symbol: '·', name: '合成規則', question: '兩個 elements 如何合成？', concrete: 'ordinary multiplication', example: '(2/3) · (9/4) = 3/2，output 仍是 nonzero rational。' },
      identity: { symbol: 'e', name: 'universal no-op', question: '乘上哪個值不改變任何 number？', concrete: '1', example: '1 × a = a = a × 1。' },
      inverse: { symbol: 'a⁻¹', name: '回到 identity 的 partner', question: '乘上什麼能回到 1？', concrete: '1/a', example: '若 a = 2/3，則 a⁻¹ = 3/2。' },
    },
  },
];

@Component({
  selector: 'app-algebra-v3-symbol-translator',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch6-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 6.3</p>
        <h2>符號不指定長相，只指定工作</h2>
        <p class="lede">在不同 group 裡，<code>e</code> 可以是「不動」、0 或 1。符號沒有換意思；換掉的是承擔這個角色的具體 element。抽象 notation 是一份可跨世界使用的職務表。</p>
      </header>

      <section class="prediction">
        <p class="kicker">先拆掉數字的慣性</p>
        <h3>在 ℤ₅ 的 addition world，identity <code>e</code> 是 1 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不是，是 0</button>
          <button type="button" (click)="prediction.set(true)">是 1</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">{{ prediction() ? '1 只有在 multiplication 才常是 identity；addition 的 no-op 是 0。' : '對。e 不是固定數字，而是由 operation 決定的 universal no-op。' }}</p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div><p class="kicker">Concrete-to-abstract translator</p><h3>換 world，再點一個 symbol 看誰來上班</h3></div>
          <p>上方按鈕換掉具體 system；左側按鈕換掉要追蹤的角色。右側同時保留「抽象問題」與「這個 world 的答案」，避免只背符號對照表。</p>
        </div>

        <div class="translator-worlds" role="group" aria-label="選擇具體 group world">
          @for (world of worlds; track world.id) {
            <button type="button" [attr.aria-pressed]="selectedWorld() === world.id" (click)="selectWorld(world.id)">
              <strong>{{ world.label }}</strong><span>{{ world.note }}</span>
            </button>
          }
        </div>

        <div class="stage symbol-workbench">
          <div>
            <p class="kicker">選擇 abstract role</p>
            <div class="symbol-buttons" role="group" aria-label="選擇要翻譯的 group symbol">
              @for (roleId of roleIds; track roleId) {
                <button type="button" [attr.aria-pressed]="selectedRole() === roleId" (click)="selectedRole.set(roleId)" [attr.aria-label]="roleFor(roleId).name">
                  {{ roleFor(roleId).symbol }}
                </button>
              }
            </div>
            <div class="vocabulary-strip" aria-label="目前 world 的完整符號翻譯">
              @for (roleId of roleIds; track roleId) {
                <div><b>{{ roleFor(roleId).symbol }}</b><span>{{ roleFor(roleId).concrete }}</span></div>
              }
            </div>
          </div>

          <section class="translation-card" aria-live="polite">
            <p class="kicker">{{ current().label }}</p>
            <div class="translation-flow">
              <div><span>ABSTRACT ROLE</span><strong>{{ role().symbol }} · {{ role().name }}</strong></div>
              <i aria-hidden="true">→</i>
              <div><span>CONCRETE REFERENT</span><strong>{{ role().concrete }}</strong></div>
            </div>
            <p class="role-reading"><strong>固定問題：</strong>{{ role().question }}</p>
            <p class="role-reading"><strong>在這個 world：</strong>{{ role().example }}</p>
            <p class="role-reading"><strong>承載它的物件：</strong>{{ current().object }}</p>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>same role</span><i>↔</i><span>different referent</span><i>↔</i><span>same reasoning</span></div>
        <p><strong>抽象不是把細節抹掉，而是固定值得搬運的角色。</strong><code>G</code> 問合法世界、<code>·</code> 問合成方式、<code>e</code> 問 universal no-op、<code>a⁻¹</code> 問誰把指定的 <code>a</code> 帶回 <code>e</code>。</p>
      </aside>

      <section class="transfer">
        <p class="kicker">搬到 matrix world</p>
        <h3>對 invertible matrices under multiplication，<code>e</code> 與 <code>A⁻¹</code> 應翻成什麼？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(true)">I 與 inverse matrix</button>
          <button type="button" (click)="transfer.set(false)">0 與 −A</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">{{ transfer() ? '對。I 是 multiplication 的 no-op；A⁻¹ 是滿足 AA⁻¹ = I = A⁻¹A 的 matrix。' : '那是 addition 的角色翻譯。先看 operation，才能決定 identity 與 inverse。' }}</p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details><summary>把四個角色壓回正式定義</summary><div>一個 group 是 pair (G, ·)：· 將任意兩個 G 中 elements 合成 G 中 element，且 associative；存在 e∈G 對所有 a∈G 滿足 e·a=a=a·e；每個 a∈G 都存在 a⁻¹∈G，使 a·a⁻¹=e=a⁻¹·a。</div></details>
        <details><summary>符號提醒：· 不一定是 multiplication</summary><div>· 是 generic binary operation 的 placeholder。當 operation 是 addition 時，教材常把 a·b 寫成 a+b，把 e 寫成 0，把 a⁻¹ 寫成 −a；角色完全相同，只是 notation 配合具體 world。</div></details>
        <details><summary>為什麼這份字典能解 equation？</summary><div>若 a·x=b，在等式左側 compose a⁻¹，再用 associativity 重新分組：a⁻¹·(a·x)=(a⁻¹·a)·x=e·x=x，所以 x=a⁻¹·b。這不是移項魔法，而是依序使用 inverse、associativity、identity 三個角色。</div></details>
      </section>
    </article>
  `,
})
export class AlgebraV3SymbolTranslatorComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly selectedWorld = signal<WorldId>('triangle');
  readonly selectedRole = signal<RoleId>('set');
  readonly worlds = WORLDS;
  readonly roleIds = ROLE_IDS;
  readonly current = computed(() => WORLDS.find((world) => world.id === this.selectedWorld()) ?? WORLDS[0]);
  readonly role = computed(() => this.current().roles[this.selectedRole()]);

  selectWorld(world: WorldId): void {
    this.selectedWorld.set(world);
  }

  roleFor(role: RoleId): RoleModel {
    return this.current().roles[role];
  }
}
