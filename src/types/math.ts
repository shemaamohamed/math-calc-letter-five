/**
 * Exact Fractional & Calculation Type Definitions
 * تعريفات الأنواع الرياضية للحساب فائق الدقة (Arbitrary-Precision)
 */

export interface FractionType {
  num: bigint;
  den: bigint;
}

export interface DecimalSquareRootResult {
  intPart: string;
  fracPart: string;
  fullString: string;
  first10AfterDot: string;
  digitsList: number[];
  unsimplifiedSum: number; // مجموع أول 10 أرقام بعد الفاصلة (من غير تبسيط)
  reductionSteps: number[]; // مسار الاختزال الرقمي
  simplifiedSingleDigit: number; // الرقم المفرد النهائي (بالتبسيط)
}

export interface SlotData {
  pos: number;
  char: string;
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
  isSelected: boolean;
}

export interface Phase1Summary {
  step1Val: number;
  step1Vals?: number[];
  sum1: FractionType;
  sum2: FractionType;
  step3Fractions: FractionType[];
  sum5: FractionType;
  step6Fractions: FractionType[];
  totalSum: FractionType;
  average: FractionType;
  sqrtResult: DecimalSquareRootResult;
  seed: number; // البذرة الناتجة عن القسم الأول المخفي (مثال: 41)
}

export interface Phase2Summary {
  step1Val: number; // البذرة المأخوذة من القسم الأول
  sum1: FractionType;
  sum2: FractionType;
  slots: SlotData[];
  selectedCount: number;
  selectedSum: FractionType;
  selectedAverage: FractionType;

  // 1. الجواب الأول: الجذر التربيعي لـ (المجموع ÷ عدد الخانات)
  sqrtResult: DecimalSquareRootResult;
  unsimplifiedAnswer: number; // الناتج النهائي مع التقسيم مع الجذر (من غير تبسيط)
  simplifiedAnswer: number; // الناتج النهائي مع التقسيم مع الجذر (بالتبسيط)
  reductionSteps: number[];

  // 2. الجواب الثاني: الجذر التربيعي لمجموع الخانات مباشرة
  directSumSqrtResult: DecimalSquareRootResult;
  directSumUnsimplifiedAnswer: number; // الناتج المباشر مع الجذر (من غير تبسيط)
  directSumSimplifiedAnswer: number; // الناتج المباشر مع الجذر (بالتبسيط)
  directSumReductionSteps: number[];

  // 3. الجواب الثالث: مجموع الخانات المحددة بدون جذر تربيعي (No Square Root)
  directDecimalResult: DecimalSquareRootResult;
  directDecimalUnsimplifiedAnswer: number; // الناتج المباشر بدون جذر (من غير تبسيط)
  directDecimalSimplifiedAnswer: number; // الناتج المباشر بدون جذر (بالتبسيط)
  directDecimalReductionSteps: number[];

  // 4. الجواب الرابع: (المجموع ÷ عدد الخانات) بدون جذر تربيعي (No Square Root)
  averageDecimalResult: DecimalSquareRootResult;
  averageDecimalUnsimplifiedAnswer: number; // الناتج مع التقسيم بدون جذر (من غير تبسيط)
  averageDecimalSimplifiedAnswer: number; // الناتج مع التقسيم بدون جذر (بالتبسيط)
  averageDecimalReductionSteps: number[];
}

export interface CalculationState {
  inputText: string;
  normalizedChars: string[];
  rawChars: string[];
  totalChars: number;
  phase1: Phase1Summary;
  phase2: Phase2Summary;
  selectedIndices: number[];
}
