/**
 * Arbitrary-Precision Fraction Arithmetic and Exact Math Engine using BigInt
 * نظام الحساب الكسري فائق الدقة المعتمد على BigInt واختزال gcd بدون Number/float
 */

import { FractionType, CycleResult, ModeEvaluationResult, StepBreakdownItem } from '../types/math';

export const ZERO = 0n;
export const ONE = 1n;
export const TWO = 2n;
export const TEN = 10n;
export const HUNDRED = 100n;
export const TEN_POW_10 = 10_000_000_000n;
export const TEN_POW_20 = 100_000_000_000_000_000_000n;

export type { FractionType, CycleResult, ModeEvaluationResult, StepBreakdownItem };

/**
 * Greatest Common Divisor for BigInt
 */
export function gcd(a: bigint, b: bigint): bigint {
  let x = a < ZERO ? -a : a;
  let y = b < ZERO ? -b : b;
  while (y !== ZERO) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/**
 * Create an irreducible FractionType object from bigint, number, or string
 * مع اختزال فوري بواسطة gcd
 */
export function createFraction(
  num: bigint | number | string,
  den: bigint | number | string = ONE
): FractionType {
  let n = BigInt(num);
  let d = BigInt(den);
  if (d === ZERO) {
    throw new Error('Division by zero in Fraction');
  }
  if (d < ZERO) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return {
    num: n / g,
    den: d / g,
  };
}

/**
 * Simplify fraction to lowest terms
 */
export function simplifyFraction(f: FractionType): FractionType {
  return createFraction(f.num, f.den);
}

/**
 * Pure Addition of two fractions
 */
export function addFractions(a: FractionType, b: FractionType): FractionType {
  return createFraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

/**
 * Pure Subtraction of two fractions
 */
export function subFractions(a: FractionType, b: FractionType): FractionType {
  return createFraction(a.num * b.den - b.num * a.den, a.den * b.den);
}

/**
 * Pure Multiplication of two fractions
 */
export function mulFractions(a: FractionType, b: FractionType): FractionType {
  return createFraction(a.num * b.num, a.den * b.den);
}

/**
 * Pure Division of two fractions
 */
export function divFractions(a: FractionType, b: FractionType): FractionType {
  if (b.num === ZERO) {
    throw new Error('Division by zero in divFractions');
  }
  return createFraction(a.num * b.den, a.den * b.num);
}

/**
 * Convert fraction to string representation (e.g. "3995/98")
 */
export function fractionToString(f: FractionType): string {
  return `${f.num}/${f.den}`;
}

/**
 * Arbitrary-Precision Integer Square Root using Newton-Raphson for BigInt
 */
export function bigIntSqrt(n: bigint): bigint {
  if (n < ZERO) throw new Error('Square root of negative number is not defined');
  if (n === ZERO) return ZERO;
  let x0 = n;
  let x1 = (x0 + n / x0) / TWO;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + n / x0) / TWO;
  }
  return x0;
}

/**
 * 1) دالة الدورة: cycle(T) -> {right, mid, left}
 * T كسر. القانون المختصر (مطابق للخطوات الطويلة بالورق):
 * - right = T / 196
 * - mid   = 52 * T / 196
 * - left  = 117 * T / 196
 * كل ناتج مختزل لأبسط كسر عبر gcd.
 */
export function cycle(T: FractionType): CycleResult {
  const right = createFraction(T.num, T.den * 196n);
  const mid = createFraction(T.num * 52n, T.den * 196n);
  const left = createFraction(T.num * 117n, T.den * 196n);
  return { right, mid, left };
}

/**
 * حساب الاختزال المتكرر لأرقام العدد حتى يبقى رقم واحد
 * (مثال: 46 ➔ 10 ➔ 1، 48 ➔ 12 ➔ 3)
 */
export function reduceToSingleDigit(initialSum: number): {
  reductionSteps: number[];
  simplifiedSingleDigit: number;
} {
  const reductionSteps: number[] = [initialSum];
  let current = initialSum;
  while (current >= 10) {
    current = current
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    reductionSteps.push(current);
  }
  const simplifiedSingleDigit = reductionSteps[reductionSteps.length - 1] ?? 0;
  return { reductionSteps, simplifiedSingleDigit };
}

/**
 * 4) الجذر الدقيق وأول 10 خانات
 * للكسر a/b:
 * v = isqrt( floor(a * 10^20 / b) )
 * الجزء الصحيح = v / 10^10
 * الخانات العشر = (v % 10^10) مع padStart(10, '0')
 * قطع وليس تقريب، مع الاحتفاظ بالأصفار البادئة.
 */
