import { Component, computed, signal } from '@angular/core';
import { D3_ELEMENTS, type D3Element, label } from '../algebra-v3-ch16/d3-model';
import { kernelDifference, parity } from './diagnostic-model';

@Component({
  selector: 'app-algebra-v3-compression-route',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch32-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 32.3</p>
        <h2>Map 發生 collision 時，kernel 會指出「哪一種差異」被看不見</h2>
        <p class="lede">
          用 reflection parity map 把 D₃ 壓成兩種 outputs。先碰撞、再檢查 difference，最後才把整條
          fiber 收成 quotient element。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>φ(r)=φ(r²) 是否只是一個偶然 collision？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不是；r⁻¹r² 落在 kernel</button>
          <button type="button" (click)="prediction.set(true)">
            是；兩個 inputs 剛好同 output
          </button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'Homomorphism collisions 有一致結構：a、b 同 output 正好當 a⁻¹b 在 kernel。'
                : '對。Kernel 不只列 invisible elements，也完整解釋每一個 collision。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Kernel collision scanner</p>
            <h3>任選 a、b；同步看 outputs、difference 與 quotient bucket</h3>
          </div>
          <p>SAME／DIFFERENT、IN／OUT 與桶形位置提供非色彩線索。</p>
        </div>
        <div class="pair-controls">
          <fieldset>
            <legend>INPUT a</legend>
            @for (actor of elements; track actor) {
              <button type="button" [attr.aria-pressed]="a() === actor" (click)="a.set(actor)">
                {{ name(actor) }}
              </button>
            }
          </fieldset>
          <fieldset>
            <legend>INPUT b</legend>
            @for (actor of elements; track actor) {
              <button type="button" [attr.aria-pressed]="b() === actor" (click)="b.set(actor)">
                {{ name(actor) }}
              </button>
            }
          </fieldset>
        </div>
        <div class="stage compression-stage">
          <section class="map-rail">
            <article>
              <span>INPUT PAIR</span><b>{{ name(a()) }} · {{ name(b()) }}</b>
            </article>
            <i>φ · reflection parity →</i>
            <article [class.same]="sameOutput()">
              <span>OUTPUTS</span><b>{{ outputLabel(a()) }} · {{ outputLabel(b()) }}</b
              ><small>{{ sameOutput() ? 'SAME OUTPUT' : 'DIFFERENT OUTPUTS' }}</small>
            </article>
          </section>
          <section class="difference-gate" [class.inside]="differenceInKernel()">
            <span>DIFFERENCE TEST</span
            ><strong>{{ name(a()) }}⁻¹{{ name(b()) }} = {{ name(difference()) }}</strong>
            <b>{{ differenceInKernel() ? 'IN KERNEL R' : 'OUTSIDE KERNEL R' }}</b>
            <small>{{ sameOutput() ? 'collision explained' : 'different fibers certified' }}</small>
          </section>
          <section class="fiber-buckets" [class.zipped]="zipped()">
            <article>
              <header><span>φ⁻¹(rotation)</span><b>FIBER / COSET</b></header>
              <div><strong>e</strong><strong>r</strong><strong>r²</strong></div>
              <footer>
                {{ zipped() ? '[R] · one quotient element' : 'three source elements' }}
              </footer>
            </article>
            <article>
              <header><span>φ⁻¹(reflection)</span><b>FIBER / COSET</b></header>
              <div><strong>s</strong><strong>rs</strong><strong>r²s</strong></div>
              <footer>
                {{ zipped() ? '[sR] · one quotient element' : 'three source elements' }}
              </footer>
            </article>
          </section>
          <button type="button" class="primary zip-button" (click)="zipped.set(!zipped())">
            {{ zipped() ? '展開 source fibers' : 'ZIP FIBERS → quotient' }}
          </button>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>same output</span><i>⇔</i><span>a⁻¹b ∈ kernel</span><i>⇔</i
          ><span>same quotient bucket</span>
        </div>
        <p>
          <strong>Quotient 是把 map 已經看成相同的 inputs 正式收成一個 element。</strong>
          Kernel 解釋 collisions；fiber tiles 顯示該忘掉哪些差異。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若 a 與 b 落在不同 quotient buckets，a⁻¹b 還可能在 kernel 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不可能</button>
          <button type="button" (click)="transfer.set(true)">可能</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? '若 difference 在 kernel，homomorphism law 會迫使 φ(a)=φ(b)，與不同 buckets 矛盾。'
                : '對。Different fibers 正好對應 difference outside kernel。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Collision equivalence 與 quotient 的正式推導</summary>
          <div>
            對 homomorphism φ，φ(a)=φ(b) ⇔ φ(a⁻¹b)=e ⇔ a⁻¹b∈ker φ。此處 kernel R 包含 e、r、r²，其
            cosets 正是兩條 fibers，因此 D₃/R≅C₂。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CompressionRouteComponent {
  readonly elements = D3_ELEMENTS;
  readonly a = signal<D3Element>(1);
  readonly b = signal<D3Element>(2);
  readonly zipped = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly difference = computed(() => kernelDifference(this.a(), this.b()));
  readonly sameOutput = computed(() => parity(this.a()) === parity(this.b()));
  readonly differenceInKernel = computed(() => parity(this.difference()) === 0);

  name(element: D3Element): string {
    return label(element);
  }

  outputLabel(element: D3Element): string {
    return parity(element) === 0 ? 'ROTATION' : 'REFLECTION';
  }
}
