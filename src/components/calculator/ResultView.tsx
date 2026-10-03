'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DualPhaseResult } from '@/lib/calculate';
import { Fraction } from '@/lib/fractionMath';
import {
  Sparkles,
  Check,
  CheckSquare,
  Square,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Calculator,
  Zap,
  Sliders,
  LayoutGrid,
  Table as TableIcon,
  Trophy,
  Star,
} from 'lucide-react';

interface ResultViewProps {
  result: DualPhaseResult | null;
  onToggleTransfer?: (index: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onInvertSelection?: () => void;
}

export default function ResultView({
  result,
  onToggleTransfer,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
}: ResultViewProps) {
  // View mode: 'table' or 'cards' (Matching Photos 2, 3, 4)
  const [slotsDisplayMode, setSlotsDisplayMode] = useState<'table' | 'cards'>('table');
  // Collapsible Rules Details accordion (Photo 4)
  const [showRulesDetails, setShowRulesDetails] = useState(false);

  // Invert selection handler
  const handleInvertSelection = () => {
    if (onInvertSelection) {
      onInvertSelection();
    } else if (onToggleTransfer && result) {
      result.phase2.slots.forEach((_, idx) => onToggleTransfer(idx));
    }
  };

  // Memoized values for 6-step breakdown
  const {
    charGroups,
    sum5Frac,
    v3_last,
    selectedSlots,
    selectedSlotsFormula,
  } = useMemo(() => {
    if (!result) {
      return {
        charGroups: {},
        sum5Frac: '0',
        v3_last: '0',
        selectedSlots: [],
        selectedSlotsFormula: '',
      };
    }

    const groups: Record<string, string> = {};
    result.phase2.slots.forEach(s => {
      groups[s.char] = `${s.step4GroupFrac.num}/${s.step4GroupFrac.den}`;
    });

    let s5 = new Fraction(0n, 1n);
    result.phase2.slots.forEach(s => {
      s5 = s5.add(new Fraction(s.step5Frac.num, s.step5Frac.den));
    });

    const lastIdx = result.phase2.slots.length - 1;
    const lastV3 = lastIdx >= 0
      ? `${result.phase2.slots[lastIdx].step3Frac.num}/${result.phase2.slots[lastIdx].step3Frac.den}`
      : '0';

    const selected = result.phase2.slots.filter(s => s.isSelected);
    const formula = selected.length > 0
      ? selected.map(s => `${s.finalValueFrac.num}/${s.finalValueFrac.den}`).join(' + ')
      : '0';

    return {
      charGroups: groups,
      sum5Frac: s5.toString(),
      v3_last: lastV3,
      selectedSlots: selected,
      selectedSlotsFormula: formula,
    };
  }, [result]);

  // Compute 4 Gates matching Photo 5 and Photo 3
  const gates = useMemo(() => {
    if (!result) return null;

    const { phase2, totalChars } = result;
    const { selectedSum, selectedAverage, selectedCount } = phase2;

    const divisor = selectedCount > 0 ? selectedCount : 1;

    // Helper: compute sqrt and extract digits
    const computeGateDigits = (
      fracNum: bigint,
      fracDen: bigint,
      fromWholeNumber: boolean
    ) => {
      const f = new Fraction(fracNum, fracDen);
      const sqrtRes = f.sqrtDecimal(60);
      const intPart = sqrtRes.intPart;
      const fracPart = sqrtRes.fracPart;

      let digits10 = '';
      let displayNumber = '';

      if (fromWholeNumber) {
        // Extract 10 digits starting from the beginning of the whole number (including integer part)
        const fullDigits = (intPart + fracPart).replace(/[^0-9]/g, '');
        digits10 = fullDigits.substring(0, 10);
        const intLen = intPart.length;
        const neededFrac = Math.max(0, 10 - intLen);
        displayNumber = intLen >= 10
          ? intPart.substring(0, 10)
          : `${intPart}.${fracPart.substring(0, neededFrac)}`;
      } else {
        // Extract 10 digits starting immediately after the decimal point
        digits10 = fracPart.substring(0, 10);
        displayNumber = `${intPart}.${digits10}`;
      }

      // Sum digits (Unsimplified)
      const digitsList = digits10.split('').map(d => parseInt(d, 10)).filter(d => !isNaN(d));
      const unsimplifiedSum = digitsList.reduce((acc, val) => acc + val, 0);

      // Reduction steps
      const steps: number[] = [unsimplifiedSum];
      let curr = unsimplifiedSum;
      while (curr >= 10) {
        curr = curr
          .toString()
          .split('')
          .map(d => parseInt(d, 10))
          .reduce((acc, val) => acc + val, 0);
        steps.push(curr);
      }
      const singleDigit = steps[steps.length - 1];

      // In Photo 5, steps are rendered in RTL as e.g. "9 ➔ 45" or "1 ➔ 10 ➔ 37"
      const reversedSteps = [...steps].reverse();

      return {
        displayNumber,
        digits10,
        unsimplifiedSum,
        steps,
        reversedSteps,
        singleDigit,
        intPart,
        fracPart,
      };
    };

    // Gate 1: الجواب الأول (√S - أول 10 أرقام من كامل العدد)
    const g1 = computeGateDigits(selectedSum.num, selectedSum.den, true);

    // Gate 2: الجواب الثاني (√(S/N) - أول 10 أرقام من كامل العدد)
    const g2 = computeGateDigits(selectedAverage.num, selectedAverage.den, true);

    // Gate 3: الجواب الثالث (√S - أول 10 أرقام بعد الفاصلة .)
    const g3 = computeGateDigits(selectedSum.num, selectedSum.den, false);

    // Gate 4: الجواب الرابع (√(S/N) - أول 10 أرقام بعد الفاصلة .)
    const g4 = computeGateDigits(selectedAverage.num, selectedAverage.den, false);

    return { g1, g2, g3, g4 };
  }, [result]);

  if (!result || !gates) {
    return null;
  }

  const { phase2, totalChars } = result;
  const selectedCount = phase2.selectedCount;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 dir-rtl font-cairo w-full min-w-0">
      {/* 1. TOP TRANSITION NAVIGATION BAR (Photo 1) */}
      <div className="p-3 sm:p-4 bg-slate-900/90 rounded-2xl border border-purple-500/20 shadow-xl backdrop-blur-md space-y-3 w-full min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Zap className="w-4 h-4 fill-purple-400 text-purple-400" />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-100">
              شريط تصفح الأحرف والانتقال ({totalChars} حرف)
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono">
            المنتقلة : {selectedCount}/{totalChars}
          </div>
        </div>

        {/* Slot Pills strip */}
        <div className="p-2 bg-[#060a14] rounded-xl border border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {phase2.slots.map((s, idx) => {
            const isSelected = s.isSelected;
            return (
              <button
                key={`nav-pill-${s.pos}`}
                type="button"
                onClick={() => onToggleTransfer?.(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-950/50'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span className="font-mono">{s.pos}:</span>
                <span className="font-sans font-black">{s.char}</span>
                <span className="font-mono dir-ltr text-[11px]">
                  ({s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()})
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PHASE 1 / STEP 1 CARD (Photo 1) */}
      <Card className="glass border-white/10 shadow-xl overflow-hidden w-full min-w-0">
        <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-200 font-bold text-xs">
                I
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-100">
                  الخطوة الأولى: وضع قيمة ({phase2.step1Val}) على كل خانة وتجميع الخانات
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  وضع {phase2.step1Val} على كل خانة ➔ جمع قيم الخانات ➔ الناتج النهائي {phase2.sum1.num.toString()} = S1
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-black font-mono">
              {phase2.sum1.num.toString()}/{phase2.sum1.den.toString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 space-y-4">
          {/* Subheading: 1. وضع القيمة الثابتة لكل خانة */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span>• 1. وضع القيمة الثابتة ({phase2.step1Val}) لكل خانة:</span>
            </div>

            <div className="p-3.5 bg-black/50 rounded-2xl border border-white/5 flex items-center justify-center gap-3 flex-wrap">
              {phase2.slots.map(s => (
                <div
                  key={`step1-slot-${s.pos}`}
                  className="w-20 sm:w-24 p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-center flex flex-col items-center gap-1 shadow-md shadow-purple-950/20"
                >
                  <span className="text-[10px] text-slate-400 font-mono">الخانة #{s.pos}</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono dir-rtl">
                    = {s.step1Val}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white font-sans mt-0.5">
                    {s.char}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 3 Summary Cards matching Photo 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 2. خطوة التجميع */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                2. خطوة التجميع (جمع قيم الخانات):
              </span>
              <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 text-center font-mono">
                <span className="text-cyan-400 font-black text-sm dir-rtl">
                  {phase2.sum1.num.toString()}
                </span>
                <span className="text-slate-300 font-bold text-xs mx-1">=</span>
                <span className="text-slate-300 font-bold text-xs">
                  {phase2.slots.map(s => s.step1Val).join(' + ')}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 text-center mt-2 block">
                مجموع قيم الخانات = {phase2.sum1.num.toString()}
              </span>
            </div>

            {/* 3. منطق المعادلة */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                3. منطق المعادلة:
              </span>
              <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 text-center font-mono">
                <span className="text-amber-400 font-black text-xs sm:text-sm">
                  Σ(قيم الخانات {phase2.step1Val}) = S1
                </span>
              </div>
              <span className="text-[10px] text-slate-500 text-center mt-2 block font-mono">
                {phase2.sum1.num.toString()} = {phase2.slots.map(s => s.step1Val).join(' + ')}
              </span>
            </div>

            {/* 4. الناتج النهائي للخطوة الأولى */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-300 block mb-2">
                4. الناتج النهائي للخطوة الأولى (S1):
              </span>
              <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 text-center font-mono">
                <span className="text-white font-black text-base sm:text-lg">
                  {phase2.sum1.num.toString()}/{phase2.sum1.den.toString()}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 text-center mt-2 block">
                الناتج المعتمد للخطوة الأولى = {phase2.sum1.num.toString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. PRIMARY 6-STEP TABLE & CARDS SECTION (Photos 2, 3, 4) */}
      <Card className="glass border-white/10 shadow-2xl overflow-hidden w-full min-w-0">
        <CardHeader className="p-3 sm:p-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex flex-col gap-3">
            {/* Title & View Mode & Rules Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-100">
                    جدول التحليل والخطوات الست (Arbitrary-Precision 6 Steps)
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                    حسابات كسرية دقيقة 100% بدون أي تقريب وفق الشرح والورقة اليدوية مع أزرار الانتقال التفاعلية.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {/* Rules Details Button */}
                <button
                  type="button"
                  onClick={() => setShowRulesDetails(!showRulesDetails)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>تفاصيل القواعد</span>
                  {showRulesDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* View Toggle: بطاقات / جدول */}
                <div className="flex items-center p-1 bg-black/60 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSlotsDisplayMode('cards')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      slotsDisplayMode === 'cards'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>بطاقات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotsDisplayMode('table')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      slotsDisplayMode === 'table'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>جدول</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Control Actions Row (Photos 2, 4) */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>تحديد الكل ({totalChars})</span>
                </button>
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-950/20 text-amber-300 hover:bg-amber-900/30 border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 text-amber-400" />
                  <span>إلغاء التحديد</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleInvertSelection}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                <span>عكس</span>
              </button>
            </div>

            {/* Collapsible Rules Details: Mathematical 6-Step Breakdown (Photo 4) */}
            {showRulesDetails && (
              <div className="pt-2 animate-in fade-in duration-300 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ملخص الخطوات الرياضية الست (Mathematical 6-Step Breakdown):</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                  {/* Step 1 */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">1. مجموع خطوة 1 (S1):</span>
                    <span className="text-sm font-black text-white font-mono my-1">
                      {phase2.sum1.num.toString()}/{phase2.sum1.den.toString()}
                    </span>
                    <span className="text-[9px] text-slate-400">الخانة الأخيرة = {phase2.step1Val}</span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">2. مجموع خطوة 2 (S2):</span>
                    <span className="text-sm font-black text-cyan-300 font-mono my-1">
                      {phase2.sum2.num.toString()}/{phase2.sum2.den.toString()}
                    </span>
                    <span className="text-[9px] text-slate-400">(الخانة ÷ آخر خانة × الخانة)</span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">3. مجموع خطوة 3 (S3):</span>
                    <span className="text-sm font-black text-white font-mono my-1">
                      {phase2.sum1.num.toString()}/{phase2.sum1.den.toString()}
                    </span>
                    <span className="text-[9px] text-slate-400">(خطوة 2 ÷ S2) × S1</span>
                  </div>

                  {/* Step 4 */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">4. المتغيرات (جمع طبيعي):</span>
                    <div className="flex flex-wrap items-center justify-center gap-1 my-1">
                      {Object.entries(charGroups).map(([c, val]) => (
                        <span
                          key={`group-pill-${c}`}
                          className="px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-500/40 text-purple-200 text-[10px] font-mono font-bold"
                        >
                          {c} : {val}
                        </span>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-400">تجميع نواتج خطوة 3</span>
                  </div>

                  {/* Step 5 */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">5. مجموع خطوة 5 (S5):</span>
                    <span className="text-sm font-black text-amber-300 font-mono my-1">{sum5Frac}</span>
                    <span className="text-[9px] text-slate-400">(خطوة 3 ÷ {v3_last} × 100)</span>
                  </div>

                  {/* Step 6 */}
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">6. مجموع نسب خطوة 6:</span>
                    <span className="text-sm font-black text-emerald-400 font-mono my-1">100%</span>
                    <span className="text-[9px] text-slate-400">(خطوة 5 ÷ 100 × S5)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 space-y-4">
          {/* Table View (Photo 2 & 4) */}
          {slotsDisplayMode === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 shadow-inner scrollbar-thin">
              <table className="w-full text-xs text-right border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold text-[11px]">
                    <th className="p-2.5 text-center">الخانة (الترتيب)</th>
                    <th className="p-2.5 text-center">حرف</th>
                    <th className="p-2.5 text-center">خطوة 1 (القيمة {phase2.step1Val})</th>
                    <th className="p-2.5 text-center">خطوة 2 (+ أخر خانة × نفسها)</th>
                    <th className="p-2.5 text-center">خطوة 3 (S2 × S1 ÷)</th>
                    <th className="p-2.5 text-center">خطوة 4 (المتغير الحرفي)</th>
                    <th className="p-2.5 text-center">خطوة 5 (+ آخر 3 × 100)</th>
                    <th className="p-2.5 text-center">خطوة 6 (النسبة: ÷ 100 × S5)</th>
                    <th className="p-2.5 text-center">الناتج المعتمد (المتغير × النسبة 6)</th>
                    <th className="p-2.5 text-center">زر الانتقال (تحديد/تمرير)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {phase2.slots.map((s, idx) => {
                    const isSelected = s.isSelected;
                    return (
                      <tr
                        key={`table-row-${s.pos}`}
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-950/10 hover:bg-emerald-950/20' : 'opacity-40 hover:opacity-70'
                        }`}
                      >
                        {/* الخانة */}
                        <td className="p-2.5 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
                            #{s.pos}
                          </span>
                        </td>

                        {/* الحرف */}
                        <td className="p-2.5 text-center font-sans">
                          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 font-black text-sm flex items-center justify-center mx-auto shadow-sm">
                            {s.char}
                          </div>
                        </td>

                        {/* خطوة 1 */}
                        <td className="p-2.5 text-center text-white font-bold">
                          {s.step1Val}
                        </td>

                        {/* خطوة 2 */}
                        <td className="p-2.5 text-center">
                          <div className="font-bold text-cyan-300 dir-ltr">
                            {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}
                          </div>
                          <span className="text-[9px] text-slate-500 block font-sans">
                            {s.pos} × {totalChars} ÷ {s.pos}
                          </span>
                        </td>

                        {/* خطوة 3 */}
                        <td className="p-2.5 text-center">
                          <div className="font-bold text-white dir-ltr">
                            {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()}
                          </div>
                          <span className="text-[9px] text-slate-500 block font-sans">
                            {phase2.sum1.num.toString()} × {phase2.sum2.num.toString()}/{phase2.sum2.den.toString()} ÷ {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}
                          </span>
                        </td>

                        {/* خطوة 4 */}
                        <td className="p-2.5 text-center">
                          <div className="font-bold text-purple-300 dir-ltr">
                            {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}
                          </div>
                          <span className="text-[9px] text-slate-500 block font-sans">({s.char})</span>
                        </td>

                        {/* خطوة 5 */}
                        <td className="p-2.5 text-center">
                          <div className="font-bold text-amber-300 dir-ltr">
                            {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}
                          </div>
                          <span className="text-[9px] text-slate-500 block font-sans">
                            100 × {v3_last} ÷ {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()}
                          </span>
                        </td>

                        {/* خطوة 6 */}
                        <td className="p-2.5 text-center">
                          <div className="font-bold text-cyan-300 dir-ltr">
                            {s.step6RatioFrac.den === 1n
                              ? `${s.step6RatioFrac.num.toString()}%`
                              : `${s.step6RatioFrac.num.toString()}/${s.step6RatioFrac.den.toString()}%`}
                          </div>
                          <span className="text-[9px] text-slate-500 block font-sans">
                            100 × {sum5Frac} ÷ {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}
                          </span>
                        </td>

                        {/* الناتج المعتمد */}
                        <td className="p-2.5 text-center">
                          <div className="font-black text-emerald-400 text-sm dir-ltr">
                            {s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()}
                          </div>
                          <span className="text-[9px] text-emerald-400/70 block font-sans">
                            {s.step6RatioFrac.den === 1n
                              ? `${s.step6RatioFrac.num.toString()}%`
                              : `${s.step6RatioFrac.num.toString()}/${s.step6RatioFrac.den.toString()}%`}{' '}
                            × {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}
                          </span>
                        </td>

                        {/* زر الانتقال */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleTransfer?.(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-sm ${
                              isSelected
                                ? 'bg-[#10b981] hover:bg-[#059669] text-white shadow-emerald-950/40'
                                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Square className="w-3.5 h-3.5" />}
                            <span>انتقال</span>
                            <ArrowLeftRight className="w-3 h-3 text-white/80" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View (Photo 3) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {phase2.slots.map((s, idx) => {
                const isSelected = s.isSelected;
                return (
                  <div
                    key={`cards-slot-${s.pos}`}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 select-none relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-purple-950/30 to-slate-900/80 border-purple-500/40 shadow-lg shadow-purple-950/30'
                        : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-80'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">الخانة #{s.pos}</span>
                        <span className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 font-black text-sm flex items-center justify-center">
                          {s.char}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleTransfer?.(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#10b981] hover:bg-[#059669] text-white shadow-sm'
                            : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>انتقال</span>
                        <ArrowLeftRight className="w-3 h-3 text-white/80" />
                      </button>
                    </div>

                    {/* Body: Micro steps list matching Photo 3 */}
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-[10px] font-mono text-slate-400 leading-relaxed">
                      <div>
                        1 (القيمة: {s.step1Val}) .. 2 (تعديل: {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}) .. 3 (مركب: {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()})
                      </div>
                      <div>
                        4 (المتغير: {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}) .. 5 (+ آخر 3: {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}) .. 6 (النسبة: {s.step6RatioFrac.den === 1n ? `${s.step6RatioFrac.num}%` : `${s.step6RatioFrac.num}/${s.step6RatioFrac.den}%`})
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-sans">الناتج المعتمد:</span>
                      <span className="text-base font-black text-cyan-400 font-mono dir-ltr">
                        {s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Cells Summary Banner (Bottom of Photo 2 & 3) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-emerald-300">
                  ملخص الخانات المنتقلة (Selected Cells Summary)
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  عدد الخانات المنتقلة (SNS): <strong className="text-white font-mono">{selectedCount}</strong> / {totalChars} | المجموع الكسري (SSS):{' '}
                  <strong className="text-emerald-300 font-mono font-bold dir-ltr">
                    {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
                  </strong>
                </p>
              </div>
            </div>

            <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-black font-mono text-sm dir-ltr self-start sm:self-auto shadow-inner">
              S = {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. THE 4 GATES RESULTS SECTION (Photos 3 & 5) */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🟨</span>
            <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
              <span>القسم الثاني: قسم النتائج (بوابات الإجابات الأربعة 🟨)</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
          </div>
          <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-slate-400 text-xs font-mono font-bold">
            Gates Output 4
          </div>
        </div>

        {/* 4 Gates Grid (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GATE 1: الجواب الأول 🏆 (Photo 5 - Right Card) */}
          <Card className="glass overflow-hidden border-amber-500/30 bg-black/40 shadow-inner relative group">
            <CardHeader className="py-3 px-4 border-b border-white/10 bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟨</span>
                  <span className="text-sm sm:text-base font-black text-amber-300 tracking-wide flex items-center gap-1.5">
                    <span>الجواب الأول</span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-200 mt-1">
                الجذر التربيعي لمجموع الخانات (أول 10 أرقام من كامل العدد)
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                جمع الخانات المحددة ➔ سكوير رووت للناتج ➔ حساب أول 10 من الجواب
              </p>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Box 1: صيغة جمع الخانات */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  1. صيغة جمع الخانات المحددة:
                </span>
                <div className="p-2 bg-black/60 rounded-xl border border-white/5 text-xs font-mono text-center overflow-x-auto">
                  <span className="dir-ltr text-amber-300 font-bold whitespace-nowrap">
                    S = {selectedSlotsFormula} ={' '}
                    <span className="text-emerald-400 font-black">
                      {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
                    </span>
                  </span>
                </div>
              </div>

              {/* Box 2: الجذر التربيعي للكسر */}
              <div className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-amber-400 font-mono dir-ltr">
                  ({phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()})√
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  2. الجذر التربيعي للكسر:
                </span>
              </div>

              {/* Box 3: الناتج العشري المستخرج (10 أرقام) */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-300 block text-right">
                  3. الناتج العشري المستخرج (10 أرقام):
                </span>
                <div className="p-3 bg-black/80 rounded-xl border border-amber-500/20 text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-widest dir-ltr inline-block">
                    {gates.g1.displayNumber}
                  </span>
                </div>
              </div>

              {/* Box 4: الأرقام المستخرجة ومسار الاختزال */}
              <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 dir-ltr text-sm">
                    {gates.g1.digits10}
                  </span>
                  <span className="text-slate-400">الأرقام ال 10 المستخرجة:</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-amber-300 dir-ltr">
                    {gates.g1.reversedSteps.join(' ➔ ')}
                  </span>
                  <span className="text-slate-400">4. خطوات الاختزال والجمع:</span>
                </div>

                {/* Final Single Digit Badge */}
                <div className="pt-2 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    {gates.g1.singleDigit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GATE 2: الجواب الثاني 🟊 (Photo 5 - Left Card) */}
          <Card className="glass overflow-hidden border-cyan-500/30 bg-black/40 shadow-inner relative group">
            <CardHeader className="py-3 px-4 border-b border-white/10 bg-cyan-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟨</span>
                  <span className="text-sm sm:text-base font-black text-cyan-300 tracking-wide flex items-center gap-1.5">
                    <span>الجواب الثاني</span>
                    <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-200 mt-1">
                الجذر التربيعي لـ (المجموع ÷ عدد الخانات) (أول 10 أرقام من كامل العدد)
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                جمع الخانات ➔ تقسيم على عدد الخانات ➔ سكوير رووت ➔ حساب أول 10 من الجواب
              </p>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Box 1: صيغة جمع الخانات المحددة */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  1. صيغة جمع الخانات المحددة:
                </span>
                <div className="p-2 bg-black/60 rounded-xl border border-white/5 text-xs font-mono text-center overflow-x-auto">
                  <span className="dir-ltr text-cyan-300 font-bold whitespace-nowrap">
                    {phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()} ={' '}
                    {selectedCount} ÷ {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
                  </span>
                </div>
              </div>

              {/* Box 2: الجذر التربيعي للكسر */}
              <div className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-cyan-400 font-mono dir-ltr">
                  ({phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()})√
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  2. الجذر التربيعي للكسر:
                </span>
              </div>

              {/* Box 3: الناتج العشري المستخرج (10 أرقام) */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-cyan-300 block text-right">
                  3. الناتج العشري المستخرج (10 أرقام):
                </span>
                <div className="p-3 bg-black/80 rounded-xl border border-cyan-500/20 text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-widest dir-ltr inline-block">
                    {gates.g2.displayNumber}
                  </span>
                </div>
              </div>

              {/* Box 4: الأرقام المستخرجة ومسار الاختزال */}
              <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400 dir-ltr text-sm">
                    {gates.g2.digits10}
                  </span>
                  <span className="text-slate-400">الأرقام ال 10 المستخرجة:</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-cyan-300 dir-ltr">
                    {gates.g2.reversedSteps.join(' ➔ ')}
                  </span>
                  <span className="text-slate-400">4. خطوات الاختزال والجمع:</span>
                </div>

                {/* Final Single Digit Badge */}
                <div className="pt-2 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500/60 text-cyan-300 font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {gates.g2.singleDigit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GATE 3: الجواب الثالث ⚡ (√S - أول 10 أرقام بعد الفاصلة .) */}
          <Card className="glass overflow-hidden border-purple-500/30 bg-black/40 shadow-inner relative group">
            <CardHeader className="py-3 px-4 border-b border-white/10 bg-purple-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟨</span>
                  <span className="text-sm sm:text-base font-black text-purple-300 tracking-wide flex items-center gap-1.5">
                    <span>الجواب الثالث</span>
                    <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-200 mt-1">
                الجذر التربيعي لمجموع الخانات (أول 10 أرقام بعد الفاصلة .)
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                جمع الخانات المحددة ➔ سكوير رووت للناتج ➔ حساب أول 10 بعد الفاصلة
              </p>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Box 1 */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  1. صيغة جمع الخانات المحددة:
                </span>
                <div className="p-2 bg-black/60 rounded-xl border border-white/5 text-xs font-mono text-center overflow-x-auto">
                  <span className="dir-ltr text-purple-300 font-bold whitespace-nowrap">
                    S = {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
                  </span>
                </div>
              </div>

              {/* Box 2 */}
              <div className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-purple-400 font-mono dir-ltr">
                  ({phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()})√
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  2. الجذر التربيعي للكسر:
                </span>
              </div>

              {/* Box 3 */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-purple-300 block text-right">
                  3. الناتج العشري المستخرج (10 أرقام بعد الفاصلة):
                </span>
                <div className="p-3 bg-black/80 rounded-xl border border-purple-500/20 text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tracking-widest dir-ltr inline-block">
                    {gates.g3.displayNumber}
                  </span>
                </div>
              </div>

              {/* Box 4 */}
              <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-400 dir-ltr text-sm">
                    {gates.g3.digits10}
                  </span>
                  <span className="text-slate-400">الأرقام ال 10 المستخرجة (بعد الفاصلة):</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-purple-300 dir-ltr">
                    {gates.g3.reversedSteps.join(' ➔ ')}
                  </span>
                  <span className="text-slate-400">4. خطوات الاختزال والجمع:</span>
                </div>

                <div className="pt-2 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500/60 text-purple-300 font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    {gates.g3.singleDigit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GATE 4: الجواب الرابع 🔢 (√(S/N) - أول 10 أرقام بعد الفاصلة .) */}
          <Card className="glass overflow-hidden border-emerald-500/30 bg-black/40 shadow-inner relative group">
            <CardHeader className="py-3 px-4 border-b border-white/10 bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟨</span>
                  <span className="text-sm sm:text-base font-black text-emerald-300 tracking-wide flex items-center gap-1.5">
                    <span>الجواب الرابع</span>
                    <span className="font-mono text-sm">#4</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-200 mt-1">
                الجذر التربيعي لـ (المجموع ÷ عدد الخانات) (أول 10 أرقام بعد الفاصلة .)
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                جمع الخانات ➔ تقسيم على عدد الخانات ➔ سكوير رووت ➔ حساب أول 10 بعد الفاصلة
              </p>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Box 1 */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  1. صيغة جمع الخانات المحددة:
                </span>
                <div className="p-2 bg-black/60 rounded-xl border border-white/5 text-xs font-mono text-center overflow-x-auto">
                  <span className="dir-ltr text-emerald-300 font-bold whitespace-nowrap">
                    {phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()} ={' '}
                    {selectedCount} ÷ {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
                  </span>
                </div>
              </div>

              {/* Box 2 */}
              <div className="flex items-center justify-between p-2 bg-black/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-emerald-400 font-mono dir-ltr">
                  ({phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()})√
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  2. الجذر التربيعي للكسر:
                </span>
              </div>

              {/* Box 3 */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 block text-right">
                  3. الناتج العشري المستخرج (10 أرقام بعد الفاصلة):
                </span>
                <div className="p-3 bg-black/80 rounded-xl border border-emerald-500/20 text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-widest dir-ltr inline-block">
                    {gates.g4.displayNumber}
                  </span>
                </div>
              </div>

              {/* Box 4 */}
              <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 dir-ltr text-sm">
                    {gates.g4.digits10}
                  </span>
                  <span className="text-slate-400">الأرقام ال 10 المستخرجة (بعد الفاصلة):</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-emerald-300 dir-ltr">
                    {gates.g4.reversedSteps.join(' ➔ ')}
                  </span>
                  <span className="text-slate-400">4. خطوات الاختزال والجمع:</span>
                </div>

                <div className="pt-2 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {gates.g4.singleDigit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
