/**
 * Test script for Dual-Phase calculation engine
 */

const ZERO = 0n;
const ONE = 1n;
const TWO = 2n;
const TEN = 10n;

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

class Fraction {
  constructor(num, den = ONE) {
    let n = BigInt(num);
    let d = BigInt(den);
    if (d === ZERO) throw new Error('Division by zero');
    if (d < ZERO) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    this.num = n / g;
    this.den = d / g;
  }

  add(other) {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other) {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other) {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  div(other) {
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  toString() {
    return `${this.num}/${this.den}`;
  }

  sqrtDecimal(precision = 60) {
    const p = BigInt(precision);
    const scale = TEN ** (p * TWO);
    const scaledNum = (this.num * scale) / this.den;
    const sqrtInt = bigIntSqrt(scaledNum);

    const str = sqrtInt.toString().padStart(precision + 1, '0');
    const intPart = str.slice(0, str.length - precision);
    const fracPart = str.slice(str.length - precision);
    const fullString = `${intPart}.${fracPart}`;

    const first10AfterDot = fracPart.substring(0, 10);
    const digitsList = first10AfterDot.split('').map(d => parseInt(d, 10)).filter(d => !isNaN(d));
    const unsimplifiedSum = digitsList.reduce((acc, val) => acc + val, 0);

    const reductionSteps = [unsimplifiedSum];
    let current = unsimplifiedSum;
    while (current >= 10) {
      current = current
        .toString()
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
      reductionSteps.push(current);
    }

    return {
      fullString,
      first10AfterDot,
      digitsList,
      unsimplifiedSum,
      reductionSteps,
      simplifiedSingleDigit: reductionSteps[reductionSteps.length - 1],
    };
  }
}

function runDualPhase(chars, selectedIndices = null) {
  const n = chars.length;

  // --- PHASE 1 (Initial = 42 for each slot) ---
  const s1_p1 = new Fraction(BigInt(n * 42), ONE);
  const step2_p1 = chars.map((_, i) => new Fraction(BigInt((i + 1) * (i + 1)), BigInt(n)));
  let sum2_p1 = new Fraction(0n, ONE);
  step2_p1.forEach(f => sum2_p1 = sum2_p1.add(f));

  const step3_p1 = step2_p1.map(v2 => v2.div(sum2_p1).mul(s1_p1));
  const v3_last_p1 = step3_p1[n - 1];

  const groups_p1 = {};
  chars.forEach((c, idx) => {
    groups_p1[c] = groups_p1[c] ? groups_p1[c].add(step3_p1[idx]) : step3_p1[idx];
  });

  const step5_p1 = step3_p1.map(v3 => v3.div(v3_last_p1).mul(new Fraction(100n, ONE)));
  let sum5_p1 = new Fraction(0n, ONE);
  step5_p1.forEach(f => sum5_p1 = sum5_p1.add(f));

  const ratios_p1 = step5_p1.map(v5 => v5.div(sum5_p1).mul(new Fraction(100n, ONE)));
  const step6_p1 = chars.map((c, idx) => {
    return groups_p1[c].mul(ratios_p1[idx]).div(new Fraction(100n, ONE));
  });

  let totalSum_p1 = new Fraction(0n, ONE);
  step6_p1.forEach(f => totalSum_p1 = totalSum_p1.add(f));
  const avg_p1 = totalSum_p1.div(new Fraction(BigInt(n), ONE));
  const sqrt_p1 = avg_p1.sqrtDecimal(60);
  const seed = sqrt_p1.unsimplifiedSum; // 41

  // --- PHASE 2 (Initial = seed) ---
  const s1_p2 = new Fraction(BigInt(n * seed), ONE);
  const step2_p2 = chars.map((_, i) => new Fraction(BigInt((i + 1) * (i + 1)), BigInt(n)));
  let sum2_p2 = new Fraction(0n, ONE);
  step2_p2.forEach(f => sum2_p2 = sum2_p2.add(f));

  const step3_p2 = step2_p2.map(v2 => v2.div(sum2_p2).mul(s1_p2));
  const v3_last_p2 = step3_p2[n - 1];

  const groups_p2 = {};
  chars.forEach((c, idx) => {
    groups_p2[c] = groups_p2[c] ? groups_p2[c].add(step3_p2[idx]) : step3_p2[idx];
  });

  const step5_p2 = step3_p2.map(v3 => v3.div(v3_last_p2).mul(new Fraction(100n, ONE)));
  let sum5_p2 = new Fraction(0n, ONE);
  step5_p2.forEach(f => sum5_p2 = sum5_p2.add(f));

  const ratios_p2 = step5_p2.map(v5 => v5.div(sum5_p2).mul(new Fraction(100n, ONE)));
  const step6_p2 = chars.map((c, idx) => {
    return groups_p2[c].mul(ratios_p2[idx]).div(new Fraction(100n, ONE));
  });

  const defaultSel = selectedIndices || chars.map((_, i) => i);
  let selSum = new Fraction(0n, ONE);
  let selCount = 0;
  chars.forEach((_, idx) => {
    if (defaultSel.includes(idx)) {
      selSum = selSum.add(step6_p2[idx]);
      selCount++;
    }
  });

  const divisor = selCount > 0 ? selCount : 1;
  const selAvg = selSum.div(new Fraction(BigInt(divisor), ONE));
  const sqrt_p2 = selAvg.sqrtDecimal(60);

  // Direct sum sqrt without division
  const sqrt_directSum = selSum.sqrtDecimal(60);

  return {
    phase1: { seed, avg: avg_p1.toString(), sqrt: sqrt_p1.fullString.substring(0, 15) },
    phase2: {
      step6: step6_p2.map(f => f.toString()),
      selSum: selSum.toString(),
      selCount,
      // With division (Average)
      withDivision: {
        selAvg: selAvg.toString(),
        sqrt: sqrt_p2.fullString.substring(0, 15),
        first10: sqrt_p2.first10AfterDot,
        unsimplified: sqrt_p2.unsimplifiedSum,
        simplified: sqrt_p2.simplifiedSingleDigit,
        steps: sqrt_p2.reductionSteps,
      },
      // Without division (Direct Sum)
      withoutDivision: {
        sum: selSum.toString(),
        sqrt: sqrt_directSum.fullString.substring(0, 15),
        first10: sqrt_directSum.first10AfterDot,
        unsimplified: sqrt_directSum.unsimplifiedSum,
        simplified: sqrt_directSum.simplifiedSingleDigit,
        steps: sqrt_directSum.reductionSteps,
      },
    },
  };
}

const res = runDualPhase(['م', 'د', 'د']);
console.log('TEST RESULT FOR مدد:');
console.log(JSON.stringify(res, null, 2));
