import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StepNavComponent, StepDef } from './step-nav/step-nav.component';

// Ch1 steps
import { StepSymmetryComponent } from './steps/step-symmetry.component';
import { StepCompositionComponent } from './steps/step-composition.component';
import { StepOrderComponent } from './steps/step-order.component';
import { StepRulesComponent } from './steps/step-rules.component';
import { StepDefinitionComponent } from './steps/step-definition.component';
import { StepBeyondComponent } from './steps/step-beyond.component';

// Ch2 steps
import { Ch2StubComponent } from './steps/ch2/ch2-stub.component';
import { StepEquivalenceComponent } from './steps/ch2/step-equivalence.component';
import { StepCosetsComponent } from './steps/ch2/step-cosets.component';
import { StepWhySubgroupComponent } from './steps/ch2/step-why-subgroup.component';

// Ch3 steps
import { StepLeftRightCosetsComponent } from './steps/ch3/step-left-right-cosets.component';
import { StepWhyNormalComponent } from './steps/ch3/step-why-normal.component';
import { StepQuotientComponent } from './steps/ch3/step-quotient.component';
import { StepHomomorphismComponent } from './steps/ch3/step-homomorphism.component';
import { StepIsomorphismComponent } from './steps/ch3/step-isomorphism.component';
import { StepKernelComponent } from './steps/ch3/step-kernel.component';
import { StepFirstIsoComponent } from './steps/ch3/step-first-iso.component';

// Ch4 steps
import { StepSymmetricGroupComponent } from './steps/ch4/step-symmetric-group.component';
import { StepCyclesComponent } from './steps/ch4/step-cycles.component';
import { StepTranspositionsComponent } from './steps/ch4/step-transpositions.component';
import { StepSignComponent } from './steps/ch4/step-sign.component';
import { StepAlternatingComponent } from './steps/ch4/step-alternating.component';
import { StepCayleyTheoremComponent } from './steps/ch4/step-cayley-theorem.component';

// Ch6 Sylow steps
import { StepConjugacyComponent } from './steps/ch6-sylow/step-conjugacy.component';
import { StepClassEquationComponent } from './steps/ch6-sylow/step-class-equation.component';
import { StepPGroupsComponent } from './steps/ch6-sylow/step-p-groups.component';
import { StepSylow1Component } from './steps/ch6-sylow/step-sylow1.component';
import { StepSylow23Component } from './steps/ch6-sylow/step-sylow23.component';
import { StepClassificationComponent } from './steps/ch6-sylow/step-classification.component';

// Ch7 (Rings) steps
import { StepIntegersToRingsComponent } from './steps/ch6/step-integers-to-rings.component';
import { StepRingExamplesComponent } from './steps/ch6/step-ring-examples.component';
import { StepZeroDivisorsComponent } from './steps/ch6/step-zero-divisors.component';
import { StepIdealsComponent } from './steps/ch6/step-ideals.component';
import { StepQuotientRingComponent } from './steps/ch6/step-quotient-ring.component';
import { StepRingHomomorphismComponent } from './steps/ch6/step-ring-homomorphism.component';

// Ch7 steps
import { StepWhatIsFieldComponent } from './steps/ch7/step-what-is-field.component';
import { StepFiniteFieldsComponent } from './steps/ch7/step-finite-fields.component';
import { StepPolynomialsComponent } from './steps/ch7/step-polynomials.component';
import { StepIrreducibleComponent } from './steps/ch7/step-irreducible.component';
import { StepFieldExtensionsComponent } from './steps/ch7/step-field-extensions.component';
import { StepGfComponent } from './steps/ch7/step-gf.component';

// Ch8 steps
import { StepRootsExtensionsComponent } from './steps/ch8/step-roots-extensions.component';
import { StepSplittingFieldComponent } from './steps/ch8/step-splitting-field.component';
import { StepAutomorphismsComponent } from './steps/ch8/step-automorphisms.component';
import { StepGaloisGroupComponent } from './steps/ch8/step-galois-group.component';
import { StepCorrespondenceComponent } from './steps/ch8/step-correspondence.component';
import { StepQuinticComponent } from './steps/ch8/step-quintic.component';

// Ch10 Rubik
import { StepRubikGroupComponent } from './steps/ch10-rubik/step-rubik-group.component';
import { StepCommutatorsComponent } from './steps/ch10-rubik/step-commutators.component';
import { StepCubeStructureComponent } from './steps/ch10-rubik/step-cube-structure.component';
import { StepGodsNumberComponent } from './steps/ch10-rubik/step-gods-number.component';
import { StepCubeSolveComponent } from './steps/ch10-rubik/step-cube-solve.component';

