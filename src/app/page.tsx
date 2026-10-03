'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ArabicInput from '@/components/calculator/ArabicInput';
import ResultView from '@/components/calculator/ResultView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWordCalculator } from '@/hooks/useWordCalculator';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, Calculator } from 'lucide-react';

function HomePage() {
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
  } = useWordCalculator('مدد');
  const router = useRouter();

  // Run calculation for "مدد" on initial load to match the preview photos immediately
  useEffect(() => {
    calculate('مدد');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-slate-950 text-slate-50 relative font-cairo selection:bg-purple-500/30 overflow-x-clip">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-600/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/15 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-7xl relative z-10 w-full min-w-0">
        {/* Compact Navigation Bar */}
        <header className="flex justify-between items-center mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-3 duration-500 w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-md shadow-purple-500/20 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-slate-400 bg-clip-text text-transparent uppercase tracking-tight truncate">
                القوة العربية
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wider truncate">
                نظام الحساب الرياضي الدقيق (Arbitrary-Precision)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-all rounded-lg px-3 py-1.5 text-xs h-auto flex-shrink-0"
          >
            تسجيل الخروج
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
          </Button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 w-full min-w-0">
          {/* Left Column: Input */}
          <section className="lg:col-span-4 min-w-0 w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="glass border-white/10 shadow-xl overflow-hidden w-full min-w-0">
              <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-purple-400" />
                  <CardTitle className="text-sm font-bold text-slate-200">لوحة الإدخال والتحليل</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-4 w-full min-w-0">
                <ArabicInput
                  value={text}
                  onChange={val => setText(val)}
                />

                {error && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake-x duration-300">
                    <p className="text-red-400 text-xs font-medium text-center">{error}</p>
                  </div>
                )}

                <Button
                  onClick={() => calculate()}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 group cursor-pointer"
                  disabled={!text.trim() || isCalculating}
                >
                  {isCalculating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري الحساب...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>بدء الحساب الرقمي</span>
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2.5 text-center w-full min-w-0">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 min-w-0">
                <div className="text-lg font-black text-purple-300">١٠٠٪</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase truncate">دقة كسرية دقيقة</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 min-w-0">
                <div className="text-lg font-black text-emerald-400">لحظي</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase truncate">تنقل سريع بدون تمرير</div>
              </div>
            </div>
          </section>

          {/* Right Column: Results */}
          <section className="lg:col-span-8 min-w-0 w-full animate-in fade-in slide-in-from-left-4 duration-500">
            {result ? (
              <ResultView
                result={result}
                onToggleTransfer={toggleSlot}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onInvertSelection={invertSelection}
              />
            ) : (
              <div className="h-full min-h-[320px] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-4 group p-6 bg-slate-900/20 w-full min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 border border-white/5">
                  <Calculator className="w-7 h-7 text-purple-400/50" />
                </div>
                <div className="text-center space-y-1 max-w-xs">
                  <p className="text-slate-300 text-sm font-bold">بانتظار إدخال النص</p>
                  <p className="text-slate-500 text-xs">
                    اكتب أو الصق أي نص عربي في لوحة الإدخال لرؤية جدول التحليل المدمج وشريط التنقل السريع.
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-8 pt-4 border-t border-white/5 text-center text-slate-600 text-xs w-full min-w-0">
          <p>© {new Date().getFullYear()} مشروع القوة العربية • تم التصميم لتجربة فائقة السرعة والمدمجة</p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
