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

if (fails) throw new Error(`board-model selftest: ${fails} failed`);
console.log('board-model selftest: all passed');
