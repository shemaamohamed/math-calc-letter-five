'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { validateArabicInput } from '@/lib/rules';
import { AlertCircle, Keyboard, Sparkles } from 'lucide-react';

interface ArabicInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ArabicInput({ value, onChange }: ArabicInputProps) {
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (newValue && !validateArabicInput(newValue)) {
      setError('يرجى إدخال أرقام أو حروف عربية صالحة');
      return;
    }

    setError('');
    onChange(newValue);
  };

  const handleSetExample = (val: string) => {
    setError('');
    onChange(val);
  };

  return (
    <div className="space-y-3 font-cairo dir-rtl">
      <div className="flex justify-between items-center px-1">
        <label
          htmlFor="arabic-text"
          className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
        >
          <Keyboard className="w-3.5 h-3.5 text-purple-400" />
          المدخل N أو الكلمة المستهدفة
        </label>
        <span className="text-[10px] font-bold text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full bg-purple-950/60 font-mono">
          N = 260 ➔ T1 = 780
        </span>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
        <Textarea
          id="arabic-text"
          value={value}
          onChange={handleChange}
          placeholder="أدخل قيمة N (مثلاً: 260) أو كلمة (مثل: مدد)..."
          className="relative min-h-[95px] text-lg sm:text-xl font-bold bg-white/[0.02] border-white/10 focus:border-purple-500/50 text-white placeholder:text-slate-600 rounded-xl p-3.5 transition-all duration-200 focus:bg-white/[0.04] resize-none leading-relaxed"
          dir="rtl"
          spellCheck={false}
        />
      </div>

      {/* Quick Example Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-[11px] text-slate-400 font-medium">أمثلة سريعة:</span>
        <button
          type="button"
          onClick={() => handleSetExample('260')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 border border-purple-500/30 font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>N = 260</span>
        </button>
        <button
          type="button"
          onClick={() => handleSetExample('مدد')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/30 font-bold transition-all cursor-pointer"
        >
          <span>كلمة &quot;مدد&quot; (260)</span>
        </button>
        <button
          type="button"
          onClick={() => handleSetExample('42')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-mono transition-all cursor-pointer"
        >
          <span>N = 42</span>
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-xs font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
