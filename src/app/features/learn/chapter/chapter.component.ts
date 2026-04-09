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

// Ch13 Coding Theory
import { StepNoisyChannelComponent } from './steps/ch13-coding/step-noisy-channel.component';
import { StepHammingDistanceComponent } from './steps/ch13-coding/step-hamming-distance.component';
import { StepLinearCodeComponent } from './steps/ch13-coding/step-linear-code.component';
import { StepHammingCodeComponent } from './steps/ch13-coding/step-hamming-code.component';
import { StepReedSolomonComponent } from './steps/ch13-coding/step-reed-solomon.component';

// Linalg Ch1 steps
import { StepWhatIsVectorComponent } from './steps/linalg-ch1/step-what-is-vector.component';
import { StepVectorOpsComponent } from './steps/linalg-ch1/step-vector-ops.component';
import { StepLinearComboComponent } from './steps/linalg-ch1/step-linear-combo.component';
import { StepSpanComponent } from './steps/linalg-ch1/step-span.component';
import { StepIndependenceComponent } from './steps/linalg-ch1/step-independence.component';
import { StepBasisComponent } from './steps/linalg-ch1/step-basis.component';

// Linalg Ch2 steps
import { StepWhatIsTransformComponent } from './steps/linalg-ch2/step-what-is-transform.component';
import { StepMatrixFingerprintComponent } from './steps/linalg-ch2/step-matrix-fingerprint.component';
import { StepMatrixVectorComponent } from './steps/linalg-ch2/step-matrix-vector.component';
import { StepCompositionComponent as StepLinalgCompositionComponent } from './steps/linalg-ch2/step-composition.component';
import { StepDeterminantComponent } from './steps/linalg-ch2/step-determinant.component';
import { StepInverseComponent } from './steps/linalg-ch2/step-inverse.component';

// Linalg Ch3 steps
import { StepDotProductComponent } from './steps/linalg-ch3/step-dot-product.component';
import { StepDotGeometryComponent } from './steps/linalg-ch3/step-dot-geometry.component';
import { StepProjectionComponent } from './steps/linalg-ch3/step-projection.component';
import { StepOrthogonalComponent } from './steps/linalg-ch3/step-orthogonal.component';
import { StepOrthonormalBasisComponent } from './steps/linalg-ch3/step-orthonormal-basis.component';
import { StepGramSchmidtComponent } from './steps/linalg-ch3/step-gram-schmidt.component';

// Linalg Ch4 steps
import { StepTwoLinesComponent } from './steps/linalg-ch4/step-two-lines.component';
import { StepMatrixFormComponent } from './steps/linalg-ch4/step-matrix-form.component';
import { StepEliminationComponent } from './steps/linalg-ch4/step-elimination.component';
import { StepWhenSolvableComponent } from './steps/linalg-ch4/step-when-solvable.component';
import { StepSolutionSpaceComponent } from './steps/linalg-ch4/step-solution-space.component';
import { StepApplicationsComponent } from './steps/linalg-ch4/step-applications.component';

// Linalg Ch6 (eigenvalues) steps
import { StepInvariantDirectionsComponent } from './steps/linalg-ch6-eigen/step-invariant-directions.component';
import { StepEigenDefinitionComponent } from './steps/linalg-ch6-eigen/step-eigen-definition.component';
import { StepCharacteristicComponent } from './steps/linalg-ch6-eigen/step-characteristic.component';
import { StepDiagonalizationComponent } from './steps/linalg-ch6-eigen/step-diagonalization.component';
import { StepMatrixPowersComponent } from './steps/linalg-ch6-eigen/step-matrix-powers.component';
import { StepMarkovComponent } from './steps/linalg-ch6-eigen/step-markov.component';
import { StepWhatIsSymmetricComponent } from './steps/linalg-ch7-symmetric/step-what-is-symmetric.component';
import { StepQuadraticFormComponent } from './steps/linalg-ch7-symmetric/step-quadratic-form.component';
import { StepSurfaceShapesComponent } from './steps/linalg-ch7-symmetric/step-surface-shapes.component';
import { StepOrthogonalEigenvectorsComponent } from './steps/linalg-ch7-symmetric/step-orthogonal-eigenvectors.component';
import { StepPrincipalAxesComponent } from './steps/linalg-ch7-symmetric/step-principal-axes.component';
import { StepPositiveDefiniteComponent } from './steps/linalg-ch7-symmetric/step-positive-definite-v2.component';

