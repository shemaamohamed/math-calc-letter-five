'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { validateArabicInput } from '@/lib/rules';
import { AlertCircle, Keyboard } from 'lucide-react';

interface ArabicInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ArabicInput({ value, onChange }: ArabicInputProps) {
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Validate on every change
    if (newValue && !validateArabicInput(newValue)) {
      setError('يرجى إدخال أحرف عربية حصراً لنظام الحساب الرقمي');
      return;
    }

    setError('');
    onChange(newValue);
  };

  return (
    <div className="space-y-3 font-cairo">
      <div className="flex justify-between items-center px-1">
        <label
          htmlFor="arabic-text"
          className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
        >
          <Keyboard className="w-3.5 h-3.5 text-purple-400" />
          النص العربي المستهدف
        </label>
        <span className="text-[10px] font-bold text-purple-400/70 border border-purple-500/20 px-2 py-0.5 rounded-full bg-purple-500/5">
          إدخال عربي
        </span>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
        <Textarea
          id="arabic-text"
          value={value}
          onChange={handleChange}
          placeholder="اكتب أو الصق النص العربي هنا..."
          className="relative min-h-[110px] text-lg sm:text-xl font-bold bg-white/[0.02] border-white/10 focus:border-purple-500/50 text-white placeholder:text-slate-600 rounded-xl p-3.5 transition-all duration-200 focus:bg-white/[0.04] resize-none leading-relaxed"
          dir="rtl"
          spellCheck={false}
        />
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
