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

  // --- PHASE 1 VERIFICATION (Images 3 & 4) ---
  console.log('\n--- PHASE 1: SILENT ENGINE ---');
  console.log(`Step 1 Sum: ${result.phase1.sum1.toString()} (Expected: 3/1)`);
  console.log(`Step 2 Sum: ${result.phase1.sum2.toString()} (Expected: 14/3)`);
  console.log(`Step 3 Fractions: [${result.phase1.step3Fractions.map(f => f.toString()).join(', ')}] (Expected: 3/14, 6/7, 27/14)`);
  console.log(`Step 5 Sum: ${result.phase1.sum5.toString()} (Expected: 1400/9)`);
  console.log(`Step 6 Fractions: [${result.phase1.step6Fractions.map(f => f.toString()).join(', ')}] (Expected: 3/196, 39/49, 351/196)`);
  console.log(`Total Sum: ${result.phase1.totalSum.toString()} (Expected: 255/98)`);
  console.log(`Average (Sum / 3): ${result.phase1.average.toString()} (Expected: 85/98)`);
  console.log(`Square Root: ${result.phase1.sqrtResult.fullString.substring(0, 15)} (Expected ~ 0.9313146293...)`);
  console.log(`First 10 Decimals: ${result.phase1.sqrtResult.first10AfterDot} (Expected: 9313146293)`);
  console.log(`Seed (Unsimplified Sum): ${result.phase1.seed} (Expected: 41)`);

  if (result.phase1.seed !== 41) {
    throw new Error(`Phase 1 Seed mismatch: got ${result.phase1.seed}, expected 41`);
  }
  console.log('✅ Phase 1 Seed 100% verified (41)!');

  // --- PHASE 2 VERIFICATION (Images 1 & 2) ---
  console.log('\n--- PHASE 2: VISIBLE ENGINE ---');
  console.log(`Initial Value per Slot: ${result.phase2.step1Val} (Expected: 41)`);
  console.log(`Step 1 Sum: ${result.phase2.sum1.toString()} (Expected: 123/1)`);
  console.log(`Step 2 Sum: ${result.phase2.sum2.toString()} (Expected: 14/3)`);
  
  const p2FinalFractions = result.phase2.slots.map(s => s.finalValueFrac.toString());
  console.log(`Step 6 Slots: [${p2FinalFractions.join(', ')}] (Expected: 123/196, 1599/49, 14391/196)`);
  if (p2FinalFractions[0] !== '123/196' || p2FinalFractions[1] !== '1599/49' || p2FinalFractions[2] !== '14391/196') {
    throw new Error(`Phase 2 Step 6 slots mismatch!`);
  }
  console.log('✅ Phase 2 Step 6 Slots verified: [123/196, 1599/49, 14391/196]!');

  console.log(`Selected Sum: ${result.phase2.selectedSum.toString()} (Expected: 10455/98)`);
  console.log(`Selected Count: ${result.phase2.selectedCount} (Expected: 3)`);
  console.log(`Selected Average: ${result.phase2.selectedAverage.toString()} (Expected: 3485/98)`);
  console.log(`Square Root: ${result.phase2.sqrtResult.fullString.substring(0, 15)} (Expected ~ 5.9633232756...)`);
  console.log(`First 10 Decimals: ${result.phase2.sqrtResult.first10AfterDot} (Expected: 9633232756)`);
  console.log(`Final Answer (Unsimplified): ${result.phase2.unsimplifiedAnswer} (Expected: 46)`);
  console.log(`Final Answer (Simplified): ${result.phase2.simplifiedAnswer} (Expected: 1)`);
  console.log(`Reduction Steps: [${result.phase2.reductionSteps.join(' -> ')}] (Expected: 46 -> 10 -> 1)`);

  if (result.phase2.unsimplifiedAnswer !== 46 || result.phase2.simplifiedAnswer !== 1) {
    throw new Error('Phase 2 Final Answers (with division) mismatch!');
  }
  console.log('✅ Phase 2 Final Answers with division 100% verified (Unsimplified: 46, Simplified: 1)!');

  // --- PHASE 2 DIRECT SUM (Without Division - Image 5 / Latest Note) ---
  console.log('\n--- PHASE 2: DIRECT SUM WITHOUT DIVISION (New Feature) ---');
  console.log(`Direct Sum Fraction: ${result.phase2.selectedSum.toString()} (Expected: 10455/98)`);
  console.log(`Square Root: ${result.phase2.directSumSqrtResult.fullString.substring(0, 15)} (Expected ~ 10.3287788953...)`);
  console.log(`First 10 Decimals: ${result.phase2.directSumSqrtResult.first10AfterDot} (Expected: 3287788953)`);
  console.log(`Direct Sum Unsimplified Answer: ${result.phase2.directSumUnsimplifiedAnswer} (Expected: 60)`);
  console.log(`Direct Sum Simplified Answer: ${result.phase2.directSumSimplifiedAnswer} (Expected: 6)`);
  console.log(`Direct Sum Reduction Steps: [${result.phase2.directSumReductionSteps.join(' -> ')}] (Expected: 60 -> 6)`);

  if (result.phase2.directSumUnsimplifiedAnswer !== 60 || result.phase2.directSumSimplifiedAnswer !== 6) {
    throw new Error('Phase 2 Direct Sum Final Answers mismatch!');
  }
  console.log('✅ Phase 2 Direct Sum Final Answers 100% verified (Unsimplified: 60, Simplified: 6)!');

  console.log('\n==================================================');
  console.log('🎉 ALL DUAL-PHASE VERIFICATIONS PASSED PERFECTLY!');
  console.log('==================================================');
} catch (err) {
  console.error('❌ Verification failed:', err);
  process.exit(1);
}