// Linalg Ch8 (SVD) steps
import { StepWhySvdComponent } from './steps/linalg-ch8-svd/step-why-svd.component';
import { StepSvdGeometryComponent } from './steps/linalg-ch8-svd/step-svd-geometry.component';
import { StepSvdSubspacesComponent } from './steps/linalg-ch8-svd/step-svd-subspaces.component';
import { StepLowRankComponent } from './steps/linalg-ch8-svd/step-low-rank.component';
import { StepImageCompressionComponent } from './steps/linalg-ch8-svd/step-image-compression.component';
import { StepPcaComponent } from './steps/linalg-ch8-svd/step-pca.component';

// Linalg Ch9 (linear ODEs) steps
import { Step1dOdeComponent } from './steps/linalg-ch9-ode/step-1d-ode.component';
import { StepVectorFieldComponent } from './steps/linalg-ch9-ode/step-vector-field.component';
import { StepEigenvalueSolutionComponent } from './steps/linalg-ch9-ode/step-eigenvalue-solution.component';
import { StepMatrixExpComponent } from './steps/linalg-ch9-ode/step-matrix-exp.component';
import { StepStabilityComponent } from './steps/linalg-ch9-ode/step-stability.component';
import { StepDampedOscillatorComponent } from './steps/linalg-ch9-ode/step-damped-oscillator.component';
import { StepLorenzComponent } from './steps/linalg-ch9-ode/step-lorenz.component';

// Linalg Ch10 (complex matrices & quantum) steps
import { StepWhyComplexComponent } from './steps/linalg-ch10-complex/step-why-complex.component';
import { StepComplexVectorsComponent } from './steps/linalg-ch10-complex/step-complex-vectors.component';
import { StepHermitianComponent } from './steps/linalg-ch10-complex/step-hermitian.component';
import { StepUnitaryComponent } from './steps/linalg-ch10-complex/step-unitary.component';
import { StepPauliComponent } from './steps/linalg-ch10-complex/step-pauli.component';
import { StepBlochSphereComponent } from './steps/linalg-ch10-complex/step-bloch-sphere.component';
import { StepQuantumGatesComponent } from './steps/linalg-ch10-complex/step-quantum-gates.component';
import { StepMeasurementComponent } from './steps/linalg-ch10-complex/step-measurement.component';

// Linalg Ch11 (abstract vector spaces) steps
import { StepAbstractVectorSpaceComponent } from './steps/linalg-ch11-abstract/step-abstract-vector-space.component';
import { StepPolynomialSpaceComponent } from './steps/linalg-ch11-abstract/step-polynomial-space.component';
import { StepBasisDimensionComponent } from './steps/linalg-ch11-abstract/step-basis-dimension.component';
import { StepLinearityComponent } from './steps/linalg-ch11-abstract/step-linearity.component';
import { StepDifferentialMatrixComponent } from './steps/linalg-ch11-abstract/step-differential-matrix.component';
import { StepFunctionSpaceComponent } from './steps/linalg-ch11-abstract/step-function-space.component';
import { StepFunctionsAsVectorsComponent } from './steps/linalg-ch11-abstract/step-functions-as-vectors.component';

