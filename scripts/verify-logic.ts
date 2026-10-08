import { calculateArabicDualPhase } from '../src/lib/calculate';

console.log('==================================================');
console.log('   RUNNING VERIFICATION FOR DUAL-PHASE ENGINE   ');
console.log('   (Matches Images 1, 2, 3, 4, 5 Exactly)       ');
console.log('==================================================');

try {
  // Test Word "مدد"
  const result = calculateArabicDualPhase('مدد');

  console.log(`Word: ${result.inputText}`);
  console.log(`Normalized: [${result.normalizedChars.join(', ')}]`);

  // --- PHASE 1 VERIFICATION (Images 1 & 2) ---
  console.log('\n--- PHASE 1: SILENT ENGINE ---');
  console.log(`Step 1 Sum: ${result.phase1.sum1.toString()} (Expected: 126/1)`);
  console.log(`Step 2 Sum: ${result.phase1.sum2.toString()} (Expected: 14/3)`);
  console.log(`Step 3 Fractions: [${result.phase1.step3Fractions.map(f => f.toString()).join(', ')}] (Expected: 9/1, 36/1, 81/1)`);
  console.log(`Step 5 Sum: ${result.phase1.sum5.toString()} (Expected: 1400/9)`);
  console.log(`Step 6 Fractions: [${result.phase1.step6Fractions.map(f => f.toString()).join(', ')}] (Expected: 9/14, 234/7, 1053/14)`);
  console.log(`Total Sum: ${result.phase1.totalSum.toString()} (Expected: 765/7)`);
  console.log(`Average (Sum / 3): ${result.phase1.average.toString()} (Expected: 255/7)`);
  console.log(`Square Root: ${result.phase1.sqrtResult.fullString.substring(0, 15)} (Expected ~ 6.0356086212...)`);
  console.log(`First 10 Decimals: ${result.phase1.sqrtResult.first10AfterDot} (Expected: 0356086212)`);
  console.log(`Seed (Unsimplified Sum): ${result.phase1.seed} (Expected: 33)`);

  if (result.phase1.seed !== 33) {
    throw new Error(`Phase 1 Seed mismatch: got ${result.phase1.seed}, expected 33`);
  }
  console.log('✅ Phase 1 Seed 100% verified (33)! Matches handwritten paper!');

  // --- PHASE 2 VERIFICATION (Using Seed 33) ---
  console.log('\n--- PHASE 2: VISIBLE ENGINE ---');
  console.log(`Initial Value per Slot: ${result.phase2.step1Val} (Expected: 33)`);
  console.log(`Step 1 Sum: ${result.phase2.sum1.toString()} (Expected: 33/1)`);
  console.log(`Step 2 Sum: ${result.phase2.sum2.toString()} (Expected: 14/3)`);
  
  const p2FinalFractions = result.phase2.slots.map(s => s.finalValueFrac.toString());
  console.log(`Step 6 Slots: [${p2FinalFractions.join(', ')}] (Expected: 33/196, 429/49, 3861/196)`);
  if (p2FinalFractions[0] !== '33/196' || p2FinalFractions[1] !== '429/49' || p2FinalFractions[2] !== '3861/196') {
    throw new Error(`Phase 2 Step 6 slots mismatch!`);
  }
  console.log('✅ Phase 2 Step 6 Slots verified: [33/196, 429/49, 3861/196]!');

  console.log(`Selected Sum: ${result.phase2.selectedSum.toString()} (Expected: 2805/98)`);
  console.log(`Selected Count: ${result.phase2.selectedCount} (Expected: 3)`);
  console.log(`Selected Average: ${result.phase2.selectedAverage.toString()} (Expected: 935/98)`);

  // --- 1. الجواب الأول: جمع -> جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 1. ANSWER 1 (Direct Sum + Sqrt) ---');
  console.log(`Square Root: ${result.phase2.directSumSqrtResult.fullString.substring(0, 15)} (Expected ~ 5.3499952317...)`);
  console.log(`First 10 Decimals: ${result.phase2.directSumSqrtResult.first10AfterDot} (Expected: 3499952317)`);
  console.log(`Answer 1 Unsimplified: ${result.phase2.directSumUnsimplifiedAnswer} (Expected: 52)`);
  console.log(`Answer 1 Simplified: ${result.phase2.directSumSimplifiedAnswer} (Expected: 7)`);
  if (result.phase2.directSumUnsimplifiedAnswer !== 52 || result.phase2.directSumSimplifiedAnswer !== 7) {
    throw new Error('Answer 1 mismatch!');
  }
  console.log('✅ Answer 1 100% verified (Unsimplified: 52, Simplified: 7)!');

  // --- 2. الجواب الثاني: متوسط (تقسيم على عدد الخانات) -> جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 2. ANSWER 2 (Average + Sqrt) ---');
  console.log(`Square Root: ${result.phase2.sqrtResult.fullString.substring(0, 15)} (Expected ~ 3.0888211872...)`);
  console.log(`First 10 Decimals: ${result.phase2.sqrtResult.first10AfterDot} (Expected: 0888211872)`);
  console.log(`Answer 2 Unsimplified: ${result.phase2.unsimplifiedAnswer} (Expected: 45)`);
  console.log(`Answer 2 Simplified: ${result.phase2.simplifiedAnswer} (Expected: 9)`);
  if (result.phase2.unsimplifiedAnswer !== 45 || result.phase2.simplifiedAnswer !== 9) {
    throw new Error('Answer 2 mismatch!');
  }
  console.log('✅ Answer 2 100% verified (Unsimplified: 45, Simplified: 9)!');

  // --- 3. الجواب الثالث: جمع -> بدون جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 3. ANSWER 3 (Direct Sum, No Sqrt) ---');
  console.log(`Decimal Form: ${result.phase2.directDecimalResult.fullString.substring(0, 15)} (Expected ~ 28.6224489795...)`);
  console.log(`First 10 Decimals: ${result.phase2.directDecimalResult.first10AfterDot} (Expected: 6224489795)`);
  console.log(`Answer 3 Unsimplified: ${result.phase2.directDecimalUnsimplifiedAnswer} (Expected: 56)`);
  console.log(`Answer 3 Simplified: ${result.phase2.directDecimalSimplifiedAnswer} (Expected: 2)`);
  if (result.phase2.directDecimalUnsimplifiedAnswer !== 56 || result.phase2.directDecimalSimplifiedAnswer !== 2) {
    throw new Error('Answer 3 mismatch!');
  }
  console.log('✅ Answer 3 100% verified (Unsimplified: 56, Simplified: 2)!');

  // --- 4. الجواب الرابع: متوسط (تقسيم على عدد الخانات) -> بدون جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 4. ANSWER 4 (Average, No Sqrt) ---');
  console.log(`Decimal Form: ${result.phase2.averageDecimalResult.fullString.substring(0, 15)} (Expected ~ 9.5408163265...)`);
  console.log(`First 10 Decimals: ${result.phase2.averageDecimalResult.first10AfterDot} (Expected: 5408163265)`);
  console.log(`Answer 4 Unsimplified: ${result.phase2.averageDecimalUnsimplifiedAnswer} (Expected: 40)`);
  console.log(`Answer 4 Simplified: ${result.phase2.averageDecimalSimplifiedAnswer} (Expected: 4)`);
  if (result.phase2.averageDecimalUnsimplifiedAnswer !== 40 || result.phase2.averageDecimalSimplifiedAnswer !== 4) {
    throw new Error('Answer 4 mismatch!');
  }
  console.log('✅ Answer 4 100% verified (Unsimplified: 40, Simplified: 4)!');

  console.log('\n==================================================');
  console.log('🎉 ALL DUAL-PHASE VERIFICATIONS PASSED PERFECTLY!');
  console.log('==================================================');
} catch (err) {
  console.error('❌ Verification failed:', err);
  process.exit(1);
}
