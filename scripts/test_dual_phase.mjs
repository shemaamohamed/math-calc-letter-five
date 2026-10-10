/**
 * Test script for Exact Arabic Math Engine
 */

const ZERO = 0n;
const ONE = 1n;
const TWO = 2n;
const TEN_POW_10 = 10_000_000_000n;
const TEN_POW_20 = 100_000_000_000_000_000_000n;

function gcd(a, b) {
  let x = a < ZERO ? -a : a;
  let y = b < ZERO ? -b : b;
  while (y !== ZERO) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function bigIntSqrt(n) {
  if (n < ZERO) throw new Error('Square root of negative number');
  if (n === ZERO) return ZERO;
  let x0 = n;
  let x1 = (x0 + n / x0) / TWO;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + n / x0) / TWO;
  }
  return x0;
}

function createFraction(num, den = ONE) {
  let n = BigInt(num);
  let d = BigInt(den);
  if (d === ZERO) throw new Error('Division by zero');
  if (d < ZERO) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { num: n / g, den: d / g };
}

function add(a, b) {
  return createFraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

function div(a, b) {
  return createFraction(a.num * b.den, a.den * b.num);
}

function cycle(T) {
  const right = createFraction(T.num, T.den * 196n);
  const mid = createFraction(T.num * 52n, T.den * 196n);
  const left = createFraction(T.num * 117n, T.den * 196n);
  return { right, mid, left };
}

function evalSqrt10(f) {
  const scaled = (f.num * TEN_POW_20) / f.den;
  const v = bigIntSqrt(scaled);
  const intVal = v / TEN_POW_10;
  const fracVal = v % TEN_POW_10;
  const intPart = intVal.toString();
  const first10 = fracVal.toString().padStart(10, '0');
  const digits = first10.split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);

  const steps = [sum];
  let cur = sum;
  while (cur >= 10) {
    cur = cur.toString().split('').reduce((a, b) => a + Number(b), 0);
    steps.push(cur);
  }
  return {
    fractionString: `${f.num}/${f.den}`,
    decimal: `${intPart}.${first10}`,
    sum,
    singleDigit: steps[steps.length - 1],
  };
}

function evalNoSqrt10(f) {
  const v = (f.num * TEN_POW_10) / f.den;
  const intVal = v / TEN_POW_10;
  const fracVal = v % TEN_POW_10;
  const intPart = intVal.toString();
  const first10 = fracVal.toString().padStart(10, '0');
  const digits = first10.split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);

  const steps = [sum];
  let cur = sum;
  while (cur >= 10) {
    cur = cur.toString().split('').reduce((a, b) => a + Number(b), 0);
    steps.push(cur);
  }
  return {
    fractionString: `${f.num}/${f.den}`,
    decimal: `${intPart}.${first10}`,
    sum,
    singleDigit: steps[steps.length - 1],
  };
}

// Run test for N = 260
const N = 260n;
const T1 = createFraction(N * 3n, 1n);
const c1 = cycle(T1);
const S1 = add(add(c1.right, c1.mid), c1.left);
const S1_div_3 = div(S1, createFraction(3n, 1n));
const p1_sqrt = evalSqrt10(S1_div_3);
const R1 = p1_sqrt.sum;

console.log('Phase 1 S1:', `${S1.num}/${S1.den}`);
console.log('Phase 1 S1/3:', `${S1_div_3.num}/${S1_div_3.den}`);
console.log('Phase 1 Sqrt:', p1_sqrt.decimal, 'Sum =', R1);

// Phase 2
const T2 = createFraction(BigInt(R1), 1n);
const c2 = cycle(T2);
const S2 = add(add(c2.right, c2.mid), c2.left);
const S2_div_3 = div(S2, createFraction(3n, 1n));

console.log('\nPhase 2 Slots:');
console.log('Right:', `${c2.right.num}/${c2.right.den}`);
console.log('Mid:', `${c2.mid.num}/${c2.mid.den}`);
console.log('Left:', `${c2.left.num}/${c2.left.den}`);
console.log('S2:', `${S2.num}/${S2.den}`);

console.log('\nMode 1 (S2 + sqrt):', evalSqrt10(S2));
console.log('Mode 2 (S2/3 + sqrt):', evalSqrt10(S2_div_3));
console.log('Mode 3 (S2 no sqrt):', evalNoSqrt10(S2));
console.log('Mode 4 (S2/3 no sqrt):', evalNoSqrt10(S2_div_3));
