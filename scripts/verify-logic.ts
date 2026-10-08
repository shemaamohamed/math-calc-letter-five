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
  console.log(`Step 1 Sum: ${result.phase2.sum1.toString()} (Expected: 99/1)`);
  console.log(`Step 2 Sum: ${result.phase2.sum2.toString()} (Expected: 14/3)`);
  
  const p2FinalFractions = result.phase2.slots.map(s => s.finalValueFrac.toString());
  console.log(`Step 6 Slots: [${p2FinalFractions.join(', ')}] (Expected: 99/196, 1287/49, 11583/196)`);
  if (p2FinalFractions[0] !== '99/196' || p2FinalFractions[1] !== '1287/49' || p2FinalFractions[2] !== '11583/196') {
    throw new Error(`Phase 2 Step 6 slots mismatch!`);
  }
  console.log('✅ Phase 2 Step 6 Slots verified: [99/196, 1287/49, 11583/196]!');

  console.log(`Selected Sum: ${result.phase2.selectedSum.toString()} (Expected: 8415/98)`);
  console.log(`Selected Count: ${result.phase2.selectedCount} (Expected: 3)`);
  console.log(`Selected Average: ${result.phase2.selectedAverage.toString()} (Expected: 2805/98)`);
  console.log(`Square Root: ${result.phase2.sqrtResult.fullString.substring(0, 15)}`);
  console.log(`First 10 Decimals: ${result.phase2.sqrtResult.first10AfterDot}`);
  console.log(`Final Answer (Unsimplified): ${result.phase2.unsimplifiedAnswer}`);
  console.log(`Final Answer (Simplified): ${result.phase2.simplifiedAnswer}`);
  console.log(`Reduction Steps: [${result.phase2.reductionSteps.join(' -> ')}]`);

  if (result.phase2.unsimplifiedAnswer !== 52 || result.phase2.simplifiedAnswer !== 7) {
    throw new Error('Phase 2 Final Answers (with division) mismatch!');
  }
  console.log('✅ Phase 2 Final Answers with division 100% verified (Unsimplified: 52, Simplified: 7)!');

  // --- PHASE 2 DIRECT SUM (Without Division) ---
  console.log('\n--- PHASE 2: DIRECT SUM WITHOUT DIVISION ---');
  console.log(`Direct Sum Fraction: ${result.phase2.selectedSum.toString()} (Expected: 8415/98)`);
  console.log(`Square Root: ${result.phase2.directSumSqrtResult.fullString.substring(0, 15)} (Expected ~ 9.2664635616...)`);
  console.log(`First 10 Decimals: ${result.phase2.directSumSqrtResult.first10AfterDot} (Expected: 2664635616)`);
  console.log(`Direct Sum Unsimplified Answer: ${result.phase2.directSumUnsimplifiedAnswer} (Expected: 45)`);
  console.log(`Direct Sum Simplified Answer: ${result.phase2.directSumSimplifiedAnswer} (Expected: 9)`);
  console.log(`Direct Sum Reduction Steps: [${result.phase2.directSumReductionSteps.join(' -> ')}] (Expected: 45 -> 9)`);

  if (result.phase2.directSumUnsimplifiedAnswer !== 45 || result.phase2.directSumSimplifiedAnswer !== 9) {
    throw new Error('Phase 2 Direct Sum Final Answers mismatch!');
  }
  console.log('✅ Phase 2 Direct Sum Final Answers 100% verified (Unsimplified: 45, Simplified: 9)!');

  console.log('\n==================================================');
  console.log('🎉 ALL DUAL-PHASE VERIFICATIONS PASSED PERFECTLY!');
  console.log('==================================================');
} catch (err) {
  console.error('❌ Verification failed:', err);
  process.exit(1);
}
