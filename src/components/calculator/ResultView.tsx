'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DualPhaseResult } from '@/lib/calculate';
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
  Hash,
} from 'lucide-react';

interface ResultViewProps {
  result: DualPhaseResult | null;
  onToggleTransfer?: (index: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export default function ResultView({
  result,
  onToggleTransfer,
  onSelectAll,
  onDeselectAll,
}: ResultViewProps) {
  const [showStepsBreakdown, setShowStepsBreakdown] = useState(false);
  const [showPhase1Audit, setShowPhase1Audit] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'direct' | 'average'>('both');

  // Helper to render decimal digits with orange dots above them (matching handwritten notes)
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

  // Hook called unconditionally at the top
  const selectedSlots = useMemo(() => {
    if (!result) return [];
    return result.phase2.slots.filter(s => s.isSelected);
  }, [result]);

  if (!result) {
    return null;
  }

  const { phase1, phase2, normalizedChars, totalChars } = result;
  const selectedCount = phase2.selectedCount;
  const isAllSelected = selectedCount === totalChars && totalChars > 0;

  // Invert Selection Handler
  const handleInvertSelection = () => {
    if (!onToggleTransfer) return;
    phase2.slots.forEach((_, idx) => {
      onToggleTransfer(idx);
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 dir-rtl font-cairo w-full min-w-0">
      {/* 1. TOP HEADER & PHASE 1 SEED BADGE */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 rounded-2xl border border-purple-500/20 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30 flex-shrink-0">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white">الكلمة المحللة:</span>
              <span className="text-sm sm:text-base font-black text-purple-300 font-sans tracking-wide">
                &quot;{result.inputText}&quot;
              </span>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-mono">
                {totalChars} خانات
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
              <span>الأحرف الموحدة:</span>
              <span className="font-bold text-slate-200">
                [{normalizedChars.join(' ، ')}]
              </span>
            </div>
          </div>
        </div>

        {/* Phase 1 Seed Indicator */}
        <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 rounded-xl p-2 px-3 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-purple-300 block font-medium">
              بذرة القسم الأول (Phase 1):
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-amber-300 font-mono">
                {phase1.seed}
              </span>
              <span className="text-[9px] text-slate-400 font-normal">
                (قيمة خطوة 1 في القسم الثاني)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPhase1Audit(!showPhase1Audit)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-colors"
            title="عرض تدقيق القسم الأول"
          >
            {showPhase1Audit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PHASE 1 AUDIT DRAWER (Optional Collapsible) */}
      {showPhase1Audit && (
        <Card className="glass border-purple-500/25 bg-gradient-to-b from-purple-950/20 to-slate-900/40 animate-in fade-in duration-300">
          <CardHeader className="py-2.5 px-4 border-b border-white/5">
            <CardTitle className="text-xs font-bold text-purple-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              تفاصيل المحرك المخفي (القسم الأول): القيمة الابتدائية = 1
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">مجموع خطوة 1 (S1):</span>
                <span className="font-mono font-bold text-purple-300">{phase1.sum1.toString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">مجموع خطوة 2 (S2):</span>
                <span className="font-mono font-bold text-purple-300">{phase1.sum2.toString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">مجموع خطوة 5 (S5):</span>
                <span className="font-mono font-bold text-purple-300">{phase1.sum5.toString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">المتوسط (الجمع ÷ {totalChars}):</span>
                <span className="font-mono font-bold text-purple-300">{phase1.average.toString()}</span>
              </div>
            </div>
            <div className="p-2.5 bg-black/50 rounded-xl border border-white/5 space-y-1 font-mono text-[11px] dir-ltr text-center">
              <span className="text-slate-400 text-[10px] block">
                √({phase1.average.toString()}) = {phase1.sqrtResult.fullString.substring(0, 16)}...
              </span>
              <span className="text-amber-300 font-bold block">
                أول 10 أرقام: {phase1.sqrtResult.first10AfterDot.split('').join(' + ')} = {phase1.seed}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. THE DUAL FINAL ANSWERS 🟨 (الأجوبة النهائية المعتمدة: بدون تقسيم ومع التقسيم) */}
      <div className="space-y-4 w-full min-w-0">
        {/* View Mode Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-2 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-black text-slate-200">
              خيارات استخراج الناتج النهائي:
            </span>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              عرض الطريقتين معاً
            </button>
            <button
              type="button"
              onClick={() => setViewMode('direct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'direct'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>بدون تقسيم (مجموع الخانات)</span>
              <span className="text-[10px] px-1 py-0.2 bg-emerald-400/20 text-emerald-300 rounded font-normal">جديد</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('average')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'average'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              مع التقسيم (المعدل)
            </button>
          </div>
        </div>

        {/* METHOD 1: بدون تقسيم على عدد الخانات (على مجموع الخانات مباشرة - المطلوب في الورقة) */}
        {(viewMode === 'both' || viewMode === 'direct') && (
          <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-b from-emerald-950/25 via-slate-900/70 to-slate-900/90 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm sm:text-base font-black text-emerald-300">
                  الجذر التربيعي لمجموع الخانات مباشرة (من غير تقسيم على عدد الخانات)
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full font-mono font-bold dir-ltr">
                  √({phase2.selectedSum.toString()})
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  تبسيط وغير تبسيط
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DIRECT SUM - ANSWER 1: من غير تبسيط */}
              <Card className="glass overflow-hidden border-emerald-500/30 bg-black/40 shadow-inner relative group">
                <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-emerald-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-xs sm:text-sm font-black text-emerald-300 tracking-wide uppercase">
                        الناتج النهائي (من غير تبسيط)
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      غير مبسط
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    مجموع أول 10 أرقام عشرية للجذر التربيعي لمجموع الخانات مباشرة
                  </p>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/70 rounded-2xl border border-emerald-500/20 shadow-inner">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">الجواب الرقمي المباشر:</span>
                      <span className="text-xs text-emerald-200/80 font-mono">
                        مجموع الأرقام العشرية الـ 10
                      </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      {phase2.directSumUnsimplifiedAnswer}
                    </div>
                  </div>

                  <div className="space-y-1.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>مجموع الخانات المختارة:</span>
                      <span className="text-emerald-300 font-bold dir-ltr">{phase2.selectedSum.toString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>الجذر التربيعي المباشر (بدون تقسيم):</span>
                      <span className="text-cyan-300 font-bold dir-ltr">
                        √({phase2.selectedSum.toString()})
                      </span>
                    </div>

                    {renderDottedDigits(phase2.directSumSqrtResult.intPart, phase2.directSumSqrtResult.first10AfterDot)}

                    <div className="text-center text-[10px] text-emerald-400/90 font-sans pt-1">
                      {phase2.directSumSqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                      <strong className="text-emerald-300 text-xs font-mono">{phase2.directSumUnsimplifiedAnswer}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DIRECT SUM - ANSWER 2: بالتبسيط */}
              <Card className="glass overflow-hidden border-teal-500/30 bg-black/40 shadow-inner relative group">
                <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-teal-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                      <span className="text-xs sm:text-sm font-black text-teal-300 tracking-wide uppercase">
                        الناتج النهائي (بالتبسيط)
                      </span>
                    </div>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
                      مبسط (Single Root)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    اختزال رقم {phase2.directSumUnsimplifiedAnswer} حتى الوصول إلى رقم مفرد
                  </p>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/70 rounded-2xl border border-teal-500/20 shadow-inner">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">الرقم المفرد النهائي:</span>
                      <span className="text-xs text-teal-200/80 font-mono">
                        Single Digit Reduction
                      </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-teal-300 font-mono drop-shadow-[0_0_12px_rgba(20,184,166,0.5)]">
                      {phase2.directSumSimplifiedAnswer}
                    </div>
                  </div>

                  <div className="space-y-2 p-2.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px]">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      مسار الاختزال والتبسيط:
                    </span>
                    <div className="flex items-center justify-center gap-2 p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-sm">
                      {phase2.directSumReductionSteps.map((step, idx) => (
                        <div key={`direct-step-${idx}`} className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg font-black ${
                              idx === phase2.directSumReductionSteps.length - 1
                                ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 text-base'
                                : 'bg-white/5 text-slate-300 border border-white/10'
                            }`}
                          >
                            {step}
                          </span>
                          {idx < phase2.directSumReductionSteps.length - 1 && (
                            <span className="text-teal-400 font-bold">➔</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-[10px] text-slate-400 pt-1">
                      تم اختزال الرقم {phase2.directSumUnsimplifiedAnswer} إلى الرقم الفردي النهائي ({phase2.directSumSimplifiedAnswer})
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* METHOD 2: مع التقسيم على عدد الخانات (المعدل) */}
        {(viewMode === 'both' || viewMode === 'average') && (
          <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-b from-amber-950/20 via-slate-900/60 to-slate-900/90 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-sm sm:text-base font-black text-amber-300">
                  الجذر التربيعي لمعدل الخانات (بالتقسيم على عدد الخانات: {selectedCount})
                </h3>
              </div>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-0.5 rounded-full font-mono font-bold dir-ltr self-start sm:self-auto">
                √({phase2.selectedAverage.toString()})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AVERAGE - ANSWER 1: من غير تبسيط */}
              <Card className="glass overflow-hidden border-amber-500/30 bg-black/40 shadow-inner relative group">
                <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-amber-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase">
                        الناتج النهائي (من غير تبسيط)
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      غير مبسط
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    جمع أول 10 أرقام عشرية للجذر التربيعي لمعدل الخانات المختارة
                  </p>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/70 rounded-2xl border border-amber-500/20 shadow-inner">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">الجواب الرقمي للمعدل:</span>
                      <span className="text-xs text-amber-200/80 font-mono">
                        مجموع الأرقام العشرية الـ 10
                      </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                      {phase2.unsimplifiedAnswer}
                    </div>
                  </div>

                  <div className="space-y-1.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>جمع الخانات المختارة:</span>
                      <span className="text-amber-300 font-bold dir-ltr">{phase2.selectedSum.toString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>التقسيم على عدد الخانات ({selectedCount}):</span>
                      <span className="text-amber-300 font-bold dir-ltr">{phase2.selectedAverage.toString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>الجذر التربيعي للكسر:</span>
                      <span className="text-cyan-300 font-bold dir-ltr">
                        √({phase2.selectedAverage.toString()})
                      </span>
                    </div>

                    {renderDottedDigits(phase2.sqrtResult.intPart, phase2.sqrtResult.first10AfterDot)}

                    <div className="text-center text-[10px] text-amber-400/90 font-sans pt-1">
                      {phase2.sqrtResult.first10AfterDot.split('').join(' + ')} ={' '}
                      <strong className="text-amber-300 text-xs font-mono">{phase2.unsimplifiedAnswer}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AVERAGE - ANSWER 2: بالتبسيط */}
              <Card className="glass overflow-hidden border-yellow-500/30 bg-black/40 shadow-inner relative group">
                <CardHeader className="py-2.5 px-4 border-b border-white/10 bg-yellow-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-wide uppercase">
                        الناتج النهائي (بالتبسيط)
                      </span>
                    </div>
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">
                      مبسط (Single Root)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    اختزال ناتج الجمع المتكرر للأرقام حتى الحصول على رقم مفرد
                  </p>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/70 rounded-2xl border border-yellow-500/20 shadow-inner">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">الرقم المفرد النهائي:</span>
                      <span className="text-xs text-yellow-200/80 font-mono">
                        Single Digit Reduction
                      </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-yellow-400 font-mono drop-shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                      {phase2.simplifiedAnswer}
                    </div>
                  </div>

                  <div className="space-y-2 p-2.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px]">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      مسار الاختزال والتبسيط:
                    </span>
                    <div className="flex items-center justify-center gap-2 p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-sm">
                      {phase2.reductionSteps.map((step, idx) => (
                        <div key={`average-step-${idx}`} className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg font-black ${
                              idx === phase2.reductionSteps.length - 1
                                ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50 text-base'
                                : 'bg-white/5 text-slate-300 border border-white/10'
                            }`}
                          >
                            {step}
                          </span>
                          {idx < phase2.reductionSteps.length - 1 && (
                            <span className="text-yellow-400 font-bold">➔</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-[10px] text-slate-400 pt-1">
                      تم اختزال الرقم {phase2.unsimplifiedAnswer} إلى الرقم الفردي النهائي ({phase2.simplifiedAnswer})
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 3. PHASE 2 SLOTS & TRANSITION BUTTONS (مطابقة ورقة Image 1) */}
      <Card className="glass border-white/10 shadow-2xl overflow-hidden w-full min-w-0">
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
                  تفعيل أو تعطيل &quot;زر انتقال&quot; لكل خانة يؤثر لحظياً على المجموع والمتوسط والجذر
                </p>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={onSelectAll}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isAllSelected
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                تحديد الكل
              </button>
              <button
                type="button"
                onClick={onDeselectAll}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                إلغاء الكل
              </button>
              <button
                type="button"
                onClick={handleInvertSelection}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                عكس
              </button>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                {selectedCount} / {totalChars} مختارة
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Slot Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {phase2.slots.map((slot, idx) => {
              const isSelected = slot.isSelected;
              return (
                <div
                  key={`slot-card-${slot.pos}`}
                  onClick={() => onToggleTransfer?.(idx)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/80 border-purple-500/40 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/20'
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
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-500 border border-white/10'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
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

                  {/* Character and Final Fraction (Image 1 Style: [✓] 123/196 = م) */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-lg text-purple-200">
                        {slot.char}
                      </div>
                      {slot.originalChar && slot.originalChar !== slot.char && (
                        <span className="text-[10px] text-slate-500">
                          (الأصل: {slot.originalChar})
                        </span>
                      )}
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-xl sm:text-2xl font-black text-amber-300 dir-ltr">
                        {slot.finalValueFrac.toString()}
                      </div>
                      <span className="text-[9px] text-slate-400 dir-rtl block">
                        = {slot.char}
                      </span>
                    </div>
                  </div>

                  {/* Micro breakdown */}
                  <div className="mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400 flex justify-between items-center dir-ltr">
                    <span className="text-purple-300">
                      {slot.step6RatioFrac.den === 1n
                        ? `${slot.step6RatioFrac.num}%`
                        : `${slot.step6RatioFrac.num}/${slot.step6RatioFrac.den}%`}
                    </span>
                    <span>×</span>
                    <span>{slot.step4GroupFrac.toString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Sum Bar matching Image 1 and Image 5 handwriting */}
          <div className="p-3 bg-black/50 rounded-2xl border border-white/5 space-y-2.5 text-xs font-mono">
            {/* Top: Sum Formula */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-300 overflow-x-auto whitespace-nowrap py-1">
                <span className="text-slate-400 font-sans font-bold">صيغة جمع الخانات:</span>
                <span className="dir-ltr text-amber-300 font-bold">
                  {selectedSlots.map(s => s.finalValueFrac.toString()).join(' + ') || '0'}
                </span>
                <span>=</span>
                <span className="text-emerald-300 font-black dir-ltr text-sm">
                  {phase2.selectedSum.toString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                <span className="font-sans">المتوسط ({selectedCount} خانات):</span>
                <span className="text-amber-300 font-black dir-ltr text-sm">
                  {phase2.selectedAverage.toString()}
                </span>
              </div>
            </div>

            {/* Bottom: Both Sqrt Results Pathways */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
              {/* Pathway 1: Without Division */}
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-emerald-300 font-sans font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  بدون تقسيم (مجموع مباشر):
                </span>
                <span className="dir-ltr text-slate-200 font-mono">
                  √({phase2.selectedSum.toString()}) ➔{' '}
                  <span className="text-emerald-300 font-bold">{phase2.directSumUnsimplifiedAnswer}</span>{' '}
                  ➔{' '}
                  <span className="text-teal-300 font-bold">({phase2.directSumSimplifiedAnswer})</span>
                </span>
              </div>

              {/* Pathway 2: With Division */}
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-amber-300 font-sans font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  مع التقسيم (المعدل ÷ {selectedCount}):
                </span>
                <span className="dir-ltr text-slate-200 font-mono">
                  √({phase2.selectedAverage.toString()}) ➔{' '}
                  <span className="text-amber-300 font-bold">{phase2.unsimplifiedAnswer}</span>{' '}
                  ➔{' '}
                  <span className="text-yellow-300 font-bold">({phase2.simplifiedAnswer})</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. STEP BREAKDOWN ACCORDION (Steps 1 to 6 Details) */}
      <Card className="glass border-white/5 overflow-hidden w-full min-w-0">
        <button
          type="button"
          onClick={() => setShowStepsBreakdown(!showStepsBreakdown)}
          className="w-full py-3 px-4 flex items-center justify-between text-right hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              جدول التدقيق الرياضي التفصيلي (الخطوات من 1 إلى 6 للقسم الثاني)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-300">
            <span>{showStepsBreakdown ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
            {showStepsBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showStepsBreakdown && (
          <CardContent className="p-4 border-t border-white/5 space-y-4 animate-in fade-in duration-300">
            {/* Step Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block">الخطوة 1 (S1):</span>
                <span className="text-purple-300 font-bold">{phase2.sum1.toString()}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block">الخطوة 2 (S2):</span>
                <span className="text-purple-300 font-bold">{phase2.sum2.toString()}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block">آخر خانة خطوة 3:</span>
                <span className="text-purple-300 font-bold">
                  {phase2.slots[phase2.slots.length - 1]?.step3Frac.toString()}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block">مجموع خطوة 5 (S5):</span>
                <span className="text-purple-300 font-bold">
                  {phase1.sum5.toString()}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block">المجموع المختار:</span>
                <span className="text-amber-300 font-bold">{phase2.selectedSum.toString()}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block">المتوسط (÷ {selectedCount}):</span>
                <span className="text-emerald-300 font-bold">{phase2.selectedAverage.toString()}</span>
              </div>
            </div>

            {/* Steps Detailed Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-bold">
                    <th className="p-2.5">الخانة</th>
                    <th className="p-2.5">الحرف</th>
                    <th className="p-2.5">خطوة 1 (البذرة)</th>
                    <th className="p-2.5">خطوة 2 (i²÷n)</th>
                    <th className="p-2.5">خطوة 3 ((v2÷S2)×S1)</th>
                    <th className="p-2.5">خطوة 4 (جمع الحرف)</th>
                    <th className="p-2.5">خطوة 5 (×100)</th>
                    <th className="p-2.5">خطوة 6 (النسبة %)</th>
                    <th className="p-2.5">الناتج المعتمد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {phase2.slots.map(s => (
                    <tr key={`table-row-${s.pos}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-2.5 text-slate-400 font-bold">#{s.pos}</td>
                      <td className="p-2.5 text-slate-200 font-sans font-black">{s.char}</td>
                      <td className="p-2.5 text-purple-300">{s.step1Val}</td>
                      <td className="p-2.5 text-slate-300">{s.step2Frac.toString()}</td>
                      <td className="p-2.5 text-slate-300">{s.step3Frac.toString()}</td>
                      <td className="p-2.5 text-amber-300 font-bold">{s.step4GroupFrac.toString()}</td>
                      <td className="p-2.5 text-slate-300">{s.step5Frac.toString()}</td>
                      <td className="p-2.5 text-cyan-300 font-bold">
                        {s.step6RatioFrac.den === 1n
                          ? `${s.step6RatioFrac.num}%`
                          : `${s.step6RatioFrac.num}/${s.step6RatioFrac.den}%`}
                      </td>
                      <td className="p-2.5 text-emerald-400 font-black">{s.finalValueFrac.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
