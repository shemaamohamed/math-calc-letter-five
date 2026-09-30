/**
 * Dual-Phase Arabic Arbitrary-Precision Math Calculation Engine
 * المحرك الحسابي ثنائي المراحل فائق الدقة (بدون تقريب)
 */

import { Fraction, DecimalSquareRootResult, ONE, HUNDRED } from './fractionMath';
import { normalizeArabicText, normalizeChar } from './rules';
import {
  SlotData,
  Phase1Summary,
  Phase2Summary,
  CalculationState,
} from '../types/math';

export { normalizeChar };
export type { SlotData, Phase1Summary, Phase2Summary, CalculationState };

// Aliases for backwards compatibility
export type PhaseSlotDetail = SlotData;
export type DualPhaseResult = CalculationState;
export type CalculationResult = CalculationState;

/**
 * Execute Phase 1: Silent Engine (القسم الأول المخفي)
 * Initial slot value = 1.
 * Produces the seed value (unsimplified digit sum of square root).
 */
export function executePhase1(chars: string[]): Phase1Summary {
  const n = chars.length;
  if (n === 0) {
    throw new Error('قائمة الحروف فارغة');
  }

  // الخطوة 1: عدد طبيعي (1, 2, ..., n) لكل خانة ثم الجمع
  const step1Vals: number[] = [];
  let sum1BigInt = 0n;
  for (let i = 1; i <= n; i++) {
    step1Vals.push(i);
    sum1BigInt += BigInt(i);
  }
  const sum1 = new Fraction(sum1BigInt, ONE);
  const step1Val = 1;

  // الخطوة 2: عدد طبيعي (i ÷ n) × i = i^2 / n
  const step2Fractions = chars.map((_, i) => {
    const idx = BigInt(i + 1);
    return new Fraction(idx * idx, BigInt(n));
  });
  let sum2 = new Fraction(0n, ONE);
  step2Fractions.forEach(f => {
    sum2 = sum2.add(f);
  });

  // الخطوة 3: (قيمة خطوة 2 ÷ S2) × S1
  const step3Fractions = step2Fractions.map(v2 => v2.div(sum2).mul(sum1));
  const v3_last = step3Fractions[n - 1];

  // الخطوة 4: جمع طبيعي لنواتج خطوة 3 للأحرف المتماثلة
  const charGroups: Record<string, Fraction> = {};
  chars.forEach((c, idx) => {
    const v3 = step3Fractions[idx];
    charGroups[c] = charGroups[c] ? charGroups[c].add(v3) : v3;
  });

  // الخطوة 5: (قيمة خطوة 3 ÷ آخر خانة من خطوة 3) × 100
  const step5Fractions = step3Fractions.map(v3 => {
    if (v3_last.isZero()) return new Fraction(0n, ONE);
    return v3.div(v3_last).mul(new Fraction(HUNDRED, ONE));
  });
  let sum5 = new Fraction(0n, ONE);
  step5Fractions.forEach(f => {
    sum5 = sum5.add(f);
  });

  // الخطوة 6: النسب المئوية وضربها بقيم الحروف من خطوة 4
  const step6RatioFractions = step5Fractions.map(v5 => {
    if (sum5.isZero()) return new Fraction(0n, ONE);
    return v5.div(sum5).mul(new Fraction(HUNDRED, ONE));
  });

  const step6Fractions = chars.map((c, idx) => {
    const charGroupVal = charGroups[c];
    const ratio = step6RatioFractions[idx];
    return charGroupVal.mul(ratio).div(new Fraction(HUNDRED, ONE));
  });

  // الناتج النهائي للقسم الأول: جمع الخانات ÷ عدد الخانات
  let totalSum = new Fraction(0n, ONE);
  step6Fractions.forEach(f => {
    totalSum = totalSum.add(f);
  });
  const average = totalSum.div(new Fraction(BigInt(n), ONE));

  // الجذر التربيعي واستخراج أول 10 أرقام بعد الفاصلة
  const sqrtResult = average.sqrtDecimal(60);
  // الحماية في حال كانت البذرة 0 (مثلاً إذا كان الناتج عدداً صحيحاً تاماً)
  const seed = sqrtResult.unsimplifiedSum > 0 ? sqrtResult.unsimplifiedSum : 1;

  return {
    step1Val,
    step1Vals,
    sum1,
    sum2,
    step3Fractions,
    sum5,
    step6Fractions,
    totalSum,
    average,
    sqrtResult,
    seed,
  };
}

/**
 * Execute Phase 2: Visible Engine (القسم الثاني الظاهر والتفاعلي)
 * Initial slot value = Seed from Phase 1.
 * Supports interactive slot selection ("زر الانتقال").
 */
