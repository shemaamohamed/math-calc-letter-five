import {
  cycle,
  createFraction,
  fractionToString,
  executePhase1,
  executePhase2,
  calculateArabicDualPhase,
} from '../src/lib/calculate';

console.log('====================================================');
console.log('   RUNNING VERIFICATION FOR EXACT ARABIC MATH ENGINE');
console.log('====================================================');

let allPassed = true;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    allPassed = false;
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

// -----------------------------------------------------------------
// Test 1: دالة الدورة cycle(T) عند T = 126
// right 9/14 ، mid 234/7 ، left 1053/14
// -----------------------------------------------------------------
console.log('\n--- 1) اختبار دالة الدورة عند T = 126 ---');
const t126 = createFraction(126n, 1n);
const c126 = cycle(t126);

const r126Str = fractionToString(c126.right);
const m126Str = fractionToString(c126.mid);
const l126Str = fractionToString(c126.left);

console.log(`right: ${r126Str} (المتوقع: 9/14)`);
console.log(`mid:   ${m126Str} (المتوقع: 234/7)`);
console.log(`left:  ${l126Str} (المتوقع: 1053/14)`);

assert(r126Str === '9/14', 'cycle(126).right == 9/14');
assert(m126Str === '234/7', 'cycle(126).mid == 234/7');
assert(l126Str === '1053/14', 'cycle(126).left == 1053/14');

// -----------------------------------------------------------------
// Test 2: المرحلة 1 عند N = 260
// T1 = 780
// right 195/49 ، mid 10140/49 ، left 22815/49
// المجموع S1 = 33150/49 ؛ ÷3 = 11050/49
// √ = 15.0169971725 ؛ المجموع R1 = 47
// -----------------------------------------------------------------
console.log('\n--- 2) اختبار المرحلة 1 عند N = 260 (T1 = 780) ---');
const p1 = executePhase1(260n, ['م', 'د', 'د']);

assert(p1.t1 === 780n, 'T1 == 780');
assert(fractionToString(p1.cycle.right) === '195/49', 'cycle(780).right == 195/49');
assert(fractionToString(p1.cycle.mid) === '10140/49', 'cycle(780).mid == 10140/49');
assert(fractionToString(p1.cycle.left) === '22815/49', 'cycle(780).left == 22815/49');
assert(fractionToString(p1.sum1) === '33150/49', 'S1 == 33150/49');
assert(fractionToString(p1.average1) === '11050/49', 'S1 ÷ 3 == 11050/49');

console.log(`Full Sqrt: ${p1.sqrtResult.fullDecimalString}`);
assert(p1.sqrtResult.fullDecimalString === '15.0169971725', '√11050/49 == 15.0169971725');
assert(p1.sqrtResult.first10AfterDot === '0169971725', 'First 10 digits == 0169971725');
console.log(`R1 = ${p1.r1} (المتوقع: 47)`);
assert(p1.r1 === 47, 'R1 == 47 (بدون اختزال لرقم واحد)');

// -----------------------------------------------------------------
// Test 3: المرحلة 2 عند T2 = 47 (الأوضاع الأربعة)
// right 47/196 ، mid 611/49 ، left 5499/196
// S2 = 3995/98
// الوضع 1: 6.3847714228 ← 46 ← 1
// الوضع 2: 3.6862494997 ← 64 ← 1 (S2/3 = 3995/294)
// الوضع 3: 40.7653061224 ← 36 ← 9
// الوضع 4: 13.5884353741 ← 48 ← 3
// -----------------------------------------------------------------
console.log('\n--- 3) اختبار المرحلة 2 عند T2 = 47 (كل الخانات محددة) ---');
const p2 = executePhase2(47, ['م', 'د', 'د'], [0, 1, 2]);

assert(fractionToString(p2.cycle.right) === '47/196', 'cycle(47).right == 47/196');
assert(fractionToString(p2.cycle.mid) === '611/49', 'cycle(47).mid == 611/49');
assert(fractionToString(p2.cycle.left) === '5499/196', 'cycle(47).left == 5499/196');
assert(fractionToString(p2.selectedSum) === '3995/98', 'S2 == 3995/98');
assert(fractionToString(p2.selectedAverage) === '3995/294', 'S2 ÷ 3 == 3995/294');

// الوضع 1
console.log('\n- الوضع 1: S2 ← √ ← 10 خانات');
console.log(`  الكسر: ${p2.mode1.fractionString} ، العشري: ${p2.mode1.fullDecimalString} ، المجموع: ${p2.mode1.unsimplifiedSum} ، الاختزال: ${p2.mode1.simplifiedSingleDigit}`);
assert(p2.mode1.fractionString === '3995/98', 'الوضع 1: الكسر 3995/98');
assert(p2.mode1.fullDecimalString === '6.3847714228', 'الوضع 1: 6.3847714228');
assert(p2.mode1.unsimplifiedSum === 46, 'الوضع 1: مجموع الخانات 46');
assert(p2.mode1.simplifiedSingleDigit === 1, 'الوضع 1: الاختزال لرقم واحد 1');

