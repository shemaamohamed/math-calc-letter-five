'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DualPhaseResult } from '@/lib/calculate';
import {
  Sparkles,
  Check,
  CheckSquare,
  Square,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Calculator,
  Trophy,
  Info,
  ExternalLink,
  Layers,
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
  // Collapsible Steps Details
  const [showStepsDetails, setShowStepsDetails] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<'phase2' | 'phase1'>('phase2');

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

  if (!result) return null;

  const { phase1, phase2, inputN } = result;
  const selectedCount = phase2.selectedCount;

  const scrollToSlot = (index: number) => {
    const el = document.getElementById(`slot-card-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-purple-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-purple-400'), 1500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 dir-rtl font-cairo w-full min-w-0">
      {/* ============================================================ */}
      {/* أولاً: بطاقة المرحلة 1 (تصحيح الخطأ واستخراج R1)              */}
      {/* ============================================================ */}
      <Card className="glass border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-indigo-950/40 shadow-xl overflow-hidden w-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-200">
                <Layers className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                    المرحلة الأولى (تصحيح الخطأ)
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    المدخل N = <strong className="text-white font-mono">{inputN.toString()}</strong>
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-100 mt-0.5">
                  توزيع {inputN.toString()} على كل خانة ➔ T1 = 3×N = {phase1.t1.toString()}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">قيمة R1 المستخرجة:</span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  {phase1.r1}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                (تبقى كما هي ➔ T2)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-black/50 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-sans">cycle(T1) اليمين:</span>
              <span className="text-purple-300 font-bold dir-ltr block">
                {phase1.cycle.right.num.toString()}/{phase1.cycle.right.den.toString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/50 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-sans">cycle(T1) الوسط:</span>
              <span className="text-cyan-300 font-bold dir-ltr block">
                {phase1.cycle.mid.num.toString()}/{phase1.cycle.mid.den.toString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/50 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-sans">cycle(T1) اليسار:</span>
              <span className="text-emerald-300 font-bold dir-ltr block">
                {phase1.cycle.left.num.toString()}/{phase1.cycle.left.den.toString()}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/50 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-sans">S1 = مجموع الثلاثة:</span>
              <span className="text-amber-300 font-bold dir-ltr block">
                {phase1.sum1.num.toString()}/{phase1.sum1.den.toString()}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">S1 ÷ 3 =</span>
              <span className="text-indigo-300 font-mono font-bold dir-ltr">
                {phase1.average1.num.toString()}/{phase1.average1.den.toString()}
              </span>
              <span className="text-slate-400 text-[11px]">➔ √ =</span>
              <span className="text-amber-300 font-mono font-bold dir-ltr">
                {phase1.sqrtResult.fullDecimalString}
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              أول 10 خانات: <strong className="font-mono text-amber-400">{phase1.sqrtResult.first10AfterDot}</strong> ➔ مجموعها ={' '}
              <strong className="font-mono text-emerald-400">{phase1.r1}</strong> (R1)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* ثانياً: قسم المرحلة 2 (الكسور الثلاثة + أزرار الانتقال)         */}
      {/* ============================================================ */}
      <Card className="glass border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 shadow-xl overflow-hidden w-full">
        <CardHeader className="py-3 px-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm sm:text-base font-black text-slate-100">
                  المرحلة الثانية: دورة T2 = R1 = {phase2.t2.toString()}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                الكسور الثلاثة من cycle(T2) مع خانات التحديد وزر الانتقال لحساب S2 فورياً:
              </p>
            </div>

            {/* Quick selection actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={onSelectAll}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>الكل (3)</span>
              </button>
              <button
                type="button"
                onClick={onDeselectAll}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>إلغاء</span>
              </button>
              <button
                type="button"
                onClick={onInvertSelection}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>عكس</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* 3 Slots Cards (Matches Image 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {phase2.slots.map((s, idx) => {
              const isChecked = s.isSelected;
              return (
                <div
                  id={`slot-card-${idx}`}
                  key={s.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 relative ${
                    isChecked
                      ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                      : 'bg-white/[0.02] border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleTransfer?.(idx)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-200">
                        الخانة #{s.pos} ({s.name})
                      </span>
                    </label>

                    <span className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 font-black text-sm flex items-center justify-center">
                      {s.char}
                    </span>
                  </div>

                  <div className="my-2.5 text-center">
                    <span className="text-xs text-slate-400 block mb-0.5">قيمة الكسر:</span>
                    <span className="text-xl font-black text-emerald-400 font-mono dir-ltr block">
                      {s.fractionString}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => scrollToSlot(idx)}
                      className="w-full py-1.5 px-3 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                      <span>زر انتقال</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* S2 Current Total Box */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">مجموع الكسور المحددة (S2):</span>
              <span className="text-base font-black text-amber-300 font-mono dir-ltr">
                S2 = {phase2.selectedSum.num.toString()}/{phase2.selectedSum.den.toString()}
              </span>
            </div>
            <div className="text-slate-400">
              عدد الخانات المحددة: <strong className="text-white font-mono">{selectedCount}</strong> / 3
              {selectedCount > 0 && (
                <>
                  {' '} | S2 ÷ {selectedCount} ={' '}
                  <strong className="text-cyan-300 font-mono dir-ltr font-bold">
                    {phase2.selectedAverage.num.toString()}/{phase2.selectedAverage.den.toString()}
                  </strong>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* ثالثاً: الأوضاع الأربعة للأجوبة النهائية (The 4 Modes)        */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-100">
              الأوضاع الأربعة للحل النهائي (The 4 Output Modes)
            </h2>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
            دقة تامة BigInt (بدون Number/float)
          </div>
        </div>

        {/* ── الوضع 1: S2 ← √ ← 10 خانات ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-950/30 via-slate-900/80 to-slate-900/90 border border-purple-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-500" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-400" />
              <h3 className="text-sm sm:text-base font-black text-purple-300">
                1. الوضع الأول: S2 ← √ ← 10 خانات
              </h3>
            </div>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr font-mono text-xs self-start sm:self-auto">
              √({phase2.mode1.fractionString})
            </span>
          </div>

          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">الكسر الناتج:</span>
              <span className="dir-ltr text-purple-300 font-bold">{phase2.mode1.fractionString}</span>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                القيمة العشرية (أول 10 خانات بعد الفاصلة مع الاحتفاظ بالأصفار):
              </span>
              {renderDottedDigits(phase2.mode1.intPart, phase2.mode1.first10AfterDot)}
              <div className="text-center text-[10px] text-purple-300 font-sans pt-0.5">
                {phase2.mode1.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-purple-200 text-xs font-mono font-bold">
                  {phase2.mode1.unsimplifiedSum}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <Card className="glass overflow-hidden border-purple-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الخانات العشر (غير مبسط):</span>
                <span className="text-3xl font-black text-purple-400 font-mono">
                  {phase2.mode1.unsimplifiedSum}
                </span>
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden border-indigo-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">الاختزال لرقم واحد:</span>
                  <span className="text-[11px] text-indigo-300 font-mono font-bold dir-ltr">
                    {phase2.mode1.reductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border-2 border-indigo-500/60 text-indigo-300 font-black text-xl flex items-center justify-center">
                  {phase2.mode1.simplifiedSingleDigit}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── الوضع 2: S2 ÷ (عدد الخانات المحددة) ← √ ← 10 خانات ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-950/30 via-slate-900/80 to-slate-900/90 border border-blue-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <h3 className="text-sm sm:text-base font-black text-blue-300">
                2. الوضع الثاني: S2 ÷ (عدد الخانات المحددة) ← √ ← 10 خانات
              </h3>
            </div>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr font-mono text-xs self-start sm:self-auto">
              √({phase2.mode2.fractionString})
            </span>
          </div>

          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">الكسر الناتج (S2 ÷ {selectedCount}):</span>
              <span className="dir-ltr text-blue-300 font-bold">{phase2.mode2.fractionString}</span>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                القيمة العشرية (أول 10 خانات بعد الفاصلة):
              </span>
              {renderDottedDigits(phase2.mode2.intPart, phase2.mode2.first10AfterDot)}
              <div className="text-center text-[10px] text-blue-300 font-sans pt-0.5">
                {phase2.mode2.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-blue-200 text-xs font-mono font-bold">
                  {phase2.mode2.unsimplifiedSum}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <Card className="glass overflow-hidden border-blue-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الخانات العشر (غير مبسط):</span>
                <span className="text-3xl font-black text-blue-400 font-mono">
                  {phase2.mode2.unsimplifiedSum}
                </span>
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden border-cyan-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">الاختزال لرقم واحد:</span>
                  <span className="text-[11px] text-cyan-300 font-mono font-bold dir-ltr">
                    {phase2.mode2.reductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500/60 text-cyan-300 font-black text-xl flex items-center justify-center">
                  {phase2.mode2.simplifiedSingleDigit}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── الوضع 3: S2 ← 10 خانات (بدون جذر) ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-900/90 border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <h3 className="text-sm sm:text-base font-black text-amber-300">
                3. الوضع الثالث: S2 ← 10 خانات (بدون جذر)
              </h3>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr font-mono text-xs self-start sm:self-auto">
              {phase2.mode3.fractionString}
            </span>
          </div>

          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">الكسر الناتج:</span>
              <span className="dir-ltr text-amber-300 font-bold">{phase2.mode3.fractionString}</span>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                القيمة العشرية (أول 10 خانات بعد الفاصلة):
              </span>
              {renderDottedDigits(phase2.mode3.intPart, phase2.mode3.first10AfterDot)}
              <div className="text-center text-[10px] text-amber-300 font-sans pt-0.5">
                {phase2.mode3.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-amber-200 text-xs font-mono font-bold">
                  {phase2.mode3.unsimplifiedSum}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <Card className="glass overflow-hidden border-amber-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الخانات العشر (غير مبسط):</span>
                <span className="text-3xl font-black text-amber-400 font-mono">
                  {phase2.mode3.unsimplifiedSum}
                </span>
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden border-orange-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">الاختزال لرقم واحد:</span>
                  <span className="text-[11px] text-orange-300 font-mono font-bold dir-ltr">
                    {phase2.mode3.reductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border-2 border-orange-500/60 text-orange-300 font-black text-xl flex items-center justify-center">
                  {phase2.mode3.simplifiedSingleDigit}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── الوضع 4: S2 ÷ (عدد الخانات المحددة) ← 10 خانات (بدون جذر) ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-950/30 via-slate-900/80 to-slate-900/90 border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <h3 className="text-sm sm:text-base font-black text-emerald-300">
                4. الوضع الرابع: S2 ÷ (عدد الخانات المحددة) ← 10 خانات (بدون جذر)
              </h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 rounded-full font-bold dir-ltr font-mono text-xs self-start sm:self-auto">
              {phase2.mode4.fractionString}
            </span>
          </div>

          <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-300">
              <span className="font-sans font-bold text-slate-400">الكسر الناتج (S2 ÷ {selectedCount}):</span>
              <span className="dir-ltr text-emerald-300 font-bold">{phase2.mode4.fractionString}</span>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="font-sans font-bold text-slate-400 block">
                القيمة العشرية (أول 10 خانات بعد الفاصلة):
              </span>
              {renderDottedDigits(phase2.mode4.intPart, phase2.mode4.first10AfterDot)}
              <div className="text-center text-[10px] text-emerald-300 font-sans pt-0.5">
                {phase2.mode4.first10AfterDot.split('').join(' + ')} ={' '}
                <strong className="text-emerald-200 text-xs font-mono font-bold">
                  {phase2.mode4.unsimplifiedSum}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <Card className="glass overflow-hidden border-emerald-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">مجموع الخانات العشر (غير مبسط):</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  {phase2.mode4.unsimplifiedSum}
                </span>
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden border-teal-500/30 bg-black/40">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">الاختزال لرقم واحد:</span>
                  <span className="text-[11px] text-teal-300 font-mono font-bold dir-ltr">
                    {phase2.mode4.reductionSteps.join(' ➔ ')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-500/20 border-2 border-teal-500/60 text-teal-300 font-black text-xl flex items-center justify-center">
                  {phase2.mode4.simplifiedSingleDigit}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* رابعاً: جدول خطوات الحل بالورق (مضغوط وقابل للطي)            */}
      {/* ============================================================ */}
      <Card className="glass border-white/10 shadow-xl overflow-hidden w-full">
        <CardHeader className="py-3 px-4 border-b border-white/10 bg-slate-900/60 flex flex-row items-center justify-between cursor-pointer"
          onClick={() => setShowStepsDetails(!showStepsDetails)}
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                جدول خطوات الحل بالتفصيل (الأوزان، التوزيع، النواتج بالورق)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تطابق تام بين خطوات الورقة اليدوية والقانون المختصر cycle(T)
              </p>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
          >
            {showStepsDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>

        {showStepsDetails && (
          <CardContent className="p-3 sm:p-4 space-y-4 animate-in fade-in duration-300">
            {/* Phase Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setActiveStepTab('phase2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStepTab === 'phase2'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                خطوات المرحلة 2 (T2 = {phase2.t2.toString()})
              </button>
              <button
                type="button"
                onClick={() => setActiveStepTab('phase1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStepTab === 'phase1'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                خطوات المرحلة 1 (T1 = {phase1.t1.toString()})
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 shadow-inner">
              <table className="w-full text-xs text-right border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-bold text-[11px]">
                    <th className="p-2.5 text-center">الخطوة</th>
                    <th className="p-2.5">عنوان الخطوة والصيغة</th>
                    <th className="p-2.5 text-center">اليمين (م)</th>
                    <th className="p-2.5 text-center">الوسط (د)</th>
                    <th className="p-2.5 text-center">اليسار (د)</th>
                    <th className="p-2.5 text-center">المجموع / الناتج</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {(activeStepTab === 'phase2' ? phase2.stepsTable : phase1.stepsTable).map(st => (
                    <tr key={st.step} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-2.5 text-center font-bold">
                        <span className="w-6 h-6 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-300 inline-flex items-center justify-center font-sans">
                          {st.step}
                        </span>
                      </td>
                      <td className="p-2.5 font-sans">
                        <span className="font-bold text-slate-200 block">{st.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono dir-ltr block">{st.formula}</span>
                      </td>
                      <td className="p-2.5 text-center text-purple-300 font-bold dir-ltr">{st.right}</td>
                      <td className="p-2.5 text-center text-cyan-300 font-bold dir-ltr">{st.mid}</td>
                      <td className="p-2.5 text-center text-emerald-300 font-bold dir-ltr">{st.left}</td>
                      <td className="p-2.5 text-center text-amber-300 font-bold dir-ltr font-sans">
                        {st.sum}
                        {st.notes && (
                          <span className="block text-[9px] text-slate-400 font-sans mt-0.5">{st.notes}</span>
                        )}
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
  );
}
