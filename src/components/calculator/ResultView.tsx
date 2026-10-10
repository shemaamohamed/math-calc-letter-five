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
  Calculator,
  LayoutGrid,
  Table as TableIcon,
  Trophy,
  Info,
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
  // View mode: 'table' or 'cards'
  const [slotsDisplayMode, setSlotsDisplayMode] = useState<'table' | 'cards'>('table');
  // Collapsible Rules Details accordion
  const [showRulesDetails, setShowRulesDetails] = useState(false);

  // Invert selection handler
  const handleInvertSelection = () => {
    if (onInvertSelection) {
      onInvertSelection();
    } else if (onToggleTransfer && result) {
      result.phase2.slots.forEach((_, idx) => onToggleTransfer(idx));
    }
  };

  // Helper: Dotted Digits Rendering for 10 digits after dot
  const renderDottedDigits = (intPart: string, first10Digits: string) => {
    const digits = first10Digits.split('');
    return (
      <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs sm:text-sm dir-ltr">
        <span className="text-slate-300 font-bold">{intPart}.</span>
        <div className="inline-flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/10">
          {digits.map((digit, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-0.5 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              <span className="text-amber-300 font-black">{digit}</span>
            </div>
          ))}
        </div>
        <span className="text-slate-500 font-medium">...</span>
      </div>
    );
  };

  // Memoized values for 6-step breakdown
  const {
    charGroups,
    sum5Frac,
    v3_last,
    selectedSlotsFormula,
  } = useMemo(() => {
    if (!result) {
      return {
        charGroups: {},
        sum5Frac: '0',
        v3_last: '0',
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
      selectedSlotsFormula: formula,
    };
  }, [result]);

  if (!result) {
    return null;
  }

  const { phase2, totalChars } = result;
  const selectedCount = phase2.selectedCount;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 dir-rtl font-cairo w-full min-w-0">
      {/* ============================================================ */}
      {/* أولاً (أعلى الصفحة): قسم الأجوبة النهائية الأربعة          */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-100">
              قسم النتائج النهائي (جدول الأجوبة الأربعة 4 Final Answers)
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
              <span className="font-sans text-[11px] text-purple-300">بذرة القسم الأول:</span>
              <span className="text-amber-400 font-black text-sm">{result.phase1.seed}</span>
              <span className="text-[10px] text-slate-400 font-sans">(أساس 260 ➔ S1 = {result.phase1.sum1.num.toString()})</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
              4 Final Answers
            </div>
          </div>
        </div>

        {/* ── الجواب الأول ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-950/30 via-slate-900/80 to-slate-900/90 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-500" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-purple-300">
                🏆 الجواب الأول: جمع 6 ثم حساب أول 10 بعد (.) مع الجذر التربيعي
              </h3>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                √({phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()})
              </span>
            </div>
          </div>

          {/* Calculations Breakdown */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">1. صيغة مجموع الخانات المحددة:</span>
              <span className="dir-ltr text-purple-300 font-bold overflow-x-auto whitespace-nowrap">
                S = {selectedSlotsFormula} ={' '}
                <span className="text-purple-400 font-black">
                  {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400">2. الجذر التربيعي للكسر:</span>
              <span className="dir-ltr text-cyan-300 font-bold">
                √({phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()})
              </span>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                3. الناتج العشري المستخرج (10 أرقام بعد الفاصلة):
              </span>
              {renderDottedDigits(
                phase2.directSumSqrtResult.intPart,
                phase2.directSumSqrtResult.first10AfterDot
              )}
              <div className="text-center text-[10px] text-purple-300 font-sans pt-0.5">
                {phase2.directSumSqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-purple-200 text-xs font-mono">
                  {phase2.directSumUnsimplifiedAnswer}
                </strong>
              </div>
            </div>
          </div>

          {/* الخانتان للجواب الأول */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* خانة: من غير تبسيط */}
            <Card className="glass overflow-hidden border-purple-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-purple-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-purple-300">
                    من غير تبسيط
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                    Unsimplified
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الأرقام العشرية الـ 10:</span>
                <div className="text-4xl font-black text-purple-400 font-mono drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                  {phase2.directSumUnsimplifiedAnswer}
                </div>
              </CardContent>
            </Card>

            {/* خانة: مع التبسيط */}
            <Card className="glass overflow-hidden border-indigo-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-indigo-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-indigo-300">
                    مع التبسيط
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                    Simplified Root
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">مسار الاختزال:</span>
                  <span className="text-[11px] text-indigo-300 font-mono font-bold dir-ltr">
                    {phase2.directSumReductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border-2 border-indigo-500/60 text-indigo-300 font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                  {phase2.directSumSimplifiedAnswer}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── الجواب الثاني ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-950/30 via-slate-900/80 to-slate-900/90 border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <h3 className="text-sm sm:text-base font-black text-blue-300">
                ⭐ الجواب الثاني: جمع 6 تقسيم على عدد الخانات ثم حساب أول 10 بعد (.) مع الجذر التربيعي
              </h3>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                √({phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()})
              </span>
            </div>
          </div>

          {/* Calculations Breakdown */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">1. صيغة المتوسط الكسري:</span>
              <span className="dir-ltr text-blue-300 font-bold overflow-x-auto whitespace-nowrap">
                ({phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}) ÷ {selectedCount} ={' '}
                <span className="text-blue-400 font-black">
                  {phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()}
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400">2. الجذر التربيعي للكسر:</span>
              <span className="dir-ltr text-cyan-300 font-bold">
                √({phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()})
              </span>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                3. الناتج العشري المستخرج (10 أرقام بعد الفاصلة):
              </span>
              {renderDottedDigits(
                phase2.sqrtResult.intPart,
                phase2.sqrtResult.first10AfterDot
              )}
              <div className="text-center text-[10px] text-blue-300 font-sans pt-0.5">
                {phase2.sqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-blue-200 text-xs font-mono">
                  {phase2.unsimplifiedAnswer}
                </strong>
              </div>
            </div>
          </div>

          {/* الخانتان للجواب الثاني */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* خانة: من غير تبسيط */}
            <Card className="glass overflow-hidden border-blue-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-blue-300">
                    من غير تبسيط
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                    Unsimplified
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الأرقام العشرية الـ 10:</span>
                <div className="text-4xl font-black text-blue-400 font-mono drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                  {phase2.unsimplifiedAnswer}
                </div>
              </CardContent>
            </Card>

            {/* خانة: مع التبسيط */}
            <Card className="glass overflow-hidden border-cyan-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-cyan-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-cyan-300">
                    مع التبسيط
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                    Simplified Root
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">مسار الاختزال:</span>
                  <span className="text-[11px] text-cyan-300 font-mono font-bold dir-ltr">
                    {phase2.reductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-500/60 text-cyan-300 font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  {phase2.simplifiedAnswer}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── الجواب الثالث (إضافة جديدة - بدون جذر تربيعي) ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-900/90 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <h3 className="text-sm sm:text-base font-black text-amber-300">
                💎 الجواب الثالث: جمع 6 حساب أول 10 بعد (.) (بدون جذر تربيعي)
              </h3>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
              </span>
            </div>
          </div>

          {/* Calculations Breakdown */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">1. صيغة مجموع الخانات المحددة (SSS):</span>
              <span className="dir-ltr text-amber-300 font-bold overflow-x-auto whitespace-nowrap">
                S = {selectedSlotsFormula} ={' '}
                <span className="text-amber-400 font-black">
                  {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400">2. التحويل العشري المباشر (Decimal Form - بدون جذر):</span>
              <span className="dir-ltr text-yellow-300 font-bold">
                {phase2.directDecimalResult.fullString.substring(0, 25)}...
              </span>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                3. الناتج العشري المستخرج (أول 10 أرقام بعد الفاصلة):
              </span>
              {renderDottedDigits(
                phase2.directDecimalResult.intPart,
                phase2.directDecimalResult.first10AfterDot
              )}
              <div className="text-center text-[10px] text-amber-300 font-sans pt-0.5">
                {phase2.directDecimalResult.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-amber-200 text-xs font-mono">
                  {phase2.directDecimalUnsimplifiedAnswer}
                </strong>
              </div>
            </div>
          </div>

          {/* الخانتان للجواب الثالث */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* خانة: من غير تبسيط */}
            <Card className="glass overflow-hidden border-amber-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-amber-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-amber-300">
                    من غير تبسيط
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Unsimplified (No Sqrt)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الأرقام العشرية الـ 10:</span>
                <div className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                  {phase2.directDecimalUnsimplifiedAnswer}
                </div>
              </CardContent>
            </Card>

            {/* خانة: مع التبسيط */}
            <Card className="glass overflow-hidden border-orange-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-orange-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-orange-300">
                    مع التبسيط
                  </span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                    Simplified (No Sqrt)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">مسار الاختزال:</span>
                  <span className="text-[11px] text-orange-300 font-mono font-bold dir-ltr">
                    {phase2.directDecimalReductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/60 text-orange-300 font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  {phase2.directDecimalSimplifiedAnswer}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── الجواب الرابع (إضافة جديدة - بدون جذر تربيعي) ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-950/30 via-slate-900/80 to-slate-900/90 border border-emerald-500/40 shadow-[0_0_30px_rgba(160,185,129,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <h3 className="text-sm sm:text-base font-black text-emerald-300">
                🚀 الجواب الرابع: جمع 6 تقسيم على عدد الخانات حساب أول 10 بعد (.) (بدون جذر)
              </h3>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                {phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()}
              </span>
            </div>
          </div>

          {/* Calculations Breakdown */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">1. صيغة القسمة المباشرة:</span>
              <span className="dir-ltr text-emerald-300 font-bold overflow-x-auto whitespace-nowrap">
                ({phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}) ÷ {selectedCount} ={' '}
                <span className="text-emerald-400 font-black">
                  {phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()}
                </span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400">2. التحويل العشري المباشر (Decimal Form - بدون جذر):</span>
              <span className="dir-ltr text-teal-300 font-bold">
                {phase2.averageDecimalResult.fullString.substring(0, 25)}...
              </span>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                3. الناتج العشري المستخرج (أول 10 أرقام بعد الفاصلة):
              </span>
              {renderDottedDigits(
                phase2.averageDecimalResult.intPart,
                phase2.averageDecimalResult.first10AfterDot
              )}
              <div className="text-center text-[10px] text-emerald-300 font-sans pt-0.5">
                {phase2.averageDecimalResult.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-emerald-200 text-xs font-mono">
                  {phase2.averageDecimalUnsimplifiedAnswer}
                </strong>
              </div>
            </div>
          </div>

          {/* الخانتان للجواب الرابع */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* خانة: من غير تبسيط */}
            <Card className="glass overflow-hidden border-emerald-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-emerald-300">
                    من غير تبسيط
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Unsimplified (No Sqrt)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الأرقام العشرية الـ 10:</span>
                <div className="text-4xl font-black text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                  {phase2.averageDecimalUnsimplifiedAnswer}
                </div>
              </CardContent>
            </Card>

            {/* خانة: مع التبسيط */}
            <Card className="glass overflow-hidden border-teal-500/30 bg-black/40 shadow-inner">
              <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-teal-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-teal-300">
                    مع التبسيط
                  </span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
                    Simplified (No Sqrt)
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">مسار الاختزال:</span>
                  <span className="text-[11px] text-teal-300 font-mono font-bold dir-ltr">
                    {phase2.averageDecimalReductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-teal-500/20 border-2 border-teal-500/60 text-teal-300 font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                  {phase2.averageDecimalSimplifiedAnswer}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ثانياً: قسم خانات الأحرف والتفاصيل                         */}
      {/* ============================================================ */}
      <Card className="glass border-white/10 shadow-2xl overflow-hidden w-full min-w-0">
        {/* Step 1 Card Summary */}
        <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-200 font-bold text-xs">
                I
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-100">
                  الخطوة الأولى: القيمة البذرية المعتمدة ({phase2.step1Val})
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  اعتماد البذرة المستخرجة من القسم الأول ➔ القيمة المعتمدة {phase2.step1Val} = S1
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-black font-mono">
              {phase2.sum1.num.toString()}/{phase2.sum1.den.toString()}
            </div>
          </div>
        </CardHeader>

        {/* 6-Step Table Header & Controls */}
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
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>تفاصيل القواعد</span>
                  {showRulesDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* View Toggle: جدول / بطاقات */}
                <div className="flex items-center p-1 bg-black/60 rounded-xl border border-white/10">
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
                </div>
              </div>
            </div>

            {/* Collapsible Rules Details: Mathematical 6-Step Breakdown */}
            {showRulesDetails && (
              <div className="pt-2 animate-in fade-in duration-300 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ملخص الخطوات الرياضية الست (Mathematical 6-Step Breakdown):</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">1. مجموع خطوة 1 (S1):</span>
                    <span className="text-sm font-black text-white font-mono my-1">
                      {phase2.sum1.num.toString()}/{phase2.sum1.den.toString()}
                    </span>
                    <span className="text-[9px] text-slate-400">الخانة الأخيرة = {phase2.step1Val}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">2. مجموع خطوة 2 (S2):</span>
                    <span className="text-sm font-black text-cyan-300 font-mono my-1">
                      {phase2.sum2.num.toString()}/{phase2.sum2.den.toString()}
                    </span>
                    <span className="text-[9px] text-slate-400">(الخانة ÷ آخر خانة × الخانة)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">3. مجموع خطوة 3 (S3):</span>
                    <span className="text-sm font-black text-white font-mono my-1">
                      {phase2.sum1.num.toString()}/{phase2.sum1.den.toString()}
                    </span>
                    <span className="text-[9px] text-slate-400">(خطوة 2 ÷ S2) × S1</span>
                  </div>

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

                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">5. مجموع خطوة 5 (S5):</span>
                    <span className="text-sm font-black text-amber-300 font-mono my-1">{sum5Frac}</span>
                    <span className="text-[9px] text-slate-400">(خطوة 3 ÷ {v3_last} × 100)</span>
                  </div>

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
          {/* Table View */}
          {slotsDisplayMode === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 shadow-inner scrollbar-thin">
              <table className="w-full text-xs text-right border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold text-[11px]">
                    <th className="p-2.5 text-center">الخانة (الترتيب)</th>
                    <th className="p-2.5 text-center">حرف</th>
                    <th className="p-2.5 text-center">خطوة 1 (القيمة {phase2.step1Val})</th>
                    <th className="p-2.5 text-center">خطوة 2 ((الخانة ÷ عدد الخانات) × الخانة)</th>
                    <th className="p-2.5 text-center">خطوة 3 ((خطوة 2 ÷ S2) × S1)</th>
                    <th className="p-2.5 text-center">خطوة 4 (المتغير الحرفي)</th>
                    <th className="p-2.5 text-center">خطوة 5 (خطوة 3 ÷ آخر خانة × 100)</th>
                    <th className="p-2.5 text-center">خطوة 6 (النسبة %: خطوة 5 ÷ S5 × 100)</th>
                    <th className="p-2.5 text-center">الناتج المعتمد (خطوة 4 × النسبة 6)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {phase2.slots.map((s, idx) => {
                    const isSelected = s.isSelected;
                    return (
                      <tr
                        key={`table-row-${s.pos}`}
                        onClick={() => onToggleTransfer?.(idx)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'opacity-40 hover:opacity-70'
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
                            #{s.pos}
                          </span>
                        </td>

                        <td className="p-2.5 text-center font-sans">
                          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 font-black text-sm flex items-center justify-center mx-auto shadow-sm">
                            {s.char}
                          </div>
                        </td>

                        <td className="p-2.5 text-center text-white font-bold">
                          {s.step1Val}
                        </td>

                        <td className="p-2.5 text-center">
                          <div className="font-bold text-cyan-300 dir-ltr">
                            {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}
                          </div>
                        </td>

                        <td className="p-2.5 text-center">
                          <div className="font-bold text-white dir-ltr">
                            {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()}
                          </div>
                        </td>

                        <td className="p-2.5 text-center">
                          <div className="font-bold text-purple-300 dir-ltr">
                            {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}
                          </div>
                        </td>

                        <td className="p-2.5 text-center">
                          <div className="font-bold text-amber-300 dir-ltr">
                            {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}
                          </div>
                        </td>

                        <td className="p-2.5 text-center">
                          <div className="font-bold text-cyan-300 dir-ltr">
                            {s.step6RatioFrac.den === 1n
                              ? `${s.step6RatioFrac.num.toString()}%`
                              : `${s.step6RatioFrac.num.toString()}/${s.step6RatioFrac.den.toString()}%`}
                          </div>
                        </td>

                        <td className="p-2.5 text-center">
                          <div className="font-black text-emerald-400 text-sm dir-ltr">
                            {s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {phase2.slots.map((s, idx) => {
                const isSelected = s.isSelected;
                return (
                  <div
                    key={`cards-slot-${s.pos}`}
                    onClick={() => onToggleTransfer?.(idx)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-purple-950/30 to-slate-900/80 border-purple-500/40 shadow-lg shadow-purple-950/30'
                        : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">الخانة #{s.pos}</span>
                        <span className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 font-black text-sm flex items-center justify-center">
                          {s.char}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-[10px] font-mono text-slate-400 leading-relaxed">
                      <div>
                        1 (القيمة: {s.step1Val}) .. 2 (تعديل: {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}) .. 3 (مركب: {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()})
                      </div>
                      <div>
                        4 (المتغير: {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}) .. 5 (+ آخر 3: {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}) .. 6 (النسبة: {s.step6RatioFrac.den === 1n ? `${s.step6RatioFrac.num}%` : `${s.step6RatioFrac.num}/${s.step6RatioFrac.den}%`})
                      </div>
                    </div>

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
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* ثالثاً: بوكس وقسم الانتقال (محاذاة اليمين justify-start RTL) */}
      {/* ============================================================ */}
      <Card className="glass border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 shadow-xl overflow-hidden w-full min-w-0">
        <CardContent className="p-4 space-y-4">
          {/* Selected Cells Summary */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-start gap-4 shadow-lg">
            <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-black font-mono text-sm dir-ltr shrink-0 shadow-inner">
              S = {result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-emerald-300">
                  ملخص الخانات المنتقلة (Selected Cells Summary)
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  عدد الخانات المنتقلة (SNS): <strong className="text-white font-mono">{selectedCount}</strong> / {totalChars} | المجموع الكسري (SSS):{' '}
                  <strong className="text-emerald-300 font-mono font-bold dir-ltr">
                    {result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Selection Buttons & Transition Pills (Right-aligned in RTL) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-start gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300">أزرار التحكم بالانتقال:</span>
              <button
                type="button"
                onClick={onSelectAll}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>تحديد الكل ({totalChars})</span>
              </button>
              <button
                type="button"
                onClick={onDeselectAll}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>إلغاء التحديد</span>
              </button>
              <button
                type="button"
                onClick={handleInvertSelection}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>عكس التحديد</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-start items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 ml-1">خانات الانتقال:</span>
              {result.phase2.slots.map((s, idx) => {
                const isSelected = s.isSelected;
                return (
                  <button
                    key={`toggle-pill-${s.pos}`}
                    type="button"
                    onClick={() => onToggleTransfer?.(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-900/40 font-black'
                        : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-black text-emerald-400 border-black'
                          : 'border-slate-500 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="flex items-center gap-1.5 font-sans">
                      <span className="font-bold">{s.char}</span>
                      <span className="text-slate-400 text-[10px]">#{s.pos} =</span>
                      <strong className="font-mono text-xs dir-ltr">{s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()}</strong>
                      {isSelected && <span className="text-emerald-400 font-bold mr-0.5">✓</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
