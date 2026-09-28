/**
 * Reduce a number to a single digit by summing its digits recursively
 * @param num - Number to reduce
 * @returns Single digit result
 */
export function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
}

/**
 * Reduce a decimal string to a single digit by summing its digits recursively
 * @param decimalStr - Decimal string to reduce (e.g. "66666667")
 * @returns Single digit result
 */
export function reduceDecimalString(decimalStr: string): number {
  if (!decimalStr || decimalStr === '0') return 0;

  const num = decimalStr.split('').reduce((sum, digit) => {
    const d = parseInt(digit, 10);
    return isNaN(d) ? sum : sum + d;
  }, 0);

  return reduceToSingleDigit(num);
}