// Ch11 Representation
import { StepWhatIsRepComponent } from './steps/ch11-rep/step-what-is-rep.component';
import { StepCharactersComponent } from './steps/ch11-rep/step-characters.component';
import { StepIrreducibleRepComponent } from './steps/ch11-rep/step-irreducible-rep.component';
import { StepRepPhysicsComponent } from './steps/ch11-rep/step-rep-physics.component';
import { StepFourierComponent } from './steps/ch11-rep/step-fourier.component';

// Ch12 Algebraic Geometry
import { StepVarietiesComponent } from './steps/ch12-alggeom/step-varieties.component';
import { StepIdealVarietyComponent } from './steps/ch12-alggeom/step-ideal-variety.component';
import { StepNullstellensatzComponent } from './steps/ch12-alggeom/step-nullstellensatz.component';
import { StepEllipticCurvesComponent } from './steps/ch12-alggeom/step-elliptic-curves.component';
import { StepModernAgComponent } from './steps/ch12-alggeom/step-modern-ag.component';

// Ch5 steps
import { StepActionComponent } from './steps/ch5/step-action.component';
import { StepOrbitsComponent } from './steps/ch5/step-orbits.component';
import { StepStabilizersComponent } from './steps/ch5/step-stabilizers.component';
import { StepOrbitStabilizerComponent } from './steps/ch5/step-orbit-stabilizer.component';
import { StepBurnsideComponent } from './steps/ch5/step-burnside.component';
import { StepNecklacesComponent } from './steps/ch5/step-necklaces.component';

interface ChapterConfig {
  title: string;
  steps: StepDef[];
}