// Linalg Ch12 (function spaces & Fourier) steps
import { StepFunctionInnerProductComponent } from './steps/linalg-ch12-fourier/step-function-inner-product.component';
import { StepOrthogonalFunctionsComponent } from './steps/linalg-ch12-fourier/step-orthogonal-functions.component';
import { StepProjectionComponent as StepFourierProjectionComponent } from './steps/linalg-ch12-fourier/step-projection.component';
import { StepLegendreComponent } from './steps/linalg-ch12-fourier/step-legendre.component';
import { StepFourierBasisComponent } from './steps/linalg-ch12-fourier/step-fourier-basis.component';
import { StepFourierSeriesComponent } from './steps/linalg-ch12-fourier/step-fourier-series.component';
import { StepGibbsComponent } from './steps/linalg-ch12-fourier/step-gibbs.component';

// Linalg Ch13 (linear algebra & ML) steps
import { StepLinearRegressionComponent } from './steps/linalg-ch13-ml/step-linear-regression.component';
import { StepPolynomialFitComponent } from './steps/linalg-ch13-ml/step-polynomial-fit.component';
import { StepRidgeComponent } from './steps/linalg-ch13-ml/step-ridge.component';
import { StepLogisticComponent } from './steps/linalg-ch13-ml/step-logistic.component';
import { StepNeuralNetComponent } from './steps/linalg-ch13-ml/step-neural-net.component';
import { StepConvolutionComponent } from './steps/linalg-ch13-ml/step-convolution.component';
import { StepBackpropComponent } from './steps/linalg-ch13-ml/step-backprop.component';
import { StepMatrixFactorizationComponent } from './steps/linalg-ch13-ml/step-matrix-factorization.component';

// Linalg Ch14 (graphs & networks) steps
import { StepGraphMatrixComponent } from './steps/linalg-ch14-graph/step-graph-matrix.component';
import { StepIncidenceComponent as StepGraphIncidenceComponent } from './steps/linalg-ch14-graph/step-incidence.component';
import { StepLaplacianComponent } from './steps/linalg-ch14-graph/step-laplacian.component';
import { StepFiedlerComponent } from './steps/linalg-ch14-graph/step-fiedler.component';
import { StepSpectralClusteringComponent } from './steps/linalg-ch14-graph/step-spectral-clustering.component';
import { StepPagerankComponent } from './steps/linalg-ch14-graph/step-pagerank.component';
import { StepRandomWalkComponent } from './steps/linalg-ch14-graph/step-random-walk.component';

// Linalg Ch15 (numerical linear algebra) steps
import { StepFloatingPointComponent } from './steps/linalg-ch15-numerical/step-floating-point.component';
import { StepConditionNumberComponent } from './steps/linalg-ch15-numerical/step-condition-number.component';
import { StepLuDecompositionComponent } from './steps/linalg-ch15-numerical/step-lu-decomposition.component';
import { StepPivotingComponent } from './steps/linalg-ch15-numerical/step-pivoting.component';
import { StepQrDecompositionComponent } from './steps/linalg-ch15-numerical/step-qr-decomposition.component';
import { StepIterativeMethodsComponent } from './steps/linalg-ch15-numerical/step-iterative-methods.component';
import { StepConjugateGradientComponent } from './steps/linalg-ch15-numerical/step-conjugate-gradient.component';

// Linalg Ch5 (four subspaces) steps
import { StepSubspaceComponent } from './steps/linalg-ch5/step-subspace.component';
import { StepColumnSpaceComponent } from './steps/linalg-ch5/step-column-space.component';
import { StepNullSpaceComponent } from './steps/linalg-ch5/step-null-space.component';
import { StepRankComponent } from './steps/linalg-ch5/step-rank.component';
import { StepFourSubspacesComponent } from './steps/linalg-ch5/step-four-subspaces.component';
import { StepFundamentalThmComponent } from './steps/linalg-ch5/step-fundamental-thm.component';

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

const ALGEBRA_CHAPTERS: Record<string, ChapterConfig> = {
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
  ch13: {
    title: '專題：編碼理論',
    steps: [
      { num: 1, title: '為什麼需要糾錯碼' },
      { num: 2, title: '漢明距離' },
      { num: 3, title: '線性碼' },
      { num: 4, title: '漢明碼' },
      { num: 5, title: 'Reed-Solomon' },
    ],
  },
};

