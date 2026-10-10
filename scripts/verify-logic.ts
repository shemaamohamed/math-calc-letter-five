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

  // --- PHASE 1 VERIFICATION (Images 1, 2, 3) ---
  console.log('\n--- PHASE 1: SILENT ENGINE (Base 260) ---');
  console.log(`Step 1 Sum: ${result.phase1.sum1.toString()} (Expected: 780/1)`);
  console.log(`Step 2 Sum: ${result.phase1.sum2.toString()} (Expected: 14/3)`);
  console.log(`Step 3 Fractions: [${result.phase1.step3Fractions.map(f => f.toString()).join(', ')}] (Expected: 390/7, 1560/7, 3510/7)`);
  console.log(`Step 5 Sum: ${result.phase1.sum5.toString()} (Expected: 1400/9)`);
  console.log(`Step 6 Fractions: [${result.phase1.step6Fractions.map(f => f.toString()).join(', ')}] (Expected: 195/49, 10140/49, 22815/49)`);
  console.log(`Total Sum: ${result.phase1.totalSum.toString()} (Expected: 33150/49)`);
  console.log(`Average (Sum / 3): ${result.phase1.average.toString()} (Expected: 11050/49)`);
  console.log(`Square Root: ${result.phase1.sqrtResult.fullString.substring(0, 15)} (Expected ~ 15.0169971725...)`);
  console.log(`First 10 Decimals: ${result.phase1.sqrtResult.first10AfterDot} (Expected: 0169971725)`);
  console.log(`Seed (Unsimplified Sum): ${result.phase1.seed} (Expected: 47)`);

  if (result.phase1.seed !== 47) {
    throw new Error(`Phase 1 Seed mismatch: got ${result.phase1.seed}, expected 47`);
  }
  console.log('✅ Phase 1 Seed 100% verified (47)! Matches handwritten paper!');

  // --- PHASE 2 VERIFICATION (Using Seed 47) ---
  console.log('\n--- PHASE 2: VISIBLE ENGINE (Seed 47) ---');
  console.log(`Initial Value per Slot: ${result.phase2.step1Val} (Expected: 47)`);
  console.log(`Step 1 Sum: ${result.phase2.sum1.toString()} (Expected: 47/1)`);
  console.log(`Step 2 Sum: ${result.phase2.sum2.toString()} (Expected: 14/3)`);
  
  const p2FinalFractions = result.phase2.slots.map(s => s.finalValueFrac.toString());
  console.log(`Step 6 Slots: [${p2FinalFractions.join(', ')}] (Expected: 47/196, 611/49, 5499/196)`);
  if (p2FinalFractions[0] !== '47/196' || p2FinalFractions[1] !== '611/49' || p2FinalFractions[2] !== '5499/196') {
    throw new Error(`Phase 2 Step 6 slots mismatch!`);
  }
  console.log('✅ Phase 2 Step 6 Slots verified: [47/196, 611/49, 5499/196]!');

  console.log(`Selected Sum: ${result.phase2.selectedSum.toString()} (Expected: 3995/98)`);
  console.log(`Selected Count: ${result.phase2.selectedCount} (Expected: 3)`);
  console.log(`Selected Average: ${result.phase2.selectedAverage.toString()} (Expected: 3995/294)`);

  // --- 1. الجواب الأول: جمع -> جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 1. ANSWER 1 (Direct Sum + Sqrt) ---');
  console.log(`Square Root: ${result.phase2.directSumSqrtResult.fullString.substring(0, 15)} (Expected ~ 6.3847714228...)`);
  console.log(`First 10 Decimals: ${result.phase2.directSumSqrtResult.first10AfterDot} (Expected: 3847714228)`);
  console.log(`Answer 1 Unsimplified: ${result.phase2.directSumUnsimplifiedAnswer} (Expected: 46)`);
  console.log(`Answer 1 Simplified: ${result.phase2.directSumSimplifiedAnswer} (Expected: 1)`);
  if (result.phase2.directSumUnsimplifiedAnswer !== 46 || result.phase2.directSumSimplifiedAnswer !== 1) {
    throw new Error('Answer 1 mismatch!');
  }
  console.log('✅ Answer 1 100% verified (Unsimplified: 46, Simplified: 1)!');

  // --- 2. الجواب الثاني: متوسط (تقسيم على عدد الخانات) -> جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 2. ANSWER 2 (Average + Sqrt) ---');
  console.log(`Square Root: ${result.phase2.sqrtResult.fullString.substring(0, 15)} (Expected ~ 3.6862494997...)`);
  console.log(`First 10 Decimals: ${result.phase2.sqrtResult.first10AfterDot} (Expected: 6862494997)`);
  console.log(`Answer 2 Unsimplified: ${result.phase2.unsimplifiedAnswer} (Expected: 64)`);
  console.log(`Answer 2 Simplified: ${result.phase2.simplifiedAnswer} (Expected: 1)`);
  if (result.phase2.unsimplifiedAnswer !== 64 || result.phase2.simplifiedAnswer !== 1) {
    throw new Error('Answer 2 mismatch!');
  }
  console.log('✅ Answer 2 100% verified (Unsimplified: 64, Simplified: 1)!');

  // --- 3. الجواب الثالث: جمع -> بدون جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 3. ANSWER 3 (Direct Sum, No Sqrt) ---');
  console.log(`Decimal Form: ${result.phase2.directDecimalResult.fullString.substring(0, 15)} (Expected ~ 40.7653061224...)`);
  console.log(`First 10 Decimals: ${result.phase2.directDecimalResult.first10AfterDot} (Expected: 7653061224)`);
  console.log(`Answer 3 Unsimplified: ${result.phase2.directDecimalUnsimplifiedAnswer} (Expected: 36)`);
  console.log(`Answer 3 Simplified: ${result.phase2.directDecimalSimplifiedAnswer} (Expected: 9)`);
  if (result.phase2.directDecimalUnsimplifiedAnswer !== 36 || result.phase2.directDecimalSimplifiedAnswer !== 9) {
    throw new Error('Answer 3 mismatch!');
  }
  console.log('✅ Answer 3 100% verified (Unsimplified: 36, Simplified: 9)!');

  // --- 4. الجواب الرابع: متوسط (تقسيم على عدد الخانات) -> بدون جذر -> أول 10 بعد الفاصلة ---
  console.log('\n--- 4. ANSWER 4 (Average, No Sqrt) ---');
  console.log(`Decimal Form: ${result.phase2.averageDecimalResult.fullString.substring(0, 15)} (Expected ~ 13.5884353741...)`);
  console.log(`First 10 Decimals: ${result.phase2.averageDecimalResult.first10AfterDot} (Expected: 5884353741)`);
  console.log(`Answer 4 Unsimplified: ${result.phase2.averageDecimalUnsimplifiedAnswer} (Expected: 48)`);
  console.log(`Answer 4 Simplified: ${result.phase2.averageDecimalSimplifiedAnswer} (Expected: 3)`);
  if (result.phase2.averageDecimalUnsimplifiedAnswer !== 48 || result.phase2.averageDecimalSimplifiedAnswer !== 3) {
    throw new Error('Answer 4 mismatch!');
  }
  console.log('✅ Answer 4 100% verified (Unsimplified: 48, Simplified: 3)!');

  console.log('\n==================================================');
  console.log('🎉 ALL DUAL-PHASE VERIFICATIONS PASSED PERFECTLY!');
  console.log('==================================================');
} catch (err) {
  console.error('❌ Verification failed:', err);
  process.exit(1);
}