export function evaluateFractionWithSqrt10(
  f: FractionType,
  modeIndex = 1,
  title = 'الجذر التربيعي',
  description = ''
): ModeEvaluationResult {
  const a = f.num;
  const b = f.den;
  if (b === ZERO) throw new Error('Division by zero in Fraction');
  if (a < ZERO) throw new Error('Square root of negative fraction is not defined');

  if (a === ZERO) {
    return {
      modeIndex,
      title,
      description,
      fraction: f,
      fractionString: '0/1',
      intPart: '0',
      first10AfterDot: '0000000000',
      fullDecimalString: '0.0000000000',
      digitsList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      unsimplifiedSum: 0,
      reductionSteps: [0],
      simplifiedSingleDigit: 0,
    };
  }

  // v = isqrt( floor(a * 10^20 / b) )
  const scaled = (a * TEN_POW_20) / b;
  const v = bigIntSqrt(scaled);
  const intVal = v / TEN_POW_10;
  const fracVal = v % TEN_POW_10;

  const intPart = intVal.toString();
  const first10AfterDot = fracVal.toString().padStart(10, '0');
  const fullDecimalString = `${intPart}.${first10AfterDot}`;

  const digitsList = first10AfterDot.split('').map(d => parseInt(d, 10));
  const unsimplifiedSum = digitsList.reduce((acc, val) => acc + val, 0);

  const { reductionSteps, simplifiedSingleDigit } = reduceToSingleDigit(unsimplifiedSum);

  return {
    modeIndex,
    title,
    description,
    fraction: f,
    fractionString: `${f.num}/${f.den}`,
    intPart,
    first10AfterDot,
    fullDecimalString,
    digitsList,
    unsimplifiedSum,
    reductionSteps,
    simplifiedSingleDigit,
  };
}

/**
 * 4) التقييم الدقيق بدون جذر تربيعي لأول 10 خانات
 * للكسر a/b:
 * v = floor(a * 10^10 / b)
 * الجزء الصحيح = v / 10^10
 * الخانات العشر = (v % 10^10) مع padStart(10, '0')
 * قطع وليس تقريب، مع الاحتفاظ بالأصفار البادئة.
 */
export function evaluateFractionNoSqrt10(
  f: FractionType,
  modeIndex = 3,
  title = 'بدون جذر تربيعي',
  description = ''
): ModeEvaluationResult {
  const a = f.num;
  const b = f.den;
  if (b === ZERO) throw new Error('Division by zero in Fraction');

  if (a === ZERO) {
    return {
      modeIndex,
      title,
      description,
      fraction: f,
      fractionString: '0/1',
      intPart: '0',
      first10AfterDot: '0000000000',
      fullDecimalString: '0.0000000000',
      digitsList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      unsimplifiedSum: 0,
      reductionSteps: [0],
      simplifiedSingleDigit: 0,
    };
  }

  // v = floor(a * 10^10 / b)
  const v = (a * TEN_POW_10) / b;
  const intVal = v / TEN_POW_10;
  const fracVal = v % TEN_POW_10;

  const intPart = intVal.toString();
  const first10AfterDot = fracVal.toString().padStart(10, '0');
  const fullDecimalString = `${intPart}.${first10AfterDot}`;

  const digitsList = first10AfterDot.split('').map(d => parseInt(d, 10));
  const unsimplifiedSum = digitsList.reduce((acc, val) => acc + val, 0);

  const { reductionSteps, simplifiedSingleDigit } = reduceToSingleDigit(unsimplifiedSum);

  return {
    modeIndex,
    title,
    description,
    fraction: f,
    fractionString: `${f.num}/${f.den}`,
    intPart,
    first10AfterDot,
    fullDecimalString,
    digitsList,
    unsimplifiedSum,
    reductionSteps,
    simplifiedSingleDigit,
  };
}

/**
 * توليد جدول تفصيلي يوضح الخطوات الست الكاملة بالورق
 * (الأوزان، التوزيع، جمع المتغيرات، النسب، والنواتج النهائية)
 */
