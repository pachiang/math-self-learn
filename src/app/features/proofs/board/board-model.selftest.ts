/**
 * Self-test for the board model (the project has no test runner). Run with:
 *   npx esbuild src/app/features/proofs/board/board-model.selftest.ts --bundle --platform=node --log-level=warning | node
 */
import { parseExpr } from '../ch2/ch2-expr';
import {
  BoardState,
  EVEN_SUM,
  EVEN_SUM_FULL,
  EVEN_SUM_GIVENS,
  EVEN_SUM_OPENING,
  Move,
  ODD_SQUARE,
  applyMove,
  DIV_CHAIN,
  DIV_CHAIN_BY_HAND,
  DIV_SUM_FALSE,
  DIV_SUM_FIXED,
  DIV_TRANS,
  DIV_TRANS_OPENING,
  EVEN_SQ,
  EVEN_SQ_DIRECT,
  EVEN_SQ_CONTRAPOS,
  EVEN_SQ_BY_CONTRA,
  EVEN_SQ_CONTRA,
  NO_SOLUTION_MOVES,
  noSolution,
  findClash,
  lemmaUses,
  defsFor,
  lemmaPairs,
  bridgeOf,
  divides,
  eqn,
  even,
  exists,
  firstCard,
  forall,
  forwardText,
  givensFor,
  imp,
  odd,
  replay,
  startBoard,
  stmtText,
  SQ_PLUS_N,
  SQ_PLUS_N_MOVES,
  CONSEC_EVEN,
  CONSEC_EVEN_MOVES,
  PROD_EVEN,
  PROD_EVEN_MOVES,
  TRIPLE,
  TRIPLE_MOVES,
  or,
} from './board-model';
import { fmtExpr, fmtPoly, toPoly } from './poly';

