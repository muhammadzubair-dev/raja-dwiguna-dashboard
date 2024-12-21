function shortCurrency(number = 0, space = true) {
  const absNumber = Math.abs(number);
  const withSpace = space ? ' ' : '';
  if (absNumber >= 1e9) {
    return (number / 1e9).toFixed(0) + withSpace + 'm';
  } else if (absNumber >= 1e6) {
    return (number / 1e6).toFixed(0) + withSpace + 'jt';
  } else if (absNumber >= 1e3) {
    return (number / 1e3).toFixed(0) + withSpace + 'rb';
  } else {
    return number.toString();
  }
}

export default shortCurrency;
