/**
 * Dual-Phase Arabic Arbitrary-Precision Math Calculation Engine
 * المحرك الحسابي ثنائي المراحل فائق الدقة المعتمد على BigInt واختزال gcd بدون أي تقريب
 */

import {
  FractionType,
  CycleResult,
  createFraction,
  addFractions,
  divFractions,
  cycle,
  evaluateFractionWithSqrt10,
  evaluateFractionNoSqrt10,
  generateStepsTable,
  fractionToString,
  Fraction,
} from './fractionMath';
import { parseInputN, normalizeArabicText, normalizeChar } from './rules';
import {
  Phase1Summary,
  Phase2Summary,
  CalculationState,
  SlotPhase2,
  SlotData,
} from '../types/math';

export { normalizeChar, cycle, createFraction, fractionToString };
export type { Phase1Summary, Phase2Summary, CalculationState, SlotPhase2, SlotData };

// Aliases for backwards compatibility
export type DualPhaseResult = CalculationState;
export type CalculationResult = CalculationState;
export type PhaseSlotDetail = SlotData;

/**
 * 2) تنفيذ المرحلة 1 (تصحيح الخطأ):
 * - المدخل N (مثلاً 260) يوضع في كل خانة من الخانات الثلاث، و T1 = 3*N (مثلاً 780).
 * - نفّذ cycle(T1) ثم اجمع الثلاثة: S1.
 * - نفّذ: S1 ÷ 3 ← جذر تربيعي ← أول 10 خانات بعد الفاصلة (قطع وليس تقريب، مع الاحتفاظ بالأصفار البادئة) ← مجموع هذه الخانات = R1.
 * - R1 يبقى كما هو (لا يُختزل لرقم واحد).
 */
export function executePhase1(
  inputN: bigint,
  slotChars: [string, string, string] = ['م', 'د', 'د']
): Phase1Summary {
  const t1 = inputN * 3n;
  const t1Frac = createFraction(t1, 1n);

  // دالة الدورة لـ T1
  const cycleResult = cycle(t1Frac);

  // S1 = right + mid + left
  const sum1 = addFractions(addFractions(cycleResult.right, cycleResult.mid), cycleResult.left);

  // S1 ÷ 3
  const average1 = divFractions(sum1, createFraction(3n, 1n));

  // جذر تربيعي واستخراج أول 10 خانات بعد الفاصلة (قطع)
  const sqrtResult = evaluateFractionWithSqrt10(
    average1,
    0,
    'جذر S1 ÷ 3 (المرحلة 1)',
    'استخراج أول 10 خانات بعد الفاصلة لحساب R1'
  );

  // R1 = مجموع الخانات العشر بعد الفاصلة (يبقى كما هو، لا يُختزل لرقم واحد)
  const r1 = sqrtResult.unsimplifiedSum;

  const stepsTable = generateStepsTable(t1Frac, slotChars);

  return {
    inputN,
    t1,
    cycle: cycleResult,
    sum1,
    average1,
    sqrtResult,
    r1,
    seed: r1,
    step1Val: Number(inputN),
    stepsTable,
  };
}

/**
 * 3) تنفيذ المرحلة 2:
 * - T2 = R1 مباشرة (وليس 3*R1).
 * - نفّذ cycle(T2) واعرض الكسور الثلاثة (right, mid, left)
 * - لكل كسر: خانة تحديد (checkbox) مفعّلة افتراضياً وزر "انتقال"
 * - S2 = مجموع الكسور المحددة فقط. أعد حسابه فوراً عند تغيير التحديد.
 * - اعرض 4 أوضاع، لكل منها: الكسر الناتج، القيمة العشرية، مجموع الخانات العشر، والاختزال لرقم واحد:
 *   1. S2 ← √ ← 10 خانات
 *   2. S2 ÷ (عدد الخانات المحددة) ← √ ← 10 خانات
 *   3. S2 ← 10 خانات
 *   4. S2 ÷ (عدد الخانات المحددة) ← 10 خانات
 */