const CHAPTERS: Record<string, ChapterConfig> = {
  ch1: {
    title: '第一章：什麼是群？',
    steps: [
      { num: 1, title: '對稱是什麼' },
      { num: 2, title: '操作的組合' },
      { num: 3, title: '順序重要嗎' },
      { num: 4, title: '隱藏規則' },
      { num: 5, title: '群的定義' },
      { num: 6, title: '其他群' },
    ],
  },
  ch2: {
    title: '第二章：群的內部結構',
    steps: [
      { num: 1, title: '元素的階' },
      { num: 2, title: '生成元' },
      { num: 3, title: '子群' },
      { num: 4, title: '等價關係' },
      { num: 5, title: '陪集' },
      { num: 6, title: '為什麼是子群' },
      { num: 7, title: '拉格朗日' },
    ],
  },
  ch3: {
    title: '第三章：商群與同態',
    steps: [
      { num: 1, title: '左右陪集' },
      { num: 2, title: '為什麼正規' },
      { num: 3, title: '商群' },
      { num: 4, title: '同態' },
      { num: 5, title: '同構' },
      { num: 6, title: '核' },
      { num: 7, title: '第一同構定理' },
    ],
  },
  ch4: {
    title: '第四章：置換群',
    steps: [
      { num: 1, title: 'S\u2099' },
      { num: 2, title: '循環記號' },
      { num: 3, title: '對換' },
      { num: 4, title: '奇偶性' },
      { num: 5, title: '交替群' },
      { num: 6, title: '凱萊定理' },
    ],
  },
  ch5: {
    title: '第五章：群作用',
    steps: [
      { num: 1, title: '什麼是群作用' },
      { num: 2, title: '軌道' },
      { num: 3, title: '穩定子' },
      { num: 4, title: '軌道-穩定子' },
      { num: 5, title: 'Burnside' },
      { num: 6, title: '項鍊計數' },
    ],
  },
  ch6: {
    title: '第六章：Sylow 定理',
    steps: [
      { num: 1, title: '共軛類' },
      { num: 2, title: '類方程' },
      { num: 3, title: 'p-群' },
      { num: 4, title: 'Sylow I' },
      { num: 5, title: 'Sylow II\u3001III' },
      { num: 6, title: '群分類' },
    ],
  },
  ch7: {
    title: '第七章：環',
    steps: [
      { num: 1, title: '從整數到環' },
      { num: 2, title: '環的例子' },
      { num: 3, title: '零因子' },
      { num: 4, title: '理想' },
      { num: 5, title: '商環' },
      { num: 6, title: '環同態' },
    ],
  },
  ch8: {
    title: '第八章：域與多項式',
    steps: [
      { num: 1, title: '什麼是域' },
      { num: 2, title: '有限域' },
      { num: 3, title: '多項式環' },
      { num: 4, title: '不可約多項式' },
      { num: 5, title: '域擴張' },
      { num: 6, title: 'GF(p\u207F)' },
    ],
  },
  ch9: {
    title: '第九章：伽羅瓦理論',
    steps: [
      { num: 1, title: '根與域擴張' },
      { num: 2, title: '分裂域' },
      { num: 3, title: '域自同構' },
      { num: 4, title: '伽羅瓦群' },
      { num: 5, title: '伽羅瓦對應' },
      { num: 6, title: '五次不可解' },
    ],
  },
  ch10: {
    title: '專題：魔術方塊群',
    steps: [
      { num: 1, title: '魔方是群' },
      { num: 2, title: '交換子' },
      { num: 3, title: '子群結構' },
      { num: 4, title: '上帝之數' },
      { num: 5, title: '解法策略' },
    ],
  },
  ch11: {
    title: '專題：表示論入門',
    steps: [
      { num: 1, title: '什麼是表示' },
      { num: 2, title: '特徵標' },
      { num: 3, title: '不可約表示' },
      { num: 4, title: '物理應用' },
      { num: 5, title: '傅立葉' },
    ],
  },
  ch12: {
    title: '專題：代數幾何入門',
    steps: [
      { num: 1, title: '代數簇' },
      { num: 2, title: '理想與簇' },
      { num: 3, title: '零點定理' },
      { num: 4, title: '橢圓曲線' },
      { num: 5, title: '現代面貌' },
    ],
  },
};

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [
    RouterLink,
    StepNavComponent,
    // Ch1
    StepSymmetryComponent,
    StepCompositionComponent,
    StepOrderComponent,
    StepRulesComponent,
    StepDefinitionComponent,
    StepBeyondComponent,
    // Ch2
    Ch2StubComponent,
    StepEquivalenceComponent,
    StepCosetsComponent,
    StepWhySubgroupComponent,
    // Ch3
    StepLeftRightCosetsComponent,
    StepWhyNormalComponent,
    StepQuotientComponent,
    StepHomomorphismComponent,
    StepIsomorphismComponent,
    StepKernelComponent,
    StepFirstIsoComponent,
    // Ch4
    StepSymmetricGroupComponent,
    StepCyclesComponent,
    StepTranspositionsComponent,
    StepSignComponent,
    StepAlternatingComponent,
    StepCayleyTheoremComponent,
    // Ch6 Sylow
    StepConjugacyComponent,
    StepClassEquationComponent,
    StepPGroupsComponent,
    StepSylow1Component,
    StepSylow23Component,
    StepClassificationComponent,
    // Ch7 Rings
    StepIntegersToRingsComponent,
    StepRingExamplesComponent,
    StepZeroDivisorsComponent,
    StepIdealsComponent,
    StepQuotientRingComponent,
    StepRingHomomorphismComponent,
    // Ch5
    StepActionComponent,
    StepOrbitsComponent,
    StepStabilizersComponent,
    StepOrbitStabilizerComponent,
    StepBurnsideComponent,
    StepNecklacesComponent,
    // Ch7
    StepWhatIsFieldComponent,
    StepFiniteFieldsComponent,
    StepPolynomialsComponent,
    StepIrreducibleComponent,
    StepFieldExtensionsComponent,
    StepGfComponent,
    // Ch8
    StepRootsExtensionsComponent,
    StepSplittingFieldComponent,
    StepAutomorphismsComponent,
    StepGaloisGroupComponent,
    StepCorrespondenceComponent,
    StepQuinticComponent,
    // Ch10 Rubik
    StepRubikGroupComponent,
    StepCommutatorsComponent,
    StepCubeStructureComponent,
    StepGodsNumberComponent,
    StepCubeSolveComponent,
    // Ch11 Representation
    StepWhatIsRepComponent,
    StepCharactersComponent,
    StepIrreducibleRepComponent,
    StepRepPhysicsComponent,
    StepFourierComponent,
    // Ch12 Algebraic Geometry
    StepVarietiesComponent,
    StepIdealVarietyComponent,
    StepNullstellensatzComponent,
    StepEllipticCurvesComponent,
    StepModernAgComponent,
  ],
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.scss',
})
export class ChapterComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly chapterParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('chapterId') ?? 'ch1')),
    { initialValue: 'ch1' },
  );

  private readonly stepParam = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('step')) || 1)),
    { initialValue: 1 },
  );

  readonly chapterId = computed(() => this.chapterParam());
  readonly config = computed(
    () => CHAPTERS[this.chapterId()] ?? CHAPTERS['ch1'],
  );
  readonly chapterTitle = computed(() => this.config().title);
  readonly steps = computed(() => this.config().steps);

  readonly currentStep = computed(() =>
    Math.max(1, Math.min(this.stepParam(), this.steps().length)),
  );

  readonly hasPrev = computed(() => this.currentStep() > 1);
  readonly hasNext = computed(() => this.currentStep() < this.steps().length);
  readonly prevStep = computed(() => this.currentStep() - 1);
  readonly nextStep = computed(() => this.currentStep() + 1);
}