export function generateStepsTable(
  T: FractionType,
  slotChars: [string, string, string] = ['م', 'د', 'د']
): StepBreakdownItem[] {
  // Step 1: Base values
  // T/3 for each
  const s1Val = divFractions(T, createFraction(3n, 1n));
  const s1Str = fractionToString(s1Val);

  // Step 2: Weights 1/3, 4/3, 3/1 (sum = 14/3)
  const wR = '1/3';
  const wM = '4/3';
  const wL = '3/1';
  const wSum = '14/3';

  // Step 3: Distribution of T by weights (1:4:9 out of 14)
  // right = T / 14, mid = 4T / 14 = 2T / 7, left = 9T / 14
  const dR = divFractions(T, createFraction(14n, 1n));
  const dM = mulFractions(T, createFraction(4n, 14n));
  const dL = mulFractions(T, createFraction(9n, 14n));

  // Step 4: Variable grouping (Right m, Mid & Left d+d)
  const gR = dR;
  const gML = addFractions(dM, dL); // 13T / 14

  // Step 5: Percentage ratios compared to last slot (Left dL)
  // dR / dL * 100 = (1/9) * 100 = 100/9
  // dM / dL * 100 = (4/9) * 100 = 400/9
  // dL / dL * 100 = (9/9) * 100 = 100/1
  // Sum = 1400/9
  const p5R = '100/9';
  const p5M = '400/9';
  const p5L = '100/1';
  const p5Sum = '1400/9';

  // Step 6: Percentage calculation & multiplication by letter values
  // R ratio: (100/9 ÷ 1400/9) * 100 = 50/7 %
  // M ratio: (400/9 ÷ 1400/9) * 100 = 200/7 %
  // L ratio: (100/1 ÷ 1400/9) * 100 = 450/7 %
  // Final values:
  // right = T / 196
  // mid = 52T / 196
  // left = 117T / 196
  const c = cycle(T);
  const totalC = addFractions(addFractions(c.right, c.mid), c.left);

  return [
    {
      step: 1,
      title: 'وضع القيمة على كل خانة',
      formula: 'T ÷ 3 على كل خانة ومجموعها T',
      right: `${slotChars[0]}: ${s1Str}`,
      mid: `${slotChars[1]}: ${s1Str}`,
      left: `${slotChars[2]}: ${s1Str}`,
      sum: fractionToString(T),
      notes: `المجموع الكلي = ${fractionToString(T)}`,
    },
    {
      step: 2,
      title: 'أوزان الخانات',
      formula: '(رقم الخانة ÷ 3) × رقم الخانة',
      right: `${wR} (1÷3×1)`,
      mid: `${wM} (2÷3×2)`,
      left: `${wL} (3÷3×3)`,
      sum: wSum,
      notes: 'مجموع الأوزان = 14/3',
    },
    {
      step: 3,
      title: 'توزيع T بنسب الأوزان',
      formula: '(وزن الخانة ÷ 14/3) × T',
      right: fractionToString(dR),
      mid: fractionToString(dM),
      left: fractionToString(dL),
      sum: fractionToString(T),
      notes: 'التوزيع بنسب 1 : 4 : 9',
    },
    {
      step: 4,
      title: 'جمع الأحرف المتماثلة (المتغيرات)',
      formula: 'اليمين مستقل، والوسط واليسار متماثلان',
      right: `${slotChars[0]} = ${fractionToString(gR)}`,
      mid: `${slotChars[1]}+${slotChars[2]} = ${fractionToString(gML)}`,
      left: `${slotChars[1]}+${slotChars[2]} = ${fractionToString(gML)}`,
      sum: fractionToString(T),
      notes: 'مجموع الوسط واليسار د+د',
    },
    {
      step: 5,
      title: 'النسب المقارنة بآخر خانة',
      formula: '(قيمة خطوة 3 ÷ آخر خانة 3) × 100',
      right: p5R,
      mid: p5M,
      left: p5L,
      sum: p5Sum,
      notes: 'مجموع خطوة 5 = 1400/9',
    },
    {
      step: 6,
      title: 'النسب المئوية والضرب في المتغيرات',
      formula: 'النسبة = (قيمة 5 ÷ 1400/9) × 100 ثم الضرب في المتغير',
      right: `(50/7%) ➔ ${fractionToString(c.right)}`,
      mid: `(200/7%) ➔ ${fractionToString(c.mid)}`,
      left: `(450/7%) ➔ ${fractionToString(c.left)}`,
      sum: fractionToString(totalC),
      notes: `القانون المختصر: right=${fractionToString(c.right)} ، mid=${fractionToString(c.mid)} ، left=${fractionToString(c.left)}`,
    },
  ];
}

/**
 * Exact Fraction class with BigInt numerator and denominator
 * Backwards compatibility wrapper
 */
export class Fraction implements FractionType {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint | number | string, den: bigint | number | string = ONE) {
    const f = createFraction(num, den);
    this.num = f.num;
    this.den = f.den;
  }

  add(other: FractionType | Fraction): Fraction {
    const res = addFractions(this, other);
    return new Fraction(res.num, res.den);
  }

  sub(other: FractionType | Fraction): Fraction {
    const res = subFractions(this, other);
    return new Fraction(res.num, res.den);
  }

  mul(other: FractionType | Fraction): Fraction {
    const res = mulFractions(this, other);
    return new Fraction(res.num, res.den);
  }

  div(other: FractionType | Fraction): Fraction {
    const res = divFractions(this, other);
    return new Fraction(res.num, res.den);
  }

  toString(): string {
    return fractionToString(this);
  }

  isZero(): boolean {
    return this.num === ZERO;
  }

  sqrtDecimal(): ModeEvaluationResult {
    return evaluateFractionWithSqrt10(this);
  }

  toDecimal(): ModeEvaluationResult {
    return evaluateFractionNoSqrt10(this);
  }
}
