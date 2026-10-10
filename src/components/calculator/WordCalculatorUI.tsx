'use client';

import React from 'react';
import { useWordCalculator } from '@/hooks/useWordCalculator';
import ArabicInput from './ArabicInput';
import ResultView from './ResultView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calculator, Loader2 } from 'lucide-react';

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

  return (
    <div className="w-full space-y-6 dir-rtl font-cairo">
      {/* 1. INPUT PANEL */}
      <Card className="glass border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <CardTitle className="text-sm font-bold text-slate-200">
              لوحة الإدخال والتحليل الرقمي (خوارزمية الحساب الدقيق)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <ArabicInput value={text} onChange={setText} />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-xs font-semibold text-center">{error}</p>
            </div>
          )}

          <Button
            onClick={() => calculate()}
            disabled={!text.trim() || isCalculating}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            {isCalculating ? (
              <div className="flex items-center justify-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                <span className="font-semibold text-purple-100">جاري الحساب الرقمي الدقيق...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>بدء الحساب الرقمي الدقيق</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* CALCULATION RESULTS */}
      {result && (
        <ResultView
          result={result}
          onToggleTransfer={toggleSlot}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onInvertSelection={invertSelection}
        />
      )}
    </div>
  );
}
