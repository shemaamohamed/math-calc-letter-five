/**
 * Exact Fractional & Calculation Type Definitions
 * تعريفات الأنواع الرياضية للحساب الكسري الدقيق (Arbitrary-Precision BigInt)
 */

export interface FractionType {
  num: bigint;
  den: bigint;
}

export interface CycleResult {
  right: FractionType;
  mid: FractionType;
  left: FractionType;
}

export interface ModeEvaluationResult {
  modeIndex: number; // 1, 2, 3, 4
  title: string;
  description: string;
  fraction: FractionType;
  fractionString: string;
  intPart: string;
  first10AfterDot: string;
  fullDecimalString: string;
  digitsList: number[];
  unsimplifiedSum: number; // مجموع الخانات العشر
  reductionSteps: number[]; // مسار الاختزال لرقم واحد
  simplifiedSingleDigit: number; // الاختزال لرقم واحد
}

// Backwards compatibility alias
export type DecimalSquareRootResult = ModeEvaluationResult;

export interface StepBreakdownItem {
  step: number;
  title: string;
  formula: string;
  right: string;
  mid: string;
  left: string;
  sum?: string;
  notes?: string;
}

export interface SlotPhase2 {
  id: 'right' | 'mid' | 'left';
  pos: number; // 1 (يمين), 2 (وسط), 3 (يسار)
  name: string; // 'اليمين', 'الوسط', 'اليسار'
  char: string; // 'م', 'د', 'د'
  fraction: FractionType;
  fractionString: string;
  isSelected: boolean;
}

// Backwards compatibility alias
export interface SlotData extends SlotPhase2 {
  originalChar: string;
  step1Val: number | string;
  step2Frac: FractionType;
  step2Formula: string;
  step3Frac: FractionType;
  step3Formula: string;
  step4GroupFrac: FractionType;
  step5Frac: FractionType;
  step5Formula: string;
  step6RatioFrac: FractionType;
  step6Formula: string;
  finalValueFrac: FractionType;
  finalFormula: string;
}

export interface Phase1Summary {
  inputN: bigint;
  t1: bigint; // 3 * N
  cycle: CycleResult;
  sum1: FractionType; // S1 = right + mid + left
  average1: FractionType; // S1 ÷ 3
  sqrtResult: ModeEvaluationResult; // S1 ÷ 3 -> √ -> 10 خانات
  r1: number; // مجموع الخانات العشر = 47 (بدون اختزال)
  seed: number; // Alias for r1
  step1Val: number; // Alias for Number(inputN)
  stepsTable: StepBreakdownItem[];
}

export interface Phase2Summary {
  t2: bigint; // R1 مباشرة
  cycle: CycleResult;
  slots: SlotPhase2[];
  selectedCount: number;
  selectedSum: FractionType; // S2 = مجموع الكسور المحددة
  selectedAverage: FractionType; // S2 ÷ عدد الخانات المحددة

  // 4 Modes:
  // 1. S2 ← √ ← 10 خانات
  mode1: ModeEvaluationResult;
  // 2. S2 ÷ (عدد الخانات المحددة) ← √ ← 10 خانات
  mode2: ModeEvaluationResult;
  // 3. S2 ← 10 خانات (بدون جذر)
  mode3: ModeEvaluationResult;
  // 4. S2 ÷ (عدد الخانات المحددة) ← 10 خانات (بدون جذر)
  mode4: ModeEvaluationResult;

  stepsTable: StepBreakdownItem[];

  // Aliases for backwards compatibility with existing UI components:
  directSumSqrtResult: ModeEvaluationResult;
  directSumUnsimplifiedAnswer: number;
  directSumSimplifiedAnswer: number;
  directSumReductionSteps: number[];

  sqrtResult: ModeEvaluationResult;
  unsimplifiedAnswer: number;
  simplifiedAnswer: number;
  reductionSteps: number[];

  directDecimalResult: ModeEvaluationResult;
  directDecimalUnsimplifiedAnswer: number;
  directDecimalSimplifiedAnswer: number;
  directDecimalReductionSteps: number[];

  averageDecimalResult: ModeEvaluationResult;
  averageDecimalUnsimplifiedAnswer: number;
  averageDecimalSimplifiedAnswer: number;
  averageDecimalReductionSteps: number[];

  step1Val: number;
  sum1: FractionType;
  sum2: FractionType;
}

export interface CalculationState {
  inputText: string;
  inputN: bigint;
  slotChars: [string, string, string];
  phase1: Phase1Summary;
  phase2: Phase2Summary;
  selectedIndices: number[];

  // Backwards compatibility aliases
  normalizedChars: string[];
  rawChars: string[];
  totalChars: number;
}
