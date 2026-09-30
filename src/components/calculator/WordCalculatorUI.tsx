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
  Award,
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
  const [resultsMode, setResultsMode] = useState<'both' | 'direct' | 'average'>('both');

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

      {/* 2. CALCULATION RESULTS (Rendered only when result exists) */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Header Summary with Phase 1 Seed (Hidden Engine Output) */}
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

            {/* Phase 1 Hidden Seed Badge */}
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

          {/* 3. PRIMARY SLOTS SECTION (جدول التحليل والخطوات الست) */}
          <Card className="glass border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="p-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex flex-col gap-3">
                {/* Title & Subtitle */}
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

                {/* Controls Bar (Matching math-calc-letter-four) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  {/* Left: Rules details button & View mode toggle */}
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

                    {/* View Mode Toggle: جدول / بطاقات */}
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

                  {/* Right: Quick Selection Buttons */}
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

                {/* Collapsible Rules Details Dropdown */}
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
              {/* TABLE VIEW (Active by default) */}
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
                        <th className="p-2.5 text-center">زر الانتقال</th>
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
                            {/* الخانة */}
                            <td className="p-2.5 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-bold">
                                #{s.pos}
                              </span>
                            </td>

                            {/* الحرف */}
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

                            {/* خطوة 1 */}
                            <td className="p-2.5 text-center text-purple-300 font-bold">
                              {s.step1Val}
                            </td>

                            {/* خطوة 2 */}
                            <td className="p-2.5 text-center text-slate-300">
                              <div className="dir-ltr font-bold">
                                {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}
                              </div>
                              <span className="text-[9px] text-slate-500 font-sans block">
                                {s.step2Formula}
                              </span>
                            </td>

                            {/* خطوة 3 */}
                            <td className="p-2.5 text-center text-slate-300">
                              <div className="dir-ltr font-bold">
                                {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()}
                              </div>
                            </td>

                            {/* خطوة 4 */}
                            <td className="p-2.5 text-center text-amber-300 font-bold">
                              <div className="dir-ltr">
                                {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}
                              </div>
                              <span className="text-[9px] text-amber-400/60 font-sans block">
                                حرف {s.char}
                              </span>
                            </td>

                            {/* خطوة 5 */}
                            <td className="p-2.5 text-center text-slate-300">
                              <div className="dir-ltr">
                                {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}
                              </div>
                            </td>

                            {/* خطوة 6 */}
                            <td className="p-2.5 text-center text-cyan-300 font-bold">
                              <span className="dir-ltr">
                                {s.step6RatioFrac.den === 1n
                                  ? `${s.step6RatioFrac.num.toString()}%`
                                  : `${s.step6RatioFrac.num.toString()}/${s.step6RatioFrac.den.toString()}%`}
                              </span>
                            </td>

                            {/* الناتج النهائي */}
                            <td className="p-2.5 text-center">
                              <span className="text-emerald-400 font-black text-sm dir-ltr inline-block px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                                {s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()}
                              </span>
                            </td>

                            {/* زر الانتقال */}
                            <td className="p-2.5 text-center" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleSlot(idx)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer ${
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
                                <span>{isSelected ? '✓ منتقلة' : 'انتقال'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* CARDS VIEW */
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
                          <div
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-white/5 text-slate-500 border border-white/10'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isSelected
                                  ? 'bg-emerald-500 border-emerald-400 text-black'
                                  : 'border-slate-500 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span>زر انتقال</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-lg text-purple-200">
                              {slot.char}
                            </div>
                            {slot.originalChar && slot.originalChar !== slot.char && (
                              <span className="text-[10px] text-slate-500">
                                ({slot.originalChar})
                              </span>
                            )}
                          </div>
                          <div className="text-left font-mono">
                            <div className="text-xl sm:text-2xl font-black text-amber-300 dir-ltr">
                              {slot.finalValueFrac.num.toString()}/{slot.finalValueFrac.den.toString()}
                            </div>
                            <span className="text-[9px] text-slate-400 dir-rtl block">
                              = {slot.char}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Cells Summary (ملخص الخانات المنتقلة - Exact Design from Image 4) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-purple-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
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

                <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-sm dir-ltr shadow-inner">
                    S = {result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. RESULTS SECTION: قسم النتائج (بوابات الإجابات) */}
          <div className="space-y-4">
            {/* View Mode Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-2 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 px-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-black text-slate-200">
                  القسم الثاني: قسم النتائج (بوابات الإجابات)
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setResultsMode('both')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    resultsMode === 'both'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  عرض الطريقتين معاً
                </button>
                <button
                  type="button"
                  onClick={() => setResultsMode('direct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    resultsMode === 'direct'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>الجواب الأول (مجموع الخانات)</span>
                  <span className="text-[10px] px-1 py-0.2 bg-emerald-400/20 text-emerald-300 rounded font-normal">√S</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultsMode('average')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    resultsMode === 'average'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>الجواب الثاني (المعدل)</span>
                  <span className="text-[10px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-normal">√(S/N)</span>
                </button>
              </div>
            </div>

            {/* GATE 1: الجواب الأول (مجموع الخانات مباشرة بدون تقسيم) */}
            {(resultsMode === 'both' || resultsMode === 'direct') && (
              <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-b from-emerald-950/25 via-slate-900/70 to-slate-900/90 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-sm sm:text-base font-black text-emerald-300">
                      🏆 الجواب الأول: الجذر التربيعي لمجموع الخانات مباشرة (بدون تقسيم على N)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                      √({result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()})
                    </span>
                  </div>
                </div>

                {/* 3 Step Breakdown matching Image 4 */}
                <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
                    <span className="font-sans font-bold text-slate-400">1. صيغة جمع الخانات المحددة:</span>
                    <span className="dir-ltr text-amber-300 font-bold overflow-x-auto whitespace-nowrap">
                      S = {result.phase2.slots
                        .filter(s => s.isSelected)
                        .map(s => `${s.finalValueFrac.num.toString()}/${s.finalValueFrac.den.toString()}`)
                        .join(' + ') || '0'}{' '}
                      ={' '}
                      <span className="text-emerald-400 font-black">
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
                      3. الناتج العشري المستخرج (أول 10 أرقام):
                    </span>
                    {renderDottedDigits(
                      result.phase2.directSumSqrtResult.intPart,
                      result.phase2.directSumSqrtResult.first10AfterDot
                    )}
                    <div className="text-center text-[10px] text-emerald-400 font-sans pt-0.5">
                      {result.phase2.directSumSqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                      <strong className="text-emerald-300 text-xs font-mono">
                        {result.phase2.directSumUnsimplifiedAnswer}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* DIRECT SUM - ANSWER 1: من غير تبسيط */}
                  <Card className="glass overflow-hidden border-emerald-500/30 bg-black/40 shadow-inner">
                    <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-emerald-950/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-emerald-300">
                          الناتج النهائي (من غير تبسيط)
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          Unsimplified
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">مجموع الأرقام العشرية الـ 10:</span>
                      <div className="text-4xl font-black text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                        {result.phase2.directSumUnsimplifiedAnswer}
                      </div>
                    </CardContent>
                  </Card>

                  {/* DIRECT SUM - ANSWER 2: بالتبسيط */}
                  <Card className="glass overflow-hidden border-teal-500/30 bg-black/40 shadow-inner">
                    <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-teal-950/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-teal-300">
                          الناتج النهائي (بالتبسيط)
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
                          {result.phase2.directSumReductionSteps.join(' ➔ ')}
                        </span>
                      </div>
                      <div className="text-4xl font-black text-teal-400 font-mono drop-shadow-[0_0_12px_rgba(45,212,191,0.5)]">
                        {result.phase2.directSumSimplifiedAnswer}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* GATE 2: الجواب الثاني (مع التقسيم على عدد الخانات - المعدل) */}
            {(resultsMode === 'both' || resultsMode === 'average') && (
              <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-b from-amber-950/20 via-slate-900/70 to-slate-900/90 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.12)] relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <h3 className="text-sm sm:text-base font-black text-amber-300">
                      🥈 الجواب الثاني: الجذر التربيعي لمعدل الخانات (مع التقسيم ÷ {result.phase2.selectedCount})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr">
                      √({result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()})
                    </span>
                  </div>
                </div>

                {/* 3 Step Breakdown for Average */}
                <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300">
                    <span className="font-sans font-bold text-slate-400">1. صيغة التقسيم على عدد الخانات (المعدل):</span>
                    <span className="dir-ltr text-amber-300 font-bold">
                      ({result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}) ÷{' '}
                      {result.phase2.selectedCount} ={' '}
                      <span className="text-amber-400 font-black">
                        {result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-300 pt-1 border-t border-white/5">
                    <span className="font-sans font-bold text-slate-400">2. الجذر التربيعي للمعدل:</span>
                    <span className="dir-ltr text-cyan-300 font-bold">
                      √({result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()})
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <span className="font-sans font-bold text-slate-400 block">
                      3. الناتج العشري المستخرج (أول 10 أرقام):
                    </span>
                    {renderDottedDigits(
                      result.phase2.sqrtResult.intPart,
                      result.phase2.sqrtResult.first10AfterDot
                    )}
                    <div className="text-center text-[10px] text-amber-400 font-sans pt-0.5">
                      {result.phase2.sqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                      <strong className="text-amber-300 text-xs font-mono">
                        {result.phase2.unsimplifiedAnswer}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* AVERAGE - ANSWER 1: من غير تبسيط */}
                  <Card className="glass overflow-hidden border-amber-500/30 bg-black/40 shadow-inner">
                    <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-amber-950/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-amber-300">
                          الناتج النهائي (من غير تبسيط)
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          Unsimplified
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">مجموع الأرقام العشرية الـ 10:</span>
                      <div className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                        {result.phase2.unsimplifiedAnswer}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AVERAGE - ANSWER 2: بالتبسيط */}
                  <Card className="glass overflow-hidden border-yellow-500/30 bg-black/40 shadow-inner">
                    <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-yellow-950/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-yellow-300">
                          الناتج النهائي (بالتبسيط)
                        </span>
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">
                          Single Digit
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">مسار الاختزال:</span>
                        <span className="text-[11px] text-yellow-300 font-mono font-bold dir-ltr">
                          {result.phase2.reductionSteps.join(' ➔ ')}
                        </span>
                      </div>
                      <div className="text-4xl font-black text-yellow-400 font-mono drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]">
                        {result.phase2.simplifiedAnswer}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
