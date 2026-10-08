'use client';

import { useState, useCallback, useMemo } from 'react';
import { calculateArabicDualPhase } from '@/lib/calculate';
import { CalculationState } from '@/types/math';

export interface UseWordCalculatorReturn {
  text: string;
  setText: (val: string) => void;
  result: CalculationState | null;
  error: string;
  isCalculating: boolean;
  selectedIndices: number[];
  calculate: (customText?: string, customIndices?: number[]) => void;
  toggleSlot: (index: number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  invertSelection: () => void;
  reset: () => void;
}

/**
 * Custom React Hook for Dual-Phase Word Calculator
 * يدير تنفيذ القسم الأول المخفي بالخلفية وحساب القسم الثاني والتفاعل مع أزرار الانتقال
 */
export function useWordCalculator(initialText = ''): UseWordCalculatorReturn {
  const [text, setTextState] = useState(initialText);
  const [result, setResult] = useState<CalculationState | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const setText = useCallback((newText: string) => {
    setTextState(newText);
    setError('');
    // Reset selected indices when text changes
    setSelectedIndices([]);
  }, []);

  const calculate = useCallback(
    (customText?: string, customIndices?: number[]) => {
      const targetText = customText !== undefined ? customText : text;
      setError('');

      if (!targetText.trim()) {
        setError('الرجاء إدخال نص عربي');
        return;
      }

      setIsCalculating(true);

      setTimeout(() => {
        try {
          const activeIndices = customIndices !== undefined ? customIndices : (selectedIndices.length > 0 ? selectedIndices : undefined);
          const calcResult = calculateArabicDualPhase(targetText, activeIndices);
          setResult(calcResult);
          setSelectedIndices(calcResult.selectedIndices);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'حدث خطأ في عملية الحساب');
        } finally {
          setIsCalculating(false);
        }
      }, 200);
    },
    [text, selectedIndices]
  );

  const toggleSlot = useCallback(
    (index: number) => {
      if (!result) return;
      const current = result.selectedIndices;
      const next = current.includes(index)
        ? current.filter(i => i !== index)
        : [...current, index];

      setSelectedIndices(next);
      try {
        const updated = calculateArabicDualPhase(text, next);
        setResult(updated);
      } catch (err) {
        console.error('Error toggling slot:', err);
      }
    },
    [result, text]
  );

  const selectAll = useCallback(() => {
    if (!result) return;
    const all = result.phase2.slots.map((_, i) => i);
    setSelectedIndices(all);
    try {
      const updated = calculateArabicDualPhase(text, all);
      setResult(updated);
    } catch (err) {
      console.error('Error selecting all:', err);
    }
  }, [result, text]);

  const deselectAll = useCallback(() => {
    if (!result) return;
    const empty: number[] = [];
    setSelectedIndices(empty);
    try {
      const updated = calculateArabicDualPhase(text, empty);
      setResult(updated);
    } catch (err) {
      console.error('Error deselecting all:', err);
    }
  }, [result, text]);

  const invertSelection = useCallback(() => {
    if (!result) return;
    const current = result.selectedIndices;
    const inverted = result.phase2.slots
      .map((_, i) => i)
      .filter(i => !current.includes(i));
    setSelectedIndices(inverted);
    try {
      const updated = calculateArabicDualPhase(text, inverted);
      setResult(updated);
    } catch (err) {
      console.error('Error inverting selection:', err);
    }
  }, [result, text]);

  const reset = useCallback(() => {
    setTextState('');
    setResult(null);
    setSelectedIndices([]);
    setError('');
    setIsCalculating(false);
  }, []);

  return {
    text,
    setText,
    result,
    error,
    isCalculating,
    selectedIndices,
    calculate,
    toggleSlot,
    selectAll,
    deselectAll,
    invertSelection,
    reset,
  };
}