let fails = 0;
const ok = (cond: boolean, what: string) => {
  if (!cond) {
    fails++;
    console.error('FAIL', what);
  }
};
const eqS = (a: unknown, b: unknown, what: string) => ok(a === b, `${what}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);
const step = (st: BoardState, mv: Move) => applyMove(st, mv);

// poly + printing
const P = (s: string) => {
  const p = parseExpr(s, 'abcdefghijklmnopqrstuvwxyz'.split(''));
  if (!p.ok) throw new Error(p.msg);
  return p.node;
};
const poly = (s: string) => {
  const r = toPoly(P(s));
  if (!r.ok) throw new Error('not poly');
  return fmtPoly(r.p);
};
eqS(poly('(2k+1)^2'), '4k² + 4k + 1', 'square');
eqS(poly('2(k+l)'), '2k + 2l', 'distribute');
eqS(poly('a - a'), '0', 'cancel');
eqS(poly('-3k + 2'), '−3k + 2', 'negative lead');
eqS(fmtExpr(P('2*(k+l)')), '2(k + l)', 'juxtapose bracket');
eqS(fmtExpr(P('2m+1')), '2m + 1', 'odd form');
eqS(fmtExpr(P('n^2')), 'n²', 'power');
eqS(fmtExpr(P('a-(b+c)')), 'a − (b + c)', 'minus bracket');
ok(!toPoly(P('(a+b)/2')).ok, 'division rejected');

// statements
eqS(stmtText(EVEN_SUM.goal), '對每個整數 a、b，若 a 是偶數而且 b 是偶數，則 a + b 是偶數', 'even-sum text');
eqS(firstCard(exists('x', eqn('3x', '-12'))), 'witness', 'drill exists');
eqS(firstCard(odd('-7')), 'unfoldGoal', 'drill pred');
eqS(firstCard(forall(['n'], even('n^2 + n'))), 'intro', 'drill trap');
eqS(firstCard(imp(even('x'), even('x + 6'))), 'assume', 'drill imp');
eqS(firstCard(divides('3', 'n')), 'unfoldGoal', 'drill divides');

// full even-sum script
const done = replay(EVEN_SUM, EVEN_SUM_FULL);
eqS(done.goal, null, 'even-sum closes');
eqS(done.log.length, 10, 'even-sum ten moves');
eqS(done.log.filter((e) => e.tag === 'idea').length, 1, 'one idea step');
eqS(done.objs.map((o) => `${o.name}:${o.kind}`).join(' '), 'a:arb b:arb k:got l:got m:chosen', 'identities');

// wrong card on the opening
let st = startBoard(EVEN_SUM);
let r = step(st, { card: 'unfoldGoal' });
ok(!r.ok && r.code === 'shape' && r.msg.includes('包在裡面'), 'unfold before intro is a shape error');
r = step(st, { card: 'assume' });
ok(!r.ok && r.msg.includes('「對每個」'), 'assume before intro names the outer layer');

// after the opening, the goal is an exists
st = replay(EVEN_SUM, EVEN_SUM_OPENING);
eqS(stmtText(st.goal!), '存在整數 m，使 a + b = 2m', 'opening ends at exists');
r = step(st, { card: 'witness', src: 'a' });
ok(!r.ok && r.code === 'early', 'witness before unpacking givens is blocked');

// name clash on the second obtain
st = replay(EVEN_SUM, [...EVEN_SUM_OPENING, ...EVEN_SUM_GIVENS.slice(0, 4)]);
eqS(givensFor(st, 'obtain').join(), 'H6', 'only H6 to obtain');
r = step(st, { card: 'obtain', h: 'H6', name: 'k' });
ok(!r.ok && r.code === 'clash' && r.msg.includes('b = 2k'), 'reusing k is a clash and shows b = 2k');
r = step(st, { card: 'obtain', h: 'H6', name: 'm' });
ok(!r.ok && r.code === 'clash', 'm is reserved by the goal');
r = step(st, { card: 'obtain', h: 'H6', name: 'a' });
ok(!r.ok && r.code === 'clash', 'a is the opponent');
r = step(st, { card: 'obtain', h: 'H6', name: '7' });
ok(!r.ok && r.code === 'name', 'name must be a letter');

// witnesses
st = replay(EVEN_SUM, [...EVEN_SUM_OPENING, ...EVEN_SUM_GIVENS]);
eqS(forwardText(st, P('a + b')), '2k + 2l', 'bridge forward row');
r = step(st, { card: 'witness', src: '(a+b)/2' });
ok(!r.ok && r.code === 'div', 'division witness rejected');
r = step(st, { card: 'witness', src: 'm' });
ok(!r.ok && r.code === 'parse', 'bound m rejected');
r = step(st, { card: 'witness', src: 'k + l + 1' });
ok(r.ok, 'wrong witness still accepted as a move');
if (r.ok) {
  eqS(stmtText(r.state.goal!), 'a + b = 2(k + l + 1)', 'substituted goal');
  const c = step(r.state, { card: 'check' });
  ok(!c.ok && c.code === 'neq' && c.msg.includes('2k + 2l + 2'), 'wrong witness fails the check');
}
r = step(st, { card: 'witness', src: 'a + b - k - l' });
ok(r.ok && step(r.state, { card: 'check' }).ok, 'any correct polynomial witness passes');

// odd square, learner-style order
const odd2: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'unfold', h: 'H1' },
  { card: 'obtain', h: 'H2', name: 'k' },
  { card: 'unfoldGoal' },
];
st = replay(ODD_SQUARE, odd2);
eqS(stmtText(st.goal!), '存在整數 m，使 n² = 2m + 1', 'odd goal');
eqS(forwardText(st, P('n^2')), '4k² + 4k + 1', 'odd bridge');
eqS(bridgeOf(st)?.back, '2 × □ + 1', 'odd bridge back row');
r = step(st, { card: 'witness', src: '2k^2+2k' });
ok(r.ok, 'odd witness');
if (r.ok) {
  eqS(stmtText(r.state.goal!), 'n² = 2(2k² + 2k) + 1', 'odd substituted');
  const c = step(r.state, { card: 'check' });
  ok(c.ok && c.state.goal === null, 'odd closes');
  if (c.ok) eqS(c.state.log.filter((e) => e.tag === 'idea').length, 1, 'odd one idea');
}

// ── chapter 7 ──
eqS(fmtExpr(P('a*k*l')), 'akl', 'letters juxtapose');
eqS(fmtExpr(P('a*(k-l)')), 'a(k − l)', 'letter bracket');
st = replay(DIV_TRANS, DIV_TRANS_OPENING);
eqS(stmtText(st.goal!), '存在整數 m，使 c = am', 'trans goal');
eqS(stmtText(DIV_TRANS.goal), '對每個整數 a、b、c，若 a ∣ b 而且 b ∣ c，則 a ∣ c', 'trans text spacing');
const dc = defsFor(st, 'c');
eqS(dc.map((d) => `${d.h}:${fmtExpr(d.node)}`).join(), 'H7:bl', 'c defined by H7');
eqS(defsFor(st, 'b').map((d) => fmtExpr(d.node)).join(), 'ak', 'b defined by H5');
r = step(st, { card: 'witness', src: '20' });
ok(r.ok, 'constant witness accepted as move');
if (r.ok) {
  const c = step(r.state, { card: 'check' });
  ok(!c.ok && c.msg.includes('固定的數'), 'constant witness explained');
}
r = step(st, { card: 'witness', src: 'kl' });
ok(r.ok && step(r.state, { card: 'check' }).ok, 'trans closes with kl');

const falseOpen: Move[] = [{ card: 'intro' }, { card: 'assume' }, { card: 'unfold', h: 'H1' }, { card: 'obtain', h: 'H2', name: 'k' }, { card: 'unfoldGoal' }];
st = replay(DIV_SUM_FALSE, falseOpen);
eqS(stmtText(st.hyps[2].s), 'b + c = ak', 'false claim given');
eqS(defsFor(st, 'b').map((d) => `${fmtExpr(d.node)}:${d.solved}`).join(), 'ak − c:true', 'solve b from b + c = ak');
r = step(st, { card: 'witness', src: 'k' });
ok(r.ok && !step(r.state, { card: 'check' }).ok, 'false claim: k fails');

const fixedMoves: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'split', h: 'H1' },
  { card: 'unfold', h: 'H2' },
  { card: 'obtain', h: 'H4', name: 'k' },
  { card: 'unfold', h: 'H3' },
  { card: 'obtain', h: 'H6', name: 'l' },
  { card: 'unfoldGoal' },
  { card: 'witness', src: 'k - l' },
  { card: 'check' },
];
eqS(replay(DIV_SUM_FIXED, fixedMoves).goal, null, 'fixed claim closes with k − l');

const hand = replay(DIV_CHAIN, DIV_CHAIN_BY_HAND);
eqS(hand.goal, null, 'chain by hand closes');
eqS(hand.objs.length, 8, 'chain by hand: eight letters');
st = replay(DIV_CHAIN, [{ card: 'intro' }, { card: 'assume' }, { card: 'split', h: 'H1' }, { card: 'split', h: 'H2' }]);
eqS(lemmaPairs(st).map((p) => `${p.h1}${p.h2}`).join(), 'H4H5,H5H3', 'two lemma pairs at first');
r = step(st, { card: 'lemma', hs: ['H4', 'H5'] });
ok(r.ok, 'lemma once');
if (r.ok) {
  eqS(stmtText(r.state.hyps[r.state.hyps.length - 1].s), 'a ∣ c', 'lemma gives a ∣ c');
  ok(!step(r.state, { card: 'exact' }).ok, 'exact not yet');
  const r2 = step(r.state, { card: 'lemma', hs: ['H6', 'H3'] });
  ok(r2.ok && step(r2.state, { card: 'exact' }).ok, 'lemma twice then exact');
  if (r2.ok) eqS(r2.state.objs.length, 4, 'four letters with the lemma');
}

// ── chapter 8 ──
st = replay(EVEN_SQ, EVEN_SQ_DIRECT);
eqS(stmtText(st.goal!), '存在整數 m，使 n = 2m', 'direct goal');
eqS(defsFor(st, 'n').length, 0, 'direct: nothing to substitute for n');
r = step(st, { card: 'witness', src: 'k' });
ok(r.ok && !step(r.state, { card: 'check' }).ok, 'direct: k fails');

st = replay(EVEN_SQ, [{ card: 'intro' }, { card: 'assume' }]);
r = step(st, { card: 'contrapos' });
ok(!r.ok && r.code === 'shape', 'contrapos after assume is a shape error');
st = replay(EVEN_SQ, [{ card: 'intro' }, { card: 'contrapos' }]);
eqS(stmtText(st.goal!), '若 n 不是偶數，則 n² 不是偶數', 'contrapositive text');
eqS(st.log[1].tag, 'idea', 'contrapos is a choice');
st = replay(EVEN_SQ, EVEN_SQ_CONTRAPOS.slice(0, 3));
r = step(st, { card: 'unfold', h: 'H1' });
ok(!r.ok, 'cannot unfold 不是偶數');
r = step(st, { card: 'unfoldGoal' });
ok(!r.ok && r.msg.includes('換正面'), 'unfold goal 不是偶數 points to flip');
r = step(st, { card: 'witness', src: '1' });
ok(!r.ok && (r.code === 'shape'), 'witness on not-goal is shape');
st = replay(EVEN_SQ, EVEN_SQ_CONTRAPOS.slice(0, 8));
eqS(stmtText(st.goal!), '存在整數 m，使 n² = 2m + 1', 'after flips the goal is odd-square');
eqS(defsFor(st, 'n').map((d) => fmtExpr(d.node)).join(), '2k + 1', 'now n has an equation');
const cp = replay(EVEN_SQ, EVEN_SQ_CONTRAPOS);
eqS(cp.goal, null, 'contrapositive closes');
eqS(cp.log.filter((e) => e.tag === 'idea').length, 2, 'contrapos: two idea steps');

const cc = replay(EVEN_SQ_BY_CONTRA, EVEN_SQ_CONTRA);
eqS(cc.goal, null, 'contradiction closes');
ok(!!cc.note && cc.note.includes('n² 是偶數'), 'clash note names n²: ' + cc.note);
st = replay(EVEN_SQ_BY_CONTRA, EVEN_SQ_CONTRA.slice(0, 4));
eqS(lemmaUses(st).map((u) => stmtText(u.out)).join(), 'n² 是奇數', 'odd-square lemma applies');
r = step(st, { card: 'clash' });
ok(!r.ok, 'no clash before the lemma');
// contradiction by unfolding instead of the lemma
const cu = replay(EVEN_SQ_BY_CONTRA, [
  ...EVEN_SQ_CONTRA.slice(0, 4),
  { card: 'unfold', h: 'H1' },
  { card: 'obtain', h: 'H4', name: 'k' },
  { card: 'unfold', h: 'H3' },
  { card: 'obtain', h: 'H6', name: 'l' },
]);
const fc = findClash(cu);
ok(!!fc && fc.text.includes('2(2l² + 2l) + 1'), 'parity clash by unfolding: ' + fc?.text);

st = startBoard(noSolution(1));
eqS(stmtText(st.goal!), '不存在整數 a、b，使 4a + 6b = 1', 'no-solution text');
r = step(st, { card: 'clash' });
ok(!r.ok && r.code === 'shape', 'clash needs contra first');
const ns = replay(noSolution(1), NO_SOLUTION_MOVES);
eqS(ns.goal, null, 'no-solution closes');
ok(!!ns.note && ns.note.includes('2(2a + 3b)'), 'no-solution note: ' + ns.note);
st = replay(noSolution(2), NO_SOLUTION_MOVES.slice(0, 3));
ok(!step(st, { card: 'clash' }).ok, '4a + 6b = 2 has no clash');
st = replay(noSolution(-3), NO_SOLUTION_MOVES.slice(0, 1));
eqS(stmtText(st.hyps[0].s), '存在整數 a、b，使 4a + 6b = −3', 'contra drops the double negation');

// ── chapter 9: cases ──
eqS(stmtText(CONSEC_EVEN.goal), '對每個整數 n，n 是偶數或 n + 1 是偶數', 'or nested text');
st = replay(CONSEC_EVEN, [{ card: 'intro' }]);
eqS(stmtText(st.goal!), 'n 是偶數，或 n + 1 是偶數', 'or top-level text');
eqS(stmtText(PROD_EVEN.goal), '對每個整數 a、b，若 a 是偶數或 b 是偶數，則 ab 是偶數', 'or inside if');
r = step(st, { card: 'unfoldGoal' });
ok(!r.ok && r.code === 'shape' && r.msg.includes('不能先挑一邊'), 'unfold an or-goal is refused: ' + (!r.ok && r.msg));
r = step(startBoard(CONSEC_EVEN), { card: 'exclude', side: 'left' });
ok(!r.ok && r.code === 'shape' && r.msg.includes('先令任意'), 'exclude under forall says intro first');
r = step(startBoard(SQ_PLUS_N), { card: 'rem', v: 'n', d: 2 });
ok(!r.ok && r.code === 'none', 'rem before intro is refused');

// 9.2: two cases, the second resumes from its own copy with the same id
st = replay(SQ_PLUS_N, SQ_PLUS_N_MOVES.slice(0, 2));
eqS(st.tabs.map((t) => `${t.id}:${t.label}:${t.status}`).join('|'), '1:n 是偶數:active|2:n 是奇數:waiting', 'rem tabs');
eqS(stmtText(st.hyps[0].s), 'n 是偶數', 'case 1 given is H1');
r = step(replay(SQ_PLUS_N, SQ_PLUS_N_MOVES.slice(0, 2)), { card: 'witness', src: 'n' });
ok(!r.ok && r.code === 'shape', 'goal in a case is still even, not exists');
st = replay(SQ_PLUS_N, SQ_PLUS_N_MOVES.slice(0, 7));
eqS(st.tab, '2', 'after case 1 closes, case 2 is active');
eqS(stmtText(st.goal!), 'n² + n 是偶數', 'case 2 starts from the original goal');
eqS(st.hyps.map((h) => `${h.id} ${stmtText(h.s)}`).join(), 'H1 n 是奇數', 'case 2 has only its own given');
eqS(st.objs.map((o) => o.name).join(), 'n', 'case 2 does not inherit k');
ok(st.log[st.log.length - 1].kind === 'case' && st.log[st.log.length - 1].text.includes('換情況 2'), 'switch line in the log');
eqS(st.tabs[0].status, 'done', 'case 1 tab done');
ok(!!st.tabs[0].closing && st.tabs[0].closing.includes('4k² + 2k'), 'case 1 closing kept: ' + st.tabs[0].closing);
const sq = replay(SQ_PLUS_N, SQ_PLUS_N_MOVES);
eqS(sq.goal, null, 'n² + n closes after both cases');
eqS(sq.tabs.every((t) => t.status === 'done'), true, 'every tab done');
eqS(sq.log.filter((e) => e.tab === '1').length, 5, 'five steps inside case 1');
eqS(sq.past.map((p) => stmtText(p)).join(' | '), '對每個整數 n，n² + n 是偶數 | n² + n 是偶數', 'done shows the goal stack from before the split');
r = step(sq, { card: 'intro' });
ok(!r.ok && r.code === 'done', 'nothing left after the last case');

// 9.3: exclude either side
eqS(replay(CONSEC_EVEN, CONSEC_EVEN_MOVES).goal, null, 'exclude left closes');
const right = replay(CONSEC_EVEN, [
  { card: 'intro' },
  { card: 'exclude', side: 'right' },
  { card: 'flip', h: 'H1' },
  { card: 'unfold', h: 'H2' },
  { card: 'obtain', h: 'H3', name: 'k' },
  { card: 'unfoldGoal' },
  { card: 'witness', src: 'k' },
  { card: 'check' },
]);
eqS(right.goal, null, 'exclude right closes (n = 2k from n + 1 = 2k + 1)');
st = replay(CONSEC_EVEN, CONSEC_EVEN_MOVES.slice(0, 2));
eqS(stmtText(st.hyps[0].s), 'n 不是偶數', 'excluded side becomes a not-given');
// or-goal inside a case closes with exact
st = replay(CONSEC_EVEN, [{ card: 'intro' }, { card: 'rem', v: 'n', d: 2 }, { card: 'exact' }]);
eqS(st.tab, '2', 'exact on one side of an or closes case 1');
ok(st.log.some((e) => e.text.includes('「或」成立')), 'exact or log');

// 9.4: same ids in both cases, letters swapped
const pe = replay(PROD_EVEN, PROD_EVEN_MOVES);
eqS(pe.goal, null, 'ab even closes');
const c1 = pe.log.filter((e) => e.tab === '1').map((e) => e.text);
const c2 = pe.log.filter((e) => e.tab === '2').map((e) => e.text);
eqS(c1.length, c2.length, 'cases have the same length');
ok(c1[1].includes('a = 2k') && c2[1].includes('b = 2k'), 'case logs swap a and b: ' + c1[1] + ' / ' + c2[1]);
st = replay(PROD_EVEN, PROD_EVEN_MOVES.slice(0, 2));
ok(!step(st, { card: 'witness', src: 'a' }).ok, 'witness before splitting the or is early or shape');
r = step(replay(PROD_EVEN, PROD_EVEN_MOVES.slice(0, 1)), { card: 'cases', h: 'H1' });
ok(!r.ok && r.code === 'none', 'cases needs an or-given');

// 9.5: three cases close; the split by 2 covers but gives no witness
const tr = replay(TRIPLE, TRIPLE_MOVES);
eqS(tr.goal, null, 'n(n + 1)(n + 2) closes in three cases');
eqS(tr.tabs.map((t) => t.label).join('|'), 'n 除以 3 餘 0|n 除以 3 餘 1|n 除以 3 餘 2', 'mod 3 labels');
st = replay(TRIPLE, [{ card: 'intro' }, { card: 'rem', v: 'n', d: 3 }]);
eqS(stmtText(st.hyps[0].s), '存在整數 k，使 n = 3k', 'mod 3 case 1 given');
st = replay(TRIPLE, [{ card: 'intro' }, { card: 'rem', v: 'n', d: 2 }, { card: 'unfold', h: 'H1' }, { card: 'obtain', h: 'H2', name: 'k' }, { card: 'unfoldGoal' }]);
r = step(st, { card: 'witness', src: '2k' });
ok(r.ok && !step(r.state, { card: 'check' }).ok, 'split by 2: a guessed witness fails the check');
// nested split: case 1 splits again, its cases come before case 2
st = replay(TRIPLE, [{ card: 'intro' }, { card: 'rem', v: 'n', d: 2 }, { card: 'rem', v: 'n', d: 3 }]);
eqS(st.tabs.map((t) => `${t.id}:${t.status}`).join(), '1:split,1.1:active,1.2:waiting,1.3:waiting,2:waiting', 'nested tabs');
eqS(st.waiting.map((w) => w.tab).join(), '1.2,1.3,2', 'nested waiting order');
eqS(st.hyps.map((h) => stmtText(h.s)).join(' / '), 'n 是偶數 / 存在整數 k，使 n = 3k', 'nested case keeps the outer given');
eqS(stmtText(or(even('a'), odd('b'))), 'a 是偶數，或 b 是奇數', 'or helper');

if (fails) throw new Error(`board-model selftest: ${fails} failed`);
console.log('board-model selftest: all passed');