// الوضع 2
console.log('\n- الوضع 2: S2 ÷ 3 ← √ ← 10 خانات');
console.log(`  الكسر: ${p2.mode2.fractionString} ، العشري: ${p2.mode2.fullDecimalString} ، المجموع: ${p2.mode2.unsimplifiedSum} ، الاختزال: ${p2.mode2.simplifiedSingleDigit}`);
assert(p2.mode2.fractionString === '3995/294', 'الوضع 2: الكسر 3995/294');
assert(p2.mode2.fullDecimalString === '3.6862494997', 'الوضع 2: 3.6862494997');
assert(p2.mode2.unsimplifiedSum === 64, 'الوضع 2: مجموع الخانات 64');
assert(p2.mode2.simplifiedSingleDigit === 1, 'الوضع 2: الاختزال لرقم واحد 1');

// الوضع 3
console.log('\n- الوضع 3: S2 ← 10 خانات (بدون جذر)');
console.log(`  الكسر: ${p2.mode3.fractionString} ، العشري: ${p2.mode3.fullDecimalString} ، المجموع: ${p2.mode3.unsimplifiedSum} ، الاختزال: ${p2.mode3.simplifiedSingleDigit}`);
assert(p2.mode3.fractionString === '3995/98', 'الوضع 3: الكسر 3995/98');
assert(p2.mode3.fullDecimalString === '40.7653061224', 'الوضع 3: 40.7653061224');
assert(p2.mode3.unsimplifiedSum === 36, 'الوضع 3: مجموع الخانات 36');
assert(p2.mode3.simplifiedSingleDigit === 9, 'الوضع 3: الاختزال لرقم واحد 9');

// الوضع 4
console.log('\n- الوضع 4: S2 ÷ 3 ← 10 خانات (بدون جذر)');
console.log(`  الكسر: ${p2.mode4.fractionString} ، العشري: ${p2.mode4.fullDecimalString} ، المجموع: ${p2.mode4.unsimplifiedSum} ، الاختزال: ${p2.mode4.simplifiedSingleDigit}`);
assert(p2.mode4.fractionString === '3995/294', 'الوضع 4: الكسر 3995/294');
assert(p2.mode4.fullDecimalString === '13.5884353741', 'الوضع 4: 13.5884353741');
assert(p2.mode4.unsimplifiedSum === 48, 'الوضع 4: مجموع الخانات 48');
assert(p2.mode4.simplifiedSingleDigit === 3, 'الوضع 4: الاختزال لرقم واحد 3');

// -----------------------------------------------------------------
// Test 4: اختبار تغيير التحديد التفاعلي (Interactive Checkboxes)
// إذا حددنا فقط خانتين (يمين ووسط):
// right = 47/196, mid = 611/49 -> S2 = 47/196 + 2444/196 = 2491/196
// -----------------------------------------------------------------
console.log('\n--- 4) اختبار تغيير التحديد (خانتين فقط: 0 و 1) ---');
const p2Partial = executePhase2(47, ['م', 'د', 'د'], [0, 1]);
assert(p2Partial.selectedCount === 2, 'عدد الخانات المحددة 2');
assert(fractionToString(p2Partial.selectedSum) === '2491/196', 'S2 للخانتين = 2491/196');
assert(fractionToString(p2Partial.selectedAverage) === '2491/392', 'S2 ÷ 2 = 2491/392');

// -----------------------------------------------------------------
// Test 5: الدالة الشاملة calculateArabicDualPhase
// -----------------------------------------------------------------
console.log('\n--- 5) اختبار الدالة المتكاملة calculateArabicDualPhase("مدد") ---');
const fullResult = calculateArabicDualPhase('مدد');
assert(fullResult.inputN === 260n, 'المدخل الافتراضي لكلمة مدد N == 260');
assert(fullResult.phase1.r1 === 47, 'R1 == 47');
assert(fullResult.phase2.mode1.fullDecimalString === '6.3847714228', 'Mode 1 matches');
assert(fullResult.phase2.mode2.fullDecimalString === '3.6862494997', 'Mode 2 matches');
assert(fullResult.phase2.mode3.fullDecimalString === '40.7653061224', 'Mode 3 matches');
assert(fullResult.phase2.mode4.fullDecimalString === '13.5884353741', 'Mode 4 matches');

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 ALL TEST CASES AND SPECIFICATIONS PASSED 100%!');
} else {
  console.error('❌ SOME TEST CASES FAILED');
  process.exit(1);
}
console.log('====================================================');