export function executePhase2(
  r1: number,
  slotChars: [string, string, string] = ['م', 'د', 'د'],
  selectedIndices: number[] = [0, 1, 2]
): Phase2Summary {
  // T2 = R1 مباشرة
  const t2 = BigInt(r1);
  const t2Frac = createFraction(t2, 1n);

  // cycle(T2)
  const cycleResult = cycle(t2Frac);

  const slotItems: SlotPhase2[] = [
    {
      id: 'right',
      pos: 1,
      name: 'اليمين',
      char: slotChars[0],
      fraction: cycleResult.right,
      fractionString: fractionToString(cycleResult.right),
      isSelected: selectedIndices.includes(0),
    },
    {
      id: 'mid',
      pos: 2,
      name: 'الوسط',
      char: slotChars[1],
      fraction: cycleResult.mid,
      fractionString: fractionToString(cycleResult.mid),
      isSelected: selectedIndices.includes(1),
    },
    {
      id: 'left',
      pos: 3,
      name: 'اليسار',
      char: slotChars[2],
      fraction: cycleResult.left,
      fractionString: fractionToString(cycleResult.left),
      isSelected: selectedIndices.includes(2),
    },
  ];

  const selectedSlots = slotItems.filter(s => s.isSelected);
  const selectedCount = selectedSlots.length;

  // S2 = مجموع الكسور المحددة فقط
  let selectedSum = createFraction(0n, 1n);
  selectedSlots.forEach(s => {
    selectedSum = addFractions(selectedSum, s.fraction);
  });

  const divisor = selectedCount > 0 ? BigInt(selectedCount) : 1n;
  const selectedAverage = divFractions(selectedSum, createFraction(divisor, 1n));

  // 1. S2 ← √ ← 10 خانات
  const mode1 = evaluateFractionWithSqrt10(
    selectedSum,
    1,
    'الوضع 1: الجذر التربيعي لمجموع الخانات المحددة',
    'S2 ← √ ← أول 10 خانات بعد الفاصلة'
  );

  // 2. S2 ÷ (عدد الخانات المحددة) ← √ ← 10 خانات
  const mode2 = evaluateFractionWithSqrt10(
    selectedAverage,
    2,
    'الوضع 2: الجذر التربيعي لـ (المجموع ÷ عدد الخانات)',
    'S2 ÷ (عدد الخانات المحددة) ← √ ← أول 10 خانات بعد الفاصلة'
  );

  // 3. S2 ← 10 خانات (بدون جذر)
  const mode3 = evaluateFractionNoSqrt10(
    selectedSum,
    3,
    'الوضع 3: مجموع الخانات المحددة (بدون جذر)',
    'S2 ← أول 10 خانات بعد الفاصلة'
  );

  // 4. S2 ÷ (عدد الخانات المحددة) ← 10 خانات (بدون جذر)
  const mode4 = evaluateFractionNoSqrt10(
    selectedAverage,
    4,
    'الوضع 4: (المجموع ÷ عدد الخانات) (بدون جذر)',
    'S2 ÷ (عدد الخانات المحددة) ← أول 10 خانات بعد الفاصلة'
  );

  const stepsTable = generateStepsTable(t2Frac, slotChars);

  return {
    t2,
    cycle: cycleResult,
    slots: slotItems,
    selectedCount,
    selectedSum,
    selectedAverage,
    mode1,
    mode2,
    mode3,
    mode4,
    stepsTable,

    // Aliases for backwards compatibility with existing UI views
    directSumSqrtResult: mode1,
    directSumUnsimplifiedAnswer: mode1.unsimplifiedSum,
    directSumSimplifiedAnswer: mode1.simplifiedSingleDigit,
    directSumReductionSteps: mode1.reductionSteps,

    sqrtResult: mode2,
    unsimplifiedAnswer: mode2.unsimplifiedSum,
    simplifiedAnswer: mode2.simplifiedSingleDigit,
    reductionSteps: mode2.reductionSteps,

    directDecimalResult: mode3,
    directDecimalUnsimplifiedAnswer: mode3.unsimplifiedSum,
    directDecimalSimplifiedAnswer: mode3.simplifiedSingleDigit,
    directDecimalReductionSteps: mode3.reductionSteps,

    averageDecimalResult: mode4,
    averageDecimalUnsimplifiedAnswer: mode4.unsimplifiedSum,
    averageDecimalSimplifiedAnswer: mode4.simplifiedSingleDigit,
    averageDecimalReductionSteps: mode4.reductionSteps,

    step1Val: r1,
    sum1: t2Frac,
    sum2: createFraction(14n, 3n),
  };
}

/**
 * دالة الحساب الكلية للمشروع: Dual-Phase Arabic Engine
 */
export function calculateArabicDualPhase(
  text: string,
  selectedIndices: number[] = [0, 1, 2],
  customSeed?: number
): DualPhaseResult {
  const { inputN, wordText, slotChars } = parseInputN(text);
  const { normalizedChars, rawChars } = normalizeArabicText(text);

  // 1. تشغيل المرحلة 1
  const phase1 = executePhase1(inputN, slotChars);

  // استخدام R1 الناتج (أو customSeed في حال تمريره)
  const r1ToUse = customSeed !== undefined ? customSeed : phase1.r1;

  // 2. تشغيل المرحلة 2
  const phase2 = executePhase2(r1ToUse, slotChars, selectedIndices);

  const activeSelectedIndices = phase2.slots
    .filter(s => s.isSelected)
    .map(s => s.pos - 1);

  return {
    inputText: text,
    inputN,
    slotChars,
    normalizedChars: normalizedChars.length > 0 ? normalizedChars : [...slotChars],
    rawChars: rawChars.length > 0 ? rawChars : [...slotChars],
    totalChars: 3,
    phase1,
    phase2,
    selectedIndices: activeSelectedIndices,
  };
}

// Backwards compatibility
export const calculateArabicPower = calculateArabicDualPhase;