export function executePhase2(
  chars: string[],
  rawChars: string[],
  seed: number,
  selectedIndices?: number[]
): Phase2Summary {
  const n = chars.length;
  if (n === 0) {
    throw new Error('قائمة الحروف فارغة');
  }

  // الخطوة 1: نضع القيمة البذرية على كل خانة
  const step1Val = seed;
  const sum1 = new Fraction(BigInt(n * step1Val), ONE);

  // الخطوة 2: عدد طبيعي (i ÷ n) × i = i^2 / n
  const step2Fractions = chars.map((_, i) => {
    const idx = BigInt(i + 1);
    return new Fraction(idx * idx, BigInt(n));
  });
  let sum2 = new Fraction(0n, ONE);
  step2Fractions.forEach(f => {
    sum2 = sum2.add(f);
  });

  // الخطوة 3: (قيمة خطوة 2 ÷ S2) × S1
  const step3Fractions = step2Fractions.map(v2 => v2.div(sum2).mul(sum1));
  const v3_last = step3Fractions[n - 1];

  // الخطوة 4: جمع طبيعي لنواتج خطوة 3 للأحرف المتماثلة
  const charGroups: Record<string, Fraction> = {};
  chars.forEach((c, idx) => {
    const v3 = step3Fractions[idx];
    charGroups[c] = charGroups[c] ? charGroups[c].add(v3) : v3;
  });

  // الخطوة 5: (قيمة خطوة 3 ÷ آخر خانة من خطوة 3) × 100
  const step5Fractions = step3Fractions.map(v3 => {
    if (v3_last.isZero()) return new Fraction(0n, ONE);
    return v3.div(v3_last).mul(new Fraction(HUNDRED, ONE));
  });
  let sum5 = new Fraction(0n, ONE);
  step5Fractions.forEach(f => {
    sum5 = sum5.add(f);
  });

  // الخطوة 6: النسب المئوية وضربها بقيم الحروف من خطوة 4
  const step6RatioFractions = step5Fractions.map(v5 => {
    if (sum5.isZero()) return new Fraction(0n, ONE);
    return v5.div(sum5).mul(new Fraction(HUNDRED, ONE));
  });

  const defaultSelected = selectedIndices ?? chars.map((_, i) => i);

  const slots: PhaseSlotDetail[] = chars.map((c, idx) => {
    const pos = idx + 1;
    const charGroupVal = charGroups[c];
    const ratio = step6RatioFractions[idx];
    const finalValue = charGroupVal.mul(ratio).div(new Fraction(HUNDRED, ONE));
    const isSelected = defaultSelected.includes(idx);

    return {
      pos,
      char: c,
      originalChar: rawChars[idx] || c,
      step1Val,
      step2Frac: step2Fractions[idx],
      step2Formula: `${pos} ÷ ${n} × ${pos}`,
      step3Frac: step3Fractions[idx],
      step3Formula: `${step2Fractions[idx].toString()} ÷ ${sum2.toString()} × ${sum1.toString()}`,
      step4GroupFrac: charGroupVal,
      step5Frac: step5Fractions[idx],
      step5Formula: `${step3Fractions[idx].toString()} ÷ ${v3_last.toString()} × 100`,
      step6RatioFrac: ratio,
      step6Formula: `${step5Fractions[idx].toString()} ÷ ${sum5.toString()} × 100`,
      finalValueFrac: finalValue,
      finalFormula: `${charGroupVal.toString()} × ${ratio.toPercentageString()}`,
      isSelected,
    };
  });

  // حساب الناتج النهائي بناءً على الخانات المحددة ("زر الانتقال")
  const selectedSlots = slots.filter(s => s.isSelected);
  const selectedCount = selectedSlots.length;

  let selectedSum = new Fraction(0n, ONE);
  if (selectedCount > 0) {
    selectedSlots.forEach(s => {
      selectedSum = selectedSum.add(s.finalValueFrac);
    });
  }

  // 1. الطريقة الأولى: مع التقسيم على عدد الخانات المحددة (المتوسط)
  const divisor = selectedCount > 0 ? selectedCount : 1;
  const selectedAverage = selectedSum.div(new Fraction(BigInt(divisor), ONE));
  const sqrtResult = selectedAverage.sqrtDecimal(60);

  // 2. الطريقة الثانية: بدون تقسيم على عدد الخانات (على مجموع الخانات المحددة مباشرة)
  const directSumSqrtResult = selectedSum.sqrtDecimal(60);

  return {
    step1Val,
    sum1,
    sum2,
    slots,
    selectedCount,
    selectedSum,
    selectedAverage,
    // الطريقة الأولى (مع التقسيم)
    sqrtResult,
    unsimplifiedAnswer: sqrtResult.unsimplifiedSum,
    simplifiedAnswer: sqrtResult.simplifiedSingleDigit,
    reductionSteps: sqrtResult.reductionSteps,
    // الطريقة الثانية (بدون تقسيم - مباشرة على مجموع الخانات)
    directSumSqrtResult,
    directSumUnsimplifiedAnswer: directSumSqrtResult.unsimplifiedSum,
    directSumSimplifiedAnswer: directSumSqrtResult.simplifiedSingleDigit,
    directSumReductionSteps: directSumSqrtResult.reductionSteps,
  };
}

/**
 * Main Calculator Execution Function: Dual-Phase Process
 * يربط بين القسم الأول (المحرك البذري) والقسم الثاني (المحرك التفاعلي)
 */
export function calculateArabicDualPhase(
  text: string,
  selectedIndices?: number[]
): DualPhaseResult {
  const { rawChars, normalizedChars } = normalizeArabicText(text);
  const totalChars = normalizedChars.length;

  if (totalChars < 2) {
    throw new Error('الرجاء إدخال كلمة أو نص يحتوي على حرفين على الأقل للتحليل');
  }

  // 1. تشغيل القسم الأول للحصول على البذرة (Seed)
  const phase1 = executePhase1(normalizedChars);

  // 2. تشغيل القسم الثاني باستخدام البذرة والتحكم بأزرار الانتقال
  const phase2 = executePhase2(normalizedChars, rawChars, phase1.seed, selectedIndices);

  const activeSelectedIndices = phase2.slots
    .filter(s => s.isSelected)
    .map(s => s.pos - 1);

  return {
    inputText: text,
    normalizedChars,
    rawChars,
    totalChars,
    phase1,
    phase2,
    selectedIndices: activeSelectedIndices,
  };
}

// Backwards compatibility
export const calculateArabicPower = calculateArabicDualPhase;

