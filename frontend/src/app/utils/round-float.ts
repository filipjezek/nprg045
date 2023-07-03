/**
 * the number input element rounds min and max - we will intentionally set
 * min and max a little wider to allow the user to select all the required values
 */
export function roundFloat(x: Number, dir: 'up' | 'down') {
  if (x === undefined || x === null) return 0;
  if (Number.isNaN(x) || !Number.isFinite(x)) return +x;
  const mantissaPrecision = Math.pow(10, 14);

  let [mantissa, exponent] = x
    .toExponential()
    .split('e')
    .map((n) => +n);
  mantissa =
    Math[dir == 'down' ? 'floor' : 'ceil'](mantissa * mantissaPrecision) /
    mantissaPrecision;
  return mantissa * Math.pow(10, exponent);
}
