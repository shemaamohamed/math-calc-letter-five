/**
 * Arabic character normalization rules based on User Reference (Image 5)
 * قواعد توحيد الحروف العربية المعتمدة
 * 
 * 1. أ إ آ ٱ ء ئ ؤ ى = ألف
 * 2. ت ة ـة = تاء
 * 3. ه ـه = هاء
 */

// Normalization map for Arabic character groups
export const NORMALIZATION_MAP: Record<string, string> = {
  // مجموعة الألف (ألف بكل أشكالها تصبح حرفاً واحداً 'أ')
  'ا': 'أ',
  'أ': 'أ',
  'إ': 'أ',
  'آ': 'أ',
  'ٱ': 'أ',
  'ء': 'أ',
  'ئ': 'أ',
  'ؤ': 'أ',
  'ى': 'أ',
  'ٴ': 'أ',

  // مجموعة التاء (التاء المربوطة والمفتوحة)
  'ت': 'ت',
  'ة': 'ت',

  // مجموعة الهاء
  'ه': 'ه',
  'ە': 'ه',
  'ھ': 'ه',
  'ۥ': 'ه',
};

// Arabic character range regex
export const ARABIC_REGEX = /^[\u0600-\u06FF\s]*$/;

/**
 * Remove Arabic diacritics (tashkeel) and tatweel
 */
export function removeDiacritics(text: string): string {
  // Remove Tashkeel (U+064B to U+0652) and Tatweel (U+0640)
  return text.replace(/[\u064B-\u0652\u0640]/g, '');
}

/**
 * Normalize a single Arabic character according to the rules
 */
export function normalizeChar(ch: string): string {
  return NORMALIZATION_MAP[ch] || ch;
}

/**
 * Normalize Arabic text according to the rules
 * @param text - Input Arabic text
 * @returns Cleaned and normalized array of characters
 */
export function normalizeArabicText(text: string): {
  rawChars: string[];
  normalizedChars: string[];
} {
  const cleaned = removeDiacritics(text).replace(/\s+/g, '');
  const rawChars = cleaned.split('').filter(c => c.trim() !== '');
  const normalizedChars = rawChars.map(normalizeChar);
  return { rawChars, normalizedChars };
}

/**
 * Validate that input contains only Arabic characters and spaces
 */
export function validateArabicInput(text: string): boolean {
  return ARABIC_REGEX.test(text);
}
