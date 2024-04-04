function format(big: string, denomination: number, decimals: number) {
  let array = big.toString().split('');

  let negative = false;
  if (array[0] === '-') {
    array.shift();
    negative = true;
  }

  if (denomination !== 0) {
    // make sure we have enough characters
    while (array.length < denomination + 1) {
      array.unshift('0');
    }

    // add our dot
    array.splice(array.length - denomination, 0, '.');

    // make sure there are enough decimals after the dot
    while (array.length - array.indexOf('.') <= decimals) {
      array.push('0');
    }

    let nonZeroDigitIndex = 0;
    for (let i = array.length - 1; i > 0; i--) {
      if (array[i] !== '0') {
        nonZeroDigitIndex = i + 1;
        break;
      }
    }
    const decimalsIndex = array.indexOf('.') + decimals + 1;
    const sliceIndex = Math.max(decimalsIndex, nonZeroDigitIndex);
    array = array.slice(0, sliceIndex);
  }

  const allDecimalsZero = array
    .slice(array.indexOf('.') + 1)
    .every((digit) => digit.toString() === '0');

  const string = array.join('');

  let output;
  if (allDecimalsZero) {
    output = string.split('.')[0];
  } else {
    output = string;
  }

  if (negative) {
    output = '-' + output;
  }

  return output;
}

interface DenominateType {
  input: string;
  denomination: number;
  decimals: number;
  ticker: string;
}

export const denominate = ({
  input,
  denomination,
  decimals,
  ticker,
}: DenominateType) => {
  return `${format(input, denomination, decimals)} ${ticker}`;
};