const LINALG_CHAPTERS: Record<string, ChapterConfig> = {
  ch1: {
    title: '第一章：向量與線性組合',
    steps: [
      { num: 1, title: '什麼是向量' },
      { num: 2, title: '加法與純量乘法' },
      { num: 3, title: '線性組合' },
      { num: 4, title: 'Span' },
      { num: 5, title: '相依與獨立' },
      { num: 6, title: '基底' },
    ],
  },
  ch2: {
    title: '第二章：線性變換與矩陣',
    steps: [
      { num: 1, title: '什麼是線性變換' },
      { num: 2, title: '矩陣的指紋' },
      { num: 3, title: '矩陣 × 向量' },
      { num: 4, title: '變換組合' },
      { num: 5, title: '行列式' },
      { num: 6, title: '反矩陣' },
    ],
  },
  ch3: {
    title: '第三章：點積、長度與正交',
    steps: [
      { num: 1, title: '什麼是點積' },
      { num: 2, title: '幾何意義' },
      { num: 3, title: '投影' },
      { num: 4, title: '正交向量' },
      { num: 5, title: '正交基底' },
      { num: 6, title: 'Gram\u2013Schmidt' },
    ],
  },
  ch4: {
    title: '第四章：解線性方程組',
    steps: [
      { num: 1, title: '兩條直線的交點' },
      { num: 2, title: '矩陣形式 Ax = b' },
      { num: 3, title: '高斯消去法' },
      { num: 4, title: '何時有解' },
      { num: 5, title: '解空間' },
      { num: 6, title: '插值與最小平方' },
    ],
  },
  ch5: {
    title: '第五章：矩陣的四個基本子空間',
    steps: [
      { num: 1, title: '什麼是子空間' },
      { num: 2, title: '列空間 C(A)' },
      { num: 3, title: '零空間 N(A)' },
      { num: 4, title: '秩 Rank' },
      { num: 5, title: '四個子空間' },
      { num: 6, title: '正交補與基本定理' },
    ],
  },
  ch6: {
    title: '第六章：特徵值與特徵向量',
    steps: [
      { num: 1, title: '不變的方向' },
      { num: 2, title: '特徵向量定義' },
      { num: 3, title: '特徵方程' },
      { num: 4, title: '對角化' },
      { num: 5, title: '矩陣冪次' },
      { num: 6, title: '馬可夫鏈' },
    ],
  },
  ch7: {
    title: '第七章：對稱矩陣、二次型與主軸',
    steps: [
      { num: 1, title: '什麼是對稱矩陣' },
      { num: 2, title: '二次型 xᵀAx' },
      { num: 3, title: '曲面：bowl 與 saddle' },
      { num: 4, title: '正交的特徵方向' },
      { num: 5, title: '主軸定理' },
      { num: 6, title: '正定矩陣' },
    ],
  },
  ch8: {
    title: '第八章：SVD 與其應用',
    steps: [
      { num: 1, title: '為什麼需要 SVD' },
      { num: 2, title: '幾何：旋轉縮放旋轉' },
      { num: 3, title: 'SVD 與四個子空間' },
      { num: 4, title: '低秩近似' },
      { num: 5, title: '圖片壓縮' },
      { num: 6, title: 'PCA' },
    ],
  },
  ch9: {
    title: '第九章：線性微分方程組與動力系統',
    steps: [
      { num: 1, title: '從 1D 純量 ODE' },
      { num: 2, title: '2D 向量場與相平面' },
      { num: 3, title: '用特徵值解 ODE' },
      { num: 4, title: '矩陣指數 e^(At)' },
      { num: 5, title: '四種平衡點分類' },
      { num: 6, title: '阻尼振盪器' },
      { num: 7, title: '勞侖茲吸引子' },
    ],
  },
  ch10: {
    title: '第十章：複矩陣與量子的觀點',
    steps: [
      { num: 1, title: '為什麼需要複數' },
      { num: 2, title: '複向量與 Hermitian 內積' },
      { num: 3, title: 'Hermitian 矩陣' },
      { num: 4, title: 'Unitary 矩陣' },
      { num: 5, title: 'Pauli 矩陣' },
      { num: 6, title: 'Bloch 球面' },
      { num: 7, title: '量子閘 = Bloch 旋轉' },
      { num: 8, title: '量子測量' },
    ],
  },
  ch11: {
    title: '第十一章：抽象向量空間與線性算子',
    steps: [
      { num: 1, title: '向量是規則，不是長相' },
      { num: 2, title: '多項式空間 P₃' },
      { num: 3, title: '基底與維度' },
      { num: 4, title: '什麼叫線性算子' },
      { num: 5, title: '微分的矩陣表示' },
      { num: 6, title: '函數空間與無限維' },
      { num: 7, title: '函數也能相加與縮放' },
    ],
  },
  ch12: {
    title: '第十二章：函數空間、正交與傅立葉',
    steps: [
      { num: 1, title: '函數的內積' },
      { num: 2, title: '正交函數' },
      { num: 3, title: '正交基底與投影' },
      { num: 4, title: 'Legendre 多項式' },
      { num: 5, title: 'Fourier 基底' },
      { num: 6, title: 'Fourier 級數' },
      { num: 7, title: 'Gibbs 現象' },
    ],
  },
  ch13: {
    title: '第十三章：線性代數與機器學習',
    steps: [
      { num: 1, title: '線性回歸' },
      { num: 2, title: '多項式擬合' },
      { num: 3, title: '嶺回歸' },
      { num: 4, title: 'Logistic 回歸' },
      { num: 5, title: '神經網路' },
      { num: 6, title: '卷積層' },
      { num: 7, title: '反向傳播' },
      { num: 8, title: '矩陣分解' },
    ],
  },
  ch14: {
    title: '第十四章：圖與網路的線性代數',
    steps: [
      { num: 1, title: '圖的矩陣' },
      { num: 2, title: '關聯矩陣與流' },
      { num: 3, title: '圖拉普拉斯' },
      { num: 4, title: 'Fiedler 值' },
      { num: 5, title: '譜聚類' },
      { num: 6, title: 'PageRank' },
      { num: 7, title: '隨機漫步' },
    ],
  },
  ch15: {
    title: '第十五章：數值線性代數',
    steps: [
      { num: 1, title: '浮點數與誤差' },
      { num: 2, title: '條件數' },
      { num: 3, title: 'LU 分解' },
      { num: 4, title: '樞軸選取' },
      { num: 5, title: 'QR 分解' },
      { num: 6, title: '迭代法' },
      { num: 7, title: '共軛梯度法' },
    ],
  },
};

