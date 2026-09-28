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
  Layers,
  Hash,
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

  const [showDetailedSteps, setShowDetailedSteps] = useState(false);

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
              لوحة إدخال النص والتحليل الرقمي
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
                <span>جاري الحساب الدقيق...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>بدء الحساب الدقيق (BigInt Fractions)</span>
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 2. CALCULATION RESULTS (Rendered only when result exists) */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
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
            <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 rounded-xl py-2 px-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-purple-300 block">
                  بذرة القسم الأول المخفي (Phase 1 Seed):
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-amber-300 font-mono">
                    {result.phase1.seed}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (تُحقن تلقائياً في خطوة 1 للقسم الثاني)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TWO PROMINENT FINAL RESULTS (الناتج النهائي من غير تبسيط + بالتبسيط) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ANSWER 1: من غير تبسيط */}
            <Card className="glass overflow-hidden border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-slate-900/60 to-slate-900/90 shadow-[0_0_25px_rgba(245,158,11,0.15)] relative">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
              <CardHeader className="py-3 px-4 border-b border-white/10 bg-amber-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-sm font-black text-amber-300 tracking-wide uppercase">
                      الناتج النهائي (من غير تبسيط)
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Unsimplified
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  مجموع أول 10 أرقام بعد الفاصلة للجذر التربيعي لمعدل الخانات المحددة
                </p>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-black/60 rounded-2xl border border-amber-500/20 shadow-inner">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">الجواب الرقمي:</span>
                    <span className="text-xs text-amber-200/80 font-mono">
                      مجموع الأرقام العشرية الـ 10
                    </span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                    {result.phase2.unsimplifiedAnswer}
                  </div>
                </div>

                <div className="space-y-1.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>مجموع الخانات المختارة:</span>
                    <span className="text-amber-300 font-bold dir-ltr">
                      {result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>التقسيم على عدد الخانات ({result.phase2.selectedCount}):</span>
                    <span className="text-amber-300 font-bold dir-ltr">
                      {result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>الجذر التربيعي للكسر:</span>
                    <span className="text-cyan-300 font-bold dir-ltr">
                      √({result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()})
                    </span>
                  </div>
                  <div className="p-2 bg-black/50 rounded-lg text-center dir-ltr text-slate-300 break-all text-[11px]">
                    {result.phase2.sqrtResult.intPart}.
                    <span className="text-amber-300 font-bold">
                      {result.phase2.sqrtResult.first10AfterDot}
                    </span>
                    ...
                  </div>
                  <div className="text-center text-[10px] text-amber-400/90 font-sans pt-1">
                    {result.phase2.sqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                    <strong className="text-amber-300 text-xs font-mono">
                      {result.phase2.unsimplifiedAnswer}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ANSWER 2: بالتبسيط */}
            <Card className="glass overflow-hidden border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/60 to-slate-900/90 shadow-[0_0_25px_rgba(16,185,129,0.15)] relative">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <CardHeader className="py-3 px-4 border-b border-white/10 bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-black text-emerald-300 tracking-wide uppercase">
                      الناتج النهائي (بالتبسيط)
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Simplified (Single Digit)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  اختزال ناتج الجمع المتكرر للأرقام حتى الحصول على رقم مفرد
                </p>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-black/60 rounded-2xl border border-emerald-500/20 shadow-inner">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">الرقم المفرد النهائي:</span>
                    <span className="text-xs text-emerald-200/80 font-mono">
                      Single Digit Root
                    </span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    {result.phase2.simplifiedAnswer}
                  </div>
                </div>

                <div className="space-y-2 p-2.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px]">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    مسار الاختزال والتبسيط:
                  </span>
                  <div className="flex items-center justify-center gap-2 p-3 bg-black/50 rounded-xl border border-white/5 font-mono text-sm">
                    {result.phase2.reductionSteps.map((step, idx) => (
                      <div key={`step-${idx}`} className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-black ${
                            idx === result.phase2.reductionSteps.length - 1
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-base'
                              : 'bg-white/5 text-slate-300 border border-white/10'
                          }`}
                        >
                          {step}
                        </span>
                        {idx < result.phase2.reductionSteps.length - 1 && (
                          <span className="text-emerald-400 font-bold">➔</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-[10px] text-slate-400 pt-1">
                    تم اختزال الرقم {result.phase2.unsimplifiedAnswer} إلى الرقم الفردي النهائي (
                    {result.phase2.simplifiedAnswer})
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. PHASE 2 SLOTS & TRANSITION BUTTONS (خانات القسم الثاني وأزرار الانتقال) */}
          <Card className="glass border-white/10 shadow-xl overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-slate-100">
                      خانات القسم الثاني وأزرار الانتقال (القيم الكسرية النهائية)
                    </CardTitle>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                      تفعيل أو تعطيل &quot;زر الانتقال&quot; لكل خانة يؤثر لحظياً على الجمع والمتوسط والجذر
                    </p>
                  </div>
                </div>

                {/* Quick Selection Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    تحديد الكل
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    إلغاء الكل
                  </button>
                  <button
                    type="button"
                    onClick={invertSelection}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    عكس
                  </button>
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    {result.phase2.selectedCount} / {result.totalChars} مختارة
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.phase2.slots.map((slot, idx) => {
                  const isSelected = slot.isSelected;
                  return (
                    <div
                      key={`slot-${slot.pos}`}
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
                        {/* زر انتقال Checkbox */}
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

              {/* Exact Formula bar matching sheet: 123/196 + 1599/49 + 14391/196 = 10455/98 */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300 overflow-x-auto whitespace-nowrap">
                  <span className="text-slate-400 font-sans font-bold">صيغة الجمع:</span>
                  <span className="dir-ltr text-amber-300 font-bold">
                    {result.phase2.slots
                      .filter(s => s.isSelected)
                      .map(s => `${s.finalValueFrac.num.toString()}/${s.finalValueFrac.den.toString()}`)
                      .join(' + ') || '0'}
                  </span>
                  <span>=</span>
                  <span className="text-emerald-300 font-black dir-ltr text-sm">
                    {result.phase2.selectedSum.num.toString()}/{result.phase2.selectedSum.den.toString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                  <span className="font-sans">المتوسط ({result.phase2.selectedCount} خانات):</span>
                  <span className="text-amber-300 font-black dir-ltr text-sm">
                    {result.phase2.selectedAverage.num.toString()}/{result.phase2.selectedAverage.den.toString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. OPTIONAL AUDIT ACCORDION (Steps 1 to 6 - Hidden by Default) */}
          <Card className="glass border-white/5 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetailedSteps(!showDetailedSteps)}
              className="w-full py-3 px-4 flex items-center justify-between text-right hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-300">
                  تدقيق الخطوات الرياضية الوسيطة (الخطوات 1 إلى 6) - مخفية افتراضياً
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-300">
                <span>{showDetailedSteps ? 'إخفاء' : 'عرض التدقيق'}</span>
                {showDetailedSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showDetailedSteps && (
              <CardContent className="p-4 border-t border-white/5 space-y-4 animate-in fade-in duration-300">
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold">
                        <th className="p-2.5">الخانة</th>
                        <th className="p-2.5">الحرف</th>
                        <th className="p-2.5">خطوة 1</th>
                        <th className="p-2.5">خطوة 2 (i²÷n)</th>
                        <th className="p-2.5">خطوة 3</th>
                        <th className="p-2.5">خطوة 4</th>
                        <th className="p-2.5">خطوة 5 (×100)</th>
                        <th className="p-2.5">خطوة 6 (النسبة %)</th>
                        <th className="p-2.5">الناتج النهائي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {result.phase2.slots.map(s => (
                        <tr key={`table-slot-${s.pos}`} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 text-slate-400 font-bold">#{s.pos}</td>
                          <td className="p-2.5 text-slate-200 font-sans font-black">{s.char}</td>
                          <td className="p-2.5 text-purple-300">{s.step1Val}</td>
                          <td className="p-2.5 text-slate-300">
                            {s.step2Frac.num.toString()}/{s.step2Frac.den.toString()}
                          </td>
                          <td className="p-2.5 text-slate-300">
                            {s.step3Frac.num.toString()}/{s.step3Frac.den.toString()}
                          </td>
                          <td className="p-2.5 text-amber-300 font-bold">
                            {s.step4GroupFrac.num.toString()}/{s.step4GroupFrac.den.toString()}
                          </td>
                          <td className="p-2.5 text-slate-300">
                            {s.step5Frac.num.toString()}/{s.step5Frac.den.toString()}
                          </td>
                          <td className="p-2.5 text-cyan-300 font-bold">
                            {s.step6RatioFrac.den === 1n
                              ? `${s.step6RatioFrac.num.toString()}%`
                              : `${s.step6RatioFrac.num.toString()}/${s.step6RatioFrac.den.toString()}%`}
                          </td>
                          <td className="p-2.5 text-emerald-400 font-black">
                            {s.finalValueFrac.num.toString()}/{s.finalValueFrac.den.toString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
