'use client';

import React, { useState } from 'react';
import { useWordCalculator } from '@/hooks/useWordCalculator';
import ArabicInput from './ArabicInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Calculator,
  Check,
  CheckSquare,
  Square,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  LayoutGrid,
  Info,
  Layers,
  Trophy,
} from 'lucide-react';

interface WordCalculatorUIProps {
  initialText?: string;
}

export default function WordCalculatorUI({ initialText = '' }: WordCalculatorUIProps) {
  const {
    text,
    setText,
    result,
    error,
    isCalculating,
    calculate,
    toggleSlot,
    selectAll,
    deselectAll,
    invertSelection,
  } = useWordCalculator(initialText);

  // View modes
  const [slotsDisplayMode, setSlotsDisplayMode] = useState<'table' | 'cards'>('table');
  const [showRulesDetails, setShowRulesDetails] = useState(false);

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

  const handleTextChange = (newVal: string) => {
    setText(newVal);
  };

  const handleStartCalc = () => {
    calculate();
  };

  return (
    <div className="w-full space-y-6 dir-rtl font-cairo">
      {/* 1. INPUT PANEL */}
      <Card className="glass border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <CardTitle className="text-sm font-bold text-slate-200">
              لوحة الإدخال والتحليل الرقمي
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <ArabicInput value={text} onChange={handleTextChange} />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-xs font-semibold text-center">{error}</p>
            </div>
          )}

          <Button
            onClick={handleStartCalc}
            disabled={!text.trim() || isCalculating}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 cursor-pointer"
          >
            {isCalculating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الحساب الرقمي الدقيق...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>بدء الحساب الرقمي (Arbitrary-Precision)</span>
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* CALCULATION RESULTS (Rendered only when result exists) */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Header Summary with Phase 1 Seed */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">الكلمة المحللة:</span>
                  <span className="text-base font-black text-purple-200">
                    &quot;{result.inputText}&quot;
                  </span>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-mono">
                    {result.totalChars} خانات
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  الأحرف الموحدة: [{result.normalizedChars.join(' ، ')}]
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-950/50 border border-purple-500/30 rounded-xl py-2 px-3 self-start sm:self-auto shadow-inner">
              <div className="text-right">
                <span className="text-[10px] text-purple-300 block font-medium">
                  بذرة القسم الأول المخفي (Phase 1 Seed):
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-amber-300 font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                    {result.phase1.seed}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (تُحقن تلقائياً في خطوة 1 للقسم الثاني)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* أولاً: قسم الأجوبة النهائية الأربعة (الجواب الثالث والجواب الرابع) */}
          {/* ============================================================ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-slate-200">
                قسم النتائج النهائي (4 أجوبة فقط)
              </span>
            </div>

            {/* ── الجواب الثالث ── */}
            <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-950/30 via-slate-900/80 to-slate-900/90 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-500" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
                  <h3 className="text-sm sm:text-base font-black text-purple-300">
                    🏆 الجواب الثالث: الجذر التربيعي لمجموع الخانات (أول 10 أرقام بعد الفاصلة)
                  </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                    √({result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
                  <span className="font-sans font-bold text-slate-400">1. صيغة جمع الخانات المحددة:</span>
                  <span className="dir-ltr text-amber-300 font-bold overflow-x-auto whitespace-nowrap">
                    S = {result.phase2.slots
                      .filter(s => s.isSelected)
                      .map(s => `${s.finalValueFrac.num.toString()}/${s.finalValueFrac.den.toString()}`)
                      .join(' + ') || '0'}{' '}
                    ={' '}
                    <span className="text-purple-400 font-black">
                      {result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300 pt-1 border-t border-white/5">
                  <span className="font-sans font-bold text-slate-400">2. الجذر التربيعي للكسر:</span>
                  <span className="dir-ltr text-cyan-300 font-bold">
                    √({result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()})
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  <span className="font-sans font-bold text-slate-400 block">
                    3. الناتج العشري المستخرج (10 أرقام بعد الفاصلة):
                  </span>
                  {renderDottedDigits(
                    result.phase2.directSumSqrtResult.intPart,
                    result.phase2.directSumSqrtResult.first10AfterDot
                  )}
                  <div className="text-center text-[10px] text-purple-300 font-sans pt-0.5">
                    {result.phase2.directSumSqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                    <strong className="text-purple-200 text-xs font-mono">
                      {result.phase2.directSumUnsimplifiedAnswer}
                    </strong>
                  </div>
                </div>
              </div>

              {/* الخانتان للجواب الثالث */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
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
                      {result.phase2.directSumUnsimplifiedAnswer}
                    </div>
                  </CardContent>
                </Card>

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
                        {result.phase2.directSumReductionSteps.join(' ➔ ')}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border-2 border-indigo-500/60 text-indigo-300 font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      {result.phase2.directSumSimplifiedAnswer}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── الجواب الرابع ── */}
            <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-950/30 via-slate-900/80 to-slate-900/90 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <h3 className="text-sm sm:text-base font-black text-emerald-300">
                    ⭐ الجواب الرابع: الجذر التربيعي لـ (المجموع ÷ عدد الخانات) (أول 10 أرقام بعد الفاصلة)
                  </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                    √({result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
                  <span className="font-sans font-bold text-slate-400">1. صيغة جمع الخانات المحددة:</span>
                  <span className="dir-ltr text-emerald-300 font-bold">
                    ({result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}) ÷{' '}
                    {result.phase2.selectedCount} ={' '}
                    <span className="text-emerald-400 font-black">
                      {result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300 pt-1 border-t border-white/5">
                  <span className="font-sans font-bold text-slate-400">2. الجذر التربيعي للكسر:</span>
                  <span className="dir-ltr text-cyan-300 font-bold">
                    √({result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()})
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  <span className="font-sans font-bold text-slate-400 block">
                    3. الناتج العشري المستخرج (10 أرقام بعد الفاصلة):
                  </span>
                  {renderDottedDigits(
                    result.phase2.sqrtResult.intPart,
                    result.phase2.sqrtResult.first10AfterDot
                  )}
                  <div className="text-center text-[10px] text-emerald-300 font-sans pt-0.5">
                    {result.phase2.sqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                    <strong className="text-emerald-200 text-xs font-mono">
                      {result.phase2.unsimplifiedAnswer}
                    </strong>
                  </div>
                </div>
              </div>

              {/* الخانتان للجواب الرابع */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <Card className="glass overflow-hidden border-emerald-500/30 bg-black/40 shadow-inner">
                  <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-emerald-950/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-emerald-300">
                        من غير تبسيط
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        Unsimplified
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">مجموع الأرقام العشرية الـ 10:</span>
                    <div className="text-4xl font-black text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      {result.phase2.unsimplifiedAnswer}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass overflow-hidden border-teal-500/30 bg-black/40 shadow-inner">
                  <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-teal-950/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-teal-300">
                        مع التبسيط
                      </span>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
                        Simplified Root
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">مسار الاختزال:</span>
                      <span className="text-[11px] text-teal-300 font-mono font-bold dir-ltr">
                        {result.phase2.reductionSteps.join(' ➔ ')}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 border-2 border-teal-500/60 text-teal-300 font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                      {result.phase2.simplifiedAnswer}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ثانياً: قسم خانات الأحرف والتفاصيل                         */}
          {/* ============================================================ */}
          <Card className="glass border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      جدول التحليل والخطوات الست (Arbitrary-Precision 6 Steps)
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      حسابات كسرية دقيقة 100% بدون أي تقريب وفق الشرح والورقة اليدوية مع أزرار الانتقال التفاعلية
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowRulesDetails(!showRulesDetails)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-purple-400" />
                      <span>تفاصيل القواعد</span>
                      {showRulesDetails ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center p-0.5 bg-black/50 rounded-xl border border-white/10">
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

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تحديد الكل ({result.totalChars})</span>
                    </button>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>إلغاء التحديد</span>
                    </button>
                    <button
                      type="button"
                      onClick={invertSelection}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span>عكس</span>
                    </button>
                  </div>
                </div>

                {showRulesDetails && (
                  <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>قواعد توحيد الأحرف العربية المعتمدة في الخوارزمية:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <strong className="text-amber-300 block mb-1">1. مجموعة الألف (أ):</strong>
                        (أ ، إ ، آ ، ٱ ، ء ، ئ ، ؤ ، ى) ➔ توحد جميعها كـ &quot;أ&quot;
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <strong className="text-amber-300 block mb-1">2. مجموعة التاء (ت):</strong>
                        (ت ، ة ، ـة) ➔ توحد كـ &quot;ت&quot;
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <strong className="text-amber-300 block mb-1">3. مجموعة الهاء (ه):</strong>
                        (ه ، ە ، ھ) ➔ توحد كـ &quot;ه&quot;
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {slotsDisplayMode === 'table' ? (
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/50 shadow-inner">
                  <table className="w-full text-xs text-right border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-bold text-[11px]">
                        <th className="p-2.5 text-center">الخانة</th>
                        <th className="p-2.5 text-center">الحرف</th>
                        <th className="p-2.5 text-center">خطوة 1 (القيمة الأولى)</th>
                        <th className="p-2.5 text-center">خطوة 2 (i²÷n)</th>
                        <th className="p-2.5 text-center">خطوة 3 (÷S2 × S1)</th>
                        <th className="p-2.5 text-center">خطوة 4 (جمع الحروف)</th>
                        <th className="p-2.5 text-center">خطوة 5 (×100)</th>
                        <th className="p-2.5 text-center">خطوة 6 (النسبة %)</th>
                        <th className="p-2.5 text-center">الناتج النهائي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {result.phase2.slots.map((s, idx) => {
                        const isSelected = s.isSelected;
                        return (
                          <tr
                            key={`table-slot-${s.pos}`}
                            onClick={() => toggleSlot(idx)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-purple-950/20 hover:bg-purple-900/30'
                                : 'opacity-40 hover:opacity-70 bg-transparent'
                            }`}
                          >
                            <td className="p-2.5 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-bold">
                                #{s.pos}
                              </span>
                            </td>

                            <td className="p-2.5 text-center font-sans font-black">
                              <div className="inline-flex items-center gap-1">
                                <span className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm text-purple-200">
                                  {s.char}
                                </span>
                                {s.originalChar && s.originalChar !== s.char && (
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    ({s.originalChar})
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-2.5 text-center text-purple-300 font-bold">
                              {s.step1Val}
                            </td>

                            <td className="p-2.5 text-center text-slate-300">
                              <div className="dir-ltr font-bold">
                                {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}
                              </div>
                            </td>

                            <td className="p-2.5 text-center text-slate-300">
                              <div className="dir-ltr font-bold">
                                {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()}
                              </div>
                            </td>

                            <td className="p-2.5 text-center text-amber-300 font-bold">
                              <div className="dir-ltr">
                                {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}
                              </div>
                            </td>

                            <td className="p-2.5 text-center text-slate-300">
                              <div className="dir-ltr">
                                {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}
                              </div>
                            </td>

                            <td className="p-2.5 text-center text-cyan-300 font-bold">
                              <span className="dir-ltr">
                                {s.step6RatioFrac.den === 1n
                                  ? `${s.step6RatioFrac.num.toString()}%`
                                  : `${s.step6RatioFrac.num.toString()}/${s.step6RatioFrac.den.toString()}%`}
                              </span>
                            </td>

                            <td className="p-2.5 text-center">
                              <span className="text-emerald-400 font-black text-sm dir-ltr inline-block px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                                {s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.phase2.slots.map((slot, idx) => {
                    const isSelected = slot.isSelected;
                    return (
                      <div
                        key={`slot-card-${slot.pos}`}
                        onClick={() => toggleSlot(idx)}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/80 border-purple-500/40 shadow-lg shadow-purple-950/30'
                            : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            الخانة #{slot.pos}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-lg text-purple-200">
                              {slot.char}
                            </div>
                          </div>
                          <div className="text-left font-mono">
                            <div className="text-xl sm:text-2xl font-black text-amber-300 dir-ltr">
                              {slot.finalValueFrac.num.toString()}/{slot.finalValueFrac.den.toString()}
                            </div>
                          </div>
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
          <Card className="glass border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 shadow-xl overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-purple-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-start gap-4 shadow-lg">
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-sm dir-ltr shrink-0 shadow-inner">
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
                    <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-0.5">
                      <span>
                        عدد الخانات المنتقلة (SNS):{' '}
                        <strong className="text-white font-mono">{result.phase2.selectedCount}</strong> /{' '}
                        {result.totalChars}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span>
                        المجموع الكسري (SSS):{' '}
                        <span className="text-emerald-300 font-mono font-bold dir-ltr">
                          {result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* أزرار الانتقال التفاعلية للأنواع المحددة في جهة اليمين */}
              <div className="flex flex-wrap justify-start items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-400 ml-2">خانات الانتقال:</span>
                {result.phase2.slots.map((s, idx) => {
                  const isSelected = s.isSelected;
                  return (
                    <button
                      key={`toggle-btn-${s.pos}`}
                      type="button"
                      onClick={() => toggleSlot(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-900/40 font-black'
                          : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/10'
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
                      <span>
                        {s.char} #{s.pos} {isSelected ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