const SUBJECTS: Record<string, Record<string, ChapterConfig>> = {
  algebra: ALGEBRA_CHAPTERS,
  linalg: LINALG_CHAPTERS,
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
    // Ch13 Coding Theory
    StepNoisyChannelComponent,
    StepHammingDistanceComponent,
    StepLinearCodeComponent,
    StepHammingCodeComponent,
    StepReedSolomonComponent,
    // Linalg Ch1
    StepWhatIsVectorComponent,
    StepVectorOpsComponent,
    StepLinearComboComponent,
    StepSpanComponent,
    StepIndependenceComponent,
    StepBasisComponent,
    // Linalg Ch2
    StepWhatIsTransformComponent,
    StepMatrixFingerprintComponent,
    StepMatrixVectorComponent,
    StepLinalgCompositionComponent,
    StepDeterminantComponent,
    StepInverseComponent,
    // Linalg Ch3
    StepDotProductComponent,
    StepDotGeometryComponent,
    StepProjectionComponent,
    StepOrthogonalComponent,
    StepOrthonormalBasisComponent,
    StepGramSchmidtComponent,
    // Linalg Ch4
    StepTwoLinesComponent,
    StepMatrixFormComponent,
    StepEliminationComponent,
    StepWhenSolvableComponent,
    StepSolutionSpaceComponent,
    StepApplicationsComponent,
    // Linalg Ch5 (four subspaces)
    StepSubspaceComponent,
    StepColumnSpaceComponent,
    StepNullSpaceComponent,
    StepRankComponent,
    StepFourSubspacesComponent,
    StepFundamentalThmComponent,
    // Linalg Ch6 (eigenvalues)
    StepInvariantDirectionsComponent,
    StepEigenDefinitionComponent,
    StepCharacteristicComponent,
    StepDiagonalizationComponent,
    StepMatrixPowersComponent,
    StepMarkovComponent,
    StepWhatIsSymmetricComponent,
    StepQuadraticFormComponent,
    StepSurfaceShapesComponent,
    StepOrthogonalEigenvectorsComponent,
    StepPrincipalAxesComponent,
    StepPositiveDefiniteComponent,
    // Linalg Ch8 (SVD)
    StepWhySvdComponent,
    StepSvdGeometryComponent,
    StepSvdSubspacesComponent,
    StepLowRankComponent,
    StepImageCompressionComponent,
    StepPcaComponent,
    // Linalg Ch9 (linear ODEs)
    Step1dOdeComponent,
    StepVectorFieldComponent,
    StepEigenvalueSolutionComponent,
    StepMatrixExpComponent,
    StepStabilityComponent,
    StepDampedOscillatorComponent,
    StepLorenzComponent,
    // Linalg Ch10 (complex & quantum)
    StepWhyComplexComponent,
    StepComplexVectorsComponent,
    StepHermitianComponent,
    StepUnitaryComponent,
    StepPauliComponent,
    StepBlochSphereComponent,
    StepQuantumGatesComponent,
    StepMeasurementComponent,
    // Linalg Ch11 (abstract vector spaces)
    StepAbstractVectorSpaceComponent,
    StepPolynomialSpaceComponent,
    StepBasisDimensionComponent,
    StepLinearityComponent,
    StepDifferentialMatrixComponent,
    StepFunctionSpaceComponent,
    StepFunctionsAsVectorsComponent,
    // Linalg Ch12 (function spaces & Fourier)
    StepFunctionInnerProductComponent,
    StepOrthogonalFunctionsComponent,
    StepFourierProjectionComponent,
    StepLegendreComponent,
    StepFourierBasisComponent,
    StepFourierSeriesComponent,
    StepGibbsComponent,
    // Linalg Ch13 (ML)
    StepLinearRegressionComponent,
    StepPolynomialFitComponent,
    StepRidgeComponent,
    StepLogisticComponent,
    StepNeuralNetComponent,
    StepConvolutionComponent,
    StepBackpropComponent,
    StepMatrixFactorizationComponent,
    // Linalg Ch14 (graphs)
    StepGraphMatrixComponent,
    StepGraphIncidenceComponent,
    StepLaplacianComponent,
    StepFiedlerComponent,
    StepSpectralClusteringComponent,
    StepPagerankComponent,
    StepRandomWalkComponent,
    // Linalg Ch15 (numerical)
    StepFloatingPointComponent,
    StepConditionNumberComponent,
    StepLuDecompositionComponent,
    StepPivotingComponent,
    StepQrDecompositionComponent,
    StepIterativeMethodsComponent,
    StepConjugateGradientComponent,
  ],
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.scss',
})
export class ChapterComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly subjectParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('subject') ?? 'algebra')),
    { initialValue: 'algebra' },
  );

  private readonly chapterParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('chapterId') ?? 'ch1')),
    { initialValue: 'ch1' },
  );

  private readonly stepParam = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('step')) || 1)),
    { initialValue: 1 },
  );

  readonly subject = computed(() => this.subjectParam());
  readonly chapterId = computed(() => this.chapterParam());
  readonly config = computed(() => {
    const chapters = SUBJECTS[this.subject()] ?? SUBJECTS['algebra'];
    return chapters[this.chapterId()] ?? chapters['ch1'];
  });
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
