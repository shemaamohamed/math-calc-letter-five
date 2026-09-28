/**
 * Arbitrary-Precision Fraction Arithmetic and Square Root Module using BigInt
 * نظام الحساب الكسري فائق الدقة (بدون تقريب)
 */

import { FractionType, DecimalSquareRootResult } from '../types/math';

export const ZERO = BigInt(0);
export const ONE = BigInt(1);
export const TWO = BigInt(2);
export const TEN = BigInt(10);
export const HUNDRED = BigInt(100);

export type { FractionType, DecimalSquareRootResult };

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
 * Create a simplified FractionType object from numbers, strings, or bigints
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
 * Simplify a fraction to its lowest terms
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
 * Convert fraction to standard string representation (e.g. "255/98")
 */
export function fractionToString(f: FractionType): string {
  return `${f.num}/${f.den}`;
}

/**
 * Convert fraction to percentage string (e.g. "50/7%" or "100%")
 */
export function fractionToPercentageString(f: FractionType): string {
  return f.den === ONE ? `${f.num}%` : `${f.num}/${f.den}%`;
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
 * High-precision square root calculation extracting exactly the first 10 decimal digits
 * and calculating both unsimplified and simplified digit sums.
 */
export function sqrtFractionTo10DigitSum(
  f: FractionType,
  precision = 60
): DecimalSquareRootResult {
  if (f.num < ZERO) {
    throw new Error('Cannot take square root of negative fraction');
  }

  const p = BigInt(precision);
  const scale = TEN ** (p * TWO);
  const scaledNum = (f.num * scale) / f.den;
  const sqrtInt = bigIntSqrt(scaledNum);

  const str = sqrtInt.toString().padStart(precision + 1, '0');
  const intPart = str.slice(0, str.length - precision);
  const fracPart = str.slice(str.length - precision);
  const fullString = `${intPart}.${fracPart}`;

  const first10AfterDot = fracPart.substring(0, 10);
  const digitsList = first10AfterDot
    .split('')
    .map(d => parseInt(d, 10))
    .filter(d => !isNaN(d));

  // Sum the 10 digits (من غير تبسيط)
  const unsimplifiedSum = digitsList.reduce((acc, val) => acc + val, 0);

  // Repeated digit reduction until single digit (بالتبسيط)
  const reductionSteps: number[] = [unsimplifiedSum];
  let current = unsimplifiedSum;
  while (current >= 10) {
    current = current
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    reductionSteps.push(current);
  }

  const simplifiedSingleDigit = reductionSteps[reductionSteps.length - 1] ?? 0;

  return {
    intPart,
    fracPart,
    fullString,
    first10AfterDot,
    digitsList,
    unsimplifiedSum,
    reductionSteps,
    simplifiedSingleDigit,
  };
}

/**
 * Exact Fraction class with BigInt numerator and denominator
 * Wraps pure fractional arithmetic functions for OOP convenience
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

  toPercentageString(): string {
    return fractionToPercentageString(this);
  }

  isZero(): boolean {
    return this.num === ZERO;
  }

  /**
   * Computes the square root of the fraction to a given number of decimal digits
   * and extracts the first 10 digits after the decimal point (.)
   */
  sqrtDecimal(precision = 60): DecimalSquareRootResult {
    return sqrtFractionTo10DigitSum(this, precision);
  }
}
